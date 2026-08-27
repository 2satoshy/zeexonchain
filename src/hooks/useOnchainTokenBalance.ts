import { useAccount, useReadContract, useBalance } from 'wagmi';
import { Address, formatUnits, formatEther, isAddress } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { useEvmAddress } from '@coinbase/cdp-hooks';
import { ERC20_ABI } from '../config/wagmi';

/**
 * Hook to read real-time ETH or ERC-20 Token balance directly from Base Sepolia using wagmi's useAccount and useReadContract/useBalance.
 */
export function useOnchainTokenBalance(tokenAddress?: string, decimals: number = 18) {
  const { address: wagmiAddress, isConnected } = useAccount();
  const { evmAddress: cdpAddress } = useEvmAddress();

  const activeAddress = (wagmiAddress || cdpAddress || '0x71C824aD3Fe479B92c578f142EbF472bC19638A9') as Address;
  const isNativeEth = !tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000';

  // Real-time native ETH balance via wagmi useBalance
  const ethQuery = useBalance({
    address: activeAddress,
    chainId: baseSepolia.id,
    query: {
      enabled: isNativeEth && isAddress(activeAddress),
    }
  });

  // Real-time ERC20 balance via wagmi useReadContract
  const erc20Query = useReadContract({
    address: tokenAddress as Address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [activeAddress],
    chainId: baseSepolia.id,
    query: {
      enabled: !isNativeEth && Boolean(tokenAddress && isAddress(tokenAddress) && isAddress(activeAddress)),
    }
  });

  if (isNativeEth) {
    const rawEth = ethQuery.data ? formatEther(ethQuery.data.value) : '0';
    return {
      formattedBalance: rawEth,
      balanceNumber: parseFloat(rawEth) || 0,
      isLoading: ethQuery.isLoading,
      isRefetching: ethQuery.isRefetching,
      refetch: ethQuery.refetch,
      symbol: 'ETH',
      decimals: 18,
      activeAddress,
      isWalletConnected: isConnected || Boolean(cdpAddress),
      status: ethQuery.status,
    };
  }

  const rawBalance = erc20Query.data !== undefined ? formatUnits(erc20Query.data as bigint, decimals) : '0';
  return {
    formattedBalance: rawBalance,
    balanceNumber: parseFloat(rawBalance) || 0,
    isLoading: erc20Query.isLoading,
    isRefetching: erc20Query.isRefetching,
    refetch: erc20Query.refetch,
    symbol: 'TOKEN',
    decimals,
    activeAddress,
    isWalletConnected: isConnected || Boolean(cdpAddress),
    status: erc20Query.status,
  };
}
