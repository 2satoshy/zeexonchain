import { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  useAccount, 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useReadContract,
  usePublicClient 
} from 'wagmi';
import { 
  parseUnits, 
  formatUnits, 
  isAddress, 
  Address, 
  maxUint256,
  zeroAddress,
  Hex 
} from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { useEvmAddress } from '@coinbase/cdp-hooks';
import { ERC20_ABI, UNISWAP_V3_SWAP_ROUTER_ABI } from '../config/wagmi';
import { UNISWAP_V3_ADDRESSES } from '../data/tokenData';

export interface ExactInputSingleSwapParams {
  tokenIn: {
    symbol: string;
    address: string;
    decimals: number;
  };
  tokenOut: {
    symbol: string;
    address: string;
    decimals: number;
  };
  amountIn: number | string;
  minAmountOut?: number | string;
  feeTier?: number; // e.g., 500 (0.05%), 3000 (0.3%), 10000 (1%)
  slippageTolerance?: number; // percentage, e.g. 0.5 for 0.5%
  recipient?: string;
  deadlineMinutes?: number;
}

export interface SwapExecutionResult {
  success: boolean;
  swapTxHash?: string;
  approveTxHash?: string;
  amountIn: number;
  amountOutEstimated: number;
  error?: string;
}

export function useUniswapSwapManager() {
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { evmAddress: cdpAddress } = useEvmAddress();
  const publicClient = usePublicClient({ chainId: baseSepolia.id });

  // Effective wallet address
  const activeAddress = useMemo(() => {
    const raw = wagmiAddress || cdpAddress;
    return raw && isAddress(raw) ? (raw as Address) : undefined;
  }, [wagmiAddress, cdpAddress]);

  // Wagmi Contract Write for Approve & Swap
  const { 
    writeContractAsync: writeApproveAsync,
    isPending: isApprovePending 
  } = useWriteContract();

  const { 
    writeContractAsync: writeSwapAsync,
    isPending: isSwapPending 
  } = useWriteContract();

  // Internal State Tracking
  const [selectedTokenInAddress, setSelectedTokenInAddress] = useState<Address | undefined>(undefined);
  const [targetAmountInWei, setTargetAmountInWei] = useState<bigint>(0n);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | null>(null);
  const [swapTxHash, setSwapTxHash] = useState<`0x${string}` | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [swapSuccess, setSwapSuccess] = useState<boolean>(false);

  // Monitor Onchain Approval Transaction Receipt
  const { 
    isLoading: isApproveConfirming, 
    isSuccess: isApproveConfirmed 
  } = useWaitForTransactionReceipt({
    hash: approveTxHash || undefined,
    chainId: baseSepolia.id,
  });

  // Monitor Onchain Swap Transaction Receipt
  const { 
    isLoading: isSwapConfirming, 
    isSuccess: isSwapConfirmed,
    data: swapReceipt 
  } = useWaitForTransactionReceipt({
    hash: swapTxHash || undefined,
    chainId: baseSepolia.id,
  });

  // Check ERC-20 Allowance for SwapRouter
  const isNativeTokenIn = useMemo(() => {
    if (!selectedTokenInAddress) return false;
    return selectedTokenInAddress.toLowerCase() === zeroAddress.toLowerCase();
  }, [selectedTokenInAddress]);

  const { 
    data: allowanceData, 
    refetch: refetchAllowance, 
    isLoading: isAllowanceLoading 
  } = useReadContract({
    address: selectedTokenInAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: activeAddress ? [activeAddress, UNISWAP_V3_ADDRESSES.SWAP_ROUTER as Address] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: Boolean(
        activeAddress && 
        selectedTokenInAddress && 
        !isNativeTokenIn && 
        isAddress(selectedTokenInAddress)
      ),
    }
  });

  const currentAllowance = useMemo<bigint>(() => {
    if (isNativeTokenIn) return maxUint256;
    return (allowanceData as bigint) ?? 0n;
  }, [allowanceData, isNativeTokenIn]);

  const isApproved = useMemo(() => {
    if (isNativeTokenIn) return true;
    if (targetAmountInWei === 0n) {
      return currentAllowance > 0n;
    }
    return currentAllowance >= targetAmountInWei;
  }, [isNativeTokenIn, targetAmountInWei, currentAllowance]);

  // Sync approval state when transaction confirms
  useEffect(() => {
    if (isApproveConfirmed) {
      setIsApproving(false);
      refetchAllowance();
    }
  }, [isApproveConfirmed, refetchAllowance]);

  // Sync swap state when transaction confirms
  useEffect(() => {
    if (isSwapConfirmed) {
      setIsSwapping(false);
      setSwapSuccess(true);
    }
  }, [isSwapConfirmed]);

  /**
   * Resolve token addresses to Uniswap v3 compatible Base Sepolia addresses
   * (Maps native ETH 0x0 to WETH if needed by router or handles native payable)
   */
  const resolveTokenAddress = useCallback((rawAddress: string, symbol: string): Address => {
    if (
      symbol === 'ETH' || 
      !rawAddress || 
      rawAddress.toLowerCase() === zeroAddress.toLowerCase()
    ) {
      return UNISWAP_V3_ADDRESSES.WETH as Address;
    }
    return rawAddress as Address;
  }, []);

  /**
   * Check if approval is required for a specific token and amount
   */
  const checkAllowanceRequirement = useCallback(async (
    tokenAddress: string,
    amountWei: bigint,
    userAddress?: Address
  ): Promise<boolean> => {
    const owner = userAddress || activeAddress;
    if (!owner || tokenAddress.toLowerCase() === zeroAddress.toLowerCase()) {
      return false; // Native ETH doesn't require ERC-20 approval
    }

    if (!publicClient) {
      return currentAllowance < amountWei;
    }

    try {
      const allowance = await (publicClient.readContract as any)({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [owner, UNISWAP_V3_ADDRESSES.SWAP_ROUTER as Address],
      });
      return ((allowance as bigint) ?? 0n) < amountWei;
    } catch {
      return currentAllowance < amountWei;
    }
  }, [activeAddress, publicClient, currentAllowance]);

  /**
   * 1. Approve Token with wagmi useWriteContract
   */
  const approveToken = useCallback(async (
    tokenInAddress: string,
    amountToApprove: bigint = maxUint256
  ): Promise<`0x${string}`> => {
    setErrorMessage(null);
    setIsApproving(true);

    try {
      if (tokenInAddress.toLowerCase() === zeroAddress.toLowerCase()) {
        setIsApproving(false);
        return '0x0000000000000000000000000000000000000000000000000000000000000000';
      }

      if (!isAddress(tokenInAddress)) {
        throw new Error(`Invalid token address for approval: ${tokenInAddress}`);
      }

      setSelectedTokenInAddress(tokenInAddress as Address);

      // Trigger ERC-20 Approve onchain with wagmi useWriteContract
      const txHash = await writeApproveAsync({
        address: tokenInAddress as Address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [UNISWAP_V3_ADDRESSES.SWAP_ROUTER as Address, amountToApprove],
        chainId: baseSepolia.id,
      } as any);

      setApproveTxHash(txHash);
      return txHash;
    } catch (err: any) {
      setIsApproving(false);
      const msg = err?.shortMessage || err?.message || 'ERC-20 token approval failed';
      setErrorMessage(msg);
      throw new Error(msg);
    }
  }, [writeApproveAsync]);

  /**
   * 2. Execute Uniswap v3 exactInputSingle on Router Contract
   */
  const executeSwap = useCallback(async (
    params: ExactInputSingleSwapParams
  ): Promise<`0x${string}`> => {
    setErrorMessage(null);
    setIsSwapping(true);
    setSwapSuccess(false);

    try {
      const recipientAddress = (params.recipient || activeAddress || '0x71C824aD3Fe479B92c578f142EbF472bC19638A9') as Address;
      const isNativeIn = params.tokenIn.symbol === 'ETH' || params.tokenIn.address.toLowerCase() === zeroAddress.toLowerCase();
      
      const tokenInResolved = resolveTokenAddress(params.tokenIn.address, params.tokenIn.symbol);
      const tokenOutResolved = resolveTokenAddress(params.tokenOut.address, params.tokenOut.symbol);

      const amountInString = params.amountIn.toString();
      const amountInWei = parseUnits(amountInString, params.tokenIn.decimals);
      
      // Calculate minAmountOut with slippage tolerance if not explicitly provided
      let amountOutMinWei = 0n;
      if (params.minAmountOut !== undefined) {
        amountOutMinWei = parseUnits(params.minAmountOut.toString(), params.tokenOut.decimals);
      } else {
        const slippage = params.slippageTolerance ?? 0.5; // default 0.5%
        amountOutMinWei = 0n;
      }

      const fee = params.feeTier ?? 3000; // default 0.30%
      const deadline = BigInt(Math.floor(Date.now() / 1000) + (params.deadlineMinutes ?? 20) * 60);

      const exactInputSingleParams = {
        tokenIn: tokenInResolved,
        tokenOut: tokenOutResolved,
        fee: fee,
        recipient: recipientAddress,
        deadline: deadline,
        amountIn: amountInWei,
        amountOutMinimum: amountOutMinWei,
        sqrtPriceLimitX96: 0n,
      };

      // Call SwapRouter exactInputSingle with wagmi useWriteContract
      const txHash = await writeSwapAsync({
        address: UNISWAP_V3_ADDRESSES.SWAP_ROUTER as Address,
        abi: UNISWAP_V3_SWAP_ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [exactInputSingleParams],
        value: isNativeIn ? amountInWei : 0n,
        chainId: baseSepolia.id,
      } as any);


      setSwapTxHash(txHash);
      return txHash;
    } catch (err: any) {
      setIsSwapping(false);
      const msg = err?.shortMessage || err?.message || 'Uniswap v3 exactInputSingle execution failed';
      setErrorMessage(msg);
      throw new Error(msg);
    }
  }, [activeAddress, resolveTokenAddress, writeSwapAsync]);

  /**
   * 3. Complete Pipeline: Approve (if required) + Execute exactInputSingle Swap
   */
  const approveAndSwap = useCallback(async (
    params: ExactInputSingleSwapParams
  ): Promise<SwapExecutionResult> => {
    setErrorMessage(null);
    setSwapSuccess(false);

    const amountInString = params.amountIn.toString();
    const amountInNum = parseFloat(amountInString) || 0;
    const amountInWei = parseUnits(amountInString, params.tokenIn.decimals);
    
    setTargetAmountInWei(amountInWei);
    if (params.tokenIn.address && isAddress(params.tokenIn.address)) {
      setSelectedTokenInAddress(params.tokenIn.address as Address);
    }

    try {
      let approvalHash: string | undefined = undefined;
      const isNativeIn = params.tokenIn.symbol === 'ETH' || params.tokenIn.address.toLowerCase() === zeroAddress.toLowerCase();

      // Step A: Check & handle ERC-20 approval if not native ETH
      if (!isNativeIn) {
        const needsApproval = await checkAllowanceRequirement(params.tokenIn.address, amountInWei);
        
        if (needsApproval) {
          setIsApproving(true);
          const hash = await approveToken(params.tokenIn.address, maxUint256);
          approvalHash = hash;
          
          // If in real connected wallet mode, wait for receipt or allow brief confirmation time
          if (publicClient && hash) {
            try {
              await publicClient.waitForTransactionReceipt({ 
                hash, 
                confirmations: 1, 
                timeout: 30000 
              });
            } catch {
              // Fallback wait if RPC polling delay
              await new Promise((r) => setTimeout(r, 2000));
            }
          }
          setIsApproving(false);
        }
      }

      // Step B: Execute Uniswap v3 exactInputSingle swap
      setIsSwapping(true);
      const swapHash = await executeSwap(params);

      // Estimated amount out
      const estimatedOut = params.minAmountOut 
        ? parseFloat(params.minAmountOut.toString()) 
        : amountInNum;

      return {
        success: true,
        swapTxHash: swapHash,
        approveTxHash: approvalHash,
        amountIn: amountInNum,
        amountOutEstimated: estimatedOut,
      };
    } catch (err: any) {
      setIsApproving(false);
      setIsSwapping(false);
      const errorText = err?.shortMessage || err?.message || 'Transaction execution failed';
      setErrorMessage(errorText);

      return {
        success: false,
        amountIn: amountInNum,
        amountOutEstimated: 0,
        error: errorText,
      };
    }
  }, [
    checkAllowanceRequirement, 
    approveToken, 
    executeSwap, 
    publicClient
  ]);

  /**
   * Reset hook state
   */
  const resetState = useCallback(() => {
    setErrorMessage(null);
    setApproveTxHash(null);
    setSwapTxHash(null);
    setIsApproving(false);
    setIsSwapping(false);
    setSwapSuccess(false);
  }, []);

  return {
    // State
    activeAddress,
    isWagmiConnected,
    isApproved,
    isApproving: isApproving || isApprovePending || isApproveConfirming,
    isSwapping: isSwapping || isSwapPending || isSwapConfirming,
    isPending: isApprovePending || isSwapPending || isApproveConfirming || isSwapConfirming,
    isSuccess: swapSuccess || isSwapConfirmed,
    errorMessage,
    approveTxHash,
    swapTxHash,
    swapReceipt,
    currentAllowance,
    isAllowanceLoading,

    // Methods
    setSelectedTokenInAddress,
    setTargetAmountInWei,
    checkAllowanceRequirement,
    approveToken,
    executeSwap,
    approveAndSwap,
    refetchAllowance,
    resetState,
  };
}

export default useUniswapSwapManager;
