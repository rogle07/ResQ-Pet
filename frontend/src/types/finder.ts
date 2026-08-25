export type FinderAnimalType = 'Dog' | 'Cat' | 'Cow' | 'Bird' | 'Goat' | 'Rabbit' | 'Other';

export type FinderCondition = 'Injured' | 'Trapped' | 'Sick' | 'Abandoned' | 'Stray';

export type FinderPriority = 'High Priority' | 'Medium Priority' | 'Low Priority';

export type FinderReportStatus = 'Under Review' | 'Verified' | 'Assigned' | 'Rescued' | 'In Shelter' | 'Reunited';

export interface FinderTimelineStep {
  step: string;
  description: string;
  time?: string;
  completed: boolean;
  active?: boolean;
}

export interface FinderReport {
  id: string;
  reportCode: string;
  title: string;
  animalType: FinderAnimalType;
  condition: FinderCondition;
  priority: FinderPriority;
  status: FinderReportStatus;
  location: {
    address: string;
    city: string;
    lat: number;
    lng: number;
  };
  approxAge: string;
  description: string;
  image: string;
  additionalImages?: string[];
  reportedAt: string;
  reportedTimeAgo: string;
  reporter: {
    name: string;
    phone: string;
    email?: string;
  };
  assignedTeam?: {
    name: string;
    contact: string;
    vehicleNumber?: string;
  };
  shelter?: {
    name: string;
    location: string;
  };
  timeline: FinderTimelineStep[];
}

export interface FinderPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  authorAvatar?: string;
  category: 'Safety Tip' | 'Rescue Story' | 'Adoption Appeal' | 'First Aid';
  likes: number;
  comments: number;
  date: string;
  image?: string;
}

export interface FinderMessage {
  id: string;
  sender: 'finder' | 'rescue_team' | 'ngo';
  senderName: string;
  text: string;
  timestamp: string;
  reportId?: string;
  isRead: boolean;
}

export interface FinderResourceGuide {
  id: string;
  title: string;
  category: 'Emergency First Aid' | 'Handling Strays' | 'Legal Rights' | 'Shelter Directory';
  iconName: string;
  readTime: string;
  summary: string;
  detailedSteps: string[];
  helpline?: string;
}

export interface FinderRewardLevel {
  currentPoints: number;
  targetPoints: number;
  title: string;
  badgeName: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Hero';
  perks: string[];
}
