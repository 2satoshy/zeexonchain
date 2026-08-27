import React, { useState, useEffect } from 'react';
import { SocialPost } from '../types';
import { INITIAL_SOCIAL_POSTS } from '../data/mockData';
import { MessageSquare, Heart, Share2, TrendingUp, ShieldCheck, Plus, Send, Sparkles, Image as ImageIcon, Flame, Newspaper, RefreshCw, ExternalLink } from 'lucide-react';

interface SocialTimelineViewProps {
  onCopyTrade?: (ticker: string, amount: number) => void;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  snippet: string;
  time: string;
  url: string;
}

export const SocialTimelineView: React.FC<SocialTimelineViewProps> = ({ onCopyTrade }) => {
  const [posts, setPosts] = useState<SocialPost[]>(INITIAL_SOCIAL_POSTS);
  const [newContent, setNewContent] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Market News state
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsGrounded, setNewsGrounded] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/social/posts');
      const data = await res.json();
      if (data && data.data && Array.isArray(data.data)) {
        setPosts(data.data);
      }
    } catch (e) {
      console.warn("Could not fetch API social posts, using cache", e);
    }
  };

  const fetchMarketNews = async () => {
    setNewsLoading(true);
    try {
      const res = await fetch('/api/market-news');
      const data = await res.json();
      if (data && data.news) {
        setNewsItems(data.news);
        setNewsGrounded(data.grounded || false);
      }
    } catch (e) {
      console.error("Failed to fetch market news", e);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchMarketNews();
  }, []);

  const handleLike = async (id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !p.isLiked
        };
      }
      return p;
    }));

    try {
      await fetch(`/api/social/posts/${id}/like`, { method: 'POST' });
    } catch (e) {
      // Ignored
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const contentText = newContent;
    setNewContent('');

    try {
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: 'Tendai Moyo',
          authorHandle: '@tendai_moyo',
          authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          badge: 'Pro Investor',
          content: contentText,
          mediaType: 'flex'
        })
      });
      const data = await res.json();
      if (data && data.data) {
        setPosts(prev => [data.data, ...prev]);
      } else {
        const fallbackPost: SocialPost = {
          id: `post-${Date.now()}`,
          authorName: 'Tendai Moyo',
          authorHandle: '@tendai_moyo',
          authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          badge: 'Pro Investor',
          content: contentText,
          timestamp: 'Just now',
          likes: 1,
          comments: 0,
          isLiked: true
        };
        setPosts(prev => [fallbackPost, ...prev]);
      }
      setSuccessMsg('Trade signal posted successfully to ZEEX Social Timeline!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      setSuccessMsg('Trade signal recorded to timeline.');
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>ZEEX Social Trading • Community & Live News</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Social Timeline & ZSE Market News</h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time financial news on ZSE, Zimbabwean business trends, and community profit flexes.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-2xl text-xs font-semibold">
          Leaderboard: Top 5% APY
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-3 rounded-2xl text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Market News Section with Search Grounding */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">ZSE & Local Business News</h2>
              <p className="text-xs text-slate-400">
                {newsGrounded ? '⚡ Grounded via Google Search' : '📦 Curated Zimbabwe Financial Feed'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchMarketNews}
            disabled={newsLoading}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 border border-white/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${newsLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {newsLoading ? (
          <div className="py-8 text-center text-slate-400 text-xs animate-pulse">
            Fetching latest ZSE & Zimbabwean financial news via search grounding...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {newsItems.map((news) => (
              <div key={news.id} className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 p-4 rounded-2xl flex flex-col justify-between transition-all group">
                <div>
                  <div className="flex justify-between items-center text-[10px] text-emerald-400 font-semibold mb-1">
                    <span>{news.source}</span>
                    <span className="text-slate-400">{news.time}</span>
                  </div>
                  <h3 className="font-bold text-white text-xs leading-snug group-hover:text-blue-400 transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-3">
                    {news.snippet}
                  </p>
                </div>
                <a
                  href={news.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-blue-400 font-medium hover:underline"
                >
                  <span>Read full report</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <textarea
            rows={3}
            placeholder="Flex your returns, share an SME stock pick, or drop a viral trading meme..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <ImageIcon className="w-4 h-4 text-slate-400" />
              <span>Attach lifestyle / flex photo</span>
            </div>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-2xl text-xs shadow-sm transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Post Flex</span>
            </button>
          </div>
        </form>
      </div>

      {/* Posts Timeline Stream */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <img src={post.authorAvatar} alt={post.authorName} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{post.authorName}</span>
                    {post.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {post.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{post.authorHandle} • {post.timestamp}</div>
                </div>
              </div>

              {post.mediaType && (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  post.mediaType === 'flex' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  post.mediaType === 'meme' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {post.mediaType === 'flex' ? '🔥 Profit Flex' : post.mediaType === 'meme' ? '🐸 Trading Meme' : '☕ Lifestyle'}
                </span>
              )}
            </div>

            <p className="text-sm text-slate-800 leading-relaxed">{post.content}</p>

            {/* Attached Lifestyle / Flex / Meme Image */}
            {post.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-96 bg-slate-900">
                <img src={post.imageUrl} alt="Post media" className="w-full h-full object-cover opacity-95 hover:scale-102 transition-transform duration-300" />
              </div>
            )}

            {/* Trade Action Card if attached */}
            {post.tradeAction && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    Trade Signal • {post.tradeAction.type}
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {post.tradeAction.ticker} (${post.tradeAction.amountUSD.toFixed(2)})
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (onCopyTrade && post.tradeAction) {
                      onCopyTrade(post.tradeAction.ticker, post.tradeAction.amountUSD);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Copy Trade</span>
                </button>
              </div>
            )}

            {/* Post Footer Interactions */}
            <div className="flex items-center space-x-6 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center space-x-1.5 transition-colors ${post.isLiked ? 'text-rose-600 font-bold' : 'hover:text-slate-800'}`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600' : ''}`} />
                <span>{post.likes} Likes</span>
              </button>
              <button className="flex items-center space-x-1.5 hover:text-slate-800">
                <MessageSquare className="w-4 h-4" />
                <span>{post.comments} Comments</span>
              </button>
              <button className="flex items-center space-x-1.5 hover:text-slate-800">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
