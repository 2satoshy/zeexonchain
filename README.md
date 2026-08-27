# 🇿🇼 ZEEX Onchain (Zimbabwe Enterprise & Equity Exchange)

[![Base L2](https://img.shields.io/badge/Blockchain-Base%20Sepolia%20L2-0052FF?style=flat&logo=ethereum)](https://base.org)
[![ERC-3643 Permissioned](https://img.shields.io/badge/Standard-ERC--3643%20Securities-4A90E2?style=flat)](https://erc3643.org)
[![SECZim Sandbox](https://img.shields.io/badge/Regulator-SECZim%20Sandbox%20(SI%20114/2024)-008751?style=flat)](https://seczim.co.zw)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Express Backend](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-000000?style=flat&logo=express)](https://expressjs.com)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%202.5-8E75FF?style=flat&logo=google)](https://ai.google.dev)

> **The next-generation tokenized securities, working capital, and decentralized capital market layer for Zimbabwean SMEs and African enterprises — built on Base Layer 2 with SECZim regulatory compliance.**

---

## 📖 Table of Contents

- [Overview & Problem Statement](#-overview--problem-statement)
- [Key Features & Modules](#-key-features--modules)
- [System Architecture](#-system-architecture)
- [Smart Contract & Compliance Framework](#-smart-contract--compliance-framework)
- [Interactive REST API Endpoints](#-interactive-rest-api-endpoints)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Environment Variables](#-environment-variables)
- [Regulatory Sandbox & Legal Custody](#-regulatory-sandbox--legal-custody)
- [Contributing & License](#-contributing--license)

---

## 🌍 Overview & Problem Statement

Small and Medium Enterprises (SMEs) across Zimbabwe and sub-Saharan Africa generate over 60% of GDP and employment, yet face severe structural bottlenecks:
1. **High Listing Barriers:** Traditional stock exchanges (e.g., ZSE/VFEX) demand millions in compliance fees and rigid minimum capitalization.
2. **Illiquid Working Capital:** Outstanding corporate invoices trap supplier capital for 60–90 days without affordable discounting options.
3. **Currency Volatility & Fragmentation:** High inflation, multiple fiat rails (EcoCash, Innbucks, ZIPIT), and foreign exchange illiquidity restrict retail investment.
4. **Exclusion of Everyday Investors:** Minimum investment sizes prevent 95% of citizens from building wealth in top domestic companies.

### 💡 The ZEEX Solution

**ZEEX (Zimbabwe Enterprise & Equity Exchange)** provides an institutional-grade, fully compliant onchain capital market on **Base L2 (Ethereum Rollup)**:
- **Fractional Equity from $1.00 USD:** Retail investors can purchase fractional shares in vetted SMEs using mobile money (EcoCash, Innbucks), USD, or **$ZIG (Zimbabwe Gold)** stablecoins.
- **ERC-3643 Permissioned Tokenization:** Automated KYC/AML whitelisting, regulatory cap tables, and corporate actions (dividends, share repurchases, delisting burns) supervised under **SECZim Sandbox Framework (SI 114 of 2024)**.
- **InvoiceX Factoring & DebtBridge:** Institutional and retail liquidity pools providing working-capital invoice financing and securities-backed credit lines (SBLOCs).
- **Gasless & Conversational Accessibility:** Account abstraction (EIP-4337) sponsored gas fees and a simulated WhatsApp AI wallet for accessible, zero-friction trading.

---

## ⚡ Key Features & Modules

### 1. 📈 SME Equity Tokenization & Trading
- **Stock Catalogue & Sector Allocation:** Live discovery of tokenized equities across Agribusiness, Clean Energy, Logistics, FinTech, and Mining.
- **Fractional Share Execution:** Real-time buying and selling of equity tokens from as little as $1 with instant Base L2 block settlement (<400ms).
- **Corporate Actions & Regulated Burn:** Regulated share buyback programs, capital reductions, and full stock delisting workflows with instant shareholder payout distributions.
- **Onchain Dividends Engine:** Automated dividend yield payouts (8–14% APR) claimable directly to USD, USDC, or $ZIG balances.

### 2. 🔄 Hybrid DEX & Automated Market Maker (AMM)
- **Uniswap V3 Simulated Concentrated Liquidity:** Custom fee tiers (0.05%, 0.30%, 1.00%), slippage tolerance controls, and price-impact safety guards.
- **Spot Orderbook:** Real-time Limit and Market orders with cancelable pending order state management.
- **Multicurrency Multi-Asset Swaps:** Seamless swaps between USD, USDC, $ZIG, and tokenized SME security tokens.

### 3. 📑 InvoiceX Working Capital Factoring
- **Supply Chain Accounts Receivable Discounting:** Trade invoices from vetted corporate buyers (OK Zimbabwe, Spar, Cresta Hotels) tokenized into yield-bearing debt notes.
- **Crowdfunded Liquidity Pools:** Retail investors fund fractional invoices (yielding 12–16% APY) with automatic principal and yield maturity payouts.
- **Direct Invoice Minting:** SMEs can submit invoices with buyer verification and credit risk rating calculations.

### 4. 🏦 DebtBridge Collateralized Credit Lines (SBLOC)
- **Securities-Backed Lines of Credit:** Borrow instant USD/ZIG working capital against tokenized SME shares without selling long-term stock equity.
- **Automated LTV & Health Factors:** Transparent Loan-to-Value monitoring (up to 65% LTV) with fixed low-interest rates (10–14% APR).

### 5. 💬 WhatsApp Conversational Banking & AI Advisor
- **Conversational Wallet UI:** Interactive WhatsApp interface simulating natural language balance checks (`balance`), SME share purchases (`buy $20 TKRA.zx`), and instant P2P transfers.
- **Gemini-Powered Financial Advisor:** Grounded macroeconomic analysis, SME valuation breakdowns, portfolio diversification guidance, and SECZim compliance Q&A.

### 6. 🛠️ Interactive API Explorer & REST Backend
- Built-in live API console accessible directly from the header navigation to test and inspect all system endpoints with live JSON request and response inspection.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                  CLIENT APPLICATIONS                   │
                                  │  Web Desktop / Mobile SPA  │  WhatsApp Sim / Mini-App  │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │ REST API / JSON-RPC
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │               ZEEX EXPRESS BACKEND ENGINE              │
                                  │                 (Node.js / Express / TS)               │
                                  ├───────────────────────────┬────────────────────────────┤
                                  │ • In-Memory Store & ACID  │ • Gemini AI Advisor Engine │
                                  │ • Order Matching Engine   │ • SECZim Compliance Guard  │
                                  │ • Oracle Price Feeder     │ • Base Indexer & Paymaster │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │
                    ┌─────────────────────────────────────────┼────────────────────────────────────────┐
                    ▼                                         ▼                                        ▼
    ┌───────────────────────────────┐     ┌──────────────────────────────────────┐     ┌──────────────────────────────┐
    │       BASE SEPOLIA L2         │     │         ZSE DEBTBRIDGE TRUST         │     │    MULTI-RAIL FIAT ORACLES   │
    │  • ERC-3643 Security Tokens   │     │  • Stanbic Nominees Custody (1:1)    │     │  • Reserve Bank of Zimbabwe  │
    │  • Uniswap V3 Liquidity Pools │     │  • SECZim Regulatory Sandbox SI 114  │     │  • Live Gold Bullion Rate    │
    │  • EIP-4337 Account Paymaster │     │  • Physical Share Certificate Vault  │     │  • EcoCash & Innbucks APIs   │
    └───────────────────────────────┘     └──────────────────────────────────────┘     └──────────────────────────────┘
```

---

## 📜 Smart Contract & Compliance Framework

All equity securities on ZEEX follow the **ERC-3643 (T-REX - Tokens for Regulated EXchanges)** standard:
- **ONCHAINID Identity Registries:** Ensures only KYC/AML-verified addresses can hold and trade tokenized equity tokens.
- **Compliance Rules Engine:** Enforces investor accreditation limits, maximum shareholder caps, and jurisdiction restrictions onchain.
- **1:1 Legal Custody:** Every digital share corresponds to an immobilized physical or dematerialized share certificate registered under **Stanbic Nominees Zimbabwe Ltd** and **ZSE Debtbridge Trust #411**.
- **Regulated Burn & Buybacks:** Complies with SECZim corporate governance laws allowing companies to formally tender and redeem shares with automated onchain investor payouts.

---

## 🔌 Interactive REST API Endpoints

The application exposes a full REST API for programmatic interaction, algorithmic trading, and partner integrations:

### 1. System & Regulatory Compliance
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, versioning, network metadata, and API manifest |
| `GET` | `/api/seczim/status` | Current SECZim regulatory sandbox status, custody trust, and license parameters |
| `GET` | `/api/oracles/rates` | Multi-asset price oracles ($ZIG, USD, Gold/oz, ETH, USDC) |
| `GET` | `/api/zig/reserves` | Zimbabwe Gold ($ZIG) gold bullion backing ratio and circulating supply |
| `GET` | `/api/indexer/stats` | Base L2 block indexing status, gas savings, and transaction throughput |

### 2. Tokenized Stocks & Corporate Actions
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/stocks` | List all tokenized SME equities with optional `sector`, `search`, and `sort` query params |
| `GET` | `/api/stocks/:id` | Detailed security metrics, financials, price history, and trust metadata |
| `POST` | `/api/stocks/buy` | Purchase fractional equity shares starting from $1.00 USD |
| `POST` | `/api/stocks/tokenize` | Tokenize and deploy a new SME equity token under ERC-3643 |
| `POST` | `/api/stocks/burn` | Regulated share buyback, supply reduction, or full stock delisting |

### 3. Decentralized Exchange (DEX) & AMM
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dex/tokens` | Available tradable tokens, pool reserves, and price metrics |
| `POST` | `/api/dex/quote` | Calculate Uniswap V3 simulated multi-tier swap quote and price impact |
| `POST` | `/api/dex/swap` | Execute instant zero-gas token swap with automatic portfolio updates |
| `GET` | `/api/dex/orders` | Retrieve active spot limit/market orderbook |
| `POST` | `/api/dex/orders` | Place a new limit or market order |
| `DELETE` | `/api/dex/orders/:id`| Cancel a pending limit order and unlock escrowed balances |

### 4. Working Capital & Invoice Factoring (InvoiceX)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/invoices` | Retrieve active trade invoices available for yield funding |
| `GET` | `/api/invoices/:id`| Inspect specific invoice covenants, buyer risk score, and tenor |
| `POST` | `/api/invoices` | Mint a new tokenized invoice for supplier working capital |
| `POST` | `/api/invoices/fund` | Fund an invoice liquidity pool and receive yield-bearing debt tokens |

### 5. Collateralized Loans (DebtBridge)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/loans` | List all active collateralized credit lines and LTV health ratios |
| `POST` | `/api/loans/borrow` | Instant disbursement of credit line against tokenized stock collateral |

### 6. Wallet, Transfers & Dividends
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/wallet/portfolio`| Complete user net worth, asset balances, and 24h P&L performance |
| `GET` | `/api/wallet/transactions`| Comprehensive ledger of onchain transactions and confirmations |
| `POST` | `/api/wallet/deposit` | Multi-rail deposit via EcoCash, Innbucks, Bank Wire, or Crypto |
| `POST` | `/api/wallet/send` | Instant zero-fee peer-to-peer asset transfer |
| `POST` | `/api/wallet/dividends`| Claim accumulated corporate dividend earnings |
| `POST` | `/api/wallet/faucet` | Claim Base Sepolia testnet funding ($250 USDC + 6,500 ZIG) |

### 7. AI Advisor & Social Community
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ai-advisor` | Context-aware AI investment advisory powered by Gemini 2.5 |
| `POST` | `/api/whatsapp/simulate`| WhatsApp chatbot simulator routing commands and transaction queries |
| `GET` | `/api/market-news` | Curated regulatory and macroeconomic market intelligence updates |
| `GET` | `/api/social/posts` | Community investor feed and discussion threads |
| `POST` | `/api/social/posts` | Create a new community post |
| `POST` | `/api/social/posts/:id/like`| Upvote/like a social investment insight |

---

## 💻 Tech Stack

- **Frontend:**
  - [React 19](https://react.dev) with [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS v4](https://tailwindcss.com) for responsive, high-contrast typography and layouts
  - [Motion](https://motion.dev) for smooth micro-interactions and transitions
  - [Lucide React](https://lucide.dev) icons
  - [Recharts](https://recharts.org) & [D3.js](https://d3js.org) for financial charts and sector treemaps
- **Backend & Middleware:**
  - [Node.js](https://nodejs.org) & [Express](https://expressjs.com)
  - [tsx](https://github.com/privatenumber/tsx) for real-time TypeScript execution
  - [esbuild](https://esbuild.github.io/) for high-performance CommonJS production server bundling
- **Web3 & Blockchain:**
  - [Base Sepolia L2](https://base.org) (Ethereum Rollup)
  - [Coinbase Developer Platform (CDP)](https://www.coinbase.com/developer-platform) SDK
  - [Viem](https://viem.sh) & [Wagmi](https://wagmi.sh)
  - EIP-4337 Account Abstraction & Gas Sponsorship
- **Artificial Intelligence:**
  - Google Gemini API (`@google/genai`)

---

## 📁 Project Directory Structure

```
.
├── server/                      # Server-side API & state management
│   ├── routes/                  # Modular Express router controllers
│   │   ├── dex.ts               # AMM quotes, swaps, orderbook endpoints
│   │   ├── invoices.ts          # InvoiceX factoring endpoints
│   │   ├── loans.ts             # DebtBridge SBLOC loan endpoints
│   │   ├── social.ts            # Community investor feed endpoints
│   │   ├── stocks.ts            # SME stock catalog, buy, tokenize, burn endpoints
│   │   ├── system.ts            # Health, SECZim status, oracles, indexer stats
│   │   └── wallet.ts            # Portfolio, deposits, transfers, dividends
│   └── store.ts                 # In-memory ACID transactional mock & state store
├── src/                         # Client-side React 19 application
│   ├── components/              # Modular UI components & screen views
│   │   ├── AiAdvisorView.tsx    # Gemini-powered equity advisor
│   │   ├── ApiExplorerModal.tsx # Interactive API Console & Swagger tester
│   │   ├── BlockchainIndexerHistory.tsx # Live Base L2 transaction tracker
│   │   ├── CoinbaseWalletSection.tsx   # Smart Wallet & Web3 connector
│   │   ├── DashboardView.tsx    # Main portfolio & market summary view
│   │   ├── DebtBridgeView.tsx   # Collateralized lending & credit lines
│   │   ├── InvoiceXView.tsx     # Invoice factoring marketplace
│   │   ├── Navigation.tsx       # Desktop & mobile navigation bar
│   │   ├── SectorTreemap.tsx    # Interactive D3 sector market-cap visualization
│   │   ├── SharesView.tsx       # Stock catalog & fractional purchase modal
│   │   ├── StockDetailView.tsx  # SME financial disclosures & price charts
│   │   ├── StockTokenizationModal.tsx # ERC-3643 token deployment modal
│   │   ├── TradingSwapView.tsx  # Uniswap V3 swap & spot orderbook
│   │   ├── WhatsAppWalletView.tsx # Conversational banking simulator
│   │   └── ZigHubView.tsx       # Zimbabwe Gold ($ZIG) stablecoin hub
│   ├── services/
│   │   └── api.ts               # Centralized client REST API SDK
│   ├── App.tsx                  # Root application state & router orchestrator
│   ├── types.ts                 # Global TypeScript definitions & interfaces
│   └── main.tsx                 # React DOM mount point
├── server.ts                    # Full-stack Express entry point & Vite middleware
├── package.json                 # Project dependencies & build scripts
├── vite.config.ts               # Vite bundler configuration
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/zeex-onchain.git
cd zeex-onchain
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add your `GEMINI_API_KEY` and Coinbase CDP credentials if utilizing live production endpoints)*.

### 4. Start Development Server
```bash
npm run dev
```
The server will boot on port `3000`. Navigate to **`http://localhost:3000`** in your browser.

### 5. Production Build & Start
```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

| Variable | Description | Required |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key for AI Equity Advisor | Optional (defaults to grounded fallback engine) |
| `CDP_PROJECT_ID` | Coinbase Developer Platform Project ID | Optional (for live Smart Wallet connectivity) |
| `VITE_CDP_PROJECT_ID` | Client-side CDP Project ID | Optional |
| `BASE_PAYMASTER_SEPOLIA` | EIP-4337 Paymaster URL for sponsored gas | Optional |

---

## 🏛️ Regulatory Sandbox & Legal Custody

- **Regulatory Body:** Securities and Exchange Commission of Zimbabwe ([SECZim](https://seczim.co.zw))
- **Statutory Instrument:** SI 114 of 2024 / Digital Asset Regulatory Sandbox
- **Custodian of Record:** Stanbic Nominees Zimbabwe Ltd (Immobilized CSD Custody)
- **Trust Fiduciary:** ZSE Debtbridge Trust #411
- **Settlement Network:** Base Sepolia Layer 2 (Rollup to Ethereum)

> *Disclaimer: ZEEX operates within the experimental Fintech Regulatory Sandbox established under the laws of Zimbabwe. Digital asset investments carry financial risk. Ensure you review disclosure prospectuses before purchasing fractional security tokens.*

---

## 🤝 Contributing & License

Contributions are welcome! Please open an issue or submit a pull request for new features, bug fixes, or documentation enhancements.

Licensed under the [MIT License](LICENSE).
