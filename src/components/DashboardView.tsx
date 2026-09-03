import React, { useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, ShieldCheck, Smartphone, Sparkles, Plus, Send, RefreshCw, FileText, Landmark, Coins, ChevronRight, LayoutGrid, Layers, BarChart3, PieChart, Clock, ArrowRightLeft, Building2 } from 'lucide-react';
import { SMEStock, Transaction, TabType, TokenAsset } from '../types';
import { PerformanceInsightsCard } from './PerformanceInsightsCard';
import { MarketMarqueeTicker } from './MarketMarqueeTicker';
import { DividendsSection } from './DividendsSection';
import { SectorTreemap } from './SectorTreemap';
import { PaginationBar } from './PaginationBar';
import { SwipeableContainer } from './SwipeableContainer';
import { HomeHeroSwipeCard } from './HomeHeroSwipeCard';

interface DashboardViewProps {
  stocks: SMEStock[];
  transactions: Transaction[];
  tokens?: TokenAsset[];
  setActiveTab: (tab: TabType) => void;
  onQuickAction: (action: string) => void;
  onOpenDeposit?: () => void;
  onOpenSend?: () => void;
  onOpenSwap?: () => void;
  onOpenTokenize?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  stocks, 
  transactions, 
  tokens = [],
  setActiveTab, 
  onQuickAction,
  onOpenDeposit,
  onOpenSend,
  onOpenSwap,
  onOpenTokenize
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 4;

  const dashboardPages = [
    { id: 1, title: '1. Portfolio & Products', shortTitle: 'Portfolio', icon: Layers },
    { id: 2, title: '2. Analytics & Treemap', shortTitle: 'Analytics', icon: BarChart3 },
    { id: 3, title: '3. Dividends & Yield', shortTitle: 'Dividends', icon: PieChart },
    { id: 4, title: '4. Markets & Activity', shortTitle: 'Markets & Feed', icon: Clock },
  ];

  const handleSwipeLeft = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handleSwipeRight = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const computedTotalUSD = tokens && tokens.length > 0
    ? tokens.reduce((sum, t) => sum + (t.balance * t.priceUSD), 0)
    : 4260.50;
  const totalPortfolioUSD = computedTotalUSD > 0 ? computedTotalUSD : 4260.50;
  const zigToken = tokens.find(t => t.symbol === 'ZIG');
  const zigBalance = zigToken ? zigToken.balance : 36933.00;

  return (
    <div className="space-y-6">
      {/* Top Ticker Marquee */}
      <MarketMarqueeTicker stocks={stocks} setActiveTab={setActiveTab} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Switcher Navigation Bar (Prevents endless scrolling) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {dashboardPages.map((page) => {
              const Icon = page.icon;
              return (
                <button
                  key={page.id}
                  onClick={() => setCurrentPage(page.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    currentPage === page.id
                      ? 'bg-slate-900 text-white shadow-xs scale-[1.02]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{page.title}</span>
                  <span className="sm:hidden">{page.shortTitle}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center text-xs text-slate-400 pl-3 border-l border-slate-200">
            <span>Swipe ‹ › on touch</span>
          </div>
        </div>

        {/* Swipeable Dashboard Content Container */}
        <SwipeableContainer
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showMobileSwipeIndicator={true}
        >
          {/* PAGE 1: Net Worth & 5 Interlocking Products */}
          {currentPage === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Swipeable Home Hero Card (Overview & All Asset Balances) */}
              <HomeHeroSwipeCard
                stocks={stocks}
                tokens={tokens}
                totalBalanceUSD={totalPortfolioUSD}
                zigBalance={zigBalance}
                oracleRate={26.00}
                setActiveTab={setActiveTab}
                onQuickAction={onQuickAction}
                onOpenDeposit={onOpenDeposit}
                onOpenSend={onOpenSend}
                onOpenSwap={onOpenSwap}
                onOpenTokenize={onOpenTokenize}
              />

              {/* 5 Interlocking Products Grid */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">ZEEX Onchain Product Suite</h2>
                  <span className="text-xs text-slate-500">Regulated Capital Market Rails</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div 
                    onClick={() => setActiveTab('shares')}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <PieChartIcon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">ZEEX Stocks</h3>
                      <p className="text-xs text-slate-500 mt-1">Tokenized SME equity rails backed 1:1 in trust.</p>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-semibold text-blue-600">
                      <span>Explore Equities</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab('shares')}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <DollarSignIcon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">Fractional $1</h3>
                      <p className="text-xs text-slate-500 mt-1">Break shares into 1M units for wallet-native access.</p>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600">
                      <span>Invest $1+</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab('invoiceX')}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">InvoiceX Onchain</h3>
                      <p className="text-xs text-slate-500 mt-1">Turn SME unpaid invoices into high-yield instruments.</p>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-semibold text-purple-600">
                      <span>View Invoices</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab('debtBridge')}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">DebtBridge SBLOC</h3>
                      <p className="text-xs text-slate-500 mt-1">Securities-backed credit lines & smart escrow.</p>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-semibold text-amber-600">
                      <span>Borrowing Portal</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab('zig')}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Coins className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">$ZIG Gold Stablecoin</h3>
                      <p className="text-xs text-slate-500 mt-1">Fully reserved ZiG/USDC FX corridor on Base L2.</p>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-semibold text-emerald-700">
                      <span>Explore $ZIG</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: Analytics & D3 Treemap */}
          {currentPage === 2 && (
            <div className="space-y-6 animate-fade-in">
              <PerformanceInsightsCard transactions={transactions} />
              <SectorTreemap stocks={stocks} />
            </div>
          )}

          {/* PAGE 3: Dividends & Passive Income */}
          {currentPage === 3 && (
            <div className="space-y-6 animate-fade-in">
              <DividendsSection transactions={transactions} stocks={stocks} />
            </div>
          )}

          {/* PAGE 4: Featured Stocks & Recent Transactions & WhatsApp */}
          {currentPage === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* SME Stocks Preview */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Featured SME Share Tokens</h2>
                    <p className="text-xs text-slate-500">Tokenized ownership backed by ZSE Debtbridge Trust</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('shares')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    View All ({stocks.length}) <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {stocks.slice(0, 3).map((stock) => (
                    <div 
                      key={stock.id} 
                      onClick={() => setActiveTab('shares')}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-all cursor-pointer border border-slate-100"
                    >
                      <div className="flex items-center space-x-3">
                        <img src={stock.image} alt={stock.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center">
                            <span>{stock.name}</span>
                            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-slate-200 text-slate-700 rounded-md">
                              {stock.ticker}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{stock.sector} • Yield: <span className="text-emerald-600 font-semibold">{stock.dividendYield}%</span></div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">${stock.priceUSD.toFixed(2)}</div>
                        <div className="text-xs font-medium text-emerald-600 flex items-center justify-end">
                          <TrendingUp className="w-3 h-3 mr-0.5" /> +{stock.change24h}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions & WhatsApp Banner */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === 'BUY' ? 'bg-blue-50 text-blue-600' :
                            tx.type === 'DIVIDEND' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                          }`}>
                            {tx.type === 'BUY' ? <ArrowDownLeft className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{tx.title}</div>
                            <div className="text-[10px] text-slate-400">{tx.timestamp}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-900">${tx.amountUSD.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400">{tx.amountZIG ? `ZIG ${tx.amountZIG.toLocaleString()}` : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WhatsApp Integration Callout Card */}
                <div 
                  onClick={() => setActiveTab('whatsapp')}
                  className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg cursor-pointer hover:scale-[1.01] transition-transform relative overflow-hidden"
                >
                  <div className="absolute right-2 bottom-2 opacity-10">
                    <Smartphone className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                    <div className="inline-block bg-white/25 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                      WhatsApp Trading Bot
                    </div>
                    <h3 className="text-lg font-bold">Trade Stocks via WhatsApp</h3>
                    <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                      Send orders, check balances, or transfer $ZIG using your phone number connected instantly to your Base wallet.
                    </p>
                    <div className="mt-4 inline-flex items-center space-x-2 text-xs font-semibold bg-white text-slate-900 px-4 py-2 rounded-xl shadow-xs">
                      <span>Open WhatsApp Chat</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SwipeableContainer>

        {/* Bottom Pagination Bar for Dashboard */}
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemName="dashboard pages"
        />
      </div>
    </div>
  );
};

function PieChartIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
  );
}

function DollarSignIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  );
}

