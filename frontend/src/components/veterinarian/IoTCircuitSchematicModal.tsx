import React from 'react';
import { X, Cpu, Zap, Battery, Activity } from 'lucide-react';
import { ESP32_C3_PIN_CONNECTIONS } from '@/data/veterinarianMockData';

interface IoTCircuitSchematicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IoTCircuitSchematicModal: React.FC<IoTCircuitSchematicModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-950/40">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                ResQPet IoT Smart Pet Collar – Circuit Design & Telemetry Blueprint
              </h3>
              <p className="text-xs text-emerald-400 font-mono">ESP32-C3 Based Smart Collar • Hardware Revision 2.4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Top Hardware Architecture Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Core MCU & Connectivity */}
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                  <Cpu className="h-4 w-4" /> Microcontroller Unit
                </span>
                <span className="font-mono text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-800">
                  ESP32-C3 SuperMini
                </span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <p>• <strong>Core:</strong> RISC-V 32-bit single-core @ 160 MHz</p>
                <p>• <strong>Wireless:</strong> Wi-Fi 802.11 b/g/n (2.4GHz) + BLE 5.0</p>
                <p>• <strong>Memory:</strong> 400KB SRAM, 4MB SPI Flash</p>
                <p>• <strong>Protocols:</strong> MQTT / WebSockets / HTTPS Telemetry</p>
              </div>
            </div>

            {/* Box 2: Sensors & Peripherals */}
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-blue-400 text-xs flex items-center gap-1.5">
                  <Activity className="h-4 w-4" /> Integrated Sensors
                </span>
                <span className="font-mono text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded-lg border border-blue-800">
                  3 Primary Modules
                </span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <p>• <strong className="text-amber-400">DS18B20 Temp:</strong> GPIO20 with 4.7kΩ pull-up probe</p>
                <p>• <strong className="text-blue-400">MPU6050 Motion:</strong> I2C GPIO6 (SCL), GPIO7 (SDA)</p>
                <p>• <strong className="text-purple-400">ATGM336H GPS:</strong> UART GPIO4 (RX), GPIO5 (TX)</p>
              </div>
            </div>

            {/* Box 3: Power Subsystem */}
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                  <Battery className="h-4 w-4" /> Power Circuit
                </span>
                <span className="font-mono text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-800">
                  TP4056 + 3.7V Li-Po
                </span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <p>• <strong>Charging:</strong> TP4056 5V USB Li-Po charge controller</p>
                <p>• <strong>Battery:</strong> 3.7V Li-Po (300–500mAh)</p>
                <p>• <strong>Regulation:</strong> AMS1117-3.3 for 3.3V stable MCU rail</p>
                <p>• <strong>5V Rail:</strong> Direct booster for 2N2222 audio buzzer</p>
              </div>
            </div>
          </div>

          {/* Interactive ESP32-C3 Pin Connection Table */}
          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" /> ESP32-C3 Pin Connection & Functionality Table
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">ESP32-C3 Pin</th>
                    <th className="p-3">Connected To</th>
                    <th className="p-3">Clinical / IoT Purpose</th>
                    <th className="p-3">Active State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {ESP32_C3_PIN_CONNECTIONS.map((pin, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/60">
                      <td className={`p-3 font-bold ${pin.color}`}>{pin.pin}</td>
                      <td className="p-3 text-slate-300 font-sans">{pin.connectedTo}</td>
                      <td className="p-3 text-slate-300 font-sans">{pin.purpose}</td>
                      <td className="p-3 text-emerald-400 font-bold">{pin.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Technical Specifications & Data Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Device Specifications */}
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs">
              <h5 className="font-bold text-slate-200 text-xs border-b border-slate-800 pb-1.5">
                Physical & Operating Specifications
              </h5>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div><span className="text-slate-500 block">Input Voltage:</span> 5V (via USB)</div>
                <div><span className="text-slate-500 block">Operating Voltage:</span> 3.3V DC</div>
                <div><span className="text-slate-500 block">PCB Dimensions:</span> 45mm x 30mm</div>
                <div><span className="text-slate-500 block">Enclosure Size:</span> 52mm x 32mm x 17mm</div>
                <div><span className="text-slate-500 block">Temp Sensor:</span> DS18B20 (Waterproof)</div>
                <div><span className="text-slate-500 block">Motion IMU:</span> MPU6050 (6-Axis)</div>
              </div>
            </div>

            {/* Telemetry Data Flow */}
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs">
              <h5 className="font-bold text-slate-200 text-xs border-b border-slate-800 pb-1.5">
                Clinical Telemetry Pipeline
              </h5>
              <div className="flex items-center justify-between text-center gap-2 pt-2">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex-1">
                  <span className="text-[10px] text-slate-400 block font-bold">1. Sensors</span>
                  <p className="text-[11px] font-bold text-white mt-0.5">GPS, IMU, Temp</p>
                </div>
                <span className="text-slate-600">➔</span>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex-1">
                  <span className="text-[10px] text-slate-400 block font-bold">2. ESP32-C3</span>
                  <p className="text-[11px] font-bold text-emerald-400 mt-0.5">Process & Wi-Fi</p>
                </div>
                <span className="text-slate-600">➔</span>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex-1">
                  <span className="text-[10px] text-slate-400 block font-bold">3. ResQPet Hub</span>
                  <p className="text-[11px] font-bold text-white mt-0.5">Live Vet Telemetry</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3 text-xs">
          <span className="text-slate-400">All grounds (GND) are common • 4.7kΩ pull-up active for 1-Wire DS18B20</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-md"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
export default IoTCircuitSchematicModal;
