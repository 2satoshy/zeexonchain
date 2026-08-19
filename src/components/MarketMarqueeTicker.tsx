import React, { useState } from 'react';
import { SMEStock, TabType } from '../types';

interface MarketMarqueeTickerProps {
  stocks: SMEStock[];
  setActiveTab: (tab: TabType) => void;
  onSelectStock?: (stock: SMEStock) => void;
}

export const MarketMarqueeTicker: React.FC<MarketMarqueeTickerProps> = ({ stocks, setActiveTab, onSelectStock }) => {
  const [isPaused, setIsPaused] = useState(false);

  // Prepare categorized stream of all stocks
  const marketCapSorted = [...stocks].sort((a, b) => b.marketCap - a.marketCap);
  const viralSorted = [...stocks].sort((a, b) => b.dividendYield - a.dividendYield);
  const hottestSorted = [...stocks].sort((a, b) => b.change24h - a.change24h);
  const newLaunchesSorted = [...stocks].reverse();

  const marqueeItems = [
    ...marketCapSorted.slice(0, 5).map(s => ({ ...s, categoryTag: 'Top Cap', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' })),
    ...viralSorted.slice(0, 5).map(s => ({ ...s, categoryTag: 'Viral', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' })),
    ...hottestSorted.slice(0, 5).map(s => ({ ...s, categoryTag: 'Hottest', badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30' })),
    ...newLaunchesSorted.slice(0, 5).map(s => ({ ...s, categoryTag: 'New', badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' })),
  ];

  return (
    <div className="bg-slate-900 border-y border-slate-800 py-1 px-1.5 shadow-inner text-white overflow-hidden relative">
      {/* Marquee Ticker Track (Right to Left) */}
      <div 
        className="relative w-full overflow-hidden flex items-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`flex space-x-2.5 animate-marquee whitespace-nowrap ${isPaused ? '[animation-play-state:paused]' : ''}`}>
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => {
                if (onSelectStock) onSelectStock(item);
                setActiveTab('shares');
              }}
              className="inline-flex items-center space-x-1.5 bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 px-2 py-0.5 rounded-lg cursor-pointer transition-all hover:scale-105 hover:border-emerald-500/50 shadow-sm group shrink-0"
            >
              <img src={item.image} alt={item.name} className="w-4 h-4 rounded object-cover" />
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-white text-[10px] group-hover:text-emerald-400 transition-colors">{item.ticker}</span>
                <span className={`text-[7px] font-bold px-1 py-0 rounded border ${item.badgeColor}`}>
                  {item.categoryTag}
                </span>
                <span className="text-[10px] text-slate-300 font-medium">${item.priceUSD.toFixed(2)}</span>
                <span className={`text-[9px] font-bold px-1 py-0 rounded ${
                  item.change24h >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {item.change24h >= 0 ? '+' : ''}{item.change24h}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
