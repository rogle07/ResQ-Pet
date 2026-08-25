import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const VeterinarianSettings = () => {
  const { theme, toggleTheme } = useTheme();
  const [onCallEmergency, setOnCallEmergency] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [consultationFee, setConsultationFee] = useState('₹500');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/veterinarian" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">Settings</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
          Clinical & System Settings
        </h1>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Practice Configuration */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider">
              Practice Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Standard Consultation Fee</label>
                <input
                  type="text"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Appointment Slot Duration</label>
                <select className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                </select>
              </div>
            </div>

            {/* Toggle Emergency On-Call */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">🚨 24x7 Emergency On-Call Duty</p>
                <p className="text-slate-500 text-[11px]">Enable receiving critical trauma dispatch notifications anytime</p>
              </div>
              <button
                type="button"
                onClick={() => setOnCallEmergency(!onCallEmergency)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  onCallEmergency ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    onCallEmergency ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Toggle SMS Alerts */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Instant SMS & WhatsApp Alerts</p>
                <p className="text-slate-500 text-[11px]">Notify pet owners automatically when prescriptions or lab reports are ready</p>
              </div>
              <button
                type="button"
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  smsAlerts ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    smsAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Appearance & Theme</p>
                <p className="text-slate-500 text-[11px]">Current Mode: <strong className="capitalize text-emerald-700 dark:text-emerald-400">{theme} Mode</strong></p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
                <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {saved ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">✓ Settings Saved!</span>
            ) : <span />}
            <button
              type="submit"
              className="rounded-2xl bg-[#1e6f42] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#165a34] shadow-md shadow-emerald-950/20"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default VeterinarianSettings;
