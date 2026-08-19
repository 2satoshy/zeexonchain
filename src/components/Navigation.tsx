import React from 'react';
import { LayoutDashboard, PieChart, FileText, Landmark, Coins, Smartphone, Sparkles } from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'shares', label: 'ZEEX Shares', icon: PieChart },
    { id: 'invoiceX', label: 'InvoiceX', icon: FileText },
    { id: 'debtBridge', label: 'DebtBridge', icon: Landmark },
    { id: 'zig', label: '$ZIG Hub', icon: Coins },
    { id: 'whatsapp', label: 'WhatsApp Pay', icon: Smartphone },
    { id: 'aiAdvisor', label: 'ZEEX AI Copilot', icon: Sparkles },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-4 py-2.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.id === 'whatsapp' && (
                  <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] rounded-full font-bold">
                    Live
                  </span>
                )}
                {tab.id === 'aiAdvisor' && (
                  <span className="ml-1 px-1.5 py-0.2 bg-purple-500 text-white text-[10px] rounded-full font-bold">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
