import { useState, useEffect } from 'react';
import { useAppSelector } from '@/app/hooks';
import Modal from '@/components/ui/Modal';
import { openRazorpayCheckout } from '@/utils/razorpay';
import {
  Heart,
  Search,
  PawPrint,
  MapPin,
  CheckCircle2,
  FileText,
  MessageSquare,
  Send,
  CreditCard,
  Eye,
} from 'lucide-react';

interface AdoptionListing {
  _id: string;
  listingId: string;
  petName: string;
  animalType: string;
  breed: string;
  age: string;
  gender: string;
  color?: string;
  healthCondition?: string;
  vaccinationInfo?: string;
  behavior?: string;
  location: string;
  description: string;
  adoptionTerms?: string;
  adoptionFee: number;
  isFree: boolean;
  photos: { url: string }[];
  listedBy?: { name: string; email?: string; phone?: string };
  createdAt: string;
}

interface AdoptionApplication {
  _id: string;
  requestId: string;
  listing: AdoptionListing;
  applicant: { _id?: string; name: string };
  listingOwner: { _id?: string; name: string };
  applicationNote: string;
  status:
    | 'pending'
    | 'under_review'
    | 'negotiation'
    | 'awaiting_owner_confirmation'
    | 'awaiting_adopter_confirmation'
    | 'agreement_completed'
    | 'payment_pending'
    | 'payment_completed'
    | 'handover_pending'
    | 'completed'
    | 'rejected';
  ownerAgreed: boolean;
  applicantAgreed: boolean;
  agreedFee: number;
  paymentRequired: boolean;
  paymentStatus: string;
  messages: { senderName: string; text: string; sentAt: string; isOwn: boolean }[];
  createdAt: string;
}

const INITIAL_LISTINGS: AdoptionListing[] = [
  {
    _id: 'listing-1',
    listingId: 'AL-BUDDY01',
    petName: 'Buddy',
    animalType: 'Dog',
    breed: 'Golden Retriever Mix',
    age: '1.5 years',
    gender: 'male',
    color: 'Golden',
    healthCondition: 'Healthy, active and energized',
    vaccinationInfo: 'Fully vaccinated & dewormed',
    behavior: 'Loves children, friendly with other dogs, house trained',
    location: 'Sector 62, Noida, Delhi NCR',
    description: 'Buddy is a playful and affectionate pup seeking an active family with a garden or open space.',
    adoptionTerms: 'Home check required, follow-up updates requested.',
    adoptionFee: 0,
    isFree: true,
    photos: [{ url: '/buddy-puppy.jpg' }],
    listedBy: { name: 'Aarav Sharma' },
    createdAt: '2026-10-25T10:00:00Z',
  },
  {
    _id: 'listing-2',
    listingId: 'AL-MITTENS02',
    petName: 'Mittens',
    animalType: 'Cat',
    breed: 'Persian Cross',
    age: '8 months',
    gender: 'female',
    color: 'Grey & White',
    healthCondition: 'Excellent health, spayed',
    vaccinationInfo: 'Core vaccines up to date',
    behavior: 'Quiet, gentle, purrs easily, strictly indoor cat',
    location: 'Indiranagar, Bengaluru, Karnataka',
    description: 'Sweet and calm kitten looking for a peaceful indoor home with plenty of love.',
    adoptionTerms: 'Indoor adoption only, safe windows required.',
    adoptionFee: 500,
    isFree: false,
    photos: [{ url: '/mittens-kitten.jpg' }],
    listedBy: { name: 'Pooja Verma' },
    createdAt: '2026-10-26T12:00:00Z',
  },
  {
    _id: 'listing-3',
    listingId: 'AL-ROCKY03',
    petName: 'Rocky',
    animalType: 'Dog',
    breed: 'Indie Hound',
    age: '2 years',
    gender: 'male',
    color: 'Brown & White',
    healthCondition: 'Very healthy, vaccinated',
    vaccinationInfo: 'Rabies and 7-in-1 complete',
    behavior: 'Loyal guardian, alert, gentle with family members',
    location: 'Bandra West, Mumbai, Maharashtra',
    description: 'Rescued Indie with lots of love to give. Needs daily brisk walks.',
    adoptionTerms: 'Commitment to regular vet care.',
    adoptionFee: 0,
    isFree: true,
    photos: [{ url: '/rocky-dog.jpg' }],
    listedBy: { name: 'Sunil Rao' },
    createdAt: '2026-10-27T09:30:00Z',
  },
  {
    _id: 'listing-4',
    listingId: 'AL-LUNA04',
    petName: 'Luna',
    animalType: 'Cat',
    breed: 'Domestic Calico',
    age: '1 year',
    gender: 'female',
    color: 'Tricolor Calico',
    healthCondition: 'Healthy, vet checked',
    vaccinationInfo: 'Fully vaccinated',
    behavior: 'Curious explorer, affectionate lap warmer',
    location: 'Kothrud, Pune, Maharashtra',
    description: 'Luna loves sitting on window sills watching birds. Very clean and litter-box trained.',
    adoptionTerms: 'Adopter must provide regular updates for 3 months.',
    adoptionFee: 0,
    isFree: true,
    photos: [{ url: '/luna-cat.jpg' }],
    listedBy: { name: 'Sneha Kulkarni' },
    createdAt: '2026-10-28T14:15:00Z',
  },
];

const AdopterOverview = () => {
  const currentUser = useAppSelector((s) => s.auth.user);

  const [listings, setListings] = useState<AdoptionListing[]>(() => {
    try {
      const saved = localStorage.getItem('resqpet_adopter_listings_v1');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return INITIAL_LISTINGS;
  });

  const [myApplications, setMyApplications] = useState<AdoptionApplication[]>(() => {
    try {
      const saved = localStorage.getItem('resqpet_adopter_apps_v1');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [];
  });

  const [activeTab, setActiveTab] = useState<'browse' | 'applications'>('browse');
  const [selectedPet, setSelectedPet] = useState<AdoptionListing | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [activeChatApp, setActiveChatApp] = useState<AdoptionApplication | null>(null);
  const [applicationNote, setApplicationNote] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('resqpet_adopter_listings_v1', JSON.stringify(listings));
      localStorage.setItem('resqpet_adopter_apps_v1', JSON.stringify(myApplications));
    } catch { /* ignore */ }
  }, [listings, myApplications]);

  // Fetch from backend if available
  useEffect(() => {
    fetch('/api/adoption-listings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.listings && data.listings.length > 0) {
          setListings(data.listings);
        }
      })
      .catch(() => {});
  }, []);

  // Filter listings
  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      l.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || l.animalType.toLowerCase() === selectedType.toLowerCase();
    const matchesLocation =
      selectedLocation === 'all' || l.location.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesSearch && matchesType && matchesLocation;
  });

  // Submit Application
  const handleApply = async () => {
    if (!selectedPet) return;
    setIsSubmittingApp(true);

    const ts = Date.now().toString(36).toUpperCase();
    const newApp: AdoptionApplication = {
      _id: `app-${Date.now()}`,
      requestId: `AR-${ts}`,
      listing: selectedPet,
      applicant: { _id: currentUser?._id, name: currentUser?.name || 'Adopter' },
      listingOwner: { name: selectedPet.listedBy?.name || 'Pet Owner' },
      applicationNote: applicationNote.trim() || 'I am interested in providing a loving forever home for this pet.',
      status: 'pending',
      ownerAgreed: false,
      applicantAgreed: false,
      agreedFee: selectedPet.adoptionFee || 0,
      paymentRequired: !selectedPet.isFree && selectedPet.adoptionFee > 0,
      paymentStatus: selectedPet.isFree ? 'not_required' : 'pending',
      messages: [
        {
          senderName: currentUser?.name || 'You',
          text: `Application submitted: "${applicationNote.trim() || 'Interested in adopting!'}"`,
          sentAt: new Date().toISOString(),
          isOwn: true,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      await fetch(`/api/adoption-listings/${selectedPet._id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ applicationNote: newApp.applicationNote }),
      });
    } catch { /* local fallback */ }

    setMyApplications((prev) => [newApp, ...prev]);
    setApplyModalOpen(false);
    setSelectedPet(null);
    setApplicationNote('');
    setIsSubmittingApp(false);
    setSuccessToast(`Adoption request submitted! Request ID: ${newApp.requestId}. Pet Owner has been notified.`);
    setTimeout(() => setSuccessToast(''), 6000);
  };

  // Send message in chat
  const handleSendChatMessage = () => {
    if (!chatInput.trim() || !activeChatApp) return;

    const newMsg = {
      senderName: currentUser?.name || 'You',
      text: chatInput.trim(),
      sentAt: new Date().toISOString(),
      isOwn: true,
    };

    const updated = {
      ...activeChatApp,
      status: activeChatApp.status === 'pending' ? 'negotiation' : activeChatApp.status,
      messages: [...activeChatApp.messages, newMsg],
    };

    setMyApplications((prev) => prev.map((a) => (a._id === activeChatApp._id ? updated : a)));
    setActiveChatApp(updated);
    setChatInput('');
  };

  // Confirm terms as Adopter
  const handleAdopterConfirm = (appId: string) => {
    setMyApplications((prev) =>
      prev.map((a) => {
        if (a._id !== appId) return a;
        const bothAgreed = a.ownerAgreed;
        return {
          ...a,
          applicantAgreed: true,
          status: bothAgreed
            ? a.paymentRequired
              ? 'payment_pending'
              : 'agreement_completed'
            : 'awaiting_owner_confirmation',
          messages: [
            ...a.messages,
            {
              senderName: currentUser?.name || 'You',
              text: 'I agree to the adoption terms and am ready to proceed!',
              sentAt: new Date().toISOString(),
              isOwn: true,
            },
          ],
        };
      })
    );

    if (activeChatApp?._id === appId) {
      setActiveChatApp((prev) =>
        prev
          ? {
              ...prev,
              applicantAgreed: true,
              status: prev.ownerAgreed
                ? prev.paymentRequired
                  ? 'payment_pending'
                  : 'agreement_completed'
                : 'awaiting_owner_confirmation',
            }
          : null
      );
    }

    setSuccessToast('You confirmed the adoption agreement!');
    setTimeout(() => setSuccessToast(''), 5000);
  };

  // Payment for Adoption Fee (if applicable and after mutual agreement)
  const handlePayFee = async (app: AdoptionApplication) => {
    if (!app.agreedFee || app.agreedFee <= 0) return;

    try {
      const response = await openRazorpayCheckout({
        amount: app.agreedFee,
        currency: 'INR',
        name: 'ResQPet Adoption',
        description: `Adoption fee for ${app.listing.petName}`,
        prefill: {
          name: currentUser?.name || 'Adopter',
          email: currentUser?.email || '',
        },
        theme: { color: '#16a34a' },
      });

      const updated: AdoptionApplication = {
        ...app,
        status: 'payment_completed',
        paymentStatus: 'paid',
        messages: [
          ...app.messages,
          {
            senderName: currentUser?.name || 'You',
            text: `Adoption fee of ₹${app.agreedFee} verified via Razorpay! Payment ID: ${response.razorpay_payment_id}. Ready for handover.`,
            sentAt: new Date().toISOString(),
            isOwn: true,
          },
        ],
      };

      setMyApplications((prev) => prev.map((a) => (a._id === app._id ? updated : a)));
      if (activeChatApp?._id === app._id) setActiveChatApp(updated);
      setSuccessToast('Payment verified! Adoption agreement is completed.');
      setTimeout(() => setSuccessToast(''), 6000);
    } catch {
      // Payment cancelled
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500 fill-current" />
            Adoption Portal
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Browse lovable pets seeking forever homes and connect directly with their guardians.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'browse'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Browse Pets ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'applications'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>My Applications</span>
            {myApplications.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[10px]">
                {myApplications.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successToast}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* TAB 1: BROWSE PETS */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="card p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by pet name, breed, keywords..."
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <select
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">All Species (Dogs, Cats, Others)</option>
                  <option value="dog">Dogs</option>
                  <option value="cat">Cats</option>
                  <option value="other">Other Animals</option>
                </select>
              </div>

              <div>
                <select
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  <option value="noida">Delhi NCR / Noida</option>
                  <option value="bengaluru">Bengaluru</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="pune">Pune</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pets Grid */}
          {filteredListings.length === 0 ? (
            <div className="card py-16 text-center text-slate-400">
              <PawPrint className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No pets match your criteria</p>
              <p className="text-xs mt-1">Try adjusting your search terms or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredListings.map((pet) => (
                <div
                  key={pet._id}
                  className="card p-0 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group border border-slate-200/80 dark:border-slate-800"
                >
                  {/* Pet Photo */}
                  <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {pet.photos?.[0]?.url ? (
                      <img
                        src={pet.photos[0].url}
                        alt={pet.petName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PawPrint className="h-12 w-12 text-slate-300" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-xs">
                        {pet.animalType}
                      </span>
                      {pet.isFree ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                          Free Adoption
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                          Fee: ₹{pet.adoptionFee}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pet Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                          {pet.petName}
                        </h3>
                        <span className="text-xs font-semibold text-slate-500">{pet.age}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {pet.breed} • {pet.gender}
                      </p>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {pet.description}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <p className="text-slate-500 flex items-center gap-1 truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{pet.location}</span>
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedPet(pet)}
                          className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs flex items-center justify-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPet(pet);
                            setApplyModalOpen(true);
                          }}
                          className="flex-1 py-2 rounded-xl bg-[#1e6f42] hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Heart className="h-3.5 w-3.5 fill-current" /> Adopt
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* TAB 2: MY APPLICATIONS */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {myApplications.length === 0 ? (
            <div className="card py-16 text-center text-slate-400">
              <FileText className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No adoption requests sent yet</p>
              <p className="text-xs mt-1">Browse pets and submit an application to start the adoption process.</p>
              <button
                onClick={() => setActiveTab('browse')}
                className="mt-4 px-4 py-2 rounded-xl bg-[#1e6f42] text-white text-xs font-bold"
              >
                Browse Pets
              </button>
            </div>
          ) : (
            myApplications.map((app) => {
              const needsConfirm = app.status === 'awaiting_adopter_confirmation' || (app.ownerAgreed && !app.applicantAgreed);
              const canPay = app.status === 'payment_pending' && app.paymentRequired;

              return (
                <div key={app._id} className="card hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      {app.listing.photos?.[0]?.url ? (
                        <img src={app.listing.photos[0].url} alt={app.listing.petName} className="w-full h-full object-cover" />
                      ) : (
                        <PawPrint className="w-full h-full p-4 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {app.listing.petName}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-800">
                          {app.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-mono text-slate-400">ID: {app.requestId}</span>
                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        Listed by: {app.listingOwner.name} • Location: {app.listing.location}
                      </p>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1 italic">
                        "{app.applicationNote}"
                      </p>

                      {app.agreedFee > 0 && (
                        <p className="text-xs font-semibold text-emerald-700 mt-1">
                          Adoption Fee: ₹{app.agreedFee} ({app.paymentStatus === 'paid' ? 'Paid ✓' : 'Payable upon mutual agreement'})
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => setActiveChatApp(app)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-600" /> Chat with Owner
                      </button>

                      {needsConfirm && (
                        <button
                          onClick={() => handleAdopterConfirm(app._id)}
                          className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Agreement
                        </button>
                      )}

                      {canPay && (
                        <button
                          onClick={() => handlePayFee(app)}
                          className="px-3.5 py-2 rounded-xl bg-[#1e6f42] hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <CreditCard className="h-3.5 w-3.5" /> Pay Fee (₹{app.agreedFee})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── PET DETAIL MODAL ── */}
      <Modal isOpen={!!selectedPet && !applyModalOpen} onClose={() => setSelectedPet(null)} title={selectedPet?.petName || 'Pet Details'}>
        {selectedPet && (
          <div className="space-y-4">
            <div className="h-56 rounded-2xl overflow-hidden bg-slate-100">
              <img src={selectedPet.photos[0]?.url || '/puppy.jpg'} alt={selectedPet.petName} className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400">Species</span><p className="font-semibold text-slate-800 dark:text-white">{selectedPet.animalType}</p></div>
              <div><span className="text-slate-400">Breed</span><p className="font-semibold text-slate-800 dark:text-white">{selectedPet.breed}</p></div>
              <div><span className="text-slate-400">Age</span><p className="font-semibold text-slate-800 dark:text-white">{selectedPet.age}</p></div>
              <div><span className="text-slate-400">Gender</span><p className="font-semibold text-slate-800 dark:text-white">{selectedPet.gender}</p></div>
              <div><span className="text-slate-400">Adoption Fee</span><p className="font-semibold text-emerald-700">{selectedPet.isFree ? 'Free Adoption' : `₹${selectedPet.adoptionFee}`}</p></div>
              <div><span className="text-slate-400">Location</span><p className="font-semibold text-slate-800 dark:text-white">{selectedPet.location}</p></div>
            </div>

            {selectedPet.healthCondition && (
              <div><span className="text-xs text-slate-400">Health Condition</span><p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{selectedPet.healthCondition}</p></div>
            )}
            {selectedPet.behavior && (
              <div><span className="text-xs text-slate-400">Behavior & Temperament</span><p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{selectedPet.behavior}</p></div>
            )}
            {selectedPet.adoptionTerms && (
              <div><span className="text-xs text-slate-400">Adoption Terms</span><p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{selectedPet.adoptionTerms}</p></div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setSelectedPet(null)} className="btn-secondary text-xs">Close</button>
              <button
                onClick={() => setApplyModalOpen(true)}
                className="px-5 py-2 rounded-xl bg-[#1e6f42] text-white font-bold text-xs hover:bg-emerald-800"
              >
                Send Adoption Request
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── APPLY MODAL ── */}
      <Modal isOpen={applyModalOpen} onClose={() => setApplyModalOpen(false)} title={`Adopt ${selectedPet?.petName}`}>
        {selectedPet && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 text-xs text-pink-800 dark:text-pink-300">
              <strong>Step 1 of Adoption:</strong> Submit your introduction. You will connect directly with {selectedPet.listedBy?.name || 'the guardian'} via private chat to discuss requirements and agree on terms before any handover.
            </div>

            <div>
              <label className="label">Why would you like to adopt {selectedPet.petName}?</label>
              <textarea
                className="input min-h-[90px]"
                placeholder="Tell the owner about your household, daily routine, experience with pets, and living situation..."
                value={applicationNote}
                onChange={(e) => setApplicationNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setApplyModalOpen(false)} className="btn-secondary text-xs">Cancel</button>
              <button
                onClick={handleApply}
                disabled={isSubmittingApp}
                className="px-5 py-2 rounded-xl bg-[#1e6f42] text-white font-bold text-xs hover:bg-emerald-800 disabled:opacity-50"
              >
                {isSubmittingApp ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── REAL-TIME CHAT & AGREEMENT MODAL ── */}
      <Modal isOpen={!!activeChatApp} onClose={() => setActiveChatApp(null)} title={`Adoption Case — ${activeChatApp?.requestId}`}>
        {activeChatApp && (
          <div className="space-y-4">
            {/* Mutual Agreement Status Bar */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Pet: {activeChatApp.listing.petName}</p>
                <p className="text-slate-500">Guardian: {activeChatApp.listingOwner.name}</p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-pink-100 text-pink-800">
                  {activeChatApp.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Confirmation Banner if Owner confirmed */}
            {activeChatApp.ownerAgreed && !activeChatApp.applicantAgreed && (
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 text-xs text-teal-800 dark:text-teal-300 space-y-2">
                <p className="font-bold">The pet owner has agreed to the adoption terms!</p>
                <p>Please review and confirm to complete the mutual adoption agreement.</p>
                <button
                  onClick={() => handleAdopterConfirm(activeChatApp._id)}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 text-white font-bold"
                >
                  I Confirm & Agree to Terms
                </button>
              </div>
            )}

            {/* Payment Banner if both agreed & fee > 0 */}
            {activeChatApp.status === 'payment_pending' && activeChatApp.paymentRequired && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
                <p className="font-bold">Both parties have agreed! Payment is now unlocked.</p>
                <p>Applicable adoption fee: ₹{activeChatApp.agreedFee}</p>
                <button
                  onClick={() => handlePayFee(activeChatApp)}
                  className="px-4 py-1.5 rounded-lg bg-[#1e6f42] text-white font-bold flex items-center gap-1.5"
                >
                  <CreditCard className="h-3.5 w-3.5" /> Pay ₹{activeChatApp.agreedFee} via Razorpay
                </button>
              </div>
            )}

            {/* Chat Messages */}
            <div className="space-y-2 max-h-56 overflow-y-auto bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl">
              {activeChatApp.messages.map((m, i) => (
                <div key={i} className={`flex ${m.isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl p-2.5 text-xs ${
                      m.isOwn ? 'bg-[#1e6f42] text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border'
                    }`}
                  >
                    {!m.isOwn && <p className="font-bold text-[10px] text-slate-400 mb-0.5">{m.senderName}</p>}
                    <p>{m.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${m.isOwn ? 'text-emerald-200' : 'text-slate-400'}`}>
                      {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                className="input text-xs flex-1"
                placeholder="Discuss health, behavior, handover, terms..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
              />
              <button
                onClick={handleSendChatMessage}
                className="px-4 py-2 rounded-xl bg-[#1e6f42] text-white font-bold text-xs hover:bg-emerald-800"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdopterOverview;

