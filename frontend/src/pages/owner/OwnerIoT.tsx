import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import {
  Cpu,
  MapPin,
  Thermometer,
  Activity,
  ShieldCheck,
  Bell,
  Zap,
  Clock,
  Info,
  ChevronRight,
  Wifi,
  Heart,
} from 'lucide-react';

const FEATURE_CARDS = [
  {
    icon: <MapPin className="h-6 w-6" />,
    title: 'GPS Location Tracking',
    desc: 'Real-time satellite positioning with interactive map and customizable geo-fence perimeter.',
    color: 'text-teal-600',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    status: 'Coming Soon',
    statusColor: 'bg-amber-100 text-amber-700',
  },
  {
    icon: <Thermometer className="h-6 w-6" />,
    title: 'Temperature Monitoring',
    desc: 'Continuous body temperature tracking with heatstroke and hypothermia alerts.',
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    status: 'Under Development',
    statusColor: 'bg-orange-100 text-orange-700',
  },
  {
    icon: <Activity className="h-6 w-6" />,
    title: 'Activity Monitoring',
    desc: 'Track daily exercise, rest patterns, and activity levels to keep your pet healthy.',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    status: 'Coming Soon',
    statusColor: 'bg-blue-100 text-blue-700',
  },
  {
    icon: <Cpu className="h-6 w-6" />,
    title: 'Motion Detection',
    desc: 'High-frequency accelerometer detects movement patterns and unusual behavior.',
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    status: 'Hardware Integration Pending',
    statusColor: 'bg-purple-100 text-purple-700',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Fall Detection',
    desc: 'Automatic fall detection alerts you immediately if your pet is in distress.',
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    status: 'Under Development',
    statusColor: 'bg-rose-100 text-rose-700',
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: 'Emergency Alerts',
    desc: 'Instant push notifications and SMS for geo-fence breaches and health anomalies.',
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/40',
    status: 'Coming Soon',
    statusColor: 'bg-red-100 text-red-700',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Pet Safety Monitoring',
    desc: 'Comprehensive safety dashboard combining all sensors for complete pet protection.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    status: 'Coming Soon',
    statusColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: 'Biometric Health Tracking',
    desc: 'Heart rate, SpO2 and vitals monitoring for continuous wellness insights.',
    color: 'text-pink-600',
    bg: 'bg-pink-50 dark:bg-pink-950/40',
    status: 'Hardware Integration Pending',
    statusColor: 'bg-pink-100 text-pink-700',
  },
];

const OwnerIoT = () => {
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Cpu className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              Wearable IoT
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-700 px-3 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Clock className="h-3 w-3" />
              Coming Soon
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Smart Monitoring for Your Pet — Hardware integration in development.
          </p>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-teal-200 dark:border-teal-800/60 bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-teal-950/40 dark:via-slate-900 dark:to-emerald-950/30 p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Text Side */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold">
              <Cpu className="h-3.5 w-3.5" />
              RESQPET SMART WEARABLE — UNDER DEVELOPMENT
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white leading-tight">
              ResQ Pet Smart Collar
              <span className="block text-teal-600 dark:text-teal-400">IoT Monitoring System</span>
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We are developing a purpose-built IoT wearable collar for your pet — featuring GPS tracking,
              health monitoring, emergency alerts, and real-time safety geo-fencing. This section will be
              fully functional once the hardware integration is complete.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
              <button
                onClick={() => setInfoModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm"
              >
                <Info className="h-4 w-4" />
                Explore ResQPet Wearable
              </button>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Wifi className="h-3.5 w-3.5" />
                Hardware integration pending
              </span>
            </div>
          </div>

          {/* Product Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition duration-700" />
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border border-teal-300/50 dark:border-teal-700/50 shadow-2xl bg-slate-900">
                <img
                  src="/resqpet-iot-collar.jpg"
                  alt="ResQ Pet Smart Collar IoT — Coming Soon"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent p-4">
                  <div className="text-white">
                    <p className="text-xs font-bold tracking-wider text-teal-300">RESQPET WEARABLE</p>
                    <p className="text-sm font-semibold">Smart Pet Collar</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/90 text-[10px] font-bold text-white">
                      COMING SOON
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Feature Cards ── */}
      <div>
        <div className="mb-4">
          <h4 className="font-display text-base font-semibold text-slate-800 dark:text-white">
            Planned Feature Preview
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            These features are under development. No real hardware data is displayed yet.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.title}
              className="card border border-dashed border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
            >
              <div className={`p-2.5 rounded-xl w-fit mb-3 ${card.bg}`}>
                <span className={card.color}>{card.icon}</span>
              </div>
              <h5 className="font-semibold text-sm text-slate-800 dark:text-white mb-1">{card.title}</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{card.desc}</p>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${card.statusColor}`}>
                  {card.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Dashboard Placeholder ── */}
      <div className="card border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <div className="py-12 text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-950/60 dark:to-emerald-950/60 flex items-center justify-center mx-auto">
            <Cpu className="h-10 w-10 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h4 className="font-display text-lg font-bold text-slate-700 dark:text-slate-200">
              Your Pet's Smart Monitoring Dashboard Will Appear Here
            </h4>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-md mx-auto">
              Once hardware integration is complete, this section will display live GPS location, 
              health vitals, activity data, and safety alerts for your pet in real time.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-400">
            {['GPS Map', 'Heart Rate', 'Temperature', 'Activity', 'Battery', 'Safe Zone'].map((item) => (
              <span key={item} className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 font-medium">
                {item} — Coming Soon
              </span>
            ))}
          </div>
          <button
            onClick={() => setInfoModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors"
          >
            Explore ResQPet Wearable
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Development Timeline ── */}
      <div className="card space-y-4">
        <h4 className="font-display text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          Development Roadmap
        </h4>
        <div className="space-y-3">
          {[
            { phase: 'Phase 1', title: 'UI/UX Design & Dashboard Framework', status: 'Completed', color: 'text-emerald-600 bg-emerald-100' },
            { phase: 'Phase 2', title: 'Hardware Prototyping (ESP32 + GPS + Sensors)', status: 'In Progress', color: 'text-amber-600 bg-amber-100' },
            { phase: 'Phase 3', title: 'Firmware Development & MQTT Integration', status: 'Planned', color: 'text-slate-600 bg-slate-100' },
            { phase: 'Phase 4', title: 'Field Testing & Calibration', status: 'Planned', color: 'text-slate-600 bg-slate-100' },
            { phase: 'Phase 5', title: 'Full Platform Launch with Live Telemetry', status: 'Planned', color: 'text-slate-600 bg-slate-100' },
          ].map((item) => (
            <div key={item.phase} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs font-bold text-slate-400 w-16 shrink-0">{item.phase}</span>
              <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{item.title}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.color}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Info Modal ── */}
      <Modal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        title="ResQPet Wearable IoT — Product Information"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800">
            <img
              src="/resqpet-iot-collar.jpg"
              alt="ResQPet IoT Collar"
              className="w-20 h-20 rounded-xl object-cover border border-teal-200"
            />
            <div>
              <p className="font-bold text-slate-800 dark:text-white">ResQ Pet Smart Collar</p>
              <p className="text-xs text-slate-500 mt-0.5">IoT Wearable for Pet Safety Monitoring</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[11px] font-bold">
                HARDWARE INTEGRATION PENDING
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-slate-800 dark:text-white">About This Product</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              The ResQPet Smart Collar is a purpose-built IoT wearable being developed specifically 
              for pet safety. It will integrate GPS tracking, biometric sensors, temperature monitoring, 
              fall detection, and geo-fence alerts into a single waterproof device.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              This dashboard section is a UI placeholder. Actual hardware integration, device 
              registration, sensor data streams, and real-time telemetry will be activated in a 
              future development phase.
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-300">
            <strong>Note:</strong> No real device purchase, device activation, GPS data, or sensor readings 
            are available at this time. This page is a feature preview only.
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setInfoModalOpen(false)}
              className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Got it
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OwnerIoT;
