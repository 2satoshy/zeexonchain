import React from 'react';
import { StockPricePoint } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface StockPriceHistoryChartProps {
  data: StockPricePoint[];
  stockId: string;
  ticker: string;
  isPositive?: boolean;
  height?: number;
  compact?: boolean;
  showYAxis?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: StockPricePoint;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const priceUSD = dataPoint.priceUSD;
    const priceZIG = dataPoint.priceZIG || Math.round(priceUSD * 26 * 100) / 100;
    const volume = dataPoint.volume;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700/60 text-xs pointer-events-none z-30 animate-fade-in min-w-[130px]">
        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>{label || dataPoint.date}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">7D</span>
        </div>
        <div className="font-extrabold text-white text-sm tracking-tight flex items-baseline justify-between">
          <span>${priceUSD.toFixed(2)}</span>
          <span className="text-[10px] text-emerald-400 font-mono">USD</span>
        </div>
        <div className="text-[11px] text-slate-300 font-medium flex items-center justify-between mt-0.5">
          <span className="text-slate-400 text-[10px]">ZIG Rate:</span>
          <span>ZIG {priceZIG.toFixed(2)}</span>
        </div>
        {volume && (
          <div className="text-[10px] text-slate-400 border-t border-slate-800 mt-1 pt-1 flex justify-between">
            <span>24h Vol:</span>
            <span className="text-slate-300 font-medium">{volume.toLocaleString()} units</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const StockPriceHistoryChart: React.FC<StockPriceHistoryChartProps> = ({
  data,
  stockId,
  isPositive = true,
  height = 110,
  compact = false,
  showYAxis = true
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No price history available
      </div>
    );
  }

  const gradientId = `stock-chart-grad-${stockId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const strokeColor = isPositive ? '#10b981' : '#f43f5e';
  const fillColor = isPositive ? '#10b981' : '#f43f5e';

  // Compute min/max for accurate auto-scaling
  const prices = data.map(d => d.priceUSD);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = Math.max(0.01, (maxPrice - minPrice) * 0.15);

  const yDomain = [
    Math.max(0, Math.round((minPrice - padding) * 100) / 100),
    Math.round((maxPrice + padding) * 100) / 100
  ];

  return (
    <div className="w-full relative select-none">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: compact ? 4 : 8,
              right: compact ? 4 : 8,
              left: showYAxis ? (compact ? -22 : -20) : -40,
              bottom: compact ? 0 : 4
            }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={fillColor} stopOpacity={0.28} />
                <stop offset="95%" stopColor={fillColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {!compact && (
              <CartesianGrid
                strokeDasharray="2 2"
                vertical={false}
                stroke="#f1f5f9"
              />
            )}

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
              dy={3}
              interval="preserveStartEnd"
            />

            {showYAxis && (
              <YAxis
                domain={yDomain}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 500 }}
                tickFormatter={(val: number) => `$${val >= 1 ? val.toFixed(2) : val.toFixed(3)}`}
                orientation="left"
              />
            )}

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: '#94a3b8',
                strokeWidth: 1,
                strokeDasharray: '3 3'
              }}
            />

            <Area
              type="monotone"
              dataKey="priceUSD"
              stroke={strokeColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 4.5,
                stroke: strokeColor,
                strokeWidth: 2,
                fill: '#ffffff'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
