import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { store } from '../store';
import { AiBrokerActionDetail, AiAdvisorResponse, Transaction } from '../../src/types';

const router = Router();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Intelligent rule-based parser as a reliable fallback or parsing booster
function parseIntentOffline(
  prompt: string,
  portfolio: any,
  stocks: any[],
  tokens: any[]
): {
  reply: string;
  intent: 'ADVISE' | 'TRADE_BUY' | 'TRADE_SELL' | 'TRADE_SWAP' | 'SEND' | 'REQUEST' | 'REBALANCE' | 'INVEST_INVOICE';
  action?: AiBrokerActionDetail;
  shouldAutoExecute: boolean;
  suggestedPrompts: string[];
} {
  const lower = prompt.toLowerCase().trim();

  // Check for Buy Stock
  const buyMatch = lower.match(/buy\s+(\$?[\d,\.]+)?\s*(shares?|units?|worth|of)?\s*([a-zA-Z\.\s]+?)(?:\s+(?:using|with|from|in)\s+([a-zA-Z\$]+))?$/i) ||
                   lower.match(/invest\s+(\$?[\d,\.]+)\s*(?:in|into)\s+([a-zA-Z\.\s]+?)(?:\s+(?:using|with|from)\s+([a-zA-Z\$]+))?$/i);

  // Check for Sell Stock
  const sellMatch = lower.match(/sell\s+([\d,\.]+)\s*(shares?|units?)?\s*(?:of\s+)?([a-zA-Z\.\s]+?)(?:\s+(?:for|to|into)\s+([a-zA-Z\$]+))?$/i);

  // Check for Swap Tokens
  const swapMatch = lower.match(/swap\s+([\d,\.]+)\s*([a-zA-Z\$]+)\s*(?:for|to|into)\s*([a-zA-Z\$]+)/i);

  // Check for Send / Move Value
  const sendMatch = lower.match(/send\s+([\d,\.]+)\s*([a-zA-Z\$]+)\s*to\s*([^\s]+)/i);

  // Check for Request
  const requestMatch = lower.match(/request\s+([\d,\.]+)\s*([a-zA-Z\$]+)\s*(?:from\s+([^\s]+))?(?:\s+for\s+(.+))?/i);

  // Check for Rebalance or Strategy
  const isRebalance = lower.includes('rebalance') || lower.includes('strategy') || lower.includes('allocation') || lower.includes('dividend');

  // Match specific stock helper
  const findStock = (query: string) => {
    const q = query.toLowerCase().replace('.zx', '').trim();
    return stocks.find(s => 
      s.ticker.toLowerCase().replace('.zx', '') === q ||
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase() === q
    );
  };

  // 1. Process Buy Stock
  if (buyMatch) {
    let rawAmount = buyMatch[1] || '';
    let targetName = (buyMatch[3] || buyMatch[2] || '').trim();
    let currency = (buyMatch[4] || buyMatch[3] || 'USDC').replace('$', '').toUpperCase().trim();
    
    // Clean currency and stock name if mismatched
    if (['usdc', 'zig', 'eth', 'usd', 'zar'].includes(targetName.toLowerCase())) {
      const temp = targetName;
      targetName = currency;
      currency = temp.toUpperCase();
    }

    const isDollarAmount = rawAmount.startsWith('$') || !buyMatch[2] || buyMatch[2] === 'worth' || currency === 'USD' || currency === 'USDC';
    const numAmount = parseFloat(rawAmount.replace(/[^\d\.]/g, '')) || 50;
    const stock = findStock(targetName) || stocks[0]; // default Takura Agro if not found

    let sourceAmount = numAmount;
    let targetUnits = 0;
    let usdCost = numAmount;

    if (currency === 'ZIG') {
      usdCost = numAmount / 26;
      targetUnits = Math.round((usdCost / stock.priceUSD) * 100) / 100;
    } else if (currency === 'ETH') {
      usdCost = numAmount * 3120;
      targetUnits = Math.round((usdCost / stock.priceUSD) * 100) / 100;
    } else {
      // USD / USDC
      if (buyMatch[2] && buyMatch[2].startsWith('share')) {
        targetUnits = numAmount;
        usdCost = targetUnits * stock.priceUSD;
        sourceAmount = usdCost;
      } else {
        targetUnits = Math.round((usdCost / stock.priceUSD) * 100) / 100;
      }
    }

    const action: AiBrokerActionDetail = {
      type: 'BUY_STOCK',
      title: `Buy ${targetUnits} Shares of ${stock.ticker}`,
      summary: `Execute purchase of ${targetUnits} ${stock.name} (${stock.ticker}) shares on Base L2 using ${sourceAmount.toLocaleString()} ${currency}.`,
      status: 'PROPOSED',
      sourceCurrency: currency,
      sourceAmount: sourceAmount,
      targetAsset: stock.ticker,
      targetAmount: usdCost,
      targetUnits: targetUnits,
      pricePerUnit: stock.priceUSD,
      expectedYield: `${stock.dividendYield || 8.5}% Annualized Dividend`,
      estimatedGasUSD: 0.00,
      network: 'Base Sepolia L2 (SECZim Custody)'
    };

    return {
      reply: `I have structured your order to purchase **${targetUnits} shares of ${stock.name} (${stock.ticker})** for **${sourceAmount.toLocaleString()} ${currency}** (~$${usdCost.toFixed(2)} USD). \n\n**Stock Metrics:**\n- Market Price: $${stock.priceUSD.toFixed(2)} USD (~${(stock.priceUSD * 26).toFixed(2)} ZIG)\n- Sector: ${stock.sector}\n- Projected Dividend Yield: ${stock.dividendYield}%\n- SECZim Custodian: ${stock.backingTrust || 'Stanbic Nominees Escrow'}\n- Network: Base Sepolia with sponsored gas ($0.00 gas fee)\n\nReview the order specification below and confirm to execute.`,
      intent: 'TRADE_BUY',
      action,
      shouldAutoExecute: lower.includes('execute') || lower.includes('confirm') || lower.includes('buy now'),
      suggestedPrompts: [
        `Confirm and execute buy of ${targetUnits} ${stock.ticker}`,
        `Swap ZIG to USDC first`,
        `View ${stock.ticker} dividend distribution schedule`,
        `Rebalance my portfolio for higher yield`
      ]
    };
  }

  // 2. Process Sell Stock
  if (sellMatch) {
    const units = parseFloat(sellMatch[1].replace(/[^\d\.]/g, '')) || 10;
    const stockName = sellMatch[3].trim();
    const toCurrency = (sellMatch[4] || 'USDC').replace('$', '').toUpperCase().trim();
    const stock = findStock(stockName) || stocks[0];
    const usdVal = units * stock.priceUSD;

    const action: AiBrokerActionDetail = {
      type: 'SELL_STOCK',
      title: `Sell ${units} Shares of ${stock.ticker}`,
      summary: `Liquidate ${units} shares of ${stock.ticker} on Base L2 DEX for ~$${usdVal.toFixed(2)} ${toCurrency}.`,
      status: 'PROPOSED',
      sourceCurrency: stock.ticker,
      sourceAmount: units,
      targetAsset: toCurrency,
      targetAmount: usdVal,
      targetUnits: units,
      pricePerUnit: stock.priceUSD,
      estimatedGasUSD: 0.00,
      network: 'Base Sepolia L2'
    };

    return {
      reply: `Order prepared to sell **${units} shares of ${stock.ticker}** for **~$${usdVal.toFixed(2)} ${toCurrency}**.\n\nProceeds will be credited directly to your liquid onchain balance on Base.`,
      intent: 'TRADE_SELL',
      action,
      shouldAutoExecute: lower.includes('execute') || lower.includes('sell now'),
      suggestedPrompts: [
        `Confirm and execute sale of ${units} ${stock.ticker}`,
        `Keep shares and stake for dividends instead`,
        `Reinvest proceeds into InvoiceX yields`
      ]
    };
  }

  // 3. Process Swap
  if (swapMatch) {
    const amount = parseFloat(swapMatch[1].replace(/[^\d\.]/g, '')) || 100;
    const fromSymbol = swapMatch[2].replace('$', '').toUpperCase().trim();
    const toSymbol = swapMatch[3].replace('$', '').toUpperCase().trim();

    let estimatedOut = amount;
    if (fromSymbol === 'ZIG' && toSymbol === 'USDC') {
      estimatedOut = Math.round((amount / 26) * 100) / 100;
    } else if (fromSymbol === 'USDC' && toSymbol === 'ZIG') {
      estimatedOut = Math.round((amount * 26) * 100) / 100;
    } else if (fromSymbol === 'ETH' && toSymbol === 'USDC') {
      estimatedOut = Math.round((amount * 3120) * 100) / 100;
    }

    const action: AiBrokerActionDetail = {
      type: 'SWAP_TOKENS',
      title: `Swap ${amount.toLocaleString()} ${fromSymbol} → ${estimatedOut.toLocaleString()} ${toSymbol}`,
      summary: `Execute onchain DEX pool swap on Base Sepolia. Zero gas fee (Relay sponsored).`,
      status: 'PROPOSED',
      sourceCurrency: fromSymbol,
      sourceAmount: amount,
      targetAsset: toSymbol,
      targetAmount: estimatedOut,
      estimatedGasUSD: 0.00,
      network: 'Base Sepolia Uniswap V3 Pool'
    };

    return {
      reply: `I have prepared your token swap:\n\n- **Swap In**: ${amount.toLocaleString()} ${fromSymbol}\n- **Estimated Out**: ~${estimatedOut.toLocaleString()} ${toSymbol}\n- **Execution Route**: Base Sepolia Liquidity Pool\n- **Slippage Tolerance**: 0.5%\n- **Gas Fee**: $0.00 (Base Paymaster Sponsored)`,
      intent: 'TRADE_SWAP',
      action,
      shouldAutoExecute: lower.includes('execute') || lower.includes('swap now'),
      suggestedPrompts: [
        `Confirm swap of ${amount} ${fromSymbol} to ${toSymbol}`,
        `Use ${estimatedOut} ${toSymbol} to buy Takura Agro shares`,
        `Check current $ZIG gold reserve ratio`
      ]
    };
  }

  // 4. Process Send / Transfer
  if (sendMatch) {
    const amount = parseFloat(sendMatch[1].replace(/[^\d\.]/g, '')) || 10;
    const tokenSymbol = sendMatch[2].replace('$', '').toUpperCase().trim();
    const recipient = sendMatch[3].trim();

    const action: AiBrokerActionDetail = {
      type: 'SEND_FUNDS',
      title: `Send ${amount} ${tokenSymbol} to ${recipient}`,
      summary: `Transfer ${amount} ${tokenSymbol} across Base L2 rails to ${recipient}.`,
      status: 'PROPOSED',
      sourceCurrency: tokenSymbol,
      sourceAmount: amount,
      recipient: recipient,
      estimatedGasUSD: 0.00,
      network: 'Base L2 / EcoCash Gateway'
    };

    return {
      reply: `Payment dispatch ready:\n\n- **Amount**: ${amount.toLocaleString()} ${tokenSymbol}\n- **Recipient**: ${recipient}\n- **Settlement Time**: ~2 seconds on Base L2\n- **Fees**: $0.00 (Gasless via Base Paymaster)\n\nPlease verify recipient information before signing.`,
      intent: 'SEND',
      action,
      shouldAutoExecute: lower.includes('execute') || lower.includes('send now'),
      suggestedPrompts: [
        `Confirm and dispatch ${amount} ${tokenSymbol} to ${recipient}`,
        `Cancel transfer`,
        `Send via EcoCash mobile wallet instead`
      ]
    };
  }

  // 5. Process Request
  if (requestMatch) {
    const amount = parseFloat(requestMatch[1].replace(/[^\d\.]/g, '')) || 50;
    const tokenSymbol = requestMatch[2].replace('$', '').toUpperCase().trim();
    const recipient = requestMatch[3] || 'Counterparty';
    const memo = requestMatch[4] || 'ZEEX Commercial Settlement';

    const action: AiBrokerActionDetail = {
      type: 'REQUEST_FUNDS',
      title: `Request ${amount} ${tokenSymbol} from ${recipient}`,
      summary: `Create onchain payment request and sharable escrow link for ${amount} ${tokenSymbol}.`,
      status: 'PROPOSED',
      sourceCurrency: tokenSymbol,
      sourceAmount: amount,
      recipient: recipient,
      network: 'Base L2 Settlement'
    };

    return {
      reply: `Created payment request draft for **${amount.toLocaleString()} ${tokenSymbol}** from **${recipient}**.\n\nOnce generated, a secure QR invoice and Base L2 instant payment link will be created for settlement.`,
      intent: 'REQUEST',
      action,
      shouldAutoExecute: true,
      suggestedPrompts: [
        `Generate instant payment link for ${amount} ${tokenSymbol}`,
        `Create recurring corporate billing invoice`,
        `Request in $ZIG instead`
      ]
    };
  }

  // 6. Process Strategy / Rebalance
  if (isRebalance) {
    const action: AiBrokerActionDetail = {
      type: 'REBALANCE_PORTFOLIO',
      title: 'Optimal Yield & Inflation Hedge Rebalance',
      summary: 'Rebalance portfolio into 50% Takura Agro (9.8% dividend yield), 30% Nyanga Solar (8.4% yield), and 20% liquid USDC reserve.',
      status: 'PROPOSED',
      sourceCurrency: 'USD / ZIG',
      sourceAmount: 100,
      targetAsset: 'SME Equity Yield Basket',
      expectedYield: '9.2% Blended Annualized Yield',
      rebalanceSteps: [
        {
          action: 'BUY_STOCK',
          description: 'Allocate $50 USD to Takura Agro-Processing (TKRA.zx)',
          amount: 50,
          currency: 'USD',
          targetAsset: 'TKRA.zx',
          status: 'PENDING'
        },
        {
          action: 'BUY_STOCK',
          description: 'Allocate $30 USD to Nyanga Solar Clean Energy (NYNG.zx)',
          amount: 30,
          currency: 'USD',
          targetAsset: 'NYNG.zx',
          status: 'PENDING'
        },
        {
          action: 'HOLD',
          description: 'Maintain $20 USD in liquid USDC for working capital reserves',
          amount: 20,
          currency: 'USDC',
          targetAsset: 'USDC',
          status: 'PENDING'
        }
      ]
    };

    return {
      reply: `### ZEEX AI Portfolio Strategy & Rebalance Recommendation\n\nBased on your current portfolio valuation and SECZim macroeconomic guidelines for Q3 2026, I recommend the **High-Yield Dollar-Hedged SME Strategy**:\n\n1. **Takura Agro (TKRA.zx) — 50% Allocation**: 9.8% dividend yield, export-backed USD cash flows with Stanbic Nominees trust custody.\n2. **Nyanga Solar Grid (NYNG.zx) — 30% Allocation**: 8.4% yield with fixed tariff off-take contracts.\n3. **USDC Liquid Reserve — 20% Allocation**: Immediate liquidity for invoice discounting or opportunistic market dips.\n\n**Expected Outcome:**\n- Blended Portfolio Yield: **9.2% APY** in hard currency\n- Inflation Protection: **High** (backed by physical agribusiness export and solar infrastructure assets)\n- SECZim Regulatory Tier: **Tier-1 ZSE Listed SME Equities**\n\nWould you like me to execute this rebalancing strategy now?`,
      intent: 'REBALANCE',
      action,
      shouldAutoExecute: lower.includes('execute') || lower.includes('rebalance now'),
      suggestedPrompts: [
        'Execute this rebalancing strategy now',
        'Tilt more towards Agribusiness (70% TKRA)',
        'Allocate $50 from ZIG into Takura Agro',
        'Compare with InvoiceX 90-day discounting yields'
      ]
    };
  }

  // Default Advisory
  return {
    reply: `I am your **ZEEX AI Financial Copilot & Intelligent Broker**, operating on Base L2 under SECZim digital security frameworks.\n\nYou can ask me to analyze your portfolio or command me to trade directly. For example, you can type:\n- *"Buy $50 of Takura Agro using USDC"*\n- *"Buy 100 shares of NYNG with ZIG"*\n- *"Swap 1,000 ZIG to USDC"*\n- *"Send 25 USDC to +263 77 123 4567"*\n- *"Request 50 ZIG from counterparty for delivery"*\n- *"Recommend and execute an optimal dividend strategy with $100"*`,
    intent: 'ADVISE',
    shouldAutoExecute: false,
    suggestedPrompts: [
      'Buy $25 of Takura Agro using USDC',
      'Swap 1,000 ZIG to USDC',
      'What is my current portfolio yield and asset allocation?',
      'Recommend a strategy to maximize dividend yield with $100'
    ]
  };
}

// Helper to execute an action proposal
async function executeActionProposal(
  action: AiBrokerActionDetail,
  walletAddress?: string
): Promise<{ success: boolean; transaction?: Transaction; updatedAction: AiBrokerActionDetail; message: string }> {
  try {
    if (action.type === 'BUY_STOCK') {
      const result = store.buyStockWithCurrency({
        stockIdOrTicker: action.targetAsset || 'TKRA.zx',
        fromCurrency: action.sourceCurrency || 'USDC',
        amountUSD: action.targetAmount || action.sourceAmount || 50,
        units: action.targetUnits,
        walletAddress
      });

      action.status = 'EXECUTED';
      action.txHash = result.transaction.txHash;
      action.reference = result.transaction.reference;

      return {
        success: true,
        transaction: result.transaction,
        updatedAction: action,
        message: `Successfully executed trade: Purchased ${result.units.toFixed(2)} ${result.stock.ticker} for ${result.currencyDeductAmount.toLocaleString()} ${result.fromCurrency}.`
      };
    }

    if (action.type === 'SELL_STOCK') {
      const result = store.sellStockForCurrency({
        stockIdOrTicker: action.sourceCurrency || action.targetAsset || 'TKRA.zx',
        units: action.targetUnits || 10,
        toCurrency: action.targetAsset || 'USDC',
        walletAddress
      });

      action.status = 'EXECUTED';
      action.txHash = result.transaction.txHash;
      action.reference = result.transaction.reference;

      return {
        success: true,
        transaction: result.transaction,
        updatedAction: action,
        message: `Successfully liquidated ${result.units.toFixed(2)} ${result.stock.ticker} shares for $${result.usdVal.toFixed(2)} ${result.toCurrency}.`
      };
    }

    if (action.type === 'SWAP_TOKENS') {
      const result = store.executeSwap(
        action.sourceCurrency || 'ZIG',
        action.targetAsset || 'USDC',
        action.sourceAmount || 100,
        walletAddress
      );

      action.status = 'EXECUTED';
      action.txHash = result.transaction.txHash;
      action.reference = result.transaction.reference;

      return {
        success: true,
        transaction: result.transaction,
        updatedAction: action,
        message: `Successfully swapped ${action.sourceAmount} ${action.sourceCurrency} for ${result.quote.amountOutEstimated.toFixed(2)} ${action.targetAsset} on Base Sepolia.`
      };
    }

    if (action.type === 'SEND_FUNDS') {
      const result = store.sendFunds(
        action.sourceAmount || 10,
        action.sourceCurrency || 'USDC',
        action.recipient || '0xRecipient',
        walletAddress
      );

      action.status = 'EXECUTED';
      action.txHash = result.transaction.txHash;
      action.reference = result.transaction.reference;

      return {
        success: true,
        transaction: result.transaction,
        updatedAction: action,
        message: `Successfully transferred ${action.sourceAmount} ${action.sourceCurrency} to ${action.recipient}.`
      };
    }

    if (action.type === 'REQUEST_FUNDS') {
      const result = store.createPaymentRequest(
        action.sourceAmount || 50,
        action.sourceCurrency || 'USDC',
        walletAddress || 'ZEEX User',
        action.title
      );

      action.status = 'EXECUTED';
      action.reference = result.reference;
      action.paymentLink = result.paymentLink;
      action.txHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      return {
        success: true,
        transaction: result.transaction,
        updatedAction: action,
        message: `Payment request generated: ${result.reference} for ${result.amount} ${result.tokenSymbol}.`
      };
    }

    if (action.type === 'REBALANCE_PORTFOLIO') {
      const executedSteps = [];
      let lastTx: Transaction | undefined;

      if (action.rebalanceSteps && action.rebalanceSteps.length > 0) {
        for (const step of action.rebalanceSteps) {
          if (step.action === 'BUY_STOCK') {
            try {
              const res = store.buyStockWithCurrency({
                stockIdOrTicker: step.targetAsset,
                fromCurrency: step.currency || 'USD',
                amountUSD: step.amount,
                walletAddress
              });
              step.status = 'COMPLETED';
              step.txHash = res.transaction.txHash;
              lastTx = res.transaction;
              executedSteps.push(step);
            } catch (err: any) {
              console.warn('Rebalance sub-step error:', err);
            }
          }
        }
      }

      action.status = 'EXECUTED';
      action.txHash = lastTx ? lastTx.txHash : `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      return {
        success: true,
        transaction: lastTx,
        updatedAction: action,
        message: `Portfolio successfully rebalanced across ${executedSteps.length} assets with Base L2 settlement.`
      };
    }

    throw new Error(`Unsupported action type: ${action.type}`);
  } catch (error: any) {
    action.status = 'FAILED';
    action.error = error.message;
    return {
      success: false,
      updatedAction: action,
      message: error.message || 'Execution failed'
    };
  }
}

// POST /api/ai-advisor and POST /api/ai-advisor/chat
router.post(['/', '/chat'], async (req: Request, res: Response) => {
  try {
    const { prompt, portfolioContext, autoExecute, walletAddress } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const stocks = store.getStocks();
    const tokens = store.getTokens();
    const portfolio = store.getPortfolio();

    const offlineParsed = parseIntentOffline(prompt, portfolioContext || portfolio, stocks, tokens);

    const ai = getGenAI();

    let replyText = offlineParsed.reply;
    let actionProposal: AiBrokerActionDetail | undefined = offlineParsed.action;
    let suggestedPrompts = offlineParsed.suggestedPrompts;
    let intent = offlineParsed.intent;
    let shouldExecute = autoExecute || offlineParsed.shouldAutoExecute;

    if (ai) {
      try {
        const systemPrompt = `You are the ZEEX AI Financial Copilot and Autonomous Broker, a bank-grade SECZim-licensed intelligent advisor operating inside ZSE Holdings on Base L2.
You have the authority to analyze, advise, propose, and execute financial transactions for the user:
- Buy tokenized Zimbabwean SME equities (Takura Agro TKRA.zx at $1.25/9.8% div yield, Nyanga Solar NYNG.zx at $0.85/8.4% div yield, Tanganda Tea TEA at $1.60, Mukuru MUKURU at $2.36, Simba SIMBA at $0.85, Bamba BAMBA at $0.42).
- Swap currencies ($ZIG gold-backed currency at rate 26 ZIG = 1 USD, USDC at $1.00, ETH, Nostro USD).
- Move value, send funds to phone numbers or 0x wallet addresses, or request payments/generate invoices.
- Recommend and execute portfolio rebalancing strategies for yield maximization, capital preservation, or inflation hedging.

Current User Portfolio Context:
${JSON.stringify({
  usdBalance: portfolioContext?.usdBalance ?? portfolio.usdBalance,
  zigBalance: portfolioContext?.zigBalance ?? portfolio.zigBalance,
  totalNetWorthUSD: portfolioContext?.totalBalanceUSD ?? portfolio.totalNetWorthUSD,
  holdings: portfolioContext?.holdings ?? portfolio.holdings,
  availableTokens: tokens.map(t => ({ symbol: t.symbol, balance: t.balance, priceUSD: t.priceUSD })),
  availableStocks: stocks.map(s => ({ ticker: s.ticker, name: s.name, priceUSD: s.priceUSD, dividendYield: s.dividendYield, sector: s.sector }))
})}

User Request: "${prompt}"

Respond in a professional, authoritative, bank-grade tone. Provide both:
1. Clear, insightful financial analysis and rationale grounded in SECZim compliance and Base L2 efficiency.
2. If the user is asking to trade, swap, buy, sell, send, request, or rebalance, structure the precise action proposal.

Output JSON format:
{
  "reply": "Rich markdown text providing expert advice, breakdown of rates, custody trust details, and strategy rationale.",
  "intent": "ADVISE" | "TRADE_BUY" | "TRADE_SELL" | "TRADE_SWAP" | "SEND" | "REQUEST" | "REBALANCE" | "INVEST_INVOICE",
  "shouldExecute": boolean (true if user explicitly commanded 'buy', 'swap', 'send', 'execute', etc.),
  "action": {
    "type": "BUY_STOCK" | "SELL_STOCK" | "SWAP_TOKENS" | "SEND_FUNDS" | "REQUEST_FUNDS" | "REBALANCE_PORTFOLIO" | "INVEST_INVOICE",
    "title": "Short title",
    "summary": "Brief summary",
    "sourceCurrency": "USDC" | "ZIG" | "ETH" | "USD",
    "sourceAmount": number,
    "targetAsset": "TKRA.zx" | "NYNG.zx" | etc,
    "targetAmount": number,
    "targetUnits": number,
    "pricePerUnit": number,
    "recipient": string (if send or request),
    "expectedYield": string,
    "rebalanceSteps": [ ... ]
  },
  "suggestedPrompts": ["string", "string"]
}`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: systemPrompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (geminiRes.text) {
          const parsed = JSON.parse(geminiRes.text);
          if (parsed.reply) replyText = parsed.reply;
          if (parsed.intent) intent = parsed.intent;
          if (parsed.suggestedPrompts && Array.isArray(parsed.suggestedPrompts)) suggestedPrompts = parsed.suggestedPrompts;
          if (parsed.shouldExecute !== undefined) shouldExecute = parsed.shouldExecute || autoExecute;
          if (parsed.action && parsed.action.type) {
            actionProposal = {
              ...parsed.action,
              status: 'PROPOSED',
              estimatedGasUSD: 0.00,
              network: 'Base Sepolia L2 (SECZim Custody)'
            };
          }
        }
      } catch (geminiError: any) {
        console.warn('[AI Advisor] Gemini API call deferred to rule parser:', geminiError.message);
      }
    }

    // If execution is triggered, execute immediately
    let executionReceipt = undefined;
    if (shouldExecute && actionProposal) {
      const execResult = await executeActionProposal(actionProposal, walletAddress);
      actionProposal = execResult.updatedAction;
      if (execResult.success && execResult.transaction) {
        executionReceipt = {
          txHash: execResult.transaction.txHash || `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          network: 'Base Sepolia L2',
          timestamp: 'Just now',
          blockNumber: execResult.transaction.blockNumber || 18496100,
          gasSponsored: true
        };
        replyText = `${replyText}\n\n---\n✅ **Order Executed on Base L2!**\n- **Status**: Settled onchain\n- **Transaction Ref**: \`${execResult.transaction.reference}\`\n- **Tx Hash**: \`${executionReceipt.txHash}\`\n- **Gas Fee**: $0.00 (Sponsored by Base Relay)`;
      }
    }

    // Log session activity for authenticated user
    if (walletAddress) {
      store.logActivity({
        walletAddress,
        action: 'AI_ADVISOR',
        details: {
          prompt,
          intent,
          actionType: actionProposal?.type,
          executed: shouldExecute && !!actionProposal
        }
      }).catch(e => console.warn('AI Advisor activity log notice:', e));
    }

    const updatedPortfolio = walletAddress ? store.getUserPortfolioForAddress(walletAddress) : store.getPortfolio();

    const responsePayload: AiAdvisorResponse = {
      reply: replyText,
      intent,
      actionProposal,
      suggestedPrompts,
      portfolioDiff: {
        newNetWorthUSD: updatedPortfolio.totalNetWorthUSD
      },
      executionReceipt
    };

    res.json(responsePayload);
  } catch (error: any) {
    console.error('AI Advisor error:', error);
    res.status(500).json({ error: error.message || 'Failed to process AI broker request' });
  }
});

// POST /api/ai-advisor/execute - Explicit user execution of a proposed action
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { action, walletAddress } = req.body;
    if (!action || !action.type) {
      return res.status(400).json({ success: false, error: 'Valid action proposal required' });
    }

    const result = await executeActionProposal(action, walletAddress);
    const updatedPortfolio = walletAddress ? store.getUserPortfolioForAddress(walletAddress) : store.getPortfolio();

    res.json({
      success: result.success,
      message: result.message,
      transaction: result.transaction,
      updatedAction: result.updatedAction,
      updatedPortfolio
    });
  } catch (error: any) {
    console.error('Action execution error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to execute action' });
  }
});

export default router;
