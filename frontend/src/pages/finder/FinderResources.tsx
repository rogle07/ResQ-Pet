import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Phone,
  Clock,
} from 'lucide-react';
import { FINDER_RESOURCE_GUIDES } from '@/data/finderMockData';
import { FinderResourceGuide } from '@/types/finder';

export const FinderResources: React.FC = () => {
  const [guides] = useState<FinderResourceGuide[]>(FINDER_RESOURCE_GUIDES);
  const [selectedGuide, setSelectedGuide] = useState<FinderResourceGuide | null>(FINDER_RESOURCE_GUIDES[0]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/finder" className="hover:text-purple-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-purple-800 dark:text-purple-400">Resources</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Animal First Aid & Legal Care Guides 📚
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Verified medical protocols, safe handling steps, and Indian animal protection law cheat-sheets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guide List (Col 1) */}
        <div className="space-y-3">
          {guides.map((g) => (
            <div
              key={g.id}
              onClick={() => setSelectedGuide(g)}
              className={`p-4 rounded-3xl border transition-all cursor-pointer text-xs ${
                selectedGuide?.id === g.id
                  ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 dark:border-purple-800 shadow-sm'
                  : 'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                  {g.category}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {g.readTime}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">{g.title}</h3>
              <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">{g.summary}</p>
            </div>
          ))}
        </div>

        {/* Selected Guide Details (Col 2 & 3) */}
        {selectedGuide && (
          <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                  {selectedGuide.category}
                </span>
                <h2 className="font-display text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedGuide.title}
                </h2>
              </div>
              <span className="text-xs text-slate-400">{selectedGuide.readTime}</span>
            </div>

            <p className="text-slate-600 dark:text-slate-300 bg-purple-50/50 dark:bg-purple-950/20 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/40 font-medium">
              {selectedGuide.summary}
            </p>

            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Actionable Protocol Steps:</h3>
              <div className="space-y-2">
                {selectedGuide.detailedSteps.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {selectedGuide.helpline && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-center justify-between mt-4">
                <div>
                  <h4 className="font-bold text-red-900 dark:text-red-300">Direct Emergency Support</h4>
                  <p className="text-[11px] text-red-700 dark:text-red-400">Call for immediate paramedic advice</p>
                </div>
                <a
                  href={`tel:${selectedGuide.helpline}`}
                  className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white text-xs hover:bg-red-700 flex items-center gap-1.5"
                >
                  <Phone className="h-3.5 w-3.5" /> Call {selectedGuide.helpline}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default FinderResources;
