import React, { useState } from 'react';
import { 
  AuthButton, 
  CopyAddress, 
  SendEvmTransactionButton, 
  ExportWalletModal,
  SignInModal,
  SignInModalTrigger,
  SignOutButton
} from '@coinbase/cdp-react';
import { useCurrentUser, useEvmAddress } from '@coinbase/cdp-hooks';
import { 
  ShieldCheck, 
  Wallet, 
  ArrowUpRight, 
  Key, 
  Smartphone, 
  Sparkles, 
  ExternalLink,
  CheckCircle2,
  Lock,
  Layers,
  Coins
} from 'lucide-react';

interface CoinbaseWalletSectionProps {
  zigBalance: number;
  totalBalanceUSD: number;
}

export const CoinbaseWalletSection: React.FC<CoinbaseWalletSectionProps> = ({ zigBalance, totalBalanceUSD }) => {
  const { currentUser } = useCurrentUser();
  const { evmAddress } = useEvmAddress();
  const [txSuccessHash, setTxSuccessHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Derive active accounts & methods
  const primaryEvm = evmAddress || currentUser?.evmAccountObjects?.[0]?.address || '0x71C...38A9';
  const solanaAcc = currentUser?.solanaAccountObjects?.[0]?.address;
  const userEmail = currentUser?.authenticationMethods?.email?.email;
  const userPhone = currentUser?.authenticationMethods?.sms?.phoneNumber;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-6">
      {/* Header with Coinbase badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-base">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Coinbase Non-Custodial Wallet</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                CDP Embedded
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant self-custodial wallet via Email, SMS, or Social Login. No seed phrase required.
            </p>
          </div>
        </div>

        {/* Coinbase Embedded Auth Button */}
        <div className="shrink-0 w-full sm:w-auto">
          <AuthButton
            className="w-full sm:w-auto"
            signInModal={({ open, setIsOpen, onSuccess }) => (
              <SignInModal open={open} setIsOpen={setIsOpen} onSuccess={onSuccess}>
                <SignInModalTrigger>
                  <button
                    type="button"
                    className="h-9 py-1.5 px-4 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap shadow-xs w-full sm:w-auto inline-flex items-center justify-center cursor-pointer transition-colors"
                  >
                    Sign in to Coinbase Wallet
                  </button>
                </SignInModalTrigger>
              </SignInModal>
            )}
            signOutButton={({ onSuccess }) => (
              <SignOutButton onSuccess={onSuccess} asChild>
                <button
                  type="button"
                  className="h-9 py-1.5 px-4 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap w-full sm:w-auto inline-flex items-center justify-center cursor-pointer transition-colors"
                >
                  Sign out
                </button>
              </SignOutButton>
            )}
          />
        </div>
      </div>

      {/* Main Wallet Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Card: Active Non-Custodial EVM Wallet */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="text-[11px] font-medium text-slate-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Base L2 Primary EVM Account</span>
              </div>
              <div className="text-lg font-extrabold text-white mt-1">
                ${totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-emerald-400 font-medium">
                {zigBalance.toLocaleString()} $ZIG (Zimbabwe Gold)
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Non-Custodial</span>
            </span>
          </div>

          {/* Address Display & Copy */}
          <div className="pt-2 border-t border-slate-700/80 space-y-1 relative z-10">
            <div className="text-[11px] text-slate-400 font-medium">EVM Wallet Address</div>
            <div className="bg-slate-800/90 rounded-xl p-2.5 border border-slate-700">
              {evmAddress ? (
                <CopyAddress address={evmAddress} label="Base Address" />
              ) : (
                <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                  <span className="truncate mr-2">{primaryEvm}</span>
                  <span className="text-[10px] text-blue-400 font-sans font-semibold">Base L2</span>
                </div>
              )}
            </div>
          </div>

          {/* Connected Identity */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300 relative z-10">
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <div className="text-slate-400 text-[10px]">Auth Method</div>
              <div className="font-semibold text-white truncate mt-0.5">
                {userEmail || userPhone || 'Email / SMS / Passkey'}
              </div>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <div className="text-slate-400 text-[10px]">Security Model</div>
              <div className="font-semibold text-emerald-300 truncate mt-0.5">MPC Multi-Party</div>
            </div>
          </div>
        </div>

        {/* Right Card: Quick Actions & Solana Account & Key Management */}
        <div className="space-y-4">
          {/* Solana Multi-chain Support Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-slate-800">Multi-Chain Solana Provisioning</span>
              </div>
              <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                Auto-Created
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Your Coinbase CDP wallet automatically provisions both EVM (Base) and Solana accounts upon login.
            </p>
            {solanaAcc ? (
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <CopyAddress address={solanaAcc} label="Solana Address" />
              </div>
            ) : (
              <div className="bg-white p-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 truncate">
                Solana Account: Provisioned on login
              </div>
            )}
          </div>

          {/* Non-Custodial Key Export & Self-Sovereignty */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-800">Key Self-Sovereignty</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">100% User-Owned</span>
            </div>
            <p className="text-xs text-slate-500">
              You own your keys. You can securely export your private key at any time using Coinbase's secure sandbox iframe.
            </p>

            {evmAddress ? (
              <div>
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold px-4 py-2.5 rounded-xl border border-slate-200 text-xs transition-colors shadow-2xs flex items-center justify-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Export Private Key Securely</span>
                </button>
                <ExportWalletModal
                  address={evmAddress}
                  open={isExportOpen}
                  setIsOpen={setIsExportOpen}
                />
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic">
                Sign in above with Email or Social Login to access key export.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Onchain Test Transaction via Base / CDP Paymaster */}
      {evmAddress && (
        <div className="p-4 sm:p-5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Execute Gasless Base L2 Transaction
              </span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Gas Sponsored by Paymaster
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Test a zero-gas micropayment or smart-contract interaction on Base Sepolia using Coinbase Paymaster integration.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-block">
              <SendEvmTransactionButton
                account={evmAddress}
                network="base-sepolia"
                transaction={{
                  to: "0x0000000000000000000000000000000000000000",
                  value: 0n,
                  chainId: 84532,
                  type: "eip1559"
                }}
                onSuccess={(hash: string) => {
                  setTxSuccessHash(hash);
                  setTxError(null);
                }}
                onError={(err: any) => {
                  setTxError(err.message || 'Transaction error');
                }}
                pendingLabel="Sending on Base Sepolia..."
              />
            </div>

            {txSuccessHash && (
              <a
                href={`https://sepolia.basescan.org/tx/${txSuccessHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tx Confirmed: {txSuccessHash.slice(0, 10)}...</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {txError && (
              <span className="text-xs text-rose-600 font-medium truncate max-w-xs">
                {txError}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
