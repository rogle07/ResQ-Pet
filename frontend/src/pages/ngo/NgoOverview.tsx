import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Heart,
  Users,
  AlertTriangle,
  MapPin,
  Plus,
  Search,
  Megaphone,
  DollarSign,
  MessageSquare,
  ArrowRight,
  Clock,
  Shield,
  Stethoscope,
  Home,
  ExternalLink,
} from 'lucide-react';

// ── static mock data ─────────────────────────────────────────────────────────
const STATS = [
  {
    label: 'New Requests',
    value: 18,
    icon: <AlertTriangle className="h-6 w-6" />,
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
    change: '+20% from yesterday',
    changeUp: true,
  },
  {
    label: 'Active Rescues',
    value: 9,
    icon: <Shield className="h-6 w-6" />,
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconColor: 'text-orange-500',
    change: 'In Progress',
    changeUp: null,
    changeBg: 'text-orange-500',
  },
  {
    label: 'Completed',
    value: 42,
    sub: 'This Month',
    icon: <CheckCircle className="h-6 w-6" />,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    change: '+18% from last month',
    changeUp: true,
  },
  {
    label: 'Animals Helped',
    value: 312,
    sub: 'This Month',
    icon: <Heart className="h-6 w-6" />,
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconColor: 'text-rose-500',
    change: 'This Month',
    changeUp: null,
    changeBg: 'text-rose-500',
  },
  {
    label: 'Volunteers',
    value: 24,
    sub: 'Active',
    icon: <Users className="h-6 w-6" />,
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    change: 'Active',
    changeUp: null,
    changeBg: 'text-blue-500',
  },
];

const RESCUE_REQUESTS = [
  {
    id: '1',
    animal: 'Injured Dog',
    location: 'Indira Nagar, Lucknow',
    requestedBy: 'Rahul Sharma',
    timeAgo: '10 min ago',
    priority: 'High Priority',
    priorityColor: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30',
    emoji: '🐕',
  },
  {
    id: '2',
    animal: 'Kitten Trapped',
    location: 'Gomti Nagar, Lucknow',
    requestedBy: 'Priya Singh',
    timeAgo: '30 min ago',
    priority: 'Medium Priority',
    priorityColor: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
    emoji: '🐈',
  },
  {
    id: '3',
    animal: 'Injured Cow',
    location: 'Faizabad Road, Lucknow',
    requestedBy: 'Aman Verma',
    timeAgo: '1 hr ago',
    priority: 'High Priority',
    priorityColor: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30',
    emoji: '🐄',
  },
  {
    id: '4',
    animal: 'Bird with Broken Wing',
    location: 'Hazratganj, Lucknow',
    requestedBy: 'Neha Mishra',
    timeAgo: '2 hr ago',
    priority: 'Low Priority',
    priorityColor: 'text-violet-600 bg-violet-50 dark:bg-violet-900/30',
    emoji: '🐦',
  },
];

const URGENT_ALERTS = [
  {
    id: '1',
    title: 'Serious Injured Dog',
    location: 'Aliganj, Lucknow',
    timeAgo: '10 min ago',
    color: 'border-l-rose-500',
    emoji: '🐕',
  },
  {
    id: '2',
    title: 'Cow Hit by Vehicle',
    location: 'Faizabad Road, Lucknow',
    timeAgo: '20 min ago',
    color: 'border-l-orange-500',
    emoji: '🐄',
  },
  {
    id: '3',
    title: 'Puppies in Danger',
    location: 'Mahanagar, Lucknow',
    timeAgo: '45 min ago',
    color: 'border-l-amber-500',
    emoji: '🐶',
  },
];

const TEAMS = [
  { name: 'Team Alpha', members: 6, active: true, activeRescues: 2 },
  { name: 'Team Bravo', members: 5, active: true, activeRescues: 3 },
  { name: 'Team Charlie', members: 4, active: true, activeRescues: 1 },
];

const MESSAGES = [
  {
    id: '1',
    from: 'Rescue Team Alpha',
    initials: 'RA',
    color: 'bg-violet-600',
    message: 'We are on the way to Indira Nagar.',
    timeAgo: '5 min ago',
    online: true,
  },
  {
    id: '2',
    from: 'Rescue Team Bravo',
    initials: 'RB',
    color: 'bg-blue-600',
    message: 'Need a vet at Faizabad Road case.',
    timeAgo: '20 min ago',
    online: false,
  },
  {
    id: '3',
    from: 'Volunteer Group',
    initials: 'VG',
    color: 'bg-emerald-600',
    message: 'We can help with transport.',
    timeAgo: '1 hr ago',
    online: false,
  },
];

const WORKFLOW_STEPS = [
  { icon: <MessageSquare className="h-5 w-5" />, title: 'Request Received', desc: 'Request comes from Finder / Public / App', color: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600' },
  { icon: <Search className="h-5 w-5" />, title: 'Assessment', desc: 'Our team evaluates the situation', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600' },
  { icon: <Users className="h-5 w-5" />, title: 'Assign Rescue Team', desc: 'Nearest team is assigned the task', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' },
  { icon: <Stethoscope className="h-5 w-5" />, title: 'Rescue & Treatment', desc: 'Animal is rescued and given medical care', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' },
  { icon: <Heart className="h-5 w-5" />, title: 'Follow Up & Care', desc: 'We ensure recovery and provide care', color: 'bg-rose-100 dark:bg-rose-900/40 text-rose-500' },
];

// ── component ─────────────────────────────────────────────────────────────────
const NgoOverview = () => {
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, Animal Care NGO! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Together, we make a better world for animals.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.iconBg}`}>
                <span className={s.iconColor}>{s.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{s.value}</p>
              </div>
            </div>
            <div className="mt-2">
              {s.changeUp === true && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <TrendingUp className="h-3 w-3" /> {s.change}
                </span>
              )}
              {s.changeUp === false && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                  <TrendingDown className="h-3 w-3" /> {s.change}
                </span>
              )}
              {s.changeUp === null && (
                <span className={`text-[11px] font-semibold ${s.changeBg}`}>{s.change}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main 3-column grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* LEFT: Rescue Requests + Team Overview + Workflow */}
        <div className="space-y-4 xl:col-span-1">
          {/* Recent Rescue Requests */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Recent Rescue Requests</h2>
              <button
                onClick={() => navigate('/ngo/requests')}
                className="text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {RESCUE_REQUESTS.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl dark:bg-slate-800">
                    {req.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{req.animal}</p>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{req.location}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${req.priorityColor}`}>
                        {req.priority}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" />{req.timeAgo}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">by {req.requestedBy}</p>
                    <button
                      onClick={() => navigate('/ngo/requests')}
                      className="mt-1.5 rounded-lg bg-violet-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-violet-700 transition-colors"
                    >
                      Assign Team
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rescue Team Overview */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Rescue Team Overview</h2>
              <button
                onClick={() => navigate('/ngo/rescue-team')}
                className="text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
              >
                View All Teams
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TEAMS.map((t) => (
                <div
                  key={t.name}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
                      <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</p>
                      <p className="text-[10px] text-slate-500">Members: {t.members}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-semibold text-emerald-600">Active</span>
                  </div>
                  <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{t.activeRescues}</p>
                  <p className="text-[10px] text-slate-500">Active Rescues</p>
                </div>
              ))}
              {/* Add New Team */}
              <button
                onClick={() => navigate('/ngo/rescue-team')}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-3 text-slate-400 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 dark:border-slate-700 dark:hover:bg-violet-900/10"
              >
                <Plus className="h-5 w-5" />
                <span className="text-[11px] font-semibold">Add New Team</span>
              </button>
            </div>
          </div>

          {/* How We Help (Workflow) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 font-bold text-slate-900 dark:text-white text-sm">How We Help Animals (Workflow)</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-0">
              {WORKFLOW_STEPS.map((step, i) => (
                <div key={step.title} className="flex sm:flex-col items-center sm:items-center gap-2 sm:gap-1 flex-1">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step.color}`}>
                    {step.icon}
                  </div>
                  <div className="flex-1 sm:text-center sm:px-1">
                    <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">{step.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{step.desc}</p>
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: Map */}
        <div className="xl:col-span-1">
          <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Request Location Map</h2>
              <button
                onClick={() => navigate('/ngo/cases')}
                className="text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
              >
                View Full Map
              </button>
            </div>
            {/* Map placeholder with pinpoints */}
            <div className="relative h-72 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              {/* SVG map mock */}
              <svg viewBox="0 0 400 280" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                {/* Background gradient */}
                <defs>
                  <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </linearGradient>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#94a3b8" strokeWidth="0.3" opacity="0.4"/>
                  </pattern>
                </defs>
                <rect width="400" height="280" fill="url(#mapGrad)" />
                <rect width="400" height="280" fill="url(#grid)" />
                {/* Road lines */}
                <path d="M 0 140 Q 200 120 400 140" stroke="#94a3b8" strokeWidth="8" fill="none" opacity="0.4"/>
                <path d="M 200 0 Q 180 140 200 280" stroke="#94a3b8" strokeWidth="8" fill="none" opacity="0.4"/>
                <path d="M 0 200 Q 150 180 300 220 L 400 210" stroke="#94a3b8" strokeWidth="5" fill="none" opacity="0.3"/>
                <path d="M 50 0 Q 80 100 60 280" stroke="#94a3b8" strokeWidth="4" fill="none" opacity="0.25"/>
                {/* Labels */}
                <text x="175" y="135" fontSize="12" fill="#64748b" fontWeight="700" fontFamily="sans-serif">Lucknow</text>
                <text x="150" y="215" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">HAZRATGANJ</text>
                <text x="220" y="190" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">GOMTI NAGAR</text>
                {/* Location pins */}
                {/* Red pin - High priority */}
                <g transform="translate(155,95)">
                  <circle cx="0" cy="0" r="10" fill="#ef4444" opacity="0.2"/>
                  <circle cx="0" cy="0" r="6" fill="#ef4444"/>
                  <text x="0" y="4" textAnchor="middle" fontSize="8" fill="white">🐕</text>
                </g>
                {/* Orange pin */}
                <g transform="translate(240,165)">
                  <circle cx="0" cy="0" r="10" fill="#f97316" opacity="0.2"/>
                  <circle cx="0" cy="0" r="6" fill="#f97316"/>
                  <text x="0" y="4" textAnchor="middle" fontSize="8" fill="white">🐄</text>
                </g>
                {/* Green paw - NGO base */}
                <g transform="translate(185,175)">
                  <circle cx="0" cy="0" r="12" fill="#7c3aed" opacity="0.15"/>
                  <circle cx="0" cy="0" r="7" fill="#7c3aed"/>
                  <text x="0" y="4" textAnchor="middle" fontSize="9" fill="white">🐾</text>
                </g>
                {/* Blue pin */}
                <g transform="translate(195,230)">
                  <circle cx="0" cy="0" r="10" fill="#3b82f6" opacity="0.2"/>
                  <circle cx="0" cy="0" r="6" fill="#3b82f6"/>
                  <text x="0" y="4" textAnchor="middle" fontSize="8" fill="white">🐦</text>
                </g>
              </svg>
              {/* Map overlay labels */}
              <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                {[
                  { color: 'bg-rose-500', label: 'High Priority' },
                  { color: 'bg-orange-500', label: 'Medium' },
                  { color: 'bg-violet-600', label: 'NGO Base' },
                  { color: 'bg-blue-500', label: 'Low Priority' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 rounded-md bg-white/80 px-1.5 py-0.5 backdrop-blur-sm dark:bg-slate-900/80">
                    <span className={`h-2 w-2 rounded-full ${l.color}`} />
                    <span className="text-[9px] font-semibold text-slate-700 dark:text-slate-300">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Active case count */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: 'Active Cases', value: '9', color: 'text-violet-600' },
                { label: 'Areas Covered', value: '12', color: 'text-blue-600' },
                { label: 'Teams Deployed', value: '3', color: 'text-emerald-600' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-slate-50 p-2.5 text-center dark:bg-slate-800/50">
                  <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Urgent Alerts + Quick Actions + Communication */}
        <div className="space-y-4 xl:col-span-1">
          {/* Urgent Alerts */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-rose-600 dark:text-rose-400 text-sm flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Urgent Alerts
              </h2>
              <button
                onClick={() => navigate('/ngo/requests')}
                className="text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
              >
                View All
              </button>
            </div>
            <div className="space-y-2.5">
              {URGENT_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center gap-3 rounded-xl border-l-4 bg-slate-50 p-3 dark:bg-slate-800/50 ${alert.color}`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm dark:bg-slate-700">
                    {alert.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{alert.title}</p>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      <MapPin className="inline h-3 w-3 mr-0.5" />{alert.location}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold text-rose-500">{alert.timeAgo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 font-bold text-slate-900 dark:text-white text-sm">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  icon: <Plus className="h-5 w-5" />,
                  label: 'Report / Request',
                  bg: 'bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/20 dark:hover:bg-violet-900/40',
                  color: 'text-violet-600 dark:text-violet-400',
                  route: '/ngo/requests',
                },
                {
                  icon: <Search className="h-5 w-5" />,
                  label: 'Add Found Animal',
                  bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40',
                  color: 'text-blue-600 dark:text-blue-400',
                  route: '/ngo/found-animals',
                },
                {
                  icon: <Megaphone className="h-5 w-5" />,
                  label: 'Add Awareness Post',
                  bg: 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40',
                  color: 'text-rose-500 dark:text-rose-400',
                  route: '/ngo/awareness',
                },
                {
                  icon: <DollarSign className="h-5 w-5" />,
                  label: 'Add Donation',
                  bg: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40',
                  color: 'text-emerald-600 dark:text-emerald-400',
                  route: '/ngo/donations',
                },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.route)}
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-colors ${action.bg}`}
                >
                  <span className={action.color}>{action.icon}</span>
                  <span className={`text-[11px] font-bold ${action.color}`}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Communication */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Communication</h2>
              <button
                onClick={() => navigate('/ngo/messages')}
                className="text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {MESSAGES.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${msg.color} text-xs font-bold text-white`}>
                      {msg.initials}
                    </div>
                    {msg.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{msg.from}</p>
                      <span className="shrink-0 text-[10px] text-slate-400">{msg.timeAgo}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* New Message input */}
            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              <button
                onClick={() => {
                  if (newMessage.trim()) {
                    navigate('/ngo/messages');
                    setNewMessage('');
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white hover:bg-violet-700 transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" /> New Message
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* ── Shelter Locations ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Home className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Shelter Locations</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Where rescued animals are currently sheltered</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/ngo/found-animals')}
            className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
          >
            View All <ExternalLink className="h-3 w-3" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'NGO Main Shelter', address: 'Indira Nagar, Lucknow', emoji: '🏠', animals: 24, capacity: 30, species: ['🐕 14 Dogs', '🐈 8 Cats', '🐦 2 Birds'], status: 'active', mapUrl: 'https://maps.google.com/?q=Indira+Nagar+Lucknow' },
            { name: 'Gomti Nagar Unit', address: 'Gomti Nagar, Lucknow', emoji: '🏡', animals: 12, capacity: 15, species: ['🐕 7 Dogs', '🐈 4 Cats', '🐇 1 Rabbit'], status: 'active', mapUrl: 'https://maps.google.com/?q=Gomti+Nagar+Lucknow' },
            { name: 'Hazratganj Center', address: 'Hazratganj, Lucknow', emoji: '🏢', animals: 8, capacity: 10, species: ['🐕 5 Dogs', '🐈 3 Cats'], status: 'nearly_full', mapUrl: 'https://maps.google.com/?q=Hazratganj+Lucknow' },
            { name: 'Aliganj Rescue Point', address: 'Aliganj, Lucknow', emoji: '🏘️', animals: 6, capacity: 20, species: ['🐕 4 Dogs', '🐄 1 Cow', '🐦 1 Bird'], status: 'active', mapUrl: 'https://maps.google.com/?q=Aliganj+Lucknow' },
            { name: 'Faizabad Road Post', address: 'Faizabad Road, Lucknow', emoji: '🏗️', animals: 15, capacity: 15, species: ['🐄 3 Cows', '🐕 9 Dogs', '🐈 3 Cats'], status: 'full', mapUrl: 'https://maps.google.com/?q=Faizabad+Road+Lucknow' },
            { name: 'Mahanagar Hub', address: 'Mahanagar, Lucknow', emoji: '🏬', animals: 9, capacity: 25, species: ['🐕 6 Dogs', '🐈 2 Cats', '🐇 1 Rabbit'], status: 'active', mapUrl: 'https://maps.google.com/?q=Mahanagar+Lucknow' },
          ].map((shelter) => {
            const pct = Math.round((shelter.animals / shelter.capacity) * 100);
            const statusConfig = {
              active: { label: 'Active', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30', bar: 'bg-emerald-500' },
              nearly_full: { label: 'Nearly Full', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30', bar: 'bg-amber-500' },
              full: { label: 'Full', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30', bar: 'bg-rose-500' },
            }[shelter.status] || { label: shelter.status, color: 'bg-slate-100 text-slate-500', bar: 'bg-slate-400' };

            return (
              <div key={shelter.name} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 hover:shadow-md transition-shadow">
                {/* Shelter header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="text-2xl">{shelter.emoji}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{shelter.name}</p>
                      <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3 w-3 text-violet-400" />
                        <span>{shelter.address}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Animal species breakdown */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {shelter.species.map((s) => (
                    <span key={s} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Capacity bar */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Capacity</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{shelter.animals} / {shelter.capacity} animals</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${statusConfig.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-400">{pct}% full</span>
                    <span className="text-[10px] text-slate-400">{shelter.capacity - shelter.animals} spots left</span>
                  </div>
                </div>

                {/* View on map button */}
                <a
                  href={shelter.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 py-1.5 text-[11px] font-bold text-violet-600 hover:bg-violet-100 transition-colors dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-400"
                >
                  <MapPin className="h-3 w-3" /> View on Map
                </a>
              </div>
            );
          })}
        </div>

        {/* Summary row */}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          {[
            { label: 'Total Shelters', value: 6, color: 'text-violet-600' },
            { label: 'Animals Sheltered', value: 74, color: 'text-blue-600' },
            { label: 'Available Spots', value: 41, color: 'text-emerald-600' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-slate-400 dark:text-slate-600">
        ❤️ Thank you for being a part of this mission. Together, we can save more lives.
      </p>
    </div>
  );
};

export default NgoOverview;
