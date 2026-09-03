import { Router, Request, Response } from 'express';
import { getMongoStatus, initMongoDatabase } from '../db/mongodb';
import { store } from '../store';

const router = Router();

// GET /api/mongodb/status - Status, ping, and collection metrics
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await getMongoStatus();
    res.json({
      success: true,
      database: 'MongoDB',
      network: 'Base Sepolia L2 Rollup',
      status: {
        ...status,
        mode: status.connected ? 'ACTIVE_MONGODB_PERSISTENCE' : 'IN_MEMORY_FALLBACK',
        message: status.connected
          ? `Connected to MongoDB database '${status.dbName}' with live collections.`
          : status.uriConfigured
          ? 'MongoDB URI is configured but connection could not be established; operating in graceful in-memory fallback.'
          : 'Operating in high-speed in-memory store. Set MONGODB_URI environment variable to activate persistent cloud or local MongoDB database.'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/mongodb/sync - Synchronize and re-seed MongoDB
router.post('/sync', async (req: Request, res: Response) => {
  try {
    await initMongoDatabase();
    await store.syncWithMongoDB();
    const status = await getMongoStatus();
    res.json({
      success: true,
      message: status.connected
        ? 'Successfully synchronized all Base L2 data with MongoDB'
        : 'Synced in-memory state. MongoDB is not connected.',
      status
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
