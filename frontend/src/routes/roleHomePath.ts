import type { UserRole } from '@/types';

const ROLE_HOME: Record<UserRole, string> = {
  lost_pet: '/lost-pet',
  owner: '/owner',
  finder: '/finder',
  rescue_team: '/rescue-team',
  ngo: '/ngo',
  adopter: '/adopter',
  foster_home: '/foster-home',
  donor: '/donor',
  admin: '/admin',
  veterinarian: '/veterinarian',
};

export const roleHomePath = (role: UserRole) => ROLE_HOME[role];
