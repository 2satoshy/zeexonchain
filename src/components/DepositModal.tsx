import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  CreditCard, 
  Smartphone, 
  Sparkles, 
  ExternalLink, 
  ArrowRight, 
  ShieldCheck, 
  Coins 
} from 'lucide-react';
import { UNISWAP_V3_ADDRESSES } from '../data/tokenData';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
  onDepositSuccess: (amountUSD: number, method: string, tokenSymbol?: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  userAddress,
  onDepositSuccess
}) => {
  const [activeDepositTab, setActiveDepositTab] = useState<'crypto' | 'card' | 'ecocash' | 'faucet'>('crypto');
  const [copied, setCopied] = useState(false);
  const [fiatAmount, setFiatAmount] = useState<number>(250);
  const [ecocashPhone, setEcocashPhone] = useState('+263 77 419 8201');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const displayAddress = userAddress || '0x71C824aD3Fe479B92c578f142EbF472bC19638A9';

  const handleCopy = () => {
    navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCardDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onDepositSuccess(fiatAmount, 'Visa / Mastercard Card Onramp', 'USDC');
      setTxSuccess(`Successfully deposited $${fiatAmount.toFixed(2)} USD (credited as USDC on Base L2)!`);
      setTimeout(() => {
        setTxSuccess(null);
        onClose();
      }, 2500);
    }, 1200);
  };

  const handleEcoCashDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onDepositSuccess(fiatAmount, 'EcoCash USD Direct Onramp', 'ZIG');
      setTxSuccess(`EcoCash prompt approved! $${fiatAmount.toFixed(2)} credited as ${(fiatAmount * 26).toLocaleString()} $ZIG!`);
      setTimeout(() => {
        setTxSuccess(null);
        onClose();
      }, 2500);
    }, 1200);
  };

  const handleClaimFaucet = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onDepositSuccess(500, 'Base Sepolia Testnet Faucet', 'USDC');
      setTxSuccess('Faucet Claimed! 0.10 ETH + 500 USDC + 13,000 $ZIG sent to your CDP Smart Wallet on Base Sepolia!');
      setTimeout(() => {
        setTxSuccess(null);
        onClose();
      }, 2500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-scale-up my-8">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Deposit & Add Funds</h2>
              <p className="text-xs text-slate-500">Fund your Coinbase Smart Wallet on Base L2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl my-4 text-xs font-bold">
          <button
            onClick={() => setActiveDepositTab('crypto')}
            className={`py-2 rounded-xl transition-all ${
              activeDepositTab === 'crypto'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Onchain Crypto
          </button>
          <button
            onClick={() => setActiveDepositTab('faucet')}
            className={`py-2 rounded-xl transition-all ${
              activeDepositTab === 'faucet'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Test Faucet
          </button>
          <button
            onClick={() => setActiveDepositTab('card')}
            className={`py-2 rounded-xl transition-all ${
              activeDepositTab === 'card'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Credit Card
          </button>
          <button
            onClick={() => setActiveDepositTab('ecocash')}
            className={`py-2 rounded-xl transition-all ${
              activeDepositTab === 'ecocash'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EcoCash
          </button>
        </div>

        {txSuccess && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{txSuccess}</span>
          </div>
        )}

        {/* Tab 1: Onchain Crypto */}
        {activeDepositTab === 'crypto' && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="inline-block p-3 bg-white rounded-2xl shadow-xs border border-slate-200">
                <QrCode className="w-32 h-32 mx-auto text-slate-900" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Your Coinbase Smart Wallet Address (Base L2)
                </span>
                <div className="flex items-center justify-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800">
                  <span className="truncate max-w-[280px]">{displayAddress}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Copy Address"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-400 text-[10px] font-medium">Supported Tokens</div>
                <div className="font-bold text-slate-800 mt-0.5">ETH, USDC, $ZIG, B20</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-400 text-[10px] font-medium">Network</div>
                <div className="font-bold text-blue-600 mt-0.5">Base Sepolia / Mainnet</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center text-emerald-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Gasless CDP Paymaster
              </span>
              <a
                href={`${UNISWAP_V3_ADDRESSES.EXPLORER_URL}/address/${displayAddress}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline flex items-center font-semibold"
              >
                <span>View on BaseScan</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        )}

        {/* Tab 2: Testnet Faucet */}
        {activeDepositTab === 'faucet' && (
          <div className="space-y-4">
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Instant Base Sepolia Faucet</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Claim test ETH, USDC, and $ZIG to test stock tokenization, swapping, and trading instantly.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                  <div className="text-[10px] text-slate-400">Ether</div>
                  <div className="font-bold text-slate-800 mt-0.5">0.10 ETH</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                  <div className="text-[10px] text-slate-400">USD Coin</div>
                  <div className="font-bold text-slate-800 mt-0.5">500 USDC</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                  <div className="text-[10px] text-slate-400">Zim Gold</div>
                  <div className="font-bold text-emerald-600 mt-0.5">13,000 $ZIG</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleClaimFaucet}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isProcessing ? (
                <span>Minting Faucet Tokens to {displayAddress.slice(0, 8)}...</span>
              ) : (
                <>
                  <span>Claim 1-Click Faucet Tokens</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 3: Card Rails */}
        {activeDepositTab === 'card' && (
          <form onSubmit={handleCardDeposit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Deposit Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={fiatAmount}
                  onChange={(e) => setFiatAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex space-x-2 mt-2">
                {[50, 100, 250, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setFiatAmount(amt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      fiatAmount === amt ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Card Details (Simulated Gateway)</label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-xs font-mono text-slate-700">•••• •••• •••• 4242</span>
                <span className="text-[10px] text-slate-400 ml-auto">12/28 • CVC 999</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Received as:</span>
                <span className="font-bold text-slate-900">{fiatAmount} USDC on Base</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <span className="font-bold text-emerald-600">0.00% (Sponsored)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isProcessing ? <span>Processing Card Payment...</span> : <span>Confirm Card Deposit (${fiatAmount.toFixed(2)})</span>}
            </button>
          </form>
        )}

        {/* Tab 4: EcoCash */}
        {activeDepositTab === 'ecocash' && (
          <form onSubmit={handleEcoCashDeposit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">EcoCash Number (+263)</label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-emerald-600" />
                <input
                  type="text"
                  value={ecocashPhone}
                  onChange={(e) => setEcocashPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="5"
                  max="2000"
                  value={fiatAmount}
                  onChange={(e) => setFiatAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-xs space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>Equivalent in $ZIG:</span>
                <span className="font-bold text-emerald-700">ZIG {(fiatAmount * 26).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>USSD Push Notification:</span>
                <span className="text-slate-600">PIN prompt sent instantly</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isProcessing ? <span>Sending USSD Prompt...</span> : <span>Send EcoCash Deposit Prompt</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
