import { Router, Request, Response } from 'express';
import { store } from '../store';

const router = Router();

// GET /api/loans - List active SBLOC credit lines
router.get('/', (req: Request, res: Response) => {
  try {
    const loans = store.getLoans();
    res.json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/loans/borrow - Borrow working capital against stock collateral
router.post('/borrow', (req: Request, res: Response) => {
  try {
    const { borrowerName, collateralType, collateralValueUSD, loanAmountUSD, interestRate, durationMonths } = req.body;

    if (!borrowerName || !collateralType || !collateralValueUSD || !loanAmountUSD) {
      return res.status(400).json({
        success: false,
        error: 'Missing required loan parameters'
      });
    }

    const loan = store.createLoan({
      borrowerName,
      collateralType,
      collateralValueUSD: Number(collateralValueUSD),
      loanAmountUSD: Number(loanAmountUSD),
      interestRate: Number(interestRate) || 12.5,
      durationMonths: Number(durationMonths) || 12
    });

    res.status(201).json({
      success: true,
      message: `Disbursed $${loan.loanAmountUSD.toLocaleString()} USD credit line against ${loan.collateralType}`,
      data: loan
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
