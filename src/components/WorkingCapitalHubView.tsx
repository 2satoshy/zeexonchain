import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Coins, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface WorkingCapitalHubViewProps {
  userAddress: string;
}

export const WorkingCapitalHubView: React.FC<WorkingCapitalHubViewProps> = ({ userAddress }) => {
  const [activeTab, setActiveTab] = useState<'UNDERWRITING' | 'REVOLVING' | 'RFQ'>('REVOLVING');
  
  // Facility State
  const [facility, setFacility] = useState<any>(null);
  const [loadingFacility, setLoadingFacility] = useState(true);

  // Underwriting Form
  const [annualRevenue, setAnnualRevenue] = useState<string>('350000');
  const [cashFlowMonthly, setCashFlowMonthly] = useState<string>('28000');
  const [financialText, setFinancialText] = useState<string>(
    `Q2 Financial Filing Snippet:\nRevenue: $87,500\nNet Operating Cash Flow: $28,000\nCurrent Receivables: $42,000 (0-30 days aging)\nOutstanding Liabilities: $12,500`
  );
  const [underwritingLoading, setUnderwritingLoading] = useState(false);

  // Draw / Repay Form
  const [drawAmount, setDrawAmount] = useState<string>('5000');
  const [repayAmount, setRepayAmount] = useState<string>('2500');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // RFQ State
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [bidsMap, setBidsMap] = useState<Record<number, any[]>>({});
  const [rfqAmount, setRfqAmount] = useState<string>('40000');
  const [rfqDuration, setRfqDuration] = useState<string>('45');
  const [rfqPurpose, setRfqPurpose] = useState<string>('Solar Equipment Purchase & Working Capital');
  const [rfqLoading, setRfqLoading] = useState(false);

  useEffect(() => {
    fetchFacility();
    fetchRfqs();
  }, [userAddress]);

  const fetchFacility = async () => {
    try {
      setLoadingFacility(true);
      const res = await ApiService.getWorkingCapitalFacility(userAddress);
      if (res.success) {
        setFacility(res.facility);
      }
    } catch (err: any) {
      console.error('Failed to fetch facility:', err);
    } finally {
      setLoadingFacility(false);
    }
  };

  const fetchRfqs = async () => {
    try {
      const res = await ApiService.getLoanRfqs();
      if (res.success) {
        setRfqs(res.rfqs);
        setBidsMap(res.bids);
      }
    } catch (err) {
      console.error('Failed to fetch RFQs:', err);
    }
  };

  const handleUnderwrite = async () => {
    try {
      setUnderwritingLoading(true);
      setStatusMessage(null);
      const res = await ApiService.underwriteWorkingCapital({
        address: userAddress,
        financialReportText: financialText,
        annualRevenue: Number(annualRevenue),
        cashFlowMonthly: Number(cashFlowMonthly)
      });
      if (res.success) {
        setFacility(res.facility);
        setStatusMessage({ type: 'success', msg: 'AI Credit Underwriting completed! Revolving limit expanded.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', msg: err.message || 'Underwriting failed' });
    } finally {
      setUnderwritingLoading(false);
    }
  };

  const handleDraw = async () => {
    try {
      setActionLoading(true);
      setStatusMessage(null);
      const res = await ApiService.drawWorkingCapital(userAddress, Number(drawAmount));
      if (res.success) {
        setFacility(res.facility);
        setStatusMessage({ type: 'success', msg: `Successfully drawn $${Number(drawAmount).toLocaleString()} for payroll/working capital!` });
        setDrawAmount('5000');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', msg: err.message || 'Drawdown failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRepay = async () => {
    try {
      setActionLoading(true);
      setStatusMessage(null);
      const res = await ApiService.repayWorkingCapital(userAddress, Number(repayAmount));
      if (res.success) {
        setFacility(res.facility);
        setStatusMessage({ type: 'success', msg: `Successfully repaid $${res.repaidAmountUSD.toLocaleString()} to Revolving Vault!` });
        setRepayAmount('2500');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', msg: err.message || 'Repayment failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRfqLoading(true);
      setStatusMessage(null);
      const res = await ApiService.createLoanRfq({
        address: userAddress,
        amountUSD: Number(rfqAmount),
        durationDays: Number(rfqDuration),
        businessPurpose: rfqPurpose
      });
      if (res.success) {
        await fetchRfqs();
        setStatusMessage({ type: 'success', msg: 'Loan RFQ created on-chain! Received instant competing bids.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', msg: err.message || 'RFQ creation failed' });
    } finally {
      setRfqLoading(false);
    }
  };

  const handleAcceptBid = async (rfqId: number, bidId: number) => {
    try {
      setActionLoading(true);
      setStatusMessage(null);
      const res = await ApiService.acceptRfqBid(userAddress, rfqId, bidId);
      if (res.success) {
        await fetchRfqs();
        await fetchFacility();
        setStatusMessage({ type: 'success', msg: `Bid #${bidId} accepted! Winning rate applied to Revolving Vault.` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', msg: err.message || 'Failed to accept bid' });
    } finally {
      setActionLoading(false);
    }
  };

  const availableCredit = facility ? Math.max(0, facility.creditLimitUSD - facility.drawnAmountUSD) : 0;
  const utilizationPercent = facility && facility.creditLimitUSD > 0 
    ? Math.round((facility.drawnAmountUSD / facility.creditLimitUSD) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 md:p-8 border border-emerald-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Credit Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Unified Working Capital Vault
            </h1>
            <p className="text-sm text-slate-300 max-w-xl mt-1">
              Automated AI underwriting, flexible revolving liquidity lines, and multi-lender RFQ rate competition on Base L2.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md min-w-[280px]">
            <div>
              <p className="text-xs text-slate-400 font-medium">Approved Credit Limit</p>
              <p className="text-xl font-bold text-white mt-0.5">
                ${facility ? facility.creditLimitUSD.toLocaleString() : '---'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Base APY Rate</p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">
                {facility ? (facility.interestRateBps / 100).toFixed(2) : '---'}%
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('REVOLVING')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'REVOLVING'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" /> Revolving Line of Credit
          </button>
          <button
            onClick={() => setActiveTab('UNDERWRITING')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'UNDERWRITING'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Credit Underwriter
          </button>
          <button
            onClick={() => setActiveTab('RFQ')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'RFQ'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Loan RFQ & Aggregator
          </button>
        </div>
      </div>

      {/* Global Status Notification */}
      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
            : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{statusMessage.msg}</span>
        </div>
      )}

      {/* TAB 1: REVOLVING LINE OF CREDIT */}
      {activeTab === 'REVOLVING' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Revolving Vault Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-400" /> Active Working Capital Facility
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Borrow & repay on-demand for inventory, payroll, and cashflow spikes.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Vault Active
                </span>
              </div>

              {/* Progress Meter */}
              <div className="space-y-2 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span>Drawn: ${facility?.drawnAmountUSD.toLocaleString() || '0'}</span>
                  <span>Limit: ${facility?.creditLimitUSD.toLocaleString() || '0'}</span>
                </div>
                <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, utilizationPercent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Utilization: {utilizationPercent}%</span>
                  <span className="text-emerald-400 font-bold">Available: ${availableCredit.toLocaleString()}</span>
                </div>
              </div>

              {/* Facility Details Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                  <p className="text-xs text-slate-400">Credit Score</p>
                  <p className="text-lg font-bold text-white mt-1">{facility?.creditScore || '720'}</p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                  <p className="text-xs text-slate-400">Interest APY</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">{facility ? (facility.interestRateBps / 100).toFixed(2) : '0'}%</p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                  <p className="text-xs text-slate-400">Risk Rating</p>
                  <p className="text-lg font-bold text-indigo-400 mt-1">{facility?.riskCategory || 'LOW'}</p>
                </div>
              </div>

              {/* Draw and Repay Forms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Draw Box */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" /> Instant Draw (USDC / ZIG)
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">Funds transferred directly to business address.</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Draw Amount ($)</label>
                      <input 
                        type="number"
                        value={drawAmount}
                        onChange={(e) => setDrawAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        placeholder="Enter amount"
                      />
                    </div>
                    <button
                      onClick={handleDraw}
                      disabled={actionLoading || availableCredit <= 0}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs py-2.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      Execute Drawdown
                    </button>
                  </div>
                </div>

                {/* Repay Box */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-indigo-400" /> Repay Balance
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">Reinstates your available credit ceiling.</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Repay Amount ($)</label>
                      <input 
                        type="number"
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        placeholder="Enter amount"
                      />
                    </div>
                    <button
                      onClick={handleRepay}
                      disabled={actionLoading || (facility?.drawnAmountUSD || 0) <= 0}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Submit Repayment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Info Panel */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Underwriting Summary
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                {facility?.underwritingSummary || 'Initial working capital facility pre-approved based on ZSE network credit scoring.'}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Network Protocol</span>
                <span className="text-white font-medium">Base Sepolia L2</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Contract Type</span>
                <span className="text-emerald-400 font-medium">RevolvingCreditVault</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI CREDIT UNDERWRITER */}
      {activeTab === 'UNDERWRITING' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AI Financial Statement Scanner</h3>
                <p className="text-xs text-slate-400">Upload P&L or paste audited cash flows to instantly unlock higher revolving credit limits.</p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium mb-1 block">Annual Revenue (USD)</label>
                  <input
                    type="number"
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium mb-1 block">Monthly Net Cash Flow (USD)</label>
                  <input
                    type="number"
                    value={cashFlowMonthly}
                    onChange={(e) => setCashFlowMonthly(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium mb-1 block">Financial Statement Snippet / Filings Text</label>
                <textarea
                  rows={5}
                  value={financialText}
                  onChange={(e) => setFinancialText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="Paste income statement, VAT returns, or quarterly audited numbers..."
                />
              </div>

              <button
                onClick={handleUnderwrite}
                disabled={underwritingLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {underwritingLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Run Gemini AI Credit Underwriting
              </button>
            </div>
          </div>

          {/* Underwriting Preview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Real-time Credit Assessment
              </h4>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Assessed Credit Rating</span>
                  <span className="text-emerald-400 font-extrabold text-base">{facility?.creditScore || 740} / 850</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Approved Ceiling</span>
                  <span className="text-white font-extrabold text-base">${facility?.creditLimitUSD.toLocaleString() || '50,000'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Interest Tier (BPS)</span>
                  <span className="text-indigo-400 font-extrabold">{facility?.interestRateBps || 650} BPS ({facility ? (facility.interestRateBps/100).toFixed(2) : 6.5}%)</span>
                </div>
              </div>
            </div>
            <div className="mt-6 text-xs text-slate-400 border-t border-slate-800 pt-4">
              <p>Underwriting parameters automatically update smart contract permissions on Base L2.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOAN RFQ & MULTI-LENDER AGGREGATOR */}
      {activeTab === 'RFQ' && (
        <div className="space-y-6">
          {/* Create RFQ Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" /> Create On-Chain Loan RFQ (Request For Quote)
            </h3>
            <p className="text-xs text-slate-400 mb-6">Broadcast your working capital requirement to multiple liquidity pools (InvoiceX, ZSE Institutional, P2P Syndicate) to get the lowest rate.</p>

            <form onSubmit={handleCreateRfq} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-medium mb-1 block">Requested Amount ($)</label>
                <input
                  type="number"
                  value={rfqAmount}
                  onChange={(e) => setRfqAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium mb-1 block">Duration (Days)</label>
                <input
                  type="number"
                  value={rfqDuration}
                  onChange={(e) => setRfqDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium mb-1 block">Business Purpose</label>
                <input
                  type="text"
                  value={rfqPurpose}
                  onChange={(e) => setRfqPurpose(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={rfqLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {rfqLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Broadcast RFQ
                </button>
              </div>
            </form>
          </div>

          {/* Active RFQs & Competing Bids */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Active Loan Requests & Competing Venue Quotes
            </h4>

            {rfqs.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
                No active RFQs created yet. Create your first RFQ above.
              </div>
            ) : (
              rfqs.map((rfq) => {
                const bids = bidsMap[rfq.rfqId] || [];
                return (
                  <div key={rfq.rfqId} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold text-white">RFQ #{rfq.rfqId}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            rfq.isOpen ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {rfq.isOpen ? 'OPEN FOR BIDS' : 'ACCEPTED & SETTLED'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{rfq.businessPurpose}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 block">Amount</span>
                          <span className="text-white font-bold text-sm">${rfq.requestedAmountUSD.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Term</span>
                          <span className="text-white font-bold text-sm">{rfq.durationDays} Days</span>
                        </div>
                      </div>
                    </div>

                    {/* Venue Bids List */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-400">Competing Liquidity Venue Quotes ({bids.length}):</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {bids.map((bid) => (
                          <div key={bid.bidId} className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                            bid.isAccepted 
                              ? 'bg-emerald-950/40 border-emerald-500/50' 
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}>
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-white">{bid.venueName}</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                  {bid.estApprovalTime}
                                </span>
                              </div>
                              <div className="my-2">
                                <p className="text-xl font-extrabold text-emerald-400">
                                  {(bid.proposedInterestBps / 100).toFixed(2)}% APY
                                </p>
                                <p className="text-xs text-slate-400">Max Offer: ${bid.maxAmountUSD.toLocaleString()}</p>
                              </div>
                            </div>

                            <div className="mt-4 pt-2 border-t border-slate-800/80">
                              {bid.isAccepted ? (
                                <span className="w-full py-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Winning Venue Quote
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleAcceptBid(rfq.rfqId, bid.bidId)}
                                  disabled={!rfq.isOpen || actionLoading}
                                  className="w-full py-2 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all"
                                >
                                  Accept Quote Rate
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
