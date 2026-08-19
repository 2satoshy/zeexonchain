import React, { useState } from 'react';
import { Coins, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ZigHubViewProps {
  zigBalance: number;
  onSwapZig: (fromCurrency: string, amount: number) => void;
}

export const ZigHubView: React.FC<ZigHubViewProps> = ({ zigBalance, onSwapZig }) => {
  const [swapAmount, setSwapAmount] = useState<number>(100);
  const [direction, setDirection] = useState<'USDC_TO_ZIG' | 'ZIG_TO_USDC'>('USDC_TO_ZIG');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const exchangeRate = 26.00; // 1 USD = 26.00 ZIG

  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    onSwapZig(direction, swapAmount);
    setSuccessMsg(
      direction === 'USDC_TO_ZIG'
        ? `Successfully swapped $${swapAmount} USDC for ${(swapAmount * exchangeRate).toLocaleString()} $ZIG!`
        : `Successfully swapped ${swapAmount.toLocaleString()} $ZIG for $${(swapAmount / exchangeRate).toFixed(2)} USDC!`
    );
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Coins className="w-4 h-4" />
              <span>$ZIG • Zimbabwe Gold-Referenced Stablecoin on Base</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">The Local FX & Quote Currency</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Fully reserved with precious metals and foreign exchange reserves in SECZim-regulated custody. Serves as the native quote pair for every tokenized SME asset.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/10 text-center">
            <div className="text-xs text-slate-300">Your $ZIG Balance</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">ZIG {zigBalance.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">~ ${(zigBalance / exchangeRate).toFixed(2)} USD</div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center space-x-3 shadow-xs">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">{successMsg}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FX Swap Hub */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Instant ZiG / USDC Swap</h2>
          <p className="text-xs text-slate-500 mb-6">Zero slippage corridor settled on Base L2.</p>

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
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition-all shadow-xs"
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
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <span>Execute Swap Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Reserves Audit & Transparency */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Proof of Reserves & Gold Backing</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Fully Reserved Treasury Transparency</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Every $ZIG token minted on Base is backed 100% by physical gold reserves and hard currency held in secure escrow vaults audited quarterly by SECZim-certified public accountants.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-400 font-medium">Total $ZIG Supply</div>
                <div className="text-lg font-bold text-slate-900 mt-1">ZIG 45,820,000</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-0.5">100% Fully Backed</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-400 font-medium">Gold Reserve Ratio</div>
                <div className="text-lg font-bold text-emerald-600 mt-1">112.4%</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Audited Vaults (Harare)</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-400 font-medium">Base L2 Contract</div>
                <div className="text-xs font-mono font-bold text-slate-700 mt-2 truncate">0x98f2...3a11</div>
                <div className="text-[11px] text-blue-600 mt-0.5">Verified on Basescan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
