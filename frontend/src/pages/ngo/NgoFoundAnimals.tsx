import { useState } from 'react';
import { MapPin, Clock, Heart, Home, Search, Plus, X, CheckCircle, Edit3, Phone } from 'lucide-react';

interface Animal {
  id: string;
  animal: string;
  emoji: string;
  breed: string;
  color: string;
  location: string;
  foundBy: string;
  foundByPhone?: string;
  foundDate: string;
  status: string;
  description: string;
  gender: string;
  age: string;
  vaccinated?: boolean;
  microchipped?: boolean;
  shelterName?: string;
}

const INITIAL_ANIMALS: Animal[] = [
  { id: '1', animal: 'Dog', emoji: '🐕', breed: 'Labrador Mix', color: 'Golden', location: 'Indira Nagar, Lucknow', foundBy: 'Rahul Sharma', foundByPhone: '+91 98765 43210', foundDate: 'Aug 24, 2026', status: 'in_shelter', description: 'Friendly adult dog, wearing a torn collar. Healthy and vaccinated. Responds well to commands.', gender: 'Male', age: '~3 years', vaccinated: true, microchipped: false, shelterName: 'NGO Main Shelter' },
  { id: '2', animal: 'Cat', emoji: '🐈', breed: 'Tabby', color: 'Orange & White', location: 'Gomti Nagar, Lucknow', foundBy: 'Priya Singh', foundByPhone: '+91 87654 32109', foundDate: 'Aug 23, 2026', status: 'foster_care', description: 'Young female cat, slightly malnourished, now recovering well. Very affectionate.', gender: 'Female', age: '~1 year', vaccinated: false, microchipped: false, shelterName: 'Gomti Nagar Unit' },
  { id: '3', animal: 'Puppy', emoji: '🐶', breed: 'Unknown', color: 'Brown', location: 'Hazratganj, Lucknow', foundBy: 'Aman Verma', foundByPhone: '+91 76543 21098', foundDate: 'Aug 23, 2026', status: 'available', description: 'Tiny puppy found alone near market. Fully weaned and healthy. Playful and curious.', gender: 'Male', age: '~3 months', vaccinated: true, microchipped: false },
  { id: '4', animal: 'Rabbit', emoji: '🐇', breed: 'White Lop', color: 'White', location: 'Aliganj, Lucknow', foundBy: 'Neha Mishra', foundByPhone: '+91 65432 10987', foundDate: 'Aug 22, 2026', status: 'adopted', description: 'Pet rabbit apparently lost. Now adopted by a family in Gomti Nagar.', gender: 'Female', age: '~2 years', vaccinated: true, microchipped: false },
  { id: '5', animal: 'Parrot', emoji: '🦜', breed: 'Indian Ringneck', color: 'Green', location: 'Mahanagar, Lucknow', foundBy: 'Suresh Kumar', foundByPhone: '+91 54321 09876', foundDate: 'Aug 22, 2026', status: 'available', description: 'Tame parrot found in garden. Appears to be escaped pet. Can speak a few words.', gender: 'Unknown', age: 'Adult', vaccinated: false, microchipped: false },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  in_shelter: { label: 'In Shelter', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
  foster_care: { label: 'Foster Care', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30' },
  available: { label: 'Available', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' },
  adopted: { label: 'Adopted', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800' },
};

const NgoFoundAnimals = () => {
  const [animals, setAnimals] = useState<Animal[]>(INITIAL_ANIMALS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewingAnimal, setViewingAnimal] = useState<Animal | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Found Animal modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState('Dog');
  const [newBreed, setNewBreed] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newGender, setNewGender] = useState('Male');
  const [newAge, setNewAge] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newFoundBy, setNewFoundBy] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const filtered = animals.filter((a) => {
    const matchSearch = a.animal.toLowerCase().includes(search.toLowerCase()) || a.location.toLowerCase().includes(search.toLowerCase()) || a.breed.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    setAnimals((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    if (viewingAnimal?.id === id) {
      setViewingAnimal((a) => a ? { ...a, status: newStatus } : a);
    }
    const msgs: Record<string, string> = {
      adopted: '🎉 Animal marked as Adopted!',
      foster_care: '🏡 Animal moved to Foster Care!',
      in_shelter: '🏠 Animal moved to Shelter!',
      available: '✅ Animal marked as Available!',
    };
    setActionSuccess(msgs[newStatus] || 'Status updated!');
    setTimeout(() => setActionSuccess(null), 2000);
  };

  const handleCreateFoundAnimal = () => {
    if (!newBreed.trim() || !newLocation.trim()) return;
    const emojiMap: Record<string, string> = {
      Dog: '🐕',
      Cat: '🐈',
      Puppy: '🐶',
      Rabbit: '🐇',
      Bird: '🐦',
      Cow: '🐄',
    };
    const created: Animal = {
      id: String(Date.now()),
      animal: newType,
      emoji: emojiMap[newType] || '🐾',
      breed: newBreed,
      color: newColor || 'Mixed',
      location: newLocation,
      foundBy: newFoundBy || 'Community Member',
      foundByPhone: newPhone,
      foundDate: 'Today',
      status: 'in_shelter',
      description: newDesc || `Found ${newType} undergoing health assessment.`,
      gender: newGender,
      age: newAge || 'Unknown',
      vaccinated: false,
      microchipped: false,
      shelterName: 'NGO Main Shelter',
    };
    setAnimals((prev) => [created, ...prev]);
    setShowAddModal(false);
    setNewBreed('');
    setNewColor('');
    setNewAge('');
    setNewLocation('');
    setNewFoundBy('');
    setNewPhone('');
    setNewDesc('');
    setActionSuccess('Found animal recorded and added to shelter list!');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Found Animals</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All animals reported found by community members.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Report Found Animal
        </button>
      </div>

      {/* Global Success Banner */}
      {actionSuccess && !viewingAnimal && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{actionSuccess}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {animals.filter((a) => a.status === key).length}
            </p>
            <p className="text-xs text-slate-500 mt-1">{cfg.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by animal, breed, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'in_shelter', 'foster_care', 'available', 'adopted'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-xl px-3 py-2 text-xs font-bold capitalize transition-colors ${filterStatus === s ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Animal Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((animal) => {
          const cfg = STATUS_CONFIG[animal.status] || STATUS_CONFIG.in_shelter;
          return (
            <div key={animal.id} className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden hover:shadow-md transition-shadow">
              {/* Emoji banner */}
              <div className="flex h-28 items-center justify-center bg-gradient-to-br from-violet-50 to-blue-50 text-6xl dark:from-slate-800 dark:to-slate-800">
                {animal.emoji}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{animal.animal} — {animal.breed}</h3>
                    <p className="text-[11px] text-slate-500">{animal.gender} · {animal.age} · {animal.color}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{animal.description}</p>
                <div className="flex flex-col gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-violet-500" />{animal.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-slate-400" />Found: {animal.foundDate} by {animal.foundBy}</span>
                </div>
                <div className="flex gap-2">
                  {animal.status === 'available' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(animal.id, 'adopted')}
                        className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-violet-600 py-2 text-xs font-bold text-white hover:bg-violet-700 active:scale-95 transition-all"
                      >
                        <Heart className="h-3.5 w-3.5" /> Adopt
                      </button>
                      <button
                        onClick={() => handleStatusChange(animal.id, 'foster_care')}
                        className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 active:scale-95 transition-all"
                      >
                        <Home className="h-3.5 w-3.5" /> Foster
                      </button>
                    </>
                  )}
                  {/* View Details always visible */}
                  <button
                    onClick={() => setViewingAnimal(animal)}
                    className={`${animal.status === 'available' ? 'hidden' : 'flex-1'} rounded-xl border border-violet-200 bg-violet-50 py-2 text-xs font-bold text-violet-600 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-400 transition-colors`}
                  >
                    View Details
                  </button>
                  {animal.status === 'available' && (
                    <button
                      onClick={() => setViewingAnimal(animal)}
                      className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-600 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-400 transition-colors"
                    >
                      ⋯ Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Report Found Animal Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Report Found Animal</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Species / Animal</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option>Dog</option>
                    <option>Cat</option>
                    <option>Puppy</option>
                    <option>Rabbit</option>
                    <option>Bird</option>
                    <option>Cow</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Breed *</label>
                  <input
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value)}
                    placeholder="e.g. Labrador Mix, Persian"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Color</label>
                  <input
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="e.g. Golden"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Estimated Age</label>
                  <input
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder="e.g. ~2 years"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Location Found *</label>
                <input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Hazratganj Market, Lucknow"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Finder Name</label>
                  <input
                    value={newFoundBy}
                    onChange={(e) => setNewFoundBy(e.target.value)}
                    placeholder="e.g. Priya Singh"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Finder Phone</label>
                  <input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Health / Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Note physical condition, collar tags, behavior..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
              <button onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700">Cancel</button>
              <button
                onClick={handleCreateFoundAnimal}
                disabled={!newBreed.trim() || !newLocation.trim()}
                className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Details Modal ── */}
      {viewingAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex h-32 items-center justify-center bg-gradient-to-br from-violet-100 to-blue-100 text-7xl relative dark:from-slate-800 dark:to-slate-800">
              {viewingAnimal.emoji}
              <button
                onClick={() => setViewingAnimal(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 bg-white/80 text-slate-500 hover:bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{viewingAnimal.animal} — {viewingAnimal.breed}</h2>
                  <p className="text-sm text-slate-500">{viewingAnimal.gender} · {viewingAnimal.age} · {viewingAnimal.color}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STATUS_CONFIG[viewingAnimal.status]?.color}`}>
                  {STATUS_CONFIG[viewingAnimal.status]?.label || viewingAnimal.status}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 mb-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">{viewingAnimal.description}</p>
              </div>

              <div className="flex gap-2 mb-4">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${viewingAnimal.vaccinated ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>
                  {viewingAnimal.vaccinated ? '✅ Vaccinated' : '❌ Not Vaccinated'}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${viewingAnimal.microchipped ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'}`}>
                  {viewingAnimal.microchipped ? '✅ Microchipped' : '⚠️ No Microchip'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Location Found</p>
                  <p className="flex items-center gap-1 text-slate-700 dark:text-slate-300"><MapPin className="h-3.5 w-3.5 text-violet-500" />{viewingAnimal.location}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Date Found</p>
                  <p className="flex items-center gap-1 text-slate-700 dark:text-slate-300"><Clock className="h-3.5 w-3.5 text-violet-500" />{viewingAnimal.foundDate}</p>
                </div>
                {viewingAnimal.shelterName && (
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Current Shelter</p>
                    <p className="flex items-center gap-1 text-slate-700 dark:text-slate-300"><Home className="h-3.5 w-3.5 text-violet-500" />{viewingAnimal.shelterName}</p>
                  </div>
                )}
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Reported By</p>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">{viewingAnimal.foundBy}</p>
                  {viewingAnimal.foundByPhone && (
                    <p className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5"><Phone className="h-3 w-3" />{viewingAnimal.foundByPhone}</p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
                {viewingAnimal.status === 'available' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(viewingAnimal.id, 'adopted')}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white hover:bg-violet-700 transition-colors"
                    >
                      <Heart className="h-4 w-4" /> Mark Adopted
                    </button>
                    <button
                      onClick={() => handleStatusChange(viewingAnimal.id, 'foster_care')}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <Home className="h-4 w-4" /> Move to Foster
                    </button>
                  </>
                )}
                {viewingAnimal.status === 'in_shelter' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(viewingAnimal.id, 'available')}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" /> Put for Adoption
                    </button>
                    <button
                      onClick={() => handleStatusChange(viewingAnimal.id, 'foster_care')}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <Home className="h-4 w-4" /> Send to Foster
                    </button>
                  </>
                )}
                {viewingAnimal.status === 'foster_care' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(viewingAnimal.id, 'adopted')}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white hover:bg-violet-700 transition-colors"
                    >
                      <Heart className="h-4 w-4" /> Mark Adopted
                    </button>
                    <button
                      onClick={() => handleStatusChange(viewingAnimal.id, 'in_shelter')}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 transition-colors"
                    >
                      Return to Shelter
                    </button>
                  </>
                )}
                {viewingAnimal.status === 'adopted' && (
                  <div className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-500 dark:bg-slate-800">
                    🎉 This pet is happily adopted!
                  </div>
                )}
                <button
                  onClick={() => {
                    const newStatus = viewingAnimal.status === 'in_shelter' ? 'available' : 'in_shelter';
                    handleStatusChange(viewingAnimal.id, newStatus);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Toggle Shelter Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoFoundAnimals;
