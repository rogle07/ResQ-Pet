import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Activity,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  Siren,
  PieChart as PieIcon,
  Radio,
  Cpu,
  Zap,
  Thermometer,
  BatteryCharging,
} from 'lucide-react';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_EMERGENCY_CASES,
} from '@/data/veterinarianMockData';
import { NewAppointmentModal } from '@/components/veterinarian/NewAppointmentModal';
import { EmergencyIntakeModal } from '@/components/veterinarian/EmergencyIntakeModal';
import { IoTCircuitSchematicModal } from '@/components/veterinarian/IoTCircuitSchematicModal';
import { VetAppointment, VetEmergencyCase } from '@/types/veterinarian';

export const VeterinarianOverview = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<VetAppointment[]>(INITIAL_APPOINTMENTS);
  const [, setEmergencyCases] = useState<VetEmergencyCase[]>(INITIAL_EMERGENCY_CASES);
  const [isAppointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [isEmergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [isSchematicModalOpen, setSchematicModalOpen] = useState(false);

  // Live vitals simulation
  const [brunoTemp, setBrunoTemp] = useState(38.6);
  useEffect(() => {
    const timer = setInterval(() => {
      setBrunoTemp(Number((38.5 + Math.random() * 0.3).toFixed(2)));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleAddAppointment = (newApt: VetAppointment) => {
    setAppointments((prev) => [newApt, ...prev]);
  };

  const handleAddEmergency = (newCase: VetEmergencyCase) => {
    setEmergencyCases((prev) => [newCase, ...prev]);
  };

  // Recent cases
  const recentCases = [
    {
      id: 'rc-1',
      petName: 'Sheru',
      species: 'Dog',
      image: '/buddy-puppy.jpg',
      condition: 'Skin Infection',
      collarId: 'ESP32C3-COL-0052',
      temp: '38.5°C',
      date: '19 May 2026',
      status: 'Under Treatment',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    },
    {
      id: 'rc-2',
      petName: 'Mitti',
      species: 'Cow',
      image: '/animal-cow.jpg',
      condition: 'Foot Injury',
      collarId: 'ESP32C3-COL-0067',
      temp: '38.7°C',
      date: '18 May 2026',
      status: 'Recovering',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    },
    {
      id: 'rc-3',
      petName: 'Lucy',
      species: 'Cat',
      image: '/animal-cat.jpg',
      condition: 'Fever & Tremors',
      collarId: 'ESP32C3-COL-0089',
      temp: '39.8°C 🔥',
      date: '17 May 2026',
      status: 'Critical Alert',
      statusColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 animate-pulse',
    },
    {
      id: 'rc-4',
      petName: 'Chintu',
      species: 'Dog',
      image: '/puppy.jpg',
      condition: 'Post Surgery Care',
      collarId: 'ESP32C3-COL-0031',
      temp: '38.4°C',
      date: '16 May 2026',
      status: 'Recovering',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            Welcome, Dr. Neeraj Sharma <span className="text-xl">🩺</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            ResQPet Central Hospital • ESP32-C3 IoT Telemetry Command Center
          </p>
        </div>

        {/* Date & IoT Fleet Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-50/80 px-4 py-2 text-xs font-bold text-emerald-800 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-300">
            <Radio className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>124 Smart Collars Online</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>20 May 2026, Tuesday</span>
          </div>
        </div>
      </div>

      {/* IoT Smart Collar Live Ticker Hero Banner */}
      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/30 border border-emerald-400/40 text-emerald-400 shrink-0">
            <Cpu className="h-7 w-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-900/60 px-2.5 py-0.5 rounded-lg border border-emerald-700/60">
                LIVE TELEMETRY STREAM
              </span>
              <span className="text-xs font-semibold text-slate-300">
                Patient: <strong className="text-white">Bruno (Dog • 2Y)</strong>
              </span>
            </div>
            <div className="mt-1 flex items-center gap-4 text-xs text-slate-300 flex-wrap">
              <span className="flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                DS18B20 Temp: <strong className="text-white font-mono">{brunoTemp} °C</strong> (Normal)
              </span>
              <span className="flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-blue-400" />
                MPU6050 Motion: <strong className="text-white font-mono">Active (4,820 steps)</strong>
              </span>
              <span className="flex items-center gap-1">
                <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />
                3.7V Battery: <strong className="text-white font-mono">88% (3.94V)</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setSchematicModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-900/40 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/80 transition-all"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" /> Circuit Blueprint
          </button>
          <Link
            to="/veterinarian/telemetry"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-md"
          >
            <Radio className="h-3.5 w-3.5" /> Full Telemetry Room ➔
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Appointments */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Today's Appointments</p>
              <h3 className="font-display text-3xl font-black text-slate-900 dark:text-white mt-1">08</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <Link
            to="/veterinarian/appointments"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
          >
            View Schedule <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Card 2: Total Patients & Collar Fleet */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Patients (Collared)</p>
              <h3 className="font-display text-3xl font-black text-slate-900 dark:text-white mt-1">124</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <Link
            to="/veterinarian/patients"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 dark:text-purple-400"
          >
            View Patient Fleet <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Card 3: Active IoT Telemetry Streams */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Treatments (IoT)</p>
              <h3 className="font-display text-3xl font-black text-slate-900 dark:text-white mt-1">36</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <Link
            to="/veterinarian/treatments"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400"
          >
            View Treatments <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Card 4: Critical Emergency Alerts */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Emergency Cases</p>
              <h3 className="font-display text-3xl font-black text-red-600 dark:text-red-400 mt-1">05</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
          <Link
            to="/veterinarian/emergency"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:text-red-800 dark:text-red-400"
          >
            View Emergency Unit <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 3 Columns Section: Today's Schedule | Recent Cases | Health Overview & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Today's Schedule */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
            <h3 className="font-display text-base font-extrabold text-slate-800 dark:text-white">Today's Schedule</h3>
            <Link to="/veterinarian/appointments" className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400">
              View All
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {appointments.slice(0, 4).map((apt) => (
              <div
                key={apt.id}
                onClick={() => navigate(`/veterinarian/patients/P-101`)}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[60px]">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">{apt.time}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Today</span>
                  </div>

                  <img
                    src={apt.image}
                    alt={apt.petName}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />

                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-white truncate">{apt.petName}</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {apt.species} • {apt.age} • {apt.breed}
                    </p>
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center rounded-xl px-2.5 py-1 text-[10px] font-bold border ${
                      apt.badgeType === 'Checkup'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                        : apt.badgeType === 'Follow-up'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                    }`}
                  >
                    {apt.badgeType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Recent Cases */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
            <h3 className="font-display text-base font-extrabold text-slate-800 dark:text-white">Recent Cases & Telemetry</h3>
            <Link to="/veterinarian/treatments" className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400">
              View All
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {recentCases.map((rc) => (
              <div
                key={rc.id}
                onClick={() => navigate('/veterinarian/records/MR-101')}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={rc.image}
                    alt={rc.petName}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-white truncate">
                        {rc.petName}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {rc.temp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{rc.condition}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{rc.collarId}</p>
                  </div>
                </div>

                <div>
                  <span className={`inline-flex items-center rounded-xl px-2.5 py-1 text-[10px] font-bold border ${rc.statusColor}`}>
                    {rc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Health Overview (Donut Chart) & Quick Actions */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-5">
          {/* Donut Chart Block */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 dark:border-slate-800">
              <h3 className="font-display text-base font-extrabold text-slate-800 dark:text-white">Patient Fleet Health</h3>
              <PieIcon className="h-4 w-4 text-slate-400" />
            </div>

            <div className="flex items-center justify-center gap-6 py-2">
              {/* Circular Visual Ring */}
              <div className="relative flex h-28 w-28 items-center justify-center">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray="39, 100"
                    strokeDashoffset="0"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-500"
                    strokeDasharray="29, 100"
                    strokeDashoffset="-39"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-500"
                    strokeDasharray="23, 100"
                    strokeDashoffset="-68"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-red-500"
                    strokeDasharray="9, 100"
                    strokeDashoffset="-91"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="absolute text-center">
                  <span className="font-display text-xl font-black text-slate-800 dark:text-white">124</span>
                  <span className="text-[9px] font-semibold text-slate-400 block -mt-1">Collars</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Healthy</span>
                  <span className="text-slate-400 font-bold ml-auto">48 (39%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Treating</span>
                  <span className="text-slate-400 font-bold ml-auto">36 (29%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Recovering</span>
                  <span className="text-slate-400 font-bold ml-auto">28 (23%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Critical</span>
                  <span className="text-slate-400 font-bold ml-auto">12 (9%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div>
            <span className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Emergency & Clinical Fast Actions
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAppointmentModalOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#1e6f42] p-3 text-xs font-bold text-white shadow-md shadow-emerald-950/20 hover:bg-[#165a34] transition-all hover:scale-105"
              >
                <PlusCircle className="h-4 w-4" /> New Appt
              </button>

              <button
                onClick={() => setEmergencyModalOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-red-600 p-3 text-xs font-bold text-white shadow-md shadow-red-950/20 hover:bg-red-700 transition-all hover:scale-105"
              >
                <Siren className="h-4 w-4 animate-pulse" /> Emergency Intake
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        onAddAppointment={handleAddAppointment}
      />

      <EmergencyIntakeModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        onAddEmergency={handleAddEmergency}
      />

      <IoTCircuitSchematicModal
        isOpen={isSchematicModalOpen}
        onClose={() => setSchematicModalOpen(false)}
      />
    </div>
  );
};
export default VeterinarianOverview;
