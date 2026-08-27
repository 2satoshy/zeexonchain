import { Router, Request, Response } from 'express';
import { store } from '../store';

const router = Router();

// GET /api/dex/tokens - Get all tradable tokens with live prices
router.get('/tokens', (req: Request, res: Response) => {
  try {
    const tokens = store.getTokens();
    res.json({
      success: true,
      count: tokens.length,
      data: tokens
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/dex/quote - Get quote for token swap
router.post('/quote', (req: Request, res: Response) => {
  try {
    const from = req.body.fromSymbol || req.body.tokenIn;
    const to = req.body.toSymbol || req.body.tokenOut;
    const amountIn = req.body.amountIn;
    
    if (!from || !to || !amountIn || Number(amountIn) <= 0) {
      return res.status(400).json({ success: false, error: 'fromSymbol/tokenIn, toSymbol/tokenOut, and amountIn (>0) are required' });
    }

    const quote = store.getDexQuote(from, to, Number(amountIn));
    res.json({
      success: true,
      data: quote
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/dex/swap - Execute instant token swap
router.post('/swap', (req: Request, res: Response) => {
  try {
    const from = req.body.fromSymbol || req.body.tokenIn;
    const to = req.body.toSymbol || req.body.tokenOut;
    const amountIn = req.body.amountIn;
    const walletAddress = req.body.walletAddress;

    if (!from || !to || !amountIn || Number(amountIn) <= 0) {
      return res.status(400).json({ success: false, error: 'fromSymbol/tokenIn, toSymbol/tokenOut, and amountIn are required' });
    }

    const result = store.executeSwap(from, to, Number(amountIn), walletAddress);
    res.json({
      success: true,
      message: `Swapped ${amountIn} ${from} for ${result.quote.amountOutEstimated} ${to} via Base L2`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/dex/orders - Get open limit orders
router.get('/orders', (req: Request, res: Response) => {
  try {
    const orders = store.getOrders();
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/dex/orders - Create new limit order
router.post('/orders', (req: Request, res: Response) => {
  try {
    const { pair, side, type, price, amount, totalUSD } = req.body;
    if (!pair || !side || !price || !amount) {
      return res.status(400).json({ success: false, error: 'Missing order parameters: pair, side, price, amount' });
    }

    const order = store.createOrder({
      pair,
      side: side as 'BUY' | 'SELL',
      type: (type || 'LIMIT') as 'MARKET' | 'LIMIT',
      price: Number(price),
      amount: Number(amount),
      totalUSD: Number(totalUSD) || (Number(price) * Number(amount))
    });

    res.status(201).json({
      success: true,
      message: `Limit order placed successfully: ${order.side} ${order.amount} ${order.pair} @ $${order.price}`,
      data: order
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/dex/orders/:id - Cancel limit order
router.delete('/orders/:id', (req: Request, res: Response) => {
  try {
    const success = store.cancelOrder(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({
      success: true,
      message: `Order ${req.params.id} cancelled successfully`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
