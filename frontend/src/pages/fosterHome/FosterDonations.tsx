import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Utensils,
  Stethoscope,
  Home,
  Heart,
  Receipt,
  History,
  ChevronLeft
} from 'lucide-react';
import { DONATION_RECORDS } from '@/data/fosterMockData';
import { DonationRecord } from '@/types/foster';
import { DonationPaymentModal } from '@/components/fosterHome/DonationPaymentModal';
import { ReceiptModal } from '@/components/fosterHome/ReceiptModal';

type DonationCategory = DonationRecord['forCategory'];

const FosterDonations = () => {
  const [activeTab, setActiveTab] = useState<'donate' | 'history'>('donate');
  const [selectedCategory, setSelectedCategory] = useState<DonationCategory>('Food Support');
  const [amount, setAmount] = useState<number>(1000);
  const [customAmountStr, setCustomAmountStr] = useState('1000');
  const [frequency, setFrequency] = useState<'One-time' | 'Monthly'>('One-time');
  const [message, setMessage] = useState('');
  
  // History & Modal states
  const [transactions, setTransactions] = useState<DonationRecord[]>(DONATION_RECORDS);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<DonationRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmountStr(String(val));
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmountStr(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (newRecord: DonationRecord) => {
    setTransactions((prev) => [newRecord, ...prev]);
  };

  const totalPages = Math.ceil(transactions.length / itemsPerPage) || 1;
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/foster-home" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">Donation</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
          Donation
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('donate')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'donate'
              ? 'bg-[#1e6f42] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
          }`}
        >
          <Heart className="h-4 w-4" fill={activeTab === 'donate' ? 'currentColor' : 'none'} />
          Make a Donation
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-[#1e6f42] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
          }`}
        >
          <History className="h-4 w-4" />
          Donation History
        </button>
      </div>

      {/* DONATE VIEW */}
      {activeTab === 'donate' ? (
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Top Green Banner */}
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4 border border-emerald-200/80 dark:from-emerald-950/40 dark:to-teal-950/20 dark:border-emerald-900/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
              <Heart className="h-5 w-5" fill="currentColor" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
              Support Animals in Foster Care. Every rupee directly funds food, vaccines, and shelter.
            </p>
          </div>

          <form onSubmit={handleProceed} className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-8">
            {/* 1. Category Selection */}
            <div className="space-y-3">
              <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                1. Select Donation Category
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {[
                  { id: 'Food Support', title: 'Food Support', desc: 'Daily meals, nutrition & supplements', icon: Utensils, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
                  { id: 'Medical Support', title: 'Medical Support', desc: 'Vaccines, treatments & surgery', icon: Stethoscope, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' },
                  { id: 'Shelter Support', title: 'Shelter Support', desc: 'Bedding, warmth & space maintenance', icon: Home, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40' },
                  { id: 'General Support', title: 'General Support', desc: 'Where it is needed the most', icon: Heart, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as DonationCategory)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-600/30'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cat.color} mb-3`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white">{cat.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{cat.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Amount Selection */}
            <div className="space-y-3">
              <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                2. Choose Amount
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[500, 1000, 2500, 5000].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => handleAmountSelect(preset)}
                    className={`rounded-2xl py-3 px-4 text-sm font-extrabold border transition-all ${
                      amount === preset && customAmountStr === String(preset)
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    ₹{preset.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Or enter custom amount (₹)
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min={100}
                    value={customAmountStr}
                    onChange={handleCustomAmountChange}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-8 pr-4 text-sm font-bold text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* 3. Frequency */}
            <div className="space-y-3">
              <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                3. Frequency
              </h3>
              <div className="flex gap-3">
                {(['One-time', 'Monthly'] as const).map((freq) => (
                  <button
                    type="button"
                    key={freq}
                    onClick={() => setFrequency(freq)}
                    className={`rounded-xl px-6 py-2.5 text-xs font-bold border transition-all ${
                      frequency === freq
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Message / Note */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Leave a caring note (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Write a message of love for the rescued animals..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
              />
            </div>

            {/* Proceed to Payment Button */}
            <button
              type="submit"
              className="w-full rounded-2xl bg-[#1e6f42] py-4 text-sm font-extrabold text-white shadow-lg shadow-emerald-950/20 hover:bg-[#165a34] transition-all hover:scale-[1.005]"
            >
              Proceed to Donate ₹{amount.toLocaleString('en-IN')}
            </button>
          </form>
        </div>
      ) : (
        /* DONATION HISTORY VIEW */
        <div className="space-y-6">
          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-emerald-100 bg-[#f0fdf4] p-5 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <p className="text-xs font-semibold text-slate-500">Total Donations</p>
              <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">₹45,780</h3>
            </div>
            <div className="rounded-2xl border border-purple-100 bg-[#faf5ff] p-5 shadow-sm dark:border-purple-900/40 dark:bg-purple-950/20">
              <p className="text-xs font-semibold text-slate-500">This Month</p>
              <h3 className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">₹18,900</h3>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-[#f0f9ff] p-5 shadow-sm dark:border-sky-900/40 dark:bg-sky-950/20">
              <p className="text-xs font-semibold text-slate-500">Total Transactions</p>
              <h3 className="text-2xl font-black text-sky-700 dark:text-sky-400 mt-1">24</h3>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-[#fffbeb] p-5 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
              <p className="text-xs font-semibold text-slate-500">Lives Impacted</p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">♥ 140+</h3>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">For</th>
                    <th className="py-3.5 px-6">Type</th>
                    <th className="py-3.5 px-6">Amount</th>
                    <th className="py-3.5 px-6">Payment Method</th>
                    <th className="py-3.5 px-6">Receipt</th>
                    <th className="py-3.5 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-emerald-50/30 transition-colors dark:hover:bg-slate-800/50"
                    >
                      <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">{tx.date}</td>
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{tx.forCategory}</td>
                      <td className="py-4 px-6 text-slate-500">{tx.type}</td>
                      <td className="py-4 px-6 font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{tx.paymentMethod}</td>
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(tx)}
                          className="font-mono text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400 flex items-center gap-1"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          {tx.receiptNumber}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/20">
              <p className="text-xs text-slate-500">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, transactions.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, transactions.length)} of {transactions.length} transactions
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      currentPage === page
                        ? 'bg-[#1e6f42] text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      <DonationPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={amount}
        category={selectedCategory}
        type={frequency}
        onSuccess={handlePaymentSuccess}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        record={selectedReceipt}
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};

export default FosterDonations;
