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

export interface BaseAuthResult {
  ok: boolean;
  address: string;
  message?: string;
  signature?: string;
  token?: string;
}

/**
 * Sign in with Base Account using SIWE (Sign in with Ethereum - EIP-4361)
 * Follows official Base Account SDK Authentication specification.
 */
export async function signInWithBaseAccount(): Promise<BaseAuthResult> {
  const provider = baseAccountSDK.getProvider();

  // 1. Fetch fresh nonce from backend auth route (or fallback to local crypto UUID)
  let nonce = '';
  try {
    const res = await fetch('/api/auth/nonce');
    if (res.ok) {
      nonce = await res.text();
    }
  } catch (err) {
    console.warn('[Base Auth] Fetch nonce fallback:', err);
  }
  if (!nonce) {
    nonce = window.crypto.randomUUID().replace(/-/g, '');
  }

  // 2. Request wallet_connect with signInWithEthereum capabilities
  try {
    const response = (await provider.request({
      method: 'wallet_connect',
      params: [
        {
          version: '1',
          capabilities: {
            signInWithEthereum: {
              nonce,
              chainId: '0x14a34', // Base Sepolia - 84532 (or 0x2105 for Base Mainnet - 8453)
            },
          },
        },
      ],
    })) as any;

    let address = '';
    let message = '';
    let signature = '';

    if (Array.isArray(response) && response.length > 0) {
      address = typeof response[0] === 'string' ? response[0] : response[0]?.address || '';
    } else if (response?.accounts?.[0]) {
      const acc = response.accounts[0];
      address = acc.address;
      const siwe = acc.capabilities?.signInWithEthereum;
      if (siwe) {
        message = siwe.message;
        signature = siwe.signature;
      }
    }

    if (!address) {
      throw new Error('No account address returned from Base Account provider.');
    }

    // 3. Verify signature with server backend if message & signature were produced
    if (message && signature) {
      try {
        const verifyRes = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, message, signature }),
        });
        const verifyData = await verifyRes.json();
        return {
          ok: verifyData.ok !== false,
          address,
          message,
          signature,
          token: verifyData.token,
        };
      } catch (verifyErr) {
        console.warn('[Base Auth] Backend verify fallback:', verifyErr);
      }
    }

    return { ok: true, address, message, signature };
  } catch (error: any) {
    console.error('Failed to authenticate with Base Account:', error);
    // Fallback: if wallet_connect is not supported or rejected, attempt eth_requestAccounts
    if (error?.code === 4200 || error?.message?.includes('not supported')) {
      const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
      if (accounts && accounts.length > 0) {
        return { ok: true, address: accounts[0] };
      }
    }
    throw error;
  }
}

