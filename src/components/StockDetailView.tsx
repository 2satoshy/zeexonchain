import React, { useState } from 'react';
import { SMEStock } from '../types';
import {
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Share2,
  ExternalLink,
  Building2,
  Layers,
  Sparkles,
  Info,
  Clock,
  Users,
  Repeat
} from 'lucide-react';
import { StockPriceHistoryChart } from './StockPriceHistoryChart';
import { generateStockPriceHistory } from '../data/mockData';

interface StockDetailViewProps {
  stock: SMEStock;
  onBack: () => void;
  onBuyShares: (stock: SMEStock, usdAmount: number, units: number) => void;
}

export const StockDetailView: React.FC<StockDetailViewProps> = ({
  stock,
  onBack,
  onBuyShares
}) => {
  const [investUSD, setInvestUSD] = useState<number>(25);
  const [activeTimeframe, setActiveTimeframe] = useState<'1D' | '7D' | '1M' | '1Y' | 'ALL'>('7D');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const priceHistoryData =
    stock.priceHistory && stock.priceHistory.length > 0
      ? stock.priceHistory
      : generateStockPriceHistory(stock.priceUSD, stock.change24h >= 0 ? 1 : 0.98);

  const is24hPositive = stock.change24h >= 0;
  const is1hPositive = (stock.change1h ?? 0.02) >= 0;
  const unitsCalculated = Math.round((investUSD / stock.priceUSD) * 100000) / 100000;
  const zigCalculated = Math.round(investUSD * 26 * 100) / 100;

  const handleInvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuyShares(stock, investUSD, unitsCalculated);
    setSuccessNotice(
      `Successfully purchased ${unitsCalculated.toLocaleString()} fractional units of ${stock.ticker} for $${investUSD.toFixed(
        2
      )}! Settled via Base L2.`
    );
    setTimeout(() => setSuccessNotice(null), 6000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Stocks</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <span>ZEEX Marketplace</span>
          <span>/</span>
          <span className="text-slate-700">{stock.sector}</span>
          <span>/</span>
          <span className="font-bold text-slate-900">{stock.ticker}</span>
        </div>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center space-x-3 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">{successNotice}</div>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs">
              {stock.image ? (
                <img src={stock.image} alt={stock.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xl text-slate-600">
                  {stock.ticker.slice(0, 3)}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stock.name}
                </h1>
                <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  <span>{stock.ticker}</span>
                  <svg className="w-3.5 h-3.5 fill-blue-600 text-white" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#2563eb"/>
                    <path d="M10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#ffffff"/>
                  </svg>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-lg">
                  {stock.sector}
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2.5 py-1 rounded-lg flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SECZim Audited</span>
                </span>
                <span className="bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-lg">
                  ERC-3643 Permissioned
                </span>
                <span className="text-slate-400">
                  Risk: <strong className="text-slate-700">{stock.riskRating}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Live Price Block */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 min-w-[220px] text-left lg:text-right">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              Current Share Price
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ${stock.priceUSD >= 1 ? stock.priceUSD.toFixed(2) : stock.priceUSD.toFixed(3)}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              ZIG {stock.priceZIG ? stock.priceZIG.toFixed(2) : (stock.priceUSD * 26).toFixed(2)}
            </div>
            <div className="flex items-center lg:justify-end space-x-2 mt-2">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5 ${
                  is24hPositive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {is24hPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{is24hPositive ? `+${stock.change24h}%` : `${stock.change24h}%`} (24h)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Price Chart with Timeframes */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Historical Price & Valuation Performance</span>
              <span className="text-xs font-normal text-slate-500">(Recharts Onchain Feed)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time oracle verified valuation and DEX liquidity quotes
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl space-x-1 text-xs font-bold text-slate-600">
            {(['1D', '7D', '1M', '1Y', 'ALL'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTimeframe === tf
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'hover:text-slate-900 text-slate-500'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Price History Chart */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
          <StockPriceHistoryChart
            data={priceHistoryData}
            stockId={`detail-${stock.id}`}
            ticker={stock.ticker}
            isPositive={is24hPositive}
            height={240}
            compact={false}
            showYAxis={true}
          />
        </div>

        {/* 4 Quick Stat Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="text-[11px] text-slate-400 font-semibold">Dividend Yield</div>
            <div className="text-base font-extrabold text-emerald-600 mt-0.5">
              {stock.dividendYield}% APY
            </div>
            <div className="text-[10px] text-slate-400">Quarterly Cash Payout</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="text-[11px] text-slate-400 font-semibold">Market Cap</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {stock.marketCap}
            </div>
            <div className="text-[10px] text-slate-400">Total Diluted Value</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="text-[11px] text-slate-400 font-semibold">24h Volume</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {stock.volume24h || `$${((stock.priceUSD || 1) * 125000).toLocaleString()}`}
            </div>
            <div className="text-[10px] text-slate-400">{stock.txns24h ? `${stock.txns24h.toLocaleString()} txns` : 'Active trading'}</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="text-[11px] text-slate-400 font-semibold">P/E Ratio</div>
            <div className="text-base font-extrabold text-blue-600 mt-0.5">
              {stock.peRatio || '11.4x'}
            </div>
            <div className="text-[10px] text-slate-400">Trailing Twelve Months</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Company & SECZim details) + Right Column (Fractional Purchase Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 2 spans */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Overview Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Company Profile & Business Model</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{stock.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-xs text-slate-400 font-medium">Headquarters & Operations</div>
                <div className="text-sm font-bold text-slate-800">Harare & Manicaland, Zimbabwe</div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-xs text-slate-400 font-medium">Exchange Listing Status</div>
                <div className="text-sm font-bold text-emerald-600">SECZim Regulated • ZSE Trust Custody</div>
              </div>
            </div>
          </div>

          {/* SECZim Trust & Custody Escrow */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SECZim Regulatory Backing & Custody Trust</span>
            </h3>

            <div className="bg-blue-50/70 border border-blue-200/80 p-4 rounded-2xl text-xs text-blue-900 leading-relaxed">
              Every token issued on the ZEEX platform represents 1:1 beneficial ownership of common stock held under custodial trust in compliance with the Securities and Exchange Commission of Zimbabwe (SECZim) sandbox guidelines.
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Custody Trust Reference:</span>
                <span className="font-bold text-slate-900 font-mono">{stock.backingTrust}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Legal Custodian & Escrow:</span>
                <span className="font-bold text-slate-800">Stanbic Nominees Zimbabwe Ltd</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Token Smart Contract Standard:</span>
                <span className="font-bold text-purple-700">ERC-3643 (Permissioned Securities Token)</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Settlement Blockchain:</span>
                <span className="font-bold text-blue-600">Base Sepolia L2 (Ethereum Rollup)</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Fractional Units Available:</span>
                <span className="font-bold text-slate-800">
                  {stock.fractionalUnitsAvailable.toLocaleString()} units
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Instant Fractional Investment Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-7 sticky top-6">
            <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Instant Fractional Access</span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">
              Buy {stock.ticker} Shares
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Start building your equity portfolio from as little as $1.00 USD.
            </p>

            <form onSubmit={handleInvestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Investment Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    max="50000"
                    step="1"
                    value={investUSD}
                    onChange={e => setInvestUSD(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex justify-between items-center mt-2.5 text-xs text-slate-500">
                  <span>Presets:</span>
                  <div className="flex space-x-1.5">
                    {[5, 10, 25, 50, 100, 500].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setInvestUSD(amt)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          investUSD === amt
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Calculation Preview */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Fractional Units:</span>
                  <span className="font-bold text-slate-900">
                    {unitsCalculated.toLocaleString(undefined, { maximumFractionDigits: 4 })} shares
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Equivalent in $ZIG:</span>
                  <span className="font-bold text-emerald-600">ZIG {zigCalculated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gas Fees:</span>
                  <span className="font-bold text-emerald-600">Sponsored (0.00 USD)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Estimated Dividend / yr:</span>
                  <span className="font-bold text-slate-800">
                    ${((investUSD * stock.dividendYield) / 100).toFixed(2)} USD
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
              >
                <span>Confirm Investment (${investUSD.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[11px] text-center text-slate-400 flex items-center justify-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant onchain settlement • ERC-3643 KYC verified</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
