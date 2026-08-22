import React, { useState } from 'react';
import { AdoptablePet } from '@/types/foster';
import {
  X,
  Heart,
  Share2,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Check
} from 'lucide-react';

interface PetProfileModalProps {
  pet: AdoptablePet | null;
  isOpen: boolean;
  onClose: () => void;
  onFosterClick?: (pet: AdoptablePet) => void;
  onAdoptClick?: (pet: AdoptablePet) => void;
  onToggleFavorite?: (id: string) => void;
}

export const PetProfileModal: React.FC<PetProfileModalProps> = ({
  pet,
  isOpen,
  onClose,
  onFosterClick,
  onAdoptClick,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !pet) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden dark:bg-slate-900 dark:text-slate-100">
        {/* Hero Header with Image */}
        <div className="relative h-64 w-full bg-slate-900 shrink-0">
          <img
            src={pet.image}
            alt={pet.name}
            className="h-full w-full object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top action buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="rounded-full bg-emerald-600/90 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white shadow">
              Available for Adoption & Foster
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                title="Share Pet Link"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-slate-800 hover:bg-white transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
              </button>
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(pet.id)}
                  title="Favorite"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-rose-500 hover:bg-white transition-colors"
                >
                  <Heart className="h-4 w-4" fill={pet.isFavorite ? 'currentColor' : 'none'} />
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-slate-800 hover:bg-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">{pet.name}</h3>
                <p className="text-xs sm:text-sm text-slate-200 font-medium mt-0.5">
                  {pet.age} • {pet.gender} • {pet.breed}
                </p>
              </div>
              <span className="rounded-xl bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
                {pet.weightKg} kg
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Location & Quick meta */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{pet.location}</span>
            {pet.requestedDate && (
              <>
                <span>•</span>
                <Calendar className="h-3.5 w-3.5" />
                <span>Listed: {pet.requestedDate}</span>
              </>
            )}
          </div>

          {/* Compatibility & Health Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50/70 p-2.5 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/40">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="text-slate-400 block text-[9px]">Vaccines</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{pet.vaccinated ? 'Vaccinated' : 'Pending'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-teal-50/70 p-2.5 border border-teal-100 dark:bg-teal-950/30 dark:border-teal-900/40">
              <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="text-slate-400 block text-[9px]">Neutered</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{pet.neutered ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-indigo-50/70 p-2.5 border border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/40">
              <Users className="h-4 w-4 text-indigo-600 shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="text-slate-400 block text-[9px]">With Kids</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{pet.goodWithKids ? 'Friendly' : 'Not tested'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-amber-50/70 p-2.5 border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/40">
              <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="text-slate-400 block text-[9px]">With Pets</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{pet.goodWithPets ? 'Social' : 'Solo Pet'}</span>
              </div>
            </div>
          </div>

          {/* Story & Background */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">About {pet.name}</h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{pet.story}</p>
          </div>

          {/* Health & Diet notes */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 w-24 shrink-0">Health Status:</span>
              <span className="text-slate-600 dark:text-slate-300">{pet.healthStatus}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 w-24 shrink-0">Diet & Care:</span>
              <span className="text-slate-600 dark:text-slate-300">{pet.diet}</span>
            </div>
          </div>

          {/* Owner / Lister Contact Card */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <h5 className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300 mb-2">Listed By & Contact</h5>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">{pet.ownerName}</p>
                <p className="text-[11px] text-slate-500">{pet.ownerEmail || 'rescuer@resqpet.org'}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${pet.ownerPhone}`}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors"
                >
                  <Phone className="h-3 w-3" /> {pet.ownerPhone}
                </a>
                {pet.ownerEmail && (
                  <a
                    href={`mailto:${pet.ownerEmail}`}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 font-semibold text-emerald-800 hover:bg-emerald-50 dark:bg-slate-800 dark:border-emerald-700 dark:text-emerald-300 transition-colors"
                  >
                    <Mail className="h-3 w-3" /> Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
          <div className="flex items-center gap-2.5">
            {onFosterClick && (
              <button
                onClick={() => {
                  onClose();
                  onFosterClick(pet);
                }}
                className="rounded-2xl border border-emerald-600 bg-emerald-50 px-5 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-300 transition-all shadow-sm"
              >
                Foster Care Placement
              </button>
            )}
            {onAdoptClick && (
              <button
                onClick={() => {
                  onClose();
                  onAdoptClick(pet);
                }}
                className="flex items-center gap-1.5 rounded-2xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-md shadow-emerald-900/20 transition-all"
              >
                <Heart className="h-3.5 w-3.5" fill="currentColor" /> Apply to Adopt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
