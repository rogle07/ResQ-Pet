import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Moon,
  Sun,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const FosterSettings = () => {
  const { theme, toggleTheme } = useTheme();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [settings, setSettings] = useState({
    acceptDogs: true,
    acceptCats: true,
    acceptRabbits: true,
    acceptGoats: true,
    acceptCows: false,
    autoAcceptEmergency: true,
    emailNotifications: true,
    smsAlerts: true,
    chatPushAlerts: true,
    maxStayDays: 45,
    quarantineRequired: true,
    vetContactName: 'Dr. A. K. Mehta (Nainital Pet Clinic)',
    vetPhone: '+91 94120 55443',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">Settings</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
          Foster Home Settings
        </h1>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Foster Intake Preferences */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
            Animal Acceptance & Intake Criteria
          </h3>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Select which species you can accommodate:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'acceptDogs', label: 'Dogs & Puppies', icon: '🐶' },
                { key: 'acceptCats', label: 'Cats & Kittens', icon: '🐱' },
                { key: 'acceptRabbits', label: 'Rabbits & Small Animals', icon: '🐰' },
                { key: 'acceptGoats', label: 'Goats & Farm Pets', icon: '🐐' },
                { key: 'acceptCows', label: 'Cows / Calves (Sanctuary)', icon: '🐮' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 cursor-pointer hover:border-emerald-500 dark:border-slate-700 dark:hover:border-emerald-500"
                >
                  <input
                    type="checkbox"
                    checked={(settings as any)[item.key]}
                    onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {item.icon} {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Maximum Foster Duration (Days)
              </label>
              <input
                type="number"
                value={settings.maxStayDays}
                onChange={(e) => setSettings({ ...settings, maxStayDays: parseInt(e.target.value) || 30 })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Emergency Medical Auto-Acceptance
              </label>
              <select
                value={settings.autoAcceptEmergency ? 'yes' : 'no'}
                onChange={(e) => setSettings({ ...settings, autoAcceptEmergency: e.target.value === 'yes' })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="yes">Enabled (Priority for critical rescue cases)</option>
                <option value="no">Disabled (Manual review always)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Emergency Vet Contact */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
            Emergency Veterinary Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                On-Call Vet / Clinic Name
              </label>
              <input
                type="text"
                value={settings.vetContactName}
                onChange={(e) => setSettings({ ...settings, vetContactName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Vet Emergency Phone
              </label>
              <input
                type="text"
                value={settings.vetPhone}
                onChange={(e) => setSettings({ ...settings, vetPhone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Alert & Notification Settings */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
            Alert & Messaging Notifications
          </h3>
          <div className="space-y-3">
            {[
              { key: 'emailNotifications', label: 'Email Notifications on New Foster Applications', desc: 'Receive instant email alert with requester details' },
              { key: 'smsAlerts', label: 'SMS Alerts for Urgent Medical Rescues', desc: 'Direct phone message for high priority cases' },
              { key: 'chatPushAlerts', label: 'In-App Direct Chat Notifications', desc: 'Sound and popup notifications for requester messages' },
            ].map((pref) => (
              <label
                key={pref.key}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{pref.label}</p>
                  <p className="text-[11px] text-slate-400">{pref.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={(settings as any)[pref.key]}
                  onChange={(e) => setSettings({ ...settings, [pref.key]: e.target.checked })}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Appearance Mode */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
              Interface Theme Mode
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Currently using {theme === 'dark' ? 'Dark' : 'Light'} theme</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[#1e6f42] py-4 text-sm font-extrabold text-white shadow-lg shadow-emerald-950/20 hover:bg-emerald-800 transition-all hover:scale-[1.005]"
        >
          <Save className="h-4 w-4" /> Save Foster Home Configuration
        </button>
      </form>
    </div>
  );
};

export default FosterSettings;
