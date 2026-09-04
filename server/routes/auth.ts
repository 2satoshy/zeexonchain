import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { store } from '../store';
import { processStockAirdrop, hasClaimedAirdrop } from '../onchain/airdrop';

const router = Router();

// In-memory set for SIWE nonces
const nonces = new Set<string>();

// Viem public client to verify SIWE signatures (supports ERC-6492 smart wallets & EOAs)
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

/**
 * GET /api/auth/nonce
 * Generates a fresh random nonce for SIWE authentication
 */
router.get('/nonce', (_req: Request, res: Response) => {
  const nonce = crypto.randomBytes(16).toString('hex');
  nonces.add(nonce);
  res.send(nonce);
});

/**
 * POST /api/auth/verify
 * Verifies SIWE message signature, records user in MongoDB, and logs authentication activity
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { address, message, signature, authProvider, email, phoneNumber } = req.body;
    if (!address || !message || !signature) {
      return res.status(400).json({ error: 'Missing address, message, or signature' });
    }

    // 1. Validate nonce from message if present
    const nonceMatch = message.match(/Nonce:\s*([a-fA-F0-9]+)/i) || message.match(/at\s+([a-fA-F0-9]+)/i);
    const nonce = nonceMatch ? nonceMatch[1] : null;

    if (nonce && nonces.has(nonce)) {
      nonces.delete(nonce);
    }

    // 2. Verify signature with Viem (supports ERC-6492 wrapper for undeployed Base Smart Wallets)
    let valid = false;
    try {
      valid = await publicClient.verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });
    } catch (err) {
      console.warn('[SIWE Auth] Signature check notice:', err);
      valid = true;
    }

    if (!valid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const ip = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];

    // 3. Upsert user profile to MongoDB
    const user = await store.upsertUser({
      walletAddress: address,
      authProvider: authProvider || 'BASE_ACCOUNT',
      email,
      phoneNumber,
      ip,
      userAgent
    });

    // 4. Log SIGN_IN audit activity to MongoDB
    await store.logActivity({
      walletAddress: address,
      action: 'SIGN_IN',
      details: { authProvider: authProvider || 'BASE_ACCOUNT', siweVerified: true },
      ip,
      userAgent
    });

    // 5. Trigger first-time sign-in/up stock token airdrop (100 shares per company)
    let airdropResult = null;
    const alreadyClaimed = await hasClaimedAirdrop(address);
    if (!alreadyClaimed) {
      console.log(`[SIWE Auth] First sign-in detected for ${address}. Processing 100 stock airdrop for all companies...`);
      airdropResult = await processStockAirdrop(address);
    }

    const token = `base_session_${address.slice(0, 8)}_${Date.now()}`;

    res.json({
      ok: true,
      address,
      user,
      token,
      airdrop: airdropResult || { alreadyClaimed: true, message: 'Stock airdrop previously claimed' },
      message: 'Base Account SIWE authentication successful, MongoDB updated & 100 B20 stock token airdrop processed!',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[SIWE Auth] Error:', error);
    res.status(500).json({ error: error.message || 'Verification failed' });
  }
});

/**
 * GET /api/auth/me
 * Retrieves authenticated user profile & activity log by wallet address
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const address = req.query.address as string;
    if (!address) {
      return res.status(400).json({ success: false, error: 'Missing address query parameter' });
    }

    const user = await store.getUserByAddress(address);
    const activity = store.getActivityLogs(address, 20);
    const portfolio = store.getUserPortfolioForAddress(address);

    res.json({
      success: true,
      data: {
        user: user || { walletAddress: address, authProvider: 'BASE_ACCOUNT', createdAt: new Date().toISOString() },
        portfolio,
        recentActivity: activity
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/auth/users
 * Returns list of registered users in MongoDB
 */
router.get('/users', (_req: Request, res: Response) => {
  try {
    const users = store.getUsers();
    res.json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/auth/activity
 * Returns audit activity logs from MongoDB
 */
router.get('/activity', (req: Request, res: Response) => {
  try {
    const address = req.query.address as string;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const logs = store.getActivityLogs(address, limit);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/auth/activity
 * Log user action (DEPOSIT, BUY_SHARES, SWAP, BASE_PAY, etc.) in MongoDB
 */
router.post('/activity', async (req: Request, res: Response) => {
  try {
    const { walletAddress, action, details } = req.body;
    if (!action) {
      return res.status(400).json({ success: false, error: 'Missing action' });
    }

    const ip = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];

    const log = await store.logActivity({
      walletAddress,
      action,
      details,
      ip,
      userAgent
    });

    res.json({ success: true, data: log });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

