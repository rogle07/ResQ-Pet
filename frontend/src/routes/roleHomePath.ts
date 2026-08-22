import type { UserRole } from '@/types';

const ROLE_HOME: Record<UserRole, string> = {
  owner: '/owner',
  rescue_team: '/rescue-team',
  ngo: '/ngo',
  foster_home: '/foster-home',
  veterinarian: '/veterinarian',
  finder: '/finder',
  admin: '/admin',
};

export const roleHomePath = (role: UserRole) => ROLE_HOME[role];
