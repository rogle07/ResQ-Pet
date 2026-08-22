import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Pet } from '@/types';

interface LiveMapProps {
  pet: Pet;
  liveLocation: { lat: number; lng: number } | null;
  onSafeZoneChange?: (center: { lat: number; lng: number }, radiusMeters: number) => void;
  editable?: boolean;
}

// Custom marker built from the app's own design tokens instead of Leaflet's
// default pin image - this also avoids the well-known Leaflet + bundler
// issue where the default marker icon fails to resolve its image path.
const createPetIcon = (initial: string) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:34px;height:34px;border-radius:9999px;
      background:#4C6B52;color:#F6F3EC;
      display:flex;align-items:center;justify-content:center;
      font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:15px;
      border:2px solid #F6F3EC;box-shadow:0 2px 8px rgba(20,26,27,0.35);
    ">${initial}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

/** Invisible helper that listens for map clicks - used to place the safe zone center. */
const ClickHandler = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LiveMap = ({ pet, liveLocation, onSafeZoneChange, editable = false }: LiveMapProps) => {
  const fallbackCenter = { lat: 28.6139, lng: 77.209 };
  const currentLocation = liveLocation || pet.lastKnownLocation || fallbackCenter;
  const [radius, setRadius] = useState(pet.safeZone?.radiusMeters || 200);

  return (
    <div className="relative">
      <MapContainer
        center={[currentLocation.lat, currentLocation.lng]}
        zoom={15}
        style={{ width: '100%', height: '420px', borderRadius: '1rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[currentLocation.lat, currentLocation.lng]} icon={createPetIcon(pet.name.charAt(0))} />

        {pet.safeZone?.enabled && pet.safeZone.center && (
          <Circle
            center={[pet.safeZone.center.lat, pet.safeZone.center.lng]}
            radius={radius}
            pathOptions={{ color: '#4C6B52', fillColor: '#4C6B52', fillOpacity: 0.12, weight: 2 }}
          />
        )}

        {editable && onSafeZoneChange && (
          <ClickHandler onClick={(lat, lng) => onSafeZoneChange({ lat, lng }, radius)} />
        )}
      </MapContainer>

      {editable && (
        <div className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white/95 p-3 shadow-tag dark:bg-ink-soft/95 dark:text-bone dark:border dark:border-bone/15 backdrop-blur-sm">
          <label className="text-xs font-medium text-slate-800 dark:text-bone block mb-1">Safe zone radius: {radius}m</label>
          <input
            type="range"
            min={50}
            max={2000}
            step={50}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="block w-40 accent-moss-500"
          />
        </div>
      )}
    </div>
  );
};

export default LiveMap;
