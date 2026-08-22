import type { PetStatus } from '@/types';

export type SignalStatus = 'safe' | 'idle' | 'lost';

export const petStatusToSignal = (status: PetStatus): SignalStatus => {
  if (status === 'lost') return 'lost';
  if (status === 'safe' || status === 'adopted') return 'safe';
  return 'idle'; // found, in_rescue, in_foster
};

export const petStatusLabel: Record<PetStatus, string> = {
  safe: 'Safe',
  lost: 'Lost',
  found: 'Found',
  in_rescue: 'In Rescue',
  in_foster: 'In Foster',
  adopted: 'Adopted',
};
