import { useEffect, useState } from 'react';
import { adminApi, type PlatformAnalytics } from '@/features/admin/adminApi';

const AdminOverview = () => {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);

  useEffect(() => {
    adminApi.getAnalytics().then(setAnalytics);
  }, []);

  const totalUsers = analytics?.userCountsByRole.reduce((sum, r) => sum + r.count, 0) || 0;
  const totalPets = analytics?.petCountsByStatus.reduce((sum, p) => sum + p.count, 0) || 0;
  const lostPets = analytics?.petCountsByStatus.find((p) => p._id === 'lost')?.count || 0;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Platform Overview</h2>

      {!analytics ? (
        <p className="mt-6 font-mono text-sm text-mist-500">loading…</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card">
              <p className="label">Total users</p>
              <p className="text-2xl font-semibold">{totalUsers}</p>
            </div>
            <div className="card">
              <p className="label">Total pets</p>
              <p className="text-2xl font-semibold">{totalPets}</p>
            </div>
            <div className="card">
              <p className="label">Currently lost</p>
              <p className="text-2xl font-semibold text-coral-600">{lostPets}</p>
            </div>
            <div className="card">
              <p className="label">Total donations</p>
              <p className="text-2xl font-semibold text-moss-600">
                ${analytics.donationTotals.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 card">
            <h3 className="mb-4 font-semibold">Users by role</h3>
            <div className="space-y-2">
              {analytics.userCountsByRole.map((r) => (
                <div key={r._id} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{r._id.replace('_', ' ')}</span>
                  <span className="font-mono">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOverview;
