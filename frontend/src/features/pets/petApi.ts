import { api } from '@/api/client';
import type { Pet, GpsLogEntry } from '@/types';

export interface CreatePetPayload {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  gender?: string;
  color?: string;
  weightKg?: number;
  images?: File[];
}

const toFormData = (payload: CreatePetPayload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'images') {
      (value as File[]).forEach((file) => formData.append('images', file));
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};

export const petApi = {
  list: () => api.get<{ success: true; pets: Pet[] }>('/pets').then((r) => r.data.pets),

  getById: (id: string) => api.get<{ success: true; pet: Pet }>(`/pets/${id}`).then((r) => r.data.pet),

  create: (payload: CreatePetPayload) =>
    api
      .post<{ success: true; pet: Pet }>('/pets', toFormData(payload), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.pet),

  update: (id: string, payload: Partial<CreatePetPayload>) =>
    api
      .put<{ success: true; pet: Pet }>(`/pets/${id}`, toFormData(payload as CreatePetPayload), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.pet),

  remove: (id: string) => api.delete(`/pets/${id}`).then((r) => r.data),

  addVaccination: (id: string, payload: { name: string; dateGiven?: string; nextDueDate?: string; administeredBy?: string }) =>
    api.post(`/pets/${id}/vaccinations`, payload).then((r) => r.data),

  setSafeZone: (id: string, payload: { enabled: boolean; lat: number; lng: number; radiusMeters: number }) =>
    api.put<{ success: true; safeZone: Pet['safeZone'] }>(`/pets/${id}/safe-zone`, payload).then((r) => r.data.safeZone),

  markLost: (id: string) => api.post<{ success: true; pet: Pet }>(`/pets/${id}/mark-lost`).then((r) => r.data.pet),

  markSafe: (id: string) => api.post<{ success: true; pet: Pet }>(`/pets/${id}/mark-safe`).then((r) => r.data.pet),

  linkDevice: (petId: string, deviceId: string) =>
    api.post('/iot/link-device', { petId, deviceId }).then((r) => r.data),

  getGpsHistory: (petId: string, limit = 200) =>
    api.get<{ success: true; logs: GpsLogEntry[] }>(`/iot/history/${petId}`, { params: { limit } }).then((r) => r.data.logs),
};
