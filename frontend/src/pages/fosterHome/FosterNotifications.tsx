import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Bell,
  FileText,
  Stethoscope,
  MessageSquare,
  Gift,
  Check
} from 'lucide-react';
import { FosterNotificationItem } from '@/types/foster';

const INITIAL_NOTIFICATIONS: FosterNotificationItem[] = [
  {
    id: 'n1',
    title: 'New Foster Care Request: Luna (Labrador)',
    message: 'Ravi Sharma has requested 30 days recovery foster care for Luna. Medical dressing needed twice daily.',
    type: 'request',
    timestamp: '10 minutes ago',
    read: false,
    actionUrl: '/foster-home/requests',
  },
  {
    id: 'n2',
    title: 'Vaccination Due Reminder: Golu (Goat)',
    message: 'Deworming booster and vaccination scheduled for tomorrow with Dr. Mehta.',
    type: 'medical',
    timestamp: '2 hours ago',
    read: false,
    actionUrl: '/foster-home/requests',
  },
  {
    id: 'n3',
    title: 'New Message from Neha Verma',
    message: '"I have attached the updated medical card for Milo. Please check."',
    type: 'message',
    timestamp: '5 hours ago',
    read: true,
    actionUrl: '/foster-home/requests',
  },
  {
    id: 'n4',
    title: 'Donation Received: ₹1,000 for Food Support',
    message: 'Rahul Khanna contributed ₹1,000 via UPI. Receipt #RQP1021 generated.',
    type: 'system',
    timestamp: '1 day ago',
    read: true,
    actionUrl: '/foster-home/donations',
  },
  {
    id: 'n5',
    title: 'Adoption Inquiry for Bunny',
    message: 'A verified family from Nainital has submitted an inquiry to adopt Bunny.',
    type: 'request',
    timestamp: '2 days ago',
    read: true,
    actionUrl: '/foster-home/adoption',
  },
];

const FosterNotifications = () => {
  const [notifications, setNotifications] = useState<FosterNotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'request' | 'medical'>('all');

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'request') return n.type === 'request';
    if (filter === 'medical') return n.type === 'medical';
    return true;
  });

  const getIcon = (type: FosterNotificationItem['type']) => {
    switch (type) {
      case 'request':
        return <FileText className="h-5 w-5 text-emerald-600" />;
      case 'medical':
        return <Stethoscope className="h-5 w-5 text-amber-600" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-sky-600" />;
      case 'system':
        return <Gift className="h-5 w-5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/foster-home" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">Notifications</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
            Foster Care Notifications
          </h1>
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
          >
            <Check className="h-3.5 w-3.5" /> Mark all as read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        {[
          { id: 'all', label: 'All Notifications' },
          { id: 'unread', label: 'Unread' },
          { id: 'request', label: 'Foster Requests' },
          { id: 'medical', label: 'Medical & Vet' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              filter === tab.id
                ? 'bg-[#1e6f42] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No notifications in this category</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all ${
                !item.read
                  ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                  : 'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 shrink-0">
                  {getIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">{item.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {item.actionUrl && (
                  <Link
                    to={item.actionUrl}
                    className="rounded-xl bg-[#1e6f42] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm"
                  >
                    View Details
                  </Link>
                )}
                <button
                  onClick={() => toggleRead(item.id)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  {item.read ? 'Mark Unread' : 'Mark Read'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FosterNotifications;
