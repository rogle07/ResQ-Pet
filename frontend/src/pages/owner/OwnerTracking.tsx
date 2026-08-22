import { useEffect, useState } from 'react';
import { petApi } from '@/features/pets/petApi';
import { getSocket } from '@/hooks/useSocket';
import LiveMap from '@/components/map/LiveMap';
import type { Pet } from '@/types';

interface GpsUpdatePayload {
  petId: string;
  lat: number;
  lng: number;
  batteryPercent?: number;
  temperatureC?: number;
  insideSafeZone: boolean;
}

const OwnerTracking = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [liveReading, setLiveReading] = useState<GpsUpdatePayload | null>(null);
  const [editingZone, setEditingZone] = useState(false);
  const [savingZone, setSavingZone] = useState(false);

  useEffect(() => {
    petApi.list().then((data) => {
      setPets(data);
      if (data.length > 0) setSelectedId(data[0]._id);
    });
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (payload: GpsUpdatePayload) => {
      if (payload.petId !== selectedId) return;
      setLiveLocation({ lat: payload.lat, lng: payload.lng });
      setLiveReading(payload);
    };

    socket.on('gps:update', handler);
    return () => {
      socket.off('gps:update', handler);
    };
  }, [selectedId]);

  const selectedPet = pets.find((p) => p._id === selectedId);

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

  if (pets.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-ink/70 dark:text-bone/70">Register a pet and link a collar to see live tracking.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-bone">Live Tracking</h2>
          <p className="text-sm text-slate-500 dark:text-bone/60">
            {liveReading ? 'Receiving live signal' : 'Showing last known location'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select className="input w-auto" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {pets.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          <button
            className={editingZone ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setEditingZone((v) => !v)}
          >
            {editingZone ? 'Done editing' : 'Edit safe zone'}
          </button>
        </div>
      </div>

      {selectedPet && (
        <>
          <LiveMap
            pet={selectedPet}
            liveLocation={liveLocation}
            editable={editingZone}
            onSafeZoneChange={saveSafeZone}
          />

          {editingZone && (
            <p className="mt-2 font-mono text-xs text-mist-500">
              {savingZone ? 'saving safe zone…' : 'tap the map to place the center of the safe zone'}
            </p>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="card">
              <p className="label">Battery</p>
              <p className="text-xl font-semibold text-slate-800 dark:text-bone">
                {liveReading?.batteryPercent ?? selectedPet.collar.lastBatteryPercent ?? '—'}%
              </p>
            </div>
            <div className="card">
              <p className="label">Temperature</p>
              <p className="text-xl font-semibold text-slate-800 dark:text-bone">{liveReading?.temperatureC ?? '—'}°C</p>
            </div>
            <div className="card">
              <p className="label">Safe zone status</p>
              <p className="text-xl font-semibold text-slate-800 dark:text-bone">
                {liveReading ? (liveReading.insideSafeZone ? 'Inside' : 'Outside') : '—'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerTracking;
