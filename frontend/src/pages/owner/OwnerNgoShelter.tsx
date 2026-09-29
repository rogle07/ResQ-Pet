import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { petApi } from '@/features/pets/petApi';
import { api } from '@/api/client';
import type { Pet } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import {
  Building2, PlusCircle, Clock, AlertCircle, CheckCircle, MapPin, Phone,
} from 'lucide-react';

interface ShelterRequest {
  _id: string;
  pet: { name: string; species: string };
  reason: string;
  location?: string;
  contactInfo?: string;
  additionalInfo?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
}

interface ShelterForm {
  petId: string;
  reason: string;
  location: string;
  contactInfo: string;
  additionalInfo: string;
}

const shelterApi = {
  list: () =>
    api.get<{ success: true; requests: ShelterRequest[] }>('/ngo/shelter-requests')
      .then((r) => r.data.requests)
      .catch(() => [] as ShelterRequest[]),
  create: (payload: object) =>
    api.post<{ success: true; request: ShelterRequest }>('/ngo/shelter-requests', payload)
      .then((r) => r.data.request),
};

const OwnerNgoShelter = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [requests, setRequests] = useState<ShelterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShelterForm>({
    defaultValues: { petId: '', reason: '', location: '', contactInfo: '', additionalInfo: '' },
  });

  const load = async () => {
    setLoading(true);
    try {
      const [myPets, reqs] = await Promise.all([petApi.list(), shelterApi.list()]);
      setPets(myPets);
      setRequests(reqs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const closeModal = () => { reset(); setServerError(''); setModalOpen(false); };

  const onSubmit = async (values: ShelterForm) => {
    setServerError('');
    try {
      const selectedPet = pets.find((p) => p._id === values.petId);
      const created = await shelterApi.create({
        petId: values.petId,
        petName: selectedPet?.name,
        petAge: selectedPet?.age,
        petType: selectedPet?.species,
        petBreed: selectedPet?.breed,
        reason: values.reason,
        location: values.location,
        contactInfo: values.contactInfo,
        additionalInfo: values.additionalInfo,
      });
      setRequests((prev) => [created, ...prev]);
      setSuccessMsg('Your NGO shelter request has been submitted!');
      closeModal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Could not submit request. Please try again.';
      setServerError(msg);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'text-amber-600 dark:text-amber-400',
    accepted: 'text-moss-600 dark:text-moss-400',
    rejected: 'text-red-500 dark:text-red-400',
    completed: 'text-slate-500 dark:text-slate-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-bone flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-500" /> NGO Shelter Care Request
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-bone/60">
            Request to send your pet to an NGO shelter or care facility.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <PlusCircle className="h-4 w-4" /> Request NGO Shelter Care
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-moss-50 dark:bg-moss-900/20 px-4 py-3 text-sm text-moss-700 dark:text-moss-300 border border-moss-200 dark:border-moss-800/40">
          <CheckCircle className="h-4 w-4 shrink-0" /> {successMsg}
          <button onClick={() => setSuccessMsg('')} className="ml-auto text-xs font-bold text-moss-400 hover:text-moss-600">✕</button>
        </div>
      )}

      {loading ? (
        <p className="font-mono text-sm text-slate-400 animate-pulse">Loading requests…</p>
      ) : requests.length === 0 ? (
        <div className="card text-center py-10">
          <Building2 className="mx-auto h-12 w-12 text-teal-200 dark:text-teal-800 mb-3" />
          <p className="text-slate-500 dark:text-bone/60 text-sm font-medium">No NGO shelter requests submitted yet.</p>
          <p className="text-xs text-slate-400 dark:text-bone/40 mt-1 max-w-sm mx-auto">
            If you need temporary shelter or care support for your pet from an NGO, submit a request here.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn-primary mt-4">
            Request NGO Shelter Care
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req._id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 dark:text-bone">{req.pet.name}</p>
                    <span className="rounded-full bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 text-xs capitalize text-teal-700 dark:text-teal-300">
                      {req.pet.species}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className={`mt-1 text-xs font-medium capitalize ${statusColors[req.status]}`}>
                    {req.status.replace('_', ' ')}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-bone/70 line-clamp-2">{req.reason}</p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {req.location && (
                      <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-bone/50">
                        <MapPin className="h-3 w-3" /> {req.location}
                      </p>
                    )}
                    {req.contactInfo && (
                      <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-bone/50">
                        <Phone className="h-3 w-3" /> {req.contactInfo}
                      </p>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-400 dark:text-bone/40">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Submitted {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title="Request NGO Shelter Care">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {serverError}
            </div>
          )}

          <div>
            <label className="label" htmlFor="shelter-petId">
              Select Pet <span className="text-red-500">*</span>
            </label>
            {pets.length === 0 ? (
              <p className="rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                You have no registered pets. Please add a pet first.
              </p>
            ) : (
              <select id="shelter-petId" className="input" {...register('petId', { required: 'Please select a pet' })}>
                <option value="">— choose a pet —</option>
                {pets.map((pet) => (
                  <option key={pet._id} value={pet._id}>{pet.name} ({pet.species})</option>
                ))}
              </select>
            )}
            {errors.petId && <p className="mt-1 text-xs text-red-500">{errors.petId.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="shelter-reason">
              Reason for Requesting NGO Shelter Care <span className="text-red-500">*</span>
            </label>
            <textarea
              id="shelter-reason"
              rows={3}
              className="input"
              placeholder="e.g. Owner hospitalized, unable to care temporarily, financial hardship, moving to a no-pet zone…"
              {...register('reason', { required: 'Please provide a reason' })}
            />
            {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason.message}</p>}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="shelter-location">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input id="shelter-location" className="input pl-9" placeholder="Your city / area"
                  {...register('location')} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="shelter-contact">Contact Information</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input id="shelter-contact" className="input pl-9" placeholder="Phone number"
                  {...register('contactInfo')} />
              </div>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="shelter-notes">Additional Information</label>
            <textarea
              id="shelter-notes"
              rows={2}
              className="input"
              placeholder="Medical conditions, dietary requirements, special needs, vaccination status…"
              {...register('additionalInfo')}
            />
          </div>

          <p className="rounded-lg bg-teal-50 dark:bg-teal-900/20 px-3 py-2 text-xs text-teal-700 dark:text-teal-300">
            An NGO representative will review your request and contact you within 24 hours.
          </p>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting || pets.length === 0} className="btn-primary">
              {isSubmitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OwnerNgoShelter;
