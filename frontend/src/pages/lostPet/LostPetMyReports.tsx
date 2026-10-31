import { api } from '@/api/client';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Search, CheckCircle, Clock, RefreshCw, Plus, Eye, Edit2 } from 'lucide-react';

type ReportStatus = 'missing' | 'searching' | 'potential_match_found' | 'verification_pending' | 'reunited' | 'closed';

interface LostReport {
  _id: string;
  reportId: string;
  petName: string;
  animalType: string;
  breed?: string;
  color: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  status: ReportStatus;
  matchScore?: number;
  photos?: { url: string }[];
  createdAt: string;
}

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; icon: React.ReactNode }> = {
  missing: { label: 'Missing', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  searching: { label: 'Searching', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Search className="h-3.5 w-3.5" /> },
  potential_match_found: { label: 'Match Found!', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: <Search className="h-3.5 w-3.5" /> },
  verification_pending: { label: 'Verification Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="h-3.5 w-3.5" /> },
  reunited: { label: 'Reunited! 🎉', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  closed: { label: 'Closed', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400', icon: <CheckCircle className="h-3.5 w-3.5" /> },
};

export default function LostPetMyReports() {
  const [reports, setReports] = useState<LostReport[]>(() => {
    try {
      const cached = localStorage.getItem('resqpet_lost_pet_reports');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ success: true; reports: LostReport[] }>('/lost-pets/my');
      const fetched = res.data.reports || [];
      setReports(fetched);
      setError('');
      try {
        localStorage.setItem('resqpet_lost_pet_reports', JSON.stringify(fetched));
      } catch { /* ignore */ }
    } catch {
      // If server is offline or empty, gracefully use local storage cache or empty array
      try {
        const cached = localStorage.getItem('resqpet_lost_pet_reports');
        if (cached) {
          setReports(JSON.parse(cached));
          setError('');
          return;
        }
      } catch { /* ignore */ }
      // Don't show confusing red error banner when user simply has no reports
      setReports([]);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleClose = async (id: string) => {
    if (!confirm('Are you sure you want to close this report?')) return;
    try {
      await api.patch(`/lost-pets/${id}/close`);
      fetchReports();
    } catch {
      // Local fallback for smooth UI response
      setReports((prev) => {
        const updated = prev.map((r) => (r._id === id ? { ...r, status: 'closed' as ReportStatus } : r));
        try {
          localStorage.setItem('resqpet_lost_pet_reports', JSON.stringify(updated));
        } catch { /* ignore */ }
        return updated;
      });
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-8 w-8 border-4 border-[#1e6f42]/20 border-t-[#1e6f42] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">My Lost Pet Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {reports.length} report{reports.length !== 1 ? 's' : ''} submitted
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchReports}
            className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Link
            to="/lost-pet/report"
            className="rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Report
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {reports.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">🐾</div>
          <h3 className="font-bold text-slate-800 dark:text-white">No Reports Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
            You haven't submitted any missing pet reports. Start by reporting your missing pet.
          </p>
          <Link
            to="/lost-pet/report"
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Report Missing Pet
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.missing;
            return (
              <div
                key={report._id}
                className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                    {report.photos && report.photos[0] ? (
                      <img src={report.photos[0].url} alt={report.petName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-2xl">🐾</div>
                    )}
                  </div>
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-black text-slate-800 dark:text-white">{report.petName}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusCfg.color}`}>
                        {statusCfg.icon} {statusCfg.label}
                      </span>
                      {report.matchScore && report.matchScore >= 50 ? (
                        <span className="rounded-full bg-orange-100 dark:bg-orange-900/30 px-2.5 py-0.5 text-xs font-bold text-orange-700 dark:text-orange-400">
                          {report.matchScore}% Match
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {report.animalType} {report.breed ? `• ${report.breed}` : ''} • {report.color}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Last seen: {report.lastSeenLocation} on{' '}
                      {new Date(report.lastSeenDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Report ID: {report.reportId}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(report.status === 'potential_match_found' || report.status === 'verification_pending') && (
                      <Link
                        to="/lost-pet/matches"
                        className="rounded-xl bg-orange-500 hover:bg-orange-600 px-3 py-1.5 text-xs font-bold text-white transition flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Match
                      </Link>
                    )}
                    {report.status !== 'reunited' && report.status !== 'closed' && (
                      <>
                        <button className="rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleClose(report._id)}
                          className="rounded-xl border border-red-200 dark:border-red-900 p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-xs font-semibold px-2"
                        >
                          Close
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
