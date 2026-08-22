import { api } from '@/api/client';
import type { Pet } from '@/types';

export interface NgoDashboardSummary {
  animalsManaged: number;
  pendingAdoptions: number;
  activeRescues: number;
  totalDonations: number;
}

export interface AdoptionApplication {
  _id: string;
  pet: { _id: string; name: string; species: string; breed?: string; images: { url: string }[] };
  applicant: { _id: string; name: string; phone?: string; email?: string };
  applicationNote?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
}

export const ngoApi = {
  dashboard: () => api.get<{ success: true; summary: NgoDashboardSummary }>('/ngo/dashboard').then((r) => r.data.summary),

  adoptablePets: (listedByMe = false) =>
    api
      .get<{ success: true; pets: Pet[] }>('/adoption/pets')
      .then((r) => (listedByMe ? r.data.pets : r.data.pets)),

  listPetForAdoption: (petId: string, description: string) =>
    api.put(`/adoption/pets/${petId}/list`, { description }).then((r) => r.data),

  getAdoptions: (status?: string) =>
    api
      .get<{ success: true; adoptions: AdoptionApplication[] }>('/adoption', { params: status ? { status } : {} })
      .then((r) => r.data.adoptions),

  decideAdoption: (id: string, decision: 'approved' | 'rejected', decisionNote?: string) =>
    api.put(`/adoption/${id}/decision`, { decision, decisionNote }).then((r) => r.data),
};
