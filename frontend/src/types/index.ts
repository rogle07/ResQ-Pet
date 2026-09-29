export type UserRole =
  | 'owner'
  | 'finder'
  | 'found_pet_reporter'
  | 'rescue_team'
  | 'ngo'
  | 'adopter'
  | 'foster_home'
  | 'donor'
  | 'admin'
  | 'veterinarian';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isEmailVerified: boolean;
  isProfileComplete: boolean;
  isActive?: boolean;
  ngoDetails?: { organizationName?: string; verified?: boolean };
  rescueTeamDetails?: { teamName?: string; verified?: boolean };
  fosterHomeDetails?: { capacity?: number; verified?: boolean };
  veterinarianDetails?: { clinicName?: string; licenseNumber?: string; verified?: boolean };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

export type PetSpecies = 'dog' | 'cat' | 'bird' | 'other';
export type PetStatus = 'safe' | 'lost' | 'found' | 'in_rescue' | 'in_foster' | 'adopted';

export interface PetImage {
  url: string;
  publicId: string;
}

export interface Vaccination {
  name: string;
  dateGiven?: string;
  nextDueDate?: string;
  administeredBy?: string;
}

export interface MedicalCondition {
  condition: string;
  diagnosedDate?: string;
  notes?: string;
}

export interface SafeZone {
  enabled: boolean;
  center?: { lat: number; lng: number };
  radiusMeters: number;
}

export interface Pet {
  _id: string;
  petId: string;
  owner: string | { _id: string; name: string; email?: string; phone?: string };
  name: string;
  species: PetSpecies;
  breed?: string;
  age?: number;
  gender: 'male' | 'female' | 'unknown';
  color?: string;
  weightKg?: number;
  images: PetImage[];
  qrCode?: string;
  vaccinations: Vaccination[];
  medicalConditions: MedicalCondition[];
  collar: {
    deviceId?: string;
    isActive: boolean;
    lastBatteryPercent?: number;
    lastSeenAt?: string;
  };
  safeZone: SafeZone;
  status: PetStatus;
  adoption?: { isAvailable: boolean; description?: string };
  lastKnownLocation?: { lat: number; lng: number; updatedAt: string };
  createdAt: string;
}

export interface GpsLogEntry {
  _id: string;
  lat: number;
  lng: number;
  speedKmh?: number;
  batteryPercent?: number;
  temperatureC?: number;
  insideSafeZone: boolean;
  recordedAt: string;
}

export type FoundReportStatus =
  | 'pending'
  | 'under_review'
  | 'owner_match_found'
  | 'rescue_assigned'
  | 'reunited'
  | 'closed'
  | 'unclaimed'
  | 'matched'
  | 'claimed';

export interface FoundReport {
  _id: string;
  reportedBy: { _id: string; name: string; phone?: string; email?: string };
  matchedPet?: { _id: string; name: string; species: string; images: { url: string }[]; owner: string };
  photos: { url: string; publicId?: string }[];
  description: string;
  contactPhone: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  foundAt: string;
  timeFound?: string;
  species: string;
  breed?: string;
  approximateAge?: string;
  gender?: 'male' | 'female' | 'unknown';
  currentPetLocation?: string;
  condition?: string;
  additionalNotes?: string;
  status: FoundReportStatus;
  createdAt: string;
}
