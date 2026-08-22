import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { foundReportApi, type FoundReport } from '@/features/foundReports/foundReportApi';
import StatusBadge from '@/components/ui/StatusBadge';

const FinderOverview = () => {
  const [reports, setReports] = useState<FoundReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    foundReportApi.list().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Your Reports</h2>
          <p className="mt-1 text-sm text-ink/60 dark:text-bone/60">Pets you've reported finding.</p>
        </div>
        <Link to="/finder/report" className="btn-primary">+ Report a found pet</Link>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-mist-500">loading…</p>
      ) : reports.length === 0 ? (
        <div className="card text-center">
          <p className="text-ink/70 dark:text-bone/70">You haven't reported any found pets yet.</p>
          <Link to="/finder/report" className="btn-primary mt-4 inline-flex">Report a found pet</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r._id} className="card flex items-start justify-between gap-4">
              <div>
                <p className="font-medium capitalize">{r.species || 'Pet'} found</p>
                <p className="text-sm text-ink/60 dark:text-bone/60">{r.description}</p>
                <p className="mt-1 font-mono text-xs text-mist-500">
                  {r.location.address || `${r.location.lat.toFixed(3)}, ${r.location.lng.toFixed(3)}`}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinderOverview;
