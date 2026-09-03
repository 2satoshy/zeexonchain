import { MongoClient, Db, Collection } from 'mongodb';

// Standard Next.js / Node.js MongoClient connection pooling pattern
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME || 'zeex';
const MONGODB_URI = process.env.MONGODB_URI;

interface MongoStatus {
  connected: boolean;
  connecting: boolean;
  dbName: string;
  uriConfigured: boolean;
  lastConnectedAt?: string;
  error?: string;
  collections?: { [key: string]: number };
}

let isConnected = false;
let isConnecting = false;
let lastError: string | null = null;
let lastConnectedAt: string | null = null;
let activeDb: Db | null = null;
let activeClient: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!MONGODB_URI) {
    return null;
  }

  if (activeClient && isConnected) {
    return activeClient;
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable to preserve connection across reloads
    if (!global._mongoClientPromise) {
      const client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      global._mongoClientPromise = client.connect();
    }
    try {
      activeClient = await global._mongoClientPromise;
      isConnected = true;
      lastConnectedAt = new Date().toISOString();
      return activeClient;
    } catch (err: any) {
      lastError = err.message || 'Connection failed';
      isConnected = false;
      global._mongoClientPromise = undefined;
      return null;
    }
  } else {
    try {
      const client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      activeClient = await client.connect();
      isConnected = true;
      lastConnectedAt = new Date().toISOString();
      return activeClient;
    } catch (err: any) {
      lastError = err.message || 'Connection failed';
      isConnected = false;
      return null;
    }
  }
}

export async function getDatabase(): Promise<Db | null> {
  if (activeDb && isConnected) {
    return activeDb;
  }

  try {
    const client = await getMongoClient();
    if (!client) return null;
    activeDb = client.db(DEFAULT_DB_NAME);
    return activeDb;
  } catch (err: any) {
    lastError = err.message;
    return null;
  }
}

export async function getMongoCollection<T = any>(collectionName: string): Promise<Collection<T> | null> {
  const db = await getDatabase();
  if (!db) return null;
  return db.collection<T>(collectionName);
}

export async function getMongoStatus(): Promise<MongoStatus> {
  const status: MongoStatus = {
    connected: isConnected,
    connecting: isConnecting,
    dbName: DEFAULT_DB_NAME,
    uriConfigured: Boolean(MONGODB_URI),
    lastConnectedAt: lastConnectedAt || undefined,
    error: lastError || undefined,
  };

  if (isConnected && activeDb) {
    try {
      const collections = await activeDb.listCollections().toArray();
      const counts: { [key: string]: number } = {};
      for (const col of collections) {
        counts[col.name] = await activeDb.collection(col.name).countDocuments();
      }
      status.collections = counts;
    } catch {
      // Ignored for status ping
    }
  }

  return status;
}

export async function initMongoDatabase(): Promise<boolean> {
  if (!MONGODB_URI) {
    console.log('[MongoDB] MONGODB_URI not configured. Operating in high-speed in-memory store with Base L2 indexer fallback. Provide MONGODB_URI to enable persistent database storage.');
    return false;
  }

  isConnecting = true;
  try {
    console.log(`[MongoDB] Connecting to database '${DEFAULT_DB_NAME}' on ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}...`);
    const db = await getDatabase();
    if (!db) {
      console.warn('[MongoDB] Unable to connect. Gracefully falling back to in-memory store.');
      isConnecting = false;
      return false;
    }

    isConnected = true;
    isConnecting = false;
    lastConnectedAt = new Date().toISOString();
    console.log(`[MongoDB] Connected successfully to database: ${DEFAULT_DB_NAME}`);

    // Create performance indexes for Base L2 collections
    try {
      await db.collection('stocks').createIndex({ id: 1 }, { unique: true });
      await db.collection('stocks').createIndex({ ticker: 1 });
      await db.collection('tokens').createIndex({ symbol: 1 }, { unique: true });
      await db.collection('invoices').createIndex({ id: 1 }, { unique: true });
      await db.collection('loans').createIndex({ id: 1 }, { unique: true });
      await db.collection('transactions').createIndex({ id: 1 }, { unique: true });
      await db.collection('transactions').createIndex({ txHash: 1 });
      await db.collection('trade_orders').createIndex({ id: 1 }, { unique: true });
      await db.collection('social_posts').createIndex({ id: 1 }, { unique: true });
      await db.collection('base_payments').createIndex({ id: 1 }, { unique: true });
      console.log('[MongoDB] Base L2 collections and indexes initialized.');
    } catch (indexErr) {
      console.warn('[MongoDB] Index creation note:', indexErr);
    }

    return true;
  } catch (err: any) {
    isConnecting = false;
    isConnected = false;
    lastError = err.message;
    console.warn(`[MongoDB] Connection attempt encountered error: ${err.message}. Running in resilient fallback mode.`);
    return false;
  }
}
