import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  PawPrint,
  Clock,
  MapPin,
  Gift,
  FileText,
  Search,
  PlusCircle,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { INITIAL_FOSTER_REQUESTS } from '@/data/fosterMockData';
import { FosterItem } from '@/types/foster';
import { FosterRequestModal } from '@/components/fosterHome/FosterRequestModal';
import { api } from '@/api/client';

const FosterHomeOverview = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FosterItem[]>(INITIAL_FOSTER_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<FosterItem | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get<{ success: boolean; requests: any[] }>('/foster');
        if (res.data?.success && res.data.requests?.length > 0) {
          const apiRequests: FosterItem[] = res.data.requests.map((r: any) => ({
            id: r._id,
            petName: r.pet?.name || 'Rescue Pet',
            species: (r.pet?.species ? r.pet.species.charAt(0).toUpperCase() + r.pet.species.slice(1) : 'Dog') as any,
            breed: r.pet?.breed || 'Rescue',
            age: r.pet?.age ? `${r.pet.age} years` : '2 years',
            gender: r.pet?.gender === 'female' ? 'Female' : 'Male',
            location: r.requestedBy?.address || 'Nainital Region',
            image: r.pet?.images?.[0]?.url || '/animal-dog.jpg',
            requesterName: r.requestedBy?.name || 'Pet Owner',
            requesterPhone: r.requestedBy?.phone || '+91 98765 43210',
            requesterEmail: r.requestedBy?.email || '',
            requesterAddress: r.requestedBy?.address || '',
            requestDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '19 May 2026',
            timeAgo: 'Recent',
            status: r.status === 'accepted' ? 'Accepted' : r.status === 'rejected' ? 'Rejected' : r.status === 'active' ? 'Accepted' : 'New',
            urgency: 'High',
            durationDays: r.durationDays || 30,
            reason: r.reason || 'Pet owner requested foster home care.',
            healthInfo: {
              vaccinated: true,
              neutered: true,
              medicalNeeds: 'Regular checkup completed.',
              diet: 'Balanced pet food',
              temperament: ['Friendly', 'Gentle'],
            },
            messages: (r.messages || []).map((m: any) => ({
              id: m._id || `m-${Date.now()}`,
              sender: m.sender?._id === r.requestedBy?._id ? 'requester' : 'user',
              senderName: m.sender?.name || 'Requester',
              text: m.text,
              timestamp: new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            })),
          }));

          const existingIds = new Set(apiRequests.map((a) => a.id));
          setRequests([...apiRequests, ...INITIAL_FOSTER_REQUESTS.filter((x) => !existingIds.has(x.id))]);
        }
      } catch {
        // Keep initial mock data
      }
    };

    fetchRequests();
  }, []);

  const handleStatusChange = (id: string, newStatus: FosterItem['status']) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleSendMessage = (id: string, text: string) => {
    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'user' as const,
      senderName: 'Foster Care Coordinator',
      text,
      timestamp: 'Just now',
    };

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, messages: [...r.messages, newMsg] } : r))
    );
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest((prev) =>
        prev ? { ...prev, messages: [...prev.messages, newMsg] } : null
      );
    }
  };

  const activeFostersCount = requests.filter((r) => r.status === 'Accepted').length || 8;
  const newRequestsCount = requests.filter((r) => r.status === 'New').length || 4;

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#175231] via-[#1e6f42] to-[#288f57] p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <PawPrint className="h-3.5 w-3.5" /> Compassionate Foster Home Network
          </span>
          <h1 className="mt-3 font-display text-2xl sm:text-4xl font-black tracking-tight">
            Welcome to Foster Care Management
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Provide safe shelter, love, and medical care for rescued and recovering animals. Review inbound foster applications, connect with loving adopters, and manage care contributions.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/foster-home/requests"
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#175231] hover:bg-emerald-50 transition-all shadow-sm"
            >
              Review Pending Requests <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/foster-home/application"
              className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 backdrop-blur-sm transition-all"
            >
              Submit Foster Application
            </Link>
          </div>
        </div>

        {/* Decorative background paw graphics */}
        <div className="pointer-events-none absolute -right-8 -bottom-10 opacity-15">
          <PawPrint className="h-64 w-64 text-white" />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Foster Requests */}
        <div
          onClick={() => navigate('/foster-home/requests')}
          className="cursor-pointer rounded-2xl border border-emerald-200/80 bg-[#f0fdf4] p-5 shadow-sm hover:shadow-md transition-all dark:bg-emerald-950/30 dark:border-emerald-900/40"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1e6f42] text-white shadow-sm">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Foster Requests</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{newRequestsCount}</h3>
              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Pending Review</p>
            </div>
          </div>
        </div>

        {/* Card 2: Active Fosters */}
        <div
          onClick={() => navigate('/foster-home/requests')}
          className="cursor-pointer rounded-2xl border border-teal-200/80 bg-[#f0fdfa] p-5 shadow-sm hover:shadow-md transition-all dark:bg-teal-950/30 dark:border-teal-900/40"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm">
              <PawPrint className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Fosters</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{activeFostersCount}</h3>
              <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">Animals Under Care</p>
            </div>
          </div>
        </div>

        {/* Card 3: Adoptions */}
        <div
          onClick={() => navigate('/foster-home/adoption')}
          className="cursor-pointer rounded-2xl border border-amber-200/80 bg-[#fffbeb] p-5 shadow-sm hover:shadow-md transition-all dark:bg-amber-950/30 dark:border-amber-900/40"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Adoptable Pets</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">23</h3>
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Ready for Forever Home</p>
            </div>
          </div>
        </div>

        {/* Card 4: Donations Received */}
        <div
          onClick={() => navigate('/foster-home/donations')}
          className="cursor-pointer rounded-2xl border border-sky-200/80 bg-[#f0f9ff] p-5 shadow-sm hover:shadow-md transition-all dark:bg-sky-950/30 dark:border-sky-900/40"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Donations Received</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">₹45,780</h3>
              <p className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">Total Contributions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Foster Requests (Left) & Quick Actions (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Recent Foster Requests */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-800 dark:text-white">
              Recent Foster Requests
            </h2>
            <Link
              to="/foster-home/requests"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline dark:text-emerald-400 flex items-center gap-1"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {requests.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedRequest(item)}
                className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={item.image}
                    alt={item.petName}
                    className="h-14 w-14 rounded-2xl object-cover border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {item.petName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {item.age} • {item.gender} • {item.breed}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      <MapPin className="h-3 w-3 text-emerald-600" />
                      {item.location}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {item.timeAgo}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-800 dark:text-white">
            Quick Actions
          </h2>

          <div className="space-y-3">
            {/* Action 1: New Foster Application */}
            <Link
              to="/foster-home/application"
              className="flex items-center gap-3.5 rounded-2xl border border-emerald-200 bg-[#f0fdf4] p-4 text-emerald-900 shadow-sm transition-all hover:bg-emerald-100/70 hover:scale-[1.01] dark:bg-emerald-950/30 dark:border-emerald-900/60 dark:text-emerald-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">New Foster Application</h3>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">Submit application to care for animals</p>
              </div>
            </Link>

            {/* Action 2: View Foster Requests */}
            <Link
              to="/foster-home/requests"
              className="flex items-center gap-3.5 rounded-2xl border border-sky-200 bg-[#f0f9ff] p-4 text-sky-900 shadow-sm transition-all hover:bg-sky-100/70 hover:scale-[1.01] dark:bg-sky-950/30 dark:border-sky-900/60 dark:text-sky-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">View Foster Requests</h3>
                <p className="text-[11px] text-sky-700/80 dark:text-sky-300/80">Manage, review & accept pending animals</p>
              </div>
            </Link>

            {/* Action 3: Browse Pets for Adoption */}
            <Link
              to="/foster-home/adoption"
              className="flex items-center gap-3.5 rounded-2xl border border-amber-200 bg-[#fffbeb] p-4 text-amber-900 shadow-sm transition-all hover:bg-amber-100/70 hover:scale-[1.01] dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Browse Pets for Adoption</h3>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">Find forever loving homes for rescued pets</p>
              </div>
            </Link>

            {/* Action 4: Make a Donation */}
            <Link
              to="/foster-home/donations"
              className="flex items-center gap-3.5 rounded-2xl border border-rose-200 bg-[#fff1f2] p-4 text-rose-900 shadow-sm transition-all hover:bg-rose-100/70 hover:scale-[1.01] dark:bg-rose-950/30 dark:border-rose-900/60 dark:text-rose-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Make a Donation</h3>
                <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">Support food, medical care & shelter costs</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Foster Request Modal */}
      <FosterRequestModal
        request={selectedRequest}
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        onStatusChange={handleStatusChange}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default FosterHomeOverview;
