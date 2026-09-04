import { BaseRWAAssetToken, BaseRWADistribution } from '../types';

const BASE_RWA_URL = '/api/rwa';

async function fetchRWAJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_RWA_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `RWA API error (${res.status})`);
  }

  return res.json();
}

export const BaseRWAService = {
  /**
   * Fetch all registered Base RWA Asset Tokens
   */
  async getAssets() {
    return fetchRWAJson<{ success: boolean; count: number; data: BaseRWAAssetToken[] }>('/assets');
  },

  /**
   * Fetch specific RWA Asset Token by ticker
   */
  async getAssetByTicker(ticker: string) {
    return fetchRWAJson<{ success: boolean; data: BaseRWAAssetToken }>(`/assets/${encodeURIComponent(ticker)}`);
  },

  /**
   * 1. Create an Asset Token on Base (ERC-3643 RWA compliant tokenized stock deployment)
   */
  async createAssetToken(params: {
    name: string;
    ticker: string;
    maxAuthorizedSupply: number;
    initialSupply: number;
    issuerAddress?: string;
    custodianEscrow?: string;
    seczimFilingId?: string;
    requiresKYC?: boolean;
    allowedCountries?: string[];
  }) {
    return fetchRWAJson<{ success: boolean; message: string; data: BaseRWAAssetToken; txHash: string }>('/create-asset-token', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * 2. Issue / mint additional tokenized equity units of an RWA asset
   */
  async issueUnits(params: {
    ticker: string;
    recipientAddress?: string;
    amountUnits: number;
    reason?: string;
  }) {
    return fetchRWAJson<{ success: boolean; message: string; data: any }>('/issue-units', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * 3. Configure eligibility rules & KYC holder restrictions
   */
  async restrictEligibleHolders(params: {
    ticker: string;
    requiresKYC?: boolean;
    allowedCountries?: string[];
    restrictAddress?: string;
  }) {
    return fetchRWAJson<{ success: boolean; message: string; data: any }>('/restrict-eligible-holders', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * 4. Cancel / clawback blocked units from a restricted address
   */
  async cancelBlockedUnits(params: {
    ticker: string;
    targetAddress: string;
    amountToCancel: number;
    seczimReason?: string;
  }) {
    return fetchRWAJson<{ success: boolean; message: string; data: any }>('/cancel-blocked-units', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * 5. Announce & schedule a dividend / yield distribution
   */
  async announceDistribution(params: {
    ticker: string;
    totalAmountUSD: number;
    payoutDate?: string;
    currency?: 'USDC' | 'ZIG';
  }) {
    return fetchRWAJson<{ success: boolean; message: string; data: BaseRWADistribution }>('/announce-distribution', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * 6. Apply stock split / share multiplier
   */
  async applyMultiplier(params: {
    ticker: string;
    multiplierRatio: number;
  }) {
    return fetchRWAJson<{ success: boolean; message: string; data: any }>('/apply-multiplier', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * 7. Toggle emergency pause / unpause of token transfers
   */
  async pauseTransfers(params: {
    ticker: string;
    pause?: boolean;
  }) {
    return fetchRWAJson<{ success: boolean; message: string; data: any }>('/pause-transfers', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
};
