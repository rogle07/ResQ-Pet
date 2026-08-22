import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { foundReportApi, type FoundReport } from '@/features/foundReports/foundReportApi';
import { useTheme } from '@/contexts/ThemeContext';
import {
  MapPin, Search, ChevronRight, Navigation, Phone, User,
  Clock, RefreshCw, AlertTriangle, Sun, Moon, PawPrint, X
} from 'lucide-react';

import 'leaflet/dist/leaflet.css';

/* ─── Fix Leaflet default icon ─────────────────────────────── */
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const SPECIES_CONFIG: Record<string, { icon: string; name: string; fallbackImg: string }> = {
  dog: { icon: '🐕', name: 'Dog', fallbackImg: '/animal-dog.jpg' },
  cat: { icon: '🐈', name: 'Cat', fallbackImg: '/animal-cat.jpg' },
  cow: { icon: '🐄', name: 'Cow', fallbackImg: '/animal-cow.jpg' },
  calf: { icon: '🐄', name: 'Calf', fallbackImg: '/animal-cow.jpg' },
  parrot: { icon: '🦜', name: 'Parrot', fallbackImg: '/animal-bird.jpg' },
  bird: { icon: '🐦', name: 'Bird', fallbackImg: '/animal-bird.jpg' },
  rabbit: { icon: '🐇', name: 'Rabbit', fallbackImg: '/animal-rabbit.jpg' },
  goat: { icon: '🐐', name: 'Goat', fallbackImg: '/animal-goat.jpg' },
  turtle: { icon: '🐢', name: 'Turtle', fallbackImg: '/animal-others.jpg' },
  peacock: { icon: '🦚', name: 'Peacock', fallbackImg: '/animal-bird.jpg' },
  duck: { icon: '🦆', name: 'Duck', fallbackImg: '/animal-bird.jpg' },
  monkey: { icon: '🐒', name: 'Monkey', fallbackImg: '/animal-others.jpg' },
  hedgehog: { icon: '🦔', name: 'Hedgehog', fallbackImg: '/animal-others.jpg' },
  other: { icon: '🐾', name: 'Animal', fallbackImg: '/animal-others.jpg' },
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
};

const createPetIcon = (priority: string, species: string) => {
  const color = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;
  const cfg = SPECIES_CONFIG[(species || 'other').toLowerCase()] || SPECIES_CONFIG.other;
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:40px;height:40px;border-radius:9999px;
        background:${color};
        border:3px solid white;
        box-shadow:0 4px 14px rgba(0,0,0,0.4);
        display:flex;align-items:center;justify-content:center;
        font-size:18px;
        position:relative;
      ">
        ${cfg.icon}
        <div style="
          position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);
          width:0;height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-top:8px solid ${color};
        "></div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48],
  });
};

const createPulsingIcon = (priority: string, species: string) => {
  const color = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;
  const cfg = SPECIES_CONFIG[(species || 'other').toLowerCase()] || SPECIES_CONFIG.other;
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:60px;height:60px;display:flex;align-items:center;justify-content:center;">
        <div style="
          position:absolute;width:60px;height:60px;border-radius:50%;
          background:${color}40;
          animation:pulse 2s infinite;
        "></div>
        <div style="
          width:44px;height:44px;border-radius:9999px;
          background:${color};
          border:3px solid white;
          box-shadow:0 4px 20px rgba(0,0,0,0.5);
          display:flex;align-items:center;justify-content:center;
          font-size:20px;
          z-index:1;
        ">
          ${cfg.icon}
        </div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform:scale(0.8);opacity:0.8; }
          50% { transform:scale(1.4);opacity:0.3; }
          100% { transform:scale(0.8);opacity:0.8; }
        }
      </style>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [0, -30],
  });
};

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const inferPriority = (description: string): 'HIGH' | 'MEDIUM' | 'LOW' => {
  const d = description?.toLowerCase() || '';
  if (d.includes('injur') || d.includes('critical') || d.includes('bleed')) return 'HIGH';
  if (d.includes('lost') || d.includes('stray') || d.includes('help')) return 'MEDIUM';
  return 'LOW';
};

/* ─── Map recenter helper ─────────────────────────────────── */
const MapFlyTo = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 1.5 });
  }, [lat, lng, map]);
  return null;
};

const RescueTeamMap = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [reports, setReports] = useState<FoundReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState<FoundReport | null>(null);
  const [showAllOnMap, setShowAllOnMap] = useState(false);
  const markerRef = useRef<L.Marker | null>(null);

  const bg = isDark ? 'bg-[#040d17]' : 'bg-slate-100';
  const cardBg = isDark ? 'bg-[#071726]' : 'bg-white';
  const cardBorder = isDark ? 'border-[#12314a]' : 'border-slate-200';
  const innerBg = isDark ? 'bg-[#05111d]' : 'bg-slate-50';
  const innerBorder = isDark ? 'border-[#14344f]' : 'border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDark ? 'bg-[#071624] border-[#14344f] text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400';

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await foundReportApi.list().catch(() => []);
      setReports(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = reports.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const sp = (r.species || 'other').toLowerCase();
    const cfg = SPECIES_CONFIG[sp] || SPECIES_CONFIG.other;
    return (
      cfg.name.toLowerCase().includes(q) ||
      (r.location?.address || '').toLowerCase().includes(q) ||
      (r.reportedBy?.name || '').toLowerCase().includes(q) ||
      sp.includes(q)
    );
  });

  const selectedSp = selectedReport ? (selectedReport.species || 'other').toLowerCase() : '';
  const selectedCfg = SPECIES_CONFIG[selectedSp] || SPECIES_CONFIG.other;
  const selectedPriority = selectedReport ? inferPriority(selectedReport.description) : 'MEDIUM';
  const mapsUrl = selectedReport?.location?.lat && selectedReport?.location?.lng
    ? `https://www.google.com/maps?q=${selectedReport.location.lat},${selectedReport.location.lng}`
    : null;

  const mapReports = showAllOnMap ? reports : (selectedReport ? [selectedReport] : []);

  return (
    <div className={`-m-3.5 sm:-m-5 md:-m-6 min-h-screen ${bg} ${textPrimary} p-4 sm:p-6 space-y-4 transition-colors duration-300`}>

      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${isDark ? 'border-[#0d2235]' : 'border-slate-200'} pb-4`}>
        <div>
          <div className="flex items-center gap-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
              <MapPin className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${textPrimary}`}>Live Pet Tracking</h1>
              <p className={`text-xs ${textSecondary}`}>Real GPS locations from Finder reports</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              isDark ? 'border-[#14344f] bg-[#071624] text-emerald-400 hover:text-emerald-300' : 'border-slate-200 bg-white text-emerald-600 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={toggleTheme}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
              isDark ? 'border-[#14344f] bg-[#071624] text-amber-400' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            }`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ── LEFT: Pet Selection Panel ─────────────────────────── */}
        <div className={`lg:col-span-4 rounded-2xl border ${cardBorder} ${cardBg} p-4 space-y-3 transition-colors`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-sm font-bold ${textPrimary}`}>
              {selectedReport ? '📍 Tracking Pet' : '🐾 Select a Pet to Track'}
            </h2>
            {selectedReport && (
              <button
                onClick={() => { setSelectedReport(null); setShowAllOnMap(false); }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-2.5 h-3.5 w-3.5 ${textSecondary}`} />
            <input
              type="text"
              placeholder="Search by species, location, reporter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-xl border py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none ${inputBg}`}
            />
          </div>

          {/* Show All Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllOnMap((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold border transition-colors ${
                showAllOnMap
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : isDark ? 'bg-[#05111d] text-slate-400 border-[#14344f] hover:text-white' : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-700'
              }`}
            >
              <PawPrint className="h-3 w-3" /> Show All on Map
            </button>
            <span className={`text-[10px] ${textSecondary}`}>{reports.length} finder reports</span>
          </div>

          {/* Pet List */}
          <div className="space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`rounded-xl border ${innerBorder} ${innerBg} p-3 animate-pulse`}>
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-slate-700/30 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-24 rounded bg-slate-700/30" />
                      <div className="h-2 w-32 rounded bg-slate-700/20" />
                    </div>
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-10 rounded-xl border ${innerBorder} ${innerBg}`}>
                <div className="text-3xl mb-2">🔍</div>
                <p className={`text-xs ${textSecondary}`}>
                  {reports.length === 0 ? 'No finder reports yet' : 'No results found'}
                </p>
              </div>
            ) : (
              filtered.map((r) => {
                const sp = (r.species || 'other').toLowerCase();
                const cfg = SPECIES_CONFIG[sp] || SPECIES_CONFIG.other;
                const priority = inferPriority(r.description);
                const isSelected = selectedReport?._id === r._id;
                const hasCoords = r.location?.lat && r.location?.lng;
                return (
                  <button
                    key={r._id}
                    onClick={() => {
                      setSelectedReport(r);
                      setShowAllOnMap(false);
                    }}
                    className={`w-full text-left rounded-xl border p-3 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-600/10 shadow-md shadow-emerald-950/20'
                        : `${innerBorder} ${innerBg} hover:border-emerald-500/40`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Thumbnail */}
                      <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden border border-white/10">
                        <img
                          src={r.photos?.[0]?.url || cfg.fallbackImg}
                          alt={cfg.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute bottom-0 right-0 text-[10px] leading-none">{cfg.icon}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`flex items-center gap-1.5 text-xs font-bold ${textPrimary}`}>
                          <span>{cfg.name}</span>
                          <span className={`rounded px-1 py-0.5 text-[8px] font-bold ${
                            priority === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                            priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>{priority}</span>
                          {!hasCoords && <span className="rounded px-1 py-0.5 text-[8px] font-bold bg-slate-500/20 text-slate-400">No GPS</span>}
                        </div>
                        <p className={`text-[10px] truncate ${textSecondary} mt-0.5`}>{r.location?.address || 'Location from report'}</p>
                        <p className={`text-[9px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>By {r.reportedBy?.name || 'Finder'} · {formatTimeAgo(r.createdAt)}</p>
                      </div>
                      <ChevronRight className={`h-4 w-4 shrink-0 ${isSelected ? 'text-emerald-400' : textSecondary}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Map + Info Panel ───────────────────────────── */}
        <div className="lg:col-span-8 space-y-4">
          {/* Map */}
          <div className={`rounded-2xl border ${cardBorder} overflow-hidden`} style={{ height: selectedReport ? '440px' : '540px' }}>
            {!selectedReport && !showAllOnMap ? (
              /* No pet selected placeholder */
              <div className={`flex flex-col items-center justify-center h-full ${isDark ? 'bg-[#071726]' : 'bg-slate-50'}`}>
                <div className="relative mb-4">
                  <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-emerald-400/60" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center animate-bounce">
                    <PawPrint className="h-4 w-4 text-white fill-white" />
                  </div>
                </div>
                <h3 className={`text-base font-bold ${textPrimary}`}>Select a Pet to Track</h3>
                <p className={`text-sm ${textSecondary} mt-1 text-center max-w-xs`}>
                  Choose a pet from the list on the left to see their real GPS location reported by the finder.
                </p>
                {reports.length > 0 && (
                  <button
                    onClick={() => setShowAllOnMap(true)}
                    className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
                  >
                    <MapPin className="h-4 w-4" /> Show All {reports.length} Reports on Map
                  </button>
                )}
              </div>
            ) : (
              <MapContainer
                center={
                  selectedReport?.location?.lat && selectedReport?.location?.lng
                    ? [selectedReport.location.lat, selectedReport.location.lng]
                    : reports[0]?.location?.lat
                    ? [reports[0].location.lat, reports[0].location.lng]
                    : [29.38, 79.46]
                }
                zoom={selectedReport ? 14 : 11}
                style={{ width: '100%', height: '100%' }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {selectedReport?.location?.lat && selectedReport?.location?.lng && (
                  <MapFlyTo lat={selectedReport.location.lat} lng={selectedReport.location.lng} />
                )}

                {mapReports.map((r) => {
                  if (!r.location?.lat || !r.location?.lng) return null;
                  const sp = (r.species || 'other').toLowerCase();
                  const priority = inferPriority(r.description);
                  const isSelected = selectedReport?._id === r._id;
                  const cfg = SPECIES_CONFIG[sp] || SPECIES_CONFIG.other;
                  const icon = isSelected ? createPulsingIcon(priority, sp) : createPetIcon(priority, sp);
                  return (
                    <Marker
                      key={r._id}
                      position={[r.location.lat, r.location.lng]}
                      icon={icon}
                      ref={isSelected ? markerRef : undefined}
                      eventHandlers={{ click: () => setSelectedReport(r) }}
                    >
                      <Popup>
                        <div className="min-w-[200px] font-sans">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{cfg.icon}</span>
                            <p className="font-bold text-slate-800 capitalize">{cfg.name}</p>
                          </div>
                          <p className="text-xs text-slate-600 mb-1">
                            📍 {r.location.address || `${r.location.lat.toFixed(5)}, ${r.location.lng.toFixed(5)}`}
                          </p>
                          <p className="text-xs text-slate-600 mb-1">👤 Reported by: {r.reportedBy?.name || 'Finder'}</p>
                          <p className="text-xs text-slate-600 mb-1">⏱ {formatTimeAgo(r.createdAt)}</p>
                          {r.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.description}</p>}
                          <a
                            href={`https://www.google.com/maps?q=${r.location.lat},${r.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 block text-center text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Open in Google Maps →
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
          </div>

          {/* Selected Pet Info Card */}
          {selectedReport && (
            <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-4 transition-colors`}>
              <div className="flex items-start gap-4">
                {/* Photo */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-emerald-500/30">
                  <img
                    src={selectedReport.photos?.[0]?.url || selectedCfg.fallbackImg}
                    alt={selectedCfg.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 rounded-tl-lg bg-black/60 px-1 py-0.5 text-xs">{selectedCfg.icon}</div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-base font-bold ${textPrimary}`}>{selectedCfg.name}</h3>
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase ${
                      selectedPriority === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      selectedPriority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>{selectedPriority} Priority</span>
                    <span className="flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live GPS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className={`flex items-start gap-2 rounded-xl p-2 ${innerBg} border ${innerBorder}`}>
                      <MapPin className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className={`text-[9px] uppercase tracking-wider font-semibold ${textSecondary}`}>Location</p>
                        <p className={`text-xs font-semibold ${textPrimary} leading-tight`}>{selectedReport.location?.address || 'GPS location available'}</p>
                        {selectedReport.location?.lat && (
                          <p className={`text-[9px] font-mono ${textSecondary} mt-0.5`}>
                            {selectedReport.location.lat.toFixed(5)}, {selectedReport.location.lng.toFixed(5)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-start gap-2 rounded-xl p-2 ${innerBg} border ${innerBorder}`}>
                      <User className="h-3.5 w-3.5 text-purple-400 mt-0.5 shrink-0" />
                      <div>
                        <p className={`text-[9px] uppercase tracking-wider font-semibold ${textSecondary}`}>Reported By</p>
                        <p className={`text-xs font-semibold ${textPrimary}`}>{selectedReport.reportedBy?.name || 'Anonymous'}</p>
                        {selectedReport.contactPhone && (
                          <a href={`tel:${selectedReport.contactPhone}`} className="text-[9px] text-emerald-400 hover:underline flex items-center gap-0.5">
                            <Phone className="h-2.5 w-2.5" /> {selectedReport.contactPhone}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-start gap-2 rounded-xl p-2 ${innerBg} border ${innerBorder}`}>
                      <Clock className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className={`text-[9px] uppercase tracking-wider font-semibold ${textSecondary}`}>Reported</p>
                        <p className={`text-xs font-semibold ${textPrimary}`}>{formatTimeAgo(selectedReport.createdAt)}</p>
                      </div>
                    </div>

                    {selectedReport.description && (
                      <div className={`flex items-start gap-2 rounded-xl p-2 ${innerBg} border ${innerBorder}`}>
                        <AlertTriangle className="h-3.5 w-3.5 text-orange-400 mt-0.5 shrink-0" />
                        <div>
                          <p className={`text-[9px] uppercase tracking-wider font-semibold ${textSecondary}`}>Description</p>
                          <p className={`text-xs ${textPrimary} leading-tight line-clamp-2`}>{selectedReport.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                    >
                      <Navigation className="h-3.5 w-3.5" /> Google Maps
                    </a>
                  )}
                  <button
                    onClick={() => alert('Rescue assignment coming soon!')}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                  >
                    🚑 Assign Rescue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RescueTeamMap;
