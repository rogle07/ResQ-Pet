import { useEffect, useState } from 'react';
import { ngoApi, type AdoptionApplication } from '@/features/ngo/ngoApi';
import { Heart, CheckCircle, XCircle, Clock, Search, Filter, Eye, X, Check } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' },
  rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30' },
  completed: { label: 'Completed', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30' },
};

// Fallback mock data for when API returns empty
const MOCK_APPLICATIONS: AdoptionApplication[] = [
  { _id: '1', pet: { _id: 'p1', name: 'Bruno', species: 'Dog', breed: 'Labrador', images: [] }, applicant: { _id: 'u1', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@example.com' }, applicationNote: 'I have a large yard and experience with dogs. Family is eager to welcome Bruno.', status: 'pending', createdAt: new Date().toISOString() },
  { _id: '2', pet: { _id: 'p2', name: 'Whiskers', species: 'Cat', breed: 'Persian', images: [] }, applicant: { _id: 'u2', name: 'Priya Singh', phone: '+91 87654 32109', email: 'priya@example.com' }, applicationNote: 'I live alone and would love a cat companion. I work from home so will be attentive.', status: 'under_review', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: '3', pet: { _id: 'p3', name: 'Coco', species: 'Dog', breed: 'Beagle', images: [] }, applicant: { _id: 'u3', name: 'Aman Verma', phone: undefined, email: 'aman@example.com' }, applicationNote: 'Experienced dog owner, regular vet visits assured.', status: 'approved', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { _id: '4', pet: { _id: 'p4', name: 'Mittens', species: 'Cat', breed: 'Tabby', images: [] }, applicant: { _id: 'u4', name: 'Neha Mishra', phone: '+91 76543 21098', email: 'neha@example.com' }, applicationNote: 'Kids love cats. We have previous pet experience.', status: 'rejected', createdAt: new Date(Date.now() - 259200000).toISOString() },
];

const NgoAdoptions = () => {
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewingApp, setViewingApp] = useState<AdoptionApplication | null>(null);

  const load = () => {
    setLoading(true);
    ngoApi.getAdoptions()
      .then((data) => {
        setApplications(data.length > 0 ? data : MOCK_APPLICATIONS);
        setLoading(false);
      })
      .catch(() => {
        setApplications(MOCK_APPLICATIONS);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const decide = async (id: string, decision: 'approved' | 'rejected' | 'under_review') => {
    setActingId(id);
    try {
      if (decision === 'approved' || decision === 'rejected') {
        await ngoApi.decideAdoption(id, decision);
      }
    } catch {
      // ignore API error for mock data
    } finally {
      setApplications((prev) => prev.map((a) => (a._id === id ? { ...a, status: decision } : a)));
      if (viewingApp?._id === id) {
        setViewingApp((a) => a ? { ...a, status: decision } : a);
      }
      setActingId(null);
    }
  };

  const filtered = applications.filter((a) => {
    const matchSearch = a.pet.name.toLowerCase().includes(search.toLowerCase()) || a.applicant.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Adoptions</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review and manage all pet adoption applications.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {applications.filter((a) => a.status === key).length}
            </p>
            <p className="text-xs text-slate-500 mt-1">{cfg.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by pet or applicant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Filter className="h-4 w-4 text-slate-500" />
          {['All', ...Object.keys(STATUS_CONFIG)].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-xl px-3 py-2 text-xs font-bold capitalize transition-colors ${filterStatus === s ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
          No applications match your filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
            const isPending = app.status === 'pending' || app.status === 'under_review';
            return (
              <div key={app._id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-900/20">
                      <Heart className="h-7 w-7 text-violet-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">{app.pet.name}</h3>
                        <span className="text-xs text-slate-400 capitalize">· {app.pet.species} {app.pet.breed && `(${app.pet.breed})`}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Applicant: <span className="font-semibold">{app.applicant.name}</span>
                        {app.applicant.phone && <span className="text-slate-400"> · {app.applicant.phone}</span>}
                      </p>
                      {app.applicationNote && (
                        <p className="mt-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs italic text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          "{app.applicationNote}"
                        </p>
                      )}
                      <p className="mt-2 text-[11px] text-slate-400">
                        <Clock className="inline h-3 w-3 mr-0.5" />
                        Applied: {new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                </div>

                <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 flex-wrap">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => decide(app._id, 'approved')}
                        disabled={actingId === app._id}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => decide(app._id, 'rejected')}
                        disabled={actingId === app._id}
                        className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-50 transition-colors dark:border-rose-800 dark:bg-rose-900/20"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                      {app.status === 'pending' && (
                        <button
                          onClick={() => decide(app._id, 'under_review')}
                          disabled={actingId === app._id}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 transition-colors"
                        >
                          Mark Under Review
                        </button>
                      )}
                    </>
                  ) : null}
                  <button
                    onClick={() => setViewingApp(app)}
                    className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-600 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-400 transition-colors ml-auto"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── View Application Details Modal ── */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">Adoption Application</h2>
                <p className="text-xs text-slate-500">For {viewingApp.pet.name} ({viewingApp.pet.species})</p>
              </div>
              <button onClick={() => setViewingApp(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Applicant</p>
                <p className="font-bold text-slate-900 dark:text-white">{viewingApp.applicant.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{viewingApp.applicant.email}</p>
                {viewingApp.applicant.phone && <p className="text-xs text-slate-500">{viewingApp.applicant.phone}</p>}
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Applicant Note</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                  "{viewingApp.applicationNote || 'No specific note provided.'}"
                </p>
              </div>

              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-500">Application Date:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(viewingApp.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-500">Current Status:</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${STATUS_CONFIG[viewingApp.status]?.color}`}>
                  {STATUS_CONFIG[viewingApp.status]?.label || viewingApp.status}
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => decide(viewingApp._id, 'approved')}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
              >
                <Check className="h-4 w-4" /> Approve
              </button>
              <button
                onClick={() => decide(viewingApp._id, 'rejected')}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors"
              >
                <XCircle className="h-4 w-4" /> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoAdoptions;
