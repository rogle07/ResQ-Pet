import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Siren,
  AlertCircle,
  Phone,
  Radio,
  Plus,
} from 'lucide-react';
import { INITIAL_EMERGENCY_CASES } from '@/data/veterinarianMockData';
import { EmergencyIntakeModal } from '@/components/veterinarian/EmergencyIntakeModal';
import { VetEmergencyCase } from '@/types/veterinarian';

export const VeterinarianEmergency = () => {
  const [emergencies, setEmergencies] = useState<VetEmergencyCase[]>(INITIAL_EMERGENCY_CASES);
  const [isIntakeModalOpen, setIntakeModalOpen] = useState(false);

  const handleAddEmergency = (newCase: VetEmergencyCase) => {
    setEmergencies((prev) => [newCase, ...prev]);
  };

  const handleStatusChange = (id: string, newStatus: VetEmergencyCase['status']) => {
    setEmergencies((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/veterinarian" className="hover:text-emerald-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-red-700 dark:text-red-400">Emergency & Critical Triage</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-red-900 dark:text-red-300 flex items-center gap-2">
            🚨 Emergency Trauma & ICU Unit
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time critical intake, OT dispatch, and IoT cardiac / trauma threshold tracking
          </p>
        </div>

        <button
          onClick={() => setIntakeModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-md shadow-red-950/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" /> + Emergency Intake
        </button>
      </div>

      {/* Live Emergency Alert Banner */}
      <div className="rounded-3xl border border-red-500/30 bg-gradient-to-r from-red-950 via-rose-950 to-slate-950 p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/30 border border-red-400/40 text-red-400 animate-pulse shrink-0">
            <Siren className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display text-base font-black tracking-wide flex items-center gap-2">
              Trauma Triage Line Active (24x7)
            </h3>
            <p className="text-xs text-red-200/90 mt-0.5">
              Emergency surgical team and OT-1 are prepped for incoming casualty dispatch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-red-900/60 text-red-200 border border-red-700 px-3 py-1.5 rounded-xl">
            Active Traumas: {emergencies.length}
          </span>
        </div>
      </div>

      {/* Emergency Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {emergencies.map((emg) => (
          <div
            key={emg.id}
            className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/40 dark:bg-slate-900 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={emg.image}
                    alt={emg.petName}
                    className="h-14 w-14 rounded-2xl object-cover border-2 border-red-500 shadow-sm shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
                        {emg.petName}
                      </h3>
                      <span className="text-xs text-slate-400">({emg.species} • {emg.age})</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Rescuer: <strong className="text-slate-700 dark:text-slate-200">{emg.ownerName}</strong> • {emg.reportedAt}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-xl px-2.5 py-1 text-xs font-bold border ${
                    emg.urgency === 'Critical'
                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 animate-pulse'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                  }`}
                >
                  {emg.urgency}
                </span>
              </div>

              {/* Trauma Symptoms Box */}
              <div className="p-3.5 bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 text-xs">
                <span className="font-bold text-red-900 dark:text-red-300 block mb-0.5 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-red-600" /> Trauma Symptoms & Condition:
                </span>
                <p className="text-red-950 dark:text-red-200 leading-relaxed font-semibold">
                  {emg.symptoms}
                </p>
              </div>

              {/* IoT Collar Alert telemetry if available */}
              {emg.iotCollarAlert && (
                <div className="p-3 bg-slate-950 rounded-2xl text-white text-xs border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-mono text-[11px] text-emerald-400">
                    <span className="flex items-center gap-1"><Radio className="h-3 w-3 animate-pulse" /> IoT Shock & Impact Sensor</span>
                    <span>{emg.iotCollarAlert.traumaImpactG} G Impact</span>
                  </div>
                  <p className="text-[10px] text-slate-400">GPS: {emg.iotCollarAlert.lastGpsCoordinates}</p>
                </div>
              )}
            </div>

            {/* Current Care Status & Modifiers */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Unit:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{emg.status}</span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <a
                  href={`tel:${emg.ownerPhone}`}
                  className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Phone className="h-3 w-3 text-emerald-600" /> Call Rescuer
                </a>

                <select
                  value={emg.status}
                  onChange={(e) => handleStatusChange(emg.id, e.target.value as any)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Triage">Triage</option>
                  <option value="In Surgery">In Surgery (OT)</option>
                  <option value="ICU Care">ICU Care</option>
                  <option value="Stabilized">Stabilized (Ward)</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EmergencyIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIntakeModalOpen(false)}
        onAddEmergency={handleAddEmergency}
      />
    </div>
  );
};
export default VeterinarianEmergency;
