import Navbar from '@/components/layout/Navbar';
import { Search, Camera, Heart, PhoneCall, ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReportFoundPet = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-ink">
      <Navbar />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero */}
        <div className="mb-10 sm:mb-16 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-900/20 px-4 py-1.5 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">
            <Search className="h-4 w-4" /> Found a Pet?
          </div>
          <h1 className="mb-4 sm:mb-6 font-display text-3xl sm:text-5xl font-bold leading-tight text-ink dark:text-bone">
            Help Reunite <br />
            <span className="text-red-500">Lost Pets</span> With Families
          </h1>
          <p className="mb-6 sm:mb-8 text-sm sm:text-lg text-ink/70 dark:text-bone/70">
            Found a stray animal? Report it on ResQPet and we'll connect you with rescue teams and the owner. Every report matters!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-600 transition-colors">
              Report Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink/15 dark:border-bone/15 px-6 py-3 font-semibold text-ink dark:text-bone hover:bg-ink/5 dark:hover:bg-bone/5 transition-colors">
              Create Account
            </Link>
          </div>
        </div>

        {/* Steps */}
        <h2 className="mb-6 sm:mb-8 font-display text-xl sm:text-2xl font-bold text-ink dark:text-bone">How to Report a Found Pet</h2>
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12 sm:mb-16">
          {[
            { icon: <Camera className="h-6 w-6 text-red-500" />, bg: 'bg-red-100 dark:bg-red-900/20', step: '1', title: 'Take a Photo', desc: 'Photograph the pet clearly. Include any collar, tags, or distinctive markings.' },
            { icon: <MapPin className="h-6 w-6 text-blue-500" />, bg: 'bg-blue-100 dark:bg-blue-900/20', step: '2', title: 'Share Location', desc: 'Allow location access or enter the address where you found the pet.' },
            { icon: <Search className="h-6 w-6 text-green-600" />, bg: 'bg-green-100 dark:bg-green-900/20', step: '3', title: 'Submit Report', desc: 'Fill in the details and submit. Our team reviews and broadcasts it immediately.' },
            { icon: <PhoneCall className="h-6 w-6 text-purple-600" />, bg: 'bg-purple-100 dark:bg-purple-900/20', step: '4', title: 'Get Connected', desc: 'We match the report with registered pets and connect you with the owner or a rescue team.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-ink/5 dark:border-bone/5 bg-white dark:bg-ink-soft p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${f.bg}`}>
                  {f.icon}
                </div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {f.step}
                </span>
              </div>
              <h3 className="mb-2 font-bold text-ink dark:text-bone text-base">{f.title}</h3>
              <p className="text-xs sm:text-sm text-ink/60 dark:text-bone/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 p-6 sm:p-10 text-center text-white">
          <Heart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-80" fill="currentColor" />
          <h2 className="mb-2 sm:mb-3 font-display text-2xl sm:text-3xl font-bold">Be a hero for a lost pet today</h2>
          <p className="mb-5 sm:mb-6 text-xs sm:text-base text-red-100">Your report could be the reason a family is reunited with their beloved pet.</p>
          <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 sm:px-8 py-3 font-semibold text-red-600 hover:bg-red-50 transition-colors">
            Report a Found Pet <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReportFoundPet;
