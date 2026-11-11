import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { petApi } from '@/features/pets/petApi';
import { petStatusToSignal, petStatusLabel } from '@/features/pets/petStatus';
import SignalIndicator from '@/components/ui/SignalIndicator';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Modal from '@/components/ui/Modal';
import type { Pet } from '@/types';
import {
  QrCode,
  Download,
  Printer,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  FileCode,
  Check,
  AlertTriangle,
  Info,
  Layers,
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

  // ResQTag Privacy & Settings States
  const [generatingTag, setGeneratingTag] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showPhoneOnTag, setShowPhoneOnTag] = useState(false);
  const [enableCall, setEnableCall] = useState(true);
  const [enableWhatsApp, setEnableWhatsApp] = useState(true);
  const [showLocation, setShowLocation] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');

  // Modals
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [regenerateConfirmOpen, setRegenerateConfirmOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await petApi.getById(id);
      setPet(data);
      if (data?.resqTag) {
        setShowPhoneOnTag(!!data.resqTag.showPhone);
        setEnableCall(data.resqTag.enableCall !== false);
        setEnableWhatsApp(data.resqTag.enableWhatsApp !== false);
        setShowLocation(!!data.resqTag.showLocation);
        setCustomInstructions(data.resqTag.customInstructions || '');
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

  // Save / Update Tag Settings without changing permanent tagId
  const handleSaveTagSettings = async () => {
    if (!id) return;
    setSavingSettings(true);
    try {
      const res = await petApi.generateTag(id, {
        showPhone: showPhoneOnTag,
        enableCall,
        enableWhatsApp,
        showLocation,
        customInstructions,
        regenerate: false,
      });
      if (res?.pet) {
        setPet(res.pet);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      alert('Could not update tag settings. Please check your connection.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Regenerate Tag ID (only when explicitly requested)
  const handleRegenerateTag = async () => {
    if (!id) return;
    setGeneratingTag(true);
    try {
      const res = await petApi.generateTag(id, {
        showPhone: showPhoneOnTag,
        enableCall,
        enableWhatsApp,
        showLocation,
        customInstructions,
        regenerate: true,
      });
      if (res?.pet) {
        setPet(res.pet);
      }
      setRegenerateConfirmOpen(false);
      alert('New unique QR tag generated successfully. Remember to re-print your collar tag.');
    } catch {
      alert('Could not regenerate QR Tag. Please check your connection.');
    } finally {
      setGeneratingTag(false);
    }
  };

  const tagId = pet.tagId || pet.petId;
  const tagUrl = `${window.location.origin}/pet/scan/${tagId}`;
  const qrImagePng = pet.qrCode || '';

  // Download QR Code PNG (600x600 High Resolution)
  const handleDownloadPng = () => {
    if (!qrImagePng) return;
    const link = document.createElement('a');
    link.href = qrImagePng;
    link.download = `${pet.name.replace(/\s+/g, '_')}_ResQPet_Tag_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download QR Code Vector SVG
  const handleDownloadSvg = () => {
    if (!pet.qrCodeSvg) {
      // Fallback: create basic SVG if backend has not yet saved svg string
      handleDownloadPng();
      return;
    }
    const blob = new Blob([pet.qrCodeSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pet.name.replace(/\s+/g, '_')}_ResQPet_Tag_Vector.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Trigger Print Dialog
  const handlePrint = () => {
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
      {/* SMART PET QR IDENTIFICATION & RECOVERY SUITE            */}
      {/* ======================================================== */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 overflow-hidden space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#1e6f42] to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/20">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Collar QR Identification & Recovery
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="h-3.5 w-3.5" /> Permanent QR
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Attach this QR code to {pet.name}'s 3D-printed collar. Anyone scanning with Google Lens or camera is redirected to {pet.name}'s recovery profile.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setRegenerateConfirmOpen(true)}
              disabled={generatingTag}
              title="Regenerate unique QR tag ID (only needed if old tag is lost or compromised)"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate Tag
            </button>
          </div>
        </div>

        {/* Permanent Guarantee Notice */}
        <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-[#1e6f42] shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
            <strong>Permanent QR Code Guarantee:</strong> This QR code encodes a permanent ResQPet redirect URL. If you update your phone number, home address, or pet details in the future, the physical collar tag will continue working without reprinting.
          </div>
        </div>

        {/* Main Grid: QR Tag Preview & Download Options */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: 3D Collar Tag Preview Card */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-[270px] bg-slate-900 text-white p-5 rounded-3xl border-2 border-emerald-500/40 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-[#1e6f42]" />

              {/* Collar Mount Strap Notch Indicator */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-2">
                <Layers className="h-3.5 w-3.5" />
                <span>3D Collar Insert Layout</span>
              </div>

              {/* High-Contrast QR */}
              <div className="bg-white p-3 rounded-2xl shadow-inner border border-slate-700">
                {qrImagePng ? (
                  <img
                    src={qrImagePng}
                    alt={`${pet.name} Collar QR`}
                    className="h-44 w-44 object-contain"
                  />
                ) : (
                  <div className="h-44 w-44 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-0.5">
                <p className="font-black text-base tracking-wide text-white">{pet.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">TAG ID: {tagId}</p>
                <p className="text-[10px] text-emerald-400 font-semibold pt-1">
                  Scan with Camera or Google Lens
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions, Formats & Live Link */}
          <div className="md:col-span-7 space-y-4">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/70 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Public Scan Destination URL
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  No App Required
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={tagUrl}
                  className="flex-1 font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 select-all"
                />
                <a
                  href={tagUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#1e6f42] hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                  title="Test public scan page in new tab"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Test Scan
                </a>
              </div>
            </div>

            {/* Download Formats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* PNG Download */}
              <button
                onClick={handleDownloadPng}
                disabled={!qrImagePng}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition text-slate-800 dark:text-slate-100 disabled:opacity-50"
              >
                <Download className="h-4 w-4 text-[#1e6f42]" />
                <div className="text-left">
                  <div className="text-xs font-bold">Download PNG</div>
                  <div className="text-[10px] text-slate-400">High-Res 600px</div>
                </div>
              </button>

              {/* SVG Download */}
              <button
                onClick={handleDownloadSvg}
                disabled={!pet.qrCodeSvg}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition text-slate-800 dark:text-slate-100 disabled:opacity-50"
              >
                <FileCode className="h-4 w-4 text-purple-600" />
                <div className="text-left">
                  <div className="text-xs font-bold">Download SVG</div>
                  <div className="text-[10px] text-slate-400">Vector for 3D/Laser</div>
                </div>
              </button>

              {/* Print Layout */}
              <button
                onClick={() => setPrintModalOpen(true)}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition text-slate-800 dark:text-slate-100"
              >
                <Printer className="h-4 w-4 text-blue-600" />
                <div className="text-left">
                  <div className="text-xs font-bold">Print Collar Tag</div>
                  <div className="text-[10px] text-slate-400">Ready Template</div>
                </div>
              </button>
            </div>

            {/* Privacy & Finder Settings Box */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>Finder Contact & Privacy Settings</span>
                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Saved
                  </span>
                )}
              </h4>

              <div className="space-y-3 text-xs">
                {/* Setting 1: Visible Phone Number vs Button-Only */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPhoneOnTag}
                    onChange={(e) => setShowPhoneOnTag(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1e6f42] focus:ring-[#1e6f42]"
                  />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Display phone number visibly on scan page
                    </span>
                    <span className="text-[11px] text-slate-500">
                      When off, finders can still click "Call Owner" or "WhatsApp Owner" without your raw phone digits printed on the page.
                    </span>
                  </div>
                </label>

                {/* Setting 2: Direct Phone Call */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableCall}
                    onChange={(e) => setEnableCall(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1e6f42] focus:ring-[#1e6f42]"
                  />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Enable "Call Owner" button
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Allows finders to directly initiate a phone call with your verified account number.
                    </span>
                  </div>
                </label>

                {/* Setting 3: WhatsApp Button */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableWhatsApp}
                    onChange={(e) => setEnableWhatsApp(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1e6f42] focus:ring-[#1e6f42]"
                  />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Enable "WhatsApp Owner" button
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Opens an instant WhatsApp chat with pre-filled message containing pet and tag info.
                    </span>
                  </div>
                </label>

                {/* Setting 4: Share Last Known Location */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLocation}
                    onChange={(e) => setShowLocation(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1e6f42] focus:ring-[#1e6f42]"
                  />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Share last known location on public scan page
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Provides last registered GPS coordinates to help finders verify they are in the right vicinity.
                    </span>
                  </div>
                </label>

                {/* Custom Instructions Input */}
                <div className="pt-2">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Special Finder Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g. Friendly with people. Diabetic - requires medication twice daily. If found, please give water."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e6f42]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveTagSettings}
                  disabled={savingSettings}
                  className="px-5 py-2 rounded-xl bg-[#1e6f42] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {savingSettings ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Saved!
                    </>
                  ) : (
                    'Save Tag Privacy Preferences'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: PRINT-READY COLLAR TAG TEMPLATE                   */}
      {/* ======================================================== */}
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        title="Print-Ready 3D Collar Tag Layout"
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-500">
            Print this high-contrast template to insert inside your 3D-printed collar enclosure or laminate as a waterproof tag.
          </p>

          {/* Printable Layout Container */}
          <div className="flex justify-center p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl">
            <div
              ref={printRef}
              className="bg-white text-black p-5 rounded-2xl border-2 border-black w-64 text-center shadow-lg print:border-black print:m-0"
            >
              {/* Top Branding */}
              <div className="border-b border-black pb-2 mb-3">
                <div className="font-black text-sm tracking-wider uppercase">ResQPet Collar Tag</div>
                <div className="text-[10px] text-slate-600">Smart Rescue Ecosystem</div>
              </div>

              {/* High-Contrast QR Code */}
              <div className="flex justify-center py-1">
                {qrImagePng ? (
                  <img
                    src={qrImagePng}
                    alt={`${pet.name} QR Tag`}
                    className="h-44 w-44 object-contain"
                  />
                ) : null}
              </div>

              {/* Tag Information */}
              <div className="mt-3 border-t border-black pt-2 space-y-0.5">
                <p className="font-black text-base uppercase">{pet.name}</p>
                <p className="font-mono text-xs font-bold">TAG: {tagId}</p>
                <p className="text-[10px] font-semibold text-slate-700 pt-1">
                  Scan with Camera or Google Lens to contact owner
                </p>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">resqpet.app</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <p><strong>3D Printing Guidelines:</strong></p>
            <p>• Recommended insert pocket size: 32mm × 32mm × 2mm depth.</p>
            <p>• Laser etching: Use the downloaded SVG vector file for crisp engraving.</p>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              onClick={() => setPrintModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-[#1e6f42] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Printer className="h-4 w-4" />
              Print Template Now
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: REGENERATE QR TAG CONFIRMATION                    */}
      {/* ======================================================== */}
      <Modal
        isOpen={regenerateConfirmOpen}
        onClose={() => setRegenerateConfirmOpen(false)}
        title="Regenerate Collar QR Tag?"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Important Physical Tag Notice
            </div>
            <p>
              Regenerating your QR Tag creates a brand-new unique Tag ID. <strong>Any physical collar tag already printed or 3D-etched will stop working</strong> and must be replaced with the new code.
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              You do NOT need to regenerate the tag when updating phone numbers or medical details—those update automatically on your existing tag.
            </p>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              onClick={() => setRegenerateConfirmOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleRegenerateTag}
              disabled={generatingTag}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {generatingTag ? 'Generating...' : 'Yes, Generate New QR Tag'}
            </button>
          </div>
        </div>
      </Modal>

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
