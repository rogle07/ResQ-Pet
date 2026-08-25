import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  FileSpreadsheet,
  Search,
} from 'lucide-react';
import { INITIAL_MY_DONATIONS } from '@/data/donorMockData';

export const DonorHistory: React.FC = () => {
  const [history] = useState(INITIAL_MY_DONATIONS);
  const [search, setSearch] = useState('');

  const filtered = history.filter(
    (h) =>
      h.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      h.campaignTitle.toLowerCase().includes(search.toLowerCase()) ||
      h.teamCategory.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/donor" className="hover:text-purple-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-purple-800 dark:text-purple-400">Donation History</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Audit Ledger & Transactions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete transparent log of all contributions, payment gateway settlement IDs, and 80G filings.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting full 80G tax ledger as CSV / Excel...')}
          className="inline-flex items-center gap-2 rounded-2xl border border-purple-200 bg-white px-4 py-2.5 font-bold text-purple-800 hover:bg-purple-50 dark:bg-slate-800 dark:border-purple-800 dark:text-purple-300 shadow-sm"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export CSV / Excel
        </button>
      </div>

      {/* Table Card */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <span className="text-slate-400 font-semibold">{filtered.length} Total Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase">
                <th className="p-3.5 pl-5">Receipt No</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Cause / Campaign</th>
                <th className="p-3.5">Beneficiary Team</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Payment Mode</th>
                <th className="p-3.5 pr-5 text-right">Tax Exemption</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 pl-5 font-mono font-bold text-purple-700 dark:text-purple-400">{row.receiptNumber}</td>
                  <td className="p-3.5 text-slate-500">{row.date}</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{row.campaignTitle}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{row.teamCategory}</td>
                  <td className="p-3.5 font-mono font-black text-slate-900 dark:text-white">₹{row.amount.toLocaleString()}</td>
                  <td className="p-3.5 text-slate-500">{row.paymentMethod}</td>
                  <td className="p-3.5 pr-5 text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                      80G Valid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default DonorHistory;
