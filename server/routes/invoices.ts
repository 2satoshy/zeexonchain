import { Router, Request, Response } from 'express';
import { store } from '../store';

const router = Router();

// GET /api/invoices - List all factoring invoices
router.get('/', (req: Request, res: Response) => {
  try {
    const invoices = store.getInvoices();
    res.json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/invoices/:id - Get specific invoice
router.get('/:id', (req: Request, res: Response) => {
  try {
    const invoice = store.getInvoiceById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }
    res.json({
      success: true,
      data: invoice
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/invoices - Submit supplier invoice for discounting
router.post('/', (req: Request, res: Response) => {
  try {
    const { smeName, buyerName, amountUSD, discountRate, tenorDays, dueDate } = req.body;
    if (!smeName || !buyerName || !amountUSD || amountUSD <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: smeName, buyerName, amountUSD'
      });
    }

    const invoice = store.createInvoice({
      smeName,
      buyerName,
      amountUSD: Number(amountUSD),
      discountRate: Number(discountRate) || 14.5,
      tenorDays: Number(tenorDays) || 45,
      dueDate
    });

    res.status(201).json({
      success: true,
      message: `Invoice ${invoice.invoiceNumber} submitted to InvoiceX factoring escrow`,
      data: invoice
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/invoices/fund - Fund / discount an active invoice
router.post('/fund', (req: Request, res: Response) => {
  try {
    const { invoiceId, amountUSD, investorAddress } = req.body;
    if (!invoiceId || !amountUSD || amountUSD <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: invoiceId, amountUSD'
      });
    }

    const result = store.fundInvoice(invoiceId, Number(amountUSD), investorAddress);
    res.json({
      success: true,
      message: `Successfully funded $${amountUSD} into invoice ${result.invoice.invoiceNumber}`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
