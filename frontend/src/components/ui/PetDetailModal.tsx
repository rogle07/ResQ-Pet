import { useEffect } from 'react';
import { X, MapPin, Phone, User, Clock, AlertTriangle, Navigation } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface PetDetail {
  id: string;
  species: string;
  name: string;
  location: string;
  reporter: string;
  priority: string;
  timeAgo: string;
  img: string;
  description?: string;
  contactPhone?: string;
  lat?: number;
  lng?: number;
  isLive?: boolean;
}

interface PetDetailModalProps {
  report: PetDetail | null;
  onClose: () => void;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  HIGH: { label: 'HIGH PRIORITY', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40' },
  MEDIUM: { label: 'MEDIUM PRIORITY', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
  LOW: { label: 'LOW PRIORITY', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
};

const PetDetailModal = ({ report, onClose }: PetDetailModalProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!report) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [report, onClose]);

  if (!report) return null;

  const priority = PRIORITY_CONFIG[report.priority.toUpperCase()] ?? PRIORITY_CONFIG.MEDIUM;
  const mapsUrl = report.lat && report.lng
    ? `https://www.google.com/maps?q=${report.lat},${report.lng}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-[fadeInScale_0.2s_ease-out] ${
        isDark
          ? 'bg-[#071726] border border-[#14344f]'
          : 'bg-white border border-slate-200'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
            isDark ? 'bg-[#0b1e2e] text-slate-400 hover:text-white hover:bg-[#142d44]' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Pet Photo Banner */}
        <div className="relative h-52 w-full overflow-hidden bg-black">
          <img
            src={report.img}
            alt={report.name}
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${priority.bg} ${priority.color} border ${priority.border}`}>
              {priority.label}
            </span>
            {report.isLive && (
              <span className="flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2 py-1 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
              </span>
            )}
          </div>

          {/* Pet name overlay */}
          <div className="absolute bottom-3 left-3">
            <p className="text-xl font-black text-white drop-shadow-lg">{report.name}</p>
            <p className="text-xs text-white/70 mt-0.5">{report.timeAgo}</p>
          </div>
        </div>

        {/* Details Body */}
        <div className={`p-5 space-y-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>

          {/* Location Row */}
          <div className={`flex items-start gap-3 rounded-xl p-3 ${isDark ? 'bg-[#05111d] border border-[#14344f]' : 'bg-slate-50 border border-slate-200'}`}>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <MapPin className="h-4 w-4 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Location Found</p>
              <p className={`text-sm font-semibold mt-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{report.location}</p>
              {report.lat && report.lng && (
                <p className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
                </p>
              )}
            </div>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                title="Open in Google Maps"
              >
                <Navigation className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Reporter Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`flex items-start gap-2.5 rounded-xl p-3 ${isDark ? 'bg-[#05111d] border border-[#14344f]' : 'bg-slate-50 border border-slate-200'}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <User className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Reported By</p>
                <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{report.reporter}</p>
              </div>
            </div>

            {report.contactPhone ? (
              <a
                href={`tel:${report.contactPhone}`}
                className={`flex items-start gap-2.5 rounded-xl p-3 transition-colors ${isDark ? 'bg-[#05111d] border border-[#14344f] hover:border-emerald-500/50' : 'bg-slate-50 border border-slate-200 hover:border-emerald-400'}`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Contact</p>
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5">{report.contactPhone}</p>
                </div>
              </a>
            ) : (
              <div className={`flex items-start gap-2.5 rounded-xl p-3 ${isDark ? 'bg-[#05111d] border border-[#14344f]' : 'bg-slate-50 border border-slate-200'}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Reported</p>
                  <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{report.timeAgo}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {report.description && (
            <div className={`rounded-xl p-3 ${isDark ? 'bg-[#05111d] border border-[#14344f]' : 'bg-slate-50 border border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Description</p>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{report.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-colors border ${
                  isDark ? 'border-blue-500/40 bg-blue-950/30 text-blue-400 hover:bg-blue-900/40' : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <MapPin className="h-3.5 w-3.5" /> View on Map
              </a>
            )}
            <button
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors col-span-1"
              onClick={() => alert('Rescue assignment feature coming soon!')}
            >
              🚑 Assign Rescue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetailModal;
