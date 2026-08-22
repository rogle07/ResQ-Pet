import { api } from '@/api/client';

export interface MedicalRecord {
  _id: string;
  pet: string;
  veterinarian?: { _id: string; name: string };
  visitDate: string;
  diagnosis?: string;
  treatment?: string;
  prescriptions?: { name: string; dosage?: string; durationDays?: number }[];
  notes?: string;
  followUpDate?: string;
}

export const medicalApi = {
  getForPet: (petId: string) =>
    api
      .get<{ success: true; records: MedicalRecord[] }>(`/ngo/medical-records/${petId}`)
      .then((r) => r.data.records),

  addRecord: (payload: {
    petId: string;
    diagnosis?: string;
    treatment?: string;
    notes?: string;
    followUpDate?: string;
  }) => api.post<{ success: true; record: MedicalRecord }>('/ngo/medical-records', payload).then((r) => r.data.record),
};
