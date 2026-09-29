import { useAppSelector } from '@/app/hooks';
import { User, Shield, Bell } from 'lucide-react';

const FoundPetReporterSettings = () => {
  const currentUser = useAppSelector((s) => s.auth.user);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-bone">
          Reporter Account &amp; Notification Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-bone/60">
          Manage your contact information and alert preferences for found pet inquiries.
        </p>
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold text-base text-slate-800 dark:text-bone flex items-center gap-2">
          <User className="h-4 w-4 text-emerald-600" /> Reporter Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="label">Name</label>
            <p className="input bg-slate-50 dark:bg-mist-800 cursor-not-allowed">{currentUser?.name}</p>
          </div>
          <div>
            <label className="label">Email Address</label>
            <p className="input bg-slate-50 dark:bg-mist-800 cursor-not-allowed">{currentUser?.email}</p>
          </div>
          <div>
            <label className="label">Contact Phone</label>
            <p className="input bg-slate-50 dark:bg-mist-800 cursor-not-allowed">{currentUser?.phone || 'Not configured'}</p>
          </div>
          <div>
            <label className="label">Assigned Role</label>
            <p className="input bg-slate-50 dark:bg-mist-800 capitalize font-medium text-emerald-600">
              Found Pet Reporter
            </p>
          </div>
        </div>
      </div>

      <div className="card space-y-3">
        <h3 className="font-semibold text-base text-slate-800 dark:text-bone flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-600" /> Community Alerts
        </h3>
        <p className="text-xs text-mist-500">
          You will automatically receive email &amp; in-app notifications whenever a Pet Owner or Rescue Squad responds to your found pet report.
        </p>
        <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-emerald-600">
          <Shield className="h-4 w-4" /> Real-time instant socket dispatch enabled
        </div>
      </div>
    </div>
  );
};

export default FoundPetReporterSettings;
