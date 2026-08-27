import { SMEStock, InvoiceItem, DebtBridgeLoan, Transaction, SocialPost } from '../types';

export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    authorName: 'Chipo & Rumbidzai',
    authorHandle: '@borrowdale_queens',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    badge: 'Top Investors',
    content: 'Weekend shopping spree at Borrowdale Village Walk! Funded entirely by Q3 dividend payouts from our Nyanga Solar (NYNG.zx) and Takura Agro tokenized shares. Who needs traditional brokers? 💅🇿🇼',
    timestamp: '1 hour ago',
    imageUrl: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&w=800&q=80',
    mediaType: 'lifestyle',
    likes: 245,
    comments: 32,
    isLiked: true
  },
  {
    id: 'post-2',
    authorName: 'Tariro "The Bull" Gumbo',
    authorHandle: '@vicfalls_tycoon',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    badge: 'SME Whale',
    content: 'Chilling at the Devil’s Pool right at the edge of Victoria Falls. When your ZEEX Onchain working capital yields are printing daily in USD stablecoins, every day feels like a vacation! 🌊🇿🇼',
    timestamp: '3 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80',
    mediaType: 'flex',
    likes: 412,
    comments: 58,
    isLiked: false
  },
  {
    id: 'post-3',
    authorName: 'Flashy Wicknell C.',
    authorHandle: '@onchain_tycoon',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    badge: 'VIP Legend',
    content: 'First Class VIP cabin on my way back to Harare. 100,000 $ZIG staked, SBLOC credit line active via DebtBridge trust. Real wealth is onchain, transparent, and SECZim licensed! ✈️💎',
    timestamp: '5 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    mediaType: 'flex',
    likes: 890,
    comments: 112,
    isLiked: true
  },
  {
    id: 'post-4',
    authorName: 'Dr. T. Makoni',
    authorHandle: '@borrowdale_brooke',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    badge: 'Estate Owner',
    content: 'Just closed on my new double-story smart home in Borrowdale Brooke using a DebtBridge Securities-Backed Line of Credit (SBLOC) against my ZSE token portfolio. Zero liquidation risk, 100% compliant!',
    timestamp: 'Yesterday',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    mediaType: 'lifestyle',
    likes: 520,
    comments: 64,
    isLiked: false
  },
  {
    id: 'post-5',
    authorName: 'Farai Ncube',
    authorHandle: '@bulawayo_lambo',
    authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    badge: 'Top Trader',
    content: 'Picking up the new Lamborghini Urus at the showroom. Paid via Base L2 USDC instant settlement. Who said you cannot flex regulated capital market gains in Zimbabwe? 🏎️🔥',
    timestamp: '2 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80',
    mediaType: 'meme',
    likes: 1250,
    comments: 180,
    isLiked: false
  }
];

export const generateStockPriceHistory = (basePriceUSD: number, trendMultiplier = 1) => {
  const points = [
    { offsetDays: 6, label: '6d ago', factor: 0.92 * trendMultiplier },
    { offsetDays: 5, label: '5d ago', factor: 0.95 * trendMultiplier },
    { offsetDays: 4, label: '4d ago', factor: 0.93 * trendMultiplier },
    { offsetDays: 3, label: '3d ago', factor: 0.97 * trendMultiplier },
    { offsetDays: 2, label: '2d ago', factor: 0.96 * trendMultiplier },
    { offsetDays: 1, label: 'Yesterday', factor: 0.99 * trendMultiplier },
    { offsetDays: 0, label: 'Today', factor: 1.0 },
  ];

  return points.map(p => {
    const price = Math.max(0.01, Math.round(basePriceUSD * p.factor * 100) / 100);
    return {
      date: p.label,
      priceUSD: price,
      priceZIG: Math.round(price * 26 * 100) / 100,
      volume: Math.floor(12000 + Math.random() * 45000)
    };
  });
};

export const INITIAL_STOCKS: SMEStock[] = [
  {
    id: 'sme-1',
    name: 'Takura Agro-Processing Ltd',
    ticker: 'TKRA.zx',
    sector: 'Agribusiness & Export',
    priceUSD: 1.25,
    priceZIG: 32.50,
    change1h: 0.12,
    change24h: 4.2,
    marketCap: '$4.20M',
    volume24h: '$184.50K',
    txns24h: 1420,
    tradersCount: 842,
    age: '4mo',
    dividendYield: 9.8,
    fractionalUnitsAvailable: 850000,
    backingTrust: 'ZSE Debtbridge Trust #402',
    description: 'Leading macadamia and tobacco processing exporter in Manicaland supplying EU markets. Fully tokenized with 1:1 SECZim custody.',
    riskRating: 'Growth',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    priceHistory: [
      { date: 'Mon', priceUSD: 1.15, priceZIG: 29.90, volume: 24500 },
      { date: 'Tue', priceUSD: 1.18, priceZIG: 30.68, volume: 31200 },
      { date: 'Wed', priceUSD: 1.16, priceZIG: 30.16, volume: 18400 },
      { date: 'Thu', priceUSD: 1.20, priceZIG: 31.20, volume: 42000 },
      { date: 'Fri', priceUSD: 1.22, priceZIG: 31.72, volume: 38900 },
      { date: 'Sat', priceUSD: 1.21, priceZIG: 31.46, volume: 14200 },
      { date: 'Sun', priceUSD: 1.25, priceZIG: 32.50, volume: 29800 }
    ]
  },
  {
    id: 'sme-2',
    name: 'Nyanga Solar & Clean Energy',
    ticker: 'NYNG.zx',
    sector: 'Renewable Infrastructure',
    priceUSD: 0.85,
    priceZIG: 22.10,
    change1h: 0.04,
    change24h: 1.8,
    marketCap: '$7.50M',
    volume24h: '$320.10K',
    txns24h: 2180,
    tradersCount: 1290,
    age: '6mo',
    dividendYield: 11.2,
    fractionalUnitsAvailable: 620000,
    backingTrust: 'ZSE Debtbridge Trust #411',
    description: 'Commercial solar mini-grid operator powering industrial clusters across Harare and Mutare under long-term USD power purchase agreements.',
    riskRating: 'Low',
    image: 'https://images.unsplash.com/photo-1509391365360-e835036f47de?auto=format&fit=crop&w=600&q=80',
    priceHistory: [
      { date: 'Mon', priceUSD: 0.81, priceZIG: 21.06, volume: 55000 },
      { date: 'Tue', priceUSD: 0.82, priceZIG: 21.32, volume: 48000 },
      { date: 'Wed', priceUSD: 0.83, priceZIG: 21.58, volume: 62000 },
      { date: 'Thu', priceUSD: 0.82, priceZIG: 21.32, volume: 39000 },
      { date: 'Fri', priceUSD: 0.84, priceZIG: 21.84, volume: 71000 },
      { date: 'Sat', priceUSD: 0.84, priceZIG: 21.84, volume: 22000 },
      { date: 'Sun', priceUSD: 0.85, priceZIG: 22.10, volume: 68000 }
    ]
  },
  {
    id: 'sme-3',
    name: 'Bulawayo Textile Mills',
    ticker: 'BYO.zx',
    sector: 'Manufacturing',
    priceUSD: 0.45,
    priceZIG: 11.70,
    change1h: -0.08,
    change24h: -0.5,
    marketCap: '$1.80M',
    volume24h: '$95.40K',
    txns24h: 890,
    tradersCount: 452,
    age: '2mo',
    dividendYield: 14.5,
    fractionalUnitsAvailable: 940000,
    backingTrust: 'ZSE Debtbridge Trust #388',
    description: 'Historic cotton and synthetic fabric manufacturer supplying SADC retail chains with automated looms and steady regional cash flows.',
    riskRating: 'Medium',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
    priceHistory: [
      { date: 'Mon', priceUSD: 0.48, priceZIG: 12.48, volume: 19000 },
      { date: 'Tue', priceUSD: 0.47, priceZIG: 12.22, volume: 25000 },
      { date: 'Wed', priceUSD: 0.46, priceZIG: 11.96, volume: 18000 },
      { date: 'Thu', priceUSD: 0.47, priceZIG: 12.22, volume: 22000 },
      { date: 'Fri', priceUSD: 0.45, priceZIG: 11.70, volume: 31000 },
      { date: 'Sat', priceUSD: 0.46, priceZIG: 11.96, volume: 12000 },
      { date: 'Sun', priceUSD: 0.45, priceZIG: 11.70, volume: 28000 }
    ]
  },
  {
    id: 'sme-4',
    name: 'Zambezi Fresh Coldchain Logistics',
    ticker: 'ZMBI.zx',
    sector: 'Logistics & FMCG',
    priceUSD: 2.10,
    priceZIG: 54.60,
    change1h: 0.25,
    change24h: 6.7,
    marketCap: '$12.00M',
    volume24h: '$540.80K',
    txns24h: 4320,
    tradersCount: 2150,
    age: '5mo',
    dividendYield: 8.4,
    fractionalUnitsAvailable: 310000,
    backingTrust: 'ZSE Debtbridge Trust #450',
    description: 'Cold-storage supply chain connecting Zambian and Zimbabwean horticulture producers directly to supermarket distribution hubs.',
    riskRating: 'Low',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    priceHistory: [
      { date: 'Mon', priceUSD: 1.92, priceZIG: 49.92, volume: 34000 },
      { date: 'Tue', priceUSD: 1.95, priceZIG: 50.70, volume: 41000 },
      { date: 'Wed', priceUSD: 1.98, priceZIG: 51.48, volume: 53000 },
      { date: 'Thu', priceUSD: 2.02, priceZIG: 52.52, volume: 49000 },
      { date: 'Fri', priceUSD: 2.05, priceZIG: 53.30, volume: 64000 },
      { date: 'Sat', priceUSD: 2.07, priceZIG: 53.82, volume: 29000 },
      { date: 'Sun', priceUSD: 2.10, priceZIG: 54.60, volume: 72000 }
    ]
  },
  {
    id: 'sme-5',
    name: 'Great Zimbabwe Mining Tech',
    ticker: 'GZM.zx',
    sector: 'Green Minerals',
    priceUSD: 3.40,
    priceZIG: 88.40,
    change1h: 0.42,
    change24h: 12.4,
    marketCap: '$24.50M',
    volume24h: '$1.45M',
    txns24h: 8940,
    tradersCount: 3820,
    age: '8mo',
    dividendYield: 7.1,
    fractionalUnitsAvailable: 150000,
    backingTrust: 'ZSE Debtbridge Trust #512',
    description: 'Ethical lithium and tantalite processing plant utilizing AI ore-sorting technology with SECZim audited reserve backing.',
    riskRating: 'Growth',
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
    priceHistory: [
      { date: 'Mon', priceUSD: 2.95, priceZIG: 76.70, volume: 88000 },
      { date: 'Tue', priceUSD: 3.05, priceZIG: 79.30, volume: 94000 },
      { date: 'Wed', priceUSD: 3.12, priceZIG: 81.12, volume: 112000 },
      { date: 'Thu', priceUSD: 3.18, priceZIG: 82.68, volume: 105000 },
      { date: 'Fri', priceUSD: 3.28, priceZIG: 85.28, volume: 138000 },
      { date: 'Sat', priceUSD: 3.32, priceZIG: 86.32, volume: 45000 },
      { date: 'Sun', priceUSD: 3.40, priceZIG: 88.40, volume: 160000 }
    ]
  }
];

export const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-8841',
    smeName: 'Takura Agro-Processing Ltd',
    buyerName: 'Spar Zimbabwe Distribution (Pvt) Ltd',
    amountUSD: 45000,
    discountRate: 14.2,
    tenorDays: 60,
    expectedYieldUSD: 1050,
    fundedPercentage: 78,
    status: 'Funding',
    dueDate: '2026-10-18',
    riskScore: 'A (Low Risk)'
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-2026-9012',
    smeName: 'Nyanga Solar & Clean Energy',
    buyerName: 'Cresta Hotels Group',
    amountUSD: 85000,
    discountRate: 12.8,
    tenorDays: 90,
    expectedYieldUSD: 2680,
    fundedPercentage: 100,
    status: 'Active',
    dueDate: '2026-11-15',
    riskScore: 'AAA (Prime)'
  },
  {
    id: 'inv-103',
    invoiceNumber: 'INV-2026-9104',
    smeName: 'Zambezi Fresh Coldchain',
    buyerName: 'OK Zimbabwe Retail',
    amountUSD: 32000,
    discountRate: 15.0,
    tenorDays: 45,
    expectedYieldUSD: 590,
    fundedPercentage: 45,
    status: 'Funding',
    dueDate: '2026-10-02',
    riskScore: 'A- (Stable)'
  }
];

export const INITIAL_LOANS: DebtBridgeLoan[] = [
  {
    id: 'loan-1',
    borrowerName: 'Bulawayo Textile Mills',
    collateralType: '150,000 BYO.zx Share Tokens in Escrow',
    collateralValueUSD: 67500,
    loanAmountUSD: 40000,
    interestRate: 13.5,
    durationMonths: 6,
    status: 'Active',
    ltvRatio: 59.2
  },
  {
    id: 'loan-2',
    borrowerName: 'Takura Agro-Processing Ltd',
    collateralType: 'Warehouse Receipt & 80,000 TKRA.zx',
    collateralValueUSD: 120000,
    loanAmountUSD: 75000,
    interestRate: 12.0,
    durationMonths: 12,
    status: 'Active',
    ltvRatio: 62.5
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'BUY',
    title: 'Bought 400 units of NYNG.zx',
    amountUSD: 340.00,
    amountZIG: 8840.00,
    timestamp: 'Today, 14:22',
    status: 'Completed',
    reference: 'BASE-TX-998241'
  },
  {
    id: 'tx-2',
    type: 'DIVIDEND',
    title: 'Quarterly Dividend Payout (TKRA.zx)',
    amountUSD: 48.50,
    amountZIG: 1261.00,
    timestamp: 'Yesterday',
    status: 'Completed',
    reference: 'ZSE-DIV-77102'
  },
  {
    id: 'tx-3',
    type: 'DEPOSIT',
    title: 'EcoCash / USDC Onramp via Base',
    amountUSD: 1000.00,
    amountZIG: 26000.00,
    timestamp: '3 days ago',
    status: 'Completed',
    reference: 'BASE-DEP-55219'
  }
];
