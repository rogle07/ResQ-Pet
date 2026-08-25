import React, { useState, useEffect } from 'react';
import {
  Radio,
  Thermometer,
  Activity,
  MapPin,
  BatteryCharging,
  Wifi,
  Volume2,
  Cpu,
  RefreshCw,
  Zap,
  Compass,
} from 'lucide-react';
import { IoTCollarDevice } from '@/types/veterinarian';

interface IoTCollarLiveTelemetryProps {
  collar: IoTCollarDevice;
  petName: string;
  onOpenSchematicModal?: () => void;
}

export const IoTCollarLiveTelemetry: React.FC<IoTCollarLiveTelemetryProps> = ({
  collar: initialCollar,
  petName,
  onOpenSchematicModal,
}) => {
  const [collar, setCollar] = useState<IoTCollarDevice>(initialCollar);
  const [isBuzzerPlaying, setIsBuzzerPlaying] = useState(false);
  const [activeLedColor, setActiveLedColor] = useState<'Green' | 'Blue' | 'Red' | 'Off'>(
    initialCollar.actuators.rgbLedColor === 'Strobe' ? 'Red' : initialCollar.actuators.rgbLedColor
  );
  const [highFreqMode, setHighFreqMode] = useState(false);
  const [buzzerMessage, setBuzzerMessage] = useState<string | null>(null);

  // Real-time live simulation ticker
  useEffect(() => {
    const intervalTime = highFreqMode ? 1000 : 3000;
    const timer = setInterval(() => {
      setCollar((prev) => {
        // Small random fluctuations in temperature and motion
        const tempDelta = (Math.random() - 0.5) * 0.08;
        const newTemp = Number((prev.temperature.currentC + tempDelta).toFixed(2));
        const newStatus =
          newTemp > 39.5 ? 'Fever' : newTemp < 37.5 ? 'Hypothermia' : 'Normal';

        const newAccelX = Number(((Math.random() - 0.5) * 0.4).toFixed(2));
        const newAccelY = Number(((Math.random() - 0.5) * 0.4).toFixed(2));
        const newAccelZ = Number((0.95 + Math.random() * 0.1).toFixed(2));

        const updatedHistory = [
          ...prev.temperature.history.slice(-7),
          {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            tempC: newTemp,
          },
        ];

        return {
          ...prev,
          lastPingSecsAgo: 1,
          temperature: {
            ...prev.temperature,
            currentC: newTemp,
            status: newStatus,
            history: updatedHistory,
          },
          motion: {
            ...prev.motion,
            accelX: newAccelX,
            accelY: newAccelY,
            accelZ: newAccelZ,
            stepCount: prev.motion.stepCount + (prev.motion.activityLevel === 'Active' ? Math.floor(Math.random() * 4) : 0),
          },
        };
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [highFreqMode]);

  // Audio Beep generator via Web Audio API for Buzzer Remote Control
  const playBuzzerBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, audioCtx.currentTime); // 2.4kHz piezo frequency
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch {
      // Audio context might be restricted before interaction
    }

    setIsBuzzerPlaying(true);
    setBuzzerMessage('MQTT ➔ GPIO10 Transistor Triggered (2.4kHz Audio Tone)');
    setTimeout(() => {
      setIsBuzzerPlaying(false);
      setTimeout(() => setBuzzerMessage(null), 3000);
    }, 1200);
  };

  const handleLedChange = (color: 'Green' | 'Blue' | 'Red' | 'Off') => {
    setActiveLedColor(color);
  };

  return (
    <div className="space-y-6">
      {/* Top Smart Collar Status Bar */}
      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/30 border border-emerald-400/40 text-emerald-400 shadow-inner">
              <Cpu className="h-7 w-7 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-display text-lg font-black tracking-wide">
                  ESP32-C3 SuperMini Smart Collar
                </h3>
                <span className="rounded-xl bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-mono font-bold text-emerald-300 border border-emerald-500/30">
                  {collar.deviceId}
                </span>
                <span className="rounded-xl bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono text-purple-300">
                  {collar.firmwareVersion}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-3 flex-wrap">
                <span>Patient: <strong className="text-white font-bold">{petName}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Wifi className="h-3.5 w-3.5 text-emerald-400" /> {collar.wifiSsid} ({collar.wifiRssi} dBm)
                </span>
                <span>•</span>
                <span className="font-mono text-slate-400 text-[11px]">IP: {collar.ipAddress}</span>
              </p>
            </div>
          </div>

          {/* Quick Hardware Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenSchematicModal && (
              <button
                type="button"
                onClick={onOpenSchematicModal}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/60 transition-all shadow-sm"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" /> Circuit Blueprint
              </button>
            )}

            <button
              type="button"
              onClick={() => setHighFreqMode(!highFreqMode)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                highFreqMode
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                  : 'border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${highFreqMode ? 'animate-spin' : ''}`} />
              {highFreqMode ? '1 Hz ICU Stream' : '3 Hz Standard'}
            </button>
          </div>
        </div>

        {/* Battery & Hardware Status Strip */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800 pt-4 text-xs">
          <div className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <BatteryCharging className="h-4 w-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">3.7V Li-Po Battery</span>
              <p className="font-bold text-white">{collar.batteryPercent}% ({collar.batteryVoltage} V)</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <Thermometer className="h-4 w-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">DS18B20 Temp Probe</span>
              <p className="font-bold text-white">{collar.temperature.currentC} °C ({collar.temperature.status})</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <Activity className="h-4 w-4 text-blue-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">MPU6050 Motion</span>
              <p className="font-bold text-white">{collar.motion.activityLevel} ({collar.motion.stepCount} Steps)</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <Compass className="h-4 w-4 text-purple-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">ATGM336H GPS Lock</span>
              <p className="font-bold text-white">{collar.gps.satellites} Sats ({collar.gps.geofenceStatus})</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sensor 1: DS18B20 Temperature Monitor */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Thermometer className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">DS18B20 Temperature</h4>
                  <p className="text-[10px] text-slate-400 font-mono">GPIO20 with 4.7kΩ Pull-up</p>
                </div>
              </div>

              <span
                className={`rounded-xl px-2.5 py-1 text-xs font-bold border ${
                  collar.temperature.status === 'Normal'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : collar.temperature.status === 'Fever'
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 animate-pulse'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {collar.temperature.status}
              </span>
            </div>

            {/* Big Temperature Gauge Display */}
            <div className="my-4 flex items-center justify-center gap-4">
              <div className="text-center">
                <span className="font-display text-4xl font-black text-slate-900 dark:text-white">
                  {collar.temperature.currentC.toFixed(1)}
                  <span className="text-xl text-slate-400 font-semibold">°C</span>
                </span>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  {(collar.temperature.currentC * 1.8 + 32).toFixed(1)} °F Body Core Temp
                </p>
              </div>
            </div>

            {/* Live Temperature Histogram */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Continuous Telemetry Waveform
              </span>
              <div className="flex items-end gap-1.5 h-16 bg-slate-50 p-2 rounded-2xl dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                {collar.temperature.history.map((pt, idx) => {
                  const heightPercent = Math.min(100, Math.max(20, ((pt.tempC - 37) / 4) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all ${
                          pt.tempC > 39.5 ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                      />
                      <span className="text-[8px] font-mono text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white truncate">
                        {pt.time.slice(0, 5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Min Today</span>
              <p className="font-bold text-slate-800 dark:text-white">{collar.temperature.minToday} °C</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Max Today</span>
              <p className="font-bold text-slate-800 dark:text-white">{collar.temperature.maxToday} °C</p>
            </div>
          </div>
        </div>

        {/* Sensor 2: MPU6050 6-Axis Motion & Activity */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">MPU6050 Motion Sensor</h4>
                  <p className="text-[10px] text-slate-400 font-mono">I2C (GPIO6 SCL, GPIO7 SDA)</p>
                </div>
              </div>

              <span className="rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                {collar.motion.activityLevel}
              </span>
            </div>

            {/* Accelerometer 3-Axis Live Gauges */}
            <div className="my-3 space-y-2.5">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Accel X: {collar.motion.accelX} g</span>
                  <span className="font-mono text-[10px] text-slate-400">Lateral</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${Math.abs(collar.motion.accelX) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Accel Y: {collar.motion.accelY} g</span>
                  <span className="font-mono text-[10px] text-slate-400">Longitudinal</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${Math.abs(collar.motion.accelY) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Accel Z: {collar.motion.accelZ} g</span>
                  <span className="font-mono text-[10px] text-slate-400">Vertical Gravity</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.abs(collar.motion.accelZ) * 80)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tremor and Fall Detection Alerts */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block">Tremor / Seizure</span>
                <p className={`font-bold mt-0.5 ${collar.motion.tremorDetected ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>
                  {collar.motion.tremorDetected ? '🚨 Spike Detected' : '✓ Normal'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block">Gait / Step Count</span>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">{collar.motion.stepCount.toLocaleString()} Steps</p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Gyro: X:{collar.motion.gyroX}°/s Y:{collar.motion.gyroY}°/s</span>
            <span className="text-emerald-600 font-bold">Stable</span>
          </div>
        </div>

        {/* Sensor 3: ATGM336H GPS & Safe Geofencing */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">ATGM336H GPS Module</h4>
                  <p className="text-[10px] text-slate-400 font-mono">UART (GPIO4 RX, GPIO5 TX)</p>
                </div>
              </div>

              <span className="rounded-xl bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
                {collar.gps.geofenceStatus}
              </span>
            </div>

            {/* Coordinates Box */}
            <div className="my-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Latitude:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">{collar.gps.latitude.toFixed(4)}° N</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Longitude:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">{collar.gps.longitude.toFixed(4)}° E</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Altitude / Speed:</span>
                <span className="font-bold text-slate-800 dark:text-white">{collar.gps.altitudeM} m • {collar.gps.speedKmh} km/h</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Location:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 truncate ml-2">{collar.gps.lastLocationName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Satellites: <strong className="text-slate-700 dark:text-slate-200">{collar.gps.satellites} Locked</strong></span>
            <span className="font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1">
              <Radio className="h-3.5 w-3.5" /> Geofence Active
            </span>
          </div>
        </div>
      </div>

      {/* Remote Collar Actuator Command Bar (Doctor Hardware Control) */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Doctor Remote Collar Command Center</h4>
              <p className="text-[10px] text-slate-400 font-mono">Real-time MQTT Actuator Trigger (GPIO10 2N2222 Buzzer & GPIO1,2,3 RGB LED)</p>
            </div>
          </div>

          {buzzerMessage && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 animate-fade-in">
              {buzzerMessage}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Action 1: Trigger Buzzer Beep */}
          <button
            type="button"
            onClick={playBuzzerBeep}
            className={`flex items-center justify-center gap-2 rounded-2xl p-3.5 text-xs font-bold transition-all ${
              isBuzzerPlaying
                ? 'bg-red-600 text-white scale-105 shadow-lg shadow-red-600/30'
                : 'border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300'
            }`}
          >
            <Volume2 className={`h-4 w-4 ${isBuzzerPlaying ? 'animate-bounce' : ''}`} />
            <span>{isBuzzerPlaying ? '🔊 Beeping 2.4kHz...' : 'Sound Locator Buzzer'}</span>
          </button>

          {/* Action 2: Set LED Green */}
          <button
            type="button"
            onClick={() => handleLedChange('Green')}
            className={`flex items-center justify-center gap-2 rounded-2xl p-3.5 text-xs font-bold transition-all ${
              activeLedColor === 'Green'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />
            <span>Collar LED: Healthy (Green)</span>
          </button>

          {/* Action 3: Set LED Blue */}
          <button
            type="button"
            onClick={() => handleLedChange('Blue')}
            className={`flex items-center justify-center gap-2 rounded-2xl p-3.5 text-xs font-bold transition-all ${
              activeLedColor === 'Blue'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/20'
                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-blue-500 shadow-sm" />
            <span>Collar LED: Sync (Blue)</span>
          </button>

          {/* Action 4: Set LED Red Alert */}
          <button
            type="button"
            onClick={() => handleLedChange('Red')}
            className={`flex items-center justify-center gap-2 rounded-2xl p-3.5 text-xs font-bold transition-all ${
              activeLedColor === 'Red'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/20 animate-pulse'
                : 'border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300'
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-rose-500 shadow-sm animate-ping" />
            <span>Collar LED: Alert (Red)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default IoTCollarLiveTelemetry;
