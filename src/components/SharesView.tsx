import React, { useState, useEffect } from 'react';
import { SMEStock } from '../types';
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Info,
  X,
  Table as TableIcon,
  LayoutGrid,
  Search,
  Building2,
  Sparkles
} from 'lucide-react';
import { PaginationBar } from './PaginationBar';
import { SwipeableContainer } from './SwipeableContainer';
import { StockPriceHistoryChart } from './StockPriceHistoryChart';
import { StockTableView } from './StockTableView';
import { StockDetailView } from './StockDetailView';
import { generateStockPriceHistory } from '../data/mockData';
import { BasePayButton } from '@base-org/account-ui/react';
import { executeBasePay, ZEEX_BASE_TREASURY } from '../services/baseAccount';
import { useCurrency } from '../context/CurrencyContext';

interface SharesViewProps {
  stocks: SMEStock[];
  onBuyShares: (stock: SMEStock, usdAmount: number, units: number) => void;
}

export const SharesView: React.FC<SharesViewProps> = ({ stocks, onBuyShares }) => {
  const { currencyMode, formatStockPrice, formatAmount, oracleRate } = useCurrency();
  // Mode: summarized Table or Grid Cards
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // When a user clicks a stock, this opens the full individual listing view
  const [activeDetailedStock, setActiveDetailedStock] = useState<SMEStock | null>(null);

  // Search & Filters for Grid mode
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  
  // Quick investment modal state
  const [modalStock, setModalStock] = useState<SMEStock | null>(null);
  const [investUSD, setInvestUSD] = useState<number>(25);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination for grid mode
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(3);

  const sectors = ['All', 'Agribusiness & Export', 'Renewable Infrastructure', 'Manufacturing', 'Logistics & FMCG', 'Green Minerals'];

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch =
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.ticker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === 'All' || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSector]);

  const totalPages = Math.max(1, Math.ceil(filteredStocks.length / itemsPerPage));
  const currentStocks = filteredStocks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSwipeLeft = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handleSwipeRight = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleInvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalStock) return;
    const units = Math.round((investUSD / modalStock.priceUSD) * 100000) / 100000;
    onBuyShares(modalStock, investUSD, units);
    setSuccessMessage(
      `Successfully purchased ${units.toLocaleString()} fractional units of ${modalStock.ticker} for $${investUSD.toFixed(
        2
      )}! Settled via Base L2.`
    );
    setModalStock(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // If a stock is selected to view full listing, render the detailed listing view!
  if (activeDetailedStock) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StockDetailView
          stock={activeDetailedStock}
          onBack={() => setActiveDetailedStock(null)}
          onBuyShares={onBuyShares}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>ZEEX Tokenized Equity Rail • ERC-3643 Permissioned</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">ZEEX Stocks & Fractional Access</h1>
          <p className="text-slate-500 text-sm mt-1">
            Own real, dividend-bearing slices of SECZim-licensed Zimbabwean SMEs and ZSE/VFEX equities from just $1.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2.5 rounded-2xl text-xs flex items-center space-x-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>1:1 securities backed in ZSE trust.</span>
          </div>

          {/* View Mode Toggle: Table (Summarized) vs Grid Cards */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center space-x-1 self-end sm:self-auto border border-slate-200/80">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Summarized Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Full Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center space-x-3 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">{successMessage}</div>
        </div>
      )}

      {/* Primary Summarized Table View (Matching attached format) */}
      {viewMode === 'table' ? (
        <StockTableView
          stocks={stocks}
          onSelectStock={stock => setActiveDetailedStock(stock)}
          onQuickBuy={stock => {
            setModalStock(stock);
            setInvestUSD(10);
          }}
        />
      ) : (
        /* Alternate Grid Cards View */
        <div className="space-y-6">
          {/* Search & Sector Filters for Grid */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by company name or ticker..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
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

          <SwipeableContainer
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showMobileSwipeIndicator={true}
          >
            {filteredStocks.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center text-slate-500">
                <p className="text-sm font-medium">No company found matching your search or filter.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSector('All');
                  }}
                  className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentStocks.map(stock => (
                  <div
                    key={stock.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                  >
                    <div>
                      <div
                        onClick={() => setActiveDetailedStock(stock)}
                        className="relative h-48 w-full overflow-hidden cursor-pointer"
                      >
                        <img
                          src={stock.image}
                          alt={stock.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-xs flex items-center space-x-1">
                          <span>{stock.ticker}</span>
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        </div>
                        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-white">
                          {stock.sector}
                        </div>
                      </div>

                      <div className="p-6">
                        <div
                          onClick={() => setActiveDetailedStock(stock)}
                          className="flex justify-between items-start mb-2 cursor-pointer"
                        >
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                            {stock.name}
                          </h3>
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-slate-900">
                              {formatStockPrice(stock.priceUSD).primary}
                            </span>
                            <div className="text-xs text-slate-500">{formatStockPrice(stock.priceUSD).secondary}</div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 mt-2">{stock.description}</p>

                        {/* Historical Price Line Chart (Recharts) */}
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
                              {stock.change24h >= 0 ? (
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                              )}
                              <span>7-Day Price Trend</span>
                            </div>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                stock.change24h >= 0
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {stock.change24h >= 0 ? `+${stock.change24h}%` : `${stock.change24h}%`}
                            </span>
                          </div>

                          <div className="bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100">
                            <StockPriceHistoryChart
                              data={
                                stock.priceHistory && stock.priceHistory.length > 0
                                  ? stock.priceHistory
                                  : generateStockPriceHistory(stock.priceUSD, stock.change24h >= 0 ? 1 : 0.98)
                              }
                              stockId={stock.id}
                              ticker={stock.ticker}
                              isPositive={stock.change24h >= 0}
                              height={115}
                              compact={false}
                              showYAxis={true}
                            />
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                          <div className="bg-slate-50 p-2 rounded-xl">
                            <div className="text-[10px] text-slate-400 font-medium">Dividend Yield</div>
                            <div className="text-xs font-bold text-emerald-600 mt-0.5">
                              {stock.dividendYield}% APY
                            </div>
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

                    <div className="p-6 pt-0 flex gap-2">
                      <button
                        onClick={() => setActiveDetailedStock(stock)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 rounded-2xl transition-all text-xs text-center"
                      >
                        View Full Details
                      </button>
                      <button
                        onClick={() => {
                          setModalStock(stock);
                          setInvestUSD(10);
                        }}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-2xl transition-all text-xs flex items-center justify-center space-x-1"
                      >
                        <span>Buy Shares ($1+)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SwipeableContainer>

          {/* Pagination Bar for Grid */}
          {filteredStocks.length > 0 && (
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredStocks.length}
              itemsPerPage={itemsPerPage}
              itemName="equities"
            />
          )}
        </div>
      )}

      {/* Quick Fractional Investment Modal */}
      {modalStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setModalStock(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <img src={modalStock.image} alt={modalStock.name} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h3 className="font-bold text-slate-900">{modalStock.name}</h3>
                <span className="text-xs text-slate-500">
                  {modalStock.ticker} • {formatStockPrice(modalStock.priceUSD).primary} per share ({formatStockPrice(modalStock.priceUSD).secondary})
                </span>
              </div>
            </div>

            {/* Historical Price Performance Mini-Chart (Recharts) */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                  {modalStock.change24h >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  <span>7D Price Performance History</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600">
                  Quote: <span className="font-bold text-slate-900">{formatStockPrice(modalStock.priceUSD).primary}</span>
                </div>
              </div>
              <StockPriceHistoryChart
                data={
                  modalStock.priceHistory && modalStock.priceHistory.length > 0
                    ? modalStock.priceHistory
                    : generateStockPriceHistory(modalStock.priceUSD, modalStock.change24h >= 0 ? 1 : 0.98)
                }
                stockId={`modal-${modalStock.id}`}
                ticker={modalStock.ticker}
                isPositive={modalStock.change24h >= 0}
                height={110}
                compact={false}
                showYAxis={true}
              />
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
                    onChange={e => setInvestUSD(Number(e.target.value))}
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
                        className={`px-2.5 py-1 rounded-lg font-semibold ${
                          investUSD === amt
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
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
                    {((investUSD / modalStock.priceUSD) * 100000).toLocaleString(undefined, {
                      maximumFractionDigits: 2
                    })}{' '}
                    units
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Equivalent $ZIG:</span>
                  <span className="font-bold text-emerald-600">
                    ZIG {(investUSD * 26).toLocaleString()}
                  </span>
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

              <div className="space-y-3 pt-1">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
                >
                  <span>Confirm with Portfolio Balance (${investUSD.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">Or instant 1-tap</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div className="flex flex-col items-center">
                  <BasePayButton
                    colorScheme="light"
                    onClick={async () => {
                      if (!modalStock) return;
                      try {
                        await executeBasePay({
                          amountUSD: investUSD,
                          recipient: ZEEX_BASE_TREASURY,
                          testnet: true,
                          purpose: `ZEEX Stock Purchase: ${modalStock.ticker}`
                        });
                        const units = Math.round((investUSD / modalStock.priceUSD) * 100000) / 100000;
                        onBuyShares(modalStock, investUSD, units);
                        setSuccessMessage(
                          `Instant Base Pay confirmed! Purchased ${units.toLocaleString()} units of ${modalStock.ticker} on Base L2!`
                        );
                        setModalStock(null);
                        setTimeout(() => setSuccessMessage(null), 5000);
                      } catch (err: any) {
                        console.error('Base Pay error in shares view:', err);
                      }
                    }}
                  />
                  <span className="text-[10px] text-slate-400 mt-1">One-tap settlement via Base Account SDK</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
