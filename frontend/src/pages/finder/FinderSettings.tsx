import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  User,
  Bell,
  CheckCircle,
  Save,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const FinderSettings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState('Rahul Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('rahul.finder@resqpet.org');
  const [city, setCity] = useState('Lucknow, Uttar Pradesh');
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [autoLocation, setAutoLocation] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 font-sans max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/finder" className="hover:text-purple-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-purple-800 dark:text-purple-400">Settings</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Finder Account & Privacy Settings ⚙️
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your contact credentials, notification frequency, and GPS geo-tagging preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-display text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-purple-600" /> Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Primary City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Notifications & Preferences */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-display text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-purple-600" /> Notifications & Geo-Tagging
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">SMS Rescue Dispatch Alerts</span>
                <span className="text-slate-400 text-[11px]">Receive instant SMS when the ambulance is 5 minutes from your reported spot.</span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">WhatsApp Live Status Reports</span>
                <span className="text-slate-400 text-[11px]">Get animal recovery photos and clinical treatment updates on WhatsApp.</span>
              </div>
              <input
                type="checkbox"
                checked={whatsappUpdates}
                onChange={(e) => setWhatsappUpdates(e.target.checked)}
                className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Auto GPS Geo-Tagging</span>
                <span className="text-slate-400 text-[11px]">Automatically attach high-precision GPS coordinates when taking photos.</span>
              </div>
              <input
                type="checkbox"
                checked={autoLocation}
                onChange={(e) => setAutoLocation(e.target.checked)}
                className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
              />
            </label>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Interface Theme</h3>
            <p className="text-slate-400 text-[11px]">Toggle between Light Mode and Dark Mode.</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
            <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
          </button>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle className="h-4 w-4" /> Preferences saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto flex items-center gap-2 rounded-2xl bg-purple-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-purple-800 shadow-md shadow-purple-950/20 transition-all hover:scale-105"
          >
            <Save className="h-4 w-4" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
export default FinderSettings;
