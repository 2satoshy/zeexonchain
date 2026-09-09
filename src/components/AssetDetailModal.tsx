import React from 'react';
import { 
  X, 
  ArrowRightLeft, 
  Send, 
  Plus, 
  Building2, 
  ExternalLink, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Coins, 
  DollarSign 
} from 'lucide-react';
import { UserAssetItem } from './HomeHeroSwipeCard';
import { TabType, SMEStock, TokenAsset } from '../types';
import { UNISWAP_V3_ADDRESSES } from '../data/tokenData';
import { useCurrency } from '../context/CurrencyContext';

interface AssetDetailModalProps {
  asset: UserAssetItem | null;
  onClose: () => void;
  setActiveTab: (tab: TabType) => void;
  onOpenDeposit?: (token?: TokenAsset) => void;
  onOpenSend?: (token?: TokenAsset) => void;
  onOpenSwap?: () => void;
  onSelectStock?: (stock: SMEStock) => void;
  stocks: SMEStock[];
  tokens: TokenAsset[];
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  onClose,
  setActiveTab,
  onOpenDeposit,
  onOpenSend,
  onOpenSwap,
  onSelectStock,
  stocks,
  tokens
}) => {
  const { currencyMode, formatAmount, oracleRate } = useCurrency();

  if (!asset) return null;

  // Check if asset matches an SME stock
  const matchedStock = stocks.find(
    s => s.ticker.toUpperCase() === asset.symbol.toUpperCase() ||
         s.name.toLowerCase() === asset.name.toLowerCase()
  );

  // Find matching token asset for contract address / decimals
  const matchedToken = tokens.find(t => t.symbol.toUpperCase() === asset.symbol.toUpperCase());
  const contractAddress = matchedToken?.address || (matchedStock?.tokenAddress);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
              {asset.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-lg text-white">{asset.name}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white/10 text-emerald-400">
                  {asset.symbol}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                <span>{asset.categoryLabel}</span>
                {asset.badge && (
                  <>
                    <span>•</span>
                    <span className="text-blue-400 font-medium">{asset.badge}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Card Display */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Your Balance</span>
            <span className="font-mono text-emerald-400 font-semibold">{asset.contractStandard || 'Base L2 Onchain'}</span>
          </div>

          <div className="flex justify-between items-baseline">
            <div className="text-2xl font-black text-white font-mono">
              {asset.balanceFormatted}
            </div>
            <div className="text-right">
              <div className="text-lg font-extrabold text-emerald-400">
                {formatAmount(asset.valueUSD)}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {currencyMode === 'USD' ? (
                  <>ZIG {asset.valueZIG.toLocaleString(undefined, { maximumFractionDigits: 0 })}</>
                ) : (
                  <>${asset.valueUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</>
                )}
              </div>
            </div>
          </div>

          {asset.change24h !== undefined && (
            <div className="pt-2 border-t border-slate-700/50 flex justify-between text-xs">
              <span className="text-slate-400">24h Market Change</span>
              <span className={`font-bold flex items-center ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                {asset.change24h >= 0 ? `+${asset.change24h}%` : `${asset.change24h}%`}
              </span>
            </div>
          )}
        </div>

        {/* Stock Info & Dividend Metrics (if stock) */}
        {matchedStock && (
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/40 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Company Sector</span>
              <span className="font-semibold text-white">{matchedStock.sector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dividend Yield</span>
              <span className="font-bold text-emerald-400">{matchedStock.dividendYield}% per annum</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Trust Guarantee</span>
              <span className="font-semibold text-blue-300">{matchedStock.backingTrust}</span>
            </div>
            {matchedStock.description && (
              <p className="text-slate-300 text-[11px] pt-2 border-t border-slate-700/40 leading-relaxed">
                {matchedStock.description}
              </p>
            )}
          </div>
        )}

        {/* Contract Address / BaseScan Link */}
        {contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000' && (
          <div className="flex items-center justify-between bg-slate-800/30 px-3.5 py-2 rounded-xl border border-slate-700/40 text-[11px]">
            <span className="text-slate-400 font-mono">Contract: {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}</span>
            <a
              href={`${UNISWAP_V3_ADDRESSES.EXPLORER_URL}/address/${contractAddress}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center font-semibold"
            >
              <span>BaseScan</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        )}

        {/* Action Buttons Grid: Buy, Swap, Send, View Details */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            {/* Swap Button */}
            <button
              onClick={() => {
                onClose();
                if (onOpenSwap) onOpenSwap();
                else setActiveTab('trading');
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-3 rounded-2xl text-xs flex flex-col items-center justify-center space-y-1 shadow-md transition-all cursor-pointer active:scale-95"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Swap Token</span>
            </button>

            {/* Deposit / Add Button */}
            <button
              onClick={() => {
                onClose();
                if (onOpenDeposit) onOpenDeposit(matchedToken);
                else setActiveTab('trading');
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-3 rounded-2xl text-xs flex flex-col items-center justify-center space-y-1 shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Buy / Deposit</span>
            </button>

            {/* Send Button */}
            <button
              onClick={() => {
                onClose();
                if (onOpenSend) onOpenSend(matchedToken);
                else setActiveTab('trading');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-3 rounded-2xl text-xs flex flex-col items-center justify-center space-y-1 border border-slate-700 transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Send Token</span>
            </button>
          </div>

          {/* Full Stock Page Detail Button (if stock) */}
          {matchedStock && (
            <button
              onClick={() => {
                onClose();
                if (onSelectStock) {
                  onSelectStock(matchedStock);
                } else {
                  setActiveTab('shares');
                }
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Building2 className="w-4 h-4" />
              <span>View Full Company Listing & Dividend Reports</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
