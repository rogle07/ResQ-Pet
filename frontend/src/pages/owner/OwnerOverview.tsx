import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { petApi } from '@/features/pets/petApi';
import { useAppSelector } from '@/app/hooks';
import type { Pet } from '@/types';
import {
  MapPin,
  AlertTriangle,
  Search,
  Heart,
  Home,
  DollarSign,
  Battery,
  Signal,
  Thermometer,
  Activity,
  Calendar,
  Weight,
  Tag,
  ArrowRight,
  Shield,
} from 'lucide-react';

/* ── Quick-action card data ─────────────────────────────────────────── */
const QUICK_ACTIONS = [
  {
    id: 'live-tracking',
    title: 'Live Tracking',
    desc: 'Track your pet in real-time with GPS and geo-fence alerts.',
    icon: <MapPin className="h-7 w-7" />,
    iconBg: 'bg-green-100 dark:bg-green-950/60',
    iconColor: 'text-green-600 dark:text-green-400',
    btnLabel: 'Track Now',
    btnClass: 'border border-green-500 text-green-600 hover:bg-green-50 dark:border-green-500/60 dark:text-green-400 dark:hover:bg-green-950/40',
    to: '/owner/tracking',
  },
  {
    id: 'report-lost',
    title: 'Report Lost Pet',
    desc: 'Report your pet as missing and get help from the community.',
    icon: <AlertTriangle className="h-7 w-7" />,
    iconBg: 'bg-red-100 dark:bg-red-950/60',
    iconColor: 'text-red-500 dark:text-red-400',
    btnLabel: 'Report Now',
    btnClass: 'border border-red-400 text-red-500 hover:bg-red-50 dark:border-red-500/60 dark:text-red-400 dark:hover:bg-red-950/40',
    to: '/owner/pets',
  },
  {
    id: 'found-pets',
    title: 'Found Pets',
    desc: 'Browse and search pets found by our community.',
    icon: <Search className="h-7 w-7" />,
    iconBg: 'bg-blue-100 dark:bg-blue-950/60',
    iconColor: 'text-blue-500 dark:text-blue-400',
    btnLabel: 'View Found Pets',
    btnClass: 'border border-blue-400 text-blue-500 hover:bg-blue-50 dark:border-blue-500/60 dark:text-blue-400 dark:hover:bg-blue-950/40',
    to: '/owner/pets',
  },
  {
    id: 'adoption',
    title: 'Adoption',
    desc: 'Give a pet a loving home and change a life.',
    icon: <Heart className="h-7 w-7" />,
    iconBg: 'bg-purple-100 dark:bg-purple-950/60',
    iconColor: 'text-purple-500 dark:text-purple-400',
    btnLabel: 'Explore Adoption',
    btnClass: 'border border-purple-400 text-purple-500 hover:bg-purple-50 dark:border-purple-500/60 dark:text-purple-400 dark:hover:bg-purple-950/40',
    to: '/owner/foster',
  },
  {
    id: 'foster-care',
    title: 'Foster Care',
    desc: 'Provide temporary care and support pets in need.',
    icon: <Home className="h-7 w-7" />,
    iconBg: 'bg-orange-100 dark:bg-orange-950/60',
    iconColor: 'text-orange-500 dark:text-orange-400',
    btnLabel: 'Foster a Pet',
    btnClass: 'border border-orange-400 text-orange-500 hover:bg-orange-50 dark:border-orange-500/60 dark:text-orange-400 dark:hover:bg-orange-950/40',
    to: '/owner/foster',
  },
  {
    id: 'donations',
    title: 'Donations',
    desc: 'Support our rescue missions and help pets in need.',
    icon: <DollarSign className="h-7 w-7" />,
    iconBg: 'bg-teal-100 dark:bg-teal-950/60',
    iconColor: 'text-teal-600 dark:text-teal-400',
    btnLabel: 'Donate Now',
    btnClass: 'border border-teal-400 text-teal-600 hover:bg-teal-50 dark:border-teal-500/60 dark:text-teal-400 dark:hover:bg-teal-950/40',
    to: '/owner/donations',
  },
];

/* ── Collar status row ───────────────────────────────────────────────── */
interface CollarStatRowProps {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string;
  barValue?: number;
  barColor?: string;
  valueColor?: string;
  bars?: { active: number; total: number; color: string };
}

const CollarStatRow = ({ icon, iconColor, label, value, barValue, barColor, valueColor, bars }: CollarStatRowProps) => (
  <div className="flex items-center gap-2">
    <span className={`${iconColor} flex-shrink-0`}>{icon}</span>
    <span className="w-24 text-xs text-slate-500 dark:text-slate-400">{label}</span>
    <span className={`text-xs font-semibold ${valueColor ?? 'text-slate-800 dark:text-slate-200'}`}>{value}</span>
    <div className="ml-auto flex items-center gap-1">
      {barValue !== undefined && barColor && (
        <div className="h-1.5 w-20 rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${barValue}%` }}
          />
        </div>
      )}
      {bars && (
        <div className="flex gap-0.5">
          {Array.from({ length: bars.total }).map((_, i) => (
            <div
              key={i}
              className={`h-3 w-1 rounded-sm ${i < bars.active ? bars.color : 'bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

/* ── Main Component ─────────────────────────────────────────────────── */
const OwnerOverview = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    petApi.list().then((data) => {
      setPets(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Use first pet for the hero card, or demo data if none
  const heroPet: Pet | null = pets[0] ?? null;
  const heroIsOnline = heroPet?.collar?.isActive ?? true;
  const heroBattery = heroPet?.collar?.lastBatteryPercent ?? 80;
  const heroName = heroPet?.name ?? 'Buddy';
  const heroBreed = heroPet?.breed ?? 'Maltese';
  const heroAge = heroPet ? `${heroPet.age ?? 2} Years` : '2 Years, 3 Months';
  const heroWeight = heroPet?.weightKg ? `${heroPet.weightKg} kg` : '4.2 kg';
  const heroPetId = heroPet?.petId ?? 'RESQPET-1024';
  const heroImage = heroPet?.images?.[0]?.url ?? '/buddy-puppy.jpg';
  const heroProfileTo = heroPet ? `/owner/pets/${heroPet._id}` : '/owner/pets';

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-white">
          Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}! <span className="inline-block animate-wave">🐾</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here's what's happening in the ResQPet community.</p>
      </div>

      {/* ── Hero Pet Card ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-800 shadow-lg dark:border dark:border-slate-700/40">
        {/* Background image */}
        <img
          src={heroImage}
          alt={heroName}
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ filter: 'brightness(0.75)' }}
          onError={(e) => { (e.target as HTMLImageElement).src = '/buddy-puppy.jpg'; }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />

        {/* Pet info (left) */}
        <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-6 md:w-[55%]">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">{heroName}</h3>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold ${
                  heroIsOnline ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${heroIsOnline ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
                {heroIsOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60" />
                {heroBreed} • {heroAge}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <Weight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60" />
                {heroWeight}
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60" />
                Collar ID: {heroPetId}
              </span>
            </div>

            {/* Mobile Collar Mini Stats */}
            <div className="mt-3 flex flex-wrap items-center gap-2 md:hidden">
              <span className="inline-flex items-center gap-1 rounded-lg bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                <Battery className="h-3 w-3 text-green-400" /> {heroBattery}%
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                <Signal className="h-3 w-3 text-green-400" /> GPS Safe
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                <Thermometer className="h-3 w-3 text-purple-400" /> 38.6°C
              </span>
            </div>
          </div>

          <Link
            to={heroProfileTo}
            className="mt-4 sm:mt-5 inline-flex w-full sm:w-fit items-center justify-center gap-2 rounded-xl border-2 border-white px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-slate-800"
          >
            View Pet Profile <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Smart Collar Status card (right, floated on desktop) */}
        <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 md:block">
          <div className="w-56 rounded-2xl bg-white/95 dark:bg-slate-900/95 dark:border dark:border-slate-700/60 p-4 shadow-lg backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">Smart Collar Status</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-green-600 dark:text-green-400">{heroBattery}%</span>
                {/* Battery icon */}
                <div className="relative flex h-4 w-7 items-center rounded-[3px] border-2 border-green-500 px-0.5">
                  <div
                    className="h-2 rounded-sm bg-green-500 transition-all"
                    style={{ width: `${(heroBattery / 100) * 16}px` }}
                  />
                  <div className="absolute -right-1.5 top-1/2 h-2 w-1 -translate-y-1/2 rounded-r-sm bg-green-500" />
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <CollarStatRow
                icon={<Battery className="h-3.5 w-3.5" />}
                iconColor="text-green-500 dark:text-green-400"
                label="Battery"
                value={`${heroBattery}%`}
                barValue={heroBattery}
                barColor="bg-green-500"
              />
              <CollarStatRow
                icon={<Signal className="h-3.5 w-3.5" />}
                iconColor="text-green-500 dark:text-green-400"
                label="GPS Signal"
                value="Excellent"
                valueColor="text-green-600 dark:text-green-400"
                bars={{ active: 4, total: 5, color: 'bg-green-500' }}
              />
              <CollarStatRow
                icon={<Thermometer className="h-3.5 w-3.5" />}
                iconColor="text-purple-500 dark:text-purple-400"
                label="Temperature"
                value="38.6 °C"
                barValue={65}
                barColor="bg-purple-500"
              />
              <CollarStatRow
                icon={<Activity className="h-3.5 w-3.5" />}
                iconColor="text-orange-500 dark:text-orange-400"
                label="Activity"
                value="Active"
                valueColor="text-orange-500 dark:text-orange-400"
                barValue={70}
                barColor="bg-orange-400"
              />
            </div>

            <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500">Last Updated: 2 min ago</p>
          </div>
        </div>
      </div>

      {/* ── Loading indicator ─────────────────────────────────── */}
      {loading && (
        <p className="text-center text-sm text-slate-400 animate-pulse">Loading your pet data…</p>
      )}

      {/* ── Quick Action Cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_ACTIONS.map((action) => (
          <div
            key={action.id}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-[#0f172a]/90 dark:hover:border-slate-700 dark:hover:bg-[#131d33]"
          >
            {/* Icon */}
            <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl ${action.iconBg} ${action.iconColor} mb-3`}>
              {action.icon}
            </div>

            {/* Text */}
            <h4 className="font-display text-sm sm:text-[15px] font-bold text-slate-800 dark:text-slate-100">{action.title}</h4>
            <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{action.desc}</p>

            {/* Button */}
            <Link
              to={action.to}
              className={`mt-3 sm:mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-semibold transition ${action.btnClass}`}
            >
              {action.btnLabel} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* ── Community Banner ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:px-6 sm:py-5 shadow-sm dark:border-slate-800 dark:bg-[#0f172a]/90">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/60">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-display text-sm sm:text-[15px] font-bold text-slate-800 dark:text-slate-100">Together We Can Make a Difference</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your support helps us rescue, care, and find loving homes for pets in need.
            </p>
          </div>
        </div>
        {/* Decorative pet illustration */}
        <div className="hidden shrink-0 items-end gap-1 lg:flex">
          <span className="text-4xl" role="img" aria-label="cat">🐱</span>
          <span className="text-5xl" role="img" aria-label="dog">🐶</span>
        </div>
      </div>
    </div>
  );
};

export default OwnerOverview;
