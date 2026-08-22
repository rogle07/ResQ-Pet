import { useEffect, useState } from 'react';
import { donationApi, type DonationAnalytics } from '@/features/donations/donationApi';

const NgoDonations = () => {
  const [analytics, setAnalytics] = useState<DonationAnalytics | null>(null);

  useEffect(() => {
    donationApi.analytics().then(setAnalytics);
  }, []);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Donations</h2>

      {!analytics ? (
        <p className="mt-6 font-mono text-sm text-mist-500">loading…</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="card">
              <p className="label">Total raised</p>
              <p className="text-2xl font-semibold text-moss-600">${analytics.totals.totalAmount.toLocaleString()}</p>
            </div>
            <div className="card">
              <p className="label">Total donations</p>
              <p className="text-2xl font-semibold">{analytics.totals.count}</p>
            </div>
          </div>

          {analytics.byType.length > 0 && (
            <div className="card mt-6">
              <h3 className="mb-4 font-semibold">By type</h3>
              <div className="space-y-2">
                {analytics.byType.map((t) => (
                  <div key={t._id} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{t._id.replace('_', ' ')}</span>
                    <span className="font-mono">${t.totalAmount.toLocaleString()} ({t.count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NgoDonations;
