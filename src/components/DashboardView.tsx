import React, { useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, ShieldCheck, Smartphone, Sparkles, Plus, Send, RefreshCw, FileText, Landmark, Coins, ChevronRight } from 'lucide-react';
import { SMEStock, Transaction, TabType } from '../types';
import { PerformanceInsightsCard } from './PerformanceInsightsCard';
import { MarketMarqueeTicker } from './MarketMarqueeTicker';
import { DividendsSection } from './DividendsSection';
import { AutoRebalanceModal } from './AutoRebalanceModal';

interface DashboardViewProps {
  stocks: SMEStock[];
  transactions: Transaction[];
  setActiveTab: (tab: TabType) => void;
  onQuickAction: (action: string) => void;
  onAddTransactions?: (txs: Transaction[]) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ stocks, transactions, setActiveTab, onQuickAction, onAddTransactions }) => {
  const [isRebalanceOpen, setIsRebalanceOpen] = useState(false);

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
              onClick={() => setIsRebalanceOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-2xl transition-all shadow-md text-sm"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>AI Auto-Rebalance</span>
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
      </div>

      {/* Auto-Rebalance Modal */}
      <AutoRebalanceModal 
        isOpen={isRebalanceOpen}
        onClose={() => setIsRebalanceOpen(false)}
        stocks={stocks}
        onExecuteRebalance={(txs) => {
          if (onAddTransactions) onAddTransactions(txs);
        }}
      />

      {/* Performance Insights & Analytics */}
      <PerformanceInsightsCard transactions={transactions} />

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

        {/* Right Column: WhatsApp Integration & Recent Activity */}
        <div className="space-y-6">
          {/* Recent Activity Mini-Feed */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
              <span className="text-xs text-slate-400">{transactions.length} Transactions</span>
            </div>

            <div className="space-y-3">
              {transactions.slice(0, 3).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                      tx.type === 'BUY' ? 'bg-emerald-100 text-emerald-700' :
                      tx.type === 'DIVIDEND' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {tx.type === 'BUY' ? '📥' : tx.type === 'DIVIDEND' ? '💵' : '📤'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 truncate max-w-[140px]">{tx.title}</div>
                      <div className="text-[10px] text-slate-400">{tx.timestamp}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-900">+${tx.amountUSD.toFixed(2)}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">{tx.status}</div>
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
