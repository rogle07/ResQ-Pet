import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector } from '@/app/hooks';
import {
  Search,
  Plus,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Camera,
  FileText,
  RefreshCw,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface LostPetForm {
  petName: string;
  animalType: string;
  breed: string;
  age: string;
  gender: string;
  color: string;
  distinctiveMarks: string;
  lastKnownAddress: string;
  lastSeenDate: string;
  lastSeenTime: string;
  description: string;
  additionalInfo: string;
  contactPhone: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  missing: { label: 'Missing', color: 'text-red-700', bg: 'bg-red-100' },
  searching: { label: 'Searching', color: 'text-amber-700', bg: 'bg-amber-100' },
  potential_match_found: { label: 'Potential Match Found', color: 'text-blue-700', bg: 'bg-blue-100' },
  verification_pending: { label: 'Verification Pending', color: 'text-purple-700', bg: 'bg-purple-100' },
  reunited: { label: 'Reunited! 🎉', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  closed: { label: 'Closed', color: 'text-slate-600', bg: 'bg-slate-100' },
};

const ANIMAL_TYPES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Cow', 'Goat', 'Horse', 'Other'];

const MOCK_REPORTS = [
  {
    _id: 'lp-001',
    reportId: 'LP-A1B2C3',
    petName: 'Bruno',
    animalType: 'Dog',
    breed: 'Golden Retriever',
    age: '2 years',
    gender: 'male',
    color: 'Golden',
    lastKnownLocation: { address: 'Sector 15, Noida, UP' },
    lastSeenDate: '2026-10-28',
    status: 'searching',
    description: 'Friendly dog, responds to name Bruno.',
    photos: [],
    createdAt: '2026-10-28T10:00:00Z',
  },
  {
    _id: 'lp-002',
    reportId: 'LP-D4E5F6',
    petName: 'Mia',
    animalType: 'Cat',
    breed: 'Persian',
    age: '1 year',
    gender: 'female',
    color: 'White with grey patches',
    lastKnownLocation: { address: 'Koramangala, Bengaluru' },
    lastSeenDate: '2026-10-25',
    status: 'potential_match_found',
    description: 'Indoor cat, very shy around strangers.',
    photos: [],
    createdAt: '2026-10-25T08:00:00Z',
    matchScore: 87,
  },
];

const OwnerLostPet = () => {
  const currentUser = useAppSelector((s) => s.auth.user);
  const [reports, setReports] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('resqpet_lost_pets_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return MOCK_REPORTS;
  });

  const [isFormOpen, setFormOpen] = useState(false);
  const [activeDetail, setActiveDetail] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    try {
      localStorage.setItem('resqpet_lost_pets_v1', JSON.stringify(reports));
    } catch { /* ignore */ }
  }, [reports]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LostPetForm>({
    defaultValues: {
      animalType: 'Dog',
      gender: 'unknown',
    },
  });

  const onSubmit = async (values: LostPetForm) => {
    setIsSubmitting(true);
    try {
      const ts = Date.now().toString(36).toUpperCase();
      const newReport = {
        _id: `lp-${Date.now()}`,
        reportId: `LP-${ts}`,
        petName: values.petName,
        animalType: values.animalType,
        breed: values.breed,
        age: values.age,
        gender: values.gender,
        color: values.color,
        distinctiveMarks: values.distinctiveMarks,
        lastKnownLocation: { address: values.lastKnownAddress },
        lastSeenDate: values.lastSeenDate,
        lastSeenTime: values.lastSeenTime,
        description: values.description,
        additionalInfo: values.additionalInfo,
        contactPhone: values.contactPhone || currentUser?.phone || '',
        status: 'missing',
        photos: [],
        reportedBy: currentUser?._id,
        createdAt: new Date().toISOString(),
      };

      // Try API
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        const res = await fetch('/api/lost-pets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            petName: values.petName,
            animalType: values.animalType,
            breed: values.breed,
            age: values.age,
            gender: values.gender,
            color: values.color,
            distinctiveMarks: values.distinctiveMarks,
            lastKnownLocation: { address: values.lastKnownAddress },
            lastSeenDate: values.lastSeenDate,
            lastSeenTime: values.lastSeenTime,
            description: values.description,
            additionalInfo: values.additionalInfo,
            contactPhone: values.contactPhone,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setReports((prev) => [data.report, ...prev]);
          setFormOpen(false);
          reset();
          setSuccessMsg(`Lost pet report submitted! Report ID: ${data.report.reportId}`);
          setTimeout(() => setSuccessMsg(''), 6000);
          return;
        }
      } catch { /* fall through to local */ }

      setReports((prev) => [newReport, ...prev]);
      setFormOpen(false);
      reset();
      setSuccessMsg(`Lost pet report submitted! Report ID: ${newReport.reportId}`);
      setTimeout(() => setSuccessMsg(''), 6000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = filterStatus === 'all'
    ? reports
    : reports.filter((r) => r.status === filterStatus);

  const stats = {
    total: reports.length,
    missing: reports.filter((r) => r.status === 'missing').length,
    searching: reports.filter((r) => r.status === 'searching').length,
    matches: reports.filter((r) => r.status === 'potential_match_found' || r.status === 'verification_pending').length,
    reunited: reports.filter((r) => r.status === 'reunited').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Search className="h-6 w-6 text-red-500" />
            Lost Pet Reports
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Report missing pets and track potential matches from our community.
          </p>
        </div>
        <button
          onClick={() => { reset(); setFormOpen(true); }}
          className="flex items-center gap-2 rounded-xl bg-[#1e6f42] px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Report Lost Pet
        </button>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-100 dark:bg-slate-800' },
          { label: 'Missing', value: stats.missing, color: 'text-red-700', bg: 'bg-red-50 dark:bg-red-950/30' },
          { label: 'Potential Matches', value: stats.matches, color: 'text-blue-700', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Reunited', value: stats.reunited, color: 'text-emerald-700', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'missing', 'searching', 'potential_match_found', 'reunited'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === s
                ? 'bg-[#1e6f42] text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {s === 'all' ? 'All Reports' : STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">No reports found</h3>
          <p className="text-sm text-slate-400 mt-1">Click "Report Lost Pet" to create your first report.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => {
            const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.missing;
            return (
              <div key={report._id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Pet Photo Placeholder */}
                  <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {report.photos?.length > 0 ? (
                      <img src={report.photos[0].url} alt={report.petName} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Camera className="h-8 w-8 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 dark:text-white text-base">{report.petName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusCfg.bg} ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      {report.matchScore && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          {report.matchScore}% Match Found
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>{report.animalType} • {report.breed || 'Mixed'} • {report.gender}</span>
                      {report.color && <span>Color: {report.color}</span>}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {report.lastKnownLocation?.address || 'Location not specified'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last seen: {report.lastSeenDate ? new Date(report.lastSeenDate).toLocaleDateString() : 'Unknown'}
                      </span>
                      <span className="text-slate-400">Report ID: {report.reportId}</span>
                    </div>

                    {report.description && (
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{report.description}</p>
                    )}
                  </div>

                  <div className="flex gap-2 sm:flex-col">
                    <button
                      onClick={() => setActiveDetail(report)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    {report.status === 'missing' && (
                      <button
                        onClick={() => {
                          const updated = reports.map((r) =>
                            r._id === report._id ? { ...r, status: 'searching' } : r
                          );
                          setReports(updated);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Update
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── REPORT FORM MODAL ── */}
      <Modal isOpen={isFormOpen} onClose={() => setFormOpen(false)} title="Report a Lost Pet">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Please provide as much information as possible to help us find your pet quickly.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Pet Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Bruno"
                {...register('petName', { required: 'Pet name is required' })}
              />
              {errors.petName && <p className="mt-1 text-xs text-red-500">{errors.petName.message}</p>}
            </div>

            <div>
              <label className="label">Animal Type <span className="text-red-500">*</span></label>
              <select className="input" {...register('animalType', { required: true })}>
                {ANIMAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Breed</label>
              <input type="text" className="input" placeholder="e.g. Golden Retriever" {...register('breed')} />
            </div>

            <div>
              <label className="label">Age</label>
              <input type="text" className="input" placeholder="e.g. 2 years" {...register('age')} />
            </div>

            <div>
              <label className="label">Gender</label>
              <select className="input" {...register('gender')}>
                <option value="unknown">Unknown</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="label">Color / Coat</label>
              <input type="text" className="input" placeholder="e.g. Golden brown" {...register('color')} />
            </div>
          </div>

          <div>
            <label className="label">Distinctive Marks / Identification</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. White patch on left ear, scar on back"
              {...register('distinctiveMarks')}
            />
          </div>

          <div>
            <label className="label">Last Known Location / Address <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="input"
              placeholder="Enter street, area, city"
              {...register('lastKnownAddress', { required: 'Last known location is required' })}
            />
            {errors.lastKnownAddress && <p className="mt-1 text-xs text-red-500">{errors.lastKnownAddress.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Last Seen Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                className="input"
                {...register('lastSeenDate', { required: 'Date is required' })}
              />
              {errors.lastSeenDate && <p className="mt-1 text-xs text-red-500">{errors.lastSeenDate.message}</p>}
            </div>
            <div>
              <label className="label">Last Seen Time</label>
              <input type="time" className="input" {...register('lastSeenTime')} />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[80px]"
              placeholder="Describe your pet, what they were doing, any special needs..."
              {...register('description')}
            />
          </div>

          <div>
            <label className="label">Additional Information</label>
            <textarea
              className="input min-h-[60px]"
              placeholder="Vaccination info, medical needs, favourite foods, any other details..."
              {...register('additionalInfo')}
            />
          </div>

          <div>
            <label className="label">Contact Phone</label>
            <input
              type="tel"
              className="input"
              placeholder="+91 98765 43210"
              defaultValue={currentUser?.phone || ''}
              {...register('contactPhone')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-[#1e6f42] px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><FileText className="h-4 w-4" /> Submit Report</>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── DETAIL MODAL ── */}
      <Modal
        isOpen={!!activeDetail}
        onClose={() => setActiveDetail(null)}
        title={`Lost Pet Report — ${activeDetail?.reportId}`}
      >
        {activeDetail && (
          <div className="space-y-4">
            <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${STATUS_CONFIG[activeDetail.status]?.bg} ${STATUS_CONFIG[activeDetail.status]?.color}`}>
              Status: {STATUS_CONFIG[activeDetail.status]?.label}
            </div>

            {activeDetail.matchScore && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4">
                <p className="font-bold text-blue-800 dark:text-blue-300 text-sm">
                  🔍 Potential Match Found: {activeDetail.matchScore}% Similarity
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  A found pet report closely matches your lost pet. Human verification is required.
                  Please check the Messages section to communicate with the Finder.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-slate-400">Pet Name</span>
                <p className="font-semibold text-slate-800 dark:text-white">{activeDetail.petName}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Animal Type</span>
                <p className="font-semibold text-slate-800 dark:text-white">{activeDetail.animalType}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Breed</span>
                <p className="font-semibold text-slate-800 dark:text-white">{activeDetail.breed || '—'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Color</span>
                <p className="font-semibold text-slate-800 dark:text-white">{activeDetail.color || '—'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Last Seen</span>
                <p className="font-semibold text-slate-800 dark:text-white">
                  {activeDetail.lastSeenDate ? new Date(activeDetail.lastSeenDate).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Report ID</span>
                <p className="font-mono font-semibold text-slate-800 dark:text-white">{activeDetail.reportId}</p>
              </div>
            </div>

            {activeDetail.lastKnownLocation?.address && (
              <div>
                <span className="text-xs text-slate-400">Last Known Location</span>
                <p className="font-semibold text-sm text-slate-800 dark:text-white flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {activeDetail.lastKnownLocation.address}
                </p>
              </div>
            )}

            {activeDetail.distinctiveMarks && (
              <div>
                <span className="text-xs text-slate-400">Distinctive Marks</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{activeDetail.distinctiveMarks}</p>
              </div>
            )}

            {activeDetail.description && (
              <div>
                <span className="text-xs text-slate-400">Description</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{activeDetail.description}</p>
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              {activeDetail.status === 'missing' && (
                <button
                  onClick={() => {
                    const updated = reports.map((r) =>
                      r._id === activeDetail._id ? { ...r, status: 'searching' } : r
                    );
                    setReports(updated);
                    setActiveDetail({ ...activeDetail, status: 'searching' });
                  }}
                  className="flex-1 rounded-xl bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                >
                  Mark as Actively Searching
                </button>
              )}
              {activeDetail.status !== 'reunited' && activeDetail.status !== 'closed' && (
                <button
                  onClick={() => {
                    const updated = reports.map((r) =>
                      r._id === activeDetail._id ? { ...r, status: 'reunited' } : r
                    );
                    setReports(updated);
                    setActiveDetail({ ...activeDetail, status: 'reunited' });
                  }}
                  className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Mark as Reunited 🎉
                </button>
              )}
              <button
                onClick={() => setActiveDetail(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OwnerLostPet;

