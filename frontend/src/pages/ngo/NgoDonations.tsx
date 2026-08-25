import { useEffect, useState } from 'react';
import { donationApi, type DonationAnalytics } from '@/features/donations/donationApi';
import { DollarSign, TrendingUp, Heart, Plus, X, CheckCircle } from 'lucide-react';

const MOCK_ANALYTICS: DonationAnalytics = {
  totals: { totalAmount: 245000, count: 134 },
  byType: [
    { _id: 'one_time', totalAmount: 145000, count: 89 },
    { _id: 'monthly', totalAmount: 72000, count: 30 },
    { _id: 'campaign', totalAmount: 28000, count: 15 },
  ],
  monthly: [
    { _id: { year: 2026, month: 8 }, totalAmount: 45000 },
    { _id: { year: 2026, month: 7 }, totalAmount: 38000 },
  ],
};

const INITIAL_DONATIONS = [
  { id: '1', donor: 'Rahul Sharma', amount: 5000, type: 'One Time', date: 'Aug 24, 2026', purpose: 'Medical Care' },
  { id: '2', donor: 'Priya Singh', amount: 2000, type: 'Monthly', date: 'Aug 23, 2026', purpose: 'Food & Shelter' },
  { id: '3', donor: 'Anonymous', amount: 10000, type: 'Campaign', date: 'Aug 23, 2026', purpose: 'Rescue Operations' },
  { id: '4', donor: 'Aman Verma', amount: 1500, type: 'One Time', date: 'Aug 22, 2026', purpose: 'General Fund' },
  { id: '5', donor: 'Neha Mishra', amount: 3000, type: 'Monthly', date: 'Aug 22, 2026', purpose: 'Medical Care' },
];

const INITIAL_CAMPAIGNS = [
  { id: '1', title: 'Save Injured Animals', goal: 100000, raised: 72500, color: 'bg-violet-500' },
  { id: '2', title: 'Build New Shelter', goal: 500000, raised: 180000, color: 'bg-blue-500' },
  { id: '3', title: 'Monthly Vaccination Drive', goal: 50000, raised: 42000, color: 'bg-emerald-500' },
];

const NgoDonations = () => {
  const [analytics, setAnalytics] = useState<DonationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [donations, setDonations] = useState(INITIAL_DONATIONS);

  // New Campaign Modal
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [campTitle, setCampTitle] = useState('');
  const [campGoal, setCampGoal] = useState('');
  const [campColor, setCampColor] = useState('bg-violet-500');

  // New Donation Modal
  const [showNewDonation, setShowNewDonation] = useState(false);
  const [donDonor, setDonDonor] = useState('');
  const [donAmount, setDonAmount] = useState('');
  const [donPurpose, setDonPurpose] = useState('Medical Care');
  const [donType, setDonType] = useState('One Time');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    donationApi.analytics()
      .then((data) => {
        setAnalytics(data.totals.count > 0 ? data : MOCK_ANALYTICS);
        setLoading(false);
      })
      .catch(() => {
        setAnalytics(MOCK_ANALYTICS);
        setLoading(false);
      });
  }, []);

  const data = analytics || MOCK_ANALYTICS;

  const handleCreateCampaign = () => {
    if (!campTitle.trim() || !campGoal) return;
    const created = {
      id: String(Date.now()),
      title: campTitle,
      goal: parseInt(campGoal) || 50000,
      raised: 0,
      color: campColor,
    };
    setCampaigns((prev) => [created, ...prev]);
    setCampTitle('');
    setCampGoal('');
    setShowNewCampaign(false);
    setSuccessToast('New campaign published successfully!');
    setTimeout(() => setSuccessToast(null), 2000);
  };

  const handleAddDonation = () => {
    if (!donAmount) return;
    const amt = parseInt(donAmount);
    const created = {
      id: String(Date.now()),
      donor: donDonor || 'Anonymous Supporter',
      amount: amt,
      type: donType,
      date: 'Today',
      purpose: donPurpose,
    };
    setDonations((prev) => [created, ...prev]);
    setAnalytics((prev) => {
      const base = prev || MOCK_ANALYTICS;
      return {
        ...base,
        totals: {
          totalAmount: base.totals.totalAmount + amt,
          count: base.totals.count + 1,
        },
      };
    });
    setDonDonor('');
    setDonAmount('');
    setShowNewDonation(false);
    setSuccessToast(`Recorded ₹${amt.toLocaleString('en-IN')} donation!`);
    setTimeout(() => setSuccessToast(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Donations & Campaigns</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track all donations and manage fundraising campaigns.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewDonation(true)}
            className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-bold text-violet-600 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-400 transition-colors"
          >
            <DollarSign className="h-4 w-4" /> Record Donation
          </button>
          <button
            onClick={() => setShowNewCampaign(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Campaign
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{successToast}</p>
        </div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
              <DollarSign className="h-5 w-5 text-violet-600" />
            </div>
            <p className="text-sm font-medium text-slate-500">Total Raised</p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            ₹{loading ? '—' : data.totals.totalAmount.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1"><TrendingUp className="h-3 w-3" />+18% this month</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Heart className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-slate-500">Total Donors</p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{loading ? '—' : data.totals.count}</p>
          <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1"><TrendingUp className="h-3 w-3" />+8 new this week</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-slate-500">Active Campaigns</p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{campaigns.length}</p>
          <p className="mt-1 text-xs text-slate-400">Ongoing fundraisers</p>
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 font-bold text-slate-900 dark:text-white">Active Campaigns</h2>
        <div className="space-y-5">
          {campaigns.map((c) => {
            const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
            return (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.title}</p>
                  <span className="text-xs font-bold text-violet-600">{pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-2.5 rounded-full ${c.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-slate-500">₹{c.raised.toLocaleString('en-IN')} raised</span>
                  <span className="text-[11px] text-slate-400">Goal: ₹{c.goal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* By type breakdown + Recent donations in 2 columns */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* By Type */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-bold text-slate-900 dark:text-white">Donations by Type</h2>
          <div className="space-y-3">
            {data.byType.map((t) => (
              <div key={t._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                  <span className="text-sm capitalize text-slate-700 dark:text-slate-300">{t._id.replace('_', ' ')}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">₹{t.totalAmount.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-slate-400">{t.count} donations</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Donations */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-bold text-slate-900 dark:text-white">Recent Donations</h2>
          <div className="space-y-3">
            {donations.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30">
                    {d.donor[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{d.donor}</p>
                    <p className="text-[10px] text-slate-400">{d.purpose} · {d.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">+₹{d.amount.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-slate-400">{d.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── New Campaign Modal ── */}
      {showNewCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Campaign</h2>
              <button onClick={() => setShowNewCampaign(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Campaign Title *</label>
                <input
                  value={campTitle}
                  onChange={(e) => setCampTitle(e.target.value)}
                  placeholder="e.g. Winter Animal Feeding Drive"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Fundraising Goal (₹) *</label>
                <input
                  type="number"
                  value={campGoal}
                  onChange={(e) => setCampGoal(e.target.value)}
                  placeholder="e.g. 75000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Accent Color</label>
                <div className="flex gap-2">
                  {[
                    { label: 'Violet', val: 'bg-violet-500' },
                    { label: 'Blue', val: 'bg-blue-500' },
                    { label: 'Emerald', val: 'bg-emerald-500' },
                    { label: 'Rose', val: 'bg-rose-500' },
                    { label: 'Amber', val: 'bg-amber-500' },
                  ].map((c) => (
                    <button
                      key={c.val}
                      type="button"
                      onClick={() => setCampColor(c.val)}
                      className={`h-8 w-8 rounded-full ${c.val} transition-transform ${campColor === c.val ? 'ring-2 ring-offset-2 ring-violet-600 scale-110' : 'opacity-70 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowNewCampaign(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700">Cancel</button>
              <button
                onClick={handleCreateCampaign}
                disabled={!campTitle.trim() || !campGoal}
                className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                Publish Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Record Donation Modal ── */}
      {showNewDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Record Offline / Direct Donation</h2>
              <button onClick={() => setShowNewDonation(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Donor Name</label>
                <input
                  value={donDonor}
                  onChange={(e) => setDonDonor(e.target.value)}
                  placeholder="e.g. Ramesh Chandra (Leave blank for Anonymous)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Amount (₹) *</label>
                <input
                  type="number"
                  value={donAmount}
                  onChange={(e) => setDonAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Donation Type</label>
                  <select
                    value={donType}
                    onChange={(e) => setDonType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option>One Time</option>
                    <option>Monthly</option>
                    <option>Campaign</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Purpose</label>
                  <select
                    value={donPurpose}
                    onChange={(e) => setDonPurpose(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option>Medical Care</option>
                    <option>Food & Shelter</option>
                    <option>Rescue Operations</option>
                    <option>General Fund</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowNewDonation(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700">Cancel</button>
              <button
                onClick={handleAddDonation}
                disabled={!donAmount}
                className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                Record Donation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoDonations;
