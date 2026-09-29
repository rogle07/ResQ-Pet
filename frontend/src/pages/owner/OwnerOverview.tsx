import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { petApi } from '@/features/pets/petApi';
import { useAppSelector } from '@/app/hooks';
import type { Pet } from '@/types';
import {
  MapPin,
  AlertTriangle,
  Heart,
  Home,
  Building2,
  Cpu,
  Battery,
  Signal,
  Thermometer,
  Calendar,
  Weight,
  Tag,
  ArrowRight,
  Shield,
  PlusCircle,
  Sparkles,
  Radio,
} from 'lucide-react';

/* ── Primary 4 Core Services ─────────────────────────────────────────── */
const PRIMARY_SERVICES = [
  {
    id: 'foster-care',
    title: 'Foster Care Request',
    desc: 'Request temporary foster care for your pet with verified foster homes while you are traveling, undergoing medical treatment, or in temporary housing.',
    icon: <Home className="h-6 w-6" />,
    iconBg: 'bg-amber-100 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
    btnLabel: 'Request Foster Care',
    btnClass: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20',
    to: '/owner/foster',
    tag: 'Temporary Care',
  },
  {
    id: 'adoption',
    title: 'Adoption',
    desc: 'List your pet for adoption to find loving adopters, review incoming adoption applications, and evaluate prospective adopters.',
    icon: <Heart className="h-6 w-6" />,
    iconBg: 'bg-purple-100 dark:bg-purple-950/60',
    iconColor: 'text-purple-600 dark:text-purple-400',
    btnLabel: 'List for Adoption',
    btnClass: 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-500/20',
    to: '/owner/adoption',
    tag: 'Adoption Desk',
  },
  {
    id: 'ngo-shelter',
    title: 'NGO Shelter Care',
    desc: 'Submit a formal request to place your pet into a verified NGO shelter facility or long-term care sanctuary for professional shelter assistance.',
    icon: <Building2 className="h-6 w-6" />,
    iconBg: 'bg-blue-100 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
    btnLabel: 'Request NGO Shelter Care',
    btnClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20',
    to: '/owner/ngo-shelter',
    tag: 'Shelter Facility',
  },
  {
    id: 'rescue',
    title: 'Rescue Request',
    desc: 'Urgent emergency rescue dispatch for pets or stray animals in immediate danger, accident injury, trapped conditions, or distress.',
    icon: <AlertTriangle className="h-6 w-6" />,
    iconBg: 'bg-red-100 dark:bg-red-950/60',
    iconColor: 'text-red-600 dark:text-red-400',
    btnLabel: 'Request Rescue',
    btnClass: 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/20',
    to: '/owner/rescue',
    tag: '24/7 Emergency',
  },
];

const STORAGE_KEY = 'resqpet_iot_collar_activated';

const OwnerOverview = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isIoTPurchased, setIsIoTPurchased] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    petApi
      .list()
      .then((data) => {
        setPets(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Listen for storage changes across tabs or toggles
    const handleStorage = () => {
      setIsIoTPurchased(localStorage.getItem(STORAGE_KEY) === 'true');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const heroPet: Pet | null = pets[0] ?? null;
  const heroName = heroPet?.name ?? 'My Pet';
  const heroBreed = heroPet?.breed ?? (heroPet?.species ? `${heroPet.species}` : 'Golden Retriever');
  const heroAge = heroPet ? `${heroPet.age ?? 2} Years` : '2 Years';
  const heroWeight = heroPet?.weightKg ? `${heroPet.weightKg} kg` : '14 kg';
  const heroPetId = heroPet?.petId ?? 'RESQPET-PET-01';
  const heroImage = heroPet?.images?.[0]?.url ?? '/puppy.jpg';
  const heroProfileTo = heroPet ? `/owner/pets/${heroPet._id}` : '/owner/pets';

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-white">
            Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}! <span className="inline-block animate-wave">🐾</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            ResQ Pet Owner Dashboard — Manage foster care, adoptions, shelter admissions, emergency rescues, and smart IoT device features.
          </p>
        </div>

        <Link
          to="/owner/pets"
          className="btn-secondary text-xs sm:text-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" /> Manage Pets ({pets.length})
        </Link>
      </div>

      {loading && <p className="text-center text-xs text-mist-500 animate-pulse">Loading pets data…</p>}

      {/* ── Pet Hero Card ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-xl dark:border dark:border-slate-800">
        <img
          src={heroImage}
          alt={heroName}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-40 filter brightness-75"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/puppy.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Primary Pet Profile
              </span>
              <span className="font-mono text-xs text-slate-400">{heroPetId}</span>
            </div>

            <h3 className="font-display text-3xl font-extrabold text-white">
              {heroPet ? heroName : 'Register Your Pet'}
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-teal-400" />
                {heroBreed} • {heroAge}
              </span>
              <span className="flex items-center gap-1.5">
                <Weight className="h-4 w-4 text-teal-400" />
                {heroWeight}
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-teal-400" />
                Status: {heroPet?.status ?? 'Safe'}
              </span>
            </div>

            <div className="pt-2">
              <Link
                to={heroProfileTo}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs sm:text-sm font-semibold backdrop-blur-md transition border border-white/20"
              >
                {heroPet ? 'View Full Pet Profile' : 'Add New Pet'} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick IoT Collar Status Pill on Hero */}
          <div className="rounded-xl p-4 bg-slate-950/70 border border-slate-700/60 backdrop-blur-md max-w-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <Cpu className="h-4 w-4 text-teal-400" />
                <span>ResQ Pet IoT Collar</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isIoTPurchased
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isIoTPurchased ? 'ONLINE' : 'LOCKED'}
              </span>
            </div>

            {isIoTPurchased ? (
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Battery className="h-3.5 w-3.5 text-emerald-400" /> Battery
                  </span>
                  <span className="font-semibold text-emerald-400">88%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Thermometer className="h-3.5 w-3.5 text-amber-400" /> Body Temp
                  </span>
                  <span className="font-semibold">38.6°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Signal className="h-3.5 w-3.5 text-teal-400" /> GPS Safe Zone
                  </span>
                  <span className="font-semibold text-emerald-400">Inside Zone</span>
                </div>
                <Link
                  to="/owner/iot"
                  className="mt-2 block text-center text-xs font-semibold text-teal-300 hover:text-teal-200 pt-1"
                >
                  Open Live Telemetry →
                </Link>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-slate-300">
                <p className="text-slate-400 leading-snug">
                  Collar hardware not yet activated for this account.
                </p>
                <Link
                  to="/owner/iot"
                  className="block text-center rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium py-1.5 text-xs transition"
                >
                  Buy / Explore ResQ Pet IoT
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 1. PRIMARY RESQ PET SERVICES (4 SECTIONS) ─────────── */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-800 dark:text-bone">
            Pet Owner Core Services
          </h3>
          <p className="text-xs text-slate-500 dark:text-bone/60">
            Submit requests and track cases across all 4 key ResQ Pet support networks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRIMARY_SERVICES.map((service) => (
            <div
              key={service.id}
              className="card flex flex-col justify-between hover:shadow-lg transition-all duration-200 border border-slate-200/80 dark:border-slate-800 p-5 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`p-3 rounded-2xl ${service.iconBg} ${service.iconColor} group-hover:scale-105 transition-transform`}>
                    {service.icon}
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-mist-800 text-slate-600 dark:text-slate-300">
                    {service.tag}
                  </span>
                </div>

                <h4 className="font-display text-lg font-bold text-slate-800 dark:text-bone mb-1.5">
                  {service.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-bone/70 leading-relaxed mb-4">
                  {service.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-mist-800/60">
                <Link
                  to={service.to}
                  className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition ${service.btnClass}`}
                >
                  {service.btnLabel} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. SEPARATE SECTION: RESQ PET IOT PRODUCT ───────────── */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold text-slate-800 dark:text-bone flex items-center gap-2">
              <Cpu className="h-5 w-5 text-teal-600 dark:text-teal-400" /> ResQ Pet IoT Product / Additional Features
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-bold">
              Hardware
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-bone/60">
            Dedicated ESP32 smart collar with live GPS location tracking, MAX30102 biometric pulse & SpO2 sensors, and DS18B20 digital thermal alerts.
          </p>
        </div>

        <div className="card overflow-hidden border-2 border-teal-500/20 bg-gradient-to-r from-teal-50/40 via-white to-emerald-50/30 dark:from-slate-900 dark:via-ink-soft dark:to-slate-900 p-6">
          <div className="flex flex-col lg:flex-row items-center gap-6 justify-between">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border border-teal-500/30 shadow-md bg-slate-900 shrink-0">
                <img
                  src="/resqpet-iot-collar.jpg"
                  alt="ResQ Pet IoT Smart Collar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-display text-xl font-bold text-slate-800 dark:text-bone">
                    ResQ Pet Smart Collar IoT
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ESP32 Hardware
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-bone/70 max-w-xl leading-relaxed">
                  Real-time GPS pin tracking, safe zone geo-fence breach alarms, body temperature monitoring, and pulse telemetry streamed straight to your dashboard.
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium text-slate-600 dark:text-bone/70 pt-1">
                  <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                    <MapPin className="h-3.5 w-3.5" /> GPS Geofence
                  </span>
                  <span className="flex items-center gap-1 text-rose-500">
                    <Heart className="h-3.5 w-3.5" /> Heart Rate & SpO2
                  </span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <Thermometer className="h-3.5 w-3.5" /> Body Temperature
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Battery className="h-3.5 w-3.5" /> 7-Day Battery
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center sm:items-end gap-3 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-mist-700/60 pt-4 sm:pt-0 sm:pl-6 w-full lg:w-auto">
              <div>
                <div className="flex items-baseline justify-center sm:justify-end gap-2">
                  <span className="font-display text-2xl font-bold text-slate-900 dark:text-bone">₹2,499</span>
                  <span className="text-xs text-mist-400 line-through">₹3,999</span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {isIoTPurchased ? '✓ Device Activated On Account' : 'Special Intro Offer • Free Shipping'}
                </p>
              </div>

              <Link
                to="/owner/iot"
                className="btn-primary bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm px-5 py-2.5 font-medium shadow-md shadow-teal-500/20 flex items-center gap-2"
              >
                {isIoTPurchased ? (
                  <>
                    <Radio className="h-4 w-4" /> Open IoT Telemetry Dashboard
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Buy / Explore ResQ Pet IoT
                  </>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Community Banner ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:px-6 sm:py-5 shadow-sm dark:border-slate-800 dark:bg-[#0f172a]/90">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/60">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-display text-sm sm:text-[15px] font-bold text-slate-800 dark:text-slate-100">
              ResQ Pet Multi-Role Emergency Network
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every request you submit is immediately routed to verified foster homes, registered NGOs, and active local rescue teams.
            </p>
          </div>
        </div>
        <div className="hidden shrink-0 items-end gap-1 lg:flex text-3xl">
          <span>🐕</span>
          <span>🐈</span>
        </div>
      </div>
    </div>
  );
};

export default OwnerOverview;
