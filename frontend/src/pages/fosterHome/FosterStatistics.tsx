import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  TrendingUp,
  Heart,
  DollarSign,
  PawPrint,
} from 'lucide-react';
import { FOSTER_STATISTICS } from '@/data/fosterMockData';

const FosterStatistics = () => {
  const [timeRange, setTimeRange] = useState<'6m' | '1y' | 'all'>('6m');
  const stats = FOSTER_STATISTICS;

  const maxFoster = Math.max(...stats.monthlyOverview.map((m) => m.fostered), 10);
  const maxDonation = Math.max(...stats.donationsOverview.map((d) => d.amount), 20000);

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/foster-home" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">Statistics</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
            Foster Care & Adoption Analytics
          </h1>
          <div className="flex items-center gap-2">
            {(['6m', '1y', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  timeRange === r
                    ? 'bg-[#1e6f42] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                }`}
              >
                {r === '6m' ? 'Last 6 Months' : r === '1y' ? 'Past Year' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-100 bg-[#f0fdf4] p-5 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Total Rescues Fostered</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <PawPrint className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.totalFostered}</h3>
          <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
            +18% from previous period
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-[#fffbeb] p-5 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Forever Adoptions</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.totalAdoptions}</h3>
          <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
            68% placement success rate
          </p>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-[#f0f9ff] p-5 shadow-sm dark:border-sky-900/40 dark:bg-sky-950/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Active Fosters Today</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-white">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.activeFosters}</h3>
          <p className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 mt-0.5">
            80% capacity utilized
          </p>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-[#faf5ff] p-5 shadow-sm dark:border-purple-900/40 dark:bg-purple-950/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Total Donations Raised</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ₹{stats.totalDonations.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 mt-0.5">
            100% used for animal welfare
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Foster & Adoption Trends Bar Chart */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Monthly Fosters vs Adoptions
              </h3>
              <p className="text-xs text-slate-400">Monthly care intake and forever home transitions</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <span className="h-3 w-3 rounded-md bg-emerald-600 inline-block" /> Fostered
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <span className="h-3 w-3 rounded-md bg-amber-500 inline-block" /> Adopted
              </span>
            </div>
          </div>

          {/* Bar Visualization */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 pb-2 dark:border-slate-800">
            {stats.monthlyOverview.map((item) => {
              const fosterHeight = Math.round((item.fostered / maxFoster) * 100);
              const adoptHeight = Math.round((item.adopted / maxFoster) * 100);

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    {/* Foster bar */}
                    <div
                      style={{ height: `${fosterHeight}%` }}
                      className="w-full max-w-[18px] rounded-t-lg bg-emerald-600 group-hover:bg-emerald-500 transition-all relative flex justify-center"
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-1 rounded shadow">
                        {item.fostered}
                      </span>
                    </div>

                    {/* Adopted bar */}
                    <div
                      style={{ height: `${adoptHeight}%` }}
                      className="w-full max-w-[18px] rounded-t-lg bg-amber-500 group-hover:bg-amber-400 transition-all relative flex justify-center"
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-1 rounded shadow">
                        {item.adopted}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Animal-wise Breakdown */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Animal Distribution
            </h3>
            <p className="text-xs text-slate-400">Total species currently supported in foster</p>
          </div>

          <div className="space-y-3 pt-2">
            {stats.animalWise.map((animal) => {
              const totalAll = stats.animalWise.reduce((a, b) => a + b.count, 0);
              const percentage = Math.round((animal.count / totalAll) * 100);

              return (
                <div key={animal.species} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span>{animal.icon}</span> {animal.species}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {animal.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${percentage}%`, backgroundColor: animal.color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Donation Growth Trend */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Monthly Donation Growth
            </h3>
            <p className="text-xs text-slate-400">Financial contributions supporting healthcare and food</p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 dark:bg-purple-950 dark:text-purple-300 px-3 py-1 rounded-full">
            ₹18,900 Highest Month
          </span>
        </div>

        <div className="h-44 flex items-end justify-between gap-3 pt-4 border-b border-slate-100 pb-2 dark:border-slate-800">
          {stats.donationsOverview.map((item) => {
            const h = Math.round((item.amount / maxDonation) * 100);
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div
                  style={{ height: `${h}%` }}
                  className="w-full max-w-[28px] rounded-t-xl bg-gradient-to-t from-purple-700 to-indigo-500 group-hover:opacity-90 transition-all relative flex justify-center"
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-6 text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-1 rounded shadow">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FosterStatistics;
