import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, MessageSquare, AlertTriangle, MapPin, PawPrint } from 'lucide-react';

interface PublicPetProfile {
  _id: string;
  name: string;
  species: string;
  breed?: string;
  color?: string;
  gender?: string;
  distinctiveMarks?: string;
  tagId: string;
  photos?: { url: string }[];
  owner?: {
    name: string;
    phone?: string;
    showPhone?: boolean;
  };
}

export default function PublicPetTag() {
  const { tagId } = useParams<{ tagId: string }>();
  const [pet, setPet] = useState<PublicPetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [contactMsg, setContactMsg] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const res = await fetch(`/api/pets/public-tag/${tagId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Tag not found');
        setPet(json.pet);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Could not load pet profile');
      } finally {
        setLoading(false);
      }
    };
    if (tagId) fetchTag();
  }, [tagId]);

  const handleContact = async () => {
    if (!contactMsg.trim()) return;
    try {
      await fetch(`/api/pets/public-tag/${tagId}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: contactMsg }),
      });
      setMessageSent(true);
      setShowContactForm(false);
    } catch {
      alert('Failed to send message. Please try calling the owner directly.');
    }
  };

  const handleReportFound = async () => {
    try {
      await fetch(`/api/pets/public-tag/${tagId}/report-found`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      setReportSent(true);
    } catch {
      alert('Failed to send report.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-emerald-200 border-t-[#1e6f42] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">😢</div>
          <h2 className="text-xl font-black text-slate-800">Tag Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">{error || 'This ResQTag is not registered or may have been deactivated.'}</p>
          <Link to="/" className="mt-6 inline-block rounded-xl bg-[#1e6f42] px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
            Go to ResQPet
          </Link>
        </div>
      </div>
    );
  }

  const photoUrl = pet.photos?.[0]?.url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-4">
        {/* ResQPet Brand */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#1e6f42] to-emerald-500 flex items-center justify-center shadow-lg">
              <PawPrint className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-xl text-slate-800 dark:text-white">ResQ<span className="text-[#1e6f42]">Pet</span></span>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Smart Pet Welfare Ecosystem</p>
        </div>

        {/* Pet Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
          {/* Pet Photo */}
          <div className="h-56 w-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-slate-700 dark:to-slate-600 relative">
            {photoUrl ? (
              <img src={photoUrl} alt={pet.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-7xl">🐾</div>
            )}
            {/* Verified badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-[#1e6f42]/90 backdrop-blur-sm px-3 py-1.5 text-white text-xs font-bold shadow">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              ResQPet Registered
            </div>
          </div>

          {/* Pet Info */}
          <div className="p-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">{pet.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 capitalize">
                {pet.species}{pet.breed ? ` • ${pet.breed}` : ''}{pet.color ? ` • ${pet.color}` : ''}
              </p>
              {pet.gender && (
                <span className="inline-block mt-1 rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
                  {pet.gender}
                </span>
              )}
            </div>

            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 mb-4">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 text-center">
                🏷️ This pet is registered with ResQPet
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 text-center mt-1">
                If you've found this pet, please contact the owner below
              </p>
            </div>

            {pet.distinctiveMarks && (
              <div className="flex items-start gap-2 mb-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-3">
                <MapPin className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Identifying Marks</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">{pet.distinctiveMarks}</p>
                </div>
              </div>
            )}

            {/* Success messages */}
            {messageSent && (
              <div className="mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 p-3 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                ✅ Message sent to the owner! They'll contact you soon.
              </div>
            )}
            {reportSent && (
              <div className="mb-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-3 text-center text-xs font-semibold text-blue-700 dark:text-blue-300">
                📍 Location report sent to the owner!
              </div>
            )}

            {/* Contact Form */}
            {showContactForm && (
              <div className="mb-4 space-y-2">
                <textarea
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  rows={3}
                  placeholder="I found your pet near... I'm at... My phone number is..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e6f42] resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2 text-xs font-bold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContact}
                    className="flex-1 rounded-xl bg-[#1e6f42] py-2 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {!showContactForm && !messageSent && (
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1e6f42] hover:bg-emerald-700 py-3 text-sm font-bold text-white transition shadow-lg shadow-emerald-900/20"
                >
                  <MessageSquare className="h-4 w-4" />
                  Contact Owner
                </button>
              )}
              {pet.owner?.showPhone && pet.owner?.phone && (
                <a
                  href={`tel:${pet.owner.phone}`}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold text-white transition"
                >
                  <Phone className="h-4 w-4" />
                  Call Owner
                </a>
              )}
              {!reportSent && (
                <button
                  onClick={handleReportFound}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 py-3 text-sm font-bold text-white transition"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Report – I Found This Pet
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tag ID */}
        <p className="text-center text-xs text-slate-400">
          ResQTag ID: <span className="font-mono font-bold">{pet.tagId}</span>
        </p>

        <p className="text-center text-xs text-slate-400">
          Powered by{' '}
          <Link to="/" className="font-bold text-[#1e6f42] hover:underline">ResQPet</Link>
          {' '}– Smart Pet Welfare Ecosystem
        </p>
      </div>
    </div>
  );
}

