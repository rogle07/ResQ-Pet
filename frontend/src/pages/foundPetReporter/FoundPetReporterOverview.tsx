import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { foundReportApi } from '@/features/foundReport/foundReportApi';
import { useAppSelector } from '@/app/hooks';
import type { FoundReport, FoundReportStatus } from '@/types';
import Modal from '@/components/ui/Modal';
import {
  MapPin,
  Camera,
  Calendar,
  Clock,
  Phone,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Navigation,
  Sparkles,
  Building2,
  Activity,
  X,
} from 'lucide-react';

interface FoundReportFormValues {
  description: string;
  contactPhone: string;
  species: string;
  breed: string;
  approximateAge: string;
  gender: 'male' | 'female' | 'unknown';
  address: string;
  lat?: number;
  lng?: number;
  foundAt: string;
  timeFound: string;
  currentPetLocation: string;
  condition: string;
  additionalNotes: string;
  requestRescue: boolean;
  pickupAddress: string;
}

const STATUS_CONFIG: Record<FoundReportStatus, { label: string; badgeClass: string }> = {
  pending: {
    label: 'Pending Review',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  },
  under_review: {
    label: 'Under Review',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
  },
  owner_match_found: {
    label: 'Owner Match Found',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800 font-bold animate-pulse',
  },
  rescue_assigned: {
    label: 'Rescue Assigned',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-800',
  },
  reunited: {
    label: 'Reunited with Owner',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold',
  },
  closed: {
    label: 'Closed',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  },
  unclaimed: {
    label: 'Pending / Unclaimed',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
  },
  matched: {
    label: 'Owner Match Found',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300',
  },
  claimed: {
    label: 'Claimed by Owner',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
  },
};

const FoundPetReporterOverview = () => {
  const currentUser = useAppSelector((s) => s.auth.user);
  const [reports, setReports] = useState<FoundReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeDetail, setActiveDetail] = useState<FoundReport | null>(null);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Photos state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [locating, setLocating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FoundReportFormValues>({
    defaultValues: {
      description: '',
      contactPhone: currentUser?.phone || '',
      species: 'dog',
      breed: '',
      approximateAge: 'Adult',
      gender: 'unknown',
      address: '',
      lat: undefined,
      lng: undefined,
      foundAt: new Date().toISOString().split('T')[0],
      timeFound: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      currentPetLocation: 'With reporter at home/office',
      condition: 'Healthy / Active',
      additionalNotes: '',
      requestRescue: false,
      pickupAddress: '',
    },
  });

  const watchRequestRescue = watch('requestRescue');

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await foundReportApi.list(activeTab === 'my' ? { mine: true } : {});
      setReports(data);
    } catch {
      // API error handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [activeTab]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const combined = [...selectedFiles, ...files].slice(0, 4);
      setSelectedFiles(combined);

      const urls = combined.map((f) => URL.createObjectURL(f));
      setPreviews(urls);
    }
  };

  const removePhoto = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    if (previews[index]) URL.revokeObjectURL(previews[index]);
    const updatedUrls = previews.filter((_, i) => i !== index);
    setPreviews(updatedUrls);
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('lat', pos.coords.latitude);
        setValue('lng', pos.coords.longitude);
        setValue('address', `GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert('Could not retrieve GPS coordinates. Please type location details manually.');
      },
      { timeout: 10000 }
    );
  };

  const closeModal = () => {
    reset({
      description: '',
      contactPhone: currentUser?.phone || '',
      species: 'dog',
      breed: '',
      approximateAge: 'Adult',
      gender: 'unknown',
      address: '',
      lat: undefined,
      lng: undefined,
      foundAt: new Date().toISOString().split('T')[0],
      timeFound: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      currentPetLocation: 'With reporter at home/office',
      condition: 'Healthy / Active',
      additionalNotes: '',
      requestRescue: false,
      pickupAddress: '',
    });
    previews.forEach((u) => URL.revokeObjectURL(u));
    setPreviews([]);
    setSelectedFiles([]);
    setServerError('');
    setModalOpen(false);
  };

  const onSubmit = async (values: FoundReportFormValues) => {
    setServerError('');
    if (selectedFiles.length === 0) {
      setServerError('At least one photo of the found pet is required so owners & rescuers can identify it.');
      return;
    }
    if (!values.address?.trim()) {
      setServerError('Found location is required.');
      return;
    }
    if (!values.contactPhone?.trim()) {
      setServerError('A contact phone number is required so owners or rescue squads can contact you.');
      return;
    }

    try {
      const created = await foundReportApi.create({
        photos: selectedFiles,
        description: values.description,
        contactPhone: values.contactPhone,
        lat: values.lat,
        lng: values.lng,
        address: values.address,
        foundAt: values.foundAt,
        timeFound: values.timeFound,
        species: values.species,
        breed: values.breed,
        approximateAge: values.approximateAge,
        gender: values.gender,
        currentPetLocation: values.currentPetLocation,
        condition: values.condition,
        additionalNotes: values.additionalNotes,
        requestRescue: values.requestRescue,
        pickupAddress: values.pickupAddress,
      });

      setReports((prev) => [created, ...prev]);
      setSuccessMsg('Found pet report registered successfully! Owners and rescue teams notified.');
      closeModal();
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not submit found report. Please check your network and try again.';
      setServerError(msg);
    }
  };

  // Stats calculation
  const myCount = reports.length;
  const matchCount = reports.filter((r) => r.status === 'owner_match_found' || r.status === 'matched').length;
  const reunitedCount = reports.filter((r) => r.status === 'reunited' || r.status === 'claimed').length;
  const rescueCount = reports.filter((r) => r.status === 'rescue_assigned').length;

  return (
    <div className="space-y-6">
      {/* ── Top Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-bone flex items-center gap-2">
              <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Found Pet Reporter Hub
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Active Community Helper
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-bone/60">
            Report pets you have found on the street or in public to instantly connect with searching Pet Owners, Rescue Teams, and NGOs.
          </p>
        </div>

        {/* Big CTA */}
        <button
          onClick={() => {
            setServerError('');
            setModalOpen(true);
          }}
          className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-emerald-500/20 text-sm sm:text-base font-semibold px-5 py-2.5"
        >
          <PlusCircle className="h-5 w-5" /> Report Found Pet
        </button>
      </div>

      {/* ── Success Banner ─────────────────────────────────────── */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 p-4 text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Summary Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-4 flex flex-col justify-between">
          <p className="text-xs text-mist-500">Reports Logged</p>
          <p className="font-display text-2xl font-extrabold text-slate-800 dark:text-bone mt-1">{myCount}</p>
          <p className="text-[11px] text-mist-400 mt-1">Submitted in community</p>
        </div>

        <div className="card p-4 flex flex-col justify-between">
          <p className="text-xs text-mist-500">Owner Matches</p>
          <p className="font-display text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{matchCount}</p>
          <p className="text-[11px] text-purple-500/80 mt-1">Matching lost pet records</p>
        </div>

        <div className="card p-4 flex flex-col justify-between">
          <p className="text-xs text-mist-500">Reunited</p>
          <p className="font-display text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{reunitedCount}</p>
          <p className="text-[11px] text-emerald-500/80 mt-1">Returned home safe</p>
        </div>

        <div className="card p-4 flex flex-col justify-between">
          <p className="text-xs text-mist-500">Rescue Dispatched</p>
          <p className="font-display text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">{rescueCount}</p>
          <p className="text-[11px] text-teal-500/80 mt-1">Assigned to field unit</p>
        </div>
      </div>

      {/* ── Role Explanation & Workflow Banner ─────────────────── */}
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-slate-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-slate-900 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> FOUND PET REUNIFICATION WORKFLOW
          </div>
          <h4 className="font-display text-base font-bold text-slate-800 dark:text-bone">
            Found an animal? Here is how your report helps:
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-bone/70 leading-relaxed">
            When you submit a report, our automated geospatial engine compares the photo, species, and location against missing pet notices. Pet Owners receive instant pings, while local Rescue Units and NGO Shelters can dispatch field support if the animal is injured.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm px-4 py-2 shrink-0 font-medium"
        >
          Report Found Pet Now →
        </button>
      </div>

      {/* ── Tabs: My Reports vs All Community Reports ─────────── */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-mist-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'my'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-mist-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            My Found Pet Reports
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-mist-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Community Reports
          </button>
        </div>

        <span className="text-xs text-mist-500 hidden sm:inline">
          Showing {reports.length} report{reports.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Reports Grid ───────────────────────────────────────── */}
      {loading ? (
        <div className="py-16 text-center font-mono text-sm text-mist-500 animate-pulse">
          Loading found pet reports…
        </div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-16">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 mb-3">
            <MapPin className="h-7 w-7" />
          </div>
          <h4 className="font-bold text-base text-slate-800 dark:text-bone">
            {activeTab === 'my' ? 'No Found Pet Reports Submitted Yet' : 'No Community Reports Available'}
          </h4>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-bone/60 max-w-md mx-auto">
            {activeTab === 'my'
              ? 'If you have found a wandering, lost, or injured animal, report it now to help reunite it with its owner.'
              : 'There are currently no active found pet reports in this radius.'}
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white mt-4 inline-flex items-center gap-2 text-xs sm:text-sm"
          >
            <PlusCircle className="h-4 w-4" /> Report Found Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => {
            const statusConfig = STATUS_CONFIG[report.status] || {
              label: report.status,
              badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
            };
            const photoUrl = report.photos?.[0]?.url;

            return (
              <div
                key={report._id}
                className="card flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer p-4 group"
                onClick={() => setActiveDetail(report)}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-semibold text-mist-500 uppercase">
                      #{report._id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusConfig.badgeClass}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    {photoUrl ? (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-mist-700 shrink-0 bg-slate-100">
                        <img
                          src={photoUrl}
                          alt="Found Animal"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 font-bold">
                        <Camera className="h-7 w-7" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-800 dark:text-bone capitalize truncate">
                          {report.breed ? `${report.breed} (${report.species})` : report.species}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-mist-500 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{report.location?.address || 'Location provided'}</span>
                      </div>

                      <p className="mt-1 text-xs text-slate-600 dark:text-bone/70 line-clamp-2">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-mist-800/60 flex items-center justify-between text-[11px] text-mist-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.foundAt || report.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-emerald-600 hover:underline">
                    View Full Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL: SUBMIT FOUND PET REPORT ─────────────────────── */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Report a Found Pet">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[82vh] overflow-y-auto pr-1">
          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-800 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Photo Upload (REQUIRED) */}
          <div>
            <label className="label font-semibold text-slate-800 dark:text-bone">
              Pet / Animal Photo(s) <span className="text-red-500">* REQUIRED</span>
            </label>
            <p className="text-xs text-mist-500 mb-2">
              Upload up to 4 clear photos so owners and rescuers can recognize distinguishing colors or markings.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoSelect}
            />

            {previews.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {previews.map((url, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-mist-700 h-24 bg-slate-100">
                      <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-black text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {previews.length < 4 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 dark:border-mist-700 rounded-lg h-24 flex flex-col items-center justify-center text-mist-500 hover:bg-slate-50 transition"
                    >
                      <PlusCircle className="h-5 w-5" />
                      <span className="text-[10px] mt-1">Add More</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-emerald-300 dark:border-emerald-800/60 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors text-slate-600 dark:text-bone/70"
              >
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-full text-emerald-600 dark:text-emerald-400">
                  <Camera className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Upload animal photo(s)</p>
                  <p className="text-xs text-mist-500">Up to 4 images (PNG, JPG, WEBP)</p>
                </div>
              </button>
            )}
          </div>

          {/* Animal Type & Breed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Animal / Pet Type <span className="text-red-500">*</span></label>
              <select className="input" {...register('species', { required: true })}>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="cow">Cow / Cattle</option>
                <option value="bird">Bird / Parrot</option>
                <option value="rabbit">Rabbit</option>
                <option value="other">Other Stray / Domestic Pet</option>
              </select>
            </div>

            <div>
              <label className="label">Breed (if identifiable)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Golden Retriever mix, Persian, Stray"
                {...register('breed')}
              />
            </div>
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Approximate Age (Optional)</label>
              <select className="input" {...register('approximateAge')}>
                <option value="Puppy / Kitten (< 6 months)">Puppy / Kitten (&lt; 6 months)</option>
                <option value="Young (6 months - 2 years)">Young (6 months - 2 years)</option>
                <option value="Adult (2 - 7 years)">Adult (2 - 7 years)</option>
                <option value="Senior (7+ years)">Senior (7+ years)</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="label">Gender (if known)</label>
              <select className="input" {...register('gender')}>
                <option value="unknown">Unknown</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Found Location (REQUIRED) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label font-semibold text-slate-800 dark:text-bone">
                Found Location / Landmark <span className="text-red-500">* REQUIRED</span>
              </label>
              <button
                type="button"
                onClick={handleGetGPS}
                disabled={locating}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Navigation className="h-3.5 w-3.5" />
                {locating ? 'Acquiring GPS…' : 'Use Current GPS Pin'}
              </button>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-mist-400" />
              <input
                type="text"
                placeholder="e.g. Sector 18 Market, Near City Park Gate 2, Noida"
                className="input pl-9"
                {...register('address', { required: 'Found location is required' })}
              />
            </div>
            {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
          </div>

          {/* Date & Time Found */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Date Found</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-mist-400" />
                <input
                  type="date"
                  className="input pl-9"
                  {...register('foundAt')}
                />
              </div>
            </div>

            <div>
              <label className="label">Time Found</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-mist-400" />
                <input
                  type="text"
                  placeholder="e.g. 04:30 PM"
                  className="input pl-9"
                  {...register('timeFound')}
                />
              </div>
            </div>
          </div>

          {/* Current Location & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Current Location of Pet</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Safely with me at home, in parking lot"
                {...register('currentPetLocation')}
              />
            </div>

            <div>
              <label className="label">Condition of Pet</label>
              <select className="input" {...register('condition')}>
                <option value="Healthy / Playful">Healthy / Playful</option>
                <option value="Scared / Nervous">Scared / Nervous</option>
                <option value="Malnourished / Weak">Malnourished / Weak</option>
                <option value="Injured (Limping/Scratches)">Injured (Limping/Scratches)</option>
                <option value="Severe Emergency (Hit & Run)">Severe Emergency (Hit &amp; Run)</option>
              </select>
            </div>
          </div>

          {/* Identification Details (REQUIRED) */}
          <div>
            <label className="label font-semibold text-slate-800 dark:text-bone">
              Description / Distinctive Markings <span className="text-red-500">* REQUIRED</span>
            </label>
            <textarea
              rows={2}
              className="input"
              placeholder="e.g. Red collar without tags, white patch on chest, docked tail, very friendly…"
              {...register('description', { required: 'Please provide identification details' })}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          {/* Contact Information (REQUIRED) */}
          <div>
            <label className="label font-semibold text-slate-800 dark:text-bone">
              Your Contact Phone Number <span className="text-red-500">* REQUIRED</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-mist-400" />
              <input
                type="tel"
                className="input pl-9"
                placeholder="+91 98765 43210"
                {...register('contactPhone', { required: 'Contact phone is required' })}
              />
            </div>
            {errors.contactPhone && <p className="mt-1 text-xs text-red-500">{errors.contactPhone.message}</p>}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="label">Additional Notes</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Fed with water and biscuits, collar has small bell"
              {...register('additionalNotes')}
            />
          </div>

          {/* Auto Rescue Request Dispatch Toggle */}
          <div className="rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/30 p-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-teal-400 text-teal-600 focus:ring-teal-500"
                {...register('requestRescue')}
              />
              <span className="text-xs font-semibold text-teal-900 dark:text-teal-200">
                Request Rescue Team / Shelter Pickup for this pet
              </span>
            </label>
            <p className="text-[11px] text-teal-700 dark:text-teal-300 pl-6">
              Check this if you cannot keep the pet safely and need an on-ground rescue squad to come transport it.
            </p>

            {watchRequestRescue && (
              <div className="pl-6 pt-1">
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="Specific pickup address / gate number"
                  {...register('pickupAddress')}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-mist-800">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {isSubmitting ? 'Registering Report…' : 'Submit Found Pet Report'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: VIEW DETAILS ────────────────────────────────── */}
      {activeDetail && (
        <Modal
          isOpen={!!activeDetail}
          onClose={() => setActiveDetail(null)}
          title={`Found Pet Report #${activeDetail._id.slice(-6).toUpperCase()}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-mist-500">
                Logged {new Date(activeDetail.createdAt).toLocaleString()}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  (STATUS_CONFIG[activeDetail.status] || {}).badgeClass || 'bg-slate-100'
                }`}
              >
                {(STATUS_CONFIG[activeDetail.status] || {}).label || activeDetail.status}
              </span>
            </div>

            {/* Photos carousel/grid */}
            {activeDetail.photos && activeDetail.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                {activeDetail.photos.map((p, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 dark:border-mist-700 h-28 bg-slate-100">
                    <img src={p.url} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Core Info Details */}
            <div className="rounded-xl bg-slate-50 dark:bg-mist-800/40 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-bone text-sm capitalize">
                  {activeDetail.species} • {activeDetail.breed || 'Breed Unspecified'}
                </span>
                <span className="capitalize text-mist-500 font-medium">
                  {activeDetail.gender || 'Unknown gender'}
                </span>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-bone">
                  {activeDetail.location?.address || `${activeDetail.location?.lat}, ${activeDetail.location?.lng}`}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1 text-mist-600 dark:text-mist-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>Found: {new Date(activeDetail.foundAt).toLocaleDateString()} {activeDetail.timeFound ? `at ${activeDetail.timeFound}` : ''}</span>
              </div>

              {activeDetail.currentPetLocation && (
                <div className="flex items-center gap-2 pt-1 font-medium text-teal-700 dark:text-teal-300">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Current Pet Spot: {activeDetail.currentPetLocation}</span>
                </div>
              )}

              {activeDetail.condition && (
                <div className="flex items-center gap-2 pt-1 text-slate-600 dark:text-bone/80">
                  <Activity className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <span>Condition: {activeDetail.condition}</span>
                </div>
              )}

              {activeDetail.contactPhone && (
                <div className="flex items-center gap-2 pt-1 text-slate-700 dark:text-bone font-medium">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>Reporter Phone: {activeDetail.contactPhone}</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-bone/70 uppercase mb-1">
                Description & Identification Notes
              </p>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-mist-700 text-xs sm:text-sm text-slate-700 dark:text-bone whitespace-pre-line leading-relaxed">
                {activeDetail.description}
                {activeDetail.additionalNotes && `\n\nNotes: ${activeDetail.additionalNotes}`}
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

export default FoundPetReporterOverview;
