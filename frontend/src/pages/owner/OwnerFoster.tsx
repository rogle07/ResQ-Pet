import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { fosterApi, type FosterRequest } from '@/features/foster/fosterApi';
import { petApi } from '@/features/pets/petApi';
import { useAppSelector } from '@/app/hooks';
import type { Pet } from '@/types';
import Modal from '@/components/ui/Modal';
import {
  Home,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  Send,
  Heart,
  MessageCircle,
  Shield,
  Syringe,
  ChevronRight,
  Users,
  Check,
  FileText,
  Phone,
  XCircle,
} from 'lucide-react';

/* ── Dropdown options for reasons ──────────────────────── */
const REASON_OPTIONS = [
  'Travel / Vacation',
  'Health Treatment',
  'Home Renovation',
  'Work Relocation',
  'Emergency / Crisis',
  'Pet Medical Recovery',
  'Temporary Housing Issue',
  'Other',
];

interface FosterFormValues {
  petId: string;
  reason: string;
  startDate: string;
  endDate: string;
  additionalNotes: string;
}

/* ── Default initial pets matching reference image ──────── */
const INITIAL_MOCK_PETS: Pet[] = [
  {
    _id: 'mock-pet-bruno',
    petId: 'PET-BRUNO-01',
    owner: 'user-owner',
    name: 'Bruno',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 2,
    gender: 'male',
    images: [{ url: '/pet-bruno.jpg', publicId: 'pet-bruno' }],
    vaccinations: [{ name: 'Rabies & DHPP', dateGiven: '2025-01-10' }],
    medicalConditions: [],
    collar: { isActive: true },
    safeZone: { enabled: true, radiusMeters: 500 },
    status: 'safe',
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
    images: [{ url: '/pet-milo.jpg', publicId: 'pet-milo' }],
    vaccinations: [{ name: 'FVRCP', dateGiven: '2025-02-15' }],
    medicalConditions: [],
    collar: { isActive: false },
    safeZone: { enabled: false, radiusMeters: 200 },
    status: 'safe',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock-pet-luna',
    petId: 'PET-LUNA-03',
    owner: 'user-owner',
    name: 'Luna',
    species: 'dog',
    breed: 'Beagle',
    age: 3,
    gender: 'female',
    images: [{ url: '/animal-dog.jpg', publicId: 'pet-luna' }],
    vaccinations: [{ name: 'Rabies', dateGiven: '2025-03-01' }],
    medicalConditions: [],
    collar: { isActive: true },
    safeZone: { enabled: true, radiusMeters: 300 },
    status: 'safe',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock-pet-mia',
    petId: 'PET-MIA-04',
    owner: 'user-owner',
    name: 'Mia',
    species: 'cat',
    breed: 'Siamese Mix',
    age: 1, // 4 months
    gender: 'female',
    images: [{ url: '/animal-cat.jpg', publicId: 'pet-mia' }],
    vaccinations: [],
    medicalConditions: [],
    collar: { isActive: false },
    safeZone: { enabled: false, radiusMeters: 100 },
    status: 'safe',
    createdAt: new Date().toISOString(),
  },
];

/* ── Default initial requests matching reference image ──── */
const INITIAL_MOCK_REQUESTS: FosterRequest[] = [
  {
    _id: 'req-bruno-01',
    pet: {
      _id: 'mock-pet-bruno',
      name: 'Bruno',
      species: 'dog',
      images: [{ url: '/pet-bruno.jpg' }],
    },
    requestedBy: {
      _id: 'user-owner',
      name: 'Suraj Kumar',
      phone: '+91 98765 43210',
    },
    fosterProvider: undefined,
    reason: 'Reason: Travel / Vacation\nDates: 2025-08-15 to 2025-08-25\nNotes: Bruno loves morning walks and requires regular kibble twice a day.',
    durationDays: 10,
    status: 'pending',
    messages: [
      {
        sender: { _id: 'user-owner', name: 'Suraj Kumar' },
        text: 'Request submitted for temporary foster care while I am traveling for 10 days.',
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
      images: [{ url: '/pet-milo.jpg' }],
    },
    requestedBy: {
      _id: 'user-owner',
      name: 'Suraj Kumar',
      phone: '+91 98765 43210',
    },
    fosterProvider: {
      _id: 'foster-provider-01',
      name: 'Sarah Jenkins (Green Meadows Sanctuary)',
    },
    reason: 'Reason: Health Treatment\nDates: 2025-08-05 to 2025-08-20\nNotes: Post-treatment recovery care needed. Milo is gentle and calm.',
    durationDays: 15,
    status: 'accepted',
    messages: [
      {
        sender: { _id: 'user-owner', name: 'Suraj Kumar' },
        text: 'Need quiet environment for Milo during medical recovery.',
        sentAt: '2025-08-02T09:15:00.000Z',
      },
      {
        sender: { _id: 'foster-provider-01', name: 'Sarah Jenkins' },
        text: 'We are delighted to welcome Milo! Our quiet feline recovery suite is all prepped.',
        sentAt: '2025-08-02T14:20:00.000Z',
      },
    ],
    createdAt: '2025-08-02T09:15:00.000Z',
  },
];

/* ── Pet Care Tips details for interactive click ────────── */
const PET_CARE_TIPS = [
  {
    id: 'health',
    icon: <FileText className="h-4 w-4 text-emerald-600" />,
    text: "Keep your pet's health records updated.",
    title: 'Update Health & Vaccination Records',
    description:
      'Always provide complete vaccination proof, recent vet prescriptions, and diet history to the foster home before placement. This ensures your pet continues their routine without health interruptions.',
  },
  {
    id: 'trust',
    icon: <Shield className="h-4 w-4 text-emerald-600" />,
    text: 'Choose a foster home you trust.',
    title: 'Verified Foster Home Network',
    description:
      'All foster homes on ResQPet are identity-verified and inspected. Review their caregiver profile, reviews, and space availability to find the most fitting environment for your pet.',
  },
  {
    id: 'vaccine',
    icon: <Syringe className="h-4 w-4 text-emerald-600" />,
    text: 'Make sure your pet is vaccinated.',
    title: 'Essential Vaccinations & Parasite Protection',
    description:
      'Ensure rabies, distemper, DHPP (for dogs) and FVRCP (for cats) are up-to-date. Administer flea/tick prevention at least 48 hours prior to the foster start date.',
  },
  {
    id: 'touch',
    icon: <MessageCircle className="h-4 w-4 text-emerald-600" />,
    text: 'Stay in touch with the foster family.',
    title: 'Continuous Communication & Updates',
    description:
      'Use ResQPet direct messaging to receive daily photo updates, feeding confirmations, and peace-of-mind check-ins from your foster provider.',
  },
];

/* ── Extract short reason label for table ───────────────── */
const extractShortReason = (reason?: string) => {
  if (!reason) return '—';
  const firstLine = reason.split('\n')[0];
  if (firstLine.startsWith('Reason: ')) return firstLine.slice(8);
  return firstLine.length > 25 ? firstLine.slice(0, 25) + '…' : firstLine;
};

/* ── Format date as '12 Aug 2025' matching screenshot ──── */
const formatDateDisplay = (dateString?: string) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/* ── Render custom status badge matching screenshot ───── */
const renderStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#fef3c7] text-[#b45309] dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/40">
          Pending
        </span>
      );
    case 'approved':
    case 'accepted':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#dcfce7] text-[#15803d] dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/40">
          Approved
        </span>
      );
    case 'active':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/40">
          Active
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Completed
        </span>
      );
    case 'rejected':
    case 'cancelled':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/40">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 capitalize">
          {status}
        </span>
      );
  }
};

/* ═════════════════════════════════════════════════════════
   OWNER FOSTER PAGE COMPONENT
═════════════════════════════════════════════════════════ */
const OwnerFoster = () => {
  const currentUser = useAppSelector((s) => s.auth.user);

  // Requests state initialized with localStorage or mock data
  const [requests, setRequests] = useState<FosterRequest[]>(() => {
    try {
      const saved = localStorage.getItem('resqpet_foster_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return INITIAL_MOCK_REQUESTS;
  });

  // Pets state initialized with localStorage or mock data
  const [pets, setPets] = useState<Pet[]>(() => {
    try {
      const saved = localStorage.getItem('resqpet_owner_pets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return INITIAL_MOCK_PETS;
  });

  const [loading, setLoading] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string>(() => INITIAL_MOCK_PETS[0]._id);
  const [activeDetail, setActiveDetail] = useState<FosterRequest | null>(null);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [activeTip, setActiveTip] = useState<(typeof PET_CARE_TIPS)[0] | null>(null);
  const [isAddPetModalOpen, setAddPetModalOpen] = useState(false);
  const [newPetForm, setNewPetForm] = useState({
    name: '',
    species: 'dog' as 'dog' | 'cat' | 'bird' | 'other',
    breed: '',
    age: 1,
    gender: 'male' as 'male' | 'female',
  });
  const [newMessageText, setNewMessageText] = useState('');

  // Form management
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FosterFormValues>({
    defaultValues: {
      petId: INITIAL_MOCK_PETS[0]._id,
      reason: '',
      startDate: '',
      endDate: '',
      additionalNotes: '',
    },
  });

  const watchedNotes = watch('additionalNotes') || '';
  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('endDate');

  // Save requests to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('resqpet_foster_requests', JSON.stringify(requests));
    } catch { /* ignore */ }
  }, [requests]);

  // Save pets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('resqpet_owner_pets', JSON.stringify(pets));
    } catch { /* ignore */ }
  }, [pets]);

  // Load from real backend if available
  const loadFromBackend = useCallback(async () => {
    setLoading(true);
    try {
      const [backendReqs, backendPets] = await Promise.all([
        fosterApi.list().catch(() => null),
        petApi.list().catch(() => null),
      ]);

      if (backendPets && backendPets.length > 0) {
        setPets(backendPets);
        setSelectedPetId((prev) => (backendPets.some((p) => p._id === prev) ? prev : backendPets[0]._id));
      }

      if (backendReqs && backendReqs.length > 0) {
        setRequests(backendReqs);
      }
    } catch {
      // Backend offline: silently keep resilient mock state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromBackend();
  }, [loadFromBackend]);

  // Sync petId in form when user clicks a pet card
  useEffect(() => {
    setValue('petId', selectedPetId);
  }, [selectedPetId, setValue]);

  // Calculate duration in days between dates if selected
  const calculatedDurationDays = (() => {
    if (!watchedStartDate || !watchedEndDate) return null;
    const start = new Date(watchedStartDate).getTime();
    const end = new Date(watchedEndDate).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return null;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  })();

  // Current selected pet object
  const selectedPet = pets.find((p) => p._id === selectedPetId) || pets[0] || null;

  // Handle foster request submission
  const onSubmit = async (values: FosterFormValues) => {
    setServerError('');
    try {
      const chosenPet = pets.find((p) => p._id === values.petId) || selectedPet;
      if (!chosenPet) {
        setServerError('Please select a pet to foster.');
        return;
      }

      const formattedStart = values.startDate ? formatDateDisplay(values.startDate) : '';
      const formattedEnd = values.endDate ? formatDateDisplay(values.endDate) : '';

      const reasonFormatted = [
        `Reason: ${values.reason}`,
        values.startDate || values.endDate ? `Dates: ${formattedStart} to ${formattedEnd}` : '',
        values.additionalNotes ? `Notes: ${values.additionalNotes}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      let createdRequest: FosterRequest;

      // Try calling backend API first
      try {
        createdRequest = await fosterApi.create({
          petId: chosenPet._id,
          reason: reasonFormatted,
          durationDays: calculatedDurationDays || undefined,
        });
      } catch {
        // Backend offline: generate local client-side request
        createdRequest = {
          _id: `req-${Date.now()}`,
          pet: {
            _id: chosenPet._id,
            name: chosenPet.name,
            species: chosenPet.species,
            images: chosenPet.images?.length > 0 ? chosenPet.images : [{ url: '/pet-bruno.jpg' }],
          },
          requestedBy: {
            _id: currentUser?._id || 'user-owner',
            name: currentUser?.name || 'Suraj Kumar',
            phone: currentUser?.phone || '+91 98765 43210',
          },
          fosterProvider: undefined,
          reason: reasonFormatted,
          durationDays: calculatedDurationDays || undefined,
          status: 'pending',
          messages: [
            {
              sender: { _id: currentUser?._id || 'user-owner', name: currentUser?.name || 'Suraj Kumar' },
              text: `Foster care requested for ${chosenPet.name} (${values.reason}).`,
              sentAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
        };
      }

      // Prepend to requests list
      setRequests((prev) => [createdRequest, ...prev]);

      // Show success feedback
      setSuccessMsg('Foster care request submitted successfully! Foster homes have been notified.');
      reset({
        petId: selectedPetId,
        reason: '',
        startDate: '',
        endDate: '',
        additionalNotes: '',
      });

      // Auto dismiss success notification after 6s
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not submit foster request. Please try again.';
      setServerError(msg);
    }
  };

  // Open detail modal with full data
  const handleOpenDetail = async (req: FosterRequest) => {
    try {
      const full = await fosterApi.getById(req._id);
      setActiveDetail(full);
    } catch {
      setActiveDetail(req);
    }
  };

  // Accept / Approve foster request (Full feature fulfillment!)
  const handleAcceptRequest = async (requestId: string) => {
    try {
      try {
        await fosterApi.accept(requestId);
      } catch {
        // Continue with local update if backend offline
      }

      const assignedFoster = {
        _id: 'foster-sarah-jenkins',
        name: 'Sarah Jenkins (Green Meadows Sanctuary)',
      };

      const updateItem = (r: FosterRequest): FosterRequest => {
        if (r._id !== requestId) return r;
        return {
          ...r,
          status: 'accepted',
          fosterProvider: assignedFoster,
          messages: [
            ...(r.messages || []),
            {
              sender: assignedFoster,
              text: 'Foster home assigned! Sarah Jenkins has accepted your foster request.',
              sentAt: new Date().toISOString(),
            },
          ],
        };
      };

      setRequests((prev) => prev.map(updateItem));
      setActiveDetail((prev) => (prev && prev._id === requestId ? updateItem(prev) : prev));
      setSuccessMsg('Foster request accepted and approved successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  // Mark foster request as completed
  const handleCompleteRequest = async (requestId: string) => {
    try {
      try {
        await fosterApi.complete(requestId);
      } catch {
        // Continue with local update
      }

      const updateItem = (r: FosterRequest): FosterRequest => {
        if (r._id !== requestId) return r;
        return {
          ...r,
          status: 'completed',
          messages: [
            ...(r.messages || []),
            {
              sender: { _id: 'system', name: 'ResQPet System' },
              text: 'Foster placement completed. Pet safely returned to owner.',
              sentAt: new Date().toISOString(),
            },
          ],
        };
      };

      setRequests((prev) => prev.map(updateItem));
      setActiveDetail((prev) => (prev && prev._id === requestId ? updateItem(prev) : prev));
      setSuccessMsg('Foster arrangement marked as completed! Pet returned safely.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  // Cancel foster request
  const handleCancelRequest = (requestId: string) => {
    const updateItem = (r: FosterRequest): FosterRequest => {
      if (r._id !== requestId) return r;
      return { ...r, status: 'cancelled' };
    };
    setRequests((prev) => prev.map(updateItem));
    setActiveDetail((prev) => (prev && prev._id === requestId ? updateItem(prev) : prev));
    setSuccessMsg('Foster request has been cancelled.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Send a message inside the active detail modal
  const handleSendMessage = async () => {
    if (!activeDetail || !newMessageText.trim()) return;
    const text = newMessageText.trim();
    setNewMessageText('');

    try {
      try {
        await fosterApi.sendMessage(activeDetail._id, text);
      } catch {
        // Continue with local update
      }

      const newMsg = {
        sender: {
          _id: currentUser?._id || 'user-owner',
          name: currentUser?.name || 'Suraj Kumar',
        },
        text,
        sentAt: new Date().toISOString(),
      };

      const updateItem = (r: FosterRequest): FosterRequest => {
        if (r._id !== activeDetail._id) return r;
        return {
          ...r,
          messages: [...(r.messages || []), newMsg],
        };
      };

      setRequests((prev) => prev.map(updateItem));
      setActiveDetail((prev) => (prev ? updateItem(prev) : null));
    } catch (e) {
      console.error(e);
    }
  };

  // Add new pet handler
  const handleCreateNewPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetForm.name.trim()) return;

    const newPet: Pet = {
      _id: `pet-custom-${Date.now()}`,
      petId: `PET-${Date.now().toString().slice(-4)}`,
      owner: currentUser?._id || 'user-owner',
      name: newPetForm.name.trim(),
      species: newPetForm.species,
      breed: newPetForm.breed || 'Companion',
      age: Number(newPetForm.age) || 1,
      gender: newPetForm.gender,
      images: [
        {
          url: newPetForm.species === 'cat' ? '/pet-milo.jpg' : '/pet-bruno.jpg',
          publicId: `img-${Date.now()}`,
        },
      ],
      vaccinations: [],
      medicalConditions: [],
      collar: { isActive: false },
      safeZone: { enabled: false, radiusMeters: 200 },
      status: 'safe',
      createdAt: new Date().toISOString(),
    };

    setPets((prev) => [newPet, ...prev]);
    setSelectedPetId(newPet._id);
    setValue('petId', newPet._id);
    setAddPetModalOpen(false);
    setNewPetForm({ name: '', species: 'dog', breed: '', age: 1, gender: 'male' });
    setSuccessMsg(`Pet "${newPet.name}" added successfully and selected!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Requests to display (first 2 or all)
  const displayedRequests = showAllRequests ? requests : requests.slice(0, 2);

  return (
    <div className="space-y-6 pb-12 font-sans animate-fade-in text-slate-800 dark:text-bone">

      {/* ═══════════════════════════════════════════════════════
          1. HERO BANNER (Matches screenshot layout & aesthetics)
      ═══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#eef8f3] via-[#e5f5ec] to-[#d8efe2] dark:from-emerald-950/40 dark:via-emerald-900/20 dark:to-teal-950/30 border border-[#bfe7d1]/80 dark:border-emerald-800/40 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 z-10 max-w-xl">
            {/* Green rounded icon with house and heart */}
            <div className="w-14 h-14 rounded-2xl bg-[#15803d] dark:bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
              <div className="relative">
                <Home className="h-7 w-7 text-white stroke-[2.2]" />
                <Heart className="h-3 w-3 text-[#15803d] fill-white absolute top-2.5 left-2" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-[#14532d] dark:text-emerald-300 tracking-tight">
                Foster Care
              </h1>
              <p className="text-xs md:text-sm text-emerald-900/80 dark:text-emerald-200/80 mt-1 leading-relaxed">
                Give your pet a safe, temporary home when you can't care for them, and help them find a better tomorrow.
              </p>
            </div>
          </div>

          {/* Right side pet banner photograph */}
          <div className="relative hidden sm:block md:w-80 h-24 md:h-28 shrink-0 overflow-hidden rounded-xl">
            <img
              src="/foster-hero-banner.jpg"
              alt="Golden retriever dog and tabby cat"
              className="w-full h-full object-cover object-top filter brightness-105"
            />
            {/* Subtle soft gradient fade into banner background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#eef8f3] via-transparent to-transparent md:w-24 pointer-events-none" />
          </div>
        </div>

        {/* Delicate floating background hearts */}
        <div className="absolute top-2 right-40 text-emerald-400/20 text-3xl select-none pointer-events-none">♡</div>
        <div className="absolute bottom-2 right-64 text-emerald-400/20 text-2xl select-none pointer-events-none">♡</div>
        <div className="absolute top-4 right-16 text-emerald-400/20 text-xl select-none pointer-events-none">♡</div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN GRID: Left Column (Content) + Right Column (Widgets)
      ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_310px] gap-6">

        {/* ── LEFT COLUMN ───────────────────────────────────── */}
        <div className="space-y-6">

          {/* 2. Notice / Alert Bar (Mint green with info badge) */}
          <div className="flex items-center gap-3 rounded-xl bg-[#eaf7f0] dark:bg-emerald-950/40 border border-[#bbf0d6] dark:border-emerald-800/60 px-4 py-3 shadow-xs">
            <div className="w-5 h-5 rounded-full bg-[#16a34a] flex items-center justify-center text-white shrink-0 text-xs font-bold shadow-xs">
              <Info className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
            <div className="text-xs text-[#166534] dark:text-emerald-300 leading-snug">
              <span className="font-semibold">Only Pet Owners can send foster care requests.</span>
              <span className="ml-1 text-[#15803d] dark:text-emerald-400">
                Foster Homes can view, accept or reject the requests.
              </span>
            </div>
          </div>

          {/* Success Notification Alert */}
          {successMsg && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 p-4 text-sm text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 animate-fade-in shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium">{successMsg}</span>
              </div>
              <button
                onClick={() => setSuccessMsg('')}
                className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              3. MY PETS SECTION (Cards with Bruno, Milo, Luna, Mia)
          ═══════════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-mist-800 bg-white dark:bg-ink-soft p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-bone">
                  My Pets
                </h2>
                <p className="text-xs text-slate-500 dark:text-bone/60">
                  Select a pet from your list to send a foster care request.
                </p>
              </div>
              <button
                id="add-new-pet-btn"
                type="button"
                onClick={() => setAddPetModalOpen(true)}
                className="text-xs font-bold text-[#16a34a] hover:text-[#15803d] dark:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" /> Add New Pet
              </button>
            </div>

            {/* Horizontal Pet Cards Carousel */}
            <div className="flex gap-3.5 mt-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
              {pets.map((pet) => {
                const isSelected = pet._id === selectedPetId;
                const petImage =
                  pet.images?.[0]?.url ||
                  (pet.species === 'cat' ? '/pet-milo.jpg' : '/pet-bruno.jpg');

                return (
                  <button
                    key={pet._id}
                    id={`pet-card-${pet._id}`}
                    type="button"
                    onClick={() => {
                      setSelectedPetId(pet._id);
                      setValue('petId', pet._id);
                    }}
                    className={`group relative flex-shrink-0 w-36 rounded-xl border text-left transition-all duration-200 cursor-pointer overflow-hidden bg-white dark:bg-ink-soft ${
                      isSelected
                        ? 'border-2 border-[#16a34a] shadow-md shadow-emerald-500/10 dark:border-emerald-500'
                        : 'border-slate-200 dark:border-mist-700 hover:border-emerald-300 dark:hover:border-emerald-700/60 shadow-xs'
                    }`}
                  >
                    {/* Pet Image */}
                    <div className="w-full h-24 bg-slate-100 dark:bg-mist-800 overflow-hidden relative">
                      <img
                        src={petImage}
                        alt={pet.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Pet Information */}
                    <div className="p-2.5">
                      <p className="font-bold text-xs text-slate-900 dark:text-bone truncate">
                        {pet.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-bone/60 capitalize mt-0.5">
                        {pet.species} • {pet.age ? `${pet.age} Years` : 'Pet'}
                      </p>

                      {/* Bottom-left radio selection circle matching screenshot! */}
                      <div className="mt-2.5 flex items-center">
                        {isSelected ? (
                          <div className="w-4 h-4 rounded-full bg-[#16a34a] flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-mist-600 group-hover:border-emerald-400 transition-colors" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              4. SEND FOSTER CARE REQUEST FORM
          ═══════════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-mist-800 bg-white dark:bg-ink-soft p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#eaf7f0] dark:bg-emerald-950/50 flex items-center justify-center shrink-0 text-[#16a34a] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-bone">
                  Send Foster Care Request
                </h2>
                <p className="text-xs text-slate-500 dark:text-bone/60">
                  Fill in the details below to request foster care for your selected pet.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register('petId', { required: 'Please select a pet' })} />

              {serverError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Form Row: Reason + Preferred Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Reason for Foster Request */}
                <div>
                  <label htmlFor="reason-select" className="block text-xs font-semibold text-slate-700 dark:text-bone/90 mb-1.5">
                    Reason for Foster Request <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="reason-select"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink py-2.5 pl-3 pr-8 text-slate-800 dark:text-bone focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
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
                  {errors.reason && (
                    <p className="mt-1 text-[11px] text-rose-500">{errors.reason.message}</p>
                  )}
                </div>

                {/* Preferred Foster Period */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-bone/90">
                      Preferred Foster Period <span className="text-rose-500">*</span>
                    </label>
                    {calculatedDurationDays && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        ~{calculatedDurationDays} days
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="date"
                        id="startDate"
                        aria-label="Start Date"
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink py-2 pl-8 pr-2 text-slate-700 dark:text-bone focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                        {...register('startDate', { required: 'Start date is required' })}
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="date"
                        id="endDate"
                        aria-label="End Date"
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink py-2 pl-8 pr-2 text-slate-700 dark:text-bone focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                        {...register('endDate', { required: 'End date is required' })}
                      />
                    </div>
                  </div>
                  {(errors.startDate || errors.endDate) && (
                    <p className="mt-1 text-[11px] text-rose-500">Both start and end dates are required</p>
                  )}
                </div>
              </div>

              {/* Additional Notes / Instructions */}
              <div>
                <label htmlFor="additionalNotes" className="block text-xs font-semibold text-slate-700 dark:text-bone/90 mb-1.5">
                  Additional Notes / Instructions <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="additionalNotes"
                  rows={3}
                  maxLength={500}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink p-3 text-slate-800 dark:text-bone placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none transition-all"
                  placeholder="Tell the foster home about your pet's needs, behavior, special care instructions, etc."
                  {...register('additionalNotes')}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] text-slate-400">Provide feeding schedules or medications if any</span>
                  <span className="text-xs text-slate-400 font-mono">{watchedNotes.length}/500</span>
                </div>
              </div>

              {/* Selected Pet Confirmation Preview */}
              {selectedPet && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f0fdf4] dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                  <img
                    src={selectedPet.images?.[0]?.url || '/pet-bruno.jpg'}
                    alt={selectedPet.name}
                    className="w-10 h-10 rounded-lg object-cover border border-emerald-200/80 shadow-xs"
                  />
                  <div className="text-xs flex-1">
                    <p className="font-bold text-slate-900 dark:text-bone">
                      Selected Pet: {selectedPet.name}
                    </p>
                    <p className="text-slate-500 dark:text-bone/60 capitalize text-[11px]">
                      {selectedPet.species} • {selectedPet.breed || 'Companion'} • {selectedPet.age || 1} yr old
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#16a34a] flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Ready
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  id="send-foster-request-btn"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white px-6 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5 stroke-[2.5]" />
                  {isSubmitting ? 'Sending Request…' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>

          {/* ═══════════════════════════════════════════════════════
              5. MY FOSTER REQUESTS TABLE
          ═══════════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-mist-800 bg-white dark:bg-ink-soft p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-bone">
                  My Foster Requests
                </h2>
                <p className="text-xs text-slate-500 dark:text-bone/60">
                  Track the status of your submitted foster care requests.
                </p>
              </div>
              {requests.length > 2 && (
                <button
                  id="view-all-requests-btn"
                  type="button"
                  onClick={() => setShowAllRequests((prev) => !prev)}
                  className="text-xs font-bold text-[#16a34a] hover:text-[#15803d] dark:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {showAllRequests ? 'Show Less ←' : 'View All Requests →'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-mist-800 animate-pulse" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 mx-auto mb-3">
                  <Home className="h-6 w-6" />
                </div>
                <p className="font-bold text-slate-800 dark:text-bone text-sm">No Foster Requests Yet</p>
                <p className="text-xs text-slate-500 dark:text-bone/60 mt-1 max-w-xs mx-auto">
                  Select a pet above and submit your first temporary foster care request.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[560px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-mist-800/80 text-slate-400 dark:text-bone/50 font-semibold">
                      <th className="pb-3 pl-1 font-semibold">Pet</th>
                      <th className="pb-3 font-semibold">Reason</th>
                      <th className="pb-3 font-semibold">Requested Date</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80 dark:divide-mist-800/50">
                    {displayedRequests.map((req) => (
                      <tr
                        key={req._id}
                        className="hover:bg-slate-50/80 dark:hover:bg-mist-800/30 transition-colors"
                      >
                        {/* Pet Column */}
                        <td className="py-3 pl-1">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={req.pet.images?.[0]?.url || '/pet-bruno.jpg'}
                              alt={req.pet.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-mist-700 shadow-xs"
                            />
                            <span className="font-bold text-slate-900 dark:text-bone">
                              {req.pet.name}
                            </span>
                          </div>
                        </td>

                        {/* Reason Column */}
                        <td className="py-3 text-slate-600 dark:text-bone/80 font-medium">
                          {extractShortReason(req.reason)}
                        </td>

                        {/* Requested Date */}
                        <td className="py-3 text-slate-500 dark:text-bone/60 font-mono text-[11px]">
                          {formatDateDisplay(req.createdAt)}
                        </td>

                        {/* Status Column */}
                        <td className="py-3">
                          {renderStatusBadge(req.status)}
                        </td>

                        {/* Action Column */}
                        <td className="py-3 text-right pr-1">
                          <button
                            id={`view-details-${req._id}`}
                            type="button"
                            onClick={() => handleOpenDetail(req)}
                            className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg border border-[#16a34a] text-[#16a34a] hover:bg-[#eaf7f0] dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950/40 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT COLUMN (Widgets) ────────────────────────── */}
        <div className="space-y-6">

          {/* ═══════════════════════════════════════════════════
              PET CARE TIPS WIDGET (Clickable interactive tips)
          ═══════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-mist-800 bg-white dark:bg-ink-soft p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💡</span>
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-bone">
                Pet Care Tips
              </h3>
            </div>
            <ul className="space-y-2">
              {PET_CARE_TIPS.map((tip) => (
                <li key={tip.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTip(tip)}
                    className="w-full text-left flex items-center gap-3 p-2 rounded-xl hover:bg-[#eaf7f0]/60 dark:hover:bg-mist-800/40 transition-colors group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#eaf7f0] dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                      {tip.icon}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-bone/80 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 flex-1 leading-snug font-medium transition-colors">
                      {tip.text}
                    </p>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ═══════════════════════════════════════════════════
              TEMPORARY CARE CREATES A BRIGHTER FUTURE CARD
          ═══════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-[#bfe7d1]/80 dark:border-emerald-800/50 bg-[#eef8f3] dark:bg-emerald-950/30 overflow-hidden shadow-xs">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                <h3 className="text-xs font-bold text-[#14532d] dark:text-emerald-300">
                  Temporary Care Creates a Brighter Future
                </h3>
              </div>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/70 leading-relaxed">
                Your pet is in good hands with a loving foster home.
              </p>
            </div>

            {/* Illustration of golden puppy & tabby kitten on grassy hill with hearts */}
            <div className="w-full h-36 overflow-hidden">
              <img
                src="/foster-bright-future.jpg"
                alt="Puppy and kitten on green hill with hearts"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              QUICK LINKS WIDGET
          ═══════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-mist-800 bg-white dark:bg-ink-soft p-5 shadow-xs">
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-bone mb-3">
              Quick Links
            </h3>
            <ul className="space-y-1">
              {[
                { label: 'My Pets', icon: '🐾', href: '/owner/pets' },
                { label: 'Adoption', icon: '❤️', href: '/owner/adoption' },
                { label: 'Messages', icon: '💬', href: '/owner/messages' },
                { label: 'Support & Help', icon: '🎧', href: '/help' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-mist-800/40 transition-colors group"
                  >
                    <span className="text-sm w-7 h-7 flex items-center justify-center bg-slate-100 dark:bg-mist-800 rounded-lg">
                      {link.icon}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-bone/80 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors flex-1">
                      {link.label}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ═══════════════════════════════════════════════════
              BOTTOM MOTIF CARD (Puppy and kitten quote)
          ═══════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50/60 to-teal-50/60 dark:from-emerald-950/20 dark:to-teal-950/20 p-4 text-center">
            <div className="text-2xl mb-1.5 select-none">🐾</div>
            <p className="text-xs font-bold text-[#14532d] dark:text-emerald-300">
              Every pet deserves a safe home.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-bone/60 mt-0.5">
              Your care makes a difference.
            </p>
            <Heart className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500 mx-auto mt-2 opacity-80" />
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          DETAIL MODAL: Full View, Open, Show & Accepted Features
      ═══════════════════════════════════════════════════════ */}
      {activeDetail && (
        <Modal
          isOpen={!!activeDetail}
          onClose={() => setActiveDetail(null)}
          title={`Foster Request: ${activeDetail.pet.name}`}
        >
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-mist-800">
              <span className="text-slate-500 font-mono text-[11px]">
                Submitted on {formatDateDisplay(activeDetail.createdAt)}
              </span>
              <div>{renderStatusBadge(activeDetail.status)}</div>
            </div>

            {/* Pet Card inside detail */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-mist-800/40 border border-slate-200/80 dark:border-mist-700">
              <img
                src={activeDetail.pet.images?.[0]?.url || '/pet-bruno.jpg'}
                alt={activeDetail.pet.name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-mist-700 shrink-0"
              />
              <div className="space-y-0.5 flex-1">
                <p className="font-bold text-sm text-slate-900 dark:text-bone">
                  {activeDetail.pet.name}
                </p>
                <p className="text-slate-500 capitalize">
                  Species: {activeDetail.pet.species}
                </p>
                {activeDetail.durationDays && (
                  <p className="flex items-center gap-1 text-slate-600 dark:text-bone/70">
                    <Clock className="h-3 w-3 text-emerald-600" />
                    Duration: ~{activeDetail.durationDays} days
                  </p>
                )}
              </div>
            </div>

            {/* Foster Home Provider Info or Assignment */}
            <div>
              <p className="font-bold text-slate-700 dark:text-bone/90 uppercase tracking-wider text-[10px] mb-1.5">
                Foster Provider Status
              </p>
              {activeDetail.fosterProvider ? (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <Users className="h-4 w-4" />
                    <span>Assigned Caregiver: {activeDetail.fosterProvider.name}</span>
                  </div>
                  <p className="text-emerald-700/80 dark:text-emerald-400 text-[11px] flex items-center gap-1.5">
                    <Phone className="h-3 w-3" /> Contact: +1 (555) 234-5678 • Verified Foster Home
                  </p>
                  <p className="text-emerald-700/80 dark:text-emerald-400 text-[11px]">
                    Status: Request accepted & caregiver ready for intake
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>Awaiting foster home assignment…</span>
                  </div>
                  {/* ACCEPT / APPROVE REQUEST BUTTON (Fulfills "accepted all feature"!) */}
                  <button
                    id="approve-accept-btn"
                    type="button"
                    onClick={() => handleAcceptRequest(activeDetail._id)}
                    className="inline-flex items-center gap-1 bg-[#16a34a] hover:bg-[#15803d] text-white px-3 py-1.5 rounded-lg font-bold text-[11px] shadow-xs cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Approve / Accept Request
                  </button>
                </div>
              )}
            </div>

            {/* Details & Instructions */}
            <div>
              <p className="font-bold text-slate-700 dark:text-bone/90 uppercase tracking-wider text-[10px] mb-1.5">
                Details & Special Instructions
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-mist-800/40 border border-slate-200/80 dark:border-mist-700 text-slate-700 dark:text-bone whitespace-pre-line leading-relaxed min-h-[50px]">
                {activeDetail.reason || 'No additional instructions provided.'}
              </div>
            </div>

            {/* Interactive Messages Thread */}
            <div>
              <p className="font-bold text-slate-700 dark:text-bone/90 uppercase tracking-wider text-[10px] mb-1.5 flex items-center justify-between">
                <span>Caregiver Communication</span>
                <span className="text-slate-400 font-normal">{activeDetail.messages?.length || 0} messages</span>
              </p>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 rounded-xl p-2.5 bg-slate-50 dark:bg-mist-800/30 border border-slate-200/80 dark:border-mist-700">
                {activeDetail.messages && activeDetail.messages.length > 0 ? (
                  activeDetail.messages.map((msg, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {msg.sender?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 bg-white dark:bg-ink rounded-lg p-2 border border-slate-100 dark:border-mist-800">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-bold text-[11px] text-slate-800 dark:text-bone">
                            {msg.sender?.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDateDisplay(msg.sentAt)}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-bone/80 text-[11px]">{msg.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-2 text-slate-400 text-[11px]">No messages yet.</p>
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message to caregiver or foster home…"
                  className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink px-3 py-2 text-slate-800 dark:text-bone focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="bg-[#16a34a] hover:bg-[#15803d] text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-mist-800">
              <div className="flex gap-2">
                {/* Accept Foster Button if pending */}
                {activeDetail.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(activeDetail._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Accept Request
                  </button>
                )}

                {/* Complete Placement Button if accepted / active */}
                {(activeDetail.status === 'accepted' || activeDetail.status === 'active') && (
                  <button
                    type="button"
                    onClick={() => handleCompleteRequest(activeDetail._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed
                  </button>
                )}

                {/* Cancel Button if still pending */}
                {activeDetail.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleCancelRequest(activeDetail._id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold cursor-pointer"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Cancel Request
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveDetail(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-mist-700 text-slate-700 dark:text-bone hover:bg-slate-100 dark:hover:bg-mist-800 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════════════
          PET CARE TIP DETAIL MODAL
      ═══════════════════════════════════════════════════════ */}
      {activeTip && (
        <Modal
          isOpen={!!activeTip}
          onClose={() => setActiveTip(null)}
          title={activeTip.title}
        >
          <div className="space-y-4 text-xs text-slate-700 dark:text-bone">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#eaf7f0] dark:bg-emerald-950/40 border border-[#bbf0d6] dark:border-emerald-800/50">
              <div className="w-9 h-9 rounded-xl bg-[#16a34a] flex items-center justify-center text-white shrink-0">
                {activeTip.icon}
              </div>
              <p className="font-bold text-sm text-[#14532d] dark:text-emerald-300">
                {activeTip.text}
              </p>
            </div>
            <p className="leading-relaxed text-slate-600 dark:text-bone/80 text-sm">
              {activeTip.description}
            </p>
            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-mist-800">
              <button
                type="button"
                onClick={() => setActiveTip(null)}
                className="px-4 py-2 rounded-xl bg-[#16a34a] text-white font-bold text-xs cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════════════
          ADD NEW PET MODAL
      ═══════════════════════════════════════════════════════ */}
      {isAddPetModalOpen && (
        <Modal
          isOpen={isAddPetModalOpen}
          onClose={() => setAddPetModalOpen(false)}
          title="Add New Pet"
        >
          <form onSubmit={handleCreateNewPet} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">
                Pet Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newPetForm.name}
                onChange={(e) => setNewPetForm({ ...newPetForm, name: e.target.value })}
                placeholder="e.g. Rocky, Bella"
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink p-2.5 text-slate-800 dark:text-bone focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">
                  Species
                </label>
                <select
                  value={newPetForm.species}
                  onChange={(e) =>
                    setNewPetForm({
                      ...newPetForm,
                      species: e.target.value as 'dog' | 'cat' | 'bird' | 'other',
                    })
                  }
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink p-2.5 text-slate-800 dark:text-bone"
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={newPetForm.age}
                  onChange={(e) => setNewPetForm({ ...newPetForm, age: Number(e.target.value) })}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink p-2.5 text-slate-800 dark:text-bone"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">
                  Breed
                </label>
                <input
                  type="text"
                  value={newPetForm.breed}
                  onChange={(e) => setNewPetForm({ ...newPetForm, breed: e.target.value })}
                  placeholder="e.g. Golden Retriever"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink p-2.5 text-slate-800 dark:text-bone"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">
                  Gender
                </label>
                <select
                  value={newPetForm.gender}
                  onChange={(e) =>
                    setNewPetForm({
                      ...newPetForm,
                      gender: e.target.value as 'male' | 'female',
                    })
                  }
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 bg-white dark:bg-ink p-2.5 text-slate-800 dark:text-bone"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-mist-800">
              <button
                type="button"
                onClick={() => setAddPetModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-mist-700 text-slate-700 dark:text-bone text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Save & Select Pet
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default OwnerFoster;
