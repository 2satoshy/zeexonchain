import React, { useState } from 'react';
import { Menu, X, Smartphone, Sparkles, TrendingUp, PieChart, LayoutDashboard, Coins, Building2, ArrowRightLeft } from 'lucide-react';
import { TabType } from '../types';

interface FloatingMenuProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'bg-slate-900 text-white' },
    { id: 'trading', label: 'DEX Swap & Trading', icon: ArrowRightLeft, color: 'bg-indigo-600 text-white' },
    { id: 'startupListing', label: 'Startup Listing & RWA', icon: Building2, color: 'bg-blue-600 text-white' },
    { id: 'whatsapp', label: 'WhatsApp Pay', icon: Smartphone, color: 'bg-emerald-600 text-white' },
    { id: 'aiAdvisor', label: 'ZEEX AI Copilot', icon: Sparkles, color: 'bg-purple-600 text-white' },
    { id: 'social', label: 'Social Timeline', icon: TrendingUp, color: 'bg-blue-600 text-white' },
    { id: 'zig', label: '$ZIG Hub', icon: Coins, color: 'bg-teal-700 text-white' },
  ];


  return (
    <div className="fixed bottom-20 right-6 z-40 flex flex-col items-end space-y-3">
      {/* Expanded Vertical Menu */}
      {isOpen && (
        <div className="flex flex-col space-y-2.5 items-end animate-fade-in mb-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as TabType);
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl shadow-lg transition-transform hover:scale-105 font-medium text-xs ${item.color} ${isActive ? 'ring-2 ring-white' : ''}`}
              >
                <span>{item.label}</span>
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 relative group border-2 border-white"
        title="Quick Menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>
    </div>
  );
};
