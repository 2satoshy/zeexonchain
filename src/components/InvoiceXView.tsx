import React, { useState } from 'react';
import { InvoiceItem } from '../types';
import { FileText, ShieldCheck, ArrowRight, CheckCircle2, TrendingUp, Calendar, Building, X } from 'lucide-react';
import { PaginationBar } from './PaginationBar';
import { SwipeableContainer } from './SwipeableContainer';
import { BasePayButton } from '@base-org/account-ui/react';
import { executeBasePay, ZEEX_BASE_TREASURY } from '../services/baseAccount';

interface InvoiceXViewProps {
  invoices: InvoiceItem[];
  onFundInvoice: (invoiceId: string, amountUSD: number) => void;
}

export const InvoiceXView: React.FC<InvoiceXViewProps> = ({ invoices, onFundInvoice }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [fundAmount, setFundAmount] = useState<number>(500);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(invoices.length / itemsPerPage) || 1;
  const currentInvoices = invoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSwipeLeft = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handleSwipeRight = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleFundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    onFundInvoice(selectedInvoice.id, fundAmount);
    setSuccessMsg(`Successfully funded $${fundAmount.toLocaleString()} into invoice ${selectedInvoice.invoiceNumber} (${selectedInvoice.smeName}) at ${selectedInvoice.discountRate}% APY.`);
    setSelectedInvoice(null);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>InvoiceX Onchain • SME Working Capital Layer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Tokenized Invoice Discounting</h1>
          <p className="text-slate-500 text-sm mt-1">
            Turn unpaid SME invoices into short-duration, asset-backed, yield-bearing instruments funded by global stablecoin capital in minutes.
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 text-purple-900 px-4 py-3 rounded-2xl text-xs">
          <div className="font-bold">Average Yield: 13.8% APY</div>
          <div className="text-purple-700 text-[11px]">Backed by Tier-1 corporate buyers in SADC</div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center space-x-3 shadow-xs">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">{successMsg}</div>
        </div>
      )}

      {/* Swipeable Invoices Grid */}
      <SwipeableContainer
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showMobileSwipeIndicator={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {currentInvoices.map((inv) => (
            <div key={inv.id} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                    {inv.invoiceNumber}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    inv.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {inv.status}
                  </span>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-800">{inv.smeName}</span>
                  </div>
                  <div className="text-xs text-slate-500 pl-6">
                    Buyer: <span className="font-medium text-slate-700">{inv.buyerName}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Invoice Amount</div>
                    <div className="text-base font-bold text-slate-900">${inv.amountUSD.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Discount APY</div>
                    <div className="text-base font-bold text-purple-600">{inv.discountRate}%</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Funding Progress ({inv.fundedPercentage}%)</span>
                    <span>Due in {inv.tenorDays} days</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${inv.fundedPercentage}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedInvoice(inv);
                    setFundAmount(100);
                  }}
                  disabled={inv.status === 'Active'}
                  className={`w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                    inv.status === 'Active' 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                  }`}
                >
                  <span>{inv.status === 'Active' ? 'Fully Funded' : 'Fund Invoice (USDC/$ZIG)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SwipeableContainer>

      {/* Bottom Pagination Bar */}
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemName="invoices"
      />

      {/* Fund Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button onClick={() => setSelectedInvoice(null)} className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-lg mb-1">Fund Tokenized Invoice</h3>
            <p className="text-xs text-slate-500 mb-6">{selectedInvoice.invoiceNumber} • {selectedInvoice.smeName}</p>

            <form onSubmit={handleFundSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Funding Amount (USD / USDC)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="50"
                    max={selectedInvoice.amountUSD}
                    value={fundAmount}
                    onChange={(e) => setFundAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Annualized Yield (APY):</span>
                  <span className="font-bold text-purple-600">{selectedInvoice.discountRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Return ({selectedInvoice.tenorDays} days):</span>
                  <span className="font-bold text-emerald-600">+${((fundAmount * (selectedInvoice.discountRate / 100) * (selectedInvoice.tenorDays / 365))).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Corporate Buyer:</span>
                  <span className="font-bold text-slate-800">{selectedInvoice.buyerName}</span>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
                >
                  <span>Confirm with Portfolio Balance (${fundAmount.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">Or instant 1-tap</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div className="flex flex-col items-center">
                  <BasePayButton
                    colorScheme="light"
                    onClick={async () => {
                      if (!selectedInvoice) return;
                      try {
                        await executeBasePay({
                          amountUSD: fundAmount,
                          recipient: ZEEX_BASE_TREASURY,
                          testnet: true,
                          purpose: `ZEEX InvoiceX Funding: ${selectedInvoice.invoiceNumber}`
                        });
                        onFundInvoice(selectedInvoice.id, fundAmount);
                        setSuccessMsg(
                          `Instant Base Pay confirmed! Funded $${fundAmount.toLocaleString()} into invoice ${selectedInvoice.invoiceNumber} on Base L2!`
                        );
                        setSelectedInvoice(null);
                        setTimeout(() => setSuccessMsg(null), 5000);
                      } catch (err: any) {
                        console.error('Base Pay error in InvoiceX:', err);
                      }
                    }}
                  />
                  <span className="text-[10px] text-slate-400 mt-1">Direct settlement via Base Account SDK</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

