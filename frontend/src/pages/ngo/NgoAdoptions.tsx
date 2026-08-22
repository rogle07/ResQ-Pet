import { useEffect, useState } from 'react';
import { ngoApi, type AdoptionApplication } from '@/features/ngo/ngoApi';
import StatusBadge from '@/components/ui/StatusBadge';

const NgoAdoptions = () => {
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    ngoApi.getAdoptions().then((data) => {
      setApplications(data);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const decide = async (id: string, decision: 'approved' | 'rejected') => {
    setActingId(id);
    try {
      await ngoApi.decideAdoption(id, decision);
      setApplications((prev) => prev.map((a) => (a._id === id ? { ...a, status: decision } : a)));
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Adoption Applications</h2>

      {loading ? (
        <p className="mt-6 font-mono text-sm text-mist-500">loading…</p>
      ) : applications.length === 0 ? (
        <div className="card mt-6 text-center text-sm text-ink/60 dark:text-bone/60">No applications yet.</div>
      ) : (
        <div className="mt-6 space-y-4">
          {applications.map((app) => (
            <div key={app._id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{app.pet.name} <span className="font-normal text-ink/50">· {app.pet.species}</span></p>
                  <p className="mt-1 text-sm text-ink/70 dark:text-bone/70">
                    Applicant: {app.applicant.name} {app.applicant.phone && `· ${app.applicant.phone}`}
                  </p>
                  {app.applicationNote && <p className="mt-1 text-sm text-ink/60 dark:text-bone/60">"{app.applicationNote}"</p>}
                </div>
                <StatusBadge status={app.status} />
              </div>

              {(app.status === 'pending' || app.status === 'under_review') && (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => decide(app._id, 'approved')} disabled={actingId === app._id} className="btn-primary">
                    Approve
                  </button>
                  <button onClick={() => decide(app._id, 'rejected')} disabled={actingId === app._id} className="btn-secondary text-coral-600">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NgoAdoptions;
