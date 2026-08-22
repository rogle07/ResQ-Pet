import { useEffect, useState } from 'react';
import { rescueApi, type RescueRequest } from '@/features/rescue/rescueApi';
import StatusBadge from '@/components/ui/StatusBadge';
import { getSocket } from '@/hooks/useSocket';

const FILTERS = ['pending', 'accepted', 'in_progress', 'completed'] as const;
type Filter = typeof FILTERS[number];

const PRIORITY_META: Record<string, { label: string; dot: string; badge: string; glow: string }> = {
  critical: { label: 'Critical', dot: 'bg-coral-500', badge: 'bg-coral-100 text-coral-600', glow: 'shadow-[0_0_22px_5px_rgba(226,89,60,0.32)]' },
  high:     { label: 'High',     dot: 'bg-coral-400', badge: 'bg-coral-100/70 text-coral-500', glow: 'shadow-[0_0_14px_3px_rgba(235,124,92,0.25)]' },
  medium:   { label: 'Medium',   dot: 'bg-brass-500', badge: 'bg-brass-300/30 text-brass-600', glow: '' },
  low:      { label: 'Low',      dot: 'bg-mist-500',  badge: 'bg-mist-300/30 text-mist-700',   glow: '' },
};

const TYPE_ICON: Record<string, string> = {
  emergency: '🚨', stray: '🐾', lost_pet: '🔍', injured_animal: '🩹',
};

const STEPS = ['pending', 'accepted', 'in_progress', 'completed'] as const;

const StatusStepper = ({ status }: { status: string }) => {
  const idx = STEPS.indexOf(status as typeof STEPS[number]);
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div
            className={`h-2 w-2 rounded-full transition-all duration-500 ${i <= idx ? 'bg-moss-500 scale-110' : 'bg-mist-300 dark:bg-mist-700'}`}
            title={s.replace('_', ' ')}
          />
          {i < STEPS.length - 1 && (
            <div className={`h-px w-5 rounded transition-all duration-700 ${i < idx ? 'bg-moss-500' : 'bg-mist-200 dark:bg-mist-700/40'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const openInMaps = (lat: number, lng: number) =>
  window.open(`https://www.google.com/maps?q=${lat},${lng}&z=17`, '_blank', 'noopener,noreferrer');

interface RescueCardProps {
  r: RescueRequest;
  actingId: string | null;
  onAccept: (id: string) => void;
  onAdvance: (id: string, status: string) => void;
}

const RescueCard = ({ r, actingId, onAccept, onAdvance }: RescueCardProps) => {
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const pm = PRIORITY_META[r.priority] ?? PRIORITY_META.medium;
  const isCritical = r.priority === 'critical';
  const isFromFinder = r.type === 'stray' && !!r.description?.startsWith('Found pet reported by finder');

  const copyCoords = () => {
    navigator.clipboard.writeText(`${r.location.lat.toFixed(6)},${r.location.lng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className={`group relative overflow-hidden rounded-2xl border bg-white/75 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:bg-ink-soft/75 ${isCritical ? `border-coral-400/60 ${pm.glow}` : 'border-ink/10 dark:border-bone/10'}`}>
      {/* Left priority stripe */}
      <div className={`absolute left-0 top-0 h-full w-[3px] transition-all duration-300 group-hover:w-[5px] ${pm.dot}`} />

      <div className="p-5 pl-6">
        {/* Row 1: type + badges + status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl leading-none">{TYPE_ICON[r.type] ?? '🐾'}</span>
              <span className="font-display text-base font-semibold capitalize text-ink dark:text-bone">
                {r.type.replace('_', ' ')}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${pm.badge}`}>{pm.label}</span>
              {isFromFinder && (
                <span className="animate-pulse rounded-full bg-moss-100 px-2.5 py-0.5 text-xs font-bold text-moss-700 ring-1 ring-moss-300/60 dark:bg-moss-700/20 dark:text-moss-300">
                  📱 From Finder
                </span>
              )}
            </div>
            {r.pet && (
              <p className="text-sm text-ink/70 dark:text-bone/70">
                🐾 <span className="font-semibold">{r.pet.name}</span>{' '}
                <span className="capitalize text-mist-500">({r.pet.species})</span>
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <StatusBadge status={r.status} />
            <StatusStepper status={r.status} />
          </div>
        </div>

        {/* Description */}
        {r.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink/65 dark:text-bone/65">
            {r.description}
          </p>
        )}

        {/* ── PICKUP LOCATION PANEL ── */}
        <div className="mt-4 overflow-hidden rounded-xl border border-moss-100 dark:border-moss-700/25">
          <div className="flex items-center gap-2 border-b border-moss-100 bg-moss-500/5 px-4 py-2 dark:border-moss-700/20 dark:bg-moss-700/10">
            <span className="text-sm">📍</span>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-moss-700 dark:text-moss-300">
              Pickup Location
            </span>
          </div>
          <div className="bg-gradient-to-br from-moss-50/80 to-transparent p-4 dark:from-moss-700/8 dark:to-transparent">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                {r.location.address ? (
                  <>
                    <p className="font-semibold leading-snug text-ink dark:text-bone">{r.location.address}</p>
                    <p className="mt-1 font-mono text-xs text-mist-500">
                      GPS {r.location.lat.toFixed(5)}, {r.location.lng.toFixed(5)}
                    </p>
                  </>
                ) : (
                  <p className="font-mono text-sm font-semibold text-ink dark:text-bone">
                    {r.location.lat.toFixed(5)}, {r.location.lng.toFixed(5)}
                  </p>
                )}
              </div>
              <button
                onClick={() => openInMaps(r.location.lat, r.location.lng)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-moss-500 px-3 py-2 text-xs font-bold text-bone shadow-sm transition-all duration-200 hover:bg-moss-600 hover:shadow-md active:scale-95"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Navigate
              </button>
            </div>
            <button onClick={copyCoords} className="mt-2.5 flex items-center gap-1.5 text-xs text-mist-500 transition-colors hover:text-moss-600">
              {copied ? (
                <><span className="text-moss-500 font-bold">✓</span><span className="font-semibold text-moss-600">Copied!</span></>
              ) : (
                <><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy coordinates</>
              )}
            </button>
          </div>
        </div>

        {/* Requester info */}
        <div className="mt-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mist-300/50 to-mist-300/20 text-sm font-black text-mist-700 dark:from-mist-700/40 dark:to-mist-700/10 dark:text-mist-300">
            {r.requestedBy.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink/55 dark:text-bone/55">
              Reported by <span className="font-semibold text-ink dark:text-bone">{r.requestedBy.name}</span>
            </p>
            {r.requestedBy.phone && (
              <a href={`tel:${r.requestedBy.phone}`} className="text-xs font-medium text-moss-600 transition-colors hover:underline dark:text-moss-300">
                📞 {r.requestedBy.phone}
              </a>
            )}
          </div>
          <span className="shrink-0 text-[10px] text-mist-400">
            {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Timeline */}
        {r.timeline.length > 0 && (
          <>
            <button onClick={() => setTimelineOpen(v => !v)} className="mt-3 flex items-center gap-1.5 text-xs text-mist-500 transition-colors hover:text-moss-600">
              <svg className={`h-3.5 w-3.5 transition-transform duration-300 ${timelineOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              {timelineOpen ? 'Hide timeline' : `Timeline (${r.timeline.length} events)`}
            </button>
            {timelineOpen && (
              <div className="mt-3 space-y-2 border-t border-ink/8 pt-3 dark:border-bone/8">
                {r.timeline.map((t, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-moss-300" />
                    <div>
                      <p className="text-xs font-semibold capitalize text-ink/70 dark:text-bone/70">{t.status}</p>
                      {t.note && <p className="text-xs text-mist-500">{t.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {r.status === 'pending' && (
            <button onClick={() => onAccept(r._id)} disabled={actingId === r._id}
              className="flex items-center gap-2 rounded-full bg-moss-500 px-5 py-2 text-sm font-bold text-bone shadow-sm transition-all duration-200 hover:bg-moss-600 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
              {actingId === r._id
                ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-bone/30 border-t-bone" />Accepting…</>
                : '✅ Accept Request'}
            </button>
          )}
          {r.status === 'accepted' && (
            <button onClick={() => onAdvance(r._id, 'in_progress')} disabled={actingId === r._id}
              className="flex items-center gap-2 rounded-full border border-brass-500/40 bg-brass-300/20 px-5 py-2 text-sm font-bold text-brass-700 transition-all duration-200 hover:bg-brass-300/40 hover:shadow active:scale-95 disabled:opacity-50 dark:text-brass-300">
              🚗 Mark In Progress
            </button>
          )}
          {(r.status === 'accepted' || r.status === 'in_progress') && (
            <button onClick={() => onAdvance(r._id, 'completed')} disabled={actingId === r._id}
              className="flex items-center gap-2 rounded-full bg-moss-500 px-5 py-2 text-sm font-bold text-bone shadow-sm transition-all duration-200 hover:bg-moss-600 hover:shadow-md active:scale-95 disabled:opacity-50">
              🎉 Mark Completed
            </button>
          )}
          <button onClick={() => openInMaps(r.location.lat, r.location.lng)}
            className="flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-4 py-2 text-sm font-medium text-ink/70 transition-all duration-200 hover:bg-white hover:shadow active:scale-95 dark:border-bone/10 dark:bg-ink-soft/40 dark:text-bone/70">
            🗺️ Open in Maps
          </button>
        </div>
      </div>
    </div>
  );
};

const RescueTeamRequests = () => {
  const [filter, setFilter] = useState<Filter>('pending');
  const [requests, setRequests] = useState<RescueRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [newAlert, setNewAlert] = useState(false);

  const load = async (status: string) => {
    setLoading(true);
    const data = await rescueApi.list(status);
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => { load(filter); }, [filter]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onNew = (payload: RescueRequest) => {
      if (filter === 'pending') {
        setRequests(prev => [payload, ...prev]);
        setNewAlert(true);
        setTimeout(() => setNewAlert(false), 5000);
      }
    };
    const onEmergency = () => { if (filter === 'pending') load('pending'); };
    socket.on('rescue:new', onNew);
    socket.on('emergency:new', onEmergency);
    return () => { socket.off('rescue:new', onNew); socket.off('emergency:new', onEmergency); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const accept = async (id: string) => {
    setActingId(id);
    try { await rescueApi.accept(id); setRequests(prev => prev.filter(r => r._id !== id)); }
    finally { setActingId(null); }
  };

  const advance = async (id: string, status: string) => {
    setActingId(id);
    try {
      const updated = await rescueApi.updateStatus(id, status);
      setRequests(prev => status === 'completed' ? prev.filter(r => r._id !== id) : prev.map(r => r._id === id ? updated : r));
    } finally { setActingId(null); }
  };

  const filterMeta: Record<Filter, { label: string; icon: string }> = {
    pending:     { label: 'Pending',     icon: '🔴' },
    accepted:    { label: 'Accepted',    icon: '🟡' },
    in_progress: { label: 'In Progress', icon: '🔵' },
    completed:   { label: 'Completed',   icon: '🟢' },
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-coral-100 text-2xl shadow-sm dark:bg-coral-500/10">🚑</div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink dark:text-bone">Rescue Requests</h2>
            <p className="text-sm text-mist-500">Field operations · {requests.length} {filter.replace('_', ' ')}</p>
          </div>
        </div>
        {newAlert && (
          <div className="mt-4 flex animate-bounce items-center gap-3 rounded-2xl bg-gradient-to-r from-coral-500 to-coral-400 px-5 py-3 text-sm font-bold text-bone shadow-lg">
            🚨 New rescue request just arrived — check Pending!
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map(f => {
          const meta = filterMeta[f];
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                filter === f
                  ? 'bg-moss-500 text-bone shadow-md scale-105'
                  : 'border border-ink/10 bg-white/70 text-ink/70 hover:bg-white hover:shadow-sm dark:border-bone/10 dark:bg-ink-soft/60 dark:text-bone/70'
              }`}>
              <span>{meta.icon}</span>{meta.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-moss-200 border-t-moss-500" />
          <p className="font-mono text-sm text-mist-500">Loading rescue requests…</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-ink/10 bg-white/60 py-24 text-center dark:border-bone/10 dark:bg-ink-soft/40">
          <span className="text-5xl">✅</span>
          <p className="text-lg font-semibold text-ink/60 dark:text-bone/60">No {filter.replace('_', ' ')} requests</p>
          <p className="text-sm text-mist-500">All clear in this category</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(r => (
            <RescueCard key={r._id} r={r} actingId={actingId} onAccept={accept} onAdvance={advance} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RescueTeamRequests;
