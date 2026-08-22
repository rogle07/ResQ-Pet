import Navbar from '@/components/layout/Navbar';
import { Users, Heart, Clock, Home, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FosterCare = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-ink">
      <Navbar />
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        {/* Hero */}
        <div className="mb-16 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-50 dark:bg-purple-900/20 px-4 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400">
            <Users className="h-4 w-4" /> Foster Care Program
          </div>
          <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-ink dark:text-bone">
            Be a Temporary <br />
            <span className="text-purple-500">Safe Haven</span>
          </h1>
          <p className="mb-8 text-lg text-ink/70 dark:text-bone/70">
            Fostering a pet makes a huge difference. Provide a loving temporary home while animals await permanent families or recovery.
          </p>
          <div className="flex gap-4">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-purple-500 px-6 py-3 font-semibold text-white hover:bg-purple-600 transition-colors">
              Become a Foster <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-lg border border-ink/15 dark:border-bone/15 px-6 py-3 font-semibold text-ink dark:text-bone hover:bg-ink/5 dark:hover:bg-bone/5 transition-colors">
              View Active Requests
            </Link>
          </div>
        </div>

        {/* Benefits */}
        <h2 className="mb-8 font-display text-2xl font-bold text-ink dark:text-bone">Why Foster with ResQPet?</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {[
            { icon: <Heart className="h-6 w-6 text-purple-500" />, bg: 'bg-purple-100 dark:bg-purple-900/20', title: 'Make a Real Impact', desc: 'Every foster placement directly saves a life, giving animals the care they need before finding a forever home.' },
            { icon: <Clock className="h-6 w-6 text-blue-500" />, bg: 'bg-blue-100 dark:bg-blue-900/20', title: 'Flexible Commitment', desc: 'Foster for a weekend, a few weeks, or longer. We match you with animals that fit your schedule and lifestyle.' },
            { icon: <Home className="h-6 w-6 text-green-600" />, bg: 'bg-green-100 dark:bg-green-900/20', title: 'Full Support Provided', desc: 'We provide food, vet care, and 24/7 support. You just need to offer love and a safe space.' },
            { icon: <Users className="h-6 w-6 text-orange-500" />, bg: 'bg-orange-100 dark:bg-orange-900/20', title: 'Community Network', desc: 'Join our vibrant network of foster families who share tips, experiences, and support each other.' },
            { icon: <CheckCircle className="h-6 w-6 text-teal-600" />, bg: 'bg-teal-100 dark:bg-teal-900/20', title: 'Easy Application', desc: 'Simple online application, quick approval process, and thorough onboarding so you\'re always prepared.' },
            { icon: <Heart className="h-6 w-6 text-pink-500" />, bg: 'bg-pink-100 dark:bg-pink-900/20', title: 'Updates & Tracking', desc: 'Get updates about the pet\'s journey after fostering. Many fosters stay connected with their animals for life.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-ink/5 dark:border-bone/5 bg-white dark:bg-ink-soft p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${f.bg}`}>
                {f.icon}
              </div>
              <h3 className="mb-2 font-bold text-ink dark:text-bone">{f.title}</h3>
              <p className="text-sm text-ink/60 dark:text-bone/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-10 text-center text-white">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="mb-3 font-display text-3xl font-bold">Open your home, change a life</h2>
          <p className="mb-6 text-purple-100">Thousands of animals need temporary care. Your home could be the bridge to their forever family.</p>
          <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-purple-600 hover:bg-purple-50 transition-colors">
            Apply to Foster <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FosterCare;
