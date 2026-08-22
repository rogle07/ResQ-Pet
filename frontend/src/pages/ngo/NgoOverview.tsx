import { useEffect, useState } from 'react';
import { ngoApi, type NgoDashboardSummary } from '@/features/ngo/ngoApi';

const NgoOverview = () => {
  const [summary, setSummary] = useState<NgoDashboardSummary | null>(null);

  useEffect(() => {
    ngoApi.dashboard().then(setSummary);
  }, []);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Organization Overview</h2>
      <p className="mt-1 text-sm text-ink/60 dark:text-bone/60">A snapshot of your organization's activity.</p>

      {summary ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <p className="label">Animals managed</p>
            <p className="text-2xl font-semibold">{summary.animalsManaged}</p>
          </div>
          <div className="card">
            <p className="label">Pending adoptions</p>
            <p className="text-2xl font-semibold text-brass-600">{summary.pendingAdoptions}</p>
          </div>
          <div className="card">
            <p className="label">Active rescues</p>
            <p className="text-2xl font-semibold text-coral-600">{summary.activeRescues}</p>
          </div>
          <div className="card">
            <p className="label">Total donations</p>
            <p className="text-2xl font-semibold text-moss-600">${summary.totalDonations.toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <p className="mt-6 font-mono text-sm text-mist-500">loading…</p>
      )}
    </div>
  );
};

export default NgoOverview;
