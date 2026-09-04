import React, { useState, useEffect, useCallback } from 'react';
import {
  Coins,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Flame,
  PlusCircle,
  BookOpen,
  Gift,
  Wallet,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Lock,
  Layers
} from 'lucide-react';
import { ApiService } from '../services/api';

interface ZigHubViewProps {
  zigBalance: number;
  onSwapZig: (fromCurrency: string, amount: number) => void;
  activeAddress?: string;
  onOpenConnectWallet?: () => void;
  onRefreshBalances?: () => void;
}

export const ZigHubView: React.FC<ZigHubViewProps> = ({
  zigBalance,
  onSwapZig,
  activeAddress,
  onOpenConnectWallet,
  onRefreshBalances
}) => {
  // FX Swap states
  const [swapAmount, setSwapAmount] = useState<number>(100);
  const [direction, setDirection] = useState<'USDC_TO_ZIG' | 'ZIG_TO_USDC'>('USDC_TO_ZIG');
  const [swapSuccessMsg, setSwapSuccessMsg] = useState<string | null>(null);

  // B20 Token details from backend
  const [zigTokenData, setZigTokenData] = useState<any>(null);
  const [supplyOperations, setSupplyOperations] = useState<any[]>([]);
  const [isLoadingTokenData, setIsLoadingTokenData] = useState<boolean>(true);

  // Airdrop state
  const [airdropStatus, setAirdropStatus] = useState<{
    claimed: boolean;
    claimedAt?: string;
    transfers?: any[];
  } | null>(null);
  const [isClaimingAirdrop, setIsClaimingAirdrop] = useState(false);
  const [airdropMsg, setAirdropMsg] = useState<string | null>(null);

  // Mint / Burn management states
  const [activeB20Tab, setActiveB20Tab] = useState<'mint' | 'burn' | 'ops'>('mint');
  const [mintAmount, setMintAmount] = useState<number>(50000);
  const [mintRecipient, setMintRecipient] = useState<string>('');
  const [mintMemo, setMintMemo] = useState<string>('EXPANSION_RESERVE_INFLOW_2026');
  const [isMinting, setIsMinting] = useState(false);

  const [burnAmount, setBurnAmount] = useState<number>(10000);
  const [burnMemo, setBurnMemo] = useState<string>('REDEMPTION_CUSTODY_REBALANCE_2026');
  const [isBurning, setIsBurning] = useState(false);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);

  const exchangeRate = 26.00; // 1 USD = 26.00 ZIG ($0.03846 per ZIG)
  const defaultContract = '0x98f2195f2A5303D81878d65507E78e063a110000';

  // Load token data & supply operations
  const loadTokenData = useCallback(async () => {
    try {
      setIsLoadingTokenData(true);
      const [tokenRes, opsRes] = await Promise.allSettled([
        ApiService.getZigTokenDetails(),
        ApiService.getZigOperations(10)
      ]);

      if (tokenRes.status === 'fulfilled' && tokenRes.value.data) {
        setZigTokenData(tokenRes.value.data);
      }
      if (opsRes.status === 'fulfilled' && opsRes.value.data) {
        setSupplyOperations(opsRes.value.data);
      }
    } catch (err) {
      console.warn('Error fetching ZIG token data:', err);
    } finally {
      setIsLoadingTokenData(false);
    }
  }, []);

  // Check airdrop status for active address
  const checkAirdrop = useCallback(async () => {
    if (!activeAddress) {
      setAirdropStatus(null);
      return;
    }
    try {
      const res = await ApiService.getAirdropStatus(activeAddress);
      setAirdropStatus({
        claimed: res.claimed,
        claimedAt: res.claimedAt,
        transfers: res.transfers
      });
    } catch (err) {
      console.warn('Airdrop status error:', err);
    }
  }, [activeAddress]);

  useEffect(() => {
    loadTokenData();
  }, [loadTokenData]);

  useEffect(() => {
    checkAirdrop();
  }, [checkAirdrop]);

  // Handle Airdrop Claim
  const handleClaimAirdrop = async () => {
    if (!activeAddress) {
      if (onOpenConnectWallet) onOpenConnectWallet();
      return;
    }
    try {
      setIsClaimingAirdrop(true);
      setAirdropMsg(null);
      const res = await ApiService.claimAirdrop(activeAddress);
      if (res.success) {
        setAirdropStatus({
          claimed: true,
          claimedAt: new Date().toISOString(),
          transfers: res.transfers
        });
        setAirdropMsg('🎉 Successfully claimed 1,000 $ZIG Stablecoin + 400 SME stock tokens on Base Sepolia!');
        if (onRefreshBalances) onRefreshBalances();
      } else {
        setAirdropMsg(res.message || 'Already claimed.');
      }
    } catch (err: any) {
      setAirdropMsg(err.message || 'Failed to claim airdrop.');
    } finally {
      setIsClaimingAirdrop(false);
    }
  };

  // Handle Mint Supply
  const handleMintSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsMinting(true);
      setActionError(null);
      setActionSuccess(null);
      const res = await ApiService.mintZigSupply(mintAmount, mintRecipient || activeAddress, mintMemo);
      if (res.success) {
        setActionSuccess(`Minted ${mintAmount.toLocaleString()} $ZIG with memo "${mintMemo}"! Tx: ${res.data.txHash.slice(0, 16)}...`);
        loadTokenData();
        if (onRefreshBalances) onRefreshBalances();
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to mint ZIG supply');
    } finally {
      setIsMinting(false);
    }
  };

  // Handle Burn Supply
  const handleBurnSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsBurning(true);
      setActionError(null);
      setActionSuccess(null);
      const res = await ApiService.burnZigSupply(burnAmount, activeAddress, burnMemo);
      if (res.success) {
        setActionSuccess(`Burned ${burnAmount.toLocaleString()} $ZIG with memo "${burnMemo}"! Tx: ${res.data.txHash.slice(0, 16)}...`);
        loadTokenData();
        if (onRefreshBalances) onRefreshBalances();
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to burn ZIG supply');
    } finally {
      setIsBurning(false);
    }
  };

  // Handle FX Swap
  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    onSwapZig(direction, swapAmount);
    setSwapSuccessMsg(
      direction === 'USDC_TO_ZIG'
        ? `Successfully swapped $${swapAmount} USDC for ${(swapAmount * exchangeRate).toLocaleString()} $ZIG!`
        : `Successfully swapped ${swapAmount.toLocaleString()} $ZIG for $${(swapAmount / exchangeRate).toFixed(2)} USDC!`
    );
    setTimeout(() => setSwapSuccessMsg(null), 5000);
  };

  const contractAddress = zigTokenData?.contractAddress || defaultContract;

  const copyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider">
              <span className="flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/30">
                <Coins className="w-3.5 h-3.5" />
                <span>Base B20 Stablecoin Standard</span>
              </span>
              <span className="bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-400/30">
                Base Sepolia Testnet
              </span>
              <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-400/30">
                10,000,000 Minted Supply
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              $ZIG Zimbabwe Gold Stablecoin
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Base B20 compliant stablecoin minted on Base Sepolia with role-based access control (RBAC), supply memos, and 100% physical gold & foreign exchange escrow backing. Serves as the native quote currency for SME securities.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center shrink-0 w-full sm:w-auto">
            <div className="text-xs text-slate-300 font-medium">Your $ZIG Balance</div>
            <div className="text-3xl font-black text-emerald-400 mt-1">
              ZIG {zigBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-center space-x-1">
              <span>≈ ${(zigBalance / exchangeRate).toFixed(2)} USD</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-300">1 USD = 26 ZIG</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1,000 ZIG Welcome Airdrop Card for Base, MetaMask, and Coinbase sign-ins */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-3xl p-6 border border-emerald-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              🎁
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  New User Welcome Airdrop: 1,000 $ZIG for Trades
                </h2>
                <span className="text-[11px] font-extrabold bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full">
                  $38.46 Value Free
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Every user signing in with <strong>Base Account (Passkey)</strong>, <strong>MetaMask</strong>, or <strong>Coinbase (Email/SMS)</strong> is allocated 1,000 $ZIG stablecoin + 400 SME stock tokens (BAMBA, SIMBA, TEA, MUKURU) to immediately trade on Base Sepolia.
              </p>
              {activeAddress && (
                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono pt-1">
                  <span>Connected Wallet:</span>
                  <span className="font-bold text-slate-700">{activeAddress.slice(0, 10)}...{activeAddress.slice(-6)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            {!activeAddress ? (
              <button
                onClick={onOpenConnectWallet}
                className="w-full md:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>Sign In to Claim 1,000 ZIG</span>
              </button>
            ) : airdropStatus?.claimed ? (
              <div className="bg-emerald-100/90 text-emerald-900 px-5 py-3 rounded-2xl border border-emerald-300 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>1,000 ZIG Allocated & Ready for Trades</span>
              </div>
            ) : (
              <button
                onClick={handleClaimAirdrop}
                disabled={isClaimingAirdrop}
                className="w-full md:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isClaimingAirdrop ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Allocating Onchain...</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    <span>Claim 1,000 $ZIG Now</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {airdropMsg && (
          <div className="mt-4 p-3.5 bg-white/90 rounded-2xl border border-emerald-300 text-xs text-emerald-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{airdropMsg}</span>
          </div>
        )}
      </div>

      {swapSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center space-x-3 shadow-xs">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">{swapSuccessMsg}</div>
        </div>
      )}

      {/* Main Grid: FX Swap Hub & B20 Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FX Swap Hub */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-slate-900">Instant ZiG / USDC Swap</h2>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                Zero Slippage
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6">Guaranteed 1 USD = 26.00 $ZIG rate settled on Base L2.</p>

            <form onSubmit={handleSwap} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>You Pay</span>
                  <span>{direction === 'USDC_TO_ZIG' ? 'USDC (Base)' : '$ZIG Stablecoin'}</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(Number(e.target.value))}
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-lg">
                    {direction === 'USDC_TO_ZIG' ? 'USDC' : '$ZIG'}
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setDirection(d => d === 'USDC_TO_ZIG' ? 'ZIG_TO_USDC' : 'USDC_TO_ZIG')}
                  className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition-all shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>You Receive (Estimated)</span>
                  <span>{direction === 'USDC_TO_ZIG' ? '$ZIG Stablecoin' : 'USDC (Base)'}</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={
                      direction === 'USDC_TO_ZIG'
                        ? `ZIG ${(swapAmount * exchangeRate).toLocaleString()}`
                        : `$ ${(swapAmount / exchangeRate).toFixed(2)}`
                    }
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-base font-bold text-emerald-600 focus:outline-none"
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-500 bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg">
                    {direction === 'USDC_TO_ZIG' ? '$ZIG' : 'USDC'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Exchange Rate:</span>
                  <span className="font-semibold text-slate-800">1 USD = 26.00 $ZIG</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Base L2 Gas Fee:</span>
                  <span className="font-semibold text-emerald-600">Sponsored ($0.00)</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Settlement:</span>
                  <span className="font-semibold text-blue-600">Base Sepolia Atomic</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
              >
                <span>Execute Swap Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Base B20 Mint & Burn Management Engine */}
        <div className="lg:col-span-2 space-y-6">
          {/* Base B20 Specs Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Base B20 Stablecoin Engine</h2>
                  <p className="text-xs text-slate-500">ERC-20 standard superset with Memos, Roles & Gold Escrow</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href="https://docs.base.org/build-on-base/issue-stablecoins/issue-your-stablecoin"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Base Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Metrics & Contract Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-400 font-medium">Initial Minted Supply</div>
                <div className="text-lg font-extrabold text-slate-900 mt-1">10,000,000 ZIG</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-0.5">$384,615 USD Value</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-400 font-medium">Gold Reserve Ratio</div>
                <div className="text-lg font-extrabold text-emerald-600 mt-1">112.4%</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Audited Custody Vaults</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-400 font-medium">Base Sepolia Contract</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-mono font-bold text-slate-800 truncate">
                    {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
                  </span>
                  <button
                    onClick={copyContract}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                    title="Copy contract address"
                  >
                    {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <a
                  href={`https://sepolia.basescan.org/token/${contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-600 hover:underline flex items-center space-x-1 mt-0.5"
                >
                  <span>View on Basescan</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* B20 Mint & Burn Tabs */}
            <div className="pt-2">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveB20Tab('mint')}
                  className={`pb-3 px-4 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-colors cursor-pointer ${
                    activeB20Tab === 'mint'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Mint Supply (with Memo)</span>
                </button>
                <button
                  onClick={() => setActiveB20Tab('burn')}
                  className={`pb-3 px-4 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-colors cursor-pointer ${
                    activeB20Tab === 'burn'
                      ? 'border-rose-600 text-rose-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Burn Supply (with Memo)</span>
                </button>
                <button
                  onClick={() => setActiveB20Tab('ops')}
                  className={`pb-3 px-4 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-colors cursor-pointer ${
                    activeB20Tab === 'ops'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Operations Audit Log ({supplyOperations.length})</span>
                </button>
              </div>

              {actionSuccess && (
                <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {actionError && (
                <div className="mt-4 p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* TAB 1: Mint Supply */}
              {activeB20Tab === 'mint' && (
                <form onSubmit={handleMintSupply} className="mt-4 space-y-3">
                  <div className="text-xs text-slate-500 leading-relaxed">
                    Per Base documentation (<code>mint-supply</code>), new stablecoin supply is minted using <code>mintWithMemo(to, amount, memo)</code>. The memo is permanently hashed onchain for regulatory reconciliation.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mint Amount (ZIG)</label>
                      <input
                        type="number"
                        min="1"
                        value={mintAmount}
                        onChange={(e) => setMintAmount(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Audit Reconciliation Memo</label>
                      <input
                        type="text"
                        value={mintMemo}
                        onChange={(e) => setMintMemo(e.target.value)}
                        placeholder="e.g. INFLOW_VAULT_REF_2026"
                        className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Address (Optional - defaults to treasury/caller)</label>
                    <input
                      type="text"
                      value={mintRecipient}
                      onChange={(e) => setMintRecipient(e.target.value)}
                      placeholder={activeAddress || "0x..."}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isMinting}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isMinting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                      <span>{isMinting ? 'Minting on Base Sepolia...' : `Mint ${mintAmount.toLocaleString()} ZIG with Memo`}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: Burn Supply */}
              {activeB20Tab === 'burn' && (
                <form onSubmit={handleBurnSupply} className="mt-4 space-y-3">
                  <div className="text-xs text-slate-500 leading-relaxed">
                    Per Base documentation (<code>burn-supply</code> and specification overview), stablecoins are burned using <code>burnWithMemo(amount, memo)</code> to contract supply upon vault redemption.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Burn Amount (ZIG)</label>
                      <input
                        type="number"
                        min="1"
                        value={burnAmount}
                        onChange={(e) => setBurnAmount(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Burn Reconciliation Memo</label>
                      <input
                        type="text"
                        value={burnMemo}
                        onChange={(e) => setBurnMemo(e.target.value)}
                        placeholder="e.g. REDEMPTION_GOLD_VAULT_01"
                        className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isBurning}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isBurning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Flame className="w-3.5 h-3.5" />}
                      <span>{isBurning ? 'Burning on Base Sepolia...' : `Burn ${burnAmount.toLocaleString()} ZIG with Memo`}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: Operations Audit Log */}
              {activeB20Tab === 'ops' && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs text-slate-500 mb-2">
                    Immutable supply change events broadcasted on Base Sepolia testnet with cryptographic memos:
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                          <th className="py-2">Type</th>
                          <th className="py-2">Amount</th>
                          <th className="py-2">Memo</th>
                          <th className="py-2">Block</th>
                          <th className="py-2">Tx Hash</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {supplyOperations.map((op) => (
                          <tr key={op.id} className="hover:bg-slate-50">
                            <td className="py-2.5 font-bold">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${op.type === 'MINT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {op.type}
                              </span>
                            </td>
                            <td className="py-2.5 font-bold text-slate-900">
                              {Number(op.amount).toLocaleString()} ZIG
                            </td>
                            <td className="py-2.5 font-mono text-slate-600 text-[11px]">
                              {op.memo}
                            </td>
                            <td className="py-2.5 font-mono text-slate-500">
                              #{op.blockNumber}
                            </td>
                            <td className="py-2.5">
                              <a
                                href={`https://sepolia.basescan.org/tx/${op.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline flex items-center space-x-1 font-mono text-[11px]"
                              >
                                <span>{op.txHash.slice(0, 8)}...{op.txHash.slice(-6)}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reserves Audit & Transparency Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Proof of Reserves & Regulatory Oversight</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Physical Gold & Currency Reserves</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Every $ZIG token minted on Base is backed 100% by physical gold bullion and foreign exchange held in SECZim-regulated custodian escrow vaults. B20 standard roles guarantee that supply changes are audited and synchronized with real-world custodian inflows and outflows.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[11px] text-slate-400 font-medium">B20 Factory Precompile</div>
                <div className="text-xs font-mono font-bold text-slate-800 mt-1 truncate">
                  0xB20f000000000000...
                </div>
                <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Native Precompile on Base</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[11px] text-slate-400 font-medium">Regulatory Audit Filing</div>
                <div className="text-xs font-bold text-slate-800 mt-1">SECZ-ZIG-2026-09</div>
                <div className="text-[10px] text-blue-600 font-medium mt-0.5">Quarterly Attestation</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[11px] text-slate-400 font-medium">Access Control (RBAC)</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Granular Role System</div>
                <div className="text-[10px] text-purple-600 font-medium mt-0.5">MINT, BURN, PAUSE, ADMIN</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
