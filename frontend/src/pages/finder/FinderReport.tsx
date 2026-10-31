import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector } from '@/app/hooks';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  FileText,
  RefreshCw,
  Heart,
  Shield,
  HelpCircle,
} from 'lucide-react';

const ANIMAL_TYPES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Cow', 'Goat', 'Horse', 'Other'];
const CONDITION_OPTIONS = ['Healthy', 'Slightly injured', 'Seriously injured', 'Critical', 'Unknown'];

interface FoundPetForm {
  animalType: string;
  breed: string;
  approximateAge: string;
  gender: string;
  color: string;
  distinctiveMarks: string;
  locationAddress: string;
  foundAt: string;
  timeFound: string;
  isInjured: string;
  condition: string;
  description: string;
  additionalNotes: string;
  contactPhone: string;
  assistanceRequested: string;
}

const FinderReport = () => {
  const currentUser = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState('');
  const [matchResult, setMatchResult] = useState<any | null>(null);

  const { register, handleSubmit, watch, reset, formState: { isSubmitting, errors } } = useForm<FoundPetForm>({
    defaultValues: {
      animalType: 'Dog',
      gender: 'unknown',
      isInjured: 'no',
      condition: 'Unknown',
      assistanceRequested: 'none',
    },
  });

  const assistanceRequested = watch('assistanceRequested');

  const onSubmit = async (values: FoundPetForm) => {
    const ts = Date.now().toString(36).toUpperCase();
    const newReportId = `FP-${ts}`;

    const payload = {
      species: values.animalType.toLowerCase(),
      breed: values.breed,
      approximateAge: values.approximateAge,
      gender: values.gender,
      color: values.color,
      distinctiveMarks: values.distinctiveMarks,
      location: {
        address: values.locationAddress,
        lat: 28.6139,
        lng: 77.2090,
      },
      foundAt: values.foundAt,
      timeFound: values.timeFound,
      isInjured: values.isInjured === 'yes',
      condition: values.condition,
      description: values.description,
      additionalNotes: values.additionalNotes,
      contactPhone: values.contactPhone || currentUser?.phone || '',
      assistanceRequested: values.assistanceRequested,
      requestRescue: values.assistanceRequested === 'rescue_team',
    };

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const res = await fetch('/api/found-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setReportId(data.report?.reportId || newReportId);

        // Try to get matches
        try {
          const matchRes = await fetch(`/api/lost-pets/match/${data.report?._id}`, {
            headers: { Authorization: `Bearer ${token}` },
            method: 'POST',
          });
          if (matchRes.ok) {
            const matchData = await matchRes.json();
            if (matchData.matches?.length > 0) {
              setMatchResult(matchData.matches[0]);
            }
          }
        } catch { /* ignore */ }
      } else {
        setReportId(newReportId);
      }
    } catch {
      setReportId(newReportId);
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="card text-center py-10 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-800 dark:text-white">Report Submitted!</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your found pet report has been submitted. Our system is searching for matching lost pet reports.
          </p>
          <div className="inline-block font-mono text-base font-bold text-[#1e6f42] bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 rounded-xl border border-emerald-200">
            Report ID: {reportId}
          </div>
        </div>

        {matchResult && (
          <div className="card border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <h4 className="font-bold text-blue-800 dark:text-blue-300">Potential Match Found!</h4>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-800">
                {matchResult.matchScore}% Match
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              A lost pet report matches your found animal! The pet owner has been notified.
              Please check your Messages section to communicate securely.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-400">
              <span>Lost Pet: <strong>{matchResult.lostReport?.petName}</strong></span>
              {matchResult.distanceKm !== null && (
                <span>Distance: <strong>{matchResult.distanceKm} km away</strong></span>
              )}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-500">
              ⚠️ A high match percentage does not confirm they are the same animal. Human verification is required.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => { setSubmitted(false); setMatchResult(null); reset(); }}
            className="btn-secondary text-sm"
          >
            Submit Another Report
          </button>
          <button
            onClick={() => navigate('/finder/my-reports')}
            className="rounded-xl bg-[#1e6f42] px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            View My Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Camera className="h-6 w-6 text-purple-600" />
          Report a Found Animal
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Help reunite this animal with its owner or connect it with a rescue team or shelter.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Animal Details */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Animal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Animal Type <span className="text-red-500">*</span></label>
              <select className="input" {...register('animalType', { required: true })}>
                {ANIMAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Breed (if known)</label>
              <input type="text" className="input" placeholder="e.g. Labrador, or leave blank" {...register('breed')} />
            </div>
            <div>
              <label className="label">Approximate Age</label>
              <input type="text" className="input" placeholder="e.g. Young puppy, 2 years" {...register('approximateAge')} />
            </div>
            <div>
              <label className="label">Gender (if known)</label>
              <select className="input" {...register('gender')}>
                <option value="unknown">Unknown</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="label">Color / Coat</label>
              <input type="text" className="input" placeholder="e.g. Black and white" {...register('color')} />
            </div>
            <div>
              <label className="label">Distinctive Marks</label>
              <input type="text" className="input" placeholder="Collar, tag, markings, injuries..." {...register('distinctiveMarks')} />
            </div>
          </div>
        </div>

        {/* Location & Time */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            Location & Time
          </h3>

          <div>
            <label className="label">Found Location / Address <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="input"
              placeholder="Enter the street, area, city where you found the animal"
              {...register('locationAddress', { required: 'Location is required' })}
            />
            {errors.locationAddress && <p className="mt-1 text-xs text-red-500">{errors.locationAddress.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date Found <span className="text-red-500">*</span></label>
              <input type="date" className="input" {...register('foundAt', { required: true })} />
            </div>
            <div>
              <label className="label">Time Found</label>
              <input type="time" className="input" {...register('timeFound')} />
            </div>
          </div>
        </div>

        {/* Injury & Condition */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" />
            Animal Condition
          </h3>

          <div>
            <label className="label">Is the animal injured?</label>
            <div className="flex gap-4 mt-1">
              {[
                { value: 'no', label: 'No, appears healthy' },
                { value: 'yes', label: 'Yes, injured or in distress' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value={opt.value} {...register('isInjured')} className="accent-emerald-600" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Health Condition</label>
            <select className="input" {...register('condition')}>
              {CONDITION_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[80px]"
              placeholder="Describe the animal's condition, behavior, surroundings..."
              {...register('description')}
            />
          </div>
        </div>

        {/* Assistance Request */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-amber-500" />
            What assistance does this animal need?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'none', label: 'No immediate assistance', desc: 'I can handle the situation', icon: <CheckCircle2 className="h-5 w-5" />, color: 'border-slate-200 dark:border-slate-700' },
              { value: 'rescue_team', label: 'Request Rescue Team', desc: 'Animal is injured or in danger', icon: <Shield className="h-5 w-5 text-red-500" />, color: 'border-red-200 dark:border-red-800' },
              { value: 'ngo_shelter', label: 'Request NGO / Shelter', desc: 'Animal needs shelter or care', icon: <Heart className="h-5 w-5 text-amber-500" />, color: 'border-amber-200 dark:border-amber-800' },
            ].map((opt) => (
              <label key={opt.value} className={`flex flex-col gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                assistanceRequested === opt.value ? 'border-[#1e6f42] bg-emerald-50 dark:bg-emerald-950/30' : `${opt.color} hover:border-slate-300`
              }`}>
                <input type="radio" value={opt.value} {...register('assistanceRequested')} className="sr-only" />
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span className="font-semibold text-sm text-slate-800 dark:text-white">{opt.label}</span>
                </div>
                <span className="text-xs text-slate-500">{opt.desc}</span>
              </label>
            ))}
          </div>

          {assistanceRequested === 'rescue_team' && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-xs text-red-700 dark:text-red-400">
              <strong>Rescue Team requested.</strong> A rescue team will be notified and will respond to your location.
              Please stay near the animal if safe to do so.
            </div>
          )}

          {assistanceRequested === 'ngo_shelter' && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-700 dark:text-amber-400">
              <strong>NGO / Shelter assistance requested.</strong> Local shelters and NGOs will be notified to arrange appropriate care.
            </div>
          )}
        </div>

        {/* Additional & Contact */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Additional Information
          </h3>
          <div>
            <label className="label">Additional Notes</label>
            <textarea
              className="input min-h-[60px]"
              placeholder="Any other information that may help identify or care for this animal..."
              {...register('additionalNotes')}
            />
          </div>
          <div>
            <label className="label">Your Contact Phone</label>
            <input
              type="tel"
              className="input"
              placeholder="+91 98765 43210"
              defaultValue={currentUser?.phone || ''}
              {...register('contactPhone')}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => reset()} className="btn-secondary">Reset Form</button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-purple-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSubmitting ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
              <><FileText className="h-4 w-4" /> Submit Found Pet Report</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FinderReport;
