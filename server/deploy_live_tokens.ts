import { createPublicClient, createWalletClient, http, parseEther, formatEther, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { STOCK_TOKEN_ABI, STOCK_TOKEN_BYTECODE } from './onchain/erc20Artifact';
import { getMongoCollection } from './db/mongodb';

import dotenv from 'dotenv';
dotenv.config();

const privateKey = (process.env.DEPLOYER_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000') as `0x${string}`;
const deployerAccount = privateKeyToAccount(privateKey);

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

const walletClient = createWalletClient({
  account: deployerAccount,
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

const TOKENS_TO_DEPLOY = [
  {
    symbol: 'ZIG',
    name: 'Zimbabwe Gold Stablecoin',
    stockTicker: 'ZIG',
    initialSupply: '10000000', // 10 Million ZIG
  },
  {
    symbol: 'BAMBA',
    name: 'Bamba Cold Chain Logistics',
    stockTicker: 'BAMBA',
    initialSupply: '1000000',
  },
  {
    symbol: 'SIMBA',
    name: 'Simba Solar Micro-Grids',
    stockTicker: 'SIMBA',
    initialSupply: '1000000',
  },
  {
    symbol: 'TEA',
    name: 'Nyanga Specialty Tea Equity',
    stockTicker: 'NYTEA',
    initialSupply: '1000000',
  },
  {
    symbol: 'MUKURU',
    name: 'Mukuru Macadamia & Avocado Exporters',
    stockTicker: 'MUKURU',
    initialSupply: '1000000',
  },
];

async function main() {
  console.log('=== STARTING ONCHAIN TOKEN DEPLOYMENT ON BASE SEPOLIA ===');
  console.log('Deployer Address:', deployerAccount.address);

  const balanceWei = await publicClient.getBalance({ address: deployerAccount.address });
  console.log(`Deployer ETH Balance: ${formatEther(balanceWei)} ETH`);

  if (balanceWei === 0n) {
    throw new Error('Deployer balance is 0 ETH');
  }

  const deployedResults: Record<string, { address: string; txHash: string; symbol: string; name: string; supply: string }> = {};

  for (const token of TOKENS_TO_DEPLOY) {
    console.log(`\n--- Deploying ${token.symbol} (${token.name}) ---`);
    const supplyWei = parseEther(token.initialSupply);

    const txHash = await walletClient.deployContract({
      account: deployerAccount,
      chain: baseSepolia,
      abi: STOCK_TOKEN_ABI,
      bytecode: STOCK_TOKEN_BYTECODE,
      args: [token.name, token.symbol, supplyWei, deployerAccount.address],
    } as any);

    console.log(`Transaction broadcasted: ${txHash}`);
    console.log('Waiting for receipt on Base Sepolia...');

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    const contractAddress = receipt.contractAddress;

    if (!contractAddress) {
      throw new Error(`Failed to get contract address for ${token.symbol}`);
    }

    console.log(`✅ ${token.symbol} deployed successfully at: ${contractAddress}`);
    console.log(`Basescan: https://sepolia.basescan.org/token/${contractAddress}`);

    deployedResults[token.symbol] = {
      address: contractAddress,
      txHash,
      symbol: token.symbol,
      name: token.name,
      supply: token.initialSupply,
    };
  }

  console.log('\n=== ALL 5 CONTRACTS DEPLOYED SUCCESSFULLY ===');
  console.log(JSON.stringify(deployedResults, null, 2));

  // Update MongoDB collections
  try {
    const tokensCol = await getMongoCollection('deployed_tokens');
    if (tokensCol) {
      for (const [symbol, info] of Object.entries(deployedResults)) {
        await tokensCol.updateOne(
          { symbol },
          {
            $set: {
              symbol,
              name: info.name,
              stockTicker: symbol === 'TEA' ? 'NYTEA' : symbol,
              contractAddress: info.address,
              totalSupply: Number(info.supply),
              decimals: 18,
              deployedAt: new Date().toISOString(),
              txHash: info.txHash,
              deployerAddress: deployerAccount.address,
            },
          },
          { upsert: true }
        );
      }
      console.log('✅ MongoDB deployed_tokens collection updated');
    }

    const zigCol = await getMongoCollection('zig_stablecoin');
    if (zigCol && deployedResults['ZIG']) {
      await zigCol.updateOne(
        { symbol: 'ZIG' },
        {
          $set: {
            symbol: 'ZIG',
            name: 'Zimbabwe Gold Stablecoin',
            contractAddress: deployedResults['ZIG'].address,
            factoryAddress: '0xB20f000000000000000000000000000000000000',
            standard: 'Base B20 (ERC-20 Superset with RBAC, Memos & Compliance)',
            decimals: 18,
            initialSupplyMinted: 10000000,
            totalCirculatingSupply: 10000000,
            treasuryBalance: 10000000,
            adminAddress: deployerAccount.address,
            minterAddress: deployerAccount.address,
            burnerAddress: deployerAccount.address,
            deployedAt: new Date().toISOString(),
            txHash: deployedResults['ZIG'].txHash,
            network: 'Base Sepolia Testnet',
            chainId: 84532,
            explorerUrl: `https://sepolia.basescan.org/token/${deployedResults['ZIG'].address}`,
          },
        },
        { upsert: true }
      );
      console.log('✅ MongoDB zig_stablecoin collection updated');
    }
  } catch (dbErr: any) {
    console.warn('MongoDB sync notice:', dbErr?.message || dbErr);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
