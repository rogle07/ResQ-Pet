import { useEffect, useState } from 'react';
import { foundReportApi } from '@/features/foundReport/foundReportApi';
import { petApi } from '@/features/pets/petApi';
import type { FoundReport, Pet } from '@/types';
import Modal from '@/components/ui/Modal';
import {
  Search,
  MapPin,
  Calendar,
  Camera,
  CheckCircle2,
  HelpCircle,
  Filter,
} from 'lucide-react';

const OwnerFoundPets = () => {
  const [reports, setReports] = useState<FoundReport[]>([]);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');

  // Claim modal state
  const [claimReport, setClaimReport] = useState<FoundReport | null>(null);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [claimNote, setClaimNote] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');
  const [claimError, setClaimError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [reps, pets] = await Promise.all([
        foundReportApi.list(),
        petApi.list(),
      ]);
      setReports(reps);
      setMyPets(pets);
      if (pets.length > 0) setSelectedPetId(pets[0]._id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimReport) return;
    setSubmittingClaim(true);
    setClaimError('');
    try {
      await foundReportApi.claim(claimReport._id, {
        petId: selectedPetId || undefined,
        note: claimNote,
      });
      setClaimSuccess('Claim request sent! The reporter has been notified with your contact details.');
      setClaimReport(null);
      setClaimNote('');
      loadData();
      setTimeout(() => setClaimSuccess(''), 6000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not submit claim. Please try again.';
      setClaimError(msg);
    } finally {
      setSubmittingClaim(false);
    }
  };

  const filtered = reports.filter((r) => {
    const matchesSpecies = speciesFilter === 'all' || r.species.toLowerCase() === speciesFilter.toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      r.description?.toLowerCase().includes(query) ||
      r.breed?.toLowerCase().includes(query) ||
      r.location?.address?.toLowerCase().includes(query);
    return matchesSpecies && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-bone flex items-center gap-2">
          <Search className="h-5 w-5 text-emerald-600" /> Found Pets Community Board
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-bone/60">
          Browse animals reported by community members and Found Pet Reporters. If you recognize your missing pet, send an instant claim request.
        </p>
      </div>

      {claimSuccess && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{claimSuccess}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="card p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-mist-400" />
          <input
            type="text"
            className="input pl-9 text-xs sm:text-sm"
            placeholder="Search by breed, markings, area…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-mist-400" />
          <select
            className="input py-2 text-xs font-medium w-full sm:w-auto"
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
          >
            <option value="all">All Species ({reports.length})</option>
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
            <option value="cow">Cattle / Cows</option>
            <option value="bird">Birds</option>
            <option value="rabbit">Rabbits</option>
            <option value="other">Other Animals</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-16 text-center font-mono text-sm text-mist-500">Loading found pet records…</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <HelpCircle className="h-10 w-10 text-mist-400 mx-auto mb-2" />
          <p className="font-semibold text-slate-800 dark:text-bone">No Matching Found Pets</p>
          <p className="text-xs text-mist-500 mt-1">Try changing your search terms or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => {
            const photoUrl = r.photos?.[0]?.url;
            const isClaimed = r.status === 'reunited' || r.status === 'claimed';

            return (
              <div key={r._id} className="card flex flex-col justify-between p-4 hover:shadow-md transition">
                <div>
                  {photoUrl ? (
                    <div className="rounded-xl overflow-hidden h-44 bg-slate-100 mb-3 border border-slate-200">
                      <img src={photoUrl} alt="Found pet" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="rounded-xl h-44 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                      <Camera className="h-10 w-10" />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-sm text-slate-800 dark:text-bone capitalize">
                      {r.breed ? `${r.breed} (${r.species})` : r.species}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        isClaimed
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {isClaimed ? 'Reunited / Claimed' : 'Awaiting Owner'}
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-mist-500 mb-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{r.location?.address || 'Location provided'}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-bone/70 line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-mist-800 flex items-center justify-between">
                  <span className="text-[11px] text-mist-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(r.foundAt || r.createdAt).toLocaleDateString()}
                  </span>

                  {!isClaimed && (
                    <button
                      onClick={() => setClaimReport(r)}
                      className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5"
                    >
                      This is My Pet!
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Claim Modal */}
      {claimReport && (
        <Modal
          isOpen={!!claimReport}
          onClose={() => setClaimReport(null)}
          title="Identify & Claim Your Pet"
        >
          <form onSubmit={handleClaim} className="space-y-4">
            {claimError && (
              <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                {claimError}
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-mist-800/40 text-xs space-y-1">
              <p className="font-semibold text-slate-800 dark:text-bone">Found Pet Report</p>
              <p className="text-mist-500">Species/Breed: {claimReport.breed || claimReport.species}</p>
              <p className="text-mist-500">Found near: {claimReport.location?.address}</p>
              <p className="text-mist-500">Reported on: {new Date(claimReport.foundAt).toLocaleDateString()}</p>
            </div>

            {myPets.length > 0 ? (
              <div>
                <label className="label">Select Which of Your Pets this Is</label>
                <select
                  className="input"
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                >
                  {myPets.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.species} • {p.breed || 'Pet'})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-xs text-mist-500">
                Note: You can proceed without an active pet profile. The reporter will receive your message and phone number.
              </p>
            )}

            <div>
              <label className="label">Message to Found Pet Reporter</label>
              <textarea
                rows={3}
                className="input"
                placeholder="Describe proof of ownership (e.g. unique collar, birthmark, microchip ID, or time lost)…"
                value={claimNote}
                onChange={(e) => setClaimNote(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setClaimReport(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingClaim}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                {submittingClaim ? 'Sending Claim…' : 'Confirm Claim & Contact Reporter'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default OwnerFoundPets;
