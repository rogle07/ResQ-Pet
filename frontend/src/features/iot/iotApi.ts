import { api } from '@/api/client';

export interface IoTDeviceData {
  _id: string;
  deviceId: string;
  deviceName: string;
  status: 'registered' | 'active' | 'offline' | 'unlinked';
  connectionStatus: 'online' | 'offline' | 'pending_connection' | 'not_registered';
  lastCommunicationAt: string | null;
  pet?: {
    _id: string;
    name: string;
    species: string;
    breed?: string;
    status?: string;
    images?: Array<{ url: string } | string>;
    collar?: {
      deviceId?: string;
      isActive?: boolean;
      lastSeenAt?: string;
    };
    lastKnownLocation?: {
      lat: number;
      lng: number;
      updatedAt?: string;
    };
  } | null;
  lastReading?: SensorReadingData | null;
  lastValidGps?: {
    latitude: number | null;
    longitude: number | null;
    altitude?: number | null;
    speed?: number | null;
    satellites?: number;
    recordedAt?: string | null;
  } | null;
  hardware?: {
    model: string;
    sensors: string[];
    firmwareVersion: string;
  };
  createdAt?: string;
}

export interface SensorReadingData {
  _id?: string;
  deviceId: string;
  pet?: string;
  temperature: number | null;
  humidity: number | null;
  motion: {
    accelerationX: number | null;
    accelerationY: number | null;
    accelerationZ: number | null;
    totalAcceleration: number | null;
    gyroscopeX: number | null;
    gyroscopeY: number | null;
    gyroscopeZ: number | null;
    movementEstimate: number | null;
    activityStatus: string;
  };
  gps: {
    latitude: number | null;
    longitude: number | null;
    fixValid: boolean;
    satellites: number;
    altitude?: number | null;
    speed?: number | null;
  };
  recordedAt?: string;
  timestamp?: string;
}

export interface RegisterDevicePayload {
  deviceId?: string;
  deviceName?: string;
  petId?: string;
}

export interface RegisterDeviceResponse {
  success: boolean;
  message: string;
  device: {
    _id: string;
    deviceId: string;
    deviceName: string;
    status: string;
    connectionStatus: string;
    pet?: { _id: string; name: string } | null;
  };
  deviceToken: string;
}

export const iotApi = {
  getDevices: async () => {
    const res = await api.get<{ success: boolean; count: number; devices: IoTDeviceData[] }>('/iot/devices');
    return res.data.devices;
  },

  registerDevice: async (payload: RegisterDevicePayload) => {
    const res = await api.post<RegisterDeviceResponse>('/iot/devices/register', payload);
    return res.data;
  },

  assignDevice: async (deviceId: string, petId: string) => {
    const res = await api.post<{ success: boolean; message: string }>('/iot/devices/assign', { deviceId, petId });
    return res.data;
  },

  unlinkDevice: async (deviceId: string) => {
    const res = await api.post<{ success: boolean; message: string }>('/iot/devices/unlink', { deviceId });
    return res.data;
  },

  regenerateToken: async (deviceId: string) => {
    const res = await api.post<{ success: boolean; message: string; deviceToken: string }>(
      `/iot/devices/${deviceId}/regenerate-token`
    );
    return res.data;
  },

  deleteDevice: async (deviceId: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/iot/devices/${deviceId}`);
    return res.data;
  },

  getLatestTelemetry: async (petId: string) => {
    const res = await api.get<{
      success: boolean;
      pet: {
        _id: string;
        name: string;
        species: string;
        lastKnownLocation?: { lat: number; lng: number; updatedAt?: string };
        safeZone?: { enabled: boolean; center?: { lat: number; lng: number }; radiusMeters?: number };
      };
      device: IoTDeviceData | null;
      reading: SensorReadingData | null;
    }>(`/iot/latest/${petId}`);
    return res.data;
  },

  getHistory: async (petId: string, limit = 60) => {
    const res = await api.get<{ success: boolean; count: number; readings: SensorReadingData[] }>(
      `/iot/history/${petId}`,
      { params: { limit } }
    );
    return res.data.readings;
  },
};

