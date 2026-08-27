import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAccount, useBlockNumber } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { useEvmAddress, useCurrentUser } from '@coinbase/cdp-hooks';
import { IndexedTransaction } from '../types';
import { INITIAL_INDEXED_TRANSACTIONS } from '../data/indexerData';
import { UNISWAP_V3_ADDRESSES } from '../data/tokenData';

const INDEXER_STORAGE_KEY = 'zeex_blockchain_indexer_history_v1';

export type IndexerCategoryFilter = 'ALL' | 'SWAP' | 'TOKENIZATION' | 'BURN' | 'DEPOSIT' | 'DIVIDEND';

export function useBlockchainIndexer() {
  const { address: wagmiAddress } = useAccount();
  const { evmAddress: cdpAddress } = useEvmAddress();
  const { currentUser } = useCurrentUser();

  const activeAddress = useMemo(() => {
    return wagmiAddress || cdpAddress || currentUser?.evmAccountObjects?.[0]?.address || '0x71C824aD3Fe479B92c578f142EbF472bC19638A9';
  }, [wagmiAddress, cdpAddress, currentUser]);

  // Live block height on Base Sepolia
  const { data: blockNumber, refetch: refetchBlockNumber } = useBlockNumber({
    chainId: baseSepolia.id,
    watch: true,
  });

  // Current indexed transactions state
  const [transactions, setTransactions] = useState<IndexedTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(INDEXER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_INDEXED_TRANSACTIONS;
  });

  // Category filter and search query
  const [selectedCategory, setSelectedCategory] = useState<IndexerCategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);
  const [lastIndexedAt, setLastIndexedAt] = useState<Date>(new Date());

  // Save to localStorage whenever transactions change
  useEffect(() => {
    try {
      localStorage.setItem(INDEXER_STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  // Dynamically compute live confirmations for each indexed transaction based on current block height
  const liveIndexedTransactions = useMemo(() => {
    const currentBlock = blockNumber ? Number(blockNumber) : 18459182;

    return transactions.map((tx) => {
      const confirmations = Math.max(1, currentBlock - tx.blockNumber + 1);
      const status: 'Confirmed' | 'Finalized' | 'Pending' = 
        confirmations >= 32 ? 'Finalized' : confirmations >= 1 ? 'Confirmed' : 'Pending';

      return {
        ...tx,
        confirmations,
        status,
      };
    });
  }, [transactions, blockNumber]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return liveIndexedTransactions.filter((tx) => {
      const matchesCategory = selectedCategory === 'ALL' || tx.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchHash = tx.txHash.toLowerCase().includes(q);
      const matchTitle = tx.title.toLowerCase().includes(q);
      const matchMethod = tx.method.toLowerCase().includes(q);
      const matchTicker = tx.tokenizationDetails?.ticker.toLowerCase().includes(q);
      const matchCompany = tx.tokenizationDetails?.companyName.toLowerCase().includes(q);
      const matchSwapTokens = 
        tx.swapDetails?.tokenIn.toLowerCase().includes(q) || 
        tx.swapDetails?.tokenOut.toLowerCase().includes(q);

      return matchHash || matchTitle || matchMethod || matchTicker || matchCompany || matchSwapTokens;
    });
  }, [liveIndexedTransactions, selectedCategory, searchQuery]);

  // Aggregated Indexer Analytics
  const stats = useMemo(() => {
    const totalVolumeUSD = liveIndexedTransactions.reduce((acc, tx) => acc + tx.amountUSD, 0);
    const totalGasSavedUSD = liveIndexedTransactions.length * 14.50; // compared to L1 gas
    const swapsCount = liveIndexedTransactions.filter(tx => tx.category === 'SWAP').length;
    const tokenizationsCount = liveIndexedTransactions.filter(tx => tx.category === 'TOKENIZATION').length;
    const finalizedCount = liveIndexedTransactions.filter(tx => tx.status === 'Finalized').length;

    return {
      totalVolumeUSD,
      totalGasSavedUSD,
      totalTransactions: liveIndexedTransactions.length,
      swapsCount,
      tokenizationsCount,
      finalizedCount,
    };
  }, [liveIndexedTransactions]);

  // Manual Trigger: Re-index RPC
  const reindexFromRPC = useCallback(async () => {
    setIsIndexing(true);
    await refetchBlockNumber();
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLastIndexedAt(new Date());
    setIsIndexing(false);
  }, [refetchBlockNumber]);

  // Register a new onchain swap into indexer
  const recordSwapEvent = useCallback((params: {
    txHash: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: number;
    amountOut: number;
    amountUSD: number;
    feeTier?: string;
  }) => {
    const currentBlock = blockNumber ? Number(blockNumber) : 18459182;
    const newTx: IndexedTransaction = {
      id: `idx-tx-${Date.now()}`,
      txHash: params.txHash,
      category: 'SWAP',
      method: 'exactInputSingle (Uniswap v3 Router)',
      title: `Swapped ${params.amountIn.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${params.tokenIn} → ${params.amountOut.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${params.tokenOut}`,
      blockNumber: currentBlock,
      timestamp: 'Just now',
      status: 'Confirmed',
      confirmations: 1,
      gasUsedETH: '0.000082 ETH',
      gasFeeUSD: 0.22,
      fromAddress: activeAddress,
      toAddress: UNISWAP_V3_ADDRESSES.SWAP_ROUTER,
      contractAddress: UNISWAP_V3_ADDRESSES.SWAP_ROUTER,
      amountUSD: params.amountUSD,
      amountZIG: params.amountUSD * 26,
      explorerUrl: `${UNISWAP_V3_ADDRESSES.EXPLORER_URL}/tx/${params.txHash}`,
      eventSignature: 'Swap(address sender, address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)',
      swapDetails: {
        tokenIn: params.tokenIn,
        tokenInAmount: params.amountIn,
        tokenOut: params.tokenOut,
        tokenOutAmount: params.amountOut,
        feeTier: params.feeTier || '0.30% (3000 bps)',
        executionPriceUSD: params.amountIn > 0 ? params.amountUSD / params.amountIn : 0,
        route: [params.tokenIn, params.tokenOut],
        poolAddress: '0x99A828c949281a8c888827c891a0194819a8491a'
      }
    };

    setTransactions((prev) => [newTx, ...prev]);
  }, [blockNumber, activeAddress]);

  // Register a new onchain tokenization into indexer
  const recordTokenizationEvent = useCallback((params: {
    txHash: string;
    ticker: string;
    companyName: string;
    sharesMinted: number;
    parValueUSD: number;
    valuationUSD: number;
    seczimFilingId?: string;
    contractAddress?: string;
  }) => {
    const currentBlock = blockNumber ? Number(blockNumber) : 18459182;
    const newTx: IndexedTransaction = {
      id: `idx-tx-${Date.now()}`,
      txHash: params.txHash,
      category: 'TOKENIZATION',
      method: 'deployAndMintSecurityToken (SECZim ERC-3643 Factory)',
      title: `Tokenized ${params.sharesMinted.toLocaleString()} ${params.ticker} SME Shares`,
      blockNumber: currentBlock,
      timestamp: 'Just now',
      status: 'Confirmed',
      confirmations: 1,
      gasUsedETH: '0.000305 ETH',
      gasFeeUSD: 0.82,
      fromAddress: activeAddress,
      toAddress: '0x89d2821F0e9c8B23491C7829103984A091234981',
      contractAddress: params.contractAddress || '0x71c26b5B1c183E2A2770281F0E4631D6A763b020',
      amountUSD: params.valuationUSD,
      amountZIG: params.valuationUSD * 26,
      explorerUrl: `${UNISWAP_V3_ADDRESSES.EXPLORER_URL}/tx/${params.txHash}`,
      eventSignature: 'TokenMinted(address indexed token, string ticker, uint256 totalSupply, string seczimId)',
      tokenizationDetails: {
        ticker: params.ticker,
        companyName: params.companyName,
        sharesMinted: params.sharesMinted,
        parValueUSD: params.parValueUSD,
        valuationUSD: params.valuationUSD,
        tokenStandard: 'ERC-3643 (Base L2 SECZim Compliant)',
        seczimFilingId: params.seczimFilingId || `SECZ-2026-T${Math.floor(1000 + Math.random() * 9000)}`,
        custodianEscrow: 'Stanbic Nominees Zimbabwe Ltd',
        initialLiquidityUSD: Math.round(params.valuationUSD * 0.05)
      }
    };

    setTransactions((prev) => [newTx, ...prev]);
  }, [blockNumber, activeAddress]);

  // Register a new onchain stock burn / delisting into indexer
  const recordBurnEvent = useCallback((params: {
    txHash: string;
    ticker: string;
    companyName: string;
    burnedShares: number;
    remainingShares: number;
    isFullDelisting: boolean;
    reason: string;
    seczimFilingId?: string;
    contractAddress?: string;
    payoutPerShareUSD?: number;
    totalRedemptionPayoutUSD?: number;
  }) => {
    const currentBlock = blockNumber ? Number(blockNumber) : 18459182;
    const payoutTotal = params.totalRedemptionPayoutUSD || ((params.payoutPerShareUSD || 0) * params.burnedShares);
    const newTx: IndexedTransaction = {
      id: `idx-burn-${Date.now()}`,
      txHash: params.txHash,
      category: 'BURN',
      method: params.isFullDelisting ? 'burnAndDelistSecurityToken (SECZim Gazette SI-134)' : 'burn (Share Capital Reduction / Buyback)',
      title: params.isFullDelisting 
        ? `Delisted ${params.ticker}: Burned ${params.burnedShares.toLocaleString()} Shares`
        : `Supply Reduction: Burned ${params.burnedShares.toLocaleString()} ${params.ticker} Shares`,
      blockNumber: currentBlock,
      timestamp: 'Just now',
      status: 'Confirmed',
      confirmations: 1,
      gasUsedETH: '0.000185 ETH',
      gasFeeUSD: 0.50,
      fromAddress: activeAddress,
      toAddress: '0x0000000000000000000000000000000000000000',
      contractAddress: params.contractAddress || '0x71c26b5B1c183E2A2770281F0E4631D6A763b020',
      amountUSD: payoutTotal,
      amountZIG: payoutTotal * 26,
      explorerUrl: `${UNISWAP_V3_ADDRESSES.EXPLORER_URL}/tx/${params.txHash}`,
      eventSignature: 'Transfer(address indexed from, address indexed to, uint256 value) [BurnToZero]',
      burnDetails: {
        ticker: params.ticker,
        companyName: params.companyName,
        burnedShares: params.burnedShares,
        remainingShares: params.remainingShares,
        isFullDelisting: params.isFullDelisting,
        reason: params.reason,
        seczimFilingId: params.seczimFilingId || `SECZ-DELIST-2026-${Math.floor(100 + Math.random() * 900)}`,
        custodianEscrow: 'Stanbic Nominees Zimbabwe Ltd (ZSE Trust)',
        payoutPerShareUSD: params.payoutPerShareUSD || 0,
        totalRedemptionPayoutUSD: payoutTotal,
      }
    };

    setTransactions((prev) => [newTx, ...prev]);
  }, [blockNumber, activeAddress]);

  return {
    activeAddress,
    blockNumber: blockNumber ? Number(blockNumber) : undefined,
    transactions: liveIndexedTransactions,
    filteredTransactions,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isIndexing,
    lastIndexedAt,
    stats,
    reindexFromRPC,
    recordSwapEvent,
    recordTokenizationEvent,
    recordBurnEvent,
  };
}
