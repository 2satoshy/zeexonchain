# 🇿🇼 ZEEX Onchain (Zimbabwe Enterprise & Equity Exchange)

[![Base L2](https://img.shields.io/badge/Blockchain-Base%20Sepolia%20L2-0052FF?style=flat&logo=ethereum)](https://base.org)
[![ERC-3643 Permissioned](https://img.shields.io/badge/Standard-ERC--3643%20Securities-4A90E2?style=flat)](https://erc3643.org)
[![Base RWA](https://img.shields.io/badge/Standard-Base%20RWA%20Tokenization-FF6B00?style=flat)](https://base.org)
[![SECZim Sandbox](https://img.shields.io/badge/Regulator-SECZim%20Sandbox%20(SI%20114/2024)-008751?style=flat)](https://seczim.co.zw)
[![MongoDB Persistence](https://img.shields.io/badge/Database-MongoDB%20Dual--Mode-47A248?style=flat&logo=mongodb)](https://mongodb.com)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Express Backend](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-000000?style=flat&logo=express)](https://expressjs.com)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%203.6-8E75FF?style=flat&logo=google)](https://ai.google.dev)

> **The next-generation tokenized securities, real-world asset (RWA) tokenization, working capital, and decentralized capital market layer for Zimbabwean SMEs and African enterprises — built on Base Layer 2 with SECZim regulatory compliance, MongoDB persistence, and Base Account smart wallet integration.**

---

## 📖 Table of Contents

- [Overview & Problem Statement](#-overview--problem-statement)
- [Key Features & Modules](#-key-features--modules)
  - [1. 🚀 Deployed Tokenized B20 Stocks & 100-Stock First-Sign-In Airdrop](#1--deployed-tokenized-b20-stocks--100-stock-first-sign-in-airdrop)
  - [2. 🏛️ Base RWA Asset Tokenization & Distributions Engine](#2-️-base-rwa-asset-tokenization--distributions-engine)
  - [3. 💳 Base Pay Modal & Sponsored Gas Paymaster](#3--base-pay-modal--sponsored-gas-paymaster)
  - [4. 🔑 Base Account SIWE Auth & Isolated User Profiles](#4--base-account-siwe-auth--isolated-user-profiles)
  - [5. 🍃 MongoDB Dual-Mode Persistence & Sync Engine](#5--mongodb-dual-mode-persistence--sync-engine)
  - [6. ⚖️ Real Onchain Balance Resolver (RPC vs Demo)](#6-️-real-onchain-balance-resolver-rpc-vs-demo)
  - [7. 📈 SME Equity Tokenization & Corporate Actions](#7--sme-equity-tokenization--corporate-actions)
  - [8. 🔄 Hybrid DEX & AMM Orderbook](#8--hybrid-dex--amm-orderbook)
  - [9. 📑 InvoiceX Working Capital Factoring](#9--invoicex-working-capital-factoring)
  - [10. 🏦 DebtBridge Collateralized Credit Lines (SBLOC)](#10--debtbridge-collateralized-credit-lines-sbloc)
  - [11. 💬 WhatsApp Conversational Banking & Gemini AI Advisor](#11--whatsapp-conversational-banking--gemini-ai-advisor)
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
- **Base Sepolia Live ERC-20 Stock Tokens:** Real ERC-20 stock token contracts deployed on Base Sepolia (`1,000,000` supply each) with an automated **100-stock per company airdrop** on first user sign-in.
- **Base RWA Tokenization:** Institutional issuance of Real World Assets (commodities, infrastructure, agricultural yields) under strict SECZim rules.
- **Base Pay & Account Abstraction:** Instant 1-click Base Pay checkout, ERC-6492 SIWE authentication, and paymaster-sponsored gas fees.
- **MongoDB Cloud Persistence:** Dual-mode database persistence with MongoDB Atlas integration and fast in-memory fallback.

---

## ⚡ Key Features & Modules

### 1. 🚀 Deployed Tokenized B20 Stocks & 100-Stock First-Sign-In Airdrop
- **Base Sepolia Deployed Contracts:** Real standard ERC-20 stock token contracts deployed on Base Sepolia (Chain ID `84532`) with 1,000,000 fixed initial supply each:
  - `BAMBA` — Bamba Cold Chain Logistics
  - `SIMBA` — Simba Solar Micro-Grids
  - `TEA` — Nyanga Specialty Tea Equity
  - `MUKURU` — Mukuru Macadamia & Avocado Exporters
- **Automated First-Sign-In Airdrop Facility:** Every user signing in for the first time via Base Account / SIWE automatically receives **100 stock tokens from EACH of the 4 test companies (400 stocks total)** transferred directly to their wallet on Base Sepolia.
- **Onchain & Portfolio Verification:** Airdrop status and claim transaction hashes are tracked in MongoDB (`airdrops` collection) and reflected instantly in the user's isolated portfolio.

### 2. 🏛️ Base RWA Asset Tokenization & Distributions Engine
- **Real-World Asset Registry:** Tokenize tangible underlying assets (e.g., Takura Agro Commodities `TKRA`) with SECZim filing numbers (`SECZ-RWA-2026-0914`) and CSD custody escrow details.
- **Onchain Distribution Engine:** Automated quarterly dividend and revenue distribution payouts claimable in USDC or $ZIG.
- **Whitelist Compliance Enforcement:** Country restriction rules, accredited investor limits, and address-level KYC whitelisting.

### 3. 💳 Base Pay Modal & Sponsored Gas Paymaster
- **1-Click Base Pay Modal:** Seamless payment rail supporting instant base payments on mainnet and Sepolia testnet (`/api/base-pay/record`, `/api/base-pay/verify`).
- **Paymaster Gas Sponsorship:** EIP-4337 Account Abstraction paymaster sponsorship via Coinbase Developer Platform (CDP) API.

### 4. 🔑 Base Account SIWE Auth & Isolated User Profiles
- **ERC-6492 Smart Wallet Signature Verification:** Authenticate EOAs and undeployed Base Smart Wallets seamlessly using Viem public client verification.
- **Isolated User Session Portfolios:** Isolated balance maps per authenticated wallet address with historical activity audit logs (`SIGN_IN`, `BUY_SHARES`, `CLAIM_AIRDROP`, `BASE_PAY`).

### 5. 🍃 MongoDB Dual-Mode Persistence & Sync Engine
- **MongoDB Atlas Integration:** Full CRUD persistence across 15 collections (`users`, `sessions`, `user_activity_logs`, `user_portfolios`, `deployed_tokens`, `airdrops`, `stocks`, `tokens`, `invoices`, `loans`, `trade_orders`, `social_posts`, `base_payments`, `rwa_assets`, `rwa_distributions`).
- **Auto-Sync & Resilient Fallback:** Automatically syncs in-memory seed state to MongoDB on server startup; falls back cleanly to memory if offline.

### 6. ⚖️ Real Onchain Balance Resolver (RPC vs Demo)
- **Guest / Demo Mode:** Unauthenticated visitors view rich demo balances for demonstration purposes.
- **Real Onchain Wallet Mode:** Once signed in via Base Account, MetaMask, or Coinbase Wallet, the app queries live RPC RPC nodes (Viem/Wagmi) across Base Mainnet and Sepolia Testnet to display real wallet ERC-20 & ETH balances.

### 7. 📈 SME Equity Tokenization & Corporate Actions
- **Stock Catalog & Sector Filtering:** Explore tokenized SME equities in Agribusiness, Clean Energy, Logistics, FinTech, and Mining.
- **Fractional Equity Execution:** Purchase fractional shares from $1 USD with instant L2 block finality.
- **Regulated Stock Burn & Delisting:** Formal corporate share buyback, capital reduction, and tender redemption workflows.

### 8. 🔄 Hybrid DEX & AMM Orderbook
- **Uniswap V3 Concentrated Liquidity Calculator:** Simulated multi-fee tiers (0.05%, 0.30%, 1.00%) with price impact calculations.
- **Spot Limit & Market Orderbook:** Real-time limit order placement, execution simulation, and order cancellation.

### 9. 📑 InvoiceX Working Capital Factoring
- **Accounts Receivable Discounting:** Trade invoices from top buyers (OK Zimbabwe, Spar, Cresta Hotels) tokenized into yield notes (12–16% APY).
- **Crowdfunded Yield Pools:** Fractional funding of invoices with automated principal and interest maturity payouts.

### 10. 🏦 DebtBridge Collateralized Credit Lines (SBLOC)
- **Securities-Backed Lines of Credit:** Borrow instant USD/$ZIG against tokenized SME equity collateral without selling stock holdings.
- **LTV Ratio Health Monitoring:** Real-time LTV tracking (up to 65% LTV) with fixed low-interest rates.

### 11. 💬 WhatsApp Conversational Banking & Gemini AI Advisor
- **Conversational Banking Simulator:** WhatsApp interface supporting `balance`, `buy [ticker]`, `send [amount] [phone]`, and `help`.
- **Google Gemini 3.6 Flash Advisor:** Grounded financial advice on Zimbabwean equities, $ZIG stability, and portfolio diversification.

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
                                  │ • MongoDB Persistence ACID│ • Gemini AI Advisor Engine │
                                  │ • Onchain Stock Deployer  │ • Base Pay & Airdrop Engine│
                                  │ • Base RWA Compliance Engine • Viem / Wagmi RPC Gateway│
                                  └───────────────────────────┬────────────────────────────┘
                                                              │
                    ┌─────────────────────────────────────────┼────────────────────────────────────────┐
                    ▼                                         ▼                                        ▼
    ┌───────────────────────────────┐     ┌──────────────────────────────────────┐     ┌──────────────────────────────┐
    │       BASE SEPOLIA L2         │     │         ZSE DEBTBRIDGE TRUST         │     │     MONGODB CLOUD DATABASE   │
    │  • ERC-20 Stock Contracts     │     │  • Stanbic Nominees Custody (1:1)    │     │  • Users & Session Profiles  │
    │  • 100 Stock Airdrop Facility │     │  • SECZim Regulatory Sandbox SI 114  │     │  • Audit Logs & Airdrops     │
    │  • EIP-4337 Account Paymaster │     │  • Physical Share Certificate Vault  │     │  • Deployed Contracts Ledger │
    └───────────────────────────────┘     └──────────────────────────────────────┘     └──────────────────────────────┘
```

---

## 🔌 Interactive REST API Endpoints

### 1. Stock Airdrop & Onchain Deployment
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/airdrop/claim` | Claim 100 stock tokens per company (400 total) for a wallet on Base Sepolia |
| `GET` | `/api/airdrop/status/:address` | Check if a wallet address has claimed its first-sign-in airdrop |
| `GET` | `/api/airdrop/tokens` | List deployed ERC-20 stock token contract addresses on Base Sepolia |
| `GET` | `/api/airdrop/stats` | Global stats on deployed stock tokens, total airdrops, and deployer balance |

### 2. Base RWA Tokenization
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/rwa/assets` | Retrieve registered Base Real-World Asset tokens and custodian escrow data |
| `GET` | `/api/rwa/assets/:id` | Specific RWA token details, multiplier rules, and eligible holder rules |
| `POST` | `/api/rwa/mint` | Issue and mint new Base RWA asset tokens under SECZim approval |
| `GET` | `/api/rwa/distributions` | List all historical and active yield distributions for RWA assets |
| `POST` | `/api/rwa/distributions` | Create a new USDC/$ZIG yield distribution event |

### 3. Base Pay & SIWE Auth
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/base-pay/record` | Submit Base Pay transaction for verification |
| `GET` | `/api/base-pay/history` | Retrieve Base Pay transaction ledger |
| `GET` | `/api/auth/nonce` | Generate SIWE random authentication nonce |
| `POST` | `/api/auth/verify` | Verify SIWE signature, upsert user in MongoDB, and trigger 100-stock airdrop |
| `GET` | `/api/auth/me` | Fetch authenticated user profile, portfolio, and activity log |

### 4. Database & System Health
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | API status, network details, database status, and endpoint directory |
| `GET` | `/api/mongodb/status` | Current MongoDB Atlas connection health and collection document counts |
| `POST` | `/api/mongodb/sync` | Trigger explicit sync between in-memory state and MongoDB |
| `GET` | `/api/oracles/rates` | Multi-asset price oracles ($ZIG, USD, Gold/oz, ETH, USDC) |

### 5. Stocks, DEX, Invoices, Loans & AI
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/stocks` | List all tokenized SME equities with optional sector filters |
| `POST` | `/api/stocks/buy` | Purchase fractional equity shares starting from $1.00 USD |
| `POST` | `/api/stocks/burn` | Regulated share buyback or full delisting burn |
| `POST` | `/api/dex/swap` | Execute instant zero-gas token swap |
| `POST` | `/api/invoices/fund` | Fund invoice discounting pool and receive yield notes |
| `POST` | `/api/loans/borrow` | Credit line disbursement against stock collateral |
| `POST` | `/api/ai-advisor` | Gemini 3.6 Flash financial advisory insights |

---

## 💻 Tech Stack

- **Frontend:** React 19, TypeScript 5.9, Tailwind CSS v4, Motion, Lucide React, Recharts, D3.js
- **Backend & Middleware:** Node.js, Express, Viem, Wagmi, MongoDB Node Driver (`mongodb`), tsx, esbuild
- **Blockchain:** Base Sepolia L2 (Chain ID 84532), Base Mainnet, ERC-20, ERC-3643, Base RWA Standard, EIP-4337 Paymaster
- **Database:** MongoDB Atlas (Cloud ACID persistence) with in-memory sync engine
- **Artificial Intelligence:** Google Gemini API (`@google/genai`)

---

## 📁 Project Directory Structure

```
.
├── server/                      # Server-side API & state management
│   ├── db/                      # Database module
│   │   └── mongodb.ts           # MongoDB connection pooling & index manager
│   ├── onchain/                 # Onchain deployment & airdrop modules
│   │   ├── erc20Artifact.ts     # ERC-20 contract ABI & bytecode
│   │   ├── deploy.ts            # Base Sepolia stock token deployer module
│   │   └── airdrop.ts           # 100 stock token per company airdrop service
│   ├── routes/                  # Express sub-routers
│   │   ├── airdrop.ts           # Stock token airdrop endpoints
│   │   ├── auth.ts              # Base Account SIWE authentication & user profiles
│   │   ├── basePay.ts           # Base Pay transaction record & verification
│   │   ├── dex.ts               # AMM quotes, swaps, orderbook endpoints
│   │   ├── invoices.ts          # InvoiceX factoring endpoints
│   │   ├── loans.ts             # DebtBridge SBLOC loan endpoints
│   │   ├── mongodb.ts           # Database status & sync endpoints
│   │   ├── rwa.ts               # Base RWA asset tokenization & distributions
│   │   ├── social.ts            # Community investor feed endpoints
│   │   ├── stocks.ts            # SME stock catalog, buy, tokenize, burn endpoints
│   │   ├── system.ts            # Health, SECZim status, oracles, indexer stats
│   │   └── wallet.ts            # Portfolio, deposits, transfers, dividends
│   └── store.ts                 # ACID transactional store & MongoDB sync engine
├── src/                         # Client-side React 19 application
│   ├── components/              # UI views & modals
│   │   ├── BasePayModal.tsx     # 1-click Base Pay checkout modal
│   │   ├── AiAdvisorView.tsx    # Gemini AI financial advisor
│   │   ├── ApiExplorerModal.tsx # Interactive API Console
│   │   ├── SharesView.tsx       # Stock catalog & fractional purchase modal
│   │   ├── StartupListingView.tsx # SME tokenization application view
│   │   └── ...
│   ├── hooks/                   # Custom hooks
│   │   ├── useRealtimeOnchainBalances.ts # Real RPC vs placeholder balance resolver
│   │   └── ...
│   ├── data/
│   │   └── tokenData.ts         # Initial token definitions & Uniswap v3 addresses
│   ├── types.ts                 # Global TypeScript definitions
│   └── App.tsx                  # Root application router
├── server.ts                    # Express entry point & Vite middleware
├── package.json                 # Project configuration
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started & Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/your-username/zeex-onchain.git
cd zeex-onchain
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB_NAME=zeexonchain
GEMINI_API_KEY=your-gemini-api-key
DEPLOYER_PRIVATE_KEY=your-base-sepolia-private-key # Optional: Auto-generated if omitted
```

### 3. Start Development Server
```bash
npm run dev
```
Navigate to **`http://localhost:3000`** in your browser.

---

## 🏛️ Regulatory Sandbox & Legal Custody

- **Regulatory Body:** Securities and Exchange Commission of Zimbabwe ([SECZim](https://seczim.co.zw))
- **Statutory Instrument:** SI 114 of 2024 / Digital Asset Regulatory Sandbox
- **Custodian of Record:** Stanbic Nominees Zimbabwe Ltd (Immobilized CSD Custody)
- **Trust Fiduciary:** ZSE Debtbridge Trust #411
- **Settlement Network:** Base Sepolia Layer 2 & Base Mainnet

---

## 🤝 Contributing & License

Contributions are welcome! Please open an issue or submit a pull request.
Licensed under the [MIT License](LICENSE).
