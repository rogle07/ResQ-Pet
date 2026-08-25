import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  Download,
  Plus,
} from 'lucide-react';
import { INITIAL_MY_DONATIONS } from '@/data/donorMockData';
import { DonationRecord } from '@/types/donor';

export const DonorMyDonations: React.FC = () => {
  const [donations] = useState<DonationRecord[]>(INITIAL_MY_DONATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<DonationRecord | null>(null);

  const filtered = useMemo(() => {
    return donations.filter((d) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.receiptNumber.toLowerCase().includes(q) ||
          d.campaignTitle.toLowerCase().includes(q) ||
          d.teamCategory.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [donations, searchQuery]);

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/donor" className="hover:text-purple-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-purple-800 dark:text-purple-400">My Donations</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Donations & Tax Receipts ({filtered.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lifetime contributions: <strong>₹{totalAmount.toLocaleString()}</strong> • 50% 80G Tax Deductible.
          </p>
        </div>

        <Link
          to="/donor/donate"
          className="inline-flex items-center gap-2 rounded-2xl bg-purple-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-800 shadow-md shadow-purple-950/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" /> New Contribution
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipt #, campaign name, team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Donations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((d) => (
          <div
            key={d.id}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-purple-700 dark:text-purple-400">
                {d.receiptNumber}
              </span>
              <span className="rounded-xl bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                ✓ {d.status}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <h3 className="font-display text-sm font-black text-slate-900 dark:text-white">
                  {d.campaignTitle}
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Beneficiary: {d.teamCategory} • {d.date}
                </p>
              </div>

              <span className="font-display text-lg font-black text-slate-900 dark:text-white">
                ₹{d.amount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400">Mode: {d.paymentMethod}</span>
              <button
                onClick={() => setSelectedDonation(d)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-1.5 font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> 80G Receipt
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 80G Receipt Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Official 80G Certificate</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Donation Receipt: {selectedDonation.receiptNumber}</h3>
              </div>
              <button onClick={() => setSelectedDonation(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Organization:</span>
                <strong className="text-slate-900 dark:text-white">ResQPet Animal Welfare Society</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">80G Reg No:</span>
                <strong className="text-slate-900 dark:text-white">AABTR1299PF20214</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Donor Name:</span>
                <strong className="text-slate-900 dark:text-white">{selectedDonation.donorName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">PAN:</span>
                <strong className="text-slate-900 dark:text-white">{selectedDonation.donorPan || 'ABCPS1234F'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <strong className="text-emerald-600 text-sm">₹{selectedDonation.amount.toLocaleString()} (INR)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cause:</span>
                <strong className="text-slate-900 dark:text-white">{selectedDonation.campaignTitle}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <strong className="text-slate-900 dark:text-white">{selectedDonation.date}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800">
              <button
                onClick={() => setSelectedDonation(null)}
                className="px-4 py-2 rounded-xl border text-slate-600"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-purple-700 text-white font-bold flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DonorMyDonations;
