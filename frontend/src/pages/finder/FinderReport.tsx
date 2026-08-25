import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  MapPin,
  Upload,
  CheckCircle,
  Phone,
  ShieldCheck,
  PawPrint,
  Camera,
  Trash2,
  Image as ImageIcon,
  Plus,
} from 'lucide-react';
import { FinderAnimalType, FinderCondition } from '@/types/finder';

interface UploadedPhoto {
  id: string;
  url: string;
  name: string;
  size: string;
}

export const FinderReport: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [animalType, setAnimalType] = useState<FinderAnimalType>('Dog');
  const [condition, setCondition] = useState<FinderCondition>('Injured');
  const [approxAge, setApproxAge] = useState('Young (1-2 Yrs)');
  const [description, setDescription] = useState('');
  const [locationAddress, setLocationAddress] = useState('Near Wave Mall, Indira Nagar, Lucknow');
  const [reporterName, setReporterName] = useState('Rahul Sharma');
  const [reporterPhone, setReporterPhone] = useState('+91 98765 43210');
  const [submitted, setSubmitted] = useState(false);

  // Real Uploaded Photos state
  const [photos, setPhotos] = useState<UploadedPhoto[]>([
    {
      id: 'default-1',
      url: '/animal-dog.jpg',
      name: 'spot_wound_evidence.jpg',
      size: '1.2 MB',
    },
  ]);
  const [isDragging, setIsDragging] = useState(false);

  // File Upload Handlers
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('Please select valid image files (JPG, PNG, WEBP).');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const sizeStr =
          file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(file.size / 1024)} KB`;

        const newPhoto: UploadedPhoto = {
          id: `photo-${Date.now()}-${Math.random()}`,
          url: dataUrl,
          name: file.name,
          size: sizeStr,
        };

        setPhotos((prev) => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemovePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddSample = (sampleUrl: string, sampleName: string) => {
    const samplePhoto: UploadedPhoto = {
      id: `sample-${Date.now()}`,
      url: sampleUrl,
      name: sampleName,
      size: '850 KB',
    };
    setPhotos((prev) => [...prev, samplePhoto]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !locationAddress) return;

    setSubmitted(true);
    setTimeout(() => {
      navigate('/finder/my-reports');
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Hidden Native File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/finder" className="hover:text-purple-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-purple-800 dark:text-purple-400">Report Found Animal</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          Report a Stray / Injured Animal <PawPrint className="h-6 w-6 text-purple-600" />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Submit details, animal photos, and GPS coordinates to trigger immediate triage & rescue squad dispatch.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-12 text-center space-y-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Emergency Report Registered!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            Thank you for being a voice for the voiceless. You earned <strong>+50 Thank You Points</strong>. Redirecting to your active reports tracker...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Report Form */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Species / Type *</label>
                  <select
                    value={animalType}
                    onChange={(e) => setAnimalType(e.target.value as FinderAnimalType)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold focus:border-purple-600 focus:outline-none"
                  >
                    <option value="Dog">Dog 🐶</option>
                    <option value="Cat">Cat 🐱</option>
                    <option value="Cow">Cow 🐮</option>
                    <option value="Bird">Bird 🐦</option>
                    <option value="Goat">Goat 🐐</option>
                    <option value="Rabbit">Rabbit 🐰</option>
                    <option value="Other">Other Animal</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Condition & Distress *</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as FinderCondition)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold focus:border-purple-600 focus:outline-none"
                  >
                    <option value="Injured">Injured (Bleeding / Fractured)</option>
                    <option value="Trapped">Trapped (In Drain / Well / Manhole)</option>
                    <option value="Sick">Sick / Severe Infection</option>
                    <option value="Abandoned">Abandoned Pet</option>
                    <option value="Stray">Stray in Distress</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Estimated Age</label>
                  <select
                    value={approxAge}
                    onChange={(e) => setApproxAge(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold focus:border-purple-600 focus:outline-none"
                  >
                    <option value="Puppy / Kitten">Puppy / Kitten (&lt; 6M)</option>
                    <option value="Young (1-2 Yrs)">Young (1-2 Yrs)</option>
                    <option value="Adult (3-6 Yrs)">Adult (3-6 Yrs)</option>
                    <option value="Senior (7+ Yrs)">Senior (7+ Yrs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Spot Address & Exact Landmark *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-600" />
                  <input
                    type="text"
                    required
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="e.g. Near Wave Mall, Sector 14, Indira Nagar, Lucknow"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Situation Description & Visible Wounds *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe visible injuries, animal demeanor (frightened, aggressive, friendly), and any immediate first aid provided..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* ─── Real Interactive Photo Upload Dropzone ─── */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-200 block">
                    Upload Animal Photos ({photos.length} Attached)
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    JPG, PNG, WEBP up to 10MB
                  </span>
                </div>

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 ${
                    isDragging
                      ? 'border-purple-600 bg-purple-100/60 dark:bg-purple-950/50 scale-[1.01]'
                      : 'border-purple-200 bg-purple-50/40 hover:bg-purple-50/80 dark:border-purple-900/50 dark:bg-purple-950/20'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-950/20">
                      <Upload className="h-5 w-5" />
                    </div>
                  </div>

                  <div>
                    <p className="font-extrabold text-slate-800 dark:text-white text-xs">
                      Click to Browse Files or Drag & Drop Photos Here
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Clear photos help our rescue squad prepare exact bandages, splints, or sedation.
                    </p>
                  </div>

                  {/* Fast Action Buttons inside Dropzone */}
                  <div className="flex items-center justify-center gap-2 pt-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-purple-700 px-3.5 py-1.5 font-bold text-white hover:bg-purple-800 shadow-sm transition-transform hover:scale-105"
                    >
                      <ImageIcon className="h-3.5 w-3.5" /> Select from Gallery
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-purple-300 bg-white px-3.5 py-1.5 font-bold text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:bg-slate-800 dark:text-purple-300 transition-transform hover:scale-105"
                    >
                      <Camera className="h-3.5 w-3.5" /> Take Photo
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddSample('/animal-cat.jpg', 'kitten_evidence.jpg')}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <Plus className="h-3 w-3" /> + Sample Photo
                    </button>
                  </div>

                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-white dark:bg-slate-800 rounded-full text-purple-700 dark:text-purple-300 font-mono text-[10px] border border-purple-200 dark:border-purple-800">
                      📍 GPS Geo-tagging Active: +26.8797, +80.9992 (Lucknow)
                    </span>
                  </div>
                </div>

                {/* Uploaded Thumbnails Grid */}
                {photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm p-1.5 flex flex-col"
                      >
                        <div className="relative h-24 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <button
                            type="button"
                            onClick={(e) => handleRemovePhoto(photo.id, e)}
                            className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-transform hover:scale-110"
                            title="Remove Photo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="p-1 min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{photo.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{photo.size}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reporter Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Callback Phone *</label>
                  <input
                    type="tel"
                    required
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/finder"
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="rounded-2xl bg-purple-700 px-6 py-2.5 font-bold text-white hover:bg-purple-800 shadow-md shadow-purple-950/20 transition-all hover:scale-105"
                >
                  🚀 Dispatch Emergency Report
                </button>
              </div>
            </form>
          </div>

          {/* Right Sidebar: Rescue Guidelines & Helpline */}
          <div className="space-y-4 text-xs">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h3 className="font-display text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-purple-600" /> Essential Safety Reminders
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• <strong>Do not corner:</strong> An injured animal can bite out of acute fear or pain.</li>
                <li>• <strong>Offer Water:</strong> Keep a shallow water bowl nearby if the animal is conscious.</li>
                <li>• <strong>Stay Visible:</strong> Keep an eye on the animal until the ambulance is within 5 minutes.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-red-100 bg-red-50/60 p-5 shadow-sm dark:border-red-900/40 dark:bg-red-950/30 space-y-2.5">
              <h3 className="font-bold text-red-900 dark:text-red-300 text-sm flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-red-600" /> Need Immediate On-Call Advice?
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                Speak to our central veterinary triage officer right now for on-spot guidance.
              </p>
              <a
                href="tel:1800264625"
                className="inline-flex items-center justify-center gap-1.5 w-full rounded-2xl bg-red-600 py-2.5 font-bold text-white hover:bg-red-700 shadow-md shadow-red-950/20"
              >
                Call 1800-ANIMAL-HELP
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FinderReport;
