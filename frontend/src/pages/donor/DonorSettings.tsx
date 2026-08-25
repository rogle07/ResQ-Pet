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
  CreditCard,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const DonorSettings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState('Rahul Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('rahul.donor@resqpet.org');
  const [pan, setPan] = useState('ABCPS1234F');
  const [address, setAddress] = useState('14/22 Gomti Nagar, Lucknow, UP 226010');
  const [emailReceipts, setEmailReceipts] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [monthlyPledge, setMonthlyPledge] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-xs">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/donor" className="hover:text-purple-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-purple-800 dark:text-purple-400">Settings</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Donor Profile & 80G Tax Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your PAN card details for instant tax exemption certificates, communication, and theme.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <span className="font-bold">Preferences and PAN details saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal & PAN Details (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-display text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" /> Donor Profile Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Email (For 80G Receipts)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Permanent Account Number (PAN) for 80G Tax Exemption
                </label>
                <input
                  type="text"
                  required
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono uppercase"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Mandatory under Section 80G to receive tax exemption credit directly into your AIS/ITR portal.
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Postal Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="font-display text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-600" /> Monthly Lifeline Subscription
            </h3>
            <label className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Active Monthly Pledge (₹500 / mo)</span>
                <span className="text-[10px] text-slate-500">Auto-debit on the 1st of every month via UPI Mandate.</span>
              </div>
              <input
                type="checkbox"
                checked={monthlyPledge}
                onChange={(e) => setMonthlyPledge(e.target.checked)}
                className="h-4 w-4 rounded text-purple-600"
              />
            </label>
          </div>
        </div>

        {/* Right Column: Alerts & Theme (1 col) */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-display text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="h-4 w-4 text-purple-600" /> Notifications & Updates
            </h3>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-slate-700 dark:text-slate-200">Email 80G Receipts</span>
              <input
                type="checkbox"
                checked={emailReceipts}
                onChange={(e) => setEmailReceipts(e.target.checked)}
                className="h-4 w-4 rounded text-purple-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-slate-700 dark:text-slate-200">WhatsApp Rescue Stories</span>
              <input
                type="checkbox"
                checked={whatsappUpdates}
                onChange={(e) => setWhatsappUpdates(e.target.checked)}
                className="h-4 w-4 rounded text-purple-600"
              />
            </label>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="font-display text-sm font-extrabold text-slate-900 dark:text-white">
              Interface Theme
            </h3>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-between w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              <span className="font-bold text-slate-700 dark:text-slate-200">
                Mode: {theme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
              </span>
              {theme === 'dark' ? <Moon className="h-4 w-4 text-purple-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
            </button>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-purple-700 py-3 text-xs font-black text-white hover:bg-purple-800 shadow-md shadow-purple-950/20 transition-all hover:scale-105"
          >
            <Save className="h-4 w-4" /> Save Profile Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
export default DonorSettings;
