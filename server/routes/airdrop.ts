import { Router, Request, Response } from 'express';
import { processStockAirdrop, hasClaimedAirdrop } from '../onchain/airdrop';
import { initTokenDeployment, deployerAccount, publicClient } from '../onchain/deploy';
import { getMongoCollection } from '../db/mongodb';
import { formatEther } from 'viem';

const router = Router();

/**
 * POST /api/airdrop/claim
 * Triggers 100 stock token airdrop per company for the user's wallet address on Base Sepolia
 */
router.post('/claim', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ success: false, error: 'Missing walletAddress in request body' });
    }

    const result = await processStockAirdrop(walletAddress);
    res.json({
      success: result.success,
      alreadyClaimed: result.alreadyClaimed,
      message: result.message,
      transfers: result.transfers,
    });
  } catch (error: any) {
    console.error('[Airdrop Router] Claim error:', error);
    res.status(500).json({ success: false, error: error.message || 'Airdrop claim failed' });
  }
});

/**
 * GET /api/airdrop/status or /api/airdrop/status/:address
 * Checks if a specific wallet address has claimed the stock & ZIG airdrop
 */
router.get(['/status', '/status/:address'], async (req: Request, res: Response) => {
  try {
    const address = (req.params.address || req.query.address) as string;
    if (!address) {
      return res.status(400).json({ success: false, error: 'Missing address parameter' });
    }

    const claimed = await hasClaimedAirdrop(address);
    res.json({ success: true, walletAddress: address.toLowerCase(), claimed });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/airdrop/tokens
 * Returns all tokenized stock contract addresses deployed on Base Sepolia
 */
router.get('/tokens', async (_req: Request, res: Response) => {
  try {
    const tokens = await initTokenDeployment();
    res.json({ success: true, count: Object.keys(tokens).length, tokens });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/airdrop/stats
 * Overview of deployment and airdrop activity
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const tokens = await initTokenDeployment();

    let totalClaims = 0;
    const airdropCol = await getMongoCollection('airdrops');
    if (airdropCol) {
      totalClaims = await airdropCol.countDocuments();
    }

    let deployerBalance = '0.00';
    try {
      const balanceWei = await publicClient.getBalance({ address: deployerAccount.address });
      deployerBalance = formatEther(balanceWei);
    } catch (e) {}

    res.json({
      success: true,
      network: 'Base Sepolia Testnet (Chain ID 84532)',
      deployerAddress: deployerAccount.address,
      deployerETHBalance: deployerBalance,
      tokenizedCompaniesCount: Object.keys(tokens).length,
      stockTokens: tokens,
      totalAirdropsDistributed: totalClaims,
      airdropAmountPerCompany: 100,
      totalStocksPerUser: 400,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
