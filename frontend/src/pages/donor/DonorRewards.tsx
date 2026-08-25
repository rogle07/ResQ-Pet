import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Award,
  Heart,
  Sparkles,
  ShieldCheck,
  Crown,
  Download,
} from 'lucide-react';
import { DONOR_REWARDS } from '@/data/donorMockData';

export const DonorRewards: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 font-sans text-xs">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/donor" className="hover:text-purple-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-purple-800 dark:text-purple-400">Rewards & Badges</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          Your Kindness Badges & Status <Award className="h-6 w-6 text-purple-600" />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Milestone honors acknowledging your generosity in safeguarding voiceless animals.
        </p>
      </div>

      {/* Donor Tier Status Banner */}
      <div className="rounded-3xl border border-purple-100 bg-gradient-to-r from-purple-700 to-indigo-800 p-6 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-amber-300">
              <Crown className="h-6 w-6 fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-purple-200">Current Donor Tier</span>
              <h2 className="text-xl font-black">Angel Patron (Tier IV)</h2>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2 text-xs font-bold text-purple-900 shadow hover:bg-purple-50"
          >
            <Download className="h-4 w-4" /> Download Certificate
          </button>
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-[11px] font-semibold text-purple-200">
            <span>Impact Milestone Progress</span>
            <span>320 / 500 Kindness Score (64%)</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-amber-400" style={{ width: '64%' }} />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DONOR_REWARDS.map((badge) => (
          <div
            key={badge.id}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                {badge.iconName === 'Heart' && <Heart className="h-5 w-5 fill-current" />}
                {badge.iconName === 'Award' && <Award className="h-5 w-5" />}
                {badge.iconName === 'Sparkles' && <Sparkles className="h-5 w-5" />}
                {badge.iconName === 'ShieldCheck' && <ShieldCheck className="h-5 w-5" />}
              </div>
              <span className="rounded-lg bg-purple-100 px-2 py-0.5 text-[9px] font-bold text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                {badge.tier}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xs">{badge.title}</h3>
              <p className="text-[11px] text-slate-400 mt-1">{badge.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
              Unlocked on: {badge.unlockedDate}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default DonorRewards;
