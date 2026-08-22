import Navbar from '@/components/layout/Navbar';
import { MapPin, Radio, Bell, ArrowRight, Smartphone, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const TrackPet = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-ink">
      <Navbar />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero */}
        <div className="mb-10 sm:mb-16 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
            <Radio className="h-4 w-4" /> Live GPS Tracking
          </div>
          <h1 className="mb-4 sm:mb-6 font-display text-3xl sm:text-5xl font-bold leading-tight text-ink dark:text-bone">
            Track Your Pet <br />
            <span className="text-blue-500">In Real-Time</span>
          </h1>
          <p className="mb-6 sm:mb-8 text-sm sm:text-lg text-ink/70 dark:text-bone/70">
            Our AI & IoT powered collar gives you live GPS location, geo-fence alerts, health monitoring, and instant notifications — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-600 transition-colors">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink/15 dark:border-bone/15 px-6 py-3 font-semibold text-ink dark:text-bone hover:bg-ink/5 dark:hover:bg-bone/5 transition-colors">
              Login to Track
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <MapPin className="h-6 w-6 text-blue-500" />, bg: 'bg-blue-100 dark:bg-blue-900/20', title: 'Live GPS Location', desc: 'See your pet\'s exact location updated every 5 seconds on an interactive map.' },
            { icon: <Bell className="h-6 w-6 text-orange-500" />, bg: 'bg-orange-100 dark:bg-orange-900/20', title: 'Geo-Fence Alerts', desc: 'Set a safe zone. Get notified instantly when your pet leaves the boundary.' },
            { icon: <Smartphone className="h-6 w-6 text-green-600" />, bg: 'bg-green-100 dark:bg-green-900/20', title: 'Smart Collar', desc: 'IoT collar monitors location, activity, temperature and battery health.' },
            { icon: <Zap className="h-6 w-6 text-purple-600" />, bg: 'bg-purple-100 dark:bg-purple-900/20', title: 'Instant Alerts', desc: 'Push notifications on mobile and email the moment something changes.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-ink/5 dark:border-bone/5 bg-white dark:bg-ink-soft p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${f.bg}`}>
                {f.icon}
              </div>
              <h3 className="mb-2 font-bold text-ink dark:text-bone text-base">{f.title}</h3>
              <p className="text-xs sm:text-sm text-ink/60 dark:text-bone/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 sm:mt-16 rounded-2xl bg-blue-500 p-6 sm:p-10 text-center text-white">
          <Shield className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-80" />
          <h2 className="mb-2 sm:mb-3 font-display text-2xl sm:text-3xl font-bold">Ready to keep your pet safe?</h2>
          <p className="mb-5 sm:mb-6 text-xs sm:text-base text-blue-100">Register now and get your smart collar activated in minutes.</p>
          <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 sm:px-8 py-3 font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
            Create Free Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TrackPet;
