import type { UserRole } from '@/types';

const ROLE_HOME: Record<UserRole, string> = {
  owner: '/owner',
  finder: '/finder',
  found_pet_reporter: '/found-pet-reporter',
  rescue_team: '/rescue-team',
  ngo: '/ngo',
  adopter: '/donor',
  foster_home: '/foster-home',
  donor: '/donor',
  admin: '/admin',
  veterinarian: '/veterinarian',
};

export const roleHomePath = (role: UserRole) => ROLE_HOME[role];
