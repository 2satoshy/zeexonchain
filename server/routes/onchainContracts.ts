import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const DEPLOYED_JSON_PATH = path.join(process.cwd(), 'server', 'onchain', 'deployedContracts.json');

/**
 * GET /api/onchain-contracts
 * Returns all deployed Base Sepolia production smart contracts manifest
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(DEPLOYED_JSON_PATH)) {
      return res.status(404).json({ success: false, error: 'Deployed contracts manifest not found' });
    }

    const data = JSON.parse(fs.readFileSync(DEPLOYED_JSON_PATH, 'utf8'));
    res.json({
      success: true,
      network: 'Base Sepolia',
      chainId: 84532,
      explorer: 'https://sepolia.basescan.org',
      count: Object.keys(data).length,
      contracts: data
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
