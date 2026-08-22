import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Heart,
  Search,
} from 'lucide-react';
import { ADOPTABLE_PETS } from '@/data/fosterMockData';
import { AdoptablePet } from '@/types/foster';
import { PetProfileModal } from '@/components/fosterHome/PetProfileModal';
import { api } from '@/api/client';

const FosterAdoption = () => {
  const [pets, setPets] = useState<AdoptablePet[]>(ADOPTABLE_PETS);
  const [selectedPet, setSelectedPet] = useState<AdoptablePet | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [ageFilter, setAgeFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Pet Owner requested pets from Backend API
  useEffect(() => {
    const fetchOwnerRequests = async () => {
      try {
        const [adoptRes, fosterRes] = await Promise.allSettled([
          api.get<{ success: boolean; pets: any[] }>('/adoption/pets'),
          api.get<{ success: boolean; requests: any[] }>('/foster'),
        ]);

        const dynamicPets: AdoptablePet[] = [];

        if (adoptRes.status === 'fulfilled' && adoptRes.value.data?.pets?.length > 0) {
          adoptRes.value.data.pets.forEach((p: any) => {
            dynamicPets.push({
              id: p._id,
              name: p.name,
              species: p.species || 'Dog',
              breed: p.breed || 'Rescue',
              age: typeof p.age === 'number' ? `${p.age} years` : p.age || '1 year',
              gender: p.gender === 'female' ? 'Female' : 'Male',
              image: p.images?.[0]?.url || '/animal-dog.jpg',
              location: p.location || 'Rescue Center',
              ownerName: p.owner?.name || 'Pet Owner',
              ownerPhone: p.owner?.phone || '+91 98765 43210',
              ownerEmail: p.owner?.email,
              requestedDate: 'Recent',
              reason: p.adoption?.description || 'Owner requested loving adoption placement.',
              vaccinated: true,
              neutered: true,
              goodWithKids: true,
              goodWithPets: true,
              weightKg: 15,
              story: p.adoption?.description || `${p.name} is looking for a caring forever family.`,
              healthStatus: 'Vaccinated and checked by veterinarian',
              diet: 'Standard balanced pet meals',
            });
          });
        }

        if (fosterRes.status === 'fulfilled' && fosterRes.value.data?.requests?.length > 0) {
          fosterRes.value.data.requests.forEach((r: any) => {
            if (r.pet) {
              dynamicPets.push({
                id: r._id,
                name: r.pet.name,
                species: r.pet.species ? r.pet.species.charAt(0).toUpperCase() + r.pet.species.slice(1) : 'Dog',
                breed: r.pet.breed || 'Rescue',
                age: typeof r.pet.age === 'number' ? `${r.pet.age} years` : r.pet.age || '2 years',
                gender: r.pet.gender === 'female' ? 'Female' : 'Male',
                image: r.pet.images?.[0]?.url || '/animal-dog.jpg',
                location: r.requestedBy?.address || 'Nainital Region',
                ownerName: r.requestedBy?.name || 'Pet Owner',
                ownerPhone: r.requestedBy?.phone || '+91 98765 43210',
                ownerEmail: r.requestedBy?.email,
                requestedDate: 'Recent',
                reason: r.reason || 'Pet owner requested foster care.',
                vaccinated: true,
                neutered: true,
                goodWithKids: true,
                goodWithPets: true,
                weightKg: r.pet.weightKg || 12,
                story: r.reason || `${r.pet.name} is a friendly companion in foster care.`,
                healthStatus: 'Vaccinated and under foster health monitoring',
                diet: 'Balanced pet food & fresh water',
              });
            }
          });
        }

        if (dynamicPets.length > 0) {
          const existingIds = new Set(dynamicPets.map((p) => p.id));
          setPets([...dynamicPets, ...ADOPTABLE_PETS.filter((p) => !existingIds.has(p.id))]);
        }
      } catch {
        // Keep initial mock
      }
    };

    fetchOwnerRequests();
  }, []);

  const toggleFavorite = (id: string) => {
    setPets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
    if (selectedPet && selectedPet.id === id) {
      setSelectedPet((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const filteredPets = useMemo(() => {
    return pets.filter((p) => {
      if (speciesFilter !== 'All' && p.species !== speciesFilter) return false;
      if (genderFilter !== 'All' && p.gender !== genderFilter) return false;
      if (ageFilter === 'Young' && !p.age.includes('month') && !p.age.startsWith('1')) return false;
      if (ageFilter === 'Adult' && (p.age.includes('month') || p.age.startsWith('1 '))) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.breed.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.species.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [pets, speciesFilter, ageFilter, genderFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/foster-home" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">Adoption</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
          Adoption
        </h1>
      </div>

      {/* Top Green Alert / Encouragement Banner */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-teal-50 p-4 border border-emerald-200/80 dark:from-emerald-950/40 dark:via-emerald-900/20 dark:to-slate-900 dark:border-emerald-900/40">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
            <Heart className="h-5 w-5" fill="currentColor" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
            Give them a forever home filled with love.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <img
            src="/puppy.jpg"
            alt="Pet"
            className="h-9 w-9 rounded-full object-cover border-2 border-white dark:border-slate-800"
          />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">ResQPet Foster Care</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="All">All Animals</option>
          <option value="Dog">Dogs</option>
          <option value="Cat">Cats</option>
          <option value="Goat">Goats</option>
          <option value="Cow">Cows</option>
          <option value="Rabbit">Rabbits</option>
        </select>

        <select
          value={ageFilter}
          onChange={(e) => setAgeFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="All">All Age</option>
          <option value="Young">Young (&lt; 2 yrs)</option>
          <option value="Adult">Adult (2+ yrs)</option>
        </select>

        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="All">All Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search animals by name, breed, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Pet Cards Grid */}
      {filteredPets.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-sm font-semibold">No pets match the current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPets.map((pet) => (
            <div
              key={pet.id}
              className="group flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800"
            >
              {/* Pet Image with Heart */}
              <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                <img
                  src={pet.image}
                  alt={pet.name}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  type="button"
                  onClick={() => toggleFavorite(pet.id)}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm text-red-500 hover:scale-110 transition-transform dark:bg-slate-900/90"
                >
                  <Heart className="h-4 w-4" fill={pet.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Pet Info */}
              <div className="py-3 px-1 text-center">
                <h3 className="font-display text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {pet.name}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {pet.age} • {pet.gender}
                </p>
              </div>

              {/* View Profile Button */}
              <button
                type="button"
                onClick={() => setSelectedPet(pet)}
                className="w-full rounded-2xl bg-[#1e6f42] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#165a34] transition-colors"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pet Profile Modal */}
      <PetProfileModal
        pet={selectedPet}
        isOpen={Boolean(selectedPet)}
        onClose={() => setSelectedPet(null)}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
};

export default FosterAdoption;
