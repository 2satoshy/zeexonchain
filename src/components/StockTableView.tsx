import React, { useState, useMemo } from 'react';
import { SMEStock } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, Search, SlidersHorizontal, Sparkles } from 'lucide-react';

interface StockTableViewProps {
  stocks: SMEStock[];
  onSelectStock: (stock: SMEStock) => void;
  onQuickBuy?: (stock: SMEStock) => void;
}

type SortField = 'ticker' | 'priceUSD' | 'change1h' | 'change24h' | 'marketCap' | 'volume24h' | 'txns24h' | 'tradersCount' | 'age';
type SortDirection = 'asc' | 'desc';

export const StockTableView: React.FC<StockTableViewProps> = ({
  stocks,
  onSelectStock,
  onQuickBuy
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sectors = ['All', 'Agribusiness & Export', 'Renewable Infrastructure', 'Manufacturing', 'Logistics & FMCG', 'Green Minerals'];

  const parseMetricNumber = (val: string | number | undefined): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const clean = val.replace(/[$,]/g, '').trim();
    if (clean.endsWith('M') || clean.endsWith('m')) {
      return parseFloat(clean) * 1_000_000;
    }
    if (clean.endsWith('K') || clean.endsWith('k')) {
      return parseFloat(clean) * 1_000;
    }
    if (clean.endsWith('B') || clean.endsWith('b')) {
      return parseFloat(clean) * 1_000_000_000;
    }
    return parseFloat(clean) || 0;
  };

  const parseAgeToDays = (ageStr: string | undefined): number => {
    if (!ageStr) return 0;
    const clean = ageStr.toLowerCase().trim();
    if (clean.endsWith('mo')) return parseInt(clean) * 30;
    if (clean.endsWith('d')) return parseInt(clean);
    if (clean.endsWith('y') || clean.endsWith('yr')) return parseInt(clean) * 365;
    return parseInt(clean) || 0;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedStocks = useMemo(() => {
    const filtered = stocks.filter(stock => {
      const matchesSearch =
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.sector.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = selectedSector === 'All' || stock.sector === selectedSector;
      return matchesSearch && matchesSector;
    });

    return filtered.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortField) {
        case 'ticker':
          aVal = a.ticker.toLowerCase();
          bVal = b.ticker.toLowerCase();
          return sortDirection === 'asc'
            ? (aVal as string).localeCompare(bVal as string)
            : (bVal as string).localeCompare(aVal as string);
        case 'priceUSD':
          aVal = a.priceUSD;
          bVal = b.priceUSD;
          break;
        case 'change1h':
          aVal = a.change1h ?? 0;
          bVal = b.change1h ?? 0;
          break;
        case 'change24h':
          aVal = a.change24h;
          bVal = b.change24h;
          break;
        case 'marketCap':
          aVal = parseMetricNumber(a.marketCap);
          bVal = parseMetricNumber(b.marketCap);
          break;
        case 'volume24h':
          aVal = parseMetricNumber(a.volume24h || `${(a.priceUSD * 15000).toFixed(0)}`);
          bVal = parseMetricNumber(b.volume24h || `${(b.priceUSD * 15000).toFixed(0)}`);
          break;
        case 'txns24h':
          aVal = a.txns24h ?? 500;
          bVal = b.txns24h ?? 500;
          break;
        case 'tradersCount':
          aVal = a.tradersCount ?? 200;
          bVal = b.tradersCount ?? 200;
          break;
        case 'age':
          aVal = parseAgeToDays(a.age || '3mo');
          bVal = parseAgeToDays(b.age || '3mo');
          break;
        default:
          aVal = 0;
          bVal = 0;
      }

      if (sortDirection === 'asc') {
        return (aVal as number) - (bVal as number);
      }
      return (bVal as number) - (aVal as number);
    });
  }, [stocks, searchQuery, selectedSector, sortField, sortDirection]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline-block opacity-70 group-hover:opacity-100" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-600 ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600 ml-1 inline-block" />
    );
  };

  const formatNumberCompact = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search & Sector Filters */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search token symbol, company name, or sector..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {sectors.map(sector => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
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

      {/* Summarized Stocks Table (Matching exact design layout) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50 text-slate-500 text-xs font-medium tracking-normal select-none">
                <th
                  onClick={() => handleSort('ticker')}
                  className="py-3.5 px-5 font-semibold text-slate-600 cursor-pointer group hover:text-slate-900 w-[280px]"
                >
                  <span className="inline-flex items-center">
                    Token
                    {renderSortIndicator('ticker')}
                  </span>
                </th>

                <th
                  onClick={() => handleSort('priceUSD')}
                  className="py-3.5 px-4 font-semibold text-slate-600 text-right cursor-pointer group hover:text-slate-900"
                >
                  <span className="inline-flex items-center justify-end">
                    Price
                    {renderSortIndicator('priceUSD')}
                  </span>
                </th>

                <th
                  onClick={() => handleSort('change1h')}
                  className="py-3.5 px-4 font-semibold text-slate-600 text-right cursor-pointer group hover:text-slate-900"
                >
                  <span className="inline-flex items-center justify-end">
                    1H
                    {renderSortIndicator('change1h')}
                  </span>
                </th>

                <th
                  onClick={() => handleSort('change24h')}
                  className="py-3.5 px-4 font-semibold text-slate-600 text-right cursor-pointer group hover:text-slate-900"
                >
                  <span className="inline-flex items-center justify-end">
                    24H
                    {renderSortIndicator('change24h')}
                  </span>
                </th>

                <th
                  onClick={() => handleSort('marketCap')}
                  className="py-3.5 px-4 font-semibold text-slate-600 text-right cursor-pointer group hover:text-slate-900"
                >
                  <span className="inline-flex items-center justify-end">
                    Market cap
                    {renderSortIndicator('marketCap')}
                  </span>
                </th>

                <th
                  onClick={() => handleSort('volume24h')}
                  className="py-3.5 px-4 font-semibold text-slate-600 text-right cursor-pointer group hover:text-slate-900"
                >
                  <span className="inline-flex items-center justify-end">
                    Volume
                    {renderSortIndicator('volume24h')}
                  </span>
                </th>

                <th
                  onClick={() => handleSort('txns24h')}
                  className="py-3.5 px-4 font-semibold text-slate-600 text-right cursor-pointer group hover:text-slate-900"
                >
                  <span className="inline-flex items-center justify-end">
                    Txns
                    {renderSortIndicator('txns24h')}
                  </span>
                </th>

                <th
                  onClick={() => handleSort('tradersCount')}
                  className="py-3.5 px-4 font-semibold text-slate-600 text-right cursor-pointer group hover:text-slate-900"
                >
                  <span className="inline-flex items-center justify-end">
                    Traders
                    {renderSortIndicator('tradersCount')}
                  </span>
                </th>

                <th
                  onClick={() => handleSort('age')}
                  className="py-3.5 px-5 font-semibold text-slate-600 text-right cursor-pointer group hover:text-slate-900"
                >
                  <span className="inline-flex items-center justify-end">
                    Age
                    {renderSortIndicator('age')}
                  </span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedStocks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 px-6 text-center text-slate-500">
                    <div className="text-sm font-medium">No SME stocks or tokens found matching your filters.</div>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedSector('All');
                      }}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                    >
                      Clear search filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredAndSortedStocks.map(stock => {
                  const change1h = stock.change1h ?? 0.02;
                  const is1hPositive = change1h >= 0;
                  const is24hPositive = stock.change24h >= 0;
                  const volumeDisplay =
                    stock.volume24h || `$${formatNumberCompact(stock.priceUSD * (stock.fractionalUnitsAvailable ? 25000 : 15000))}`;
                  const txnsDisplay = stock.txns24h ? formatNumberCompact(stock.txns24h) : '1.24K';
                  const tradersDisplay = stock.tradersCount ? formatNumberCompact(stock.tradersCount) : '640';
                  const ageDisplay = stock.age || '3mo';

                  return (
                    <tr
                      key={stock.id}
                      onClick={() => onSelectStock(stock)}
                      className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                    >
                      {/* Token Column with Avatar, Chain Dot, Ticker, Verified Badge, and Subtext */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-3">
                          {/* Circular Avatar with Blue Chain Badge */}
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200/80 flex items-center justify-center shadow-2xs">
                              {stock.image ? (
                                <img
                                  src={stock.image}
                                  alt={stock.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <span className="font-bold text-xs text-slate-700">
                                  {stock.ticker.slice(0, 3)}
                                </span>
                              )}
                            </div>
                            {/* Blue Network / L2 Chain Dot badge at bottom right */}
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-xs" title="Base L2 Verified" />
                          </div>

                          {/* Ticker & Name */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1">
                              <span className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-blue-600 transition-colors">
                                {stock.ticker}
                              </span>
                              {/* Blue verified checkmark icon */}
                              <svg
                                className="w-3.5 h-3.5 text-blue-600 shrink-0 inline-block fill-blue-600"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                                  fill="#2563eb"
                                />
                                <path
                                  d="M10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                                  fill="#ffffff"
                                />
                              </svg>
                            </div>
                            <div className="text-xs text-slate-400 font-normal truncate max-w-[200px]">
                              {stock.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-semibold text-slate-900 text-sm">
                          ${stock.priceUSD >= 1 ? stock.priceUSD.toFixed(2) : stock.priceUSD.toFixed(3)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ZIG {stock.priceZIG ? stock.priceZIG.toFixed(2) : (stock.priceUSD * 26).toFixed(2)}
                        </div>
                      </td>

                      {/* 1H Change */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className={`inline-flex items-center text-xs font-semibold ${
                            is1hPositive ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          <span className="mr-0.5 text-[10px]">
                            {is1hPositive ? '▲' : '▼'}
                          </span>
                          <span>
                            {Math.abs(change1h).toFixed(2)}%
                          </span>
                        </div>
                      </td>

                      {/* 24H Change */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className={`inline-flex items-center text-xs font-semibold ${
                            is24hPositive ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          <span className="mr-0.5 text-[10px]">
                            {is24hPositive ? '▲' : '▼'}
                          </span>
                          <span>
                            {Math.abs(stock.change24h).toFixed(2)}%
                          </span>
                        </div>
                      </td>

                      {/* Market Cap */}
                      <td className="py-3.5 px-4 text-right text-sm font-semibold text-slate-800">
                        {stock.marketCap}
                      </td>

                      {/* 24H Volume */}
                      <td className="py-3.5 px-4 text-right text-sm font-medium text-slate-700">
                        {volumeDisplay}
                      </td>

                      {/* Transactions Count */}
                      <td className="py-3.5 px-4 text-right text-sm font-medium text-slate-700">
                        {txnsDisplay}
                      </td>

                      {/* Traders / Holders Count */}
                      <td className="py-3.5 px-4 text-right text-sm font-medium text-slate-700">
                        {tradersDisplay}
                      </td>

                      {/* Age */}
                      <td className="py-3.5 px-5 text-right text-sm font-medium text-slate-600">
                        {ageDisplay}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-50/70 border-t border-slate-200/80 px-6 py-3 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live SECZim onchain order book • Click any row to view full listing & buy shares</span>
          </div>
          <div className="font-semibold text-slate-600">
            Showing {filteredAndSortedStocks.length} of {stocks.length} tokenized equities
          </div>
        </div>
      </div>
    </div>
  );
};
