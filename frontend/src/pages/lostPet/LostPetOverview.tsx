import { useAppSelector } from '@/app/hooks';
import { AlertTriangle, FileText, Search, CheckCircle, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LostPetOverview() {
  const { user } = useAppSelector((s) => s.auth);

  const stats = [
    { label: 'Active Reports', value: '0', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Possible Matches', value: '0', icon: Search, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Under Review', value: '0', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Reunited', value: '0', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  const quickActions = [
    { label: 'Report Missing Pet', to: '/lost-pet/report', icon: Plus, desc: 'Submit a new missing pet report with details and photos', color: 'bg-red-500 hover:bg-red-600' },
    { label: 'View My Reports', to: '/lost-pet/my-reports', icon: FileText, desc: 'Check status of your existing missing pet reports', color: 'bg-[#1e6f42] hover:bg-emerald-700' },
    { label: 'Matching Results', to: '/lost-pet/matches', icon: Search, desc: 'View potential matches found by our AI matching engine', color: 'bg-blue-600 hover:bg-blue-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide opacity-80">Lost Pet Portal</p>
              <h1 className="mt-1 text-2xl font-black">
                Welcome, {user?.name?.split(' ')[0] || 'User'} 🐾
              </h1>
              <p className="mt-2 text-sm opacity-90 max-w-lg">
                Report your missing pet and our smart matching engine will scan thousands of found-animal reports to help reunite you with your beloved companion.
              </p>
              <Link
                to="/lost-pet/report"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 text-sm font-bold hover:bg-white/30 transition-all"
              >
                <Plus className="h-4 w-4" />
                Report Missing Pet
              </Link>
            </div>
            <div className="hidden md:block text-6xl opacity-30">🔍</div>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.bg} mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-base font-bold text-slate-700 dark:text-slate-300">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="group rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${a.color} text-white mb-3 transition-transform group-hover:scale-110`}>
                <a.icon className="h-5 w-5" />
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-100">{a.label}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-6">
        <h2 className="mb-4 text-base font-bold text-slate-800 dark:text-white">How ResQPet Matching Works</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { step: '1', title: 'Report Missing', desc: 'Submit detailed info and photos of your missing pet', color: 'bg-red-500' },
            { step: '2', title: 'AI Matching', desc: 'Our engine scans all found-animal reports in real time', color: 'bg-orange-500' },
            { step: '3', title: 'Get Notified', desc: 'Receive alerts when a potential match is found', color: 'bg-blue-500' },
            { step: '4', title: 'Get Reunited', desc: 'Verify the match and connect with the Finder directly', color: 'bg-emerald-500' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.color} text-white text-xs font-black`}>
                {item.step}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-white">{item.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

