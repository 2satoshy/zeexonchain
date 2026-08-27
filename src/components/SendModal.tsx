import React, { useState } from 'react';
import { 
  X, 
  Send, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Wallet 
} from 'lucide-react';
import { TokenAsset } from '../types';
import { UNISWAP_V3_ADDRESSES } from '../data/tokenData';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: TokenAsset[];
  onSendSuccess: (tokenSymbol: string, amount: number, recipient: string, txHash: string) => void;
}

export const SendModal: React.FC<SendModalProps> = ({
  isOpen,
  onClose,
  tokens,
  onSendSuccess
}) => {
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string>('USDC');
  const [recipient, setRecipient] = useState<string>('0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2');
  const [sendAmount, setSendAmount] = useState<string>('25');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentToken = tokens.find(t => t.symbol === selectedTokenSymbol) || tokens[0];
  const maxBalance = currentToken?.balance || 0;
  const numAmount = parseFloat(sendAmount) || 0;

  const handleMax = () => {
    setSendAmount(maxBalance.toString());
  };

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) {
      setErrorMsg('Please enter a recipient 0x address or mobile number.');
      return;
    }
    if (numAmount <= 0 || numAmount > maxBalance) {
      setErrorMsg(`Amount must be between 0.0001 and your balance (${maxBalance} ${currentToken.symbol}).`);
      return;
    }

    setErrorMsg(null);
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      const generatedHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setTxHash(generatedHash);
      onSendSuccess(currentToken.symbol, numAmount, recipient, generatedHash);
      setTimeout(() => {
        setTxHash(null);
        onClose();
      }, 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-scale-up my-8">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Send Tokens & Shares</h2>
              <p className="text-xs text-slate-500">ERC-20 transfer on Base L2 / Base Sepolia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {txHash ? (
          <div className="my-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Transaction Confirmed!</h3>
            <p className="text-xs text-slate-600">
              Successfully sent {numAmount} {currentToken.symbol} to {recipient.slice(0, 10)}...
            </p>
            <a
              href={`${UNISWAP_V3_ADDRESSES.EXPLORER_URL}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:underline"
            >
              <span>View on BaseScan: {txHash.slice(0, 12)}...</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <form onSubmit={handleSendSubmit} className="space-y-4 my-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Select Asset */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Asset to Send</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {tokens.map((token) => (
                  <button
                    key={token.symbol}
                    type="button"
                    onClick={() => setSelectedTokenSymbol(token.symbol)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedTokenSymbol === token.symbol
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span className="text-base">{token.icon || '🪙'}</span>
                      <span className="font-bold text-xs text-slate-900">{token.symbol}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 truncate">
                      Bal: {token.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Address */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">Recipient Address</label>
                <button
                  type="button"
                  onClick={() => setRecipient('0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24')}
                  className="text-[10px] text-blue-600 hover:underline font-semibold"
                >
                  Fill Sample
                </button>
              </div>
              <input
                type="text"
                placeholder="0x... or ENS or +263 phone number"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Amount */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">Amount to Transfer</label>
                <div className="text-xs text-slate-500">
                  Available:{' '}
                  <span className="font-bold text-slate-800">
                    {maxBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {currentToken.symbol}
                  </span>{' '}
                  <button
                    type="button"
                    onClick={handleMax}
                    className="text-blue-600 hover:underline font-bold ml-1 text-[11px]"
                  >
                    MAX
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.0001"
                  max={maxBalance}
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="w-full pl-4 pr-16 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-500">
                  {currentToken.symbol}
                </span>
              </div>
            </div>

            {/* Gas & Fee Overview */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Value (USD):</span>
                <span className="font-bold text-slate-900">
                  ${(numAmount * currentToken.priceUSD).toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between">
                <span>Network Gas:</span>
                <span className="font-bold text-emerald-600 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> $0.00 (CDP Paymaster Sponsored)
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isSending ? (
                <span>Broadcasting to Base L2...</span>
              ) : (
                <>
                  <span>Send {numAmount} {currentToken.symbol}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
