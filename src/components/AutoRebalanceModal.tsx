import React, { useState } from 'react';
import { SMEStock, Transaction } from '../types';
import { Sparkles, X, CheckCircle2, TrendingUp, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface AutoRebalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: SMEStock[];
  onExecuteRebalance: (executedTxs: Transaction[]) => void;
}

export const AutoRebalanceModal: React.FC<AutoRebalanceModalProps> = ({ isOpen, onClose, stocks, onExecuteRebalance }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const recommendations = [
    { ticker: 'ECO', name: 'Econet Wireless', currentWeight: 20, targetWeight: 30, action: 'BUY', amount: 284.00 },
    { ticker: 'DLTA', name: 'Delta Corporation', currentWeight: 30, targetWeight: 25, action: 'HOLD', amount: 0.00 },
    { ticker: 'TKRA', name: 'Takura Agro-Tech', currentWeight: 15, targetWeight: 25, action: 'BUY', amount: 284.00 },
    { ticker: 'NYNG', name: 'Nyanga Solar', currentWeight: 35, targetWeight: 20, action: 'REBALANCE', amount: -426.00 },
  ];

  const handleExecute = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      const newTxs: Transaction[] = [
        {
          id: `tx-reb-${Date.now()}-1`,
          type: 'BUY',
          title: 'AI Rebalance: Bought $284.00 ECO.zx',
          amountUSD: 284.00,
          amountZIG: 7384.00,
          timestamp: 'Just now',
          status: 'Completed',
          reference: 'BASE-REB-01'
        },
        {
          id: `tx-reb-${Date.now()}-2`,
          type: 'BUY',
          title: 'AI Rebalance: Bought $284.00 TKRA.zx',
          amountUSD: 284.00,
          amountZIG: 7384.00,
          timestamp: 'Just now',
          status: 'Completed',
          reference: 'BASE-REB-02'
        }
      ];
      onExecuteRebalance(newTxs);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden space-y-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">AI Portfolio Auto-Rebalance</h2>
              <p className="text-xs text-slate-500">Optimizing weightings for maximum dividend yield on Base L2</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Rebalance Executed Successfully!</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your ZEEX SME equity portfolio has been rebalanced on Base L2 with zero slippage via smart escrow.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>AI Recommendation Summary</span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">+2.4% APY Boost</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini AI analysis detected over-concentration in Nyanga Solar. Rebalancing redistributes capital into Econet and Takura Agro-Tech to achieve optimal sectoral diversification and higher quarterly dividend payout velocity.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Weight Adjustments</div>
              <div className="space-y-2">
                {recommendations.map((rec) => (
                  <div key={rec.ticker} className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center space-x-2">
                        <span>{rec.name}</span>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">{rec.ticker}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {rec.currentWeight}% <ArrowRight className="w-3 h-3 inline mx-1" /> <span className="font-bold text-slate-900">{rec.targetWeight}%</span>
                      </div>
                    </div>

                    <div>
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                        rec.action === 'BUY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        rec.action === 'REBALANCE' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {rec.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecute}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md transition-all flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin" />
                    <span>Executing on Base L2...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Execute Rebalance Trades</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
