import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { authApi } from '@/features/auth/authApi';
import { roleHomePath } from '@/routes/roleHomePath';
import type { ApiError, UserRole } from '@/types';
import {
  PawPrint, User, Mail, Phone, Lock, Eye, EyeOff, MapPin,
  Shield, Users, Bell, Heart, CheckCircle, Search, Home as HomeIcon, AlertCircle,
  Stethoscope, FileText, Sparkles
} from 'lucide-react';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import { ALL_INDIAN_CITIES } from '@/utils/cities';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  panNumber?: string;
  preferredCause?: string;
  monthlyPledge?: boolean;
  agreeTerms?: boolean;
}

const ROLE_OPTIONS: { value: UserRole; label: string; icon: JSX.Element; badge?: string }[] = [
  { value: 'owner', label: 'Pet Owner', icon: <PawPrint className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { value: 'donor', label: 'Donor / Patron', icon: <Heart className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />, badge: '80G Tax' },
  { value: 'finder', label: 'Finder', icon: <Search className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { value: 'rescue_team', label: 'Rescuer', icon: <Shield className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { value: 'ngo', label: 'NGO / Shelter', icon: <Users className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { value: 'veterinarian', label: 'Veterinarian', icon: <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { value: 'foster_home', label: 'Foster Home', icon: <HomeIcon className="h-5 w-5 sm:h-6 sm:w-6" /> },
];

const features = [
  { icon: <Shield className="h-5 w-5 text-moss-600" />, title: 'Secure & Reliable', desc: 'Your data is safe with advanced security.' },
  { icon: <Users className="h-5 w-5 text-moss-600" />, title: 'Community Driven', desc: 'Connect with pet lovers, rescuers & NGOs.' },
  { icon: <Bell className="h-5 w-5 text-moss-600" />, title: 'Real-time Alerts', desc: 'Get instant updates for lost & found pets.' },
  { icon: <Heart className="h-5 w-5 text-moss-600" />, title: 'Support & Care', desc: 'Help pets through adoption, foster care & 80G donations.' },
];

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: {
      role: 'owner',
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      panNumber: '',
      preferredCause: 'Emergency Medical & Surgeries',
      monthlyPledge: false,
      agreeTerms: true,
    },
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const selectedRole = watch('role');
  const isDonor = selectedRole === 'donor';

  const onSubmit = async (values: RegisterForm) => {
    setServerError('');
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        role: values.role || 'owner',
        phone: values.phone?.trim() || undefined,
        address: values.address || values.city || values.state || values.zipCode
          ? {
              street: values.address?.trim() || undefined,
              city: values.city?.trim() || undefined,
              state: values.state?.trim() || undefined,
              zipCode: values.zipCode?.trim() || undefined,
            }
          : undefined,
      };

      const data = await authApi.register(payload);
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      navigate(roleHomePath(data.user.role), { replace: true });
    } catch (err) {
      const apiError = (err as { response?: { data?: ApiError } }).response?.data;
      const msg = apiError?.message || 'Unable to create your account. Please check your information and try again.';
      setServerError(msg);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-ink">
      {/* Left branding panel (desktop) */}
      <div
        className="relative hidden w-[38%] flex-col overflow-hidden lg:flex"
        style={{
          background: isDonor
            ? 'linear-gradient(160deg, #ede9fe 0%, #ddd6fe 40%, #c4b5fd 100%)'
            : 'linear-gradient(160deg, #e8f5e9 0%, #c8e6c9 40%, #a5d6a7 100%)',
        }}
      >
        {/* Logo */}
        <div className="relative z-10 p-8">
          <Link to="/" className="flex items-center gap-2">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-md ${isDonor ? 'bg-purple-700 text-white' : 'bg-green-600 text-white'}`}>
              {isDonor ? <Heart className="h-6 w-6 fill-current" /> : <PawPrint className="h-6 w-6" />}
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-white drop-shadow">ResQPet</div>
              <div className="text-[10px] text-white/80">
                {isDonor ? 'Animal Care • Donation Portal' : 'AI & IoT Powered Pet Rescue Ecosystem'}
              </div>
            </div>
          </Link>
        </div>

        {/* Content */}
        <div className="relative flex-1">
          <img
            src="/auth-puppy.jpg"
            alt="Cute puppy"
            className="h-full w-full object-cover object-top"
            style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}
          />
          <div className="absolute inset-0 flex flex-col justify-between p-8" style={{background:'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.55) 100%)'}}>
            <div className="mt-4">
              <h1 className="font-display text-4xl font-bold leading-tight text-white drop-shadow-lg">
                {isDonor ? (
                  <>
                    Become a <span className="text-purple-300">ResQPet Patron</span><br />
                    Save Voiceless Animals 💖
                  </>
                ) : (
                  <>
                    Join <span className="text-green-400">ResQPet</span><br />
                    Make a Difference<br />for Pets in Need 🐾
                  </>
                )}
              </h1>
              <div className={`mt-2 h-1 w-12 rounded-full ${isDonor ? 'bg-purple-400' : 'bg-green-400'}`}></div>
              <p className="mt-4 text-sm text-white/80 drop-shadow">
                {isDonor
                  ? 'Your generous contributions directly fund on-ground emergency animal rescues with 100% transparent audit trails & 80G tax benefits.'
                  : 'Create your account and be part of a smart community that protects, rescues, and cares for pets.'}
              </p>
            </div>

            {/* Feature cards */}
            <div className="mb-4 space-y-2.5">
              {features.map((f) => (
                <div key={f.title} className="flex items-start gap-3 rounded-xl bg-black/40 backdrop-blur-sm px-4 py-3 shadow-sm border border-white/10">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isDonor ? 'bg-purple-500/30 text-purple-300' : 'bg-green-500/20'}`}>
                    {f.icon}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isDonor ? 'text-purple-300' : 'text-green-400'}`}>{f.title}</p>
                    <p className="text-xs text-white/70">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="flex items-center gap-2 rounded-2xl bg-black/40 backdrop-blur-sm px-5 py-4 shadow-sm border border-white/10">
              <Heart className={`h-4 w-4 shrink-0 ${isDonor ? 'text-purple-400' : 'text-green-400'}`} fill="currentColor" />
              <p className="text-sm font-medium text-white/90">
                {isDonor ? '"Every donation brings hope. Every heart makes a difference." 💖' : '"Be the reason a lost pet finds its way home." 🐾'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-white dark:bg-ink">
        {/* Top bar */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-ink/5 dark:border-bone/5">
          <Link to="/" className="lg:hidden flex items-center gap-1.5 font-display font-bold text-moss-600 dark:text-moss-400">
            <PawPrint className="h-5 w-5" />
            <span>ResQPet</span>
          </Link>
          <div className="ml-auto text-xs sm:text-sm text-ink/60 dark:text-bone/60">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-moss-600 hover:underline">
              Login
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-start justify-center px-4 py-4 sm:px-8" ref={topRef}>
          <div className="w-full max-w-2xl py-2 sm:py-4">
            {/* Header */}
            <div className="mb-5 sm:mb-6">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink dark:text-bone flex items-center gap-2">
                {isDonor ? 'Join as a ResQPet Donor' : 'Create Your Account'}
                {isDonor && <span className="text-purple-600">💖</span>}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ink/60 dark:text-bone/60">
                {isDonor
                  ? 'Register to track contributions, claim 80G tax exemption receipts, and follow rescue impact.'
                  : 'Fill in your details to join the ResQPet community'}
              </p>
            </div>

            {/* Server Error Banner */}
            {serverError && (
              <div className="mb-5 rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                <div className="flex-1">
                  <p className="font-semibold text-xs">Registration Failed</p>
                  <p className="text-xs mt-0.5">{serverError}</p>
                </div>
                <button onClick={() => setServerError('')} className="text-red-400 hover:text-red-600 text-sm font-bold">✕</button>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>
              {/* Hidden Role input */}
              <input type="hidden" {...register('role')} />

              {/* Role Selection Grid */}
              <div>
                <span className="mb-2 block text-xs sm:text-sm font-medium text-ink/80 dark:text-bone/80">I am registering as</span>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {ROLE_OPTIONS.map((opt) => {
                    const isSelected = selectedRole === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setValue('role', opt.value, { shouldDirty: true, shouldValidate: true })}
                        className={`group relative flex flex-col items-center gap-1 rounded-xl border-2 p-2 sm:py-2.5 text-center transition-all ${
                          isSelected
                            ? opt.value === 'donor'
                              ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-sm'
                              : 'border-moss-600 bg-moss-50 dark:bg-moss-900/20 text-moss-700 dark:text-moss-300 shadow-sm'
                            : 'border-ink/10 dark:border-bone/10 text-ink/60 dark:text-bone/60 hover:border-moss-300 dark:hover:border-moss-700'
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle
                            className={`absolute -right-1 -top-1 h-3.5 w-3.5 ${
                              opt.value === 'donor'
                                ? 'text-purple-600 fill-purple-600'
                                : 'text-moss-600 fill-moss-600'
                            } bg-white dark:bg-ink rounded-full`}
                          />
                        )}
                        <div
                          className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full ${
                            isSelected
                              ? opt.value === 'donor'
                                ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                                : 'bg-moss-100 dark:bg-moss-800/30'
                              : 'bg-ink/5 dark:bg-bone/5'
                          }`}
                        >
                          {opt.icon}
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-1">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Donor Hero Callout Banner */}
              {isDonor && (
                <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50/50 p-4 text-xs dark:border-purple-900/40 dark:bg-purple-950/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-700 text-white font-bold shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white">Patron Tax Exemption & Benefits</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        All donations are 50% tax deductible under Section 80G of the Indian Income Tax Act.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Name & Email */}
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs sm:text-sm font-medium text-ink/80 dark:text-bone/80" htmlFor="reg-name">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30 dark:text-bone/30" />
                    <input
                      id="reg-name"
                      className="w-full rounded-xl border border-ink/15 dark:border-bone/15 bg-white dark:bg-ink-soft py-2.5 sm:py-3 pl-10 pr-4 text-sm text-ink dark:text-bone placeholder:text-ink/40 dark:placeholder:text-bone/40 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/20"
                      placeholder="e.g. Rahul Sharma"
                      {...register('name', { required: 'Please enter your full name' })}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs sm:text-sm font-medium text-ink/80 dark:text-bone/80" htmlFor="reg-email">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30 dark:text-bone/30" />
                    <input
                      id="reg-email"
                      type="email"
                      className="w-full rounded-xl border border-ink/15 dark:border-bone/15 bg-white dark:bg-ink-soft py-2.5 sm:py-3 pl-10 pr-4 text-sm text-ink dark:text-bone placeholder:text-ink/40 dark:placeholder:text-bone/40 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/20"
                      placeholder="e.g. rahul@example.com"
                      {...register('email', {
                        required: 'Please enter your email address',
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: 'Please enter a valid email address',
                        },
                      })}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>
              </div>

              {/* Mobile & Password */}
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs sm:text-sm font-medium text-ink/80 dark:text-bone/80" htmlFor="reg-phone">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30 dark:text-bone/30" />
                    <input
                      id="reg-phone"
                      type="tel"
                      className="w-full rounded-xl border border-ink/15 dark:border-bone/15 bg-white dark:bg-ink-soft py-2.5 sm:py-3 pl-10 pr-4 text-sm text-ink dark:text-bone placeholder:text-ink/40 dark:placeholder:text-bone/40 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/20"
                      placeholder="e.g. +91 98765 43210"
                      {...register('phone')}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs sm:text-sm font-medium text-ink/80 dark:text-bone/80" htmlFor="reg-password">
                    Create Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30 dark:text-bone/30" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      className="w-full rounded-xl border border-ink/15 dark:border-bone/15 bg-white dark:bg-ink-soft py-2.5 sm:py-3 pl-10 pr-11 text-sm text-ink dark:text-bone placeholder:text-ink/40 dark:placeholder:text-bone/40 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/20"
                      placeholder="Minimum 8 characters"
                      {...register('password', {
                        required: 'Please create a password',
                        minLength: { value: 8, message: 'Password must be at least 8 characters long' },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30 dark:text-bone/30 hover:text-ink/60"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>
              </div>

              {/* Donor Specific PAN & Preferred Cause Fields */}
              {isDonor && (
                <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 dark:border-purple-900/40 dark:bg-purple-950/20 space-y-3 text-xs">
                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                        PAN Card Number <span className="text-slate-400 font-normal">(For 80G Tax Certificates)</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-600" />
                        <input
                          type="text"
                          placeholder="e.g. ABCPS1234F"
                          className="w-full rounded-xl border border-purple-200 bg-white py-2.5 pl-10 pr-4 text-sm font-mono uppercase text-slate-900 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          {...register('panNumber')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                        Primary Cause to Support
                      </label>
                      <select
                        className="w-full rounded-xl border border-purple-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        {...register('preferredCause')}
                      >
                        <option value="Emergency Medical & Surgeries">Emergency Medical & Surgeries 🏥</option>
                        <option value="Daily Stray Feeding Drive">Daily Stray Feeding Drive 🥣</option>
                        <option value="Rescue Ambulance & Trauma Unit">Rescue Ambulance & Trauma Unit 🚑</option>
                        <option value="Shelter Kennels & Safe Foster">Shelter Kennels & Safe Foster 🏡</option>
                        <option value="General Corpus Mission">General ResQPet Mission 💖</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
                      {...register('monthlyPledge')}
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      I am interested in setting up a monthly auto-pledge for street animal relief.
                    </span>
                  </label>
                </div>
              )}

              {/* Address */}
              <div>
                <label className="mb-1.5 block text-xs sm:text-sm font-medium text-ink/80 dark:text-bone/80" htmlFor="reg-address">
                  Street Address <span className="text-ink/40 dark:text-bone/40 text-xs font-normal">(Optional for 80G Receipt)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30 dark:text-bone/30" />
                  <input
                    id="reg-address"
                    className="w-full rounded-xl border border-ink/15 dark:border-bone/15 bg-white dark:bg-ink-soft py-2.5 sm:py-3 pl-10 pr-4 text-sm text-ink dark:text-bone placeholder:text-ink/40 dark:placeholder:text-bone/40 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/20"
                    placeholder="Enter street or area name"
                    {...register('address')}
                  />
                </div>
              </div>

              {/* State, City, Pincode */}
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs sm:text-sm font-medium text-ink/80 dark:text-bone/80" htmlFor="reg-state">
                    State
                  </label>
                  <input
                    id="reg-state"
                    className="w-full rounded-xl border border-ink/15 dark:border-bone/15 bg-white dark:bg-ink-soft py-2.5 sm:py-3 px-3 sm:px-4 text-sm text-ink dark:text-bone placeholder:text-ink/40 dark:placeholder:text-bone/40 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/20"
                    placeholder="State name"
                    {...register('state')}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs sm:text-sm font-medium text-ink/80 dark:text-bone/80" htmlFor="reg-city">
                    City
                  </label>
                  <input
                    id="reg-city"
                    list="all-cities-list"
                    className="w-full rounded-xl border border-ink/15 dark:border-bone/15 bg-white dark:bg-ink-soft py-2.5 sm:py-3 px-3 sm:px-4 text-sm text-ink dark:text-bone placeholder:text-ink/40 dark:placeholder:text-bone/40 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/20"
                    placeholder="Select or enter city"
                    {...register('city')}
                  />
                  <datalist id="all-cities-list">
                    {ALL_INDIAN_CITIES.filter(c => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}, {c.state}
                      </option>
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs sm:text-sm font-medium text-ink/80 dark:text-bone/80" htmlFor="reg-zip">
                    Pincode
                  </label>
                  <input
                    id="reg-zip"
                    className="w-full rounded-xl border border-ink/15 dark:border-bone/15 bg-white dark:bg-ink-soft py-2.5 sm:py-3 px-3 sm:px-4 text-sm text-ink dark:text-bone placeholder:text-ink/40 dark:placeholder:text-bone/40 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/20"
                    placeholder="Pincode"
                    {...register('zipCode')}
                  />
                </div>
              </div>

              {/* Terms */}
              <label className="flex cursor-pointer items-start gap-2 text-xs sm:text-sm text-ink/70 dark:text-bone/70">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 h-4 w-4 rounded border-ink/20 accent-moss-600 shrink-0"
                  {...register('agreeTerms')}
                />
                <span>
                  I agree to the <Link to="/terms" className="text-moss-600 hover:underline font-medium">Terms & Conditions</Link> and <Link to="/privacy" className="text-moss-600 hover:underline font-medium">Privacy Policy</Link>
                </span>
              </label>

              {/* Submit error banner (bottom) */}
              {serverError && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Submit button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 sm:py-3.5 text-sm font-semibold text-white transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm ${
                    isDonor
                      ? 'bg-purple-700 hover:bg-purple-800 shadow-purple-950/20'
                      : 'bg-moss-600 hover:bg-moss-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Creating account…</span>
                    </>
                  ) : (
                    <>
                      {isDonor ? <Heart className="h-4 w-4 fill-current" /> : <PawPrint className="h-4 w-4" />}
                      <span>Create Account as {ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label || 'Member'}</span>
                    </>
                  )}
                </button>
                <div className="flex items-start gap-2 rounded-xl bg-moss-50 dark:bg-moss-900/20 p-3 border border-moss-100 dark:border-moss-900/30">
                  <Shield className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-moss-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-moss-700 dark:text-moss-400">Your Privacy Matters</p>
                    <p className="text-[10px] text-ink/50 dark:text-bone/50">We never share your info with anyone.</p>
                  </div>
                </div>
              </div>
            </form>

            {/* Divider */}
            <div className="my-5 sm:my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-ink/10 dark:bg-bone/10"></div>
              <span className="text-xs text-ink/40 dark:text-bone/40">or sign up with</span>
              <div className="h-px flex-1 bg-ink/10 dark:bg-bone/10"></div>
            </div>

            {/* Social Logins */}
            <div className="mb-6">
              <SocialLoginButtons role={selectedRole} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
