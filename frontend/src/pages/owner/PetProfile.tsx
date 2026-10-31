import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { petApi } from '@/features/pets/petApi';
import { petStatusToSignal, petStatusLabel } from '@/features/pets/petStatus';
import SignalIndicator from '@/components/ui/SignalIndicator';
import LoadingScreen from '@/components/ui/LoadingScreen';
import type { Pet } from '@/types';
import {
  QrCode,
  Download,
  Printer,
  ExternalLink,
  ShieldCheck,
  Phone,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const PetProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [vaccineName, setVaccineName] = useState('');

  // ResQTag States
  const [generatingTag, setGeneratingTag] = useState(false);
  const [showPhoneOnTag, setShowPhoneOnTag] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await petApi.getById(id);
      setPet(data);
      if (data?.resqTag?.showPhone !== undefined) {
        setShowPhoneOnTag(data.resqTag.showPhone);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!pet) return <p className="text-sm text-ink/60">Pet not found.</p>;

  const toggleLost = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const updated = pet.status === 'lost' ? await petApi.markSafe(id) : await petApi.markLost(id);
      setPet(updated);
    } finally {
      setActionLoading(false);
    }
  };

  const addVaccination = async () => {
    if (!id || !vaccineName.trim()) return;
    await petApi.addVaccination(id, { name: vaccineName.trim(), dateGiven: new Date().toISOString() });
    setVaccineName('');
    load();
  };

  const deletePet = async () => {
    if (!id) return;
    if (!confirm(`Remove ${pet.name}'s profile? This cannot be undone.`)) return;
    await petApi.remove(id);
    navigate('/owner/pets');
  };

  const uploadPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!id) return;
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setPhotoError('');
    setPhotoUploading(true);
    try {
      const updated = await petApi.update(id, { images: files });
      setPet(updated);
    } catch (err) {
      const apiError = (err as { response?: { data?: { message?: string } } }).response?.data;
      setPhotoError(apiError?.message || 'Could not upload the photo. Please try again.');
    } finally {
      setPhotoUploading(false);
      e.target.value = '';
    }
  };

  // Generate / Refresh ResQTag
  const handleGenerateTag = async () => {
    if (!id) return;
    setGeneratingTag(true);
    try {
      const res = await petApi.generateTag(id, { showPhone: showPhoneOnTag });
      if (res?.pet) {
        setPet(res.pet);
      } else {
        await load();
      }
    } catch {
      alert('Could not generate ResQTag. Please check your connection.');
    } finally {
      setGeneratingTag(false);
    }
  };

  const tagId = pet.tagId || pet.petId;
  const tagUrl = `${window.location.origin}/tag/${tagId}`;
  const qrImageSrc =
    pet.qrCode ||
    `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(tagUrl)}`;

  // Download QR Code PNG
  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = qrImageSrc;
    link.download = `${pet.name.replace(/\s+/g, '_')}_ResQTag_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Collar Tag
  const handlePrintTag = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/owner/pets" className="inline-block text-sm text-moss-600 dark:text-moss-400 hover:underline">
        ← Back to My Pets
      </Link>

      {/* Main Profile Card */}
      <div className="card">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="h-44 w-44 shrink-0 overflow-hidden rounded-2xl bg-moss-100 dark:bg-moss-700/30 shadow-sm border border-slate-200 dark:border-slate-700">
            {pet.images?.[0]?.url ? (
              <img src={pet.images[0].url} alt={pet.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-4xl text-moss-500 dark:text-moss-400">
                {pet.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-2xl font-black text-slate-900 dark:text-white">{pet.name}</h1>
                <p className="text-sm capitalize text-slate-500 dark:text-slate-400 mt-0.5">
                  {pet.breed || pet.species} · {pet.gender} {pet.age ? `· ${pet.age}y` : ''}
                </p>
              </div>
              <SignalIndicator status={petStatusToSignal(pet.status)}>
                <span className="text-sm font-semibold">{petStatusLabel[pet.status]}</span>
              </SignalIndicator>
            </div>

            <div className="mt-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-[#1e6f42] dark:text-emerald-400 hover:underline">
                {photoUploading ? 'Uploading…' : pet.images?.length ? 'Change photo' : '+ Add a photo'}
                <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={photoUploading} />
              </label>
              {photoError && <p className="mt-1 text-xs text-coral-500">{photoError}</p>}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="pet-tag">{pet.petId}</span>
              {pet.tagId && (
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-xs px-2.5 py-0.5 font-bold">
                  ResQTag: {pet.tagId}
                </span>
              )}
              {pet.collar?.isActive && (
                <span className="pet-tag">🔋 {pet.collar.lastBatteryPercent ?? '—'}%</span>
              )}
              {pet.color && <span className="pet-tag">{pet.color}</span>}
              {pet.weightKg && <span className="pet-tag">{pet.weightKg} kg</span>}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={toggleLost} disabled={actionLoading} className={pet.status === 'lost' ? 'btn-primary' : 'btn-danger'}>
                {actionLoading ? 'Updating…' : pet.status === 'lost' ? 'Mark as safe' : 'Mark as lost'}
              </button>
              <Link to="/owner/tracking" className="btn-secondary">
                View live location
              </Link>
              <button onClick={deletePet} className="btn-secondary text-coral-600 dark:text-coral-400">
                Remove profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RESQTAG QR INTEGRATION SECTION                          */}
      {/* ======================================================== */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-[#1e6f42] to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/20">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">ResQTag Smart QR Identity</h2>
                {pet.resqTag?.isActive ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="h-3.5 w-3.5" /> Active
                  </span>
                ) : (
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-full">
                    Setup Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Attach this unique QR code to {pet.name}'s collar. Anyone who finds {pet.name} can scan it to instantly reach you without an app.
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateTag}
            disabled={generatingTag}
            className="flex items-center gap-2 rounded-xl bg-[#1e6f42] hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-sm disabled:opacity-50 shrink-0"
          >
            {generatingTag ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : pet.resqTag?.isActive ? (
              <>
                <RefreshCw className="h-4 w-4" /> Refresh Tag
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Activate ResQTag
              </>
            )}
          </button>
        </div>

        {/* QR Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-center">
          {/* QR Code Display & Printable Tag */}
          <div className="md:col-span-4 flex flex-col items-center justify-center">
            <div
              ref={printRef}
              className="bg-white p-4 rounded-2xl border-2 border-emerald-500/30 shadow-md flex flex-col items-center text-center max-w-[240px]"
            >
              <div className="flex items-center gap-1 text-[#1e6f42] font-black text-xs mb-2">
                <span>ResQTag</span>
                <span className="text-slate-400">·</span>
                <span className="font-mono text-[10px] text-slate-600">{tagId}</span>
              </div>
              <img
                src={qrImageSrc}
                alt={`${pet.name} ResQTag QR`}
                className="h-44 w-44 rounded-xl object-contain border border-slate-100"
              />
              <p className="font-bold text-slate-800 text-sm mt-2">{pet.name}</p>
              <p className="text-[11px] text-slate-500 capitalize">{pet.breed || pet.species}</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">Scan if found to contact owner</p>
            </div>
          </div>

          {/* Details & Action Controls */}
          <div className="md:col-span-8 space-y-4">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/60 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Tag ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-sm">{tagId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Scan Destination</span>
                  <a
                    href={tagUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1e6f42] dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    /tag/{tagId} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Privacy Setting Toggle */}
              <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#1e6f42]" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Public Phone Number</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Allow finders to call your phone directly from the scan screen
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showPhoneOnTag}
                  onChange={(e) => {
                    setShowPhoneOnTag(e.target.checked);
                    if (id) {
                      petApi.generateTag(id, { showPhone: e.target.checked }).catch(() => {});
                    }
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-[#1e6f42] focus:ring-[#1e6f42]"
                />
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2.5">
              <a
                href={tagUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
              >
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                View Public Tag Page
              </a>

              <button
                onClick={handleDownloadQr}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
              >
                <Download className="h-3.5 w-3.5 text-[#1e6f42]" />
                Download QR Code
              </button>

              <button
                onClick={handlePrintTag}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                Print Collar Tag
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vaccinations */}
      <div className="card">
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Vaccinations</h2>
        {pet.vaccinations.length === 0 ? (
          <p className="text-sm text-ink/60 dark:text-bone/60">No vaccination records yet.</p>
        ) : (
          <ul className="mb-4 space-y-2">
            {pet.vaccinations.map((v, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg bg-moss-50 px-3 py-2 text-sm dark:bg-moss-700/20 dark:text-bone">
                <span>{v.name}</span>
                {v.dateGiven && <span className="font-mono text-xs text-mist-500">{new Date(v.dateGiven).toLocaleDateString()}</span>}
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Vaccine name (e.g. Rabies)"
            value={vaccineName}
            onChange={(e) => setVaccineName(e.target.value)}
          />
          <button onClick={addVaccination} className="btn-secondary shrink-0">Add</button>
        </div>
      </div>

      {/* Medical Conditions */}
      {pet.medicalConditions.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Medical Conditions</h2>
          <ul className="space-y-2">
            {pet.medicalConditions.map((m, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium">{m.condition}</span>
                {m.notes && <span className="text-ink/60 dark:text-bone/60"> — {m.notes}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PetProfile;
