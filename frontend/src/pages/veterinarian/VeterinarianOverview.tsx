import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

const VeterinarianOverview = () => {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Welcome, Dr. {user?.name.split(' ')[0]}</h2>
      <p className="mt-1 text-sm text-ink/60 dark:text-bone/60">
        Use Medical Records to add diagnoses, treatments, and prescriptions for a pet by looking up its pet ID.
      </p>

      <div className="card mt-6">
        <p className="font-semibold">Get started</p>
        <p className="mt-1 text-sm text-ink/60 dark:text-bone/60">
          Open Medical Records and enter a pet's ID (shown on their QR tag) to view or add to their history.
        </p>
        <Link to="/veterinarian/records" className="btn-primary mt-4 inline-flex">
          Go to Medical Records
        </Link>
      </div>
    </div>
  );
};

export default VeterinarianOverview;
