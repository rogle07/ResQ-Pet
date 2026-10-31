import { api } from '@/api/client';
import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, X, MapPin, RefreshCw } from 'lucide-react';

interface MatchResult {
  lostReport: {
    _id: string;
    reportId: string;
    petName: string;
    animalType: string;
    color: string;
    breed?: string;
    lastSeenLocation: string;
    photos?: { url: string }[];
  };
  foundReport: {
    _id: string;
    reportId: string;
    species: string;
    color?: string;
    breed?: string;
    location?: { address?: string };
    photos?: { url: string }[];
    finderName?: string;
  };
  matchScore: number;
}

export default function LostPetMatches() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ success: true; matches: MatchResult[] }>('/lost-pets/my-matches');
      setMatches(res.data.matches || []);
    } catch {
      // Gracefully handle empty or offline state without scary red banner
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  const handleVerify = async (lostId: string, foundId: string, action: 'confirm' | 'reject') => {
    setActionLoading(`${lostId}-${action}`);
    try {
      await api.patch(`/lost-pets/${lostId}/verify-match`, { foundReportId: foundId, action });
      fetchMatches();
    } catch {
      alert('Action failed. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
    return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong Match';
    if (score >= 60) return 'Possible Match';
    return 'Weak Match';
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
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Matching Results</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Potential matches found by our AI engine — verify each one carefully
          </p>
        </div>
        <button onClick={fetchMatches} className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Matching Engine Info */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 p-4">
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
          🤖 <strong>How matching works:</strong> Our engine compares your missing pet's details (type, breed, color, gender, location) against all finder reports and calculates a weighted similarity score. A score above 50% surfaces as a possible match.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {matches.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-bold text-slate-800 dark:text-white">No Matches Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            The matching engine is scanning finder reports. You'll be notified as soon as a potential match is found.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match, idx) => (
            <div key={idx} className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              {/* Match Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-black ${getScoreColor(match.matchScore)}`}>
                    {match.matchScore}% — {getScoreLabel(match.matchScore)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify(match.lostReport._id, match.foundReport._id, 'reject')}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-1 rounded-xl border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> Not My Pet
                  </button>
                  <button
                    onClick={() => handleVerify(match.lostReport._id, match.foundReport._id, 'confirm')}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition disabled:opacity-50"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> This Is My Pet!
                  </button>
                  <button className="flex items-center gap-1 rounded-xl bg-[#1e6f42] hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition">
                    <MessageSquare className="h-3.5 w-3.5" /> Message Finder
                  </button>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-700">
                {/* Lost Pet */}
                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-wider text-red-500 mb-3">Your Missing Pet</p>
                  <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 mb-3">
                    {match.lostReport.photos?.[0] ? (
                      <img src={match.lostReport.photos[0].url} alt="Lost pet" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-3xl">🐾</div>
                    )}
                  </div>
                  <p className="font-black text-slate-800 dark:text-white">{match.lostReport.petName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {match.lostReport.animalType}{match.lostReport.breed ? ` • ${match.lostReport.breed}` : ''} • {match.lostReport.color}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                    <MapPin className="h-3 w-3" />
                    <span>{match.lostReport.lastSeenLocation}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Report: {match.lostReport.reportId}</p>
                </div>

                {/* Found Pet */}
                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-500 mb-3">Found by Finder</p>
                  <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 mb-3">
                    {match.foundReport.photos?.[0] ? (
                      <img src={match.foundReport.photos[0].url} alt="Found pet" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-3xl">🔍</div>
                    )}
                  </div>
                  <p className="font-black text-slate-800 dark:text-white capitalize">{match.foundReport.species}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {match.foundReport.breed || 'Unknown breed'} • {match.foundReport.color || 'Color not specified'}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                    <MapPin className="h-3 w-3" />
                    <span>{match.foundReport.location?.address || 'Location not specified'}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Report: {match.foundReport.reportId}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

