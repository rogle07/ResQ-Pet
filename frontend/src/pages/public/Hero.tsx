import { Heart, MapPin, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#F4F9FF] px-6 pb-24 pt-16 md:pt-24 dark:bg-ink">
      <div className="mx-auto grid max-w-[1400px] items-center gap-16 md:grid-cols-2">
        <div className="z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-blue-500 shadow-sm dark:bg-ink-soft dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
            <Heart className="h-4 w-4" fill="currentColor" />
            <span>Smart Technology. Faster Rescue. Better Together.</span>
          </div>

          <h1 className="max-w-xl font-display text-5xl font-bold leading-[1.1] tracking-tight text-ink dark:text-bone md:text-[5rem]">
            A Safer World<br />
            for <span className="text-blue-500">Our Pets</span> <PawIcon />
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/70 dark:text-bone/70">
            ResQPet is an AI & IoT powered platform that helps locate missing pets, connect rescuers, and build a stronger community for animal welfare.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/track-pet" className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-600 shadow-lg shadow-blue-500/30">
              <MapPin className="h-5 w-5" />
              Track Your Pet
            </Link>
            <Link to="/report-found-pet" className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:bg-ink/5 dark:border-bone/15 dark:bg-ink-soft dark:text-bone dark:hover:bg-bone/5 shadow-sm">
              <Bell className="h-5 w-5" />
              Report Found Pet <PawIconSmall />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full">
          <div className="relative h-[500px] w-full overflow-hidden rounded-3xl">
             <img src="/puppy.jpg" alt="White puppy" className="h-full w-full object-cover" />
          </div>
          
          {/* Overlay Cards */}
          <div className="absolute -left-8 bottom-12 flex items-center gap-4 rounded-xl bg-white p-4 shadow-xl dark:bg-ink-soft">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-900/30">
              <Bell className="h-5 w-5" fill="currentColor" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink dark:text-bone">Geo-fence Alert</p>
              <p className="text-xs text-ink/60 dark:text-bone/60">Buddy has left the safe zone<br/>just now</p>
            </div>
          </div>

          <div className="absolute -right-4 top-8 rounded-xl bg-white p-5 shadow-xl dark:bg-ink-soft w-64">
            <div className="flex items-center justify-between mb-4">
               <div>
                 <p className="font-bold text-lg text-ink dark:text-bone">Buddy</p>
                 <p className="text-xs text-ink/60 dark:text-bone/60 flex items-center gap-1"><PawIconSmall /> Maltese | 1.2 Years</p>
               </div>
               <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  Online
               </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                 <MapPin className="h-4 w-4 text-ink/40 dark:text-bone/40 shrink-0 mt-0.5" />
                 <div>
                   <p className="text-xs font-semibold">Live Location</p>
                   <p className="text-xs text-ink/60 dark:text-bone/60">Nainital, Uttarakhand</p>
                 </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-ink/80 dark:text-bone/80">Battery</span>
                  <span className="font-semibold text-ink/80 dark:text-bone/80">85%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden">
                  <div className="h-full bg-blue-500 w-[85%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const PawIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="inline-block h-[1em] w-[1em] text-ink dark:text-bone ml-1 -mt-2">
    <path d="M12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2ZM6.5 10C4.57 10 3 11.57 3 13.5C3 15.43 4.57 17 6.5 17C8.43 17 10 15.43 10 13.5C10 11.57 8.43 10 6.5 10ZM17.5 10C15.57 10 14 11.57 14 13.5C14 15.43 15.57 17 17.5 17C19.43 17 21 15.43 21 13.5C21 11.57 19.43 10 17.5 10ZM12 14C8.69 14 6 16.69 6 20H18C18 16.69 15.31 14 12 14Z" />
  </svg>
)

const PawIconSmall = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="inline-block h-[1em] w-[1em]">
    <path d="M12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2ZM6.5 10C4.57 10 3 11.57 3 13.5C3 15.43 4.57 17 6.5 17C8.43 17 10 15.43 10 13.5C10 11.57 8.43 10 6.5 10ZM17.5 10C15.57 10 14 11.57 14 13.5C14 15.43 15.57 17 17.5 17C19.43 17 21 15.43 21 13.5C21 11.57 19.43 10 17.5 10ZM12 14C8.69 14 6 16.69 6 20H18C18 16.69 15.31 14 12 14Z" />
  </svg>
)

export default Hero;
