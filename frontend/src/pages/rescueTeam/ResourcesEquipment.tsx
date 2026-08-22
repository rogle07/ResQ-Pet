import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Briefcase, Package, AlertTriangle, CheckCircle2, Sun, Moon,
  Plus, Truck, Battery, Wrench, ShieldCheck, Search, RefreshCw
} from 'lucide-react';

type ResourceStatus = 'Available' | 'In Use' | 'Maintenance' | 'Low Stock';

interface Resource {
  id: number;
  name: string;
  category: string;
  icon: string;
  status: ResourceStatus;
  quantity: number;
  total: number;
  location: string;
  lastUpdated: string;
}

const RESOURCES: Resource[] = [
  { id: 1, name: 'Rescue Van Unit-1', category: 'Vehicles', icon: '🚐', status: 'In Use', quantity: 1, total: 3, location: 'Haldwani Route', lastUpdated: '10 min ago' },
  { id: 2, name: 'Rescue Van Unit-2', category: 'Vehicles', icon: '🚐', status: 'Available', quantity: 1, total: 3, location: 'Base Station', lastUpdated: '1 hr ago' },
  { id: 3, name: 'Ambulance Unit-1', category: 'Vehicles', icon: '🚑', status: 'In Use', quantity: 1, total: 2, location: 'Nainital', lastUpdated: '25 min ago' },
  { id: 4, name: 'Animal Crates (Large)', category: 'Equipment', icon: '📦', status: 'Available', quantity: 8, total: 12, location: 'Base Warehouse', lastUpdated: '2 hr ago' },
  { id: 5, name: 'Animal Crates (Small)', category: 'Equipment', icon: '📦', status: 'Low Stock', quantity: 2, total: 10, location: 'Base Warehouse', lastUpdated: '2 hr ago' },
  { id: 6, name: 'Medical Kit (Standard)', category: 'Medical', icon: '🧰', status: 'Available', quantity: 5, total: 8, location: 'Medical Bay', lastUpdated: '30 min ago' },
  { id: 7, name: 'IV Fluids & Medicines', category: 'Medical', icon: '💉', status: 'Low Stock', quantity: 3, total: 20, location: 'Medical Bay', lastUpdated: '1 day ago' },
  { id: 8, name: 'Tranquilizer Kit', category: 'Medical', icon: '🔬', status: 'Maintenance', quantity: 0, total: 2, location: 'Under Service', lastUpdated: '3 hr ago' },
  { id: 9, name: 'Safety Nets (6ft)', category: 'Equipment', icon: '🕸️', status: 'Available', quantity: 6, total: 6, location: 'Equipment Room', lastUpdated: '1 day ago' },
  { id: 10, name: 'GPS Tracker Collars', category: 'Technology', icon: '📡', status: 'Available', quantity: 12, total: 15, location: 'Tech Room', lastUpdated: '5 hr ago' },
  { id: 11, name: 'Drone (Survey)', category: 'Technology', icon: '🚁', status: 'Available', quantity: 2, total: 2, location: 'Tech Room', lastUpdated: '2 days ago' },
  { id: 12, name: 'Body Cameras', category: 'Technology', icon: '📷', status: 'In Use', quantity: 4, total: 6, location: 'Field Officers', lastUpdated: '8 hr ago' },
];

const STATUS_CONFIG: Record<ResourceStatus, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Available: { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  'In Use': { color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30', icon: <Truck className="h-3 w-3" /> },
  Maintenance: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', icon: <Wrench className="h-3 w-3" /> },
  'Low Stock': { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', icon: <AlertTriangle className="h-3 w-3" /> },
};

const CATEGORIES = ['All', 'Vehicles', 'Equipment', 'Medical', 'Technology'];

const ResourcesEquipment = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const bg = isDark ? 'bg-[#040d17]' : 'bg-slate-100';
  const cardBg = isDark ? 'bg-[#071726]' : 'bg-white';
  const cardBorder = isDark ? 'border-[#12314a]' : 'border-slate-200';
  const innerBg = isDark ? 'bg-[#05111d]' : 'bg-slate-50';
  const textPrimary = isDark ? 'text-white' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDark ? 'bg-[#071624] border-[#14344f] text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400';

  const filtered = RESOURCES.filter(r => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory;
    const matchSearch = !search.trim() || r.name.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    total: RESOURCES.length,
    available: RESOURCES.filter(r => r.status === 'Available').length,
    inUse: RESOURCES.filter(r => r.status === 'In Use').length,
    lowStock: RESOURCES.filter(r => r.status === 'Low Stock').length,
    maintenance: RESOURCES.filter(r => r.status === 'Maintenance').length,
  };

  const stockPercent = (r: Resource) => Math.round((r.quantity / r.total) * 100);

  return (
    <div className={`-m-3.5 sm:-m-5 md:-m-6 min-h-screen ${bg} ${textPrimary} p-4 sm:p-6 space-y-5 transition-colors duration-300`}>
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${isDark ? 'border-[#0d2235]' : 'border-slate-200'} pb-4`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
            <Briefcase className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${textPrimary}`}>Resources & Equipment</h1>
            <p className={`text-xs ${textSecondary}`}>Track all vehicles, equipment & medical supplies</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Resource
          </button>
          <button className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${isDark ? 'border-[#14344f] bg-[#071624] text-slate-400 hover:text-white' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100'}`}>
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={toggleTheme} className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${isDark ? 'border-[#14344f] bg-[#071624] text-amber-400' : 'border-slate-200 bg-white text-slate-600'}`}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Resources', value: stats.total, color: 'text-blue-400', iconBg: isDark ? 'bg-blue-600/20' : 'bg-blue-100', icon: <Package className="h-5 w-5" /> },
          { label: 'Available', value: stats.available, color: 'text-emerald-400', iconBg: isDark ? 'bg-emerald-600/20' : 'bg-emerald-100', icon: <ShieldCheck className="h-5 w-5" /> },
          { label: 'In Use', value: stats.inUse, color: 'text-blue-400', iconBg: isDark ? 'bg-blue-600/20' : 'bg-blue-100', icon: <Truck className="h-5 w-5" /> },
          { label: 'Needs Attention', value: stats.lowStock + stats.maintenance, color: 'text-red-400', iconBg: isDark ? 'bg-red-600/20' : 'bg-red-100', icon: <Battery className="h-5 w-5" /> },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border ${cardBorder} ${cardBg} p-4 flex items-center gap-3`}>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${s.iconBg} ${s.color}`}>{s.icon}</div>
            <div>
              <div className={`text-xs ${textSecondary}`}>{s.label}</div>
              <div className={`text-2xl font-black ${textPrimary}`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-4 flex flex-wrap items-center gap-3`}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className={`absolute left-3 top-2.5 h-3.5 w-3.5 ${textSecondary}`} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search resources..."
            className={`w-full rounded-xl border py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none ${inputBg}`}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${activeCategory === c ? 'bg-emerald-600 text-white' : isDark ? 'bg-[#0b2133] text-slate-300 hover:bg-[#102d45]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(resource => {
          const sc = STATUS_CONFIG[resource.status];
          const pct = stockPercent(resource);
          return (
            <div key={resource.id} className={`rounded-2xl border ${cardBorder} ${cardBg} p-4 space-y-3 hover:border-emerald-500/40 transition-all group`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 flex items-center justify-center rounded-xl text-2xl ${innerBg}`}>{resource.icon}</div>
                  <div>
                    <p className={`text-sm font-semibold ${textPrimary}`}>{resource.name}</p>
                    <p className={`text-[10px] ${textSecondary}`}>{resource.category}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${sc.bg} ${sc.color} border ${sc.border}`}>
                  {sc.icon} {resource.status}
                </span>
              </div>

              {/* Stock bar */}
              <div>
                <div className={`flex justify-between text-[10px] ${textSecondary} mb-1`}>
                  <span>Stock: {resource.quantity}/{resource.total}</span>
                  <span>{pct}%</span>
                </div>
                <div className={`h-1.5 w-full rounded-full ${isDark ? 'bg-[#0e273d]' : 'bg-slate-200'}`}>
                  <div
                    className={`h-full rounded-full transition-all ${pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-between text-[10px] ${textSecondary}`}>
                <span>📍 {resource.location}</span>
                <span>🕐 {resource.lastUpdated}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourcesEquipment;
