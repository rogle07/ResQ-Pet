import { api } from '@/api/client';
import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, X, MapPin, RefreshCw, Search } from 'lucide-react';

interface FinderMatch {
  foundReport: {
    _id: string;
    reportId: string;
    species: string;
    color?: string;
    breed?: string;
    location?: { address?: string };
    photos?: { url: string }[];
    foundDate?: string;
  };
  lostReport: {
    _id: string;
    reportId: string;
    petName: string;
    animalType: string;
    color: string;
    breed?: string;
    lastSeenLocation: string;
    lastSeenDate?: string;
    photos?: { url: string }[];
    ownerName?: string;
  };
  matchScore: number;
}

export default function FinderMatches() {
  const [matches, setMatches] = useState<FinderMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ success: true; matches: FinderMatch[] }>('/lost-pets/finder-matches');
      setMatches(res.data.matches || []);
    } catch {
      // Gracefully handle empty or offline state without scary red banner
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
    return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-8 w-8 border-4 border-[#1e6f42]/20 border-t-[#1e6f42] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Possible Matches</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Lost pets that may match the animals you've reported found
          </p>
        </div>
        <button onClick={fetchMatches} className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 p-4">
        <div className="flex items-start gap-3">
          <Search className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            These are potential matches between your found-animal reports and active missing pet reports. If you believe you've found someone's pet, please contact the owner through the secure messaging system and coordinate the reunion safely.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {matches.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-bold text-slate-800 dark:text-white">No Matches Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            There are no matching lost pet reports for the animals you've found yet. Check back later or report a found animal to enable matching.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match, idx) => (
            <div key={idx} className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              {/* Match Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <span className={`rounded-full px-3 py-1 text-sm font-black ${getScoreColor(match.matchScore)}`}>
                  {match.matchScore}% Match
                </span>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 rounded-xl border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                    <X className="h-3.5 w-3.5" /> Not a Match
                  </button>
                  <button className="flex items-center gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition">
                    <CheckCircle className="h-3.5 w-3.5" /> Confirm Reunited
                  </button>
                  <button className="flex items-center gap-1 rounded-xl bg-[#1e6f42] hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition">
                    <MessageSquare className="h-3.5 w-3.5" /> Contact Owner
                  </button>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-700">
                {/* Found Pet (your report) */}
                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-wider text-blue-500 mb-3">Animal You Found</p>
                  <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 mb-3">
                    {match.foundReport.photos?.[0] ? (
                      <img src={match.foundReport.photos[0].url} alt="Found" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-3xl">🐾</div>
                    )}
                  </div>
                  <p className="font-black text-slate-800 dark:text-white capitalize">{match.foundReport.species}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {match.foundReport.breed || 'Unknown breed'} • {match.foundReport.color || 'Color unknown'}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                    <MapPin className="h-3 w-3" />
                    <span>{match.foundReport.location?.address || 'Location not recorded'}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Report: {match.foundReport.reportId}</p>
                </div>

                {/* Lost Pet (owner's report) */}
                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-wider text-red-500 mb-3">Owner's Missing Pet</p>
                  <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 mb-3">
                    {match.lostReport.photos?.[0] ? (
                      <img src={match.lostReport.photos[0].url} alt="Lost" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-3xl">🔍</div>
                    )}
                  </div>
                  <p className="font-black text-slate-800 dark:text-white">{match.lostReport.petName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {match.lostReport.animalType}{match.lostReport.breed ? ` • ${match.lostReport.breed}` : ''} • {match.lostReport.color}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                    <MapPin className="h-3 w-3" />
                    <span>Last seen: {match.lostReport.lastSeenLocation}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Report: {match.lostReport.reportId}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

