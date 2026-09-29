import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { ALL_INDIAN_CITIES } from '@/utils/cities';
import {
  MapPin, AlertTriangle, Search, Heart, Home as HomeIcon, Gift,
  Bell, Cpu, Users, Shield, Phone, ArrowRight, ChevronRight,
  PawPrint, TrendingUp, Sparkles, Filter, CheckCircle2, Clock
} from 'lucide-react';

/* ─── Platform Stats ─────────────────────────────────────────── */
const STATS = [
  {
    icon: <PawPrint className="h-5 w-5" />,
    iconBg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    value: '12,458',
    label: 'Animals Registered',
    sub: 'Across all species'
  },
  {
    icon: <Shield className="h-5 w-5" />,
    iconBg: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    value: '3,241',
    label: 'Rescues Completed',
    sub: 'Successfully reunited'
  },
  {
    icon: <Users className="h-5 w-5" />,
    iconBg: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    value: '1,532',
    label: 'Active Rescuers',
    sub: 'Volunteers & NGOs'
  },
  {
    icon: <Gift className="h-5 w-5" />,
    iconBg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    value: '₹8,45,320',
    label: 'Donations Raised',
    sub: 'For animal welfare'
  },
  {
    icon: <Bell className="h-5 w-5" />,
    iconBg: 'bg-red-500/20 text-red-600 dark:text-red-400',
    value: '45',
    label: 'Active Alerts',
    sub: 'Animals need help'
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    iconBg: 'bg-teal-500/20 text-teal-600 dark:text-teal-400',
    value: '2,987',
    label: 'Reports Solved',
    sub: 'Across all cities'
  },
];

/* ─── 6 Core Services ────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <MapPin className="h-5 w-5" />,
    cardBg: 'bg-white border-emerald-200/70 hover:border-emerald-400 dark:bg-[#07180f] dark:border-emerald-500/20 dark:hover:border-emerald-500/50',
    iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    titleColor: 'text-emerald-800 dark:text-emerald-300',
    exploreColor: 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300',
    badge: 'IoT Live',
    badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    title: 'Live GPS Tracking',
    desc: 'Monitor pets and tagged animals in real-time with geofencing.',
    link: '/track-pet'
  },
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    cardBg: 'bg-white border-red-200/70 hover:border-red-400 dark:bg-[#180a0a] dark:border-red-500/20 dark:hover:border-red-500/50',
    iconBg: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    titleColor: 'text-red-800 dark:text-red-300',
    exploreColor: 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',
    badge: 'Urgent',
    badgeBg: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300',
    title: 'Report Lost Animal',
    desc: 'Report missing or injured animals and dispatch rescue teams fast.',
    link: '/report-found-pet'
  },
  {
    icon: <Search className="h-5 w-5" />,
    cardBg: 'bg-white border-blue-200/70 hover:border-blue-400 dark:bg-[#0a121d] dark:border-blue-500/20 dark:hover:border-blue-500/50',
    iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    titleColor: 'text-blue-800 dark:text-blue-300',
    exploreColor: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
    badge: 'Browse',
    badgeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    title: 'Found Animals',
    desc: 'Browse verified reports of found stray animals looking for home.',
    link: '/adoption'
  },
  {
    icon: <Heart className="h-5 w-5" />,
    cardBg: 'bg-white border-purple-200/70 hover:border-purple-400 dark:bg-[#140b1e] dark:border-purple-500/20 dark:hover:border-purple-500/50',
    iconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    titleColor: 'text-purple-800 dark:text-purple-300',
    exploreColor: 'text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300',
    badge: 'Adoption',
    badgeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    title: 'Pet Adoption',
    desc: 'Give a rescued animal a loving and caring forever family.',
    link: '/adoption'
  },
  {
    icon: <HomeIcon className="h-5 w-5" />,
    cardBg: 'bg-white border-orange-200/70 hover:border-orange-400 dark:bg-[#1c1007] dark:border-orange-500/20 dark:hover:border-orange-500/50',
    iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
    titleColor: 'text-orange-800 dark:text-orange-300',
    exploreColor: 'text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300',
    badge: 'Shelter',
    badgeBg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
    title: 'Foster Care',
    desc: 'Provide temporary shelter and rehabilitation for animals in need.',
    link: '/foster-care'
  },
  {
    icon: <Gift className="h-5 w-5" />,
    cardBg: 'bg-white border-teal-200/70 hover:border-teal-400 dark:bg-[#071a17] dark:border-teal-500/20 dark:hover:border-teal-500/50',
    iconBg: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400',
    titleColor: 'text-teal-800 dark:text-teal-300',
    exploreColor: 'text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300',
    badge: 'Support',
    badgeBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
    title: 'Donations & Aid',
    desc: 'Fund medical treatments, food, and rescue gear for NGOs.',
    link: '/donations'
  },
];

/* ─── Animal Categories ──────────────────────────────────────── */
const CATEGORIES = [
  { label: 'Dogs', count: '2,456 Animals', img: '/animal-dog.jpg', type: 'dog' },
  { label: 'Cats', count: '1,879 Animals', img: '/animal-cat.jpg', type: 'cat' },
  { label: 'Cows', count: '1,234 Animals', img: '/animal-cow.jpg', type: 'cow' },
  { label: 'Horses', count: '892 Animals', img: '/animal-horse.jpg', type: 'horse' },
  { label: 'Rabbits', count: '634 Animals', img: '/animal-rabbit.jpg', type: 'rabbit' },
  { label: 'Goats', count: '723 Animals', img: '/animal-goat.jpg', type: 'goat' },
  { label: 'Birds', count: '1,145 Animals', img: '/animal-bird.jpg', type: 'bird' },
  { label: 'Others', count: '1,495 Animals', img: '/animal-others.jpg', type: 'other' },
];

/* ─── Recent Local Live Activity Showcase ────────────────────── */
const RECENT_RESCUES = [
  {
    title: 'Injured Golden Retriever Rescued',
    city: 'Haldwani',
    time: '12 mins ago',
    status: 'Under Vet Care',
    statusColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    tag: '🐕 Dog'
  },
  {
    title: 'Lost Persian Cat Reunited with Family',
    city: 'Mumbai',
    time: '28 mins ago',
    status: 'Reunited',
    statusColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    tag: '🐈 Cat'
  },
  {
    title: 'Stranded Calf Transported to Shelter',
    city: 'Nainital',
    time: '45 mins ago',
    status: 'Safe in Shelter',
    statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    tag: '🐄 Cow'
  },
  {
    title: 'Emergency Vet Medical Aid Provided',
    city: 'Delhi NCR',
    time: '1 hour ago',
    status: 'Treated',
    statusColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    tag: '🐾 Stray'
  },
];

/* ─── Bottom Features ────────────────────────────────────────── */
const BOTTOM_FEATURES = [
  {
    icon: <Bell className="h-5 w-5" />,
    title: 'Real-time Alerts',
    desc: 'Instant geofence & emergency notifications sent to local teams.'
  },
  {
    icon: <Cpu className="h-5 w-5" />,
    title: 'AI Smart Match',
    desc: 'Automated photo recognition matches lost animals with found reports.'
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Community Network',
    desc: 'Vetted volunteers, NGOs, and foster homes across all major cities.'
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: '24/7 Verified Care',
    desc: 'Certified veterinarians and dedicated rescue units on standby.'
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedService, setSelectedService] = useState('adoption');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedService === 'track') {
      navigate('/track-pet');
    } else if (selectedService === 'rescue') {
      navigate('/rescue-teams');
    } else if (selectedService === 'report') {
      navigate('/report-found-pet');
    } else if (selectedService === 'foster') {
      navigate('/foster-care');
    } else {
      navigate('/adoption');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden">
      <Navbar />

      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        {/* Subtle decorative background glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-7xl bg-emerald-400/5 dark:bg-emerald-500/10 blur-[100px]" />

        <div className="mx-auto max-w-[1440px] px-3.5 sm:px-6 py-6 sm:py-10 lg:py-14">
          <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-12">
            {/* Left Column: Headline, Description & CTAs */}
            <div className="lg:col-span-6 z-10 text-left">
              {/* Badge */}
              <div className="mb-3.5 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 sm:px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-300 animate-fade-in">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Pan-India Animal Rescue & IoT Tracking Network</span>
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl xs:text-4xl sm:text-5xl lg:text-[3.25rem] font-black leading-[1.15] tracking-tight text-gray-900 dark:text-white animate-fade-up">
                Every Life Matters,<br />
                <span className="text-emerald-600 dark:text-emerald-400">Every Rescue Counts</span>{' '}
                <PawPrint className="inline h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 text-emerald-600 dark:text-emerald-400 fill-current ml-1 align-baseline" />
              </h1>

              {/* Subtext */}
              <p className="mt-3.5 sm:mt-5 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-white/80 max-w-xl font-normal">
                ResQPet is an intelligent platform for real-time animal tracking, instant lost & found broadcasting, community fostering, and 24/7 rescue coordination across every city in India.
              </p>

              {/* CTA Buttons - Stacked on mobile, inline on desktop */}
              <div className="mt-6 sm:mt-8 flex flex-col xs:flex-row items-stretch xs:items-center gap-3 animate-fade-up delay-200">
                <Link
                  to="/track-pet"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 sm:px-6 py-3 sm:py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 dark:shadow-emerald-950/50 transition-all hover:bg-emerald-500 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>Track Your Animal</span>
                </Link>
                <Link
                  to="/report-found-pet"
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 sm:px-6 py-3 sm:py-3.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 shadow-sm transition-all dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span>Report Lost Animal</span>
                </Link>
              </div>

              {/* Key Trust Signals */}
              <div className="mt-6 pt-5 border-t border-gray-200/80 dark:border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-600 dark:text-white/60">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Real-time GPS & Geofence
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> 24/7 Verified NGO Network
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> 100% Free for Rescuers
                </span>
              </div>
            </div>

            {/* Right Column: Animal Photo & Mobile-Safe Badging */}
            <div className="lg:col-span-6 relative mt-2 lg:mt-0 animate-slide-right">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl border border-gray-200/80 dark:border-emerald-500/20 bg-emerald-950/10">
                <img
                  src="/hero-animals.jpg"
                  alt="Animals together"
                  className="h-[220px] xs:h-[280px] sm:h-[360px] lg:h-[420px] w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Floating Active Badge on Image Corner */}
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 rounded-xl bg-black/70 backdrop-blur-md px-3 py-1.5 text-[11px] sm:text-xs font-medium text-white flex items-center gap-2 border border-white/15 animate-fade-in delay-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Active Rescues Today in All Cities</span>
                </div>
              </div>

              {/* Motivational Quote */}
              <div className="mt-3 flex justify-center sm:justify-end animate-fade-up delay-400">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white/95 px-4 py-2 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:shadow-md max-w-full">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0 shadow-sm">
                    <PawPrint className="h-3.5 w-3.5 fill-current" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-gray-700 dark:text-slate-200 truncate">
                    Small actions by many people change the world for animals.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive City & Service Quick Finder ───────────────── */}
      <section className="mx-auto max-w-[1440px] px-3.5 sm:px-6 -mt-1 sm:-mt-2 mb-6 sm:mb-8">
        <div className="rounded-2xl border border-emerald-500/30 bg-white p-4 sm:p-6 shadow-xl dark:border-emerald-500/20 dark:bg-slate-800 transition-all">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Find Rescues, Animals & Teams in Your City
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Select your city to view local rescues, adoptable pets, active foster homes, and rescue teams.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
              <Sparkles className="h-3 w-3" /> All Indian Cities Available
            </span>
          </div>

          <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* City Dropdown */}
            <div>
              <label htmlFor="home-city-select" className="block text-xs font-semibold text-gray-700 dark:text-white/80 mb-1.5 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> City / Location
              </label>
              <select
                id="home-city-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-gray-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-black/30 dark:text-white dark:focus:bg-[#07180f]"
              >
                {ALL_INDIAN_CITIES.map((city) => (
                  <option key={city.id} value={city.id} className="dark:bg-[#07180f] dark:text-white">
                    {city.name} {city.state !== 'All States' ? `(${city.state})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Animal Species Dropdown */}
            <div>
              <label htmlFor="home-species-select" className="block text-xs font-semibold text-gray-700 dark:text-white/80 mb-1.5 flex items-center gap-1">
                <PawPrint className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Animal Species
              </label>
              <select
                id="home-species-select"
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-gray-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-black/30 dark:text-white dark:focus:bg-[#07180f]"
              >
                <option value="all" className="dark:bg-[#07180f]">All Animals (Dogs, Cats, Cows, Birds...)</option>
                <option value="dog" className="dark:bg-[#07180f]">🐕 Dogs & Puppies</option>
                <option value="cat" className="dark:bg-[#07180f]">🐈 Cats & Kittens</option>
                <option value="cow" className="dark:bg-[#07180f]">🐄 Cows & Cattle</option>
                <option value="horse" className="dark:bg-[#07180f]">🐎 Horses & Equines</option>
                <option value="rabbit" className="dark:bg-[#07180f]">🐇 Rabbits</option>
                <option value="goat" className="dark:bg-[#07180f]">🐐 Goats & Sheep</option>
                <option value="bird" className="dark:bg-[#07180f]">🦜 Birds</option>
                <option value="other" className="dark:bg-[#07180f]">🐾 Other Rescued Animals</option>
              </select>
            </div>

            {/* Service / Objective */}
            <div>
              <label htmlFor="home-service-select" className="block text-xs font-semibold text-gray-700 dark:text-white/80 mb-1.5 flex items-center gap-1">
                <Search className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Service Type
              </label>
              <select
                id="home-service-select"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-gray-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-black/30 dark:text-white dark:focus:bg-[#07180f]"
              >
                <option value="adoption" className="dark:bg-[#07180f]">Pet Adoption & Found Animals</option>
                <option value="track" className="dark:bg-[#07180f]">Live GPS Pet Tracking</option>
                <option value="rescue" className="dark:bg-[#07180f]">Rescue Teams & NGOs Directory</option>
                <option value="report" className="dark:bg-[#07180f]">Report Lost or Injured Animal</option>
                <option value="foster" className="dark:bg-[#07180f]">Foster Care Homes</option>
              </select>
            </div>

            {/* Action Submit */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-semibold text-white shadow-md shadow-emerald-900/20 hover:bg-emerald-500 active:scale-[0.98] transition-all"
              >
                <Search className="h-4 w-4" />
                <span>Search Local Services</span>
              </button>
            </div>
          </form>

          {/* Quick Clickable Popular Cities Pills */}
          <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-white/5 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-white/60">
            <span className="font-semibold text-gray-700 dark:text-white/80 mr-1">Quick Select:</span>
            {['all', 'haldwani', 'dehradun', 'nainital', 'delhi-ncr', 'mumbai', 'bengaluru'].map((cId) => {
              const c = ALL_INDIAN_CITIES.find(item => item.id === cId);
              if (!c) return null;
              const isSelected = selectedCity === cId;
              return (
                <button
                  type="button"
                  key={cId}
                  onClick={() => setSelectedCity(cId)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Stats Cards Grid ─────────────────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-3.5 sm:px-6 mb-6 sm:mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-3.5 sm:p-4.5 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-md transition-all hover:border-emerald-500/30 hover:shadow-md animate-fade-up delay-${i * 75}`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl ${s.iconBg}`}>
                  {s.icon}
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Live
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {s.value}
                </div>
                <div className="text-xs font-semibold text-gray-700 dark:text-slate-200 leading-tight mt-0.5">
                  {s.label}
                </div>
                <div className="text-[10px] text-gray-400 dark:text-slate-400 mt-0.5 truncate">
                  {s.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6 Feature Services Cards ──────────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-3.5 sm:px-6 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-slate-100">
                Comprehensive Rescue Services
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              Everything needed to protect, locate, adopt, and rehabilitate animals in every community.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`group rounded-2xl border p-4 sm:p-5 transition-all shadow-sm hover:shadow-lg hover:scale-[1.02] flex flex-col justify-between ${f.cardBg} animate-fade-up delay-${i * 75}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl ${f.iconBg}`}>
                    {f.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${f.badgeBg}`}>
                    {f.badge}
                  </span>
                </div>
                <h3 className={`mb-1.5 text-sm font-bold leading-snug ${f.titleColor}`}>{f.title}</h3>
                <p className="mb-4 text-xs leading-relaxed text-gray-500 dark:text-slate-400">{f.desc}</p>
              </div>
              <Link
                to={f.link}
                className={`flex items-center gap-1.5 text-xs font-bold transition-colors mt-auto pt-2 border-t border-gray-100 dark:border-slate-700/50 ${f.exploreColor}`}
              >
                <span>Explore Service</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Browse Animals by Category ─────────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-3.5 sm:px-6 py-6 sm:py-8">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <PawPrint className="h-4 w-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-slate-100">Browse Animals by Category</h2>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 hidden xs:block">Find pets available for adoption or registered in our safe system</p>
            </div>
          </div>
          <Link
            to="/adoption"
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.label}
              to="/adoption"
              className={`group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:shadow-md transition-all hover:border-emerald-500/50 hover:scale-[1.04] active:scale-[0.98] animate-scale-in delay-${i * 50}`}
            >
              <div className="relative h-24 xs:h-28 w-full overflow-hidden bg-gray-100 dark:bg-black/40">
                <img
                  src={c.img}
                  alt={c.label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/60 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-medium text-white">
                  {c.label}
                </span>
              </div>
              <div className="p-2.5">
                <div className="text-xs font-bold text-gray-900 dark:text-slate-100">{c.label}</div>
                <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 font-medium">{c.count}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Local City Activity & Live Rescues ────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-3.5 sm:px-6 py-4 sm:py-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-[#13301f] dark:bg-[#07180f] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                  Live Rescue & Reunited Feed Across India
                </h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5">
                Real-time field updates from rescue teams, veterinarians, and loving foster families.
              </p>
            </div>
            <Link
              to="/rescue-teams"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>View All Rescue Teams</span> <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RECENT_RESCUES.map((r, i) => (
              <div
                key={i}
                className={`rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-slate-700 dark:bg-slate-700/50 flex flex-col justify-between transition-all hover:shadow-md hover:scale-[1.02] animate-fade-up delay-${i * 100}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                      <MapPin className="h-2.5 w-2.5" /> {r.city}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.statusColor}`}>
                      {r.status}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100 leading-snug line-clamp-2">
                    {r.title}
                  </h4>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-200/50 dark:border-slate-600 flex items-center justify-between text-[10px] text-gray-500 dark:text-slate-400">
                  <span className="font-semibold">{r.tag}</span>
                  <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {r.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom Features & Emergency 24/7 Support ──────────────── */}
      <section className="mx-auto max-w-[1440px] px-3.5 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* 4 Feature Badges */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
            {BOTTOM_FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 hover:shadow-md transition-all animate-fade-up delay-${i * 100}`}
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{f.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-slate-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency 24/7 Help Card */}
          <div className="lg:col-span-2 flex flex-col justify-between rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-4 sm:p-5 shadow-sm dark:border-emerald-500/30 dark:bg-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-emerald-500 shrink-0 bg-emerald-950/40">
                  <img src="/buddy-puppy.jpg" alt="Rescue Mascot" className="h-full w-full object-cover" />
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
                </div>
                <div>
                  <span className="inline-block rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    24/7 Hotline
                  </span>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100 mt-0.5">Need Immediate Rescue Help?</p>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-slate-300">
                Found an animal in critical danger or injured? Our verified rescue teams and volunteer network respond around the clock across all cities.
              </p>
            </div>

            <div className="mt-4 flex flex-col xs:flex-row gap-2.5">
              <Link
                to="/rescue-teams"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-950/20 transition-all hover:bg-emerald-500 active:scale-[0.98]"
              >
                <Phone className="h-3.5 w-3.5" /> Contact Rescue Team
              </Link>
              <Link
                to="/report-found-pet"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span>Submit Report</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white py-8 dark:border-slate-700 dark:bg-slate-900 transition-colors duration-300">
        <div className="mx-auto max-w-[1440px] px-3.5 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <PawPrint className="h-4 w-4 fill-current" />
                </div>
                <span className="font-display font-bold text-base text-gray-900 dark:text-slate-100">ResQPet</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                Smart IoT & AI ecosystem uniting pet parents, finders, rescue teams, foster homes, and veterinarians.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-slate-100 mb-2.5">Quick Links</h4>
              <ul className="space-y-1.5 text-xs text-gray-600 dark:text-slate-300">
                <li><Link to="/track-pet" className="hover:text-emerald-600 dark:hover:text-emerald-400">Live GPS Tracking</Link></li>
                <li><Link to="/report-found-pet" className="hover:text-emerald-600 dark:hover:text-emerald-400">Report Lost Animal</Link></li>
                <li><Link to="/adoption" className="hover:text-emerald-600 dark:hover:text-emerald-400">Pet Adoption</Link></li>
                <li><Link to="/foster-care" className="hover:text-emerald-600 dark:hover:text-emerald-400">Foster Care Network</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-slate-100 mb-2.5">Network Coverage</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                Covering Haldwani, Dehradun, Nainital, Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, and 60+ cities across India.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-slate-100 mb-2.5">Emergency Help</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                Rescue teams standing by 24 hours a day, 7 days a week.
              </p>
              <Link
                to="/rescue-teams"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Phone className="h-3.5 w-3.5" /> Direct Rescue Helpline
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-slate-700 text-center text-xs text-gray-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="flex items-center justify-center gap-1.5">
              <PawPrint className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 fill-current" />
              Together, saving lives in every city across India.
            </p>
            <p>© {new Date().getFullYear()} ResQPet Ecosystem. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
