import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { roleHomePath } from '@/routes/roleHomePath';
import { PawPrint, Sun, Moon, Bell, MapPin, AlertTriangle, Heart, Home, Gift, Users, Menu, X, User, Shield } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

const navLinks = [
  { to: '/', label: 'Home', end: true, icon: <Home className="h-3.5 w-3.5" /> },
  { to: '/track-pet', label: 'Live Tracking', icon: <MapPin className="h-3.5 w-3.5" /> },
  { to: '/report-found-pet', label: 'Report Lost Animal', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  { to: '/adoption', label: 'Found & Adoption', icon: <Heart className="h-3.5 w-3.5" /> },
  { to: '/foster-care', label: 'Foster Care', icon: <Users className="h-3.5 w-3.5" /> },
  { to: '/rescue-teams', label: 'Rescue Teams', icon: <Shield className="h-3.5 w-3.5" /> },
  { to: '/donations', label: 'Donations', icon: <Gift className="h-3.5 w-3.5" /> },
];

const Navbar = () => {
  const user = useAppSelector((s) => s.auth.user);
  const { isDark, toggle } = useDarkMode();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-lg transition-colors duration-200">
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
            <PawPrint className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
          </div>
          <div>
            <div className="font-display text-lg sm:text-xl font-bold leading-none text-gray-900 dark:text-slate-100 tracking-wide">
              ResQPet
            </div>
            <div className="text-[9px] leading-tight text-gray-500 dark:text-slate-400 mt-0.5 hidden xs:block">
              AI & IoT Animal Rescue Ecosystem
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 xl:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'border border-emerald-500/60 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-slate-100'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Notification bell with count */}
          <Link
            to="/report-found-pet"
            aria-label="Notifications"
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 transition-colors"
            title="Active Rescue Alerts"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm animate-pulse">
              3
            </span>
          </Link>

          {/* Dark mode toggle pill */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-yellow-500 dark:text-yellow-400">
              {isDark ? <Sun className="h-3.5 w-3.5 fill-current" /> : <Moon className="h-3.5 w-3.5" />}
            </div>
            <span className="hidden md:inline">{isDark ? 'Light' : 'Dark'}</span>
          </button>

          {/* Auth Button */}
          {user ? (
            <Link
              to={roleHomePath(user.role)}
              className="flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-50 px-3 sm:px-4 py-1.5 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60 shadow-sm"
            >
              <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden xs:inline">Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-50 px-3 sm:px-4 py-1.5 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60 shadow-sm"
            >
              <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle mobile menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700 xl:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white/98 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/98 xl:hidden space-y-1 backdrop-blur-lg shadow-xl animate-fadeIn">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-500/40'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
          <div className="pt-2 mt-2 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between px-2 text-xs text-gray-500 dark:text-slate-400">
            <span>24/7 Animal Emergency: 1800-RESQ-PET</span>
            <Link to="/rescue-teams" onClick={() => setMobileOpen(false)} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              Call Team
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
