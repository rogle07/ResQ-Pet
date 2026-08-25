import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  Printer,
  Eye,
  Stethoscope,
} from 'lucide-react';
import { INITIAL_PRESCRIPTIONS } from '@/data/veterinarianMockData';
import { PrescriptionModal } from '@/components/veterinarian/PrescriptionModal';
import { VetPrescription } from '@/types/veterinarian';

export const VeterinarianPrescriptions = () => {
  const [prescriptions] = useState<VetPrescription[]>(INITIAL_PRESCRIPTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRx, setSelectedRx] = useState<VetPrescription | null>(null);

  const filtered = prescriptions.filter((rx) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rx.prescriptionNumber.toLowerCase().includes(q) ||
        rx.petName.toLowerCase().includes(q) ||
        rx.ownerName.toLowerCase().includes(q) ||
        rx.diagnosis.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/veterinarian" className="hover:text-emerald-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">Digital Prescriptions</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            Digital Prescriptions (Rx) <Stethoscope className="h-6 w-6 text-emerald-600" />
          </h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Rx number (RX-...), pet name, owner, or diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((rx) => (
          <div
            key={rx.id}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    {rx.prescriptionNumber}
                  </span>
                  <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    {rx.petName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Owner: <strong className="text-slate-700 dark:text-slate-200">{rx.ownerName}</strong> • Date: {rx.date}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedRx(rx)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Rx
                </button>
              </div>

              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-xs">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">Diagnosis:</span>
                <p className="text-emerald-950 dark:text-emerald-200 font-semibold">{rx.diagnosis}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Prescribed Medicines ({rx.medications.length})</span>
                <div className="space-y-1">
                  {rx.medications.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                      <strong className="text-slate-800 dark:text-white">{m.medicine} ({m.dosage})</strong>
                      <span className="text-emerald-600 font-semibold">{m.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400">Attending: {rx.doctorName}</span>
              <button
                onClick={() => setSelectedRx(rx)}
                className="font-bold text-emerald-700 hover:underline dark:text-emerald-400 flex items-center gap-1"
              >
                <Eye className="h-3.5 w-3.5" /> Preview Digital Rx
              </button>
            </div>
          </div>
        ))}
      </div>

      <PrescriptionModal
        prescription={selectedRx}
        onClose={() => setSelectedRx(null)}
      />
    </div>
  );
};
export default VeterinarianPrescriptions;
