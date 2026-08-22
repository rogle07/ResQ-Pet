export interface HealthInfo {
  vaccinated: boolean;
  neutered: boolean;
  medicalNeeds: string;
  diet: string;
  temperament: string[];
}

export interface FosterMessage {
  id: string;
  sender: 'user' | 'requester';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface FosterItem {
  id: string;
  petName: string;
  species: 'Dog' | 'Cat' | 'Rabbit' | 'Goat' | 'Cow' | 'Other';
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  location: string;
  image: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string;
  requesterAddress: string;
  requestDate: string;
  timeAgo: string;
  status: 'New' | 'Under Review' | 'Accepted' | 'Rejected' | 'Completed';
  urgency: 'Low' | 'Normal' | 'Medium' | 'High';
  durationDays: number;
  reason: string;
  healthInfo: HealthInfo;
  messages: FosterMessage[];
}

export interface AdoptablePet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  image: string;
  location: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  requestedDate?: string;
  reason?: string;
  vaccinated: boolean;
  neutered: boolean;
  goodWithKids: boolean;
  goodWithPets: boolean;
  weightKg: number;
  story: string;
  healthStatus: string;
  diet: string;
  isFavorite?: boolean;
}

export interface DonationRecord {
  id: string;
  receiptNumber: string;
  date: string;
  forCategory: 'Food Support' | 'Medical Support' | 'Shelter Support' | 'General Support';
  type: 'One-time' | 'Monthly';
  amount: number;
  paymentMethod: 'UPI' | 'Card' | 'Net Banking';
  status: 'Success' | 'Pending' | 'Failed';
  donorName: string;
  donorEmail: string;
  taxExemptNumber?: string;
}

export interface AnimalWiseStats {
  species: string;
  count: number;
  icon: string;
  color: string;
}

export interface FosterStats {
  totalFostered: number;
  totalAdoptions: number;
  totalDonations: number;
  activeFosters: number;
  monthlyOverview: { month: string; fostered: number; adopted: number }[];
  donationsOverview: { month: string; amount: number }[];
  animalWise: AnimalWiseStats[];
}

export interface FosterNotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'request' | 'medical' | 'message' | 'system';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
