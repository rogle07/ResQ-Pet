import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Radio,
  Thermometer,
  Activity,
  MapPin,
  BatteryCharging,
  Wifi,
  Search,
  Eye,
  Zap,
} from 'lucide-react';
import { INITIAL_PATIENTS } from '@/data/veterinarianMockData';
import { VetPatient } from '@/types/veterinarian';
import { IoTCircuitSchematicModal } from '@/components/veterinarian/IoTCircuitSchematicModal';

export const VeterinarianTelemetry = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<VetPatient[]>(INITIAL_PATIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Fever Alerts' | 'High Activity' | 'Hospitalized'>('All');
  const [isSchematicOpen, setSchematicOpen] = useState(false);

  // Real-time telemetry ticker for all patients
  useEffect(() => {
    const timer = setInterval(() => {
      setPatients((prev) =>
        prev.map((p) => {
          if (!p.collar) return p;
          const tempDelta = (Math.random() - 0.5) * 0.06;
          const newTemp = Number((p.collar.temperature.currentC + tempDelta).toFixed(2));
          const newStatus =
            newTemp > 39.5 ? 'Fever' : newTemp < 37.5 ? 'Hypothermia' : 'Normal';

          return {
            ...p,
            collar: {
              ...p.collar,
              temperature: {
                ...p.collar.temperature,
                currentC: newTemp,
                status: newStatus,
              },
              motion: {
                ...p.collar.motion,
                stepCount: p.collar.motion.stepCount + (p.collar.motion.activityLevel === 'Active' ? 1 : 0),
              },
            },
          };
        })
      );
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  const filteredPatients = patients.filter((p) => {
    if (!p.collar) return false;
    if (filterStatus === 'Fever Alerts' && p.collar.temperature.status !== 'Fever') return false;
    if (filterStatus === 'High Activity' && p.collar.motion.activityLevel !== 'Active' && p.collar.motion.activityLevel !== 'Tremor / Spike') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.collar.deviceId.toLowerCase().includes(q) || p.ownerName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/veterinarian" className="hover:text-emerald-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">IoT Telemetry Central</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            IoT Smart Collar Telemetry Matrix <Radio className="h-6 w-6 text-emerald-600 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time patient vitals streaming via ESP32-C3 SuperMini collars
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSchematicOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl border border-emerald-600 bg-emerald-50/50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 transition-all"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" /> Circuit Schematic
          </button>
        </div>
      </div>

      {/* Filter and View Mode Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter telemetry by pet name, collar ID (ESP32C3-...) or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(['All', 'Fever Alerts', 'High Activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab as any)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                filterStatus === tab
                  ? 'bg-[#1e6f42] text-white shadow-sm'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Patient Telemetry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => {
          const collar = patient.collar!;
          const isFever = collar.temperature.status === 'Fever';

          return (
            <div
              key={patient.id}
              className={`rounded-3xl border bg-white p-5 shadow-sm transition-all hover:shadow-lg dark:bg-slate-900 flex flex-col justify-between space-y-4 ${
                isFever
                  ? 'border-red-300 dark:border-red-900/60 shadow-red-500/5 ring-1 ring-red-500/20'
                  : 'border-slate-100 dark:border-slate-800'
              }`}
            >
              {/* Pet Info & Collar ID */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={patient.image}
                      alt={patient.name}
                      className="h-12 w-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                          {patient.name}
                        </h3>
                        <span className="text-xs text-slate-400">({patient.species})</span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                        {collar.deviceId}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`rounded-xl px-2.5 py-1 text-[11px] font-bold border ${
                      isFever
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 animate-pulse'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    {collar.temperature.status === 'Fever' ? '🚨 Fever Alert' : '● Live Stream'}
                  </span>
                </div>

                {/* Primary Vitals Telemetry Box */}
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {/* Temp Block */}
                  <div className={`p-3 rounded-2xl border text-xs ${
                    isFever
                      ? 'bg-red-50/50 border-red-200 dark:bg-red-950/30 dark:border-red-900/40'
                      : 'bg-slate-50 border-slate-100 dark:bg-slate-800/40 dark:border-slate-800'
                  }`}>
                    <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-amber-500" /> DS18B20 Temp
                    </span>
                    <p className="font-display text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      {collar.temperature.currentC.toFixed(1)} °C
                    </p>
                    <span className="text-[10px] text-slate-500">Normal (38.0–39.2°C)</span>
                  </div>

                  {/* Motion Block */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Activity className="h-3 w-3 text-blue-500" /> MPU6050 IMU
                    </span>
                    <p className="font-display text-base font-black text-slate-900 dark:text-white mt-0.5 truncate">
                      {collar.motion.activityLevel}
                    </p>
                    <span className="text-[10px] text-slate-500">{collar.motion.stepCount.toLocaleString()} Steps</span>
                  </div>
                </div>

                {/* Hardware Strip */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/50 p-2.5 rounded-xl dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <BatteryCharging className="h-3.5 w-3.5 text-emerald-500" /> {collar.batteryPercent}% ({collar.batteryVoltage}V)
                  </span>
                  <span className="flex items-center gap-1">
                    <Wifi className="h-3.5 w-3.5 text-blue-500" /> {collar.wifiRssi} dBm
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-purple-500" /> {collar.gps.satellites} Sats
                  </span>
                </div>
              </div>

              {/* Bottom Quick Jump Action */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400 truncate max-w-[150px]">Owner: {patient.ownerName}</span>
                <button
                  onClick={() => navigate(`/veterinarian/patients/${patient.id}`)}
                  className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                >
                  <Eye className="h-3.5 w-3.5" /> Full Telemetry ➔
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <IoTCircuitSchematicModal
        isOpen={isSchematicOpen}
        onClose={() => setSchematicOpen(false)}
      />
    </div>
  );
};
export default VeterinarianTelemetry;
