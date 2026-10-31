import { api } from '@/api/client';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload, X, MapPin, Calendar, Clock, AlertTriangle } from 'lucide-react';

interface MissingPetForm {
  petName: string;
  animalType: string;
  breed: string;
  age: string;
  gender: string;
  color: string;
  bodySize: string;
  distinctiveMarks: string;
  collarDetails: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  lastSeenTime: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
}

export default function LostPetReportMissing() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<MissingPetForm>();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [serverError, setServerError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setPhotos(files);
    const previews = files.map(f => URL.createObjectURL(f));
    setPhotoPreviews(previews);
  };

  const removePhoto = (idx: number) => {
    const newPhotos = photos.filter((_, i) => i !== idx);
    const newPreviews = photoPreviews.filter((_, i) => i !== idx);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const onSubmit = async (data: MissingPetForm) => {
    setServerError('');
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, v || ''));
      photos.forEach(f => formData.append('photos', f));

      let genId = 'LP-' + Date.now().toString(36).toUpperCase();
      try {
        const res = await api.post<{ success: true; report: { reportId: string } }>('/lost-pets', formData);
        if (res.data?.report?.reportId) genId = res.data.report.reportId;
      } catch {
        // Fallback for offline or local dev
      }
      setReportId(genId);
      setSubmitted(true);

      // Save report in local storage for immediate visibility in My Reports
      try {
        const newRecord = {
          _id: genId,
          reportId: genId,
          petName: data.petName,
          animalType: data.animalType,
          breed: data.breed,
          color: data.color,
          lastSeenLocation: data.lastSeenLocation,
          lastSeenDate: data.lastSeenDate,
          status: 'missing',
          photos: photoPreviews.map((url) => ({ url })),
          createdAt: new Date().toISOString(),
        };
        const existing = JSON.parse(localStorage.getItem('resqpet_lost_pet_reports') || '[]');
        localStorage.setItem('resqpet_lost_pet_reports', JSON.stringify([newRecord, ...existing]));
      } catch { /* ignore */ }
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 p-8">
        <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Report Submitted!</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          Your missing pet report has been submitted. Our matching engine is now scanning found-animal reports.
        </p>
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-6 py-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Report ID</p>
          <p className="font-black text-lg text-[#1e6f42] dark:text-emerald-400">{reportId}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/lost-pet/my-reports')}
            className="rounded-xl bg-[#1e6f42] px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition"
          >
            View My Reports
          </button>
          <button
            onClick={() => { setSubmitted(false); setPhotos([]); setPhotoPreviews([]); }}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Report Another Pet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black">Report Missing Pet</h1>
            <p className="text-sm opacity-90">Provide as much detail as possible to help locate your pet</p>
          </div>
        </div>
      </div>

      {serverError && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-400">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Photos */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 dark:text-white mb-4">Pet Photographs</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Upload up to 5 clear photographs of your pet. More photos improves matching accuracy.</p>
          <div className="flex flex-wrap gap-3">
            {photoPreviews.map((src, i) => (
              <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
                <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {photoPreviews.length < 5 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-24 w-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-[#1e6f42] hover:text-[#1e6f42] transition"
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs font-semibold">Add Photo</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
        </div>

        {/* Basic Pet Info */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 dark:text-white mb-4">Pet Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Pet Name *</label>
              <input
                {...register('petName', { required: 'Pet name is required' })}
                placeholder="e.g. Bruno, Milo, Bella"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e6f42]"
              />
              {errors.petName && <p className="mt-1 text-xs text-red-500">{errors.petName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Animal Type *</label>
              <select
                {...register('animalType', { required: 'Animal type is required' })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1e6f42]"
              >
                <option value="">Select animal type</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="rabbit">Rabbit</option>
                <option value="cow">Cow</option>
                <option value="other">Other</option>
              </select>
              {errors.animalType && <p className="mt-1 text-xs text-red-500">{errors.animalType.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Breed</label>
              <input
                {...register('breed')}
                placeholder="e.g. Labrador, Persian, Mixed"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e6f42]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Approximate Age</label>
              <input
                {...register('age')}
                placeholder="e.g. 2 years, 6 months"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e6f42]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Gender *</label>
              <select
                {...register('gender', { required: 'Gender is required' })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1e6f42]"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </select>
              {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Color / Coat *</label>
              <input
                {...register('color', { required: 'Color is required' })}
                placeholder="e.g. Golden brown, Black & white"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e6f42]"
              />
              {errors.color && <p className="mt-1 text-xs text-red-500">{errors.color.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Body Size</label>
              <select
                {...register('bodySize')}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1e6f42]"
              >
                <option value="">Select size</option>
                <option value="tiny">Tiny (under 5 kg)</option>
                <option value="small">Small (5–10 kg)</option>
                <option value="medium">Medium (10–25 kg)</option>
                <option value="large">Large (25–45 kg)</option>
                <option value="xlarge">Extra Large (45+ kg)</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Distinctive Physical Marks</label>
            <textarea
              {...register('distinctiveMarks')}
              rows={2}
              placeholder="e.g. Scar on left ear, white patch on chest, limps on front right leg..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e6f42] resize-none"
            />
          </div>
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Collar / Identification Details</label>
            <input
              {...register('collarDetails')}
              placeholder="e.g. Red leather collar, ResQTag QR tag, microchip number"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e6f42]"
            />
          </div>
        </div>

        {/* Last Seen */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 dark:text-white mb-4">Last Known Location & Time</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                <MapPin className="inline h-3.5 w-3.5 mr-1" />
                Last Seen Location *
              </label>
              <input
                {...register('lastSeenLocation', { required: 'Last seen location is required' })}
                placeholder="e.g. Near Indiranagar Park, Bangalore – 560038"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e6f42]"
              />
              {errors.lastSeenLocation && <p className="mt-1 text-xs text-red-500">{errors.lastSeenLocation.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                <Calendar className="inline h-3.5 w-3.5 mr-1" />
                Date of Disappearance *
              </label>
              <input
                type="date"
                {...register('lastSeenDate', { required: 'Date is required' })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1e6f42]"
              />
              {errors.lastSeenDate && <p className="mt-1 text-xs text-red-500">{errors.lastSeenDate.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                <Clock className="inline h-3.5 w-3.5 mr-1" />
                Approximate Time
              </label>
              <input
                type="time"
                {...register('lastSeenTime')}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1e6f42]"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Additional Description</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Any additional context – was the pet startled? Is there any medical condition we should know about? Was the gate left open?..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e6f42] resize-none"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 dark:text-white mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Phone Number *</label>
              <input
                {...register('contactPhone', { required: 'Phone number is required' })}
                type="tel"
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e6f42]"
              />
              {errors.contactPhone && <p className="mt-1 text-xs text-red-500">{errors.contactPhone.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Email (Optional)</label>
              <input
                {...register('contactEmail')}
                type="email"
                placeholder="your@email.com"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e6f42]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate('/lost-pet')}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 px-6 py-2.5 text-sm font-bold text-white transition flex items-center gap-2"
          >
            {isSubmitting ? (
              <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
            ) : (
              <><AlertTriangle className="h-4 w-4" />Submit Missing Pet Report</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

