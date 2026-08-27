import React, { useState } from 'react';
import { X, Terminal, CheckCircle2, Play, Copy, ExternalLink, Database, ShieldCheck, Cpu, ArrowRight, RefreshCw } from 'lucide-react';
import { ApiService } from '../services/api';

interface ApiExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EndpointDef {
  category: string;
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  description: string;
  sampleBody?: any;
  action: () => Promise<any>;
}

export const ApiExplorerModal: React.FC<ApiExplorerModalProps> = ({ isOpen, onClose }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef | null>(null);
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const endpoints: EndpointDef[] = [
    // Health & System
    {
      category: 'System & Oracles',
      method: 'GET',
      path: '/api/health',
      description: 'Check API server health, active network status, and registered endpoints',
      action: () => ApiService.getHealth()
    },
    {
      category: 'System & Oracles',
      method: 'GET',
      path: '/api/seczim/status',
      description: 'SECZim regulatory compliance status, legal custodian, and trust certificates',
      action: () => ApiService.getSecZimStatus()
    },
    {
      category: 'System & Oracles',
      method: 'GET',
      path: '/api/oracles/rates',
      description: 'Live multi-asset oracle rates (ZIG/USD, Gold/Oz, ETH, USDC)',
      action: () => ApiService.getOracleRates()
    },
    {
      category: 'System & Oracles',
      method: 'GET',
      path: '/api/zig/reserves',
      description: 'Zimbabwe Gold (ZIG) physical vault gold reserves and backing ratio',
      action: () => ApiService.getZigReserves()
    },
    {
      category: 'System & Oracles',
      method: 'GET',
      path: '/api/indexer/stats',
      description: 'Base L2 rollup indexer statistics, gas sponsored metrics, and contracts',
      action: () => ApiService.getIndexerStats()
    },

    // Stocks
    {
      category: 'Stocks & Equities',
      method: 'GET',
      path: '/api/stocks',
      description: 'List all verified Zimbabwean SME tokenized equity listings',
      action: () => ApiService.getStocks()
    },
    {
      category: 'Stocks & Equities',
      method: 'GET',
      path: '/api/stocks/sme-1',
      description: 'Retrieve single stock detail by ID (Takura Agro - TKRA.zx)',
      action: () => ApiService.getStockById('sme-1')
    },
    {
      category: 'Stocks & Equities',
      method: 'POST',
      path: '/api/stocks/buy',
      description: 'Execute instant purchase of fractional equity shares on Base L2',
      sampleBody: { stockId: 'sme-1', usdAmount: 50, units: 39.06 },
      action: () => ApiService.buyShares('sme-1', 50, 39.06)
    },

    // DEX
    {
      category: 'DEX & Trading',
      method: 'GET',
      path: '/api/dex/tokens',
      description: 'List all tradable tokens, security tokens, and pool prices',
      action: () => ApiService.getTokens()
    },
    {
      category: 'DEX & Trading',
      method: 'POST',
      path: '/api/dex/quote',
      description: 'Request real-time quote for swapping ZIG -> USDC with fee simulation',
      sampleBody: { fromSymbol: 'ZIG', toSymbol: 'USDC', amountIn: 5000 },
      action: () => ApiService.getDexQuote('ZIG', 'USDC', 5000)
    },
    {
      category: 'DEX & Trading',
      method: 'GET',
      path: '/api/dex/orders',
      description: 'Fetch active limit and market orderbook state',
      action: () => ApiService.getOrders()
    },

    // Invoices
    {
      category: 'InvoiceX Factoring',
      method: 'GET',
      path: '/api/invoices',
      description: 'List all SME receivables and factoring auctions',
      action: () => ApiService.getInvoices()
    },

    // Loans
    {
      category: 'DebtBridge Loans',
      method: 'GET',
      path: '/api/loans',
      description: 'List active securities-backed credit lines (SBLOC)',
      action: () => ApiService.getLoans()
    },

    // Wallet
    {
      category: 'Wallet & Portfolio',
      method: 'GET',
      path: '/api/portfolio',
      description: 'Calculate real-time user net worth, cash balances, and equity holdings',
      action: () => ApiService.getPortfolio()
    },
    {
      category: 'Wallet & Portfolio',
      method: 'GET',
      path: '/api/transactions',
      description: 'Fetch chronologically indexed blockchain transactions and receipts',
      action: () => ApiService.getTransactions(10)
    },

    // Social
    {
      category: 'Social & News',
      method: 'GET',
      path: '/api/social/posts',
      description: 'Get verified trader feed and community trade signals',
      action: () => ApiService.getSocialPosts()
    },
    {
      category: 'Social & News',
      method: 'GET',
      path: '/api/market-news',
      description: 'Fetch grounded ZSE financial headlines from Gemini and Google Search',
      action: () => ApiService.getMarketNews()
    }
  ];

  const handleRunEndpoint = async (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setLoading(true);
    setResponseOutput(null);
    try {
      const data = await ep.action();
      setResponseOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseOutput(JSON.stringify({ error: err.message || 'Request failed' }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!responseOutput) return;
    navigator.clipboard.writeText(responseOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = Array.from(new Set(endpoints.map(e => e.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>ZEEX Onchain REST API Console</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">v2.0 Live</span>
              </h2>
              <p className="text-xs text-slate-400">
                Interactive API Explorer for Developers, Custodians & Institutional Nodes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Endpoint List Sidebar */}
          <div className="md:col-span-5 border-r border-slate-800 p-4 overflow-y-auto space-y-5 bg-slate-900/50">
            {categories.map(cat => (
              <div key={cat} className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
                  <span>{cat}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {endpoints.filter(e => e.category === cat).length} endpoints
                  </span>
                </div>
                <div className="space-y-1">
                  {endpoints.filter(e => e.category === cat).map((ep, idx) => {
                    const isSelected = selectedEndpoint?.path === ep.path && selectedEndpoint?.method === ep.method;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleRunEndpoint(ep)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between group border ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-slate-800/40 hover:bg-slate-800 border-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                            ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {ep.method}
                          </span>
                          <span className="font-mono truncate font-medium">{ep.path}</span>
                        </div>
                        <Play className={`w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isSelected ? 'opacity-100 text-emerald-400' : 'text-slate-400'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Response / Inspector Panel */}
          <div className="md:col-span-7 flex flex-col bg-slate-950 p-5 overflow-hidden">
            {selectedEndpoint ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Active Endpoint Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      selectedEndpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                      selectedEndpoint.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedEndpoint.method}
                    </span>
                    <span className="font-mono text-sm font-semibold text-white">{selectedEndpoint.path}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRunEndpoint(selectedEndpoint)}
                      disabled={loading}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      <span>Send Request</span>
                    </button>
                    {responseOutput && (
                      <button
                        onClick={handleCopy}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                      >
                        {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-3">
                  {selectedEndpoint.description}
                </p>

                {/* Sample Body if POST */}
                {selectedEndpoint.sampleBody && (
                  <div className="mb-3">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Payload Request Body</div>
                    <pre className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto">
                      {JSON.stringify(selectedEndpoint.sampleBody, null, 2)}
                    </pre>
                  </div>
                )}

                {/* JSON Response Window */}
                <div className="flex-1 flex flex-col min-h-0 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-400">Response Body (application/json)</span>
                    <span className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>200 OK</span>
                    </span>
                  </div>
                  <div className="flex-1 p-4 overflow-auto font-mono text-xs text-emerald-300 leading-relaxed">
                    {loading ? (
                      <div className="h-full flex items-center justify-center text-slate-400 space-x-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                        <span>Dispatching request to ZEEX server...</span>
                      </div>
                    ) : responseOutput ? (
                      <pre>{responseOutput}</pre>
                    ) : (
                      <div className="text-slate-400 italic">Click "Send Request" to execute this API endpoint.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <Database className="w-12 h-12 text-slate-700 mb-3" />
                <h3 className="text-base font-semibold text-slate-300">Select an API Endpoint</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Choose an endpoint from the left menu to inspect schemas, execute live requests, and verify backend database state.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>SECZim Compliant</span>
            </span>
            <span>•</span>
            <span>Base Sepolia L2 (84532)</span>
            <span>•</span>
            <span>Zero Gas Relay Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
