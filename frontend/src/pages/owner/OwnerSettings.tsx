import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { updateUser } from '@/features/auth/authSlice';
import { authApi } from '@/features/auth/authApi';
import {
  User,
  Bell,
  Shield,
  Sliders,
  CheckCircle2,
  Camera,
  RefreshCw,
} from 'lucide-react';

const OwnerSettings = () => {
  const currentUser = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'preferences'>('profile');
  const [successToast, setSuccessToast] = useState('');

  // Profile Form state
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState('Noida');
  const [state, setState] = useState('Uttar Pradesh');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '/diksha-avatar.jpg');

  // Notifications State
  const [inAppNotifs, setInAppNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [lostPetUpdates, setLostPetUpdates] = useState(true);
  const [adoptionUpdates, setAdoptionUpdates] = useState(true);
  const [fosterCareUpdates, setFosterCareUpdates] = useState(true);
  const [rescueAlerts, setRescueAlerts] = useState(true);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Preferences State
  const [language, setLanguage] = useState('en');
  const [privacyProfilePublic, setPrivacyProfilePublic] = useState(false);
  const [shareLocationWithRescue, setShareLocationWithRescue] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await authApi.updateProfile({ name, phone });
      // Update Redux so phone is available immediately across the app
      dispatch(updateUser({ name: res.user.name, phone: res.user.phone }));
      setSuccessToast('Profile saved! Your phone number is now linked to your pet QR tags.');
      setTimeout(() => setSuccessToast(''), 5000);
    } catch {
      setSuccessToast('');
      alert('Could not save profile. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessToast('Password changed successfully!');
      setTimeout(() => setSuccessToast(''), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-white">
          Account Settings
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your personal profile, notification alerts, account security, and privacy preferences.
        </p>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successToast}
        </div>
      )}

      {/* Main Settings Card */}
      <div className="card p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row">
        {/* Left Navigation Tabs */}
        <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-3 space-y-1">
          {[
            { key: 'profile', label: 'My Profile', icon: <User className="h-4 w-4" /> },
            { key: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
            { key: 'security', label: 'Security & Login', icon: <Shield className="h-4 w-4" /> },
            { key: 'preferences', label: 'Preferences & Privacy', icon: <Sliders className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-800 text-[#1e6f42] dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-5 sm:p-6 lg:p-8">
          {/* ═════════════════════════════════════════════════════════ */}
          {/* 1. PROFILE */}
          {/* ═════════════════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <h3 className="font-display text-base font-bold text-slate-800 dark:text-white">Profile Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">Keep your contact details current for rescue alerts and notifications.</p>
              </div>

              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-emerald-500/30">
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-5 w-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setAvatar(url);
                        }
                      }}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-white">Profile Photograph</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click photo to upload PNG or JPG (max 5MB)</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Role</label>
                  <input
                    type="text"
                    className="input bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-500 capitalize"
                    value={currentUser?.role?.replace('_', ' ') || 'Pet Owner'}
                    disabled
                  />
                </div>
                <div>
                  <label className="label">City</label>
                  <input
                    type="text"
                    className="input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">State</label>
                  <input
                    type="text"
                    className="input"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#1e6f42] hover:bg-emerald-800 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* 2. NOTIFICATIONS */}
          {/* ═════════════════════════════════════════════════════════ */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-base font-bold text-slate-800 dark:text-white">Notification Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">Control how and when you receive communications from ResQPet.</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: 'In-App Real-Time Alerts',
                    desc: 'Push notifications inside the dashboard when new events occur.',
                    state: inAppNotifs,
                    setter: setInAppNotifs,
                  },
                  {
                    title: 'Email Notifications',
                    desc: 'Receive digest summaries and critical case updates via registered email.',
                    state: emailNotifs,
                    setter: setEmailNotifs,
                  },
                  {
                    title: 'Lost Pet Match Alerts',
                    desc: 'Instant priority notification when an engine match is found for your lost pet.',
                    state: lostPetUpdates,
                    setter: setLostPetUpdates,
                  },
                  {
                    title: 'Adoption Desk Updates',
                    desc: 'Alerts when someone requests to adopt your pet or reviews your application.',
                    state: adoptionUpdates,
                    setter: setAdoptionUpdates,
                  },
                  {
                    title: 'Foster Care Agreements',
                    desc: 'Notifications when a foster provider confirms terms or sends messages.',
                    state: fosterCareUpdates,
                    setter: setFosterCareUpdates,
                  },
                  {
                    title: 'Emergency Rescue Dispatches',
                    desc: 'Local emergency broadcast notifications for community animal rescues.',
                    state: rescueAlerts,
                    setter: setRescueAlerts,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.state}
                        onChange={(e) => item.setter(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1e6f42]"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessToast('Notification preferences saved!');
                    setTimeout(() => setSuccessToast(''), 4000);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#1e6f42] hover:bg-emerald-800 text-white text-xs font-bold"
                >
                  Save Notification Settings
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* 3. SECURITY & LOGIN */}
          {/* ═════════════════════════════════════════════════════════ */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-base font-bold text-slate-800 dark:text-white">Security & Login</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage your credentials, 2FA authentication, and active sessions.</p>
              </div>

              {/* Password Form */}
              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    className="input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">New Password (min 8 characters)</label>
                  <input
                    type="password"
                    className="input"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input
                    type="password"
                    className="input"
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#1e6f42] hover:bg-emerald-800 text-white text-xs font-bold"
                >
                  Change Password
                </button>
              </form>

              {/* 2FA Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Two-Factor Authentication (2FA)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Require an SMS code or authenticator app token upon login.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    setSuccessToast(twoFactorEnabled ? '2FA disabled.' : '2FA activated successfully!');
                    setTimeout(() => setSuccessToast(''), 4000);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    twoFactorEnabled
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {twoFactorEnabled ? 'Enabled ✓' : 'Enable 2FA'}
                </button>
              </div>

              {/* Active Sessions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <p className="text-xs font-bold text-slate-800 dark:text-white">Active Sessions</p>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">Current Browser Session (Windows / Chrome)</p>
                    <p className="text-[10px] text-slate-400">IP: 127.0.0.1 • Active Now</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    This Device
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* 4. PREFERENCES & PRIVACY */}
          {/* ═════════════════════════════════════════════════════════ */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-base font-bold text-slate-800 dark:text-white">Preferences & Privacy</h3>
                <p className="text-xs text-slate-500 mt-0.5">Control data visibility and platform display options.</p>
              </div>

              <div className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="label">Preferred Language</label>
                  <select
                    className="input"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="mr">Marathi (मराठी)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">Public Profile Visibility</p>
                      <p className="text-[10px] text-slate-500">Allow other pet lovers to view your community profile.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyProfilePublic}
                      onChange={(e) => setPrivacyProfilePublic(e.target.checked)}
                      className="accent-emerald-600 h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">Emergency Location Access</p>
                      <p className="text-[10px] text-slate-500">Share incident coordinates directly with verified Rescue Squads.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shareLocationWithRescue}
                      onChange={(e) => setShareLocationWithRescue(e.target.checked)}
                      className="accent-emerald-600 h-4 w-4"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessToast('Preferences saved successfully!');
                    setTimeout(() => setSuccessToast(''), 4000);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#1e6f42] hover:bg-emerald-800 text-white text-xs font-bold"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerSettings;
