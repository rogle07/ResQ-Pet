import { Link } from 'react-router-dom';
import type { Pet } from '@/types';
import SignalIndicator from '@/components/ui/SignalIndicator';
import { petStatusToSignal, petStatusLabel } from '@/features/pets/petStatus';

interface PetCardProps {
  pet: Pet;
}

const PetCard = ({ pet }: PetCardProps) => {
  const cover = pet.images?.[0]?.url;

  return (
    <Link to={`/owner/pets/${pet._id}`} className="card group block transition-transform hover:-translate-y-0.5">
      <div className="mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-moss-100 dark:bg-moss-700/20">
        {cover ? (
          <img src={cover} alt={pet.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-3xl text-moss-500">
            {pet.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold">{pet.name}</h3>
          <p className="text-sm capitalize text-ink/60 dark:text-bone/60">
            {pet.breed || pet.species}{pet.age ? ` · ${pet.age}y` : ''}
          </p>
        </div>
        <SignalIndicator status={petStatusToSignal(pet.status)}>
          <span className="text-xs font-medium">{petStatusLabel[pet.status]}</span>
        </SignalIndicator>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="pet-tag">{pet.petId}</span>
        {pet.collar?.isActive && (
          <span className="text-xs text-mist-500">
            🔋 {pet.collar.lastBatteryPercent ?? '—'}%
          </span>
        )}
      </div>
    </Link>
  );
};

export default PetCard;
