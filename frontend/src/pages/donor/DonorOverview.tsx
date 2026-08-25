import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  Search,
  Crown,
  Lock,
  Download,
  CheckCircle,
  Sparkles,
  CreditCard,
  Building,
  Wallet,
  Smartphone,
  Users,
  Calendar,
  DollarSign,
  PawPrint,
} from 'lucide-react';
import {
  SUPPORTED_TEAMS,
  FEATURED_CAMPAIGNS,
  RECENT_DONORS_FEED,
  DONOR_IMPACT_DATA,
} from '@/data/donorMockData';
import { SupportedTeam, DonorCampaign } from '@/types/donor';

export const DonorOverview: React.FC = () => {
  // Quick Donation Widget State
  const [quickAmount, setQuickAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('500');
  const [selectedCampaign, setSelectedCampaign] = useState<DonorCampaign | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<SupportedTeam | null>(null);

  // Modals
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Team Carousel scroll offset
  const [teamScrollIndex, setTeamScrollIndex] = useState(0);

  // Quick donation amount presets
  const presets = [100, 500, 1000, 2500];

  const handleSelectPreset = (amount: number) => {
    setQuickAmount(amount);
    setCustomAmount(String(amount));
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setQuickAmount(num);
    }
  };

  const handleDonateTrigger = (campaign?: DonorCampaign, team?: SupportedTeam) => {
    if (campaign) setSelectedCampaign(campaign);
    if (team) setSelectedTeam(team);
    setShowCheckoutModal(true);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setShowCheckoutModal(false);
      setShowReceiptModal(true);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ─── Top 5 KPI Metrics Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Donations */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Total Donations</span>
            <h3 className="font-display text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-1">
              ₹1,28,450
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              ↗ 18% <span className="text-slate-400 font-normal">from last month</span>
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Total Donations Count */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Total Donations</span>
            <h3 className="font-display text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-1">
              56
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              ↗ 12% <span className="text-slate-400 font-normal">from last month</span>
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shrink-0">
            <PawPrint className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Lives Impacted */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Lives Impacted</span>
            <h3 className="font-display text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-1">
              312
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              ↗ 20% <span className="text-slate-400 font-normal">from last month</span>
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 shrink-0">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Active Campaigns */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Active Campaigns</span>
            <h3 className="font-display text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-1">
              14
            </h3>
            <span className="text-[11px] font-bold text-slate-400 mt-1 block">
              Ongoing campaigns
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        {/* Card 5: Your Impact Score */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Your Impact Score</span>
            <h3 className="font-display text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-1">
              320
            </h3>
            <span className="text-[11px] font-bold text-pink-600 dark:text-pink-400 mt-1 block">
              Keep up the kindness!
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400 shrink-0">
            <Heart className="h-6 w-6 fill-current" />
          </div>
        </div>
      </div>

      {/* ─── Row 1: Choose a Team to Support (Col 1-9) | Make a Quick Donation Widget (Col 10-12) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Choose a Team to Support (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
                Choose a Team to Support
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your donation will help teams continue their amazing work.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTeamScrollIndex((prev) => Math.max(0, prev - 1))}
                disabled={teamScrollIndex === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTeamScrollIndex((prev) => Math.min(SUPPORTED_TEAMS.length - 3, prev + 1))}
                disabled={teamScrollIndex >= SUPPORTED_TEAMS.length - 3}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Teams Grid / Horizontal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center text-xs">
            {SUPPORTED_TEAMS.map((team) => (
              <div
                key={team.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 flex flex-col justify-between items-center space-y-2 hover:border-purple-200 transition-all hover:scale-105"
              >
                {/* Team Icon & Animal Photo */}
                <div className="relative">
                  <img
                    src={team.avatar}
                    alt={team.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm dark:border-slate-700"
                  />
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-700 text-white shadow">
                    {team.iconType === 'shield' && <Shield className="h-3 w-3" />}
                    {team.iconType === 'heart-hand' && <Heart className="h-3 w-3 fill-current" />}
                    {team.iconType === 'ambulance' && <Sparkles className="h-3 w-3" />}
                    {team.iconType === 'search' && <Search className="h-3 w-3" />}
                    {team.iconType === 'crown' && <Crown className="h-3 w-3" />}
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{team.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                    {team.description}
                  </p>
                </div>

                <button
                  onClick={() => handleDonateTrigger(undefined, team)}
                  className={`w-full rounded-xl py-1.5 text-[11px] font-bold transition-all shadow-sm ${
                    team.accentColor === 'purple'
                      ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300'
                      : team.accentColor === 'orange'
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                      : team.accentColor === 'emerald'
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : team.accentColor === 'blue'
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300'
                  }`}
                >
                  Donate Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Make a Quick Donation Widget (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 text-xs">
          <div>
            <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
              Make a Quick Donation
            </h3>
            <p className="text-slate-500 text-[11px]">Enter amount to donate</p>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-lg font-black text-slate-800 dark:text-slate-200">
              ₹
            </span>
            <input
              type="number"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder="500"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-base font-black text-slate-900 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {presets.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleSelectPreset(amt)}
                className={`rounded-xl py-2 font-bold text-xs transition-all ${
                  quickAmount === amt
                    ? 'bg-purple-700 text-white shadow-md shadow-purple-950/20'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleDonateTrigger()}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-purple-700 py-3 text-xs font-black text-white hover:bg-purple-800 shadow-md shadow-purple-950/20 transition-all hover:scale-105"
          >
            <Heart className="h-4 w-4 fill-current" /> Donate Now
          </button>

          <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3 text-slate-400" /> Your payment is 100% secure
          </p>
        </div>
      </div>

      {/* ─── Row 2: Featured Campaigns (Col 1-8) | Why Donate & Recent Donors (Col 9-12) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Featured Campaigns (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
                Featured Campaigns
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Support our ongoing campaigns and save more animals.
              </p>
            </div>
            <Link
              to="/donor/campaigns"
              className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline"
            >
              View All Campaigns
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURED_CAMPAIGNS.map((camp) => {
              const progressPct = Math.round((camp.raisedAmount / camp.targetAmount) * 100);
              return (
                <div
                  key={camp.id}
                  className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between text-xs group"
                >
                  <div className="relative h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={camp.image}
                      alt={camp.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white">
                      {camp.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-display text-sm font-black text-slate-900 dark:text-white">
                        {camp.title}
                      </h4>
                      <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">
                        {camp.description}
                      </p>
                    </div>

                    {/* Progress Bar & Amounts */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-purple-700 dark:text-purple-400">
                          ₹{camp.raisedAmount.toLocaleString()} <span className="text-slate-400 font-normal">/ ₹{camp.targetAmount.toLocaleString()}</span>
                        </span>
                        <span className="text-slate-500 font-bold">{progressPct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-700 transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleDonateTrigger(camp)}
                      className="w-full rounded-xl border border-purple-200 bg-purple-50/60 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300 transition-colors"
                    >
                      Donate Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Donate & Recent Donors (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Why Donate Box */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 text-xs">
            <h3 className="font-display text-sm font-extrabold text-slate-900 dark:text-white">
              Why Donate?
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                  <PawPrint className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Direct Impact</h4>
                  <p className="text-[11px] text-slate-400">Your donation helps animals in immediate need.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Trusted & Verified</h4>
                  <p className="text-[11px] text-slate-400">All teams are verified and monitored regularly.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400 shrink-0">
                  <Heart className="h-3.5 w-3.5 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Transparency</h4>
                  <p className="text-[11px] text-slate-400">We provide regular updates and impact reports.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Donors Feed */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
              <h3 className="font-display text-sm font-extrabold text-slate-900 dark:text-white">
                Recent Donors
              </h3>
              <Link to="/donor/history" className="text-[11px] font-bold text-purple-700 dark:text-purple-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {RECENT_DONORS_FEED.map((donor) => (
                <div key={donor.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs ${donor.avatarColor}`}>
                      {donor.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{donor.name}</h4>
                      <span className="text-[10px] text-slate-400">{donor.timeAgo}</span>
                    </div>
                  </div>
                  <span className="font-mono font-black text-slate-900 dark:text-white">
                    ₹{donor.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 80G Tax Exemption Receipt Banner */}
          <div className="rounded-3xl border border-purple-100 bg-purple-50/60 p-4 dark:border-purple-900/40 dark:bg-purple-950/30 space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Donation Receipt</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  All donations are tax exempted under Section 80G of Income Tax Act.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowReceiptModal(true)}
              className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-white border border-purple-200 py-2 text-xs font-bold text-purple-800 hover:bg-purple-100 dark:bg-slate-800 dark:border-purple-800 dark:text-purple-300 shadow-sm transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Download Receipt
            </button>
          </div>
        </div>
      </div>

      {/* ─── Row 3: Secure Payment Options & Your Impact ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
        {/* Secure Payment Options (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div>
            <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
              Secure Payment Options
            </h3>
            <p className="text-slate-500 text-[11px]">We ensure safe and secure transactions.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <Smartphone className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <span className="font-bold block text-slate-900 dark:text-white">UPI</span>
              <span className="text-[9px] text-slate-400">Pay using any UPI app</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <CreditCard className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <span className="font-bold block text-slate-900 dark:text-white">Card</span>
              <span className="text-[9px] text-slate-400">Debit / Credit Card</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <Building className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <span className="font-bold block text-slate-900 dark:text-white">Net Banking</span>
              <span className="text-[9px] text-slate-400">All major banks</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <Wallet className="h-5 w-5 text-amber-600 mx-auto mb-1" />
              <span className="font-bold block text-slate-900 dark:text-white">Wallets</span>
              <span className="text-[9px] text-slate-400">PhonePe, Paytm, etc.</span>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 100% Secure SSL
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-blue-600" /> Verified Teams
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-purple-600" /> 80G Certified
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5 text-pink-600" /> Quick Receipt
            </span>
          </div>
        </div>

        {/* Your Impact (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div>
            <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
              Your Impact
            </h3>
            <p className="text-slate-500 text-[11px]">See how your donation makes a difference.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                <PawPrint className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display text-lg font-black text-slate-900 dark:text-white">
                  {DONOR_IMPACT_DATA.animalsRescued}
                </h4>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Animals Rescued</p>
                <span className="text-[10px] text-slate-400">This Month</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display text-lg font-black text-slate-900 dark:text-white">
                  {DONOR_IMPACT_DATA.medicalTreatments}
                </h4>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Medical Treatments</p>
                <span className="text-[10px] text-slate-400">This Month</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white font-bold">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display text-lg font-black text-slate-900 dark:text-white">
                  {DONOR_IMPACT_DATA.shelterDays}
                </h4>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Shelter Support</p>
                <span className="text-[10px] text-slate-400">This Month</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/40 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-600 text-white font-bold">
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h4 className="font-display text-lg font-black text-slate-900 dark:text-white">
                  {DONOR_IMPACT_DATA.volunteersEquipped}
                </h4>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Volunteers Supported</p>
                <span className="text-[10px] text-slate-400">This Month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer Quote ─── */}
      <div className="text-center pt-4 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
        <Heart className="h-3.5 w-3.5 text-purple-600 fill-current" />
        <span>Thank you for being a part of our mission. Together, we can create a better world for animals.</span>
      </div>

      {/* ─── Modal 1: Complete Checkout & Payment Gateway Modal ─── */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                  <Heart className="h-4 w-4 fill-current" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {selectedCampaign ? selectedCampaign.title : selectedTeam ? `Support ${selectedTeam.name}` : 'Support Animal Rescue'}
                </h3>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Payment Authorized!</h4>
                <p className="text-slate-500">Generating your 80G Tax Exemption Receipt...</p>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Donation Amount:</span>
                  <span className="font-display text-xl font-black text-purple-700 dark:text-purple-400">
                    ₹{quickAmount.toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Donor Name *</label>
                  <input
                    type="text"
                    required
                    defaultValue="Rahul Sharma"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">PAN Card (Optional for 80G Tax Exemption)</label>
                  <input
                    type="text"
                    defaultValue="ABCPS1234F"
                    placeholder="e.g. ABCPS1234F"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="p-2.5 rounded-xl border border-purple-300 bg-purple-50 text-center font-bold text-purple-800 dark:bg-purple-950 cursor-pointer">
                      <Smartphone className="h-4 w-4 mx-auto mb-0.5" /> UPI / QR
                    </label>
                    <label className="p-2.5 rounded-xl border border-slate-200 bg-white text-center font-bold text-slate-700 dark:bg-slate-800 cursor-pointer">
                      <CreditCard className="h-4 w-4 mx-auto mb-0.5" /> Card
                    </label>
                    <label className="p-2.5 rounded-xl border border-slate-200 bg-white text-center font-bold text-slate-700 dark:bg-slate-800 cursor-pointer">
                      <Building className="h-4 w-4 mx-auto mb-0.5" /> NetBanking
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-purple-700 py-3 text-xs font-black text-white hover:bg-purple-800 shadow-md transition-all hover:scale-105"
                >
                  Confirm & Pay ₹{quickAmount.toLocaleString()}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── Modal 2: 80G Tax Exemption Printable Receipt Modal ─── */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Official 80G Certificate</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Donation Receipt: REC-80G-2026-4401</h3>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
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
                <strong className="text-slate-900 dark:text-white">Rahul Sharma</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">PAN:</span>
                <strong className="text-slate-900 dark:text-white">ABCPS1234F</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <strong className="text-emerald-600 text-sm">₹{quickAmount.toLocaleString()} (INR)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <strong className="text-slate-900 dark:text-white">20 May 2026</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800">
              <button
                onClick={() => setShowReceiptModal(false)}
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
export default DonorOverview;
