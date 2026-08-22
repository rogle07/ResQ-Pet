import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Home as HomeIcon, Heart, ArrowRight, Dog, MapPin, Filter, PawPrint, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ALL_INDIAN_CITIES } from '@/utils/cities';

interface PetItem {
  name: string;
  species: string;
  breed: string;
  age: string;
  location: string;
  cityId: string;
  tag: string;
  desc: string;
}

const ALL_PETS: PetItem[] = [
  { name: 'Luna', species: 'dog', breed: 'Golden Retriever', age: '2 years', location: 'Mumbai, Maharashtra', cityId: 'mumbai', tag: 'Vaccinated', desc: 'Gentle, playful, and great with kids.' },
  { name: 'Max', species: 'dog', breed: 'Labrador Mix', age: '1 year', location: 'Delhi NCR', cityId: 'delhi-ncr', tag: 'Neutered', desc: 'Energetic and eager to learn commands.' },
  { name: 'Bella', species: 'dog', breed: 'Beagle', age: '3 years', location: 'Bengaluru (Bangalore)', cityId: 'bengaluru', tag: 'House-trained', desc: 'Friendly hound who loves daily walks.' },
  { name: 'Sheru', species: 'dog', breed: 'Indie Dog', age: '8 months', location: 'Haldwani, Uttarakhand', cityId: 'haldwani', tag: 'Vaccinated', desc: 'Rescued near bypass, extremely loyal and healthy.' },
  { name: 'Snowy', species: 'cat', breed: 'Persian Cross', age: '1.5 years', location: 'Dehradun, Uttarakhand', cityId: 'dehradun', tag: 'Spayed', desc: 'Calm indoor cat looking for a quiet home.' },
  { name: 'Charlie', species: 'dog', breed: 'Indie Dog', age: '6 months', location: 'Chennai, Tamil Nadu', cityId: 'chennai', tag: 'Vaccinated', desc: 'Playful pup, socialized with other pets.' },
  { name: 'Coco', species: 'dog', breed: 'Pomeranian', age: '4 years', location: 'Hyderabad, Telangana', cityId: 'hyderabad', tag: 'Friendly', desc: 'Small companion dog, loves cuddles.' },
  { name: 'Rocky', species: 'dog', breed: 'German Shepherd', age: '2 years', location: 'Pune, Maharashtra', cityId: 'pune', tag: 'Trained', desc: 'Active protector, loyal and obedient.' },
  { name: 'Milo', species: 'cat', breed: 'Indian Short Hair', age: '1 year', location: 'Nainital, Uttarakhand', cityId: 'nainital', tag: 'Healthy', desc: 'Affectionate mouser rescued from cold hills.' },
  { name: 'Nandi', species: 'cow', breed: 'Desi Cow Calf', age: '5 months', location: 'Haridwar, Uttarakhand', cityId: 'haridwar', tag: 'Shelter Care', desc: 'Healthy rescued calf needing Gaushala foster care.' },
  { name: 'Leo', species: 'dog', breed: 'Husky Mix', age: '2.5 years', location: 'Chandigarh', cityId: 'chandigarh', tag: 'Active', desc: 'Thrives in cool weather and big open spaces.' },
  { name: 'Bunny', species: 'rabbit', breed: 'Angora Cross', age: '10 months', location: 'Jaipur, Rajasthan', cityId: 'jaipur', tag: 'Gentle', desc: 'Quiet and sweet companion pet.' },
];

const colors = [
  'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
  'bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
];

const Adoption = () => {
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPets = ALL_PETS.filter((pet) => {
    const matchesCity = selectedCity === 'all' || pet.cityId === selectedCity;
    const matchesSpecies = selectedSpecies === 'all' || pet.species === selectedSpecies;
    const matchesQuery =
      !searchQuery.trim() ||
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSpecies && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-ink text-gray-900 dark:text-bone transition-colors duration-300">
      <Navbar />
      <div className="mx-auto max-w-[1400px] px-3.5 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <div className="mb-8 sm:mb-12 max-w-3xl">
          <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 dark:bg-orange-900/20 px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40">
            <HomeIcon className="h-4 w-4" /> Nationwide Pet Adoption Network
          </div>
          <h1 className="mb-3 sm:mb-4 font-display text-3xl xs:text-4xl sm:text-5xl font-black leading-tight text-gray-900 dark:text-bone">
            Find Your New <br />
            <span className="text-orange-500">Forever Best Friend</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-bone/70 leading-relaxed max-w-2xl">
            Browse rescue animals looking for loving homes across India. Every adoption frees up shelter space and saves a life.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm dark:border-white/10 dark:bg-ink-soft">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Filter by City & Animal Type</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* City Dropdown */}
            <div>
              <label htmlFor="adopt-city" className="block text-xs font-semibold text-gray-600 dark:text-bone/70 mb-1">
                City / Location
              </label>
              <select
                id="adopt-city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs sm:text-sm font-medium text-gray-900 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white"
              >
                {ALL_INDIAN_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.state !== 'All States' ? `(${c.state})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Species Dropdown */}
            <div>
              <label htmlFor="adopt-species" className="block text-xs font-semibold text-gray-600 dark:text-bone/70 mb-1">
                Species
              </label>
              <select
                id="adopt-species"
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs sm:text-sm font-medium text-gray-900 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white"
              >
                <option value="all">All Species (Dogs, Cats, Cows...)</option>
                <option value="dog">🐕 Dogs</option>
                <option value="cat">🐈 Cats</option>
                <option value="cow">🐄 Cattle / Calves</option>
                <option value="rabbit">🐇 Rabbits</option>
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label htmlFor="adopt-search" className="block text-xs font-semibold text-gray-600 dark:text-bone/70 mb-1">
                Search Name or Breed
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  id="adopt-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Golden Retriever, Luna..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-xs sm:text-sm text-gray-900 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pets grid */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 dark:text-bone">
            Available for Adoption ({filteredPets.length})
          </h2>
          {selectedCity !== 'all' && (
            <button
              onClick={() => setSelectedCity('all')}
              className="text-xs font-semibold text-orange-600 hover:underline"
            >
              Reset City Filter
            </button>
          )}
        </div>

        {filteredPets.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-white/10 dark:bg-ink-soft mb-12">
            <PawPrint className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            <p className="font-bold text-gray-700 dark:text-white">No pets matching this filter</p>
            <p className="text-xs text-gray-500 dark:text-white/60 mt-1">Try selecting "All Cities" or clearing the search query.</p>
            <button
              onClick={() => { setSelectedCity('all'); setSelectedSpecies('all'); setSearchQuery(''); }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12 sm:mb-16">
            {filteredPets.map((pet, i) => (
              <div
                key={pet.name}
                className="rounded-2xl border border-gray-200/80 dark:border-bone/5 bg-white dark:bg-ink-soft p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl ${colors[i % colors.length]}`}>
                      <Dog className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      {pet.tag}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 dark:text-bone">{pet.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-bone/60 font-medium">
                    {pet.breed} · {pet.age}
                  </p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-white/60 line-clamp-2">
                    {pet.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                  <p className="mb-3 text-xs text-gray-600 dark:text-bone/60 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                    <span className="truncate">{pet.location}</span>
                  </p>
                  <Link
                    to="/login"
                    className="block w-full rounded-xl border border-orange-300 dark:border-orange-900/50 py-2.5 text-center text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 active:scale-[0.98] transition-all"
                  >
                    Apply to Adopt {pet.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-6 sm:p-10 text-center text-white shadow-lg">
          <Heart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-90" fill="currentColor" />
          <h2 className="mb-2 sm:mb-3 font-display text-2xl sm:text-3xl font-bold">Give a Pet a Forever Home</h2>
          <p className="mb-5 sm:mb-6 text-xs sm:text-base text-orange-100 max-w-xl mx-auto">
            Register as an adopter and connect with shelters, foster parents, and rescuers across all Indian cities.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 sm:px-8 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 active:scale-[0.98] transition-all shadow-md"
          >
            Start Adoption Process <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Adoption;
