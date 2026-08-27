import { useMemo } from 'react';
import { useAccount, useBalance, useReadContract, useBlockNumber } from 'wagmi';
import { formatUnits, formatEther, Address, isAddress } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { useEvmAddress, useCurrentUser } from '@coinbase/cdp-hooks';
import { ERC20_ABI } from '../config/wagmi';
import { TokenAsset } from '../types';
import { INITIAL_TOKEN_ASSETS, UNISWAP_V3_ADDRESSES } from '../data/tokenData';

export interface UseRealtimeOnchainBalancesReturn {
  activeAddress: `0x${string}` | undefined;
  isWalletConnected: boolean;
  blockNumber: bigint | undefined;
  tokens: TokenAsset[];
  rawEthBalance: string;
  totalOnchainUSD: number;
  isLoading: boolean;
  isRefetching: boolean;
  refetchAll: () => Promise<void>;
  source: 'onchain' | 'fallback';
}

/**
 * useRealtimeOnchainBalances
 * Explicitly uses wagmi's `useBalance` for native ETH and `useReadContract` for ERC-20 tokens
 * on Base Sepolia testnet.
 */
export function useRealtimeOnchainBalances(customTokens: TokenAsset[] = INITIAL_TOKEN_ASSETS): UseRealtimeOnchainBalancesReturn {
  // 1. Resolve Connected Wallet Account
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { evmAddress: cdpAddress } = useEvmAddress();
  const { currentUser } = useCurrentUser();

  const activeAddress = useMemo<`0x${string}` | undefined>(() => {
    if (wagmiAddress && isAddress(wagmiAddress)) return wagmiAddress as `0x${string}`;
    if (cdpAddress && isAddress(cdpAddress)) return cdpAddress as `0x${string}`;
    const cdpEvm = currentUser?.evmAccountObjects?.[0]?.address;
    if (cdpEvm && isAddress(cdpEvm)) return cdpEvm as `0x${string}`;
    return '0x71C824aD3Fe479B92c578f142EbF472bC19638A9' as `0x${string}`;
  }, [wagmiAddress, cdpAddress, currentUser]);

  const isWalletConnected = Boolean(isWagmiConnected || cdpAddress || currentUser?.evmAccountObjects?.length);

  // 2. Watch Live Base Sepolia Block Height
  const { data: blockNumber } = useBlockNumber({
    chainId: baseSepolia.id,
    watch: true,
  });

  // 3. Explicit Wagmi `useBalance` for Native ETH
  const {
    data: ethBalanceData,
    isLoading: isEthLoading,
    refetch: refetchEth,
    isRefetching: isEthRefetching,
  } = useBalance({
    address: activeAddress,
    chainId: baseSepolia.id,
    query: {
      enabled: Boolean(activeAddress && isAddress(activeAddress)),
    },
  });

  // 4. Explicit Wagmi `useReadContract` for Core ERC-20 Tokens
  // USDC
  const {
    data: usdcBalData,
    isLoading: isUsdcLoading,
    refetch: refetchUsdc,
    isRefetching: isUsdcRefetching,
  } = useReadContract({
    address: UNISWAP_V3_ADDRESSES.USDC as Address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: activeAddress ? [activeAddress] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: Boolean(activeAddress && isAddress(activeAddress)),
    },
  });

  // WETH
  const {
    data: wethBalData,
    isLoading: isWethLoading,
    refetch: refetchWeth,
    isRefetching: isWethRefetching,
  } = useReadContract({
    address: UNISWAP_V3_ADDRESSES.WETH as Address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: activeAddress ? [activeAddress] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: Boolean(activeAddress && isAddress(activeAddress)),
    },
  });

  // ZIG Gold Stablecoin (ERC-20)
  const zigAddress = '0x98f2195f2A5303D81878d65507E78e063a110000' as Address;
  const {
    data: zigBalData,
    isLoading: isZigLoading,
    refetch: refetchZig,
    isRefetching: isZigRefetching,
  } = useReadContract({
    address: zigAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: activeAddress ? [activeAddress] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: Boolean(activeAddress && isAddress(activeAddress)),
    },
  });

  // BAMBA Stock Token (ERC-20)
  const bambaAddress = '0x71c26b5B1c183E2A2770281F0E4631D6A763b020' as Address;
  const {
    data: bambaBalData,
    isLoading: isBambaLoading,
    refetch: refetchBamba,
    isRefetching: isBambaRefetching,
  } = useReadContract({
    address: bambaAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: activeAddress ? [activeAddress] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: Boolean(activeAddress && isAddress(activeAddress)),
    },
  });

  // SIMBA Stock Token (ERC-20)
  const simbaAddress = '0x88B39B8E3D781F39fDb92C026d36e20C8A90e321' as Address;
  const {
    data: simbaBalData,
    isLoading: isSimbaLoading,
    refetch: refetchSimba,
    isRefetching: isSimbaRefetching,
  } = useReadContract({
    address: simbaAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: activeAddress ? [activeAddress] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: Boolean(activeAddress && isAddress(activeAddress)),
    },
  });

  // NYTEA Stock Token (ERC-20)
  const teaAddress = '0x49B55C7B90fDb16183e2910Fa4D33F89a543B333' as Address;
  const {
    data: teaBalData,
    isLoading: isTeaLoading,
    refetch: refetchTea,
    isRefetching: isTeaRefetching,
  } = useReadContract({
    address: teaAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: activeAddress ? [activeAddress] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: Boolean(activeAddress && isAddress(activeAddress)),
    },
  });

  // MUKURU Stock Token (ERC-20)
  const mukuruAddress = '0x33A19E870D3bA759812586B7dEa51A088F93c444' as Address;
  const {
    data: mukuruBalData,
    isLoading: isMukuruLoading,
    refetch: refetchMukuru,
    isRefetching: isMukuruRefetching,
  } = useReadContract({
    address: mukuruAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: activeAddress ? [activeAddress] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: Boolean(activeAddress && isAddress(activeAddress)),
    },
  });

  // 5. Merge onchain results into TokenAsset collection
  const mergedTokens = useMemo<TokenAsset[]>(() => {
    const rawEthFormatted = ethBalanceData ? formatEther(ethBalanceData.value) : undefined;
    const ethNum = rawEthFormatted ? parseFloat(rawEthFormatted) : undefined;

    return customTokens.map((token) => {
      // Native ETH
      if (token.symbol === 'ETH' || token.address === '0x0000000000000000000000000000000000000000') {
        const liveBal = ethNum !== undefined && !isNaN(ethNum) ? ethNum : token.balance;
        return {
          ...token,
          balance: liveBal,
          balanceUSD: liveBal * token.priceUSD,
        };
      }

      // USDC
      if (token.symbol === 'USDC' && usdcBalData !== undefined && typeof usdcBalData === 'bigint') {
        const parsed = parseFloat(formatUnits(usdcBalData, token.decimals));
        const liveBal = !isNaN(parsed) ? parsed : token.balance;
        return {
          ...token,
          balance: liveBal,
          balanceUSD: liveBal * token.priceUSD,
        };
      }

      // WETH
      if (token.symbol === 'WETH' && wethBalData !== undefined && typeof wethBalData === 'bigint') {
        const parsed = parseFloat(formatUnits(wethBalData, token.decimals));
        const liveBal = !isNaN(parsed) ? parsed : token.balance;
        return {
          ...token,
          balance: liveBal,
          balanceUSD: liveBal * token.priceUSD,
        };
      }

      // ZIG
      if (token.symbol === 'ZIG' && zigBalData !== undefined && typeof zigBalData === 'bigint') {
        const parsed = parseFloat(formatUnits(zigBalData, token.decimals));
        const liveBal = !isNaN(parsed) ? parsed : token.balance;
        return {
          ...token,
          balance: liveBal,
          balanceUSD: liveBal * token.priceUSD,
        };
      }

      // BAMBA
      if (token.symbol === 'BAMBA' && bambaBalData !== undefined && typeof bambaBalData === 'bigint') {
        const parsed = parseFloat(formatUnits(bambaBalData, token.decimals));
        const liveBal = !isNaN(parsed) ? parsed : token.balance;
        return {
          ...token,
          balance: liveBal,
          balanceUSD: liveBal * token.priceUSD,
        };
      }

      // SIMBA
      if (token.symbol === 'SIMBA' && simbaBalData !== undefined && typeof simbaBalData === 'bigint') {
        const parsed = parseFloat(formatUnits(simbaBalData, token.decimals));
        const liveBal = !isNaN(parsed) ? parsed : token.balance;
        return {
          ...token,
          balance: liveBal,
          balanceUSD: liveBal * token.priceUSD,
        };
      }

      // TEA
      if ((token.symbol === 'TEA' || token.symbol === 'NYTEA') && teaBalData !== undefined && typeof teaBalData === 'bigint') {
        const parsed = parseFloat(formatUnits(teaBalData, token.decimals));
        const liveBal = !isNaN(parsed) ? parsed : token.balance;
        return {
          ...token,
          balance: liveBal,
          balanceUSD: liveBal * token.priceUSD,
        };
      }

      // MUKURU
      if (token.symbol === 'MUKURU' && mukuruBalData !== undefined && typeof mukuruBalData === 'bigint') {
        const parsed = parseFloat(formatUnits(mukuruBalData, token.decimals));
        const liveBal = !isNaN(parsed) ? parsed : token.balance;
        return {
          ...token,
          balance: liveBal,
          balanceUSD: liveBal * token.priceUSD,
        };
      }

      return token;
    });
  }, [
    customTokens,
    ethBalanceData,
    usdcBalData,
    wethBalData,
    zigBalData,
    bambaBalData,
    simbaBalData,
    teaBalData,
    mukuruBalData,
  ]);

  const totalOnchainUSD = useMemo(() => {
    return mergedTokens.reduce((sum, t) => sum + (t.balance * t.priceUSD), 0);
  }, [mergedTokens]);

  const refetchAll = async () => {
    await Promise.all([
      refetchEth(),
      refetchUsdc(),
      refetchWeth(),
      refetchZig(),
      refetchBamba(),
      refetchSimba(),
      refetchTea(),
      refetchMukuru(),
    ]);
  };

  const isLoading =
    isEthLoading ||
    isUsdcLoading ||
    isWethLoading ||
    isZigLoading ||
    isBambaLoading ||
    isSimbaLoading ||
    isTeaLoading ||
    isMukuruLoading;

  const isRefetching =
    isEthRefetching ||
    isUsdcRefetching ||
    isWethRefetching ||
    isZigRefetching ||
    isBambaRefetching ||
    isSimbaRefetching ||
    isTeaRefetching ||
    isMukuruRefetching;

  return {
    activeAddress,
    isWalletConnected,
    blockNumber,
    tokens: mergedTokens,
    rawEthBalance: ethBalanceData ? formatEther(ethBalanceData.value) : '0.000',
    totalOnchainUSD,
    isLoading,
    isRefetching,
    refetchAll,
    source: ethBalanceData || usdcBalData !== undefined ? 'onchain' : 'fallback',
  };
}
