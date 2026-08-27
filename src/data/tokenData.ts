import { TokenAsset } from '../types';

export const UNISWAP_V3_ADDRESSES = {
  FACTORY: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
  NPM: '0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2', // NonfungiblePositionManager
  SWAP_ROUTER: '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4', // Uniswap v3 SwapRouter
  WETH: '0x4200000000000000000000000000000000000006',
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  CHAIN_ID: 84532, // Base Sepolia
  NETWORK_NAME: 'Base Sepolia Testnet',
  EXPLORER_URL: 'https://sepolia.basescan.org'
};

export const INITIAL_TOKEN_ASSETS: TokenAsset[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum (Base)',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    balance: 0.35,
    balanceUSD: 945.00,
    priceUSD: 2700.00,
    priceZIG: 70200.00,
    change24h: 3.2,
    isStockToken: false,
    icon: '🔷'
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    balance: 0.15,
    balanceUSD: 405.00,
    priceUSD: 2700.00,
    priceZIG: 70200.00,
    change24h: 3.2,
    isStockToken: false,
    icon: '🟣'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    decimals: 6,
    balance: 1420.50,
    balanceUSD: 1420.50,
    priceUSD: 1.00,
    priceZIG: 26.00,
    change24h: 0.01,
    isStockToken: false,
    icon: '💵'
  },
  {
    symbol: 'ZIG',
    name: 'Zimbabwe Gold Stablecoin',
    address: '0x98f2195f2A5303D81878d65507E78e063a110000',
    decimals: 18,
    balance: 36933.00,
    balanceUSD: 1420.50,
    priceUSD: 0.03846, // 1/26
    priceZIG: 1.00,
    change24h: 0.05,
    isStockToken: false,
    icon: '🪙'
  },
  {
    symbol: 'BAMBA',
    name: 'Bamba Cold Chain Logistics',
    address: '0x71c26b5B1c183E2A2770281F0E4631D6A763b020',
    decimals: 18,
    balance: 1250.00,
    balanceUSD: 525.00,
    priceUSD: 0.42,
    priceZIG: 10.92,
    change24h: 8.4,
    isStockToken: true,
    stockTicker: 'BAMBA',
    icon: '🚛'
  },
  {
    symbol: 'SIMBA',
    name: 'Simba Solar Micro-Grids',
    address: '0x88B39B8E3D781F39fDb92C026d36e20C8A90e321',
    decimals: 18,
    balance: 800.00,
    balanceUSD: 680.00,
    priceUSD: 0.85,
    priceZIG: 22.10,
    change24h: 12.1,
    isStockToken: true,
    stockTicker: 'SIMBA',
    icon: '☀️'
  },
  {
    symbol: 'TEA',
    name: 'Nyanga Specialty Tea Equity',
    address: '0x49B55C7B90fDb16183e2910Fa4D33F89a543B333',
    decimals: 18,
    balance: 550.00,
    balanceUSD: 880.00,
    priceUSD: 1.60,
    priceZIG: 41.60,
    change24h: 4.5,
    isStockToken: true,
    stockTicker: 'NYTEA',
    icon: '🍃'
  },
  {
    symbol: 'MUKURU',
    name: 'Mukuru Macadamia & Avocado Exporters',
    address: '0x33A19E870D3bA759812586B7dEa51A088F93c444',
    decimals: 18,
    balance: 320.00,
    balanceUSD: 755.00,
    priceUSD: 2.36,
    priceZIG: 61.36,
    change24h: 6.2,
    isStockToken: true,
    stockTicker: 'MUKURU',
    icon: '🥑'
  }
];

export const INITIAL_TOKENS = INITIAL_TOKEN_ASSETS;
