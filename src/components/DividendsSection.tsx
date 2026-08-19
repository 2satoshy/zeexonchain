import React, { useState } from 'react';
import { SMEStock, Transaction } from '../types';
import { DollarSign, TrendingUp, Calendar as CalendarIcon, ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles, Award, ChevronLeft, ChevronRight, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DividendsSectionProps {
  transactions: Transaction[];
  stocks: SMEStock[];
}

export const DividendsSection: React.FC<DividendsSectionProps> = ({ transactions, stocks }) => {
  const [claimedNotice, setClaimedNotice] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [taxResidentType, setTaxResidentType] = useState<'resident' | 'non-resident'>('resident');

  // Filter dividend transactions
  const dividendTxs = transactions.filter(tx => tx.type === 'DIVIDEND' || tx.type === 'INVOICE_YIELD');
  
  // Calculate cumulative dividends received
  const cumulativeDividendsUSD = dividendTxs.reduce((sum, tx) => sum + tx.amountUSD, 342.50); // baseline cumulative + txs
  const cumulativeDividendsZIG = dividendTxs.reduce((sum, tx) => sum + (tx.amountZIG || 0), 8905.00);

  // Projected monthly income calculation based on stocks and user holdings
  const totalSmeInvestmentUSD = 2840.00;
  const projectedMonthlyUSD = 34.20;
  const projectedAnnualUSD = projectedMonthlyUSD * 12;
  const portfolioYieldPercentage = 14.5; // % APY

  // Withholding Tax calculations (ZIMRA regulations: 10% for residents on listed ZSE/SME equities, 15% for non-residents)
  const taxRate = taxResidentType === 'resident' ? 0.10 : 0.15;
  const withholdingTaxAnnual = projectedAnnualUSD * taxRate;
  const netAnnualUSD = projectedAnnualUSD - withholdingTaxAnnual;
  const netMonthlyUSD = netAnnualUSD / 12;

  const monthlyDividendData = [
    { month: 'Sep 25', amount: 18.50 },
    { month: 'Oct 25', amount: 22.00 },
    { month: 'Nov 25', amount: 20.40 },
    { month: 'Dec 25', amount: 35.80 },
    { month: 'Jan 26', amount: 24.20 },
    { month: 'Feb 26', amount: 28.50 },
    { month: 'Mar 26', amount: 31.00 },
    { month: 'Apr 26', amount: 29.40 },
    { month: 'May 26', amount: 32.60 },
    { month: 'Jun 26', amount: 30.00 },
    { month: 'Jul 26', amount: 36.50 },
    { month: 'Aug 26', amount: 34.20 },
  ];

  // Dividend events map for September 2026 calendar days
  const dividendEventsMap: Record<number, { title: string; type: 'ex-date' | 'payout'; amount?: number; ticker: string }[]> = {
    2: [{ title: 'Econet Wireless Ex-Date', type: 'ex-date', ticker: 'ECO' }],
    5: [{ title: 'Delta Corp Payout', type: 'payout', amount: 18.20, ticker: 'DLTA' }],
    15: [{ title: 'Innscor Africa Ex-Date', type: 'ex-date', ticker: 'INNS' }],
    22: [{ title: 'Simbisa Brands Payout', type: 'payout', amount: 10.00, ticker: 'SIMS' }],
    28: [{ title: 'National Foods Payout', type: 'payout', amount: 15.00, ticker: 'NATF' }],
  };

  const upcomingPayouts = [
    { id: '1', ticker: 'ECO', name: 'Econet Wireless Zimbabwe', exDate: 'Sep 02, 2026', amountUSD: 24.50, status: 'Confirmed' },
    { id: '2', ticker: 'DLTA', name: 'Delta Corporation Ltd', exDate: 'Sep 05, 2026', amountUSD: 18.20, status: 'Upcoming' },
    { id: '3', ticker: 'INNS', name: 'Innscor Africa', exDate: 'Sep 15, 2026', amountUSD: 15.70, status: 'Upcoming' },
    { id: '4', ticker: 'SIMS', name: 'Simbisa Brands', exDate: 'Sep 22, 2026', amountUSD: 10.00, status: 'Upcoming' },
  ];

  const handleClaim = () => {
    setClaimedNotice(true);
    setTimeout(() => setClaimedNotice(false), 4000);
  };

  // September 2026 calendar generator (Starts on Tuesday, 30 days)
  const daysInMonth = 30;
  const startDayOfWeek = 2; // 0=Sun, 1=Mon, 2=Tue

  const calendarDays = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null); // empty padding
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Passive Income & Yield Stream</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">SME Dividends & Cashflow Hub</h2>
          <p className="text-slate-500 text-sm mt-0.5">Track cumulative payouts, tax compliance, and projected monthly earnings backed by ZSE Debtbridge Trust.</p>
        </div>

        <button
          onClick={handleClaim}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-2xl text-xs flex items-center space-x-2 transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>Compound / Claim Dividends</span>
        </button>
      </div>

      {claimedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Successfully compounded unclaimed dividends of $42.50 into ZEEX Shares!</span>
          </div>
          <span className="font-bold">Base L2 Verified</span>
        </div>
      )}

      {/* Visual Yield Gauge & Progress Bar Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-15 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Portfolio Yield Gauge & Projected Annualized Return</span>
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              {portfolioYieldPercentage}% <span className="text-sm font-normal text-slate-300">Projected APY</span>
            </div>
            <p className="text-xs text-slate-400">
              Generated from <span className="text-white font-semibold">${totalSmeInvestmentUSD.toLocaleString()}</span> total SME token investment, yielding approximately <span className="text-emerald-400 font-semibold">${projectedAnnualUSD.toFixed(2)}</span> annually (Gross).
            </p>
          </div>

          <div className="w-full lg:w-72 bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 shadow-inner">
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="text-slate-400">Yield Efficiency Target</span>
              <span className="text-emerald-400 font-bold">14.5% / 20.0% Max</span>
            </div>
            <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${(portfolioYieldPercentage / 20) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
              <span>Conservative (5%)</span>
              <span>Balanced (12%)</span>
              <span className="text-emerald-400 font-bold">ZEEX Target (15%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Cumulative Dividends Received</div>
            <div className="text-2xl font-extrabold mt-1 text-slate-900">${cumulativeDividendsUSD.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-0.5">ZIG {cumulativeDividendsZIG.toLocaleString()} (@ 26.00 FX)</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span>All-time credited</span>
            <span className="text-emerald-600 font-semibold flex items-center">100% Onchain <ShieldCheck className="w-3.5 h-3.5 ml-1" /></span>
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Net Projected Monthly Income</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">${netMonthlyUSD.toFixed(2)} <span className="text-xs font-normal text-slate-500">/mo</span></div>
            <div className="text-xs text-slate-500 mt-0.5">~${netAnnualUSD.toFixed(2)} net annualized</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span>After ZIMRA Tax</span>
            <span className="font-bold text-slate-900">{(taxRate * 100)}% Deducted</span>
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Next Payout Countdown</div>
            <div className="text-xl font-bold text-slate-900 mt-1">Econet Wireless (ECO)</div>
            <div className="text-xs text-slate-500 mt-0.5">Ex-dividend date: Sep 02, 2026</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span>Net Estimated Payout</span>
            <span className="font-bold text-emerald-600">+${(24.50 * (1 - taxRate)).toFixed(2)} USD</span>
          </div>
        </div>
      </div>

      {/* ZIMRA Withholding Tax Calculator & Net Income Breakdown Card */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Receipt className="w-4 h-4 mr-1.5 text-blue-600" /> ZIMRA Withholding Tax & Net Income Calculator
            </h3>
            <p className="text-xs text-slate-500">Calculated according to Zimbabwean financial regulations for SME and listed securities.</p>
          </div>

          <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setTaxResidentType('resident')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                taxResidentType === 'resident' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Zimbabwe Resident (10%)
            </button>
            <button
              onClick={() => setTaxResidentType('non-resident')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                taxResidentType === 'non-resident' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Non-Resident / Diaspora (15%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Gross Annualized Dividends</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">${projectedAnnualUSD.toFixed(2)}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">(${projectedMonthlyUSD.toFixed(2)} / month gross)</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Estimated Withholding Tax ({(taxRate * 100)}%)</div>
            <div className="text-xl font-extrabold text-rose-600 mt-1">-${withholdingTaxAnnual.toFixed(2)}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Remitted directly to ZIMRA via smart escrow</div>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-xs">
            <div className="text-xs text-emerald-800 font-medium">Net Annualized Dividend Income</div>
            <div className="text-xl font-extrabold text-emerald-700 mt-1">${netAnnualUSD.toFixed(2)}</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">(${netMonthlyUSD.toFixed(2)} / month net to wallet)</div>
          </div>
        </div>
      </div>

      {/* Visual Dividend Calendar Component */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1.5 text-emerald-600" /> Dividend Ex-Date & Projected Payment Calendar
            </h3>
            <p className="text-xs text-slate-500">Visual schedule highlighting ex-dividend dates and projected cashflow delivery.</p>
          </div>

          <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-900">{selectedMonth}</span>
            <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-slate-600 font-medium">Ex-Dividend Date</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 font-medium">Projected Payment Date</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          {/* Days Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-3">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Days Matrix */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="h-24 bg-slate-50/50 rounded-xl border border-slate-100 opacity-40"></div>;
              }

              const events = dividendEventsMap[dayNum] || [];
              const isToday = dayNum === 18; // Current mock day

              return (
                <div 
                  key={`day-${dayNum}`} 
                  className={`h-24 p-2 rounded-xl border flex flex-col justify-between transition-all ${
                    isToday ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-400/20' : 'bg-slate-50/80 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${isToday ? 'text-emerald-700 bg-emerald-200 px-1.5 py-0.5 rounded-md' : 'text-slate-700'}`}>
                      {dayNum}
                    </span>
                    {isToday && <span className="text-[9px] font-bold text-emerald-600 uppercase">Today</span>}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-14">
                    {events.map((ev, eIdx) => (
                      <div 
                        key={eIdx}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate shadow-xs ${
                          ev.type === 'ex-date' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                        title={`${ev.ticker}: ${ev.title}`}
                      >
                        {ev.ticker}: {ev.type === 'ex-date' ? 'Ex-Date' : `+$${ev.amount}`}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 12-Month Dividend Income Bar Chart */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1.5 text-emerald-600" /> Monthly Dividend Income (Last 12 Months)
            </h3>
            <p className="text-xs text-slate-500">Historical payout trends credited to your Base L2 wallet.</p>
          </div>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl border border-emerald-200">
            Total: ~${monthlyDividendData.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyDividendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Dividend Income']}
              />
              <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Dividend Calendar & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Upcoming Payouts Table */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1.5 text-emerald-600" /> Upcoming Dividend Payout Schedule
            </h3>
            <span className="text-xs text-slate-500">4 Active Assets</span>
          </div>

          <div className="space-y-2.5">
            {upcomingPayouts.map((payout) => (
              <div key={payout.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs flex items-center">
                    <span>{payout.name}</span>
                    <span className="ml-2 px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-700 rounded">
                      {payout.ticker}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Ex-date: {payout.exDate}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-600">+${(payout.amountUSD * (taxResidentType === 'resident' ? 0.9 : 0.85)).toFixed(2)} net</div>
                  <div className="text-[10px] text-slate-400 font-medium">{payout.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Dividend Breakdown */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1.5 text-blue-600" /> Historical Payout Distribution
              </h3>
              <span className="text-xs text-slate-500">Last 6 Months</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Econet Wireless (ECO)</span>
                  <span className="font-bold text-slate-900">$142.50 (41%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '41%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Delta Corporation (DLTA)</span>
                  <span className="font-bold text-slate-900">$118.00 (34%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '34%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Innscor Africa (INNS)</span>
                  <span className="font-bold text-slate-900">$82.00 (25%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Automated Base L2 Distribution</span>
            <span className="font-semibold text-slate-700">Instant USDC/ZIG Payouts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
