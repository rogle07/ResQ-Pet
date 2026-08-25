import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle, Stethoscope } from 'lucide-react';
import { VetMedicalRecord, MedicationItem } from '@/types/veterinarian';

interface AddMedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (record: VetMedicalRecord) => void;
  defaultPetName?: string;
  defaultOwnerName?: string;
}

export const AddMedicalRecordModal: React.FC<AddMedicalRecordModalProps> = ({
  isOpen,
  onClose,
  onAddRecord,
  defaultPetName = 'Bruno',
  defaultOwnerName = 'Ravi Sharma',
}) => {
  const [petName, setPetName] = useState(defaultPetName);
  const [ownerName, setOwnerName] = useState(defaultOwnerName);
  const [ownerPhone, setOwnerPhone] = useState('9876543210');
  const [diagnosis, setDiagnosis] = useState('Skin infection with mild allergies.');
  const [symptomsInput, setSymptomsInput] = useState('Itching, Redness on skin, Hair fall, Loss of appetite');
  const [treatmentPlanInput, setTreatmentPlanInput] = useState('Antibiotic tablets for 5 days., Anti-fungal shampoo twice a week.');
  const [medications, setMedications] = useState<MedicationItem[]>([
    { id: '1', medicine: 'Cefpodoxime', dosage: '200 mg', duration: '5 Days', instructions: 'Once a day after food' },
    { id: '2', medicine: 'Ketoconazole Shampoo', dosage: '—', duration: '2 Weeks', instructions: 'Use twice a week' },
  ]);
  const [notes, setNotes] = useState('Keep the pet clean and dry. Avoid dusty areas and street food.');
  const [nextAppointmentDate, setNextAppointmentDate] = useState('2026-05-25');
  const [nextAppointmentTime] = useState('11:00 AM');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleAddMedicationRow = () => {
    setMedications([
      ...medications,
      { id: String(Date.now()), medicine: '', dosage: '', duration: '', instructions: '' },
    ]);
  };

  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id));
  };

  const handleMedChange = (id: string, field: keyof MedicationItem, val: string) => {
    setMedications(medications.map((m) => (m.id === id ? { ...m, [field]: val } : m)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName || !diagnosis) return;

    const recordId = `MR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: VetMedicalRecord = {
      id: `MR-${Date.now()}`,
      recordId,
      petId: `P-${Date.now()}`,
      petName,
      petCode: `RPET000${Math.floor(10 + Math.random() * 90)}`,
      species: 'Dog',
      breed: 'Labrador',
      age: '2 Years',
      gender: 'Male',
      image: '/animal-dog.jpg',
      ownerName,
      ownerPhone,
      ownerEmail: 'ravi@gmail.com',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      attendingVet: 'Dr. Neeraj Sharma',
      diagnosis,
      symptoms: symptomsInput.split(',').map((s) => s.trim()).filter(Boolean),
      treatmentPlan: treatmentPlanInput.split(',').map((t) => t.trim()).filter(Boolean),
      medications: medications.filter((m) => m.medicine.trim()),
      notes,
      attachments: [
        { name: 'skin_report1.jpg', size: '1.2 MB', type: 'image', url: '/animal-dog.jpg' },
        { name: 'lab_report.pdf', size: '420 KB', type: 'pdf', url: '#' },
      ],
      nextAppointmentDate,
      nextAppointmentTime,
      emergencyContact: '+91 9695609898',
    };

    onAddRecord(newRecord);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white px-6 py-4 dark:border-slate-800 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e6f42] text-white shadow-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Add Medical Record & Prescription</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dr. Neeraj Sharma • Clinical Documentation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        {submitted ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle className="h-9 w-9" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">Medical Record Saved!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record created for {petName}. Prescription and diagnosis logged.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            {/* Patient & Owner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Owner Name *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Owner Contact Phone</label>
                <input
                  type="tel"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Clinical Diagnosis *</label>
              <input
                type="text"
                required
                placeholder="e.g. Skin infection with mild allergies."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Symptoms & Treatment Plan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                  Symptoms (comma separated)
                </label>
                <textarea
                  rows={2}
                  placeholder="Itching, Redness on skin, Hair fall..."
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                  Treatment Plan (comma separated)
                </label>
                <textarea
                  rows={2}
                  placeholder="Antibiotic tablets for 5 days, Anti-fungal shampoo..."
                  value={treatmentPlanInput}
                  onChange={(e) => setTreatmentPlanInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Medications Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-slate-700 dark:text-slate-200">Prescribed Medications</label>
                <button
                  type="button"
                  onClick={handleAddMedicationRow}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add Medicine
                </button>
              </div>
              <div className="space-y-2">
                {medications.map((med) => (
                  <div key={med.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-xl dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Medicine name"
                        value={med.medicine}
                        onChange={(e) => handleMedChange(med.id, 'medicine', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) => handleMedChange(med.id, 'dosage', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) => handleMedChange(med.id, 'duration', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Instructions"
                        value={med.instructions}
                        onChange={(e) => handleMedChange(med.id, 'instructions', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(med.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes & Follow-up */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Special Care Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Keep clean and dry. Avoid street food."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={nextAppointmentDate}
                  onChange={(e) => setNextAppointmentDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#1e6f42] px-5 py-2 text-xs font-bold text-white hover:bg-[#165a34] shadow-md shadow-emerald-950/20 transition-all hover:scale-105"
              >
                Save Medical Record
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
