import { Router, Request, Response } from 'express';
import { store } from '../store';

const router = Router();

// POST /api/base-pay/record - Record a Base Account SDK payment in MongoDB
router.post('/record', async (req: Request, res: Response) => {
  try {
    const { id, amountUSD, recipient, payerAddress, purpose, status, testnet, txHash } = req.body;
    if (!id || !amountUSD || !recipient) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: id, amountUSD, recipient'
      });
    }

    const record = await store.recordBasePayment({
      id,
      amountUSD: Number(amountUSD),
      recipient,
      payerAddress,
      purpose: purpose || 'ZEEX Base Pay Settlement',
      status: status || 'BROADCASTED',
      testnet: testnet !== false,
      txHash
    });

    res.status(201).json({
      success: true,
      message: `Base Pay transaction ${id} recorded in MongoDB`,
      data: record
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/base-pay/history - List recorded Base Pay payments
router.get('/history', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const payments = store.getBasePayments(limit);
    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/base-pay/:id - Get specific Base Pay transaction details
router.get('/:id', (req: Request, res: Response) => {
  try {
    const record = store.getBasePaymentById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Base Pay record not found' });
    }
    res.json({
      success: true,
      data: record
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/base-pay/verify - Update Base Pay status in MongoDB
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { id, status, txHash } = req.body;
    if (!id || !status) {
      return res.status(400).json({ success: false, error: 'Missing id or status' });
    }

    const updated = await store.updateBasePaymentStatus(id, status, txHash);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    res.json({
      success: true,
      message: `Payment status updated to ${status} in MongoDB`,
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
