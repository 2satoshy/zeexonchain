import { SMEStock, InvoiceItem, DebtBridgeLoan, Transaction, TokenAsset, SocialPost, TradeOrder, StartupListingApplication } from '../src/types';
import { INITIAL_STOCKS, INITIAL_INVOICES, INITIAL_LOANS, INITIAL_TRANSACTIONS, INITIAL_SOCIAL_POSTS, generateStockPriceHistory } from '../src/data/mockData';
import { INITIAL_TOKENS } from '../src/data/tokenData';
import { getMongoCollection, getDatabase } from './db/mongodb';

export interface UserPortfolio {
  usdBalance: number;
  zigBalance: number;
  totalNetWorthUSD: number;
  unclaimedDividendsUSD: number;
  holdings: Array<{
    stockId: string;
    ticker: string;
    name: string;
    units: number;
    avgPriceUSD: number;
    currentValueUSD: number;
    pnlUSD: number;
    pnlPercent: number;
  }>;
}

export interface OracleRates {
  zigUsd: number;
  usdZig: number;
  goldOunceUSD: number;
  ethUSD: number;
  usdcUSD: number;
  lastUpdated: string;
}

export interface BasePaymentRecord {
  id: string;
  amountUSD: number;
  recipient: string;
  payerAddress?: string;
  purpose: string;
  status: 'INITIATED' | 'BROADCASTED' | 'CONFIRMED' | 'COMPLETED' | 'FAILED';
  testnet: boolean;
  txHash?: string;
  createdAt: string;
  updatedAt: string;
}

class AppStore {
  private stocks: SMEStock[] = JSON.parse(JSON.stringify(INITIAL_STOCKS));
  private tokens: TokenAsset[] = JSON.parse(JSON.stringify(INITIAL_TOKENS));
  private invoices: InvoiceItem[] = JSON.parse(JSON.stringify(INITIAL_INVOICES));
  private loans: DebtBridgeLoan[] = JSON.parse(JSON.stringify(INITIAL_LOANS));
  private transactions: Transaction[] = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
  private socialPosts: SocialPost[] = JSON.parse(JSON.stringify(INITIAL_SOCIAL_POSTS));
  private tradeOrders: TradeOrder[] = [
    {
      id: 'ord-1',
      pair: 'ZIG/USDC',
      side: 'BUY',
      type: 'LIMIT',
      price: 0.038,
      amount: 10000,
      totalUSD: 380,
      status: 'OPEN',
      timestamp: '10 mins ago',
      txHash: '0x3a9f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a'
    },
    {
      id: 'ord-2',
      pair: 'TKRA/USD',
      side: 'BUY',
      type: 'LIMIT',
      price: 1.20,
      amount: 250,
      totalUSD: 300,
      status: 'OPEN',
      timestamp: '1 hour ago',
      txHash: '0x8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e'
    }
  ];
  private basePayments: BasePaymentRecord[] = [];
  private startupApplications: StartupListingApplication[] = [];

  private userPortfolio: UserPortfolio = {
    usdBalance: 1420.50,
    zigBalance: 36933.00,
    totalNetWorthUSD: 4260.50,
    unclaimedDividendsUSD: 42.50,
    holdings: [
      {
        stockId: 'sme-1',
        ticker: 'TKRA.zx',
        name: 'Takura Agro Commodities',
        units: 245.5,
        avgPriceUSD: 1.20,
        currentValueUSD: 314.24,
        pnlUSD: 19.64,
        pnlPercent: 6.67
      },
      {
        stockId: 'sme-2',
        ticker: 'NYNG.zx',
        name: 'Nyanga Solar Grid Corp',
        units: 180.0,
        avgPriceUSD: 0.82,
        currentValueUSD: 153.00,
        pnlUSD: 5.40,
        pnlPercent: 3.66
      }
    ]
  };

  private oracleRates: OracleRates = {
    zigUsd: 0.03846, // 1 USD = 26 ZIG
    usdZig: 26.00,
    goldOunceUSD: 2942.50,
    ethUSD: 3120.40,
    usdcUSD: 1.00,
    lastUpdated: new Date().toISOString()
  };

  private isMongoSynced = false;

  constructor() {
    // Attempt non-blocking synchronization with MongoDB
    this.syncWithMongoDB().catch(err => {
      console.log('[Store] Initial MongoDB sync deferred:', err.message);
    });
  }

  // --- MongoDB Synchronization Layer ---
  public async syncWithMongoDB(): Promise<void> {
    try {
      const db = await getDatabase();
      if (!db) return;

      console.log('[Store] Synchronizing in-memory cache with MongoDB collections...');

      // 1. Stocks collection
      const stocksCol = db.collection('stocks');
      const stockCount = await stocksCol.countDocuments();
      if (stockCount === 0) {
        await stocksCol.insertMany(JSON.parse(JSON.stringify(this.stocks)));
        console.log(`[Store] Seeded ${this.stocks.length} SME stocks to MongoDB.`);
      } else {
        const mongoStocks = await stocksCol.find().toArray();
        this.stocks = mongoStocks.map(({ _id, ...rest }) => rest as unknown as SMEStock);
      }

      // 2. Tokens collection
      const tokensCol = db.collection('tokens');
      const tokenCount = await tokensCol.countDocuments();
      if (tokenCount === 0) {
        await tokensCol.insertMany(JSON.parse(JSON.stringify(this.tokens)));
        console.log(`[Store] Seeded ${this.tokens.length} tokens to MongoDB.`);
      } else {
        const mongoTokens = await tokensCol.find().toArray();
        this.tokens = mongoTokens.map(({ _id, ...rest }) => rest as unknown as TokenAsset);
      }

      // 3. Invoices collection
      const invoicesCol = db.collection('invoices');
      const invoiceCount = await invoicesCol.countDocuments();
      if (invoiceCount === 0) {
        await invoicesCol.insertMany(JSON.parse(JSON.stringify(this.invoices)));
        console.log(`[Store] Seeded ${this.invoices.length} invoices to MongoDB.`);
      } else {
        const mongoInvoices = await invoicesCol.find().toArray();
        this.invoices = mongoInvoices.map(({ _id, ...rest }) => rest as unknown as InvoiceItem);
      }

      // 4. Loans collection
      const loansCol = db.collection('loans');
      const loanCount = await loansCol.countDocuments();
      if (loanCount === 0) {
        await loansCol.insertMany(JSON.parse(JSON.stringify(this.loans)));
        console.log(`[Store] Seeded ${this.loans.length} DebtBridge loans to MongoDB.`);
      } else {
        const mongoLoans = await loansCol.find().toArray();
        this.loans = mongoLoans.map(({ _id, ...rest }) => rest as unknown as DebtBridgeLoan);
      }

      // 5. Transactions collection
      const txsCol = db.collection('transactions');
      const txCount = await txsCol.countDocuments();
      if (txCount === 0) {
        await txsCol.insertMany(JSON.parse(JSON.stringify(this.transactions)));
        console.log(`[Store] Seeded ${this.transactions.length} transactions to MongoDB.`);
      } else {
        const mongoTxs = await txsCol.find().sort({ $natural: -1 }).limit(100).toArray();
        this.transactions = mongoTxs.map(({ _id, ...rest }) => rest as unknown as Transaction);
      }

      // 6. Social Posts
      const socialCol = db.collection('social_posts');
      const postCount = await socialCol.countDocuments();
      if (postCount === 0) {
        await socialCol.insertMany(JSON.parse(JSON.stringify(this.socialPosts)));
        console.log(`[Store] Seeded ${this.socialPosts.length} social posts to MongoDB.`);
      } else {
        const mongoPosts = await socialCol.find().toArray();
        this.socialPosts = mongoPosts.map(({ _id, ...rest }) => rest as unknown as SocialPost);
      }

      // 7. Trade Orders
      const ordersCol = db.collection('trade_orders');
      const orderCount = await ordersCol.countDocuments();
      if (orderCount === 0) {
        await ordersCol.insertMany(JSON.parse(JSON.stringify(this.tradeOrders)));
      } else {
        const mongoOrders = await ordersCol.find().toArray();
        this.tradeOrders = mongoOrders.map(({ _id, ...rest }) => rest as unknown as TradeOrder);
      }

      // 8. User Portfolio
      const portfolioCol = db.collection('user_portfolio');
      const portfolioDoc = await portfolioCol.findOne({ id: 'primary_portfolio' });
      if (!portfolioDoc) {
        await portfolioCol.insertOne({ id: 'primary_portfolio', ...JSON.parse(JSON.stringify(this.userPortfolio)) });
      } else {
        const { _id, id, ...rest } = portfolioDoc as any;
        this.userPortfolio = rest as UserPortfolio;
      }

      // 9. Base Payments
      const basePayCol = db.collection('base_payments');
      const payCount = await basePayCol.countDocuments();
      if (payCount > 0) {
        const mongoPayments = await basePayCol.find().sort({ createdAt: -1 }).limit(100).toArray();
        this.basePayments = mongoPayments.map(({ _id, ...rest }) => rest as unknown as BasePaymentRecord);
      }

      this.isMongoSynced = true;
      console.log('[Store] MongoDB bidirectional sync complete. All collections loaded.');
    } catch (err: any) {
      console.warn('[Store] MongoDB synchronization warning:', err.message);
    }
  }

  // --- Helper to fire-and-forget persist changes to MongoDB ---
  private async persistMongoDoc(collectionName: string, query: object, doc: object, upsert = true) {
    try {
      const col = await getMongoCollection(collectionName);
      if (col) {
        await col.updateOne(query, { $set: doc }, { upsert });
      }
    } catch (err: any) {
      // Non-blocking log
      console.warn(`[Store] Failed to persist to MongoDB ${collectionName}:`, err.message);
    }
  }

  private async insertMongoDoc(collectionName: string, doc: object) {
    try {
      const col = await getMongoCollection(collectionName);
      if (col) {
        await col.insertOne(JSON.parse(JSON.stringify(doc)));
      }
    } catch (err: any) {
      console.warn(`[Store] Failed to insert to MongoDB ${collectionName}:`, err.message);
    }
  }

  // --- Stocks API Methods ---
  public getStocks(filter?: { search?: string; sector?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }): SMEStock[] {
    let result = [...this.stocks];

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q) || s.ticker.toLowerCase().includes(q));
    }

    if (filter?.sector && filter.sector !== 'All') {
      result = result.filter(s => s.sector === filter.sector);
    }

    if (filter?.sortBy) {
      const order = filter.sortOrder === 'desc' ? -1 : 1;
      result.sort((a: any, b: any) => {
        if (a[filter.sortBy!] < b[filter.sortBy!]) return -1 * order;
        if (a[filter.sortBy!] > b[filter.sortBy!]) return 1 * order;
        return 0;
      });
    }

    return result;
  }

  public getStockById(id: string): SMEStock | undefined {
    return this.stocks.find(s => s.id === id || s.ticker.toLowerCase() === id.toLowerCase());
  }

  public buyShares(stockId: string, usdAmount: number, units: number, walletAddress?: string) {
    const stock = this.getStockById(stockId);
    if (!stock) throw new Error('Stock not found');
    if (usdAmount <= 0) throw new Error('Invalid purchase amount');

    // Deduct available fractional units
    stock.fractionalUnitsAvailable = Math.max(0, stock.fractionalUnitsAvailable - units);
    stock.txns24h = (stock.txns24h || 120) + 1;
    stock.tradersCount = (stock.tradersCount || 400) + 1;

    // Update user portfolio
    const existingHolding = this.userPortfolio.holdings.find(h => h.stockId === stock.id);
    if (existingHolding) {
      const totalUnits = existingHolding.units + units;
      const totalCost = (existingHolding.units * existingHolding.avgPriceUSD) + usdAmount;
      existingHolding.units = totalUnits;
      existingHolding.avgPriceUSD = totalCost / totalUnits;
      existingHolding.currentValueUSD = totalUnits * stock.priceUSD;
      existingHolding.pnlUSD = existingHolding.currentValueUSD - totalCost;
      existingHolding.pnlPercent = (existingHolding.pnlUSD / totalCost) * 100;
    } else {
      this.userPortfolio.holdings.push({
        stockId: stock.id,
        ticker: stock.ticker,
        name: stock.name,
        units: units,
        avgPriceUSD: stock.priceUSD,
        currentValueUSD: usdAmount,
        pnlUSD: 0,
        pnlPercent: 0
      });
    }

    // Add onchain transaction
    const txHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'TRADE',
      title: `Bought ${units.toLocaleString(undefined, { maximumFractionDigits: 3 })} ${stock.ticker} Fractional Shares`,
      amountUSD: usdAmount,
      amountZIG: usdAmount * this.oracleRates.usdZig,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `BASE-STK-${Math.floor(100000 + Math.random() * 900000)}`,
      blockNumber: 18492000 + Math.floor(Math.random() * 5000),
      txHash,
      gasSponsored: true,
      sender: walletAddress || '0x71C...4b92',
      receiver: '0xStanbicNomineesEscrow'
    };

    this.transactions.unshift(tx);

    // Persist to MongoDB
    this.persistMongoDoc('stocks', { id: stock.id }, stock);
    this.persistMongoDoc('user_portfolio', { id: 'primary_portfolio' }, this.userPortfolio);
    this.insertMongoDoc('transactions', tx);

    return {
      success: true,
      stock,
      unitsPurchased: units,
      usdAmount,
      transaction: tx
    };
  }

  public tokenizeStock(params: {
    name: string;
    ticker: string;
    sector: string;
    description: string;
    valuationUSD: number;
    priceUSD: number;
    totalShares: number;
    dividendYield?: number;
    riskRating?: 'Low' | 'Medium' | 'Growth';
    image?: string;
    seczimFilingId?: string;
  }): { stock: SMEStock; transaction: Transaction } {
    const newStockId = `sme-${Date.now()}`;
    const newStock: SMEStock = {
      id: newStockId,
      name: params.name,
      ticker: params.ticker.endsWith('.zx') ? params.ticker : `${params.ticker}.zx`,
      sector: params.sector,
      priceUSD: params.priceUSD,
      priceZIG: params.priceUSD * this.oracleRates.usdZig,
      change24h: 0.0,
      change1h: 0.0,
      marketCap: `$${((params.valuationUSD || params.totalShares * params.priceUSD) / 1000000).toFixed(1)}M`,
      dividendYield: params.dividendYield || 8.5,
      fractionalUnitsAvailable: params.totalShares,
      backingTrust: `ZSE Trust Attestation #${params.seczimFilingId || Math.floor(100 + Math.random() * 900)}`,
      description: params.description,
      riskRating: params.riskRating || 'Growth',
      image: params.image || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      verifiedSecZim: true,
      tokenAddress: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      volume24h: '$0',
      txns24h: 1,
      tradersCount: 1,
      age: 'Just now',
      priceHistory: generateStockPriceHistory(params.priceUSD, 1)
    };

    this.stocks.unshift(newStock);

    // Also register token asset
    const newToken: TokenAsset = {
      symbol: newStock.ticker,
      name: newStock.name,
      address: newStock.tokenAddress!,
      decimals: 18,
      balance: 0,
      balanceUSD: 0,
      priceUSD: newStock.priceUSD,
      priceZIG: newStock.priceZIG,
      isStockToken: true,
      stockTicker: newStock.ticker,
      icon: newStock.image,
      totalSupply: params.totalShares
    };
    this.tokens.push(newToken);

    const tx: Transaction = {
      id: `tx-tok-${Date.now()}`,
      type: 'TOKENIZATION',
      title: `Tokenized & Minted ${params.totalShares.toLocaleString()} ${newStock.ticker} on Base L2`,
      amountUSD: params.valuationUSD,
      amountZIG: params.valuationUSD * this.oracleRates.usdZig,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `SECZIM-MINT-${Math.floor(100000 + Math.random() * 900000)}`,
      txHash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      blockNumber: 18493000 + Math.floor(Math.random() * 1000),
      gasSponsored: true
    };
    this.transactions.unshift(tx);

    // Persist to MongoDB
    this.insertMongoDoc('stocks', newStock);
    this.insertMongoDoc('tokens', newToken);
    this.insertMongoDoc('transactions', tx);

    return { stock: newStock, transaction: tx };
  }

  public burnStock(params: {
    stockId: string;
    burnedShares: number;
    reason: string;
    seczimFilingId?: string;
    payoutPerShareUSD?: number;
  }) {
    const stock = this.getStockById(params.stockId);
    if (!stock) throw new Error('Stock not found');

    const burned = Math.min(params.burnedShares, stock.fractionalUnitsAvailable);
    stock.fractionalUnitsAvailable = Math.max(0, stock.fractionalUnitsAvailable - burned);
    if (stock.fractionalUnitsAvailable === 0) {
      stock.riskRating = 'Delisted';
    }

    const totalPayoutUSD = burned * (params.payoutPerShareUSD || stock.priceUSD);
    const tx: Transaction = {
      id: `tx-burn-${Date.now()}`,
      type: 'BURN',
      title: `Burned & Recalled ${burned.toLocaleString()} ${stock.ticker} Shares (0x0)`,
      amountUSD: totalPayoutUSD,
      amountZIG: totalPayoutUSD * this.oracleRates.usdZig,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `SECZIM-BURN-${params.seczimFilingId || Math.floor(100000 + Math.random() * 900000)}`,
      txHash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      blockNumber: 18494000 + Math.floor(Math.random() * 500),
      gasSponsored: true
    };

    this.transactions.unshift(tx);

    this.persistMongoDoc('stocks', { id: stock.id }, stock);
    this.insertMongoDoc('transactions', tx);

    return {
      success: true,
      stock,
      burnedShares: burned,
      remainingShares: stock.fractionalUnitsAvailable,
      totalPayoutUSD,
      transaction: tx
    };
  }

  // --- DEX API Methods ---
  public getTokens(): TokenAsset[] {
    return this.tokens;
  }

  public getDexQuote(fromSymbol: string, toSymbol: string, amountIn: number) {
    const fromToken = this.tokens.find(t => t.symbol === fromSymbol);
    const toToken = this.tokens.find(t => t.symbol === toSymbol);

    if (!fromToken || !toToken) throw new Error('Token pair not found');
    if (amountIn <= 0) throw new Error('Invalid input amount');

    const valueUSD = amountIn * fromToken.priceUSD;
    const amountOutEstimated = valueUSD / toToken.priceUSD;
    const feeUSD = Math.round(valueUSD * 0.003 * 100) / 100; // 0.3% pool fee
    const slippageTolerance = 0.005; // 0.5%
    const amountOutMinimum = amountOutEstimated * (1 - slippageTolerance);
    const priceImpact = Math.min(2.5, Math.round((amountIn / 50000) * 100) / 100);

    return {
      fromToken,
      toToken,
      amountIn,
      amountOutEstimated: Math.round(amountOutEstimated * 100000) / 100000,
      amountOutMinimum: Math.round(amountOutMinimum * 100000) / 100000,
      feeUSD,
      feeTier: 3000,
      priceImpact,
      rate: toToken.priceUSD > 0 ? fromToken.priceUSD / toToken.priceUSD : 0,
      estimatedGasUSD: 0.00, // Sponsored
      route: ['Base Sepolia Uniswap V3 Pool', `${fromSymbol} -> ${toSymbol}`]
    };
  }

  public executeSwap(fromSymbol: string, toSymbol: string, amountIn: number, walletAddress?: string) {
    const quote = this.getDexQuote(fromSymbol, toSymbol, amountIn);

    // Update balances
    const fromToken = this.tokens.find(t => t.symbol === fromSymbol)!;
    const toToken = this.tokens.find(t => t.symbol === toSymbol)!;

    fromToken.balance = Math.max(0, fromToken.balance - amountIn);
    fromToken.balanceUSD = fromToken.balance * fromToken.priceUSD;

    toToken.balance = toToken.balance + quote.amountOutEstimated;
    toToken.balanceUSD = toToken.balance * toToken.priceUSD;

    const txHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const tx: Transaction = {
      id: `tx-swap-${Date.now()}`,
      type: 'TRADE',
      title: `Swapped ${amountIn.toLocaleString()} ${fromSymbol} for ${quote.amountOutEstimated.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${toSymbol}`,
      amountUSD: amountIn * fromToken.priceUSD,
      amountZIG: amountIn * fromToken.priceUSD * this.oracleRates.usdZig,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `UNISWAP-V3-${Math.floor(100000 + Math.random() * 900000)}`,
      txHash,
      blockNumber: 18495000 + Math.floor(Math.random() * 100),
      gasSponsored: true,
      sender: walletAddress || '0x71C...4b92'
    };

    this.transactions.unshift(tx);

    this.persistMongoDoc('tokens', { symbol: fromToken.symbol }, fromToken);
    this.persistMongoDoc('tokens', { symbol: toToken.symbol }, toToken);
    this.insertMongoDoc('transactions', tx);

    return {
      success: true,
      quote,
      transaction: tx
    };
  }

  public getOrders(): TradeOrder[] {
    return this.tradeOrders;
  }

  public createOrder(order: Omit<TradeOrder, 'id' | 'status' | 'timestamp' | 'txHash'>): TradeOrder {
    const newOrder: TradeOrder = {
      ...order,
      id: `ord-${Date.now()}`,
      status: 'OPEN',
      timestamp: 'Just now',
      txHash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    };
    this.tradeOrders.unshift(newOrder);
    this.insertMongoDoc('trade_orders', newOrder);
    return newOrder;
  }

  public cancelOrder(orderId: string): boolean {
    const ord = this.tradeOrders.find(o => o.id === orderId);
    if (!ord) return false;
    ord.status = 'CANCELLED';
    this.persistMongoDoc('trade_orders', { id: ord.id }, ord);
    return true;
  }

  // --- InvoiceX API Methods ---
  public getInvoices(): InvoiceItem[] {
    return this.invoices;
  }

  public getInvoiceById(id: string): InvoiceItem | undefined {
    return this.invoices.find(inv => inv.id === id || inv.invoiceNumber === id);
  }

  public createInvoice(data: {
    smeName: string;
    buyerName: string;
    amountUSD: number;
    discountRate: number;
    tenorDays: number;
    dueDate?: string;
  }): InvoiceItem {
    const expectedYieldUSD = Math.round((data.amountUSD * (data.discountRate / 100) * (data.tenorDays / 365)) * 100) / 100;
    const newInvoice: InvoiceItem = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      smeName: data.smeName,
      buyerName: data.buyerName,
      amountUSD: data.amountUSD,
      discountRate: data.discountRate,
      tenorDays: data.tenorDays,
      expectedYieldUSD,
      fundedPercentage: 0,
      status: 'Funding',
      dueDate: data.dueDate || '30 Apr 2026',
      riskScore: 'A- (Verified Offtaker)'
    };

    this.invoices.unshift(newInvoice);

    const tx: Transaction = {
      id: `tx-inv-${Date.now()}`,
      type: 'INVOICE_FUND',
      title: `Submitted ${newInvoice.invoiceNumber} for Factoring (${newInvoice.smeName})`,
      amountUSD: data.amountUSD,
      amountZIG: data.amountUSD * this.oracleRates.usdZig,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `INVX-ESCROW-${Math.floor(100000 + Math.random() * 900000)}`
    };
    this.transactions.unshift(tx);

    this.insertMongoDoc('invoices', newInvoice);
    this.insertMongoDoc('transactions', tx);

    return newInvoice;
  }

  public fundInvoice(invoiceId: string, amountUSD: number, investor?: string) {
    const invoice = this.getInvoiceById(invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    if (amountUSD <= 0) throw new Error('Invalid funding amount');

    const addedPercentage = Math.round((amountUSD / invoice.amountUSD) * 100);
    invoice.fundedPercentage = Math.min(100, invoice.fundedPercentage + addedPercentage);
    if (invoice.fundedPercentage >= 100) {
      invoice.status = 'Active';
    }

    const tx: Transaction = {
      id: `tx-fund-${Date.now()}`,
      type: 'INVOICE_FUND',
      title: `Funded ${invoice.invoiceNumber} with $${amountUSD.toFixed(2)} USD`,
      amountUSD,
      amountZIG: amountUSD * this.oracleRates.usdZig,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `INVX-FUND-${Math.floor(100000 + Math.random() * 900000)}`,
      txHash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      gasSponsored: true,
      sender: investor || '0x71C...4b92'
    };
    this.transactions.unshift(tx);

    this.persistMongoDoc('invoices', { id: invoice.id }, invoice);
    this.insertMongoDoc('transactions', tx);

    return {
      success: true,
      invoice,
      amountFundedUSD: amountUSD,
      transaction: tx
    };
  }

  // --- DebtBridge Loans API Methods ---
  public getLoans(): DebtBridgeLoan[] {
    return this.loans;
  }

  public createLoan(data: {
    borrowerName: string;
    collateralType: string;
    collateralValueUSD: number;
    loanAmountUSD: number;
    interestRate: number;
    durationMonths: number;
  }): DebtBridgeLoan {
    const ltvRatio = Math.round((data.loanAmountUSD / data.collateralValueUSD) * 100);
    const newLoan: DebtBridgeLoan = {
      id: `loan-${Date.now()}`,
      borrowerName: data.borrowerName,
      collateralType: data.collateralType,
      collateralValueUSD: data.collateralValueUSD,
      loanAmountUSD: data.loanAmountUSD,
      interestRate: data.interestRate,
      durationMonths: data.durationMonths,
      status: 'Active',
      ltvRatio
    };

    this.loans.unshift(newLoan);

    const tx: Transaction = {
      id: `tx-loan-${Date.now()}`,
      type: 'DEBTBRIDGE_LOAN',
      title: `Disbursed SBLOC Loan $${data.loanAmountUSD.toLocaleString()} USD against ${data.collateralType}`,
      amountUSD: data.loanAmountUSD,
      amountZIG: data.loanAmountUSD * this.oracleRates.usdZig,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `DB-SBLOC-${Math.floor(100000 + Math.random() * 900000)}`
    };
    this.transactions.unshift(tx);

    this.insertMongoDoc('loans', newLoan);
    this.insertMongoDoc('transactions', tx);

    return newLoan;
  }

  // --- Wallet, Transactions & Portfolio API ---
  public getPortfolio(): UserPortfolio {
    // Recalculate net worth based on holdings & cash
    const holdingsTotal = this.userPortfolio.holdings.reduce((sum, h) => sum + h.currentValueUSD, 0);
    this.userPortfolio.totalNetWorthUSD = this.userPortfolio.usdBalance + (this.userPortfolio.zigBalance / this.oracleRates.usdZig) + holdingsTotal;
    return this.userPortfolio;
  }

  public getTransactions(limit = 50): Transaction[] {
    return this.transactions.slice(0, limit);
  }

  public depositFunds(amount: number, tokenSymbol: string, rail: string, walletAddress?: string) {
    const token = this.tokens.find(t => t.symbol === tokenSymbol);
    const usdVal = amount * (token ? token.priceUSD : 1);

    if (token) {
      token.balance += amount;
      token.balanceUSD = token.balance * token.priceUSD;
    }
    if (tokenSymbol === 'USD' || tokenSymbol === 'USDC') {
      this.userPortfolio.usdBalance += amount;
    } else if (tokenSymbol === 'ZIG') {
      this.userPortfolio.zigBalance += amount;
    }

    const tx: Transaction = {
      id: `tx-dep-${Date.now()}`,
      type: 'DEPOSIT',
      title: `Deposited ${amount.toLocaleString()} ${tokenSymbol} via ${rail}`,
      amountUSD: usdVal,
      amountZIG: usdVal * this.oracleRates.usdZig,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `BASE-DEP-${Math.floor(100000 + Math.random() * 900000)}`,
      txHash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      receiver: walletAddress || '0x71C...4b92',
      gasSponsored: true
    };

    this.transactions.unshift(tx);

    if (token) {
      this.persistMongoDoc('tokens', { symbol: token.symbol }, token);
    }
    this.persistMongoDoc('user_portfolio', { id: 'primary_portfolio' }, this.userPortfolio);
    this.insertMongoDoc('transactions', tx);

    return {
      success: true,
      amount,
      tokenSymbol,
      rail,
      transaction: tx,
      newBalance: token ? token.balance : amount
    };
  }

  public sendFunds(amount: number, tokenSymbol: string, recipient: string, senderAddress?: string) {
    const token = this.tokens.find(t => t.symbol === tokenSymbol);
    const usdVal = amount * (token ? token.priceUSD : 1);

    if (token) {
      token.balance = Math.max(0, token.balance - amount);
      token.balanceUSD = token.balance * token.priceUSD;
    }
    if (tokenSymbol === 'USD' || tokenSymbol === 'USDC') {
      this.userPortfolio.usdBalance = Math.max(0, this.userPortfolio.usdBalance - amount);
    } else if (tokenSymbol === 'ZIG') {
      this.userPortfolio.zigBalance = Math.max(0, this.userPortfolio.zigBalance - amount);
    }

    const tx: Transaction = {
      id: `tx-send-${Date.now()}`,
      type: 'TRANSFER',
      title: `Sent ${amount.toLocaleString()} ${tokenSymbol} to ${recipient}`,
      amountUSD: usdVal,
      amountZIG: usdVal * this.oracleRates.usdZig,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `BASE-SEND-${Math.floor(100000 + Math.random() * 900000)}`,
      txHash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      sender: senderAddress || '0x71C...4b92',
      receiver: recipient,
      gasSponsored: true
    };

    this.transactions.unshift(tx);

    if (token) {
      this.persistMongoDoc('tokens', { symbol: token.symbol }, token);
    }
    this.persistMongoDoc('user_portfolio', { id: 'primary_portfolio' }, this.userPortfolio);
    this.insertMongoDoc('transactions', tx);

    return {
      success: true,
      amount,
      tokenSymbol,
      recipient,
      transaction: tx
    };
  }

  public claimDividends(action: 'claim' | 'compound') {
    const amount = this.userPortfolio.unclaimedDividendsUSD;
    if (amount <= 0) return { success: false, message: 'No unclaimed dividends' };

    this.userPortfolio.unclaimedDividendsUSD = 0;
    if (action === 'claim') {
      this.userPortfolio.usdBalance += amount;
    } else {
      // Compounded into Takura Agro
      const tkra = this.getStockById('sme-1');
      if (tkra) {
        this.buyShares(tkra.id, amount, Math.round((amount / tkra.priceUSD) * 10000) / 10000);
      }
    }

    const tx: Transaction = {
      id: `tx-div-${Date.now()}`,
      type: 'DIVIDEND',
      title: action === 'compound' ? `Compounded $${amount.toFixed(2)} USD into ZEEX Shares` : `Claimed $${amount.toFixed(2)} USD Dividends`,
      amountUSD: amount,
      amountZIG: amount * this.oracleRates.usdZig,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `SECZIM-DIV-${Math.floor(100000 + Math.random() * 900000)}`
    };
    this.transactions.unshift(tx);

    this.persistMongoDoc('user_portfolio', { id: 'primary_portfolio' }, this.userPortfolio);
    this.insertMongoDoc('transactions', tx);

    return {
      success: true,
      action,
      amountUSD: amount,
      transaction: tx
    };
  }

  public faucetRequest(tokenSymbol: string) {
    const amount = tokenSymbol === 'ZIG' ? 1000 : 100;
    return this.depositFunds(amount, tokenSymbol, 'Base Sepolia Testnet Faucet');
  }

  // --- Oracles & System API ---
  public getOracleRates(): OracleRates {
    return this.oracleRates;
  }

  // --- Social API ---
  public getSocialPosts(): SocialPost[] {
    return this.socialPosts;
  }

  public createSocialPost(post: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'comments'>): SocialPost {
    const newPost: SocialPost = {
      ...post,
      id: `post-${Date.now()}`,
      timestamp: 'Just now',
      likes: 1,
      comments: 0,
      isLiked: false
    };
    this.socialPosts.unshift(newPost);
    this.insertMongoDoc('social_posts', newPost);
    return newPost;
  }

  public likePost(postId: string): boolean {
    const p = this.socialPosts.find(post => post.id === postId);
    if (!p) return false;
    p.isLiked = !p.isLiked;
    p.likes += p.isLiked ? 1 : -1;
    this.persistMongoDoc('social_posts', { id: p.id }, p);
    return true;
  }

  // --- Base Account SDK Payments Tracking in MongoDB ---
  public async recordBasePayment(payment: {
    id: string;
    amountUSD: number;
    recipient: string;
    payerAddress?: string;
    purpose: string;
    status: 'INITIATED' | 'BROADCASTED' | 'CONFIRMED' | 'COMPLETED' | 'FAILED';
    testnet?: boolean;
    txHash?: string;
  }): Promise<BasePaymentRecord> {
    const now = new Date().toISOString();
    const record: BasePaymentRecord = {
      ...payment,
      testnet: payment.testnet !== false,
      createdAt: now,
      updatedAt: now,
    };

    // Keep in memory
    const existingIdx = this.basePayments.findIndex(p => p.id === payment.id);
    if (existingIdx >= 0) {
      this.basePayments[existingIdx] = record;
    } else {
      this.basePayments.unshift(record);
    }

    // Also record transaction
    const tx: Transaction = {
      id: `tx-basepay-${Date.now()}`,
      type: 'DEPOSIT',
      title: `Base Pay: ${payment.purpose}`,
      amountUSD: payment.amountUSD,
      amountZIG: payment.amountUSD * this.oracleRates.usdZig,
      timestamp: 'Just now',
      status: payment.status === 'CONFIRMED' ? 'Completed' : 'Pending',
      reference: `BASE-PAY-${payment.id.slice(0, 8).toUpperCase()}`,
      txHash: payment.txHash || `0x${payment.id.replace(/-/g, '').padEnd(64, '0').slice(0, 64)}`,
      gasSponsored: true,
      sender: payment.payerAddress || '0xBaseAccountPasskey',
      receiver: payment.recipient
    };
    this.transactions.unshift(tx);

    // Persist to MongoDB
    await this.persistMongoDoc('base_payments', { id: record.id }, record);
    await this.insertMongoDoc('transactions', tx);

    return record;
  }

  public getBasePayments(limit = 50): BasePaymentRecord[] {
    return this.basePayments.slice(0, limit);
  }

  public getBasePaymentById(id: string): BasePaymentRecord | undefined {
    return this.basePayments.find(p => p.id === id);
  }

  public async updateBasePaymentStatus(id: string, status: 'INITIATED' | 'BROADCASTED' | 'CONFIRMED' | 'COMPLETED' | 'FAILED', txHash?: string): Promise<BasePaymentRecord | null> {
    const pay = this.basePayments.find(p => p.id === id);
    if (!pay) return null;

    pay.status = status;
    pay.updatedAt = new Date().toISOString();
    if (txHash) pay.txHash = txHash;

    await this.persistMongoDoc('base_payments', { id }, pay);
    return pay;
  }
}

export const store = new AppStore();
