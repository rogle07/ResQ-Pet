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
      } catch {
        dispatch(setUnauthenticated());
      }
    })();
  }, [dispatch]);
};
