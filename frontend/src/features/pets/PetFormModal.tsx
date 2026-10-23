import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { petApi, type CreatePetPayload } from '@/features/pets/petApi';
import type { ApiError, Pet } from '@/types';
import { CheckCircle2, Loader2, ImagePlus, X, PawPrint } from 'lucide-react';

interface PetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (pet: Pet) => void;
}

interface FormValues {
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  age: number | '';
  gender: 'unknown' | 'male' | 'female';
  color: string;
  weightKg: number | '';
}

const PetFormModal = ({ isOpen, onClose, onSaved }: PetFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      species: 'dog',
      breed: '',
      age: '',
      gender: 'unknown',
      color: '',
      weightKg: '',
    },
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const close = () => {
    reset();
    setImages([]);
    setPreviews([]);
    setServerError('');
    setSuccess(false);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const combined = [...images, ...files].slice(0, 6);
    setImages(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    try {
      const payload: CreatePetPayload = {
        name: values.name.trim(),
        species: values.species,
        breed: values.breed?.trim() || undefined,
        age: values.age === '' ? undefined : Number(values.age),
        gender: values.gender,
        color: values.color?.trim() || undefined,
        weightKg: values.weightKg === '' ? undefined : Number(values.weightKg),
        images: images.length > 0 ? images : undefined,
      };

      const pet = await petApi.create(payload);
      setSuccess(true);
      setTimeout(() => {
        onSaved(pet);
        close();
      }, 700);
    } catch (err: unknown) {
      console.error('Failed to create pet:', err);
      const apiErr = (err as { response?: { data?: ApiError } })?.response?.data;
      setServerError(
        apiErr?.message ||
        'Could not save this pet. Please check your network connection and try again.'
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Add a pet">
      {success ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <p className="font-display text-xl font-bold text-slate-800 dark:text-white">Pet Added!</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your pet profile has been saved successfully.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 p-3 text-sm text-red-700 dark:text-red-400">
              {serverError}
            </div>
          )}

          <div>
            <label className="label" htmlFor="pet-name">
              Pet Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="pet-name"
                className="input pl-10"
                placeholder="e.g. Milo, Luna, Bella"
                {...register('name', { required: 'Pet name is required' })}
              />
              <PawPrint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="pet-species">Species <span className="text-red-500">*</span></label>
              <select id="pet-species" className="input" {...register('species', { required: true })}>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="rabbit">Rabbit</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="pet-gender">Gender</label>
              <select id="pet-gender" className="input" {...register('gender')}>
                <option value="unknown">Unknown</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="pet-breed">Breed</label>
              <input id="pet-breed" className="input" placeholder="e.g. Golden Retriever" {...register('breed')} />
            </div>
            <div>
              <label className="label" htmlFor="pet-color">Color</label>
              <input id="pet-color" className="input" placeholder="e.g. Golden, Black & White" {...register('color')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="pet-age">Age (years)</label>
              <input
                id="pet-age"
                type="number"
                min={0}
                max={35}
                step={0.5}
                className="input"
                placeholder="e.g. 2"
                {...register('age')}
              />
            </div>
            <div>
              <label className="label" htmlFor="pet-weight">Weight (kg)</label>
              <input
                id="pet-weight"
                type="number"
                min={0}
                step={0.1}
                className="input"
                placeholder="e.g. 12.5"
                {...register('weightKg')}
              />
            </div>
          </div>

          <div>
            <label className="label">Photos (up to 6)</label>
            <label
              htmlFor="pet-photos-input"
              className="flex items-center gap-3 cursor-pointer rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 px-4 py-3 hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <ImagePlus className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {images.length > 0
                    ? `${images.length} photo${images.length > 1 ? 's' : ''} selected`
                    : 'Click to upload pet photos'}
                </p>
                <p className="text-xs text-slate-400">JPG, PNG, WebP up to 5MB</p>
              </div>
              <input
                id="pet-photos-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
            </label>

            {previews.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={src}
                      alt={`preview-${idx}`}
                      className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={close}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Pet...
                </>
              ) : (
                'Add pet'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default PetFormModal;
