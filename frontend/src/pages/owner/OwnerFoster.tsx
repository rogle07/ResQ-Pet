import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { fosterApi } from '@/features/foster/fosterApi';
import { petApi } from '@/features/pets/petApi';
import { openRazorpayCheckout } from '@/utils/razorpay';
import { useAppSelector } from '@/app/hooks';
import Modal from '@/components/ui/Modal';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  FileText,
  CreditCard,
  PawPrint,
  IndianRupee,
  Phone,
  MessageSquare,
  Send,
  HandshakeIcon,
  RefreshCw,
  ShieldCheck,
  Eye,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800' },
  interested: { label: 'Provider Interested', color: 'text-blue-700', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800' },
  negotiation: { label: 'In Negotiation', color: 'text-purple-700', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800' },
  awaiting_provider_confirmation: { label: 'Awaiting Provider', color: 'text-orange-700', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800' },
  awaiting_owner_confirmation: { label: 'Awaiting Your Confirmation', color: 'text-teal-700', bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200 dark:border-teal-800' },
  agreement_completed: { label: 'Agreement Completed ✓', color: 'text-emerald-700', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800' },
  payment_pending: { label: 'Payment Pending', color: 'text-rose-700', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800' },
  payment_completed: { label: 'Payment Completed', color: 'text-emerald-700', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800' },
  active: { label: 'Active Foster Care', color: 'text-emerald-700', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800' },
  accepted: { label: 'Accepted', color: 'text-emerald-700', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800' },
  completed: { label: 'Completed', color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700' },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800' },
  cancelled: { label: 'Cancelled', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700' },
};

const REASON_OPTIONS = [
  'Work travel',
  'Home relocation',
  'Temporary medical treatment',
  'Family emergency',
  'Home renovation',
  'Vacation / Personal trip',
  'Pet medical recovery',
  'Other personal reason',
];

const INITIAL_MOCK_REQUESTS: any[] = [
  {
    _id: 'req-milo-02',
    requestId: 'FC-MILO02',
    pet: { _id: 'mock-pet-milo', name: 'Milo', species: 'cat', images: [{ url: '/pet-milo.jpg' }] },
    requestedBy: { _id: 'user-owner', name: 'Suraj Kumar' },
    fosterProvider: { _id: 'foster-sarah', name: 'Sarah Jenkins (Green Meadows Sanctuary)' },
    reason: 'Post-treatment recovery care needed.',
    durationDays: 8,
    startDate: '2025-08-02',
    endDate: '2025-08-10',
    budgetAmount: 1500,
    status: 'awaiting_owner_confirmation',
    providerAgreed: true,
    ownerAgreed: false,
    paymentRequired: true,
    paymentStatus: 'not_required',
    messages: [
      { sender: { _id: 'user-owner', name: 'Suraj Kumar' }, text: 'Milo needs quiet recovery care.', sentAt: '2025-08-02T09:15:00.000Z' },
      { sender: { _id: 'foster-sarah', name: 'Sarah Jenkins' }, text: 'We have a quiet feline suite ready. I agree to the terms!', sentAt: '2025-08-02T14:20:00.000Z' },
    ],
    createdAt: '2025-08-02T09:15:00.000Z',
  },
  {
    _id: 'req-luna-03',
    requestId: 'FC-LUNA03',
    pet: { _id: 'mock-pet-luna', name: 'Luna', species: 'rabbit', images: [{ url: '/animal-rabbit.jpg' }] },
    requestedBy: { _id: 'user-owner', name: 'Suraj Kumar' },
    fosterProvider: undefined,
    reason: 'Family Emergency',
    durationDays: 10,
    budgetAmount: 0,
    status: 'pending',
    providerAgreed: false,
    ownerAgreed: false,
    paymentRequired: false,
    paymentStatus: 'not_required',
    messages: [
      { sender: { _id: 'user-owner', name: 'Suraj Kumar' }, text: 'Family emergency, need 10-day foster care.', sentAt: '2025-08-05T08:00:00.000Z' },
    ],
    createdAt: '2025-08-05T08:00:00.000Z',
  },
];

interface FosterForm {
  petId: string;
  reason: string;
  durationDays: number | '';
  startDate: string;
  endDate: string;
  budgetAmount: number | '';
  petBehavior: string;
  feedingInstructions: string;
  medicalRequirements: string;
  location: string;
  ownerName: string;
  contactInfo: string;
}


const getPetPhoto = (pet?: any) => {
  const url = pet?.images?.[0]?.url;
  if (url && !url.includes('/pets/cat_tabby') && !url.includes('/pets/rabbit_white')) {
    return url;
  }
  if (pet?.name?.toLowerCase().includes('milo')) return '/pet-milo.jpg';
  if (pet?.name?.toLowerCase().includes('luna')) return '/animal-rabbit.jpg';
  if (pet?.species === 'dog') return '/animal-dog.jpg';
  if (pet?.species === 'cat') return '/pet-milo.jpg';
  if (pet?.species === 'rabbit') return '/animal-rabbit.jpg';
  return '/pet-milo.jpg';
};

const OwnerFoster = () => {
  const currentUser = useAppSelector((s) => s.auth.user);

  const [requests, setRequests] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('resqpet_foster_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return INITIAL_MOCK_REQUESTS;
  });

  const [pets, setPets] = useState<any[]>([]);
  const [activeDetail, setActiveDetail] = useState<any | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState('');
  const [serverError, setServerError] = useState('');
  const [newMsg, setNewMsg] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FosterForm>({
    defaultValues: {
      reason: 'Work travel',
      durationDays: 14,
      budgetAmount: '',
      ownerName: currentUser?.name || '',
      contactInfo: currentUser?.phone || currentUser?.email || '',
    },
  });

  useEffect(() => {
    try {
      localStorage.setItem('resqpet_foster_v4', JSON.stringify(requests));
    } catch { /* ignore */ }
  }, [requests]);

  useEffect(() => {
    petApi.list().then((data) => {
      if (Array.isArray(data) && data.length > 0) setPets(data);
    }).catch(() => {});
  }, []);

  const onSubmit = async (values: FosterForm) => {
    setServerError('');
    const targetPet = pets.find((p: any) => p._id === values.petId) || pets[0];

    const newRequest: any = {
      _id: `req-${Date.now()}`,
      requestId: `FC-${Date.now().toString(36).toUpperCase()}`,
      pet: targetPet ? { _id: targetPet._id, name: targetPet.name, species: targetPet.species, images: targetPet.images } : { name: 'My Pet' },
      requestedBy: { _id: currentUser?._id || 'user', name: currentUser?.name || values.ownerName },
      fosterProvider: undefined,
      reason: values.reason,
      durationDays: values.durationDays ? Number(values.durationDays) : 14,
      startDate: values.startDate,
      endDate: values.endDate,
      budgetAmount: values.budgetAmount ? Number(values.budgetAmount) : 0,
      petBehavior: values.petBehavior,
      feedingInstructions: values.feedingInstructions,
      medicalRequirements: values.medicalRequirements,
      location: values.location,
      status: 'pending',
      providerAgreed: false,
      ownerAgreed: false,
      paymentRequired: values.budgetAmount ? Number(values.budgetAmount) > 0 : false,
      paymentStatus: 'not_required',
      messages: [{
        sender: { _id: currentUser?._id || 'user', name: currentUser?.name || values.ownerName },
        text: `Foster care request submitted for ${targetPet?.name || 'my pet'} (${values.reason}).`,
        sentAt: new Date().toISOString(),
      }],
      createdAt: new Date().toISOString(),
    };

    try {
      await fosterApi.create({
        petId: values.petId,
        reason: values.reason,
        durationDays: values.durationDays ? Number(values.durationDays) : undefined,
      });
    } catch { /* local fallback */ }

    setRequests((prev) => [newRequest, ...prev]);
    setFormOpen(false);
    reset();
    setSuccessMsg(`Foster care request submitted! ID: ${newRequest.requestId}. Awaiting provider response.`);
    setTimeout(() => setSuccessMsg(''), 7000);
  };

  const handleSendMessage = (requestId: string) => {
    if (!newMsg.trim()) return;
    const msg = {
      sender: { _id: currentUser?._id || 'user', name: currentUser?.name || 'Owner' },
      text: newMsg.trim(),
      sentAt: new Date().toISOString(),
    };
    const updater = (r: any) => r._id !== requestId ? r : { ...r, messages: [...(r.messages || []), msg] };
    setRequests((prev) => prev.map(updater));
    setActiveDetail((prev: any) => prev && prev._id === requestId ? updater(prev) : prev);
    setNewMsg('');
  };

  const handleOwnerConfirm = async (requestId: string) => {
    const req = requests.find((r) => r._id === requestId);
    if (!req) return;

    const updater = (r: any) => r._id !== requestId ? r : {
      ...r,
      ownerAgreed: true,
      status: req.paymentRequired ? 'payment_pending' : 'agreement_completed',
      messages: [...(r.messages || []), {
        sender: { _id: currentUser?._id, name: currentUser?.name },
        text: 'I confirm and agree to the foster care terms. Ready to proceed!',
        sentAt: new Date().toISOString(),
      }],
    };
    setRequests((prev) => prev.map(updater));
    setActiveDetail((prev: any) => prev && prev._id === requestId ? updater(prev) : prev);
    setSuccessMsg('You have confirmed the foster care agreement!');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handlePayment = async (req: any) => {
    if (!req.budgetAmount || req.budgetAmount <= 0) return;
    setIsProcessingPayment(true);
    try {
      const response = await openRazorpayCheckout({
        amount: req.budgetAmount,
        currency: 'INR',
        name: 'ResQPet Foster Care',
        description: `Foster care payment for ${req.pet?.name || 'Pet'}`,
        prefill: {
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          contact: currentUser?.phone || '',
        },
        theme: { color: '#16a34a' },
      });

      const updater = (r: any) => r._id !== req._id ? r : {
        ...r,
        status: 'payment_completed',
        paymentStatus: 'paid',
        paymentId: response.razorpay_payment_id,
        paidAmount: req.budgetAmount,
        messages: [...(r.messages || []), {
          sender: { _id: currentUser?._id, name: currentUser?.name },
          text: `Payment of ₹${req.budgetAmount} completed successfully! (ID: ${response.razorpay_payment_id})`,
          sentAt: new Date().toISOString(),
        }],
      };
      setRequests((prev) => prev.map(updater));
      setActiveDetail((prev: any) => prev && prev._id === req._id ? updater(prev) : prev);
      setSuccessMsg(`Payment of ₹${req.budgetAmount} confirmed! Foster care agreement is now active.`);
      setTimeout(() => setSuccessMsg(''), 7000);
    } catch (err: any) {
      if (!err?.message?.toLowerCase().includes('cancelled')) {
        setServerError('Payment failed. Please try again.');
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return ['pending', 'interested', 'negotiation'].includes(r.status);
    if (statusFilter === 'agreement') return ['awaiting_provider_confirmation', 'awaiting_owner_confirmation', 'agreement_completed'].includes(r.status);
    if (statusFilter === 'payment') return ['payment_pending', 'payment_completed'].includes(r.status);
    if (statusFilter === 'active') return ['active', 'accepted'].includes(r.status);
    if (statusFilter === 'completed') return ['completed', 'rejected', 'cancelled'].includes(r.status);
    return true;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => ['pending', 'interested'].includes(r.status)).length,
    inProgress: requests.filter((r) => ['negotiation', 'awaiting_provider_confirmation', 'awaiting_owner_confirmation', 'agreement_completed', 'payment_pending'].includes(r.status)).length,
    active: requests.filter((r) => ['active', 'accepted', 'payment_completed'].includes(r.status)).length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-white">Foster Care</h2>
          <p className="text-sm text-slate-500 mt-1">Find temporary homes for your pets through our mutual agreement process.</p>
        </div>
        <button
          onClick={() => { reset(); setFormOpen(true); }}
          className="flex items-center gap-2 rounded-xl bg-[#1e6f42] px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Foster Request
        </button>
      </div>

      {/* Success / Error */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />{successMsg}
        </div>
      )}
      {serverError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />{serverError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats.total, cls: 'text-slate-700' },
          { label: 'Pending', value: stats.pending, cls: 'text-amber-700' },
          { label: 'In Progress', value: stats.inProgress, cls: 'text-blue-700' },
          { label: 'Active Care', value: stats.active, cls: 'text-emerald-700' },
        ].map((s) => (
          <div key={s.label} className="card">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Agreement Process Banner */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/20 p-4">
        <h4 className="font-semibold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-2">
          <ShieldCheck className="h-4 w-4" />
          How Foster Care Works — Mutual Agreement Process
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            'Submit Request',
            'Provider Reviews',
            'Both Discuss via Chat',
            'Provider Agrees',
            'You Confirm',
            'Payment (if applicable)',
            'Foster Care Begins',
          ].map((step, i) => (
            <div key={step} className="flex items-center gap-1">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold text-[10px]">{i + 1}</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">{step}</span>
              {i < 6 && <ChevronRight className="h-3 w-3 text-emerald-400" />}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'agreement', label: 'Agreement Stage' },
          { key: 'payment', label: 'Payment' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === f.key
                ? 'bg-[#1e6f42] text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="card py-16 text-center">
          <PawPrint className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">No foster care requests</h3>
          <p className="text-sm text-slate-400 mt-1">Submit a new request to find a temporary home for your pet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const sc = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
            const needsOwnerConfirm = req.status === 'awaiting_owner_confirmation' && !req.ownerAgreed;
            const canPay = req.status === 'payment_pending' && req.paymentRequired;

            return (
              <div key={req._id} className={`card border-l-4 ${sc.border} hover:shadow-md transition-shadow`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <img
                      src={getPetPhoto(req.pet)}
                      alt={req.pet?.name || 'Pet'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/pet-milo.jpg';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 dark:text-white">{req.pet?.name || 'Pet'}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                      {needsOwnerConfirm && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 animate-pulse">
                          Action Required
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{req.durationDays} days</span>
                      {req.startDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(req.startDate).toLocaleDateString()}</span>}
                      {req.budgetAmount > 0 && <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />₹{req.budgetAmount}</span>}
                      <span>ID: {req.requestId}</span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{req.reason}</p>

                    {req.fosterProvider && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" />Provider: {req.fosterProvider.name}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 sm:flex-col shrink-0">
                    <button
                      onClick={() => setActiveDetail(req)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Details
                    </button>
                    {needsOwnerConfirm && (
                      <button
                        onClick={() => handleOwnerConfirm(req._id)}
                        className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirm
                      </button>
                    )}
                    {canPay && (
                      <button
                        onClick={() => handlePayment(req)}
                        disabled={isProcessingPayment}
                        className="flex items-center gap-1.5 rounded-lg bg-[#1e6f42] px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Pay ₹{req.budgetAmount}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── NEW REQUEST FORM MODAL ── */}
      <Modal isOpen={isFormOpen} onClose={() => setFormOpen(false)} title="New Foster Care Request">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
            <strong>How it works:</strong> Submit your request → Provider reviews → Both parties discuss → Mutual agreement → Payment (only if applicable)
          </div>

          {pets.length > 0 && (
            <div>
              <label className="label">Select Your Pet</label>
              <select className="input" {...register('petId')}>
                {pets.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.species})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Reason for Foster Care</label>
              <select className="input" {...register('reason', { required: true })}>
                {REASON_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Duration (Days)</label>
              <input type="number" className="input" min={1} {...register('durationDays')} />
            </div>
            <div>
              <label className="label">Expected Start Date</label>
              <input type="date" className="input" {...register('startDate')} />
            </div>
            <div>
              <label className="label">Expected End Date</label>
              <input type="date" className="input" {...register('endDate')} />
            </div>
          </div>

          <div>
            <label className="label">Budget / Care Charges Offered (₹)</label>
            <input type="number" className="input" placeholder="Leave empty if no budget" {...register('budgetAmount')} />
            <p className="text-xs text-slate-400 mt-1">⚠️ Payment will only be requested after mutual agreement is reached.</p>
          </div>

          <div>
            <label className="label">Pet Behavior Information</label>
            <textarea className="input min-h-[60px]" placeholder="Is your pet friendly, shy, active?" {...register('petBehavior')} />
          </div>

          <div>
            <label className="label">Feeding Instructions</label>
            <textarea className="input min-h-[60px]" placeholder="Food type, quantity, schedule..." {...register('feedingInstructions')} />
          </div>

          <div>
            <label className="label">Medical Requirements</label>
            <textarea className="input min-h-[60px]" placeholder="Any medications, allergies, vet visits..." {...register('medicalRequirements')} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Your Location</label>
              <input type="text" className="input" placeholder="City, Area" {...register('location')} />
            </div>
            <div>
              <label className="label">Contact Info</label>
              <input type="text" className="input" placeholder="Phone or email" {...register('contactInfo')} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-xl bg-[#1e6f42] px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
              {isSubmitting ? <><RefreshCw className="h-4 w-4 animate-spin" /> Submitting...</> : <><FileText className="h-4 w-4" /> Submit Request</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── DETAIL / CHAT MODAL ── */}
      <Modal isOpen={!!activeDetail} onClose={() => setActiveDetail(null)} title={`Foster Request — ${activeDetail?.requestId}`}>
        {activeDetail && (() => {
          const sc = STATUS_CONFIG[activeDetail.status] || STATUS_CONFIG.pending;
          const needsConfirm = activeDetail.status === 'awaiting_owner_confirmation' && !activeDetail.ownerAgreed;
          const canPayNow = activeDetail.status === 'payment_pending' && activeDetail.paymentRequired;

          return (
            <div className="space-y-4">
              {/* Status */}
              <div className={`px-3 py-2 rounded-lg text-sm font-semibold border ${sc.bg} ${sc.color} ${sc.border}`}>
                Status: {sc.label}
              </div>

              {/* Agreement Progress */}
              {needsConfirm && (
                <div className="rounded-xl border border-teal-200 bg-teal-50 dark:bg-teal-950/30 dark:border-teal-800 p-4">
                  <p className="font-bold text-teal-800 dark:text-teal-300 text-sm flex items-center gap-2">
                    <HandshakeIcon className="h-4 w-4" />
                    Provider Has Agreed to the Terms
                  </p>
                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                    Are you ready to proceed with this Foster Care Agreement?
                  </p>
                  <button
                    onClick={() => { handleOwnerConfirm(activeDetail._id); setActiveDetail((p: any) => p ? { ...p, ownerAgreed: true, status: activeDetail.paymentRequired ? 'payment_pending' : 'agreement_completed' } : null); }}
                    className="mt-3 flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-sm font-bold text-white hover:bg-teal-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Yes, I Agree — Proceed
                  </button>
                </div>
              )}

              {canPayNow && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 p-4">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                    ✅ Mutual Agreement Complete — Payment Required
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Both parties have agreed. Complete payment to activate foster care.
                  </p>
                  <button
                    onClick={() => handlePayment(activeDetail)}
                    disabled={isProcessingPayment}
                    className="mt-3 flex items-center gap-2 rounded-xl bg-[#1e6f42] px-5 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                  >
                    <CreditCard className="h-4 w-4" />
                    Pay ₹{activeDetail.budgetAmount} via Razorpay
                  </button>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-xs text-slate-400">Pet</span><p className="font-semibold text-slate-800 dark:text-white">{activeDetail.pet?.name}</p></div>
                <div><span className="text-xs text-slate-400">Duration</span><p className="font-semibold text-slate-800 dark:text-white">{activeDetail.durationDays} days</p></div>
                <div><span className="text-xs text-slate-400">Reason</span><p className="font-semibold text-slate-800 dark:text-white">{activeDetail.reason}</p></div>
                {activeDetail.budgetAmount > 0 && <div><span className="text-xs text-slate-400">Budget</span><p className="font-semibold text-slate-800 dark:text-white">₹{activeDetail.budgetAmount}</p></div>}
                {activeDetail.fosterProvider && <div className="col-span-2"><span className="text-xs text-slate-400">Provider</span><p className="font-semibold text-emerald-700 dark:text-emerald-400">{activeDetail.fosterProvider.name}</p></div>}
                {activeDetail.petBehavior && <div className="col-span-2"><span className="text-xs text-slate-400">Pet Behavior</span><p className="text-sm text-slate-700 dark:text-slate-300">{activeDetail.petBehavior}</p></div>}
                {activeDetail.feedingInstructions && <div className="col-span-2"><span className="text-xs text-slate-400">Feeding</span><p className="text-sm text-slate-700 dark:text-slate-300">{activeDetail.feedingInstructions}</p></div>}
                {activeDetail.medicalRequirements && <div className="col-span-2"><span className="text-xs text-slate-400">Medical</span><p className="text-sm text-slate-700 dark:text-slate-300">{activeDetail.medicalRequirements}</p></div>}
              </div>

              {/* Chat Section */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <h4 className="font-semibold text-sm text-slate-800 dark:text-white flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  Communication
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                  {(activeDetail.messages || []).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No messages yet.</p>
                  ) : (
                    (activeDetail.messages || []).map((msg: any, i: number) => {
                      const isOwn = msg.sender?._id === (currentUser?._id || 'user-owner');
                      return (
                        <div key={i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${isOwn ? 'bg-[#1e6f42] text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                            <p className={`font-bold text-[10px] mb-0.5 ${isOwn ? 'text-emerald-200' : 'text-slate-400'}`}>{msg.sender?.name}</p>
                            <p>{msg.text}</p>
                            <p className={`text-[10px] mt-1 ${isOwn ? 'text-emerald-200' : 'text-slate-400'}`}>
                              {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="input text-xs flex-1"
                    placeholder="Type a message..."
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(activeDetail._id)}
                  />
                  <button
                    onClick={() => handleSendMessage(activeDetail._id)}
                    className="flex items-center gap-1 rounded-xl bg-[#1e6f42] px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default OwnerFoster;
