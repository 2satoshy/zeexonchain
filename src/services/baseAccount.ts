import { createBaseAccountSDK, pay, getPaymentStatus } from '@base-org/account';

// ZEEX Treasury & Settlement Recipient on Base Sepolia
export const ZEEX_BASE_TREASURY = '0x71C824aD3Fe479B92c578f142EbF472bC19638A9';

// Initialize Base Account SDK singleton
export const baseAccountSDK = createBaseAccountSDK({
  appName: 'ZEEX Onchain Securities',
  appLogoUrl: 'https://base.org/logo.png',
});

export interface BasePaymentResult {
  id: string;
  amountUSD: string;
  recipient: string;
  status: string;
  timestamp: string;
  purpose?: string;
  txHash?: string;
}

/**
 * Execute one-tap USDC payment on Base Sepolia using Base Account SDK pay()
 */
export async function executeBasePay(params: {
  amountUSD: string | number;
  recipient?: string;
  testnet?: boolean;
  purpose?: string;
}): Promise<{ id: string }> {
  const amountStr = typeof params.amountUSD === 'number' 
    ? params.amountUSD.toFixed(2) 
    : params.amountUSD;

  const result = await pay({
    amount: amountStr, // Amount in USD, SDK automatically handles USDC conversion on Base
    to: params.recipient || ZEEX_BASE_TREASURY,
    testnet: params.testnet !== undefined ? params.testnet : true,
  });

  return result;
}

/**
 * Check payment status for a given payment ID
 */
export async function checkBasePaymentStatus(paymentId: string): Promise<{ status: string }> {
  return await getPaymentStatus({ id: paymentId });
}
