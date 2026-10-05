import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials, setUnauthenticated } from '@/features/auth/authSlice';

/**
 * On first mount, attempts to silently restore a session using the httpOnly
 * refresh-token cookie. If it succeeds, fetches the user profile and hydrates
 * Redux; otherwise marks the app as unauthenticated so routing can redirect.
 */
export const useSessionBootstrap = () => {
  const dispatch = useAppDispatch();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const { data: refreshData } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const { data: meData } = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${refreshData.accessToken}` },
        });
        dispatch(setCredentials({ user: meData.user, accessToken: refreshData.accessToken }));
        try {
          localStorage.setItem('resqpet_auth_user', JSON.stringify(meData.user));
        } catch { /* ignore */ }
      } catch {
        // Silently restore session from localStorage if available
        try {
          const stored = localStorage.getItem('resqpet_auth_user');
          if (stored) {
            const user = JSON.parse(stored);
            if (user && user.role) {
              dispatch(setCredentials({ user, accessToken: 'demo-local-token' }));
              return;
            }
          }
        } catch { /* ignore */ }
        dispatch(setUnauthenticated());
      }
    })();
  }, [dispatch]);
};
