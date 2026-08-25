import React, { useState } from 'react';
import { X, Activity, CheckCircle } from 'lucide-react';
import { VetTreatment } from '@/types/veterinarian';

interface AddTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTreatment: (treatment: VetTreatment) => void;
}

export const AddTreatmentModal: React.FC<AddTreatmentModalProps> = ({
  isOpen,
  onClose,
  onAddTreatment,
}) => {
  const [petName, setPetName] = useState('Bruno');
  const [breed, setBreed] = useState('Labrador');
  const [age, setAge] = useState('2Y');
  const [condition, setCondition] = useState('Skin Infection');
  const [treatmentName, setTreatmentName] = useState('Antibiotic Course & Medicated Bath');
  const [startDate, setStartDate] = useState('2026-05-20');
  const [endDate, setEndDate] = useState('2026-05-27');
  const [status, setStatus] = useState<'Ongoing' | 'Completed'>('Ongoing');
  const [progressNotes, setProgressNotes] = useState('Initial therapy started. Pet responding favorably.');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName || !condition) return;

    const newTreatment: VetTreatment = {
      id: `TR-${Date.now()}`,
      petId: `P-${Date.now()}`,
      petName,
      species: 'Dog',
      breed,
      age,
      image: '/animal-dog.jpg',
      condition,
      treatmentName,
      startDate: new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      endDate: new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status,
      attendingVet: 'Dr. Neeraj Sharma',
      progressNotes,
    };

    onAddTreatment(newTreatment);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white px-6 py-4 dark:border-slate-800 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e6f42] text-white shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Start New Treatment Course</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track recovery progress and medication milestones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle className="h-9 w-9" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">Treatment Course Logged!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Treatment for {petName} has been recorded into the treatment schedule.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Pet Name *</label>
                <input
                  type="text"
                  required
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Breed</label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Age</label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Condition / Ailment *</label>
              <input
                type="text"
                required
                placeholder="e.g. Skin Infection, Wound Care, Fever"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Treatment Protocol & Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Antibiotic Course, Daily Dressing, Deworming"
                value={treatmentName}
                onChange={(e) => setTreatmentName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Target End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Ongoing' | 'Completed')}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="Ongoing">Ongoing (Under Treatment)</option>
                  <option value="Completed">Completed (Recovered)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Attending Vet</label>
                <input
                  type="text"
                  disabled
                  value="Dr. Neeraj Sharma"
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Progress Notes</label>
              <textarea
                rows={2}
                value={progressNotes}
                onChange={(e) => setProgressNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
              />
            </div>

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
                + Add Treatment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
