import React from 'react';
import { RefreshCw, Radio, CheckCircle2, ShieldCheck, Database, ExternalLink } from 'lucide-react';
import { UNISWAP_V3_ADDRESSES } from '../data/tokenData';

interface OnchainLiveStatusBadgeProps {
  blockNumber?: bigint;
  isLoading?: boolean;
  isRefetching?: boolean;
  onRefresh?: () => void;
  activeAddress?: string;
  source?: 'onchain' | 'fallback';
}

export const OnchainLiveStatusBadge: React.FC<OnchainLiveStatusBadgeProps> = ({
  blockNumber,
  isLoading = false,
  isRefetching = false,
  onRefresh,
  activeAddress,
  source = 'onchain'
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900 text-white px-3.5 py-2 rounded-2xl border border-slate-800 text-xs shadow-xs">
      <div className="flex items-center space-x-2.5">
        <div className="flex items-center space-x-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Wagmi • Base Sepolia RPC</span>
        </div>

        {blockNumber ? (
          <div className="hidden sm:flex items-center space-x-1 text-[11px] text-slate-400 font-mono">
            <Radio className="w-3 h-3 text-blue-400" />
            <span>Block #{blockNumber.toString()}</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center space-x-1 text-[11px] text-slate-400">
            <Database className="w-3 h-3 text-slate-500" />
            <span>Chain ID 84532</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {activeAddress && (
          <a
            href={`${UNISWAP_V3_ADDRESSES.EXPLORER_URL}/address/${activeAddress}`}
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            <span className="font-mono">{activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
          </a>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading || isRefetching}
            className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 py-1 rounded-xl text-[11px] font-medium border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            title="Refetch real-time balances via Wagmi useReadContract & useBalance"
          >
            <RefreshCw className={`w-3 h-3 ${isRefetching || isLoading ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
            <span>{isRefetching ? 'Reading Chain...' : 'Sync Onchain'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
