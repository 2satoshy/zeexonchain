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
    address: '0x21d054b24c1c5a29a0715eaf91d3c016e8b1fb79',
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
    address: '0x5939f638e94b245df1536ac4644a68a5ced99240',
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
    address: '0x5c0b4417a275c343c77746daa9ee7b7cb829b749',
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
    address: '0x8e79eaaf6c536de9f541a80d05d15889f96026d0',
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
    address: '0x90d739cfc503417491aca072b66d59e7d57dbab8',
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
