import React, { useState } from 'react';
import { X, Calendar, Clock, PawPrint, User, CheckCircle } from 'lucide-react';
import { VetAppointment, AnimalSpecies } from '@/types/veterinarian';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAppointment: (appointment: VetAppointment) => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  onAddAppointment,
}) => {
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<AnimalSpecies>('Dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('2Y');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [date, setDate] = useState('2026-05-20');
  const [time, setTime] = useState('10:00 AM');
  const [purpose, setPurpose] = useState('General Checkup');
  const [badgeType, setBadgeType] = useState<VetAppointment['badgeType']>('Checkup');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName || !ownerName || !ownerPhone) return;

    const newApt: VetAppointment = {
      id: `APT-${Date.now()}`,
      time,
      date,
      petId: `P-${Date.now()}`,
      petName,
      species,
      breed: breed || (species === 'Dog' ? 'Labrador Mix' : species === 'Cat' ? 'Indie' : 'Local Breed'),
      age,
      gender,
      image: species === 'Dog' ? '/animal-dog.jpg' : species === 'Cat' ? '/animal-cat.jpg' : species === 'Goat' ? '/animal-goat.jpg' : species === 'Cow' ? '/animal-cow.jpg' : '/animal-rabbit.jpg',
      ownerName,
      ownerPhone,
      purpose,
      badgeType,
      status: 'Scheduled',
      notes,
    };

    onAddAppointment(newApt);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white px-6 py-4 dark:border-slate-800 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e6f42] text-white shadow-sm">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Schedule New Appointment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add patient visit to Dr. Neeraj Sharma's calendar</p>
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
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">Appointment Scheduled!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {petName} has been booked for {date} at {time}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            {/* Pet Info */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1.5 flex items-center gap-1.5">
                <PawPrint className="h-3.5 w-3.5 text-emerald-600" /> Pet Details *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Pet Name (e.g. Bruno)"
                  required
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value as AnimalSpecies)}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Goat">Goat</option>
                  <option value="Cow">Cow</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Bird">Bird</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Breed (e.g. Labrador)"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Age</label>
                <input
                  type="text"
                  placeholder="e.g. 2 Years"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="Male">Male ♂️</option>
                  <option value="Female">Female ♀️</option>
                </select>
              </div>
            </div>

            {/* Owner Info */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-600" /> Owner Details *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Owner Name (e.g. Ravi Sharma)"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (e.g. 9876543210)"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" /> Time Slot
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                  <option value="05:30 PM">05:30 PM</option>
                  <option value="06:30 PM">06:30 PM</option>
                </select>
              </div>
            </div>

            {/* Purpose & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Purpose / Chief Complaint</label>
                <input
                  type="text"
                  placeholder="e.g. General Checkup, Leg Injury"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Category</label>
                <select
                  value={badgeType}
                  onChange={(e) => setBadgeType(e.target.value as VetAppointment['badgeType'])}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="Checkup">General Checkup</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Vaccination">Vaccination</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Surgery">Surgery Consultation</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Clinical Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="Any special remarks, prior conditions or owner notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Footer Buttons */}
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
                + Book Appointment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
