import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  CheckCircle,
  Save,
} from 'lucide-react';
import { VET_DOCTOR_INFO } from '@/data/veterinarianMockData';

export const VeterinarianProfile = () => {
  const [name, setName] = useState(VET_DOCTOR_INFO.name);
  const [qualifications, setQualifications] = useState(VET_DOCTOR_INFO.qualifications);
  const [license] = useState(VET_DOCTOR_INFO.licenseNumber);
  const [clinic, setClinic] = useState(VET_DOCTOR_INFO.clinicName);
  const [phone, setPhone] = useState(VET_DOCTOR_INFO.phone);
  const [email, setEmail] = useState(VET_DOCTOR_INFO.email);
  const [hours, setHours] = useState(VET_DOCTOR_INFO.workingHours);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/veterinarian" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">Doctor Profile</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
          Doctor Profile & Credentials
        </h1>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 pb-6 dark:border-slate-800">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-600 text-white font-display text-3xl font-black shadow-lg shadow-emerald-950/20">
              Dr.N
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{name}</h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">{qualifications}</p>
              <p className="text-xs text-slate-500 mt-1">Veterinary Council License: <strong className="font-mono">{license}</strong></p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Degrees & Specializations</label>
              <input
                type="text"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Clinic / Hospital Center</label>
              <input
                type="text"
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Clinical Operating Hours</label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Emergency Phone Hotline</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Doctor Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {saved ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Profile Updated!
              </span>
            ) : <span />}
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-2xl bg-[#1e6f42] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#165a34] shadow-md shadow-emerald-950/20"
            >
              <Save className="h-4 w-4" /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default VeterinarianProfile;
