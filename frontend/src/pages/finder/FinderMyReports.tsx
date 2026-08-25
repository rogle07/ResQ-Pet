import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  Plus,
  MapPin,
  Clock,
} from 'lucide-react';
import { INITIAL_FINDER_REPORTS } from '@/data/finderMockData';
import { FinderReport } from '@/types/finder';

export const FinderMyReports: React.FC = () => {
  const [reports, setReports] = useState<FinderReport[]>(INITIAL_FINDER_REPORTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedReport, setSelectedReport] = useState<FinderReport | null>(null);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.reportCode.toLowerCase().includes(q) ||
          r.location.address.toLowerCase().includes(q) ||
          r.animalType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reports, searchQuery, statusFilter]);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/finder" className="hover:text-purple-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-purple-800 dark:text-purple-400">My Reports</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Rescue Reports ({filteredReports.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track real-time rescue status, assigned response units, and animal recovery progress.
          </p>
        </div>

        <Link
          to="/finder/report"
          className="inline-flex items-center gap-2 rounded-2xl bg-purple-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-800 shadow-md shadow-purple-950/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" /> Report New Animal
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {['All', 'Under Review', 'Verified', 'Assigned', 'Rescued'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search report ID, animal, spot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            onClick={() => setSelectedReport(report)}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 cursor-pointer hover:border-purple-200 transition-all hover:scale-[1.01] group text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400">
                {report.reportCode}
              </span>
              <span className={`rounded-xl px-2.5 py-0.5 text-[10px] font-bold border ${getStatusBadgeClass(report.status)}`}>
                {report.status}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <img
                src={report.image}
                alt={report.title}
                className="h-16 w-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-display text-sm font-black text-slate-900 dark:text-white group-hover:text-purple-700 truncate">
                  {report.title}
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {report.animalType} • {report.approxAge} • {report.condition}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1 mt-1 truncate">
                  <MapPin className="h-3 w-3 text-purple-600 shrink-0" />
                  <span className="truncate">{report.location.address}</span>
                </p>
              </div>
            </div>

            {/* Current Stage Highlight */}
            <div className="rounded-2xl bg-purple-50/60 p-2.5 dark:bg-purple-950/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-purple-700 dark:text-purple-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  {report.status === 'Rescued' ? 'Safe in Recovery Ward' : report.status === 'Assigned' ? 'Rescue Van En-route' : 'Distress Triage in Progress'}
                </span>
              </div>
              <span className="text-[10px] text-purple-700 dark:text-purple-400 font-extrabold">
                View Timeline ➔
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-purple-700">{selectedReport.reportCode}</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">{selectedReport.title}</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <p className="text-slate-600 dark:text-slate-300 bg-slate-50 p-3 rounded-xl dark:bg-slate-800/40">
              {selectedReport.description}
            </p>

            <div>
              <strong className="block text-slate-700 dark:text-slate-200 mb-2">Live Rescue Dispatch Timeline:</strong>
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

            <div className="flex justify-end pt-3 border-t dark:border-slate-800">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 rounded-xl bg-purple-700 text-white font-bold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FinderMyReports;
