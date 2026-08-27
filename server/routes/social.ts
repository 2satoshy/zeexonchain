import { Router, Request, Response } from 'express';
import { store } from '../store';

const router = Router();

// GET /api/social/posts - Get community feed
router.get('/posts', (req: Request, res: Response) => {
  try {
    const posts = store.getSocialPosts();
    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/social/posts - Create new post
router.post('/posts', (req: Request, res: Response) => {
  try {
    const { authorName, authorHandle, authorAvatar, badge, content, imageUrl, mediaType, tradeAction } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    const post = store.createSocialPost({
      authorName: authorName || 'SME Investor',
      authorHandle: authorHandle || '@zim_trader',
      authorAvatar: authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      badge: badge || 'Verified Trader',
      content,
      imageUrl,
      mediaType: mediaType || 'flex',
      tradeAction
    });

    res.status(201).json({
      success: true,
      message: 'Post shared to ZEEX Social Feed',
      data: post
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/social/posts/:id/like - Like or unlike post
router.post('/posts/:id/like', (req: Request, res: Response) => {
  try {
    const success = store.likePost(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
