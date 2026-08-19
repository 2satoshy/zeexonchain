import React, { useState } from 'react';
import { SMEStock } from '../types';
import { Search, ShieldCheck, TrendingUp, DollarSign, ArrowRight, CheckCircle2, Sliders, Info, X } from 'lucide-react';

interface SharesViewProps {
  stocks: SMEStock[];
  onBuyShares: (stock: SMEStock, usdAmount: number, units: number) => void;
}

export const SharesView: React.FC<SharesViewProps> = ({ stocks, onBuyShares }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedStock, setSelectedStock] = useState<SMEStock | null>(null);
  const [investUSD, setInvestUSD] = useState<number>(25);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sectors = ['All', 'Agribusiness & Export', 'Renewable Infrastructure', 'Manufacturing', 'Logistics & FMCG', 'Green Minerals'];

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.name.toLowerCase().includes(searchQuery.toLowerCase()) || stock.ticker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === 'All' || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const handleInvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;
    const units = Math.round((investUSD / selectedStock.priceUSD) * 100000) / 100000;
    onBuyShares(selectedStock, investUSD, units);
    setSuccessMessage(`Successfully purchased ${units.toLocaleString()} fractional units of ${selectedStock.ticker} for $${investUSD.toFixed(2)}! Settled via Base L2.`);
    setSelectedStock(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>ZEEX Tokenized Equity Rail • ERC-3643 Permissioned</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">ZEEX Shares & Fractional Access</h1>
          <p className="text-slate-500 text-sm mt-1">
            Own real, dividend-bearing slices of SECZim-licensed Zimbabwean SMEs and ZSE/VFEX equities from just $1.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-2xl text-xs flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Every token is 1:1 backed by securities held in trust by ZSE Debtbridge Capital.</span>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center space-x-3 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">{successMessage}</div>
        </div>
      )}

      {/* Search & Sector Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company name or ticker (e.g., TKRA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {sectors.map(sector => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSector === sector
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStocks.map((stock) => (
          <div key={stock.id} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="relative h-48 w-full overflow-hidden">
                <img src={stock.image} alt={stock.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-xs">
                  {stock.ticker}
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-white">
                  {stock.sector}
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 text-base">{stock.name}</h3>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-slate-900">${stock.priceUSD.toFixed(2)}</span>
                    <div className="text-xs text-slate-500">ZIG {stock.priceZIG.toFixed(2)}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mt-2">{stock.description}</p>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-medium">Dividend Yield</div>
                    <div className="text-xs font-bold text-emerald-600 mt-0.5">{stock.dividendYield}% APY</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-medium">Market Cap</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">{stock.marketCap}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-medium">Risk Rating</div>
                    <div className="text-xs font-bold text-blue-600 mt-0.5">{stock.riskRating}</div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                  <span>{stock.backingTrust}</span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => {
                  setSelectedStock(stock);
                  setInvestUSD(10); // default $10 fractional buy
                }}
                className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-2xl transition-all text-sm shadow-sm"
              >
                <span>Buy Fractional Shares ($1+)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fractional Investment Modal */}
      {selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setSelectedStock(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <img src={selectedStock.image} alt={selectedStock.name} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h3 className="font-bold text-slate-900">{selectedStock.name}</h3>
                <span className="text-xs text-slate-500">{selectedStock.ticker} • ${selectedStock.priceUSD.toFixed(2)} per share</span>
              </div>
            </div>

            <form onSubmit={handleInvestSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Investment Amount (USD / $ZIG)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    step="1"
                    value={investUSD}
                    onChange={(e) => setInvestUSD(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                  <span>Quick amounts:</span>
                  <div className="flex space-x-1.5">
                    {[5, 10, 50, 100, 500].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setInvestUSD(amt)}
                        className={`px-2.5 py-1 rounded-lg font-semibold ${investUSD === amt ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fractional Units Calculation Preview */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Fractional Units Received:</span>
                  <span className="font-bold text-slate-900">
                    {((investUSD / selectedStock.priceUSD) * 100000).toLocaleString(undefined, { maximumFractionDigits: 2 })} units
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Equivalent $ZIG:</span>
                  <span className="font-bold text-emerald-600">ZIG {(investUSD * 26).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Network Gas Fee:</span>
                  <span className="font-bold text-emerald-600">Sponsored (0.00 USD)</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Custody & Trust:</span>
                  <span className="font-bold text-slate-700">ZSE Debtbridge Trust</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
              >
                <span>Confirm Investment (${investUSD.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
