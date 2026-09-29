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
  FileText, Sparkles, UserCheck
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
  { value: 'owner',              label: 'Pet Owner',           icon: <PawPrint className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { value: 'finder',             label: 'Finder',              icon: <Search className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { value: 'found_pet_reporter', label: 'Found Pet Reporter',  icon: <MapPin className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { value: 'rescue_team',        label: 'Rescuer / Rescue Team', icon: <Shield className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { value: 'ngo',                label: 'NGO / Shelter',        icon: <Users className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { value: 'adopter',            label: 'Adopter',              icon: <UserCheck className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { value: 'foster_home',        label: 'Foster Care Provider', icon: <HomeIcon className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { value: 'donor',              label: 'Donor / Patron',       icon: <Heart className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />, badge: '80G Tax' },
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
      {/* Left branding panel — 4-pet animated collage */}
      <div className="relative hidden w-[38%] flex-col overflow-hidden lg:flex">
        {/* 2x2 photo collage */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {[
            { src: '/animal-dog.jpg',    anim: 'auth-pan-left' },
            { src: '/animal-cat.jpg',    anim: 'auth-pan-right' },
            { src: '/animal-rabbit.jpg', anim: 'auth-pan-right' },
            { src: '/animal-bird.jpg',   anim: 'auth-pan-left' },
          ].map((pet, i) => (
            <div key={i} className="relative overflow-hidden">
              <img
                src={pet.src}
                alt="Pet"
                className={`absolute inset-0 h-full w-full object-cover brightness-85 ${pet.anim}`}
              />
            </div>
          ))}
        </div>

        {/* Gradient overlay — adapts color by role */}
        <div
          className="absolute inset-0"
          style={{
            background: isDonor
              ? 'linear-gradient(160deg,rgba(88,28,135,0.65) 0%,rgba(109,40,217,0.35) 50%,rgba(0,0,0,0.65) 100%)'
              : 'linear-gradient(160deg,rgba(0,0,0,0.55) 0%,rgba(0,30,15,0.35) 50%,rgba(0,0,0,0.65) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 animate-fade-in">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-sm border ${
              isDonor ? 'bg-purple-500/20 border-purple-400/30' : 'bg-emerald-500/20 border-emerald-400/30'
            }`}>
              {isDonor ? <Heart className="h-6 w-6 text-purple-300 fill-current" /> : <PawPrint className="h-6 w-6 text-emerald-300" />}
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-white drop-shadow">ResQPet</div>
              <div className="text-[10px] text-white/60 tracking-wide">
                {isDonor ? 'Animal Care • Donation Portal' : 'AI & IoT Powered Pet Rescue Ecosystem'}
              </div>
            </div>
          </Link>

          {/* Hero text */}
          <div className="mt-auto mb-auto pt-12">
            <h1 className="font-display text-4xl font-black leading-tight text-white drop-shadow-lg animate-slide-left">
              {isDonor ? (
                <>Become a <span className="text-purple-300">Patron</span><br />Save Voiceless<br />Animals 💖</>
              ) : (
                <>Join <span className="text-emerald-300">ResQPet</span><br />Make a Difference<br />for Pets 🐾</>
              )}
            </h1>
            <div className={`mt-3 h-1 w-16 rounded-full animate-fade-in delay-300 ${isDonor ? 'bg-purple-400' : 'bg-emerald-400'}`} />
            <p className="mt-4 text-sm text-white/75 leading-relaxed animate-fade-in delay-400 max-w-xs">
              {isDonor
                ? 'Your contributions fund on-ground animal rescues with 80G tax benefits.'
                : 'Create your account and protect, rescue, and care for pets in need.'}
            </p>
          </div>

          {/* Feature cards */}
          <div className="mb-4 space-y-2">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`flex items-start gap-3 rounded-xl bg-black/50 backdrop-blur-md px-4 py-3 border border-white/10 animate-fade-up delay-${(i + 3) * 100}`}
              >
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  isDonor ? 'bg-purple-500/25' : 'bg-emerald-500/25'
                }`}>
                  {f.icon}
                </div>
                <div>
                  <p className={`text-xs font-bold ${ isDonor ? 'text-purple-300' : 'text-emerald-300'}`}>{f.title}</p>
                  <p className="text-[11px] text-white/65">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="flex items-center gap-2 rounded-2xl bg-black/50 backdrop-blur-md px-5 py-3.5 border border-white/10 animate-fade-up delay-700">
            <Heart className={`h-4 w-4 shrink-0 ${ isDonor ? 'text-purple-400' : 'text-emerald-400'}`} fill="currentColor" />
            <p className="text-xs font-medium text-white/85">
              {isDonor ? '"Every donation brings hope." 💖' : '"Be the reason a pet finds its way home." 🐾'}
            </p>
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
                <span className="mb-2 block text-xs sm:text-sm font-medium text-ink/80 dark:text-slate-300">I am registering as</span>
                <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 xl:grid-cols-8 gap-2">
                  {ROLE_OPTIONS.map((opt) => {
                    const isSelected = selectedRole === opt.value;
                    const isDonorOpt = opt.value === 'donor';

                    return (
                      <button
                        type="button"
                        key={opt.value}
                        title={opt.label}
                        onClick={() => setValue('role', opt.value, { shouldDirty: true, shouldValidate: true })}
                        className={`group relative flex flex-col items-center gap-1.5 rounded-xl p-2 sm:py-2.5 text-center transition-all duration-200 ${
                          isSelected
                            ? isDonorOpt
                              ? 'border-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 shadow-sm dark:shadow-purple-950/50 ring-1 ring-purple-500/20'
                              : 'border-2 border-emerald-600 dark:border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 shadow-sm dark:shadow-emerald-950/50 ring-1 ring-emerald-500/20'
                            : 'border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {isSelected && (
                          <div
                            className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full ${
                              isDonorOpt
                                ? 'bg-purple-600 dark:bg-purple-400 text-white dark:text-slate-950 ring-2 ring-white dark:ring-slate-900'
                                : 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 ring-2 ring-white dark:ring-slate-900'
                            }`}
                          >
                            <CheckCircle className="h-3.5 w-3.5 fill-current" />
                          </div>
                        )}
                        <div
                          className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full transition-colors ${
                            isSelected
                              ? isDonorOpt
                                ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                                : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                              : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50/60 dark:group-hover:bg-emerald-950/40 shadow-xs'
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
