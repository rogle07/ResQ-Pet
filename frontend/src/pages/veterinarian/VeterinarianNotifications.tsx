import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Bell,
  AlertCircle,
  Radio,
  Calendar,
  Trash2,
} from 'lucide-react';

interface ClinicalNotification {
  id: string;
  type: 'critical' | 'telemetry' | 'appointment' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFS: ClinicalNotification[] = [
  {
    id: 'n-1',
    type: 'critical',
    title: '🚨 High Fever Alert — Lucy (Cat • 1Y)',
    message: 'DS18B20 1-Wire probe logged 39.8°C (Threshold > 39.5°C). MPU6050 detected tremor movements in ICU Ward.',
    time: '10 mins ago',
    read: false,
  },
  {
    id: 'n-2',
    type: 'appointment',
    title: 'Upcoming Visit — Bruno (Dog • 2Y)',
    message: 'Checkup appointment scheduled for 10:00 AM today with Ravi Sharma.',
    time: '45 mins ago',
    read: false,
  },
  {
    id: 'n-3',
    type: 'telemetry',
    title: 'Smart Collar Synchronized — ESP32C3-COL-0023',
    message: 'Collar battery charged to 88%. Wi-Fi RSSI optimal at -56 dBm.',
    time: '2 hours ago',
    read: true,
  },
  {
    id: 'n-4',
    type: 'system',
    title: 'Lab Report Completed — Skin Scraping Culture',
    message: 'Pathology findings uploaded for Bruno. No Demodex mites present.',
    time: 'Yesterday',
    read: true,
  },
];

export const VeterinarianNotifications = () => {
  const [notifs, setNotifs] = useState<ClinicalNotification[]>(INITIAL_NOTIFS);

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifs([]);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/veterinarian" className="hover:text-emerald-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">Notifications</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            Clinical Alerts & Notifications <Bell className="h-6 w-6 text-emerald-600" />
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            Mark All Read
          </button>
          <button
            onClick={clearAll}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-slate-800 dark:bg-slate-900"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notifs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-3xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-semibold text-xs">
            No active clinical notifications.
          </div>
        ) : (
          notifs.map((n) => (
            <div
              key={n.id}
              className={`rounded-3xl border p-5 transition-all ${
                !n.read
                  ? 'bg-emerald-50/40 border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-900/40'
                  : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                      n.type === 'critical'
                        ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                        : n.type === 'telemetry'
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                    }`}
                  >
                    {n.type === 'critical' ? (
                      <AlertCircle className="h-5 w-5 animate-pulse" />
                    ) : n.type === 'telemetry' ? (
                      <Radio className="h-5 w-5" />
                    ) : (
                      <Calendar className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{n.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-semibold mt-2 block">{n.time}</span>
                  </div>
                </div>

                {!n.read && (
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default VeterinarianNotifications;
