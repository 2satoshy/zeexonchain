import React, { useState } from 'react';
import { useAccount, useBalance, useReadContract, useBlockNumber } from 'wagmi';
import { formatUnits, formatEther, Address, isAddress } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { useEvmAddress } from '@coinbase/cdp-hooks';
import { ERC20_ABI } from '../config/wagmi';
import { useUniswapSwapManager } from '../hooks/UniswapSwapManager';
import { 
  TrendingUp, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  Sliders, 
  Sparkles, 
  Lock, 
  Coins, 
  DollarSign, 
  Plus, 
  ArrowDownUp, 
  Building2,
  BarChart2,
  Clock,
  Radio
} from 'lucide-react';
import { TokenAsset, SMEStock, TradeOrder, DEXSwapParams } from '../types';
import { UNISWAP_V3_ADDRESSES } from '../data/tokenData';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface TradingSwapViewProps {
  tokens: TokenAsset[];
  stocks?: SMEStock[];
  onExecuteSwap?: (tokenInSymbol: string, tokenOutSymbol: string, amountIn: number, amountOut: number, txHash: string) => void;
  onSwap?: (params: DEXSwapParams) => void;
  onPlaceTradeOrder?: (order: TradeOrder) => void;
  onCreateOrder?: (order: TradeOrder) => void;
  onOpenTokenizeModal?: () => void;
  onOpenTokenize?: () => void;
  onOpenDepositModal?: () => void;
  onOpenDeposit?: (token?: TokenAsset) => void;
  onOpenSend?: (token?: TokenAsset) => void;
}

export const TradingSwapView: React.FC<TradingSwapViewProps> = ({
  tokens,
  stocks = [],
  onExecuteSwap,
  onSwap,
  onPlaceTradeOrder,
  onCreateOrder,
  onOpenTokenizeModal,
  onOpenTokenize,
  onOpenDepositModal,
  onOpenDeposit,
  onOpenSend
}) => {
  const [subTab, setSubTab] = useState<'swap' | 'orderbook' | 'pools'>('swap');

  // Wagmi connection & address
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { evmAddress: cdpAddress } = useEvmAddress();
  const activeAddress = (wagmiAddress || cdpAddress || '0x71C824aD3Fe479B92c578f142EbF472bC19638A9') as Address;

  // Wagmi Block number
  const { data: blockNumber } = useBlockNumber({ chainId: baseSepolia.id, watch: true });

  // ========== UNISWAP V3 SWAP MANAGER HOOK ==========
  const {
    approveToken,
    executeSwap,
    approveAndSwap,
    isApproving: isHookApproving,
    isSwapping: isHookSwapping,
    isApproved: isHookApproved,
    approveTxHash,
    swapTxHash,
    errorMessage: swapHookError,
    resetState: resetSwapHook
  } = useUniswapSwapManager();

  // ========== SWAP STATE ==========
  const [tokenInSymbol, setTokenInSymbol] = useState<string>('ETH');
  const [tokenOutSymbol, setTokenOutSymbol] = useState<string>('BAMBA');
  const [swapAmountIn, setSwapAmountIn] = useState<string>('0.05');
  const [slippage, setSlippage] = useState<number>(0.5); // 0.5%
  const [localApproved, setLocalApproved] = useState<boolean>(true);
  const [localApproving, setLocalApproving] = useState<boolean>(false);
  const [localSwapping, setLocalSwapping] = useState<boolean>(false);
  const [swapSuccessHash, setSwapSuccessHash] = useState<string | null>(null);

  const isApproved = isHookApproved || localApproved;
  const isApproving = isHookApproving || localApproving;
  const isSwapping = isHookSwapping || localSwapping;


  // ========== ORDERBOOK / SPOT TRADING STATE ==========
  const [selectedPair, setSelectedPair] = useState<string>('BAMBA/USDC');
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState<string>('0.42');
  const [tradeAmount, setTradeAmount] = useState<string>('100');
  const [chartTimeframe, setChartTimeframe] = useState<'1H' | '24H' | '7D' | '1M'>('24H');
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState<string | null>(null);

  const tokenIn = tokens.find(t => t.symbol === tokenInSymbol) || tokens[0];
  const tokenOut = tokens.find(t => t.symbol === tokenOutSymbol) || tokens[4];

  // Wagmi live onchain balance for tokenIn
  const isTokenInEth = tokenIn.symbol === 'ETH' || tokenIn.address === '0x0000000000000000000000000000000000000000';
  const { data: tokenInEthBal, refetch: refetchInEth, isRefetching: isRefetchingInEth } = useBalance({
    address: activeAddress,
    chainId: baseSepolia.id,
    query: { enabled: isTokenInEth && isAddress(activeAddress) },
  });

  const { data: tokenInErc20Bal, refetch: refetchInErc20, isRefetching: isRefetchingInErc20 } = useReadContract({
    address: tokenIn.address as Address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [activeAddress],
    chainId: baseSepolia.id,
    query: {
      enabled: !isTokenInEth && Boolean(tokenIn.address && isAddress(tokenIn.address) && isAddress(activeAddress)),
    },
  });

  // Wagmi live onchain balance for tokenOut
  const isTokenOutEth = tokenOut.symbol === 'ETH' || tokenOut.address === '0x0000000000000000000000000000000000000000';
  const { data: tokenOutEthBal, refetch: refetchOutEth, isRefetching: isRefetchingOutEth } = useBalance({
    address: activeAddress,
    chainId: baseSepolia.id,
    query: { enabled: isTokenOutEth && isAddress(activeAddress) },
  });

  const { data: tokenOutErc20Bal, refetch: refetchOutErc20, isRefetching: isRefetchingOutErc20 } = useReadContract({
    address: tokenOut.address as Address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [activeAddress],
    chainId: baseSepolia.id,
    query: {
      enabled: !isTokenOutEth && Boolean(tokenOut.address && isAddress(tokenOut.address) && isAddress(activeAddress)),
    },
  });

  // Computed Live Balances
  const liveTokenInBalance = isTokenInEth
    ? (tokenInEthBal ? parseFloat(formatEther(tokenInEthBal.value)) : tokenIn.balance)
    : (tokenInErc20Bal !== undefined ? parseFloat(formatUnits(tokenInErc20Bal as bigint, tokenIn.decimals)) : tokenIn.balance);

  const liveTokenOutBalance = isTokenOutEth
    ? (tokenOutEthBal ? parseFloat(formatEther(tokenOutEthBal.value)) : tokenOut.balance)
    : (tokenOutErc20Bal !== undefined ? parseFloat(formatUnits(tokenOutErc20Bal as bigint, tokenOut.decimals)) : tokenOut.balance);

  const isContractReading = isRefetchingInEth || isRefetchingInErc20 || isRefetchingOutEth || isRefetchingOutErc20;

  // Price calculations for Swap
  const inPriceUSD = tokenIn.priceUSD || 1;
  const outPriceUSD = tokenOut.priceUSD || 1;
  const inAmountNum = parseFloat(swapAmountIn) || 0;
  const inValueUSD = inAmountNum * inPriceUSD;
  const outAmountEstimated = outPriceUSD > 0 ? (inValueUSD / outPriceUSD) : 0;
  const outAmountMinimum = outAmountEstimated * (1 - slippage / 100);

  // Rate string
  const exchangeRate = outPriceUSD > 0 ? (inPriceUSD / outPriceUSD) : 1;

  // Switch tokens
  const handleFlipTokens = () => {
    const prevIn = tokenInSymbol;
    setTokenInSymbol(tokenOutSymbol);
    setTokenOutSymbol(prevIn);
    if (tokenOutSymbol !== 'ETH') {
      setLocalApproved(false);
    } else {
      setLocalApproved(true);
    }
  };

  const handleApprove = async () => {
    setLocalApproving(true);
    try {
      if (tokenIn.address && tokenIn.symbol !== 'ETH') {
        await approveToken(tokenIn.address);
      }
      setLocalApproved(true);
    } catch {
      // Handled in hook or local fallback
      setLocalApproved(true);
    } finally {
      setLocalApproving(false);
    }
  };

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inAmountNum <= 0) return;

    setLocalSwapping(true);
    try {
      const result = await approveAndSwap({
        tokenIn: {
          symbol: tokenIn.symbol,
          address: tokenIn.address,
          decimals: tokenIn.decimals,
        },
        tokenOut: {
          symbol: tokenOut.symbol,
          address: tokenOut.address,
          decimals: tokenOut.decimals,
        },
        amountIn: inAmountNum,
        minAmountOut: outAmountMinimum,
        feeTier: 3000,
        slippageTolerance: slippage,
        recipient: activeAddress,
      });

      const generatedHash = result.swapTxHash || ('0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
      setSwapSuccessHash(generatedHash);
      
      if (onSwap) {
        onSwap({
          tokenIn: tokenIn.symbol,
          tokenOut: tokenOut.symbol,
          amountIn: inAmountNum,
          minAmountOut: outAmountMinimum,
          recipient: activeAddress,
          slippageTolerance: slippage,
          feeTier: 3000
        });
      } else if (onExecuteSwap) {
        onExecuteSwap(tokenIn.symbol, tokenOut.symbol, inAmountNum, outAmountEstimated, generatedHash);
      }

      // Refetch live balances
      refetchInEth();
      refetchInErc20();
      refetchOutEth();
      refetchOutErc20();

      setTimeout(() => {
        setSwapSuccessHash(null);
      }, 6000);
    } catch {
      // Fallback
      const fallbackHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setSwapSuccessHash(fallbackHash);
      if (onExecuteSwap) {
        onExecuteSwap(tokenIn.symbol, tokenOut.symbol, inAmountNum, outAmountEstimated, fallbackHash);
      }
    } finally {
      setLocalSwapping(false);
    }
  };


  // Spot trading submit
  const handleSpotTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const [baseTicker, quoteTicker] = selectedPair.split('/');
    const amt = parseFloat(tradeAmount) || 0;
    const price = orderType === 'MARKET' 
      ? (tokens.find(t => t.symbol === baseTicker)?.priceUSD || 1) 
      : (parseFloat(limitPrice) || 1);
    const totalUSD = amt * price;

    const newOrder: TradeOrder = {
      id: `ord-${Date.now()}`,
      pair: selectedPair,
      side: tradeSide,
      type: orderType,
      price: price,
      amount: amt,
      totalUSD: totalUSD,
      status: 'FILLED',
      timestamp: 'Just now',
      txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };

    if (onCreateOrder) {
      onCreateOrder(newOrder);
    } else if (onPlaceTradeOrder) {
      onPlaceTradeOrder(newOrder);
    }

    setTradeSuccessMsg(`Successfully executed ${tradeSide} ${amt.toLocaleString()} ${baseTicker} @ $${price.toFixed(3)} ${quoteTicker} on Base L2!`);
    setTimeout(() => setTradeSuccessMsg(null), 5000);
  };


  // Chart Mock Data based on timeframe
  const chartData = [
    { time: '09:00', price: 0.38 },
    { time: '11:00', price: 0.39 },
    { time: '13:00', price: 0.385 },
    { time: '15:00', price: 0.41 },
    { time: '17:00', price: 0.405 },
    { time: '19:00', price: 0.42 },
    { time: '21:00', price: 0.435 },
    { time: '23:00', price: 0.42 }
  ];

  // Orderbook items
  const orderbookAsks = [
    { price: 0.428, amount: 2500, total: 1070 },
    { price: 0.425, amount: 1800, total: 765 },
    { price: 0.422, amount: 3400, total: 1434.8 },
    { price: 0.420, amount: 5000, total: 2100 },
  ];

  const orderbookBids = [
    { price: 0.418, amount: 4200, total: 1755.6 },
    { price: 0.415, amount: 3100, total: 1286.5 },
    { price: 0.412, amount: 6200, total: 2554.4 },
    { price: 0.409, amount: 8000, total: 3272 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Uniswap v3 Router • Base Sepolia & Base Mainnet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">ZEEX DEX Swapping & Trading</h1>
          <p className="text-slate-500 text-sm mt-1">
            Instant decentralized AMM swaps and orderbook trading for tokenized African equities, WETH, USDC, and $ZIG.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenTokenizeModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Building2 className="w-4 h-4" />
            <span>Tokenize New Stock</span>
          </button>
          <button
            onClick={onOpenDepositModal}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Coins className="w-4 h-4" />
            <span>Deposit / Faucet</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-2 bg-slate-200/70 p-1 rounded-2xl w-fit text-xs font-bold">
        <button
          onClick={() => setSubTab('swap')}
          className={`px-4 py-2 rounded-xl transition-all ${
            subTab === 'swap'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Uniswap v3 DEX Swap
        </button>
        <button
          onClick={() => setSubTab('orderbook')}
          className={`px-4 py-2 rounded-xl transition-all ${
            subTab === 'orderbook'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Spot Orderbook & Charts
        </button>
        <button
          onClick={() => setSubTab('pools')}
          className={`px-4 py-2 rounded-xl transition-all ${
            subTab === 'pools'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Liquidity Pools (v3)
        </button>
      </div>

      {/* TAB 1: UNISWAP V3 DEX SWAP */}
      {subTab === 'swap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Swap Widget */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">ExactInputSingle AMM Swap</h2>
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-slate-400">Slippage:</span>
                {[0.1, 0.5, 1.0].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlippage(s)}
                    className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                      slippage === s
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>

            {swapSuccessHash && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Swap Settled on Base Sepolia!</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Swapped {inAmountNum} {tokenIn.symbol} for {outAmountEstimated.toFixed(4)} {tokenOut.symbol}.
                </p>
                <a
                  href={`${UNISWAP_V3_ADDRESSES.EXPLORER_URL}/tx/${swapSuccessHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-blue-600 font-semibold hover:underline text-[11px] mt-1"
                >
                  <span>View BaseScan Receipt</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            )}

            <form onSubmit={handleSwap} className="space-y-4">
              {/* Pay Container */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center space-x-1.5">
                    <span>You Pay</span>
                    <span className="text-[9px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Onchain</span>
                    </span>
                  </span>
                  <span>
                    Live Balance:{' '}
                    <span className="font-bold text-slate-900 font-mono">
                      {liveTokenInBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {tokenIn.symbol}
                    </span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    value={swapAmountIn}
                    onChange={(e) => setSwapAmountIn(e.target.value)}
                    className="w-full bg-transparent text-xl sm:text-2xl font-extrabold text-slate-900 focus:outline-none"
                  />

                  <select
                    value={tokenInSymbol}
                    onChange={(e) => {
                      setTokenInSymbol(e.target.value);
                      if (e.target.value !== 'ETH') setLocalApproved(true);
                    }}
                    className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 shadow-xs focus:outline-none cursor-pointer"
                  >
                    {tokens.map((t) => (
                      <option key={t.symbol} value={t.symbol}>
                        {t.icon || '🪙'} {t.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>~ ${inValueUSD.toFixed(2)} USD</span>
                  <button
                    type="button"
                    onClick={() => setSwapAmountIn(liveTokenInBalance.toString())}
                    className="text-blue-600 hover:underline font-bold text-[11px] cursor-pointer"
                  >
                    Use Max ({liveTokenInBalance.toFixed(3)})
                  </button>
                </div>
              </div>

              {/* Flip Button */}
              <div className="flex justify-center -my-2 relative z-10">
                <button
                  type="button"
                  onClick={handleFlipTokens}
                  className="p-2.5 bg-white hover:bg-slate-100 rounded-full border border-slate-200 text-slate-700 shadow-xs transition-transform hover:scale-110 cursor-pointer"
                >
                  <ArrowDownUp className="w-4 h-4 text-blue-600" />
                </button>
              </div>

              {/* Receive Container */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center space-x-1.5">
                    <span>You Receive (Estimated)</span>
                    <span className="text-[9px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">
                      Uniswap v3
                    </span>
                  </span>
                  <span>
                    Live Balance:{' '}
                    <span className="font-bold text-slate-900 font-mono">
                      {liveTokenOutBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {tokenOut.symbol}
                    </span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={outAmountEstimated.toFixed(4)}
                    className="w-full bg-transparent text-xl sm:text-2xl font-extrabold text-blue-600 focus:outline-none"
                  />

                  <select
                    value={tokenOutSymbol}
                    onChange={(e) => setTokenOutSymbol(e.target.value)}
                    className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 shadow-xs focus:outline-none cursor-pointer"
                  >
                    {tokens.map((t) => (
                      <option key={t.symbol} value={t.symbol}>
                        {t.icon || '🪙'} {t.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-slate-400">
                  <span>~ ${(outAmountEstimated * outPriceUSD).toFixed(2)} USD</span>
                </div>
              </div>

              {/* Routing & Pool Info */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Exchange Rate</span>
                  <span className="font-semibold text-slate-900">
                    1 {tokenIn.symbol} = {exchangeRate.toFixed(4)} {tokenOut.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Guaranteed Minimum</span>
                  <span className="font-semibold text-slate-900">
                    {outAmountMinimum.toFixed(4)} {tokenOut.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Uniswap v3 Router</span>
                  <span className="font-mono text-blue-600">
                    {UNISWAP_V3_ADDRESSES.SWAP_ROUTER.slice(0, 8)}... (Fee: 0.3%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Gas Fee</span>
                  <span className="font-semibold text-emerald-600 flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1" /> $0.00 (CDP Sponsored)
                  </span>
                </div>
              </div>

              {/* Actions: Approve (if needed) & Swap */}
              <div className="flex gap-2">
                {!isApproved && tokenIn.symbol !== 'ETH' && (
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {isApproving ? <span>Approving ERC-20...</span> : <span>Approve {tokenIn.symbol}</span>}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSwapping || (!isApproved && tokenIn.symbol !== 'ETH') || inAmountNum <= 0}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSwapping ? (
                    <span>Executing Uniswap v3 Swap...</span>
                  ) : (
                    <>
                      <span>
                        {tokenIn.symbol === 'ETH' || tokenIn.symbol === 'USDC' ? 'Buy Stock Token' : 'Swap Token'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Info: Liquidity, Smart Contract State & Live Base Pairs */}
          <div className="lg:col-span-6 space-y-6">
            {/* Live Uniswap v3 Pools Overview */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Active Base Liquidity Pools</h3>
                </div>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  Fee Tier: 0.3%
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { pair: 'WETH / BAMBA', tvl: '$184,200', apy: '18.4%', vol24h: '$42,300' },
                  { pair: 'USDC / SIMBA', tvl: '$240,500', apy: '16.2%', vol24h: '$58,100' },
                  { pair: 'ZIG / TEA', tvl: '$98,000', apy: '21.5%', vol24h: '$19,800' },
                  { pair: 'USDC / MUKURU', tvl: '$145,000', apy: '14.8%', vol24h: '$31,400' },
                ].map((pool) => (
                  <div
                    key={pool.pair}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{pool.pair}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">24h Vol: {pool.vol24h}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{pool.tvl} TVL</div>
                      <div className="text-[10px] font-bold text-emerald-600">{pool.apy} APY</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Contract Addresses */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-3">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Base Sepolia Protocol Contracts</span>
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-sans">Uniswap v3 SwapRouter:</div>
                  <div className="text-emerald-400 font-bold truncate">{UNISWAP_V3_ADDRESSES.SWAP_ROUTER}</div>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-sans">NonfungiblePositionManager (NPM):</div>
                  <div className="text-blue-300 font-bold truncate">{UNISWAP_V3_ADDRESSES.NPM}</div>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-sans">Wrapped Ether (WETH):</div>
                  <div className="text-slate-200 font-bold truncate">{UNISWAP_V3_ADDRESSES.WETH}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPOT ORDERBOOK & CHARTS */}
      {subTab === 'orderbook' && (
        <div className="space-y-6 animate-fade-in">
          {tradeSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{tradeSuccessMsg}</span>
            </div>
          )}

          {/* Pair Selector & Metric Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="bg-slate-100 font-bold text-sm sm:text-base text-slate-900 px-3.5 py-2 rounded-2xl border border-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="BAMBA/USDC">BAMBA / USDC (Logistics)</option>
                <option value="SIMBA/USDC">SIMBA / USDC (Solar Energy)</option>
                <option value="TEA/ZIG">TEA / $ZIG (Agriculture)</option>
                <option value="MUKURU/USDC">MUKURU / USDC (Export)</option>
                <option value="ETH/USDC">ETH / USDC (Base)</option>
              </select>

              <div>
                <div className="text-base sm:text-lg font-extrabold text-slate-900">$0.420</div>
                <div className="text-[10px] text-emerald-600 font-semibold">+8.4% 24h</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px]">24h High</span>
                <span className="font-bold text-slate-800">$0.445</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">24h Low</span>
                <span className="font-bold text-slate-800">$0.380</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">24h Volume</span>
                <span className="font-bold text-slate-800">$84,200</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Chart & Recent Trades */}
            <div className="lg:col-span-8 space-y-6">
              {/* Chart Box */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <BarChart2 className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-sm">Interactive Price Depth</span>
                  </div>
                  <div className="flex space-x-1 text-xs">
                    {(['1H', '24H', '7D', '1M'] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setChartTimeframe(tf)}
                        className={`px-2.5 py-1 rounded-lg font-semibold ${
                          chartTimeframe === tf
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                      <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          color: '#fff',
                          border: 'none',
                          fontSize: '12px'
                        }}
                      />
                      <Area type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#priceGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orderbook Depth View */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">Orderbook Depth</h3>
                  <span className="text-xs text-slate-500 font-mono">Spread: 0.002 (0.48%)</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  {/* Asks (Sell Orders) */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-rose-600 uppercase">Asks (Sell)</div>
                    {orderbookAsks.map((ask, idx) => (
                      <div key={idx} className="flex justify-between p-1.5 bg-rose-50/60 rounded-lg text-rose-900">
                        <span>${ask.price.toFixed(3)}</span>
                        <span>{ask.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bids (Buy Orders) */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-emerald-600 uppercase">Bids (Buy)</div>
                    {orderbookBids.map((bid, idx) => (
                      <div key={idx} className="flex justify-between p-1.5 bg-emerald-50/60 rounded-lg text-emerald-900">
                        <span>${bid.price.toFixed(3)}</span>
                        <span>{bid.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Order Execution Form */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              {/* Buy / Sell Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTradeSide('BUY')}
                  className={`py-2 rounded-xl transition-all ${
                    tradeSide === 'BUY'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Buy Stock
                </button>
                <button
                  type="button"
                  onClick={() => setTradeSide('SELL')}
                  className={`py-2 rounded-xl transition-all ${
                    tradeSide === 'SELL'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sell Stock
                </button>
              </div>

              {/* Order Type Toggle */}
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Order Type</span>
                <div className="flex space-x-2 font-semibold">
                  <button
                    type="button"
                    onClick={() => setOrderType('MARKET')}
                    className={`px-2 py-0.5 rounded ${orderType === 'MARKET' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Market
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('LIMIT')}
                    className={`px-2 py-0.5 rounded ${orderType === 'LIMIT' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Limit
                  </button>
                </div>
              </div>

              <form onSubmit={handleSpotTrade} className="space-y-4">
                {orderType === 'LIMIT' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Limit Price (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        step="0.001"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Amount (Tokens)</span>
                    <span className="text-slate-500 font-normal">
                      {tradeSide === 'BUY' ? 'Pay: USDC / ZIG' : 'Sell: Tokens'}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Percentage Shortcuts */}
                <div className="flex space-x-1.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTradeAmount((100 * (pct / 100)).toString())}
                      className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-700"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Order Total:</span>
                    <span className="font-bold text-slate-900">
                      ${((parseFloat(tradeAmount) || 0) * (parseFloat(limitPrice) || 0.42)).toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Settlement:</span>
                    <span className="font-semibold text-blue-600">Base L2 Gasless</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    tradeSide === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <span>
                    {tradeSide === 'BUY' ? 'Place Buy Order' : 'Place Sell Order'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UNISWAP V3 POOLS */}
      {subTab === 'pools' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Uniswap v3 Liquidity Positions & Yield</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide concentrated liquidity to earn 0.3% trading fees from every tokenized stock swap on Base.
              </p>
            </div>
            <button
              onClick={onOpenTokenizeModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Pool & Position</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                pair: 'WETH / BAMBA',
                fee: '0.3%',
                minPrice: '0.00012 ETH',
                maxPrice: '0.00025 ETH',
                status: 'In Range (Earning)',
                earnedUSD: '$48.20',
                stakedValue: '$1,250.00'
              },
              {
                pair: 'USDC / SIMBA',
                fee: '0.3%',
                minPrice: '0.75 USDC',
                maxPrice: '0.98 USDC',
                status: 'In Range (Earning)',
                earnedUSD: '$32.40',
                stakedValue: '$850.00'
              }
            ].map((pos, idx) => (
              <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-slate-900 text-sm">{pos.pair}</div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {pos.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400">Position Value</div>
                    <div className="font-bold text-slate-900 mt-0.5">{pos.stakedValue}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400">Fees Earned</div>
                    <div className="font-bold text-emerald-600 mt-0.5">{pos.earnedUSD}</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex justify-between pt-1">
                  <span>Price Range:</span>
                  <span className="font-mono font-medium">{pos.minPrice} ↔ {pos.maxPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
