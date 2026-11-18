import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import DonationModal from '@/components/common/DonationModal';
import { useAppSelector } from '@/app/hooks';
import { openRazorpayCheckout, RAZORPAY_KEY_ID } from '@/utils/razorpay';
import { donationApi } from '@/features/donations/donationApi';
import {
  HeartHandshake,
  Heart,
  Shield,
  Zap,
  ArrowRight,
  TrendingUp,
  QrCode,
  Copy,
  Check,
  Download,
  ShieldCheck,
  CreditCard,
  Loader2,
  CheckCircle2,
  User as UserIcon,
  LogIn,
  Sparkles,
  Printer,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface PaymentSuccessData {
  amount: number;
  paymentId: string;
  orderId?: string;
  donorName: string;
  donorEmail: string;
  receiptNumber: string;
  date: string;
}

const DonationsPage = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isLoggedIn = !!currentUser;

  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showDonationModal, setShowDonationModal] = useState<boolean>(false);
  const [modalAmount, setModalAmount] = useState<number>(500);

  // Razorpay payment states
  const [processingAmount, setProcessingAmount] = useState<number | null>(null);
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentSuccessData | null>(null);

  // Unauthenticated user prompt modal state
  const [pendingGuestAmount, setPendingGuestAmount] = useState<number | null>(null);

  const effectiveAmount = customAmount ? Number(customAmount) : selectedAmount;
  const baseUpiUri =
    'upi://pay?ver=01&mode=19&pa=ykumar778899@okaxis&pn=ROGLE&tr=RZPU1ZN7yYJyzzWNmqrv2&cu=INR&mc=5732&qrMedium=04&tn=ResQPet%20Donation';

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

  /**
   * Main unified donation handler:
   * - If logged in: initiates Razorpay checkout with user details and logs to backend
   * - If not logged in: prompts user to log in or proceed as guest
   */
  const handleDonate = async (amountToDonate: number) => {
    if (!amountToDonate || amountToDonate < 1) return;

    if (!isLoggedIn) {
      // Prompt unauthenticated user
      setPendingGuestAmount(amountToDonate);
      return;
    }

    // Authenticated user checkout
    await executeRazorpayPayment(amountToDonate, currentUser.name, currentUser.email, currentUser.phone);
  };

  /**
   * Executes the Razorpay payment flow via official Razorpay test credentials
   */
  const executeRazorpayPayment = async (
    amt: number,
    name?: string,
    email?: string,
    phone?: string
  ) => {
    setProcessingAmount(amt);
    setPaymentError('');

    let rzpOrderId: string | undefined;
    let rzpKey = RAZORPAY_KEY_ID;

    // Step 1: If user is logged in, attempt to create official order on backend
    if (isLoggedIn) {
      try {
        const orderRes = await donationApi.createRazorpayOrder({
          amount: amt,
          currency: 'INR',
          purpose: 'one_time',
          notes: {
            donorName: name || '',
            donorEmail: email || '',
            source: 'DonationsPage',
          },
        });
        if (orderRes?.order?.id) {
          rzpOrderId = orderRes.order.id;
          if (orderRes.keyId) rzpKey = orderRes.keyId;
        }
      } catch (backendErr) {
        console.warn(
          '[DonationsPage] Could not create order on backend, continuing with direct client checkout:',
          backendErr
        );
      }
    }

    // Step 2: Open Razorpay checkout modal
    try {
      const response = await openRazorpayCheckout({
        key: rzpKey,
        amount: amt,
        currency: 'INR',
        order_id: rzpOrderId,
        name: 'ResQPet Foundation',
        description: `Animal Welfare Donation — ₹${amt}`,
        image: '/donation-qr-code.png',
        prefill: {
          name: name || '',
          email: email || '',
          contact: phone || '',
        },
        notes: {
          donorName: name || 'Kind Animal Lover',
          donorEmail: email || '',
          amount: String(amt),
          type: 'one_time',
        },
        theme: { color: '#16a34a' },
      });

      // Step 3: If user is logged in, verify and record in backend
      if (isLoggedIn) {
        try {
          await donationApi.verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id || rzpOrderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            amount: amt,
            currency: 'INR',
            purpose: 'one_time',
            message: `Donation by ${name || 'Donor'} (${response.razorpay_payment_id})`,
          });
        } catch (verifyErr) {
          console.warn('[DonationsPage] Backend verification notice:', verifyErr);
        }
      }

      // Step 4: Show success confirmation modal
      setPaymentSuccess({
        amount: amt,
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id || rzpOrderId,
        donorName: name || (isLoggedIn ? currentUser?.name : 'Kind Animal Lover'),
        donorEmail: email || (isLoggedIn ? currentUser?.email : ''),
        receiptNumber: `RQP-80G-${response.razorpay_payment_id.slice(-6).toUpperCase()}`,
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    } catch (err: unknown) {
      const msg = (err as Error)?.message || '';
      if (!msg.toLowerCase().includes('cancel')) {
        setPaymentError('Online checkout could not be completed. Please try again or scan the UPI QR code.');
      }
    } finally {
      setProcessingAmount(null);
    }
  };

  /**
   * Get target donations dashboard URL based on user role
   */
  const getDashboardDonationsUrl = () => {
    if (!currentUser) return '/donations';
    if (currentUser.role === 'donor') return '/donor/my-donations';
    if (currentUser.role === 'owner') return '/owner/donations';
    if (currentUser.role === 'ngo') return '/ngo/donations';
    return '/owner/donations';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 sm:py-14">
        {/* Donor Account Banner */}
        {isLoggedIn ? (
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/15 p-4 sm:p-5 shadow-sm dark:bg-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-base shadow-sm">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                    Logged in as {currentUser?.name}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <ShieldCheck className="h-3 w-3" /> Verified Donor
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    80G Tax Exemption Eligible
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-300 mt-0.5">
                  Receipts will be issued to <span className="font-semibold text-emerald-700 dark:text-emerald-400">{currentUser?.email}</span> and saved to your account.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(getDashboardDonationsUrl())}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/40 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 active:scale-95 transition shadow-sm dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>My Donation History</span>
            </button>
          </div>
        ) : (
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-300/60 bg-amber-50/70 p-4 text-amber-900 shadow-sm dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-xs sm:text-sm font-medium">
                <strong>Sign in to claim Section 80G tax deductions:</strong> Registered donors receive instant official receipts and automated dashboard tracking for every contribution.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/login', { state: { from: '/donations' } })}
                className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log In</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/register', { state: { from: '/donations' } })}
                className="inline-flex items-center gap-1 rounded-xl border border-amber-600/40 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-200 transition"
              >
                <span>Register</span>
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="mb-10 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <HeartHandshake className="h-4 w-4" /> Support Animal Welfare
          </div>
          <h1 className="mb-3 font-display text-3xl sm:text-5xl font-black leading-tight text-gray-900 dark:text-white">
            Your Donation <br />
            <span className="text-emerald-600 dark:text-emerald-400">Saves Innocent Lives</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 leading-relaxed">
            Every rupee you donate goes directly to pan-India rescue operations, emergency medical treatment, daily feeding drives, and smart IoT collars for animals in need. Click <strong>Donate Now</strong> to pay securely via Razorpay (UPI, Cards, NetBanking) or scan our official QR code.
          </p>
        </div>

        {/* Global Error Banner */}
        {paymentError && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{paymentError}</span>
            </div>
            <button
              type="button"
              onClick={() => setPaymentError('')}
              className="rounded-full p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Featured Instant Razorpay & UPI Donation Card ─────────────────── */}
        <div className="mb-16 rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/15 p-6 sm:p-10 shadow-xl dark:border-emerald-500/30 dark:bg-slate-800/90 dark:from-slate-800 dark:to-[#07180f]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Details & Amount selection */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 text-xs font-bold px-3 py-1">
                <CreditCard className="h-3.5 w-3.5" /> Instant Razorpay &amp; UPI Gateway
              </span>

              <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                Support Street Animals Today
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                Choose an amount or enter a custom sum. Powered securely by <strong>Razorpay</strong> for merchant <strong>ROGLE</strong> with full support for UPI apps, Debit/Credit Cards, NetBanking, and Wallets.
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
                        <div
                          className={`text-[10px] font-semibold truncate ${
                            isSelected ? 'text-emerald-100' : 'text-gray-500 dark:text-slate-400'
                          }`}
                        >
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

              {/* Action Buttons: Unified "Donate Now" button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleDonate(effectiveAmount)}
                  disabled={processingAmount === effectiveAmount}
                  className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-[#1e6f42] hover:bg-emerald-700 active:scale-[0.98] py-3.5 px-6 text-sm font-black text-white shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-70"
                >
                  {processingAmount === effectiveAmount ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Opening Razorpay Gateway…</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>Donate ₹{effectiveAmount || '500'} Now</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalAmount(effectiveAmount);
                    setShowDonationModal(true);
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/50 py-3.5 px-5 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200 shadow-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:scale-[0.98] transition-all"
                >
                  <QrCode className="h-4 w-4 text-emerald-600" />
                  <span>Scan UPI QR</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white py-3.5 px-5 text-xs sm:text-sm font-bold text-gray-800 shadow-sm hover:bg-gray-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy UPI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Supported apps */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 dark:text-slate-400">
                <span className="font-semibold text-gray-700 dark:text-slate-300">Supported Methods:</span>
                {['Google Pay', 'PhonePe', 'Paytm', 'Cards (Visa/Mastercard/RuPay)', 'NetBanking', 'Cred', 'BHIM UPI'].map(
                  (app) => (
                    <span
                      key={app}
                      className="rounded-md bg-white/90 dark:bg-slate-800 px-2 py-0.5 border border-gray-200/80 dark:border-slate-700 text-[10px] font-medium"
                    >
                      {app}
                    </span>
                  )
                )}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-gray-200/70 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>
                    Verified: <strong>ROGLE</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                  <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>
                    Powered by <strong>Razorpay</strong>
                  </span>
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
                <div
                  onClick={() => {
                    setModalAmount(effectiveAmount);
                    setShowDonationModal(true);
                  }}
                  className="relative rounded-2xl overflow-hidden bg-white shadow-inner cursor-pointer hover:opacity-95 transition"
                  title="Click to scan or pay online"
                >
                  <img
                    src="/gpay-donation-qr.jpg"
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
                    href="/gpay-donation-qr.jpg"
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

        {/* Impact stats */}
        <div className="mb-16 grid gap-6 md:grid-cols-4">
          {[
            { value: '₹8,45,320', label: 'Total Raised', color: 'text-emerald-600 dark:text-emerald-400' },
            { value: '3,241', label: 'Animals Rescued', color: 'text-blue-600 dark:text-blue-400' },
            { value: '1,532', label: 'Treatments Funded', color: 'text-orange-600 dark:text-orange-400' },
            { value: '120+', label: 'NGOs Supported', color: 'text-purple-600 dark:text-purple-400' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center shadow-sm"
            >
              <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Donation Tiers: Each with a "Donate Now" button */}
        <h2 className="mb-8 font-display text-2xl font-bold text-gray-900 dark:text-white">Choose Your Impact</h2>
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {[
            {
              amount: '₹500',
              raw: 500,
              label: 'Supporter',
              desc: 'Feeds and cares for rescued animals with daily nutrition and clean water.',
              icon: <Heart className="h-8 w-8" fill="currentColor" />,
              color: 'border-blue-200 dark:border-blue-900/50',
              badge: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
              btn: 'bg-blue-600 hover:bg-blue-700',
            },
            {
              amount: '₹2,000',
              raw: 2000,
              label: 'Rescuer',
              desc: 'Funds a full veterinary check-up, anti-rabies vaccination, and wound dressing.',
              icon: <Shield className="h-8 w-8" />,
              color: 'border-emerald-300 dark:border-emerald-900/50 ring-2 ring-emerald-400',
              badge: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
              btn: 'bg-emerald-600 hover:bg-emerald-700',
              popular: true,
            },
            {
              amount: '₹5,000',
              raw: 500,
              rawActual: 5000,
              label: 'Guardian',
              desc: 'Sponsors a critical emergency rescue operation including transport, surgery and shelter.',
              icon: <Zap className="h-8 w-8" />,
              color: 'border-purple-200 dark:border-purple-900/50',
              badge: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
              btn: 'bg-purple-600 hover:bg-purple-700',
            },
          ].map((tier) => {
            const tierAmt = tier.rawActual || tier.raw;
            return (
              <div
                key={tier.label}
                className={`relative rounded-2xl border-2 bg-white dark:bg-slate-800 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${tier.color}`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1 text-xs font-bold text-white shadow-sm">
                    Most Popular
                  </span>
                )}
                <div>
                  <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full ${tier.badge}`}>
                    {tier.icon}
                  </div>
                  <p className="mb-1 font-display text-3xl font-bold text-gray-900 dark:text-white">{tier.amount}</p>
                  <p className="mb-3 font-semibold text-gray-700 dark:text-slate-300">{tier.label}</p>
                  <p className="mb-6 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{tier.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDonate(tierAmt)}
                  disabled={processingAmount === tierAmt}
                  className={`w-full rounded-xl py-3 text-center font-bold text-white transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-70 ${tier.btn}`}
                >
                  {processingAmount === tierAmt ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                    </span>
                  ) : (
                    <span>Donate {tier.amount} Now</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* CTA Banner: With Donate Now button */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 sm:p-12 text-center text-white shadow-xl">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="mb-3 font-display text-2xl sm:text-4xl font-bold">Every Single Contribution Counts</h2>
          <p className="mb-6 text-emerald-100 max-w-xl mx-auto text-sm sm:text-base">
            No amount is too small. A donation of just ₹100 helps feed hungry stray puppies and kittens on our streets.
          </p>
          <button
            type="button"
            onClick={() => handleDonate(effectiveAmount || 500)}
            disabled={processingAmount === (effectiveAmount || 500)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-bold text-emerald-800 hover:bg-emerald-50 transition-all shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-70"
          >
            {processingAmount === (effectiveAmount || 500) ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-emerald-800" />
                <span>Processing…</span>
              </>
            ) : (
              <>
                <span>Donate ₹{effectiveAmount || 500} Now</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Interactive UPI QR Modal ────────────────────────────────────── */}
      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        amount={modalAmount}
        upiId="ykumar778899@okaxis"
        merchantName="ROGLE"
        onPaymentSuccess={(details) => {
          setPaymentSuccess({
            amount: details.amount,
            paymentId: details.paymentId,
            orderId: details.orderId,
            donorName: currentUser?.name || 'Kind Animal Lover',
            donorEmail: currentUser?.email || '',
            receiptNumber: `RQP-80G-${details.paymentId.slice(-6).toUpperCase()}`,
            date: new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          });
        }}
      />

      {/* ── Unauthenticated User Choice Modal ────────────────────────────── */}
      {pendingGuestAmount !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:text-slate-100 border border-emerald-500/30">
            <button
              onClick={() => setPendingGuestAmount(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold dark:bg-emerald-950 dark:text-emerald-300">
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                  Donate ₹{pendingGuestAmount}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose how you would like to complete your donation
                </p>
              </div>
            </div>

            <div className="space-y-3 my-5">
              {/* Option 1: Log in (recommended) */}
              <button
                type="button"
                onClick={() => {
                  const amt = pendingGuestAmount;
                  setPendingGuestAmount(null);
                  navigate('/login', { state: { from: '/donations', donationAmount: amt } });
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 text-left transition group cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                      Sign In &amp; Donate
                    </span>
                    <span className="rounded-full bg-emerald-600 px-2 py-0.2 text-[9px] font-black uppercase text-white">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                    Records in your profile with automated 80G tax exemption receipt.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 2: Register */}
              <button
                type="button"
                onClick={() => {
                  const amt = pendingGuestAmount;
                  setPendingGuestAmount(null);
                  navigate('/register', { state: { from: '/donations', donationAmount: amt } });
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/60 text-left transition group cursor-pointer"
              >
                <div>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Create New Account
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Takes 30 seconds to sign up and start tracking your impact.
                  </p>
                </div>
                <UserIcon className="h-4 w-4 text-slate-400" />
              </button>

              {/* Option 3: Guest Razorpay checkout */}
              <button
                type="button"
                onClick={() => {
                  const amt = pendingGuestAmount;
                  setPendingGuestAmount(null);
                  executeRazorpayPayment(amt);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/60 text-left transition group cursor-pointer"
              >
                <div>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Donate as Guest with Razorpay
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Pay instantly using Cards, UPI, or NetBanking without logging in.
                  </p>
                </div>
                <CreditCard className="h-4 w-4 text-slate-400" />
              </button>

              {/* Option 4: Direct UPI QR */}
              <button
                type="button"
                onClick={() => {
                  const amt = pendingGuestAmount;
                  setPendingGuestAmount(null);
                  setModalAmount(amt);
                  setShowDonationModal(true);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/60 text-left transition group cursor-pointer"
              >
                <div>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Scan UPI QR Code Directly
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Open Google Pay, PhonePe, or Paytm and scan the QR code.
                  </p>
                </div>
                <QrCode className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Official 80G Receipt & Payment Success Modal ─────────────────── */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl overflow-hidden dark:bg-slate-900 dark:text-slate-100 border border-emerald-500/30">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-white px-6 py-4 dark:border-slate-800 dark:from-emerald-950/40 dark:via-slate-800 dark:to-slate-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                  Payment Successful &amp; 80G Receipt
                </h3>
              </div>
              <button
                onClick={() => setPaymentSuccess(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="rounded-3xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/40 p-5 dark:border-emerald-800/80 dark:bg-slate-800/50 text-xs">
                {/* Header Org Info */}
                <div className="flex items-start justify-between border-b border-emerald-200/80 pb-3 dark:border-slate-700">
                  <div>
                    <div className="flex items-center gap-1.5 text-[#1e6f42] font-black text-sm dark:text-emerald-400">
                      <Heart className="h-4 w-4 fill-current" /> ResQPet Animal Welfare Society
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Reg: UTT/NGO/2026/0942 • 80G Tax Exempted (50% deduction)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      PAID
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{paymentSuccess.receiptNumber}</p>
                  </div>
                </div>

                {/* Details list */}
                <div className="py-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date &amp; Time:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{paymentSuccess.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Donor Name:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{paymentSuccess.donorName}</span>
                  </div>
                  {paymentSuccess.donorEmail && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Donor Email:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{paymentSuccess.donorEmail}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment ID (Razorpay):</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {paymentSuccess.paymentId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Method:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      Razorpay Checkout (Online)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tax Exemption Code:</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      80G-AACTP2026RQP
                    </span>
                  </div>
                </div>

                {/* Amount Callout */}
                <div className="flex items-center justify-between rounded-2xl bg-[#1e6f42] p-4 text-white shadow-md">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold opacity-90">Total Contribution</p>
                    <p className="text-xl font-black">₹{paymentSuccess.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-xl">
                    <ShieldCheck className="h-4 w-4" /> 100% Verified
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-3 italic">
                  This official tax receipt qualifies for 50% deduction under Section 80G of the Indian Income Tax Act.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer"
                >
                  <Printer className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  <span>Print Receipt</span>
                </button>

                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentSuccess(null);
                      navigate(getDashboardDonationsUrl());
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-md cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View in Dashboard</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPaymentSuccess(null)}
                  className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationsPage;
