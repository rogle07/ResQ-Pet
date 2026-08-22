import { useEffect, useState } from 'react';
import { ngoApi } from '@/features/ngo/ngoApi';
import type { Pet } from '@/types';

const NgoAnimals = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ngoApi.adoptablePets().then((data) => {
      setPets(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Animals Available for Adoption</h2>
      <p className="mt-1 text-sm text-ink/60 dark:text-bone/60">
        Pets listed by your organization or individual owners are shown here. To list a pet, open its profile
        from the owner side and mark it available for adoption.
      </p>

      {loading ? (
        <p className="mt-6 font-mono text-sm text-mist-500">loading…</p>
      ) : pets.length === 0 ? (
        <div className="card mt-6 text-center text-sm text-ink/60 dark:text-bone/60">
          No animals currently listed for adoption.
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <div key={pet._id} className="card">
              <div className="mb-3 aspect-[4/3] w-full overflow-hidden rounded-xl bg-moss-100 dark:bg-moss-700/20">
                {pet.images?.[0]?.url ? (
                  <img src={pet.images[0].url} alt={pet.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-display text-3xl text-moss-500">
                    {pet.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="font-semibold">{pet.name}</h3>
              <p className="text-sm capitalize text-ink/60 dark:text-bone/60">
                {pet.breed || pet.species}{pet.age ? ` · ${pet.age}y` : ''}
              </p>
              {pet.adoption?.description && (
                <p className="mt-2 text-sm text-ink/70 dark:text-bone/70">{pet.adoption.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NgoAnimals;
