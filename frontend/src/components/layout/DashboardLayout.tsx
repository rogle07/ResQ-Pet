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
  FileText,
  Megaphone,
  BookOpen,
  Activity,
  PlusCircle,
  Award,
  Building2,
  Cpu,
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
    { to: '/owner', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, end: true },
    { to: '/owner/foster', label: 'Foster Care', icon: <Home className="h-5 w-5" /> },
    { to: '/owner/adoption', label: 'Adoption', icon: <Heart className="h-5 w-5" /> },
    { to: '/owner/ngo-shelter', label: 'NGO Shelter Care', icon: <Building2 className="h-5 w-5" /> },
    { to: '/owner/rescue', label: 'Rescue Request', icon: <AlertTriangle className="h-5 w-5" /> },
    { to: '/owner/found-pets', label: 'Found Pets Board', icon: <Search className="h-5 w-5" /> },
    { to: '/owner/iot', label: 'ResQ Pet IoT', icon: <Cpu className="h-5 w-5" /> },
    { to: '/owner/pets', label: 'My Pets', icon: <PawPrint className="h-5 w-5" /> },
    { to: '/owner/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ],
  rescue_team: [
    { to: '/rescue-team', label: 'Mission Control', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/rescue-team/requests', label: 'Rescue Dispatch', icon: <AlertTriangle className="h-4 w-4" />, badge: '4' },
    { to: '/rescue-team/map', label: 'Live Incident Map', icon: <MapPin className="h-4 w-4" /> },
    { to: '/rescue-team/communication', label: 'Team Comms', icon: <MessageSquare className="h-4 w-4" />, badge: '6' },
    { to: '/rescue-team/tasks', label: 'Unit Tasks', icon: <CheckSquare className="h-4 w-4" /> },
    { to: '/rescue-team/resources', label: 'Equipment & Fleet', icon: <Briefcase className="h-4 w-4" /> },
    { to: '/rescue-team/reports', label: 'Analytics & Logs', icon: <TrendingUp className="h-4 w-4" /> },
  ],
  ngo: [
    { to: '/ngo', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/ngo/requests', label: 'Rescue Requests', icon: <AlertTriangle className="h-4 w-4" />, badge: '5' },
    { to: '/ngo/rescue-team', label: 'Rescue Teams', icon: <Users className="h-4 w-4" /> },
    { to: '/ngo/cases', label: 'Case Management', icon: <FileText className="h-4 w-4" /> },
    { to: '/ngo/found-animals', label: 'Found Animals', icon: <Search className="h-4 w-4" />, badge: '3' },
    { to: '/ngo/animals', label: 'Sheltered Animals', icon: <PawPrint className="h-4 w-4" /> },
    { to: '/ngo/adoptions', label: 'Adoption Desk', icon: <Heart className="h-4 w-4" /> },
    { to: '/ngo/donations', label: 'Funds & Grants', icon: <DollarSign className="h-4 w-4" /> },
    { to: '/ngo/volunteers', label: 'Volunteers', icon: <Users className="h-4 w-4" /> },
    { to: '/ngo/resources', label: 'Shelter Inventory', icon: <Briefcase className="h-4 w-4" /> },
    { to: '/ngo/awareness', label: 'Awareness Hub', icon: <Megaphone className="h-4 w-4" /> },
    { to: '/ngo/messages', label: 'Messages', icon: <MessageSquare className="h-4 w-4" />, badge: '2' },
    { to: '/ngo/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ],
  foster_home: [
    { to: '/foster-home', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/foster-home/application', label: 'Application Form', icon: <FileText className="h-4 w-4" /> },
    { to: '/foster-home/requests', label: 'Foster Requests', icon: <AlertTriangle className="h-4 w-4" />, badge: '3' },
    { to: '/foster-home/adoption', label: 'Adoption Desk', icon: <Heart className="h-4 w-4" /> },
    { to: '/foster-home/statistics', label: 'Care Statistics', icon: <TrendingUp className="h-4 w-4" /> },
    { to: '/foster-home/donations', label: 'Donations', icon: <DollarSign className="h-4 w-4" /> },
    { to: '/foster-home/profile', label: 'Foster Profile', icon: <Users className="h-4 w-4" /> },
    { to: '/foster-home/notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" />, badge: '2' },
    { to: '/foster-home/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ],
  veterinarian: [
    { to: '/veterinarian', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/veterinarian/appointments', label: 'Appointments', icon: <Clock className="h-4 w-4" />, badge: '8' },
    { to: '/veterinarian/patients', label: 'Patients', icon: <PawPrint className="h-4 w-4" /> },
    { to: '/veterinarian/treatments', label: 'Treatments', icon: <Activity className="h-4 w-4" /> },
    { to: '/veterinarian/records', label: 'Medical Records', icon: <FileText className="h-4 w-4" /> },
    { to: '/veterinarian/prescriptions', label: 'Prescriptions', icon: <Briefcase className="h-4 w-4" /> },
    { to: '/veterinarian/vaccinations', label: 'Vaccinations', icon: <CheckSquare className="h-4 w-4" /> },
    { to: '/veterinarian/emergency', label: 'Emergency Unit', icon: <ShieldAlert className="h-4 w-4" />, badge: '5' },
    { to: '/veterinarian/lab-reports', label: 'Lab Reports', icon: <FileText className="h-4 w-4" /> },
    { to: '/veterinarian/telemetry', label: 'IoT Telemetry', icon: <TrendingUp className="h-4 w-4" /> },
    { to: '/veterinarian/collar-diagnostics', label: 'Collar Diagnostics', icon: <Settings className="h-4 w-4" /> },
    { to: '/veterinarian/notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { to: '/veterinarian/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ],
  finder: [
    { to: '/finder', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/finder/report', label: 'Report Found Animal', icon: <PlusCircle className="h-4 w-4" /> },
    { to: '/finder/my-reports', label: 'My Reports', icon: <FileText className="h-4 w-4" />, badge: '12' },
    { to: '/finder/awareness', label: 'Awareness / Posts', icon: <Megaphone className="h-4 w-4" /> },
    { to: '/finder/messages', label: 'Messages', icon: <MessageSquare className="h-4 w-4" />, badge: '3' },
    { to: '/finder/resources', label: 'Resources', icon: <BookOpen className="h-4 w-4" /> },
    { to: '/finder/how-to-help', label: 'How to Help', icon: <Heart className="h-4 w-4" /> },
    { to: '/finder/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ],
  found_pet_reporter: [
    { to: '/found-pet-reporter', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/found-pet-reporter/my-reports', label: 'My Found Reports', icon: <FileText className="h-4 w-4" /> },
    { to: '/found-pet-reporter/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ],
  donor: [
    { to: '/donor', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/donor/donate', label: 'Donate Now', icon: <Heart className="h-4 w-4" /> },
    { to: '/donor/my-donations', label: 'My Donations', icon: <FileText className="h-4 w-4" /> },
    { to: '/donor/history', label: 'Donation History', icon: <Clock className="h-4 w-4" /> },
    { to: '/donor/campaigns', label: 'Campaigns', icon: <Megaphone className="h-4 w-4" />, badge: '14' },
    { to: '/donor/impact', label: 'Impact & Reports', icon: <TrendingUp className="h-4 w-4" /> },
    { to: '/donor/rewards', label: 'Rewards & Badges', icon: <Award className="h-4 w-4" /> },
    { to: '/donor/messages', label: 'Messages', icon: <MessageSquare className="h-4 w-4" />, badge: '3' },
    { to: '/donor/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
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

  const isRescueTeam = user?.role === 'rescue_team';
  const isFosterHome = user?.role === 'foster_home';
  const isNgo = user?.role === 'ngo';
  const isFinder = user?.role === 'finder' || window.location.pathname.startsWith('/finder');
  const isDonor = user?.role === 'donor' || window.location.pathname.startsWith('/donor');

  const navItems = user
    ? NAV_BY_ROLE[user.role] || (isDonor ? NAV_BY_ROLE.donor : isFinder ? NAV_BY_ROLE.finder : [])
    : isDonor
    ? NAV_BY_ROLE.donor
    : isFinder
    ? NAV_BY_ROLE.finder
    : [];

  const getPortalTitle = () => {
    if (isRescueTeam) return 'Rescue Operations';
    if (isFosterHome) return 'Foster Care Portal';
    if (user?.role === 'owner') return 'Pet Owner Portal';
    if (user?.role === 'ngo') return 'Animal Care NGO';
    if (user?.role === 'veterinarian') return 'Veterinary Clinic';
    if (isFinder) return 'Finder Portal';
    if (isDonor) return 'Donation Portal';
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
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md group-hover:scale-105 transition-transform ${
              isFinder || isDonor
                ? 'bg-gradient-to-tr from-purple-700 to-indigo-500 shadow-purple-950/20'
                : 'bg-gradient-to-tr from-[#1e6f42] to-emerald-500 shadow-emerald-950/20'
            }`}>
              {isDonor ? <Heart className="h-5 w-5 fill-current" /> : <PawPrint className="h-5 w-5" />}
            </div>
            <div>
              <span className="font-display text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {isFinder || isDonor ? (
                  <>Animal <span className="text-purple-700 dark:text-purple-400">Care</span></>
                ) : (
                  <>ResQ<span className="text-[#1e6f42] dark:text-emerald-400">Pet</span></>
                )}
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
                    ? isFinder || isDonor
                      ? 'bg-purple-700 text-white shadow-md shadow-purple-950/20 dark:bg-purple-600'
                      : 'bg-[#1e6f42] text-white shadow-md shadow-[#1e6f42]/20 dark:bg-emerald-600'
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
                          : isFinder || isDonor
                          ? 'text-slate-400 group-hover:text-purple-700 dark:text-slate-500 dark:group-hover:text-purple-400'
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
                          : isFinder || isDonor
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
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

          {/* Donor specific sidebar banner */}
          {isDonor && (
            <div className="pt-2 space-y-2">
              <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/50 p-3.5 border border-purple-100 dark:from-slate-800/80 dark:to-slate-800/40 dark:border-slate-700/60 text-center space-y-1.5">
                <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 block leading-tight">
                  Every Donation Brings Hope. Every Heart Makes a Difference.
                </span>
                <div className="flex justify-center -space-x-1 py-1">
                  <img src="/animal-dog.jpg" alt="dog" className="h-7 w-7 rounded-full object-cover border border-white" />
                  <img src="/animal-cat.jpg" alt="cat" className="h-7 w-7 rounded-full object-cover border border-white" />
                </div>
                <NavLink
                  to="/donor/donate"
                  className="block w-full rounded-xl bg-purple-700 py-1.5 text-[11px] font-extrabold text-white hover:bg-purple-800 shadow-sm transition-colors"
                >
                  Make a Difference
                </NavLink>
              </div>
            </div>
          )}

          {/* Finder specific sidebar banner */}
          {isFinder && !isDonor && (
            <div className="pt-2 space-y-2">
              <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/50 p-3.5 border border-purple-100 dark:from-slate-800/80 dark:to-slate-800/40 dark:border-slate-700/60 text-center space-y-1.5">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                  Every Small Step Makes a Big Difference.
                </span>
                <div className="flex justify-center -space-x-1 py-1">
                  <img src="/animal-dog.jpg" alt="dog" className="h-7 w-7 rounded-full object-cover border border-white" />
                  <img src="/animal-cat.jpg" alt="cat" className="h-7 w-7 rounded-full object-cover border border-white" />
                </div>
                <NavLink
                  to="/finder/report"
                  className="block w-full rounded-xl bg-purple-700 py-1.5 text-[11px] font-extrabold text-white hover:bg-purple-800 shadow-sm transition-colors"
                >
                  Be a Hero for Animals
                </NavLink>
              </div>
            </div>
          )}
        </nav>

        {/* Support Card in sidebar */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          {isDonor ? (
            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Need Help?</span>
              <p className="text-[10px] text-slate-400">Facing any issue in donating? We are here to help you.</p>
              <NavLink
                to="/donor/messages"
                className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-purple-200 bg-white py-1.5 text-[11px] font-bold text-purple-700 hover:bg-purple-50 dark:border-purple-900 dark:bg-slate-800 dark:text-purple-300 shadow-sm"
              >
                <Phone className="h-3 w-3" /> Contact Support
              </NavLink>
            </div>
          ) : isFinder ? (
            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Need Help?</span>
              <p className="text-[10px] text-slate-400">If you see an animal in immediate danger, contact the rescue team.</p>
              <a
                href="tel:1800264625"
                className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-purple-200 bg-white py-1.5 text-[11px] font-bold text-purple-700 hover:bg-purple-50 dark:border-purple-900 dark:bg-slate-800 dark:text-purple-300"
              >
                <Phone className="h-3 w-3" /> Contact Now
              </a>
            </div>
          ) : (
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
          )}
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
                    ) : isNgo ? (
                      <NavLink
                        to="/ngo/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Settings className="h-4 w-4 text-violet-600" /> Settings
                      </NavLink>
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
