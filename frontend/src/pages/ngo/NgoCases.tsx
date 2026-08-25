import { useState } from 'react';
import { Clock, MapPin, Stethoscope, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp, X, Plus, Edit3 } from 'lucide-react';

interface Case {
  id: string;
  animal: string;
  emoji: string;
  location: string;
  team: string;
  vet: string | null;
  status: string;
  startDate: string;
  description: string;
  progress: number;
  notes?: string;
}

const INITIAL_CASES: Case[] = [
  { id: 'C001', animal: 'Injured Dog', emoji: '🐕', location: 'Indira Nagar, Lucknow', team: 'Team Alpha', vet: 'Dr. Sharma', status: 'active', startDate: 'Aug 24, 2026', description: 'Dog hit by vehicle. Fracture in right hind leg. Under treatment.', progress: 60 },
  { id: 'C002', animal: 'Trapped Kitten', emoji: '🐈', location: 'Gomti Nagar', team: 'Team Bravo', vet: 'Dr. Mehta', status: 'active', startDate: 'Aug 24, 2026', description: 'Kitten rescued from drain. Mild dehydration, under observation.', progress: 40 },
  { id: 'C003', animal: 'Injured Cow', emoji: '🐄', location: 'Faizabad Road', team: 'Team Bravo', vet: 'Dr. Yadav', status: 'critical', startDate: 'Aug 23, 2026', description: 'Severe leg injury from truck. Emergency surgery scheduled.', progress: 20 },
  { id: 'C004', animal: 'Stray Dogs', emoji: '🐕‍🦺', location: 'Aliganj', team: 'Team Charlie', vet: null, status: 'resolved', startDate: 'Aug 22, 2026', description: 'Pack of dogs relocated to shelter. All vaccinated.', progress: 100 },
  { id: 'C005', animal: 'Abandoned Puppies', emoji: '🐶', location: 'Mahanagar', team: 'Team Alpha', vet: 'Dr. Sharma', status: 'resolved', startDate: 'Aug 21, 2026', description: 'All 4 puppies rehomed with foster families.', progress: 100 },
  { id: 'C006', animal: 'Injured Bird', emoji: '🐦', location: 'Hazratganj', team: 'Team Delta', vet: 'Dr. Mehta', status: 'pending', startDate: 'Aug 24, 2026', description: 'Pigeon with broken wing. Awaiting vet assessment.', progress: 10 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30', icon: <Clock className="h-3.5 w-3.5" /> },
  critical: { label: 'Critical', color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  resolved: { label: 'Resolved', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  pending: { label: 'Pending', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30', icon: <Clock className="h-3.5 w-3.5" /> },
  closed: { label: 'Closed', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800', icon: <XCircle className="h-3.5 w-3.5" /> },
};

const NgoCases = () => {
  const [cases, setCases] = useState<Case[]>(INITIAL_CASES);
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>('C001');

  // Update Case modal state
  const [updatingCase, setUpdatingCase] = useState<Case | null>(null);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateDesc, setUpdateDesc] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Confirm close modal
  const [closingCaseId, setClosingCaseId] = useState<string | null>(null);

  const filtered = filterStatus === 'All' ? cases : cases.filter((c) => c.status === filterStatus);

  const openUpdateModal = (c: Case) => {
    setUpdatingCase(c);
    setUpdateProgress(c.progress);
    setUpdateDesc(c.description);
    setUpdateStatus(c.status);
    setUpdateNotes(c.notes || '');
    setUpdateSuccess(false);
  };

  const handleUpdateCase = () => {
    if (!updatingCase) return;
    setCases((prev) =>
      prev.map((c) =>
        c.id === updatingCase.id
          ? { ...c, progress: updateProgress, description: updateDesc, status: updateStatus, notes: updateNotes }
          : c
      )
    );
    setUpdateSuccess(true);
    setTimeout(() => setUpdatingCase(null), 1200);
  };

  const handleMarkResolved = (id: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'resolved', progress: 100 } : c))
    );
    setExpandedId(null);
  };

  const handleCloseCase = (id: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'closed', progress: 100 } : c))
    );
    setClosingCaseId(null);
    setExpandedId(null);
  };

  const barColor = (progress: number, status: string) => {
    if (status === 'critical') return 'bg-rose-500';
    if (progress === 100) return 'bg-emerald-500';
    if (progress > 50) return 'bg-violet-500';
    return 'bg-amber-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Cases</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track all active and past rescue & treatment cases.</p>
        </div>
        <button
          onClick={() => setUpdatingCase({ id: `C00${cases.length + 1}`, animal: '', emoji: '🐾', location: '', team: '', vet: null, status: 'pending', startDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), description: '', progress: 0, notes: '' })}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Case
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Cases', value: cases.length, color: 'text-violet-600' },
          { label: 'Active', value: cases.filter((c) => c.status === 'active').length, color: 'text-blue-600' },
          { label: 'Critical', value: cases.filter((c) => c.status === 'critical').length, color: 'text-rose-600' },
          { label: 'Resolved', value: cases.filter((c) => c.status === 'resolved').length, color: 'text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'active', 'critical', 'pending', 'resolved', 'closed'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-xl px-4 py-2 text-xs font-bold capitalize transition-colors ${filterStatus === s ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            No cases match this filter.
          </div>
        )}
        {filtered.map((c) => {
          const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
          const isExpanded = expandedId === c.id;
          const isActionable = c.status !== 'resolved' && c.status !== 'closed';

          return (
            <div key={c.id} className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              {/* Case header — always visible */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="text-2xl shrink-0">{c.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400">#{c.id}</span>
                    <h3 className="font-bold text-slate-900 dark:text-white">{c.animal}</h3>
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-violet-400" />{c.location}</span>
                    <span className="font-semibold text-violet-600 dark:text-violet-400">Team: {c.team}</span>
                    {c.vet && <span className="flex items-center gap-1"><Stethoscope className="h-3 w-3" />{c.vet}</span>}
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-2 rounded-full transition-all duration-500 ${barColor(c.progress, c.status)}`} style={{ width: `${c.progress}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 shrink-0">{c.progress}%</span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-slate-100 px-5 pb-5 dark:border-slate-800">
                  <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{c.description}</p>
                  {c.notes && (
                    <div className="mt-2 rounded-xl bg-violet-50 px-3 py-2 dark:bg-violet-900/20">
                      <p className="text-[11px] font-bold text-violet-700 dark:text-violet-400">Update Notes</p>
                      <p className="text-xs text-violet-600 dark:text-violet-300 mt-0.5">{c.notes}</p>
                    </div>
                  )}
                  <p className="mt-2 text-[11px] text-slate-400">Started: {c.startDate}</p>

                  {/* Action buttons */}
                  {isActionable && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <button
                        onClick={() => openUpdateModal(c)}
                        className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 active:scale-95 transition-all shadow-md shadow-violet-600/20"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Update Case
                      </button>
                      <button
                        onClick={() => handleMarkResolved(c.id)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Mark Resolved
                      </button>
                      <button
                        onClick={() => setClosingCaseId(c.id)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Close
                      </button>
                    </div>
                  )}
                  {!isActionable && (
                    <div className={`mt-3 rounded-xl px-3 py-2 inline-flex items-center gap-1.5 text-xs font-semibold ${cfg.color}`}>
                      {cfg.icon} This case has been {c.status}.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Update Case Modal ── */}
      {updatingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">Update Case</h2>
                <p className="text-xs text-slate-500 mt-0.5">{updatingCase.emoji} {updatingCase.animal} — #{updatingCase.id}</p>
              </div>
              <button onClick={() => setUpdatingCase(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Case Status</label>
                <div className="flex gap-2 flex-wrap">
                  {['active', 'critical', 'pending', 'resolved'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setUpdateStatus(s)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold capitalize transition-colors ${updateStatus === s ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Progress: <span className="text-violet-600">{updateProgress}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={updateProgress}
                  onChange={(e) => setUpdateProgress(parseInt(e.target.value))}
                  className="w-full accent-violet-600"
                />
                <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-2 rounded-full bg-violet-500 transition-all" style={{ width: `${updateProgress}%` }} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Case Description</label>
                <textarea
                  value={updateDesc}
                  onChange={(e) => setUpdateDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm resize-none focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Update Notes / Remarks</label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  rows={2}
                  placeholder="Add update notes, e.g. 'Surgery completed. Animal resting well.'"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm resize-none focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {updateSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-900/30">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Case updated successfully!</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
              <button onClick={() => setUpdatingCase(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700">Cancel</button>
              <button onClick={handleUpdateCase} disabled={updateSuccess} className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors">
                Save Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Close Modal ── */}
      {closingCaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 mb-4 dark:bg-rose-900/30">
              <XCircle className="h-6 w-6 text-rose-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Close Case?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              Closing this case will archive it and mark it as inactive. This action can be reviewed later.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setClosingCaseId(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700">Keep Open</button>
              <button onClick={() => handleCloseCase(closingCaseId)} className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white hover:bg-rose-700 transition-colors">Close Case</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoCases;
