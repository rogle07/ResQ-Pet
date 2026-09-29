import { api } from '@/api/client';
import type { FoundReport } from '@/types';

export const foundReportApi = {
  list: (params?: { status?: string; species?: string; mine?: boolean }) =>
    api
      .get<{ success: true; count: number; reports: FoundReport[] }>('/found-reports', {
        params: {
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.species ? { species: params.species } : {}),
          ...(params?.mine ? { mine: 'true' } : {}),
        },
      })
      .then((r) => r.data.reports),

  getById: (id: string) =>
    api.get<{ success: true; report: FoundReport }>(`/found-reports/${id}`).then((r) => r.data.report),

  create: (payload: {
    photos: File[];
    description: string;
    contactPhone: string;
    lat?: number;
    lng?: number;
    address?: string;
    foundAt?: string;
    timeFound?: string;
    species?: string;
    breed?: string;
    approximateAge?: string;
    gender?: string;
    currentPetLocation?: string;
    condition?: string;
    additionalNotes?: string;
    requestRescue?: boolean;
    pickupAddress?: string;
  }) => {
    const fd = new FormData();
    fd.append('description', payload.description);
    fd.append('contactPhone', payload.contactPhone);
    fd.append('lat', String(payload.lat ?? 28.6139));
    fd.append('lng', String(payload.lng ?? 77.2090));
    if (payload.address) fd.append('address', payload.address);
    if (payload.foundAt) fd.append('foundAt', payload.foundAt);
    if (payload.timeFound) fd.append('timeFound', payload.timeFound);
    if (payload.species) fd.append('species', payload.species);
    if (payload.breed) fd.append('breed', payload.breed);
    if (payload.approximateAge) fd.append('approximateAge', payload.approximateAge);
    if (payload.gender) fd.append('gender', payload.gender);
    if (payload.currentPetLocation) fd.append('currentPetLocation', payload.currentPetLocation);
    if (payload.condition) fd.append('condition', payload.condition);
    if (payload.additionalNotes) fd.append('additionalNotes', payload.additionalNotes);
    if (payload.requestRescue) fd.append('requestRescue', 'true');
    if (payload.pickupAddress) fd.append('pickupAddress', payload.pickupAddress);

    for (const file of payload.photos) {
      fd.append('photos', file);
    }

    return api
      .post<{ success: true; report: FoundReport; possibleMatchCount?: number }>('/found-reports', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.report);
  },

  claim: (id: string, payload: { petId?: string; note?: string }) =>
    api.post<{ success: true; report: FoundReport }>(`/found-reports/${id}/claim`, payload).then((r) => r.data.report),

  updateStatus: (id: string, status: string, matchedPetId?: string) =>
    api
      .put<{ success: true; report: FoundReport }>(`/found-reports/${id}/status`, { status, matchedPetId })
      .then((r) => r.data.report),
};
