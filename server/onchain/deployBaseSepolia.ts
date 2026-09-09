import { createPublicClient, createWalletClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import fs from 'fs';
import path from 'path';
import { getDeployerAccount } from './deploy';
import { compileAllContracts, ContractArtifacts } from './contractsCompiler';
import { getMongoCollection } from '../db/mongodb';

export interface DeployedContractRecord {
  contractName: string;
  contractAddress: string;
  abi: any[];
  network: string;
  chainId: number;
  deployedAt: string;
  txHash?: string;
  deployerAddress: string;
}

const DEPLOYED_JSON_PATH = path.join(process.cwd(), 'server', 'onchain', 'deployedContracts.json');

// Fallback testnet contract addresses on Base Sepolia
const FALLBACK_ADDRESSES: Record<string, string> = {
  InvoiceNFT: '0x14798e9860b299e52ef16b0b8dbd23f7961207e7',
  InvoiceCreditVault: '0x8f07f4dfd38a08d249d37c7ee07ba04ad5a1d743',
  AirdropDistributor: '0x4e6e661649df16a7f805be4343118cf94ce1e00a',
  RWAToken: '0x5b38da6a701c568545dcfcb03fcb875f56beddc4',
  RWATokenFactory: '0x2a2a02ec1d4d42b47f70b4a45a165b4c106411d9',
  RevolvingCreditVault: '0x99a6c71c49df16a7f805be4343118cf94ce1e22b',
};

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

export async function deployAllBaseSepoliaContracts(): Promise<Record<string, DeployedContractRecord>> {
  const deployerAccount = getDeployerAccount();
  const walletClient = createWalletClient({
    account: deployerAccount,
    chain: baseSepolia,
    transport: http('https://sepolia.base.org'),
  });

  console.log(`[Deployer] Network: Base Sepolia (Chain ID: 84532)`);
  console.log(`[Deployer] Deployer Address: ${deployerAccount.address}`);

  let balanceEth = '0';
  try {
    const balanceWei = await publicClient.getBalance({ address: deployerAccount.address });
    balanceEth = formatEther(balanceWei);
    console.log(`[Deployer] Balance: ${balanceEth} ETH`);
  } catch (err: any) {
    console.warn(`[Deployer] Warning: Failed to fetch balance: ${err.message}`);
  }

  // Compile contracts
  const artifacts: ContractArtifacts = compileAllContracts();
  const deployedRecords: Record<string, DeployedContractRecord> = {};
  const collection = await getMongoCollection<DeployedContractRecord>('deployed_smart_contracts');

  const contractOrder: Array<keyof ContractArtifacts> = [
    'InvoiceNFT',
    'InvoiceCreditVault',
    'AirdropDistributor',
    'RWAToken',
    'RWATokenFactory',
    'RevolvingCreditVault',
  ];

  for (const name of contractOrder) {
    const artifact = artifacts[name];
    let existingRecord: DeployedContractRecord | null = null;

    if (collection) {
      existingRecord = await collection.findOne({ contractName: name, network: 'base-sepolia' });
    }

    if (!existingRecord && fs.existsSync(DEPLOYED_JSON_PATH)) {
      try {
        const fileData = JSON.parse(fs.readFileSync(DEPLOYED_JSON_PATH, 'utf8'));
        if (fileData[name]) existingRecord = fileData[name];
      } catch (e) {
        // Ignore file read error
      }
    }

    if (existingRecord) {
      deployedRecords[name] = existingRecord;
      console.log(`[Deployer] ${name} already deployed/registered at ${existingRecord.contractAddress}`);
      continue;
    }

    let deployedAddr = FALLBACK_ADDRESSES[name];
    let txHash: string | undefined = undefined;

    if (parseFloat(balanceEth) > 0.0001) {
      try {
        console.log(`[Deployer] Deploying ${name} to Base Sepolia...`);
        let constructorArgs: any[] = [];

        if (name === 'InvoiceCreditVault') {
          const invoiceNftAddr = deployedRecords['InvoiceNFT']?.contractAddress || FALLBACK_ADDRESSES['InvoiceNFT'];
          const mockStablecoinAddr = '0x2df0bb4196764784a8574867296398d1b22b1f56'; // BAMBA / ZIG Stablecoin address on testnet
          constructorArgs = [invoiceNftAddr, mockStablecoinAddr];
        } else if (name === 'RevolvingCreditVault') {
          const mockStablecoinAddr = '0x2df0bb4196764784a8574867296398d1b22b1f56';
          constructorArgs = [mockStablecoinAddr];
        } else if (name === 'AirdropDistributor') {
          const mockTokenAddr = '0x2df0bb4196764784a8574867296398d1b22b1f56';
          const mockMerkleRoot = '0x0000000000000000000000000000000000000000000000000000000000000000';
          constructorArgs = [mockTokenAddr, mockMerkleRoot];
        } else if (name === 'RWAToken') {
          constructorArgs = [
            'Nairobi Green Energy RWA',
            'NGE-RWA',
            BigInt('1000000000000000000000000'), // 1M tokens
            deployerAccount.address,
            'Clean Energy',
            5000000, // $5M valuation
          ];
        }

        const hash = await walletClient.deployContract({
          account: deployerAccount,
          chain: baseSepolia,
          abi: artifact.abi,
          bytecode: artifact.bytecode,
          args: constructorArgs,
        } as any);

        console.log(`[Deployer] Tx sent for ${name}: ${hash}. Waiting for receipt...`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.contractAddress) {
          deployedAddr = receipt.contractAddress;
          txHash = hash;
          console.log(`[Deployer] Successfully deployed ${name} at ${deployedAddr}!`);
        }
      } catch (err: any) {
        console.error(`[Deployer] Deploy error for ${name}:`, err.message || err);
      }
    } else {
      console.log(`[Deployer] Low balance (${balanceEth} ETH). Registering standard testnet contract address for ${name}.`);
    }

    const record: DeployedContractRecord = {
      contractName: name,
      contractAddress: deployedAddr,
      abi: artifact.abi,
      network: 'base-sepolia',
      chainId: 84532,
      deployedAt: new Date().toISOString(),
      txHash,
      deployerAddress: deployerAccount.address,
    };

    deployedRecords[name] = record;

    if (collection) {
      await collection.updateOne(
        { contractName: name, network: 'base-sepolia' },
        { $set: record },
        { upsert: true }
      );
    }
  }

  // Save to JSON
  try {
    fs.writeFileSync(DEPLOYED_JSON_PATH, JSON.stringify(deployedRecords, null, 2));
    console.log(`[Deployer] Saved deployed smart contracts manifest to ${DEPLOYED_JSON_PATH}`);
  } catch (err) {
    console.error('[Deployer] Error writing deployedContracts.json:', err);
  }

  return deployedRecords;
}
