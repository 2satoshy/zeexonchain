import React, { useState, useRef, useEffect } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Send, 
  Building2, 
  ArrowRightLeft, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Coins, 
  CircleDollarSign, 
  Sparkles, 
  Check, 
  Landmark, 
  Gem, 
  Wallet,
  ExternalLink,
  Info,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpRight
} from 'lucide-react';
import { SMEStock, TokenAsset, TabType, CurrencyMode } from '../types';
import { useCurrency } from '../context/CurrencyContext';

export type { CurrencyMode };

interface HomeHeroSwipeCardProps {
  stocks: SMEStock[];
  tokens?: TokenAsset[];
  totalBalanceUSD: number;
  zigBalance: number;
  oracleRate?: number; // USD to ZIG, default 26.00
  setActiveTab: (tab: TabType) => void;
  onQuickAction: (action: string) => void;
  onOpenDeposit?: () => void;
  onOpenSend?: () => void;
  onOpenSwap?: () => void;
  onOpenTokenize?: () => void;
}

export interface UserAssetItem {
  id: string;
  name: string;
  symbol: string;
  category: 'stocks' | 'stablecoins' | 'currencies' | 'crypto' | 'nfts';
  categoryLabel: string;
  balance: number;
  balanceFormatted: string;
  valueUSD: number;
  valueZIG: number;
  priceUSD: number;
  priceZIG: number;
  change24h?: number;
  icon: string;
  badge?: string;
  contractStandard?: string;
  description?: string;
  actionTab?: TabType;
  nftDetails?: {
    tokenId: string;
    collection: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
}

export const HomeHeroSwipeCard: React.FC<HomeHeroSwipeCardProps> = ({
  stocks,
  tokens = [],
  totalBalanceUSD,
  zigBalance,
  oracleRate = 26.00,
  setActiveTab,
  onQuickAction,
  onOpenDeposit,
  onOpenSend,
  onOpenSwap,
  onOpenTokenize,
}) => {
  // Card 0: Overview & Quick Actions, Card 1: All Asset Balances
  const [activeCardIndex, setActiveCardIndex] = useState<0 | 1>(0);
  const { 
    currencyMode, 
    setCurrencyMode, 
    oracleRate: contextOracleRate,
    formatAmount: globalFormatAmount 
  } = useCurrency();
  const effectiveOracleRate = oracleRate || contextOracleRate || 26.00;
  const [assetFilter, setAssetFilter] = useState<'all' | 'stocks' | 'stablecoins' | 'currencies' | 'crypto' | 'nfts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currencyNotification, setCurrencyNotification] = useState<string | null>(null);

  // Swipe handling state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const dragStartX = useRef<number | null>(null);

  // Toggle currency handler (updates global platform state)
  const handleToggleCurrency = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextMode: CurrencyMode = currencyMode === 'USD' ? 'ZIG' : 'USD';
    setCurrencyMode(nextMode);
    setCurrencyNotification(`Platform valuation display set to ${nextMode === 'ZIG' ? 'Zimbabwe Gold (ZIG @ 26.00)' : 'US Dollars (USD)'}`);
    setTimeout(() => {
      setCurrencyNotification(null);
    }, 2500);
  };

  // Format currency helper
  const formatAmount = (usdValue: number, showSymbol = true) => {
    return globalFormatAmount(usdValue, showSymbol);
  };

  // Helper to get live balance for symbol from tokens prop if available
  const getLiveToken = (symbol: string) => {
    if (!tokens || tokens.length === 0) return null;
    return tokens.find(t => t.symbol === symbol || (symbol === 'TEA' && t.symbol === 'NYTEA') || (symbol === 'NYTEA' && t.symbol === 'TEA'));
  };

  const getLiveBal = (symbol: string, defaultBal: number) => {
    const live = getLiveToken(symbol);
    return live !== null && live !== undefined ? live.balance : defaultBal;
  };

  // Comprehensive user asset list across all required categories
  const teaBal = getLiveBal('TEA', 550);
  const mukuruBal = getLiveBal('MUKURU', 320);
  const simbaBal = getLiveBal('SIMBA', 800);
  const bambaBal = getLiveBal('BAMBA', 1250);
  const usdcBal = getLiveBal('USDC', 1420.50);
  const zigBal = getLiveBal('ZIG', 36933.00);
  const ethBal = getLiveBal('ETH', 0.35);
  const wethBal = getLiveBal('WETH', 0.15);

  const allUserAssets: UserAssetItem[] = [
    // 1. Stocks & Token Equities
    {
      id: 'stock-tea',
      name: 'Nyanga Specialty Tea Equity',
      symbol: 'TEA',
      category: 'stocks',
      categoryLabel: 'Tokenized Stock',
      balance: teaBal,
      balanceFormatted: `${teaBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Shares`,
      valueUSD: teaBal * 1.60,
      valueZIG: teaBal * 1.60 * oracleRate,
      priceUSD: 1.60,
      priceZIG: 1.60 * oracleRate,
      change24h: 4.5,
      icon: '🍃',
      badge: 'SECZim Licensed',
      contractStandard: 'ERC-3643',
      description: 'Export agricultural equity with 14% USD dividend payout',
      actionTab: 'shares'
    },
    {
      id: 'stock-mukuru',
      name: 'Mukuru Macadamia & Avocado Exporters',
      symbol: 'MUKURU',
      category: 'stocks',
      categoryLabel: 'Tokenized Stock',
      balance: mukuruBal,
      balanceFormatted: `${mukuruBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Shares`,
      valueUSD: mukuruBal * 2.36,
      valueZIG: mukuruBal * 2.36 * oracleRate,
      priceUSD: 2.36,
      priceZIG: 2.36 * oracleRate,
      change24h: 6.2,
      icon: '🥑',
      badge: 'Horticulture RWA',
      contractStandard: 'ERC-3643',
      description: 'Dutch auction macadamia processing & EU export facility',
      actionTab: 'shares'
    },
    {
      id: 'stock-simba',
      name: 'Simba Solar Micro-Grids',
      symbol: 'SIMBA',
      category: 'stocks',
      categoryLabel: 'Tokenized Stock',
      balance: simbaBal,
      balanceFormatted: `${simbaBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Shares`,
      valueUSD: simbaBal * 0.85,
      valueZIG: simbaBal * 0.85 * oracleRate,
      priceUSD: 0.85,
      priceZIG: 0.85 * oracleRate,
      change24h: 12.1,
      icon: '☀️',
      badge: 'Clean Energy',
      contractStandard: 'ERC-3643',
      description: 'Distributed solar power plants across Manicaland',
      actionTab: 'shares'
    },
    {
      id: 'stock-bamba',
      name: 'Bamba Cold Chain Logistics',
      symbol: 'BAMBA',
      category: 'stocks',
      categoryLabel: 'Tokenized Stock',
      balance: bambaBal,
      balanceFormatted: `${bambaBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Shares`,
      valueUSD: bambaBal * 0.42,
      valueZIG: bambaBal * 0.42 * oracleRate,
      priceUSD: 0.42,
      priceZIG: 0.42 * oracleRate,
      change24h: 8.4,
      icon: '🚛',
      badge: 'Cold Chain',
      contractStandard: 'ERC-3643',
      description: 'Refrigerated fleet transporting agricultural produce to ports',
      actionTab: 'shares'
    },

    // 2. Stablecoins
    {
      id: 'coin-usdc',
      name: 'USD Coin (Base L2)',
      symbol: 'USDC',
      category: 'stablecoins',
      categoryLabel: 'USD Stablecoin',
      balance: usdcBal,
      balanceFormatted: `${usdcBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`,
      valueUSD: usdcBal,
      valueZIG: usdcBal * oracleRate,
      priceUSD: 1.00,
      priceZIG: oracleRate,
      change24h: 0.01,
      icon: '💵',
      badge: 'Instant L2 Gasless',
      contractStandard: 'ERC-20',
      description: 'Native Base L2 dollar liquidity with Coinbase CDP integration',
      actionTab: 'trading'
    },
    {
      id: 'coin-zig',
      name: 'Zimbabwe Gold Stablecoin',
      symbol: '$ZIG',
      category: 'stablecoins',
      categoryLabel: 'Gold Stablecoin',
      balance: zigBal,
      balanceFormatted: `${zigBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ZIG`,
      valueUSD: zigBal / oracleRate,
      valueZIG: zigBal,
      priceUSD: 1 / oracleRate,
      priceZIG: 1.00,
      change24h: 0.05,
      icon: '🪙',
      badge: 'Gold Reserve Backed',
      contractStandard: 'ERC-20 (Base L2)',
      description: 'RBZ Reserve-verified gold-backed unit of account',
      actionTab: 'zig'
    },

    // 3. Currencies / Cash
    {
      id: 'curr-usd',
      name: 'USD Fiat Nostro Reserve',
      symbol: 'USD (Nostro)',
      category: 'currencies',
      categoryLabel: 'Fiat Cash',
      balance: 500.00,
      balanceFormatted: '$500.00 USD',
      valueUSD: 500.00,
      valueZIG: 500.00 * oracleRate,
      priceUSD: 1.00,
      priceZIG: oracleRate,
      change24h: 0.00,
      icon: '🏦',
      badge: 'Bank Custody',
      contractStandard: 'Offchain Bank Reserve',
      description: 'Direct banking cash balance in Harare nostro account',
      actionTab: 'trading'
    },
    {
      id: 'curr-zig-cash',
      name: 'ZIG Electronic Cash',
      symbol: 'ZIG (Bank)',
      category: 'currencies',
      categoryLabel: 'Electronic Fiat',
      balance: 13000.00,
      balanceFormatted: '13,000.00 ZIG',
      valueUSD: 500.00,
      valueZIG: 13000.00,
      priceUSD: 1 / oracleRate,
      priceZIG: 1.00,
      change24h: 0.00,
      icon: '💳',
      badge: 'ZiG RTGS',
      contractStandard: 'National Switch',
      description: 'Physical electronic bank balance linked for POS and local retail',
      actionTab: 'zig'
    },
    {
      id: 'curr-zar',
      name: 'South African Rand Settlement',
      symbol: 'ZAR',
      category: 'currencies',
      categoryLabel: 'Regional Fiat',
      balance: 9100.00,
      balanceFormatted: 'R 9,100.00 ZAR',
      valueUSD: 500.00,
      valueZIG: 500.00 * oracleRate,
      priceUSD: 0.0549,
      priceZIG: 0.0549 * oracleRate,
      change24h: -0.4,
      icon: '🇿🇦',
      badge: 'SADC Trade Corridor',
      contractStandard: 'Cross-border Clearing',
      description: 'Regional currency liquidity pool for cross-border logistics settlements',
      actionTab: 'trading'
    },

    // 4. Crypto Assets
    {
      id: 'crypto-eth',
      name: 'Ethereum (Base L2)',
      symbol: 'ETH',
      category: 'crypto',
      categoryLabel: 'Native Crypto',
      balance: ethBal,
      balanceFormatted: `${ethBal.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 4 })} ETH`,
      valueUSD: ethBal * 2700.00,
      valueZIG: ethBal * 2700.00 * oracleRate,
      priceUSD: 2700.00,
      priceZIG: 2700.00 * oracleRate,
      change24h: 3.2,
      icon: '🔷',
      badge: 'Layer 2 Native',
      contractStandard: 'Native Gas',
      description: 'Base L2 rollup gas & decentralized finance collateral',
      actionTab: 'trading'
    },
    {
      id: 'crypto-weth',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      category: 'crypto',
      categoryLabel: 'DEX Crypto',
      balance: wethBal,
      balanceFormatted: `${wethBal.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 4 })} WETH`,
      valueUSD: wethBal * 2700.00,
      valueZIG: wethBal * 2700.00 * oracleRate,
      priceUSD: 2700.00,
      priceZIG: 2700.00 * oracleRate,
      change24h: 3.2,
      icon: '🟣',
      badge: 'Uniswap V3 Pair',
      contractStandard: 'ERC-20',
      description: 'Automated market maker pool liquidity for Base DEX trading',
      actionTab: 'trading'
    },
    {
      id: 'crypto-cbbtc',
      name: 'Coinbase Wrapped Bitcoin',
      symbol: 'cbBTC',
      category: 'crypto',
      categoryLabel: 'Digital Gold',
      balance: 0.005,
      balanceFormatted: '0.0050 cbBTC',
      valueUSD: 325.00,
      valueZIG: 325.00 * oracleRate,
      priceUSD: 65000.00,
      priceZIG: 65000.00 * oracleRate,
      change24h: 1.8,
      icon: '₿',
      badge: '1:1 BTC Backed',
      contractStandard: 'ERC-20 (Base L2)',
      description: 'Coinbase custody backed Bitcoin on Base L2 blockchain',
      actionTab: 'trading'
    },

    // 5. NFTs & Real World Asset Deeds
    {
      id: 'nft-borrowdale',
      name: 'Borrowdale Village Commercial Title Deed #1042',
      symbol: 'ZSE-DEED',
      category: 'nfts',
      categoryLabel: 'RWA Title Deed NFT',
      balance: 1,
      balanceFormatted: '1 Deed NFT',
      valueUSD: 1200.00,
      valueZIG: 1200.00 * oracleRate,
      priceUSD: 1200.00,
      priceZIG: 1200.00 * oracleRate,
      change24h: 0.0,
      icon: '📜',
      badge: 'Harare Deeds Office',
      contractStandard: 'ERC-721',
      description: 'Fractional land registry NFT deed lodged with Deeds Registry Harare',
      actionTab: 'shares',
      nftDetails: {
        tokenId: '#1042',
        collection: 'ZEEX RWA Real Estate Registry',
        image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=400&q=80',
        attributes: [
          { trait_type: 'Location', value: 'Borrowdale, Harare' },
          { trait_type: 'Square Meters', value: '1,450 sqm' },
          { trait_type: 'Rental Yield', value: '9.2% USD' }
        ]
      }
    },
    {
      id: 'nft-kariba',
      name: 'Kariba REDD+ Verified Carbon Credit #89',
      symbol: 'CARBON-NFT',
      category: 'nfts',
      categoryLabel: 'Green Asset NFT',
      balance: 1,
      balanceFormatted: '1 Carbon Batch NFT',
      valueUSD: 350.00,
      valueZIG: 350.00 * oracleRate,
      priceUSD: 350.00,
      priceZIG: 350.00 * oracleRate,
      change24h: 5.0,
      icon: '🌿',
      badge: 'Verra Certified',
      contractStandard: 'ERC-721',
      description: '100 Verified Carbon Units (VCUs) from Kariba forest conservation project',
      actionTab: 'shares',
      nftDetails: {
        tokenId: '#89',
        collection: 'Zim Carbon Exchange NFT',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
        attributes: [
          { trait_type: 'Standard', value: 'Verra VCS-902' },
          { trait_type: 'Vintage', value: '2025' },
          { trait_type: 'Offset Tons', value: '100 MT CO2e' }
        ]
      }
    },
    {
      id: 'nft-invoicex',
      name: 'InvoiceX Factor Receivable Debt Certificate #044',
      symbol: 'INVOICE-NOTE',
      category: 'nfts',
      categoryLabel: 'Receivable NFT',
      balance: 1,
      balanceFormatted: '1 Debt Note NFT',
      valueUSD: 450.00,
      valueZIG: 450.00 * oracleRate,
      priceUSD: 450.00,
      priceZIG: 450.00 * oracleRate,
      change24h: 1.2,
      icon: '📑',
      badge: '14.2% APY Yield',
      contractStandard: 'ERC-721',
      description: 'Senior secured working capital invoice discounting note for Delta Distribution',
      actionTab: 'invoiceX',
      nftDetails: {
        tokenId: '#044',
        collection: 'InvoiceX Liquidity Notes',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
        attributes: [
          { trait_type: 'Buyer', value: 'Delta Beverages Zimbabwe' },
          { trait_type: 'Maturity', value: '45 Days' },
          { trait_type: 'Annualized Yield', value: '14.2%' }
        ]
      }
    }
  ];

  // Filter assets by tab and search
  const filteredAssets = allUserAssets.filter((asset) => {
    const matchesCategory = assetFilter === 'all' || asset.category === assetFilter;
    const matchesSearch = searchQuery.trim() === '' || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate category totals for pill counts
  const countStocks = allUserAssets.filter(a => a.category === 'stocks').length;
  const countStablecoins = allUserAssets.filter(a => a.category === 'stablecoins').length;
  const countCurrencies = allUserAssets.filter(a => a.category === 'currencies').length;
  const countCrypto = allUserAssets.filter(a => a.category === 'crypto').length;
  const countNfts = allUserAssets.filter(a => a.category === 'nfts').length;

  // Selected NFT detail modal
  const [selectedNft, setSelectedNft] = useState<UserAssetItem | null>(null);

  // Swipe logic
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Horizontal swipe threshold: 45px, max perpendicular deviation: 70px
    if (Math.abs(diffX) > 45 && Math.abs(diffY) < 70) {
      if (diffX < 0) {
        // Swiped left -> show Card 2 (Asset Balances)
        setActiveCardIndex(1);
      } else {
        // Swiped right -> show Card 1 (Overview)
        setActiveCardIndex(0);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Mouse drag logic for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on main banner background, not on buttons or links
    if ((e.target as HTMLElement).closest('button, a, input')) return;
    e.stopPropagation();
    isDragging.current = true;
    dragStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging.current || dragStartX.current === null) return;
    const diffX = e.clientX - dragStartX.current;
    if (Math.abs(diffX) > 50) {
      if (diffX < 0) {
        setActiveCardIndex(1);
      } else {
        setActiveCardIndex(0);
      }
    }
    isDragging.current = false;
    dragStartX.current = null;
  };

  return (
    <div className="relative">
      {/* Toast Notification when switching currency */}
      {currencyNotification && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-1.5 rounded-full shadow-lg text-xs flex items-center space-x-1.5 animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{currencyNotification}</span>
        </div>
      )}

      {/* Main Swipeable Card Wrapper */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="select-none transition-all duration-300"
      >
        {/* ========================================================================= */}
        {/* CARD 0: OVERVIEW & QUICK ACTIONS (Optimized for all screen sizes)          */}
        {/* ========================================================================= */}
        {activeCardIndex === 0 && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 text-white shadow-xl relative overflow-hidden transition-all duration-300">
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Top Carousel Navigation Bar & Currency Switcher Pill */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 sm:mb-4 border-b border-slate-700/60">
              {/* Left: Section Label & Card 1 of 2 Badge */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="text-slate-200 font-bold uppercase tracking-wider text-[11px] sm:text-xs truncate">
                  Overview
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium bg-slate-800/90 text-slate-400 border border-slate-700/80 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                  Card 1 of 2
                </span>
              </div>

              {/* Right: Currency Toggle Pill & Next Card Controls */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                {/* Interactive Currency Switch Pill (never wraps into multiple broken lines) */}
                <button
                  onClick={handleToggleCurrency}
                  title="Click to toggle currency between USD and Local ZIG"
                  className="flex items-center space-x-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold text-emerald-300 transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap shrink-0"
                >
                  <RefreshCw className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline">
                    {currencyMode === 'USD' ? 'Switch to ZIG' : 'Switch to USD'}
                  </span>
                  <span className="sm:hidden">
                    {currencyMode === 'USD' ? '⇄ ZIG' : '⇄ USD'}
                  </span>
                </button>

                {/* Card Indicator Dots */}
                <div className="flex items-center space-x-1 shrink-0 bg-slate-800/80 px-2 py-1.5 rounded-full border border-slate-700/60">
                  <button
                    onClick={() => setActiveCardIndex(0)}
                    className="w-4 h-1.5 rounded-full bg-emerald-400 transition-all"
                    aria-label="Card 1"
                    title="Card 1: Overview"
                  />
                  <button
                    onClick={() => setActiveCardIndex(1)}
                    className="w-2 h-1.5 rounded-full bg-slate-500 hover:bg-slate-300 transition-all cursor-pointer"
                    aria-label="Card 2"
                    title="Card 2: All Assets"
                  />
                </div>

                {/* Next Card Arrow Button */}
                <button
                  onClick={() => setActiveCardIndex(1)}
                  title="View all asset balances (Stocks, Stablecoins, Crypto, Currencies, NFTs)"
                  className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0"
                >
                  <span className="hidden sm:inline text-xs">All Assets</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Balance & Action Controls */}
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
              <div className="space-y-2.5 flex-1 min-w-0">
                {/* Total Balance Amount + Currency Switch Tag + Monthly Growth Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  {/* Clickable Total Balance */}
                  <div 
                    onClick={handleToggleCurrency}
                    className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group select-none flex-wrap"
                    title="Click amount to switch between USD and Local Currency (ZIG)"
                  >
                    <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                      {formatAmount(totalBalanceUSD)}
                    </span>

                    {/* Currency Switcher Pill - single line with non-breaking text */}
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-slate-200 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 group-hover:border-emerald-500/40 transition-all whitespace-nowrap shrink-0 shadow-xs">
                      <span>{currencyMode}</span>
                      <span className="text-emerald-400 font-bold">⇄</span>
                      <span className="text-[10px] text-slate-400 font-normal">Click to switch</span>
                    </span>
                  </div>

                  {/* Growth Badge (Always single-line pill, never deformed or squished into an oval) */}
                  <div className="flex items-center shrink-0">
                    <span className="inline-flex items-center text-emerald-400 text-xs sm:text-sm font-semibold bg-emerald-500/10 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap shadow-xs">
                      <TrendingUp className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                      <span>+14.8% this month</span>
                    </span>
                  </div>
                </div>

                {/* Subtitle with Equivalent Currency Box - completely formatted to never wrap awkwardly */}
                <div 
                  onClick={handleToggleCurrency}
                  className="p-2.5 sm:p-3 rounded-xl bg-slate-850/90 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs select-none shadow-xs"
                  title="Click to toggle primary display between USD and ZIG"
                >
                  <div className="flex items-center space-x-1.5 flex-wrap min-w-0">
                    <span className="text-slate-400 text-[11px] shrink-0">Equivalent:</span>
                    {currencyMode === 'USD' ? (
                      <>
                        <span className="text-white font-bold font-mono text-[12px] sm:text-xs">
                          ZIG {(totalBalanceUSD * effectiveOracleRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-slate-400 text-[10px] sm:text-[11px] font-mono whitespace-nowrap shrink-0">
                          (@ {effectiveOracleRate.toFixed(2)} rate)
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-white font-bold font-mono text-[12px] sm:text-xs">
                          ${totalBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                        </span>
                        <span className="text-slate-400 text-[10px] sm:text-[11px] font-mono whitespace-nowrap shrink-0">
                          (@ {effectiveOracleRate.toFixed(2)} rate)
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 text-emerald-400 text-[11px] font-semibold group-hover:text-emerald-300 whitespace-nowrap shrink-0 pt-0.5 sm:pt-0">
                    <span>{currencyMode === 'USD' ? 'click to view in ZIG' : 'click to view in USD'}</span>
                    <ArrowRightLeft className="w-3 h-3 text-emerald-400 group-hover:rotate-180 transition-transform shrink-0" />
                  </div>
                </div>
              </div>

              {/* 4 Quick Action Buttons - 2x2 on mobile, 4 in a row on sm/md */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-2.5 w-full lg:w-auto shrink-0">
                <button
                  onClick={onOpenDeposit ? onOpenDeposit : () => onQuickAction('deposit')}
                  className="h-11 sm:h-12 flex items-center justify-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 sm:px-4 rounded-xl sm:rounded-2xl transition-all shadow-md text-xs sm:text-sm cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Deposit</span>
                </button>
                <button
                  onClick={onOpenSend ? onOpenSend : () => setActiveTab('profile')}
                  className="h-11 sm:h-12 flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 sm:px-4 rounded-xl sm:rounded-2xl transition-all shadow-md text-xs sm:text-sm cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>Send</span>
                </button>
                <button
                  onClick={onOpenSwap ? onOpenSwap : () => setActiveTab('trading')}
                  className="h-11 sm:h-12 flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-750 text-white font-bold px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-slate-700 transition-all text-xs sm:text-sm cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <ArrowRightLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Swap DEX</span>
                </button>
                <button
                  onClick={onOpenTokenize ? onOpenTokenize : () => setActiveTab('startupListing')}
                  className="h-11 sm:h-12 flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 sm:px-4 rounded-xl sm:rounded-2xl transition-all text-xs sm:text-sm cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>Tokenize</span>
                </button>
              </div>
            </div>

            {/* Mini Balance Breakdown Bar (4 cards from original design) */}
            <div className="mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              <div 
                onClick={() => setActiveTab('zig')}
                className="cursor-pointer bg-white/10 hover:bg-white/15 border border-white/15 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all group flex flex-col justify-between shadow-sm min-w-0"
                title="Go to $ZIG Hub & USDC Onramp"
              >
                <div className="flex justify-between items-center text-xs text-slate-300 font-medium mb-1">
                  <span className="truncate">USD / USDC</span>
                  <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0">↗</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white truncate">{formatAmount(1420.50)}</div>
              </div>

              <div 
                onClick={() => setActiveTab('zig')}
                className="cursor-pointer bg-white/10 hover:bg-white/15 border border-white/15 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all group flex flex-col justify-between shadow-sm min-w-0"
                title="Go to $ZIG Gold Stablecoin Hub"
              >
                <div className="flex justify-between items-center text-xs text-slate-300 font-medium mb-1">
                  <span className="truncate">$ZIG Stable</span>
                  <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0">↗</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-emerald-400 truncate">
                  {currencyMode === 'USD' ? 'ZIG 36,933' : '36,933 ZIG'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {currencyMode === 'USD' ? '≈ $1,420.50' : '(@ 26.00 rate)'}
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('shares')}
                className="cursor-pointer bg-white/10 hover:bg-white/15 border border-white/15 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all group flex flex-col justify-between shadow-sm min-w-0"
                title="Go to ZEEX Stocks & Fractional Access"
              >
                <div className="flex justify-between items-center text-xs text-slate-300 font-medium mb-1">
                  <span className="truncate">Token Equities</span>
                  <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0">↗</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white truncate">{formatAmount(2840.00)}</div>
              </div>

              <div 
                onClick={() => setActiveTab('invoiceX')}
                className="cursor-pointer bg-white/10 hover:bg-white/15 border border-white/15 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all group flex flex-col justify-between shadow-sm min-w-0"
                title="Go to InvoiceX Discounting"
              >
                <div className="flex justify-between items-center text-xs text-slate-300 font-medium mb-1">
                  <span className="truncate">Invoice Yield</span>
                  <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0">↗</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-blue-400 truncate">14.2% APY</div>
              </div>
            </div>

            {/* Bottom Swipe Cue Banner */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 gap-2">
              <div 
                onClick={() => setActiveCardIndex(1)}
                className="flex items-center space-x-2 cursor-pointer hover:text-white transition-colors group min-w-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="hidden sm:inline truncate">Swipe left ‹ › to view <strong>all asset balances</strong> (Stocks, Crypto, Currencies, NFTs)</span>
                <span className="sm:hidden text-[11px] truncate">Swipe left for <strong>all asset balances</strong></span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={() => setActiveCardIndex(0)}
                  className="w-4 h-1.5 rounded-full bg-emerald-400 transition-all"
                  aria-label="Card 1"
                  title="Card 1: Overview"
                />
                <button
                  onClick={() => setActiveCardIndex(1)}
                  className="w-2 h-1.5 rounded-full bg-slate-600 hover:bg-slate-400 transition-all cursor-pointer"
                  aria-label="Card 2"
                  title="Card 2: All Assets"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CARD 1: ALL ASSET BALANCES (Stocks, Stablecoins, Currencies, Crypto, NFTs) */}
        {/* ========================================================================= */}
        {activeCardIndex === 1 && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 text-white shadow-xl relative overflow-hidden transition-all duration-300">
            <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute left-0 bottom-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Top Navigation Row: Back, Currency Switcher & Card Dots */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-700/60">
              <button
                onClick={() => setActiveCardIndex(0)}
                className="px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center space-x-1 text-xs font-semibold shrink-0 active:scale-95 border border-slate-700/50"
                title="Return to Overview Card"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>

              <div className="flex items-center space-x-2">
                {/* Interactive Currency Switcher Pill */}
                <button
                  onClick={handleToggleCurrency}
                  title="Click to toggle currency between USD and Local ZIG"
                  className="flex items-center space-x-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold text-emerald-300 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                >
                  <RefreshCw className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Displaying: {currencyMode}</span>
                  <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">({currencyMode === 'USD' ? 'Click for ZIG' : 'Click for USD'})</span>
                  <span className="text-[10px] text-emerald-400 font-normal sm:hidden">⇄ {currencyMode === 'USD' ? 'ZIG' : 'USD'}</span>
                </button>

                {/* Card Indicator Dots */}
                <div className="flex items-center space-x-1 shrink-0 bg-slate-800/80 px-2 py-1 rounded-full border border-slate-700/60">
                  <button
                    onClick={() => setActiveCardIndex(0)}
                    className="w-2 h-1.5 rounded-full bg-slate-500 hover:bg-slate-300 transition-all cursor-pointer"
                    aria-label="Card 1"
                    title="Card 1: Overview"
                  />
                  <button
                    onClick={() => setActiveCardIndex(1)}
                    className="w-4 h-1.5 rounded-full bg-emerald-400 transition-all"
                    aria-label="Card 2"
                    title="Card 2: All Assets"
                  />
                </div>
              </div>
            </div>

            {/* Title & Subtitle Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  All Asset Balances
                </h3>
                <span className="text-[10px] sm:text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {allUserAssets.length} Holdings
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Stocks, Stablecoins, Currencies, Crypto & NFTs
              </div>
            </div>

            {/* Total Aggregate Value Banner */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-3 sm:p-4 mb-3 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <div>
                  <div className="text-[11px] sm:text-xs text-slate-400">Total Net Portfolio Balance across 5 Asset Classes</div>
                  <div 
                    onClick={handleToggleCurrency}
                    className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 cursor-pointer hover:text-emerald-400 transition-colors flex items-baseline space-x-2 select-none"
                    title="Click amount to switch between USD and ZIG"
                  >
                    <span>{formatAmount(totalBalanceUSD)}</span>
                    <span className="text-[10px] font-semibold text-emerald-400 underline decoration-dotted sm:no-underline sm:bg-emerald-500/10 sm:px-2 sm:py-0.5 sm:rounded-full">
                      {currencyMode} ⇄
                    </span>
                  </div>
                </div>

                <div 
                  onClick={handleToggleCurrency}
                  className="text-[11px] text-slate-400 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  {currencyMode === 'USD' ? (
                    <>≈ <span className="text-white font-semibold font-mono">ZIG {(totalBalanceUSD * effectiveOracleRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></>
                  ) : (
                    <>≈ <span className="text-white font-semibold font-mono">${totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span></>
                  )}
                </div>
              </div>

              {/* Metadata Badges - responsive grid with no awkward line breaks */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-xs">
                <div className="bg-slate-900/40 rounded-xl p-2 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Official Oracle FX</div>
                  <div className="font-mono text-emerald-400 font-bold text-[11px] sm:text-xs truncate whitespace-nowrap mt-0.5">
                    1 USD = {effectiveOracleRate.toFixed(2)} ZIG
                  </div>
                </div>
                <div className="bg-slate-900/40 rounded-xl p-2 border border-slate-800/80 text-right sm:text-left">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Custody Standard</div>
                  <div className="text-blue-300 font-semibold text-[11px] sm:text-xs truncate whitespace-nowrap mt-0.5">
                    CDP MPC • ERC-3643
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filter Chips Bar (with no-scrollbar) */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 mb-2.5 no-scrollbar touch-pan-x">
              <button
                onClick={() => setAssetFilter('all')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                  assetFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750'
                }`}
              >
                All ({allUserAssets.length})
              </button>
              <button
                onClick={() => setAssetFilter('stocks')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
                  assetFilter === 'stocks'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <span>📈 Stocks & Equities</span>
                <span className="text-[10px] opacity-75">({countStocks})</span>
              </button>
              <button
                onClick={() => setAssetFilter('stablecoins')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
                  assetFilter === 'stablecoins'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <span>💵 Stablecoins</span>
                <span className="text-[10px] opacity-75">({countStablecoins})</span>
              </button>
              <button
                onClick={() => setAssetFilter('currencies')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
                  assetFilter === 'currencies'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <span>🏦 Currencies</span>
                <span className="text-[10px] opacity-75">({countCurrencies})</span>
              </button>
              <button
                onClick={() => setAssetFilter('crypto')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
                  assetFilter === 'crypto'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <span>🔷 Crypto</span>
                <span className="text-[10px] opacity-75">({countCrypto})</span>
              </button>
              <button
                onClick={() => setAssetFilter('nfts')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
                  assetFilter === 'nfts'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <span>📜 NFTs & RWAs</span>
                <span className="text-[10px] opacity-75">({countNfts})</span>
              </button>
            </div>

            {/* Quick Search Filter Input */}
            <div className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stocks, crypto, currencies, NFTs by name or symbol..."
                className="w-full bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-400 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Assets List Grid with custom-scrollbar and responsive padding */}
            <div className="space-y-2 max-h-[380px] sm:max-h-[460px] md:max-h-[500px] overflow-y-auto pr-1 select-text custom-scrollbar pb-14 sm:pb-2">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    if (asset.category === 'nfts') {
                      setSelectedNft(asset);
                    } else if (asset.actionTab) {
                      setActiveTab(asset.actionTab);
                    }
                  }}
                  className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 group cursor-pointer active:scale-[0.99]"
                >
                  {/* Left: Icon and Asset Information */}
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-700/90 flex items-center justify-center text-lg sm:text-xl shrink-0 border border-slate-600/80 shadow-xs">
                      {asset.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-400 transition-colors truncate">
                          {asset.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-white/10 text-slate-300 shrink-0">
                          {asset.symbol}
                        </span>
                        {asset.badge && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                            {asset.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] text-slate-400 mt-0.5 flex-wrap">
                        <span className="text-slate-300 font-medium">{asset.categoryLabel}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-300">{asset.balanceFormatted}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400 text-[9px] sm:text-[10px]">{asset.contractStandard}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Value & Price Breakdown */}
                  <div className="flex items-center justify-between sm:justify-end sm:space-x-4 border-t sm:border-t-0 border-slate-700/50 pt-2 sm:pt-0 mt-0.5 sm:mt-0">
                    <div className="text-left sm:text-right">
                      {/* Clickable individual amount */}
                      <div 
                        onClick={handleToggleCurrency}
                        className="text-sm sm:text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors"
                        title="Click to toggle currency"
                      >
                        {formatAmount(asset.valueUSD)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {currencyMode === 'USD' ? (
                          <>ZIG {asset.valueZIG.toLocaleString(undefined, { maximumFractionDigits: 0 })}</>
                        ) : (
                          <>${asset.valueUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {asset.change24h !== undefined && (
                        <div className="text-right">
                          <div className={`text-[11px] sm:text-xs font-bold ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {asset.change24h >= 0 ? `+${asset.change24h}%` : `${asset.change24h}%`}
                          </div>
                          <div className="text-[9px] text-slate-500">24h</div>
                        </div>
                      )}

                      <div className="w-6 h-6 rounded-lg bg-slate-700/40 group-hover:bg-slate-700 flex items-center justify-center transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredAssets.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs bg-slate-800/40 rounded-2xl border border-slate-700/40">
                  No assets found matching "{searchQuery}".
                </div>
              )}
            </div>

            {/* Bottom Footer Action & Navigation */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 gap-2">
              <button
                onClick={() => setActiveCardIndex(0)}
                className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors cursor-pointer group text-[11px] sm:text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>Return to Overview</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenDeposit}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  + Add Asset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NFT & Real World Asset Deed Certificate Inspection Modal */}
      {selectedNft && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedNft(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{selectedNft.icon}</span>
                <div>
                  <h4 className="font-bold text-sm text-white">{selectedNft.name}</h4>
                  <div className="text-[11px] text-emerald-400 font-mono">{selectedNft.badge} • {selectedNft.contractStandard}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedNft(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {selectedNft.nftDetails?.image && (
              <div className="rounded-2xl overflow-hidden relative aspect-video bg-slate-800 border border-slate-700">
                <img 
                  src={selectedNft.nftDetails.image} 
                  alt={selectedNft.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-emerald-400 border border-slate-700">
                  Token ID: {selectedNft.nftDetails.tokenId}
                </div>
              </div>
            )}

            <div className="bg-slate-800/80 rounded-2xl p-3.5 space-y-2 border border-slate-700/60 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Collection</span>
                <span className="font-medium text-white">{selectedNft.nftDetails?.collection || 'ZEEX RWA'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Holdings Valuation</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {formatAmount(selectedNft.valueUSD)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Description</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {selectedNft.description}
              </p>
            </div>

            {selectedNft.nftDetails?.attributes && (
              <div className="grid grid-cols-3 gap-2">
                {selectedNft.nftDetails.attributes.map((attr, i) => (
                  <div key={i} className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60 text-center">
                    <div className="text-[10px] text-slate-400">{attr.trait_type}</div>
                    <div className="text-xs font-bold text-slate-200 truncate mt-0.5">{attr.value}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex items-center space-x-2">
              <button
                onClick={() => {
                  if (selectedNft.actionTab) setActiveTab(selectedNft.actionTab);
                  setSelectedNft(null);
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-center"
              >
                Trade / Manage in ZEEX Market
              </button>
              <button
                onClick={() => setSelectedNft(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
