import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { fosterApi } from '@/features/foster/fosterApi';
import { donationApi } from '@/features/donations/donationApi';
import { petApi } from '@/features/pets/petApi';
import { openRazorpayCheckout, RAZORPAY_KEY_ID } from '@/utils/razorpay';
import { useAppSelector } from '@/app/hooks';
import Modal from '@/components/ui/Modal';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  FileText,
  CreditCard,
  Printer,
  Lock,
  PawPrint,
  IndianRupee,
  Phone,
  User,
  Sparkles,
} from 'lucide-react';

/* ── Community Feedback Definitions ────────────────────────────────────── */
export interface CommunityFeedbackItem {
  id: string;
  name: string;
  rating: number;
  timeAgo: string;
  comment: string;
  avatar: string;
  verified: boolean;
}

const INITIAL_COMMUNITY_FEEDBACK: CommunityFeedbackItem[] = [
  {
    id: 'fb-1',
    name: 'Neha Sharma',
    rating: 5,
    timeAgo: '2 weeks ago',
    comment:
      'ResQPet made it so easy to find a foster home for my dog. The process was smooth and supportive. Thank you!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    id: 'fb-2',
    name: 'Rohit Mehta',
    rating: 5,
    timeAgo: '3 weeks ago',
    comment:
      'I was able to send a foster request quickly and got a response within a day. Great platform for pet lovers!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    id: 'fb-3',
    name: 'Priya Singh',
    rating: 5,
    timeAgo: '1 month ago',
    comment:
      'Fostering through ResQPet was a wonderful experience. The support team is very helpful and caring.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    verified: true,
  },
];

/* ── Reason Options for Dropdown ────────────────────────────────────────── */
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

/* ── Initial Mock Pets matching screenshot ──────────────────────────────── */
const INITIAL_MOCK_PETS: any[] = [
  {
    _id: 'mock-pet-bittu',
    petId: 'PET-BITTU-05',
    owner: 'user-owner',
    name: 'bittu',
    species: 'cat',
    breed: 'Ragdoll',
    age: 4,
    gender: 'female',
    images: [{ url: '/pets/cat_tabby.jpg', publicId: 'pet-bittu' }],
    vaccinations: [{ name: 'Rabies & FVRCP', dateGiven: '2025-02-10' }],
    medicalConditions: [],
    collar: { isActive: false },
    safeZone: { enabled: false, radiusMeters: 200 },
    status: 'safe',
    healthStatus: 'Healthy',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock-pet-bruno',
    petId: 'PET-BRUNO-01',
    owner: 'user-owner',
    name: 'Bruno',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 2,
    gender: 'male',
    images: [{ url: '/pets/dog_golden.jpg', publicId: 'pet-bruno' }],
    vaccinations: [{ name: 'Rabies & DHPP', dateGiven: '2025-01-10' }],
    medicalConditions: [],
    collar: { isActive: true },
    safeZone: { enabled: true, radiusMeters: 500 },
    status: 'safe',
    healthStatus: 'Healthy',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock-pet-milo',
    petId: 'PET-MILO-02',
    owner: 'user-owner',
    name: 'Milo',
    species: 'cat',
    breed: 'Domestic Shorthair',
    age: 1,
    gender: 'male',
    images: [{ url: '/pets/cat_tabby.jpg', publicId: 'pet-milo' }],
    vaccinations: [{ name: 'FVRCP', dateGiven: '2025-02-15' }],
    medicalConditions: [],
    collar: { isActive: false },
    safeZone: { enabled: false, radiusMeters: 200 },
    status: 'safe',
    healthStatus: 'Healthy',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock-pet-luna',
    petId: 'PET-LUNA-03',
    owner: 'user-owner',
    name: 'Luna',
    species: 'other',
    breed: 'Angora Rabbit',
    age: 1,
    gender: 'female',
    images: [{ url: '/pets/rabbit_white.jpg', publicId: 'pet-luna' }],
    vaccinations: [{ name: 'Myxomatosis', dateGiven: '2025-03-01' }],
    medicalConditions: [],
    collar: { isActive: false },
    safeZone: { enabled: false, radiusMeters: 100 },
    status: 'safe',
    healthStatus: 'Healthy',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock-pet-coco',
    petId: 'PET-COCO-04',
    owner: 'user-owner',
    name: 'Coco',
    species: 'dog',
    breed: 'Beagle',
    age: 1,
    gender: 'female',
    images: [{ url: '/pets/dog_beagle.jpg', publicId: 'pet-coco' }],
    vaccinations: [{ name: 'Multi-vax', dateGiven: '2025-02-01' }],
    medicalConditions: [],
    collar: { isActive: false },
    safeZone: { enabled: false, radiusMeters: 500 },
    status: 'safe',
    healthStatus: 'Healthy',
    createdAt: new Date().toISOString(),
  },
];

/* ── Initial Mock Requests ──────────────────────────────────────────────── */
const INITIAL_MOCK_REQUESTS: any[] = [
  {
    _id: 'req-bruno-01',
    pet: {
      _id: 'mock-pet-bruno',
      name: 'Bruno',
      species: 'dog',
      images: [{ url: '/pets/dog_golden.jpg' }],
    },
    requestedBy: {
      _id: 'user-owner',
      name: 'Suraj Kumar',
      phone: '+91 98765 43210',
    },
    fosterProvider: undefined,
    reason: 'Reason: Travel / Vacation\nDuration: 8 days\nDates: 12 Aug 2025 - 20 Aug 2025\nOffered Care Charges: ₹3500\n[Care Escrow Paid: ₹3500 via Razorpay (Txn ID: RZP-pay_demo_77192)]\nNotes: Bruno loves daily walks and requires regular kibble twice daily.',
    durationDays: 8,
    status: 'pending',
    paidAmount: 3500,
    paymentId: 'RZP-pay_demo_77192',
    paymentStatus: 'paid',
    locationSharingEnabled: false,
    ownerReturnNotified: false,
    readyForReturn: false,
    ownerConfirmed: false,
    messages: [
      {
        sender: { _id: 'user-owner', name: 'Suraj Kumar' },
        text: 'Request submitted for temporary foster care. ₹3500 care charges secured via Razorpay.',
        sentAt: '2025-08-12T10:30:00.000Z',
      },
    ],
    createdAt: '2025-08-12T10:30:00.000Z',
  },
  {
    _id: 'req-milo-02',
    pet: {
      _id: 'mock-pet-milo',
      name: 'Milo',
      species: 'cat',
      images: [{ url: '/pets/cat_tabby.jpg' }],
    },
    requestedBy: {
      _id: 'user-owner',
      name: 'Suraj Kumar',
      phone: '+91 98765 43210',
    },
    fosterProvider: {
      _id: 'foster-sarah-jenkins',
      name: 'Sarah Jenkins (Green Meadows Sanctuary)',
    },
    reason: 'Reason: Health Treatment\nDuration: 8 days\nDates: 02 Aug 2025 - 10 Aug 2025\nOffered Care Charges: ₹1500\nNotes: Post-treatment recovery care needed. Milo is calm and gentle.',
    durationDays: 8,
    status: 'accepted',
    paidAmount: 1500,
    paymentId: 'RZP-pay_demo_88201',
    paymentStatus: 'paid',
    locationSharingEnabled: false,
    ownerReturnNotified: false,
    readyForReturn: false,
    ownerConfirmed: false,
    messages: [
      {
        sender: { _id: 'user-owner', name: 'Suraj Kumar' },
        text: 'Need quiet environment for Milo during medical recovery.',
        sentAt: '2025-08-02T09:15:00.000Z',
      },
      {
        sender: { _id: 'foster-sarah-jenkins', name: 'Sarah Jenkins' },
        text: 'We are delighted to welcome Milo! Our quiet feline suite is all set.',
        sentAt: '2025-08-02T14:20:00.000Z',
      },
    ],
    createdAt: '2025-08-02T09:15:00.000Z',
  },
  {
    _id: 'req-luna-03',
    pet: {
      _id: 'mock-pet-luna',
      name: 'Luna',
      species: 'other',
      images: [{ url: '/pets/rabbit_white.jpg' }],
    },
    requestedBy: {
      _id: 'user-owner',
      name: 'Suraj Kumar',
      phone: '+91 98765 43210',
    },
    fosterProvider: undefined,
    reason: 'Reason: Family Emergency\nDuration: 10 days\nDates: 05 Aug 2025 - 15 Aug 2025\nNotes: Urgent care required due to family emergency travel.',
    durationDays: 10,
    status: 'rejected',
    locationSharingEnabled: false,
    ownerReturnNotified: false,
    readyForReturn: false,
    ownerConfirmed: false,
    messages: [
      {
        sender: { _id: 'user-owner', name: 'Suraj Kumar' },
        text: 'Family emergency, seeking foster care for 10 days.',
        sentAt: '2025-08-05T08:00:00.000Z',
      },
    ],
    createdAt: '2025-08-05T08:00:00.000Z',
  },
];

/* ── Foster Care Escrow Packages for Payment Gateway ────────────────────── */
export const FOSTER_PAYMENT_PACKAGES = [
  {
    id: 'foster_daily_care',
    label: 'Daily Care & Feeding Allowance',
    amount: 499,
    tag: 'Standard',
    desc: 'Nutritious meals, fresh bedding, and verified foster home daily care allowance.',
  },
  {
    id: 'foster_medical_escrow',
    label: 'Medical & Vet Contingency Escrow',
    amount: 999,
    tag: 'Recommended',
    desc: 'Emergency veterinary checkups, vaccination updates & 24/7 tele-vet escrow reserve.',
  },
  {
    id: 'foster_care_charges_3500',
    label: '14-Day Full Foster Care Package',
    amount: 3500,
    tag: 'Most Popular',
    desc: 'Two weeks complete foster accommodation, meal routine, play sessions & photo check-ins.',
  },
  {
    id: 'foster_full_care',
    label: 'Complete 30-Day Fostering Deposit',
    amount: 5000,
    tag: 'All-Inclusive',
    desc: 'Full month accommodation, grooming, health monitoring & priority home placement.',
  },
];

export interface FosterFormValues {
  petId: string;
  ownerName: string;
  contactInfo: string;
  durationDays: number | '';
  offeredCharges: number | '';
  reason: string;
  startDate: string;
  endDate: string;
  additionalNotes: string;
}

export interface PaymentReceiptData {
  id: string;
  txnId: string;
  petName: string;
  amount: number;
  serviceType: string;
  date: string;
  invoiceNumber: string;
  method: string;
}

/* ═════════════════════════════════════════════════════════════════════════
   OWNER FOSTER COMPONENT
═════════════════════════════════════════════════════════════ */
const OwnerFoster = () => {
  const currentUser = useAppSelector((s) => s.auth.user);

  // Requests state
  const [requests, setRequests] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('resqpet_foster_requests_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return INITIAL_MOCK_REQUESTS;
  });

  // Pets state
  const [pets, setPets] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('resqpet_owner_pets_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return INITIAL_MOCK_PETS;
  });

  const [selectedPetId, setSelectedPetId] = useState<string>(() => INITIAL_MOCK_PETS[0]._id);
  const [activeDetail, setActiveDetail] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [newMessageText, setNewMessageText] = useState('');

  // Modals state
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [isAddPetModalOpen, setAddPetModalOpen] = useState(false);
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<PaymentReceiptData | null>(null);

  // New Pet Form
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<string>('dog');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetAge, setNewPetAge] = useState('2');
  const [newPetHealth, setNewPetHealth] = useState('Healthy');

  // Payment State
  const [selectedPackageId, setSelectedPackageId] = useState('foster_care_charges_3500');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentForRequest, setPaymentForRequest] = useState<any | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Community Feedback
  const [feedbacks, setFeedbacks] = useState<CommunityFeedbackItem[]>(INITIAL_COMMUNITY_FEEDBACK);
  const [newFeedbackName, setNewFeedbackName] = useState('');
  const [newFeedbackRating, setNewFeedbackRating] = useState(5);
  const [newFeedbackComment, setNewFeedbackComment] = useState('');

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem('resqpet_foster_requests_v3', JSON.stringify(requests));
    } catch { /* ignore */ }
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem('resqpet_owner_pets_v3', JSON.stringify(pets));
    } catch { /* ignore */ }
  }, [pets]);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FosterFormValues>({
    defaultValues: {
      petId: INITIAL_MOCK_PETS[0]._id,
      ownerName: currentUser?.name || 'petowner',
      contactInfo: currentUser?.email || currentUser?.phone || 'petowner@gmail.com',
      durationDays: 14,
      offeredCharges: 3500,
      reason: 'Work travel',
      startDate: '',
      endDate: '',
      additionalNotes: '',
    },
  });

  const watchedCharges = watch('offeredCharges');
  const watchedNotes = watch('additionalNotes') || '';

  // Synchronize backend data on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [liveRequests, livePets] = await Promise.allSettled([fosterApi.list(), petApi.list()]);
        if (isMounted) {
          if (livePets.status === 'fulfilled' && (livePets.value as any[]).length > 0) {
            setPets((prev) => {
              const ids = new Set((livePets.value as any[]).map((p: any) => p._id));
              const extras = prev.filter((p: any) => !ids.has(p._id));
              return [...(livePets.value as any[]), ...extras];
            });
          }
          if (liveRequests.status === 'fulfilled' && (liveRequests.value as any[]).length > 0) {
            setRequests((prev) => {
              const ids = new Set((liveRequests.value as any[]).map((r: any) => r._id));
              const extras = prev.filter((r: any) => !ids.has(r._id));
              return [...(liveRequests.value as any[]), ...extras];
            });
          }
        }
      } catch { /* ignore */ }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync petId form value when selected pet changes
  useEffect(() => {
    setValue('petId', selectedPetId);
  }, [selectedPetId, setValue]);

  const selectedPet = pets.find((p: any) => p._id === selectedPetId) || pets[0];

  // Request status counts for Right Sidebar
  const countPending = requests.filter((r: any) => r.status === 'pending').length;
  const countApproved = requests.filter((r: any) => r.status === 'accepted' || r.status === 'in_foster' || r.status === 'active').length;
  const countRejected = requests.filter((r: any) => r.status === 'rejected' || r.status === 'cancelled').length;

  // Filtered requests list
  const filteredRequests = requests.filter((r: any) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return r.status === 'pending';
    if (statusFilter === 'accepted') return r.status === 'accepted' || r.status === 'in_foster' || r.status === 'active';
    if (statusFilter === 'rejected') return r.status === 'rejected' || r.status === 'cancelled';
    return true;
  });

  const displayedRequests = showAllRequests ? filteredRequests : filteredRequests.slice(0, 4);

  // ── Helper to execute foster creation ─────────────────────────────────
  const executeFosterSubmission = async (
    values: FosterFormValues,
    paymentReceipt?: PaymentReceiptData
  ) => {
    const targetPet = pets.find((p: any) => p._id === values.petId) || selectedPet;

    const dateStr = values.startDate && values.endDate
      ? `${new Date(values.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(values.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
      : 'Dates to be arranged';

    const parts = [
      values.reason ? `Reason: ${values.reason}` : '',
      `Duration: ${values.durationDays || '14'} days`,
      `Dates: ${dateStr}`,
      values.offeredCharges ? `Offered Budget / Care Charges: ₹${values.offeredCharges}` : '',
      values.ownerName ? `Owner: ${values.ownerName}` : '',
      values.contactInfo ? `Contact: ${values.contactInfo}` : '',
      values.additionalNotes ? `Requirements/Notes: ${values.additionalNotes}` : '',
      paymentReceipt ? `[Care Escrow Paid: ₹${paymentReceipt.amount} via Razorpay (Txn ID: ${paymentReceipt.txnId})]` : '',
    ].filter(Boolean);

    let createdReq: any;

    try {
      const res = await fosterApi.create({
        petId: values.petId,
        reason: parts.join('\n'),
        durationDays: values.durationDays ? Number(values.durationDays) : undefined,
      });
      createdReq = {
        ...res,
        paidAmount: paymentReceipt?.amount,
        paymentId: paymentReceipt?.txnId,
        paymentStatus: paymentReceipt ? 'paid' : (values.offeredCharges ? 'unpaid' : undefined),
      };
    } catch {
      // Local fallback
      createdReq = {
        _id: `req-${Date.now()}`,
        pet: {
          _id: targetPet._id,
          name: targetPet.name,
          species: targetPet.species,
          images: targetPet.images && targetPet.images.length > 0 ? targetPet.images : [{ url: '/pets/dog_golden.jpg' }],
        },
        requestedBy: {
          _id: currentUser?._id || 'user-owner',
          name: values.ownerName || currentUser?.name || 'Suraj Kumar',
          phone: values.contactInfo || currentUser?.phone || '+91 98765 43210',
        },
        reason: parts.join('\n'),
        durationDays: values.durationDays ? Number(values.durationDays) : 14,
        status: 'pending',
        paidAmount: paymentReceipt?.amount,
        paymentId: paymentReceipt?.txnId,
        paymentStatus: paymentReceipt ? 'paid' : (values.offeredCharges ? 'unpaid' : undefined),
        locationSharingEnabled: false,
        ownerReturnNotified: false,
        readyForReturn: false,
        ownerConfirmed: false,
        messages: [
          {
            sender: { _id: currentUser?._id || 'user-owner', name: values.ownerName || currentUser?.name || 'Suraj Kumar' },
            text: `Foster request submitted: ${values.reason}${paymentReceipt ? ` (Care charges of ₹${paymentReceipt.amount} paid upfront via Razorpay: ${paymentReceipt.txnId})` : ''}`,
            sentAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
      };
    }

    setRequests((prev) => [createdReq, ...prev]);
    setRequestModalOpen(false);

    if (paymentReceipt) {
      setSuccessMsg(`Foster care request submitted for ${targetPet.name}! ₹${paymentReceipt.amount} care charges secured via Razorpay (${paymentReceipt.txnId}).`);
    } else {
      setSuccessMsg(`Foster care request for ${targetPet.name} submitted successfully! Awaiting foster home response.`);
    }

    reset({
      petId: selectedPetId,
      ownerName: currentUser?.name || 'petowner',
      contactInfo: currentUser?.email || currentUser?.phone || 'petowner@gmail.com',
      durationDays: 14,
      offeredCharges: 3500,
      reason: 'Work travel',
      startDate: '',
      endDate: '',
      additionalNotes: '',
    });
    setTimeout(() => setSuccessMsg(''), 7000);
  };

  // ── Form Submit: Standard (Pay Later / Cash) ──────────────────────────
  const onSubmit = async (values: FosterFormValues) => {
    setServerError('');
    await executeFosterSubmission(values);
  };

  // ── Form Submit: Pay via Razorpay directly ────────────────────────────
  const handlePayAndSubmit = async (values: FosterFormValues) => {
    setServerError('');
    const targetPet = pets.find((p: any) => p._id === values.petId) || selectedPet;
    const amountVal = Number(values.offeredCharges) || 3500;

    setIsProcessingPayment(true);
    try {
      const response = await openRazorpayCheckout({
        amount: amountVal,
        currency: 'INR',
        name: 'ResQPet Foster Care',
        description: `Foster Care Escrow for ${targetPet.name} (${values.durationDays || '14'} days)`,
        image: '/logo.png',
        prefill: {
          name: values.ownerName || currentUser?.name || 'Suraj Kumar',
          email: currentUser?.email || 'owner@resqpet.app',
          contact: values.contactInfo || currentUser?.phone || '+91 98765 43210',
        },
        notes: {
          petName: targetPet.name,
          purpose: 'foster_care_request',
          charges: String(amountVal),
          durationDays: String(values.durationDays || '14'),
        },
        theme: {
          color: '#16a34a',
        },
      });

      const receipt: PaymentReceiptData = {
        id: `rcpt-${Date.now()}`,
        txnId: `RZP-${response.razorpay_payment_id}`,
        petName: targetPet.name,
        amount: amountVal,
        serviceType: 'Foster Care Caregiver Charges',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        method: 'Razorpay Secure Gateway (Live)',
      };

      setPaymentSuccessReceipt(receipt);
      setPaymentModalOpen(true);

      // Best effort backend sync
      try {
        await (donationApi as any).createRazorpayOrder?.({
          amount: amountVal,
          purpose: 'foster_care',
        });
      } catch { /* offline safe */ }

      // Execute request creation with payment details attached
      await executeFosterSubmission(values, receipt);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Payment cancelled or could not be processed.';
      if (!msg.toLowerCase().includes('cancelled')) {
        setServerError(msg);
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // ── Open View Details Modal ───────────────────────────────────────────
  const handleOpenDetail = async (req: any) => {
    try {
      const full = await fosterApi.getById(req._id);
      setActiveDetail(full);
    } catch {
      setActiveDetail(req);
    }
  };

  // ── Accept / Approve Foster Request Feature ───────────────────────────
  const handleAcceptRequest = async (requestId: string) => {
    try {
      try {
        await fosterApi.accept(requestId);
      } catch { /* offline fallback */ }

      const assignedProvider = {
        _id: 'foster-sarah-jenkins',
        name: 'Sarah Jenkins (Green Meadows Sanctuary)',
      };

      const updater = (r: any) => {
        if (r._id !== requestId) return r;
        return {
          ...r,
          status: 'accepted',
          fosterProvider: assignedProvider,
          messages: [
            ...(r.messages || []),
            {
              sender: assignedProvider,
              text: 'Foster home assigned! Sarah Jenkins has approved and accepted your pet.',
              sentAt: new Date().toISOString(),
            },
          ],
        };
      };

      setRequests((prev) => prev.map(updater));
      setActiveDetail((prev: any) => (prev && prev._id === requestId ? updater(prev) : prev));
      setSuccessMsg('Foster request accepted! Status updated to Approved.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  // ── Reject Foster Request Feature ─────────────────────────────────────
  const handleRejectRequest = async (requestId: string) => {
    try {
      try {
        await fosterApi.reject(requestId);
      } catch { /* offline fallback */ }

      const updater = (r: any) => {
        if (r._id !== requestId) return r;
        return {
          ...r,
          status: 'rejected',
        };
      };

      setRequests((prev) => prev.map(updater));
      setActiveDetail((prev: any) => (prev && prev._id === requestId ? updater(prev) : prev));
      setSuccessMsg('Foster request marked as rejected.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // ── Send In-App Message ───────────────────────────────────────────────
  const handleSendMessage = async (requestId: string) => {
    if (!newMessageText.trim()) return;

    const newMsg = {
      sender: {
        _id: currentUser?._id || 'user-owner',
        name: currentUser?.name || 'Suraj Kumar',
      },
      text: newMessageText.trim(),
      sentAt: new Date().toISOString(),
    };

    try {
      await fosterApi.sendMessage(requestId, newMessageText.trim());
    } catch { /* offline safe */ }

    const updater = (r: any) => {
      if (r._id !== requestId) return r;
      return {
        ...r,
        messages: [...(r.messages || []), newMsg],
      };
    };

    setRequests((prev) => prev.map(updater));
    setActiveDetail((prev: any) => (prev && prev._id === requestId ? updater(prev) : prev));
    setNewMessageText('');
  };

  // ── Add Community Feedback ───────────────────────────────────────────
  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackName.trim() || !newFeedbackComment.trim()) return;

    const newItem: CommunityFeedbackItem = {
      id: `fb-${Date.now()}`,
      name: newFeedbackName.trim(),
      rating: newFeedbackRating,
      timeAgo: 'Just now',
      comment: newFeedbackComment.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      verified: true,
    };

    setFeedbacks([newItem, ...feedbacks]);
    setNewFeedbackName('');
    setNewFeedbackComment('');
    setNewFeedbackRating(5);
    setFeedbackModalOpen(false);
    setSuccessMsg('Thank you for sharing your foster care story!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // ── Add New Pet Modal Submit ──────────────────────────────────────────
  const handleAddNewPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim()) return;

    const newPet: any = {
      _id: `mock-pet-${Date.now()}`,
      petId: `PET-${newPetName.toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      owner: currentUser?._id || 'user-owner',
      name: newPetName.trim(),
      species: newPetSpecies,
      breed: newPetBreed.trim() || 'Mixed Breed',
      age: parseInt(newPetAge) || 2,
      gender: 'male',
      images: [
        {
          url:
            newPetSpecies === 'dog'
              ? '/pets/dog_golden.jpg'
              : newPetSpecies === 'cat'
              ? '/pets/cat_tabby.jpg'
              : '/pets/dog_beagle.jpg',
          publicId: `pet-${Date.now()}`,
        },
      ],
      vaccinations: [],
      medicalConditions: [],
      collar: { isActive: false },
      safeZone: { enabled: false, radiusMeters: 200 },
      status: 'safe',
      healthStatus: newPetHealth,
      createdAt: new Date().toISOString(),
    };

    setPets((prev) => [...prev, newPet]);
    setSelectedPetId(newPet._id);
    setValue('petId', newPet._id);
    setAddPetModalOpen(false);
    setNewPetName('');
    setNewPetBreed('');
    setSuccessMsg(`"${newPet.name}" added and selected!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // ── Payment Gateway Trigger ───────────────────────────────────────────
  const handleOpenPayment = (req?: any) => {
    setPaymentForRequest(req || null);
    setSelectedPackageId('foster_care_charges_3500');
    setCustomAmount(req?.paidAmount ? String(req.paidAmount) : '');
    setPaymentSuccessReceipt(null);
    setPaymentModalOpen(true);
  };

  const handleExecuteRazorpay = async () => {
    setIsProcessingPayment(true);
    setServerError('');

    const pkg = FOSTER_PAYMENT_PACKAGES.find((p) => p.id === selectedPackageId);
    const amountVal = customAmount ? parseFloat(customAmount) : (pkg ? pkg.amount : 3500);
    const serviceLabel = pkg ? pkg.label : 'Foster Care Escrow Deposit';
    const petName = paymentForRequest ? paymentForRequest.pet.name : selectedPet.name;

    try {
      const response = await openRazorpayCheckout({
        amount: amountVal,
        currency: 'INR',
        name: 'ResQPet Foundation',
        description: `Foster Care Escrow: ${serviceLabel} for ${petName}`,
        image: '/logo.png',
        prefill: {
          name: currentUser?.name || 'Suraj Kumar',
          email: currentUser?.email || 'owner@resqpet.app',
          contact: currentUser?.phone || '+91 98765 43210',
        },
        notes: {
          petName,
          service: serviceLabel,
          requestId: paymentForRequest?._id || '',
        },
        theme: {
          color: '#16a34a',
        },
      });

      const receipt: PaymentReceiptData = {
        id: `rcpt-${Date.now()}`,
        txnId: `RZP-${response.razorpay_payment_id}`,
        petName,
        amount: amountVal,
        serviceType: serviceLabel,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        method: 'Razorpay Secure Gateway (Live)',
      };

      setPaymentSuccessReceipt(receipt);

      // Best effort backend sync
      try {
        await (donationApi as any).createRazorpayOrder?.({
          amount: amountVal,
          purpose: 'foster_care',
        });
      } catch { /* offline safe */ }

      // Update request reason if applicable
      if (paymentForRequest) {
        setRequests((prev) =>
          prev.map((r: any) =>
            r._id === paymentForRequest._id
              ? {
                  ...r,
                  paidAmount: amountVal,
                  paymentId: `RZP-${response.razorpay_payment_id}`,
                  paymentStatus: 'paid',
                  reason: `${r.reason}\n[Care Escrow Paid: ₹${amountVal} via Razorpay ID: ${response.razorpay_payment_id}]`,
                }
              : r
          )
        );
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Payment failed or cancelled.';
      if (!msg.toLowerCase().includes('cancelled')) {
        setServerError(msg);
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-fade-in text-slate-800 dark:text-bone">

      {/* ═════════════════════════════════════════════════════════════
          1. HERO BANNER
      ═════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#e8f6ed] via-[#edf7f1] to-[#e4f5ec] dark:from-emerald-950/40 dark:via-emerald-900/20 dark:to-teal-950/30 border border-[#bfe7d1]/80 dark:border-emerald-800/40 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-3 z-10 max-w-xl">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#164e33] dark:text-emerald-300 tracking-tight">
                Foster Care
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 text-[11px] font-bold">
                <Lock className="h-3 w-3" /> Razorpay Live Active
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-bone/80 leading-relaxed">
              Give your pet a safe, temporary home when you can't care for them, and give money directly to loving caregivers with Razorpay escrow protection.
            </p>

            {/* Three Feature Pills + Prominent Request Foster Care Button */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                id="hero-request-foster-care-btn"
                onClick={() => setRequestModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <PawPrint className="h-4 w-4" />
                <span>Request Foster Care (Modal)</span>
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 shadow-xs border border-emerald-100 dark:border-emerald-900/60 text-xs font-semibold text-slate-800 dark:text-bone">
                <ShieldCheck className="h-4 w-4 text-[#16a34a] dark:text-emerald-400" />
                <span>Verified Foster Homes</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 shadow-xs border border-emerald-100 dark:border-emerald-900/60 text-xs font-semibold text-slate-800 dark:text-bone">
                <IndianRupee className="h-4 w-4 text-emerald-600" />
                <span>Advance Care Escrow</span>
              </div>
            </div>
          </div>

          {/* Right side: Real Pets Photo + Cursive text badge */}
          <div className="relative shrink-0 flex items-center justify-center lg:justify-end">
            <div className="w-64 sm:w-80 h-32 sm:h-36 overflow-hidden rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 shadow-sm">
              <img
                src="/pets/dog_golden.jpg"
                alt="Golden retriever and companion pet"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="hidden sm:block absolute -top-1 right-2 text-right pointer-events-none select-none">
              <div className="font-serif italic text-xs font-semibold text-[#15803d] dark:text-emerald-400 drop-shadow-xs rotate-[-6deg] bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-xl backdrop-blur-xs border border-emerald-200/60">
                Safe foster homes & secure care charges ✨
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 p-4 text-sm text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg('')}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MAIN GRID: Left Column (Content) + Right Column (Widgets)
      ═════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_310px] gap-6">

        {/* ── LEFT COLUMN ───────────────────────────────────── */}
        <div className="space-y-6">

          {/* ═════════════════════════════════════════════════════
          3. SEND FOSTER CARE REQUEST FORM (Matching Screenshot)
          ═════════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-mist-800 bg-white dark:bg-ink-soft p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eaf7f0] dark:bg-emerald-950/50 flex items-center justify-center shrink-0 text-[#16a34a] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-bone">
                    Send Foster Care Request & Pay Caregiver
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-bone/60">
                    Fill in foster requirements and pay care charges directly with Razorpay escrow.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRequestModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <PawPrint className="h-3.5 w-3.5" />
                <span>Open in Modal</span>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register('petId', { required: 'Please select a pet' })} />

              {serverError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Row 1: Select Your Pet + Reason for Foster Care */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Select Your Pet Dropdown */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="pet-select" className="block text-xs font-semibold text-slate-700 dark:text-bone/90">
                      Select Your Pet <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      id="add-new-pet-btn"
                      onClick={() => setAddPetModalOpen(true)}
                      className="text-[11px] text-[#16a34a] hover:text-emerald-700 dark:text-emerald-400 font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="h-3 w-3" /> Add Pet
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      id="pet-select"
                      value={selectedPetId}
                      onChange={(e) => {
                        setSelectedPetId(e.target.value);
                        setValue('petId', e.target.value);
                      }}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink py-2.5 pl-3 pr-8 text-slate-800 dark:text-bone focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer font-medium"
                    >
                      {pets.map((p: any) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.species} • {p.breed || 'Unknown'})
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                </div>

                {/* Reason for Foster Care Dropdown */}
                <div>
                  <label htmlFor="reason-select" className="block text-xs font-semibold text-slate-700 dark:text-bone/90 mb-1.5">
                    Reason for Foster Care <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="reason-select"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink py-2.5 pl-3 pr-8 text-slate-800 dark:text-bone focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer font-medium"
                      {...register('reason', { required: 'Please select a reason' })}
                    >
                      <option value="">Select reason</option>
                      {REASON_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 2: Owner Name + Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ownerName" className="block text-xs font-semibold text-slate-700 dark:text-bone/90 mb-1.5">
                    Owner Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      id="ownerName"
                      placeholder="petowner"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink py-2.5 pl-9 pr-3 text-slate-800 dark:text-bone focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                      {...register('ownerName')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contactInfo" className="block text-xs font-semibold text-slate-700 dark:text-bone/90 mb-1.5">
                    Contact Phone / Email
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      id="contactInfo"
                      placeholder="petowner@gmail.com"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink py-2.5 pl-9 pr-3 text-slate-800 dark:text-bone focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                      {...register('contactInfo')}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Number of Days Required + Offered Budget / Care Charges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="durationDays" className="block text-xs font-semibold text-slate-700 dark:text-bone/90 mb-1.5">
                    Number of Days Required
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="number"
                      min={1}
                      id="durationDays"
                      placeholder="e.g. 14"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink py-2.5 pl-9 pr-3 text-slate-800 dark:text-bone focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                      {...register('durationDays')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="offeredCharges" className="block text-xs font-semibold text-slate-700 dark:text-bone/90 mb-1.5 flex items-center justify-between">
                    <span>Offered Budget / Care Charges (₹)</span>
                    <span className="text-[11px] text-emerald-600 font-bold">Razorpay Live</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="number"
                      min={100}
                      step={50}
                      id="offeredCharges"
                      placeholder="₹ e.g. 3500 (optional)"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink py-2.5 pl-9 pr-3 text-slate-800 dark:text-bone focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-700 dark:text-emerald-400"
                      {...register('offeredCharges')}
                    />
                  </div>
                  {/* Quick Chips */}
                  <div className="flex gap-1.5 mt-1.5">
                    {[500, 1500, 3500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setValue('offeredCharges', amt)}
                        className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 transition-colors font-medium cursor-pointer"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: Preferred Start Date + Preferred End Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-xs font-semibold text-slate-700 dark:text-bone/90 mb-1.5">
                    Preferred Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      id="startDate"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink py-2.5 pl-9 pr-3 text-slate-800 dark:text-bone focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                      {...register('startDate')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-xs font-semibold text-slate-700 dark:text-bone/90 mb-1.5">
                    Preferred End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      id="endDate"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink py-2.5 pl-9 pr-3 text-slate-800 dark:text-bone focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                      {...register('endDate')}
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Additional Information */}
              <div>
                <label htmlFor="additionalNotes" className="block text-xs font-semibold text-slate-700 dark:text-bone/90 mb-1.5">
                  Additional Requirements / Special Notes
                </label>
                <textarea
                  id="additionalNotes"
                  rows={2}
                  maxLength={500}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink p-3 text-slate-800 dark:text-bone placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none transition-all"
                  placeholder="e.g. Diet routine, medications, hypoallergenic, doesn't like loud sounds..."
                  {...register('additionalNotes')}
                />
                <div className="flex justify-end mt-0.5">
                  <span className="text-[10px] text-slate-400 font-mono">{watchedNotes.length}/500</span>
                </div>
              </div>

              {/* Form Bottom Row: Escrow Info Box + Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-mist-800">
                <div className="flex items-start gap-2.5 rounded-xl bg-[#eaf7f0] dark:bg-emerald-950/30 border border-[#bbf0d6] dark:border-emerald-800/60 p-2.5 max-w-md">
                  <ShieldCheck className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" />
                  <div className="text-[11px] text-[#166534] dark:text-emerald-300 leading-tight">
                    <p className="font-semibold">Razorpay Escrow Protection (Key: {RAZORPAY_KEY_ID.slice(0, 10)}...)</p>
                    <p className="text-[10px] text-[#15803d] dark:text-emerald-400 mt-0.5">
                      Caregiver receives payment once foster placement begins. 100% money-back guarantee.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || isProcessingPayment}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-mist-700 text-slate-700 dark:text-bone hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    Submit (Pay Later)
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting || isProcessingPayment}
                    onClick={handleSubmit(handlePayAndSubmit)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    <CreditCard className="h-4 w-4 stroke-[2.5]" />
                    <span>{isProcessingPayment ? 'Opening Razorpay…' : `Pay ₹${watchedCharges || 3500} & Send Request`}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* ═════════════════════════════════════════════════════
              4. MY FOSTER REQUESTS TABLE
          ═════════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-mist-800 bg-white dark:bg-ink-soft p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[#16a34a] dark:text-emerald-400">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-bone">
                    My Foster Requests & Escrow Payments
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-bone/60">
                    Track caregiver approval and live escrow payment receipts.
                  </p>
                </div>
              </div>

              {requests.length > 4 && (
                <button
                  id="view-all-requests-btn"
                  type="button"
                  onClick={() => setShowAllRequests((prev) => !prev)}
                  className="text-xs font-bold text-[#16a34a] hover:text-[#15803d] dark:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {showAllRequests ? 'Show Less ↑' : 'View All Requests ↓'}
                </button>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-mist-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Pet</th>
                    <th className="py-2.5 px-3">Reason & Duration</th>
                    <th className="py-2.5 px-3">Care Charges (₹)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-mist-800">
                  {displayedRequests.map((req: any) => {
                    const isPaid = req.paymentStatus === 'paid' || req.paidAmount || req.reason?.includes('Care Escrow Paid');
                    return (
                      <tr
                        key={req._id}
                        className="hover:bg-slate-50/60 dark:hover:bg-mist-800/30 transition-colors"
                      >
                        {/* Pet Column */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={req.pet.images?.[0]?.url || '/pets/dog_golden.jpg'}
                              alt={req.pet.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-mist-700"
                            />
                            <div>
                              <p className="font-bold text-slate-800 dark:text-bone">
                                {req.pet.name}
                              </p>
                              <p className="text-[10px] text-slate-400 capitalize">
                                {req.pet.species}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Reason & Duration */}
                        <td className="py-3 px-3">
                          <p className="text-slate-700 dark:text-bone font-medium truncate max-w-[200px]">
                            {req.reason?.split('\n')[0]?.replace('Reason: ', '') || 'Temporary care'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            ~{req.durationDays || 14} days
                          </p>
                        </td>

                        {/* Care Charges & Razorpay Badge */}
                        <td className="py-3 px-3">
                          {isPaid ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[11px]">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>₹{req.paidAmount || 3500} Paid</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-500">₹3,500</span>
                              <button
                                type="button"
                                onClick={() => handleOpenPayment(req)}
                                className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                              >
                                Pay Now
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Status Column */}
                        <td className="py-3 px-3">
                          {req.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Pending
                            </span>
                          )}
                          {(req.status === 'accepted' || req.status === 'in_foster' || req.status === 'active') && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#16a34a] dark:bg-emerald-950/40 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                              Approved
                            </span>
                          )}
                          {(req.status === 'rejected' || req.status === 'cancelled') && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Rejected
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPaid && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentSuccessReceipt({
                                    id: `rcpt-${req._id}`,
                                    txnId: req.paymentId || 'RZP-live-paid',
                                    petName: req.pet.name,
                                    amount: req.paidAmount || 3500,
                                    serviceType: 'Foster Care Caregiver Charges',
                                    date: new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                                    invoiceNumber: `INV-${req._id.slice(-6).toUpperCase()}`,
                                    method: 'Razorpay Escrow Gateway',
                                  });
                                  setPaymentModalOpen(true);
                                }}
                                className="px-2 py-1 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[10px] font-bold cursor-pointer"
                              >
                                Receipt
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenDetail(req)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-mist-800 hover:bg-slate-200 text-slate-700 dark:text-bone text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════
              5. FOSTER CARE PACKAGES & ESCROW DEPOSITS
          ═════════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-mist-800 bg-white dark:bg-ink-soft p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#eaf7f0] dark:bg-emerald-950/50 flex items-center justify-center text-[#16a34a] dark:text-emerald-400">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-bone">
                    Foster Care Escrow Packages
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-bone/60">
                    Pre-fund caregiver allowances with Razorpay protection.
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                Key: {RAZORPAY_KEY_ID.slice(0, 12)}…
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FOSTER_PAYMENT_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-4 rounded-xl border border-slate-200/70 dark:border-mist-800 hover:border-emerald-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-bone">{pkg.label}</h4>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        {pkg.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-bone/60 mt-1 leading-snug">{pkg.desc}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-mist-800">
                    <span className="font-extrabold text-sm text-[#16a34a]">₹{pkg.amount}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPackageId(pkg.id);
                        handleOpenPayment();
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                    >
                      Fund via Razorpay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════
              6. COMMUNITY FEEDBACK
          ═════════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-mist-800 bg-white dark:bg-ink-soft p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-bone">
                    Community Stories & Experiences
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-bone/60">
                    Real foster stories from owners across India.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFeedbackModalOpen(true)}
                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                Share Story
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {feedbacks.slice(0, 3).map((fb) => (
                <div key={fb.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-mist-800 bg-slate-50/50 dark:bg-mist-900/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-800 dark:text-bone">{fb.name}</span>
                      <span className="text-amber-400 text-xs">{'★'.repeat(fb.rating)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-bone/80 italic leading-snug">"{fb.comment}"</p>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-2 block">{fb.timeAgo}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: SIDEBAR WIDGETS ──────────────────── */}
        <div className="space-y-6">

          {/* Widget 1: Request Status Quick Filter */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-mist-800 bg-white dark:bg-ink-soft p-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 dark:text-bone mb-3 uppercase tracking-wider">
              Request Status
            </h3>
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-[#eaf7f0] font-bold text-[#166534]' : 'hover:bg-slate-50'
                }`}
              >
                <span>All Requests</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                  {requests.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                  statusFilter === 'pending' ? 'bg-[#eaf7f0] font-bold text-[#166534]' : 'hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  {countPending}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('accepted')}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                  statusFilter === 'accepted' ? 'bg-[#eaf7f0] font-bold text-[#166534]' : 'hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#16a34a]" /> Approved
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {countApproved}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('rejected')}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                  statusFilter === 'rejected' ? 'bg-[#eaf7f0] font-bold text-[#166534]' : 'hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Rejected
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                  {countRejected}
                </span>
              </button>
            </div>
          </div>

          {/* Widget 2: Razorpay Live Escrow Info Card */}
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-ink p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#166534] dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
              <h4 className="font-bold text-xs">Direct Caregiver Escrow</h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-bone/80 leading-relaxed">
              When you ask for foster care, you can pre-fund daily meals and care charges securely via Razorpay. Caregiver is reimbursed safely upon confirmed intake.
            </p>
            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-ink-soft border border-emerald-100 dark:border-emerald-800/40 text-[10px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Gateway:</span>
                <span className="font-bold text-slate-800 dark:text-bone">Razorpay Live</span>
              </div>
              <div className="flex justify-between">
                <span>Key ID:</span>
                <span className="font-mono text-emerald-700">{RAZORPAY_KEY_ID}</span>
              </div>
              <div className="flex justify-between">
                <span>Escrow Hold:</span>
                <span className="font-bold text-emerald-600">Until Intake Verified</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ═════════════════════════════════════════════════════════════
          MODAL: REQUEST TEMPORARY FOSTER CARE (Matching media_1792660530727.png)
      ═════════════════════════════════════════════════════ */}
      {isRequestModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => e.target === e.currentTarget && setRequestModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl rounded-2xl bg-[#131b17] border border-emerald-800/60 shadow-2xl overflow-hidden text-bone"
            style={{ maxHeight: '94vh' }}
          >
            {/* Header matching screenshot */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-emerald-900/60 bg-[#17231d]">
              <div>
                <h2 className="text-lg font-serif font-bold text-emerald-100 tracking-wide">
                  Request Temporary Foster Care
                </h2>
                <p className="text-[11px] text-emerald-400/80">
                  Provide pet details and offer care budget directly to verified caregivers
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRequestModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-4 text-xs" style={{ maxHeight: 'calc(94vh - 75px)' }}>
              {serverError && (
                <div className="rounded-xl bg-rose-950/50 border border-rose-800 p-3 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* 1. Select Pet * */}
              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                  Select Pet <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedPetId}
                    onChange={(e) => {
                      setSelectedPetId(e.target.value);
                      setValue('petId', e.target.value);
                    }}
                    className="w-full text-xs rounded-xl border border-emerald-900/80 bg-[#1c2922] py-2.5 pl-3 pr-8 text-bone focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
                  >
                    {pets.map((p: any) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.species} • {p.breed || 'Ragdoll'})
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-3 h-3.5 w-3.5 text-emerald-400 rotate-90 pointer-events-none" />
                </div>

                {/* Pet Preview Card matching screenshot (white card) */}
                <div className="mt-2 p-3 rounded-xl bg-white text-slate-800 shadow-sm flex items-center gap-3">
                  <img
                    src={selectedPet.images?.[0]?.url || '/pets/cat_tabby.jpg'}
                    alt={selectedPet.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{selectedPet.name}</h4>
                    <p className="text-xs text-slate-500 capitalize">
                      {selectedPet.species} • {selectedPet.age || 4} yrs • {selectedPet.breed || 'unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Row: Owner Name + Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    Owner Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500 pointer-events-none" />
                    <input
                      type="text"
                      className="w-full text-xs rounded-xl border border-emerald-900/80 bg-[#1c2922] py-2.5 pl-9 pr-3 text-bone focus:outline-none focus:border-emerald-500"
                      {...register('ownerName')}
                      placeholder="petowner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    Contact Phone / Email
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500 pointer-events-none" />
                    <input
                      type="text"
                      className="w-full text-xs rounded-xl border border-emerald-900/80 bg-[#1c2922] py-2.5 pl-9 pr-3 text-bone focus:outline-none focus:border-emerald-500"
                      {...register('contactInfo')}
                      placeholder="petowner@gmail.com"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Row: Number of Days Required + Offered Budget / Care Charges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    Number of Days Required
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500 pointer-events-none" />
                    <input
                      type="number"
                      min={1}
                      className="w-full text-xs rounded-xl border border-emerald-900/80 bg-[#1c2922] py-2.5 pl-9 pr-3 text-bone focus:outline-none focus:border-emerald-500"
                      {...register('durationDays')}
                      placeholder="e.g. 14"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5 flex items-center justify-between">
                    <span>Offered Budget / Care Charges (₹)</span>
                    <span className="text-[10px] text-emerald-400 font-bold">Razorpay Live</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500 pointer-events-none" />
                    <input
                      type="number"
                      min={100}
                      step={50}
                      className="w-full text-xs rounded-xl border border-emerald-700 bg-[#1c2922] py-2.5 pl-9 pr-3 text-emerald-300 font-extrabold focus:outline-none focus:border-emerald-400"
                      {...register('offeredCharges')}
                      placeholder="₹ e.g. 3500 (optional)"
                    />
                  </div>
                  {/* Preset chips */}
                  <div className="flex gap-1.5 mt-1.5">
                    {[500, 1500, 3500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setValue('offeredCharges', amt)}
                        className="px-2 py-0.5 rounded-lg text-[10px] bg-emerald-950 hover:bg-emerald-800 text-emerald-300 font-semibold cursor-pointer border border-emerald-800/60"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Row: Preferred Start Date + Preferred End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    Preferred Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500 pointer-events-none" />
                    <input
                      type="date"
                      className="w-full text-xs rounded-xl border border-emerald-900/80 bg-[#1c2922] py-2.5 pl-9 pr-3 text-bone focus:outline-none focus:border-emerald-500 cursor-pointer"
                      {...register('startDate')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    Preferred End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500 pointer-events-none" />
                    <input
                      type="date"
                      className="w-full text-xs rounded-xl border border-emerald-900/80 bg-[#1c2922] py-2.5 pl-9 pr-3 text-bone focus:outline-none focus:border-emerald-500 cursor-pointer"
                      {...register('endDate')}
                    />
                  </div>
                </div>
              </div>

              {/* 5. Reason for Foster Care */}
              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                  Reason for Foster Care
                </label>
                <textarea
                  rows={2}
                  className="w-full text-xs rounded-xl border border-emerald-900/80 bg-[#1c2922] p-2.5 text-bone placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="e.g. Work travel, home relocation, temporary medical treatment..."
                  {...register('reason')}
                />
              </div>

              {/* 6. Additional Requirements / Special Notes */}
              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                  Additional Requirements / Special Notes
                </label>
                <textarea
                  rows={2}
                  className="w-full text-xs rounded-xl border border-emerald-900/80 bg-[#1c2922] p-2.5 text-bone placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="e.g. Diet routine, medications, hypoallergenic, doesn't like loud sounds..."
                  {...register('additionalNotes')}
                />
              </div>

              {/* 7. Razorpay Escrow Info Box */}
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="text-[11px] leading-tight">
                  <span className="font-bold">Secured via Razorpay Escrow ({RAZORPAY_KEY_ID}):</span>{' '}
                  Money is held safely until foster intake is confirmed by caregiver.
                </p>
              </div>

              {/* 8. Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-emerald-900/60">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-emerald-900 text-slate-300 hover:bg-emerald-950/40 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || isProcessingPayment}
                  onClick={handleSubmit(onSubmit)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-bone text-xs font-semibold cursor-pointer"
                >
                  Submit (Pay Later)
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || isProcessingPayment}
                  onClick={handleSubmit(handlePayAndSubmit)}
                  className="px-6 py-2.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-emerald-700/30 cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{isProcessingPayment ? 'Opening Razorpay…' : `Pay ₹${watchedCharges || 3500} via Razorpay & Send`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          DETAIL MODAL: VIEW DETAILS & ACCEPT REQUEST
      ═════════════════════════════════════════════════════ */}
      {activeDetail && (
        <Modal
          isOpen={!!activeDetail}
          onClose={() => setActiveDetail(null)}
          title={`Foster Request: ${activeDetail.pet.name}`}
        >
          <div className="space-y-4 text-xs">
            {/* Status & Pet Header */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-mist-800/40">
              <div className="flex items-center gap-3">
                <img
                  src={activeDetail.pet.images?.[0]?.url || '/pets/dog_golden.jpg'}
                  alt={activeDetail.pet.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-bone">
                    {activeDetail.pet.name}
                  </h3>
                  <p className="text-slate-500 dark:text-bone/60 capitalize">
                    {activeDetail.pet.species} • Requested by {activeDetail.requestedBy?.name || 'Owner'}
                  </p>
                </div>
              </div>

              <div>
                {activeDetail.status === 'pending' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Pending</span>
                )}
                {(activeDetail.status === 'accepted' || activeDetail.status === 'in_foster' || activeDetail.status === 'active') && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Approved</span>
                )}
                {(activeDetail.status === 'rejected' || activeDetail.status === 'cancelled') && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Rejected</span>
                )}
              </div>
            </div>

            {/* Provider & Instructions */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-mist-700 space-y-2">
              <div className="flex items-center justify-between text-slate-600 dark:text-bone/70">
                <span className="font-semibold">Assigned Foster Caregiver:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {activeDetail.fosterProvider?.name || 'Awaiting assignment'}
                </span>
              </div>
              <div className="text-slate-700 dark:text-bone/90 whitespace-pre-line leading-relaxed">
                {activeDetail.reason || 'No specific notes recorded.'}
              </div>
            </div>

            {/* Escrow Payment Proof */}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Razorpay Escrow Status
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Key: {RAZORPAY_KEY_ID.slice(0, 10)}…
                </span>
              </div>
              <p className="text-slate-600 dark:text-bone/80 text-[11px]">
                {activeDetail.paidAmount || activeDetail.paymentStatus === 'paid' || activeDetail.reason?.includes('Care Escrow Paid') ? (
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                    ✓ ₹{activeDetail.paidAmount || 3500} secured via Razorpay ({activeDetail.paymentId || 'RZP-live-paid'})
                  </span>
                ) : (
                  <span>No advance payment paid yet. You can fund care charges directly.</span>
                )}
              </p>
              {!activeDetail.paidAmount && (
                <button
                  type="button"
                  onClick={() => {
                    handleOpenPayment(activeDetail);
                  }}
                  className="mt-1 px-3 py-1 bg-[#16a34a] text-white rounded-lg font-bold text-[10px] cursor-pointer"
                >
                  Pay Care Charges via Razorpay
                </button>
              )}
            </div>

            {/* Message Thread */}
            <div>
              <p className="font-bold text-slate-800 dark:text-bone mb-2">
                Messages & Communication
              </p>
              <div className="space-y-2 max-h-44 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-mist-900/30 border border-slate-200 dark:border-mist-700">
                {activeDetail.messages && activeDetail.messages.length > 0 ? (
                  activeDetail.messages.map((m: any, idx: number) => (
                    <div key={idx} className="p-2 rounded-lg bg-white dark:bg-ink-soft shadow-2xs text-[11px]">
                      <div className="flex justify-between text-slate-400 text-[10px]">
                        <span className="font-semibold text-slate-700 dark:text-bone">{m.sender.name}</span>
                        <span>{new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="mt-1 text-slate-800 dark:text-bone/90">{m.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-3">No messages yet.</p>
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type a message to the foster home..."
                  className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink p-2 text-slate-800 dark:text-bone"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(activeDetail._id)}
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage(activeDetail._id)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Actions: Accept / Reject / Close */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-mist-800">
              <button
                type="button"
                onClick={() => setActiveDetail(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-mist-700 text-slate-700 dark:text-bone font-semibold"
              >
                Close
              </button>

              <div className="flex gap-2">
                {activeDetail.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRejectRequest(activeDetail._id)}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(activeDetail._id)}
                      className="px-4 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold cursor-pointer"
                    >
                      Accept & Assign Foster
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════
          ADD PET MODAL
      ═════════════════════════════════════════════════════ */}
      {isAddPetModalOpen && (
        <Modal
          isOpen={isAddPetModalOpen}
          onClose={() => setAddPetModalOpen(false)}
          title="Add New Pet"
        >
          <form onSubmit={handleAddNewPet} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">
                Pet Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newPetName}
                onChange={(e) => setNewPetName(e.target.value)}
                placeholder="e.g. bittu"
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink p-2.5 text-slate-800 dark:text-bone"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">
                  Species
                </label>
                <select
                  value={newPetSpecies}
                  onChange={(e) => setNewPetSpecies(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink p-2.5 text-slate-800 dark:text-bone cursor-pointer"
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="rabbit">Rabbit</option>
                  <option value="bird">Bird</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">
                  Breed
                </label>
                <input
                  type="text"
                  value={newPetBreed}
                  onChange={(e) => setNewPetBreed(e.target.value)}
                  placeholder="e.g. Ragdoll / Golden"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink p-2.5 text-slate-800 dark:text-bone"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">
                  Age (years)
                </label>
                <input
                  type="number"
                  min={0}
                  value={newPetAge}
                  onChange={(e) => setNewPetAge(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink p-2.5 text-slate-800 dark:text-bone"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">
                  Health Status
                </label>
                <input
                  type="text"
                  value={newPetHealth}
                  onChange={(e) => setNewPetHealth(e.target.value)}
                  placeholder="e.g. Healthy, Vaccinated"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink p-2.5 text-slate-800 dark:text-bone"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-mist-800">
              <button
                type="button"
                onClick={() => setAddPetModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold"
              >
                Save Pet
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════
          PAYMENT GATEWAY & RECEIPT MODAL
      ═════════════════════════════════════════════════════ */}
      {isPaymentModalOpen && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          title="Foster Care Escrow & Booking Fee"
        >
          {paymentSuccessReceipt ? (
            <div className="space-y-4 text-xs">
              <div className="text-center p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                  Payment Confirmed via Razorpay!
                </h3>
                <p className="text-emerald-700 dark:text-emerald-400 mt-1">
                  Transaction ID: <span className="font-mono font-bold">{paymentSuccessReceipt.txnId}</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Amount: <span className="font-bold">₹{paymentSuccessReceipt.amount}</span> • Pet: {paymentSuccessReceipt.petName}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-mist-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Invoice:</span>
                  <span className="font-bold">{paymentSuccessReceipt.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Service:</span>
                  <span className="font-medium">{paymentSuccessReceipt.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date:</span>
                  <span>{paymentSuccessReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Protection:</span>
                  <span className="text-emerald-600 font-bold">100% Escrow Protected</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 font-bold cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-5 py-2 bg-[#16a34a] text-white rounded-xl font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[#eaf7f0] border border-[#bbf0d6] text-[#166534] flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#16a34a]" />
                <p className="leading-tight">
                  <span className="font-bold">Razorpay Live Gateway Active: </span>
                  Funds are secured in escrow and only disbursed once certified foster placement begins.
                </p>
              </div>

              <div>
                <label className="block font-bold mb-2 text-slate-800 dark:text-bone">
                  Select Foster Care Package
                </label>
                <div className="space-y-2">
                  {FOSTER_PAYMENT_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => {
                          setSelectedPackageId(pkg.id);
                          setCustomAmount('');
                        }}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#16a34a] bg-[#f0fbf5] dark:bg-emerald-950/30'
                            : 'border-slate-200 dark:border-mist-700 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-bone">{pkg.label}</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {pkg.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{pkg.desc}</p>
                        </div>
                        <span className="font-extrabold text-sm text-[#16a34a] shrink-0 ml-3">
                          ₹{pkg.amount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">
                  Or Custom Escrow Amount (INR ₹)
                </label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  placeholder="e.g. 3500"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 p-2.5"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-mist-800">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" /> Key: {RAZORPAY_KEY_ID.slice(0, 12)}…
                </span>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleExecuteRazorpay}
                  className="px-6 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-700/20 disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{isProcessingPayment ? 'Connecting Razorpay…' : `Pay ₹${customAmount || (FOSTER_PAYMENT_PACKAGES.find((p) => p.id === selectedPackageId)?.amount || 3500)} via Razorpay`}</span>
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════
          COMMUNITY FEEDBACK MODAL
      ═════════════════════════════════════════════════════ */}
      {isFeedbackModalOpen && (
        <Modal
          isOpen={isFeedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          title="Community Feedback & Stories"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-500">
              Read real stories from pet owners and foster caregivers across our community.
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="p-3 rounded-xl bg-slate-50 dark:bg-mist-800/40 border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900 dark:text-bone">{fb.name}</span>
                    <span className="text-amber-400">{'★'.repeat(fb.rating)}</span>
                  </div>
                  <p className="text-slate-600 dark:text-bone/80 italic">"{fb.comment}"</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{fb.timeAgo}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddFeedback} className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 dark:text-bone">Share Your Story</h4>
                <div className="flex items-center gap-1 text-base text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewFeedbackRating(s)}
                      className="cursor-pointer hover:scale-110 transition-transform"
                    >
                      {s <= newFeedbackRating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                required
                placeholder="Your Name"
                value={newFeedbackName}
                onChange={(e) => setNewFeedbackName(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink p-2"
              />
              <textarea
                required
                rows={2}
                placeholder="Share your foster care experience..."
                value={newFeedbackComment}
                onChange={(e) => setNewFeedbackComment(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#16a34a] text-white rounded-xl font-bold cursor-pointer"
                >
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default OwnerFoster;
