import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { rescueApi, type RescueRequest } from '@/features/rescue/rescueApi';
import Modal from '@/components/ui/Modal';
import {
  AlertTriangle,
  PlusCircle,
  MapPin,
  Camera,
  Clock,
  CheckCircle2,
  Navigation,
  Image as ImageIcon,
  Activity,
  AlertCircle,
} from 'lucide-react';

interface RescueFormValues {
  description: string;
  type: string;
  address: string;
  lat?: number;
  lng?: number;
  animalName: string;
  animalType: string;
  injuryCondition: string;
  contactInfo: string;
  additionalNotes: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Dispatch',
  accepted: 'Assigned to Unit',
  in_progress: 'Rescue In Progress',
  completed: 'Rescued / Closed',
  cancelled: 'Cancelled',
};

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800 animate-pulse',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
  cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
};

const OwnerRescue = () => {
  const [requests, setRequests] = useState<RescueRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [activeDetail, setActiveDetail] = useState<RescueRequest | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RescueFormValues>({
    defaultValues: {
      type: 'emergency',
      description: '',
      address: '',
      lat: undefined,
      lng: undefined,
      animalName: '',
      animalType: 'dog',
      injuryCondition: '',
      contactInfo: '',
      additionalNotes: '',
    },
  });

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await rescueApi.listMine();
      setRequests(data);
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('lat', pos.coords.latitude);
        setValue('lng', pos.coords.longitude);
        setValue(
          'address',
          `GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`
        );
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert('Could not retrieve GPS coordinates. Please type the location manually.');
      },
      { timeout: 10000 }
    );
  };

  const closeModal = () => {
    reset();
    setSelectedPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setServerError('');
    setModalOpen(false);
  };

  const onSubmit = async (values: RescueFormValues) => {
    setServerError('');
    if (!selectedPhoto) {
      setServerError('A photo of the animal is required so the rescue team can identify it.');
      return;
    }
    if (!values.address?.trim()) {
      setServerError('A valid location or landmark is required.');
      return;
    }
    if (!values.description?.trim()) {
      setServerError('Please provide a description of the emergency.');
      return;
    }

    try {
      const created = await rescueApi.create({
        description: values.description,
        type: values.type || 'emergency',
        location: {
          address: values.address,
          lat: values.lat,
          lng: values.lng,
        },
        animalName: values.animalName,
        animalType: values.animalType,
        injuryCondition: values.injuryCondition,
        contactInfo: values.contactInfo,
        additionalNotes: values.additionalNotes,
        photo: selectedPhoto,
      });

      setRequests((prev) => [created, ...prev]);
      setSuccessMsg('Emergency rescue request submitted successfully! Dispatch notified.');
      closeModal();
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to submit rescue request. Please check your network and try again.';
      setServerError(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-bone flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" /> Rescue Requests
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-bone/60">
            Report an animal in distress, critical emergency, or injured animal directly to active Rescue Teams.
          </p>
        </div>
        <button
          onClick={() => {
            setServerError('');
            setModalOpen(true);
          }}
          className="btn-primary bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <PlusCircle className="h-4 w-4" /> Request Rescue
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 p-4 text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Emergency Hotline Banner */}
      <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-500/10 p-2.5 text-red-600 dark:text-red-400 shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800 dark:text-bone">24/7 Rapid Animal Distress Network</p>
            <p className="text-xs text-slate-500 dark:text-bone/60">
              Field rescue squads receive real-time notifications with GPS coordinates & uploaded evidence.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800">
          <span>PRIORITY DISPATCH ACTIVE</span>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-12 text-center font-mono text-sm text-mist-500">Loading rescue requests…</div>
      ) : requests.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-500 mb-3">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="font-semibold text-slate-800 dark:text-bone">No Rescue Requests Logged</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-bone/60 max-w-md mx-auto">
            You haven't submitted any emergency rescue requests yet. If you spot an animal in distress, click the button below.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary bg-red-600 hover:bg-red-700 text-white mt-4 inline-flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" /> Request Rescue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => {
            const photoUrl = req.photos?.[0]?.url || req.pet?.images?.[0]?.url;
            const badgeClass = STATUS_CLASSES[req.status] || 'bg-slate-100 text-slate-700';
            const labelText = STATUS_LABELS[req.status] || req.status;

            return (
              <div
                key={req._id}
                className="card flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveDetail(req)}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-mist-500 uppercase">
                        ID #{req._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium bg-mist-100 dark:bg-mist-800 text-mist-700 dark:text-mist-300">
                        {req.type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${badgeClass}`}>
                      {labelText}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-3">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Animal in need"
                        className="w-20 h-20 rounded-lg object-cover border border-mist-200 dark:border-mist-700 shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-mist-100 dark:bg-mist-800 flex items-center justify-center text-mist-400 shrink-0">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-xs text-mist-500 mb-1">
                        <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{req.location?.address || 'Location provided on map'}</span>
                      </div>
                      <p className="text-sm text-slate-800 dark:text-bone line-clamp-2 font-medium">
                        {req.description || 'Emergency assistance requested.'}
                      </p>
                      {req.assignedTeam && (
                        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Assigned to: {req.assignedTeam.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-mist-800/40 flex items-center justify-between text-xs text-mist-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(req.createdAt).toLocaleString()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDetail(req);
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    View Details & Timeline →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Submit Rescue Request */}
      <Modal isOpen={modalOpen} onClose={closeModal} title="Request Emergency Animal Rescue">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-800 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Photo Upload (REQUIRED) */}
          <div>
            <label className="label font-semibold text-slate-800 dark:text-bone">
              Animal Photo <span className="text-red-500">* REQUIRED</span>
            </label>
            <p className="text-xs text-mist-500 mb-2">
              Upload a clear photo so the rescue squad can recognize the animal and evaluate injuries.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />

            {photoPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-mist-700 w-full h-44 bg-slate-100 dark:bg-mist-800">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/70 hover:bg-black text-white text-xs rounded-lg backdrop-blur-sm transition-colors"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-red-300 dark:border-red-800/60 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors text-slate-600 dark:text-bone/70"
              >
                <div className="p-3 bg-red-100 dark:bg-red-950/60 rounded-full text-red-600 dark:text-red-400">
                  <Camera className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Click to upload photo</p>
                  <p className="text-xs text-mist-500">PNG, JPG, WEBP up to 5MB</p>
                </div>
              </button>
            )}
          </div>

          {/* Location & GPS (REQUIRED) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label font-semibold text-slate-800 dark:text-bone">
                Location / Incident Spot <span className="text-red-500">* REQUIRED</span>
              </label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Navigation className="h-3 w-3" />
                {locating ? 'Acquiring GPS…' : 'Use Current GPS'}
              </button>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-mist-400" />
              <input
                type="text"
                placeholder="e.g. Near Metro Pillar 142, Connaught Place, New Delhi"
                className="input pl-9"
                {...register('address', { required: 'Location is required' })}
              />
            </div>
            {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
          </div>

          {/* Description of Emergency (REQUIRED) */}
          <div>
            <label className="label font-semibold text-slate-800 dark:text-bone">
              Description of Emergency <span className="text-red-500">* REQUIRED</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe what happened, current status of animal, whether it is trapped or aggressive…"
              className="input"
              {...register('description', { required: 'Emergency description is required' })}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          {/* Grid of Optional Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Animal Type</label>
              <select className="input" {...register('animalType')}>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="cow">Cow / Cattle</option>
                <option value="bird">Bird</option>
                <option value="stray">Stray Animal</option>
                <option value="other">Other Wildlife / Animal</option>
              </select>
            </div>

            <div>
              <label className="label">Animal Name (if known)</label>
              <input
                type="text"
                placeholder="e.g. Bruno (or unknown)"
                className="input"
                {...register('animalName')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Injury / Condition</label>
              <input
                type="text"
                placeholder="e.g. Hit & run, broken leg, dehydrated"
                className="input"
                {...register('injuryCondition')}
              />
            </div>

            <div>
              <label className="label">Your Contact Phone</label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                className="input"
                {...register('contactInfo')}
              />
            </div>
          </div>

          <div>
            <label className="label">Additional Notes</label>
            <input
              type="text"
              placeholder="e.g. Water provided, dog is hiding under stairs"
              className="input"
              {...register('additionalNotes')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-mist-800">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              {isSubmitting ? 'Transmitting Request…' : 'Submit Rescue Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Details & Timeline */}
      {activeDetail && (
        <Modal
          isOpen={!!activeDetail}
          onClose={() => setActiveDetail(null)}
          title={`Rescue Incident #${activeDetail._id.slice(-6).toUpperCase()}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-mist-500">
                Reported {new Date(activeDetail.createdAt).toLocaleString()}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  STATUS_CLASSES[activeDetail.status] || 'bg-slate-100 text-slate-700'
                }`}
              >
                {STATUS_LABELS[activeDetail.status] || activeDetail.status}
              </span>
            </div>

            {activeDetail.photos?.[0]?.url && (
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-mist-700 max-h-56">
                <img
                  src={activeDetail.photos[0].url}
                  alt="Incident photo"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="rounded-xl bg-slate-50 dark:bg-mist-800/40 p-3 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-800 dark:text-bone">
                  {activeDetail.location?.address ||
                    `Coordinates: ${activeDetail.location?.lat}, ${activeDetail.location?.lng}`}
                </span>
              </div>

              {activeDetail.assignedTeam && (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                  <Activity className="h-4 w-4 shrink-0" />
                  <span>Assigned Unit: {activeDetail.assignedTeam.name}</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-bone/70 uppercase tracking-wider mb-1">
                Emergency Information
              </p>
              <div className="rounded-xl border border-slate-200 dark:border-mist-700 p-3 text-sm text-slate-700 dark:text-bone whitespace-pre-line leading-relaxed">
                {activeDetail.description || 'No description provided.'}
              </div>
            </div>

            {activeDetail.timeline && activeDetail.timeline.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-bone/70 uppercase tracking-wider mb-2">
                  Dispatch Timeline
                </p>
                <div className="space-y-2">
                  {activeDetail.timeline.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-bone/70 border-l-2 border-primary pl-3 py-0.5"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 dark:text-bone capitalize">{item.status}</p>
                        {item.note && <p className="text-mist-500">{item.note}</p>}
                        <span className="text-[10px] text-mist-400">
                          {new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

export default OwnerRescue;
