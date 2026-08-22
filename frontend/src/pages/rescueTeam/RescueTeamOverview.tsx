import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { foundReportApi, type FoundReport } from '@/features/foundReports/foundReportApi';
import { rescueApi, type RescueRequest } from '@/features/rescue/rescueApi';
import { useTheme } from '@/contexts/ThemeContext';
import PetDetailModal from '@/components/ui/PetDetailModal';
import {
  Search, Bell, MessageSquare, CheckCircle2,
  Clock, ShieldAlert, Activity, BatteryLow,
  PawPrint, ChevronRight, Heart, Users,
  Ambulance, Stethoscope, Home, RefreshCw, Sun, Moon
} from 'lucide-react';

/* ─── Species Icon & Image Mapping ────────────────────────────── */
const SPECIES_CONFIG: Record<string, { icon: string; name: string; fallbackImg: string; category: string }> = {
  dog: { icon: '🐕', name: 'Dog', fallbackImg: '/animal-dog.jpg', category: 'dogs' },
  cat: { icon: '🐈', name: 'Cat', fallbackImg: '/animal-cat.jpg', category: 'cats' },
  cow: { icon: '🐄', name: 'Cow', fallbackImg: '/animal-cow.jpg', category: 'livestock' },
  calf: { icon: '🐄', name: 'Calf', fallbackImg: '/animal-cow.jpg', category: 'livestock' },
  parrot: { icon: '🦜', name: 'Parrot', fallbackImg: '/animal-bird.jpg', category: 'birds' },
  bird: { icon: '🐦', name: 'Bird', fallbackImg: '/animal-bird.jpg', category: 'birds' },
  rabbit: { icon: '🐇', name: 'Rabbit', fallbackImg: '/animal-rabbit.jpg', category: 'wild' },
  goat: { icon: '🐐', name: 'Goat', fallbackImg: '/animal-goat.jpg', category: 'livestock' },
  turtle: { icon: '🐢', name: 'Turtle', fallbackImg: '/animal-others.jpg', category: 'wild' },
  peacock: { icon: '🦚', name: 'Peacock', fallbackImg: '/animal-bird.jpg', category: 'birds' },
  duck: { icon: '🦆', name: 'Duck', fallbackImg: '/animal-bird.jpg', category: 'birds' },
  monkey: { icon: '🐒', name: 'Monkey', fallbackImg: '/animal-others.jpg', category: 'wild' },
  hedgehog: { icon: '🦔', name: 'Hedgehog', fallbackImg: '/animal-others.jpg', category: 'wild' },
  other: { icon: '🐾', name: 'Animal', fallbackImg: '/animal-others.jpg', category: 'wild' },
};

/* ─── Helpers ────────────────────────────────────────────────── */
const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const getPriorityStyle = (priority: string) => {
  const p = priority.toUpperCase();
  if (p === 'HIGH' || p === 'CRITICAL') return 'bg-red-500/90 text-white font-bold';
  if (p === 'MEDIUM') return 'bg-amber-500/90 text-white font-bold';
  return 'bg-emerald-600/90 text-white font-bold';
};

const inferPriority = (description: string): 'HIGH' | 'MEDIUM' | 'LOW' => {
  const d = description?.toLowerCase() || '';
  if (d.includes('injur') || d.includes('critical') || d.includes('bleed') || d.includes('emergency')) return 'HIGH';
  if (d.includes('lost') || d.includes('stray') || d.includes('help')) return 'MEDIUM';
  return 'LOW';
};

/* ─── Types ─────────────────────────────────────────────────── */
interface DisplayReport {
  id: string;
  species: string;
  name: string;
  location: string;
  reporter: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  timeAgo: string;
  img: string;
  category: string;
  isLive: boolean;
  lat?: number;
  lng?: number;
  description?: string;
  contactPhone?: string;
}

const RescueTeamOverview = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [liveFoundReports, setLiveFoundReports] = useState<FoundReport[]>([]);
  const [liveRescueRequests, setLiveRescueRequests] = useState<RescueRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'dogs' | 'cats' | 'birds' | 'livestock' | 'wild'>('all');
  const [selectedReport, setSelectedReport] = useState<DisplayReport | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const [fReports, rRequests] = await Promise.all([
        foundReportApi.list().catch(() => []),
        rescueApi.list().catch(() => []),
      ]);
      setLiveFoundReports(fReports || []);
      setLiveRescueRequests(rRequests || []);
      setLastRefresh(new Date());
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, [fetchReports]);

  /* ─── Map Real Finder Reports Only ──────────────────────────── */
  const allDisplayReports = useMemo<DisplayReport[]>(() => {
    return liveFoundReports.map((r) => {
      const spKey = (r.species || 'other').toLowerCase();
      const cfg = SPECIES_CONFIG[spKey] || SPECIES_CONFIG.other;
      const img = r.photos?.[0]?.url || cfg.fallbackImg;
      return {
        id: r._id,
        species: spKey,
        name: cfg.name,
        location: r.location?.address || 'Location provided by Finder',
        reporter: r.reportedBy?.name || 'Anonymous Finder',
        priority: inferPriority(r.description),
        timeAgo: formatTimeAgo(r.createdAt),
        img,
        category: cfg.category,
        isLive: true,
        lat: r.location?.lat,
        lng: r.location?.lng,
        description: r.description,
        contactPhone: r.contactPhone,
      };
    });
  }, [liveFoundReports]);

  /* ─── Filtered by Category + Search ─────────────────────────── */
  const filteredReports = useMemo(() => {
    return allDisplayReports.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.reporter.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allDisplayReports, activeCategory, searchQuery]);

  /* ─── Counts ────────────────────────────────────────────────── */
  const counts = useMemo(() => {
    const total = liveFoundReports.length;
    const dogs = liveFoundReports.filter((r) => r.species === 'dog').length;
    const cats = liveFoundReports.filter((r) => r.species === 'cat').length;
    const birds = liveFoundReports.filter((r) => ['bird', 'parrot', 'peacock', 'duck'].includes(r.species || '')).length;
    const livestock = liveFoundReports.filter((r) => ['cow', 'calf', 'goat'].includes(r.species || '')).length;
    const wild = liveFoundReports.filter((r) => ['rabbit', 'turtle', 'monkey', 'hedgehog'].includes(r.species || '')).length;
    return { total, dogs, cats, birds, livestock, wild };
  }, [liveFoundReports]);

  /* ─── Theme-aware class helpers ────────────────────────────── */
  const bg = isDark ? 'bg-[#040d17]' : 'bg-slate-100';
  const cardBg = isDark ? 'bg-[#071726]' : 'bg-white';
  const cardBorder = isDark ? 'border-[#12314a]' : 'border-slate-200';
  const innerCardBg = isDark ? 'bg-[#05111d]' : 'bg-slate-50';
  const innerBorder = isDark ? 'border-[#14344f]' : 'border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDark ? 'bg-[#071624] border-[#14344f] text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400';
  const headerBorder = isDark ? 'border-[#0d2235]' : 'border-slate-200';

  return (
    <div className={`-m-3.5 sm:-m-5 md:-m-6 min-h-screen ${bg} ${textPrimary} p-4 sm:p-6 lg:p-7 space-y-6 transition-colors duration-300`}>
      {/* ── Pet Detail Modal ──────────────────────────────────────── */}
      <PetDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />

      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${headerBorder} pb-5`}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${textPrimary}`}>Rescue Team Dashboard</h1>
            <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-500/20" />
            <button
              onClick={fetchReports}
              title="Refresh finder reports"
              className={`ml-2 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 px-2.5 py-1 rounded-lg border transition-colors ${isDark ? 'bg-[#0b1e2e] border-[#14344f]' : 'bg-emerald-50 border-emerald-200'}`}
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Sync Finder Reports
            </button>
          </div>
          <p className={`text-xs sm:text-sm ${textSecondary} mt-0.5`}>
            Manage rescue operations, coordinate teams & save lives.
            {lastRefresh && (
              <span className="ml-2 text-emerald-400">
                · Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        {/* Header Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className={`absolute left-3 top-2.5 h-4 w-4 ${textSecondary}`} />
            <input
              type="text"
              placeholder="Search animals, cases, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl border py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none ${inputBg}`}
            />
          </div>

          {/* Dark/Light Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
              isDark ? 'border-[#14344f] bg-[#071624] text-amber-400 hover:text-amber-300' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button aria-label="Notifications" className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${isDark ? 'border-[#14344f] bg-[#071624] text-slate-300 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">7</span>
          </button>

          <button aria-label="Messages" className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${isDark ? 'border-[#14344f] bg-[#071624] text-slate-300 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            <MessageSquare className="h-4 w-4" />
          </button>

          {/* User Profile */}
          <div className={`flex items-center gap-2.5 rounded-xl border px-3 py-1.5 ${isDark ? 'border-[#14344f] bg-[#071624]' : 'border-slate-200 bg-white'}`}>
            <div className="h-7 w-7 overflow-hidden rounded-full border border-emerald-500/50 bg-emerald-950">
              <img src="/puppy.jpg" alt="Officer" className="h-full w-full object-cover" />
            </div>
            <div className="text-left hidden sm:block">
              <div className={`text-xs font-semibold leading-tight ${textPrimary}`}>Rescue Officer</div>
              <div className={`text-[10px] leading-tight ${textSecondary}`}>Rescue Team</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5 Stat Cards Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {[
          { label: 'Finder Reports', value: counts.total, sub: `${counts.total} live reports`, icon: <Home className="h-5 w-5" />, color: 'text-blue-400', iconBg: isDark ? 'bg-blue-600/20' : 'bg-blue-100' },
          { label: 'Active Rescue Cases', value: liveRescueRequests.length || 0, sub: 'In progress', icon: <Users className="h-5 w-5" />, color: 'text-emerald-400', iconBg: isDark ? 'bg-emerald-600/20' : 'bg-emerald-100' },
          { label: 'Animals Rescued', value: 156, sub: 'This month', icon: <Ambulance className="h-5 w-5" />, color: 'text-purple-400', iconBg: isDark ? 'bg-purple-600/20' : 'bg-purple-100' },
          { label: 'Response Time (Avg.)', value: '26 min', sub: 'This month', icon: <Clock className="h-5 w-5" />, color: 'text-orange-400', iconBg: isDark ? 'bg-orange-600/20' : 'bg-orange-100' },
          { label: 'Success Rate', value: '91%', sub: 'This month', icon: <Heart className="h-5 w-5" />, color: 'text-pink-400', iconBg: isDark ? 'bg-pink-600/20' : 'bg-pink-100' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl border ${cardBorder} ${cardBg} p-4 flex items-center gap-3.5 shadow-sm transition-colors`}>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <div className={`text-xs ${textSecondary}`}>{stat.label}</div>
              <div className={`text-xl font-bold ${textPrimary} tracking-tight`}>{stat.value}</div>
              <div className="text-[10px] text-emerald-400">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Dashboard Layout ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── Left Column: Recently Reported Animals ── */}
        <div className={`lg:col-span-7 xl:col-span-8 rounded-2xl border ${cardBorder} ${cardBg} p-4 sm:p-5 space-y-4 transition-colors`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className={`text-base sm:text-lg font-bold ${textPrimary}`}>Recently Reported Animals</h2>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {counts.total}
              </span>
              {/* Live badge */}
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
              </span>
            </div>
            <Link
              to="/rescue-team/requests"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View All Reports <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: `All (${counts.total})` },
              { id: 'dogs', label: `Dogs (${counts.dogs})` },
              { id: 'cats', label: `Cats (${counts.cats})` },
              { id: 'birds', label: `Birds (${counts.birds})` },
              { id: 'livestock', label: `Livestock (${counts.livestock})` },
              { id: 'wild', label: `Wild (${counts.wild})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as typeof activeCategory)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  activeCategory === tab.id
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : isDark
                    ? 'bg-[#0b2133] text-slate-300 hover:bg-[#102d45] hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Animal Cards Grid ─── */}
          {loading ? (
            /* Skeleton loaders */
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pt-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`rounded-xl border ${innerBorder} ${innerCardBg} overflow-hidden animate-pulse`}>
                  <div className="h-28 bg-slate-700/30" />
                  <div className="p-2.5 space-y-2">
                    <div className="h-3 w-16 rounded bg-slate-700/30" />
                    <div className="h-2.5 w-24 rounded bg-slate-700/20" />
                    <div className="h-2 w-20 rounded bg-slate-700/20" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            /* Empty state */
            <div className={`flex flex-col items-center justify-center py-16 rounded-xl border ${innerBorder} ${innerCardBg}`}>
              <div className="text-5xl mb-3">🐾</div>
              <p className={`text-sm font-semibold ${textPrimary}`}>
                {liveFoundReports.length === 0 ? 'No pets reported yet' : 'No pets match your search'}
              </p>
              <p className={`text-xs ${textSecondary} mt-1 text-center max-w-xs`}>
                {liveFoundReports.length === 0
                  ? 'When a Finder submits a pet report, it will appear here in real time.'
                  : 'Try adjusting your search or category filter.'}
              </p>
              {liveFoundReports.length === 0 && (
                <button
                  onClick={fetchReports}
                  className="mt-4 flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" /> Check Again
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pt-1">
              {filteredReports.slice(0, 12).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedReport(item)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border text-left transition-all hover:border-emerald-500/60 hover:shadow-lg cursor-pointer ${
                    isDark
                      ? `${innerBorder} ${innerCardBg} hover:shadow-emerald-950/30`
                      : 'border-slate-200 bg-white hover:shadow-slate-200/50'
                  }`}
                >
                  {/* Photo & Badges */}
                  <div className="relative h-28 w-full overflow-hidden bg-black/60">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Priority badge */}
                    <span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wide ${getPriorityStyle(item.priority)}`}>
                      {item.priority}
                    </span>
                    {/* Time ago */}
                    <span className="absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[9px] text-white/90 backdrop-blur-sm">
                      {item.timeAgo}
                    </span>
                    {/* Live dot */}
                    <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[8px] text-emerald-400 backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] font-semibold px-2 py-1 rounded-lg">
                        View Details
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-2.5 space-y-1">
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${textPrimary}`}>
                      <span>{SPECIES_CONFIG[item.species]?.icon || '🐾'}</span>
                      <span>{item.name}</span>
                    </div>
                    <p className={`truncate text-[10px] ${textSecondary}`}>{item.location}</p>
                    <p className={`truncate text-[9.5px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>By: {item.reporter}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* View All Button */}
          {filteredReports.length > 12 && (
            <div className="pt-2 text-center">
              <Link
                to="/rescue-team/requests"
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-6 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-900/40 transition-colors ${
                  isDark ? 'border-emerald-500/40 bg-emerald-950/30' : 'border-emerald-300 bg-emerald-50'
                }`}
              >
                View All Reported Animals <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* ── Right Column ─────────────────────────────────────────── */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* 1. Reported Animals Map Widget */}
          <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-4 space-y-3 transition-colors`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold ${textPrimary}`}>Reported Animals Map</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </div>
            <div className={`relative h-44 w-full overflow-hidden rounded-xl border ${innerBorder} ${innerCardBg}`}>
              <div className="absolute inset-0 bg-[radial-gradient(#153654_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
              <div className="absolute inset-0 p-3 text-[10px] text-slate-400">
                {liveFoundReports.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className={`text-xs ${textSecondary}`}>No reports to display</p>
                  </div>
                ) : (
                  <>
                    <div className="absolute top-[25%] left-[55%] flex flex-col items-center">
                      <span className="h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-500/30 animate-pulse" />
                      <span className="text-[9px] font-bold text-white mt-0.5">Active Area</span>
                    </div>
                    <div className="absolute bottom-[35%] left-[30%] flex flex-col items-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/30" />
                      <span className="text-[8px] text-slate-300 mt-0.5">{counts.total} Reports</span>
                    </div>
                  </>
                )}
              </div>
              <Link
                to="/rescue-team/map"
                className="absolute bottom-2 right-2 rounded-lg bg-emerald-600/80 backdrop-blur-sm px-2 py-1 text-[9px] font-bold text-white hover:bg-emerald-500 transition-colors"
              >
                Open Full Map →
              </Link>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />High Priority</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Medium</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Low</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400" />In Progress</span>
            </div>
          </div>

          {/* 2. Recent Finder Reports List */}
          <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-4 space-y-3 transition-colors`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold ${textPrimary}`}>Recent Finder Reports</h3>
              <span className={`text-[10px] ${textSecondary}`}>{counts.total} total</span>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {liveFoundReports.length === 0 ? (
                <p className={`text-xs py-4 text-center ${textSecondary}`}>No finder reports yet.</p>
              ) : (
                liveFoundReports.slice(0, 6).map((r) => {
                  const spKey = (r.species || 'other').toLowerCase();
                  const cfg = SPECIES_CONFIG[spKey] || SPECIES_CONFIG.other;
                  return (
                    <button
                      key={r._id}
                      onClick={() => setSelectedReport({
                        id: r._id,
                        species: spKey,
                        name: cfg.name,
                        location: r.location?.address || 'Location from Finder',
                        reporter: r.reportedBy?.name || 'Anonymous',
                        priority: inferPriority(r.description),
                        timeAgo: formatTimeAgo(r.createdAt),
                        img: r.photos?.[0]?.url || cfg.fallbackImg,
                        category: cfg.category,
                        isLive: true,
                        lat: r.location?.lat,
                        lng: r.location?.lng,
                        description: r.description,
                        contactPhone: r.contactPhone,
                      })}
                      className={`w-full flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all hover:border-emerald-500/50 ${innerBorder} ${innerCardBg}`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${isDark ? 'bg-[#0e273d]' : 'bg-slate-100'}`}>
                        {cfg.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-semibold ${textPrimary}`}>{cfg.name} — {r.location?.address?.split(',')[0] || 'Unknown'}</div>
                        <div className={`text-[10px] ${textSecondary} truncate`}>By {r.reportedBy?.name || 'Finder'} · {formatTimeAgo(r.createdAt)}</div>
                      </div>
                      <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${textSecondary}`} />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. Recent Alerts Widget */}
          <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-4 space-y-3 transition-colors`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold ${textPrimary}`}>Recent Alerts</h3>
              <button className="text-xs text-blue-400 hover:text-blue-300">View All</button>
            </div>
            <div className="space-y-2">
              {[
                { icon: <ShieldAlert className="h-4 w-4 text-red-400" />, title: 'Geofence Breach', sub: 'Pet moved out of safe zone', time: '5 min ago' },
                { icon: <Activity className="h-4 w-4 text-orange-400" />, title: 'Abnormal Activity', sub: 'High activity detected', time: '18 min ago' },
                { icon: <BatteryLow className="h-4 w-4 text-amber-400" />, title: 'Low Battery', sub: 'Collar battery below 20%', time: '32 min ago' },
                { icon: <PawPrint className="h-4 w-4 text-blue-400" />, title: 'Animal Reported', sub: 'New animal reported nearby', time: '45 min ago' },
                { icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />, title: 'Safe Zone Entered', sub: 'Animal is back in safe zone', time: '1 hr ago' },
              ].map((a) => (
                <div key={a.title} className={`flex items-center justify-between py-1 border-b last:border-0 ${isDark ? 'border-[#0d2338]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isDark ? 'bg-[#0c2236]' : 'bg-slate-100'}`}>
                      {a.icon}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textPrimary}`}>{a.title}</div>
                      <div className={`text-[10px] ${textSecondary}`}>{a.sub}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom: Rescue Workflow Pipeline ─────────────────────── */}
      <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-4 sm:p-5 space-y-3 transition-colors`}>
        <h3 className={`text-sm font-bold ${textPrimary}`}>Rescue Workflow</h3>
        <div className="grid grid-cols-2 xs:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { step: '1', title: 'Animal Reported', desc: 'Finder uploads photo, location & details', icon: <PawPrint className="h-4 w-4 text-purple-400" />, bg: 'bg-purple-950/40 border-purple-500/30' },
            { step: '2', title: 'Verification', desc: 'Our team verifies the report', icon: <CheckCircle2 className="h-4 w-4 text-blue-400" />, bg: 'bg-blue-950/40 border-blue-500/30' },
            { step: '3', title: 'Rescue Assigned', desc: 'Case assigned to nearest rescue team', icon: <Users className="h-4 w-4 text-orange-400" />, bg: 'bg-orange-950/40 border-orange-500/30' },
            { step: '4', title: 'On the Way', desc: 'Team is on the way to location', icon: <Ambulance className="h-4 w-4 text-cyan-400" />, bg: 'bg-cyan-950/40 border-cyan-500/30' },
            { step: '5', title: 'Animal Rescued', desc: 'Animal safely rescued', icon: <Heart className="h-4 w-4 text-emerald-400" />, bg: 'bg-emerald-950/40 border-emerald-500/30' },
            { step: '6', title: 'Medical & Care', desc: 'Medical checkup & care provided', icon: <Stethoscope className="h-4 w-4 text-pink-400" />, bg: 'bg-pink-950/40 border-pink-500/30' },
            { step: '7', title: 'Rehabilitation', desc: 'Shelter / Foster / Adoption', icon: <Home className="h-4 w-4 text-rose-400" />, bg: 'bg-rose-950/40 border-rose-500/30' },
          ].map((w) => (
            <div key={w.title} className={`rounded-xl border p-3 flex flex-col justify-between ${w.bg} relative`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/40">
                    {w.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Step {w.step}</span>
                </div>
                <div className="text-xs font-bold text-white leading-tight">{w.title}</div>
                <p className="text-[9.5px] text-slate-400 leading-snug mt-1">{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RescueTeamOverview;
