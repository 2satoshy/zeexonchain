import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { 
  Sparkles, 
  ShoppingBag, 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  X, 
  Sliders, 
  Check, 
  Layers, 
  Cpu, 
  Music, 
  Tv, 
  Sun, 
  Sprout,
  AlertCircle
} from 'lucide-react';

interface SpendingInvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
  onSuccessExecute?: (msg: string) => void;
}

export const SpendingInvestorModal: React.FC<SpendingInvestorModalProps> = ({
  isOpen,
  onClose,
  walletAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  onSuccessExecute
}) => {
  const [activeTab, setActiveTab] = useState<'SCANNER' | 'BASKET' | 'SUBSCRIPTION'>('SCANNER');
  
  // Statement Input
  const [statementText, setStatementText] = useState<string>(
    `Spotify Premium Subscription - $11.99/mo\nNetflix 4K Ultra HD - $19.99/mo\nNVIDIA Cloud GPU Compute - $120.00\nTakura Agricultural Fertilizer & Seeds - $250.00\nSimba Solar Micro-Grid Power Bill - $85.00`
  );
  const [scanning, setScanning] = useState(false);
  
  // Results & Basket
  const [scanSummary, setScanSummary] = useState<string>('');
  const [matches, setMatches] = useState<any[]>([]);
  const [executing, setExecuting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Subscription State
  const [subscription, setSubscription] = useState<any>(null);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSubscription();
    }
  }, [isOpen, walletAddress]);

  const fetchSubscription = async () => {
    try {
      const res = await ApiService.getSpendingSubscription(walletAddress);
      if (res.success) {
        setSubscription(res.subscription);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    }
  };

  const handleScanStatement = async () => {
    try {
      setScanning(true);
      setStatusMsg(null);
      const res = await ApiService.scanSpendingStatement(walletAddress, statementText);
      if (res.success) {
        setScanSummary(res.summary);
        setMatches(res.matches);
        setActiveTab('BASKET');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', msg: err.message || 'Scanning failed' });
    } finally {
      setScanning(false);
    }
  };

  const handleExecuteOneOff = async () => {
    try {
      setExecuting(true);
      setStatusMsg(null);
      const res = await ApiService.executeOneOffSpendingInvest(walletAddress, matches);
      if (res.success) {
        setStatusMsg({ type: 'success', msg: res.message });
        if (onSuccessExecute) onSuccessExecute(res.message);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', msg: err.message || 'One-off execution failed' });
    } finally {
      setExecuting(false);
    }
  };

  const handleToggleSubscription = async (enableAutoRebalance: boolean) => {
    try {
      setSubLoading(true);
      setStatusMsg(null);
      const res = await ApiService.toggleAutoPilotSubscription(walletAddress, enableAutoRebalance);
      if (res.success) {
        setSubscription(res.subscription);
        setStatusMsg({ type: 'success', msg: res.message });
        if (onSuccessExecute) onSuccessExecute(res.message);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', msg: err.message || 'Subscription toggle failed' });
    } finally {
      setSubLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalInvestedUSD = matches.reduce((sum, m) => sum + (m.suggestedAllocationUSD || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-slate-800">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/30 text-purple-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Everyday Spending Auto-Investor
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Spend & Earn Ownership
              </h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('SCANNER')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'SCANNER' 
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Receipt className="w-4 h-4" /> 1. Upload & Scan Filings
            </button>
            <button
              onClick={() => setActiveTab('BASKET')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'BASKET' 
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> 2. AI Allocation Basket ({matches.length})
            </button>
            <button
              onClick={() => setActiveTab('SUBSCRIPTION')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'SUBSCRIPTION' 
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" /> 3. One-Off vs. Auto-Rebalance
            </button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {statusMsg && (
          <div className={`p-4 mx-6 mt-6 rounded-xl flex items-center gap-3 text-xs font-medium border ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
            <span>{statusMsg.msg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {/* TAB 1: SCANNER */}
          {activeTab === 'SCANNER' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Paste Bank Statements, Online Invoices or Receipts</h3>
                <p className="text-xs text-slate-400">
                  AI scans your recurring purchases (Spotify, Netflix, AWS, Nvidia, Agro supplies, Solar bills) and maps them to high-upside stocks.
                </p>
              </div>

              <div>
                <textarea
                  rows={6}
                  value={statementText}
                  onChange={(e) => setStatementText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="Paste bank transaction logs, subscription receipts, or purchase history..."
                />
              </div>

              {/* Sample Preset Quick Buttons */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-slate-400 self-center font-medium">Quick Presets:</span>
                <button
                  onClick={() => setStatementText(`Spotify Premium - $11.99\nNetflix Ultra - $19.99\nApple iCloud - $2.99\nYouTube Premium - $13.99`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                >
                  🎵 Digital Subscriptions
                </button>
                <button
                  onClick={() => setStatementText(`NVIDIA Cloud Compute GPU - $180.00\nMeta Horizon Muse LLM API - $45.00\nAWS Hosting & S3 - $65.00`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                >
                  🤖 AI Hardware & Stack
                </button>
                <button
                  onClick={() => setStatementText(`Takura Agro Fertilizers - $320.00\nNyanga Tea Exports - $50.00\nSimba Micro-Grid Power - $110.00`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                >
                  🇿🇼 ZEEX SME Equities
                </button>
              </div>

              <button
                onClick={handleScanStatement}
                disabled={scanning || !statementText.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                {scanning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Analyze Spending & Generate Stock Basket
              </button>
            </div>
          )}

          {/* TAB 2: BASKET PREVIEW */}
          {activeTab === 'BASKET' && (
            <div className="space-y-5">
              {scanSummary && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block mb-0.5">Gemini AI Analysis Summary</span>
                    <span>{scanSummary}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Matched Spending Equity Basket</h3>
                <span className="text-xs text-purple-400 font-extrabold">
                  Total Allocation: ${totalInvestedUSD.toFixed(2)} USD
                </span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {matches.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{item.merchantName}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                          ${item.spentAmountUSD} Spent
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{item.aiRationale}</p>
                    </div>

                    <div className="flex items-center gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800 justify-between shrink-0">
                      <div className="text-right">
                        <span className="text-xs text-purple-400 font-bold block">{item.mappedTicker}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">Upside: {item.upsideScore}/100</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-extrabold text-sm">
                        +${item.suggestedAllocationUSD}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Execution Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={handleExecuteOneOff}
                  disabled={executing || matches.length === 0}
                  className="py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Execute One-Off Purchase ($1.99 Fee)
                </button>
                <button
                  onClick={() => setActiveTab('SUBSCRIPTION')}
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Sliders className="w-4 h-4 text-purple-400" />
                  Setup Auto-Pilot Subscription ($4.99/mo)
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SUBSCRIPTION & AUTO-REBALANCE */}
          {activeTab === 'SUBSCRIPTION' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Choose Execution & Rebalance Plan</h3>
                <p className="text-xs text-slate-400">
                  Select between a single one-off basket purchase or enable full autonomous AI rebalancing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* One-Time Execution Card */}
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-300">ONE-TIME EXECUTION</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">Single Batch</span>
                    </div>
                    <p className="text-2xl font-black text-white mb-1">$1.99 <span className="text-xs font-normal text-slate-400">/ execution</span></p>
                    <p className="text-xs text-slate-400">Instantly buy stock for currently scanned receipts without recurring charges.</p>
                  </div>
                  <button
                    onClick={handleExecuteOneOff}
                    disabled={executing || matches.length === 0}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Execute Scanned Basket ($1.99)
                  </button>
                </div>

                {/* Auto-Pilot Subscription Card */}
                <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                  subscription?.isActive && subscription?.planType === 'MONTHLY_AUTOPILOT'
                    ? 'bg-purple-950/40 border-purple-500/50 shadow-xl'
                    : 'bg-slate-950 border-slate-800'
                }`}>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> AUTONOMOUS AUTO-PILOT
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                        {subscription?.isActive ? 'ACTIVE' : 'POPULAR'}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-white mb-1">$4.99 <span className="text-xs font-normal text-slate-400">/ month</span></p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Continuous round-up investing on linked receipts + **Autonomous AI Portfolio Rebalancing** based on live market sentiment & earnings reports.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleSubscription(true)}
                    disabled={subLoading}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                  >
                    {subLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {subscription?.isActive ? 'Subscription Active (Manage)' : 'Subscribe to Auto-Pilot ($4.99/mo)'}
                  </button>
                </div>
              </div>

              {/* Subscribed Status Details */}
              {subscription?.isActive && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Active Subscription:</span>
                    <span className="text-emerald-400 font-bold">Monthly Auto-Pilot Enabled</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Auto-Invested Roundups:</span>
                    <span className="text-white font-bold">${subscription.totalRoundupsInvestedUSD.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>AI Sentiment Rebalancer:</span>
                    <span className="text-purple-300 font-bold">Active (Weekly Rebalance Window)</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
