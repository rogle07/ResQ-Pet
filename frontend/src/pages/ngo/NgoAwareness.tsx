import { useState } from 'react';
import { Megaphone, Heart, Share2, Eye, Plus, Calendar, ThumbsUp, X, CheckCircle, Rocket, Edit3 } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  likes: number;
  views: number;
  shares: number;
  image: string;
  status: 'published' | 'draft';
}

const INITIAL_POSTS: Post[] = [
  { id: '1', title: 'Stray Animal Care Drive - Join Us!', content: 'This Sunday, our team will be conducting a city-wide stray animal care drive. We need volunteers and donations! Every helping hand counts.', category: 'Event', date: 'Aug 24, 2026', likes: 142, views: 890, shares: 38, image: '🐾', status: 'published' },
  { id: '2', title: 'How to Help Injured Stray Animals', content: 'Do not panic if you see an injured stray. Call our emergency line immediately. Here are some steps to keep the animal calm while help arrives...', category: 'Educational', date: 'Aug 22, 2026', likes: 287, views: 1420, shares: 95, image: '📚', status: 'published' },
  { id: '3', title: 'Success Story: Bruno Found His Forever Home!', content: 'We are overjoyed to share that Bruno, the injured dog we rescued 3 weeks ago, has been adopted by a loving family in Gomti Nagar!', category: 'Success Story', date: 'Aug 20, 2026', likes: 456, views: 2100, shares: 167, image: '🏡', status: 'published' },
  { id: '4', title: 'Vaccination Campaign Results', content: "Last month's vaccination campaign was a huge success! We vaccinated 312 stray animals across 8 areas of Lucknow. Thank you to all our volunteers!", category: 'Update', date: 'Aug 15, 2026', likes: 203, views: 987, shares: 72, image: '💉', status: 'published' },
  { id: '5', title: 'Winter Care Tips for Stray Animals', content: "As winter approaches, stray animals need extra care. Here's what you can do to help the animals in your neighborhood...", category: 'Educational', date: 'Aug 12, 2026', likes: 0, views: 0, shares: 0, image: '❄️', status: 'draft' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Event: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30',
  Educational: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
  'Success Story': 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
  Update: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
};

const NgoAwareness = () => {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [showCreate, setShowCreate] = useState(false);
  const [filterCat, setFilterCat] = useState('All');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Event');
  const [formContent, setFormContent] = useState('');

  const filtered = filterCat === 'All' ? posts : posts.filter((p) => p.category === filterCat);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSavePost = (status: 'published' | 'draft') => {
    if (!formTitle.trim() || !formContent.trim()) return;

    if (editingPost) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? { ...p, title: formTitle, category: formCategory, content: formContent, status }
            : p
        )
      );
      showToast('Post updated successfully!');
      setEditingPost(null);
    } else {
      const emojiMap: Record<string, string> = {
        Event: '🐾',
        Educational: '📚',
        'Success Story': '🏡',
        Update: '📢',
      };
      const created: Post = {
        id: String(Date.now()),
        title: formTitle,
        content: formContent,
        category: formCategory,
        date: 'Today',
        likes: 0,
        views: 0,
        shares: 0,
        image: emojiMap[formCategory] || '🐾',
        status,
      };
      setPosts((prev) => [created, ...prev]);
      showToast(status === 'published' ? '🎉 Post published to community!' : 'Draft saved!');
    }

    setFormTitle('');
    setFormCategory('Event');
    setFormContent('');
    setShowCreate(false);
  };

  const openEdit = (post: Post) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormCategory(post.category);
    setFormContent(post.content);
    setShowCreate(true);
  };

  const handlePublishDraft = (id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'published' } : p)));
    showToast('Draft published successfully!');
  };

  const handleBoostPost = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              views: p.views + Math.floor(Math.random() * 200) + 150,
              likes: p.likes + Math.floor(Math.random() * 30) + 20,
              shares: p.shares + Math.floor(Math.random() * 15) + 5,
            }
          : p
      )
    );
    showToast('🚀 Post boosted! Engagement increased.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Awareness / Posts</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create and manage public awareness posts and campaigns.</p>
        </div>
        <button
          onClick={() => {
            setEditingPost(null);
            setFormTitle('');
            setFormCategory('Event');
            setFormContent('');
            setShowCreate(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Create Post
        </button>
      </div>

      {/* Feedback Toast */}
      {toastMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{toastMsg}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Posts', value: posts.length, icon: <Megaphone className="h-5 w-5" />, color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20' },
          { label: 'Total Likes', value: posts.reduce((a, p) => a + p.likes, 0), icon: <ThumbsUp className="h-5 w-5" />, color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20' },
          { label: 'Total Views', value: posts.reduce((a, p) => a + p.views, 0).toLocaleString(), icon: <Eye className="h-5 w-5" />, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' },
          { label: 'Total Shares', value: posts.reduce((a, p) => a + p.shares, 0), icon: <Share2 className="h-5 w-5" />, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-[11px] text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'Event', 'Educational', 'Success Story', 'Update'].map((c) => (
          <button key={c} onClick={() => setFilterCat(c)} className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${filterCat === c ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((post) => (
          <div key={post.id} className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              {/* Banner */}
              <div className="flex h-24 items-center justify-center bg-gradient-to-br from-violet-50 to-blue-50 text-5xl dark:from-slate-800 dark:to-slate-800">
                {post.image}
              </div>
              <div className="p-5 pb-2">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${CATEGORY_COLORS[post.category] || 'bg-slate-100 text-slate-600'}`}>{post.category}</span>
                  {post.status === 'draft' && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800">Draft</span>}
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 ml-auto"><Calendar className="h-3 w-3" />{post.date}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 leading-snug">{post.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">{post.content}</p>
                {/* Engagement stats */}
                <div className="flex items-center gap-4 mb-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-rose-500" />{post.likes}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-blue-500" />{post.views}</span>
                  <span className="flex items-center gap-1"><Share2 className="h-3.5 w-3.5 text-violet-500" />{post.shares}</span>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  onClick={() => openEdit(post)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </button>
                {post.status === 'draft' ? (
                  <button
                    onClick={() => handlePublishDraft(post.id)}
                    className="flex-1 rounded-xl bg-violet-600 py-2 text-xs font-bold text-white hover:bg-violet-700 transition-colors"
                  >
                    Publish
                  </button>
                ) : (
                  <button
                    onClick={() => handleBoostPost(post.id)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-violet-50 py-2 text-xs font-bold text-violet-600 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400 transition-colors"
                  >
                    <Rocket className="h-3.5 w-3.5" /> Boost Post
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create / Edit Post Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Post Title *</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Free Rabies Vaccination Camp"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {['Event', 'Educational', 'Success Story', 'Update'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Post Content *</label>
                <textarea
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
                  placeholder="Write your awareness message or update..."
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => handleSavePost('draft')}
                disabled={!formTitle.trim()}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSavePost('published')}
                disabled={!formTitle.trim() || !formContent.trim()}
                className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {editingPost ? 'Update & Publish' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoAwareness;
