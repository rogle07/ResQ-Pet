import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Heart,
  MessageSquare,
  Share2,
  Plus,
  Sparkles,
} from 'lucide-react';
import { FINDER_COMMUNITY_POSTS } from '@/data/finderMockData';
import { FinderPost } from '@/types/finder';

export const FinderAwareness: React.FC = () => {
  const [posts, setPosts] = useState<FinderPost[]>(FINDER_COMMUNITY_POSTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // New Post State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'Safety Tip' | 'Rescue Story' | 'Adoption Appeal' | 'First Aid'>('Safety Tip');

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: likedPosts[id] ? p.likes - 1 : p.likes + 1 } : p))
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const post: FinderPost = {
      id: `POST-${Date.now()}`,
      title: newTitle,
      content: newContent,
      author: 'Rahul Sharma',
      authorRole: 'Active Finder & Volunteer',
      category: newCategory,
      likes: 1,
      comments: 0,
      date: 'Just now',
    };

    setPosts([post, ...posts]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/finder" className="hover:text-purple-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-purple-800 dark:text-purple-400">Awareness / Posts</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Community Awareness & Rescue Stories 📢
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Share animal welfare tips, summer hydration drives, and uplifting rescue success stories.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-purple-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-800 shadow-md shadow-purple-950/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" /> Share Story / Tip
        </button>
      </div>

      {/* Posts Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 font-extrabold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{post.author}</h4>
                    <span className="text-[10px] text-slate-400 block">{post.authorRole} • {post.date}</span>
                  </div>
                </div>

                <span className="rounded-xl bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {post.category}
                </span>
              </div>

              <h3 className="font-display text-sm font-black text-slate-900 dark:text-white">
                {post.title}
              </h3>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {post.content}
              </p>

              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-48 w-full rounded-2xl object-cover border border-slate-100 dark:border-slate-800"
                />
              )}

              <div className="flex items-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 hover:text-pink-600 transition-colors ${
                    likedPosts[post.id] ? 'text-pink-600 font-bold' : ''
                  }`}
                >
                  <Heart className={`h-4 w-4 ${likedPosts[post.id] ? 'fill-current' : ''}`} />
                  <span>{post.likes} Likes</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments} Comments</span>
                </div>

                <button
                  onClick={() => alert('Post link copied to clipboard!')}
                  className="flex items-center gap-1.5 hover:text-purple-700 transition-colors"
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4 text-xs">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="font-display text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-600" /> Community Awareness Drive
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              High-ranking Finder posts with validated animal safety guidelines get pinned on the central public portal reaching over 20,000+ citizens in Lucknow!
            </p>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Create Community Post</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-purple-600 focus:outline-none"
                >
                  <option value="Safety Tip">Safety Tip 🛡️</option>
                  <option value="Rescue Story">Rescue Story ❤️</option>
                  <option value="First Aid">First Aid Guide 🩺</option>
                  <option value="Adoption Appeal">Adoption Appeal 🏡</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Post Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Tips for keeping street dogs hydrated in summer..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Story / Content *</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your advice, experience, or update..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 text-white font-bold hover:bg-purple-800"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default FinderAwareness;
