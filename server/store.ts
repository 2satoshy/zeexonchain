import { SMEStock, InvoiceItem, DebtBridgeLoan, Transaction, TokenAsset, SocialPost, TradeOrder, StartupListingApplication, UserProfile, UserSession, UserActivityLog, BaseRWAAssetToken } from '../src/types';
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
  private users: UserProfile[] = [];
  private sessions: UserSession[] = [];
  private activityLogs: UserActivityLog[] = [];
  private userPortfoliosMap: Map<string, UserPortfolio> = new Map();
  private rwaTokens: BaseRWAAssetToken[] = [
    {
      id: 'rwa-1',
      name: 'Takura Agro Commodities RWA',
      ticker: 'TKRA',
      contractAddress: '0x3a9f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
      decimals: 18,
      totalSupply: 1000000,
      maxAuthorizedSupply: 5000000,
      issuerAddress: '0x71C824aD3Fe479B92c578f142EbF472bC19638A9',
      custodianEscrow: 'Stanbic Nominees Zimbabwe Ltd (ZSE Trust Escrow #411)',
      seczimFilingId: 'SECZ-RWA-2026-0914',
      isPaused: false,
      multiplier: 1.0,
      eligibleHoldersRule: {
        requiresKYC: true,
        allowedCountries: ['ZW', 'ZA', 'US', 'GB', 'AE'],
        restrictedAddresses: []
      },
      distributions: [
        {
          id: 'dist-1',
          assetTicker: 'TKRA',
          announcementDate: '2026-08-15',
          payoutDate: '2026-09-15',
          totalAmountUSD: 25000,
          amountPerUnitUSD: 0.025,
          currency: 'USDC',
          status: 'PAID',
          txHash: '0x8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rwa-2',
      name: 'Nyanga Solar Grid Corp RWA',
      ticker: 'NYNG',
      contractAddress: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
      decimals: 18,
      totalSupply: 500000,
      maxAuthorizedSupply: 2000000,
      issuerAddress: '0x71C824aD3Fe479B92c578f142EbF472bC19638A9',
      custodianEscrow: 'CBZ Nominees Escrow Account #104',
      seczimFilingId: 'SECZ-RWA-2026-0842',
      isPaused: false,
      multiplier: 1.0,
      eligibleHoldersRule: {
        requiresKYC: true,
        allowedCountries: ['ZW', 'ZA', 'GB', 'SG'],
        restrictedAddresses: []
      },
      distributions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

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

      // 8. Users
      const usersCol = db.collection('users');
      const mongoUsers = await usersCol.find().toArray();
      this.users = mongoUsers.map(({ _id, ...rest }) => rest as unknown as UserProfile);

      // 9. Activity Logs
      const logsCol = db.collection('user_activity_logs');
      const mongoLogs = await logsCol.find().sort({ $natural: -1 }).limit(200).toArray();
      this.activityLogs = mongoLogs.map(({ _id, ...rest }) => rest as unknown as UserActivityLog);

      // 10. User Portfolio
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

      // 10. Base RWA Tokens
      const rwaCol = db.collection('rwa_tokens');
      const rwaCount = await rwaCol.countDocuments();
      if (rwaCount === 0) {
        await rwaCol.insertMany(JSON.parse(JSON.stringify(this.rwaTokens)));
      } else {
        const mongoRwa = await rwaCol.find().toArray();
        this.rwaTokens = mongoRwa.map(({ _id, ...rest }) => rest as unknown as BaseRWAAssetToken);
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

  public buyStockWithCurrency(params: {
    stockIdOrTicker: string;
    fromCurrency: string;
    amountUSD?: number;
    units?: number;
    currencyAmount?: number;
    walletAddress?: string;
  }) {
    const { stockIdOrTicker, fromCurrency, walletAddress } = params;
    const cleanTicker = stockIdOrTicker.toLowerCase().replace('.zx', '');
    const stock = this.stocks.find(s => 
      s.id.toLowerCase() === stockIdOrTicker.toLowerCase() ||
      s.ticker.toLowerCase() === stockIdOrTicker.toLowerCase() ||
      s.ticker.toLowerCase().replace('.zx', '') === cleanTicker ||
      s.name.toLowerCase().includes(cleanTicker)
    );

    if (!stock) {
      throw new Error(`Stock '${stockIdOrTicker}' not found on ZEEX exchange`);
    }

    const normCurrency = fromCurrency.toUpperCase().replace('$', '').trim();
    let usdAmount = 0;
    let units = 0;
    let currencyDeductAmount = 0;

    if (params.amountUSD && params.amountUSD > 0) {
      usdAmount = params.amountUSD;
      units = Math.round((usdAmount / stock.priceUSD) * 10000) / 10000;
      currencyDeductAmount = normCurrency === 'ZIG' 
        ? usdAmount * this.oracleRates.usdZig 
        : (normCurrency === 'ETH' || normCurrency === 'WETH')
          ? usdAmount / this.oracleRates.ethUSD
          : usdAmount;
    } else if (params.units && params.units > 0) {
      units = params.units;
      usdAmount = units * stock.priceUSD;
      currencyDeductAmount = normCurrency === 'ZIG'
        ? usdAmount * this.oracleRates.usdZig
        : (normCurrency === 'ETH' || normCurrency === 'WETH')
          ? usdAmount / this.oracleRates.ethUSD
          : usdAmount;
    } else if (params.currencyAmount && params.currencyAmount > 0) {
      currencyDeductAmount = params.currencyAmount;
      if (normCurrency === 'ZIG') {
        usdAmount = currencyDeductAmount / this.oracleRates.usdZig;
      } else if (normCurrency === 'ETH' || normCurrency === 'WETH') {
        usdAmount = currencyDeductAmount * this.oracleRates.ethUSD;
      } else {
        usdAmount = currencyDeductAmount;
      }
      units = Math.round((usdAmount / stock.priceUSD) * 10000) / 10000;
    } else {
      throw new Error('Please specify an investment amount or units');
    }

    // Deduct from currency balance
    const token = this.tokens.find(t => t.symbol === normCurrency || (normCurrency === 'USD' && t.symbol === 'USDC'));
    if (token) {
      token.balance = Math.max(0, token.balance - currencyDeductAmount);
      token.balanceUSD = token.balance * token.priceUSD;
      this.persistMongoDoc('tokens', { symbol: token.symbol }, token);
    }

    if (normCurrency === 'ZIG') {
      this.userPortfolio.zigBalance = Math.max(0, this.userPortfolio.zigBalance - currencyDeductAmount);
    } else if (normCurrency === 'USDC' || normCurrency === 'USD') {
      this.userPortfolio.usdBalance = Math.max(0, this.userPortfolio.usdBalance - usdAmount);
    }

    // Update stock and portfolio holdings
    stock.fractionalUnitsAvailable = Math.max(0, stock.fractionalUnitsAvailable - units);
    stock.txns24h = (stock.txns24h || 120) + 1;
    stock.tradersCount = (stock.tradersCount || 400) + 1;

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

    // Per-user isolated portfolio update & audit activity
    if (walletAddress) {
      const userPort = this.getUserPortfolioForAddress(walletAddress);
      if (normCurrency === 'ZIG') {
        userPort.zigBalance = Math.max(0, (userPort.zigBalance || 0) - currencyDeductAmount);
      } else if (normCurrency === 'USDC' || normCurrency === 'USD') {
        userPort.usdBalance = Math.max(0, (userPort.usdBalance || 0) - usdAmount);
      }
      const existingUserHolding = userPort.holdings.find(h => h.stockId === stock.id || h.ticker === stock.ticker);
      if (existingUserHolding) {
        const totalUnits = existingUserHolding.units + units;
        const totalCost = (existingUserHolding.units * existingUserHolding.avgPriceUSD) + usdAmount;
        existingUserHolding.units = totalUnits;
        existingUserHolding.avgPriceUSD = totalCost / totalUnits;
        existingUserHolding.currentValueUSD = totalUnits * stock.priceUSD;
        existingUserHolding.pnlUSD = existingUserHolding.currentValueUSD - totalCost;
        existingUserHolding.pnlPercent = (existingUserHolding.pnlUSD / totalCost) * 100;
      } else {
        userPort.holdings.push({
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
      userPort.totalNetWorthUSD = userPort.usdBalance + ((userPort.zigBalance || 0) * this.oracleRates.zigUsd) + userPort.holdings.reduce((sum, h) => sum + h.currentValueUSD, 0);
      this.persistMongoDoc('user_portfolios', { walletAddress: walletAddress.toLowerCase() }, userPort);

      // Log user activity
      this.logActivity({
        walletAddress,
        action: 'BUY_SHARES',
        details: {
          stockTicker: stock.ticker,
          stockName: stock.name,
          units,
          costUSD: usdAmount,
          currency: normCurrency,
          currencyDeductAmount,
          seczimTrust: stock.backingTrust
        }
      }).catch(e => console.warn('Activity log notice:', e));
    }

    const txHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const tx: Transaction = {
      id: `tx-ai-buy-${Date.now()}`,
      type: 'BUY',
      title: `Bought ${units.toFixed(2)} ${stock.ticker} with ${currencyDeductAmount.toLocaleString(undefined, { maximumFractionDigits: 3 })} ${normCurrency}`,
      amountUSD: usdAmount,
      amountZIG: usdAmount * this.oracleRates.usdZig,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `ZEEX-AI-${Math.floor(100000 + Math.random() * 900000)}`,
      blockNumber: 18496000 + Math.floor(Math.random() * 100),
      txHash,
      gasSponsored: true,
      sender: walletAddress || '0x71C...4b92',
      receiver: '0xStanbicNomineesEscrow'
    };

    this.transactions.unshift(tx);
    this.persistMongoDoc('stocks', { id: stock.id }, stock);
    this.persistMongoDoc('user_portfolio', { id: 'primary_portfolio' }, this.userPortfolio);
    this.insertMongoDoc('transactions', tx);

    return {
      success: true,
      stock,
      units,
      usdAmount,
      currencyDeductAmount,
      fromCurrency: normCurrency,
      transaction: tx
    };
  }

  public sellStockForCurrency(params: {
    stockIdOrTicker: string;
    units: number;
    toCurrency?: string;
    walletAddress?: string;
  }) {
    const { stockIdOrTicker, units, toCurrency = 'USDC', walletAddress } = params;
    const cleanTicker = stockIdOrTicker.toLowerCase().replace('.zx', '');
    const stock = this.stocks.find(s => 
      s.id.toLowerCase() === stockIdOrTicker.toLowerCase() ||
      s.ticker.toLowerCase() === stockIdOrTicker.toLowerCase() ||
      s.ticker.toLowerCase().replace('.zx', '') === cleanTicker
    );

    if (!stock) throw new Error(`Stock '${stockIdOrTicker}' not found on ZEEX exchange`);

    const holding = this.userPortfolio.holdings.find(h => h.stockId === stock.id);
    if (!holding || holding.units < units) {
      throw new Error(`Insufficient shares. You hold ${holding ? holding.units : 0} units of ${stock.ticker}`);
    }

    const usdVal = units * stock.priceUSD;
    const normToCurrency = toCurrency.toUpperCase().replace('$', '').trim();
    let currencyCredited = usdVal;
    if (normToCurrency === 'ZIG') {
      currencyCredited = usdVal * this.oracleRates.usdZig;
    } else if (normToCurrency === 'ETH' || normToCurrency === 'WETH') {
      currencyCredited = usdVal / this.oracleRates.ethUSD;
    }

    holding.units -= units;
    holding.currentValueUSD = holding.units * stock.priceUSD;
    if (holding.units <= 0) {
      this.userPortfolio.holdings = this.userPortfolio.holdings.filter(h => h.stockId !== stock.id);
    }

    stock.fractionalUnitsAvailable += units;

    const token = this.tokens.find(t => t.symbol === normToCurrency || (normToCurrency === 'USD' && t.symbol === 'USDC'));
    if (token) {
      token.balance += currencyCredited;
      token.balanceUSD = token.balance * token.priceUSD;
      this.persistMongoDoc('tokens', { symbol: token.symbol }, token);
    }

    if (normToCurrency === 'ZIG') {
      this.userPortfolio.zigBalance += currencyCredited;
    } else if (normToCurrency === 'USDC' || normToCurrency === 'USD') {
      this.userPortfolio.usdBalance += usdVal;
    }

    // Per-user isolated portfolio update & audit activity
    if (walletAddress) {
      const userPort = this.getUserPortfolioForAddress(walletAddress);
      const userHolding = userPort.holdings.find(h => h.stockId === stock.id || h.ticker === stock.ticker);
      if (userHolding) {
        userHolding.units = Math.max(0, userHolding.units - units);
        userHolding.currentValueUSD = userHolding.units * stock.priceUSD;
        if (userHolding.units <= 0) {
          userPort.holdings = userPort.holdings.filter(h => h.stockId !== stock.id && h.ticker !== stock.ticker);
        }
      }
      if (normToCurrency === 'ZIG') {
        userPort.zigBalance = (userPort.zigBalance || 0) + currencyCredited;
      } else if (normToCurrency === 'USDC' || normToCurrency === 'USD') {
        userPort.usdBalance = (userPort.usdBalance || 0) + usdVal;
      }
      userPort.totalNetWorthUSD = userPort.usdBalance + ((userPort.zigBalance || 0) * this.oracleRates.zigUsd) + userPort.holdings.reduce((sum, h) => sum + h.currentValueUSD, 0);
      this.persistMongoDoc('user_portfolios', { walletAddress: walletAddress.toLowerCase() }, userPort);

      // Log user activity
      this.logActivity({
        walletAddress,
        action: 'BUY_SHARES',
        details: {
          action: 'SELL_SHARES',
          stockTicker: stock.ticker,
          stockName: stock.name,
          units,
          proceedsUSD: usdVal,
          currency: normToCurrency,
          currencyCredited
        }
      }).catch(e => console.warn('Activity log notice:', e));
    }

    const txHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const tx: Transaction = {
      id: `tx-ai-sell-${Date.now()}`,
      type: 'SELL',
      title: `Sold ${units.toFixed(2)} ${stock.ticker} for ${currencyCredited.toLocaleString(undefined, { maximumFractionDigits: 3 })} ${normToCurrency}`,
      amountUSD: usdVal,
      amountZIG: usdVal * this.oracleRates.usdZig,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `ZEEX-SELL-${Math.floor(100000 + Math.random() * 900000)}`,
      blockNumber: 18496000 + Math.floor(Math.random() * 100),
      txHash,
      gasSponsored: true,
      sender: walletAddress || '0x71C...4b92'
    };

    this.transactions.unshift(tx);
    this.persistMongoDoc('stocks', { id: stock.id }, stock);
    this.persistMongoDoc('user_portfolio', { id: 'primary_portfolio' }, this.userPortfolio);
    this.insertMongoDoc('transactions', tx);

    return {
      success: true,
      stock,
      units,
      usdVal,
      currencyCredited,
      toCurrency: normToCurrency,
      transaction: tx
    };
  }

  public createPaymentRequest(amount: number, tokenSymbol: string, requester: string, memo?: string) {
    const reqId = `req-${Date.now()}`;
    const reference = `ZEEX-REQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const paymentLink = `https://zeexonchain.zse.zw/pay/${reference}`;
    const token = this.tokens.find(t => t.symbol === tokenSymbol);
    const usdVal = amount * (token ? token.priceUSD : (tokenSymbol === 'ZIG' ? 1 / this.oracleRates.usdZig : 1));

    const tx: Transaction = {
      id: `tx-req-${Date.now()}`,
      type: 'TRANSFER',
      title: `Payment Request: ${amount.toLocaleString()} ${tokenSymbol} (${memo || 'ZEEX Settlement'})`,
      amountUSD: usdVal,
      amountZIG: usdVal * this.oracleRates.usdZig,
      timestamp: 'Just now',
      status: 'Pending',
      reference,
      sender: requester,
      gasSponsored: true
    };
    this.transactions.unshift(tx);
    this.insertMongoDoc('transactions', tx);

    return {
      success: true,
      requestId: reqId,
      reference,
      amount,
      tokenSymbol,
      usdVal,
      memo: memo || 'ZEEX Onchain Payment Request',
      paymentLink,
      status: 'PENDING',
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

    // Per-user isolated portfolio update & audit activity
    if (walletAddress) {
      const userPort = this.getUserPortfolioForAddress(walletAddress);
      if (fromSymbol === 'ZIG') {
        userPort.zigBalance = Math.max(0, (userPort.zigBalance || 0) - amountIn);
      } else if (fromSymbol === 'USDC' || fromSymbol === 'USD') {
        userPort.usdBalance = Math.max(0, (userPort.usdBalance || 0) - amountIn);
      }
      if (toSymbol === 'ZIG') {
        userPort.zigBalance = (userPort.zigBalance || 0) + quote.amountOutEstimated;
      } else if (toSymbol === 'USDC' || toSymbol === 'USD') {
        userPort.usdBalance = (userPort.usdBalance || 0) + quote.amountOutEstimated;
      }
      userPort.totalNetWorthUSD = userPort.usdBalance + ((userPort.zigBalance || 0) * this.oracleRates.zigUsd) + userPort.holdings.reduce((sum, h) => sum + h.currentValueUSD, 0);
      this.persistMongoDoc('user_portfolios', { walletAddress: walletAddress.toLowerCase() }, userPort);

      // Log user activity
      this.logActivity({
        walletAddress,
        action: 'EXECUTE_SWAP',
        details: {
          fromSymbol,
          toSymbol,
          amountIn,
          amountOut: quote.amountOutEstimated,
          txHash,
          pool: 'Uniswap V3 on Base Sepolia'
        }
      }).catch(e => console.warn('Activity log notice:', e));
    }

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

    // Per-user isolated portfolio update & audit activity
    if (senderAddress) {
      const userPort = this.getUserPortfolioForAddress(senderAddress);
      if (tokenSymbol === 'USD' || tokenSymbol === 'USDC') {
        userPort.usdBalance = Math.max(0, (userPort.usdBalance || 0) - amount);
      } else if (tokenSymbol === 'ZIG') {
        userPort.zigBalance = Math.max(0, (userPort.zigBalance || 0) - amount);
      }
      userPort.totalNetWorthUSD = userPort.usdBalance + ((userPort.zigBalance || 0) * this.oracleRates.zigUsd) + userPort.holdings.reduce((sum, h) => sum + h.currentValueUSD, 0);
      this.persistMongoDoc('user_portfolios', { walletAddress: senderAddress.toLowerCase() }, userPort);

      // Log user activity
      this.logActivity({
        walletAddress: senderAddress,
        action: 'BASE_PAY',
        details: {
          tokenSymbol,
          amount,
          recipient,
          txHash: tx.txHash,
          network: 'Base Sepolia L2'
        }
      }).catch(e => console.warn('Activity log notice:', e));
    }

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
    await this.persistMongoDoc('base_payments', { id }, pay);
    return pay;
  }

  // --- User Signup & Profile Persistence (Option 1) ---
  public async upsertUser(userData: Partial<UserProfile> & { walletAddress: string }): Promise<UserProfile> {
    const normAddress = userData.walletAddress.toLowerCase();
    const existingIndex = this.users.findIndex(u => u.walletAddress.toLowerCase() === normAddress);
    const now = new Date().toISOString();

    let user: UserProfile;
    if (existingIndex >= 0) {
      user = {
        ...this.users[existingIndex],
        ...userData,
        lastLoginAt: now,
      };
      this.users[existingIndex] = user;
    } else {
      user = {
        id: `user-${normAddress.slice(0, 8)}`,
        walletAddress: normAddress,
        authProvider: userData.authProvider || 'BASE_ACCOUNT',
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        role: userData.role || 'RETAIL',
        createdAt: now,
        lastLoginAt: now,
        ip: userData.ip,
        userAgent: userData.userAgent,
      };
      this.users.push(user);
    }

    await this.persistMongoDoc('users', { walletAddress: normAddress }, user);
    return user;
  }

  public async getUserByAddress(walletAddress: string): Promise<UserProfile | undefined> {
    const norm = walletAddress.toLowerCase();
    let user = this.users.find(u => u.walletAddress.toLowerCase() === norm);
    if (!user) {
      const db = await getDatabase();
      if (db) {
        const found = await db.collection('users').findOne({ walletAddress: norm });
        if (found) {
          const { _id, ...rest } = found;
          user = rest as unknown as UserProfile;
          this.users.push(user);
        }
      }
    }
    return user;
  }

  public getUsers(limit = 100): UserProfile[] {
    return this.users.slice(0, limit);
  }

  // --- Session & User Activity Audit Logging (Option 2) ---
  public async logActivity(activity: Partial<UserActivityLog> & { action: UserActivityLog['action'] }): Promise<UserActivityLog> {
    const log: UserActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      walletAddress: (activity.walletAddress || '0xAnonymous').toLowerCase(),
      action: activity.action,
      details: activity.details || {},
      timestamp: new Date().toISOString(),
      ip: activity.ip,
      userAgent: activity.userAgent,
    };

    this.activityLogs.unshift(log);
    if (this.activityLogs.length > 500) {
      this.activityLogs = this.activityLogs.slice(0, 500);
    }

    await this.insertMongoDoc('user_activity_logs', log);
    return log;
  }

  public getActivityLogs(walletAddress?: string, limit = 50): UserActivityLog[] {
    if (walletAddress) {
      const norm = walletAddress.toLowerCase();
      return this.activityLogs.filter(l => l.walletAddress.toLowerCase() === norm).slice(0, limit);
    }
    return this.activityLogs.slice(0, limit);
  }

  // --- Per-User Portfolio Isolation (Option 3) ---
  public getUserPortfolioForAddress(walletAddress?: string): UserPortfolio {
    if (!walletAddress) return this.userPortfolio;

    const norm = walletAddress.toLowerCase();
    if (!this.userPortfoliosMap.has(norm)) {
      // Initialize isolated portfolio for new user address with 0 balance
      const newPortfolio: UserPortfolio = {
        usdBalance: 0.00,
        zigBalance: 0.00,
        totalNetWorthUSD: 0.00,
        unclaimedDividendsUSD: 0,
        holdings: []
      };
      this.userPortfoliosMap.set(norm, newPortfolio);
    }
    return this.userPortfoliosMap.get(norm)!;
  }

  public addHoldingToUserPortfolio(walletAddress: string, holding: UserPortfolio['holdings'][0]): void {
    const norm = walletAddress.toLowerCase();
    const portfolio = this.getUserPortfolioForAddress(norm);
    const existingIndex = portfolio.holdings.findIndex(h => h.ticker === holding.ticker || h.stockId === holding.stockId);
    if (existingIndex >= 0) {
      portfolio.holdings[existingIndex].units += holding.units;
      portfolio.holdings[existingIndex].currentValueUSD = portfolio.holdings[existingIndex].units * holding.avgPriceUSD;
    } else {
      portfolio.holdings.push(holding);
    }
    portfolio.totalNetWorthUSD = portfolio.usdBalance + portfolio.holdings.reduce((sum, h) => sum + h.currentValueUSD, 0);
  }

  public addZigBalanceToUserPortfolio(walletAddress: string, amount: number): void {
    const norm = walletAddress.toLowerCase();
    const portfolio = this.getUserPortfolioForAddress(norm);
    portfolio.zigBalance = (portfolio.zigBalance || 0) + amount;
    portfolio.totalNetWorthUSD = portfolio.usdBalance + (portfolio.zigBalance * this.oracleRates.zigUsd) + portfolio.holdings.reduce((sum, h) => sum + h.currentValueUSD, 0);
  }
}

export const store = new AppStore();
