import { Router, Request, Response } from 'express';
import { store } from '../store';

const router = Router();

// GET /api/portfolio - Get complete user portfolio & net worth
router.get('/portfolio', (req: Request, res: Response) => {
  try {
    const portfolio = store.getPortfolio();
    res.json({
      success: true,
      data: portfolio
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/transactions - Get indexed transactions
router.get('/transactions', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const txs = store.getTransactions(limit);
    res.json({
      success: true,
      count: txs.length,
      data: txs
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/wallet/deposit - Deposit funds
router.post('/deposit', (req: Request, res: Response) => {
  try {
    const { amount, tokenSymbol, rail, walletAddress } = req.body;
    if (!amount || !tokenSymbol || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount (>0) and tokenSymbol required' });
    }

    const result = store.depositFunds(Number(amount), tokenSymbol, rail || 'Base L2 / EcoCash', walletAddress);
    res.json({
      success: true,
      message: `Deposited ${amount} ${tokenSymbol} successfully`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/wallet/send - Send tokens or shares
router.post('/send', (req: Request, res: Response) => {
  try {
    const { amount, tokenSymbol, recipient, senderAddress } = req.body;
    if (!amount || !tokenSymbol || !recipient || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount, tokenSymbol, and recipient required' });
    }

    const result = store.sendFunds(Number(amount), tokenSymbol, recipient, senderAddress);
    res.json({
      success: true,
      message: `Sent ${amount} ${tokenSymbol} to ${recipient}`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/wallet/dividends - Claim or compound dividends
router.post('/dividends', (req: Request, res: Response) => {
  try {
    const { action } = req.body;
    const result = store.claimDividends((action as 'claim' | 'compound') || 'claim');
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/wallet/faucet - Claim testnet ZIG or USDC
router.post('/faucet', (req: Request, res: Response) => {
  try {
    const { tokenSymbol } = req.body;
    const result = store.faucetRequest(tokenSymbol || 'ZIG');
    res.json({
      success: true,
      message: `Testnet faucet minted ${tokenSymbol || 'ZIG'} funds directly to your Base Sepolia address!`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
