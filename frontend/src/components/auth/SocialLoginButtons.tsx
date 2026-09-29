import { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { authApi } from '@/features/auth/authApi';
import { roleHomePath } from '@/routes/roleHomePath';
import type { UserRole, User } from '@/types';

// ---------- Type declarations ----------

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void;
          prompt: (momentListener?: (notification: { isNotDisplayed: () => boolean; getNotDisplayedReason: () => string }) => void) => void;
          cancel: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
            error_callback?: (error: unknown) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
    FB?: {
      init: (config: Record<string, unknown>) => void;
      login: (
        callback: (response: { authResponse?: { accessToken: string }; status: string }) => void,
        options?: Record<string, unknown>
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

// ---------- Env vars ----------

const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
  (import.meta.env.GOOGLE_CLIENT_ID as string) ||
  '';

// ---------- Props ----------

interface SocialLoginButtonsProps {
  /** Override redirect path after successful login */
  redirectTo?: string;
  /** Role to assign if this is a new registration */
  role?: string;
}

// ---------- Component ----------

const SocialLoginButtons = ({ redirectTo, role }: SocialLoginButtonsProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<'google' | 'facebook' | 'apple' | ''>('');
  const [googleReady, setGoogleReady] = useState(false);

  // ---- Shared success handler ----
  const handleSuccess = useCallback(
    (data: { user: User; accessToken: string }) => {
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      navigate(redirectTo || roleHomePath(data.user.role as UserRole), { replace: true });
    },
    [dispatch, navigate, redirectTo]
  );

  // ======== GOOGLE ========

  const tokenClientRef = useRef<{ requestAccessToken: (config?: { prompt?: string }) => void } | null>(null);

  // Keep a stable ref to the latest callback
  const handleGoogleCredentialRef = useRef<(response: { credential: string }) => void>(() => {});
  const handleGoogleTokenRef = useRef<(response: { access_token?: string; error?: string; error_description?: string }) => void>(() => {});

  const handleGoogleCredential = useCallback(
    async (response: { credential: string }) => {
      setError('');
      setLoading('google');
      try {
        const data = await authApi.googleLogin({ idToken: response.credential, role });
        handleSuccess(data);
      } catch (err) {
        const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
        setError(msg || 'Google sign-in failed. Please try again.');
      } finally {
        setLoading('');
      }
    },
    [handleSuccess, role]
  );

  const handleGoogleToken = useCallback(
    async (response: { access_token?: string; error?: string; error_description?: string }) => {
      if (response.error) {
        if (response.error !== 'popup_closed_by_user') {
          setError(response.error_description || 'Google sign-in was cancelled or failed.');
        }
        setLoading('');
        return;
      }

      if (!response.access_token) {
        setError('No access token received from Google.');
        setLoading('');
        return;
      }

      setError('');
      setLoading('google');
      try {
        const data = await authApi.googleLogin({ accessToken: response.access_token, role });
        handleSuccess(data);
      } catch (err) {
        const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
        setError(msg || 'Google sign-in failed. Please try again.');
      } finally {
        setLoading('');
      }
    },
    [handleSuccess, role]
  );

  useEffect(() => {
    handleGoogleCredentialRef.current = handleGoogleCredential;
    handleGoogleTokenRef.current = handleGoogleToken;
  });

  // Load Google Identity Services script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initGoogle = () => {
      try {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response: { credential: string }) => handleGoogleCredentialRef.current(response),
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        }

        if (window.google?.accounts?.oauth2) {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile openid',
            callback: (response) => handleGoogleTokenRef.current(response),
            error_callback: (err) => {
              console.warn('Google OAuth error:', err);
              setLoading('');
            },
          });
        }

        setGoogleReady(true);
      } catch (e) {
        console.warn('Google init exception:', e);
      }
    };

    if (window.google?.accounts) {
      initGoogle();
      return;
    }

    const existing = document.getElementById('google-gsi-script') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', initGoogle);
      return () => existing.removeEventListener('load', initGoogle);
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    script.onerror = () => setError('Failed to load Google Sign-In. Check your internet connection.');
    document.head.appendChild(script);
  }, []);

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google login is not configured. Add VITE_GOOGLE_CLIENT_ID to your frontend .env file.');
      return;
    }

    if (!googleReady && !window.google) {
      setError('Google Sign-In is still loading. Please wait a moment and try again.');
      return;
    }

    setError('');
    setLoading('google');

    // Prefer OAuth2 Token Client (opens standard popup dialog)
    if (tokenClientRef.current) {
      try {
        tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('Token client request failed, falling back to One Tap:', err);
      }
    }

    // Fallback to Google One Tap prompt
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          console.warn('Google One Tap not displayed:', reason);
          setLoading('');
          setError(`Google Sign-In prompt could not be displayed (${reason}). Please ensure popups/cookies are allowed.`);
        }
      });
    } else {
      setLoading('');
      setError('Google Sign-In is still loading. Please wait a moment and try again.');
    }
  };

  // ======== FACEBOOK ========

  const handleFacebookClick = () => {
    setError('Facebook Sign-In is coming soon. Please use Google Sign-In or your Email to continue.');
  };

  // ======== APPLE ========

  const handleAppleClick = () => {
    setError('Apple Sign-In is coming soon. Please use Google Sign-In or your Email to continue.');
  };

  // ======== Render ========

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-2.5 text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40 flex items-start gap-2 animate-in fade-in">
          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold ml-1">✕</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* ---- Google ---- */}
        <button
          type="button"
          id="social-login-google"
          onClick={handleGoogleClick}
          disabled={loading === 'google'}
          title="Sign in with Google"
          className="group relative flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-ink/10 dark:border-bone/10 py-2 sm:py-2.5 px-1.5 sm:px-3 text-xs sm:text-sm font-medium text-ink dark:text-bone transition-all hover:bg-ink/5 dark:hover:bg-bone/5 hover:border-ink/20 dark:hover:border-bone/20 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'google' ? (
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          <span className="truncate">{loading === 'google' ? 'Signing in…' : 'Google'}</span>
        </button>

        {/* ---- Facebook ---- */}
        <button
          type="button"
          id="social-login-facebook"
          onClick={handleFacebookClick}
          title="Sign in with Facebook — Coming Soon"
          className="group relative flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-ink/10 dark:border-bone/10 py-2 sm:py-2.5 px-1.5 sm:px-3 text-xs sm:text-sm font-medium text-ink/70 dark:text-bone/70 transition-all hover:bg-[#1877F2]/5 hover:border-[#1877F2]/30 hover:shadow-sm cursor-pointer"
        >
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#1877F2] transition-transform group-hover:scale-110 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="truncate">Facebook</span>
          <span className="absolute -right-1.5 -top-1.5 rounded-full bg-blue-500/20 dark:bg-blue-400/20 text-[#1877F2] dark:text-blue-400 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide leading-none">
            Soon
          </span>
        </button>

        {/* ---- Apple ---- */}
        <button
          type="button"
          id="social-login-apple"
          onClick={handleAppleClick}
          disabled={loading === 'apple'}
          title="Sign in with Apple — Coming Soon"
          className="group relative flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-ink/10 dark:border-bone/10 py-2 sm:py-2.5 px-1.5 sm:px-3 text-xs sm:text-sm font-medium text-ink/50 dark:text-bone/50 transition-all hover:bg-ink/5 dark:hover:bg-bone/5 hover:border-ink/20 cursor-pointer"
        >
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          <span className="truncate">Apple</span>
          <span className="absolute -right-1.5 -top-1.5 rounded-full bg-ink/20 dark:bg-bone/20 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-ink/60 dark:text-bone/60 leading-none">
            Soon
          </span>
        </button>
      </div>
    </div>
  );
};

export default SocialLoginButtons;
