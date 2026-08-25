import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  Plus,
  Activity,
  Radio,
} from 'lucide-react';
import { INITIAL_TREATMENTS } from '@/data/veterinarianMockData';
import { AddTreatmentModal } from '@/components/veterinarian/AddTreatmentModal';
import { VetTreatment } from '@/types/veterinarian';

export const VeterinarianTreatments = () => {
  const navigate = useNavigate();
  const [treatments, setTreatments] = useState<VetTreatment[]>(INITIAL_TREATMENTS);
  const [activeTab, setActiveTab] = useState<'All' | 'Ongoing' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const filtered = treatments.filter((t) => {
    if (activeTab !== 'All' && t.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.petName.toLowerCase().includes(q) ||
        t.condition.toLowerCase().includes(q) ||
        t.treatmentName.toLowerCase().includes(q) ||
        t.breed.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddTreatment = (treatment: VetTreatment) => {
    setTreatments((prev) => [treatment, ...prev]);
  };

  const handleToggleComplete = (id: string) => {
    setTreatments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'Ongoing' ? 'Completed' : 'Ongoing' } : t))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/veterinarian" className="hover:text-emerald-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">Treatments & Monitoring</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            Active Clinical Treatments <Activity className="h-6 w-6 text-emerald-600" />
          </h1>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-[#1e6f42] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#165a34] shadow-md shadow-emerald-950/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" /> + Start Treatment Protocol
        </button>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['All', 'Ongoing', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-[#1e6f42] text-white shadow-md shadow-emerald-950/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search treatment, condition or pet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Treatments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={t.image}
                    alt={t.petName}
                    className="h-12 w-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h3
                      onClick={() => navigate('/veterinarian/patients/P-101')}
                      className="font-display text-base font-extrabold text-slate-900 dark:text-white hover:text-emerald-700 cursor-pointer"
                    >
                      {t.petName}
                    </h3>
                    <p className="text-xs text-slate-400">{t.species} • {t.breed} • {t.age}</p>
                  </div>
                </div>

                <span
                  className={`rounded-xl px-2.5 py-1 text-xs font-bold border ${
                    t.status === 'Ongoing'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Condition</span>
                  <p className="font-extrabold text-slate-800 dark:text-white">{t.condition}</p>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400 mt-1">{t.treatmentName}</p>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-xs px-1">
                  <strong>Notes:</strong> {t.progressNotes}
                </p>

                {t.collarMonitored && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl">
                    <Radio className="h-3.5 w-3.5 animate-pulse" />
                    <span>24x7 ESP32-C3 Vitals Streaming Active</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400">{t.startDate} ➔ {t.endDate}</span>
              <button
                onClick={() => handleToggleComplete(t.id)}
                className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
              >
                {t.status === 'Ongoing' ? 'Mark Completed ✓' : 'Reopen ↺'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <AddTreatmentModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddTreatment={handleAddTreatment}
      />
    </div>
  );
};
export default VeterinarianTreatments;
