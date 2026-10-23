import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { petApi } from '@/features/pets/petApi';
import { ngoApi, type AdoptionApplication } from '@/features/ngo/ngoApi';
import { donationApi } from '@/features/donations/donationApi';
import type { Pet } from '@/types';
import Modal from '@/components/ui/Modal';
import { useAppSelector } from '@/app/hooks';
import { openRazorpayCheckout, RAZORPAY_KEY_ID } from '@/utils/razorpay';
import {
  Heart,
  Search,
  PawPrint,
  Clock,
  Star,
  FileText,
  MessageSquare,
  BookOpen,
  Settings,
  Home,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Printer,
  CreditCard,
  Lock,
  PlusCircle,
  Send,
  ArrowRight,
} from 'lucide-react';

/* ── Types & Interfaces ─────────────────────────────────────────────────── */
export interface AdoptablePet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'rabbit' | 'other';
  gender: 'male' | 'female';
  breed: string;
  age: string;
  weight: string;
  location: string;
  status: 'Available' | 'Pending' | 'Adopted';
  image: string;
  health: string;
  bio: string;
  goodWith: string[];
  adoptionFee: number;
  rescueCenter: {
    name: string;
    contact: string;
    verified: boolean;
  };
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

export interface AdoptionApplicationItem {
  id: string;
  petId: string;
  petName: string;
  petSpecies: string;
  petBreed: string;
  petImage: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  address: string;
  housingType: string;
  hasOtherPets: boolean;
  status: 'In Progress' | 'Home Visit Scheduled' | 'Approved' | 'Completed' | 'Rejected';
  stageNote: string;
  paymentStatus: 'paid' | 'pending';
  paidAmount?: number;
  paymentId?: string;
  appliedDate: string;
  receipt?: PaymentReceiptData;
}

export interface AdoptionPackage {
  id: string;
  label: string;
  amount: number;
  tag: string;
  desc: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ngo';
  senderName: string;
  text: string;
  time: string;
}

/* ── Adoption Care Packages (Matching Foster Care Escrow) ───────────────── */
const ADOPTION_CARE_PACKAGES: AdoptionPackage[] = [
  {
    id: 'adopt_care_standard',
    label: 'Standard Shelter Care & Health Checkup',
    amount: 999,
    tag: 'Recommended',
    desc: 'Medical checkup, initial deworming, microchip registration & shelter care support fee.',
  },
  {
    id: 'adopt_care_vaccination',
    label: 'Comprehensive Vaccination & Health Escrow',
    amount: 2499,
    tag: 'Complete Care',
    desc: 'Full core vaccination course, rabies immunization certificate, vet check & health record booklet.',
  },
  {
    id: 'adopt_care_premium',
    label: 'Complete Adoption Welcome & Escrow Kit',
    amount: 3500,
    tag: 'Premium Starter',
    desc: 'Full medical care escrow + starter food nutrition pack, safety collar, digital pet tag & shelter donation.',
  },
];

/* ── Initial Mock Data Matching User Screenshot ─────────────────────────── */
const INITIAL_FEATURED_PETS: AdoptablePet[] = [
  {
    id: 'pet-buddy-01',
    name: 'Buddy',
    species: 'dog',
    gender: 'male',
    breed: 'Labrador Mix',
    age: '3 months',
    weight: '12 kg',
    location: 'Rescue Center, Delhi',
    status: 'Available',
    image: '/buddy-puppy.jpg',
    health: 'Fully vaccinated, dewormed & vet checked',
    bio: 'Buddy is an adorable, cheerful Labrador mix puppy with a heart of gold! Rescued by our team in South Delhi, he loves outdoor play, gentle belly rubs, and learning new puppy tricks.',
    goodWith: ['Children', 'Other Dogs', 'Active Families'],
    adoptionFee: 999,
    rescueCenter: {
      name: 'Delhi Animal Rescue Center',
      contact: '+91 98100 24680',
      verified: true,
    },
  },
  {
    id: 'pet-mittens-02',
    name: 'Mittens',
    species: 'cat',
    gender: 'female',
    breed: 'Domestic Short Hair',
    age: '2 months',
    weight: '3 kg',
    location: 'Rescue Center, Delhi',
    status: 'Available',
    image: '/mittens-kitten.jpg',
    health: 'FVRCP vaccinated, health certified, litter-box trained',
    bio: 'Mittens is a purr machine with irresistible striped paws! Gentle and sweet, she loves curling up in warm cozy laps and batting at yarn balls.',
    goodWith: ['Quiet Homes', 'Other Cats', 'Apartments'],
    adoptionFee: 999,
    rescueCenter: {
      name: 'Delhi Feline Sanctuary',
      contact: '+91 98100 24681',
      verified: true,
    },
  },
  {
    id: 'pet-rocky-03',
    name: 'Rocky',
    species: 'dog',
    gender: 'male',
    breed: 'Indie Dog',
    age: '1 year',
    weight: '18 kg',
    location: 'Rescue Center, Delhi',
    status: 'Available',
    image: '/rocky-dog.jpg',
    health: 'Fully vaccinated, neutered, microchipped',
    bio: 'Rocky is an intelligent, loyal Indie dog rescued from highway traffic. He has a joyful temperament, walks politely on leash, and is eager to be your faithful companion.',
    goodWith: ['Houses with yards', 'Daily walks', 'Loving owners'],
    adoptionFee: 999,
    rescueCenter: {
      name: 'Delhi Animal Rescue Center',
      contact: '+91 98100 24680',
      verified: true,
    },
  },
  {
    id: 'pet-luna-04',
    name: 'Luna',
    species: 'cat',
    gender: 'female',
    breed: 'Domestic Short Hair',
    age: '4 months',
    weight: '3 kg',
    location: 'Rescue Center, Delhi',
    status: 'Available',
    image: '/luna-cat.jpg',
    health: 'Dewormed, vaccinated, healthy coat & bright eyes',
    bio: 'Luna is a gorgeous ginger sweetheart who loves basking in sunny windows and greeting you with soft chirps. She is playful yet very affectionate.',
    goodWith: ['Indoor Homes', 'Gentle Kids', 'Cats'],
    adoptionFee: 999,
    rescueCenter: {
      name: 'Delhi Feline Sanctuary',
      contact: '+91 98100 24681',
      verified: true,
    },
  },
  {
    id: 'pet-bruno-05',
    name: 'Bruno',
    species: 'dog',
    gender: 'male',
    breed: 'Golden Retriever',
    age: '2 years',
    weight: '26 kg',
    location: 'Dwarka Rescue Shelter, Delhi',
    status: 'Available',
    image: '/pet-bruno.jpg',
    health: 'Vaccinated & heartworm negative',
    bio: 'Bruno is a gentle giant who adores companionship, playing fetch, and gentle walks in the park. Friendly with everyone he meets.',
    goodWith: ['Families', 'Kids', 'Other Dogs'],
    adoptionFee: 999,
    rescueCenter: {
      name: 'Dwarka Pet Shelter',
      contact: '+91 98100 24685',
      verified: true,
    },
  },
  {
    id: 'pet-milo-06',
    name: 'Milo',
    species: 'cat',
    gender: 'male',
    breed: 'Indian Short Hair',
    age: '1 year',
    weight: '4 kg',
    location: 'Noida Animal Center, Delhi NCR',
    status: 'Available',
    image: '/pet-milo.jpg',
    health: 'Vaccinated, neutered, healthy',
    bio: 'Calm and affectionate indoor mouser looking for a loving quiet home. Great companion for working professionals.',
    goodWith: ['Apartments', 'Working Owners'],
    adoptionFee: 999,
    rescueCenter: {
      name: 'Noida Animal Welfare',
      contact: '+91 98100 24689',
      verified: true,
    },
  },
];

const INITIAL_APPLICATIONS: AdoptionApplicationItem[] = [
  {
    id: 'app-buddy-01',
    petId: 'pet-buddy-01',
    petName: 'Buddy',
    petSpecies: 'dog',
    petBreed: 'Labrador Mix',
    petImage: '/buddy-puppy.jpg',
    applicantName: 'Diksha',
    applicantEmail: 'diksha.adopter@resqpet.org',
    applicantPhone: '+91 98765 43210',
    address: 'B-44, Greater Kailash 1, New Delhi',
    housingType: 'Independent House with enclosed lawn',
    hasOtherPets: true,
    status: 'In Progress',
    stageNote: 'Home Visit scheduled for Saturday, 25 Oct at 4:00 PM with Delhi Rescue Officer.',
    paymentStatus: 'paid',
    paidAmount: 999,
    paymentId: 'RZP-pay_adopt_99182',
    appliedDate: '20 Oct 2026',
    receipt: {
      id: 'rcpt-adopt-001',
      txnId: 'RZP-pay_adopt_99182',
      petName: 'Buddy',
      amount: 999,
      serviceType: 'Standard Shelter Care & Health Checkup',
      date: '20 Oct 2026',
      invoiceNumber: 'INV-882103',
      method: 'Razorpay Secure Gateway (Live)',
    },
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ngo',
    senderName: 'Delhi Rescue Center (Officer Vikram)',
    text: 'Hello Diksha! Thank you for applying for Buddy. We have reviewed your initial details and your home looks lovely.',
    time: 'Yesterday, 3:30 PM',
  },
  {
    id: 'msg-2',
    sender: 'user',
    senderName: 'Diksha',
    text: 'Thank you Vikram! We are super excited to welcome Buddy into our family. The adoption care fee is also paid via Razorpay.',
    time: 'Yesterday, 4:15 PM',
  },
  {
    id: 'msg-3',
    sender: 'ngo',
    senderName: 'Delhi Rescue Center (Officer Vikram)',
    text: 'Payment of ₹999 received and verified under Escrow. Our home verification officer Priya will visit you this Saturday at 4 PM.',
    time: 'Today, 10:45 AM',
  },
];

/* ═════════════════════════════════════════════════════════════════════════
   OWNER ADOPTION COMPONENT
   Proper Page Layout: Integrated into DashboardLayout without duplicate headers/sidebars
═════════════════════════════════════════════════════════════════════════ */
const OwnerAdoption = () => {
  const currentUser = useAppSelector((s) => s.auth.user);

  // Sub-Navigation Tabs matching screenshot
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'browse' | 'applications' | 'saved' | 'messages' | 'guide' | 'settings'
  >('dashboard');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'dog' | 'cat' | 'rabbit' | 'other'>('all');

  // Pets & Storage state
  const [pets, setPets] = useState<AdoptablePet[]>(() => {
    try {
      const saved = localStorage.getItem('resqpet_adopter_pets_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return INITIAL_FEATURED_PETS;
  });

  // Saved Pets (Bookmark IDs)
  const [savedPetIds, setSavedPetIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('resqpet_saved_pets_v2');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return ['pet-mittens-02']; // Matches Mittens saved in screenshot
  });

  // Applications state
  const [applications, setApplications] = useState<AdoptionApplicationItem[]>(() => {
    try {
      const saved = localStorage.getItem('resqpet_adoption_apps_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return INITIAL_APPLICATIONS;
  });

  // Adopter Profile state (defaulting to Diksha from screenshot)
  const [profile, setProfile] = useState({
    name: currentUser?.name || 'Diksha',
    role: 'Pet Adopter',
    avatar: '/diksha-avatar.jpg',
    quote: '“Animals make life better” 🐾',
    phone: currentUser?.phone || '+91 98765 43210',
    email: currentUser?.email || 'diksha.adopter@resqpet.org',
    city: 'South Delhi, New Delhi',
  });

  // Backend pet listing state (for owners listing their own pets)
  const [backendPets, setBackendPets] = useState<Pet[]>([]);
  const [backendApplications, setBackendApplications] = useState<AdoptionApplication[]>([]);

  // Modals state
  const [detailPet, setDetailPet] = useState<AdoptablePet | null>(null);
  const [applyModalPet, setApplyModalPet] = useState<AdoptablePet | null>(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentPet, setPaymentPet] = useState<AdoptablePet | null>(null);
  const [paymentApp, setPaymentApp] = useState<AdoptionApplicationItem | null>(null);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<PaymentReceiptData | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState('adopt_care_standard');
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Secondary modals
  const [isMessageModalOpen, setMessageModalOpen] = useState(false);
  const [isGuideModalOpen, setGuideModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isListPetModalOpen, setListPetModalOpen] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState('');

  // Notifications / Alerts
  const [successToast, setSuccessToast] = useState('');
  const [serverError, setServerError] = useState('');

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem('resqpet_adopter_pets_v2', JSON.stringify(pets));
    } catch { /* ignore */ }
  }, [pets]);

  useEffect(() => {
    try {
      localStorage.setItem('resqpet_saved_pets_v2', JSON.stringify(savedPetIds));
    } catch { /* ignore */ }
  }, [savedPetIds]);

  useEffect(() => {
    try {
      localStorage.setItem('resqpet_adoption_apps_v2', JSON.stringify(applications));
    } catch { /* ignore */ }
  }, [applications]);

  // Load backend data if available
  useEffect(() => {
    let mounted = true;
    Promise.all([petApi.list(), ngoApi.getAdoptions()])
      .then(([pList, aList]) => {
        if (!mounted) return;
        setBackendPets(pList || []);
        setBackendApplications(aList || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Form for listing pet
  const {
    register: registerList,
    handleSubmit: handleSubmitList,
    reset: resetList,
    formState: { isSubmitting: isListingSubmitting },
  } = useForm<{ petId: string; description: string }>({
    defaultValues: { petId: '', description: '' },
  });

  // Toggle favorite / saved pet
  const handleToggleSave = (petId: string) => {
    setSavedPetIds((prev) => {
      const exists = prev.includes(petId);
      const next = exists ? prev.filter((id) => id !== petId) : [...prev, petId];
      setSuccessToast(exists ? 'Removed pet from Saved Pets.' : 'Added pet to Saved Pets ♡');
      setTimeout(() => setSuccessToast(''), 3000);
      return next;
    });
  };

  // ── PAYMENT GATEWAY HANDLER (Matching Foster Care Escrow) ──────────────
  const handleOpenPayment = (pet: AdoptablePet, app?: AdoptionApplicationItem) => {
    setPaymentPet(pet);
    setPaymentApp(app || null);
    setSelectedPackageId('adopt_care_standard');
    setCustomAmount('');
    setPaymentSuccessReceipt(null);
    setPaymentModalOpen(true);
  };

  const handleExecuteRazorpay = async () => {
    if (!paymentPet) return;
    setIsProcessingPayment(true);
    setServerError('');

    const pkg = ADOPTION_CARE_PACKAGES.find((p) => p.id === selectedPackageId);
    const amountVal = customAmount ? parseFloat(customAmount) : (pkg ? pkg.amount : 999);
    const serviceLabel = pkg ? pkg.label : 'Adoption Care Escrow & Verification';

    try {
      const response = await openRazorpayCheckout({
        amount: amountVal,
        currency: 'INR',
        name: 'ResQPet Adoption Care',
        description: `Adoption Escrow: ${serviceLabel} for ${paymentPet.name}`,
        image: '/logo.png',
        prefill: {
          name: profile.name,
          email: profile.email,
          contact: profile.phone,
        },
        notes: {
          petName: paymentPet.name,
          service: serviceLabel,
          petId: paymentPet.id,
          purpose: 'adoption_care_escrow',
        },
        theme: {
          color: '#166534',
        },
      });

      const receipt: PaymentReceiptData = {
        id: `rcpt-adopt-${Date.now()}`,
        txnId: `RZP-${response.razorpay_payment_id}`,
        petName: paymentPet.name,
        amount: amountVal,
        serviceType: serviceLabel,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        method: 'Razorpay Secure Gateway (Live)',
      };

      setPaymentSuccessReceipt(receipt);

      // Best effort backend sync with donation/order API
      try {
        await (donationApi as any).createRazorpayOrder?.({
          amount: amountVal,
          purpose: 'adoption_care',
        });
      } catch { /* offline safe */ }

      // Update application if existing
      if (paymentApp) {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === paymentApp.id
              ? {
                  ...a,
                  paymentStatus: 'paid',
                  paidAmount: amountVal,
                  paymentId: receipt.txnId,
                  receipt,
                }
              : a
          )
        );
      } else {
        const existingApp = applications.find((a) => a.petId === paymentPet.id);
        if (existingApp) {
          setApplications((prev) =>
            prev.map((a) =>
              a.id === existingApp.id
                ? { ...a, paymentStatus: 'paid', paidAmount: amountVal, paymentId: receipt.txnId, receipt }
                : a
            )
          );
        } else {
          const newApp: AdoptionApplicationItem = {
            id: `app-${Date.now()}`,
            petId: paymentPet.id,
            petName: paymentPet.name,
            petSpecies: paymentPet.species,
            petBreed: paymentPet.breed,
            petImage: paymentPet.image,
            applicantName: profile.name,
            applicantEmail: profile.email,
            applicantPhone: profile.phone,
            address: profile.city,
            housingType: 'Home / Apartment',
            hasOtherPets: true,
            status: 'In Progress',
            stageNote: 'Payment confirmed via Razorpay. Home visit appointment scheduled shortly.',
            paymentStatus: 'paid',
            paidAmount: amountVal,
            paymentId: receipt.txnId,
            appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            receipt,
          };
          setApplications((prev) => [newApp, ...prev]);
        }
      }

      setSuccessToast(`Payment of ₹${amountVal} completed via Razorpay! Receipt generated.`);
      setTimeout(() => setSuccessToast(''), 7000);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Payment cancelled or could not be processed.';
      if (!msg.toLowerCase().includes('cancelled')) {
        setServerError(msg);
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Submit adoption application form
  const handleApplySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!applyModalPet) return;
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payImmediately = formData.get('payNow') === 'true';

    const newApp: AdoptionApplicationItem = {
      id: `app-${Date.now()}`,
      petId: applyModalPet.id,
      petName: applyModalPet.name,
      petSpecies: applyModalPet.species,
      petBreed: applyModalPet.breed,
      petImage: applyModalPet.image,
      applicantName: (formData.get('name') as string) || profile.name,
      applicantEmail: (formData.get('email') as string) || profile.email,
      applicantPhone: (formData.get('phone') as string) || profile.phone,
      address: (formData.get('address') as string) || profile.city,
      housingType: (formData.get('housingType') as string) || 'Apartment',
      hasOtherPets: formData.get('hasPets') === 'yes',
      status: 'In Progress',
      stageNote: payImmediately
        ? 'Application submitted with online payment preference.'
        : 'Application submitted. Payment due on Home Visit verification.',
      paymentStatus: 'pending',
      appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    setApplications((prev) => [newApp, ...prev]);
    setApplyModalPet(null);

    if (payImmediately) {
      handleOpenPayment(applyModalPet, newApp);
    } else {
      setSuccessToast('Adoption Application submitted successfully! We will contact you for a home visit.');
      setTimeout(() => setSuccessToast(''), 6000);
    }
  };

  // Chat send message
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: profile.name,
      text: chatInput.trim(),
      time: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      const ngoReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ngo',
        senderName: 'Delhi Rescue Center (Officer Vikram)',
        text: 'Thank you for your message! Our adoption coordinator has noted your query and will assist you right away.',
        time: 'Just now',
      };
      setMessages((prev) => [...prev, ngoReply]);
    }, 1200);
  };

  // Submit owner list pet for adoption
  const onListPet = async (values: { petId: string; description: string }) => {
    setServerError('');
    try {
      await ngoApi.listPetForAdoption(values.petId, values.description);
      setSuccessToast('Your pet has been successfully listed for adoption in the community!');
      setListPetModalOpen(false);
      resetList();
      const pList = await petApi.list();
      setBackendPets(pList);
      const listed = pList.find((p) => p._id === values.petId);
      if (listed) {
        setPets((prev) => [
          {
            id: listed._id,
            name: listed.name,
            species: (listed.species as any) || 'dog',
            gender: (listed.gender as any) || 'male',
            breed: listed.breed || 'Companion',
            age: `${listed.age || 1} years`,
            weight: '12 kg',
            location: 'Home listed, Delhi',
            status: 'Available',
            image: listed.images?.[0]?.url || '/pets/dog_golden.jpg',
            health: (listed as any).healthStatus || 'Healthy & vaccinated',
            bio: values.description,
            goodWith: ['Families', 'Loving Homes'],
            adoptionFee: 999,
            rescueCenter: {
              name: 'ResQPet Community Listing',
              contact: profile.phone,
              verified: true,
            },
          },
          ...prev,
        ]);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not list pet for adoption. Please try again.';
      setServerError(msg);
    }
  };

  // Filtered Featured Pets list
  const filteredPets = pets.filter((p) => {
    const matchesSpecies = speciesFilter === 'all' || p.species === speciesFilter;
    const matchesQuery =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.species.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecies && matchesQuery;
  });

  const featuredFour = pets.slice(0, 4);
  const savedPetsList = pets.filter((p) => savedPetIds.includes(p.id));

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 dark:text-bone animate-fade-in">

      {/* ═════════════════════════════════════════════════════════════
          TOP BAR & SUB-NAVIGATION TABS (Matching Screenshot)
      ═════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Left: Section Header & Search */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#166534] to-emerald-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <PawPrint className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Pet Adoption
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                  Verified Rescue Network
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Give a second chance, change a life. Escrow protected by Razorpay.
              </p>
            </div>
          </div>

          {/* Right: Search Input & Actions */}
          <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for pets (dog, cat, breed...)"
                className="w-full text-xs rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 py-2 pl-8 pr-3 text-slate-800 dark:text-bone focus:outline-none focus:ring-2 focus:ring-[#166534]/20 focus:border-[#166534]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => setListPetModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">List Pet</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Row (Matching the items from screenshot sidebar) */}
        <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#e8f5e9] text-[#166534] dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-300/50'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('browse')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-[#e8f5e9] text-[#166534] dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-300/50'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PawPrint className="h-3.5 w-3.5" />
            <span>Browse Pets ({pets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-[#e8f5e9] text-[#166534] dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-300/50'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>My Applications ({applications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-[#e8f5e9] text-[#166534] dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-300/50'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Heart className="h-3.5 w-3.5" />
            <span>Saved Pets ({savedPetIds.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('messages');
              setMessageModalOpen(true);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-[#e8f5e9] text-[#166534] dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-300/50'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Messages</span>
            <span className="h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">2</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('guide');
              setGuideModalOpen(true);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-[#e8f5e9] text-[#166534] dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-300/50'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Adoption Guide</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('settings');
              setProfileModalOpen(true);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#e8f5e9] text-[#166534] dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-300/50'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successToast && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-600 hover:text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {/* Server Error Alert */}
      {serverError && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 p-3.5 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
          <button onClick={() => setServerError('')} className="text-rose-600 hover:text-rose-800 font-bold">✕</button>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          1. HERO BANNER: "Adopt Don't Shop ♡" (Full width of container)
      ═════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#284134] via-[#3a5849] to-[#476a59] text-white p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
          {/* Left Text */}
          <div className="space-y-3 z-10 max-w-lg">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Adopt <br />
              Don’t Shop <span className="text-emerald-300 font-light">♡</span>
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Give a second chance, change a life. Every adoption frees up shelter space and saves a life.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setActiveTab('browse')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#134e4a] hover:bg-[#0f3f3c] text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-emerald-400/30"
              >
                <span>Browse Available Pets</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="text-xs text-emerald-200 flex items-center gap-1 font-semibold">
                <Lock className="h-3.5 w-3.5 text-emerald-300" /> Razorpay Escrow Protected
              </span>
            </div>
          </div>

          {/* Right Hero Image matching screenshot */}
          <div className="relative flex justify-center md:justify-end">
            <div className="w-72 sm:w-88 h-44 sm:h-52 rounded-2xl overflow-hidden shadow-lg border border-white/20">
              <img
                src="/adopt-hero-pets.jpg"
                alt="Golden retriever dog and kitten cuddling in grass"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          2. STAT CARDS ROW (4 Cards matching screenshot)
      ═════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Pets Available */}
        <div
          onClick={() => setActiveTab('browse')}
          className="bg-white dark:bg-[#0f172a] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="h-11 w-11 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            <PawPrint className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {pets.length}
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Pets Available
            </p>
          </div>
        </div>

        {/* Card 2: Pets Adopted (by you) */}
        <div
          onClick={() => setActiveTab('applications')}
          className="bg-white dark:bg-[#0f172a] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 shadow-xs hover:border-pink-300 transition-all cursor-pointer group"
        >
          <div className="h-11 w-11 rounded-full bg-pink-100 dark:bg-pink-950/60 flex items-center justify-center shrink-0 text-pink-500 dark:text-pink-400 group-hover:scale-105 transition-transform">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              3
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Pets Adopted <span className="text-[10px] text-slate-400">(by you)</span>
            </p>
          </div>
        </div>

        {/* Card 3: Application In Progress */}
        <div
          onClick={() => setActiveTab('applications')}
          className="bg-white dark:bg-[#0f172a] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="h-11 w-11 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center shrink-0 text-blue-500 dark:text-blue-400 group-hover:scale-105 transition-transform">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {applications.filter((a) => a.status === 'In Progress' || a.status === 'Home Visit Scheduled').length || 1}
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Application In Progress
            </p>
          </div>
        </div>

        {/* Card 4: Saved Pets */}
        <div
          onClick={() => setActiveTab('saved')}
          className="bg-white dark:bg-[#0f172a] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="h-11 w-11 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center shrink-0 text-amber-500 dark:text-amber-400 group-hover:scale-105 transition-transform">
            <Star className="h-5 w-5 fill-current" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {savedPetIds.length}
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Saved Pets
            </p>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          3. MAIN TWO-COLUMN LAYOUT: Content Column (Left) + Widgets (Right)
      ═════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">

        {/* ── LEFT COLUMN (Main Content Area) ────────────────── */}
        <div className="space-y-6 min-w-0">

          {/* DASHBOARD TAB VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">

              {/* FEATURED PETS HEADER */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Featured Pets
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold">
                    Verified Rescue Pets
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="text-xs font-bold text-[#166534] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Pets</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* 4 FEATURED PET CARDS (Buddy, Mittens, Rocky, Luna) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredFour.map((pet) => {
                  const isSaved = savedPetIds.includes(pet.id);
                  return (
                    <div
                      key={pet.id}
                      className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                    >
                      {/* Photo Container with Available Badge & Favorite Heart */}
                      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#166534] text-[10px] font-extrabold shadow-xs">
                            Available
                          </span>
                        </div>
                        <button
                          onClick={() => handleToggleSave(pet.id)}
                          className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-xs cursor-pointer"
                          title={isSaved ? 'Remove from saved' : 'Save pet'}
                        >
                          <Heart className={`h-4 w-4 ${isSaved ? 'text-rose-500 fill-current' : 'text-slate-600'}`} />
                        </button>
                      </div>

                      {/* Pet Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                              {pet.name}
                            </h3>
                            <span className="text-xs font-semibold text-slate-500">
                              {pet.gender === 'male' ? '♂' : '♀'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {pet.breed}
                          </p>

                          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                            <div className="flex items-center gap-3">
                              <span>📅 {pet.age}</span>
                              <span>⚖️ {pet.weight}</span>
                            </div>
                            <p className="truncate">📍 {pet.location}</p>
                          </div>
                        </div>

                        {/* Action Button: View Details */}
                        <div className="pt-1">
                          <button
                            onClick={() => setDetailPet(pet)}
                            className="w-full py-2 px-3 rounded-xl bg-[#164e33] hover:bg-[#113f2a] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* HOW ADOPTION WORKS (Bottom Flow Banner matching screenshot) */}
              <div className="rounded-2xl bg-[#edf7f2] dark:bg-emerald-950/20 border border-[#bbf0d6] dark:border-emerald-800/40 p-5 space-y-4">
                <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#166534] dark:text-emerald-400">
                  How Adoption Works
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  {/* Step 1 */}
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#166534] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      <Search className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">1. Browse Pets</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Find your perfect match</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">2. Apply</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Fill out adoption form</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      <Home className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">3. Home Visit</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">NGO verifies your home</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      <Heart className="h-4 w-4 fill-current" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">4. Take Home</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Welcome your new family member!</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* BROWSE ALL PETS TAB */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Explore All Available Pets
                  </h2>
                  <p className="text-xs text-slate-500">
                    Showing {filteredPets.length} verified rescue animals.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['all', 'dog', 'cat', 'rabbit'] as const).map((sp) => (
                    <button
                      key={sp}
                      onClick={() => setSpeciesFilter(sp)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                        speciesFilter === sp
                          ? 'bg-[#166534] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {sp === 'all' ? 'All Pets' : `${sp}s`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPets.map((pet) => (
                  <div
                    key={pet.id}
                    className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                      <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#166534] text-[10px] font-extrabold">
                        {pet.status}
                      </span>
                      <button
                        onClick={() => handleToggleSave(pet.id)}
                        className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Heart className={`h-4 w-4 ${savedPetIds.includes(pet.id) ? 'text-rose-500 fill-current' : ''}`} />
                      </button>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {pet.name} {pet.gender === 'male' ? '♂' : '♀'}
                          </h3>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            ₹{pet.adoptionFee} Escrow
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{pet.breed} • {pet.age}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                          {pet.bio}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setDetailPet(pet)}
                          className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleOpenPayment(pet)}
                          className="flex-1 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        >
                          <CreditCard className="h-3.5 w-3.5" /> Pay Escrow
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MY APPLICATIONS TAB */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    My Adoption Applications
                  </h2>
                  <p className="text-xs text-slate-500">
                    Track application progress, home visit dates, and Razorpay care fee payment receipts.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#166534] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Apply for Pet
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="bg-white dark:bg-[#0f172a] p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">No applications yet</p>
                  <p className="text-xs text-slate-400">Browse available pets and submit an adoption application to begin.</p>
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.petImage}
                          alt={app.petName}
                          className="h-14 w-14 rounded-2xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                              {app.petName}
                            </h3>
                            <span className="text-xs text-slate-500 capitalize">({app.petBreed})</span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                              {app.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Applied on {app.appliedDate} • Home: {app.housingType}
                          </p>
                        </div>
                      </div>

                      {/* Payment Status Badge */}
                      <div className="flex items-center gap-2">
                        {app.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            Care Fee Paid · ₹{app.paidAmount || 999}
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              const matchedPet = pets.find((p) => p.id === app.petId) || featuredFour[0];
                              handleOpenPayment(matchedPet, app);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <CreditCard className="h-3.5 w-3.5" /> Pay Care Fee · ₹999
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-blue-500" /> Current Step & Schedule
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 pl-5 leading-relaxed">
                        {app.stageNote}
                      </p>
                    </div>

                    {app.receipt && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <span className="text-slate-400 flex items-center gap-1 font-mono">
                          <Lock className="h-3.5 w-3.5 text-emerald-600" /> {app.receipt.txnId}
                        </span>
                        <button
                          onClick={() => {
                            setPaymentSuccessReceipt(app.receipt!);
                            setPaymentModalOpen(true);
                          }}
                          className="text-xs font-bold text-[#166534] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="h-3.5 w-3.5" /> View & Print Invoice
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Incoming applications for owner listed pets */}
              {backendApplications.length > 0 && (
                <div className="pt-4 space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wide text-slate-500">
                    Incoming Applications for My Listed Pets ({backendApplications.length})
                  </h3>
                  <div className="space-y-2">
                    {backendApplications.map((bApp) => (
                      <div
                        key={bApp._id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            Applicant: {bApp.applicant?.name || 'Adopter'} for {bApp.pet?.name || 'Pet'}
                          </p>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            Status: <span className="font-semibold capitalize text-emerald-700">{bApp.status}</span> • Email: {bApp.applicant?.email}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold capitalize self-start sm:self-auto">
                          {bApp.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SAVED PETS TAB */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Saved Pets ({savedPetsList.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Pets you have bookmarked for quick review or immediate adoption.
                </p>
              </div>

              {savedPetsList.length === 0 ? (
                <div className="bg-white dark:bg-[#0f172a] p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                  <Heart className="h-10 w-10 text-rose-300 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">No saved pets yet</p>
                  <p className="text-xs text-slate-400">Click the heart icon on any pet card to add them to your saved list.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedPetsList.map((pet) => (
                    <div
                      key={pet.id}
                      className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3"
                    >
                      <div className="flex gap-3">
                        <img src={pet.image} alt={pet.name} className="h-20 w-20 rounded-xl object-cover" />
                        <div className="flex-1">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{pet.name}</h3>
                          <p className="text-xs text-slate-500">{pet.breed} • {pet.age}</p>
                          <p className="text-[11px] text-slate-400 mt-1">📍 {pet.location}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDetailPet(pet)}
                          className="flex-1 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleOpenPayment(pet)}
                          className="flex-1 py-1.5 rounded-xl bg-[#166534] text-white text-xs font-bold cursor-pointer"
                        >
                          Adopt Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ── RIGHT COLUMN (Widgets matching screenshot) ──────── */}
        <aside className="space-y-4">

          {/* 1. ADOPTER PROFILE CARD */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 text-center space-y-3 shadow-xs">
            <div className="relative inline-block">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-20 w-20 rounded-full object-cover mx-auto ring-4 ring-emerald-100 dark:ring-emerald-950/60 shadow-sm"
              />
              <span className="absolute bottom-0 right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {profile.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">{profile.role}</p>
            </div>

            <button
              onClick={() => setProfileModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Edit Profile
            </button>

            <p className="text-xs text-slate-600 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800">
              {profile.quote}
            </p>
          </div>

          {/* 2. SAVED PETS WIDGET (Matching Screenshot: Mittens, Luna, Rocky) */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                Saved Pets
              </h3>
              <button
                onClick={() => setActiveTab('saved')}
                className="text-[11px] font-bold text-[#166534] dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Item 1: Mittens */}
              <div
                onClick={() => setDetailPet(featuredFour[1])}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src="/mittens-kitten.jpg"
                    alt="Mittens"
                    className="h-10 w-10 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#166534]">
                      Mittens
                    </p>
                    <p className="text-[10px] text-slate-400">Cat • 2 months</p>
                  </div>
                </div>
                <Heart className="h-4 w-4 text-rose-500 fill-current shrink-0" />
              </div>

              {/* Item 2: Luna */}
              <div
                onClick={() => setDetailPet(featuredFour[3])}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src="/luna-cat.jpg"
                    alt="Luna"
                    className="h-10 w-10 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#166534]">
                      Luna
                    </p>
                    <p className="text-[10px] text-slate-400">Cat • 4 months</p>
                  </div>
                </div>
                <Heart className="h-4 w-4 text-slate-300 hover:text-rose-500 shrink-0" />
              </div>

              {/* Item 3: Rocky */}
              <div
                onClick={() => setDetailPet(featuredFour[2])}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src="/rocky-dog.jpg"
                    alt="Rocky"
                    className="h-10 w-10 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#166534]">
                      Rocky
                    </p>
                    <p className="text-[10px] text-slate-400">Dog • 1 year</p>
                  </div>
                </div>
                <Heart className="h-4 w-4 text-slate-300 hover:text-rose-500 shrink-0" />
              </div>
            </div>
          </div>

          {/* 3. QUICK ACTIONS WIDGET */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 space-y-2.5 shadow-xs">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-2">
              Quick Actions
            </h3>

            {/* Action 1 */}
            <button
              onClick={() => setApplyModalPet(featuredFour[0])}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-left transition-all cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-lg bg-[#e8f5e9] dark:bg-emerald-950/50 flex items-center justify-center text-[#166534] dark:text-emerald-400 shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#166534]">
                Start Adoption Application
              </span>
            </button>

            {/* Action 2 */}
            <button
              onClick={() => setMessageModalOpen(true)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-left transition-all cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-lg bg-[#e8f5e9] dark:bg-emerald-950/50 flex items-center justify-center text-[#166534] dark:text-emerald-400 shrink-0">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#166534]">
                Message NGO
              </span>
            </button>

            {/* Action 3 */}
            <button
              onClick={() => setGuideModalOpen(true)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-left transition-all cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-lg bg-[#e8f5e9] dark:bg-emerald-950/50 flex items-center justify-center text-[#166534] dark:text-emerald-400 shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#166534]">
                View Adoption Guide
              </span>
            </button>
          </div>

          {/* 4. THANK YOU CARD */}
          <div className="rounded-2xl bg-[#e6f4ea] dark:bg-emerald-950/40 border border-[#bbf0d6] dark:border-emerald-800/40 p-4 space-y-2 text-center">
            <div className="h-9 w-9 rounded-full bg-[#166534] text-white flex items-center justify-center mx-auto shadow-xs">
              <PawPrint className="h-4 w-4" />
            </div>
            <p className="font-bold text-xs text-[#166534] dark:text-emerald-300 leading-tight">
              Thank you for making a difference! ♡
            </p>
            <p className="text-[11px] font-medium text-emerald-800/80 dark:text-emerald-400">
              Adopt · Foster · Support
            </p>
          </div>

          {/* 5. DOODLE ILLUSTRATION (Matching Screenshot Bottom Widget) */}
          <div className="pt-2 text-center p-2">
            <img
              src="/better-homes-happier-tails.svg"
              alt="Better Homes Happier Tails"
              className="mx-auto w-36 h-auto drop-shadow-xs opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>

        </aside>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          MODAL 1: PET VIEW DETAILS & ADOPTION OPTIONS
      ═════════════════════════════════════════════════════════════ */}
      {detailPet && (
        <Modal
          isOpen={!!detailPet}
          onClose={() => setDetailPet(null)}
          title={`Meet ${detailPet.name} (${detailPet.gender === 'male' ? 'Male' : 'Female'})`}
        >
          <div className="space-y-4 text-xs">
            <div className="relative h-56 rounded-2xl overflow-hidden shadow-sm">
              <img src={detailPet.image} alt={detailPet.name} className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-bold">
                {detailPet.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{detailPet.name}</h3>
                  <p className="text-xs text-slate-500">{detailPet.breed} • {detailPet.age} • {detailPet.weight}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#166534] bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">
                    ₹{detailPet.adoptionFee} Care Fee
                  </span>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                {detailPet.bio}
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Health & Veterinary Status
                </p>
                <p className="text-slate-600 dark:text-slate-400 pl-5">{detailPet.health}</p>
                <p className="text-[11px] text-slate-500 pl-5">Verified by {detailPet.rescueCenter.name}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Great With:</span>
                <div className="flex flex-wrap gap-1.5">
                  {detailPet.goodWith.map((item) => (
                    <span key={item} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  const target = detailPet;
                  setDetailPet(null);
                  setApplyModalPet(target);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Apply for Adoption
              </button>

              <button
                onClick={() => {
                  const target = detailPet;
                  setDetailPet(null);
                  handleOpenPayment(target);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <CreditCard className="h-4 w-4" /> Pay Care Escrow (₹{detailPet.adoptionFee})
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 2: ADOPTION APPLICATION MODAL
      ═════════════════════════════════════════════════════ */}
      {applyModalPet && (
        <Modal
          isOpen={!!applyModalPet}
          onClose={() => setApplyModalPet(null)}
          title={`Adoption Application for ${applyModalPet.name}`}
        >
          <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200">
              <img src={applyModalPet.image} alt={applyModalPet.name} className="h-12 w-12 rounded-xl object-cover" />
              <div>
                <p className="font-bold text-sm text-emerald-900 dark:text-emerald-200">{applyModalPet.name}</p>
                <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                  {applyModalPet.breed} • {applyModalPet.age} • Care Fee: ₹{applyModalPet.adoptionFee}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">Your Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={profile.name}
                  required
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={profile.phone}
                  required
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={profile.email}
                  required
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">Housing Type</label>
                <select
                  name="housingType"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900 cursor-pointer"
                >
                  <option value="Independent House with Lawn">Independent House with Lawn</option>
                  <option value="Apartment / Flat (Pet Friendly)">Apartment / Flat (Pet Friendly)</option>
                  <option value="Villa / Farmhouse">Villa / Farmhouse</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">Full Residential Address (for home visit)</label>
              <textarea
                name="address"
                rows={2}
                defaultValue={profile.city}
                required
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Adoption Care Escrow Preference:</span>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input type="radio" name="payNow" value="true" defaultChecked className="text-[#166534]" />
                <span>Pay Care Escrow (₹999) via Razorpay now (Instant Priority Review & Verification)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input type="radio" name="payNow" value="false" className="text-[#166534]" />
                <span>Pay later during home visit verification</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setApplyModalPet(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold shadow-md cursor-pointer"
              >
                Submit Application
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 3: PAYMENT GATEWAY & INVOICE RECEIPT MODAL
          (Same Payment Gateway features as in Foster Care Request)
      ═════════════════════════════════════════════════════ */}
      {isPaymentModalOpen && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          title="Adoption Care Escrow & Verification Fee"
        >
          {paymentSuccessReceipt ? (
            /* Payment Confirmed & Receipt View */
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

              <div className="p-3 rounded-xl border border-slate-200 dark:border-mist-700 space-y-1.5 bg-white dark:bg-slate-900">
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
                  <span className="text-slate-400">Escrow Security:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> 100% Escrow Protected
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 font-bold cursor-pointer hover:bg-slate-50"
                >
                  <Printer className="h-4 w-4" /> Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-5 py-2 bg-[#166534] hover:bg-[#14532d] text-white rounded-xl font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Razorpay Payment Selection & Trigger */
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[#eaf7f0] border border-[#bbf0d6] text-[#166534] flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#166534]" />
                <p className="leading-tight">
                  <span className="font-bold">Razorpay Live Gateway Active: </span>
                  Adoption care fees are protected under escrow and released to verified rescue centers upon completion of home visit.
                </p>
              </div>

              <div>
                <label className="block font-bold mb-2 text-slate-800 dark:text-bone">
                  Select Adoption Care Package
                </label>
                <div className="space-y-2">
                  {ADOPTION_CARE_PACKAGES.map((pkg) => {
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
                            ? 'border-[#166534] bg-[#f0fbf5] dark:bg-emerald-950/30'
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
                        <span className="font-extrabold text-sm text-[#166534] shrink-0 ml-3">
                          ₹{pkg.amount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">
                  Or Custom Escrow / Shelter Donation (INR ₹)
                </label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  placeholder="e.g. 999 or 1500"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-mist-700 p-2.5 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-mist-800">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" /> Key: {RAZORPAY_KEY_ID.slice(0, 12)}…
                </span>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleExecuteRazorpay}
                  className="px-6 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>
                    {isProcessingPayment
                      ? 'Connecting Razorpay…'
                      : `Pay ₹${customAmount || (ADOPTION_CARE_PACKAGES.find((p) => p.id === selectedPackageId)?.amount || 999)} via Razorpay`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 4: MESSAGE NGO MODAL
      ═════════════════════════════════════════════════════ */}
      {isMessageModalOpen && (
        <Modal
          isOpen={isMessageModalOpen}
          onClose={() => setMessageModalOpen(false)}
          title="Direct Chat with Delhi Rescue Center"
        >
          <div className="space-y-3 text-xs">
            <div className="h-64 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      m.sender === 'user'
                        ? 'bg-[#166534] text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-xs'
                    }`}
                  >
                    <p className="font-bold text-[10px] opacity-75 mb-0.5">{m.senderName}</p>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 px-1">{m.time}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message to Delhi Rescue Center..."
                className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 5: ADOPTION GUIDE MODAL
      ═════════════════════════════════════════════════════ */}
      {isGuideModalOpen && (
        <Modal
          isOpen={isGuideModalOpen}
          onClose={() => setGuideModalOpen(false)}
          title="ResQ Pet Complete Adoption Guide"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-900 dark:text-emerald-300">
              <p className="font-bold">Our Philosophy: Adopt, Don’t Shop ♡</p>
              <p className="text-[11px] mt-0.5 text-emerald-800 dark:text-emerald-400">
                Every rescued pet deserves a loving family. Here is what you need to know about our adoption journey.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-bone block">1. Requirements & Eligibility</span>
                <p className="text-slate-500 mt-1">
                  Adopters must be 18+ years of age, have approval from all household members, and reside in pet-friendly premises.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-bone block">2. Home Visit & Safety Check</span>
                <p className="text-slate-500 mt-1">
                  A verification officer visits to verify pet safety (e.g. balcony netting for cats, secure gate for dogs).
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-bone block">3. Escrow Care Fee & Protection</span>
                <p className="text-slate-500 mt-1">
                  Care charges paid through Razorpay ensure that your pet has received certified vet exams, core vaccinations, and deworming before coming home.
                </p>
              </div>
            </div>

            <div className="text-right pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setGuideModalOpen(false)}
                className="px-5 py-2 bg-[#166534] text-white rounded-xl font-bold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 6: EDIT PROFILE MODAL
      ═════════════════════════════════════════════════════ */}
      {isProfileModalOpen && (
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          title="Edit Adopter Profile"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              setProfile({
                ...profile,
                name: (formData.get('name') as string) || profile.name,
                quote: (formData.get('quote') as string) || profile.quote,
                phone: (formData.get('phone') as string) || profile.phone,
                city: (formData.get('city') as string) || profile.city,
              });
              setProfileModalOpen(false);
              setSuccessToast('Adopter profile updated!');
              setTimeout(() => setSuccessToast(''), 3000);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">Full Name</label>
              <input
                type="text"
                name="name"
                defaultValue={profile.name}
                required
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">Personal Pet Quote</label>
              <input
                type="text"
                name="quote"
                defaultValue={profile.quote}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">Phone</label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={profile.phone}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">City / Location</label>
                <input
                  type="text"
                  name="city"
                  defaultValue={profile.city}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#166534] text-white font-bold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 7: LIST PET FOR ADOPTION (Preserves existing owner feature)
      ═════════════════════════════════════════════════════ */}
      {isListPetModalOpen && (
        <Modal
          isOpen={isListPetModalOpen}
          onClose={() => setListPetModalOpen(false)}
          title="List Pet for Adoption"
        >
          <form onSubmit={handleSubmitList(onListPet)} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">Select Your Pet</label>
              {backendPets.length === 0 ? (
                <p className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs">
                  You have no registered pets yet. Please add a pet from the My Pets section first.
                </p>
              ) : (
                <select
                  {...registerList('petId', { required: true })}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900 cursor-pointer"
                >
                  <option value="">— Choose a pet —</option>
                  {backendPets.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.species} • {p.breed || 'Mixed'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-bone">Description / Note for Adopters</label>
              <textarea
                rows={3}
                {...registerList('description', { required: true })}
                placeholder="Describe why you want to rehome your pet, their temperament, vaccinations, and ideal home requirements..."
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setListPetModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isListingSubmitting}
                className="px-5 py-2 rounded-xl bg-[#166534] text-white font-bold cursor-pointer disabled:opacity-50"
              >
                {isListingSubmitting ? 'Listing Pet…' : 'List for Adoption'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default OwnerAdoption;
