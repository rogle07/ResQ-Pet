import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import DonationModal from '@/components/common/DonationModal';
import {
  HeartHandshake, Heart, Shield, Zap, ArrowRight, TrendingUp,
  QrCode, Copy, Check, Download, ExternalLink, IndianRupee, ShieldCheck
} from 'lucide-react';

const DonationsPage = () => {
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showDonationModal, setShowDonationModal] = useState<boolean>(false);

  const handlePayClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = getUpiUrl(effectiveAmount);
    } else {
      setShowDonationModal(true);
    }
  };

  const effectiveAmount = customAmount ? Number(customAmount) : selectedAmount;
  const baseUpiUri = 'upi://pay?ver=01&mode=19&pa=random@razorpay&pn=ROGLE&tr=RZPU1ZN7yYJyzzWNmqrv2&cu=INR&mc=5732&qrMedium=04&tn=ResQPet%20Donation';

  const getUpiUrl = (amt: number) => {
    if (amt && amt > 0) {
      return `${baseUpiUri}&am=${amt}`;
    }
    return baseUpiUri;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(getUpiUrl(effectiveAmount));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">
      <Navbar />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero */}
        <div className="mb-12 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <HeartHandshake className="h-4 w-4" /> Support Animal Welfare
          </div>
          <h1 className="mb-4 font-display text-3xl sm:text-5xl font-black leading-tight text-gray-900 dark:text-white">
            Your Donation <br />
            <span className="text-emerald-600 dark:text-emerald-400">Saves Innocent Lives</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 leading-relaxed">
            Every rupee you donate goes directly to pan-India rescue operations, emergency medical treatment, daily feeding drives, and smart IoT collars for animals in need. Scan the QR code or pay instantly via any UPI app.
          </p>
        </div>

        {/* ── Featured Instant UPI QR Donation Card ─────────────────── */}
        <div className="mb-16 rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/15 p-6 sm:p-10 shadow-xl dark:border-emerald-500/30 dark:bg-slate-800/90 dark:from-slate-800 dark:to-[#07180f]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Details & Amount selection */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 text-xs font-bold px-3 py-1">
                <QrCode className="h-3.5 w-3.5" /> Instant Direct UPI Donation
              </span>

              <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                Scan &amp; Pay with Any UPI App
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                Use Google Pay, PhonePe, Paytm, BHIM, or any bank app. Zero commission, 100% transparent, powered securely by Razorpay for merchant <strong>ROGLE</strong>.
              </p>

              {/* Amount Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-2">
                  Choose Donation Amount:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { amount: 100, label: 'Feed a Stray' },
                    { amount: 250, label: 'First Aid Spray' },
                    { amount: 500, label: 'Vaccination', popular: true },
                    { amount: 1000, label: 'Vet Checkup' },
                    { amount: 2000, label: 'Emergency Care' },
                  ].map((tier) => {
                    const isSelected = selectedAmount === tier.amount && !customAmount;
                    return (
                      <button
                        key={tier.amount}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(tier.amount);
                          setCustomAmount('');
                        }}
                        className={`relative rounded-xl p-2.5 text-center transition-all border ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-900/30 scale-[1.02]'
                            : 'border-gray-200 bg-white text-gray-800 hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        {tier.popular && !isSelected && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-1.5 py-0.2 text-[8px] font-black text-white uppercase tracking-wider">
                            Popular
                          </span>
                        )}
                        <div className="font-mono text-sm sm:text-base font-black">₹{tier.amount}</div>
                        <div className={`text-[10px] font-semibold truncate ${isSelected ? 'text-emerald-100' : 'text-gray-500 dark:text-slate-400'}`}>
                          {tier.label}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs sm:text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="Or enter custom amount in Rupees..."
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                      }}
                      className="w-full rounded-xl border border-gray-300 bg-white pl-8 pr-3 py-2 text-xs sm:text-sm font-semibold text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                      min="1"
                    />
                  </div>
                  {customAmount && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      ₹{customAmount} selected
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handlePayClick}
                  className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-[#1e6f42] hover:bg-emerald-700 active:scale-[0.98] py-3.5 px-6 text-sm font-black text-white shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  <IndianRupee className="h-4 w-4" />
                  <span>Pay ₹{effectiveAmount || '500'} via UPI App</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </button>

                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white py-3.5 px-5 text-xs sm:text-sm font-bold text-gray-800 shadow-sm hover:bg-gray-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">UPI Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy UPI Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Supported apps */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 dark:text-slate-400">
                <span className="font-semibold text-gray-700 dark:text-slate-300">Supported UPI Apps:</span>
                {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Amazon Pay', 'Cred', 'Any Bank UPI'].map((app) => (
                  <span
                    key={app}
                    className="rounded-md bg-white/90 dark:bg-slate-800 px-2 py-0.5 border border-gray-200/80 dark:border-slate-700 text-[10px] font-medium"
                  >
                    {app}
                  </span>
                ))}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-gray-200/70 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Verified: <strong>ROGLE</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                  <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Powered by <strong>Razorpay</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                  <Heart className="h-4 w-4 text-emerald-500 shrink-0 fill-current" />
                  <span>100% to Animal Welfare</span>
                </div>
              </div>
            </div>

            {/* Right Column: Standee Poster Display */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative group max-w-[270px] xs:max-w-[290px] w-full bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-2xl border-2 border-emerald-500/40 transition-transform duration-300 hover:scale-[1.02]">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-400 to-[#1e6f42] opacity-30 blur-md group-hover:opacity-60 transition" />
                <div onClick={() => setShowDonationModal(true)} className="relative rounded-2xl overflow-hidden bg-white shadow-inner cursor-pointer hover:opacity-95 transition" title="Click to scan or pay online">
                  <img
                    src="/donation-qr.jpg"
                    alt="ROGLE ResQPet Razorpay Donation QR Code"
                    className="w-full h-auto object-contain block"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 px-1">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Scan with Any UPI App</span>
                  </div>
                  <a
                    href="/donation-qr.jpg"
                    download="ResQPet_ROGLE_Donation_QR.jpg"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1e6f42] dark:bg-emerald-950/70 dark:text-emerald-300 dark:hover:bg-emerald-900 text-[11px] font-bold transition shadow-sm"
                  >
                    <Download className="h-3 w-3" />
                    Save QR
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        {/* Interactive Donation Modal for Desktop and Mobile */}
        <DonationModal
          isOpen={showDonationModal}
          onClose={() => setShowDonationModal(false)}
          amount={effectiveAmount}
          upiId="random@razorpay"
          merchantName="ROGLE"
        />

        {/* Impact stats */}
        <div className="mb-16 grid gap-6 md:grid-cols-4">
          {[
            { value: '₹8,45,320', label: 'Total Raised', color: 'text-emerald-600 dark:text-emerald-400' },
            { value: '3,241', label: 'Animals Rescued', color: 'text-blue-600 dark:text-blue-400' },
            { value: '1,532', label: 'Treatments Funded', color: 'text-orange-600 dark:text-orange-400' },
            { value: '120+', label: 'NGOs Supported', color: 'text-purple-600 dark:text-purple-400' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center shadow-sm">
              <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Donation tiers */}
        <h2 className="mb-8 font-display text-2xl font-bold text-gray-900 dark:text-white">Choose Your Impact</h2>
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {[
            { amount: '₹500', raw: 500, label: 'Supporter', desc: 'Feeds and cares for rescued animals with daily nutrition and clean water.', icon: <Heart className="h-8 w-8" fill="currentColor" />, color: 'border-blue-200 dark:border-blue-900/50', badge: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20', btn: 'bg-blue-600 hover:bg-blue-700' },
            { amount: '₹2,000', raw: 2000, label: 'Rescuer', desc: 'Funds a full veterinary check-up, anti-rabies vaccination, and wound dressing.', icon: <Shield className="h-8 w-8" />, color: 'border-emerald-300 dark:border-emerald-900/50 ring-2 ring-emerald-400', badge: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20', btn: 'bg-emerald-600 hover:bg-emerald-700', popular: true },
            { amount: '₹5,000', raw: 5000, label: 'Guardian', desc: 'Sponsors a critical emergency rescue operation including transport, surgery and shelter.', icon: <Zap className="h-8 w-8" />, color: 'border-purple-200 dark:border-purple-900/50', badge: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20', btn: 'bg-purple-600 hover:bg-purple-700' },
          ].map((tier) => (
            <div key={tier.label} className={`relative rounded-2xl border-2 bg-white dark:bg-slate-800 p-8 shadow-sm hover:shadow-md transition-shadow ${tier.color}`}>
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1 text-xs font-bold text-white">
                  Most Popular
                </span>
              )}
              <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full ${tier.badge}`}>
                {tier.icon}
              </div>
              <p className="mb-1 font-display text-3xl font-bold text-gray-900 dark:text-white">{tier.amount}</p>
              <p className="mb-3 font-semibold text-gray-700 dark:text-slate-300">{tier.label}</p>
              <p className="mb-6 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{tier.desc}</p>
              <a
                href={getUpiUrl(tier.raw)}
                className={`block w-full rounded-xl py-3 text-center font-bold text-white transition-all shadow-md ${tier.btn}`}
              >
                Donate {tier.amount} via UPI
              </a>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 sm:p-12 text-center text-white shadow-xl">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="mb-3 font-display text-2xl sm:text-4xl font-bold">Every Single Contribution Counts</h2>
          <p className="mb-6 text-emerald-100 max-w-xl mx-auto text-sm sm:text-base">
            No amount is too small. A donation of just ₹100 helps feed hungry stray puppies and kittens on our streets.
          </p>
          <a
            href={getUpiUrl(500)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-bold text-emerald-800 hover:bg-emerald-50 transition-all shadow-lg active:scale-[0.98]"
          >
            Donate ₹500 Now <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DonationsPage;
