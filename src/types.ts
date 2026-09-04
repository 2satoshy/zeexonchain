export type TabType = 'dashboard' | 'shares' | 'trading' | 'startupListing' | 'invoiceX' | 'debtBridge' | 'zig' | 'whatsapp' | 'aiAdvisor' | 'social' | 'profile';

export type CurrencyMode = 'USD' | 'ZIG';

export interface TokenAsset {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  balance: number;
  balanceUSD: number;
  priceUSD: number;
  priceZIG: number;
  change24h?: number;
  isStockToken?: boolean;
  stockTicker?: string;
  icon?: string;
  totalSupply?: number;
  companyDetails?: {
    registrationNumber?: string;
    jurisdiction?: string;
    totalShares?: number;
    parValueUSD?: number;
    sector?: string;
    description?: string;
  };
}

export interface DEXSwapParams {
  tokenIn: TokenAsset;
  tokenOut: TokenAsset;
  amountIn: number;
  amountOutEstimated: number;
  amountOutMinimum: number;
  feeTier: 500 | 3000 | 10000;
  slippageTolerance: number; // e.g. 0.5%
  routerAddress: string;
  priceImpact: number;
}

export interface OrderbookItem {
  price: number;
  amount: number;
  totalUSD: number;
}

export interface TradeOrder {
  id: string;
  pair: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  price: number;
  amount: number;
  totalUSD: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
  timestamp: string;
  txHash?: string;
}

export interface StartupDataroom {
  pitchDeckSummary?: string;
  pitchDeckFileName?: string;
  capTableSummary?: Array<{
    shareholder: string;
    sharesCount: number;
    equityPercentage: number;
    classType: string;
  }>;
  financialModel?: {
    revenueUSD: number;
    mrrUSD: number;
    annualBurnRateUSD: number;
    ebitdaUSD: number;
    grossMarginPercent: number;
    projections: Array<{ year: string; revenue: string; ebitda: string }>;
  };
  complianceChecklist: {
    incorporationCertificate: boolean;
    taxClearanceZimra: boolean;
    seczimPreCheck: boolean;
    auditedFinancials: boolean;
    ipAssignment: boolean;
    rwaCustodyAgreement: boolean;
  };
  uploadedDocuments: Array<{
    id: string;
    name: string;
    category: 'legal' | 'financials' | 'deck' | 'technical';
    size: string;
    uploadedAt: string;
    hashSha256: string;
    verified: boolean;
  }>;
}

export interface TokenizationParams {
  preMoneyValuationUSD: number;
  totalAuthorizedShares: number;
  equityPercentToTokenize: number; // e.g. 20%
  sharesToTokenize: number;
  tokenSupplyToMint: number; // e.g. 1,000,000 tokens
  tokenTicker: string;
  tokenStandard: 'ERC-3643 (Base L2)' | 'ERC-1400 (SECZim Compliant)' | 'ERC-20 + Identity';
  minInvestmentUSD: number;
  dividendPolicy: 'Quarterly USDC' | 'Annual Staking Yield' | 'Revenue Share' | 'Reinvested';
  targetNetwork: 'Base Mainnet' | 'Base Sepolia' | 'Solana';
}

export interface TokenizationResult {
  tokenPriceUSD: number;
  tokenPriceZIG: number;
  tokenizedValuationUSD: number;
  publicFloatPercentage: number;
  foundersRetainedPercentage: number;
  contractAddress: string;
  seczimCompliant: boolean;
  orderbookStatus: 'Ready' | 'Deployed' | 'Live Trading' | 'Under Review (SECZim)';
  allocationSummary: {
    publicPool: number;
    treasuryReserve: number;
    founderEscrow: number;
    liquidityPool: number;
  };
}

export interface StartupListingApplication {
  id: string;
  companyName: string;
  tradingName: string;
  ticker: string;
  logoUrl?: string;
  sector: 'AgriTech' | 'FinTech & Payments' | 'Clean Energy' | 'Mining & Metals' | 'Logistics' | 'HealthTech' | 'Real Estate RWA';
  country: string;
  city: string;
  website: string;
  foundedYear: number;
  founders: Array<{ name: string; role: string; email: string; linkedin?: string }>;
  problem: string;
  solution: string;
  tractionDescription: string;
  stage: 'Pre-Seed' | 'Seed' | 'Series A' | 'Growth SME';
  askAmountUSD: number;
  valuationUSD: number;
  dataroom: StartupDataroom;
  tokenization: TokenizationParams;
  tokenizationResult?: TokenizationResult;
  applicationStatus: 'Draft' | 'Under Review (SECZim)' | 'Approved & Minted' | 'Live Onchain';
  matchScore?: number;
  submittedAt?: string;
}


export interface SocialPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  badge?: string;
  content: string;
  timestamp: string;
  tradeAction?: {
    type: 'BUY' | 'SELL' | 'YIELD';
    ticker: string;
    amountUSD: number;
    sharesCount?: number;
  };
  imageUrl?: string;
  mediaType?: 'flex' | 'meme' | 'lifestyle';
  likes: number;
  comments: number;
  isLiked?: boolean;
}


export interface StockPricePoint {
  date: string;
  priceUSD: number;
  priceZIG?: number;
  volume?: number;
}

export interface SMEStock {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  priceUSD: number;
  priceZIG: number;
  change24h: number;
  marketCap: string;
  dividendYield: number;
  fractionalUnitsAvailable: number; // up to 1,000,000 per share
  backingTrust: string;
  description: string;
  riskRating: 'Low' | 'Medium' | 'Growth' | 'Delisted';
  image: string;
  valuationUSD?: number;
  sharePriceUSD?: number;
  sharePriceZIG?: number;
  fractionalPriceUSD?: number;
  annualRevenueUSD?: number;
  peRatio?: number;
  verifiedSecZim?: boolean;
  tokenAddress?: string;
  tags?: string[];
  priceHistory?: StockPricePoint[];
  change1h?: number;
  volume24h?: string;
  txns24h?: number;
  tradersCount?: number;
  age?: string;
}

export interface UserHolding {
  stockId: string;
  ticker: string;
  name: string;
  units: number; // fractional units owned
  totalValueUSD: number;
  avgCostUSD: number;
  pnlUSD: number;
  pnlPercent: number;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  smeName: string;
  buyerName: string;
  amountUSD: number;
  discountRate: number; // e.g. 14% annualized
  tenorDays: number;
  expectedYieldUSD: number;
  fundedPercentage: number;
  status: 'Funding' | 'Active' | 'Settled';
  dueDate: string;
  riskScore: string;
}

export interface DebtBridgeLoan {
  id: string;
  borrowerName: string;
  collateralType: string;
  collateralValueUSD: number;
  loanAmountUSD: number;
  interestRate: number; // e.g., 12.5%
  durationMonths: number;
  status: 'Active' | 'Pending' | 'Completed';
  ltvRatio: number; // Loan-to-Value percentage
}

export interface WhatsAppMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  actionCard?: {
    type: 'trade' | 'transfer' | 'receipt';
    title: string;
    details: Record<string, string>;
  };
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'INVOICE_YIELD' | 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'BURN' | 'TRADE' | 'TOKENIZATION' | 'INVOICE_FUND' | 'DEBTBRIDGE_LOAN';
  title: string;
  amountUSD: number;
  amountZIG: number;
  timestamp: string;
  status: 'Completed' | 'Pending';
  reference: string;
  txHash?: string;
  blockNumber?: number;
  confirmations?: number;
  category?: 'SWAP' | 'TOKENIZATION' | 'DEPOSIT' | 'TRANSFER' | 'DIVIDEND' | 'INVOICE_YIELD' | 'BURN' | 'TRADE' | 'INVOICE_FUND' | 'DEBTBRIDGE_LOAN';
  gasSponsored?: boolean;
  receiver?: string;
  sender?: string;
}

export interface IndexedTransaction {
  id: string;
  txHash: string;
  category: 'SWAP' | 'TOKENIZATION' | 'DEPOSIT' | 'TRANSFER' | 'DIVIDEND' | 'INVOICE_YIELD' | 'BURN';
  method: string;
  title: string;
  blockNumber: number;
  timestamp: string;
  status: 'Confirmed' | 'Finalized' | 'Pending';
  confirmations: number;
  gasUsedETH: string;
  gasFeeUSD: number;
  fromAddress: string;
  toAddress: string;
  contractAddress?: string;
  amountUSD: number;
  amountZIG: number;
  explorerUrl: string;
  eventSignature?: string;
  swapDetails?: {
    tokenIn: string;
    tokenInAmount: number;
    tokenOut: string;
    tokenOutAmount: number;
    feeTier: string;
    executionPriceUSD: number;
    route: string[];
    poolAddress: string;
  };
  tokenizationDetails?: {
    ticker: string;
    companyName: string;
    sharesMinted: number;
    parValueUSD: number;
    valuationUSD: number;
    tokenStandard: string;
    seczimFilingId: string;
    custodianEscrow: string;
    initialLiquidityUSD: number;
  };
  burnDetails?: {
    ticker: string;
    companyName: string;
    burnedShares: number;
    remainingShares: number;
    isFullDelisting: boolean;
    reason: string;
    seczimFilingId: string;
    custodianEscrow: string;
    payoutPerShareUSD: number;
    totalRedemptionPayoutUSD: number;
  };
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  authProvider: 'BASE_ACCOUNT' | 'METAMASK' | 'COINBASE_CDP' | 'INJECTED' | 'EMAIL' | 'SMS';
  email?: string;
  phoneNumber?: string;
  role?: 'RETAIL' | 'INSTITUTIONAL' | 'ISSUER';
  createdAt: string;
  lastLoginAt: string;
  ip?: string;
  userAgent?: string;
}

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

export interface UserSession {
  sessionId: string;
  walletAddress: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  isValid: boolean;
}

export interface UserActivityLog {
  id: string;
  walletAddress: string;
  action: 'SIGN_IN' | 'SIGN_OUT' | 'DEPOSIT' | 'BUY_SHARES' | 'EXECUTE_SWAP' | 'FUND_INVOICE' | 'PLACE_ORDER' | 'TOKENIZE_ASSET' | 'AI_ADVISOR' | 'BASE_PAY';
  details?: Record<string, any>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

