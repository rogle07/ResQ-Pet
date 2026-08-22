import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { fosterApi, type FosterRequest } from '@/features/foster/fosterApi';
import { petApi } from '@/features/pets/petApi';
import type { Pet } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';

interface FosterFormValues {
  petId: string;
  reason: string;
  durationDays: number | '';
}

const OwnerFoster = () => {
  const [requests, setRequests] = useState<FosterRequest[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FosterFormValues>({
    defaultValues: { petId: '', reason: '', durationDays: '' },
  });

  const load = async () => {
    setLoading(true);
    try {
      const [reqs, myPets] = await Promise.all([fosterApi.list(), petApi.list()]);
      setRequests(reqs);
      setPets(myPets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const closeModal = () => {
    reset();
    setServerError('');
    setModalOpen(false);
  };

  const onSubmit = async (values: FosterFormValues) => {
    setServerError('');
    try {
      const created = await fosterApi.create({
        petId: values.petId,
        reason: values.reason || undefined,
        durationDays: values.durationDays === '' ? undefined : Number(values.durationDays),
      });
      setRequests((prev) => [created, ...prev]);
      closeModal();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not submit foster request. Please try again.';
      setServerError(msg);
    }
  };

  const statusColor: Record<string, string> = {
    pending: 'text-brass-600 dark:text-brass-400',
    accepted: 'text-moss-600 dark:text-moss-400',
    active: 'text-moss-700 dark:text-moss-300',
    rejected: 'text-coral-600 dark:text-coral-400',
    completed: 'text-mist-500 dark:text-mist-400',
    cancelled: 'text-mist-500 dark:text-mist-400',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-bone">Foster Care Requests</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-bone/60">
            Temporarily place a pet with a foster home while you're away or unable to care for them.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          + Request foster care
        </button>
      </div>

      {/* Request list */}
      {loading ? (
        <p className="font-mono text-sm text-mist-500">loading…</p>
      ) : requests.length === 0 ? (
        <div className="card text-center">
          <p className="text-ink/70 dark:text-bone/70">You have no foster care requests yet.</p>
          <p className="mt-1 text-sm text-ink/50 dark:text-bone/50">
            Request a foster home to temporarily care for one of your pets.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn-primary mt-4">
            Request foster care
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req._id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {/* Pet name + species */}
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate text-slate-800 dark:text-bone">{req.pet.name}</p>
                    <span className="rounded-full bg-mist-100 px-2 py-0.5 text-xs capitalize text-mist-700 dark:bg-mist-700/20 dark:text-mist-300">
                      {req.pet.species}
                    </span>
                  </div>

                  {/* Foster provider */}
                  {req.fosterProvider ? (
                    <p className="mt-0.5 text-sm text-ink/70 dark:text-bone/70">
                      Foster home: <span className="font-medium">{req.fosterProvider.name}</span>
                    </p>
                  ) : (
                    <p className="mt-0.5 text-sm text-ink/50 dark:text-bone/50">Waiting for a foster home to accept</p>
                  )}

                  {/* Reason */}
                  {req.reason && (
                    <p className="mt-1 text-sm text-ink/60 dark:text-bone/60 line-clamp-2">{req.reason}</p>
                  )}

                  {/* Duration */}
                  {req.durationDays && (
                    <p className="mt-1 text-xs text-ink/50 dark:text-bone/50">
                      Duration: ~{req.durationDays} day{req.durationDays !== 1 ? 's' : ''}
                    </p>
                  )}

                  {/* Date */}
                  <p className="mt-1 text-xs text-mist-500">
                    Requested {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  <StatusBadge status={req.status} />
                  {req.status in statusColor && (
                    <p className={`mt-1 text-center text-xs font-medium capitalize ${statusColor[req.status]}`}>
                      {req.status}
                    </p>
                  )}
                </div>
              </div>

              {/* Message count */}
              {req.messages.length > 0 && (
                <p className="mt-3 text-xs text-moss-600 dark:text-moss-400">
                  💬 {req.messages.length} message{req.messages.length !== 1 ? 's' : ''} from foster home
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create foster request modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Request Foster Care">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <p className="rounded-lg bg-coral-100 dark:bg-coral-950/50 px-3 py-2 text-sm text-coral-600 dark:text-coral-400 border border-coral-200 dark:border-coral-800/40">{serverError}</p>
          )}

          {/* Pet selector */}
          <div>
            <label className="label" htmlFor="petId">
              Select pet <span className="text-coral-500">*</span>
            </label>
            {pets.length === 0 ? (
              <p className="rounded-lg bg-brass-50 px-3 py-2 text-sm text-brass-700 dark:bg-brass-700/20 dark:text-brass-300">
                You have no registered pets. Please add a pet first.
              </p>
            ) : (
              <select
                id="petId"
                className="input"
                {...register('petId', { required: 'Please select a pet' })}
              >
                <option value="">— choose a pet —</option>
                {pets.map((pet) => (
                  <option key={pet._id} value={pet._id}>
                    {pet.name} ({pet.species})
                  </option>
                ))}
              </select>
            )}
            {errors.petId && (
              <p className="mt-1 text-xs text-coral-500">{errors.petId.message}</p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="label" htmlFor="reason">
              Reason for foster care (optional)
            </label>
            <textarea
              id="reason"
              rows={3}
              className="input"
              placeholder="e.g. Going on a 2-week trip, medical recovery, temporary housing…"
              {...register('reason')}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="label" htmlFor="durationDays">
              Approximate duration (days, optional)
            </label>
            <input
              id="durationDays"
              type="number"
              min={1}
              className="input"
              placeholder="14"
              {...register('durationDays')}
            />
          </div>

          <p className="rounded-lg bg-mist-50 px-3 py-2 text-xs text-ink/60 dark:bg-ink-soft/40 dark:text-bone/70">
            Your request will be visible to registered foster homes in the area. They will reach out via the messaging thread.
          </p>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || pets.length === 0}
              className="btn-primary"
            >
              {isSubmitting ? 'Submitting…' : 'Submit request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OwnerFoster;
