import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  MapPin,
  ShieldCheck,
  Edit,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';

const FosterProfile = () => {
  const { user } = useAppSelector((s) => s.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || 'ResQPet Foster Guardian',
    email: user?.email || 'foster.care@resqpet.org',
    phone: user?.phone || '+91 98765 43210',
    address: 'Nainital Care Compound, Mall Road, Uttarakhand - 263001',
    capacity: 10,
    activeCare: 8,
    supportedAnimals: ['Dogs', 'Cats', 'Rabbits', 'Goats', 'Cows'],
    experienceYears: 4,
    facilities: ['Dedicated Quarantine Room', 'Outdoor Play Yard', 'Veterinary First Aid Kit', 'CCTV Monitoring'],
    bio: 'Dedicated animal caregiver providing temporary rehabilitation and compassionate fostering for rescued mountain animals and pets in transition.',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/foster-home" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">Profile</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
          Foster Home Profile
        </h1>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Foster home profile successfully updated!
        </div>
      )}

      {/* Profile Header Card */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#1e6f42] to-emerald-500 text-white font-extrabold text-3xl shadow-lg shadow-emerald-950/20">
              {profileData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {profileData.name}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-[#1e6f42] dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Foster Home
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" /> {profileData.address}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 rounded-xl bg-[#1e6f42] px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm"
          >
            {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        {/* Form / Details */}
        <form onSubmit={handleSave} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Foster Coordinator / Organization Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-800/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-800/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled={!isEditing}
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-800/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Maximum Animal Capacity
              </label>
              <input
                type="number"
                disabled={!isEditing}
                value={profileData.capacity}
                onChange={(e) => setProfileData({ ...profileData, capacity: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-800/40"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Location & Shelter Address
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-800/40"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                About the Foster Home & Care Policy
              </label>
              <textarea
                rows={3}
                disabled={!isEditing}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-800/40 resize-none"
              />
            </div>
          </div>

          {/* Supported Species Chips */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Supported Animal Types
            </h4>
            <div className="flex flex-wrap gap-2">
              {profileData.supportedAnimals.map((animal) => (
                <span
                  key={animal}
                  className="rounded-xl bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                >
                  {animal}
                </span>
              ))}
            </div>
          </div>

          {/* Facility Highlights */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Facility Features & Equipment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {profileData.facilities.map((fac) => (
                <div
                  key={fac}
                  className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800/60 dark:border-slate-700/60 dark:text-slate-300"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  {fac}
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FosterProfile;
