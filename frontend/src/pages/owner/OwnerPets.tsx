import { useEffect, useState } from 'react';
import { petApi } from '@/features/pets/petApi';
import PetCard from '@/features/pets/PetCard';
import PetFormModal from '@/features/pets/PetFormModal';
import type { Pet } from '@/types';

const OwnerPets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  const loadPets = async () => {
    setLoading(true);
    try {
      const data = await petApi.list();
      setPets(data);
      setError('');
    } catch {
      setError('Could not load your pets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-bone">My Pets</h2>
          <p className="text-sm text-slate-500 dark:text-bone/60">{pets.length} registered</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          + Add pet
        </button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-coral-100 dark:bg-coral-950/50 px-3 py-2 text-sm text-coral-600 dark:text-coral-400 border border-coral-200 dark:border-coral-800/40">{error}</p>}

      {loading ? (
        <p className="font-mono text-sm text-mist-500">loading pets…</p>
      ) : pets.length === 0 ? (
        <div className="card text-center">
          <p className="text-ink/70 dark:text-bone/70">You haven't registered a pet yet.</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary mt-4">
            Register your first pet
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <PetCard key={pet._id} pet={pet} />
          ))}
        </div>
      )}

      <PetFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(pet) => setPets((prev) => [pet, ...prev])}
      />
    </div>
  );
};

export default OwnerPets;
