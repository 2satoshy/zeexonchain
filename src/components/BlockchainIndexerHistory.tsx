import React, { useState } from 'react';
import { 
  Radio, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  ArrowDownUp, 
  Building2, 
  ShieldCheck, 
  Coins, 
  Search, 
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Flame,
  AlertOctagon,
  X
} from 'lucide-react';
import { IndexedTransaction } from '../types';
import { useBlockchainIndexer, IndexerCategoryFilter } from '../hooks/useBlockchainIndexer';
import { UNISWAP_V3_ADDRESSES } from '../data/tokenData';

interface BlockchainIndexerHistoryProps {
  onOpenSwap?: () => void;
  onOpenTokenize?: () => void;
}

export const BlockchainIndexerHistory: React.FC<BlockchainIndexerHistoryProps> = ({
  onOpenSwap,
  onOpenTokenize
}) => {
  const {
    activeAddress,
    blockNumber,
    filteredTransactions,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isIndexing,
    lastIndexedAt,
    stats,
    reindexFromRPC,
  } = useBlockchainIndexer();

  const [selectedTx, setSelectedTx] = useState<IndexedTransaction | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getCategoryBadge = (category: IndexedTransaction['category']) => {
    switch (category) {
      case 'SWAP':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <ArrowDownUp className="w-3 h-3 text-cyan-600" />
            <span>Uniswap v3 Swap</span>
          </span>
        );
      case 'TOKENIZATION':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Building2 className="w-3 h-3 text-purple-600" />
            <span>SECZim ERC-3643</span>
          </span>
        );
      case 'BURN':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-600" />
            <span>Stock Burn & Delist</span>
          </span>
        );
      case 'DEPOSIT':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Coins className="w-3 h-3 text-emerald-600" />
            <span>Base Paymaster Deposit</span>
          </span>
        );
      case 'DIVIDEND':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>ZSE Trust Dividend</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
            <span>Onchain Event</span>
          </span>
        );
    }
  };

  const getConfirmationBadge = (confirmations: number, status: IndexedTransaction['status']) => {
    if (confirmations >= 32 || status === 'Finalized') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{confirmations.toLocaleString()} conf (Finalized)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
        <span>{confirmations} conf (Confirming)</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Indexer Status Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">Base Sepolia Blockchain Indexer</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live RPC Synced</span>
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Current Block: <strong className="text-slate-200 font-mono">#{blockNumber ? blockNumber.toLocaleString() : '18,459,182'}</strong></span>
              <span>•</span>
              <span>Network: <strong className="text-slate-300">Base Sepolia (84532)</strong></span>
              <span>•</span>
              <span>Last Sync: <span className="text-slate-400">{lastIndexedAt.toLocaleTimeString()}</span></span>
            </div>
          </div>
        </div>

        <button
          onClick={reindexFromRPC}
          disabled={isIndexing}
          className="self-stretch sm:self-auto px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isIndexing ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
          <span>{isIndexing ? 'Re-indexing Blocks...' : 'Refresh RPC Indexer'}</span>
        </button>
      </div>

      {/* Indexer Stats Metric Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-medium">Total Indexed Volume</div>
          <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
            ${stats.totalVolumeUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
            ≈ {(stats.totalVolumeUSD * 26).toLocaleString(undefined, { maximumFractionDigits: 0 })} ZIG
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-medium">Uniswap v3 Swaps</div>
          <div className="text-sm sm:text-base font-bold text-cyan-600 mt-0.5 flex items-center space-x-1">
            <ArrowDownUp className="w-4 h-4" />
            <span>{stats.swapsCount} Swaps</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">100% Onchain Router</div>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-medium">SME Tokenizations</div>
          <div className="text-sm sm:text-base font-bold text-purple-600 mt-0.5 flex items-center space-x-1">
            <Building2 className="w-4 h-4" />
            <span>{stats.tokenizationsCount} Tokenized</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">SECZim ERC-3643</div>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-medium">L2 Gas Savings</div>
          <div className="text-sm sm:text-base font-bold text-emerald-600 mt-0.5 flex items-center space-x-1">
            <Zap className="w-4 h-4" />
            <span>${stats.totalGasSavedUSD.toFixed(0)} Saved</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">vs Ethereum L1</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 justify-between items-stretch sm:items-center">
          {/* Category Chips */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(['ALL', 'SWAP', 'TOKENIZATION', 'BURN', 'DEPOSIT', 'DIVIDEND'] as IndexerCategoryFilter[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' && 'All Onchain Events'}
                {cat === 'SWAP' && 'Uniswap v3 Swaps'}
                {cat === 'TOKENIZATION' && 'SME Tokenizations'}
                {cat === 'BURN' && 'Burns & Delistings'}
                {cat === 'DEPOSIT' && 'Deposits'}
                {cat === 'DIVIDEND' && 'Dividends'}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hash, ticker, token..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="space-y-2.5">
          {filteredTransactions.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Info className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
              <div className="text-xs font-bold text-slate-700">No onchain transactions match your criteria</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Try clearing filters or search query</div>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="p-3.5 bg-slate-50 hover:bg-blue-50/40 rounded-xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-blue-300">
                      {tx.category === 'SWAP' && <ArrowDownUp className="w-4 h-4 text-cyan-600" />}
                      {tx.category === 'TOKENIZATION' && <Building2 className="w-4 h-4 text-purple-600" />}
                      {tx.category === 'BURN' && <Flame className="w-4 h-4 text-rose-600" />}
                      {tx.category === 'DEPOSIT' && <Coins className="w-4 h-4 text-emerald-600" />}
                      {tx.category === 'DIVIDEND' && <Sparkles className="w-4 h-4 text-amber-600" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 truncate">{tx.title}</span>
                        {getCategoryBadge(tx.category)}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span className="font-mono text-slate-600 font-semibold">Block #{tx.blockNumber.toLocaleString()}</span>
                        <span>•</span>
                        <span>{tx.timestamp}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 pl-10 sm:pl-0">
                    <div className="text-xs font-bold text-slate-900">
                      ${tx.amountUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </div>
                    <div className="mt-0.5">
                      {getConfirmationBadge(tx.confirmations, tx.status)}
                    </div>
                  </div>
                </div>

                {/* Sub-details snippet */}
                {tx.category === 'SWAP' && tx.swapDetails && (
                  <div className="text-[11px] text-slate-600 bg-white/70 px-2.5 py-1.5 rounded-lg border border-slate-200/80 flex flex-wrap items-center justify-between gap-1">
                    <span className="font-medium text-slate-700">
                      Route: <strong className="text-cyan-700">{tx.swapDetails.route.join(' → ')}</strong>
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      Fee Tier: {tx.swapDetails.feeTier} • Gas: {tx.gasUsedETH} (~${tx.gasFeeUSD.toFixed(2)})
                    </span>
                  </div>
                )}

                {tx.category === 'TOKENIZATION' && tx.tokenizationDetails && (
                  <div className="text-[11px] text-slate-600 bg-purple-50/50 px-2.5 py-1.5 rounded-lg border border-purple-100 flex flex-wrap items-center justify-between gap-1">
                    <span className="font-medium text-purple-900">
                      SECZim ID: <strong className="font-mono text-purple-700">{tx.tokenizationDetails.seczimFilingId}</strong> ({tx.tokenizationDetails.tokenStandard})
                    </span>
                    <span className="text-purple-700 font-mono text-[10px]">
                      Custody: {tx.tokenizationDetails.custodianEscrow}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Transaction Inspection Modal / Receipt */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {selectedTx.category === 'SWAP' && <ArrowDownUp className="w-4 h-4" />}
                  {selectedTx.category === 'TOKENIZATION' && <Building2 className="w-4 h-4" />}
                  {selectedTx.category === 'DEPOSIT' && <Coins className="w-4 h-4" />}
                  {selectedTx.category === 'DIVIDEND' && <Sparkles className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Onchain Transaction Receipt</h3>
                  <div className="text-[10px] text-slate-400">Indexed from Base Sepolia L2 (Chain ID 84532)</div>
                </div>
              </div>

              <button
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Confirmation & Status banner */}
            <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Blockchain Status</span>
                {getConfirmationBadge(selectedTx.confirmations, selectedTx.status)}
              </div>
              <div className="text-base font-bold text-white flex items-center justify-between">
                <span>{selectedTx.title}</span>
                <span className="text-emerald-400 font-mono">${selectedTx.amountUSD.toLocaleString()} USD</span>
              </div>
            </div>

            {/* Receipt Details List */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transaction Hash (TxID)</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-800 break-all pr-2">{selectedTx.txHash}</span>
                  <button
                    onClick={() => handleCopy(selectedTx.txHash, 'hash')}
                    className="p-1 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 shrink-0 cursor-pointer"
                    title="Copy Tx Hash"
                  >
                    {copiedHash === 'hash' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium">Block Height</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">#{selectedTx.blockNumber.toLocaleString()}</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium">Gas Paid on L2</div>
                  <div className="font-mono font-bold text-emerald-600 mt-0.5">{selectedTx.gasUsedETH} (~${selectedTx.gasFeeUSD.toFixed(2)})</div>
                </div>
              </div>

              {/* Specific details for Tokenization */}
              {selectedTx.tokenizationDetails && (
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-purple-900 font-bold text-xs">
                    <FileCheck className="w-4 h-4 text-purple-700" />
                    <span>SECZim Regulatory Tokenization Spec</span>
                  </div>
                  <div className="text-[11px] text-purple-800 space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span className="text-purple-600">Company & Ticker:</span>
                      <span className="font-bold">{selectedTx.tokenizationDetails.companyName} ({selectedTx.tokenizationDetails.ticker})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-600">Shares Minted:</span>
                      <span className="font-bold font-mono">{selectedTx.tokenizationDetails.sharesMinted.toLocaleString()} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-600">SECZim Compliance Filing:</span>
                      <span className="font-bold font-mono bg-purple-100 px-1 rounded">{selectedTx.tokenizationDetails.seczimFilingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-600">Trust Escrow Custodian:</span>
                      <span className="font-bold">{selectedTx.tokenizationDetails.custodianEscrow}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Specific details for Burn / Stock Delisting */}
              {selectedTx.burnDetails && (
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-rose-900 font-bold text-xs">
                    <Flame className="w-4 h-4 text-rose-600" />
                    <span>SECZim Stock Burn & Delisting Attestation</span>
                  </div>
                  <div className="text-[11px] text-rose-800 space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span className="text-rose-600">Company & Ticker:</span>
                      <span className="font-bold">{selectedTx.burnDetails.companyName} ({selectedTx.burnDetails.ticker})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rose-600">Shares Burned (0x0):</span>
                      <span className="font-bold font-mono text-rose-700">-{selectedTx.burnDetails.burnedShares.toLocaleString()} shares</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rose-600">Status:</span>
                      <span className="font-bold font-mono">
                        {selectedTx.burnDetails.isFullDelisting ? 'Full Delisting (100% Recalled)' : `Capital Reduction (${selectedTx.burnDetails.remainingShares.toLocaleString()} remaining)`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rose-600">Regulatory Reason:</span>
                      <span className="font-semibold text-rose-900">{selectedTx.burnDetails.reason}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rose-600">SECZim Gazette Filing:</span>
                      <span className="font-bold font-mono bg-rose-100 px-1 rounded">{selectedTx.burnDetails.seczimFilingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rose-600">Escrow Payout Fund:</span>
                      <span className="font-bold font-mono text-emerald-700">${selectedTx.burnDetails.totalRedemptionPayoutUSD.toLocaleString()} USD</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Specific details for Swaps */}
              {selectedTx.swapDetails && (
                <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-200 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-cyan-900 font-bold text-xs">
                    <ArrowDownUp className="w-4 h-4 text-cyan-700" />
                    <span>Uniswap v3 Router Execution</span>
                  </div>
                  <div className="text-[11px] text-cyan-900 space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span className="text-cyan-700">Swap Path:</span>
                      <span className="font-bold">{selectedTx.swapDetails.tokenIn} → {selectedTx.swapDetails.tokenOut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-700">Fee Tier:</span>
                      <span className="font-bold font-mono">{selectedTx.swapDetails.feeTier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-700">Pool Contract:</span>
                      <span className="font-mono text-[10px] text-cyan-800 truncate max-w-[200px]">{selectedTx.swapDetails.poolAddress}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <a
                href={selectedTx.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
              >
                <span>View on BaseScan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
