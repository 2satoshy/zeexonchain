import React, { useState } from 'react';
import { User, ShieldCheck, FileText, Download, CreditCard, Landmark, Clock, Activity, CheckCircle2, Upload, Plus, Lock, ChevronRight, Menu, Wallet, Building2, Coins, Sparkles, ArrowRight, Layers } from 'lucide-react';
import { Transaction, TokenAsset } from '../types';
import { CoinbaseWalletSection } from './CoinbaseWalletSection';
import { PaginationBar } from './PaginationBar';
import { SwipeableContainer } from './SwipeableContainer';
import { BlockchainIndexerHistory } from './BlockchainIndexerHistory';

interface ProfileViewProps {
  transactions: Transaction[];
  totalBalanceUSD: number;
  zigBalance: number;
  tokens?: TokenAsset[];
  onAddMoney: (amountUSD: number, method: string) => void;
  onNavigateToStartupListing?: () => void;
  onOpenDeposit?: () => void;
  onOpenSend?: () => void;
  onOpenSwap?: () => void;
  onOpenTokenize?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  transactions, 
  totalBalanceUSD, 
  zigBalance, 
  tokens = [],
  onAddMoney, 
  onNavigateToStartupListing,
  onOpenDeposit,
  onOpenSend,
  onOpenSwap,
  onOpenTokenize
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 5;

  const profilePages = [
    { id: 1, title: '1. Wallets & Startups', shortTitle: 'Wallets & RWA' },
    { id: 2, title: '2. Personal & KYC', shortTitle: 'Personal & KYC' },
    { id: 3, title: '3. Banking & Add Funds', shortTitle: 'Banking' },
    { id: 4, title: '4. Tax & Statements', shortTitle: 'Tax & Docs' },
    { id: 5, title: '5. Blockchain Indexer & History', shortTitle: 'Onchain Indexer' },
  ];

  const handleSwipeLeft = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handleSwipeRight = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };


  const [name, setName] = useState('Tendai Moyo');
  const [email, setEmail] = useState('tendai.moyo@zeex.co.zw');
  const [phone, setPhone] = useState('+263 77 988 4912');
  const [bio, setBio] = useState('ZSE SME Investor & Diaspora Onchain Capitalist. Backing Zimbabwean growth.');
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const [kycStatus] = useState<'Verified' | 'Pending Review'>('Verified');
  const [kycFile] = useState<string | null>(null);

  const [depositAmount, setDepositAmount] = useState('100');
  const [depositMethod, setDepositMethod] = useState('Visa/Mastercard');
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);

  const [bankAccounts, setBankAccounts] = useState([
    { id: '1', bankName: 'Stanbic Bank Zimbabwe', accountNumber: '0210049182300', currency: 'USD', status: 'Primary Payout' },
    { id: '2', bankName: 'CABS', accountNumber: '1123498102', currency: 'ZIG', status: 'Linked' }
  ]);
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBankName, setNewBankName] = useState('CBZ Bank');
  const [newAccNum, setNewAccNum] = useState('');

  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg('Profile updated successfully!');
    setTimeout(() => setSavedMsg(null), 3000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;
    onAddMoney(amt, depositMethod);
    setDepositSuccess(`Successfully added $${amt.toFixed(2)} via ${depositMethod}! Credited to Base L2.`);
    setTimeout(() => setDepositSuccess(null), 4000);
    setDepositAmount('100');
  };

  const handleAddBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccNum) return;
    setBankAccounts(prev => [
      ...prev,
      { id: `bank-${Date.now()}`, bankName: newBankName, accountNumber: newAccNum, currency: 'USD', status: 'Linked' }
    ]);
    setNewAccNum('');
    setShowAddBank(false);
  };

  const handleDownloadTaxForm = (formName: string) => {
    alert(`Downloading ${formName} PDF (ZIMRA Compliant Certificate)...`);
  };

  const handleDownloadStatement = (month: string) => {
    alert(`Downloading ZEEX Account Statement for ${month}...`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28">
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 sm:w-80 h-64 sm:h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 w-full md:w-auto">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-md border-2 border-white/20">
                TM
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-[9px]">✓</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                  {kycStatus} • Tier 2
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">{bio}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-400">
                <span>📧 {email}</span>
                <span>📱 {phone}</span>
                <span>🇿🇼 Harare</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/95 border border-slate-700/80 p-3.5 sm:p-4 rounded-2xl w-full md:w-auto md:min-w-[200px] shrink-0 text-left md:text-right">
            <div className="text-[11px] text-slate-400">Portfolio Net Worth</div>
            <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5">${totalBalanceUSD.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-400 font-medium mt-0.5">ZIG {zigBalance.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Navigation Jump Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1 pl-2 pr-1 text-slate-400 shrink-0 text-xs font-bold">
          <Menu className="w-3.5 h-3.5 mr-1" /> Page:
        </div>
        {profilePages.map((page) => (
          <button
            key={page.id}
            onClick={() => setCurrentPage(page.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              currentPage === page.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {page.title}
          </button>
        ))}
      </div>

      {savedMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      <SwipeableContainer
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showMobileSwipeIndicator={true}
      >
        {/* Page 1: Coinbase Smart Wallet & Startup RWA Hub */}
        {currentPage === 1 && (
          <div className="space-y-6 animate-fade-in">
            <CoinbaseWalletSection 
              zigBalance={zigBalance} 
              totalBalanceUSD={totalBalanceUSD} 
              tokens={tokens}
              onOpenDeposit={onOpenDeposit}
              onOpenSend={onOpenSend}
              onOpenSwap={onOpenSwap}
              onOpenTokenize={onOpenTokenize}
            />

            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white border border-indigo-900/50 shadow-md space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white">Startup & SME Tokenization Portal</h2>
                  </div>
                  <p className="text-xs text-slate-300">
                    Apply for SECZim onchain listing, upload your dataroom, and tokenize equity into ERC-3643 securities.
                  </p>
                </div>

                {onNavigateToStartupListing && (
                  <button
                    onClick={onNavigateToStartupListing}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm flex items-center space-x-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Launch Tokenization Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Metrics & Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 space-y-1">
                  <div className="text-[10px] text-slate-400 font-medium">Virtual Dataroom</div>
                  <div className="text-sm font-bold text-white">Cryptographic Stamped</div>
                  <div className="text-[10px] text-emerald-400">SHA-256 Verified Storage</div>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 space-y-1">
                  <div className="text-[10px] text-slate-400 font-medium">Token Pricing Engine</div>
                  <div className="text-sm font-bold text-white">Dynamic Peg & Algorithmic</div>
                  <div className="text-[10px] text-blue-300">Base L2 & SECZim Rails</div>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 space-y-1">
                  <div className="text-[10px] text-slate-400 font-medium">Investor Matching</div>
                  <div className="text-sm font-bold text-white">ZeexMatch LPs</div>
                  <div className="text-[10px] text-purple-300">142 Institutional Syndicates</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page 2: Personal Information & KYC Verification */}
        {currentPage === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-fade-in">
            {/* Personalization & Info Form */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Personal Information & Personalization</h2>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">National ID / Passport No.</label>
                    <input
                      type="text"
                      value="63-294812-F-42 (Verified)"
                      disabled
                      className="w-full p-3 bg-slate-100 rounded-xl sm:rounded-2xl border border-slate-200 text-xs text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Investor Bio</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl sm:rounded-2xl text-xs transition-all shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* KYC Uploads Section */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">KYC Verification & Document Uploads</h2>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                  Status: Tier 2 Verified
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Upload National ID, Proof of Residence (Utility Bill / Lease), or Tax Clearance for higher trading limits.
              </p>

              <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 p-5 sm:p-6 rounded-2xl text-center transition-colors bg-slate-50 cursor-pointer">
                <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700">Tap to upload files or <span className="text-blue-600">browse</span></div>
                <div className="text-[10px] text-slate-400 mt-1">Supports PDF, PNG, JPG up to 10MB</div>
              </div>

              {kycFile && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs">
                  <span className="font-medium text-blue-900 truncate mr-2">📎 {kycFile}</span>
                  <span className="text-emerald-700 font-bold shrink-0">Verified</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Page 3: Linked Bank Accounts & Payout Rails + Add Funds */}
        {currentPage === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-fade-in">
            {/* Linked Bank Accounts */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center space-x-2">
                  <Landmark className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Linked Bank Accounts & Payout Rails</h2>
                </div>
                <button
                  onClick={() => setShowAddBank(true)}
                  className="w-full sm:w-auto bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center justify-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link Bank / EcoCash</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {bankAccounts.map((acc) => (
                  <div key={acc.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {acc.currency}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{acc.bankName}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">•••• {acc.accountNumber.slice(-4)}</div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${acc.status === 'Primary Payout' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-700'}`}>
                      {acc.status}
                    </span>
                  </div>
                ))}
              </div>

              {showAddBank && (
                <form onSubmit={handleAddBankSubmit} className="p-4 bg-slate-100 rounded-2xl border border-slate-200 space-y-3 mt-3 animate-fade-in">
                  <div className="text-xs font-bold text-slate-800">Link New Zimbabwean Bank Account or Mobile Money</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs"
                    >
                      <option value="Stanbic Bank">Stanbic Bank Zimbabwe</option>
                      <option value="CABS">CABS</option>
                      <option value="CBZ Bank">CBZ Bank</option>
                      <option value="EcoCash">EcoCash Mobile Money</option>
                      <option value="InnBucks">InnBucks Wallet</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Account / Mobile Number"
                      value={newAccNum}
                      onChange={(e) => setNewAccNum(e.target.value)}
                      className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddBank(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Verify & Link
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Add Money via Card Widget */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-md space-y-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm sm:text-base font-bold text-white">Add Funds with Card</h2>
              </div>
              <p className="text-xs text-slate-300">
                Instant USD deposit via Visa/Mastercard or local gateways. Credited instantly to your Base L2 wallet.
              </p>

              {depositSuccess && (
                <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs">
                  {depositSuccess}
                </div>
              )}

              <form onSubmit={handleDepositSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Deposit Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="10"
                      step="5"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={depositMethod}
                    onChange={(e) => setDepositMethod(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-xs text-white"
                  >
                    <option value="Visa/Mastercard">Visa / Mastercard (Global)</option>
                    <option value="ZimSwitch Debit">ZimSwitch Local Debit</option>
                    <option value="EcoCash USD Gateway">EcoCash USD Gateway</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Deposit ${depositAmount} Instantly</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Page 4: Tax Forms & Statements + Legal Compliance */}
        {currentPage === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-fade-in">
            {/* Tax Forms & Statements Download */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Tax Forms & Statements</h2>
              </div>
              <p className="text-xs text-slate-500">Download official ZIMRA withholding tax certificates and monthly brokerage statements.</p>

              <div className="space-y-2.5">
                <button
                  onClick={() => handleDownloadTaxForm('ZIMRA Withholding Tax Certificate 2026')}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs transition-colors"
                >
                  <span className="font-medium text-slate-800 truncate mr-2">📄 ZIMRA Tax Certificate 2026</span>
                  <Download className="w-4 h-4 text-blue-600 shrink-0" />
                </button>
                <button
                  onClick={() => handleDownloadStatement('August 2026 Statement')}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs transition-colors"
                >
                  <span className="font-medium text-slate-800 truncate mr-2">📊 August 2026 Statement</span>
                  <Download className="w-4 h-4 text-blue-600 shrink-0" />
                </button>
                <button
                  onClick={() => handleDownloadStatement('July 2026 Statement')}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs transition-colors"
                >
                  <span className="font-medium text-slate-800 truncate mr-2">📊 July 2026 Statement</span>
                  <Download className="w-4 h-4 text-blue-600 shrink-0" />
                </button>
              </div>
            </div>

            {/* Legal & Terms / Privacy Links */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Legal & Compliance</h2>
              </div>
              <div className="space-y-1.5 pt-1 text-xs">
                <button
                  onClick={() => setLegalModal('terms')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                >
                  <span>Terms & Conditions</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => setLegalModal('privacy')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                >
                  <span>Privacy Policy & Data Security</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page 5: Blockchain Indexer & History */}
        {currentPage === 5 && (
          <div className="space-y-6 animate-fade-in">
            {/* Blockchain Indexer History with Confirmations for Swaps & Tokenizations */}
            <BlockchainIndexerHistory
              onOpenSwap={onOpenSwap}
              onOpenTokenize={onOpenTokenize}
            />

            {/* User Security & Audit Activities Log */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Security & Session Audit Trail</h2>
                </div>
                <span className="text-xs text-slate-500">SECZim Regulated Custody</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                  <div className="text-xs min-w-0 flex-1">
                    <div className="font-bold text-slate-900">Profile information updated</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Today • IP: 196.22.x.x (Harare)</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                  <div className="text-xs min-w-0 flex-1">
                    <div className="font-bold text-slate-900">Linked bank (Stanbic Bank)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Yesterday • Base L2 Relay</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                  <div className="text-xs min-w-0 flex-1">
                    <div className="font-bold text-slate-900">KYC Tier 2 Verification Approved</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Aug 15, 2026 • SECZim Compliance</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                  <div className="text-xs min-w-0 flex-1">
                    <div className="font-bold text-slate-900">WhatsApp Wallet Session</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Aug 10, 2026 • Phone +263 77...491</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </SwipeableContainer>

      {/* Bottom Pagination Bar */}
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemName="profile sections"
      />


      {/* Legal Modal Popup */}
      {legalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {legalModal === 'terms' ? 'ZEEX Terms & Conditions' : 'Privacy Policy & Data Security'}
              </h3>
              <button
                onClick={() => setLegalModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2 max-h-64 overflow-y-auto pr-2">
              {legalModal === 'terms' ? (
                <>
                  <p>1. **Acceptance of Terms**: By accessing ZEEX Onchain, you agree to comply with ZSE Debtbridge Trust and SECZim digital asset custody guidelines.</p>
                  <p>2. **Tokenized Fractional Equities**: All fractional shares are backed 1:1 by physical custodial deposits held securely in registered Zimbabwean trust accounts.</p>
                  <p>3. **Yield & Dividends**: Dividends are distributed automatically in USD / $ZIG via Base L2 smart contracts, subject to ZIMRA withholding tax deductions.</p>
                  <p>4. **Liability**: ZEEX provides secure execution rails but does not guarantee market performance of listed SME equities.</p>
                </>
              ) : (
                <>
                  <p>1. **Data Collection**: We collect KYC identification documents and transaction history solely for regulatory compliance with SECZim and AML standards.</p>
                  <p>2. **Encryption**: All personal data and wallet keys are secured with military-grade encryption and stored on decentralized Base L2 rails.</p>
                  <p>3. **Third-Party Sharing**: We never sell user data. Information is shared only with verified banking partners (Stanbic, CABS) for payout processing.</p>
                  <p>4. **User Rights**: You may request a complete data export or account deactivation at any time via support.</p>
                </>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setLegalModal(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
