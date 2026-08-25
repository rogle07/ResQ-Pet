import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Heart,
  Award,
  Gift,
} from 'lucide-react';
import { FINDER_REWARD_INFO } from '@/data/finderMockData';

export const FinderHowToHelp: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/finder" className="hover:text-purple-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-purple-800 dark:text-purple-400">How to Help</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Ways to Support Animals & Earn Rewards 🎖️
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          From on-spot reporting and summer water drives to foster volunteering and reward points redemption.
        </p>
      </div>

      {/* Hero Points Card */}
      <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-500 to-indigo-700 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-200">Your Impact Balance</span>
          <h2 className="text-4xl font-black mt-1">{FINDER_REWARD_INFO.currentPoints} Thank You Points</h2>
          <p className="text-xs text-purple-100 mt-1 max-w-md">
            You are currently at <strong>{FINDER_REWARD_INFO.title} ({FINDER_REWARD_INFO.tier} Tier)</strong>. Earn 180 more points to unlock Gold Guardian status!
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            to="/finder/report"
            className="rounded-2xl bg-white px-5 py-2.5 text-xs font-black text-purple-900 hover:bg-purple-50 shadow-md transition-all hover:scale-105"
          >
            + Report Animal (+50 Pts)
          </Link>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="space-y-3">
        <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
          Redeem Your Thank You Points
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Gift className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">ResQPet Emergency First Aid Kit</h4>
            <p className="text-slate-500">Antiseptic spray, sterile cotton, bandage rolls, and protective gloves shipped to your home.</p>
            <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800">
              <span className="font-mono font-bold text-purple-700">400 Points</span>
              <button
                onClick={() => alert('You need 80 more points to redeem the Emergency First Aid Kit!')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-100 text-purple-700 font-bold hover:bg-purple-200"
              >
                Redeem
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Award className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Official Volunteer Certificate</h4>
            <p className="text-slate-500">Recognized Animal Welfare Guardian certificate issued by the Uttar Pradesh Animal Care Board.</p>
            <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800">
              <span className="font-mono font-bold text-blue-700">250 Points</span>
              <button
                onClick={() => alert('Certificate issued! Check your registered email.')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
              >
                Download PDF
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400">
              <Heart className="h-6 w-6 fill-current" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Sponsor Stray Puppy Vaccination</h4>
            <p className="text-slate-500">Convert your points into a 7-in-1 DHLPP vaccine dose administered to an indie street puppy.</p>
            <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800">
              <span className="font-mono font-bold text-pink-700">300 Points</span>
              <button
                onClick={() => alert('Points converted! 1 Puppy vaccination sponsored.')}
                className="px-3.5 py-1.5 rounded-xl bg-pink-600 text-white font-bold hover:bg-pink-700"
              >
                Sponsor Dose
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FinderHowToHelp;
