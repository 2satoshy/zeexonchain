import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, Bot, User, ArrowRight, Loader2, CheckCircle2, 
  TrendingUp, RefreshCw, ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  ExternalLink, Copy, Check, Zap, AlertCircle, PieChart, Coins, 
  Wallet, Layers, ArrowLeftRight
} from 'lucide-react';
import { ApiService } from '../services/api';
import { 
  AiBrokerActionDetail, AiBrokerActionType, SMEStock, TokenAsset, 
  Transaction 
} from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  actionProposal?: AiBrokerActionDetail;
  executionReceipt?: {
    txHash: string;
    network: string;
    timestamp: string;
    blockNumber?: number;
    gasSponsored: boolean;
  };
  suggestedPrompts?: string[];
  timestamp: string;
}

interface AiAdvisorViewProps {
  portfolioContext?: any;
  stocks?: SMEStock[];
  tokens?: TokenAsset[];
  walletAddress?: string;
  initialPrompt?: string;
  onRefreshData?: () => Promise<void> | void;
  onNavigateToTab?: (tab: string) => void;
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({ 
  portfolioContext, 
  stocks = [], 
  tokens = [],
  walletAddress,
  initialPrompt,
  onRefreshData,
  onNavigateToTab
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      text: `Hello! I am your **ZEEX AI Financial Copilot & Autonomous Broker**, operating under SECZim digital security regulations on Base L2.\n\nI can analyze your portfolio, recommend institutional-grade allocation strategies, and **directly execute trades, swaps, buys, value transfers, and payment requests**.\n\n**Try typing:**\n- *"Buy $50 of Takura Agro using USDC"*\n- *"Buy 20 shares of Nyanga Solar with ZIG"*\n- *"Swap 1,000 ZIG to USDC"*\n- *"Send 20 USDC to +263 77 123 4567"*\n- *"Request 100 ZIG from counterparty"*\n- *"Recommend a strategy to maximize dividend yield with $100 and execute it"*`,
      timestamp: 'Just now',
      suggestedPrompts: [
        'Buy $25 of Takura Agro using USDC',
        'Swap 1,000 ZIG to USDC',
        'Recommend a high-yield dividend strategy',
        'What is my current portfolio health and allocation?'
      ]
    }
  ]);

  const [input, setInput] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [autoExecute, setAutoExecute] = useState(true);
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USDC');
  const [selectedStock, setSelectedStock] = useState<string>('TKRA.zx');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Compute live portfolio metrics
  const totalNetWorthUSD = portfolioContext?.totalBalanceUSD ?? 
    (tokens.length > 0 ? tokens.reduce((s, t) => s + (t.balance * t.priceUSD), 0) : 4260.50);

  const zigToken = tokens.find(t => t.symbol === 'ZIG');
  const zigBalance = zigToken ? zigToken.balance : (portfolioContext?.zigBalance ?? 36933);
  
  const usdcToken = tokens.find(t => t.symbol === 'USDC');
  const usdcBalance = usdcToken ? usdcToken.balance : 1420.50;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || loading) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const response = await ApiService.getAiAdvice(
        promptToSend, 
        {
          ...portfolioContext,
          tokens,
          stocks,
          totalBalanceUSD: totalNetWorthUSD,
          zigBalance
        },
        autoExecute,
        walletAddress
      );

      const assistantMessage: Message = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        text: response.reply,
        actionProposal: response.actionProposal,
        executionReceipt: response.executionReceipt,
        suggestedPrompts: response.suggestedPrompts,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If action executed on server, refresh global state
      if (response.actionProposal?.status === 'EXECUTED' && onRefreshData) {
        onRefreshData();
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ **Error communicating with ZEEX Broker Engine**: ${err.message || 'Please check your connection and try again.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Explicit Execution of a Proposed Action
  const handleExecuteProposal = async (msgId: string, action: AiBrokerActionDetail) => {
    setExecutingActionId(msgId);
    try {
      const res = await ApiService.executeAiAction(action, walletAddress);
      if (res.success) {
        setMessages(prev => prev.map(m => {
          if (m.id === msgId) {
            return {
              ...m,
              actionProposal: res.updatedAction,
              executionReceipt: res.transaction ? {
                txHash: res.transaction.txHash || `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
                network: 'Base Sepolia L2',
                timestamp: 'Just now',
                blockNumber: res.transaction.blockNumber || 18496150,
                gasSponsored: true
              } : undefined,
              text: `${m.text}\n\n---\n✅ **Order Executed Onchain!**\n- **Reference**: \`${res.transaction?.reference || 'ZEEX-SETTLED'}\`\n- **Base L2 Gas**: $0.00 (Sponsored)`
            };
          }
          return m;
        }));

        if (onRefreshData) {
          onRefreshData();
        }
      } else {
        alert(`Execution failed: ${res.message}`);
      }
    } catch (e: any) {
      alert(`Execution error: ${e.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  const strategyPresets = [
    { label: '🎯 Dividend Maximizer (>9% APY)', prompt: 'Recommend and execute a strategy to maximize dividend yield using $100 across Zimbabwean SME stocks.' },
    { label: '🛡️ USD Capital Preservation', prompt: 'Structure a low-risk capital preservation strategy with 70% USDC and 30% Takura Agro.' },
    { label: '⚡ ZIG Gold Reserve Hedge', prompt: 'Analyze my $ZIG holding and hedge 50% into USD-denominated renewable energy shares (NYNG.zx).' },
    { label: '🌾 50/50 Agro & Solar Rebalance', prompt: 'Rebalance my portfolio equally between Takura Agro (TKRA.zx) and Nyanga Solar (NYNG.zx) with $50 total.' }
  ];

  const quickTradeChips = [
    { label: 'Buy $50 TKRA with USDC', prompt: 'Buy $50 of Takura Agro using USDC' },
    { label: 'Buy 20 NYNG with ZIG', prompt: 'Buy 20 shares of Nyanga Solar with ZIG' },
    { label: 'Swap 1,000 ZIG to USDC', prompt: 'Swap 1,000 ZIG for USDC' },
    { label: 'Send 25 USDC', prompt: 'Send 25 USDC to +263 77 123 4567' },
    { label: 'Request 100 ZIG', prompt: 'Request 100 ZIG from partner for export goods' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Copilot Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-2xl relative overflow-hidden border border-purple-500/20">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-10 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>ZEEX AI Copilot • Autonomous Broker Engine</span>
              <span className="bg-purple-500/30 text-purple-200 text-[10px] px-2 py-0.5 rounded-full border border-purple-400/30">Base L2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Intelligent Broker & Financial Advisor</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Type trades, swaps, buys from any currency into Zimbabwean tokenized equities. The Copilot reasons over your portfolio and executes transactions onchain.
            </p>
          </div>

          {/* Quick Portfolio Snapshot & Execution Mode */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            <div className="space-y-0.5">
              <div className="text-[11px] text-slate-300 font-medium">Live Net Worth</div>
              <div className="text-lg font-black text-emerald-400 font-mono">
                ${totalNetWorthUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-300 flex items-center gap-2">
                <span>USDC: ${usdcBalance.toLocaleString()}</span>
                <span>•</span>
                <span>ZIG: {zigBalance.toLocaleString()}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/15 hidden sm:block"></div>

            {/* Auto Execute Toggle */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-purple-200 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Instant Execution
                </span>
                <button
                  type="button"
                  onClick={() => setAutoExecute(!autoExecute)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${autoExecute ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${autoExecute ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <span className="text-[9px] text-slate-400">
                {autoExecute ? 'Trades execute immediately' : 'Prompt for confirmation'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Presets Carousel */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-purple-600" />
            Institutional Portfolio Strategies (1-Click Analysis & Execution):
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {strategyPresets.map((strat, i) => (
            <button
              key={i}
              onClick={() => handleSend(strat.prompt)}
              className="px-3 py-1.5 bg-white hover:bg-purple-50 hover:border-purple-300 border border-slate-200 text-slate-700 hover:text-purple-900 text-xs font-semibold rounded-xl whitespace-nowrap shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>{strat.label}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Terminal Window */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[600px] sm:h-[650px]">
        {/* Terminal Header */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            </div>
            <span className="font-mono text-slate-400 pl-2 text-[11px]">zeex://broker-session/base-sepolia</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              SECZim Escrow
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-mono font-medium">Relay Sponsored ($0 Gas)</span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-3 max-w-[92%] sm:max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white'}`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className="space-y-3 w-full">
                  <div className={`p-4 sm:p-5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                    m.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/90'
                  }`}>
                    {/* Render Text with basic markdown formatting */}
                    <div className="whitespace-pre-line prose-sm prose-slate max-w-none">
                      {m.text}
                    </div>

                    <div className={`text-[10px] mt-2.5 font-mono ${m.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-400 text-left'}`}>
                      {m.timestamp}
                    </div>
                  </div>

                  {/* Render Executable Action Card if present */}
                  {m.actionProposal && (
                    <div className="bg-white rounded-2xl border-2 border-purple-200 p-4 sm:p-5 shadow-md space-y-4">
                      {/* Action Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                            m.actionProposal.type === 'BUY_STOCK' ? 'bg-emerald-100 text-emerald-800' :
                            m.actionProposal.type === 'SELL_STOCK' ? 'bg-amber-100 text-amber-800' :
                            m.actionProposal.type === 'SWAP_TOKENS' ? 'bg-indigo-100 text-indigo-800' :
                            m.actionProposal.type === 'SEND_FUNDS' ? 'bg-blue-100 text-blue-800' :
                            m.actionProposal.type === 'REQUEST_FUNDS' ? 'bg-purple-100 text-purple-800' :
                            'bg-violet-100 text-violet-800'
                          }`}>
                            {m.actionProposal.type === 'BUY_STOCK' && <TrendingUp className="w-3 h-3" />}
                            {m.actionProposal.type === 'SWAP_TOKENS' && <ArrowLeftRight className="w-3 h-3" />}
                            {m.actionProposal.type === 'SEND_FUNDS' && <ArrowUpRight className="w-3 h-3" />}
                            {m.actionProposal.type === 'REQUEST_FUNDS' && <ArrowDownLeft className="w-3 h-3" />}
                            {m.actionProposal.type === 'REBALANCE_PORTFOLIO' && <PieChart className="w-3 h-3" />}
                            {m.actionProposal.type.replace('_', ' ')}
                          </span>
                          <span className="font-bold text-slate-800 text-sm">{m.actionProposal.title}</span>
                        </div>

                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          m.actionProposal.status === 'EXECUTED' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : m.actionProposal.status === 'FAILED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {m.actionProposal.status === 'EXECUTED' ? '✓ Settled on Base L2' : m.actionProposal.status}
                        </span>
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-slate-600 font-medium">
                        {m.actionProposal.summary}
                      </p>

                      {/* Parameter Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                        {m.actionProposal.sourceCurrency && (
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Paying Currency</span>
                            <span className="font-bold text-slate-800 font-mono">
                              {m.actionProposal.sourceAmount?.toLocaleString()} {m.actionProposal.sourceCurrency}
                            </span>
                          </div>
                        )}
                        {m.actionProposal.targetAsset && (
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Target Asset</span>
                            <span className="font-bold text-purple-700 font-mono">
                              {m.actionProposal.targetUnits ? `${m.actionProposal.targetUnits} units of ` : ''}{m.actionProposal.targetAsset}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Estimated Gas</span>
                          <span className="font-bold text-emerald-600 font-mono">$0.00 (Sponsored)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Settlement Rail</span>
                          <span className="font-semibold text-slate-700">Base Sepolia L2</span>
                        </div>
                      </div>

                      {/* Multi-step Rebalance Plan if applicable */}
                      {m.actionProposal.rebalanceSteps && m.actionProposal.rebalanceSteps.length > 0 && (
                        <div className="space-y-1.5 border-t border-slate-100 pt-2">
                          <span className="text-[11px] font-bold text-slate-700">Execution Schedule:</span>
                          <div className="space-y-1">
                            {m.actionProposal.rebalanceSteps.map((step, sIdx) => (
                              <div key={sIdx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="font-medium text-slate-700">{step.description}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                                  {step.status === 'COMPLETED' ? '✓ Completed' : 'Pending Allocation'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Payment Link for Requests */}
                      {m.actionProposal.paymentLink && (
                        <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between gap-2">
                          <span className="text-xs text-purple-900 font-mono truncate">{m.actionProposal.paymentLink}</span>
                          <button
                            onClick={() => handleCopy(m.actionProposal!.paymentLink!, 'paylink')}
                            className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                          >
                            {copiedHash === 'paylink' ? 'Copied!' : 'Copy Link'}
                          </button>
                        </div>
                      )}

                      {/* Execution Actions or Receipt */}
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                        {m.actionProposal.status === 'PROPOSED' ? (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              disabled={executingActionId === m.id}
                              onClick={() => handleExecuteProposal(m.id, m.actionProposal!)}
                              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              {executingActionId === m.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Executing on Base L2...</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                                  <span>⚡ Execute Order on Base L2</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : m.actionProposal.status === 'EXECUTED' ? (
                          <div className="flex flex-wrap items-center gap-3 w-full text-xs">
                            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Order Settled Onchain</span>
                            </div>

                            {m.actionProposal.txHash && (
                              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                <span className="font-mono text-slate-600 text-[11px]">
                                  {m.actionProposal.txHash.slice(0, 10)}...{m.actionProposal.txHash.slice(-8)}
                                </span>
                                <button
                                  onClick={() => handleCopy(m.actionProposal!.txHash!, m.id)}
                                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                  title="Copy tx hash"
                                >
                                  {copiedHash === m.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <a
                                  href={`https://sepolia.basescan.org/tx/${m.actionProposal.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-800"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-rose-600 text-xs font-medium flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Execution failed: {m.actionProposal.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Suggested Next Actions */}
                  {m.suggestedPrompts && m.suggestedPrompts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestedPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(p)}
                          className="px-2.5 py-1 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-600 hover:text-purple-800 rounded-lg text-[11px] font-medium transition-all cursor-pointer shadow-2xs"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-700 font-bold block">ZEEX Broker is processing order...</span>
                  <span className="text-[10px] text-slate-400">Verifying SECZim custody rules & Base liquidity pool routing</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Helper Chips Bar */}
        <div className="px-4 py-2 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-500">Quick Trade:</span>
            {quickTradeChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.prompt)}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium whitespace-nowrap cursor-pointer shadow-2xs transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center space-x-1 text-[11px] text-slate-400 shrink-0">
            <span>Fast shortcuts:</span>
            <button
              onClick={() => setInput(`Buy $50 ${selectedStock} with ${selectedCurrency}`)}
              className="px-1.5 py-0.5 bg-slate-200 rounded font-mono text-[10px] hover:bg-slate-300 text-slate-700 cursor-pointer"
            >
              +Buy {selectedStock}
            </button>
            <button
              onClick={() => setInput(`Swap 500 ZIG for USDC`)}
              className="px-1.5 py-0.5 bg-slate-200 rounded font-mono text-[10px] hover:bg-slate-300 text-slate-700 cursor-pointer"
            >
              +Swap ZIG
            </button>
          </div>
        </div>

        {/* Trade Command Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Type trade, swap, buy, send, request, or ask for portfolio advice (e.g. 'Buy $50 TKRA with USDC')..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all pr-24"
              />

              {/* Currency & Stock Fast Pills inside input bar */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer"
                  title="Source Currency"
                >
                  <option value="USDC">USDC</option>
                  <option value="ZIG">ZIG</option>
                  <option value="ETH">ETH</option>
                  <option value="USD">USD</option>
                </select>

                <select
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-900 text-[10px] font-bold rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer"
                  title="Target Stock"
                >
                  <option value="TKRA.zx">TKRA (9.8%)</option>
                  <option value="NYNG.zx">NYNG (8.4%)</option>
                  <option value="TEA">TEA (7.2%)</option>
                  <option value="MUKURU">MUKURU (6.5%)</option>
                  <option value="SIMBA">SIMBA</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-2xl shadow-md transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
              title="Send to ZEEX Broker"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Powered by Gemini & SECZim Custody Rulebook • Base Sepolia</span>
            <span className="font-mono text-slate-500">
              {autoExecute ? '⚡ Auto-Execution Mode Active' : '📋 Review Confirmation Mode'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
