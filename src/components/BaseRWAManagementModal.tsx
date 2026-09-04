import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Building2, 
  Coins, 
  ShieldCheck, 
  ExternalLink, 
  Ban, 
  TrendingUp, 
  PauseCircle, 
  PlayCircle, 
  CheckCircle2, 
  AlertTriangle, 
  PieChart, 
  Layers, 
  RefreshCw,
  Sliders,
  DollarSign,
  ArrowRight,
  Megaphone,
  UserCheck
} from 'lucide-react';
import { BaseRWAService } from '../services/baseRWA';
import { BaseRWAAssetToken } from '../types';

interface BaseRWAManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTicker?: string;
  onAssetUpdated?: () => void;
}

export const BaseRWAManagementModal: React.FC<BaseRWAManagementModalProps> = ({
  isOpen,
  onClose,
  initialTicker = 'TKRA',
  onAssetUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'issue' | 'restrict' | 'cancel' | 'distribution' | 'multiplier' | 'pause'>('create');
  const [rwaAssets, setRwaAssets] = useState<BaseRWAAssetToken[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string>(initialTicker);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  // 1. Create Asset Token State
  const [name, setName] = useState('Savannah BioTech Exports RWA');
  const [ticker, setTicker] = useState('SBIO');
  const [initialSupply, setInitialSupply] = useState<number>(250000);
  const [maxSupply, setMaxSupply] = useState<number>(2000000);
  const [custodianEscrow, setCustodianEscrow] = useState('Stanbic Nominees Zimbabwe Ltd (ZSE Trust #411)');
  const [seczimFilingId, setSeczimFilingId] = useState(`SECZ-RWA-2026-${Math.floor(1000 + Math.random() * 9000)}`);

  // 2. Issue Units State
  const [issueRecipient, setIssueRecipient] = useState('');
  const [issueAmount, setIssueAmount] = useState<number>(50000);
  const [issueReason, setIssueReason] = useState('Secondary Share Issuance for Solar Grid Expansion');

  // 3. Restrict Holders State
  const [requiresKYC, setRequiresKYC] = useState(true);
  const [allowedCountriesStr, setAllowedCountriesStr] = useState('ZW, ZA, US, GB, AE');
  const [restrictAddress, setRestrictAddress] = useState('');

  // 4. Cancel Blocked Units State
  const [cancelTargetAddress, setCancelTargetAddress] = useState('0x8899a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8');
  const [cancelAmount, setCancelAmount] = useState<number>(10000);
  const [cancelReason, setCancelReason] = useState('SECZim Regulatory Sanction Order #84');

  // 5. Announce Distribution State
  const [distributionTotalUSD, setDistributionTotalUSD] = useState<number>(15000);
  const [distributionCurrency, setDistributionCurrency] = useState<'USDC' | 'ZIG'>('USDC');
  const [distributionPayoutDate, setDistributionPayoutDate] = useState('2026-09-30');

  // 6. Apply Multiplier State
  const [multiplierRatio, setMultiplierRatio] = useState<number>(2.0); // 2:1 stock split

  // 7. Pause Transfers State
  const [pauseToggle, setPauseToggle] = useState<boolean>(true);

  // Load RWA Assets
  const fetchAssets = async () => {
    try {
      const res = await BaseRWAService.getAssets();
      if (res.success && res.data) {
        setRwaAssets(res.data);
        if (!selectedTicker && res.data.length > 0) {
          setSelectedTicker(res.data[0].ticker);
        }
      }
    } catch (err) {
      console.warn('[Base RWA] Asset fetch note:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentAsset = rwaAssets.find(a => a.ticker.toUpperCase() === selectedTicker.toUpperCase()) || rwaAssets[0];

  // Handler 1: Create Asset Token
  const handleCreateAssetToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setStatusMessage('Deploying RWA Asset Token smart contract on Base L2...');
      const res = await BaseRWAService.createAssetToken({
        name,
        ticker,
        initialSupply,
        maxAuthorizedSupply: maxSupply,
        custodianEscrow,
        seczimFilingId,
        requiresKYC,
        allowedCountries: allowedCountriesStr.split(',').map(s => s.trim().toUpperCase())
      });
      setLastTxHash(res.txHash);
      setStatusMessage(`🎉 Success! RWA Asset Token ${res.data.ticker} created on Base L2!`);
      await fetchAssets();
      if (onAssetUpdated) onAssetUpdated();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler 2: Issue Units
  const handleIssueUnits = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setStatusMessage(`Issuing ${issueAmount.toLocaleString()} units of ${selectedTicker} on Base L2...`);
      const res = await BaseRWAService.issueUnits({
        ticker: selectedTicker,
        recipientAddress: issueRecipient || undefined,
        amountUnits: issueAmount,
        reason: issueReason
      });
      setLastTxHash(res.data.txHash);
      setStatusMessage(`🎉 Issued ${issueAmount.toLocaleString()} units of ${selectedTicker} successfully!`);
      await fetchAssets();
      if (onAssetUpdated) onAssetUpdated();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler 3: Restrict Holders
  const handleRestrictHolders = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setStatusMessage(`Updating ERC-3643 holder eligibility rules for ${selectedTicker}...`);
      const res = await BaseRWAService.restrictEligibleHolders({
        ticker: selectedTicker,
        requiresKYC,
        allowedCountries: allowedCountriesStr.split(',').map(s => s.trim().toUpperCase()),
        restrictAddress: restrictAddress || undefined
      });
      setStatusMessage(`🎉 Holder eligibility policy updated for ${selectedTicker}!`);
      await fetchAssets();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler 4: Cancel Blocked Units
  const handleCancelBlockedUnits = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setStatusMessage(`Executing regulatory clawback of ${cancelAmount.toLocaleString()} units...`);
      const res = await BaseRWAService.cancelBlockedUnits({
        ticker: selectedTicker,
        targetAddress: cancelTargetAddress,
        amountToCancel: cancelAmount,
        seczimReason: cancelReason
      });
      setLastTxHash(res.data.txHash);
      setStatusMessage(`🎉 Cancelled & burned ${cancelAmount.toLocaleString()} blocked units from ${cancelTargetAddress.slice(0, 6)}...!`);
      await fetchAssets();
      if (onAssetUpdated) onAssetUpdated();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler 5: Announce Distribution
  const handleAnnounceDistribution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setStatusMessage(`Broadcasting $${distributionTotalUSD.toLocaleString()} ${distributionCurrency} dividend distribution...`);
      const res = await BaseRWAService.announceDistribution({
        ticker: selectedTicker,
        totalAmountUSD: distributionTotalUSD,
        payoutDate: distributionPayoutDate,
        currency: distributionCurrency
      });
      setLastTxHash(res.data.txHash);
      setStatusMessage(`🎉 Dividend distribution of $${distributionTotalUSD.toLocaleString()} USD announced for ${selectedTicker}!`);
      await fetchAssets();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler 6: Apply Multiplier
  const handleApplyMultiplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setStatusMessage(`Applying ${multiplierRatio}:1 stock split multiplier to ${selectedTicker}...`);
      const res = await BaseRWAService.applyMultiplier({
        ticker: selectedTicker,
        multiplierRatio
      });
      setLastTxHash(res.data.txHash);
      setStatusMessage(`🎉 Applied ${multiplierRatio}:1 stock split multiplier for ${selectedTicker}!`);
      await fetchAssets();
      if (onAssetUpdated) onAssetUpdated();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler 7: Pause / Unpause Transfers
  const handleTogglePause = async (pauseState: boolean) => {
    try {
      setIsLoading(true);
      setStatusMessage(`${pauseState ? 'Pausing' : 'Unpausing'} transfers for ${selectedTicker}...`);
      const res = await BaseRWAService.pauseTransfers({
        ticker: selectedTicker,
        pause: pauseState
      });
      setLastTxHash(res.data.txHash);
      setStatusMessage(`🎉 Transfers for ${selectedTicker} are now ${pauseState ? 'PAUSED ⏸️' : 'ACTIVE 🟢'}!`);
      await fetchAssets();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-scale-up">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">Base RWA Tokenization Manager</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  ERC-3643 Standard • Base L2
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official Base RWA specification for tokenized stocks, share issuance, compliance controls & distributions.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Asset Selector Bar */}
        {rwaAssets.length > 0 && (
          <div className="px-6 py-3 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs text-blue-900 font-semibold">
              <span>Active RWA Asset:</span>
              <select
                value={selectedTicker}
                onChange={(e) => setSelectedTicker(e.target.value)}
                className="bg-white border border-blue-200 rounded-xl px-3 py-1 text-xs font-bold text-blue-900 shadow-xs focus:ring-2 focus:ring-blue-500"
              >
                {rwaAssets.map(a => (
                  <option key={a.id} value={a.ticker}>
                    {a.name} ({a.ticker}) — Supply: {a.totalSupply.toLocaleString()} units {a.isPaused ? '⏸️ PAUSED' : ''}
                  </option>
                ))}
              </select>
            </div>

            {currentAsset && (
              <div className="flex items-center space-x-3 text-[11px] text-slate-600 font-mono">
                <span>Supply: <strong>{currentAsset.totalSupply.toLocaleString()}</strong> / {currentAsset.maxAuthorizedSupply.toLocaleString()}</span>
                <span>Split: <strong>{currentAsset.multiplier}x</strong></span>
                <span className={`px-2 py-0.5 rounded-md font-bold ${currentAsset.isPaused ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {currentAsset.isPaused ? 'PAUSED ⏸️' : 'ACTIVE 🟢'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Sub-Tab Navigation Bar */}
        <div className="flex border-b border-slate-200 overflow-x-auto bg-white px-4 scrollbar-none">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>1. Create Asset</span>
          </button>
          <button
            onClick={() => setActiveTab('issue')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'issue'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>2. Issue Units</span>
          </button>
          <button
            onClick={() => setActiveTab('restrict')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'restrict'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>3. Restrict Holders</span>
          </button>
          <button
            onClick={() => setActiveTab('cancel')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'cancel'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Ban className="w-4 h-4 text-rose-500" />
            <span>4. Cancel Blocked</span>
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'distribution'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-4 h-4 text-purple-600" />
            <span>5. Distribution</span>
          </button>
          <button
            onClick={() => setActiveTab('multiplier')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'multiplier'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>6. Multiplier (Split)</span>
          </button>
          <button
            onClick={() => setActiveTab('pause')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'pause'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <PauseCircle className="w-4 h-4 text-slate-700" />
            <span>7. Pause Transfers</span>
          </button>
        </div>

        {/* Modal Content Scroll Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Message Notification */}
          {statusMessage && (
            <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
              statusMessage.includes('Error') 
                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusMessage}</span>
              </div>
              {lastTxHash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${lastTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold flex items-center space-x-1 text-blue-700 hover:underline shrink-0 ml-2"
                >
                  <span>BaseScan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* TAB 1: CREATE ASSET TOKEN */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateAssetToken} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Base RWA Specification: Create an Asset Token</span>
                </div>
                <p>
                  Deploy an ERC-3643 permissioned tokenized stock contract for your SME on Base L2. Includes automated identity compliance checks & SECZim trust registry.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Asset Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Token Ticker (e.g. SBIO)</label>
                  <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Tokenized Supply (Shares)</label>
                  <input
                    type="number"
                    value={initialSupply}
                    onChange={(e) => setInitialSupply(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Authorized Supply Cap</label>
                  <input
                    type="number"
                    value={maxSupply}
                    onChange={(e) => setMaxSupply(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Custodian Escrow Trust Account</label>
                <input
                  type="text"
                  value={custodianEscrow}
                  onChange={(e) => setCustodianEscrow(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                <span>Deploy Base RWA Asset Token (ERC-3643)</span>
              </button>
            </form>
          )}

          {/* TAB 2: ISSUE UNITS */}
          {activeTab === 'issue' && (
            <form onSubmit={handleIssueUnits} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Base RWA Specification: Issue Units</span>
                </div>
                <p>
                  Mint and issue secondary tokenized equity units of <strong>{selectedTicker}</strong> to a founder escrow, treasury, or investor address.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Number of Shares/Units to Issue</label>
                  <input
                    type="number"
                    value={issueAmount}
                    onChange={(e) => setIssueAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Wallet Address (Optional — default: Treasury)</label>
                  <input
                    type="text"
                    value={issueRecipient}
                    onChange={(e) => setIssueRecipient(e.target.value)}
                    placeholder="0x71C824aD3Fe479B92c578f142EbF472bC19638A9"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issuance Reason / SECZim Board Resolution</label>
                  <input
                    type="text"
                    value={issueReason}
                    onChange={(e) => setIssueReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                <span>Issue {issueAmount.toLocaleString()} Units of {selectedTicker}</span>
              </button>
            </form>
          )}

          {/* TAB 3: RESTRICT ELIGIBLE HOLDERS */}
          {activeTab === 'restrict' && (
            <form onSubmit={handleRestrictHolders} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-900 flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Base RWA Specification: Restrict Eligible Holders</span>
                </div>
                <p>
                  Enforce SECZim compliance rules & country-level whitelist restrictions for holding <strong>{selectedTicker}</strong> shares.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <input
                    type="checkbox"
                    id="kycCheck"
                    checked={requiresKYC}
                    onChange={(e) => setRequiresKYC(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="kycCheck" className="text-xs font-bold text-blue-900 cursor-pointer">
                    Require Identity Verification (KYC/AML) for Token Transfers
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Allowed Investor Jurisdiction Country Codes (ISO 3166)</label>
                  <input
                    type="text"
                    value={allowedCountriesStr}
                    onChange={(e) => setAllowedCountriesStr(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Comma-separated list (e.g. ZW, ZA, US, GB, AE, SG)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blacklist Specific Address (Optional)</label>
                  <input
                    type="text"
                    value={restrictAddress}
                    onChange={(e) => setRestrictAddress(e.target.value)}
                    placeholder="0xRestrictedAddress..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Update Eligibility Rules for {selectedTicker}</span>
              </button>
            </form>
          )}

          {/* TAB 4: CANCEL BLOCKED UNITS */}
          {activeTab === 'cancel' && (
            <form onSubmit={handleCancelBlockedUnits} className="space-y-4">
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1">
                <div className="font-bold flex items-center space-x-2 text-rose-800">
                  <Ban className="w-4 h-4" />
                  <span>Base RWA Specification: Cancel Blocked Units</span>
                </div>
                <p>
                  Clawback and burn tokenized units from a sanctioned or compliance-blocked wallet address pursuant to SECZim regulatory directives.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Blocked Address</label>
                  <input
                    type="text"
                    value={cancelTargetAddress}
                    onChange={(e) => setCancelTargetAddress(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount of Units to Cancel & Burn</label>
                  <input
                    type="number"
                    value={cancelAmount}
                    onChange={(e) => setCancelAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Regulatory Sanction Reason</label>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                <span>Execute Regulatory Clawback ({cancelAmount.toLocaleString()} Units)</span>
              </button>
            </form>
          )}

          {/* TAB 5: ANNOUNCE DISTRIBUTION */}
          {activeTab === 'distribution' && (
            <form onSubmit={handleAnnounceDistribution} className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 text-xs text-purple-900 space-y-1">
                <div className="font-bold flex items-center space-x-2 text-purple-900">
                  <Megaphone className="w-4 h-4 text-purple-700" />
                  <span>Base RWA Specification: Announce a Distribution</span>
                </div>
                <p>
                  Schedule and broadcast a quarterly USDC or $ZIG dividend distribution to all current token holders of <strong>{selectedTicker}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Dividend Pool (USD)</label>
                  <input
                    type="number"
                    value={distributionTotalUSD}
                    onChange={(e) => setDistributionTotalUSD(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payout Currency</label>
                  <select
                    value={distributionCurrency}
                    onChange={(e) => setDistributionCurrency(e.target.value as 'USDC' | 'ZIG')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="USDC">USDC (Digital Dollar)</option>
                    <option value="ZIG">ZIG (Zimbabwe Gold)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payout Date</label>
                  <input
                    type="date"
                    value={distributionPayoutDate}
                    onChange={(e) => setDistributionPayoutDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                <span>Announce Dividend Distribution for {selectedTicker}</span>
              </button>
            </form>
          )}

          {/* TAB 6: APPLY MULTIPLIER (STOCK SPLIT) */}
          {activeTab === 'multiplier' && (
            <form onSubmit={handleApplyMultiplier} className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center space-x-2 text-amber-800">
                  <Sliders className="w-4 h-4" />
                  <span>Base RWA Specification: Apply a Multiplier</span>
                </div>
                <p>
                  Execute a stock split / multiplier ratio (e.g. 2:1 or 5:1 split) across all tokenized share balances of <strong>{selectedTicker}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Multiplier Split Ratio (e.g., 2.0 for 2:1 Split)</label>
                <input
                  type="number"
                  step="0.1"
                  value={multiplierRatio}
                  onChange={(e) => setMultiplierRatio(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />}
                <span>Apply {multiplierRatio}:1 Multiplier Split for {selectedTicker}</span>
              </button>
            </form>
          )}

          {/* TAB 7: PAUSE TRANSFERS */}
          {activeTab === 'pause' && (
            <div className="space-y-4">
              <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 text-xs text-slate-800 space-y-1">
                <div className="font-bold flex items-center space-x-2 text-slate-900">
                  <PauseCircle className="w-4 h-4 text-slate-700" />
                  <span>Base RWA Specification: Pause / Unpause Transfers</span>
                </div>
                <p>
                  Toggle emergency circuit breaker pause on token transfers for <strong>{selectedTicker}</strong>.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
                <div className="text-sm font-bold text-slate-900">
                  Current Status: <span className={currentAsset?.isPaused ? 'text-amber-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>
                    {currentAsset?.isPaused ? 'PAUSED ⏸️' : 'ACTIVE 🟢'}
                  </span>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleTogglePause(true)}
                    disabled={isLoading || currentAsset?.isPaused}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs shadow-sm transition-all flex items-center space-x-2"
                  >
                    <PauseCircle className="w-4 h-4" />
                    <span>Pause Transfers ⏸️</span>
                  </button>

                  <button
                    onClick={() => handleTogglePause(false)}
                    disabled={isLoading || !currentAsset?.isPaused}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs shadow-sm transition-all flex items-center space-x-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Resume Transfers 🟢</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
