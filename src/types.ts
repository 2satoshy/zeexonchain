export type TabType = 'dashboard' | 'shares' | 'invoiceX' | 'debtBridge' | 'zig' | 'whatsapp' | 'aiAdvisor' | 'social';

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
  riskRating: 'Low' | 'Medium' | 'Growth';
  image: string;
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
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'INVOICE_YIELD' | 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';
  title: string;
  amountUSD: number;
  amountZIG: number;
  timestamp: string;
  status: 'Completed' | 'Pending';
  reference: string;
}
