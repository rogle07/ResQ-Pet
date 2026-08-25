export type DonorTeamCategory = 'Rescue Team' | 'NGO Team' | 'Rescue Request Team' | 'Finder Team' | 'Patrons';

export interface SupportedTeam {
  id: string;
  name: DonorTeamCategory;
  title: string;
  description: string;
  avatar: string;
  iconType: 'shield' | 'heart-hand' | 'ambulance' | 'search' | 'crown';
  accentColor: string;
  totalRaised: number;
}

export interface DonorCampaign {
  id: string;
  title: string;
  category: 'Emergency Medical' | 'Shelter Support' | 'Food Drive' | 'Rescue Fleet' | 'Winter Care';
  description: string;
  targetAmount: number;
  raisedAmount: number;
  image: string;
  donorsCount: number;
  daysLeft: number;
  featured?: boolean;
}

export interface DonationRecord {
  id: string;
  receiptNumber: string;
  date: string;
  amount: number;
  campaignTitle: string;
  teamCategory: DonorTeamCategory;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet';
  status: 'Completed' | 'Processing' | 'Failed';
  taxExemptEligible: boolean;
  donorName: string;
  donorPan?: string;
  certificate80GUrl?: string;
}

export interface DonorImpactMetric {
  animalsRescued: number;
  medicalTreatments: number;
  shelterDays: number;
  volunteersEquipped: number;
  recoveryStoriesCount: number;
}

export interface DonorRewardBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedDate?: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Angel Patron';
}

export interface RecentDonorActivity {
  id: string;
  name: string;
  amount: number;
  timeAgo: string;
  avatarColor: string;
}
