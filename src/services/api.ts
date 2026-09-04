import { SMEStock, InvoiceItem, DebtBridgeLoan, Transaction, TokenAsset, SocialPost, TradeOrder, UserProfile, UserPortfolio, UserActivityLog, AiBrokerActionDetail, AiAdvisorResponse } from '../types';

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

export const ApiService = {
  // System & Health
  async getHealth() {
    return fetchJson<{ status: string; version: string; network: string }>('/health');
  },

  async getSecZimStatus() {
    return fetchJson<{ success: boolean; data: any }>('/seczim/status');
  },

  // User Auth, Profiles & Activity Logs
  async getUserProfile(address: string) {
    return fetchJson<{ success: boolean; data: { user: UserProfile; portfolio: UserPortfolio; recentActivity: UserActivityLog[] } }>(`/auth/me?address=${encodeURIComponent(address)}`);
  },

  async getAllUsers() {
    return fetchJson<{ success: boolean; count: number; data: UserProfile[] }>('/auth/users');
  },

  async getUserActivity(address?: string, limit = 50) {
    const query = address ? `?address=${encodeURIComponent(address)}&limit=${limit}` : `?limit=${limit}`;
    return fetchJson<{ success: boolean; count: number; data: UserActivityLog[] }>(`/auth/activity${query}`);
  },

  async logUserActivity(walletAddress: string, action: UserActivityLog['action'], details?: Record<string, any>) {
    return fetchJson<{ success: boolean; data: UserActivityLog }>('/auth/activity', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, action, details }),
    });
  },

  async getOracleRates() {
    return fetchJson<{ success: boolean; data: any }>('/oracles/rates');
  },

  async getZigReserves() {
    return fetchJson<{ success: boolean; data: any }>('/zig/reserves');
  },

  async getIndexerStats() {
    return fetchJson<{ success: boolean; data: any }>('/indexer/stats');
  },

  // Stocks
  async getStocks(params?: { search?: string; sector?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.sector) query.append('sector', params.sector);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<{ success: boolean; count: number; data: SMEStock[] }>(`/stocks${queryString}`);
  },

  async getStockById(id: string) {
    return fetchJson<{ success: boolean; data: SMEStock }>(`/stocks/${encodeURIComponent(id)}`);
  },

  async buyShares(stockId: string, usdAmount: number, units: number, walletAddress?: string) {
    return fetchJson<{ success: boolean; message: string; data: { stock: SMEStock; transaction: Transaction; unitsPurchased: number } }>('/stocks/buy', {
      method: 'POST',
      body: JSON.stringify({ stockId, usdAmount, units, walletAddress }),
    });
  },

  async buyStockShares(stockId: string, units: number, usdAmount: number, walletAddress?: string) {
    return this.buyShares(stockId, usdAmount, units, walletAddress);
  },

  async tokenizeStock(data: {
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
  }) {
    return fetchJson<{ success: boolean; message: string; data: { stock: SMEStock; transaction: Transaction } }>('/stocks/tokenize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async burnStock(
    dataOrStockId: string | {
      stockId: string;
      burnedShares: number;
      reason: string;
      seczimFilingId?: string;
      payoutPerShareUSD?: number;
    },
    options?: {
      sharesToBurn: number;
      isFullDelisting?: boolean;
      reason?: string;
      filingId?: string;
      payoutPerShareUSD?: number;
    }
  ) {
    const payload = typeof dataOrStockId === 'string'
      ? {
          stockId: dataOrStockId,
          burnedShares: options?.sharesToBurn || 0,
          reason: options?.reason || 'Corporate Action / Stock Delisting',
          seczimFilingId: options?.filingId,
          payoutPerShareUSD: options?.payoutPerShareUSD
        }
      : dataOrStockId;

    return fetchJson<{ success: boolean; message: string; data: { stock: SMEStock; transaction: Transaction; burnedShares: number } }>('/stocks/burn', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // DEX Trading & Tokens
  async getTokens() {
    return fetchJson<{ success: boolean; count: number; data: TokenAsset[] }>('/dex/tokens');
  },

  async getDexQuote(fromSymbol: string, toSymbol: string, amountIn: number) {
    return fetchJson<{ success: boolean; data: any }>('/dex/quote', {
      method: 'POST',
      body: JSON.stringify({ fromSymbol, toSymbol, amountIn }),
    });
  },

  async executeSwap(fromSymbol: string, toSymbol: string, amountIn: number, walletAddress?: string) {
    return fetchJson<{ success: boolean; message: string; data: { quote: any; transaction: Transaction } }>('/dex/swap', {
      method: 'POST',
      body: JSON.stringify({ fromSymbol, toSymbol, amountIn, walletAddress }),
    });
  },

  async getOrders() {
    return fetchJson<{ success: boolean; count: number; data: TradeOrder[] }>('/dex/orders');
  },

  async createOrder(order: Omit<TradeOrder, 'id' | 'status' | 'timestamp' | 'txHash'>) {
    return fetchJson<{ success: boolean; message: string; data: TradeOrder }>('/dex/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  async cancelOrder(orderId: string) {
    return fetchJson<{ success: boolean; message: string }>(`/dex/orders/${orderId}`, {
      method: 'DELETE',
    });
  },

  // Invoices & Factoring
  async getInvoices() {
    return fetchJson<{ success: boolean; count: number; data: InvoiceItem[] }>('/invoices');
  },

  async getInvoiceById(id: string) {
    return fetchJson<{ success: boolean; data: InvoiceItem }>(`/invoices/${id}`);
  },

  async createInvoice(data: {
    smeName: string;
    buyerName: string;
    amountUSD: number;
    discountRate: number;
    tenorDays: number;
    dueDate?: string;
  }) {
    return fetchJson<{ success: boolean; message: string; data: InvoiceItem }>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async fundInvoice(invoiceId: string, amountUSD: number, investorAddress?: string) {
    return fetchJson<{ success: boolean; message: string; data: { invoice: InvoiceItem; transaction: Transaction } }>('/invoices/fund', {
      method: 'POST',
      body: JSON.stringify({ invoiceId, amountUSD, investorAddress }),
    });
  },

  // DebtBridge Loans
  async getLoans() {
    return fetchJson<{ success: boolean; count: number; data: DebtBridgeLoan[] }>('/loans');
  },

  async createLoan(data: {
    borrowerName: string;
    collateralType: string;
    collateralValueUSD: number;
    loanAmountUSD: number;
    interestRate: number;
    durationMonths: number;
  }) {
    return fetchJson<{ success: boolean; message: string; data: DebtBridgeLoan }>('/loans/borrow', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async requestLoan(data: {
    borrowerName: string;
    collateralType: string;
    collateralValueUSD: number;
    loanAmountUSD: number;
    interestRate: number;
    durationMonths: number;
  }) {
    return this.createLoan(data);
  },

  // Wallet & Portfolio
  async getPortfolio() {
    return fetchJson<{ success: boolean; data: any }>('/wallet/portfolio');
  },

  async getTransactions(limit = 50) {
    return fetchJson<{ success: boolean; count: number; data: Transaction[] }>(`/wallet/transactions?limit=${limit}`);
  },

  async deposit(amount: number, tokenSymbol: string, rail: string, walletAddress?: string) {
    return fetchJson<{ success: boolean; message: string; data: { transaction: Transaction; newBalance: number } }>('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, tokenSymbol, rail, walletAddress }),
    });
  },

  async depositFunds(data: { amountUSD: number; method: string; reference?: string; walletAddress?: string }) {
    return this.deposit(data.amountUSD, 'USDC', data.method || 'Base Pay', data.walletAddress);
  },

  async send(amount: number, tokenSymbol: string, recipient: string, senderAddress?: string) {
    return fetchJson<{ success: boolean; message: string; data: { transaction: Transaction } }>('/wallet/send', {
      method: 'POST',
      body: JSON.stringify({ amount, tokenSymbol, recipient, senderAddress }),
    });
  },

  async claimDividends(action: 'claim' | 'compound') {
    return fetchJson<{ success: boolean; action: string; amountUSD: number; transaction?: Transaction }>('/wallet/dividends', {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  async requestFaucet(tokenSymbol: string) {
    return fetchJson<{ success: boolean; message: string; data: any }>('/wallet/faucet', {
      method: 'POST',
      body: JSON.stringify({ tokenSymbol }),
    });
  },

  // Social Feed
  async getSocialPosts() {
    return fetchJson<{ success: boolean; count: number; data: SocialPost[] }>('/social/posts');
  },

  async createSocialPost(post: Partial<SocialPost>) {
    return fetchJson<{ success: boolean; message: string; data: SocialPost }>('/social/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  },

  async likePost(postId: string) {
    return fetchJson<{ success: boolean }>(`/social/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  // AI & Bot
  async getAiAdvice(prompt: string, portfolioContext?: any, autoExecute?: boolean, walletAddress?: string) {
    return fetchJson<AiAdvisorResponse>('/ai-advisor', {
      method: 'POST',
      body: JSON.stringify({ prompt, portfolioContext, autoExecute, walletAddress }),
    });
  },

  async executeAiAction(action: AiBrokerActionDetail, walletAddress?: string) {
    return fetchJson<{
      success: boolean;
      message: string;
      transaction?: Transaction;
      updatedAction: AiBrokerActionDetail;
      updatedPortfolio?: any;
    }>('/ai-advisor/execute', {
      method: 'POST',
      body: JSON.stringify({ action, walletAddress }),
    });
  },

  async simulateWhatsApp(message: string, phoneNumber?: string) {
    return fetchJson<{ reply: string; actionCard?: any; timestamp: string }>('/whatsapp/simulate', {
      method: 'POST',
      body: JSON.stringify({ message, phoneNumber }),
    });
  },

  async getMarketNews() {
    return fetchJson<{ news: any[]; grounded: boolean }>('/market-news');
  },

  // MongoDB Status & Database Sync
  async getMongoStatus() {
    return fetchJson<{
      success: boolean;
      database: string;
      network: string;
      status: {
        connected: boolean;
        connecting: boolean;
        dbName: string;
        uriConfigured: boolean;
        mode: string;
        message: string;
        lastConnectedAt?: string;
        collections?: { [key: string]: number };
        error?: string;
      };
    }>('/mongodb/status');
  },

  async syncMongoDatabase() {
    return fetchJson<{ success: boolean; message: string; status: any }>('/mongodb/sync', {
      method: 'POST',
    });
  },

  // Base Pay Database Tracking
  async recordBasePayment(payment: {
    id: string;
    amountUSD: number;
    recipient: string;
    payerAddress?: string;
    purpose?: string;
    status?: 'INITIATED' | 'BROADCASTED' | 'CONFIRMED' | 'FAILED';
    testnet?: boolean;
    txHash?: string;
  }) {
    return fetchJson<{ success: boolean; message: string; data: any }>('/base-pay/record', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  },

  async getBasePaymentHistory(limit = 50) {
    return fetchJson<{ success: boolean; count: number; data: any[] }>(`/base-pay/history?limit=${limit}`);
  },

  async getBasePaymentById(id: string) {
    return fetchJson<{ success: boolean; data: any }>(`/base-pay/${encodeURIComponent(id)}`);
  },

  async verifyBasePayment(id: string, status: string, txHash?: string) {
    return fetchJson<{ success: boolean; message: string; data: any }>('/base-pay/verify', {
      method: 'POST',
      body: JSON.stringify({ id, status, txHash }),
    });
  },

  // Base B20 $ZIG Stablecoin
  async getZigTokenDetails() {
    return fetchJson<{ success: boolean; data: any }>('/zig/token');
  },

  async mintZigSupply(amount: number, recipientAddress?: string, memo?: string) {
    return fetchJson<{ success: boolean; message: string; data: any }>('/zig/mint', {
      method: 'POST',
      body: JSON.stringify({ amount, recipientAddress, memo }),
    });
  },

  async burnZigSupply(amount: number, ownerAddress?: string, memo?: string) {
    return fetchJson<{ success: boolean; message: string; data: any }>('/zig/burn', {
      method: 'POST',
      body: JSON.stringify({ amount, ownerAddress, memo }),
    });
  },

  async getZigOperations(limit = 20) {
    return fetchJson<{ success: boolean; count: number; data: any[] }>(`/zig/operations?limit=${limit}`);
  },

  // Airdrop Allocation (1,000 $ZIG Stablecoin + 400 SME Stock Tokens)
  async claimAirdrop(walletAddress: string) {
    return fetchJson<{
      success: boolean;
      alreadyClaimed: boolean;
      transfers: Array<{ symbol: string; amount: number; txHash?: string; status: string }>;
      message: string;
    }>('/airdrop/claim', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  },

  async getAirdropStatus(walletAddress: string) {
    return fetchJson<{
      success: boolean;
      walletAddress: string;
      claimed: boolean;
      claimedAt?: string;
      transfers?: any[];
      totalTokensReceived?: number;
    }>(`/airdrop/status?address=${encodeURIComponent(walletAddress)}`);
  }
};
