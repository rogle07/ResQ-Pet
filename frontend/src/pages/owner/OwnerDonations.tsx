import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { donationApi, type Donation } from "@/features/donations/donationApi";
import { useAppSelector } from "@/app/hooks";
import { openRazorpayCheckout } from "@/utils/razorpay";
import {
  Heart, CreditCard, History, TrendingUp, DollarSign, Repeat, Gift,
  ShieldCheck, CheckCircle2, AlertCircle, X, Loader2, Receipt, Sparkles,
  Zap, BarChart3, PawPrint, Syringe, Home, Utensils, ChevronRight,
  Star, Clock, ArrowUpRight, Lock, Globe, RefreshCw,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────────── */
interface DonationFormValues {
  type: "one_time" | "monthly" | "food" | "medicine" | "rescue";
  currency: string;
  message: string;
  isRecurring: boolean;
  customAmount: string;
}

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

const DONATION_TYPES: {
  value: "one_time"|"monthly"|"food"|"medicine"|"rescue";
  label: string;
  desc: string;
  icon: JSX.Element;
}[] = [
  { value: "one_time", label: "One-Time Gift",  desc: "Single donation to support pet rescue",  icon: <Gift     className="h-4 w-4" /> },
  { value: "monthly",  label: "Monthly Pledge", desc: "Recurring monthly contribution",          icon: <Repeat   className="h-4 w-4" /> },
  { value: "food",     label: "Food Fund",      desc: "Feed rescued animals in shelters",        icon: <Utensils className="h-4 w-4" /> },
  { value: "medicine", label: "Medical Care",   desc: "Vaccines, surgeries & treatments",        icon: <Syringe  className="h-4 w-4" /> },
  { value: "rescue",   label: "Rescue Ops",     desc: "Fund emergency rescue operations",        icon: <Zap      className="h-4 w-4" /> },
];

const TYPE_COLOR: Record<string,string> = {
  one_time: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  monthly:  "bg-blue-100   text-blue-700   dark:bg-blue-950/60   dark:text-blue-300",
  food:     "bg-amber-100  text-amber-700  dark:bg-amber-950/60  dark:text-amber-300",
  medicine: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  rescue:   "bg-red-100    text-red-700    dark:bg-red-950/60    dark:text-red-300",
};

const STATUS_COLOR: Record<string,string> = {
  succeeded: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  pending:   "bg-amber-100   text-amber-800  border-amber-200   dark:bg-amber-950/60  dark:text-amber-300  dark:border-amber-800",
  failed:    "bg-red-100     text-red-800    border-red-200     dark:bg-red-950/60    dark:text-red-300    dark:border-red-800",
  refunded:  "bg-slate-100   text-slate-700  border-slate-200   dark:bg-slate-800     dark:text-slate-300  dark:border-slate-700",
};

const CURRENCIES = ["INR","USD","EUR","GBP"];

const IMPACT_STATS = [
  { icon: <PawPrint className="h-5 w-5" />, value: "1,240+", label: "Pets Rescued",       color: "text-emerald-500" },
  { icon: <Home     className="h-5 w-5" />, value: "380+",   label: "Shelters Supported", color: "text-blue-500"    },
  { icon: <Syringe  className="h-5 w-5" />, value: "5,600+", label: "Treatments Funded",  color: "text-purple-500"  },
  { icon: <Heart    className="h-5 w-5" />, value: "92%",    label: "Funds to Animals",   color: "text-rose-500"    },
];

const MOCK: Donation[] = [
  { _id:"d-001", donor:{_id:"u1",name:"You"}, type:"monthly",  amount:500,  currency:"INR", status:"succeeded", isRecurring:true,  message:"Keep up the great work!", createdAt: new Date(Date.now()-2*86400000).toISOString() },
  { _id:"d-002", donor:{_id:"u1",name:"You"}, type:"medicine", amount:1000, currency:"INR", status:"succeeded", isRecurring:false, message:"For the injured dog.",     createdAt: new Date(Date.now()-10*86400000).toISOString() },
  { _id:"d-003", donor:{_id:"u1",name:"You"}, type:"food",     amount:250,  currency:"INR", status:"succeeded", isRecurring:false,                                     createdAt: new Date(Date.now()-20*86400000).toISOString() },
  { _id:"d-004", donor:{_id:"u1",name:"You"}, type:"rescue",   amount:2500, currency:"INR", status:"pending",   isRecurring:false,                                     createdAt: new Date(Date.now()-86400000).toISOString() },
];

/* ── Receipt Modal ──────────────────────────────────────────── */
function ReceiptModal({ donation, onClose }: { donation: Donation; onClose: () => void }) {
  const dt = new Date(donation.createdAt);
  const ti = DONATION_TYPES.find(t => t.value === donation.type);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Receipt className="h-5 w-5 text-white" /></div>
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Payment Receipt</p>
              <p className="text-white font-bold text-lg">ResQPet Donation</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"><X className="h-4 w-4 text-white" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{donation.currency} {donation.amount.toLocaleString()}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Successfully processed</p>
          </div>
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-200 dark:divide-slate-700 text-sm">
            {([
              ["Donation Type", ti?.label ?? donation.type],
              ["Date", dt.toLocaleDateString("en-IN", {day:"numeric",month:"long",year:"numeric"})],
              ["Time", dt.toLocaleTimeString("en-IN", {hour:"2-digit",minute:"2-digit"})],
              ["Reference ID", donation._id],
              ["Status", donation.status],
            ] as [string,string][]).map(([label, val]) => (
              <div key={label} className="flex justify-between px-4 py-3">
                <span className="text-slate-500 dark:text-slate-400">{label}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px] capitalize">{val}</span>
              </div>
            ))}
          </div>
          {donation.message && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Your message</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{donation.message}"</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Close</button>
            <button onClick={() => window.print()} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"><Receipt className="h-4 w-4" />Print Receipt</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Card input row ─────────────────────────────────────────── */
function CardInputRow() {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 bg-slate-50/60 dark:bg-slate-800/40 flex items-center gap-3">
      <CreditCard className="h-5 w-5 text-slate-400 flex-shrink-0" />
      <input id="card-number" type="text" placeholder="Card number" maxLength={19}
        className="flex-1 bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 text-sm outline-none"
        onChange={e => { const r=e.target.value.replace(/\D/g,"").slice(0,16); e.target.value=r.match(/.{1,4}/g)?.join(" ")||r; }} />
      <input id="card-expiry" type="text" placeholder="MM/YY" maxLength={5}
        className="w-14 bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 text-sm outline-none text-center"
        onChange={e => { const r=e.target.value.replace(/\D/g,"").slice(0,4); e.target.value=r.length>=2?r.slice(0,2)+"/"+r.slice(2):r; }} />
      <input id="card-cvc" type="text" placeholder="CVC" maxLength={4}
        className="w-10 bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 text-sm outline-none text-center" />
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
type Tab = "donate" | "history" | "impact";

const OwnerDonations = () => {
  const currentUser = useAppSelector((s) => s.auth.user);
  const [tab, setTab]               = useState<Tab>("donate");
  const [donations, setDonations]   = useState<Donation[]>(MOCK);
  const [histLoading, setHistLoading] = useState(false);
  const [selAmt, setSelAmt]         = useState<number|null>(500);
  const [receipt, setReceipt]       = useState<Donation|null>(null);
  const [step, setStep]             = useState<"form"|"payment"|"success">("form");
  const [serverErr, setServerErr]   = useState("");
  const [successDon, setSuccessDon] = useState<Donation|null>(null);
  const [fStatus, setFStatus]       = useState("all");
  const [fType,   setFType]         = useState("all");
  const [paying,  setPaying]        = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState:{isSubmitting} } =
    useForm<DonationFormValues>({
      defaultValues: { type:"one_time", currency:"INR", message:"", isRecurring:false, customAmount:"" }
    });

  const wType     = watch("type");
  const wRecur    = watch("isRecurring");
  const wCustom   = watch("customAmount");
  const wCurrency = watch("currency");
  const wMessage  = watch("message");

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    try { const r = await donationApi.history(); if(r.length) setDonations(r); } catch {}
    finally { setHistLoading(false); }
  }, []);

  useEffect(() => { if(tab==="history") loadHistory(); }, [tab, loadHistory]);

  const onSubmitForm = async (_data: DonationFormValues) => {
    setServerErr("");
    const amt = wCustom ? Number(wCustom) : selAmt ?? 0;
    if(!amt || amt < 1) { setServerErr("Please select or enter a valid amount."); return; }
    // Directly open Razorpay popup (no intermediate card step needed)
    setStep("payment");
  };

  const confirmPay = async () => {
    setPaying(true); setServerErr("");
    const amt = wCustom ? Number(wCustom) : selAmt ?? 500;
    try {
      // Open Razorpay checkout popup
      const response = await openRazorpayCheckout({
        amount: amt,
        currency: wCurrency === 'INR' ? 'INR' : 'INR', // Razorpay supports INR
        name: 'ResQPet Foundation',
        description: `${DONATION_TYPES.find(t => t.value === wType)?.label ?? 'Donation'} – Animal Rescue & Care`,
        image: '/logo.png',
        prefill: {
          name: currentUser?.name || 'Donor',
          email: currentUser?.email || '',
          contact: currentUser?.phone || '',
        },
        notes: {
          donationType: wType,
          isRecurring: String(wRecur),
          message: wMessage,
        },
        theme: { color: '#16a34a' },
      });

      const rzpPaymentId = response.razorpay_payment_id;

      // Notify backend (best-effort)
      try {
        await donationApi.create({
          amount: amt,
          type: wType,
          currency: wCurrency,
          message: wMessage,
          isRecurring: wRecur,
        });
      } catch { /* silent – backend may be offline */ }

      const done: Donation = {
        _id: `RZP-${rzpPaymentId}`,
        donor: { _id: "me", name: currentUser?.name || "You" },
        type: wType, amount: amt, currency: wCurrency,
        status: "succeeded", isRecurring: wRecur, message: wMessage,
        createdAt: new Date().toISOString(),
      };
      setDonations(p => [done, ...p]);
      setSuccessDon(done); setStep("success");
    } catch (err: unknown) {
      const errMsg = (err as Error)?.message || '';
      if (errMsg.includes('cancelled')) {
        setServerErr('Payment was cancelled. Please try again.');
      } else {
        setServerErr('Payment could not be completed. Please try again.');
      }
    } finally {
      setPaying(false);
    }
  };

  const resetFlow = () => { reset(); setSelAmt(500); setStep("form"); setSuccessDon(null); setServerErr(""); };

  const filtered = donations.filter(d =>
    (fStatus==="all" || d.status===fStatus) && (fType==="all" || d.type===fType)
  );
  const total = donations.filter(d=>d.status==="succeeded").reduce((s,d)=>s+d.amount, 0);

  const TABS = [
    { id:"donate"  as Tab, label:"Make a Donation", icon:<Heart      className="h-4 w-4" /> },
    { id:"history" as Tab, label:"My Donations",    icon:<History     className="h-4 w-4" /> },
    { id:"impact"  as Tab, label:"Impact & Stats",  icon:<TrendingUp  className="h-4 w-4" /> },
  ];

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Donations &amp; Giving</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Support animal rescue, care, and shelter operations</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {IMPACT_STATS.map(s => (
              <div key={s.label} className="bg-white dark:bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3 shadow-sm">
                <span className={s.color}>{s.icon}</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{s.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab bar ─────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-1 mb-6 shadow-sm w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${tab===t.id ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ════════════════════ DONATE TAB ════════════════════════ */}
        {tab==="donate" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Left: form / payment / success */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden">

                {/* ─ STEP 1: form ─ */}
                {step==="form" && (
                  <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center"><span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">1</span></div>
                      <h2 className="font-semibold text-slate-800 dark:text-slate-200">Choose Donation Type</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {DONATION_TYPES.map(dt => (
                        <label key={dt.value} className={`relative flex flex-col gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${wType===dt.value ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                          <input type="radio" value={dt.value} {...register("type")} className="sr-only" />
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${wType===dt.value ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>{dt.icon}</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{dt.label}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{dt.desc}</span>
                          {wType===dt.value && <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-emerald-500" />}
                        </label>
                      ))}
                    </div>

                    {/* Recurring toggle */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/40 rounded-xl px-4 py-3 border border-slate-200/60 dark:border-slate-600/60">
                      <div className="flex items-center gap-3">
                        <Repeat className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Monthly Recurring</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Auto-debit every month</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" {...register("isRecurring")} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
                      </label>
                    </div>

                    {/* Amount selector */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center"><span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">2</span></div>
                        <h2 className="font-semibold text-slate-800 dark:text-slate-200">Select Amount</h2>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {PRESET_AMOUNTS.map(amt => (
                          <button key={amt} type="button"
                            onClick={() => { setSelAmt(amt); setValue("customAmount",""); }}
                            className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${selAmt===amt && !wCustom ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-700"}`}>
                            &#8377;{amt.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-medium">&#8377;</span>
                        <input id="custom-amount" type="number" min={1} placeholder="Enter custom amount..."
                          {...register("customAmount")}
                          onChange={e => { register("customAmount").onChange(e); setSelAmt(null); }}
                          className="w-full pl-7 pr-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 text-slate-800 dark:text-slate-200 placeholder-slate-400 text-sm outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors" />
                      </div>
                    </div>

                    {/* Currency */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Currency</label>
                      <div className="flex gap-2">
                        {CURRENCIES.map(c => (
                          <label key={c} className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg border-2 cursor-pointer transition-all ${wCurrency===c ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300"}`}>
                            <input type="radio" value={c} {...register("currency")} className="sr-only" />{c}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message (optional)</label>
                      <textarea id="donation-message" rows={2} placeholder="Leave a kind message for the animals..."
                        {...register("message")}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 text-slate-800 dark:text-slate-200 placeholder-slate-400 text-sm outline-none focus:border-emerald-500 dark:focus:border-emerald-500 resize-none transition-colors" />
                    </div>

                    {serverErr && (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />{serverErr}
                      </div>
                    )}

                    <button id="proceed-to-payment-btn" type="submit" disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isSubmitting
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <><Lock className="h-4 w-4" />Donate via Razorpay<ChevronRight className="h-4 w-4" /></>}
                    </button>
                    <p className="text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
                      <ShieldCheck className="h-3 w-3" />Secured by Razorpay &middot; PCI-DSS Compliant
                    </p>
                  </form>
                )}

                {/* ─ STEP 2: payment ─ */}
                {step==="payment" && (
                  <div className="p-6 space-y-6">
                    <button onClick={() => setStep("form")} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1">&larr; Back</button>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30">
                        <CreditCard className="h-7 w-7 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complete Payment</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Donating{" "}
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {wCurrency} {(wCustom ? Number(wCustom) : selAmt ?? 0).toLocaleString()}
                        </span>{" "}
                        for{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {DONATION_TYPES.find(t => t.value===wType)?.label}
                        </span>
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Cardholder Name</label>
                        <input id="cardholder-name" type="text" placeholder="Full name on card"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 text-slate-800 dark:text-slate-200 placeholder-slate-400 text-sm outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Card Details</label>
                        <CardInputRow />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Billing Email</label>
                        <input id="billing-email" type="email" placeholder="your@email.com"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 text-slate-800 dark:text-slate-200 placeholder-slate-400 text-sm outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors" />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-3">or pay via</p>
                      <div className="grid grid-cols-3 gap-2">
                        {["UPI / GPay", "Net Banking", "Wallets"].map(m => (
                          <button key={m} type="button"
                            className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/40 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {serverErr && (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />{serverErr}
                      </div>
                    )}

                    <button id="confirm-payment-btn" type="button" disabled={paying} onClick={confirmPay}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {paying
                        ? <><Loader2 className="h-4 w-4 animate-spin" />Opening Razorpay&hellip;</>
                        : <><Lock className="h-4 w-4" />Pay via Razorpay &middot; {wCurrency} {(wCustom ? Number(wCustom) : selAmt ?? 0).toLocaleString()}</>}
                    </button>
                    <p className="text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
                      <ShieldCheck className="h-3 w-3" />Powered by Razorpay &middot; Your payment details are secure
                    </p>
                  </div>
                )}

                {/* ─ STEP 3: success ─ */}
                {step==="success" && successDon && (
                  <div className="p-6 text-center space-y-5">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-400/30 animate-bounce">
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Thank You! 🐾</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                        Your donation of{" "}
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {successDon.currency} {successDon.amount.toLocaleString()}
                        </span>{" "}
                        has been processed successfully.
                      </p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-200/60 dark:border-emerald-900/60 text-left space-y-2">
                      {([
                        ["Amount",    `${successDon.currency} ${successDon.amount.toLocaleString()}`],
                        ["Type",      DONATION_TYPES.find(t=>t.value===successDon.type)?.label ?? successDon.type],
                        ["Recurring", successDon.isRecurring ? "Yes – Monthly" : "No"],
                        ["Reference", successDon._id],
                      ] as [string,string][]).map(([l,v]) => (
                        <div key={l} className="flex justify-between text-sm">
                          <span className="text-slate-500 dark:text-slate-400">{l}</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 font-mono text-xs truncate max-w-[200px]">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setReceipt(successDon)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors flex items-center justify-center gap-2">
                        <Receipt className="h-4 w-4" />View Receipt
                      </button>
                      <button onClick={resetFlow} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2">
                        <Heart className="h-4 w-4" />Donate Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: sidebar */}
            <div className="lg:col-span-2 space-y-4">

              {/* Trust signals */}
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-5">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-4">Why Give to ResQPet?</h3>
                <div className="space-y-3">
                  {[
                    { icon:<ShieldCheck className="h-4 w-4 text-emerald-500" />, title:"100% Secure Payments",  desc:"Razorpay PCI-DSS compliant processing" },
                    { icon:<Globe       className="h-4 w-4 text-blue-500"    />, title:"Verified NGO Partners", desc:"All funds go to registered shelters" },
                    { icon:<BarChart3   className="h-4 w-4 text-purple-500"  />, title:"Full Transparency",     desc:"Track exactly how your money is used" },
                    { icon:<Receipt     className="h-4 w-4 text-amber-500"   />, title:"Instant Receipts",      desc:"Download receipts for tax benefits" },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active campaigns */}
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Active Campaigns</h3>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    { title:"Emergency Flood Relief",   raised:48500, goal:75000, donors:124, urgent:true,  days:3  },
                    { title:"Winter Shelter Fund",      raised:22000, goal:50000, donors:87,  urgent:false, days:18 },
                    { title:"Rabies Vaccination Drive", raised:9800,  goal:20000, donors:45,  urgent:false, days:12 },
                  ].map(c => {
                    const pct = Math.round(c.raised / c.goal * 100);
                    return (
                      <div key={c.title} className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.title}</p>
                          {c.urgent && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">URGENT</span>}
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all" style={{width:`${pct}%`}} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                          <span>&#8377;{c.raised.toLocaleString()} raised &middot; {c.donors} donors</span>
                          <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{c.days}d left</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Giving summary */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20 p-5 text-white">
                <div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4" /><h3 className="font-semibold text-sm">Your Giving Summary</h3></div>
                <p className="text-3xl font-bold mb-0.5">&#8377;{total.toLocaleString()}</p>
                <p className="text-white/70 text-xs mb-4">Total contributed &middot; All time</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/15 rounded-xl p-3"><p className="text-lg font-bold">{donations.filter(d=>d.status==="succeeded").length}</p><p className="text-white/70 text-xs">Donations Made</p></div>
                  <div className="bg-white/15 rounded-xl p-3"><p className="text-lg font-bold">{donations.filter(d=>d.isRecurring).length}</p><p className="text-white/70 text-xs">Recurring Gifts</p></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ HISTORY TAB ═══════════════════════ */}
        {tab==="history" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label:"Total Donated",   value:`&#8377;${total.toLocaleString()}`,                         icon:<DollarSign className="h-5 w-5 text-emerald-500" />, bg:"bg-emerald-50 dark:bg-emerald-950/30" },
                { label:"Donations Count", value:donations.filter(d=>d.status==="succeeded").length.toString(), icon:<Heart      className="h-5 w-5 text-rose-500"    />, bg:"bg-rose-50 dark:bg-rose-950/30"      },
                { label:"Recurring Gifts", value:donations.filter(d=>d.isRecurring).length.toString(),           icon:<RefreshCw  className="h-5 w-5 text-blue-500"   />, bg:"bg-blue-50 dark:bg-blue-950/30"      },
              ].map(c => (
                <div key={c.label} className={`${c.bg} rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 flex items-center gap-4`}>
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">{c.icon}</div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white" dangerouslySetInnerHTML={{__html: c.value}} />
                    <p className="text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-4 flex flex-wrap gap-3 items-center">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Filter by:</span>
              <select id="filter-status" value={fStatus} onChange={e => setFStatus(e.target.value)}
                className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-slate-50 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500">
                <option value="all">All Status</option>
                {["succeeded","pending","failed","refunded"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
              <select id="filter-type" value={fType} onChange={e => setFType(e.target.value)}
                className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-slate-50 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500">
                <option value="all">All Types</option>
                {DONATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <button onClick={loadHistory} className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <RefreshCw className={`h-3.5 w-3.5 ${histLoading ? "animate-spin" : ""}`} />Refresh
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden">
              {histLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 text-emerald-500 animate-spin" /></div>
              ) : filtered.length===0 ? (
                <div className="text-center py-16">
                  <Heart className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No donations found</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Try changing your filters</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filtered.map(d => {
                    const ti  = DONATION_TYPES.find(t => t.value===d.type);
                    const dt2 = new Date(d.createdAt);
                    return (
                      <div key={d._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_COLOR[d.type]}`}>{ti?.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ti?.label ?? d.type}</p>
                            {d.isRecurring && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <Repeat className="h-2.5 w-2.5" />Monthly
                              </span>
                            )}
                          </div>
                          {d.message && <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 italic">"{d.message}"</p>}
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            {dt2.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} &middot; {dt2.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{d.currency} {d.amount.toLocaleString()}</p>
                          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 capitalize ${STATUS_COLOR[d.status]}`}>{d.status}</span>
                        </div>
                        {d.status==="succeeded" && (
                          <button onClick={() => setReceipt(d)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 transition-colors">
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════ IMPACT TAB ════════════════════════ */}
        {tab==="impact" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2"><Sparkles className="h-5 w-5" /><span className="text-sm font-semibold text-white/80">Your Impact Report</span></div>
                  <h2 className="text-3xl font-bold mb-1">&#8377;{total.toLocaleString()}</h2>
                  <p className="text-white/80 text-sm">Total lifetime contributions</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center"><Star className="h-7 w-7 text-white" /></div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {([
                  ["Pets Helped",  Math.ceil(total/200)],
                  ["Meals Funded", Math.ceil(total/50)],
                  ["Vet Visits",   Math.ceil(total/500)],
                ] as [string,number][]).map(([l,v]) => (
                  <div key={l} className="bg-white/15 rounded-xl p-3 text-center"><p className="text-xl font-bold">{v}</p><p className="text-white/70 text-xs mt-0.5">{l}</p></div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-500" />Giving Breakdown by Category
              </h3>
              <div className="space-y-3">
                {DONATION_TYPES.map(dt => {
                  const typeTotal = donations.filter(d=>d.type===dt.value && d.status==="succeeded").reduce((s,d)=>s+d.amount,0);
                  const pct = total > 0 ? Math.round(typeTotal/total*100) : 0;
                  return (
                    <div key={dt.value} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${TYPE_COLOR[dt.value]}`}>{dt.icon}</span>
                          <span className="text-sm text-slate-700 dark:text-slate-300">{dt.label}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">&#8377;{typeTotal.toLocaleString()}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">({pct}%)</span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700" style={{width:`${pct}%`}} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />Donor Achievements
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { emoji:"🐾", title:"First Paw",          desc:"Made your first donation",   earned:donations.length>0 },
                  { emoji:"💚", title:"Compassionate Heart", desc:"Donated ₹1,000+",            earned:total>=1000 },
                  { emoji:"🔄", title:"Steady Supporter",    desc:"Set up recurring gift",       earned:donations.some(d=>d.isRecurring) },
                  { emoji:"🏥", title:"Medical Hero",        desc:"Funded medical care",         earned:donations.some(d=>d.type==="medicine") },
                  { emoji:"⭐", title:"Super Donor",         desc:"Donated ₹5,000+",            earned:total>=5000 },
                  { emoji:"🦺", title:"Rescue Champion",     desc:"Supported rescue ops",        earned:donations.some(d=>d.type==="rescue") },
                ].map(b => (
                  <div key={b.title} className={`rounded-xl p-3 border-2 text-center transition-all ${b.earned ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 opacity-50 grayscale"}`}>
                    <span className="text-2xl">{b.emoji}</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{b.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{b.desc}</p>
                    {b.earned && <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5 block">✓ Earned</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
      {receipt && <ReceiptModal donation={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
};

export default OwnerDonations;
