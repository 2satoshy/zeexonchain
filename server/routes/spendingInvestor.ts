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

export interface SpendingItemMatch {
  merchantName: string;
  category: string;
  spentAmountUSD: number;
  mappedTicker: string;
  mappedCompanyName: string;
  suggestedAllocationUSD: number;
  aiRationale: string;
  upsideScore: number; // 1 - 100
}

export interface UserAutoPilotSubscription {
  address: string;
  isActive: boolean;
  planType: 'ONE_TIME' | 'MONTHLY_AUTOPILOT';
  feePaidUSD: number;
  startedAt: string;
  expiresAt?: string;
  autoRebalanceEnabled: boolean;
  totalRoundupsInvestedUSD: number;
}

// In-memory subscriptions store
const activeSubscriptions: Record<string, UserAutoPilotSubscription> = {
  '0x71c7656ec7ab88b098defb751b7401b5f6d8976f': {
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    isActive: true,
    planType: 'MONTHLY_AUTOPILOT',
    feePaidUSD: 4.99,
    startedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 20).toISOString(),
    autoRebalanceEnabled: true,
    totalRoundupsInvestedUSD: 142.50
  }
};

/**
 * POST /api/spending-investor/scan
 * Scans receipts, invoices, or bank statement text using Gemini AI
 */
router.post('/scan', async (req: Request, res: Response) => {
  try {
    const { statementText, address } = req.body;

    if (!statementText || statementText.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Statement or receipt text required' });
    }

    const genAI = getGenAI();
    let matches: SpendingItemMatch[] = [];
    let summaryText = 'Analyzed recurring spending patterns.';

    if (genAI) {
      try {
        const response = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are an AI Spending-to-Stock Auto-Investor Engine for ZEEX.
Analyze the following bank statement / subscription invoice text.
Extract recurring merchants (e.g. Spotify, Netflix, AWS, Nvidia, Meta, EcoCash, Nyanga Tea, Takura Agro, Simba Solar) and map each to a relevant stock ticker on ZEEX or global markets.

Statement Data:
${statementText}

Respond strictly in valid JSON format:
{
  "summary": "Brief 1-2 sentence summary of spending behavior",
  "matches": [
    {
      "merchantName": "string",
      "category": "string",
      "spentAmountUSD": number,
      "mappedTicker": "string (e.g. SPOT, NFLX, NVDA, TEA.zx, TKRA.zx, NYNG.zx)",
      "mappedCompanyName": "string",
      "suggestedAllocationUSD": number,
      "aiRationale": "1 sentence explanation why buying this stock links to their spending and upside potential",
      "upsideScore": number (1-100)
    }
  ]
}`
        });

        const textResult = response.text || '';
        const jsonMatch = textResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          matches = parsed.matches || [];
          summaryText = parsed.summary || summaryText;
        }
      } catch (err) {
        console.error('Gemini Spending Parser Error, falling back to heuristic:', err);
      }
    }

    // Heuristic fallback if AI API unavailable or produced empty matches
    if (matches.length === 0) {
      const lower = statementText.toLowerCase();
      
      if (lower.includes('spotify') || lower.includes('music')) {
        matches.push({
          merchantName: 'Spotify Subscription',
          category: 'Digital Media',
          spentAmountUSD: 11.99,
          mappedTicker: 'SPOT',
          mappedCompanyName: 'Spotify Technology S.A.',
          suggestedAllocationUSD: 5.00,
          aiRationale: 'Recurring monthly audio subscription. Convert everyday usage into equity ownership.',
          upsideScore: 82
        });
      }
      if (lower.includes('netflix') || lower.includes('streaming')) {
        matches.push({
          merchantName: 'Netflix Premium',
          category: 'Entertainment',
          spentAmountUSD: 19.99,
          mappedTicker: 'NFLX',
          mappedCompanyName: 'Netflix Inc.',
          suggestedAllocationUSD: 10.00,
          aiRationale: 'Consistent consumer engagement and subscription cashflow growth.',
          upsideScore: 85
        });
      }
      if (lower.includes('nvidia') || lower.includes('gpu') || lower.includes('aws') || lower.includes('cloud')) {
        matches.push({
          merchantName: 'NVIDIA Cloud Compute / GPU',
          category: 'AI Infrastructure',
          spentAmountUSD: 120.00,
          mappedTicker: 'NVDA',
          mappedCompanyName: 'NVIDIA Corporation',
          suggestedAllocationUSD: 35.00,
          aiRationale: 'AI compute stack hardware usage. High upside momentum in AI chip demand.',
          upsideScore: 94
        });
      }
      if (lower.includes('agro') || lower.includes('fertilizer') || lower.includes('seeds')) {
        matches.push({
          merchantName: 'Takura Agricultural Supplies',
          category: 'Agribusiness',
          spentAmountUSD: 250.00,
          mappedTicker: 'TKRA.zx',
          mappedCompanyName: 'Takura Agro Commodities',
          suggestedAllocationUSD: 50.00,
          aiRationale: 'Top spending in local agribusiness. Earn dividend yields on agricultural harvest sales.',
          upsideScore: 88
        });
      }
      if (lower.includes('solar') || lower.includes('power') || lower.includes('electricity')) {
        matches.push({
          merchantName: 'Simba Micro-Grid Power',
          category: 'Clean Energy',
          spentAmountUSD: 85.00,
          mappedTicker: 'SIMBA.zx',
          mappedCompanyName: 'Simba Solar Micro-Grids',
          suggestedAllocationUSD: 20.00,
          aiRationale: 'Essential power utility spending. Capture infrastructure expansion yield.',
          upsideScore: 90
        });
      }

      if (matches.length === 0) {
        // General default basket
        matches = [
          {
            merchantName: 'Nyanga Specialty Tea Purchase',
            category: 'Retail & Grocery',
            spentAmountUSD: 45.00,
            mappedTicker: 'TEA.zx',
            mappedCompanyName: 'Nyanga Specialty Tea Ltd',
            suggestedAllocationUSD: 15.00,
            aiRationale: 'Frequent retail purchases mapped to high-export tea commodity growth.',
            upsideScore: 84
          },
          {
            merchantName: 'Bamba Cold Chain Freight',
            category: 'Logistics',
            spentAmountUSD: 110.00,
            mappedTicker: 'BAMBA.zx',
            mappedCompanyName: 'Bamba Logistics',
            suggestedAllocationUSD: 25.00,
            aiRationale: 'Logistics and transport spending converted into cold-chain equity.',
            upsideScore: 86
          }
        ];
      }
    }

    const totalRecommendedUSD = matches.reduce((sum, m) => sum + m.suggestedAllocationUSD, 0);

    res.json({
      success: true,
      summary: summaryText,
      totalRecommendedUSD,
      matches
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/spending-investor/execute-oneoff
 * Executes a one-time spending basket purchase with $1.99 fee
 */
router.post('/execute-oneoff', (req: Request, res: Response) => {
  try {
    const { address, matches } = req.body;
    const userAddr = (address || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F').toLowerCase();

    const items: SpendingItemMatch[] = matches || [];
    const totalInvestedUSD = items.reduce((sum, item) => sum + Number(item.suggestedAllocationUSD || 0), 0);
    const executionFeeUSD = 1.99;
    const grandTotalUSD = totalInvestedUSD + executionFeeUSD;

    const txHash = `0xsp_${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;

    res.json({
      success: true,
      userAddr,
      totalInvestedUSD,
      executionFeeUSD,
      grandTotalUSD,
      txHash,
      purchasedItemsCount: items.length,
      timestamp: new Date().toISOString(),
      message: `Successfully executed One-Time Spending Auto-Investment of $${totalInvestedUSD.toFixed(2)} (+ $1.99 fee) across ${items.length} stocks!`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/spending-investor/subscribe
 * Activates or toggles Auto-Pilot Monthly Subscription ($4.99/mo)
 */
router.post('/subscribe', (req: Request, res: Response) => {
  try {
    const { address, autoRebalanceEnabled } = req.body;
    const userAddr = (address || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F').toLowerCase();

    const sub: UserAutoPilotSubscription = {
      address: userAddr,
      isActive: true,
      planType: 'MONTHLY_AUTOPILOT',
      feePaidUSD: 4.99,
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
      autoRebalanceEnabled: autoRebalanceEnabled !== undefined ? Boolean(autoRebalanceEnabled) : true,
      totalRoundupsInvestedUSD: (activeSubscriptions[userAddr]?.totalRoundupsInvestedUSD || 0) + 15.00
    };

    activeSubscriptions[userAddr] = sub;

    res.json({
      success: true,
      subscription: sub,
      message: 'Autonomous Auto-Pilot Subscription Active! AI will automatically round-up everyday purchases into equity & rebalance monthly.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/spending-investor/subscription
 */
router.get('/subscription', (req: Request, res: Response) => {
  const address = (req.query.address as string || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F').toLowerCase();
  const sub = activeSubscriptions[address] || {
    address,
    isActive: false,
    planType: 'ONE_TIME',
    feePaidUSD: 0,
    startedAt: '',
    autoRebalanceEnabled: false,
    totalRoundupsInvestedUSD: 0
  };

  res.json({ success: true, subscription: sub });
});

export default router;
