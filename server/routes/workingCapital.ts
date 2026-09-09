import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { store } from '../store';

const router = Router();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

export interface LoanRFQ {
  rfqId: number;
  borrower: string;
  requestedAmountUSD: number;
  durationDays: number;
  businessPurpose: string;
  isOpen: boolean;
  winningBidId: number | null;
  createdAt: string;
}

export interface RFQBid {
  bidId: number;
  rfqId: number;
  lenderVenue: string;
  venueName: string;
  proposedInterestBps: number;
  maxAmountUSD: number;
  isAccepted: boolean;
  estApprovalTime: string;
}

export interface RevolvingFacilityState {
  borrower: string;
  creditLimitUSD: number;
  drawnAmountUSD: number;
  interestRateBps: number;
  creditScore: number;
  lastDrawTimestamp: number;
  isActive: boolean;
  underwritingSummary?: string;
  riskCategory?: 'LOW' | 'MEDIUM' | 'HIGH';
}

let rfqCounter = 1;
let bidCounter = 100;

const activeRfqs: LoanRFQ[] = [
  {
    rfqId: 1,
    borrower: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    requestedAmountUSD: 50000,
    durationDays: 60,
    businessPurpose: 'Q3 Inventory Expansion & Supplier Advance',
    isOpen: true,
    winningBidId: null,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

const activeBids: Record<number, RFQBid[]> = {
  1: [
    {
      bidId: 101,
      rfqId: 1,
      lenderVenue: '0x8888888888888888888888888888888888888888',
      venueName: 'InvoiceX Vault Pool',
      proposedInterestBps: 650,
      maxAmountUSD: 50000,
      isAccepted: false,
      estApprovalTime: 'Instant (Automated)'
    },
    {
      bidId: 102,
      rfqId: 1,
      lenderVenue: '0x7777777777777777777777777777777777777777',
      venueName: 'ZSE Institutional Credit Fund',
      proposedInterestBps: 580,
      maxAmountUSD: 75000,
      isAccepted: false,
      estApprovalTime: 'Same Day'
    },
    {
      bidId: 103,
      rfqId: 1,
      lenderVenue: '0x9999999999999999999999999999999999999999',
      venueName: 'P2P Yield Syndicate',
      proposedInterestBps: 720,
      maxAmountUSD: 50000,
      isAccepted: false,
      estApprovalTime: '10 Mins'
    }
  ]
};

const revolvingFacilities: Record<string, RevolvingFacilityState> = {
  '0x71c7656ec7ab88b098defb751b7401b5f6d8976f': {
    borrower: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    creditLimitUSD: 75000,
    drawnAmountUSD: 15000,
    interestRateBps: 620,
    creditScore: 765,
    lastDrawTimestamp: Date.now() - 86400000 * 3,
    isActive: true,
    underwritingSummary: 'Strong cash flow stability with low debt-to-revenue ratio.',
    riskCategory: 'LOW'
  }
};

/**
 * POST /api/working-capital/underwrite
 */
router.post('/underwrite', async (req: Request, res: Response) => {
  try {
    const { address, financialReportText, annualRevenue, cashFlowMonthly } = req.body;
    const userAddr = (address || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F').toLowerCase();

    const genAI = getGenAI();
    let creditScore = 740;
    let approvedLimitUSD = 50000;
    let interestRateBps = 650;
    let riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let summary = 'Approved based on financial metrics provided.';

    if (genAI && financialReportText) {
      try {
        const response = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are an AI Underwriter for an on-chain business working capital vault. Analyze the following corporate financial data and extract key credit metrics.
          
Financial Data:
${financialReportText}
Annual Revenue: ${annualRevenue || 'N/A'}
Monthly Cash Flow: ${cashFlowMonthly || 'N/A'}

Respond strictly in valid JSON format:
{
  "creditScore": number (300 to 850),
  "approvedLimitUSD": number,
  "interestRateBps": number (basis points, e.g. 550 for 5.5%),
  "riskCategory": "LOW" | "MEDIUM" | "HIGH",
  "underwritingSummary": "string explanation (2-3 sentences)"
}`
        });

        const textResult = response.text || '';
        const jsonMatch = textResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          creditScore = parsed.creditScore || creditScore;
          approvedLimitUSD = parsed.approvedLimitUSD || approvedLimitUSD;
          interestRateBps = parsed.interestRateBps || interestRateBps;
          riskCategory = parsed.riskCategory || riskCategory;
          summary = parsed.underwritingSummary || summary;
        }
      } catch (err) {
        console.error('Gemini Underwriting Error, falling back to heuristic:', err);
      }
    } else {
      const rev = Number(annualRevenue) || 250000;
      approvedLimitUSD = Math.round(rev * 0.25);
      if (rev > 500000) {
        creditScore = 780;
        interestRateBps = 540;
        riskCategory = 'LOW';
        summary = 'High revenue liquidity profile. Prime tier revolving credit unlocked.';
      } else {
        creditScore = 710;
        interestRateBps = 720;
        riskCategory = 'MEDIUM';
        summary = 'Moderate working capital buffer. Standard revolving facility approved.';
      }
    }

    const currentFacility = revolvingFacilities[userAddr] || {
      borrower: userAddr,
      creditLimitUSD: approvedLimitUSD,
      drawnAmountUSD: 0,
      interestRateBps: interestRateBps,
      creditScore: creditScore,
      lastDrawTimestamp: Date.now(),
      isActive: true,
      underwritingSummary: summary,
      riskCategory: riskCategory
    };

    currentFacility.creditLimitUSD = approvedLimitUSD;
    currentFacility.creditScore = creditScore;
    currentFacility.interestRateBps = interestRateBps;
    currentFacility.underwritingSummary = summary;
    currentFacility.riskCategory = riskCategory;
    currentFacility.isActive = true;

    revolvingFacilities[userAddr] = currentFacility;

    res.json({
      success: true,
      facility: currentFacility
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/working-capital/facility
 */
router.get('/facility', (req: Request, res: Response) => {
  const address = (req.query.address as string || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F').toLowerCase();
  const facility = revolvingFacilities[address] || {
    borrower: address,
    creditLimitUSD: 50000,
    drawnAmountUSD: 0,
    interestRateBps: 680,
    creditScore: 720,
    lastDrawTimestamp: Date.now(),
    isActive: true,
    underwritingSummary: 'Baseline revolving line approved. Upload filings for limit expansion.',
    riskCategory: 'MEDIUM'
  };

  res.json({ success: true, facility });
});

/**
 * POST /api/working-capital/draw
 */
router.post('/draw', (req: Request, res: Response) => {
  try {
    const { address, amountUSD } = req.body;
    const userAddr = (address || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F').toLowerCase();
    const facility = revolvingFacilities[userAddr];

    if (!facility) {
      return res.status(400).json({ success: false, error: 'No active credit facility' });
    }

    const drawVal = Number(amountUSD);
    if (isNaN(drawVal) || drawVal <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid draw amount' });
    }

    if (facility.drawnAmountUSD + drawVal > facility.creditLimitUSD) {
      return res.status(400).json({ success: false, error: 'Amount exceeds available revolving credit limit' });
    }

    facility.drawnAmountUSD += drawVal;
    facility.lastDrawTimestamp = Date.now();

    res.json({ success: true, facility, drawnAmountUSD: facility.drawnAmountUSD });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/working-capital/repay
 */
router.post('/repay', (req: Request, res: Response) => {
  try {
    const { address, amountUSD } = req.body;
    const userAddr = (address || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F').toLowerCase();
    const facility = revolvingFacilities[userAddr];

    if (!facility || facility.drawnAmountUSD <= 0) {
      return res.status(400).json({ success: false, error: 'No drawn credit balance to repay' });
    }

    const payVal = Number(amountUSD);
    const actualRepay = Math.min(payVal, facility.drawnAmountUSD);
    facility.drawnAmountUSD -= actualRepay;

    res.json({ success: true, facility, repaidAmountUSD: actualRepay });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/working-capital/rfq/list
 */
router.get('/rfq/list', (req: Request, res: Response) => {
  res.json({
    success: true,
    rfqs: activeRfqs,
    bids: activeBids
  });
});

/**
 * POST /api/working-capital/rfq/create
 */
router.post('/rfq/create', (req: Request, res: Response) => {
  try {
    const { address, amountUSD, durationDays, businessPurpose } = req.body;
    const userAddr = address || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

    rfqCounter++;
    const newRfq: LoanRFQ = {
      rfqId: rfqCounter,
      borrower: userAddr,
      requestedAmountUSD: Number(amountUSD) || 25000,
      durationDays: Number(durationDays) || 30,
      businessPurpose: businessPurpose || 'General Working Capital',
      isOpen: true,
      winningBidId: null,
      createdAt: new Date().toISOString()
    };

    activeRfqs.unshift(newRfq);

    bidCounter++;
    const bid1: RFQBid = {
      bidId: bidCounter,
      rfqId: newRfq.rfqId,
      lenderVenue: '0x8888888888888888888888888888888888888888',
      venueName: 'InvoiceX Liquidity Pool',
      proposedInterestBps: Math.floor(520 + Math.random() * 150),
      maxAmountUSD: newRfq.requestedAmountUSD,
      isAccepted: false,
      estApprovalTime: 'Instant'
    };

    bidCounter++;
    const bid2: RFQBid = {
      bidId: bidCounter,
      rfqId: newRfq.rfqId,
      lenderVenue: '0x7777777777777777777777777777777777777777',
      venueName: 'ZSE Institutional Vault',
      proposedInterestBps: Math.floor(480 + Math.random() * 120),
      maxAmountUSD: newRfq.requestedAmountUSD * 1.25,
      isAccepted: false,
      estApprovalTime: 'Same Day'
    };

    activeBids[newRfq.rfqId] = [bid1, bid2];

    res.json({ success: true, rfq: newRfq, bids: activeBids[newRfq.rfqId] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/working-capital/rfq/accept
 */
router.post('/rfq/accept', (req: Request, res: Response) => {
  try {
    const { rfqId, bidId, address } = req.body;
    const userAddr = (address || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F').toLowerCase();

    const rfq = activeRfqs.find(r => r.rfqId === Number(rfqId));
    if (!rfq) {
      return res.status(400).json({ success: false, error: 'RFQ not found' });
    }

    const bidsList = activeBids[rfq.rfqId] || [];
    const winningBid = bidsList.find(b => b.bidId === Number(bidId));
    if (!winningBid) {
      return res.status(400).json({ success: false, error: 'Bid not found' });
    }

    rfq.isOpen = false;
    rfq.winningBidId = winningBid.bidId;
    winningBid.isAccepted = true;

    const facility = revolvingFacilities[userAddr] || {
      borrower: userAddr,
      creditLimitUSD: rfq.requestedAmountUSD,
      drawnAmountUSD: 0,
      interestRateBps: winningBid.proposedInterestBps,
      creditScore: 750,
      lastDrawTimestamp: Date.now(),
      isActive: true,
      underwritingSummary: `Facility updated via winning bid from ${winningBid.venueName}`,
      riskCategory: 'LOW'
    };

    facility.creditLimitUSD = Math.max(facility.creditLimitUSD, rfq.requestedAmountUSD);
    facility.interestRateBps = winningBid.proposedInterestBps;
    revolvingFacilities[userAddr] = facility;

    res.json({
      success: true,
      rfq,
      winningBid,
      facility
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
