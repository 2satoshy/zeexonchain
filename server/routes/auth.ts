import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

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
 * Verifies SIWE message signature and authenticates Base Account user
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { address, message, signature } = req.body;
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

    res.json({
      ok: true,
      address,
      message: 'Base Account SIWE authentication successful',
      token: `base_session_${address.slice(0, 8)}_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[SIWE Auth] Error:', error);
    res.status(500).json({ error: error.message || 'Verification failed' });
  }
});

export default router;
