import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import {
  Cpu,
  Plus,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Wifi,
  WifiOff,
  Search,
} from 'lucide-react';

interface AdminDevice {
  _id: string;
  deviceId: string;
  deviceName: string;
  status: 'registered' | 'active' | 'offline' | 'unlinked';
  lastCommunicationAt: string | null;
  owner: { _id: string; name: string; email: string } | null;
  pet: { _id: string; name: string; species: string } | null;
  hardware?: { model: string; firmwareVersion: string; sensors: string[] };
  createdAt: string;
}

interface ProvisionResult {
  device: AdminDevice;
  deviceToken: string;
}

export default function AdminIoT() {
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Provision modal
  const [provisionOpen, setProvisionOpen] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [provisioning, setProvisioning] = useState(false);
  const [provisionResult, setProvisionResult] = useState<ProvisionResult | null>(null);
  const [provisionError, setProvisionError] = useState('');
  const [tokenCopied, setTokenCopied] = useState(false);

  // Rotate token
  const [rotatingDeviceId, setRotatingDeviceId] = useState<string | null>(null);
  const [rotateResult, setRotateResult] = useState<{ deviceId: string; token: string } | null>(null);
  const [rotateCopied, setRotateCopied] = useState(false);

  const loadDevices = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get<{ success: boolean; total: number; devices: AdminDevice[] }>(
        `/admin/iot/devices?${params}`
      );
      setDevices(data.devices);
      setTotal(data.total);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load devices';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleProvision = async () => {
    if (!ownerEmail.trim()) {
      setProvisionError('Owner email is required');
      return;
    }
    setProvisioning(true);
    setProvisionError('');
    try {
      const { data } = await api.post<{ success: boolean; device: AdminDevice; deviceToken: string }>(
        '/admin/iot/provision',
        { ownerEmail: ownerEmail.trim(), deviceName: deviceName.trim() || undefined }
      );
      setProvisionResult({ device: data.device, deviceToken: data.deviceToken });
      loadDevices();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setProvisionError(e.response?.data?.message || e.message || 'Provisioning failed');
    } finally {
      setProvisioning(false);
    }
  };

  const handleRotateToken = async (deviceId: string) => {
    if (!window.confirm(`Rotate the auth token for ${deviceId}? The current token will be immediately invalidated.`)) return;
    setRotatingDeviceId(deviceId);
    setRotateResult(null);
    try {
      const { data } = await api.post<{ success: boolean; deviceId: string; deviceToken: string }>(
        `/admin/iot/devices/${deviceId}/rotate-token`
      );
      setRotateResult({ deviceId: data.deviceId, token: data.deviceToken });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      alert(e.response?.data?.message || e.message || 'Token rotation failed');
    } finally {
      setRotatingDeviceId(null);
    }
  };

  const copyText = async (text: string, setCopied: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    registered: 'bg-blue-100 text-blue-800',
    offline: 'bg-yellow-100 text-yellow-800',
    unlinked: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Cpu className="text-green-600" size={26} />
            IoT Device Provisioning
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Admin-provision new ResQPet collar devices. Tokens are shown <strong>once</strong> — flash immediately into the ESP32.
          </p>
        </div>
        <button
          onClick={() => { setProvisionOpen(true); setProvisionResult(null); setProvisionError(''); setOwnerEmail(''); setDeviceName(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
        >
          <Plus size={16} /> Provision New Device
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
          <Search size={15} /> Filter:
        </div>
        {['', 'active', 'registered', 'offline', 'unlinked'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              statusFilter === s
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
        <button onClick={loadDevices} className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <RefreshCw size={14} /> Refresh
        </button>
        <span className="text-xs text-gray-400">{total} device{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Devices table */}
      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">Loading…</div>
      ) : devices.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Cpu size={40} className="mx-auto mb-3 opacity-30" />
          <p>No devices found. Provision the first one above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Device ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Pet</th>
                <th className="px-4 py-3 text-left">Last Seen</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {devices.map((d) => (
                <tr key={d._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-green-700">{d.deviceId}</td>
                  <td className="px-4 py-3 text-gray-700">{d.deviceName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {d.status === 'active' ? (
                        <Wifi size={12} className="text-green-500" />
                      ) : (
                        <WifiOff size={12} className="text-gray-400" />
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[d.status] || 'bg-gray-100 text-gray-700'}`}>
                        {d.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {d.owner ? (
                      <div>
                        <p className="font-medium text-gray-800">{d.owner.name}</p>
                        <p className="text-xs text-gray-400">{d.owner.email}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.pet ? d.pet.name : <span className="text-gray-400 text-xs">—</span>}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {d.lastCommunicationAt ? new Date(d.lastCommunicationAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRotateToken(d.deviceId)}
                      disabled={rotatingDeviceId === d.deviceId}
                      className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 disabled:opacity-50"
                      title="Rotate authentication token"
                    >
                      <RotateCcw size={13} />
                      {rotatingDeviceId === d.deviceId ? 'Rotating…' : 'Rotate Token'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded disabled:opacity-40">Prev</button>
          <span className="px-3 py-1 text-sm text-gray-600">Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={devices.length < 20} className="px-3 py-1 text-sm border rounded disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Rotated token result banner */}
      {rotateResult && (
        <div className="fixed inset-x-4 bottom-6 z-50 max-w-xl mx-auto bg-orange-50 border border-orange-300 rounded-xl shadow-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-orange-700 font-semibold">
            <AlertTriangle size={18} /> Token Rotated — Copy Now
          </div>
          <p className="text-xs text-orange-600">Device: <strong>{rotateResult.deviceId}</strong>. This new token is shown <strong>once only</strong>.</p>
          <div className="flex items-center gap-2 bg-white border border-orange-200 rounded-lg px-3 py-2 font-mono text-xs break-all">
            <span className="flex-1">{rotateResult.token}</span>
            <button onClick={() => copyText(rotateResult.token, setRotateCopied)} className="text-orange-500 hover:text-orange-700 flex-shrink-0">
              {rotateCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
          <button onClick={() => setRotateResult(null)} className="text-xs text-gray-500 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Provision Modal */}
      {provisionOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget && !provisionResult) setProvisionOpen(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            {!provisionResult ? (
              <>
                <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Cpu className="text-green-600" size={22} /> Provision New IoT Device
                </div>
                <p className="text-sm text-gray-500">
                  A unique Device ID and secure token will be generated. The token is returned <strong>once</strong> — flash it into the ESP32 immediately.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="owner@example.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Name <span className="text-gray-400">(optional)</span></label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="Smart Collar"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                {provisionError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <AlertTriangle size={15} /> {provisionError}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setProvisionOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    onClick={handleProvision}
                    disabled={provisioning}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                  >
                    {provisioning ? 'Provisioning…' : 'Generate Device'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-lg font-bold text-green-700">
                  <Check className="text-green-600" size={22} /> Device Provisioned
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Device ID</span>
                    <span className="font-mono font-bold text-green-700">{provisionResult.device.deviceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium">{provisionResult.device.deviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Owner</span>
                    <span className="font-medium">{provisionResult.device.owner?.email}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-orange-700 mb-1">
                    <AlertTriangle size={14} /> Device Token — Copy Now (shown once only)
                  </div>
                  <div className="flex items-center gap-2 bg-gray-900 text-green-300 rounded-lg px-3 py-2 font-mono text-xs break-all">
                    <span className="flex-1">{provisionResult.deviceToken}</span>
                    <button onClick={() => copyText(provisionResult.deviceToken, setTokenCopied)} className="flex-shrink-0">
                      {tokenCopied ? <Check size={15} className="text-green-400" /> : <Copy size={15} className="text-gray-400 hover:text-white" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Flash as <code className="bg-gray-100 px-1 rounded">DEVICE_TOKEN</code> in ESP32 firmware config.h. The backend stores only a hash — this string cannot be recovered.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                  <strong>Firmware setup:</strong> set <code>DEVICE_ID = "{provisionResult.device.deviceId}"</code> and <code>DEVICE_TOKEN</code> in firmware/include/config.h, then re-flash the ESP32.
                </div>

                <button
                  onClick={() => { setProvisionOpen(false); setProvisionResult(null); }}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
                >
                  Close — I have saved the token
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

