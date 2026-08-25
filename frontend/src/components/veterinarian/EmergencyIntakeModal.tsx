import React, { useState } from 'react';
import { X, AlertCircle, Siren, CheckCircle } from 'lucide-react';
import { VetEmergencyCase } from '@/types/veterinarian';

interface EmergencyIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmergency: (emergency: VetEmergencyCase) => void;
}

export const EmergencyIntakeModal: React.FC<EmergencyIntakeModalProps> = ({
  isOpen,
  onClose,
  onAddEmergency,
}) => {
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<'Dog' | 'Cat' | 'Cow' | 'Goat' | 'Rabbit' | 'Other'>('Dog');
  const [age, setAge] = useState('2 Years');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [urgency, setUrgency] = useState<'Critical' | 'Severe' | 'Moderate'>('Critical');
  const [status, setStatus] = useState<'Triage' | 'In Surgery' | 'ICU Care' | 'Stabilized'>('Triage');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName || !symptoms) return;

    const newCase: VetEmergencyCase = {
      id: `EMG-${Date.now()}`,
      petName,
      species,
      age,
      image: species === 'Dog' ? '/animal-dog.jpg' : species === 'Cat' ? '/animal-cat.jpg' : species === 'Cow' ? '/animal-cow.jpg' : '/animal-goat.jpg',
      ownerName: ownerName || 'Emergency Caller',
      ownerPhone: ownerPhone || '+91 9695609898',
      reportedAt: 'Just now',
      symptoms,
      urgency,
      status,
    };

    onAddEmergency(newCase);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-red-200 dark:border-red-900/40 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-100 bg-gradient-to-r from-red-50 via-rose-50 to-white px-6 py-4 dark:border-red-900/40 dark:from-red-950/60 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm animate-pulse">
              <Siren className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-red-900 dark:text-red-300">🚨 Emergency Triage Intake</h3>
              <p className="text-xs text-red-700/80 dark:text-red-400">Immediate critical care patient registration</p>
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <CheckCircle className="h-9 w-9" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">Emergency Case Registered!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              OT and ICU alert triggered for {petName}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rocky"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Species</label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value as 'Dog' | 'Cat' | 'Cow' | 'Goat' | 'Rabbit' | 'Other')}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-red-600"
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Cow">Cow</option>
                  <option value="Goat">Goat</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Estimated Age</label>
                <input
                  type="text"
                  placeholder="e.g. 3 Years"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-red-700 dark:text-red-400 block mb-1 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Critical Symptoms & Trauma Description *
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Hit-and-run vehicular trauma, severe left femur fracture with bleeding..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full rounded-xl border border-red-200 bg-red-50/20 p-2.5 dark:border-red-900/40 dark:bg-red-950/20 dark:text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Triage Urgency</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as 'Critical' | 'Severe' | 'Moderate')}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-red-600"
                >
                  <option value="Critical">🔴 Critical (Immediate ICU/OT)</option>
                  <option value="Severe">🟠 Severe (Within 15 mins)</option>
                  <option value="Moderate">🟡 Moderate (Within 1 hour)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Initial Location</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Triage' | 'In Surgery' | 'ICU Care' | 'Stabilized')}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-red-600"
                >
                  <option value="Triage">Emergency Triage Room</option>
                  <option value="In Surgery">Operation Theater (OT)</option>
                  <option value="ICU Care">ICU Intensive Care</option>
                  <option value="Stabilized">Observation Ward</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Owner / Rescuer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Manish Pandey"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876512345"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-md shadow-red-950/20 transition-all hover:scale-105"
              >
                🚨 Admit Emergency Patient
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
