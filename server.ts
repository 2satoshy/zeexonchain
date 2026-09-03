import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

import stocksRouter from "./server/routes/stocks";
import dexRouter from "./server/routes/dex";
import invoicesRouter from "./server/routes/invoices";
import loansRouter from "./server/routes/loans";
import walletRouter from "./server/routes/wallet";
import socialRouter from "./server/routes/social";
import systemRouter from "./server/routes/system";
import mongodbRouter from "./server/routes/mongodb";
import basePayRouter from "./server/routes/basePay";
import { initMongoDatabase, getMongoStatus } from "./server/db/mongodb";
import { store } from "./server/store";

const app = express();
const PORT = 3000;

// Next.js API compatibility & CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

app.use(express.json());

// Initialize Gemini if API key is present
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// API Health check & Documentation Index with MongoDB status
app.get("/api/health", async (req, res) => {
  const mongoStatus = await getMongoStatus();
  res.json({
    status: "ok",
    version: "2.1.0",
    name: "ZEEX Onchain Securities API",
    network: "Base Sepolia (L2)",
    standard: "ERC-3643 Permissioned",
    database: {
      engine: "MongoDB",
      connected: mongoStatus.connected,
      dbName: mongoStatus.dbName,
      uriConfigured: mongoStatus.uriConfigured,
      mode: mongoStatus.connected ? "ACTIVE_MONGODB_PERSISTENCE" : "IN_MEMORY_FALLBACK",
      collections: mongoStatus.collections || {}
    },
    timestamp: new Date().toISOString(),
    endpoints: {
      database: ["GET /api/mongodb/status", "POST /api/mongodb/sync"],
      basePay: ["POST /api/base-pay/record", "GET /api/base-pay/history", "GET /api/base-pay/:id", "POST /api/base-pay/verify"],
      stocks: ["GET /api/stocks", "GET /api/stocks/:id", "POST /api/stocks/buy", "POST /api/stocks/tokenize", "POST /api/stocks/burn"],
      dex: ["GET /api/dex/tokens", "POST /api/dex/quote", "POST /api/dex/swap", "GET /api/dex/orders", "POST /api/dex/orders", "DELETE /api/dex/orders/:id"],
      invoices: ["GET /api/invoices", "GET /api/invoices/:id", "POST /api/invoices", "POST /api/invoices/fund"],
      loans: ["GET /api/loans", "POST /api/loans/borrow"],
      wallet: ["GET /api/portfolio", "GET /api/transactions", "POST /api/wallet/deposit", "POST /api/wallet/send", "POST /api/wallet/faucet", "POST /api/wallet/dividends"],
      social: ["GET /api/social/posts", "POST /api/social/posts", "POST /api/social/posts/:id/like"],
      system: ["GET /api/oracles/rates", "GET /api/seczim/status", "GET /api/zig/reserves", "GET /api/indexer/stats"],
      ai: ["POST /api/ai-advisor", "POST /api/whatsapp/simulate", "GET /api/market-news"]
    }
  });
});

// Mount modular sub-routers
app.use("/api/mongodb", mongodbRouter);
app.use("/api/base-pay", basePayRouter);
app.use("/api/stocks", stocksRouter);
app.use("/api/dex", dexRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/loans", loansRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/portfolio", (req, res) => {
  res.redirect(307, "/api/wallet/portfolio");
});
app.use("/api/transactions", (req, res) => {
  res.redirect(307, "/api/wallet/transactions");
});
app.use("/api/social", socialRouter);
app.use("/api", systemRouter);

// AI Advisor endpoint for ZEEX Onchain insights
app.post("/api/ai-advisor", async (req, res) => {
  try {
    const { prompt, portfolioContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback response if API key is not configured
      return res.json({
        reply: "ZEEX AI Advisor (Offline Mode): Based on current SECZim regulations and ZSE Debtbridge trust metrics, Takura Agro (TKRA.zx) and Nyanga Solar (NYNG.zx) exhibit robust USD-hedged cash flows with >9% dividend yields. Consider fractional dollar allocations starting from $1 to diversify across sectors."
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are the chief AI financial advisor for ZEEX Onchain, the SECZim-licensed digital SME exchange operating inside ZSE Holdings on Base. 
      Context of user portfolio: ${JSON.stringify(portfolioContext || {})}
      User query: ${prompt}
      
      Provide expert, professional, concise investment and working capital advice regarding Zimbabwean tokenized SME equities, InvoiceX discounting, $ZIG stablecoin stability, and fractional ownership from $1. Keep the tone sophisticated, bank-grade, and trustworthy.`
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("AI Advisor error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI advice" });
  }
});

// WhatsApp Bot command simulation endpoint
app.post("/api/whatsapp/simulate", async (req, res) => {
  try {
    const { message, phoneNumber } = req.body;
    const cleanMsg = (message || "").trim().toLowerCase();

    let replyText = "";
    let actionCard = undefined;

    if (cleanMsg.includes("balance") || cleanMsg.includes("wallet")) {
      replyText = `📊 *ZEEX WhatsApp Wallet (${phoneNumber || '+263 77 123 4567'})*\n\n• USD Balance: $1,420.50\n• $ZIG Balance: ZIG 36,933.00\n• Tokenized Equity: $2,840.00\n• Total Net Worth: $4,260.50\n\n_Secured by Base & ZSE Debtbridge Trust._`;
    } else if (cleanMsg.includes("buy") || cleanMsg.includes("invest")) {
      replyText = `✅ *Order Executed Successfully!*\n\nYou purchased fractional shares via WhatsApp Pay:\n• Asset: Nyanga Solar (NYNG.zx)\n• Amount: $50.00 (58.8 Units)\n• Settlement: Base L2 Instant Settlement\n• Custody: ZSE Debtbridge Trust #411`;
      actionCard = {
        type: 'trade' as const,
        title: 'WhatsApp Trade Confirmation',
        details: { Asset: 'NYNG.zx', Units: '58.8', Total: '$50.00', Status: 'Settled' }
      };
    } else if (cleanMsg.includes("send") || cleanMsg.includes("transfer")) {
      replyText = `💸 *Transfer Successful!*\n\nYou successfully sent 250 $ZIG (~$9.61) to recipient phone number +263 77 988 1234.\nGas fee: 0.0001 ETH (Sponsored by ZEEX Base Relay).`;
      actionCard = {
        type: 'transfer' as const,
        title: 'P2P Transfer Receipt',
        details: { Recipient: '+263 77 988 1234', Amount: '250.00 $ZIG', Network: 'Base L2' }
      };
    } else if (cleanMsg.includes("help") || cleanMsg.includes("menu")) {
      replyText = `🤖 *ZEEX WhatsApp Bot Menu*\n\nReply with any command:\n1. *balance* - Check portfolio & cash balances\n2. *buy [ticker] [amount]* - Buy tokenized shares instantly\n3. *send [amount] [zig/usd] to [phone]* - P2P transfer\n4. *invoices* - View active InvoiceX yields\n5. *zig* - Check Zimbabwe Gold stablecoin rate`;
    } else {
      replyText = `🤖 *ZEEX Assistant*\n\nI received: "${message}". Type *menu* to see available WhatsApp trading commands or *balance* to check your account.`;
    }

    res.json({ reply: replyText, actionCard, timestamp: new Date().toLocaleTimeString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Market News endpoint with Google Search grounding
app.get("/api/market-news", async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        news: [
          {
            id: 'news-1',
            title: 'ZSE SME Exchange Surpasses $50M Market Capitalization as Base L2 Adoption Accelerates',
            source: 'The Herald Business',
            snippet: 'Tokenized fractional equities on the ZSE Debtbridge Trust have recorded phenomenal trading volumes driven by diaspora and retail inflows.',
            time: '2 hours ago',
            url: '#'
          },
          {
            id: 'news-2',
            title: 'Econet Wireless (ECO.zw) Announces Interim USD Dividend Payout Backed by Onchain Escrow',
            source: 'Financial Gazette',
            snippet: 'Shareholders holding digital fractional units will receive automated USDC and $ZIG stablecoin distributions directly to their Base wallets.',
            time: '5 hours ago',
            url: '#'
          },
          {
            id: 'news-3',
            title: 'SECZim Approves New Guidelines for Digital Asset Custody and DebtBridge SBLOC Rails',
            source: 'ZBC News',
            snippet: 'Regulatory clarity opens doors for institutional working capital discounting and tokenized SME invoice financing across Zimbabwe.',
            time: '1 day ago',
            url: '#'
          }
        ],
        grounded: false
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Provide 3 recent financial news headlines and summaries regarding Zimbabwe Stock Exchange (ZSE), local business trends, and SME equities. Format strictly as a JSON array of objects with keys: id, title, source, snippet, time, url.',
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    let newsItems = [];
    try {
      let text = response.text || '';
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        newsItems = parsed;
      }
    } catch (e) {
      newsItems = [
        {
          id: 'news-1',
          title: 'ZSE SME Exchange Surpasses $50M Market Cap on Base L2 Rails',
          source: 'ZSE Market Watch',
          snippet: response.text?.slice(0, 150) || 'Tokenized equities record strong momentum.',
          time: 'Today',
          url: '#'
        }
      ];
    }

    res.json({ news: newsItems, grounded: true });
  } catch (error: any) {
    console.error("Market news error:", error);
    res.json({
      news: [
        {
          id: 'news-1',
          title: 'ZSE SME Exchange Surpasses $50M Market Capitalization',
          source: 'The Herald Business',
          snippet: 'Tokenized fractional equities record robust trading volumes.',
          time: '3 hours ago',
          url: '#'
        }
      ],
      grounded: false
    });
  }
});

async function startServer() {
  // Initialize MongoDB connection in the background
  initMongoDatabase()
    .then(async (connected) => {
      if (connected) {
        await store.syncWithMongoDB();
      }
    })
    .catch((err) => {
      console.warn("[MongoDB] Startup connection note:", err.message);
    });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ZEEX Onchain server running on http://localhost:${PORT}`);
  });
}

startServer();
