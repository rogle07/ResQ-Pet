import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Cpu,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { ESP32_C3_PIN_CONNECTIONS } from '@/data/veterinarianMockData';
import { IoTCircuitSchematicModal } from '@/components/veterinarian/IoTCircuitSchematicModal';

export const VeterinarianCollarDiagnostics = () => {
  const [pins] = useState(ESP32_C3_PIN_CONNECTIONS);
  const [isSchematicOpen, setIsSchematicOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [firmwareUpdateSuccess, setFirmwareUpdateSuccess] = useState(false);

  const handleRefreshDiagnostics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  const handleFlashFirmware = () => {
    setFirmwareUpdateSuccess(true);
    setTimeout(() => setFirmwareUpdateSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/veterinarian" className="hover:text-emerald-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">Collar Hardware Diagnostics</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            ESP32-C3 Hardware Diagnostics & Pinouts <Cpu className="h-6 w-6 text-emerald-600" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time GPIO voltage probe measurements, I2C bus latency, and OTA firmware updater
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSchematicOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl border border-emerald-600 bg-emerald-50/50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 transition-all"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" /> Full Circuit Blueprint
          </button>
          <button
            onClick={handleRefreshDiagnostics}
            className="flex items-center gap-1.5 rounded-2xl bg-[#1e6f42] px-4 py-2 text-xs font-bold text-white hover:bg-[#165a34] shadow-md shadow-emerald-950/20"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Scan Bus
          </button>
        </div>
      </div>

      {/* Hardware Specs Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Core MCU Chip</span>
          <p className="font-bold text-slate-900 dark:text-white text-sm">ESP32-C3 SuperMini</p>
          <p className="text-slate-500">RISC-V 32-bit @ 160MHz</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Supply Rail</span>
          <p className="font-bold text-emerald-600 text-sm">3.31 V Regulated</p>
          <p className="text-slate-500">AMS1117-3.3 Linear Regulator</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Wi-Fi / BLE RSSI</span>
          <p className="font-bold text-blue-600 text-sm">-56 dBm (Optimal)</p>
          <p className="text-slate-500">ResQPet Central IoT 2.4GHz</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Firmware</span>
          <p className="font-bold text-purple-600 text-sm">v2.4.1-C3</p>
          <p className="text-slate-500">OTA Active • FreeRTOS Kernel</p>
        </div>
      </div>

      {/* GPIO Pin Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-display text-base font-extrabold text-slate-800 dark:text-white">
            ESP32-C3 SuperMini GPIO Physical Pinout Status
          </h3>
          <span className="text-xs text-slate-400">All 12 Pin traces passing continuous continuity check</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-4">Pin Identifier</th>
                <th className="px-6 py-4">Peripheral Connection</th>
                <th className="px-6 py-4">Clinical / Telemetry Function</th>
                <th className="px-6 py-4">Bus State / Voltage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {pins.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-bold text-purple-600 dark:text-purple-400">{p.pin}</td>
                  <td className="px-6 py-4 font-sans text-slate-800 dark:text-slate-200">{p.connectedTo}</td>
                  <td className="px-6 py-4 font-sans text-slate-600 dark:text-slate-400">{p.purpose}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">{p.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Firmware OTA Box */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Over-The-Air (OTA) Fleet Firmware Updater</h4>
          <p className="text-xs text-slate-500 mt-0.5">Flash latest clinical monitoring telemetry patch across all 124 deployed ESP32-C3 collars</p>
        </div>
        <button
          onClick={handleFlashFirmware}
          className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-950/20 shrink-0"
        >
          {firmwareUpdateSuccess ? '✓ Fleet Updated (v2.4.1)' : 'Broadcast OTA Update'}
        </button>
      </div>

      <IoTCircuitSchematicModal
        isOpen={isSchematicOpen}
        onClose={() => setIsSchematicOpen(false)}
      />
    </div>
  );
};
export default VeterinarianCollarDiagnostics;
