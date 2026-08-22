import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { adminApi, type PlatformAnalytics } from '@/features/admin/adminApi';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);

  useEffect(() => {
    adminApi.getAnalytics().then(setAnalytics);
  }, []);

  if (!analytics) return <p className="font-mono text-sm text-mist-500">loading…</p>;

  const petStatusData = analytics.petCountsByStatus.map((p) => ({ name: p._id.replace('_', ' '), count: p.count }));
  const rescueStatusData = analytics.rescueCountsByStatus.map((r) => ({ name: r._id.replace('_', ' '), count: r.count }));
  const donationTrend = analytics.monthlyDonations.map((d) => ({
    name: `${MONTH_NAMES[d._id.month]} ${d._id.year}`,
    amount: d.totalAmount,
  }));
  const signupTrend = analytics.monthlySignups.map((s) => ({
    name: `${MONTH_NAMES[s._id.month]} ${s._id.year}`,
    count: s.count,
  }));

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Platform Analytics</h2>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 font-semibold">Pets by status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={petStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#93A29A33" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#4C6B52" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="mb-4 font-semibold">Rescue requests by status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={rescueStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#93A29A33" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#C08A3E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="mb-4 font-semibold">Monthly donations</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={donationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#93A29A33" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#4C6B52" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="mb-4 font-semibold">Monthly signups</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={signupTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#93A29A33" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#E2593C" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
