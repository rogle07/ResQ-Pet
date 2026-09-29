import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { fosterApi, type FosterRequest } from '@/features/foster/fosterApi';
import { petApi } from '@/features/pets/petApi';
import { useAppSelector } from '@/app/hooks';
import type { Pet } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import {
  Home,
  PlusCircle,
  Calendar,
  IndianRupee,
  Clock,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';

interface FosterFormValues {
  petId: string;
  ownerName: string;
  contactInfo: string;
  durationDays: number | '';
  startDate: string;
  endDate: string;
  offeredCharges: number | '';
  reason: string;
  additionalRequirements: string;
}

const OwnerFoster = () => {
  const currentUser = useAppSelector((s) => s.auth.user);
  const [requests, setRequests] = useState<FosterRequest[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [activeDetail, setActiveDetail] = useState<FosterRequest | null>(null);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FosterFormValues>({
    defaultValues: {
      petId: '',
      ownerName: currentUser?.name || '',
      contactInfo: currentUser?.phone || currentUser?.email || '',
      durationDays: '',
      startDate: '',
      endDate: '',
      offeredCharges: '',
      reason: '',
      additionalRequirements: '',
    },
  });

  const watchedPetId = watch('petId');

  useEffect(() => {
    if (watchedPetId) {
      const found = pets.find((p) => p._id === watchedPetId) || null;
      setSelectedPet(found);
    } else {
      setSelectedPet(null);
    }
  }, [watchedPetId, pets]);

  const load = async () => {
    setLoading(true);
    try {
      const [reqs, myPets] = await Promise.all([fosterApi.list(), petApi.list()]);
      setRequests(reqs);
      setPets(myPets);
      if (myPets.length > 0 && !watchedPetId) {
        setValue('petId', myPets[0]._id);
        setSelectedPet(myPets[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const closeModal = () => {
    reset({
      petId: pets[0]?._id || '',
      ownerName: currentUser?.name || '',
      contactInfo: currentUser?.phone || currentUser?.email || '',
      durationDays: '',
      startDate: '',
      endDate: '',
      offeredCharges: '',
      reason: '',
      additionalRequirements: '',
    });
    setServerError('');
    setModalOpen(false);
  };

  const onSubmit = async (values: FosterFormValues) => {
    setServerError('');
    try {
      const formattedReasonParts = [
        values.reason ? `Reason: ${values.reason}` : '',
        values.startDate || values.endDate ? `Dates: ${values.startDate || 'N/A'} to ${values.endDate || 'N/A'}` : '',
        values.offeredCharges ? `Offered Budget: ₹${values.offeredCharges}` : '',
        values.ownerName ? `Owner: ${values.ownerName}` : '',
        values.contactInfo ? `Contact: ${values.contactInfo}` : '',
        values.additionalRequirements ? `Requirements: ${values.additionalRequirements}` : '',
      ].filter(Boolean);

      const combinedReason = formattedReasonParts.join('\n');

      const created = await fosterApi.create({
        petId: values.petId,
        reason: combinedReason || undefined,
        durationDays: values.durationDays === '' ? undefined : Number(values.durationDays),
      });

      setRequests((prev) => [created, ...prev]);
      setSuccessMsg('Foster care request submitted successfully! Foster homes notified.');
      closeModal();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not submit foster request. Please try again.';
      setServerError(msg);
    }
  };

  const statusColor: Record<string, string> = {
    pending: 'text-amber-600 dark:text-amber-400',
    accepted: 'text-emerald-600 dark:text-emerald-400',
    active: 'text-teal-600 dark:text-teal-300',
    rejected: 'text-rose-600 dark:text-rose-400',
    completed: 'text-mist-500 dark:text-mist-400',
    cancelled: 'text-mist-500 dark:text-mist-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-bone flex items-center gap-2">
            <Home className="h-6 w-6 text-amber-500" /> Foster Care Requests
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-bone/60">
            Temporarily place your pet with verified Foster Care Providers while you're away or in need of temporary housing.
          </p>
        </div>
        <button
          onClick={() => {
            setServerError('');
            setModalOpen(true);
          }}
          className="btn-primary bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <PlusCircle className="h-4 w-4" /> Request Foster Care
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 p-4 text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Info Card */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400 shrink-0">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-bone">Verified Foster Care Provider Network</p>
            <p className="text-xs text-slate-500 dark:text-bone/60">
              Your request is routed directly to certified foster families who review pet details and accept assignments.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
          Foster Providers Active
        </span>
      </div>

      {/* Request list */}
      {loading ? (
        <div className="py-12 text-center font-mono text-sm text-mist-500">Loading foster requests…</div>
      ) : requests.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 mb-3">
            <Home className="h-6 w-6" />
          </div>
          <p className="font-semibold text-slate-800 dark:text-bone">No Foster Care Requests Yet</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-bone/60 max-w-md mx-auto">
            Need temporary housing for your pet while traveling or moving? Submit a request to local foster care providers.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn-primary bg-amber-500 hover:bg-amber-600 text-white mt-4 inline-flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> Request Foster Care
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req._id}
              className="card hover:shadow-md transition-shadow cursor-pointer p-4 sm:p-5"
              onClick={() => setActiveDetail(req)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 items-start min-w-0">
                  {req.pet.images?.[0]?.url ? (
                    <img
                      src={req.pet.images[0].url}
                      alt={req.pet.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-mist-700 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 shrink-0 font-bold text-lg">
                      {req.pet.name.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-base text-slate-800 dark:text-bone">{req.pet.name}</p>
                      <span className="rounded-full bg-mist-100 px-2.5 py-0.5 text-xs capitalize text-mist-700 dark:bg-mist-800 dark:text-mist-300 font-medium">
                        {req.pet.species}
                      </span>
                    </div>

                    {req.fosterProvider ? (
                      <p className="mt-1 text-xs sm:text-sm text-teal-600 dark:text-teal-400 font-medium">
                        Assigned Foster Provider: <span className="font-bold">{req.fosterProvider.name}</span>
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Waiting for verified Foster Care Provider assignment
                      </p>
                    )}

                    {req.reason && (
                      <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-bone/70 line-clamp-2 whitespace-pre-line">
                        {req.reason}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-mist-500">
                      {req.durationDays && (
                        <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                          <Clock className="h-3.5 w-3.5" /> ~{req.durationDays} days
                        </span>
                      )}
                      <span>Requested {new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <StatusBadge status={req.status} />
                  {req.status in statusColor && (
                    <p className={`mt-1 text-xs font-semibold capitalize ${statusColor[req.status]}`}>
                      {req.status}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Foster Request */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Request Temporary Foster Care">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-800 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Pet selector with image preview */}
          <div>
            <label className="label font-semibold text-slate-800 dark:text-bone">
              Select Pet <span className="text-red-500">*</span>
            </label>
            {pets.length === 0 ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                You have no registered pets yet. Please add a pet in "My Pets" first.
              </p>
            ) : (
              <select
                id="petId"
                className="input"
                {...register('petId', { required: 'Please select a pet' })}
              >
                <option value="">— Choose a pet —</option>
                {pets.map((pet) => (
                  <option key={pet._id} value={pet._id}>
                    {pet.name} ({pet.species} • {pet.breed || 'Pet'})
                  </option>
                ))}
              </select>
            )}
            {errors.petId && <p className="mt-1 text-xs text-red-500">{errors.petId.message}</p>}

            {selectedPet && (
              <div className="mt-2 flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-mist-800/40 border border-slate-200 dark:border-mist-700">
                {selectedPet.images?.[0]?.url ? (
                  <img
                    src={selectedPet.images[0].url}
                    alt={selectedPet.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    {selectedPet.name.charAt(0)}
                  </div>
                )}
                <div className="text-xs">
                  <p className="font-bold text-slate-800 dark:text-bone">{selectedPet.name}</p>
                  <p className="text-mist-500">
                    {selectedPet.species} • {selectedPet.age ? `${selectedPet.age} yrs` : 'Age unknown'} • {selectedPet.gender}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Owner Info & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Owner Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-mist-400" />
                <input
                  type="text"
                  className="input pl-9"
                  placeholder="Your Full Name"
                  {...register('ownerName', { required: 'Owner name is required' })}
                />
              </div>
            </div>

            <div>
              <label className="label">Contact Phone / Email</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-mist-400" />
                <input
                  type="text"
                  className="input pl-9"
                  placeholder="+91 98765 43210"
                  {...register('contactInfo', { required: 'Contact info is required' })}
                />
              </div>
            </div>
          </div>

          {/* Duration & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Number of Days Required</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-mist-400" />
                <input
                  type="number"
                  min={1}
                  className="input pl-9"
                  placeholder="e.g. 14"
                  {...register('durationDays', { required: 'Please specify duration in days' })}
                />
              </div>
            </div>

            <div>
              <label className="label">Offered Budget / Care Charges (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-mist-400" />
                <input
                  type="number"
                  min={0}
                  className="input pl-9"
                  placeholder="e.g. 3500 (optional)"
                  {...register('offeredCharges')}
                />
              </div>
            </div>
          </div>

          {/* Preferred Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Preferred Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-mist-400" />
                <input
                  type="date"
                  className="input pl-9"
                  {...register('startDate')}
                />
              </div>
            </div>

            <div>
              <label className="label">Preferred End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-mist-400" />
                <input
                  type="date"
                  className="input pl-9"
                  {...register('endDate')}
                />
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="label">Reason for Foster Care</label>
            <textarea
              rows={2}
              className="input"
              placeholder="e.g. Work travel, home relocation, temporary medical treatment…"
              {...register('reason')}
            />
          </div>

          {/* Additional Requirements / Notes */}
          <div>
            <label className="label">Additional Requirements / Special Notes</label>
            <textarea
              rows={2}
              className="input"
              placeholder="e.g. Diet routine, medications, hypoallergenic, doesn't like loud sounds…"
              {...register('additionalRequirements')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-mist-800">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || pets.length === 0}
              className="btn-primary bg-amber-500 hover:bg-amber-600 text-white font-medium"
            >
              {isSubmitting ? 'Submitting Request…' : 'Submit Foster Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Details */}
      {activeDetail && (
        <Modal
          isOpen={!!activeDetail}
          onClose={() => setActiveDetail(null)}
          title={`Foster Care Case: ${activeDetail.pet.name}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-mist-500">
                Requested on {new Date(activeDetail.createdAt).toLocaleDateString()}
              </span>
              <StatusBadge status={activeDetail.status} />
            </div>

            {activeDetail.pet.images?.[0]?.url && (
              <div className="rounded-xl overflow-hidden max-h-48 border border-slate-200 dark:border-mist-700">
                <img
                  src={activeDetail.pet.images[0].url}
                  alt={activeDetail.pet.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-mist-800/40 text-xs space-y-1.5">
              <p className="font-semibold text-slate-800 dark:text-bone text-sm">{activeDetail.pet.name}</p>
              <p className="text-mist-500 capitalize">Species: {activeDetail.pet.species}</p>
              {activeDetail.durationDays && <p>Duration: ~{activeDetail.durationDays} days</p>}
              {activeDetail.fosterProvider && (
                <p className="text-teal-600 font-semibold">Assigned Caregiver: {activeDetail.fosterProvider.name}</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-bone/70 uppercase mb-1">
                Details & Requirements
              </p>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-mist-700 text-xs sm:text-sm text-slate-700 dark:text-bone whitespace-pre-line leading-relaxed">
                {activeDetail.reason || 'No additional notes provided.'}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-mist-800">
              <button onClick={() => setActiveDetail(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OwnerFoster;
