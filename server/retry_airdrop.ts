/**
 * retry_airdrop.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * One-shot script to force-retry the airdrop for a specific wallet address.
 * 
 * Usage:
 *   npx tsx server/retry_airdrop.ts 0x71C824aD3Fe479B92c578f142EbF472bC19638A9
 *
 * What it does:
 *   1. Checks deployer ETH balance on Base Sepolia
 *   2. Removes any existing airdrop claim record from MongoDB (allowing retry)
 *   3. Sends 1,000 ZIG + 100 BAMBA + 100 SIMBA + 100 TEA + 100 MUKURU
 *      live on-chain from deployer → target wallet
 *   4. Saves new claim record to MongoDB
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { MongoClient } from 'mongodb';

// ── Config ────────────────────────────────────────────────────────────────────
const TARGET_WALLET = (process.argv[2] || '0x71C824aD3Fe479B92c578f142EbF472bC19638A9').toLowerCase() as `0x${string}`;
const PRIVATE_KEY   = '0x59b29ff272ed49d1955b972ee2a2fa719d304ec361129ef457e851a51a3dde34';
const MONGODB_URI   = 'mongodb+srv://gugu_db_user:xmOp9kJ6zyIpCZqw@cluster0.g5lfdej.mongodb.net/';
const MONGODB_DB    = 'zeexonchain';
const RPC_URL       = 'https://sepolia.base.org';

// ── Live contract addresses (deployed 2026-09-09) ─────────────────────────────
const CONTRACTS = {
  ZIG:   '0x8d739755de949057d9d001b759b6ec1d2603ca1f' as `0x${string}`,
  BAMBA: '0x2df0bb4196764784a8574867296398d1b22b1f56' as `0x${string}`,
  SIMBA: '0x0616a5a9395555a48a7deda508cabeb0102e2ed5' as `0x${string}`,
  TEA:   '0x4355ea3aa385bd51c41acc0651aa89a13f1518a0' as `0x${string}`,
  MUKURU:'0x35474cd7bae54be6d59ebfc6b4d48288c40fe320' as `0x${string}`,
};

// Minimal ERC-20 transfer ABI
const ERC20_TRANSFER_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ── Viem clients ──────────────────────────────────────────────────────────────
const deployerAccount = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  account: deployerAccount,
  chain: baseSepolia,
  transport: http(RPC_URL),
});

// ── Helpers ───────────────────────────────────────────────────────────────────
async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function checkDeployerBalance(): Promise<string> {
  const wei = await publicClient.getBalance({ address: deployerAccount.address });
  return formatEther(wei);
}

async function getTokenBalance(contractAddress: `0x${string}`, wallet: `0x${string}`): Promise<string> {
  const bal = await publicClient.readContract({
    address: contractAddress,
    abi: ERC20_TRANSFER_ABI,
    functionName: 'balanceOf',
    args: [wallet],
  });
  return formatEther(bal as bigint);
}

async function sendToken(
  symbol: string,
  contractAddress: `0x${string}`,
  to: `0x${string}`,
  amount: number
): Promise<{ txHash: string; status: 'CONFIRMED' | 'FAILED' }> {
  const amountWei = parseEther(amount.toString());
  console.log(`\n  ▶ Sending ${amount} ${symbol} → ${to}`);
  console.log(`    Contract: ${contractAddress}`);

  const txHash = await walletClient.writeContract({
    account: deployerAccount,
    chain: baseSepolia,
    address: contractAddress,
    abi: ERC20_TRANSFER_ABI,
    functionName: 'transfer',
    args: [to, amountWei],
  } as any);

  console.log(`    Tx broadcasted: ${txHash}`);
  console.log(`    Waiting for confirmation...`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  const status = receipt.status === 'success' ? 'CONFIRMED' : 'FAILED';
  console.log(`    ✅ ${symbol} transfer ${status} (block ${receipt.blockNumber})`);

  return { txHash, status };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ZEEXONCHAIN — Airdrop Retry Script');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Target wallet : ${TARGET_WALLET}`);
  console.log(`  Deployer      : ${deployerAccount.address}`);

  // 1. Check deployer ETH balance
  console.log('\n[1/4] Checking deployer ETH balance...');
  const ethBalance = await checkDeployerBalance();
  console.log(`  Deployer ETH balance: ${ethBalance} ETH`);

  const MIN_GAS = 0.001; // 5 transfers × ~0.0002 ETH each
  if (parseFloat(ethBalance) < MIN_GAS) {
    console.error(`\n❌ Insufficient gas. Deployer has ${ethBalance} ETH.`);
    console.error(`   Please send at least ${MIN_GAS} ETH to:`);
    console.error(`   ${deployerAccount.address}`);
    console.error(`   Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet`);
    process.exit(1);
  }
  console.log(`  ✅ Sufficient gas available.`);

  // 2. Check deployer token balances
  console.log('\n[2/4] Checking deployer token balances...');
  for (const [symbol, addr] of Object.entries(CONTRACTS)) {
    const bal = await getTokenBalance(addr, deployerAccount.address);
    console.log(`  ${symbol}: ${parseFloat(bal).toLocaleString()} tokens in deployer wallet`);
    await sleep(200);
  }

  // 3. Clear any existing airdrop record in MongoDB
  console.log('\n[3/4] Clearing existing airdrop record from MongoDB...');
  let mongo: MongoClient | null = null;
  try {
    mongo = new MongoClient(MONGODB_URI);
    await mongo.connect();
    const db = mongo.db(MONGODB_DB);
    const airdropsCol = db.collection('airdrops');
    const deleteResult = await airdropsCol.deleteMany({
      walletAddress: { $in: [TARGET_WALLET, TARGET_WALLET.toLowerCase(), TARGET_WALLET.toUpperCase()] }
    });
    console.log(`  Deleted ${deleteResult.deletedCount} existing airdrop record(s)`);
  } catch (dbErr: any) {
    console.warn(`  MongoDB notice: ${dbErr?.message || dbErr}`);
    console.log('  Continuing with on-chain transfers anyway...');
  }

  // 4. Send tokens on-chain
  console.log('\n[4/4] Sending airdrop on-chain...');

  const results: Array<{ symbol: string; amount: number; txHash: string; status: string }> = [];

  // ZIG: 1,000
  try {
    const r = await sendToken('ZIG', CONTRACTS.ZIG, TARGET_WALLET, 1000);
    results.push({ symbol: 'ZIG', amount: 1000, ...r });
  } catch (e: any) {
    console.error(`  ❌ ZIG transfer failed: ${e.message}`);
    results.push({ symbol: 'ZIG', amount: 1000, txHash: 'FAILED', status: 'FAILED' });
  }
  await sleep(1000);

  // Stock tokens: 100 each
  for (const [symbol, addr] of [
    ['BAMBA', CONTRACTS.BAMBA],
    ['SIMBA', CONTRACTS.SIMBA],
    ['TEA', CONTRACTS.TEA],
    ['MUKURU', CONTRACTS.MUKURU],
  ] as [string, `0x${string}`][]) {
    try {
      const r = await sendToken(symbol, addr, TARGET_WALLET, 100);
      results.push({ symbol, amount: 100, ...r });
    } catch (e: any) {
      console.error(`  ❌ ${symbol} transfer failed: ${e.message}`);
      results.push({ symbol, amount: 100, txHash: 'FAILED', status: 'FAILED' });
    }
    await sleep(1000); // brief gap between txs to avoid nonce issues
  }

  // 5. Save new airdrop record to MongoDB
  if (mongo) {
    try {
      const db = mongo.db(MONGODB_DB);
      const airdropsCol = db.collection('airdrops');
      await airdropsCol.insertOne({
        walletAddress: TARGET_WALLET,
        claimedAt: new Date().toISOString(),
        method: 'ADMIN_RETRY',
        transfers: results.map(r => ({
          symbol: r.symbol,
          amount: r.amount,
          txHash: r.txHash,
          status: r.status,
          contractAddress: CONTRACTS[r.symbol as keyof typeof CONTRACTS] || '',
        })),
        totalTokensReceived: results.reduce((s, r) => s + r.amount, 0),
      });
      console.log('\n  ✅ New airdrop record saved to MongoDB');
    } catch (dbErr: any) {
      console.warn(`  MongoDB write notice: ${dbErr?.message}`);
    } finally {
      await mongo.close();
    }
  }

  // ── Final summary ──
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  AIRDROP RETRY — SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Recipient: ${TARGET_WALLET}`);
  for (const r of results) {
    const icon = r.status === 'CONFIRMED' ? '✅' : '❌';
    console.log(`  ${icon} ${r.symbol.padEnd(8)} ${r.amount.toLocaleString().padStart(7)} tokens  ${r.txHash}`);
  }

  const confirmed = results.filter(r => r.status === 'CONFIRMED');
  const failed = results.filter(r => r.status === 'FAILED');

  console.log(`\n  ${confirmed.length}/5 transfers confirmed, ${failed.length} failed`);

  if (confirmed.length === 5) {
    console.log('\n  🎉 Airdrop complete! All tokens delivered on Base Sepolia.');
    console.log(`  Check wallet: https://sepolia.basescan.org/address/${TARGET_WALLET}`);
  } else if (failed.length > 0) {
    console.log('\n  ⚠️  Some transfers failed. Re-run this script after fixing gas/balance.');
  }

  console.log('═══════════════════════════════════════════════════════════\n');
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message || err);
  process.exit(1);
});
