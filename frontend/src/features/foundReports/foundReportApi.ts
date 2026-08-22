import { api } from '@/api/client';

export interface FoundReport {
  _id: string;
  reportedBy: { _id: string; name: string; phone?: string };
  matchedPet?: { _id: string; name: string; species: string; images: { url: string }[] };
  photos: { url: string }[];
  description: string;
  contactPhone: string;
  location: { lat: number; lng: number; address?: string };
  foundAt: string;
  species?: string;
  status: 'unclaimed' | 'matched' | 'claimed' | 'closed';
  createdAt: string;
}

export interface CreateFoundReportPayload {
  description: string;
  contactPhone: string;
  lat: number;
  lng: number;
  address?: string;
  species?: string;
  photos?: File[];
  requestRescue?: boolean;
  pickupAddress?: string;
}

export const foundReportApi = {
  list: (status?: string) =>
    api
      .get<{ success: true; reports: FoundReport[] }>('/found-reports', { params: status ? { status } : {} })
      .then((r) => r.data.reports),

  create: (payload: CreateFoundReportPayload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined) return;
      if (key === 'photos') {
        (value as File[]).forEach((file) => formData.append('photos', file));
      } else {
        formData.append(key, String(value));
      }
    });
    return api
      .post<{ success: true; report: FoundReport; possibleMatchCount: number; rescueRequest?: unknown }>('/found-reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
