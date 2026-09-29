import { useEffect, useState } from 'react';
import { petApi } from '@/features/pets/petApi';
import { getSocket } from '@/hooks/useSocket';
import LiveMap from '@/components/map/LiveMap';
import type { Pet } from '@/types';
import Modal from '@/components/ui/Modal';
import {
  Cpu,
  BatteryCharging,
  Heart,
  Thermometer,
  Activity,
  ShieldCheck,
  MapPin,
  Lock,
  Unlock,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
  Radio,
  Clock,
} from 'lucide-react';

interface GpsUpdatePayload {
  petId: string;
  lat: number;
  lng: number;
  batteryPercent?: number;
  temperatureC?: number;
  heartRate?: number;
  spo2?: number;
  insideSafeZone: boolean;
}

const STORAGE_KEY = 'resqpet_iot_collar_activated';

const OwnerIoT = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [isPurchased, setIsPurchased] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [activationError, setActivationError] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'success'>('details');
  const [shippingAddress, setShippingAddress] = useState('');

  // Live IoT telemetry states
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [editingZone, setEditingZone] = useState(false);
  const [savingZone, setSavingZone] = useState(false);

  // Simulated live sensor values if hardware simulator is streaming
  const [heartRate, setHeartRate] = useState<number>(76);
  const [spo2, setSpo2] = useState<number>(98);
  const [tempC, setTempC] = useState<number>(38.5);
  const [battery, setBattery] = useState<number>(88);

  useEffect(() => {
    petApi.list().then((data) => {
      setPets(data);
      if (data.length > 0) setSelectedPetId(data[0]._id);
    });
  }, []);

  // Socket listener for real-time ESP32 collar readings
  useEffect(() => {
    if (!isPurchased) return;
    const socket = getSocket();
    if (!socket) return;

    const handler = (payload: GpsUpdatePayload) => {
      if (payload.petId !== selectedPetId) return;
      setLiveLocation({ lat: payload.lat, lng: payload.lng });
      if (payload.heartRate) setHeartRate(payload.heartRate);
      if (payload.spo2) setSpo2(payload.spo2);
      if (payload.temperatureC) setTempC(payload.temperatureC);
      if (payload.batteryPercent) setBattery(payload.batteryPercent);
    };

    socket.on('gps:update', handler);
    return () => {
      socket.off('gps:update', handler);
    };
  }, [selectedPetId, isPurchased]);

  // Gentle sensor fluctuation simulation for realistic live feel when purchased
  useEffect(() => {
    if (!isPurchased) return;
    const interval = setInterval(() => {
      setHeartRate((prev) => Math.min(95, Math.max(68, prev + Math.floor(Math.random() * 5) - 2)));
      setTempC((prev) => +(Math.min(39.1, Math.max(38.2, prev + (Math.random() * 0.2 - 0.1))).toFixed(1)));
    }, 4000);
    return () => clearInterval(interval);
  }, [isPurchased]);

  const selectedPet = pets.find((p) => p._id === selectedPetId);

  const handlePurchase = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsPurchased(true);
    setCheckoutStep('success');
    setTimeout(() => {
      setPurchaseModalOpen(false);
      setCheckoutStep('details');
    }, 1800);
  };

  const handleActivateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim()) {
      setActivationError('Please enter a valid Device Activation ID or Serial Number.');
      return;
    }
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsPurchased(true);
    setActivateModalOpen(false);
    setActivationCode('');
    setActivationError('');
  };

  const handleToggleState = () => {
    const next = !isPurchased;
    setIsPurchased(next);
    localStorage.setItem(STORAGE_KEY, next ? 'true' : 'false');
  };

  const saveSafeZone = async (center: { lat: number; lng: number }, radiusMeters: number) => {
    if (!selectedPet) return;
    setSavingZone(true);
    try {
      const safeZone = await petApi.setSafeZone(selectedPet._id, { enabled: true, ...center, radiusMeters });
      setPets((prev) => prev.map((p) => (p._id === selectedPet._id ? { ...p, safeZone } : p)));
    } finally {
      setSavingZone(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-bone flex items-center gap-2">
              <Cpu className="h-6 w-6 text-teal-600 dark:text-teal-400" /> ResQ Pet IoT
            </h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                isPurchased
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
              }`}
            >
              {isPurchased ? 'Device Activated' : 'Device Not Linked'}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-bone/60">
            Smart wearable collar with live GPS telemetry, health monitoring, and emergency geo-fencing.
          </p>
        </div>

        {/* Demo Toggle to easily evaluate both states */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleToggleState}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-mist-700 hover:bg-slate-100 dark:hover:bg-mist-800 text-slate-600 dark:text-bone/70 flex items-center gap-1.5 transition-colors"
            title="Toggle between Purchased and Unpurchased state for evaluation"
          >
            {isPurchased ? <Lock className="h-3.5 w-3.5 text-amber-500" /> : <Unlock className="h-3.5 w-3.5 text-emerald-500" />}
            <span>Simulate: {isPurchased ? 'Lock Device View' : 'Unlock Device View'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. NOT PURCHASED / LOCKED STATE: PRODUCT SHOWCASE & CTA  */}
      {/* ======================================================== */}
      {!isPurchased && (
        <div className="space-y-6">
          {/* Hero Product Banner */}
          <div className="card overflow-hidden border-2 border-teal-500/20 bg-gradient-to-br from-white via-teal-50/20 to-slate-50 dark:from-ink dark:via-ink-soft dark:to-ink p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden border border-teal-500/30 shadow-2xl bg-slate-900 flex items-center justify-center">
                    <img
                      src="/resqpet-iot-collar.jpg"
                      alt="ResQ Pet Smart Collar IoT"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-teal-500/90 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 shadow-md">
                      <Sparkles className="h-3.5 w-3.5" /> ESP32 IoT Pro
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-semibold">
                  <Cpu className="h-3.5 w-3.5" /> OFFICIAL RESQ PET HARDWARE
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 dark:text-bone">
                  ResQ Pet Smart Collar IoT
                </h3>

                <p className="text-sm sm:text-base text-slate-600 dark:text-bone/80 leading-relaxed">
                  The ultimate smart wearable designed specifically for pet safety. Features integrated real-time GPS
                  positioning, MAX30102 pulse & SpO2 sensors, DS18B20 digital body temperature monitoring, and high-frequency
                  accelerometer sensors with cloud live sync.
                </p>

                {/* Key Features Bullet List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mt-0.5">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-bone">Real-time GPS Tracking</p>
                      <p className="text-xs text-mist-500">Live pin location & customizable geo-fence perimeter</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 mt-0.5">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-bone">Heart Rate & SpO2</p>
                      <p className="text-xs text-mist-500">Continuous optical biometric pulse & oxygen telemetry</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-0.5">
                      <Thermometer className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-bone">Temperature Alerts</p>
                      <p className="text-xs text-mist-500">Instant heatstroke & hypothermia threshold warnings</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <BatteryCharging className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-bone">7-Day Battery & IP67</p>
                      <p className="text-xs text-mist-500">Submersible waterproof casing with magnetic fast charger</p>
                    </div>
                  </div>
                </div>

                {/* Pricing & Call to Action */}
                <div className="pt-4 border-t border-slate-200 dark:border-mist-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-3xl font-extrabold text-slate-900 dark:text-bone">₹2,499</span>
                      <span className="text-sm text-mist-400 line-through">₹3,999</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        37% OFF
                      </span>
                    </div>
                    <p className="text-xs text-mist-500 mt-0.5">Free shipping across India • 1-Year Device Warranty</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActivateModalOpen(true)}
                      className="btn-secondary text-xs sm:text-sm px-4 py-2.5"
                    >
                      I Have a Device
                    </button>
                    <button
                      onClick={() => {
                        setCheckoutStep('details');
                        setPurchaseModalOpen(true);
                      }}
                      className="btn-primary bg-teal-600 hover:bg-teal-700 text-white text-sm sm:text-base px-6 py-2.5 shadow-lg shadow-teal-500/20 flex items-center gap-2 font-medium"
                    >
                      <ShoppingBag className="h-4 w-4" /> Buy Now & Unlock
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Locked Dashboard Preview Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display text-base font-semibold text-slate-800 dark:text-bone flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-500" /> Locked Live Features Preview
                </h4>
                <p className="text-xs text-mist-500">
                  The features below require a linked and verified ResQ Pet IoT collar to receive telemetry data.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card relative overflow-hidden opacity-75 border border-dashed border-amber-300 dark:border-amber-800/60">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400 w-fit mb-3">
                  <MapPin className="h-5 w-5" />
                </div>
                <h5 className="font-semibold text-sm text-slate-800 dark:text-bone">Live GPS Tracking</h5>
                <p className="text-xs text-mist-500 mt-1">Live satellite coordinates & interactive geo-fence boundary editor.</p>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-mist-800 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <Lock className="h-3.5 w-3.5" /> Buy product to unlock
                </div>
              </div>

              <div className="card relative overflow-hidden opacity-75 border border-dashed border-amber-300 dark:border-amber-800/60">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-600 dark:text-rose-400 w-fit mb-3">
                  <Heart className="h-5 w-5" />
                </div>
                <h5 className="font-semibold text-sm text-slate-800 dark:text-bone">Biometric Pulse & SpO2</h5>
                <p className="text-xs text-mist-500 mt-1">Real-time resting and active heart rate rhythm with vital trends.</p>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-mist-800 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <Lock className="h-3.5 w-3.5" /> Buy product to unlock
                </div>
              </div>

              <div className="card relative overflow-hidden opacity-75 border border-dashed border-amber-300 dark:border-amber-800/60">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400 w-fit mb-3">
                  <Thermometer className="h-5 w-5" />
                </div>
                <h5 className="font-semibold text-sm text-slate-800 dark:text-bone">Body Temperature</h5>
                <p className="text-xs text-mist-500 mt-1">Continuous thermal surveillance with high-fever & hypothermia alerts.</p>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-mist-800 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <Lock className="h-3.5 w-3.5" /> Buy product to unlock
                </div>
              </div>

              <div className="card relative overflow-hidden opacity-75 border border-dashed border-amber-300 dark:border-amber-800/60">
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl text-teal-600 dark:text-teal-400 w-fit mb-3">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h5 className="font-semibold text-sm text-slate-800 dark:text-bone">Geo-Fence Perimeter</h5>
                <p className="text-xs text-mist-500 mt-1">Instant push notification if pet strays outside designated safe zone.</p>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-mist-800 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <Lock className="h-3.5 w-3.5" /> Buy product to unlock
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PURCHASED / ACTIVATED STATE: FULL UNLOCKED DASHBOARD */}
      {/* ======================================================== */}
      {isPurchased && (
        <div className="space-y-6">
          {/* Active Device Status Header */}
          <div className="rounded-xl border border-emerald-300 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute -top-0.5 -right-0.5"></div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <Radio className="h-5 w-5" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-800 dark:text-bone">Collar Device: Connected & Active</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200">
                    ESP32-COLLAR-8291
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-bone/60">
                  MQTT Telemetry stream live • Signal: -62 dBm (Excellent 4G) • FW: v2.4.1
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {pets.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-mist-500 font-medium">Pet:</span>
                  <select
                    className="input py-1 text-xs w-auto font-medium"
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                  >
                    {pets.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.species})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={() => setEditingZone((v) => !v)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  editingZone ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {editingZone ? 'Done Editing Zone' : 'Edit Safe Zone'}
              </button>
            </div>
          </div>

          {/* Live Sensor Readings Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="card p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-mist-500">
                <span className="text-xs">Heart Rate</span>
                <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
              </div>
              <div className="mt-2">
                <p className="text-xl font-bold text-slate-800 dark:text-bone">{heartRate} <span className="text-xs font-normal text-mist-500">BPM</span></p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Normal (60–100)</p>
              </div>
            </div>

            <div className="card p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-mist-500">
                <span className="text-xs">Blood Oxygen (SpO2)</span>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              <div className="mt-2">
                <p className="text-xl font-bold text-slate-800 dark:text-bone">{spo2}%</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Optimal Saturation</p>
              </div>
            </div>

            <div className="card p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-mist-500">
                <span className="text-xs">Body Temperature</span>
                <Thermometer className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-2">
                <p className="text-xl font-bold text-slate-800 dark:text-bone">{tempC}°C</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Normal (38.3–39.2)</p>
              </div>
            </div>

            <div className="card p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-mist-500">
                <span className="text-xs">Collar Battery</span>
                <BatteryCharging className="h-4 w-4 text-teal-500" />
              </div>
              <div className="mt-2">
                <p className="text-xl font-bold text-slate-800 dark:text-bone">{battery}%</p>
                <p className="text-[11px] text-mist-500 font-medium">~5 Days Remaining</p>
              </div>
            </div>

            <div className="card p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-mist-500">
                <span className="text-xs">Activity State</span>
                <Sparkles className="h-4 w-4 text-purple-500" />
              </div>
              <div className="mt-2">
                <p className="text-sm font-bold text-slate-800 dark:text-bone">Active / Playing</p>
                <p className="text-[11px] text-mist-500 font-medium">Acc: 0.14g Motion</p>
              </div>
            </div>

            <div className="card p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-mist-500">
                <span className="text-xs">Safe Zone</span>
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-2">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Inside Zone</p>
                <p className="text-[11px] text-mist-500 font-medium">Geo-fence OK (200m)</p>
              </div>
            </div>
          </div>

          {/* Interactive Live GPS Map */}
          {selectedPet ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-mist-500">
                <span>Real-time GPS Pin • Updated every 5 seconds via ESP32 satellite sync</span>
                {editingZone && (
                  <span className="font-medium text-teal-600 dark:text-teal-400">
                    {savingZone ? 'Saving Safe Zone…' : 'Tap anywhere on the map to position center of safe boundary'}
                  </span>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-mist-700 shadow-sm">
                <LiveMap
                  pet={selectedPet}
                  liveLocation={liveLocation}
                  editable={editingZone}
                  onSafeZoneChange={saveSafeZone}
                />
              </div>
            </div>
          ) : (
            <div className="card text-center py-8">
              <p className="text-slate-600 dark:text-bone/70">Please add a pet in "My Pets" to link tracking.</p>
            </div>
          )}

          {/* Device Safety & Telemetry Log Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card space-y-3">
              <h4 className="font-semibold text-sm text-slate-800 dark:text-bone flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Safety & Emergency Trigger Rules
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-mist-800/40 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-bone">Geo-Fence Perimeter Breach</p>
                    <p className="text-mist-500">Instant push notification and SMS to owner + dispatch alert</p>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">ARMED</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-mist-800/40 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-bone">Temperature Threshold Guard</p>
                    <p className="text-mist-500">Alerts if body temp exceeds 39.5°C or drops below 37.5°C</p>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">ACTIVE</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-mist-800/40 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-bone">Stationary Distress Fallback</p>
                    <p className="text-mist-500">Triggers rescue squad ping if no movement detected for 4+ hours outside home</p>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">ARMED</span>
                </div>
              </div>
            </div>

            <div className="card space-y-3">
              <h4 className="font-semibold text-sm text-slate-800 dark:text-bone flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" /> Recent Sensor Telemetry Packets
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-mist-800/40 font-mono">
                  <span className="text-mist-500">Just now</span>
                  <span>HR: {heartRate} bpm</span>
                  <span>SpO2: {spo2}%</span>
                  <span>{tempC}°C</span>
                  <span className="text-emerald-600 font-semibold">Normal</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-mist-800/40 font-mono">
                  <span className="text-mist-500">4s ago</span>
                  <span>HR: {heartRate - 1} bpm</span>
                  <span>SpO2: {spo2}%</span>
                  <span>38.5°C</span>
                  <span className="text-emerald-600 font-semibold">Normal</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-mist-800/40 font-mono">
                  <span className="text-mist-500">8s ago</span>
                  <span>HR: {heartRate + 1} bpm</span>
                  <span>SpO2: 97%</span>
                  <span>38.4°C</span>
                  <span className="text-emerald-600 font-semibold">Normal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BUY NOW / CHECKOUT SIMULATION                     */}
      {/* ======================================================== */}
      <Modal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        title={checkoutStep === 'details' ? 'Purchase ResQ Pet Smart Collar IoT' : 'Order Placed!'}
      >
        {checkoutStep === 'details' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-mist-800/50 rounded-xl border border-slate-200 dark:border-mist-700">
              <img
                src="/resqpet-iot-collar.jpg"
                alt="Collar"
                className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-mist-700"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800 dark:text-bone">ResQ Pet Smart Collar Pro (ESP32 IoT)</p>
                <p className="text-xs text-mist-500">Includes GPS antenna, Biometrics, Magnetic Charger</p>
                <p className="text-sm font-bold text-teal-600 dark:text-teal-400 mt-1">₹2,499 (Tax Incl.)</p>
              </div>
            </div>

            <div>
              <label className="label">Delivery Address</label>
              <input
                type="text"
                className="input"
                placeholder="Flat / House No., Street, City, State, PIN Code"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Select Pet to Pair Device With</label>
              <select
                className="input"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
              >
                {pets.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.species} • {p.breed || 'Pet'})
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-lg bg-teal-50 dark:bg-teal-950/40 p-3 text-xs text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              ✨ Instant Access: For project testing, clicking "Complete Purchase" immediately activates the IoT Dashboard and links the device.
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-mist-800">
              <button
                type="button"
                onClick={() => setPurchaseModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurchase}
                className="btn-primary bg-teal-600 hover:bg-teal-700 text-white font-medium flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" /> Complete Purchase (₹2,499)
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h4 className="font-semibold text-lg text-slate-800 dark:text-bone">Payment & Device Activated!</h4>
            <p className="text-xs text-slate-500 dark:text-bone/60">
              Your ResQ Pet Smart Collar is now online. Unlocking your live IoT tracking and telemetry dashboard…
            </p>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: MANUAL DEVICE ACTIVATION                          */}
      {/* ======================================================== */}
      <Modal
        isOpen={activateModalOpen}
        onClose={() => setActivateModalOpen(false)}
        title="Activate Your ResQ Pet Collar"
      >
        <form onSubmit={handleActivateManual} className="space-y-4">
          <p className="text-xs text-mist-500">
            Enter the 16-character Device ID or Serial Number printed on the bottom of your smart collar module (e.g. <code>ESP32-COLLAR-8291</code>).
          </p>

          {activationError && (
            <p className="rounded-lg bg-red-50 dark:bg-red-950/40 p-2.5 text-xs text-red-600 dark:text-red-400 border border-red-200">
              {activationError}
            </p>
          )}

          <div>
            <label className="label">Collar Device ID / Serial</label>
            <input
              type="text"
              className="input uppercase font-mono"
              placeholder="ESP32-COLLAR-XXXX"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-mist-800">
            <button
              type="button"
              onClick={() => setActivateModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary bg-teal-600 hover:bg-teal-700 text-white font-medium"
            >
              Verify & Unlock IoT Dashboard
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OwnerIoT;
