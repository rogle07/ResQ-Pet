import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Phone,
  MessageCircle,
  MessageSquare,
  AlertTriangle,
  MapPin,
  PawPrint,
  ShieldCheck,
  Navigation,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface PublicPetProfile {
  _id: string;
  tagId: string;
  petId: string;
  name: string;
  species: string;
  breed?: string;
  color?: string;
  gender?: string;
  age?: number;
  description?: string;
  distinctiveMarks?: string;
  photos?: { url: string }[];
  status: 'safe' | 'lost' | 'found' | 'in_rescue' | 'in_foster' | 'adopted';
  lastKnownLocation?: {
    lat: number;
    lng: number;
    updatedAt?: string;
  } | null;
  customInstructions?: string | null;
  owner?: {
    name: string;
    phone?: string | null;
    showPhone?: boolean;
    enableCall?: boolean;
    enableWhatsApp?: boolean;
    callUri?: string | null;
    whatsappUri?: string | null;
  };
  resqTag?: {
    isActive: boolean;
  };
}

export default function PublicPetTag() {
  const { tagId, publicPetId, petId, id } = useParams<{ tagId?: string; publicPetId?: string; petId?: string; id?: string }>();
  const scanIdentifier = publicPetId || tagId || petId || id;

  const [pet, setPet] = useState<PublicPetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Contact form state
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMsg, setContactMsg] = useState('');
  const [finderName, setFinderName] = useState('');
  const [finderPhone, setFinderPhone] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  // Report found state
  const [reportingFound, setReportingFound] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);

  useEffect(() => {
    const fetchTag = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/pets/scan/${scanIdentifier}`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || 'Pet tag not found or inactive');
        }
        setPet(json.pet);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Could not load pet profile');
      } finally {
        setLoading(false);
      }
    };

    if (scanIdentifier) {
      fetchTag();
    }
  }, [scanIdentifier]);

  // Request browser geolocation for found report
  const requestLocation = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Submit in-app contact message to owner
  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMsg.trim()) return;
    try {
      setSendingMsg(true);
      const res = await fetch(`/api/pets/scan/${scanIdentifier}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: contactMsg.trim(),
          finderName: finderName.trim() || undefined,
          finderPhone: finderPhone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send');
      setMessageSent(true);
      setShowContactForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send message. Please call or WhatsApp the owner directly.');
    } finally {
      setSendingMsg(false);
    }
  };

  // Submit Found Pet report with optional coordinates
  const handleReportFound = async () => {
    try {
      setReportingFound(true);
      const res = await fetch(`/api/pets/scan/${scanIdentifier}/report-found`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: gpsCoords?.lat,
          longitude: gpsCoords?.lng,
          accuracy: gpsCoords?.accuracy,
          note: reportNote.trim() || undefined,
          finderPhone: finderPhone.trim() || undefined,
          finderName: finderName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit report');
      setReportSent(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send found report');
    } finally {
      setReportingFound(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="h-10 w-10 border-4 border-emerald-200 border-t-[#1e6f42] rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Reading ResQPet QR Tag...
        </p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-3xl mb-4">
            🏷️
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Pet Tag Not Found</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {error || 'This ResQTag identifier could not be verified or is temporarily deactivated.'}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/"
              className="rounded-xl bg-[#1e6f42] py-3 text-sm font-bold text-white hover:bg-emerald-700 transition"
            >
              Go to ResQPet Homepage
            </Link>
            <Link
              to="/report-found-pet"
              className="rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Report an Unregistered Lost Pet
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const photoUrl = pet.photos?.[0]?.url;
  const isLost = pet.status === 'lost';

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-6 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#1e6f42] to-emerald-500 flex items-center justify-center text-white shadow-md">
              <PawPrint className="h-5 w-5" />
            </div>
            <div>
              <span className="font-black text-lg text-slate-900 dark:text-white">
                ResQ<span className="text-[#1e6f42]">Pet</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-medium">Smart Recovery Tag</span>
            </div>
          </Link>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified Tag
          </span>
        </div>

        {/* Urgent Found Banner if Pet is Marked Lost */}
        {isLost ? (
          <div className="rounded-2xl bg-red-600 text-white p-4 shadow-lg shadow-red-900/20 flex items-center gap-3 animate-pulse">
            <AlertTriangle className="h-7 w-7 shrink-0 text-white" />
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide">
                This Pet is Reported Missing!
              </h3>
              <p className="text-xs text-red-100 mt-0.5">
                The owner is actively searching for {pet.name}. Please call or WhatsApp immediately using the buttons below.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3.5 text-center">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              🐾 Found this pet?
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
              You scanned {pet.name}'s official collar tag. Use the options below to notify the owner.
            </p>
          </div>
        )}

        {/* Main Pet Identification Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-800 shadow-xl overflow-hidden border border-slate-200/80 dark:border-slate-700">
          {/* Photo Header */}
          <div className="h-64 w-full bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={pet.name}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-7xl bg-gradient-to-tr from-emerald-100 to-teal-100 dark:from-slate-700 dark:to-slate-600">
                🐾
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
                  isLost
                    ? 'bg-red-500/90 text-white'
                    : 'bg-emerald-600/90 text-white'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                {isLost ? 'Missing Pet' : 'Registered Pet'}
              </span>
            </div>

            {/* Tag ID Badge */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white font-mono text-xs font-bold px-3 py-1 rounded-full border border-white/20">
              {pet.tagId}
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-5">
            {/* Name & Basic Info */}
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {pet.name}
              </h1>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 capitalize">
                {pet.species} {pet.breed ? `• ${pet.breed}` : ''} {pet.color ? `• ${pet.color}` : ''}
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                {pet.gender && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold capitalize">
                    {pet.gender}
                  </span>
                )}
                {pet.age !== undefined && pet.age > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                    {pet.age} {pet.age === 1 ? 'Year' : 'Years'} Old
                  </span>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold">
                  ID: {pet.petId}
                </span>
              </div>
            </div>

            {/* Owner Info Block */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900/80 dark:to-emerald-950/40 p-5 border-2 border-emerald-500/30 dark:border-emerald-700/40 text-center shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                Pet Guardian / Owner
              </span>
              <p className="font-extrabold text-xl text-slate-900 dark:text-white">
                {pet.owner?.name || 'Registered Owner'}
              </p>
              {pet.owner?.phone ? (
                <div className="pt-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-500/40 dark:border-emerald-600/40 shadow-sm">
                    <Phone className="h-4 w-4 text-[#1e6f42] dark:text-emerald-400" />
                    <a
                      href={pet.owner.callUri || `tel:${pet.owner.phone}`}
                      className="font-mono text-lg font-black text-emerald-700 dark:text-emerald-300 hover:underline"
                    >
                      {pet.owner.phone}
                    </a>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Tap number or use the Call button below to dial directly
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Owner has not set a direct phone number yet. You can still leave a message or send a found alert below.
                </p>
              )}
            </div>

            {/* Distinctive Marks / Description */}
            {(pet.description || pet.distinctiveMarks) && (
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60 p-4 space-y-1">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-amber-600" /> Description & Identifying Marks
                </span>
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  {pet.description || pet.distinctiveMarks}
                </p>
              </div>
            )}

            {/* Custom Care Instructions (Allergies / Behavior) */}
            {pet.customInstructions && (
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/60 p-4 space-y-1">
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                  ⚠️ Special Instructions
                </span>
                <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                  {pet.customInstructions}
                </p>
              </div>
            )}

            {/* Public Last Known Location if enabled */}
            {pet.lastKnownLocation && (
              <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                    Last Known Registered Location
                  </span>
                  <a
                    href={`https://maps.google.com/?q=${pet.lastKnownLocation.lat},${pet.lastKnownLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-[#1e6f42] hover:underline"
                  >
                    Open Map →
                  </a>
                </div>
                <p className="font-mono text-xs text-slate-600 dark:text-slate-400">
                  {pet.lastKnownLocation.lat.toFixed(5)}, {pet.lastKnownLocation.lng.toFixed(5)}
                </p>
              </div>
            )}

            {/* ======================================================== */}
            {/* TWO PROMINENT DIRECT CONTACT BUTTONS                     */}
            {/* ======================================================== */}
            <div className="space-y-3 pt-2">
              {/* Button 1: Call Owner */}
              {pet.owner?.callUri || pet.owner?.phone ? (
                <a
                  href={pet.owner.callUri || `tel:${String(pet.owner?.phone).replace(/[^0-9+]/g, '')}`}
                  className="w-full flex items-center justify-center gap-3 py-4 px-5 rounded-2xl bg-[#1e6f42] hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base shadow-lg shadow-emerald-900/30 transition-all"
                >
                  <Phone className="h-5 w-5 animate-pulse" />
                  <span>Call Pet Owner {pet.owner?.phone ? `(${pet.owner.phone})` : ''}</span>
                </a>
              ) : null}

              {/* Button 2: WhatsApp Owner */}
              {pet.owner?.whatsappUri || pet.owner?.phone ? (
                <a
                  href={
                    pet.owner.whatsappUri ||
                    `https://wa.me/${String(pet.owner?.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${pet.owner?.name || ''}, I found your pet "${pet.name}" (Tag: ${pet.tagId || pet.petId}) registered on ResQPet.`
                    )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-green-900/20 transition-all"
                >
                  <MessageCircle className="h-5 w-5 fill-current" />
                  <span>WhatsApp Pet Owner</span>
                </a>
              ) : null}
            </div>

            {/* Feedback Notifications */}
            {messageSent && (
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 p-4 text-center space-y-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  Message Sent to Owner
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  The owner has received your message in real-time. Thank you!
                </p>
              </div>
            )}

            {reportSent && (
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-700 p-4 text-center space-y-1">
                <CheckCircle2 className="h-6 w-6 text-blue-600 mx-auto" />
                <p className="text-xs font-bold text-blue-800 dark:text-blue-200">
                  Location & Found Alert Delivered!
                </p>
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  The pet owner has been alerted with your coordinates. They can now head toward you.
                </p>
              </div>
            )}

            {/* ======================================================== */}
            {/* COLLAPSIBLE FOUND REPORTING & MESSAGE OPTIONS            */}
            {/* ======================================================== */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              {/* Option 1: Send In-App Message */}
              {!messageSent && (
                <div>
                  {!showContactForm ? (
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-bold text-xs transition"
                    >
                      <MessageSquare className="h-4 w-4 text-[#1e6f42]" />
                      Leave In-App Message for Owner
                    </button>
                  ) : (
                    <form onSubmit={handleContact} className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Leave a Note for {pet.owner?.name || 'Owner'}
                      </h4>
                      <textarea
                        rows={3}
                        required
                        value={contactMsg}
                        onChange={(e) => setContactMsg(e.target.value)}
                        placeholder="e.g. I have Milo safe at 5th Avenue coffee shop. He is friendly..."
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e6f42]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={finderName}
                          onChange={(e) => setFinderName(e.target.value)}
                          placeholder="Your Name (optional)"
                          className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs"
                        />
                        <input
                          type="tel"
                          value={finderPhone}
                          onChange={(e) => setFinderPhone(e.target.value)}
                          placeholder="Your Phone Number"
                          className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowContactForm(false)}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={sendingMsg}
                          className="flex-1 py-2 rounded-xl bg-[#1e6f42] hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <Send className="h-3 w-3" />
                          {sendingMsg ? 'Sending...' : 'Send Message'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Option 2: 1-Click "Report Found with Location" */}
              {!reportSent && (
                <div className="bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/60 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      1-Click Found Pet Alert
                    </span>
                    <button
                      type="button"
                      onClick={requestLocation}
                      disabled={gpsLoading}
                      className="text-[11px] font-bold text-orange-700 hover:underline flex items-center gap-1"
                    >
                      <Navigation className={`h-3 w-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                      {gpsCoords ? 'GPS Acquired ✓' : gpsLoading ? 'Locating...' : 'Attach GPS Location'}
                    </button>
                  </div>
                  <p className="text-[11px] text-orange-800 dark:text-orange-300 leading-relaxed">
                    Sends an immediate push notification to the owner's dashboard with your live location.
                  </p>

                  {gpsCoords && (
                    <div className="p-2 rounded-lg bg-orange-100/70 dark:bg-orange-900/40 text-[10px] font-mono text-orange-800 dark:text-orange-200">
                      📍 Lat: {gpsCoords.lat.toFixed(5)}, Lng: {gpsCoords.lng.toFixed(5)}
                    </div>
                  )}

                  <input
                    type="text"
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                    placeholder="Short location note (e.g. Near park fountain)"
                    className="w-full p-2.5 rounded-xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-800 text-xs"
                  />

                  <button
                    type="button"
                    onClick={handleReportFound}
                    disabled={reportingFound}
                    className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {reportingFound ? 'Submitting Report...' : 'Report – I Found This Pet'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>
            Permanent ResQTag ID: <strong className="font-mono text-slate-600 dark:text-slate-300">{pet.tagId}</strong>
          </p>
          <p>
            Powered by{' '}
            <Link to="/" className="font-bold text-[#1e6f42] hover:underline">
              ResQPet
            </Link>{' '}
            – Smart Animal Rescue & Welfare Platform
          </p>
        </div>
      </div>
    </div>
  );
}
