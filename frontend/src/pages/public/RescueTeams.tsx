import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Shield, MapPin, Users, Zap, ArrowRight, Phone, Clock, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ALL_INDIAN_CITIES } from '@/utils/cities';

interface RescueTeam {
  name: string;
  area: string;
  cityId: string;
  members: number;
  status: string;
  rescues: number;
  phone: string;
}

const ALL_TEAMS: RescueTeam[] = [
  { name: 'Kumaon Wildlife & Pet Rescue Unit', area: 'Haldwani & Kathgodam, Uttarakhand', cityId: 'haldwani', members: 16, status: 'Active 24/7', rescues: 218, phone: '+91 98765 43210' },
  { name: 'Doon Valley Animal Care & Rapid Rescue', area: 'Dehradun & Mussoorie, Uttarakhand', cityId: 'dehradun', members: 22, status: 'Active 24/7', rescues: 312, phone: '+91 98765 43211' },
  { name: 'Nainital Hill Animals Protection Force', area: 'Nainital & Bhimtal, Uttarakhand', cityId: 'nainital', members: 12, status: 'Active 24/7', rescues: 145, phone: '+91 98765 43212' },
  { name: 'Haridwar Ganga Animal Aid Team', area: 'Haridwar & Rishikesh, Uttarakhand', cityId: 'haridwar', members: 18, status: 'Active 24/7', rescues: 189, phone: '+91 98765 43213' },
  { name: 'Mumbai Animal Emergency Force', area: 'Mumbai & Navi Mumbai, Maharashtra', cityId: 'mumbai', members: 34, status: 'Active 24/7', rescues: 642, phone: '+91 98765 43214' },
  { name: 'Delhi NCR Stray & Pet Welfare Squad', area: 'Delhi NCR (Gurugram, Noida, Ghaziabad)', cityId: 'delhi-ncr', members: 28, status: 'Active 24/7', rescues: 518, phone: '+91 98765 43215' },
  { name: 'Bengaluru Compassion & Pet Savers', area: 'Bengaluru, Karnataka', cityId: 'bengaluru', members: 31, status: 'Active 24/7', rescues: 403, phone: '+91 98765 43216' },
  { name: 'Chennai Marine & Stray Rescue Network', area: 'Chennai, Tamil Nadu', cityId: 'chennai', members: 20, status: 'Active 24/7', rescues: 276, phone: '+91 98765 43217' },
  { name: 'Hyderabad Animal Aid & Ambulance Service', area: 'Hyderabad & Secunderabad, Telangana', cityId: 'hyderabad', members: 26, status: 'Active 24/7', rescues: 315, phone: '+91 98765 43218' },
  { name: 'Pune Pet Protectors & Shelter Care', area: 'Pune & Pimpri-Chinchwad, Maharashtra', cityId: 'pune', members: 19, status: 'Active 24/7', rescues: 289, phone: '+91 98765 43219' },
  { name: 'Jaipur Wildlife & Stray Rescue', area: 'Jaipur, Rajasthan', cityId: 'jaipur', members: 15, status: 'Active 24/7', rescues: 178, phone: '+91 98765 43220' },
  { name: 'Chandigarh Tri-City Pet Relief', area: 'Chandigarh, Mohali & Panchkula', cityId: 'chandigarh', members: 14, status: 'Active 24/7', rescues: 196, phone: '+91 98765 43221' },
];

const RescueTeams = () => {
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = ALL_TEAMS.filter((team) => {
    const matchesCity = selectedCity === 'all' || team.cityId === selectedCity;
    const matchesQuery =
      !searchQuery.trim() ||
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.area.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-ink text-gray-900 dark:text-bone transition-colors duration-300">
      <Navbar />
      <div className="mx-auto max-w-[1400px] px-3.5 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <div className="mb-8 sm:mb-12 max-w-3xl">
          <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-900/20 px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40">
            <Shield className="h-4 w-4" /> Verified Nationwide Rescue Network
          </div>
          <h1 className="mb-3 sm:mb-4 font-display text-3xl xs:text-4xl sm:text-5xl font-black leading-tight text-gray-900 dark:text-bone">
            Our Network of <br />
            <span className="text-teal-600 dark:text-teal-400">Rescue Heroes</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-bone/70 leading-relaxed max-w-2xl">
            Connect directly with 24/7 verified rescue units, NGOs, and volunteers stationed across every city in India.
          </p>
          <div className="mt-6 flex flex-col xs:flex-row gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 active:scale-[0.98] transition-all shadow-md shadow-teal-900/20"
            >
              Join as a Rescue Volunteer <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/report-found-pet"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-bone/20 bg-white dark:bg-black/30 px-6 py-3 text-sm font-semibold text-gray-800 dark:text-bone hover:bg-gray-50 dark:hover:bg-black/50 transition-all"
            >
              Report Emergency Dispatch
            </Link>
          </div>
        </div>

        {/* Network Stats Bar */}
        <div className="mb-8 sm:mb-12 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {[
            { icon: <Users className="h-5 w-5 text-teal-600" />, bg: 'bg-teal-100 dark:bg-teal-900/20', value: '1,532+', label: 'Active Volunteers' },
            { icon: <Shield className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-100 dark:bg-blue-900/20', value: '120+', label: 'Registered NGOs' },
            { icon: <MapPin className="h-5 w-5 text-orange-500" />, bg: 'bg-orange-100 dark:bg-orange-900/20', value: '60+ Cities', label: 'Pan-India Coverage' },
            { icon: <Zap className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-100 dark:bg-purple-900/20', value: '< 15 mins', label: 'Avg Emergency Response' },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-ink-soft p-3.5 sm:p-5 shadow-sm"
            >
              <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl ${s.bg}`}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg sm:text-2xl font-bold text-gray-900 dark:text-bone truncate">{s.value}</p>
                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-bone/60 truncate">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* City Filter Controls */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm dark:border-white/10 dark:bg-ink-soft">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-teal-600" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Filter Rescue Teams by City</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* City Dropdown */}
            <div>
              <label htmlFor="team-city-filter" className="block text-xs font-semibold text-gray-600 dark:text-bone/70 mb-1">
                Select City / Location
              </label>
              <select
                id="team-city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs sm:text-sm font-medium text-gray-900 focus:border-teal-500 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white"
              >
                {ALL_INDIAN_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.state !== 'All States' ? `(${c.state})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label htmlFor="team-search" className="block text-xs font-semibold text-gray-600 dark:text-bone/70 mb-1">
                Search Team Name or Area
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  id="team-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Haldwani, Wildlife, Mumbai..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-xs sm:text-sm text-gray-900 focus:border-teal-500 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Team listings */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 dark:text-bone">
            Active Rescue Teams ({filteredTeams.length})
          </h2>
          {selectedCity !== 'all' && (
            <button
              onClick={() => setSelectedCity('all')}
              className="text-xs font-semibold text-teal-600 hover:underline"
            >
              Reset City Filter
            </button>
          )}
        </div>

        {filteredTeams.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-white/10 dark:bg-ink-soft mb-12">
            <Shield className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            <p className="font-bold text-gray-700 dark:text-white">No rescue teams found for this selection</p>
            <p className="text-xs text-gray-500 dark:text-white/60 mt-1">Try selecting "All Cities (All India)" or resetting search.</p>
            <button
              onClick={() => { setSelectedCity('all'); setSearchQuery(''); }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white"
            >
              Show All Cities
            </button>
          </div>
        ) : (
          <div className="mb-12 sm:mb-16 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => (
              <div
                key={team.name}
                className="rounded-2xl border border-gray-200/80 dark:border-bone/5 bg-white dark:bg-ink-soft p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30">
                      <Shield className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {team.status}
                    </span>
                  </div>
                  <h3 className="mb-1 text-base font-bold text-gray-900 dark:text-bone leading-snug">
                    {team.name}
                  </h3>
                  <p className="mb-3 flex items-center gap-1 text-xs text-gray-600 dark:text-bone/60">
                    <MapPin className="h-3.5 w-3.5 text-teal-600 shrink-0" /> {team.area}
                  </p>
                  <div className="mb-4 flex gap-4 text-xs text-gray-600 dark:text-bone/70">
                    <span className="flex items-center gap-1 font-medium"><Users className="h-3.5 w-3.5" /> {team.members} members</span>
                    <span className="flex items-center gap-1 font-medium"><Clock className="h-3.5 w-3.5" /> {team.rescues} rescues</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex gap-2">
                  <a
                    href={`tel:${team.phone.replace(/\s+/g, '')}`}
                    className="flex-1 rounded-xl bg-teal-600 py-2 text-center text-xs font-semibold text-white hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Phone className="h-3.5 w-3.5" /> Direct Call
                  </a>
                  <Link
                    to="/login"
                    className="rounded-xl border border-teal-200 dark:border-teal-900/50 px-3 py-2 text-center text-xs font-semibold text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all"
                  >
                    Dispatch Request
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 p-6 sm:p-10 text-center text-white shadow-lg">
          <Shield className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-90" />
          <h2 className="mb-2 sm:mb-3 font-display text-2xl sm:text-3xl font-bold">Join Our National Rescue Network</h2>
          <p className="mb-5 sm:mb-6 text-xs sm:text-base text-teal-100 max-w-xl mx-auto">
            Become a rescue responder or register your NGO shelter to coordinate missions with real-time GPS tracking.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 sm:px-8 py-3 text-sm font-bold text-teal-700 hover:bg-teal-50 active:scale-[0.98] transition-all shadow-md"
          >
            Register Rescue Unit <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RescueTeams;
