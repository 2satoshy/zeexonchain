import { Router } from 'express';
import {
  initZigStablecoin,
  mintZigSupply,
  burnZigSupply,
  getZigSupplyOperations,
  B20_ROLES,
  B20_FACTORY_ADDRESS
} from '../onchain/zigStablecoin';

const router = Router();

/**
 * GET /api/zig/token
 * Returns the $ZIG Stablecoin status, Base B20 compliance specs, roles & supply details
 */
router.get('/token', async (req, res) => {
  try {
    const record = await initZigStablecoin();
    res.json({
      success: true,
      data: {
        ...record,
        roles: B20_ROLES,
        b20Factory: B20_FACTORY_ADDRESS,
        referenceDocs: [
          'https://docs.base.org/build-on-base/issue-stablecoins/issue-your-stablecoin',
          'https://docs.base.org/build-on-base/issue-stablecoins/mint-supply',
          'https://docs.base.org/build-on-base/issue-stablecoins/burn-supply',
          'https://docs.base.org/specifications/b20/specification-overview#burn'
        ]
      }
    });
  } catch (error: any) {
    console.error('[ZIG API] Error fetching token details:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch ZIG stablecoin details' });
  }
});

/**
 * POST /api/zig/mint
 * Mints new $ZIG supply with memo (Base Docs: issue-stablecoins/mint-supply)
 */
router.post('/mint', async (req, res) => {
  try {
    const { amount, recipientAddress, memo } = req.body;
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid mint amount is required' });
    }

    const op = await mintZigSupply({
      amount: numAmount,
      recipientAddress,
      memo: memo || `ZEEX_SUPPLY_EXPANSION_${Date.now()}`
    });

    res.json({
      success: true,
      message: `Successfully minted ${numAmount.toLocaleString()} $ZIG supply on Base Sepolia!`,
      data: op
    });
  } catch (error: any) {
    console.error('[ZIG API] Mint error:', error);
    res.status(500).json({ error: error.message || 'Failed to mint ZIG supply' });
  }
});

/**
 * POST /api/zig/burn
 * Burns $ZIG supply with memo (Base Docs: issue-stablecoins/burn-supply)
 */
router.post('/burn', async (req, res) => {
  try {
    const { amount, ownerAddress, memo } = req.body;
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid burn amount is required' });
    }

    const op = await burnZigSupply({
      amount: numAmount,
      ownerAddress,
      memo: memo || `ZEEX_SUPPLY_CONTRACTION_${Date.now()}`
    });

    res.json({
      success: true,
      message: `Successfully burned ${numAmount.toLocaleString()} $ZIG supply on Base Sepolia!`,
      data: op
    });
  } catch (error: any) {
    console.error('[ZIG API] Burn error:', error);
    res.status(500).json({ error: error.message || 'Failed to burn ZIG supply' });
  }
});

/**
 * GET /api/zig/operations
 * Returns recent mint and burn supply operations with memos for reconciliation
 */
router.get('/operations', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const ops = await getZigSupplyOperations(limit);
    res.json({
      success: true,
      count: ops.length,
      data: ops
    });
  } catch (error: any) {
    console.error('[ZIG API] Operations error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch supply operations' });
  }
});

export default router;
