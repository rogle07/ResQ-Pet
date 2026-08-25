import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  Phone,
  MapPin,
  Plus,
  Activity,
} from 'lucide-react';
import {
  INITIAL_PATIENTS,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_TREATMENTS,
  INITIAL_VACCINATIONS,
  INITIAL_PRESCRIPTIONS,
} from '@/data/veterinarianMockData';
import { IoTCollarLiveTelemetry } from '@/components/veterinarian/IoTCollarLiveTelemetry';
import { IoTCircuitSchematicModal } from '@/components/veterinarian/IoTCircuitSchematicModal';
import { AddMedicalRecordModal } from '@/components/veterinarian/AddMedicalRecordModal';
import { AddTreatmentModal } from '@/components/veterinarian/AddTreatmentModal';
import { PrescriptionModal } from '@/components/veterinarian/PrescriptionModal';
import { VetMedicalRecord, VetTreatment, VetPrescription } from '@/types/veterinarian';

export const VeterinarianPatientDetail = () => {
  const { id } = useParams<{ id: string }>();

  const patient = INITIAL_PATIENTS.find((p) => p.id === id) || INITIAL_PATIENTS[0];

  const [activeTab, setActiveTab] = useState<'Telemetry' | 'Records' | 'Treatments' | 'Vaccines'>('Telemetry');
  const [medicalRecords, setMedicalRecords] = useState<VetMedicalRecord[]>(INITIAL_MEDICAL_RECORDS);
  const [treatments, setTreatments] = useState<VetTreatment[]>(INITIAL_TREATMENTS);
  const [isSchematicOpen, setIsSchematicOpen] = useState(false);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isAddTreatmentOpen, setIsAddTreatmentOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<VetPrescription | null>(null);

  const handleAddRecord = (record: VetMedicalRecord) => {
    setMedicalRecords((prev) => [record, ...prev]);
  };

  const handleAddTreatment = (treatment: VetTreatment) => {
    setTreatments((prev) => [treatment, ...prev]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/veterinarian" className="hover:text-emerald-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/veterinarian/patients" className="hover:text-emerald-700">Patients</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">{patient.name}</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            {patient.name} • Clinical Profile
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddRecordOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-[#1e6f42] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#165a34] shadow-md transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4" /> Add Medical Record
          </button>
          <button
            onClick={() => setIsAddTreatmentOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <Activity className="h-4 w-4 text-emerald-600" /> Start Treatment
          </button>
        </div>
      </div>

      {/* Top Patient Profile Card */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={patient.image}
              alt={patient.name}
              className="h-20 w-20 rounded-3xl object-cover border-2 border-emerald-500/40 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-xl font-black text-slate-900 dark:text-white">
                  {patient.name}
                </h2>
                <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {patient.petCode}
                </span>
                <span className="rounded-xl bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                  {patient.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {patient.species} • {patient.breed} • {patient.gender} • {patient.age} • {patient.weightKg} kg
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                <span>Owner: <strong>{patient.ownerName}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-emerald-600" /> {patient.ownerPhone}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-emerald-600" /> {patient.ownerAddress}</span>
              </p>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-400">Microchip ID:</span>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
              {patient.microchipId || '985112003456789'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'Telemetry', label: '📡 IoT Smart Collar Telemetry' },
          { id: 'Records', label: '📋 Clinical Records' },
          { id: 'Treatments', label: '💊 Treatments & Prescriptions' },
          { id: 'Vaccines', label: '💉 Vaccination History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[#1e6f42] text-white shadow-md shadow-emerald-950/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: IoT Live Telemetry */}
      {activeTab === 'Telemetry' && patient.collar && (
        <IoTCollarLiveTelemetry
          collar={patient.collar}
          petName={patient.name}
          onOpenSchematicModal={() => setIsSchematicOpen(true)}
        />
      )}

      {/* Tab 2: Clinical Records */}
      {activeTab === 'Records' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-extrabold text-slate-800 dark:text-white">
              Medical Records ({medicalRecords.length})
            </h3>
            <button
              onClick={() => setIsAddRecordOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
            >
              + Add Record
            </button>
          </div>

          {medicalRecords.map((rec) => (
            <div
              key={rec.id}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">{rec.recordId}</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">{rec.diagnosis}</h4>
                  <p className="text-xs text-slate-400">Date: {rec.date} • Attending: {rec.attendingVet}</p>
                </div>
                <button
                  onClick={() => setSelectedPrescription(INITIAL_PRESCRIPTIONS[0])}
                  className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  View Rx
                </button>
              </div>

              {/* Symptoms & Treatment Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <span className="font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Symptoms:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.symptoms.map((s, idx) => (
                      <span key={idx} className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-600">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <span className="font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Treatment Plan:</span>
                  <div className="space-y-1">
                    {rec.treatmentPlan.map((t, idx) => (
                      <p key={idx} className="text-slate-600 dark:text-slate-300">• {t}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Medications */}
              <div>
                <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block mb-2">Prescribed Medicines</span>
                <div className="space-y-1.5">
                  {rec.medications.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                      <span className="font-bold text-slate-800 dark:text-white">{m.medicine} ({m.dosage})</span>
                      <span className="text-emerald-600 font-semibold">{m.duration} • {m.instructions}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Treatments */}
      {activeTab === 'Treatments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-extrabold text-slate-800 dark:text-white">
              Treatment Courses
            </h3>
            <button
              onClick={() => setIsAddTreatmentOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
            >
              + Start Treatment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treatments.map((t) => (
              <div
                key={t.id}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.condition}</span>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5">{t.treatmentName}</h4>
                  </div>
                  <span className="rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                    {t.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 p-2.5 rounded-xl dark:bg-slate-800/40">
                  {t.progressNotes}
                </p>
                <p className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Start: {t.startDate} ➔ End: {t.endDate}</span>
                  <span>{t.attendingVet}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Vaccines */}
      {activeTab === 'Vaccines' && (
        <div className="space-y-4">
          <h3 className="font-display text-base font-extrabold text-slate-800 dark:text-white">
            Vaccination & Immunization Ledger
          </h3>
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold uppercase text-[10px] text-slate-400">
                <tr>
                  <th className="p-4">Vaccine</th>
                  <th className="p-4">Dose</th>
                  <th className="p-4">Administered Date</th>
                  <th className="p-4">Next Due Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {INITIAL_VACCINATIONS.map((v) => (
                  <tr key={v.id}>
                    <td className="p-4 font-bold text-slate-800 dark:text-white">{v.vaccineName}</td>
                    <td className="p-4">{v.dose}</td>
                    <td className="p-4">{v.givenDate}</td>
                    <td className="p-4 font-bold text-emerald-700 dark:text-emerald-400">{v.nextDueDate}</td>
                    <td className="p-4">
                      <span className="rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <IoTCircuitSchematicModal
        isOpen={isSchematicOpen}
        onClose={() => setIsSchematicOpen(false)}
      />

      <AddMedicalRecordModal
        isOpen={isAddRecordOpen}
        onClose={() => setIsAddRecordOpen(false)}
        onAddRecord={handleAddRecord}
        defaultPetName={patient.name}
        defaultOwnerName={patient.ownerName}
      />

      <AddTreatmentModal
        isOpen={isAddTreatmentOpen}
        onClose={() => setIsAddTreatmentOpen(false)}
        onAddTreatment={handleAddTreatment}
      />

      <PrescriptionModal
        prescription={selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      />
    </div>
  );
};
export default VeterinarianPatientDetail;
