import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  PawPrint,
  ShieldCheck,
  Heart,
  Award,
  MapPin,
  PlusCircle,
  Megaphone,
  Phone,
  Eye,
  CheckCircle,
  ArrowRight,
  Upload,
  Sparkles,
  Camera,
  Trash2,
  Image as ImageIcon,
  Plus,
} from 'lucide-react';
import {
  INITIAL_FINDER_REPORTS,
  FINDER_REWARD_INFO,
} from '@/data/finderMockData';
import { FinderReport, FinderAnimalType, FinderCondition, FinderPriority } from '@/types/finder';

export const FinderOverview: React.FC = () => {
  const navigate = useNavigate();
  const wizardFileInputRef = useRef<HTMLInputElement>(null);
  const wizardCameraInputRef = useRef<HTMLInputElement>(null);

  const [reports, setReports] = useState<FinderReport[]>(INITIAL_FINDER_REPORTS);
  const [selectedReport, setSelectedReport] = useState<FinderReport | null>(null);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedMapPin, setSelectedMapPin] = useState<FinderReport | null>(INITIAL_FINDER_REPORTS[0]);

  // Multi-step Inline Report Form State
  const [formStep, setFormStep] = useState<1 | 2 | 3 | 4>(1);
  const [animalType, setAnimalType] = useState<FinderAnimalType>('Dog');
  const [condition, setCondition] = useState<FinderCondition>('Injured');
  const [approxAge, setApproxAge] = useState('Young');
  const [description, setDescription] = useState('');
  const [locationAddress, setLocationAddress] = useState('Indira Nagar, Sector 14, Lucknow');
  const [locationCity] = useState('Lucknow');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Photo Upload State in Wizard
  const [wizardPhotos, setWizardPhotos] = useState<Array<{ id: string; url: string; name: string; size: string }>>([
    { id: 'wz-1', url: '/animal-dog.jpg', name: 'spot_evidence.jpg', size: '1.2 MB' },
  ]);
  const [isDraggingWizard, setIsDraggingWizard] = useState(false);

  const handleWizardFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const sizeStr = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;
        setWizardPhotos((prev) => [
          ...prev,
          { id: `wz-${Date.now()}-${Math.random()}`, url: e.target?.result as string, name: file.name, size: sizeStr },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Quick stats
  const stats = {
    reportsSubmitted: reports.length + 8,
    animalsRescued: 8,
    verificationsDone: 10,
    animalsInCare: 15,
    thankYouPoints: FINDER_REWARD_INFO.currentPoints,
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep === 1) {
      setFormStep(2);
    } else if (formStep === 2) {
      setFormStep(3);
    } else if (formStep === 3) {
      setFormStep(4);
    } else {
      // Submit Report
      const newReport: FinderReport = {
        id: `FND-${Date.now()}`,
        reportCode: `REP-2026-0${Math.floor(800 + Math.random() * 200)}`,
        title: `${condition} ${animalType} in ${locationAddress.split(',')[0]}`,
        animalType,
        condition,
        priority: condition === 'Injured' || condition === 'Trapped' ? 'High Priority' : 'Medium Priority',
        status: 'Under Review',
        location: {
          address: locationAddress,
          city: locationCity,
          lat: 26.8600 + (Math.random() - 0.5) * 0.04,
          lng: 80.9800 + (Math.random() - 0.5) * 0.04,
        },
        approxAge,
        description: description || `Reported ${animalType} needing rescue assistance.`,
        image: animalType === 'Dog' ? '/animal-dog.jpg' : animalType === 'Cat' ? '/animal-cat.jpg' : animalType === 'Cow' ? '/animal-cow.jpg' : '/bird.jpg',
        reportedAt: 'Just now',
        reportedTimeAgo: 'Just now',
        reporter: {
          name: 'Rahul Sharma',
          phone: '+91 98765 43210',
          email: 'rahul.finder@resqpet.org',
        },
        timeline: [
          { step: 'Report Submitted', description: 'Finder submitted details and location', time: 'Just now', completed: true },
          { step: 'Verification', description: 'Triage team reviewing severity', completed: false, active: true },
          { step: 'Rescue Assigned', description: 'Dispatching rescue squad', completed: false },
          { step: 'Rescue & Treatment', description: 'Clinical first aid', completed: false },
          { step: 'Rehabilitation', description: 'Shelter care', completed: false },
          { step: 'New Life', description: 'Foster / release', completed: false },
        ],
      };

      setReports((prev) => [newReport, ...prev]);
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setFormStep(1);
        setDescription('');
      }, 2500);
    }
  };

  const getPriorityBadgeClass = (p: FinderPriority) => {
    switch (p) {
      case 'High Priority':
        return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60';
      case 'Medium Priority':
        return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60';
      case 'Low Priority':
        return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case 'Under Review':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
      case 'Verified':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'Assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'Rescued':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ─── Top 5 KPI Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Reports Submitted */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Reports Submitted</span>
            <h3 className="font-display text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.reportsSubmitted}
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              ↗ 20% <span className="text-slate-400 font-normal">from last month</span>
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 shrink-0">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Animals Rescued */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Animals Rescued</span>
            <h3 className="font-display text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.animalsRescued}
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              ↗ 18% <span className="text-slate-400 font-normal">from last month</span>
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 shrink-0">
            <PawPrint className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Verifications Done */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Verifications Done</span>
            <h3 className="font-display text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.verificationsDone}
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              ↗ 25% <span className="text-slate-400 font-normal">from last month</span>
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Animals in Care */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Animals in Care</span>
            <h3 className="font-display text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.animalsInCare}
            </h3>
            <span className="text-[11px] font-bold text-pink-600 dark:text-pink-400 mt-1 block">
              This Month
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400 shrink-0">
            <Heart className="h-6 w-6 fill-current" />
          </div>
        </div>

        {/* Card 5: Thank You Points */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Thank You Points</span>
            <h3 className="font-display text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.thankYouPoints}
            </h3>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1 block">
              Keep helping!
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shrink-0">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ─── Row 1: Recent Reports (Col 1) | Reported Animal Locations Map (Col 2) | Quick Actions (Col 3) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Recent Reports (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 dark:border-slate-800">
              <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
                Recent Reports
              </h3>
              <Link
                to="/finder/my-reports"
                className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline"
              >
                View All
              </Link>
            </div>

            {/* List */}
            <div className="space-y-3">
              {reports.slice(0, 4).map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="group flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={report.image}
                      alt={report.title}
                      className="h-11 w-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 truncate">
                        {report.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{report.location.address}</span>
                      </p>
                      <div className="mt-1">
                        <span className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold border ${getPriorityBadgeClass(report.priority)}`}>
                          {report.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className={`inline-block rounded-xl px-2.5 py-0.5 text-[10px] font-bold border ${getStatusBadgeClass(report.status)}`}>
                      {report.status}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1">
                      {report.reportedTimeAgo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/finder/my-reports"
              className="flex items-center justify-center gap-1.5 w-full rounded-2xl bg-purple-50 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 transition-colors"
            >
              View All Reports <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Column 2: Reported Animal Locations (Interactive SVG Map) (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 dark:border-slate-800">
              <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
                Reported Animal Locations
              </h3>
              <button
                onClick={() => navigate('/finder/my-reports')}
                className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline"
              >
                View Full Map
              </button>
            </div>

            {/* Custom Interactive Map Canvas */}
            <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-[#eef2f6] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              {/* City Road Network SVG Representation */}
              <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 500 300">
                <rect width="500" height="300" fill="transparent" />
                {/* River Gomti */}
                <path d="M 0 160 Q 150 140, 250 180 T 500 130" fill="none" stroke="#93c5fd" strokeWidth="18" strokeLinecap="round" />
                {/* Arterial Highways */}
                <line x1="50" y1="20" x2="450" y2="280" stroke="#cbd5e1" strokeWidth="6" />
                <line x1="20" y1="200" x2="480" y2="80" stroke="#cbd5e1" strokeWidth="5" />
                <line x1="250" y1="10" x2="250" y2="290" stroke="#cbd5e1" strokeWidth="4" />
                <circle cx="250" cy="150" r="45" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                {/* Landmarks text */}
                <text x="220" y="70" fill="#64748b" fontSize="16" fontWeight="bold" fontFamily="sans-serif">Lucknow</text>
                <text x="225" y="90" fill="#94a3b8" fontSize="12" fontFamily="sans-serif">लखनऊ</text>
                <text x="310" y="160" fill="#94a3b8" fontSize="11" fontWeight="bold" fontFamily="sans-serif">GOMTI NAGAR</text>
                <text x="180" y="240" fill="#94a3b8" fontSize="11" fontWeight="bold" fontFamily="sans-serif">HAZRATGANJ</text>
                <text x="185" y="255" fill="#cbd5e1" fontSize="10" fontFamily="sans-serif">हज़रतगंज</text>
              </svg>

              {/* Interactive Color Coded Pins */}
              {/* Pin 1: High Priority (Indira Nagar - Red) */}
              <button
                onClick={() => setSelectedMapPin(reports[0])}
                className="absolute top-16 left-36 group focus:outline-none transition-transform hover:scale-125"
                title="Injured Dog • High Priority"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/40 animate-bounce">
                  <PawPrint className="h-4 w-4" />
                </div>
              </button>

              {/* Pin 2: Medium Priority (Gomti Nagar - Orange) */}
              <button
                onClick={() => setSelectedMapPin(reports[1])}
                className="absolute top-24 right-28 group focus:outline-none transition-transform hover:scale-125"
                title="Kitten Trapped • Medium Priority"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/40">
                  <MapPin className="h-4 w-4" />
                </div>
              </button>

              {/* Pin 3: Verified / Assigned (Faizabad Road - Green) */}
              <button
                onClick={() => setSelectedMapPin(reports[2])}
                className="absolute bottom-28 left-48 group focus:outline-none transition-transform hover:scale-125"
                title="Injured Cow • Assigned"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/40">
                  <PawPrint className="h-4 w-4" />
                </div>
              </button>

              {/* Pin 4: Low Priority / Rescued (Hazratganj - Blue) */}
              <button
                onClick={() => setSelectedMapPin(reports[3])}
                className="absolute bottom-14 left-64 group focus:outline-none transition-transform hover:scale-125"
                title="Bird with Broken Wing • Rescued"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/40">
                  <MapPin className="h-4 w-4" />
                </div>
              </button>

              {/* Selected Pin Mini Popup card */}
              {selectedMapPin && (
                <div
                  onClick={() => setSelectedReport(selectedMapPin)}
                  className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 shadow-lg flex items-center justify-between cursor-pointer animate-fade-in"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={selectedMapPin.image}
                      alt={selectedMapPin.title}
                      className="h-8 w-8 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {selectedMapPin.title}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        📍 {selectedMapPin.location.address}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 shrink-0">
                    Details ➔
                  </span>
                </div>
              )}
            </div>

            {/* Map Legend */}
            <div className="mt-3 flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600" /> High Priority
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Medium Priority
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Low Priority
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Rescued
              </span>
            </div>
          </div>
        </div>

        {/* Column 3: Quick Actions, Helpline & Finder Level (3 cols) */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
          {/* Quick Actions (2x2 Grid) */}
          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2.5">
            <span className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
              Quick Actions
            </span>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              {/* Action 1: Report Found Animal */}
              <Link
                to="/finder/report"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-50/70 border border-purple-100 hover:bg-purple-100/80 dark:bg-purple-950/30 dark:border-purple-900/40 text-purple-900 dark:text-purple-300 font-bold transition-transform hover:scale-105"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white mb-1.5 shadow-sm">
                  <PlusCircle className="h-4 w-4" />
                </div>
                <span className="text-[11px]">Report Found Animal</span>
              </Link>

              {/* Action 2: View My Reports */}
              <Link
                to="/finder/my-reports"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50/70 border border-blue-100 hover:bg-blue-100/80 dark:bg-blue-950/30 dark:border-blue-900/40 text-blue-900 dark:text-blue-300 font-bold transition-transform hover:scale-105"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white mb-1.5 shadow-sm">
                  <PawPrint className="h-4 w-4" />
                </div>
                <span className="text-[11px]">View My Reports</span>
              </Link>

              {/* Action 3: Awareness Post */}
              <Link
                to="/finder/awareness"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300 font-bold transition-transform hover:scale-105"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white mb-1.5 shadow-sm">
                  <Megaphone className="h-4 w-4" />
                </div>
                <span className="text-[11px]">Awareness Post</span>
              </Link>

              {/* Action 4: Donate Now */}
              <button
                onClick={() => setShowDonateModal(true)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-pink-50/70 border border-pink-100 hover:bg-pink-100/80 dark:bg-pink-950/30 dark:border-pink-900/40 text-pink-900 dark:text-pink-300 font-bold transition-transform hover:scale-105"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-600 text-white mb-1.5 shadow-sm">
                  <Heart className="h-4 w-4 fill-current" />
                </div>
                <span className="text-[11px]">Donate Now</span>
              </button>
            </div>
          </div>

          {/* Emergency Helpline Box */}
          <div className="rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-rose-50/40 p-4 dark:border-red-900/40 dark:from-red-950/30 dark:to-slate-900 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">24/7 Rescue Helpline</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">For any urgent help or animal in danger.</p>
              </div>
            </div>

            <a
              href="tel:1800264625"
              onClick={(e) => {
                e.preventDefault();
                setShowCallModal(true);
              }}
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-red-600 py-2.5 text-xs font-black text-white hover:bg-red-700 shadow-md shadow-red-950/20 transition-all hover:scale-105"
            >
              <Phone className="h-3.5 w-3.5 fill-current" /> 1800-ANIMAL-HELP
            </a>
          </div>

          {/* Finder Level Points Card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
            <span className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
              Finder Level
            </span>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 shrink-0">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">{FINDER_REWARD_INFO.title}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">You are making a real better world for animals.</p>
              </div>
            </div>

            <div className="pt-2">
              <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-600 transition-all duration-500"
                  style={{ width: `${(FINDER_REWARD_INFO.currentPoints / FINDER_REWARD_INFO.targetPoints) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mt-1">
                <span>{FINDER_REWARD_INFO.currentPoints} / {FINDER_REWARD_INFO.targetPoints} Points</span>
                <span className="text-purple-600 dark:text-purple-400">Silver Tier</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Row 2: Report Found Animal Multi-step Interactive Form ─── */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="font-display text-lg font-black text-slate-900 dark:text-white">
              Report Found Animal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Help animals by reporting them quickly and accurately.
            </p>
          </div>

          <button
            onClick={() => setShowGuidelinesModal(true)}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-purple-200 bg-purple-50/60 px-3.5 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" /> View Guidelines
          </button>
        </div>

        {/* Form Stepper */}
        <div className="flex items-center justify-center gap-2 sm:gap-6 text-xs font-bold flex-wrap">
          <div className={`flex items-center gap-2 ${formStep >= 1 ? 'text-purple-700 dark:text-purple-400' : 'text-slate-400'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs text-white ${formStep >= 1 ? 'bg-purple-700' : 'bg-slate-300'}`}>
              1
            </span>
            <span>Animal Details</span>
          </div>
          <span className="text-slate-300">→</span>

          <div className={`flex items-center gap-2 ${formStep >= 2 ? 'text-purple-700 dark:text-purple-400' : 'text-slate-400'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs text-white ${formStep >= 2 ? 'bg-purple-700' : 'bg-slate-300'}`}>
              2
            </span>
            <span>Location</span>
          </div>
          <span className="text-slate-300">→</span>

          <div className={`flex items-center gap-2 ${formStep >= 3 ? 'text-purple-700 dark:text-purple-400' : 'text-slate-400'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs text-white ${formStep >= 3 ? 'bg-purple-700' : 'bg-slate-300'}`}>
              3
            </span>
            <span>Photos</span>
          </div>
          <span className="text-slate-300">→</span>

          <div className={`flex items-center gap-2 ${formStep >= 4 ? 'text-purple-700 dark:text-purple-400' : 'text-slate-400'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs text-white ${formStep >= 4 ? 'bg-purple-700' : 'bg-slate-300'}`}>
              4
            </span>
            <span>Review & Submit</span>
          </div>
        </div>

        {/* Step Forms */}
        {formSubmitted ? (
          <div className="p-8 text-center space-y-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/40">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">Report Successfully Submitted!</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our central rescue triage squad has been notified. You can track live dispatch status in <strong>My Reports</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleNextStep} className="space-y-4">
            {/* Step 1: Animal Details */}
            {formStep === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Animal Type</label>
                  <select
                    value={animalType}
                    onChange={(e) => setAnimalType(e.target.value as FinderAnimalType)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-purple-600 font-semibold"
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
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Animal Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as FinderCondition)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-purple-600 font-semibold"
                  >
                    <option value="Injured">Injured (Needs First Aid)</option>
                    <option value="Trapped">Trapped (In Drain / Pit)</option>
                    <option value="Sick">Sick / Lethargic</option>
                    <option value="Abandoned">Abandoned Pet</option>
                    <option value="Stray">Stray in Distress</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Approx. Age</label>
                  <select
                    value={approxAge}
                    onChange={(e) => setApproxAge(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-purple-600 font-semibold"
                  >
                    <option value="Puppy / Kitten">Puppy / Kitten (&lt; 6M)</option>
                    <option value="Young">Young (1-2 Yrs)</option>
                    <option value="Adult">Adult (3-6 Yrs)</option>
                    <option value="Senior">Senior (7+ Yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Add any details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {formStep === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Spot Location / Landmark *</label>
                  <input
                    type="text"
                    required
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="e.g. Near Wave Mall, Sector 14, Indira Nagar"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">City / Region</label>
                  <input
                    type="text"
                    disabled
                    value="Lucknow, Uttar Pradesh"
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Photos */}
            {formStep === 3 && (
              <div className="space-y-3">
                <input
                  ref={wizardFileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    handleWizardFiles(e.target.files);
                    if (e.target) e.target.value = '';
                  }}
                  className="hidden"
                />
                <input
                  ref={wizardCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    handleWizardFiles(e.target.files);
                    if (e.target) e.target.value = '';
                  }}
                  className="hidden"
                />

                <div
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingWizard(false);
                    handleWizardFiles(e.dataTransfer.files);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingWizard(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingWizard(false);
                  }}
                  onClick={() => wizardFileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center text-xs space-y-2.5 ${
                    isDraggingWizard
                      ? 'border-purple-600 bg-purple-100/60 dark:bg-purple-950/50 scale-[1.01]'
                      : 'border-purple-200 bg-purple-50/40 hover:bg-purple-50/80 dark:border-purple-900/50 dark:bg-purple-950/20'
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600 text-white mx-auto shadow-md">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-800 dark:text-white">
                      Click to Browse Files or Drag & Drop Photos Here
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Clear photos help the rescue team bring the exact required medical equipment.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => wizardFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-purple-700 px-3.5 py-1.5 font-bold text-white hover:bg-purple-800 shadow-sm"
                    >
                      <ImageIcon className="h-3.5 w-3.5" /> Select Files
                    </button>
                    <button
                      type="button"
                      onClick={() => wizardCameraInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-purple-300 bg-white px-3.5 py-1.5 font-bold text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:bg-slate-800 dark:text-purple-300"
                    >
                      <Camera className="h-3.5 w-3.5" /> Take Photo
                    </button>
                  </div>
                </div>

                {/* Uploaded Thumbnails */}
                {wizardPhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {wizardPhotos.map((p) => (
                      <div
                        key={p.id}
                        className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-1.5 flex flex-col"
                      >
                        <div className="relative h-20 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setWizardPhotos((prev) => prev.filter((item) => item.id !== p.id))}
                            className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                            title="Remove"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-[10px] font-bold text-slate-800 dark:text-white truncate mt-1 px-0.5">{p.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {formStep === 4 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Animal</span>
                  <p className="font-bold text-slate-900 dark:text-white">{animalType} ({approxAge})</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Condition</span>
                  <p className="font-bold text-red-600">{condition}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Location</span>
                  <p className="font-bold text-slate-900 dark:text-white truncate">{locationAddress}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Reporter</span>
                  <p className="font-bold text-purple-700 dark:text-purple-400">Rahul Sharma (You)</p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-2">
              {formStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setFormStep((s) => (s - 1) as any)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  ← Back
                </button>
              ) : <span />}

              <button
                type="submit"
                className="rounded-2xl bg-purple-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-purple-800 shadow-md shadow-purple-950/20 transition-all hover:scale-105"
              >
                {formStep === 1 && 'Next: Add Location →'}
                {formStep === 2 && 'Next: Add Photos →'}
                {formStep === 3 && 'Next: Review Details →'}
                {formStep === 4 && '🚀 Submit Found Animal Report'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ─── Row 3: How Your Report Helps (Workflow Chain) ─── */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
          How Your Report Helps (Workflow)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
          {/* Step 1 */}
          <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white mx-auto shadow-sm">
              <FileText className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">Report Submitted</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">You submit details of the animal</p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white mx-auto shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">Verification</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Our team verifies your report</p>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 space-y-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white mx-auto shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">Rescue Assigned</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Nearest team is assigned</p>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white mx-auto shadow-sm">
              <PawPrint className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">Rescue & Treatment</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Animal is rescued and given care</p>
          </div>

          {/* Step 5 */}
          <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 space-y-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-600 text-white mx-auto shadow-sm">
              <Heart className="h-4 w-4 fill-current" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">Rehabilitation</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Animal recovers in safe shelter</p>
          </div>

          {/* Step 6 */}
          <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-700 text-white mx-auto shadow-sm">
              <CheckCircle className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">New Life</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Animal gets a new chance at life</p>
          </div>
        </div>
      </div>

      {/* ─── Modal 1: Report Details & Timeline ─── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400">
                  {selectedReport.reportCode}
                </span>
                <span className={`rounded-xl px-2.5 py-0.5 text-[10px] font-bold border ${getStatusBadgeClass(selectedReport.status)}`}>
                  {selectedReport.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl dark:bg-slate-800/40">
              <img
                src={selectedReport.image}
                alt={selectedReport.title}
                className="h-16 w-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedReport.title}</h4>
                <p className="text-slate-400 mt-0.5">
                  {selectedReport.animalType} • {selectedReport.approxAge} • {selectedReport.condition}
                </p>
                <p className="text-slate-600 dark:text-slate-300 mt-1 font-semibold flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-purple-600" /> {selectedReport.location.address}
                </p>
              </div>
            </div>

            <div>
              <strong className="block text-slate-700 dark:text-slate-200 mb-1">Description:</strong>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 p-3 rounded-xl dark:bg-slate-800/40">
                {selectedReport.description}
              </p>
            </div>

            {/* Live Rescue Progress Timeline */}
            <div>
              <strong className="block text-slate-700 dark:text-slate-200 mb-2">Live Rescue Dispatch Progress:</strong>
              <div className="space-y-2">
                {selectedReport.timeline.map((st, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <div className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] text-white shrink-0 ${st.completed ? 'bg-emerald-500 font-bold' : st.active ? 'bg-purple-600 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}>
                      {st.completed ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${st.completed ? 'text-slate-800 dark:text-white' : st.active ? 'text-purple-700 dark:text-purple-400 font-black' : 'text-slate-400'}`}>
                          {st.step}
                        </span>
                        {st.time && <span className="text-[10px] text-slate-400">{st.time}</span>}
                      </div>
                      <p className="text-[11px] text-slate-500">{st.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Guidelines Modal ─── */}
      {showGuidelinesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Animal Distress Reporting Guidelines</h3>
              <button onClick={() => setShowGuidelinesModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="space-y-2 text-slate-600 dark:text-slate-300">
              <p>• <strong>Safety First:</strong> Do not put yourself in danger when approaching agitated or severely injured stray animals.</p>
              <p>• <strong>Accurate Landmarks:</strong> Provide nearby shop names, metro pillars, or street intersections for faster ambulance reach.</p>
              <p>• <strong>Take Clear Photos:</strong> A photo of the wound or trap lets the vet bring suitable bandages, splints, or sedatives.</p>
              <p>• <strong>Keep Water Accessible:</strong> If safe, place clean drinking water nearby while waiting for the dispatch team.</p>
            </div>
            <div className="flex justify-end pt-2 border-t dark:border-slate-800">
              <button
                onClick={() => setShowGuidelinesModal(false)}
                className="px-4 py-2 rounded-xl bg-purple-700 text-white font-bold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 3: Fast Donation Modal ─── */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 space-y-4 text-xs text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-100 text-pink-600 mx-auto">
              <Heart className="h-7 w-7 fill-current" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Support Stray Animal Rescue Missions</h3>
            <p className="text-slate-500">Every ₹100 funds emergency antiseptic dressing, pain relief, and nutrient feed for injured street animals.</p>
            <div className="grid grid-cols-3 gap-2">
              <button className="p-3 rounded-xl border border-pink-200 bg-pink-50 text-pink-900 font-black hover:bg-pink-100">₹250</button>
              <button className="p-3 rounded-xl border border-pink-200 bg-pink-50 text-pink-900 font-black hover:bg-pink-100">₹500</button>
              <button className="p-3 rounded-xl border border-pink-200 bg-pink-50 text-pink-900 font-black hover:bg-pink-100">₹1,000</button>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800">
              <button onClick={() => setShowDonateModal(false)} className="px-4 py-2 rounded-xl border text-slate-600">Cancel</button>
              <button onClick={() => setShowDonateModal(false)} className="px-5 py-2 rounded-xl bg-pink-600 text-white font-bold">Proceed with UPI / Card</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 4: Call Rescue Team Modal ─── */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-red-200 p-6 space-y-4 text-xs text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto animate-pulse">
              <Phone className="h-7 w-7 fill-current" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">24/7 Animal Distress Hotline</h3>
            <p className="text-slate-500">Connecting directly to Lucknow Central Rescue Dispatch Control Room...</p>
            <p className="font-mono text-xl font-black text-red-600">1800-264-625</p>
            <div className="flex justify-center gap-2 pt-2">
              <button onClick={() => setShowCallModal(false)} className="px-4 py-2 rounded-xl border text-slate-600">Close</button>
              <a href="tel:1800264625" className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold">Dial Now</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FinderOverview;
