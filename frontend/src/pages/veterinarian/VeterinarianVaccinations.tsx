import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Plus, ShieldCheck } from 'lucide-react';
import { INITIAL_VACCINATIONS } from '@/data/veterinarianMockData';
import { VetVaccination } from '@/types/veterinarian';

export const VeterinarianVaccinations = () => {
  const [vaccinations, setVaccinations] = useState<VetVaccination[]>(INITIAL_VACCINATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Vaccination state
  const [newPet, setNewPet] = useState('Bruno');
  const [newOwner, setNewOwner] = useState('Ravi Sharma');
  const [newVaccine, setNewVaccine] = useState('Rabies Vaccine Booster');
  const [newDose, setNewDose] = useState('1.0ml');
  const [newGivenDate, setNewGivenDate] = useState('2026-05-20');
  const [newDueDate, setNewDueDate] = useState('2027-05-20');

  const filtered = vaccinations.filter(
    (v) =>
      v.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vaccineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddVaccination = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: VetVaccination = {
      id: `VAC-${Date.now()}`,
      petName: newPet,
      species: 'Dog',
      ownerName: newOwner,
      vaccineName: newVaccine,
      dose: newDose,
      givenDate: newGivenDate,
      nextDueDate: newDueDate,
      status: 'Administered',
    };
    setVaccinations((prev) => [newEntry, ...prev]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/veterinarian" className="hover:text-emerald-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">Vaccinations</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            Vaccination & Immunization Log <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-[#1e6f42] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#165a34] shadow-md shadow-emerald-950/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" /> + Log New Vaccine
        </button>
      </div>

      <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search vaccinations by pet, vaccine or owner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none dark:text-white"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-4">Pet Details</th>
                <th className="px-6 py-4">Vaccine & Dose</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Administered Date</th>
                <th className="px-6 py-4">Next Due Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    {v.petName} <span className="text-[11px] font-normal text-slate-400">({v.species})</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-emerald-800 dark:text-emerald-400">
                    {v.vaccineName} ({v.dose})
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{v.ownerName}</td>
                  <td className="px-6 py-4 text-slate-500">{v.givenDate}</td>
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{v.nextDueDate}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-xl px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Log Administered Vaccine</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleAddVaccination} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Pet Name</label>
                  <input
                    value={newPet}
                    onChange={(e) => setNewPet(e.target.value)}
                    className="w-full rounded-xl border p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Owner Name</label>
                  <input
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full rounded-xl border p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Vaccine Name & Type</label>
                <input
                  value={newVaccine}
                  onChange={(e) => setNewVaccine(e.target.value)}
                  className="w-full rounded-xl border p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Dose</label>
                  <input
                    value={newDose}
                    onChange={(e) => setNewDose(e.target.value)}
                    className="w-full rounded-xl border p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Administered</label>
                  <input
                    type="date"
                    value={newGivenDate}
                    onChange={(e) => setNewGivenDate(e.target.value)}
                    className="w-full rounded-xl border p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Next Due</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full rounded-xl border p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1e6f42] text-white font-bold text-xs"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default VeterinarianVaccinations;
