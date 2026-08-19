import React, { useState } from 'react';
import { TabType, SMEStock, InvoiceItem, DebtBridgeLoan, Transaction } from './types';
import { INITIAL_STOCKS, INITIAL_INVOICES, INITIAL_LOANS, INITIAL_TRANSACTIONS } from './data/mockData';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { SharesView } from './components/SharesView';
import { InvoiceXView } from './components/InvoiceXView';
import { DebtBridgeView } from './components/DebtBridgeView';
import { ZigHubView } from './components/ZigHubView';
import { WhatsAppWalletView } from './components/WhatsAppWalletView';
import { AiAdvisorView } from './components/AiAdvisorView';
import { SocialTimelineView } from './components/SocialTimelineView';
import { FloatingMenu } from './components/FloatingMenu';
import { BottomNav } from './components/BottomNav';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stocks, setStocks] = useState<SMEStock[]>(INITIAL_STOCKS);
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [loans, setLoans] = useState<DebtBridgeLoan[]>(INITIAL_LOANS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  
  const [totalBalanceUSD, setTotalBalanceUSD] = useState<number>(4260.50);
  const [zigBalance, setZigBalance] = useState<number>(36933.00);

  const handleBuyShares = (stock: SMEStock, usdAmount: number, units: number) => {
    setTotalBalanceUSD(prev => prev - usdAmount);
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'BUY',
      title: `Bought ${units.toLocaleString()} units of ${stock.ticker}`,
      amountUSD: usdAmount,
      amountZIG: usdAmount * 26,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `BASE-TX-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleFundInvoice = (invoiceId: string, amountUSD: number) => {
    setTotalBalanceUSD(prev => prev - amountUSD);
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const newFunded = Math.min(100, inv.fundedPercentage + Math.round((amountUSD / inv.amountUSD) * 100));
        return {
          ...inv,
          fundedPercentage: newFunded,
          status: newFunded >= 100 ? 'Active' : inv.status
        };
      }
      return inv;
    }));
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'INVOICE_YIELD',
      title: `Funded InvoiceX Receivable ($${amountUSD})`,
      amountUSD: amountUSD,
      amountZIG: amountUSD * 26,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `INVX-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleRequestLoan = (collateral: string, amount: number) => {
    setTotalBalanceUSD(prev => prev + amount);
    const newLoan: DebtBridgeLoan = {
      id: `loan-${Date.now()}`,
      borrowerName: 'Tendai Moyo (Personal SBLOC)',
      collateralType: collateral,
      collateralValueUSD: amount * 1.6,
      loanAmountUSD: amount,
      interestRate: 12.5,
      durationMonths: 6,
      status: 'Active',
      ltvRatio: 62.5
    };
    setLoans(prev => [newLoan, ...prev]);
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'DEPOSIT',
      title: `DebtBridge SBLOC Credit Line Issued`,
      amountUSD: amount,
      amountZIG: amount * 26,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `DEBT-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleSwapZig = (direction: 'USDC_TO_ZIG' | 'ZIG_TO_USDC', amount: number) => {
    if (direction === 'USDC_TO_ZIG') {
      setTotalBalanceUSD(prev => prev - amount);
      setZigBalance(prev => prev + (amount * 26));
    } else {
      setZigBalance(prev => prev - amount);
      setTotalBalanceUSD(prev => prev + (amount / 26));
    }
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'TRANSFER',
      title: direction === 'USDC_TO_ZIG' ? `Swapped $${amount} USDC for $ZIG` : `Swapped ${amount} $ZIG for USDC`,
      amountUSD: direction === 'USDC_TO_ZIG' ? amount : amount / 26,
      amountZIG: direction === 'USDC_TO_ZIG' ? amount * 26 : amount,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `ZIG-SWAP-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'deposit') {
      const dep = 500;
      setTotalBalanceUSD(prev => prev + dep);
      setTransactions(prev => [{
        id: `tx-${Date.now()}`,
        type: 'DEPOSIT',
        title: 'EcoCash / USDC Onramp via Base',
        amountUSD: dep,
        amountZIG: dep * 26,
        timestamp: 'Just now',
        status: 'Completed',
        reference: `BASE-DEP-${Math.floor(100000 + Math.random() * 900000)}`
      }, ...prev]);
    }
  };

  const handleAddTransactions = (newTxs: Transaction[]) => {
    setTransactions(prev => [...newTxs, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 selection:bg-emerald-500 selection:text-white pb-24">
      <Header 
        totalBalanceUSD={totalBalanceUSD} 
        zigBalance={zigBalance} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="hidden md:block">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <main className="transition-all animate-fade-in">
        {activeTab === 'dashboard' && (
          <DashboardView 
            stocks={stocks} 
            transactions={transactions} 
            setActiveTab={setActiveTab} 
            onQuickAction={handleQuickAction}
            onAddTransactions={handleAddTransactions}
          />
        )}
        {activeTab === 'shares' && (
          <SharesView 
            stocks={stocks} 
            onBuyShares={handleBuyShares} 
          />
        )}
        {activeTab === 'invoiceX' && (
          <InvoiceXView 
            invoices={invoices} 
            onFundInvoice={handleFundInvoice} 
          />
        )}
        {activeTab === 'debtBridge' && (
          <DebtBridgeView 
            loans={loans} 
            onRequestLoan={handleRequestLoan} 
          />
        )}
        {activeTab === 'zig' && (
          <ZigHubView 
            zigBalance={zigBalance} 
            onSwapZig={handleSwapZig} 
          />
        )}
        {activeTab === 'whatsapp' && (
          <WhatsAppWalletView />
        )}
        {activeTab === 'aiAdvisor' && (
          <AiAdvisorView 
            portfolioContext={{ totalBalanceUSD, zigBalance, stocksCount: stocks.length }} 
          />
        )}
        {activeTab === 'social' && (
          <SocialTimelineView 
            onCopyTrade={(ticker, amount) => {
              setActiveTab('shares');
            }}
          />
        )}
      </main>

      {/* Floating Vertical Menu & Bottom Nav */}
      <FloatingMenu activeTab={activeTab} setActiveTab={setActiveTab} />
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 pb-16 border-t border-slate-200 text-center text-xs text-slate-500 hidden md:block">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-bold text-slate-800">ZEEX Onchain</span> — Zimbabwe Entrepreneurship Exchange (ZEEX). Licensed by SECZim inside ZSE Holdings.
          </div>
          <div className="flex space-x-4 text-slate-500">
            <span>Base Mainnet L2</span>
            <span>•</span>
            <span>ZSE Debtbridge Custody</span>
            <span>•</span>
            <span>ERC-3643 Permissioned Rails</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
