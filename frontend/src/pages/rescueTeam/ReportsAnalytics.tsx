import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  TrendingUp, PawPrint, Users, Clock, Heart,
  Sun, Moon, Download, Calendar, MapPin, Star
} from 'lucide-react';

const MONTHLY_DATA = [
  { month: 'Mar', rescued: 124, reported: 180, response: 28 },
  { month: 'Apr', rescued: 138, reported: 195, response: 25 },
  { month: 'May', rescued: 147, reported: 210, response: 24 },
  { month: 'Jun', rescued: 162, reported: 230, response: 22 },
  { month: 'Jul', rescued: 171, reported: 248, response: 21 },
  { month: 'Aug', rescued: 156, reported: 220, response: 26 },
];

const TOP_LOCATIONS = [
  { name: 'Haldwani', cases: 48, success: 94 },
  { name: 'Nainital', cases: 36, success: 89 },
  { name: 'Rudrapur', cases: 29, success: 97 },
  { name: 'Ramnagar', cases: 22, success: 86 },
  { name: 'Kashipur', cases: 18, success: 91 },
];

const SPECIES_DATA = [
  { name: 'Dogs', count: 68, percent: 44, emoji: '🐕', color: 'bg-blue-500' },
  { name: 'Cats', count: 34, percent: 22, emoji: '🐈', color: 'bg-purple-500' },
  { name: 'Cows/Livestock', count: 24, percent: 15, emoji: '🐄', color: 'bg-amber-500' },
  { name: 'Birds', count: 18, percent: 12, emoji: '🐦', color: 'bg-emerald-500' },
  { name: 'Wild Animals', count: 12, percent: 7, emoji: '🐒', color: 'bg-red-500' },
];

const TEAM_PERFORMANCE = [
  { name: 'Arjun Sharma', role: 'Team Leader', avatar: '👮', rescues: 42, rating: 4.9, responseTime: '18 min' },
  { name: 'Priya Mehta', role: 'Field Officer', avatar: '👩‍⚕️', rescues: 38, rating: 4.8, responseTime: '21 min' },
  { name: 'Rohan Singh', role: 'Rescue Specialist', avatar: '🧑‍🚒', rescues: 35, rating: 4.7, responseTime: '23 min' },
  { name: 'Dev Kumar', role: 'Driver', avatar: '🚐', rescues: 28, rating: 4.6, responseTime: '19 min' },
  { name: 'Kavita Rawat', role: 'Vet Assistant', avatar: '👩‍🔬', rescues: 24, rating: 4.9, responseTime: '25 min' },
];

const ReportsAnalytics = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [activeRange, setActiveRange] = useState('This Month');

  const bg = isDark ? 'bg-[#040d17]' : 'bg-slate-100';
  const cardBg = isDark ? 'bg-[#071726]' : 'bg-white';
  const cardBorder = isDark ? 'border-[#12314a]' : 'border-slate-200';
  const innerBg = isDark ? 'bg-[#05111d]' : 'bg-slate-50';
  const innerBorder = isDark ? 'border-[#14344f]' : 'border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const barBg = isDark ? 'bg-[#0e273d]' : 'bg-slate-200';

  const maxRescued = Math.max(...MONTHLY_DATA.map(d => d.rescued));

  return (
    <div className={`-m-3.5 sm:-m-5 md:-m-6 min-h-screen ${bg} ${textPrimary} p-4 sm:p-6 space-y-5 transition-colors duration-300`}>
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${isDark ? 'border-[#0d2235]' : 'border-slate-200'} pb-4`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
            <TrendingUp className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${textPrimary}`}>Reports & Analytics</h1>
            <p className={`text-xs ${textSecondary}`}>Performance insights & rescue statistics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Date Range */}
          <div className="flex rounded-xl overflow-hidden border ${innerBorder}">
            {['This Week', 'This Month', '6 Months'].map(r => (
              <button key={r} onClick={() => setActiveRange(r)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${activeRange === r ? 'bg-emerald-600 text-white' : isDark ? 'bg-[#05111d] text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-700'}`}>
                {r}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition-colors">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button onClick={toggleTheme} className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${isDark ? 'border-[#14344f] bg-[#071624] text-amber-400' : 'border-slate-200 bg-white text-slate-600'}`}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Animals Rescued', value: '156', change: '+8.2%', icon: <PawPrint className="h-5 w-5" />, color: 'text-emerald-400', iconBg: isDark ? 'bg-emerald-600/20' : 'bg-emerald-100' },
          { label: 'Reports Received', value: '220', change: '+12.4%', icon: <Users className="h-5 w-5" />, color: 'text-blue-400', iconBg: isDark ? 'bg-blue-600/20' : 'bg-blue-100' },
          { label: 'Avg Response Time', value: '26 min', change: '-4.1%', icon: <Clock className="h-5 w-5" />, color: 'text-amber-400', iconBg: isDark ? 'bg-amber-600/20' : 'bg-amber-100' },
          { label: 'Success Rate', value: '91%', change: '+2.3%', icon: <Heart className="h-5 w-5" />, color: 'text-pink-400', iconBg: isDark ? 'bg-pink-600/20' : 'bg-pink-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border ${cardBorder} ${cardBg} p-4`}>
            <div className="flex items-start justify-between mb-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.iconBg} ${s.color}`}>{s.icon}</div>
              <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${s.change.startsWith('+') ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'}`}>
                {s.change}
              </span>
            </div>
            <div className={`text-2xl font-black ${textPrimary}`}>{s.value}</div>
            <div className={`text-xs ${textSecondary} mt-0.5`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Bar Chart - Monthly Rescues */}
        <div className={`lg:col-span-7 rounded-2xl border ${cardBorder} ${cardBg} p-5`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className={`text-sm font-bold ${textPrimary}`}>Monthly Rescue Activity</h3>
              <p className={`text-xs ${textSecondary}`}>Animals rescued vs reports received</p>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Rescued</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500/50" />Reported</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3 h-40">
            {MONTHLY_DATA.map(d => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-0.5" style={{ height: '120px' }}>
                  {/* Reported bar */}
                  <div
                    className={`flex-1 rounded-t-md ${isDark ? 'bg-blue-500/25' : 'bg-blue-100'} transition-all`}
                    style={{ height: `${(d.reported / 250) * 100}%` }}
                  />
                  {/* Rescued bar */}
                  <div
                    className="flex-1 rounded-t-md bg-emerald-500 transition-all"
                    style={{ height: `${(d.rescued / maxRescued) * 100}%` }}
                  />
                </div>
                <span className={`text-[10px] font-medium ${textSecondary}`}>{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Species Breakdown */}
        <div className={`lg:col-span-5 rounded-2xl border ${cardBorder} ${cardBg} p-5`}>
          <h3 className={`text-sm font-bold ${textPrimary} mb-1`}>Species Breakdown</h3>
          <p className={`text-xs ${textSecondary} mb-4`}>This month's rescues by animal type</p>
          <div className="space-y-3">
            {SPECIES_DATA.map(s => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 text-xs">
                    <span>{s.emoji}</span>
                    <span className={textPrimary}>{s.name}</span>
                  </span>
                  <span className={`text-[10px] font-bold ${textSecondary}`}>{s.count} ({s.percent}%)</span>
                </div>
                <div className={`h-2 w-full rounded-full ${barBg}`}>
                  <div className={`h-full rounded-full ${s.color} transition-all`} style={{ width: `${s.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top Locations */}
        <div className={`lg:col-span-5 rounded-2xl border ${cardBorder} ${cardBg} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-blue-400" />
            <h3 className={`text-sm font-bold ${textPrimary}`}>Top Rescue Locations</h3>
          </div>
          <div className="space-y-2">
            {TOP_LOCATIONS.map((loc, i) => (
              <div key={loc.name} className={`flex items-center justify-between rounded-xl p-3 ${innerBg} border ${innerBorder}`}>
                <div className="flex items-center gap-2.5">
                  <span className={`text-xs font-black w-5 text-center ${i === 0 ? 'text-amber-400' : textSecondary}`}>#{i + 1}</span>
                  <div>
                    <p className={`text-xs font-semibold ${textPrimary}`}>{loc.name}</p>
                    <p className={`text-[10px] ${textSecondary}`}>{loc.cases} cases</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400">{loc.success}%</p>
                  <p className={`text-[9px] ${textSecondary}`}>success</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Performance */}
        <div className={`lg:col-span-7 rounded-2xl border ${cardBorder} ${cardBg} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-purple-400" />
            <h3 className={`text-sm font-bold ${textPrimary}`}>Team Performance</h3>
          </div>
          <div className="space-y-2">
            {TEAM_PERFORMANCE.map((member) => (
              <div key={member.name} className={`flex items-center justify-between rounded-xl p-3 ${innerBg} border ${innerBorder} hover:border-emerald-500/30 transition-colors`}>
                <div className="flex items-center gap-2.5">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-base ${isDark ? 'bg-[#0e273d]' : 'bg-slate-100'}`}>{member.avatar}</div>
                  <div>
                    <p className={`text-xs font-semibold ${textPrimary}`}>{member.name}</p>
                    <p className={`text-[10px] ${textSecondary}`}>{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className={`text-xs font-bold ${textPrimary}`}>{member.rescues}</p>
                    <p className={`text-[9px] ${textSecondary}`}>rescues</p>
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${textPrimary}`}>{member.responseTime}</p>
                    <p className={`text-[9px] ${textSecondary}`}>avg time</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className={`text-xs font-bold ${textPrimary}`}>{member.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-emerald-400" />
          <h3 className={`text-sm font-bold ${textPrimary}`}>Recent Activity Log</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { time: '10:32 AM', event: 'Dog rescued near Haldwani bypass', type: 'rescue', emoji: '🐕' },
            { time: '09:45 AM', event: 'Cow transported to Rudrapur shelter', type: 'transport', emoji: '🐄' },
            { time: '09:10 AM', event: '3 cats received medical checkup', type: 'medical', emoji: '🐈' },
            { time: '08:55 AM', event: 'New report filed: Parrot in Kashipur', type: 'report', emoji: '🦜' },
            { time: 'Yesterday', event: 'Monthly rescue target achieved: 156', type: 'milestone', emoji: '🏆' },
            { time: 'Yesterday', event: 'Equipment maintenance completed', type: 'maintenance', emoji: '🔧' },
          ].map((a, i) => (
            <div key={i} className={`flex items-start gap-2.5 rounded-xl p-3 ${innerBg} border ${innerBorder}`}>
              <span className="text-base shrink-0">{a.emoji}</span>
              <div>
                <p className={`text-xs font-medium ${textPrimary} leading-tight`}>{a.event}</p>
                <p className={`text-[10px] ${textSecondary} mt-0.5`}>{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
