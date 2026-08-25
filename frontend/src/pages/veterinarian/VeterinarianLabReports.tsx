import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, FileSpreadsheet, Eye, Plus } from 'lucide-react';
import { INITIAL_LAB_REPORTS } from '@/data/veterinarianMockData';
import { VetLabReport } from '@/types/veterinarian';

export const VeterinarianLabReports = () => {
  const [reports, setReports] = useState<VetLabReport[]>(INITIAL_LAB_REPORTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<VetLabReport | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // New Lab report form state
  const [petName, setPetName] = useState('Bruno');
  const [ownerName, setOwnerName] = useState('Ravi Sharma');
  const [testName, setTestName] = useState('Biochemical Blood Profile & Liver Panel');
  const [summary, setSummary] = useState('Liver enzymes normal. Serum albumin within acceptable baseline.');
  const [technician, setTechnician] = useState('Anand Kumar (Sr. Lab Tech)');

  const filtered = reports.filter((r) =>
    r.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newRep: VetLabReport = {
      id: `LAB-${Date.now()}`,
      reportNumber: `LAB-2026-0${Math.floor(100 + Math.random() * 900)}`,
      petName,
      ownerName,
      testName,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Completed',
      summary,
      labTechnician: technician,
    };
    setReports((prev) => [newRep, ...prev]);
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/veterinarian" className="hover:text-emerald-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">Diagnostic & Lab Reports</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            Diagnostic & Pathology Reports <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
          </h1>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-[#1e6f42] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#165a34] shadow-md shadow-emerald-950/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" /> + Log New Lab Test
        </button>
      </div>

      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex items-center gap-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by test name, report number, pet name or owner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none dark:text-white"
        />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((rep) => (
          <div
            key={rep.id}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    {rep.reportNumber}
                  </span>
                  <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    {rep.testName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Patient: <strong className="text-slate-700 dark:text-slate-200">{rep.petName}</strong> • Owner: {rep.ownerName}
                  </p>
                </div>

                <span className="rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {rep.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200 block mb-0.5">Summary Findings:</span>
                <p className="text-slate-600 dark:text-slate-300">{rep.summary}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400">Tech: {rep.labTechnician}</span>
              <button
                onClick={() => setSelectedReport(rep)}
                className="font-bold text-emerald-700 hover:underline dark:text-emerald-400 flex items-center gap-1"
              >
                <Eye className="h-3.5 w-3.5" /> View Diagnostic Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Diagnostic Report Findings</h3>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-2">
              <p><strong>Report ID:</strong> <span className="font-mono text-emerald-700">{selectedReport.reportNumber}</span></p>
              <p><strong>Test:</strong> {selectedReport.testName}</p>
              <p><strong>Patient:</strong> {selectedReport.petName} (Owner: {selectedReport.ownerName})</p>
              <p><strong>Date:</strong> {selectedReport.date}</p>
              <div className="p-3 bg-emerald-50 rounded-xl dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200">
                <strong>Findings:</strong>
                <p className="mt-1">{selectedReport.summary}</p>
              </div>
              <p className="text-slate-400">Evaluated by: {selectedReport.labTechnician}</p>
            </div>

            <div className="flex justify-end pt-2 border-t dark:border-slate-800">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log New Lab Test Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Log Diagnostic Pathology Test</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleAddReport} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Pet Name</label>
                  <input
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full rounded-xl border p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Owner Name</label>
                  <input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full rounded-xl border p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Test Name & Pathology Category</label>
                <input
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full rounded-xl border p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Diagnostic Summary / Findings</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full rounded-xl border p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Lab Specialist</label>
                <input
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full rounded-xl border p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1e6f42] text-white font-bold text-xs"
                >
                  Save Lab Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default VeterinarianLabReports;
