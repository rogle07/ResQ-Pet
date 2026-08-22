import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setNotifications, markAllRead } from '@/features/notifications/notificationSlice';
import { notificationApi } from '@/features/notifications/notificationApi';

const NotificationBell = () => {
  const dispatch = useAppDispatch();
  const { items, unreadCount } = useAppSelector((s) => s.notifications);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    notificationApi.list().then((data) => {
      dispatch(setNotifications({ items: data.notifications, unreadCount: data.unreadCount }));
    });
  }, [dispatch]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (unreadCount > 0) {
      notificationApi.markAllRead().then(() => dispatch(markAllRead()));
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen} className="pet-tag">
        🔔 {unreadCount > 0 ? `${unreadCount} new` : 'No new alerts'}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-ink/10 bg-white shadow-tag dark:border-bone/10 dark:bg-ink-soft">
          <div className="max-h-96 overflow-y-auto p-2">
            {items.length === 0 ? (
              <p className="p-4 text-center text-sm text-ink/50 dark:text-bone/50">You're all caught up.</p>
            ) : (
              items.slice(0, 20).map((n) => (
                <div key={n._id} className="rounded-xl px-3 py-2.5 hover:bg-moss-50 dark:hover:bg-moss-700/10">
                  <p className="text-sm font-medium text-ink dark:text-bone">{n.title}</p>
                  <p className="text-xs text-ink/60 dark:text-bone/60">{n.message}</p>
                  <p className="mt-1 font-mono text-[10px] text-mist-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
