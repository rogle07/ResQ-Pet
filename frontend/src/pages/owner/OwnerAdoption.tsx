import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { petApi } from '@/features/pets/petApi';
import { ngoApi, type AdoptionApplication } from '@/features/ngo/ngoApi';
import type { Pet } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import {
  Heart, PlusCircle, Eye, CheckCircle, XCircle, Clock,
  User, Phone, Mail, FileText, AlertCircle,
} from 'lucide-react';

interface ListForm {
  petId: string;
  description: string;
}

const OwnerAdoption = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const topRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ListForm>({ defaultValues: { petId: '', description: '' } });

  const load = async () => {
    setLoading(true);
    try {
      const [myPets, apps] = await Promise.all([petApi.list(), ngoApi.getAdoptions()]);
      setPets(myPets);
      setApplications(apps);
    } catch {
      // API errors handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const closeModal = () => { reset(); setServerError(''); setListModalOpen(false); };

  const onList = async (values: ListForm) => {
    setServerError('');
    try {
      await ngoApi.listPetForAdoption(values.petId, values.description);
      setSuccessMsg('Your pet has been listed for adoption!');
      closeModal();
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Could not list pet for adoption. Please try again.';
      setServerError(msg);
    }
  };

  const decide = async (id: string, decision: 'approved' | 'rejected') => {
    try {
      await ngoApi.decideAdoption(id, decision);
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: decision === 'approved' ? 'approved' : 'rejected' } : a))
      );
    } catch {
      /* silent */
    }
  };

  const adoptablePets = pets.filter((p) => p.adoption?.isAvailable);

  return (
    <div className="space-y-6" ref={topRef}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-bone flex items-center gap-2">
            <Heart className="h-5 w-5 text-purple-500" /> Adoption
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-bone/60">
            List your pet for adoption or review incoming adoption requests.
          </p>
        </div>
        <button onClick={() => setListModalOpen(true)} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <PlusCircle className="h-4 w-4" /> List Pet for Adoption
        </button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-moss-50 dark:bg-moss-900/20 px-4 py-3 text-sm text-moss-700 dark:text-moss-300 border border-moss-200 dark:border-moss-800/40">
          <CheckCircle className="h-4 w-4 shrink-0" /> {successMsg}
          <button onClick={() => setSuccessMsg('')} className="ml-auto text-moss-400 hover:text-moss-600 font-bold text-xs">✕</button>
        </div>
      )}

      {loading ? (
        <p className="font-mono text-sm text-slate-400 animate-pulse">Loading adoption data…</p>
      ) : (
        <>
          {/* My listed pets */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-600 dark:text-bone/70 uppercase tracking-wide">
              My Pets Listed for Adoption ({adoptablePets.length})
            </h3>
            {adoptablePets.length === 0 ? (
              <div className="card text-center py-8">
                <Heart className="mx-auto h-10 w-10 text-purple-300 mb-3" />
                <p className="text-slate-500 dark:text-bone/60 text-sm">No pets currently listed for adoption.</p>
                <button onClick={() => setListModalOpen(true)} className="btn-primary mt-4 text-sm">
                  List a Pet for Adoption
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {adoptablePets.map((pet) => (
                  <div key={pet._id} className="card flex flex-col gap-3">
                    {pet.images[0] && (
                      <img src={pet.images[0].url} alt={pet.name}
                        className="h-32 w-full rounded-xl object-cover" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-bone">{pet.name}</p>
                      <p className="text-xs text-slate-500 dark:text-bone/50 capitalize">{pet.species} • {pet.breed || 'Mixed'} • {pet.gender}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-moss-600 dark:text-moss-400">
                      <Eye className="h-3.5 w-3.5" /> Listed for adoption
                    </span>
                    {pet.adoption?.description && (
                      <p className="text-xs text-slate-500 dark:text-bone/50 line-clamp-2">{pet.adoption.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incoming adoption applications */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-600 dark:text-bone/70 uppercase tracking-wide">
              Adoption Applications ({applications.length})
            </h3>
            {applications.length === 0 ? (
              <div className="card text-center py-6">
                <Clock className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-slate-500 dark:text-bone/60 text-sm">No adoption applications yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app._id} className="card">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-800 dark:text-bone">
                            {app.pet.name}
                          </p>
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs capitalize text-slate-600 dark:text-slate-400">
                            {app.pet.species}
                          </span>
                          <StatusBadge status={app.status} />
                        </div>

                        <div className="mt-2 space-y-1">
                          <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-bone/70">
                            <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            {app.applicant.name}
                          </p>
                          {app.applicant.email && (
                            <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-bone/60">
                              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" /> {app.applicant.email}
                            </p>
                          )}
                          {app.applicant.phone && (
                            <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-bone/60">
                              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" /> {app.applicant.phone}
                            </p>
                          )}
                          {app.applicationNote && (
                            <p className="flex items-start gap-1.5 text-sm text-slate-500 dark:text-bone/60 mt-1">
                              <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
                              <span className="line-clamp-2">{app.applicationNote}</span>
                            </p>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-slate-400 dark:text-bone/40">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {app.status === 'pending' || app.status === 'under_review' ? (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => decide(app._id, 'approved')}
                            className="flex items-center gap-1.5 rounded-full bg-moss-500 px-4 py-2 text-xs font-semibold text-white hover:bg-moss-600 transition"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => decide(app._id, 'rejected')}
                            className="flex items-center gap-1.5 rounded-full border border-red-300 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:border-red-700/50 dark:hover:bg-red-950/30 transition"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* List Pet Modal */}
      <Modal isOpen={listModalOpen} onClose={closeModal} title="List Pet for Adoption">
        <form onSubmit={handleSubmit(onList)} className="space-y-4">
          {serverError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {serverError}
            </div>
          )}

          <div>
            <label className="label" htmlFor="adopt-petId">
              Select pet <span className="text-red-500">*</span>
            </label>
            {pets.length === 0 ? (
              <p className="rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                You have no registered pets. Please add a pet first.
              </p>
            ) : (
              <select id="adopt-petId" className="input" {...register('petId', { required: 'Please select a pet' })}>
                <option value="">— choose a pet —</option>
                {pets.map((pet) => (
                  <option key={pet._id} value={pet._id}>{pet.name} ({pet.species})</option>
                ))}
              </select>
            )}
            {errors.petId && <p className="mt-1 text-xs text-red-500">{errors.petId.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="adopt-desc">
              Description / Adoption Note <span className="text-red-500">*</span>
            </label>
            <textarea
              id="adopt-desc"
              rows={4}
              className="input"
              placeholder="Describe the pet's personality, health status, why you're listing for adoption, any special requirements for the adopter…"
              {...register('description', { required: 'Please add a description' })}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <p className="rounded-lg bg-slate-50 dark:bg-slate-800/40 px-3 py-2 text-xs text-slate-500 dark:text-bone/60">
            Your pet will be visible to potential adopters in the ResQPet community. You can review and approve all adoption applications.
          </p>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting || pets.length === 0} className="btn-primary">
              {isSubmitting ? 'Listing…' : 'List for Adoption'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OwnerAdoption;
