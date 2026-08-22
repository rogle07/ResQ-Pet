import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout as logoutAction } from '@/features/auth/authSlice';
import { authApi } from '@/features/auth/authApi';
import { useSocket } from '@/hooks/useSocket';
import { setNotifications, markAllRead } from '@/features/notifications/notificationSlice';
import { notificationApi } from '@/features/notifications/notificationApi';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LayoutDashboard,
  MapPin,
  AlertTriangle,
  Search,
  Heart,
  Home,
  DollarSign,
  Settings,
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  Headphones,
  PawPrint,
  ShieldAlert,
  Clock,
  MessageSquare,
  CheckSquare,
  Briefcase,
  TrendingUp,
  Phone,
  Sun,
  Moon,
  Users,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
  badge?: string;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  owner: [
    { to: '/owner', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, end: true },
    { to: '/owner/tracking', label: 'Live Tracking', icon: <MapPin className="h-5 w-5" /> },
    { to: '/owner/pets', label: 'Report Lost Pet', icon: <AlertTriangle className="h-5 w-5" /> },
    { to: '/owner/pets', label: 'Found Pets', icon: <Search className="h-5 w-5" /> },
    { to: '/owner/foster', label: 'Adoption', icon: <Heart className="h-5 w-5" /> },
    { to: '/owner/foster', label: 'Foster Care', icon: <Home className="h-5 w-5" /> },
    { to: '/owner/donations', label: 'Donations', icon: <DollarSign className="h-5 w-5" /> },
  ],
  rescue_team: [
    { to: '/rescue-team', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/rescue-team/requests', label: 'Reported Animals', icon: <PawPrint className="h-4 w-4" />, badge: '28' },
    { to: '/rescue-team/requests', label: 'Active Rescue Cases', icon: <ShieldAlert className="h-4 w-4" />, badge: '12' },
    { to: '/rescue-team/map', label: 'Live Tracking', icon: <MapPin className="h-4 w-4" /> },
    { to: '/rescue-team/requests', label: 'Alerts & Notifications', icon: <Bell className="h-4 w-4" />, badge: '9' },
    { to: '/rescue-team/requests', label: 'Rescue History', icon: <Clock className="h-4 w-4" /> },
    { to: '/rescue-team/communication', label: 'Team Communication', icon: <MessageSquare className="h-4 w-4" /> },
    { to: '/rescue-team/tasks', label: 'Tasks & Assignments', icon: <CheckSquare className="h-4 w-4" /> },
    { to: '/rescue-team/resources', label: 'Resources & Equipment', icon: <Briefcase className="h-4 w-4" /> },
    { to: '/rescue-team/analytics', label: 'Reports & Analytics', icon: <TrendingUp className="h-4 w-4" /> },
  ],
  ngo: [
    { to: '/ngo', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, end: true },
    { to: '/ngo/animals', label: 'Animals in Care', icon: <PawPrint className="h-5 w-5" /> },
    { to: '/ngo/adoptions', label: 'Adoption Desk', icon: <Heart className="h-5 w-5" /> },
    { to: '/ngo/donations', label: 'Donations & Campaigns', icon: <DollarSign className="h-5 w-5" /> },
  ],
  foster_home: [
    { to: '/foster-home', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/foster-home/application', label: 'Foster Application', icon: <CheckSquare className="h-4 w-4" /> },
    { to: '/foster-home/requests', label: 'Foster Requests', icon: <AlertTriangle className="h-4 w-4" /> },
    { to: '/foster-home/adoption', label: 'Adoption', icon: <Heart className="h-4 w-4" /> },
    { to: '/foster-home/statistics', label: 'Statistics', icon: <TrendingUp className="h-4 w-4" /> },
    { to: '/foster-home/donations', label: 'Donation', icon: <DollarSign className="h-4 w-4" /> },
    { to: '/foster-home/profile', label: 'Profile', icon: <Users className="h-4 w-4" /> },
    { to: '/foster-home/notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { to: '/foster-home/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ],
  veterinarian: [
    { to: '/veterinarian', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, end: true },
    { to: '/veterinarian/records', label: 'Medical Records', icon: <Settings className="h-5 w-5" /> },
  ],
  finder: [
    { to: '/finder', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, end: true },
    { to: '/finder/report', label: 'Report Found Pet', icon: <Search className="h-5 w-5" /> },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, end: true },
    { to: '/admin/users', label: 'Users', icon: <Users className="h-5 w-5" /> },
    { to: '/admin/pets', label: 'Pets', icon: <PawPrint className="h-5 w-5" /> },
    { to: '/admin/analytics', label: 'Analytics', icon: <TrendingUp className="h-5 w-5" /> },
    { to: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ],
};

const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const { items: notifications, unreadCount } = useAppSelector((s) => s.notifications);
  const { theme, toggleTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useSocket();

  useEffect(() => {
    notificationApi
      .list()
      .then((n) => dispatch(setNotifications({ items: n.notifications, unreadCount: n.unreadCount })))
      .catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      dispatch(logoutAction());
      navigate('/login');
    }
  };

  const navItems = user ? NAV_BY_ROLE[user.role] || [] : [];
  const isRescueTeam = user?.role === 'rescue_team';
  const isFosterHome = user?.role === 'foster_home';

  const getPortalTitle = () => {
    if (isRescueTeam) return 'Rescue Operations';
    if (isFosterHome) return 'Foster Care Portal';
    if (user?.role === 'owner') return 'Pet Owner Portal';
    if (user?.role === 'ngo') return 'NGO Management';
    if (user?.role === 'veterinarian') return 'Veterinary Clinic';
    if (user?.role === 'finder') return 'Finder Dashboard';
    if (user?.role === 'admin') return 'System Administration';
    return 'Pet Portal';
  };

  return (
    <div className="flex min-h-screen bg-[#f3f4f6] dark:bg-[#0b111a] text-slate-900 dark:text-slate-100 font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-[#0f172a] border-r border-slate-200/80 dark:border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#1e6f42] to-emerald-500 text-white shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
              <PawPrint className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-lg font-black tracking-tight text-slate-900 dark:text-white">
                ResQ<span className="text-[#1e6f42] dark:text-emerald-400">Pet</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 -mt-1">
                {getPortalTitle()}
              </span>
            </div>
          </NavLink>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#1e6f42] text-white shadow-md shadow-[#1e6f42]/20 dark:bg-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-emerald-600 dark:text-slate-500 dark:group-hover:text-emerald-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 text-[#1e6f42] dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Support Card in sidebar */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 p-3.5 border border-emerald-100 dark:from-slate-800/80 dark:to-slate-800/40 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <Headphones className="h-4 w-4" />
              <span className="text-xs font-bold">24/7 ResQ Helpline</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Direct emergency line for animal distress.</p>
            <a
              href="tel:18001237377"
              className="mt-2.5 flex items-center justify-center gap-1.5 w-full rounded-xl bg-[#1e6f42] py-2 text-xs font-extrabold text-white hover:bg-emerald-800 shadow-sm transition-colors"
            >
              <Phone className="h-3 w-3" /> Call 1800-RESQ-PET
            </a>
          </div>
        </div>

        {/* User Card in sidebar footer */}
        <div className="border-t border-slate-100 p-3 dark:border-slate-800">
          <div className="flex items-center justify-between rounded-xl p-2 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 font-bold text-white text-xs">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{user?.name || 'User'}</p>
                <p className="truncate text-[10px] capitalize text-slate-400">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-rose-600 dark:hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 sm:px-8 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0f172a]/80">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-display text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {getPortalTitle()}
              </h1>
              <p className="hidden sm:block text-[11px] font-medium text-slate-400 -mt-0.5">
                Welcome back, {user?.name || 'Guardian'}
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-[#1e6f42] dark:bg-emerald-950 dark:text-emerald-300">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          await notificationApi.markAllRead();
                          dispatch(markAllRead());
                        }}
                        className="text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-400">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n._id}
                          className={`rounded-xl p-2.5 text-xs transition-colors ${
                            !n.isRead
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {isFosterHome && (
                    <div className="mt-3 border-t border-slate-100 pt-2 text-center dark:border-slate-800">
                      <NavLink
                        to="/foster-home/notifications"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        View all notifications →
                      </NavLink>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-700 font-bold text-white text-xs">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    {isFosterHome ? (
                      <>
                        <NavLink
                          to="/foster-home/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Users className="h-4 w-4 text-emerald-600" /> Foster Profile
                        </NavLink>
                        <NavLink
                          to="/foster-home/settings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Settings className="h-4 w-4 text-emerald-600" /> Settings
                        </NavLink>
                      </>
                    ) : (
                      <NavLink
                        to="/owner/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Settings className="h-4 w-4 text-emerald-600" /> Settings
                      </NavLink>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
