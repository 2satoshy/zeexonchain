import React from 'react';
import { ShieldCheck, Smartphone, Plus, Send, Building2, Terminal, Database, Wallet, LogOut, ArrowRightLeft } from 'lucide-react';
import { AuthButton, SignInModal, SignInModalTrigger, SignOutButton } from '@coinbase/cdp-react';
import { useCurrentUser, useEvmAddress, useSignOut } from '@coinbase/cdp-hooks';
import { useAccount, useDisconnect } from 'wagmi';
import { useCurrency } from '../context/CurrencyContext';

interface HeaderProps {
  totalBalanceUSD: number;
  zigBalance: number;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onOpenDeposit?: () => void;
  onOpenSend?: () => void;
  onOpenTokenize?: () => void;
  onOpenApiExplorer?: () => void;
  onOpenConnectWallet?: (tab?: 'base' | 'metamask' | 'coinbase') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  totalBalanceUSD, 
  zigBalance, 
  activeTab, 
  setActiveTab,
  onOpenDeposit,
  onOpenSend,
  onOpenTokenize,
  onOpenApiExplorer,
  onOpenConnectWallet
}) => {
  const { currentUser } = useCurrentUser();
  const { evmAddress: cdpAddress } = useEvmAddress();
  const { signOut: signOutCdp } = useSignOut();

  const { address: wagmiAddress, isConnected: isWagmiConnected, connector } = useAccount();
  const { disconnect: disconnectWagmi } = useDisconnect();
  const { currencyMode, setCurrencyMode, toggleCurrency, oracleRate } = useCurrency();

  const isConnected = Boolean(isWagmiConnected || cdpAddress || currentUser?.evmAccountObjects?.length);
  const activeAddress = wagmiAddress || cdpAddress || currentUser?.evmAccountObjects?.[0]?.address;

  // Determine wallet provider and icon
  const walletProvider = (() => {
    if (isWagmiConnected && connector) {
      const id = connector.id?.toLowerCase() || '';
      const name = connector.name?.toLowerCase() || '';
      if (id.includes('base') || name.includes('base')) {
        return { name: 'Base Account', icon: '🔵', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' };
      }
      if (id.includes('metamask') || name.includes('metamask')) {
        return { name: 'MetaMask', icon: '🦊', badgeClass: 'bg-amber-50 text-amber-900 border-amber-200' };
      }
      if (id.includes('coinbase') || name.includes('coinbase')) {
        return { name: 'Coinbase Wallet', icon: '🔷', badgeClass: 'bg-slate-100 text-slate-900 border-slate-200' };
      }
      return { name: connector.name || 'Web3 Injected', icon: '⚡', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
    }
    if (cdpAddress || currentUser) {
      if (currentUser?.authenticationMethods?.email?.email) {
        return { name: 'Coinbase (Email)', icon: '🔷', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' };
      }
      if (currentUser?.authenticationMethods?.sms?.phoneNumber) {
        return { name: 'Coinbase (SMS)', icon: '🔷', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      }
      return { name: 'Coinbase CDP', icon: '🔷', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' };
    }
    return null;
  })();

  const displayName =
    currentUser?.authenticationMethods?.email?.email ||
    currentUser?.authenticationMethods?.sms?.phoneNumber ||
    (activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : 'Tendai Moyo');

  const displayInitials = currentUser?.authenticationMethods?.email?.email
    ? currentUser.authenticationMethods.email.email.slice(0, 2).toUpperCase()
    : 'ZE';

  const handleDisconnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWagmiConnected) {
      disconnectWagmi();
    }
    if (cdpAddress || currentUser) {
      try {
        await signOutCdp();
      } catch {
        // ignore signout errors
      }
    }
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2 shrink-0">
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 cursor-pointer"
            >
              Z
            </div>
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-1.5 cursor-pointer"
            >
              <span className="font-bold text-slate-900 text-sm tracking-tight whitespace-nowrap">ZEEX Onchain</span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                SECZim Licensed
              </span>
            </div>
          </div>

          {/* Global Valuation Currency Switcher Toggle */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            <div 
              className="inline-flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200 shadow-2xs"
              role="group"
              aria-label="Global Valuation Currency Toggle"
            >
              <button
                type="button"
                onClick={() => setCurrencyMode('USD')}
                className={`px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none flex items-center space-x-0.5 sm:space-x-1 ${
                  currencyMode === 'USD'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Display all valuations in US Dollars ($ USD)"
              >
                <span>USD</span>
                <span className="text-[10px] text-slate-300 hidden sm:inline">$</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrencyMode('ZIG')}
                className={`px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none flex items-center space-x-0.5 sm:space-x-1 ${
                  currencyMode === 'ZIG'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Display all valuations in Zimbabwe Gold (ZIG @ 26.00 oracle rate)"
              >
                <span>ZIG</span>
                <span className="text-[9px] font-mono text-emerald-200 hidden xl:inline">@26</span>
              </button>
            </div>

            {/* Live Oracle Rate Indicator */}
            <button
              type="button"
              onClick={toggleCurrency}
              className="hidden xl:flex items-center space-x-1 text-[10px] font-semibold text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50/60 px-2 py-1 rounded-full border border-slate-200/80 cursor-pointer transition-colors"
              title="Click to toggle valuation currency (Live Oracle Rate: 1 USD = 26.00 ZIG)"
            >
              <ArrowRightLeft className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>1 USD = {oracleRate.toFixed(2)} ZIG</span>
            </button>
          </div>

          {/* Quick Balance & Status Pill */}
          <div className="hidden lg:flex items-center space-x-3 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 text-[11px]">
            <div className="flex items-center space-x-1 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium">Base Sepolia L2</span>
            </div>
            <div className="h-2.5 w-[1px] bg-slate-300"></div>
            <div className="flex items-center space-x-1 text-slate-600">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>CDP Non-Custodial</span>
            </div>
            <div className="h-2.5 w-[1px] bg-slate-300"></div>
            <button
              onClick={onOpenApiExplorer}
              title="Click to view live MongoDB and API status"
              className="flex items-center space-x-1 text-slate-600 hover:text-emerald-700 cursor-pointer transition-colors"
            >
              <Database className="w-3 h-3 text-emerald-600" />
              <span className="font-medium">MongoDB</span>
            </button>
          </div>

          {/* Quick Action Buttons (Deposit, Send, Tokenize, API) */}
          <div className="hidden md:flex items-center space-x-2">
            {onOpenDeposit && (
              <button
                onClick={onOpenDeposit}
                className="h-8 px-3 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Deposit</span>
              </button>
            )}
            {onOpenSend && (
              <button
                onClick={onOpenSend}
                className="h-8 px-3 text-xs font-bold rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            )}
            {onOpenTokenize && (
              <button
                onClick={onOpenTokenize}
                className="h-8 px-3 text-xs font-bold rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Tokenize</span>
              </button>
            )}
            {onOpenApiExplorer && (
              <button
                onClick={onOpenApiExplorer}
                className="h-8 px-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors"
                title="Open Live REST API Explorer & Endpoints Console"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                <span>API</span>
              </button>
            )}
          </div>

          {/* User Profile & Multi-Wallet Auth */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            {isConnected ? (
              <div className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
                <button
                  onClick={() => onOpenConnectWallet ? onOpenConnectWallet() : setActiveTab('profile')}
                  className="flex items-center space-x-1.5 px-2 py-0.5 rounded-lg hover:bg-white transition-all text-left cursor-pointer"
                  title="View Connected Wallet Details"
                >
                  <span className="text-xs">{walletProvider?.icon || '🔷'}</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-800 leading-tight">
                      {walletProvider?.name || 'Connected'}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-600 leading-tight">
                      {activeAddress ? `${activeAddress.slice(0, 5)}...${activeAddress.slice(-4)}` : 'Base L2'}
                    </span>
                  </div>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                {/* Unified Connect Modal Trigger */}
                <button
                  onClick={() => onOpenConnectWallet ? onOpenConnectWallet('base') : setActiveTab('profile')}
                  className="h-8 py-1 px-2.5 sm:px-3 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white whitespace-nowrap shadow-xs inline-flex items-center space-x-1.5 cursor-pointer transition-all"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                {/* Direct Coinbase AuthButton */}
                <div className="cdp-header-auth shrink-0 hidden sm:block">
                  <AuthButton
                    className="inline-flex items-center"
                    signInModal={({ open, setIsOpen, onSuccess }) => (
                      <SignInModal open={open} setIsOpen={setIsOpen} onSuccess={onSuccess}>
                        <SignInModalTrigger>
                          <button
                            type="button"
                            className="h-8 py-1 px-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap inline-flex items-center space-x-1 cursor-pointer transition-colors"
                            title="Sign in with Coinbase (Email/SMS)"
                          >
                            <span>🔷</span>
                            <span className="hidden md:inline text-[11px]">Coinbase</span>
                          </button>
                        </SignInModalTrigger>
                      </SignInModal>
                    )}
                    signOutButton={({ onSuccess }) => (
                      <SignOutButton onSuccess={onSuccess} asChild>
                        <button
                          type="button"
                          className="h-8 py-1 px-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap inline-flex items-center cursor-pointer transition-colors"
                        >
                          Sign out
                        </button>
                      </SignOutButton>
                    )}
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center space-x-1.5 sm:space-x-2 group text-left p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
              title="Open User Profile & Settings"
            >
              <div className="text-right hidden md:block">
                <div className="text-[11px] font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-[120px]">
                  {displayName}
                </div>
                <div className="text-[9px] text-emerald-600 font-medium font-mono">
                  {activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : 'Base L2 Linked'}
                </div>
              </div>
              
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-semibold text-xs shadow-xs group-hover:ring-2 group-hover:ring-blue-500 transition-all shrink-0">
                {displayInitials}
              </div>
            </button>
            
            <button 
              onClick={() => setActiveTab('whatsapp')}
              className="relative p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              title="WhatsApp Wallet Connected"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};


