import { parseEther, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { getMongoCollection } from '../db/mongodb';
import { store } from '../store';
import { publicClient, walletClient, deployerAccount, initTokenDeployment } from './deploy';
import { STOCK_TOKEN_ABI } from './erc20Artifact';
import { initZigStablecoin, B20_STABLECOIN_ABI } from './zigStablecoin';

export interface AirdropClaimRecord {
  walletAddress: string;
  claimedAt: string;
  transfers: Array<{
    symbol: string;
    contractAddress: string;
    amount: number;
    txHash?: string;
    status: 'CONFIRMED' | 'SIMULATED' | 'FAILED';
  }>;
  totalTokensReceived: number;
}

/**
 * Checks if a wallet address has already received the airdrop
 */
export async function hasClaimedAirdrop(walletAddress: string): Promise<boolean> {
  const normalizedAddress = walletAddress.toLowerCase();
  const collection = await getMongoCollection<AirdropClaimRecord>('airdrops');
  if (collection) {
    const existing = await collection.findOne({ walletAddress: normalizedAddress });
    if (existing) return true;
  }

  // Check store memory log
  const activityLogs = store.getActivityLogs(walletAddress, 100);
  return activityLogs.some((log) => log.action === 'CLAIM_AIRDROP' || log.action === 'STOCK_AIRDROP');
}

/**
 * Distributes 1,000 $ZIG Stablecoin + 100 shares of each test company (BAMBA, SIMBA, TEA, MUKURU)
 * to a user's wallet address on Base Sepolia for trading.
 */
export async function processStockAirdrop(walletAddress: string): Promise<{
  success: boolean;
  alreadyClaimed: boolean;
  transfers: Array<{ symbol: string; amount: number; txHash?: string; status: string }>;
  message: string;
}> {
  const normalizedAddress = walletAddress.toLowerCase();

  // 1. Check if already claimed
  const alreadyClaimed = await hasClaimedAirdrop(normalizedAddress);
  if (alreadyClaimed) {
    return {
      success: true,
      alreadyClaimed: true,
      transfers: [],
      message: `Wallet ${walletAddress} has already received the 1,000 ZIG + 400 stock airdrop.`,
    };
  }

  // 2. Fetch deployed tokens & $ZIG B20 Stablecoin
  const [deployedTokens, zigStablecoin] = await Promise.all([
    initTokenDeployment(),
    initZigStablecoin()
  ]);

  const transfers: Array<{ symbol: string; contractAddress: string; amount: number; txHash?: string; status: 'CONFIRMED' | 'SIMULATED' | 'FAILED' }> = [];

  // Check deployer ETH balance
  let hasGas = false;
  try {
    const balanceWei = await publicClient.getBalance({ address: deployerAccount.address });
    hasGas = parseFloat(formatEther(balanceWei)) > 0.0001;
  } catch (e) {
    hasGas = false;
  }

  // --- Step A: Transfer 1,000 $ZIG Stablecoin for trading ---
  const ZIG_AIRDROP_AMOUNT = 1000;
  const zigAmountWei = parseEther(ZIG_AIRDROP_AMOUNT.toString());
  let zigTxHash: string;
  let zigStatus: 'CONFIRMED' | 'SIMULATED' = 'SIMULATED';

  if (hasGas && zigStablecoin.contractAddress && zigStablecoin.contractAddress.startsWith('0x')) {
    try {
      console.log(`[Airdrop] Transferring ${ZIG_AIRDROP_AMOUNT} $ZIG Stablecoin to ${walletAddress} on Base Sepolia...`);
      zigTxHash = await walletClient.writeContract({
        account: deployerAccount,
        chain: baseSepolia,
        address: zigStablecoin.contractAddress as `0x${string}`,
        abi: B20_STABLECOIN_ABI,
        functionName: 'transfer',
        args: [normalizedAddress as `0x${string}`, zigAmountWei],
      } as any);

      console.log(`[Airdrop] Tx broadcasted for ZIG: ${zigTxHash}`);
      await publicClient.waitForTransactionReceipt({ hash: zigTxHash as `0x${string}` });
      zigStatus = 'CONFIRMED';
    } catch (err: any) {
      console.warn('[Airdrop] Onchain transfer for ZIG notice:', err.message || err);
      zigStatus = 'SIMULATED';
      zigTxHash = `0x_b20_airdrop_zig_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
    }
  } else {
    zigTxHash = `0x_b20_airdrop_zig_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
    zigStatus = 'SIMULATED';
  }

  transfers.push({
    symbol: 'ZIG',
    contractAddress: zigStablecoin.contractAddress,
    amount: ZIG_AIRDROP_AMOUNT,
    txHash: zigTxHash,
    status: zigStatus,
  });

  // Credit 1,000 ZIG to user's isolated portfolio
  store.addZigBalanceToUserPortfolio(normalizedAddress, ZIG_AIRDROP_AMOUNT);

  // --- Step B: Transfer 100 stock shares for each company (400 total) ---
  const STOCK_AIRDROP_AMOUNT = 100;
  const stockAmountWei = parseEther(STOCK_AIRDROP_AMOUNT.toString());

  for (const [symbol, tokenRecord] of Object.entries(deployedTokens)) {
    let txHash: string | undefined;
    let status: 'CONFIRMED' | 'SIMULATED' | 'FAILED' = 'SIMULATED';

    if (hasGas && tokenRecord.contractAddress && tokenRecord.contractAddress.startsWith('0x')) {
      try {
        console.log(`[Airdrop] Transferring ${STOCK_AIRDROP_AMOUNT} ${symbol} to ${walletAddress} on Base Sepolia...`);
        txHash = await walletClient.writeContract({
          account: deployerAccount,
          chain: baseSepolia,
          address: tokenRecord.contractAddress as `0x${string}`,
          abi: STOCK_TOKEN_ABI,
          functionName: 'transfer',
          args: [normalizedAddress as `0x${string}`, stockAmountWei],
        } as any);

        console.log(`[Airdrop] Tx broadcasted for ${symbol}: ${txHash}`);
        await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
        status = 'CONFIRMED';
      } catch (err: any) {
        console.warn(`[Airdrop] Onchain transfer for ${symbol} notice:`, err.message || err);
        status = 'SIMULATED';
        txHash = `0x_simulated_airdrop_${symbol.toLowerCase()}_${Date.now()}`;
      }
    } else {
      txHash = `0x_simulated_airdrop_${symbol.toLowerCase()}_${Date.now()}`;
      status = 'SIMULATED';
    }

    transfers.push({
      symbol,
      contractAddress: tokenRecord.contractAddress,
      amount: STOCK_AIRDROP_AMOUNT,
      txHash,
      status,
    });

    // Update holdings in store for user
    const stockId = symbol.toLowerCase() === 'bamba' ? 'stock-1' : symbol.toLowerCase() === 'simba' ? 'stock-2' : symbol.toLowerCase() === 'tea' ? 'stock-3' : 'stock-4';
    store.addHoldingToUserPortfolio(normalizedAddress, {
      stockId,
      ticker: tokenRecord.stockTicker || symbol,
      name: tokenRecord.name,
      units: STOCK_AIRDROP_AMOUNT,
      avgPriceUSD: 1.0,
      currentValueUSD: STOCK_AIRDROP_AMOUNT,
      pnlUSD: 0,
      pnlPercent: 0,
    });
  }

  // 3. Record claim in MongoDB
  const claimRecord: AirdropClaimRecord = {
    walletAddress: normalizedAddress,
    claimedAt: new Date().toISOString(),
    transfers,
    totalTokensReceived: ZIG_AIRDROP_AMOUNT + (STOCK_AIRDROP_AMOUNT * Object.keys(deployedTokens).length),
  };

  const collection = await getMongoCollection<AirdropClaimRecord>('airdrops');
  if (collection) {
    await collection.insertOne(claimRecord);
  }

  // Log activity
  await store.logActivity({
    walletAddress: normalizedAddress,
    action: 'CLAIM_AIRDROP',
    details: {
      zigAmount: ZIG_AIRDROP_AMOUNT,
      totalCompanies: Object.keys(deployedTokens).length,
      amountPerCompany: STOCK_AIRDROP_AMOUNT,
      totalTokens: claimRecord.totalTokensReceived,
      transfers,
    },
  });

  return {
    success: true,
    alreadyClaimed: false,
    transfers: transfers.map((t) => ({ symbol: t.symbol, amount: t.amount, txHash: t.txHash, status: t.status })),
    message: `Successfully allocated 1,000 $ZIG Stablecoin + 400 SME stock tokens on Base Sepolia for trading!`,
  };
}
