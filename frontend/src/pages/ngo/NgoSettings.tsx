import { useState, useRef } from 'react';
import { Bell, Shield, Globe, User, Save, Eye, EyeOff, CheckCircle, Upload, AlertCircle } from 'lucide-react';

const NgoSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [logoEmoji, setLogoEmoji] = useState('🐾');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form state
  const [profile, setProfile] = useState({
    name: 'Animal Care NGO',
    regNo: 'NGO/UP/2022/12345',
    email: 'care@animalcarengo.org',
    phone: '+91 98765 43210',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    about: 'We are dedicated to rescuing and rehabilitating stray and injured animals across Lucknow. Together, we make a better world for animals.',
  });

  // Password state
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  // General Settings state
  const [general, setGeneral] = useState({
    language: 'English',
    timezone: 'Asia/Kolkata (IST)',
    dateFormat: 'DD/MM/YYYY',
    publicVisibility: true,
  });

  const [notifications, setNotifications] = useState({
    newRequests: true,
    urgentAlerts: true,
    teamUpdates: true,
    donationReceived: true,
    weeklyReport: false,
  });

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Organization profile saved successfully!');
  };

  const handleSaveNotifications = () => {
    showToast('Notification preferences updated!');
  };

  const handleUpdatePassword = () => {
    if (!passwords.newPass || !passwords.current) {
      showToast('Please enter your current and new password.');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showToast('New passwords do not match!');
      return;
    }
    setPasswords({ current: '', newPass: '', confirm: '' });
    showToast('Password updated successfully!');
  };

  const handleSaveGeneral = () => {
    showToast('General settings saved!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const emojis = ['🐶', '🐱', '🦁', '🦊', '🐼', '🐨', '🐾', '🦮'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      setLogoEmoji(randomEmoji);
      showToast(`Logo updated (${e.target.files[0].name})!`);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Organization Profile', icon: <User className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'general', label: 'General', icon: <Globe className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your NGO account and application settings.</p>
      </div>

      {/* Global Feedback Banner */}
      {feedbackToast && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{feedbackToast}</p>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar tabs */}
        <div className="w-full lg:w-56 shrink-0">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors mb-0.5 ${activeTab === tab.id ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content panel */}
        <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <h2 className="font-bold text-slate-900 dark:text-white">Organization Profile</h2>
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-100 text-4xl dark:bg-violet-900/30 shadow-inner">
                  {logoEmoji}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Organization Logo</p>
                  <p className="text-xs text-slate-500 mt-0.5">JPG, PNG or SVG · Max 2MB</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 flex items-center gap-1.5 rounded-xl bg-violet-50 px-3.5 py-1.5 text-xs font-bold text-violet-600 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload Logo
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Organization Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Registration Number</label>
                  <input
                    type="text"
                    value={profile.regNo}
                    onChange={(e) => setProfile((p) => ({ ...p, regNo: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Contact Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">City</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">State</label>
                  <input
                    type="text"
                    value={profile.state}
                    onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">About / Mission Statement</label>
                <textarea
                  value={profile.about}
                  onChange={(e) => setProfile((p) => ({ ...p, about: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm resize-none focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700 active:scale-95 transition-all shadow-md shadow-violet-600/20"
              >
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h2 className="font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, val]) => {
                  const labels: Record<string, { title: string; desc: string }> = {
                    newRequests: { title: 'New Rescue Requests', desc: 'Get notified when a new animal rescue request comes in.' },
                    urgentAlerts: { title: 'Urgent Alerts', desc: 'Immediate notifications for critical or life-threatening cases.' },
                    teamUpdates: { title: 'Team Updates', desc: 'Messages and updates from rescue teams in the field.' },
                    donationReceived: { title: 'Donation Received', desc: 'Notify when a new donation is made to the NGO.' },
                    weeklyReport: { title: 'Weekly Summary Report', desc: 'Receive a weekly digest of all NGO activities.' },
                  };
                  const info = labels[key];
                  return (
                    <div key={key} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{info.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{info.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications((prev) => ({ ...prev, [key]: !val }))}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${val ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${val ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleSaveNotifications}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
              >
                <Save className="h-4 w-4" /> Save Preferences
              </button>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <h2 className="font-bold text-slate-900 dark:text-white">Security Settings</h2>
              <div className="space-y-4">
                {[
                  { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                  { key: 'newPass', label: 'New Password', placeholder: 'Enter new password' },
                  { key: 'confirm', label: 'Confirm New Password', placeholder: 'Confirm new password' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">{f.label}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwords[f.key as keyof typeof passwords]}
                        onChange={(e) => setPasswords((p) => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleUpdatePassword}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
              >
                <Shield className="h-4 w-4" /> Update Password
              </button>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-900/20">
                <p className="text-sm font-bold text-rose-700 dark:text-rose-400 mb-1">Danger Zone</p>
                <p className="text-xs text-rose-600 dark:text-rose-500 mb-3">Permanently delete your NGO account and all associated data. This action cannot be undone.</p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:bg-transparent dark:border-rose-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <h2 className="font-bold text-slate-900 dark:text-white">General Settings</h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Language</label>
                  <select
                    value={general.language}
                    onChange={(e) => setGeneral((p) => ({ ...p, language: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {['English', 'Hindi', 'Urdu'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Timezone</label>
                  <select
                    value={general.timezone}
                    onChange={(e) => setGeneral((p) => ({ ...p, timezone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {['Asia/Kolkata (IST)', 'UTC', 'Asia/Dhaka'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Date Format</label>
                  <select
                    value={general.dateFormat}
                    onChange={(e) => setGeneral((p) => ({ ...p, dateFormat: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Public Profile Visibility</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Allow the public to view your NGO's profile and rescue activities.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneral((p) => ({ ...p, publicVisibility: !p.publicVisibility }))}
                    className={`relative h-6 w-11 rounded-full transition-colors ${general.publicVisibility ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${general.publicVisibility ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleSaveGeneral}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
              >
                <Save className="h-4 w-4" /> Save Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Delete Account Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 mb-4 dark:bg-rose-900/30">
              <AlertCircle className="h-6 w-6 text-rose-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Delete NGO Account?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              This action is permanent and cannot be reversed. All your team data, cases, and logs will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700">Cancel</button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  showToast('Account deletion request initiated.');
                }}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white hover:bg-rose-700 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoSettings;
