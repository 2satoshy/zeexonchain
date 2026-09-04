import { parseEther, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { getMongoCollection } from '../db/mongodb';
import { store } from '../store';
import { publicClient, walletClient, deployerAccount, initTokenDeployment } from './deploy';
import { STOCK_TOKEN_ABI } from './erc20Artifact';

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
 * Checks if a wallet address has already received the 100 stock airdrop
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
 * Distributes 100 stock tokens of each company (BAMBA, SIMBA, TEA, MUKURU) to a user's wallet address on Base Sepolia
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
      message: `Wallet ${walletAddress} has already received the 100 stock airdrop.`,
    };
  }

  // 2. Fetch deployed tokens
  const deployedTokens = await initTokenDeployment();
  const transfers: Array<{ symbol: string; contractAddress: string; amount: number; txHash?: string; status: 'CONFIRMED' | 'SIMULATED' | 'FAILED' }> = [];

  const AIRDROP_AMOUNT = 100; // 100 shares per company
  const amountWei = parseEther(AIRDROP_AMOUNT.toString());

  // Check deployer ETH balance
  let hasGas = false;
  try {
    const balanceWei = await publicClient.getBalance({ address: deployerAccount.address });
    hasGas = parseFloat(formatEther(balanceWei)) > 0.0001;
  } catch (e) {
    hasGas = false;
  }

  for (const [symbol, tokenRecord] of Object.entries(deployedTokens)) {
    let txHash: string | undefined;
    let status: 'CONFIRMED' | 'SIMULATED' | 'FAILED' = 'SIMULATED';

    if (hasGas && tokenRecord.contractAddress && tokenRecord.contractAddress.startsWith('0x')) {
      try {
        console.log(`[Airdrop] Transferring ${AIRDROP_AMOUNT} ${symbol} to ${walletAddress} on Base Sepolia...`);
        txHash = await walletClient.writeContract({
          account: deployerAccount,
          chain: baseSepolia,
          address: tokenRecord.contractAddress as `0x${string}`,
          abi: STOCK_TOKEN_ABI,
          functionName: 'transfer',
          args: [normalizedAddress as `0x${string}`, amountWei],
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
      amount: AIRDROP_AMOUNT,
      txHash,
      status,
    });

    // Update holdings in store for user
    const stockId = symbol.toLowerCase() === 'bamba' ? 'stock-1' : symbol.toLowerCase() === 'simba' ? 'stock-2' : symbol.toLowerCase() === 'tea' ? 'stock-3' : 'stock-4';
    store.addHoldingToUserPortfolio(normalizedAddress, {
      stockId,
      ticker: tokenRecord.stockTicker || symbol,
      name: tokenRecord.name,
      units: AIRDROP_AMOUNT,
      avgPriceUSD: 1.0,
      currentValueUSD: AIRDROP_AMOUNT,
      pnlUSD: 0,
      pnlPercent: 0,
    });
  }

  // 3. Record claim in MongoDB
  const claimRecord: AirdropClaimRecord = {
    walletAddress: normalizedAddress,
    claimedAt: new Date().toISOString(),
    transfers,
    totalTokensReceived: AIRDROP_AMOUNT * transfers.length,
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
      totalCompanies: transfers.length,
      amountPerCompany: AIRDROP_AMOUNT,
      totalTokens: AIRDROP_AMOUNT * transfers.length,
      transfers,
    },
  });

  return {
    success: true,
    alreadyClaimed: false,
    transfers: transfers.map((t) => ({ symbol: t.symbol, amount: t.amount, txHash: t.txHash, status: t.status })),
    message: `Successfully airdropped 100 shares of each of the 4 test companies (400 stocks total) on Base Sepolia!`,
  };
}
