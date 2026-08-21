import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, ShieldCheck, Smartphone, Sparkles, Plus, Send, RefreshCw, FileText, Landmark, Coins, ChevronRight } from 'lucide-react';
import { SMEStock, Transaction, TabType } from '../types';
import { PerformanceInsightsCard } from './PerformanceInsightsCard';
import { MarketMarqueeTicker } from './MarketMarqueeTicker';
import { DividendsSection } from './DividendsSection';
import { SectorTreemap } from './SectorTreemap';

interface DashboardViewProps {
  stocks: SMEStock[];
  transactions: Transaction[];
  setActiveTab: (tab: TabType) => void;
  onQuickAction: (action: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ stocks, transactions, setActiveTab, onQuickAction }) => {
  return (
    <div className="space-y-6">
      {/* Top Ticker Marquee */}
      <MarketMarqueeTicker stocks={stocks} setActiveTab={setActiveTab} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Welcome Banner & Net Worth Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div 
              onClick={() => setActiveTab('shares')}
              className="flex items-baseline space-x-3 cursor-pointer group"
              title="View all portfolio holdings"
            >
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight group-hover:text-emerald-400 transition-colors">$4,260.50</span>
              <span className="text-emerald-400 text-sm font-semibold flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> +14.8% this month
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Equivalent: <span className="text-white font-medium">ZIG 110,773.00</span> (@ 26.00 rate)
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button
              onClick={() => onQuickAction('deposit')}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-5 py-3 rounded-2xl transition-all shadow-md text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Deposit Funds</span>
            </button>
            <button
              onClick={() => setActiveTab('shares')}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-2xl backdrop-blur-md transition-all text-sm border border-white/10"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Trade</span>
            </button>
          </div>
        </div>

        {/* Mini Balance Breakdown Bar */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div 
            onClick={() => setActiveTab('zig')}
            className="cursor-pointer bg-white/10 hover:bg-white/15 border border-white/15 p-4 rounded-2xl transition-all group flex flex-col justify-between shadow-sm"
            title="Go to $ZIG Hub & USDC Onramp"
          >
            <div className="flex justify-between items-center text-xs text-slate-300 font-medium mb-1">
              <span>USD / USDC</span>
              <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">↗</span>
            </div>
            <div className="text-lg font-bold text-white">$1,420.50</div>
          </div>

          <div 
            onClick={() => setActiveTab('zig')}
            className="cursor-pointer bg-white/10 hover:bg-white/15 border border-white/15 p-4 rounded-2xl transition-all group flex flex-col justify-between shadow-sm"
            title="Go to $ZIG Gold Stablecoin Hub"
          >
            <div className="flex justify-between items-center text-xs text-slate-300 font-medium mb-1">
              <span>$ZIG Stablecoin</span>
              <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">↗</span>
            </div>
            <div className="text-lg font-bold text-emerald-400">ZIG 36,933</div>
          </div>

          <div 
            onClick={() => setActiveTab('shares')}
            className="cursor-pointer bg-white/10 hover:bg-white/15 border border-white/15 p-4 rounded-2xl transition-all group flex flex-col justify-between shadow-sm"
            title="Go to ZEEX Shares & Fractional Access"
          >
            <div className="flex justify-between items-center text-xs text-slate-300 font-medium mb-1">
              <span>Token Equities</span>
              <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform">↗</span>
            </div>
            <div className="text-lg font-bold text-white">$2,840.00</div>
          </div>

          <div 
            onClick={() => setActiveTab('invoiceX')}
            className="cursor-pointer bg-white/10 hover:bg-white/15 border border-white/15 p-4 rounded-2xl transition-all group flex flex-col justify-between shadow-sm"
            title="Go to InvoiceX Discounting"
          >
            <div className="flex justify-between items-center text-xs text-slate-300 font-medium mb-1">
              <span>Invoice Yield</span>
              <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform">↗</span>
            </div>
            <div className="text-lg font-bold text-blue-400">14.2% APY</div>
          </div>
        </div>
      </div>

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
              <h3 className="font-bold text-slate-900 text-sm">ZEEX Shares</h3>
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

      {/* Performance Insights Card */}
      <PerformanceInsightsCard transactions={transactions} />

      {/* D3 Treemap Sector Weight & Performance */}
      <SectorTreemap stocks={stocks} />

      {/* Dividends & Passive Income Hub */}
      <DividendsSection transactions={transactions} stocks={stocks} />

      {/* Featured SME Stocks & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
