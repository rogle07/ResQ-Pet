const EARTH_RADIUS_METERS = 6371000;

const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Returns distance in meters between two lat/lng points using the Haversine formula.
 */
const distanceInMeters = (lat1, lng1, lat2, lng2) => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
};

const isInsideSafeZone = (lat, lng, safeZone) => {
  if (!safeZone?.enabled || !safeZone.center?.lat || !safeZone.center?.lng) return true;
  const dist = distanceInMeters(lat, lng, safeZone.center.lat, safeZone.center.lng);
  return dist <= (safeZone.radiusMeters || 200);
};

module.exports = { distanceInMeters, isInsideSafeZone };
