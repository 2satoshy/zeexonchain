import React from 'react';
import { ShieldCheck, Smartphone, Plus, Send, Building2, Terminal } from 'lucide-react';
import { AuthButton, SignInModal, SignInModalTrigger, SignOutButton } from '@coinbase/cdp-react';
import { useCurrentUser, useEvmAddress } from '@coinbase/cdp-hooks';

interface HeaderProps {
  totalBalanceUSD: number;
  zigBalance: number;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onOpenDeposit?: () => void;
  onOpenSend?: () => void;
  onOpenTokenize?: () => void;
  onOpenApiExplorer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  totalBalanceUSD, 
  zigBalance, 
  activeTab, 
  setActiveTab,
  onOpenDeposit,
  onOpenSend,
  onOpenTokenize,
  onOpenApiExplorer
}) => {
  const { currentUser } = useCurrentUser();
  const { evmAddress } = useEvmAddress();

  const displayName =
    currentUser?.authenticationMethods?.email?.email ||
    currentUser?.authenticationMethods?.sms?.phoneNumber ||
    'Tendai Moyo';

  const displayInitials = currentUser?.authenticationMethods?.email?.email
    ? currentUser.authenticationMethods.email.email.slice(0, 2).toUpperCase()
    : 'TM';

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

          {/* User Profile & Coinbase Auth */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            {/* Coinbase CDP Auth Trigger */}
            <div className="cdp-header-auth shrink-0">
              <AuthButton
                className="inline-flex items-center"
                signInModal={({ open, setIsOpen, onSuccess }) => (
                  <SignInModal open={open} setIsOpen={setIsOpen} onSuccess={onSuccess}>
                    <SignInModalTrigger>
                      <button
                        type="button"
                        className="h-8 py-1 px-2.5 sm:px-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap shadow-xs inline-flex items-center justify-center cursor-pointer transition-colors"
                      >
                        Sign in
                      </button>
                    </SignInModalTrigger>
                  </SignInModal>
                )}
                signOutButton={({ onSuccess }) => (
                  <SignOutButton onSuccess={onSuccess} asChild>
                    <button
                      type="button"
                      className="h-8 py-1 px-2.5 sm:px-3 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap inline-flex items-center justify-center cursor-pointer transition-colors"
                    >
                      Sign out
                    </button>
                  </SignOutButton>
                )}
              />
            </div>

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
                  {evmAddress ? `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}` : 'Base L2 Linked'}
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


