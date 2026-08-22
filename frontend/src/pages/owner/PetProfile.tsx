import { useEffect, useState, type ChangeEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { petApi } from '@/features/pets/petApi';
import { petStatusToSignal, petStatusLabel } from '@/features/pets/petStatus';
import SignalIndicator from '@/components/ui/SignalIndicator';
import LoadingScreen from '@/components/ui/LoadingScreen';
import type { Pet } from '@/types';

const PetProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [vaccineName, setVaccineName] = useState('');

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const data = await petApi.getById(id);
    setPet(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!pet) return <p className="text-sm text-ink/60">Pet not found.</p>;

  const toggleLost = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const updated = pet.status === 'lost' ? await petApi.markSafe(id) : await petApi.markLost(id);
      setPet(updated);
    } finally {
      setActionLoading(false);
    }
  };

  const addVaccination = async () => {
    if (!id || !vaccineName.trim()) return;
    await petApi.addVaccination(id, { name: vaccineName.trim(), dateGiven: new Date().toISOString() });
    setVaccineName('');
    load();
  };

  const deletePet = async () => {
    if (!id) return;
    if (!confirm(`Remove ${pet.name}'s profile? This cannot be undone.`)) return;
    await petApi.remove(id);
    navigate('/owner/pets');
  };

  const uploadPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!id) return;
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setPhotoError('');
    setPhotoUploading(true);
    try {
      const updated = await petApi.update(id, { images: files });
      setPet(updated);
    } catch (err) {
      const apiError = (err as { response?: { data?: { message?: string } } }).response?.data;
      setPhotoError(apiError?.message || 'Could not upload the photo. Please try again.');
    } finally {
      setPhotoUploading(false);
      e.target.value = ''; // allow re-selecting the same file if needed
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/owner/pets" className="mb-4 inline-block text-sm text-moss-600 dark:text-moss-400 hover:underline">
        ← Back to My Pets
      </Link>

      <div className="card">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-moss-100 dark:bg-moss-700/30">
            {pet.images?.[0]?.url ? (
              <img src={pet.images[0].url} alt={pet.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-4xl text-moss-500 dark:text-moss-400">
                {pet.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-2xl font-semibold">{pet.name}</h1>
                <p className="text-sm capitalize text-ink/60 dark:text-bone/60">
                  {pet.breed || pet.species} · {pet.gender} {pet.age ? `· ${pet.age}y` : ''}
                </p>
              </div>
              <SignalIndicator status={petStatusToSignal(pet.status)}>
                <span className="text-sm font-medium">{petStatusLabel[pet.status]}</span>
              </SignalIndicator>
            </div>

            <div className="mt-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-moss-600 dark:text-moss-400 hover:underline">
                {photoUploading ? 'Uploading…' : pet.images?.length ? 'Change photo' : '+ Add a photo'}
                <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={photoUploading} />
              </label>
              {photoError && <p className="mt-1 text-xs text-coral-500">{photoError}</p>}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="pet-tag">{pet.petId}</span>
              {pet.collar?.isActive && (
                <span className="pet-tag">🔋 {pet.collar.lastBatteryPercent ?? '—'}%</span>
              )}
              {pet.color && <span className="pet-tag">{pet.color}</span>}
              {pet.weightKg && <span className="pet-tag">{pet.weightKg} kg</span>}
            </div>

            {pet.qrCode && (
              <div className="mt-4">
                <p className="label">QR tag</p>
                <img src={pet.qrCode} alt="Pet QR code" className="h-24 w-24 rounded-lg border border-ink/10 dark:border-bone/20 bg-white p-1" />
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={toggleLost} disabled={actionLoading} className={pet.status === 'lost' ? 'btn-primary' : 'btn-danger'}>
                {actionLoading ? 'Updating…' : pet.status === 'lost' ? 'Mark as safe' : 'Mark as lost'}
              </button>
              <Link to="/owner/tracking" className="btn-secondary">
                View live location
              </Link>
              <button onClick={deletePet} className="btn-secondary text-coral-600 dark:text-coral-400">
                Remove profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="mb-4 text-lg font-semibold">Vaccinations</h2>
        {pet.vaccinations.length === 0 ? (
          <p className="text-sm text-ink/60 dark:text-bone/60">No vaccination records yet.</p>
        ) : (
          <ul className="mb-4 space-y-2">
            {pet.vaccinations.map((v, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg bg-moss-50 px-3 py-2 text-sm dark:bg-moss-700/20 dark:text-bone">
                <span>{v.name}</span>
                {v.dateGiven && <span className="font-mono text-xs text-mist-500">{new Date(v.dateGiven).toLocaleDateString()}</span>}
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Vaccine name (e.g. Rabies)"
            value={vaccineName}
            onChange={(e) => setVaccineName(e.target.value)}
          />
          <button onClick={addVaccination} className="btn-secondary shrink-0">Add</button>
        </div>
      </div>

      {pet.medicalConditions.length > 0 && (
        <div className="card mt-6">
          <h2 className="mb-4 text-lg font-semibold">Medical conditions</h2>
          <ul className="space-y-2">
            {pet.medicalConditions.map((m, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium">{m.condition}</span>
                {m.notes && <span className="text-ink/60 dark:text-bone/60"> — {m.notes}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PetProfile;
