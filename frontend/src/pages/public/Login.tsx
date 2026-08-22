import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { authApi } from '@/features/auth/authApi';
import { roleHomePath } from '@/routes/roleHomePath';
import type { ApiError } from '@/types';
import { PawPrint, Mail, Lock, Eye, EyeOff, Shield, Users, Bell, Heart, Headphones } from 'lucide-react';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';

interface LoginForm {
  email: string;
  password: string;
}

const features = [
  { icon: <Shield className="h-5 w-5 text-moss-600" />, title: 'Secure & Reliable', desc: 'Your data is protected with advanced security.' },
  { icon: <Users className="h-5 w-5 text-moss-600" />, title: 'Community Driven', desc: 'Connect with pet owners, rescuers & NGOs.' },
  { icon: <Bell className="h-5 w-5 text-moss-600" />, title: 'Real-time Alerts', desc: 'Get instant updates for lost & found pets.' },
  { icon: <Heart className="h-5 w-5 text-moss-600" />, title: 'Support & Care', desc: 'Help pets through adoption, foster care & donations.' },
];

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (values: LoginForm) => {
    setServerError('');
    try {
      const data = await authApi.login(values);
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      const redirectTo = (location.state as { from?: Location })?.from?.pathname || roleHomePath(data.user.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const apiError = (err as { response?: { data?: ApiError } }).response?.data;
      setServerError(apiError?.message || 'Unable to log in. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-ink">
      {/* Left panel */}
      <div className="relative hidden w-[42%] flex-col overflow-hidden lg:flex" style={{ background: 'linear-gradient(160deg, #e8f5e9 0%, #c8e6c9 40%, #a5d6a7 100%)' }}>
        {/* Logo */}
        <div className="relative z-10 p-8">
          <Link to="/" className="flex items-center gap-2">
            <PawPrint className="h-9 w-9 text-green-400" />
            <div>
              <div className="font-display text-2xl font-bold text-white drop-shadow">ResQPet</div>
              <div className="text-[10px] text-white/70">AI &amp; IoT Powered Pet Rescue Ecosystem</div>
            </div>
          </Link>
        </div>

        {/* Puppy image */}
        <div className="relative flex-1">
          <img
            src="/auth-puppy.jpg"
            alt="Cute puppy"
            className="h-full w-full object-cover object-top"
            style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}
          />
          {/* Overlay content */}
          <div className="absolute inset-0 flex flex-col justify-between p-8" style={{background:'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.55) 100%)'}}>
            <div className="mt-4">
              <h1 className="font-display text-4xl font-bold leading-tight text-white drop-shadow-lg">
                Together, We Can<br />Build a Safer World<br />for <span className="text-green-400">Our Pets</span> 🐾
              </h1>
              <div className="mt-2 h-1 w-12 rounded-full bg-green-400"></div>
              <p className="mt-4 text-sm text-white/80 drop-shadow">
                Login to your account and continue making<br />a difference in the lives of pets in need.
              </p>
            </div>

            {/* Feature cards */}
            <div className="mb-4 space-y-2.5">
              {features.map((f) => (
                <div key={f.title} className="flex items-start gap-3 rounded-xl bg-black/40 backdrop-blur-sm px-4 py-3 shadow-sm border border-white/10">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-400">{f.title}</p>
                    <p className="text-xs text-white/70">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="flex items-center gap-2 rounded-2xl bg-black/40 backdrop-blur-sm px-5 py-4 shadow-sm border border-white/10">
              <Heart className="h-4 w-4 shrink-0 text-green-400" fill="currentColor" />
              <p className="text-sm font-medium text-white/90">"Be the reason a pet finds its way home." 🐾</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col bg-white dark:bg-ink">
        {/* Top bar */}
        <div className="flex justify-end p-4 sm:p-6">
          <span className="text-xs sm:text-sm text-ink/60 dark:text-bone/60">
            New to ResQPet?{' '}
            <Link to="/register" className="font-semibold text-moss-600 hover:underline">
              Create Account
            </Link>
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-4 sm:px-8 sm:py-6">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-moss-100 dark:bg-moss-700/20">
                <PawPrint className="h-6 w-6 sm:h-7 sm:w-7 text-moss-600" />
              </div>
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-ink dark:text-bone">Welcome Back!</h2>
                <p className="text-xs sm:text-sm text-ink/60 dark:text-bone/60">Login to continue to your account</p>
              </div>
            </div>

            {serverError && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs sm:text-sm font-medium text-ink/80 dark:text-bone/80" htmlFor="login-email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30 dark:text-bone/30" />
                  <input
                    id="login-email"
                    type="email"
                    className="w-full rounded-xl border border-ink/15 dark:border-bone/15 bg-white dark:bg-ink-soft py-2.5 sm:py-3 pl-10 pr-4 text-sm text-ink dark:text-bone placeholder:text-ink/40 dark:placeholder:text-bone/40 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/20"
                    placeholder="Enter your email address"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs sm:text-sm font-medium text-ink/80 dark:text-bone/80" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30 dark:text-bone/30" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full rounded-xl border border-ink/15 dark:border-bone/15 bg-white dark:bg-ink-soft py-2.5 sm:py-3 pl-10 pr-11 text-sm text-ink dark:text-bone placeholder:text-ink/40 dark:placeholder:text-bone/40 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/20"
                    placeholder="Enter your password"
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30 dark:text-bone/30 hover:text-ink/60"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-ink/70 dark:text-bone/70">
                  <input type="checkbox" className="h-4 w-4 rounded border-ink/20 accent-moss-600" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="font-medium text-moss-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-moss-600 py-3 sm:py-3.5 text-sm font-semibold text-white transition-colors hover:bg-moss-700 disabled:opacity-60"
              >
                <PawPrint className="h-4 w-4" />
                {isSubmitting ? 'Logging in…' : 'Login to Your Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-4 sm:my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-ink/10 dark:bg-bone/10"></div>
              <span className="text-xs text-ink/40 dark:text-bone/40">or continue with</span>
              <div className="h-px flex-1 bg-ink/10 dark:bg-bone/10"></div>
            </div>

            {/* Social logins */}
            <SocialLoginButtons />

            {/* Privacy */}
            <div className="mt-4 sm:mt-5 flex items-start gap-3 rounded-xl bg-moss-50 dark:bg-moss-900/20 p-3.5 sm:p-4 border border-moss-100 dark:border-moss-900/30">
              <Shield className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-moss-600" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-moss-700 dark:text-moss-400">Your Privacy Matters</p>
                <p className="mt-0.5 text-[11px] sm:text-xs text-ink/60 dark:text-bone/60">We respect your privacy and never share your information with anyone.</p>
              </div>
            </div>

            {/* Bottom features */}
            <div className="mt-5 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              {[
                { icon: <PawPrint className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-moss-600" />, label: 'Find Pets', sub: 'Report or search lost & found pets' },
                { icon: <Heart className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-orange-500" fill="currentColor" />, label: 'Adoption', sub: 'Give a pet a loving forever home' },
                { icon: <Users className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-blue-500" />, label: 'Foster Care', sub: 'Provide temporary care & support' },
                { icon: <Shield className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-teal-600" />, label: 'Donations', sub: 'Support rescue operations' },
              ].map((f) => (
                <div key={f.label} className="rounded-lg p-2 text-center bg-gray-50/50 dark:bg-white/5 sm:bg-transparent">
                  {f.icon}
                  <p className="text-xs font-semibold text-ink dark:text-bone">{f.label}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-ink/50 dark:text-bone/50">{f.sub}</p>
                </div>
              ))}
            </div>

            {/* Help */}
            <div className="mt-4 pb-2 flex justify-center">
              <button type="button" className="flex items-center gap-1.5 text-xs text-ink/50 dark:text-bone/50 hover:text-ink dark:hover:text-bone">
                <Headphones className="h-3.5 w-3.5" />
                Need Help? <span className="text-moss-600 font-medium">Contact Support</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
