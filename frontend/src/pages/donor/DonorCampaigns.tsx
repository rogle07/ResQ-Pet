import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Megaphone,
  Heart,
  Search,
} from 'lucide-react';
import { FEATURED_CAMPAIGNS } from '@/data/donorMockData';
import { DonorCampaign } from '@/types/donor';

export const DonorCampaigns: React.FC = () => {
  const [campaigns] = useState<DonorCampaign[]>(FEATURED_CAMPAIGNS);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = campaigns.filter((c) => {
    if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
    if (search.trim() && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12 font-sans text-xs">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/donor" className="hover:text-purple-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-purple-800 dark:text-purple-400">Campaigns</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          Active Emergency Causes ({filtered.length}) <Megaphone className="h-6 w-6 text-purple-600" />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Join hundreds of kind donors backing targeted animal relief drives and medical emergency missions.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {['All', 'Emergency Medical', 'Shelter Support', 'Food Drive', 'Rescue Fleet'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-2xl px-4 py-2 font-bold transition-all ${
                categoryFilter === cat
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((c) => {
          const progressPct = Math.round((c.raisedAmount / c.targetAmount) * 100);
          return (
            <div
              key={c.id}
              className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between group"
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={c.image}
                  alt={c.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white">
                  {c.category}
                </span>
                <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  ⏳ {c.daysLeft} days left
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-sm font-black text-slate-900 dark:text-white">
                    {c.title}
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">
                    {c.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-purple-700 dark:text-purple-400">
                      ₹{c.raisedAmount.toLocaleString()} <span className="text-slate-400 font-normal">/ ₹{c.targetAmount.toLocaleString()}</span>
                    </span>
                    <span className="text-slate-500">{progressPct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block">{c.donorsCount} kind donors supported</span>
                </div>

                <Link
                  to="/donor/donate"
                  className="flex items-center justify-center gap-1.5 w-full rounded-2xl bg-purple-700 py-2.5 text-xs font-bold text-white hover:bg-purple-800 shadow-md shadow-purple-950/20 transition-all hover:scale-105"
                >
                  <Heart className="h-3.5 w-3.5 fill-current" /> Donate to this Cause
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DonorCampaigns;
