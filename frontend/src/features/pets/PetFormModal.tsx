import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { petApi, type CreatePetPayload } from '@/features/pets/petApi';
import type { ApiError, Pet } from '@/types';

interface PetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (pet: Pet) => void;
}

interface FormValues {
  name: string;
  species: string;
  breed: string;
  age: number | '';
  gender: string;
  color: string;
  weightKg: number | '';
}

const PetFormModal = ({ isOpen, onClose, onSaved }: PetFormModalProps) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: { name: '', species: 'dog', breed: '', age: '', gender: 'unknown', color: '', weightKg: '' },
  });
  const [images, setImages] = useState<File[]>([]);
  const [serverError, setServerError] = useState('');

  const close = () => {
    reset();
    setImages([]);
    setServerError('');
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    try {
      const payload: CreatePetPayload = {
        name: values.name,
        species: values.species,
        breed: values.breed || undefined,
        age: values.age === '' ? undefined : Number(values.age),
        gender: values.gender,
        color: values.color || undefined,
        weightKg: values.weightKg === '' ? undefined : Number(values.weightKg),
        images,
      };
      const pet = await petApi.create(payload);
      onSaved(pet);
      close();
    } catch (err) {
      const apiError = (err as { response?: { data?: ApiError } }).response?.data;
      setServerError(apiError?.message || 'Could not save this pet. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Add a pet">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && <p className="rounded-lg bg-coral-100 px-3 py-2 text-sm text-coral-600">{serverError}</p>}

        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" className="input" placeholder="Milo" {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="mt-1 text-xs text-coral-500">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="species">Species</label>
            <select id="species" className="input" {...register('species')}>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="bird">Bird</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="gender">Gender</label>
            <select id="gender" className="input" {...register('gender')}>
              <option value="unknown">Unknown</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="breed">Breed</label>
            <input id="breed" className="input" placeholder="Labrador" {...register('breed')} />
          </div>
          <div>
            <label className="label" htmlFor="color">Color</label>
            <input id="color" className="input" placeholder="Golden" {...register('color')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="age">Age (years)</label>
            <input id="age" type="number" min={0} className="input" {...register('age')} />
          </div>
          <div>
            <label className="label" htmlFor="weightKg">Weight (kg)</label>
            <input id="weightKg" type="number" min={0} step="0.1" className="input" {...register('weightKg')} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="images">Photos</label>
          <input
            id="images"
            type="file"
            accept="image/*"
            multiple
            className="input"
            onChange={(e) => setImages(Array.from(e.target.files || []))}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={close} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving…' : 'Add pet'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PetFormModal;
