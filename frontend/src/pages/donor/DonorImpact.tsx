import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  TrendingUp,
  PawPrint,
  Heart,
  Sparkles,
  Building,
} from 'lucide-react';
import { DONOR_IMPACT_DATA } from '@/data/donorMockData';

export const DonorImpact: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 font-sans text-xs">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/donor" className="hover:text-purple-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-purple-800 dark:text-purple-400">Impact & Reports</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          Your Direct Rescue Impact <TrendingUp className="h-6 w-6 text-purple-600" />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          See the tangible lives transformed by your kindness across Lucknow animal shelters and rescue squads.
        </p>
      </div>

      {/* 4 Large Impact Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
            <PawPrint className="h-6 w-6" />
          </div>
          <h2 className="font-display text-3xl font-black text-slate-900 dark:text-white">
            {DONOR_IMPACT_DATA.animalsRescued} Animals
          </h2>
          <p className="font-bold text-slate-700 dark:text-slate-200">Rescued from Fatal Situations</p>
          <span className="text-[10px] text-slate-400">Directly funded through emergency dispatches</span>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-display text-3xl font-black text-slate-900 dark:text-white">
            {DONOR_IMPACT_DATA.medicalTreatments} Surgeries
          </h2>
          <p className="font-bold text-slate-700 dark:text-slate-200">Surgeries & Medical Wards</p>
          <span className="text-[10px] text-slate-400">Antibiotics, splints, and trauma treatments</span>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50">
            <Building className="h-6 w-6" />
          </div>
          <h2 className="font-display text-3xl font-black text-slate-900 dark:text-white">
            {DONOR_IMPACT_DATA.shelterDays} Safe Days
          </h2>
          <p className="font-bold text-slate-700 dark:text-slate-200">Nourishment & Safe Housing</p>
          <span className="text-[10px] text-slate-400">Warm sanitized kennels with daily meals</span>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 dark:bg-pink-950/50">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <h2 className="font-display text-3xl font-black text-slate-900 dark:text-white">
            {DONOR_IMPACT_DATA.volunteersEquipped} Responders
          </h2>
          <p className="font-bold text-slate-700 dark:text-slate-200">Equipped with First Aid Kits</p>
          <span className="text-[10px] text-slate-400">Trauma bandages, catch nets, and carriers</span>
        </div>
      </div>

      {/* Before & After Recovery Showcase */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
          Before & After Recovery Stories Funded By You
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="relative rounded-xl overflow-hidden h-32 bg-slate-200">
                <img src="/animal-dog.jpg" alt="Bruno Before" className="h-full w-full object-cover" />
                <span className="absolute top-1.5 left-1.5 rounded-md bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white">Before: Severe Fracture</span>
              </div>
              <div className="relative rounded-xl overflow-hidden h-32 bg-slate-200">
                <img src="/buddy-puppy.jpg" alt="Bruno After" className="h-full w-full object-cover" />
                <span className="absolute top-1.5 left-1.5 rounded-md bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white">After: Fully Recovered</span>
              </div>
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">Bruno • Rescued in Indira Nagar</h4>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Hit by a car with an open compound fracture. Funded through your Emergency Medical Contribution. Bruno has now found his forever home!
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="relative rounded-xl overflow-hidden h-32 bg-slate-200">
                <img src="/animal-cat.jpg" alt="Milo Before" className="h-full w-full object-cover" />
                <span className="absolute top-1.5 left-1.5 rounded-md bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white">Before: Drain Trapped</span>
              </div>
              <div className="relative rounded-xl overflow-hidden h-32 bg-slate-200">
                <img src="/animal-cat.jpg" alt="Milo After" className="h-full w-full object-cover" />
                <span className="absolute top-1.5 left-1.5 rounded-md bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white">After: Safe & Healthy</span>
              </div>
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">Milo • Rescued in Gomti Nagar</h4>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Trapped in an underground drainage pipe for 2 days. Rescued with oxygen harness equipment and fostered at Jeev Aashraya Shelter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DonorImpact;
