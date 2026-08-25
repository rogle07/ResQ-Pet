import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  Plus,
  Radio,
  PawPrint,
  X,
  CheckCircle,
} from 'lucide-react';
import { INITIAL_PATIENTS } from '@/data/veterinarianMockData';
import { VetPatient, AnimalSpecies } from '@/types/veterinarian';

export const VeterinarianPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<VetPatient[]>(INITIAL_PATIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Patient Form state
  const [newName, setNewName] = useState('');
  const [newSpecies, setNewSpecies] = useState<AnimalSpecies>('Dog');
  const [newBreed, setNewBreed] = useState('');
  const [newAge, setNewAge] = useState('2 Years');
  const [newGender] = useState<'Male' | 'Female'>('Male');
  const [newWeight, setNewWeight] = useState('15');
  const [newOwner, setNewOwner] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress] = useState('Nainital, Uttarakhand');
  const [newAllergies, setNewAllergies] = useState('None');
  const [submitted, setSubmitted] = useState(false);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (speciesFilter !== 'All' && p.species !== speciesFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.petCode.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q) ||
          p.ownerPhone.includes(q) ||
          p.breed.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [patients, speciesFilter, searchQuery]);

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newOwner.trim() || !newPhone.trim()) return;

    const newPat: VetPatient = {
      id: `P-${Date.now()}`,
      petCode: `RPET000${Math.floor(10 + Math.random() * 90)}`,
      name: newName,
      species: newSpecies,
      breed: newBreed || (newSpecies === 'Dog' ? 'Labrador' : newSpecies === 'Cat' ? 'Indie' : 'Local Breed'),
      age: newAge,
      gender: newGender,
      weightKg: Number(newWeight) || 12,
      color: 'Mixed',
      image: newSpecies === 'Dog' ? '/animal-dog.jpg' : newSpecies === 'Cat' ? '/animal-cat.jpg' : newSpecies === 'Cow' ? '/animal-cow.jpg' : '/buddy-puppy.jpg',
      status: 'Under Treatment',
      ownerName: newOwner,
      ownerPhone: newPhone,
      ownerEmail: `${newOwner.toLowerCase().replace(/\s+/g, '')}@example.com`,
      ownerAddress: newAddress,
      overallStatus: 'Good',
      lastCheckup: 'Today',
      allergies: newAllergies,
    };

    setPatients((prev) => [newPat, ...prev]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowAddModal(false);
      setNewName('');
      setNewBreed('');
      setNewOwner('');
      setNewPhone('');
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/veterinarian" className="hover:text-emerald-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">Patients</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            Patient Registry & IoT Fleet <PawPrint className="h-6 w-6 text-emerald-600" />
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-[#1e6f42] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#165a34] shadow-md shadow-emerald-950/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" /> + Register New Patient
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by pet name, code (RPET...), breed, owner, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {['All', 'Dog', 'Cat', 'Cow', 'Goat'].map((s) => (
            <button
              key={s}
              onClick={() => setSpeciesFilter(s)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                speciesFilter === s
                  ? 'bg-[#1e6f42] text-white shadow-sm'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            onClick={() => navigate(`/veterinarian/patients/${patient.id}`)}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-lg hover:border-emerald-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800 transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header with image, code and status badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={patient.image}
                      alt={patient.name}
                      className="h-14 w-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    {patient.collar && (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center text-[8px] text-white font-bold">
                          ⚡
                        </span>
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
                      {patient.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {patient.species} • {patient.breed} • {patient.age}
                    </p>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {patient.petCode}
                    </span>
                  </div>
                </div>

                <span
                  className={`rounded-xl px-2.5 py-1 text-[11px] font-bold border ${
                    patient.status === 'Critical'
                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 animate-pulse'
                      : patient.status === 'Under Treatment'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  {patient.status}
                </span>
              </div>

              {/* Owner and checkup info */}
              <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
                <p className="flex items-center justify-between">
                  <span className="text-slate-400">Owner:</span>
                  <span className="font-bold text-slate-800 dark:text-white">{patient.ownerName}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-400">Contact:</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400">{patient.ownerPhone}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-400">Weight:</span>
                  <span className="font-semibold">{patient.weightKg} kg</span>
                </p>
              </div>

              {/* IoT Collar Telemetry Banner */}
              {patient.collar ? (
                <div className="mt-3 rounded-2xl bg-slate-950 p-3 text-white text-xs border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <Radio className="h-3 w-3 animate-pulse" /> {patient.collar.deviceId}
                    </span>
                    <span className="text-slate-300 font-bold">{patient.collar.temperature.currentC} °C</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Motion: {patient.collar.motion.activityLevel}</span>
                    <span>Battery: {patient.collar.batteryPercent}%</span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-2xl bg-slate-50 p-2.5 text-center text-xs text-slate-400 dark:bg-slate-800/40">
                  No Smart Collar Assigned
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400">Last: {patient.lastCheckup}</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                Full Profile ➔
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Register New Patient Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-white px-6 py-4 dark:border-slate-800 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e6f42] text-white shadow-sm">
                  <PawPrint className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Register New Patient</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Create medical record and smart collar assignment</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-12 text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle className="h-9 w-9" />
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Patient Registered!</h4>
                <p className="text-xs text-slate-500">{newName} has been added to the registry.</p>
              </div>
            ) : (
              <form onSubmit={handleAddPatient} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Pet Name *</label>
                    <input
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Bruno"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Species</label>
                    <select
                      value={newSpecies}
                      onChange={(e) => setNewSpecies(e.target.value as AnimalSpecies)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Cow">Cow</option>
                      <option value="Goat">Goat</option>
                      <option value="Rabbit">Rabbit</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Breed</label>
                    <input
                      value={newBreed}
                      onChange={(e) => setNewBreed(e.target.value)}
                      placeholder="e.g. Labrador"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Age</label>
                    <input
                      value={newAge}
                      onChange={(e) => setNewAge(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Weight (Kg)</label>
                    <input
                      type="number"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Owner Name *</label>
                    <input
                      required
                      value={newOwner}
                      onChange={(e) => setNewOwner(e.target.value)}
                      placeholder="e.g. Ravi Sharma"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Contact Phone *</label>
                    <input
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Known Allergies</label>
                  <input
                    value={newAllergies}
                    onChange={(e) => setNewAllergies(e.target.value)}
                    placeholder="e.g. Pollen, Dust, None"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#1e6f42] px-5 py-2 text-xs font-bold text-white hover:bg-[#165a34] shadow-md transition-all hover:scale-105"
                  >
                    Save Patient
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default VeterinarianPatients;
