import React, { useState } from 'react';
import { DebtBridgeLoan } from '../types';
import { Landmark, ShieldCheck, ArrowRight, CheckCircle2, Lock, Plus, X } from 'lucide-react';

interface DebtBridgeViewProps {
  loans: DebtBridgeLoan[];
  onRequestLoan: (collateral: string, amount: number) => void;
}

export const DebtBridgeView: React.FC<DebtBridgeViewProps> = ({ loans, onRequestLoan }) => {
  const [showModal, setShowModal] = useState(false);
  const [collateralAsset, setCollateralAsset] = useState('TKRA.zx (Takura Agro)');
  const [requestedAmount, setRequestedAmount] = useState(15000);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestLoan(collateralAsset, requestedAmount);
    setSuccessMsg(`Successfully locked collateral and issued SBLOC credit line of $${requestedAmount.toLocaleString()} via smart contract escrow.`);
    setShowModal(false);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Landmark className="w-4 h-4" />
            <span>DebtBridge • Onchain Bilateral Credit & SBLOC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Securities-Backed Lines of Credit</h1>
          <p className="text-slate-500 text-sm mt-1">
            Unlock instant liquidity against your tokenized ZEEX/ZSE portfolios via smart-contract escrow mirroring ZSE Debtbridge Capital.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-3 rounded-2xl shadow-sm transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Request SBLOC Credit</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center space-x-3 shadow-xs">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">{successMsg}</div>
        </div>
      )}

      {/* Loans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loans.map((loan) => (
          <div key={loan.id} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  SBLOC Credit Facility
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-2">{loan.borrowerName}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {loan.status}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Collateral Locked:</span>
                <span className="font-bold text-slate-800">{loan.collateralType}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Collateral Valuation:</span>
                <span className="font-bold text-slate-900">${loan.collateralValueUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Loan-to-Value (LTV):</span>
                <span className="font-bold text-blue-600">{loan.ltvRatio}% (Safe)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <div className="text-[10px] text-slate-400 font-medium">Credit Amount</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">${loan.loanAmountUSD.toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <div className="text-[10px] text-slate-400 font-medium">Interest Rate</div>
                <div className="text-sm font-bold text-amber-600 mt-0.5">{loan.interestRate}% APY</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <div className="text-[10px] text-slate-400 font-medium">Tenor</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">{loan.durationMonths} Mos</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Request SBLOC Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-lg mb-1">Request SBLOC Credit Line</h3>
            <p className="text-xs text-slate-500 mb-6">Lock tokenized ZEEX/ZSE shares as smart contract collateral instantly.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Collateral Asset</label>
                <select
                  value={collateralAsset}
                  onChange={(e) => setCollateralAsset(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                >
                  <option value="TKRA.zx (Takura Agro)">Takura Agro (TKRA.zx) - Value: $45,000</option>
                  <option value="NYNG.zx (Nyanga Solar)">Nyanga Solar (NYNG.zx) - Value: $38,500</option>
                  <option value="ZMBI.zx (Zambezi Fresh)">Zambezi Fresh (ZMBI.zx) - Value: $62,000</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Requested Credit (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1000"
                    max="50000"
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Interest Rate:</span>
                  <span className="font-bold text-amber-600">12.5% APY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Max LTV Ratio:</span>
                  <span className="font-bold text-slate-800">65% (Current: {((requestedAmount / 50000) * 100).toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Escrow Contract:</span>
                  <span className="font-bold text-emerald-600">ZSE Debtbridge Trust Escrow</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
              >
                <span>Approve & Escrow Collateral</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
