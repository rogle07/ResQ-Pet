import { useEffect, useState } from 'react';
import { foundReportApi } from '@/features/foundReport/foundReportApi';
import type { FoundReport } from '@/types';
import Modal from '@/components/ui/Modal';
import {
  MapPin,
  Camera,
  Filter,
} from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  pending: { label: 'Pending Review', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' },
  under_review: { label: 'Under Review', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300' },
  owner_match_found: { label: 'Owner Match Found', badgeClass: 'bg-purple-100 text-purple-800 border-purple-300' },
  rescue_assigned: { label: 'Rescue Assigned', badgeClass: 'bg-teal-100 text-teal-800 border-teal-300' },
  reunited: { label: 'Reunited', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  closed: { label: 'Closed', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300' },
};

const FoundPetReporterMyReports = () => {
  const [reports, setReports] = useState<FoundReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeDetail, setActiveDetail] = useState<FoundReport | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await foundReportApi.list({ mine: true });
      setReports(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-bone">
            My Submitted Found Pet Reports
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-bone/60">
            Track and manage all the reports you have submitted for found animals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-mist-400" />
          <select
            className="input py-1.5 text-xs w-auto font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses ({reports.length})</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="owner_match_found">Owner Match Found</option>
            <option value="rescue_assigned">Rescue Assigned</option>
            <option value="reunited">Reunited</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center font-mono text-sm text-mist-500">Loading your reports…</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-600 dark:text-bone/70">No reports found under this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => {
            const statusConfig = STATUS_LABELS[report.status] || {
              label: report.status,
              badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
            };
            const photoUrl = report.photos?.[0]?.url;

            return (
              <div
                key={report._id}
                className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveDetail(report)}
              >
                <div className="flex items-start gap-4 min-w-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Pet"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-mist-700 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 shrink-0">
                      <Camera className="h-6 w-6" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-mist-500">
                        #{report._id.slice(-6).toUpperCase()}
                      </span>
                      <p className="font-bold text-sm text-slate-800 dark:text-bone capitalize">
                        {report.species} {report.breed ? `• ${report.breed}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-mist-500 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{report.location?.address || 'Location provided'}</span>
                    </div>

                    <p className="mt-1 text-xs text-slate-600 dark:text-bone/70 line-clamp-1">
                      {report.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center sm:flex-col sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusConfig.badgeClass}`}>
                    {statusConfig.label}
                  </span>
                  <span className="text-[11px] text-mist-400">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeDetail && (
        <Modal
          isOpen={!!activeDetail}
          onClose={() => setActiveDetail(null)}
          title={`Found Pet Report #${activeDetail._id.slice(-6).toUpperCase()}`}
        >
          <div className="space-y-4 text-xs">
            {activeDetail.photos?.[0]?.url && (
              <div className="rounded-xl overflow-hidden max-h-52 border border-slate-200">
                <img src={activeDetail.photos[0].url} alt="Found pet" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-mist-800/40 space-y-1">
              <p className="font-bold text-sm text-slate-800 dark:text-bone capitalize">
                {activeDetail.species} • {activeDetail.breed || 'Unknown breed'}
              </p>
              <p className="text-mist-500">Location: {activeDetail.location?.address}</p>
              <p className="text-mist-500">Contact: {activeDetail.contactPhone}</p>
              {activeDetail.currentPetLocation && <p>Current spot: {activeDetail.currentPetLocation}</p>}
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-bone mb-1">Details</p>
              <p className="text-slate-600 dark:text-bone/80 whitespace-pre-line">{activeDetail.description}</p>
            </div>
            <div className="flex justify-end pt-3 border-t">
              <button onClick={() => setActiveDetail(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FoundPetReporterMyReports;
