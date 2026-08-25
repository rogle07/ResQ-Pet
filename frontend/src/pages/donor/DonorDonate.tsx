import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Heart,
  ShieldCheck,
  CreditCard,
  Building,
  Smartphone,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { FEATURED_CAMPAIGNS } from '@/data/donorMockData';

export const DonorDonate: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCampaignId, setSelectedCampaignId] = useState(FEATURED_CAMPAIGNS[0].id);
  const [amount, setAmount] = useState<number>(1000);
  const [customInput, setCustomInput] = useState('1000');
  const [donorName, setDonorName] = useState('Rahul Sharma');
  const [donorEmail, setDonorEmail] = useState('rahul.donor@resqpet.org');
  const [donorPan, setDonorPan] = useState('ABCPS1234F');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [isRecurring, setIsRecurring] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const presets = [250, 500, 1000, 2500, 5000];

  const handleSelectPreset = (amt: number) => {
    setAmount(amt);
    setCustomInput(String(amt));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/donor/my-donations');
    }, 2500);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/donor" className="hover:text-purple-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-purple-800 dark:text-purple-400">Donate Now</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          Make a Life-Saving Contribution <Heart className="h-6 w-6 text-purple-600 fill-current" />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          100% of your donation directly funds street animal rescues, surgeries, nutrition, and safe shelter.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-12 text-center space-y-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Donation Successfully Completed!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            Your generous contribution of <strong>₹{amount.toLocaleString()}</strong> has been credited to the rescue fund. Your 80G tax receipt has been emailed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* Main Donation Form */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campaign Selection */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                  Select Cause / Campaign *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FEATURED_CAMPAIGNS.map((camp) => (
                    <label
                      key={camp.id}
                      onClick={() => setSelectedCampaignId(camp.id)}
                      className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                        selectedCampaignId === camp.id
                          ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 dark:border-purple-800'
                          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                      }`}
                    >
                      <img src={camp.image} alt={camp.title} className="h-10 w-10 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{camp.title}</p>
                        <span className="text-[10px] text-slate-400">{camp.category}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amount Presets */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                  Donation Amount (INR) *
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`py-2 rounded-xl font-bold transition-all ${
                        amount === p
                          ? 'bg-purple-700 text-white shadow-md'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                      }`}
                    >
                      ₹{p}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    value={customInput}
                    onChange={(e) => {
                      setCustomInput(e.target.value);
                      const n = Number(e.target.value);
                      if (!isNaN(n) && n > 0) setAmount(n);
                    }}
                    placeholder="Enter custom amount..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-4 font-bold text-slate-900 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Recurring Switch */}
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Make this a Monthly Lifeline Pledge</span>
                  <span className="text-[10px] text-slate-500">Automatically sponsor stray animal feed and emergency rescue every month.</span>
                </div>
              </label>

              {/* Donor Contact & 80G PAN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Donor Name *</label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">PAN Card (80G Tax Exemption)</label>
                  <input
                    type="text"
                    value={donorPan}
                    onChange={(e) => setDonorPan(e.target.value)}
                    placeholder="e.g. ABCPS1234F"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono uppercase"
                  />
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Payment Method</label>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-2xl border font-bold transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-purple-600 bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : 'border-slate-200 bg-white text-slate-700 dark:bg-slate-800'
                    }`}
                  >
                    <Smartphone className="h-4 w-4 mx-auto mb-1" /> UPI / QR
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`p-3 rounded-2xl border font-bold transition-all ${
                      paymentMethod === 'Card'
                        ? 'border-purple-600 bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : 'border-slate-200 bg-white text-slate-700 dark:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="h-4 w-4 mx-auto mb-1" /> Debit / Credit Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NetBanking')}
                    className={`p-3 rounded-2xl border font-bold transition-all ${
                      paymentMethod === 'NetBanking'
                        ? 'border-purple-600 bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : 'border-slate-200 bg-white text-slate-700 dark:bg-slate-800'
                    }`}
                  >
                    <Building className="h-4 w-4 mx-auto mb-1" /> Net Banking
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/donor"
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="rounded-2xl bg-purple-700 px-6 py-2.5 font-bold text-white hover:bg-purple-800 shadow-md shadow-purple-950/20 transition-all hover:scale-105"
                >
                  Authorize Payment of ₹{amount.toLocaleString()} ➔
                </button>
              </div>
            </form>
          </div>

          {/* Right Sidebar Guarantee & Summary */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-purple-100 bg-purple-50/60 p-5 dark:border-purple-900/40 dark:bg-purple-950/30 space-y-3">
              <h3 className="font-display text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-purple-600" /> 100% Tax Deductible (80G)
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                ResQPet is a registered Non-Profit under 80G of the Indian Income Tax Act. You are eligible for a 50% tax exemption on this contribution.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2 text-[11px] text-slate-500">
              <span className="font-bold text-slate-900 dark:text-white block text-xs">Security Guarantee</span>
              <p className="flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-emerald-600" /> 256-Bit SSL Bank Grade Encryption
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-blue-600" /> Instant PDF Tax Receipt in your Inbox
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DonorDonate;
