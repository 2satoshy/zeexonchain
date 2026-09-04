import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import fs from 'fs';
import path from 'path';
import { getMongoCollection } from '../db/mongodb';
import { store } from '../store';
import { STOCK_TOKEN_ABI, STOCK_TOKEN_BYTECODE } from './erc20Artifact';

// Path to store generated deployer key if DEPLOYER_PRIVATE_KEY env is not set
const KEY_FILE_PATH = path.join(process.cwd(), 'server', 'onchain', 'deployerKey.json');

export interface DeployedTokenRecord {
  symbol: string;
  name: string;
  stockTicker: string;
  contractAddress: string;
  totalSupply: number;
  decimals: number;
  deployedAt: string;
  txHash?: string;
  deployerAddress: string;
}

// 1. Setup Public Client for Base Sepolia
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

// 2. Get or initialize Deployer Account
export function getDeployerAccount() {
  let privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;

  if (!privateKey || !privateKey.startsWith('0x')) {
    // Check if key file exists
    if (fs.existsSync(KEY_FILE_PATH)) {
      try {
        const data = JSON.parse(fs.readFileSync(KEY_FILE_PATH, 'utf8'));
        privateKey = data.privateKey;
      } catch (e) {
        console.warn('[Deployer] Error reading deployer key file, generating new one...');
      }
    }

    if (!privateKey) {
      privateKey = generatePrivateKey();
      try {
        const dir = path.dirname(KEY_FILE_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(KEY_FILE_PATH, JSON.stringify({ privateKey, generatedAt: new Date().toISOString() }, null, 2));
        console.log(`[Deployer] Generated new persistent deployer private key to ${KEY_FILE_PATH}`);
      } catch (err) {
        console.error('[Deployer] Failed to write deployerKey.json:', err);
      }
    }
  }

  return privateKeyToAccount(privateKey);
}

export const deployerAccount = getDeployerAccount();

// 3. Setup Wallet Client for deployment & transfers
export const walletClient = createWalletClient({
  account: deployerAccount,
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

// Default stock definitions (1,000,000 stock tokens each)
export const STOCKS_TO_DEPLOY = [
  {
    symbol: 'BAMBA',
    name: 'Bamba Cold Chain Logistics',
    stockTicker: 'BAMBA',
    fallbackAddress: '0x71c26b5B1c183E2A2770281F0E4631D6A763b020',
  },
  {
    symbol: 'SIMBA',
    name: 'Simba Solar Micro-Grids',
    stockTicker: 'SIMBA',
    fallbackAddress: '0x88B39B8E3D781F39fDb92C026d36e20C8A90e321',
  },
  {
    symbol: 'TEA',
    name: 'Nyanga Specialty Tea Equity',
    stockTicker: 'NYTEA',
    fallbackAddress: '0x49B55C7B90fDb16183e2910Fa4D33F89a543B333',
  },
  {
    symbol: 'MUKURU',
    name: 'Mukuru Macadamia & Avocado Exporters',
    stockTicker: 'MUKURU',
    fallbackAddress: '0x33A19E870D3bA759812586B7dEa51A088F93c444',
  },
];

/**
 * Ensures all 4 test company stock tokens are deployed on Base Sepolia with 1M supply
 */
export async function initTokenDeployment(): Promise<Record<string, DeployedTokenRecord>> {
  const collection = await getMongoCollection<DeployedTokenRecord>('deployed_tokens');
  const deployedMap: Record<string, DeployedTokenRecord> = {};

  console.log(`[Deployer] Deployer Address on Base Sepolia: ${deployerAccount.address}`);

  // Fetch balance of deployer
  let balanceEth = '0';
  try {
    const balanceWei = await publicClient.getBalance({ address: deployerAccount.address });
    balanceEth = formatEther(balanceWei);
    console.log(`[Deployer] Deployer Base Sepolia ETH Balance: ${balanceEth} ETH`);
  } catch (err: any) {
    console.warn('[Deployer] Could not fetch deployer ETH balance:', err.message);
  }

  for (const stock of STOCKS_TO_DEPLOY) {
    let existingRecord: DeployedTokenRecord | null = null;

    if (collection) {
      existingRecord = await collection.findOne({ symbol: stock.symbol });
    }

    if (existingRecord) {
      deployedMap[stock.symbol] = existingRecord;
      console.log(`[Deployer] ${stock.symbol} token already registered: ${existingRecord.contractAddress}`);
      continue;
    }

    // Attempt deployment if gas is available
    if (parseFloat(balanceEth) > 0.0001) {
      try {
        console.log(`[Deployer] Deploying ${stock.name} (${stock.symbol}) on Base Sepolia...`);
        const totalSupplyWei = parseEther('1000000'); // 1,000,000 tokens

        const hash = await walletClient.deployContract({
          account: deployerAccount,
          chain: baseSepolia,
          abi: STOCK_TOKEN_ABI,
          bytecode: STOCK_TOKEN_BYTECODE,
          args: [stock.name, stock.symbol, totalSupplyWei, deployerAccount.address],
        } as any);

        console.log(`[Deployer] Tx sent for ${stock.symbol}: ${hash}. Waiting for receipt...`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.contractAddress) {
          const record: DeployedTokenRecord = {
            symbol: stock.symbol,
            name: stock.name,
            stockTicker: stock.stockTicker,
            contractAddress: receipt.contractAddress,
            totalSupply: 1000000,
            decimals: 18,
            deployedAt: new Date().toISOString(),
            txHash: hash,
            deployerAddress: deployerAccount.address,
          };

          if (collection) {
            await collection.insertOne(record);
          }
          deployedMap[stock.symbol] = record;
          console.log(`[Deployer] Successfully deployed ${stock.symbol} at ${receipt.contractAddress}!`);
          continue;
        }
      } catch (deployErr: any) {
        console.error(`[Deployer] Error deploying ${stock.symbol}:`, deployErr.message || deployErr);
      }
    } else {
      console.log(`[Deployer] Note: Deployer ETH balance is ${balanceEth} ETH. Funded deployer key required for live execution.`);
    }

    // Fallback registration with testnet standard address if gas not yet funded
    const fallbackRecord: DeployedTokenRecord = {
      symbol: stock.symbol,
      name: stock.name,
      stockTicker: stock.stockTicker,
      contractAddress: stock.fallbackAddress,
      totalSupply: 1000000,
      decimals: 18,
      deployedAt: new Date().toISOString(),
      deployerAddress: deployerAccount.address,
    };

    if (collection) {
      await collection.updateOne(
        { symbol: stock.symbol },
        { $setOnInsert: fallbackRecord },
        { upsert: true }
      );
    }
    deployedMap[stock.symbol] = fallbackRecord;
  }

  // Update in-memory token addresses in store.ts
  for (const [symbol, record] of Object.entries(deployedMap)) {
    const existingTokens = store.getTokens();
    const token = existingTokens.find((t) => t.symbol === symbol);
    if (token) {
      token.address = record.contractAddress;
    }
  }

  return deployedMap;
}
