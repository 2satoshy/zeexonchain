import React from 'react';
import { ShieldCheck, Smartphone } from 'lucide-react';

interface HeaderProps {
  totalBalanceUSD: number;
  zigBalance: number;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ totalBalanceUSD, zigBalance, activeTab, setActiveTab }) => {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              Z
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-900 text-sm tracking-tight">ZEEX Onchain</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SECZim Licensed
                </span>
              </div>
            </div>
          </div>

          {/* Quick Balance & Status Pill */}
          <div className="hidden md:flex items-center space-x-3 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 text-[11px]">
            <div className="flex items-center space-x-1 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium">Base Mainnet</span>
            </div>
            <div className="h-2.5 w-[1px] bg-slate-300"></div>
            <div className="flex items-center space-x-1 text-slate-600">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>ZSE Custody</span>
            </div>
          </div>

          {/* User Profile & Wallet */}
          <div className="flex items-center space-x-2.5">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] font-semibold text-slate-800">Tendai Moyo</div>
              <div className="text-[9px] text-emerald-600 font-medium">WhatsApp +263 77...491</div>
            </div>
            
            <button 
              onClick={() => setActiveTab('whatsapp')}
              className="relative p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              title="WhatsApp Wallet Connected"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            </button>

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
              TM
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
