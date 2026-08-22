import Navbar from '@/components/layout/Navbar';
import { HeartHandshake, Heart, Shield, Zap, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const DonationsPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-ink">
      <Navbar />
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        {/* Hero */}
        <div className="mb-16 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
            <HeartHandshake className="h-4 w-4" /> Support Animal Welfare
          </div>
          <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-ink dark:text-bone">
            Your Donation <br />
            <span className="text-blue-500">Saves Lives</span>
          </h1>
          <p className="mb-8 text-lg text-ink/70 dark:text-bone/70">
            Every rupee you donate goes directly to rescue operations, medical treatment, and care for animals in need. Together, we can make a difference.
          </p>
        </div>

        {/* Impact stats */}
        <div className="mb-16 grid gap-6 md:grid-cols-4">
          {[
            { value: '₹2,45,600', label: 'Total Raised', color: 'text-blue-600 dark:text-blue-400' },
            { value: '1,248', label: 'Pets Rescued', color: 'text-green-600 dark:text-green-400' },
            { value: '346', label: 'Treatments Funded', color: 'text-orange-600 dark:text-orange-400' },
            { value: '89', label: 'NGOs Supported', color: 'text-purple-600 dark:text-purple-400' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-ink/5 dark:border-bone/5 bg-white dark:bg-ink-soft p-6 text-center shadow-sm">
              <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-sm text-ink/60 dark:text-bone/60">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Donation tiers */}
        <h2 className="mb-8 font-display text-2xl font-bold text-ink dark:text-bone">Choose Your Impact</h2>
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {[
            { amount: '₹500', label: 'Supporter', desc: 'Feeds and cares for one rescued animal for a week.', icon: <Heart className="h-8 w-8" fill="currentColor" />, color: 'border-blue-200 dark:border-blue-900/50', badge: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20', btn: 'bg-blue-500 hover:bg-blue-600' },
            { amount: '₹2,000', label: 'Rescuer', desc: 'Funds a full veterinary check-up and treatment for a sick animal.', icon: <Shield className="h-8 w-8" />, color: 'border-orange-300 dark:border-orange-900/50 ring-2 ring-orange-400', badge: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20', btn: 'bg-orange-500 hover:bg-orange-600', popular: true },
            { amount: '₹5,000', label: 'Guardian', desc: 'Sponsors a complete rescue operation including transport and aftercare.', icon: <Zap className="h-8 w-8" />, color: 'border-purple-200 dark:border-purple-900/50', badge: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20', btn: 'bg-purple-500 hover:bg-purple-600' },
          ].map((tier) => (
            <div key={tier.label} className={`relative rounded-2xl border-2 bg-white dark:bg-ink-soft p-8 shadow-sm hover:shadow-md transition-shadow ${tier.color}`}>
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-bold text-white">
                  Most Popular
                </span>
              )}
              <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full ${tier.badge}`}>
                {tier.icon}
              </div>
              <p className="mb-1 font-display text-3xl font-bold text-ink dark:text-bone">{tier.amount}</p>
              <p className="mb-3 font-semibold text-ink/80 dark:text-bone/80">{tier.label}</p>
              <p className="mb-6 text-sm text-ink/60 dark:text-bone/60 leading-relaxed">{tier.desc}</p>
              <Link to="/login" className={`block w-full rounded-lg py-3 text-center font-semibold text-white transition-colors ${tier.btn}`}>
                Donate {tier.amount}
              </Link>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-teal-500 p-10 text-center text-white">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="mb-3 font-display text-3xl font-bold">Every contribution counts</h2>
          <p className="mb-6 text-blue-100">Login to make a custom donation or set up a recurring gift to help us make a sustained difference.</p>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
            Donate Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DonationsPage;
