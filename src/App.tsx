import React, { useState, useEffect } from 'react';
import { TabType, SMEStock, InvoiceItem, DebtBridgeLoan, Transaction, TokenAsset, DEXSwapParams, TradeOrder } from './types';
import { INITIAL_STOCKS, INITIAL_INVOICES, INITIAL_LOANS, INITIAL_TRANSACTIONS, generateStockPriceHistory } from './data/mockData';
import { INITIAL_TOKENS, UNISWAP_V3_ADDRESSES } from './data/tokenData';
import { useRealtimeOnchainBalances } from './hooks/useRealtimeOnchainBalances';
import { useBlockchainIndexer } from './hooks/useBlockchainIndexer';
import { ApiService } from './services/api';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { SharesView } from './components/SharesView';
import { InvoiceXView } from './components/InvoiceXView';
import { DebtBridgeView } from './components/DebtBridgeView';
import { ZigHubView } from './components/ZigHubView';
import { WhatsAppWalletView } from './components/WhatsAppWalletView';
import { AiAdvisorView } from './components/AiAdvisorView';
import { SocialTimelineView } from './components/SocialTimelineView';
import { ProfileView } from './components/ProfileView';
import { StartupListingView } from './components/StartupListingView';
import { TradingSwapView } from './components/TradingSwapView';
import { DepositModal } from './components/DepositModal';
import { SendModal } from './components/SendModal';
import { StockTokenizationModal, StockBurnSuccessParams } from './components/StockTokenizationModal';
import { ApiExplorerModal } from './components/ApiExplorerModal';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import { FloatingMenu } from './components/FloatingMenu';
import { BottomNav } from './components/BottomNav';
import { OnchainLiveStatusBadge } from './components/OnchainLiveStatusBadge';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stocks, setStocks] = useState<SMEStock[]>(INITIAL_STOCKS);
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [loans, setLoans] = useState<DebtBridgeLoan[]>(INITIAL_LOANS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [tokens, setTokens] = useState<TokenAsset[]>(INITIAL_TOKENS);
  
  // Real-time Onchain Wagmi hook reading ETH & ERC20 balances directly from Base Sepolia
  const {
    activeAddress,
    blockNumber,
    tokens: liveOnchainTokens,
    totalOnchainUSD,
    isLoading: isOnchainLoading,
    isRefetching: isOnchainRefetching,
    refetchAll: refetchOnchainBalances,
    source: onchainSource,
  } = useRealtimeOnchainBalances(tokens);

  // Blockchain Indexer instance for recording onchain swaps, tokenizations & burns
  const { recordSwapEvent, recordTokenizationEvent, recordBurnEvent } = useBlockchainIndexer();

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isTokenizeOpen, setIsTokenizeOpen] = useState(false);
  const [isApiExplorerOpen, setIsApiExplorerOpen] = useState(false);
  const [isConnectWalletOpen, setIsConnectWalletOpen] = useState(false);
  const [connectWalletDefaultTab, setConnectWalletDefaultTab] = useState<'base' | 'metamask' | 'coinbase'>('base');
  const [selectedDepositToken, setSelectedDepositToken] = useState<TokenAsset | undefined>(undefined);
  const [selectedSendToken, setSelectedSendToken] = useState<TokenAsset | undefined>(undefined);

  const handleOpenConnectWallet = (tab: 'base' | 'metamask' | 'coinbase' = 'base') => {
    setConnectWalletDefaultTab(tab);
    setIsConnectWalletOpen(true);
  };

  // Initial fetch from backend REST API
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [stocksRes, invoicesRes, loansRes, txsRes, tokensRes] = await Promise.allSettled([
          ApiService.getStocks(),
          ApiService.getInvoices(),
          ApiService.getLoans(),
          ApiService.getTransactions(50),
          ApiService.getTokens()
        ]);

        if (stocksRes.status === 'fulfilled' && stocksRes.value.data) {
          setStocks(stocksRes.value.data);
        }
        if (invoicesRes.status === 'fulfilled' && invoicesRes.value.data) {
          setInvoices(invoicesRes.value.data);
        }
        if (loansRes.status === 'fulfilled' && loansRes.value.data) {
          setLoans(loansRes.value.data);
        }
        if (txsRes.status === 'fulfilled' && txsRes.value.data) {
          setTransactions(txsRes.value.data);
        }
        if (tokensRes.status === 'fulfilled' && tokensRes.value.data) {
          setTokens(tokensRes.value.data);
        }
      } catch (err) {
        console.warn('Using local fallback state, API server initial load:', err);
      }
    }
    loadBackendData();
  }, []);

  // Active token balances (reflects live onchain data)
  const displayTokens = liveOnchainTokens.length > 0 ? liveOnchainTokens : tokens;
  const totalBalanceUSD = totalOnchainUSD || displayTokens.reduce((sum, t) => sum + (t.balance * t.priceUSD), 0);
  const zigToken = displayTokens.find(t => t.symbol === 'ZIG');
  const zigBalance = zigToken ? zigToken.balance : 36933.00;

  // Open Deposit Modal with optional preselected token
  const handleOpenDeposit = (token?: TokenAsset) => {
    setSelectedDepositToken(token);
    setIsDepositOpen(true);
  };

  // Open Send Modal with optional preselected token
  const handleOpenSend = (token?: TokenAsset) => {
    setSelectedSendToken(token);
    setIsSendOpen(true);
  };

  // Open Tokenize Modal
  const handleOpenTokenize = () => {
    setIsTokenizeOpen(true);
  };

  // Handle Deposit Confirmation
  const handleDepositConfirm = (amount: number, tokenSymbol: string, rail: string) => {
    setTokens(prev => prev.map(t => {
      if (t.symbol === tokenSymbol) {
        return { ...t, balance: t.balance + amount };
      }
      return t;
    }));

    const token = tokens.find(t => t.symbol === tokenSymbol);
    const usdVal = amount * (token ? token.priceUSD : 1);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'DEPOSIT',
      title: `Deposited ${amount.toLocaleString()} ${tokenSymbol} via ${rail}`,
      amountUSD: usdVal,
      amountZIG: usdVal * 26,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `BASE-DEP-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);

    // Send to Backend API
    ApiService.deposit(amount, tokenSymbol, rail).catch(e => console.warn('API deposit error:', e));
  };

  // Handle Send Confirmation
  const handleSendConfirm = (amount: number, tokenSymbol: string, recipient: string) => {
    setTokens(prev => prev.map(t => {
      if (t.symbol === tokenSymbol) {
        return { ...t, balance: Math.max(0, t.balance - amount) };
      }
      return t;
    }));

    const token = tokens.find(t => t.symbol === tokenSymbol);
    const usdVal = amount * (token ? token.priceUSD : 1);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'TRANSFER',
      title: `Sent ${amount.toLocaleString()} ${tokenSymbol} to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
      amountUSD: usdVal,
      amountZIG: usdVal * 26,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `BASE-SEND-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);

    // Send to Backend API
    ApiService.send(amount, tokenSymbol, recipient).catch(e => console.warn('API send error:', e));
  };

  // Handle DEX Swap
  const handleSwapTokens = (params: DEXSwapParams) => {
    const inputToken = tokens.find(t => t.symbol === params.tokenIn);
    const outputToken = tokens.find(t => t.symbol === params.tokenOut);

    if (!inputToken || !outputToken) return;

    // Calculate exchange rate
    const inputValueUSD = params.amountIn * inputToken.priceUSD;
    const outputAmount = inputValueUSD / outputToken.priceUSD;

    setTokens(prev => prev.map(t => {
      if (t.symbol === params.tokenIn) {
        return { ...t, balance: Math.max(0, t.balance - params.amountIn) };
      }
      if (t.symbol === params.tokenOut) {
        return { ...t, balance: t.balance + outputAmount };
      }
      return t;
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'TRANSFER',
      title: `Uniswap V3: Swapped ${params.amountIn.toLocaleString()} ${params.tokenIn} for ${outputAmount.toFixed(4)} ${params.tokenOut}`,
      amountUSD: inputValueUSD,
      amountZIG: inputValueUSD * 26,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `UNI-V3-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);

    // Record into onchain indexer and backend API
    const swapTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    recordSwapEvent({
      txHash: swapTxHash,
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      amountOut: outputAmount,
      amountUSD: inputValueUSD,
      feeTier: params.feeTier ? `${(params.feeTier / 10000).toFixed(2)}% (${params.feeTier} bps)` : '0.30% (3000 bps)'
    });

    ApiService.executeSwap(params.tokenIn.symbol, params.tokenOut.symbol, params.amountIn).catch(e => console.warn('API swap error:', e));
  };

  // Handle Limit / Market Order Execution
  const handleCreateOrder = (order: TradeOrder) => {
    const totalUSD = order.amount * order.price;
    const baseToken = tokens.find(t => t.symbol === order.pair.split('/')[0]);
    const quoteToken = tokens.find(t => t.symbol === order.pair.split('/')[1] || 'USDC');

    if (order.side === 'BUY') {
      // Deduct quote currency, add base currency
      setTokens(prev => prev.map(t => {
        if (quoteToken && t.symbol === quoteToken.symbol) {
          return { ...t, balance: Math.max(0, t.balance - totalUSD) };
        }
        if (baseToken && t.symbol === baseToken.symbol) {
          return { ...t, balance: t.balance + order.amount };
        }
        return t;
      }));
    } else {
      // Deduct base currency, add quote currency
      setTokens(prev => prev.map(t => {
        if (baseToken && t.symbol === baseToken.symbol) {
          return { ...t, balance: Math.max(0, t.balance - order.amount) };
        }
        if (quoteToken && t.symbol === quoteToken.symbol) {
          return { ...t, balance: t.balance + totalUSD };
        }
        return t;
      }));
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: order.side === 'BUY' ? 'BUY' : 'SELL',
      title: `DEX Spot: ${order.side} ${order.amount.toLocaleString()} ${order.pair} @ $${order.price.toFixed(3)}`,
      amountUSD: totalUSD,
      amountZIG: totalUSD * 26,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `SPOT-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);

    ApiService.createOrder({
      pair: order.pair,
      side: order.side,
      type: order.type,
      price: order.price,
      amount: order.amount,
      totalUSD: totalUSD
    }).catch(e => console.warn('API order create error:', e));
  };

  // Handle Tokenize SME / Stock Deployment
  const handleDeployStockToken = (newToken: TokenAsset, initialLiquidityUSD: number) => {
    setTokens(prev => [newToken, ...prev]);

    // Also register in SME Stocks catalogue
    const newStock: SMEStock = {
      id: `stock-${Date.now()}`,
      name: newToken.name,
      ticker: newToken.symbol,
      sector: newToken.companyDetails?.sector || 'Industrial & Agribusiness',
      marketCap: `$${(((newToken.totalSupply || 1000000) * newToken.priceUSD) / 1000000).toFixed(1)}M`,
      priceUSD: newToken.priceUSD,
      priceZIG: newToken.priceUSD * 26,
      dividendYield: 7.5,
      change24h: 0.0,
      fractionalUnitsAvailable: 1000000,
      backingTrust: 'ZSE Debtbridge Trust #SECZ-2026',
      description: newToken.companyDetails?.description || 'Onchain tokenized security issued via SECZim compliant smart contracts on Base L2.',
      riskRating: 'Growth',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
      valuationUSD: (newToken.totalSupply || 1000000) * newToken.priceUSD,
      sharePriceUSD: newToken.priceUSD,
      sharePriceZIG: newToken.priceUSD * 26,
      fractionalPriceUSD: newToken.priceUSD / 10,
      annualRevenueUSD: 1200000,
      peRatio: 9.8,
      verifiedSecZim: true,
      tokenAddress: newToken.address,
      tags: ['Tokenized', 'ERC-3643', 'Base L2', 'Uniswap V3'],
      priceHistory: generateStockPriceHistory(newToken.priceUSD)
    };
    setStocks(prev => [newStock, ...prev]);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'BUY',
      title: `Tokenized & Deployed ${newToken.symbol} with $${initialLiquidityUSD.toLocaleString()} Uniswap V3 Pool`,
      amountUSD: initialLiquidityUSD,
      amountZIG: initialLiquidityUSD * 26,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `B20-DEPLOY-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);

    // Record into onchain indexer and backend API
    const deployTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    recordTokenizationEvent({
      txHash: deployTxHash,
      ticker: newToken.symbol,
      companyName: newToken.name,
      sharesMinted: newToken.totalSupply || 1000000,
      parValueUSD: newToken.priceUSD,
      valuationUSD: (newToken.totalSupply || 1000000) * newToken.priceUSD,
      contractAddress: newToken.address,
    });

    ApiService.tokenizeStock({
      name: newToken.name,
      ticker: newToken.symbol,
      sector: newToken.companyDetails?.sector || 'Industrial & Agribusiness',
      description: newToken.companyDetails?.description || '',
      valuationUSD: (newToken.totalSupply || 1000000) * newToken.priceUSD,
      priceUSD: newToken.priceUSD,
      totalShares: newToken.totalSupply || 1000000,
      dividendYield: 7.5
    }).catch(e => console.warn('API tokenize error:', e));
  };

  // Handle Regulated Stock Burn / Supply Reduction / Full Delisting
  const handleBurnStockToken = (params: StockBurnSuccessParams) => {
    // 1. Update stock in catalogue
    setStocks(prev => prev.map(stock => {
      if (stock.ticker.toUpperCase() === params.stockTicker.toUpperCase()) {
        if (params.isFullDelisting) {
          return {
            ...stock,
            fractionalUnitsAvailable: 0,
            marketCap: '$0.00 (Delisted)',
            description: `[DELISTED by SECZim Order ${params.filingId}] ${stock.description}`,
            riskRating: 'Delisted'
          };
        } else {
          const newUnits = Math.max(0, (stock.fractionalUnitsAvailable || 1000000) - params.burnedShares);
          const newMcapUSD = (newUnits * (stock.priceUSD || 1));
          return {
            ...stock,
            fractionalUnitsAvailable: newUnits,
            marketCap: `$${(newMcapUSD / 1000000).toFixed(2)}M`
          };
        }
      }
      return stock;
    }));

    // 2. Update tokens list if user holds any of this token
    setTokens(prev => prev.map(token => {
      if (token.symbol.toUpperCase() === params.stockTicker.toUpperCase()) {
        if (params.isFullDelisting) {
          return {
            ...token,
            balance: 0,
            balanceUSD: 0
          };
        }
      }
      return token;
    }));

    // 3. Record local transaction
    const newTx: Transaction = {
      id: `tx-burn-${Date.now()}`,
      type: 'BURN',
      title: params.isFullDelisting
        ? `Delisted & Burned ${params.burnedShares.toLocaleString()} ${params.stockTicker} Shares (SECZim ${params.filingId})`
        : `Supply Reduction: Burned ${params.burnedShares.toLocaleString()} ${params.stockTicker} Shares`,
      amountUSD: params.totalPayoutUSD || (params.burnedShares * (params.payoutPerShareUSD || 0)),
      amountZIG: (params.totalPayoutUSD || 0) * 26,
      timestamp: 'Just now',
      status: 'Completed',
      reference: params.filingId || `BURN-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);

    // 4. Record into live blockchain indexer
    recordBurnEvent({
      txHash: params.txHash,
      ticker: params.stockTicker,
      companyName: params.stockName,
      burnedShares: params.burnedShares,
      remainingShares: params.remainingShares,
      isFullDelisting: params.isFullDelisting,
      reason: params.reason,
      seczimFilingId: params.filingId,
      payoutPerShareUSD: params.payoutPerShareUSD,
      totalRedemptionPayoutUSD: params.totalPayoutUSD
    });

    ApiService.burnStock(params.stockTicker, {
      sharesToBurn: params.burnedShares,
      isFullDelisting: params.isFullDelisting,
      reason: params.reason,
      filingId: params.filingId
    }).catch(e => console.warn('API burn error:', e));
  };

  // Handle Stock Catalogue Listing
  const handleAddNewStock = (newStock: SMEStock) => {
    setStocks(prev => {
      if (prev.some(s => s.ticker === newStock.ticker)) return prev;
      return [newStock, ...prev];
    });

    // Also create a token asset for it
    const tokenAsset: TokenAsset = {
      address: newStock.tokenAddress || `0x${Math.random().toString(16).slice(2, 42)}`,
      symbol: newStock.ticker,
      name: newStock.name,
      decimals: 18,
      balance: 1000,
      balanceUSD: 1000 * newStock.priceUSD,
      priceUSD: newStock.priceUSD,
      priceZIG: newStock.priceZIG,
      change24h: newStock.change24h,
      icon: '🏢',
      isStockToken: true,
      companyDetails: {
        registrationNumber: 'SECZ-REG-2026',
        jurisdiction: 'Zimbabwe (SECZim / ZSE)',
        totalShares: 1000000,
        parValueUSD: newStock.priceUSD,
        sector: newStock.sector,
        description: newStock.description
      }
    };
    setTokens(prev => [tokenAsset, ...prev]);
  };

  // Handle Buying Shares from Shares View
  const handleBuyShares = (stock: SMEStock, usdAmount: number, units: number) => {
    // Deduct USDC
    setTokens(prev => prev.map(t => {
      if (t.symbol === 'USDC') {
        return { ...t, balance: Math.max(0, t.balance - usdAmount) };
      }
      if (t.symbol === stock.ticker) {
        return { ...t, balance: t.balance + units };
      }
      return t;
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'BUY',
      title: `Bought ${units.toLocaleString()} units of ${stock.ticker}`,
      amountUSD: usdAmount,
      amountZIG: usdAmount * 26,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `BASE-TX-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);

    ApiService.buyStockShares(stock.ticker, units, usdAmount).catch(e => console.warn('API buy stock error:', e));
  };

  // Handle Invoice Yield
  const handleFundInvoice = (invoiceId: string, amountUSD: number) => {
    setTokens(prev => prev.map(t => {
      if (t.symbol === 'USDC') {
        return { ...t, balance: Math.max(0, t.balance - amountUSD) };
      }
      return t;
    }));

    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const newFunded = Math.min(100, inv.fundedPercentage + Math.round((amountUSD / inv.amountUSD) * 100));
        return {
          ...inv,
          fundedPercentage: newFunded,
          status: newFunded >= 100 ? 'Active' : inv.status
        };
      }
      return inv;
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'INVOICE_YIELD',
      title: `Funded InvoiceX Receivable ($${amountUSD})`,
      amountUSD: amountUSD,
      amountZIG: amountUSD * 26,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `INVX-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);

    ApiService.fundInvoice(invoiceId, amountUSD).catch(e => console.warn('API fund invoice error:', e));
  };

  // Handle DebtBridge Loan
  const handleRequestLoan = (collateral: string, amount: number) => {
    setTokens(prev => prev.map(t => {
      if (t.symbol === 'USDC') {
        return { ...t, balance: t.balance + amount };
      }
      return t;
    }));

    const newLoan: DebtBridgeLoan = {
      id: `loan-${Date.now()}`,
      borrowerName: 'Tendai Moyo (Personal SBLOC)',
      collateralType: collateral,
      collateralValueUSD: amount * 1.6,
      loanAmountUSD: amount,
      interestRate: 12.5,
      durationMonths: 6,
      status: 'Active',
      ltvRatio: 62.5
    };
    setLoans(prev => [newLoan, ...prev]);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'DEPOSIT',
      title: `DebtBridge SBLOC Credit Line Issued ($${amount})`,
      amountUSD: amount,
      amountZIG: amount * 26,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `DEBT-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);

    ApiService.requestLoan({
      borrowerName: 'Tendai Moyo (Personal SBLOC)',
      collateralType: collateral,
      collateralValueUSD: amount * 1.6,
      loanAmountUSD: amount,
      interestRate: 12.5,
      durationMonths: 6
    }).catch(e => console.warn('API loan request error:', e));
  };

  // Handle $ZIG Swap in ZigHub
  const handleSwapZig = (direction: 'USDC_TO_ZIG' | 'ZIG_TO_USDC', amount: number) => {
    if (direction === 'USDC_TO_ZIG') {
      setTokens(prev => prev.map(t => {
        if (t.symbol === 'USDC') return { ...t, balance: Math.max(0, t.balance - amount) };
        if (t.symbol === 'ZIG') return { ...t, balance: t.balance + (amount * 26) };
        return t;
      }));
    } else {
      setTokens(prev => prev.map(t => {
        if (t.symbol === 'ZIG') return { ...t, balance: Math.max(0, t.balance - amount) };
        if (t.symbol === 'USDC') return { ...t, balance: t.balance + (amount / 26) };
        return t;
      }));
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'TRANSFER',
      title: direction === 'USDC_TO_ZIG' ? `Swapped $${amount} USDC for $ZIG` : `Swapped ${amount} $ZIG for USDC`,
      amountUSD: direction === 'USDC_TO_ZIG' ? amount : amount / 26,
      amountZIG: direction === 'USDC_TO_ZIG' ? amount * 26 : amount,
      timestamp: 'Just now',
      status: 'Completed',
      reference: `ZIG-SWAP-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleAddMoney = (amountUSD: number, method: string) => {
    handleDepositConfirm(amountUSD, 'USDC', method);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'deposit') {
      setIsDepositOpen(true);
    } else if (action === 'send') {
      setIsSendOpen(true);
    } else if (action === 'swap') {
      setActiveTab('trading');
    } else if (action === 'tokenize') {
      setIsTokenizeOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 selection:bg-emerald-500 selection:text-white pb-24">
      <Header 
        totalBalanceUSD={totalBalanceUSD} 
        zigBalance={zigBalance} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDeposit={() => handleOpenDeposit()}
        onOpenSend={() => handleOpenSend()}
        onOpenTokenize={() => handleOpenTokenize()}
        onOpenApiExplorer={() => setIsApiExplorerOpen(true)}
        onOpenConnectWallet={handleOpenConnectWallet}
      />

      <div className="hidden md:block">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Top RPC Status Banner on Base Sepolia */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 mb-2">
        <OnchainLiveStatusBadge
          blockNumber={blockNumber}
          isLoading={isOnchainLoading}
          isRefetching={isOnchainRefetching}
          onRefresh={refetchOnchainBalances}
          activeAddress={activeAddress}
          source={onchainSource}
        />
      </div>

      <main className="transition-all animate-fade-in">
        {activeTab === 'dashboard' && (
          <DashboardView 
            stocks={stocks} 
            transactions={transactions} 
            tokens={displayTokens}
            setActiveTab={setActiveTab} 
            onQuickAction={handleQuickAction}
            onOpenDeposit={() => handleOpenDeposit()}
            onOpenSend={() => handleOpenSend()}
            onOpenSwap={() => setActiveTab('trading')}
            onOpenTokenize={() => handleOpenTokenize()}
          />
        )}

        {activeTab === 'trading' && (
          <TradingSwapView 
            tokens={displayTokens}
            onSwap={handleSwapTokens}
            onCreateOrder={handleCreateOrder}
            onOpenTokenize={() => handleOpenTokenize()}
            onOpenDeposit={(t) => handleOpenDeposit(t)}
            onOpenSend={(t) => handleOpenSend(t)}
          />
        )}

        {activeTab === 'shares' && (
          <SharesView 
            stocks={stocks} 
            onBuyShares={handleBuyShares} 
          />
        )}

        {activeTab === 'startupListing' && (
          <StartupListingView 
            onAddStockToListing={handleAddNewStock}
            onNavigateToShares={() => setActiveTab('shares')}
          />
        )}

        {activeTab === 'invoiceX' && (
          <InvoiceXView 
            invoices={invoices} 
            onFundInvoice={handleFundInvoice} 
          />
        )}

        {activeTab === 'debtBridge' && (
          <DebtBridgeView 
            loans={loans} 
            onRequestLoan={handleRequestLoan} 
          />
        )}

        {activeTab === 'zig' && (
          <ZigHubView 
            zigBalance={zigBalance} 
            onSwapZig={handleSwapZig} 
          />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppWalletView />
        )}

        {activeTab === 'aiAdvisor' && (
          <AiAdvisorView 
            portfolioContext={{ totalBalanceUSD, zigBalance, stocksCount: stocks.length }} 
          />
        )}

        {activeTab === 'social' && (
          <SocialTimelineView 
            onCopyTrade={(ticker, amount) => {
              setActiveTab('trading');
            }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView 
            transactions={transactions}
            totalBalanceUSD={totalBalanceUSD}
            zigBalance={zigBalance}
            tokens={displayTokens}
            onAddMoney={handleAddMoney}
            onNavigateToStartupListing={() => handleOpenTokenize()}
            onOpenDeposit={() => handleOpenDeposit()}
            onOpenSend={() => handleOpenSend()}
            onOpenSwap={() => setActiveTab('trading')}
            onOpenTokenize={() => handleOpenTokenize()}
            onOpenConnectWallet={handleOpenConnectWallet}
          />
        )}
      </main>

      {/* Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        tokens={displayTokens}
        selectedToken={selectedDepositToken}
        onDepositSuccess={handleDepositConfirm}
      />

      <SendModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        tokens={displayTokens}
        selectedToken={selectedSendToken}
        onSendSuccess={handleSendConfirm}
      />

      <StockTokenizationModal
        isOpen={isTokenizeOpen}
        onClose={() => setIsTokenizeOpen(false)}
        onDeploySuccess={handleDeployStockToken}
        onBurnSuccess={handleBurnStockToken}
        stocks={stocks}
        tokens={displayTokens}
      />

      <ApiExplorerModal
        isOpen={isApiExplorerOpen}
        onClose={() => setIsApiExplorerOpen(false)}
      />

      <ConnectWalletModal
        isOpen={isConnectWalletOpen}
        onClose={() => setIsConnectWalletOpen(false)}
        defaultTab={connectWalletDefaultTab}
      />

      {/* Floating Vertical Menu & Bottom Nav */}
      <FloatingMenu activeTab={activeTab} setActiveTab={setActiveTab} />
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 pb-16 border-t border-slate-200 text-center text-xs text-slate-500 hidden md:block">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-bold text-slate-800">ZEEX Onchain</span> — Zimbabwe Entrepreneurship Exchange (ZEEX). Regulated by SECZim inside ZSE Holdings.
          </div>
          <div className="flex space-x-4 text-slate-500">
            <span>Base Sepolia L2</span>
            <span>•</span>
            <span>Uniswap V3 Liquidity</span>
            <span>•</span>
            <span>Coinbase Smart Wallets</span>
            <span>•</span>
            <span>ERC-3643 / B20 Security Tokens</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
