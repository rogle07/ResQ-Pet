import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  Plus,
} from 'lucide-react';
import { INITIAL_MEDICAL_RECORDS } from '@/data/veterinarianMockData';
import { VetMedicalRecord } from '@/types/veterinarian';
import { AddMedicalRecordModal } from '@/components/veterinarian/AddMedicalRecordModal';

export const VeterinarianRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<VetMedicalRecord[]>(INITIAL_MEDICAL_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.recordId.toLowerCase().includes(q) ||
          r.petName.toLowerCase().includes(q) ||
          r.ownerName.toLowerCase().includes(q) ||
          r.diagnosis.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [records, searchQuery]);

  const handleAddRecord = (newRec: VetMedicalRecord) => {
    setRecords((prev) => [newRec, ...prev]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/veterinarian" className="hover:text-emerald-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">Medical Records</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
            Medical Records
          </h1>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-[#1e6f42] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#165a34] shadow-md shadow-emerald-950/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" /> + Add Medical Record
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search records by ID, pet name, owner or diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecords.map((r) => (
          <div
            key={r.id}
            onClick={() => navigate(`/veterinarian/records/${r.id}`)}
            className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:border-emerald-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={r.image}
                    alt={r.petName}
                    className="h-12 w-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {r.recordId}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-700 transition-colors">
                      {r.petName} <span className="text-xs font-normal text-slate-400">({r.species})</span>
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-400">{r.date}</span>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Diagnosis</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{r.diagnosis}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.symptoms.slice(0, 3).map((sym, i) => (
                  <span
                    key={i}
                    className="rounded-xl bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    • {sym}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400">Owner: <strong className="text-slate-700 dark:text-slate-200">{r.ownerName}</strong></span>
              <span className="font-bold text-emerald-700 group-hover:translate-x-1 transition-transform flex items-center gap-1 dark:text-emerald-400">
                View Details <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Record Modal */}
      <AddMedicalRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddRecord={handleAddRecord}
      />
    </div>
  );
};
export default VeterinarianRecords;
