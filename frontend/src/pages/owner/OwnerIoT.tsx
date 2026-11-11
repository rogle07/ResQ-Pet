import { useState, useEffect, useRef } from 'react';
import { petApi } from '@/features/pets/petApi';
import { iotApi, type IoTDeviceData, type SensorReadingData } from '@/features/iot/iotApi';
import { getSocket } from '@/hooks/useSocket';
import type { Pet } from '@/types';
import Modal from '@/components/ui/Modal';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Re-centers the Leaflet map whenever the GPS coordinates change
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Cpu,
  MapPin,
  Thermometer,
  Activity,
  WifiOff,
  AlertTriangle,
  Radio,
  Copy,
  Check,
  Plus,
  Unlink,
  Link as LinkIcon,
  RefreshCw,
  Layers,
  BarChart3,
  Code,
  Satellite,
  Gauge,
  Navigation,
} from 'lucide-react';

// Custom pet avatar marker for Leaflet map to avoid bundler image 404s
const createPetMapIcon = (name: string) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:38px;height:38px;border-radius:9999px;
      background:#1e6f42;color:#ffffff;
      display:flex;align-items:center;justify-content:center;
      font-family:'Inter',sans-serif;font-weight:700;font-size:16px;
      border:3px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.35);
    ">${(name || 'P').charAt(0).toUpperCase()}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });

export default function OwnerIoT() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [devices, setDevices] = useState<IoTDeviceData[]>([]);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'charts' | 'devices' | 'firmware'>('telemetry');

  // Telemetry state
  const [latestReading, setLatestReading] = useState<SensorReadingData | null>(null);
  const [currentDevice, setCurrentDevice] = useState<IoTDeviceData | null>(null);
  const [lastValidGps, setLastValidGps] = useState<IoTDeviceData['lastValidGps']>(null);
  const [history, setHistory] = useState<SensorReadingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveSyncActive, setLiveSyncActive] = useState(true);

  // Modals
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDevicePetId, setNewDevicePetId] = useState('');
  const [registeredToken, setRegisteredToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Assign modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDeviceToAssign, setSelectedDeviceToAssign] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  // Unlink modal
  const [unlinkConfirmOpen, setUnlinkConfirmOpen] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  // Interval ref for polling
  const pollIntervalRef = useRef<number | null>(null);

  // Load initial pets & devices
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [fetchedPets, fetchedDevices] = await Promise.all([
        petApi.list().catch(() => []),
        iotApi.getDevices().catch(() => []),
      ]);

      setPets(fetchedPets);
      setDevices(fetchedDevices);

      if (fetchedPets.length > 0 && !selectedPetId) {
        setSelectedPetId(fetchedPets[0]._id);
      }
    } catch (err) {
      console.error('Failed to load IoT initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch telemetry for the selected pet
  const fetchTelemetry = async (silent = false) => {
    if (!selectedPetId) return;
    try {
      if (!silent) setRefreshing(true);
      const [data, hist] = await Promise.all([
        iotApi.getLatestTelemetry(selectedPetId).catch(() => null),
        iotApi.getHistory(selectedPetId, 40).catch(() => []),
      ]);

      if (data) {
        setCurrentDevice(data.device);
        setLatestReading(data.reading);
        setLastValidGps(data.device?.lastValidGps || null);
      } else {
        setCurrentDevice(null);
        setLatestReading(null);
        setLastValidGps(null);
      }

      setHistory(hist);
    } catch (err) {
      console.error('Telemetry fetch error:', err);
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  // Re-fetch when selected pet changes
  useEffect(() => {
    if (selectedPetId) {
      fetchTelemetry();
    }
  }, [selectedPetId]);

  // Live polling (every 8 seconds)
  useEffect(() => {
    if (liveSyncActive && selectedPetId) {
      pollIntervalRef.current = window.setInterval(() => {
        fetchTelemetry(true);
      }, 8000);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [liveSyncActive, selectedPetId]);

  // Socket.IO real-time sensor updates (immediate push from backend)
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !selectedPetId) return;

    const handleSensorUpdate = (payload: {
      petId: string;
      deviceId: string;
      reading: SensorReadingData;
      lastValidGps: IoTDeviceData['lastValidGps'];
      connectionStatus: string;
    }) => {
      // Only update state if the event is for the currently selected pet
      if (payload.petId?.toString() !== selectedPetId) return;
      setLatestReading(payload.reading);
      if (payload.lastValidGps) {
        setLastValidGps(payload.lastValidGps);
      }
      setCurrentDevice((prev) =>
        prev ? { ...prev, connectionStatus: 'online', lastCommunicationAt: new Date().toISOString() } : prev
      );
    };

    const handleGpsUpdate = (payload: {
      petId: string;
      lat: number;
      lng: number;
      speedKmh: number | null;
      temperatureC: number | null;
      recordedAt: string;
    }) => {
      if (payload.petId?.toString() !== selectedPetId) return;
      // Update lastValidGps immediately so the map re-centers
      setLastValidGps((prev) => ({
        ...(prev || {}),
        latitude: payload.lat,
        longitude: payload.lng,
        speed: payload.speedKmh,
        recordedAt: payload.recordedAt,
      }));
    };

    socket.on('iot:sensor-update', handleSensorUpdate);
    socket.on('gps:update', handleGpsUpdate);

    return () => {
      socket.off('iot:sensor-update', handleSensorUpdate);
      socket.off('gps:update', handleGpsUpdate);
    };
  }, [selectedPetId]);

  const selectedPet = pets.find((p) => p._id === selectedPetId);

  // Handle register new device
  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    try {
      setRegistering(true);
      const res = await iotApi.registerDevice({
        deviceId: newDeviceId.trim().toUpperCase() || undefined,
        deviceName: newDeviceName.trim() || undefined,
        petId: newDevicePetId || undefined,
      });

      setRegisteredToken(res.deviceToken);
      // Refresh devices and telemetry
      const updatedDevices = await iotApi.getDevices();
      setDevices(updatedDevices);
      fetchTelemetry();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register device';
      setRegisterError(msg);
    } finally {
      setRegistering(false);
    }
  };

  // Handle assign device
  const handleAssign = async () => {
    if (!selectedDeviceToAssign || !selectedPetId) return;
    try {
      setAssigning(true);
      await iotApi.assignDevice(selectedDeviceToAssign, selectedPetId);
      setAssignModalOpen(false);
      const updatedDevices = await iotApi.getDevices();
      setDevices(updatedDevices);
      fetchTelemetry();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to assign device');
    } finally {
      setAssigning(false);
    }
  };

  // Handle unlink
  const handleUnlink = async () => {
    if (!currentDevice) return;
    try {
      setUnlinking(true);
      await iotApi.unlinkDevice(currentDevice.deviceId);
      setUnlinkConfirmOpen(false);
      const updatedDevices = await iotApi.getDevices();
      setDevices(updatedDevices);
      fetchTelemetry();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to unlink device');
    } finally {
      setUnlinking(false);
    }
  };

  // Copy token helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  // Available devices that are not yet assigned to any pet
  const unassignedDevices = devices.filter((d) => !d.pet || d.pet._id === selectedPetId);

  // Device connection status helper
  const renderConnectionBadge = (status?: string) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Device Online
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <WifiOff className="h-3 w-3" />
            Device Offline
          </span>
        );
      case 'pending_connection':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
            <Radio className="h-3 w-3" />
            Pending Verification
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300">
            Device Not Linked
          </span>
        );
    }
  };

  // Format chart timestamp
  const formatTime = (ts?: string) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] space-y-4">
        <div className="h-10 w-10 border-4 border-emerald-200 border-t-[#1e6f42] rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading IoT Wearable Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header & Pet Selector Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-[#1e6f42] dark:text-emerald-400">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Wearable IoT Monitor
                <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-emerald-100 text-[#1e6f42] dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  ESP32-C3
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time motion (MPU6050/6500), temperature & humidity (DHT11), and GPS satellite telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* Pet selector & action controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {pets.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <label htmlFor="petSelect" className="text-xs font-semibold text-slate-500">
                Monitored Pet:
              </label>
              <select
                id="petSelect"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
              >
                {pets.map((p) => (
                  <option key={p._id} value={p._id} className="dark:bg-slate-800">
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Live Sync button */}
          <button
            onClick={() => setLiveSyncActive(!liveSyncActive)}
            title={liveSyncActive ? 'Live sync is on' : 'Live sync paused'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              liveSyncActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                liveSyncActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
              }`}
            />
            {liveSyncActive ? 'Live Syncing' : 'Paused'}
          </button>

          {/* Refresh button */}
          <button
            onClick={() => fetchTelemetry()}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Refresh telemetry"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* Add Device Button */}
          <button
            onClick={() => {
              setRegisteredToken(null);
              setNewDeviceId('');
              setNewDeviceName('');
              setNewDevicePetId(selectedPetId);
              setRegisterModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#1e6f42] hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Device
          </button>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 gap-2">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'telemetry'
              ? 'border-[#1e6f42] text-[#1e6f42] dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Radio className="h-4 w-4" />
          Live Telemetry & GPS
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'charts'
              ? 'border-[#1e6f42] text-[#1e6f42] dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Historical Trends
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'devices'
              ? 'border-[#1e6f42] text-[#1e6f42] dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="h-4 w-4" />
          Device Management ({devices.length})
        </button>
        <button
          onClick={() => setActiveTab('firmware')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'firmware'
              ? 'border-[#1e6f42] text-[#1e6f42] dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Code className="h-4 w-4" />
          ESP32 Firmware & Pinout
        </button>
      </div>

      {/* ── Tab 1: Live Telemetry & GPS ── */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Device Assignment Banner / Warning */}
          {!currentDevice ? (
            <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/20 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">
                    No Wearable Device Assigned to {selectedPet?.name || 'this pet'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-lg">
                    Link an existing registered ESP32 collar or register a new one to begin streaming live
                    motion, temperature, and GPS satellite coordinates.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {unassignedDevices.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedDeviceToAssign(unassignedDevices[0].deviceId);
                      setAssignModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    Link Existing Device
                  </button>
                )}
                <button
                  onClick={() => {
                    setRegisteredToken(null);
                    setNewDeviceId('');
                    setNewDevicePetId(selectedPetId);
                    setRegisterModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e6f42] text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Register New Device
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">
                      {currentDevice.deviceId}
                    </span>
                    <span className="text-xs text-slate-500">({currentDevice.deviceName})</span>
                    {renderConnectionBadge(currentDevice.connectionStatus)}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Assigned to: <strong className="text-slate-700 dark:text-slate-300">{selectedPet?.name}</strong></span>
                    <span>•</span>
                    <span>
                      Last contact:{' '}
                      {currentDevice.lastCommunicationAt
                        ? new Date(currentDevice.lastCommunicationAt).toLocaleTimeString()
                        : 'Never'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUnlinkConfirmOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-colors"
                >
                  <Unlink className="h-3.5 w-3.5" />
                  Unlink Device
                </button>
              </div>
            </div>
          )}

          {/* ── 4 Main Telemetry Metrics ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Temperature */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Body Temperature</span>
                <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600">
                  <Thermometer className="h-5 w-5" />
                </div>
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">
                    {latestReading?.temperature !== null && latestReading?.temperature !== undefined
                      ? latestReading.temperature.toFixed(1)
                      : '--'}
                  </span>
                  <span className="text-lg font-bold text-slate-400">°C</span>
                </div>
                <div className="mt-1">
                  {latestReading?.temperature !== null && latestReading?.temperature !== undefined ? (
                    latestReading.temperature > 39.5 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-100 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                        🚨 High Temperature Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        <Check className="h-3 w-3" /> Normal Range
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-slate-400">Sensor data unavailable</span>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Sensor: DHT11 (GPIO4)</span>
                <span>Normal: 37.5-39.2°C</span>
              </div>
            </div>

            {/* Metric 2: Humidity */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Relative Humidity</span>
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600">
                  <Gauge className="h-5 w-5" />
                </div>
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">
                    {latestReading?.humidity !== null && latestReading?.humidity !== undefined
                      ? Math.round(latestReading.humidity)
                      : '--'}
                  </span>
                  <span className="text-lg font-bold text-slate-400">%</span>
                </div>
                <div className="mt-1">
                  {latestReading?.humidity !== null && latestReading?.humidity !== undefined ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                      Ambient Environment
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Sensor data unavailable</span>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Sensor: DHT11 (GPIO4)</span>
                <span>Range: 20-90%</span>
              </div>
            </div>

            {/* Metric 3: Motion & Activity */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activity Status</span>
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-slate-800 dark:text-white tracking-wide">
                    {latestReading?.motion?.activityStatus || 'RESTING'}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-100 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                    Movement: {(latestReading?.motion?.movementEstimate || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>MPU6050/6500 (I2C)</span>
                <span>Total Accel: {latestReading?.motion?.totalAcceleration?.toFixed(2) || '0.98'}g</span>
              </div>
            </div>

            {/* Metric 4: GPS Satellites & Fix */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">GPS Satellite Fix</span>
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/40 text-teal-600">
                  <Satellite className="h-5 w-5" />
                </div>
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-2">
                  {latestReading?.gps?.fixValid ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      GPS Location Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-700">
                      <Radio className="h-3 w-3 animate-pulse" />
                      GPS Waiting for Fix
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                  <span>Satellites: <strong>{latestReading?.gps?.satellites ?? 0}</strong></span>
                  {latestReading?.gps?.speed !== null && latestReading?.gps?.speed !== undefined && (
                    <span>• {latestReading.gps.speed.toFixed(1)} km/h</span>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>NEO-6M UART (GPIO20/21)</span>
                <span>{latestReading?.gps?.fixValid ? 'Live Fix' : 'Acquiring Lock'}</span>
              </div>
            </div>
          </div>

          {/* ── Motion Sensors Breakdown (MPU6050/6500) ── */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-purple-600" />
              MPU Motion Sensor Telemetry (3-Axis Accelerometer & Gyroscope)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-bold text-slate-400 block">Accel X</span>
                <span className="font-mono text-base font-bold text-slate-800 dark:text-white">
                  {latestReading?.motion?.accelerationX !== null && latestReading?.motion?.accelerationX !== undefined
                    ? `${latestReading.motion.accelerationX > 0 ? '+' : ''}${latestReading.motion.accelerationX.toFixed(2)}g`
                    : '--'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-bold text-slate-400 block">Accel Y</span>
                <span className="font-mono text-base font-bold text-slate-800 dark:text-white">
                  {latestReading?.motion?.accelerationY !== null && latestReading?.motion?.accelerationY !== undefined
                    ? `${latestReading.motion.accelerationY > 0 ? '+' : ''}${latestReading.motion.accelerationY.toFixed(2)}g`
                    : '--'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-bold text-slate-400 block">Accel Z</span>
                <span className="font-mono text-base font-bold text-slate-800 dark:text-white">
                  {latestReading?.motion?.accelerationZ !== null && latestReading?.motion?.accelerationZ !== undefined
                    ? `${latestReading.motion.accelerationZ > 0 ? '+' : ''}${latestReading.motion.accelerationZ.toFixed(2)}g`
                    : '--'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-bold text-slate-400 block">Total Accel |a|</span>
                <span className="font-mono text-base font-bold text-purple-600 dark:text-purple-400">
                  {latestReading?.motion?.totalAcceleration !== null && latestReading?.motion?.totalAcceleration !== undefined
                    ? `${latestReading.motion.totalAcceleration.toFixed(2)}g`
                    : '0.98g'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-bold text-slate-400 block">Gyro X</span>
                <span className="font-mono text-base font-bold text-slate-800 dark:text-white">
                  {latestReading?.motion?.gyroscopeX !== null && latestReading?.motion?.gyroscopeX !== undefined
                    ? `${latestReading.motion.gyroscopeX.toFixed(1)}°/s`
                    : '--'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-bold text-slate-400 block">Gyro Y</span>
                <span className="font-mono text-base font-bold text-slate-800 dark:text-white">
                  {latestReading?.motion?.gyroscopeY !== null && latestReading?.motion?.gyroscopeY !== undefined
                    ? `${latestReading.motion.gyroscopeY.toFixed(1)}°/s`
                    : '--'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-bold text-slate-400 block">Gyro Z</span>
                <span className="font-mono text-base font-bold text-slate-800 dark:text-white">
                  {latestReading?.motion?.gyroscopeZ !== null && latestReading?.motion?.gyroscopeZ !== undefined
                    ? `${latestReading.motion.gyroscopeZ.toFixed(1)}°/s`
                    : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Interactive GPS Location & Map ── */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  Live Satellite GPS Location
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  NEO-6M GPS receiver coordinates mapped in real time.
                </p>
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-2">
                {latestReading?.gps?.fixValid ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <Check className="h-3 w-3" /> Fix Valid ({latestReading.gps.latitude?.toFixed(5)},{' '}
                    {latestReading.gps.longitude?.toFixed(5)})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    <Radio className="h-3 w-3 animate-spin" /> GPS Waiting for Fix
                  </span>
                )}
              </div>
            </div>

            {/* Map Rendering or Waiting-for-Fix State */}
            {latestReading?.gps?.fixValid &&
            typeof latestReading.gps.latitude === 'number' &&
            typeof latestReading.gps.longitude === 'number' ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-[400px]">
                <MapContainer
                  center={[latestReading.gps.latitude, latestReading.gps.longitude]}
                  zoom={16}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapRecenter lat={latestReading.gps.latitude} lng={latestReading.gps.longitude} />
                  <Marker
                    position={[latestReading.gps.latitude, latestReading.gps.longitude]}
                    icon={createPetMapIcon(selectedPet?.name || 'Pet')}
                  />
                  {selectedPet?.safeZone?.enabled && selectedPet.safeZone.center && (
                    <Circle
                      center={[selectedPet.safeZone.center.lat, selectedPet.safeZone.center.lng]}
                      radius={selectedPet.safeZone.radiusMeters || 200}
                      pathOptions={{ color: '#1e6f42', fillColor: '#1e6f42', fillOpacity: 0.15 }}
                    />
                  )}
                </MapContainer>

                <div className="absolute top-4 right-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md text-xs space-y-1">
                  <div className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                    {selectedPet?.name} Current Location
                  </div>
                  <div className="text-slate-500 font-mono">
                    Lat: {latestReading.gps.latitude.toFixed(6)}
                  </div>
                  <div className="text-slate-500 font-mono">
                    Lng: {latestReading.gps.longitude.toFixed(6)}
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Fixed at: {new Date(latestReading.recordedAt || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ) : lastValidGps?.latitude && lastValidGps?.longitude ? (
              /* Fallback: show last known valid GPS location on map */
              <div className="relative rounded-2xl overflow-hidden border border-amber-200 dark:border-amber-800 h-[400px]">
                <MapContainer
                  center={[lastValidGps.latitude, lastValidGps.longitude]}
                  zoom={16}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapRecenter lat={lastValidGps.latitude} lng={lastValidGps.longitude} />
                  <Marker
                    position={[lastValidGps.latitude, lastValidGps.longitude]}
                    icon={createPetMapIcon(selectedPet?.name || 'Pet')}
                  />
                  {selectedPet?.safeZone?.enabled && selectedPet.safeZone.center && (
                    <Circle
                      center={[selectedPet.safeZone.center.lat, selectedPet.safeZone.center.lng]}
                      radius={selectedPet.safeZone.radiusMeters || 200}
                      pathOptions={{ color: '#1e6f42', fillColor: '#1e6f42', fillOpacity: 0.15 }}
                    />
                  )}
                </MapContainer>

                <div className="absolute top-4 right-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3 rounded-xl border border-amber-200 dark:border-amber-700 shadow-md text-xs space-y-1">
                  <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5 text-amber-600" />
                    Last Known Location
                  </div>
                  <div className="text-slate-500 font-mono">
                    Lat: {lastValidGps.latitude.toFixed(6)}
                  </div>
                  <div className="text-slate-500 font-mono">
                    Lng: {lastValidGps.longitude.toFixed(6)}
                  </div>
                  <div className="text-amber-600 dark:text-amber-400 text-[10px]">
                    GPS searching – showing last fix
                  </div>
                  {lastValidGps.recordedAt && (
                    <div className="text-slate-400 text-[10px]">
                      Recorded: {new Date(lastValidGps.recordedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center animate-pulse">
                  <Satellite className="h-8 w-8" />
                </div>
                <div className="max-w-md mx-auto">
                  <h5 className="font-bold text-base text-slate-800 dark:text-white">
                    GPS Waiting for Satellite Fix
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    The ESP32 NEO-6M GPS receiver is searching for satellite signals. A clear line-of-sight to the
                    open sky is required for initial cold-start satellite lock (typically 30–90 seconds outdoors).
                  </p>
                  <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <Radio className="h-3 w-3 text-amber-500" />
                    Active Satellites in View: <strong>{latestReading?.gps?.satellites ?? 0}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 2: Historical Trends ── */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          {history.length === 0 ? (
            <div className="card text-center py-12 border-dashed border-2">
              <BarChart3 className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <h5 className="font-bold text-slate-700 dark:text-slate-300">No Telemetry History Yet</h5>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Once your ESP32 starts transmitting sensor readings over HTTPS, historical temperature,
                humidity, and movement charts will populate automatically.
              </p>
            </div>
          ) : (
            <>
              {/* Temperature & Humidity Chart */}
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      Temperature (°C) & Humidity (%) Trends
                    </h4>
                    <p className="text-xs text-slate-500">Readings from DHT11 environmental sensor</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{history.length} samples</span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="recordedAt" tickFormatter={formatTime} tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10 }} domain={['dataMin - 2', 'dataMax + 2']} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip
                        labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="temperature"
                        name="Temp (°C)"
                        stroke="#f97316"
                        strokeWidth={2.5}
                        dot={{ r: 2 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="humidity"
                        name="Humidity (%)"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Movement & Acceleration Activity Chart */}
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-600" />
                      Movement & Total Acceleration Activity
                    </h4>
                    <p className="text-xs text-slate-500">Readings from MPU6050/6500 motion sensor</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">g-force index</span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="recordedAt" tickFormatter={formatTime} tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                      <Tooltip
                        labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="motion.totalAcceleration"
                        name="Total Accel (g)"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.25}
                      />
                      <Area
                        type="monotone"
                        dataKey="motion.movementEstimate"
                        name="Movement Index"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.15}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab 3: Device Management ── */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-base text-slate-800 dark:text-white">
              Registered Wearable Devices ({devices.length})
            </h4>
            <button
              onClick={() => {
                setRegisteredToken(null);
                setNewDeviceId('');
                setNewDeviceName('');
                setNewDevicePetId(selectedPetId);
                setRegisterModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1e6f42] text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Register New Device
            </button>
          </div>

          {devices.length === 0 ? (
            <div className="card text-center py-12 border-dashed border-2">
              <Cpu className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <h5 className="font-bold text-slate-700 dark:text-slate-300">No Devices Registered</h5>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Register your physical ESP32 collar to obtain its unique Device ID and authentication token.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map((dev) => (
                <div
                  key={dev._id}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-slate-800 dark:text-white">
                        {dev.deviceId}
                      </span>
                      {renderConnectionBadge(dev.connectionStatus)}
                    </div>
                    <span className="text-xs text-slate-400">{dev.hardware?.model || 'ESP32-C3'}</span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <div>
                      <strong>Device Name:</strong> {dev.deviceName}
                    </div>
                    <div>
                      <strong>Assigned Pet:</strong>{' '}
                      {dev.pet ? (
                        <span className="font-bold text-[#1e6f42] dark:text-emerald-400">
                          {dev.pet.name} ({dev.pet.species})
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">Unlinked / Available</span>
                      )}
                    </div>
                    <div>
                      <strong>Last Contact:</strong>{' '}
                      {dev.lastCommunicationAt
                        ? new Date(dev.lastCommunicationAt).toLocaleString()
                        : 'Never connected'}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                    {dev.pet ? (
                      <button
                        onClick={async () => {
                          if (confirm(`Unlink ${dev.deviceId} from ${dev.pet?.name}?`)) {
                            await iotApi.unlinkDevice(dev.deviceId);
                            loadInitialData();
                          }
                        }}
                        className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
                      >
                        <Unlink className="h-3 w-3" /> Unlink Pet
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedDeviceToAssign(dev.deviceId);
                          setAssignModalOpen(true);
                        }}
                        className="text-xs text-[#1e6f42] hover:underline font-bold flex items-center gap-1"
                      >
                        <LinkIcon className="h-3 w-3" /> Assign to Pet
                      </button>
                    )}

                    <button
                      onClick={async () => {
                        if (confirm(`Regenerate authentication token for ${dev.deviceId}? Your existing ESP32 token will stop working.`)) {
                          const res = await iotApi.regenerateToken(dev.deviceId);
                          setRegisteredToken(res.deviceToken);
                          setRegisterModalOpen(true);
                        }
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                    >
                      Regenerate Token
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 4: ESP32 Firmware & Wiring Guide ── */}
      {activeTab === 'firmware' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h4 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-emerald-600" />
              Hardware Pinout & Wiring Specifications (ESP32-C3 SuperMini)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              The firmware communicates via HTTPS POST directly to our deployed cloud backend at{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 font-mono text-emerald-600 font-bold">
                https://resq-pet-1.onrender.com/api/iot/device-data
              </code>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                <span className="font-bold text-sm text-purple-800 dark:text-purple-300 block mb-2">
                  1. MPU6050 / MPU6500 Motion
                </span>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 font-mono">
                  <li>• SDA: <strong>GPIO8</strong></li>
                  <li>• SCL: <strong>GPIO9</strong></li>
                  <li>• VCC: 3.3V</li>
                  <li>• GND: GND</li>
                  <li className="text-[11px] text-purple-600 pt-1">I2C Address: 0x68</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                <span className="font-bold text-sm text-orange-800 dark:text-orange-300 block mb-2">
                  2. DHT11 Temp & Humidity
                </span>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 font-mono">
                  <li>• DATA: <strong>GPIO4</strong></li>
                  <li>• VCC: 3.3V</li>
                  <li>• GND: GND</li>
                  <li className="text-[11px] text-orange-600 pt-1">Single-bus digital signal</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800">
                <span className="font-bold text-sm text-teal-800 dark:text-teal-300 block mb-2">
                  3. NEO-6M GPS Module
                </span>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 font-mono">
                  <li>• GPS TX → <strong>GPIO20</strong> (ESP32 RX)</li>
                  <li>• GPS RX → <strong>GPIO21</strong> (ESP32 TX)</li>
                  <li>• Baud rate: 9600</li>
                  <li className="text-[11px] text-teal-600 pt-1">Hardware UART Serial</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60">
              <h5 className="font-bold text-sm text-slate-800 dark:text-white mb-2">
                Sample <code className="text-[#1e6f42]">config.h</code> for Arduino IDE
              </h5>
              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
{`#ifndef RESQPET_CONFIG_H
#define RESQPET_CONFIG_H

// ==== DEVICE CREDENTIALS ====
#define DEVICE_ID "${currentDevice?.deviceId || 'RQP-ESP32-0001'}"
#define DEVICE_TOKEN "${registeredToken || 'YOUR_GENERATED_DEVICE_TOKEN_HERE'}"

// ==== WIFI SETTINGS ====
#define WIFI_SSID "Your_WiFi_Name"
#define WIFI_PASSWORD "Your_WiFi_Password"

// ==== BACKEND URL (HTTPS) ====
#define BACKEND_URL "https://resq-pet-1.onrender.com/api/iot/device-data"

// ==== TIMING ====
#define PUBLISH_INTERVAL_MS 10000UL   // 10 seconds between sensor transmissions

#endif`}
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `#ifndef RESQPET_CONFIG_H\n#define RESQPET_CONFIG_H\n\n#define DEVICE_ID "${
                        currentDevice?.deviceId || 'RQP-ESP32-0001'
                      }"\n#define DEVICE_TOKEN "${
                        registeredToken || 'YOUR_GENERATED_DEVICE_TOKEN_HERE'
                      }"\n#define WIFI_SSID "Your_WiFi_Name"\n#define WIFI_PASSWORD "Your_WiFi_Password"\n#define BACKEND_URL "https://resq-pet.onrender.com/api/iot/device-data"\n#define PUBLISH_INTERVAL_MS 10000UL\n\n#endif`
                    )
                  }
                  className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 border border-slate-700"
                >
                  {copiedToken ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Register New Device ── */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title={registeredToken ? 'Device Registered Successfully!' : 'Register ResQPet Wearable Collar'}
      >
        {registeredToken ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-sm">
              <strong className="block font-bold">Important Device Authentication Token</strong>
              Copy this token now. It will not be shown again in plain text for security reasons. Flash it into
              your ESP32 Arduino code under <code className="font-mono font-bold">DEVICE_TOKEN</code>.
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">Device Secret Token:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={registeredToken}
                  className="flex-1 px-3 py-2.5 rounded-xl border font-mono text-xs bg-slate-100 dark:bg-slate-900 select-all"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(registeredToken)}
                  className="px-4 py-2.5 rounded-xl bg-[#1e6f42] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedToken ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedToken ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setRegisterModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-xs hover:bg-slate-300 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegisterDevice} className="space-y-4">
            {registerError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                {registerError}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Device ID (Unique hardware identifier):
              </label>
              <input
                type="text"
                placeholder="e.g. RQP-ESP32-0001 (or leave blank to auto-generate)"
                value={newDeviceId}
                onChange={(e) => setNewDeviceId(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-mono uppercase"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Must match the DEVICE_ID flashed into your ESP32 Arduino firmware.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Device Nickname:
              </label>
              <input
                type="text"
                placeholder="e.g. Milo's Smart Collar"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Assign Directly to Pet:
              </label>
              <select
                value={newDevicePetId}
                onChange={(e) => setNewDevicePetId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm cursor-pointer"
              >
                <option value="">-- Do not assign yet --</option>
                {pets.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRegisterModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={registering}
                className="px-5 py-2 rounded-xl bg-[#1e6f42] hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {registering ? 'Registering...' : 'Register Device'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Modal: Assign Device to Pet ── */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Collar to ${selectedPet?.name || 'Pet'}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Select one of your registered wearable devices to link to{' '}
            <strong>{selectedPet?.name}</strong>.
          </p>

          <div className="space-y-2">
            {unassignedDevices.map((dev) => (
              <label
                key={dev._id}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  selectedDeviceToAssign === dev.deviceId
                    ? 'border-[#1e6f42] bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="deviceSelect"
                    checked={selectedDeviceToAssign === dev.deviceId}
                    onChange={() => setSelectedDeviceToAssign(dev.deviceId)}
                    className="text-[#1e6f42] focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">
                      {dev.deviceId}
                    </span>
                    <p className="text-[11px] text-slate-500">{dev.deviceName}</p>
                  </div>
                </div>
                {renderConnectionBadge(dev.connectionStatus)}
              </label>
            ))}
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={assigning || !selectedDeviceToAssign}
              className="px-5 py-2 rounded-xl bg-[#1e6f42] hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {assigning ? 'Linking...' : 'Confirm Assignment'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal: Unlink Confirmation ── */}
      <Modal
        isOpen={unlinkConfirmOpen}
        onClose={() => setUnlinkConfirmOpen(false)}
        title="Unlink Wearable Device"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to unlink device <strong>{currentDevice?.deviceId}</strong> from{' '}
            <strong>{selectedPet?.name}</strong>?
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Sensor telemetry from this collar will no longer update this pet's profile until re-linked.
          </p>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              onClick={() => setUnlinkConfirmOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleUnlink}
              disabled={unlinking}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {unlinking ? 'Unlinking...' : 'Yes, Unlink Device'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
