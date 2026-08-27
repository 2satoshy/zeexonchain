import { Router, Request, Response } from 'express';
import { store } from '../store';

const router = Router();

// GET /api/stocks - List all stocks with optional search, sector filter, sorting
router.get('/', (req: Request, res: Response) => {
  try {
    const { search, sector, sortBy, sortOrder } = req.query;
    const stocks = store.getStocks({
      search: search as string,
      sector: sector as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });
    res.json({
      success: true,
      count: stocks.length,
      data: stocks
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/stocks/:id - Get stock by ID or ticker
router.get('/:id', (req: Request, res: Response) => {
  try {
    const stock = store.getStockById(req.params.id);
    if (!stock) {
      return res.status(404).json({ success: false, error: 'Stock not found' });
    }
    res.json({
      success: true,
      data: stock
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/stocks/buy - Purchase fractional shares
router.post('/buy', (req: Request, res: Response) => {
  try {
    const { stockId, usdAmount, units, walletAddress } = req.body;
    if (!stockId || !usdAmount || usdAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Missing required parameters: stockId and valid usdAmount' });
    }

    const calcUnits = units || (usdAmount / (store.getStockById(stockId)?.priceUSD || 1));
    const result = store.buyShares(stockId, Number(usdAmount), Number(calcUnits), walletAddress);

    res.status(200).json({
      success: true,
      message: `Successfully purchased ${result.unitsPurchased.toLocaleString(undefined, { maximumFractionDigits: 3 })} shares of ${result.stock.ticker} on Base L2`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/stocks/tokenize - Submit and mint new stock tokenization
router.post('/tokenize', (req: Request, res: Response) => {
  try {
    const {
      name,
      ticker,
      sector,
      description,
      valuationUSD,
      priceUSD,
      totalShares,
      dividendYield,
      riskRating,
      image,
      seczimFilingId
    } = req.body;

    if (!name || !ticker || !priceUSD || !totalShares) {
      return res.status(400).json({
        success: false,
        error: 'Required fields missing: name, ticker, priceUSD, totalShares'
      });
    }

    const result = store.tokenizeStock({
      name,
      ticker,
      sector: sector || 'General SME',
      description: description || 'Tokenized SECZim regulated equity asset on Base L2.',
      valuationUSD: Number(valuationUSD) || (Number(priceUSD) * Number(totalShares)),
      priceUSD: Number(priceUSD),
      totalShares: Number(totalShares),
      dividendYield: Number(dividendYield) || 8.0,
      riskRating: riskRating || 'Growth',
      image,
      seczimFilingId
    });

    res.status(201).json({
      success: true,
      message: `Successfully tokenized ${result.stock.ticker} on Base Sepolia. Smart Contract: ${result.stock.tokenAddress}`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/stocks/burn - Delist or burn shares for capital reduction
router.post('/burn', (req: Request, res: Response) => {
  try {
    const { stockId, burnedShares, reason, seczimFilingId, payoutPerShareUSD } = req.body;

    if (!stockId || !burnedShares || burnedShares <= 0) {
      return res.status(400).json({ success: false, error: 'Missing stockId or burnedShares count' });
    }

    const result = store.burnStock({
      stockId,
      burnedShares: Number(burnedShares),
      reason: reason || 'SECZim Approved Capital Reduction',
      seczimFilingId,
      payoutPerShareUSD: payoutPerShareUSD ? Number(payoutPerShareUSD) : undefined
    });

    res.status(200).json({
      success: true,
      message: `Successfully burned ${result.burnedShares.toLocaleString()} shares of ${result.stock.ticker} to 0x0`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
