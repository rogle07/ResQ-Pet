import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { foundReportApi } from '@/features/foundReports/foundReportApi';
import type { ApiError } from '@/types';

interface FormValues {
  species: string;
  description: string;
  contactPhone: string;
  address: string;
  pickupAddress: string;
  requestRescue: boolean;
}

const FinderReport = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: { species: 'dog', requestRescue: false },
  });
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<File[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [serverError, setServerError] = useState('');
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [rescueCreated, setRescueCreated] = useState(false);

  const requestRescueVal = watch('requestRescue');

  const useMyLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    const finalCoords = coords || { lat: 29.3803, lng: 79.4636 }; // Default fallback to region coordinates if geolocation not provided
    try {
      const result = await foundReportApi.create({
        description: values.description,
        contactPhone: values.contactPhone,
        species: values.species,
        lat: finalCoords.lat,
        lng: finalCoords.lng,
        address: values.address || 'Haldwani, Uttarakhand',
        pickupAddress: values.pickupAddress,
        requestRescue: values.requestRescue,
        photos,
      });
      setMatchCount(result.possibleMatchCount);
      setRescueCreated(!!result.rescueRequest);
      setTimeout(() => navigate('/finder'), 2500);
    } catch (err) {
      const apiError = (err as { response?: { data?: ApiError } }).response?.data;
      setServerError(apiError?.message || 'Could not submit your report. Please try again.');
    }
  };

  if (matchCount !== null) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <p className="font-display text-xl font-semibold text-moss-600">Report submitted ✓</p>
        <p className="mt-2 text-sm text-ink/70 dark:text-bone/70">
          {matchCount > 0
            ? `We found ${matchCount} possible match${matchCount > 1 ? 'es' : ''} and notified the owner(s).`
            : 'Your report is now live and broadcasted to local rescue teams and owners searching for animals.'}
        </p>
        {rescueCreated && (
          <p className="mt-2 rounded-lg bg-moss-50 px-3 py-2 text-sm text-moss-700 dark:bg-moss-700/20 dark:text-moss-300">
            🚑 Rescue team has been alerted and will come to pick up the animal.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="font-display text-xl font-semibold">Report a Found Animal</h2>
      <p className="mt-1 text-sm text-ink/60 dark:text-bone/60">
        Help rescue and reunite this animal. The more details you provide, the faster the rescue team can act.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="card mt-6 space-y-4">
        {serverError && <p className="rounded-lg bg-coral-100 px-3 py-2 text-sm text-coral-600">{serverError}</p>}

        {/* Species */}
        <div>
          <label className="label" htmlFor="species">Animal Species / Type</label>
          <select id="species" className="input" {...register('species')}>
            <option value="dog">🐕 Dog</option>
            <option value="cat">🐈 Cat</option>
            <option value="cow">🐄 Cow</option>
            <option value="calf">🐄 Calf</option>
            <option value="parrot">🦜 Parrot</option>
            <option value="bird">🐦 Bird</option>
            <option value="rabbit">🐇 Rabbit</option>
            <option value="goat">🐐 Goat</option>
            <option value="turtle">🐢 Turtle</option>
            <option value="peacock">🦚 Peacock</option>
            <option value="duck">🦆 Duck</option>
            <option value="monkey">🐒 Monkey</option>
            <option value="hedgehog">🦔 Hedgehog</option>
            <option value="other">🐾 Other / Wild Animal</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={3}
            className="input"
            placeholder="Color, size, collar, distinguishing marks…"
            {...register('description', { required: 'A description helps owners recognize their pet' })}
          />
          {errors.description && <p className="mt-1 text-xs text-coral-500">{errors.description.message}</p>}
        </div>

        {/* Contact */}
        <div>
          <label className="label" htmlFor="contactPhone">Your phone number</label>
          <input
            id="contactPhone"
            className="input"
            placeholder="So the owner can reach you"
            {...register('contactPhone', { required: 'A contact number is required' })}
          />
          {errors.contactPhone && <p className="mt-1 text-xs text-coral-500">{errors.contactPhone.message}</p>}
        </div>

        {/* GPS location capture */}
        <div>
          <span className="label">Your GPS location (where you found the pet)</span>
          <button type="button" onClick={useMyLocation} disabled={locating} className="btn-secondary">
            {locating ? 'Getting location…' : coords ? '📍 GPS location captured' : 'Use my current GPS location'}
          </button>
          {coords && (
            <p className="mt-1 font-mono text-xs text-mist-500">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          )}
        </div>

        {/* General location description */}
        <div>
          <label className="label" htmlFor="address">General location description (optional)</label>
          <input
            id="address"
            className="input"
            placeholder="e.g. Near Central Park entrance, Main Street"
            {...register('address')}
          />
        </div>

        {/* Rescue pickup address — NEW */}
        <div className="rounded-xl border border-mist-200 bg-mist-50/60 p-4 dark:border-bone/10 dark:bg-ink-soft/20">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              id="requestRescue"
              className="h-4 w-4 rounded accent-moss-500"
              {...register('requestRescue')}
            />
            <span className="font-medium text-ink dark:text-bone">
              🚑 Request rescue team to pick up this pet
            </span>
          </label>
          <p className="mt-1 pl-7 text-xs text-ink/60 dark:text-bone/60">
            A rescue team will be notified and dispatched to collect the animal.
          </p>

          {requestRescueVal && (
            <div className="mt-3">
              <label className="label" htmlFor="pickupAddress">
                Exact pickup location <span className="text-coral-500">*</span>
              </label>
              <input
                id="pickupAddress"
                className="input"
                placeholder="e.g. Outside Gate 4, Central Mall, near the fountain"
                {...register('pickupAddress', {
                  validate: (val) =>
                    !requestRescueVal || (val && val.trim().length > 0) || 'Please describe where rescue can find/pick up the pet',
                })}
              />
              {errors.pickupAddress && (
                <p className="mt-1 text-xs text-coral-500">{errors.pickupAddress.message}</p>
              )}
              <p className="mt-1 text-xs text-ink/50 dark:text-bone/50">
                Be as specific as possible — building name, landmark, gate number, etc.
              </p>
            </div>
          )}
        </div>

        {/* Photos */}
        <div>
          <label className="label" htmlFor="photos">Photos</label>
          <input
            id="photos"
            type="file"
            accept="image/*"
            multiple
            className="input"
            onChange={(e) => setPhotos(Array.from(e.target.files || []))}
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Submitting…' : 'Submit report'}
        </button>
      </form>
    </div>
  );
};

export default FinderReport;
