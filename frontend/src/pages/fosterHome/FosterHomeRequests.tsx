import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  ChevronLeft,
  Phone,
  MapPin,
  Eye,
  Filter
} from 'lucide-react';
import { INITIAL_FOSTER_REQUESTS } from '@/data/fosterMockData';
import { FosterItem } from '@/types/foster';
import { FosterRequestModal } from '@/components/fosterHome/FosterRequestModal';
import { api } from '@/api/client';

type FilterTab = 'All Requests' | 'New' | 'Under Review' | 'Accepted' | 'Rejected';

const FosterHomeRequests = () => {
  const [requests, setRequests] = useState<FosterItem[]>(INITIAL_FOSTER_REQUESTS);
  const [activeTab, setActiveTab] = useState<FilterTab>('All Requests');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<FosterItem | null>(null);
  const itemsPerPage = 5;

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
        // Keep initial mock
      }
    };

    fetchRequests();
  }, []);

  // Filter logic
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Tab filter
      if (activeTab !== 'All Requests' && r.status !== activeTab) return false;
      // Species filter
      if (speciesFilter !== 'All' && r.species !== speciesFilter) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.petName.toLowerCase().includes(q) ||
          r.requesterName.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.breed.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [requests, activeTab, speciesFilter, searchQuery]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage) || 1;
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const getStatusBadge = (status: FosterItem['status']) => {
    switch (status) {
      case 'New':
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            New
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            Under Review
          </span>
        );
      case 'Accepted':
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800">
            Accepted
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/foster-home" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">Foster Requests</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
          Foster Requests
        </h1>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {(['All Requests', 'New', 'Under Review', 'Accepted', 'Rejected'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-[#1e6f42] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search pet or requester..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-48 sm:w-64 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={speciesFilter}
              onChange={(e) => {
                setSpeciesFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="All">All Animals</option>
              <option value="Dog">Dogs</option>
              <option value="Cat">Cats</option>
              <option value="Rabbit">Rabbits</option>
              <option value="Goat">Goats</option>
              <option value="Cow">Cows</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List Table / Cards */}
      <div className="space-y-3">
        {paginatedRequests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No foster requests found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          paginatedRequests.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedRequest(item)}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800 cursor-pointer"
            >
              {/* Pet Info */}
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.petName}
                  className="h-16 w-16 rounded-2xl object-cover border border-slate-100 dark:border-slate-800 shrink-0 group-hover:scale-105 transition-transform"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {item.petName}
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md dark:bg-emerald-950/40 dark:text-emerald-300">
                      {item.species}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.age} • {item.gender} • {item.breed}
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    <MapPin className="h-3 w-3 text-emerald-600" />
                    {item.location}
                  </p>
                </div>
              </div>

              {/* Requester & Duration info */}
              <div className="flex flex-wrap sm:flex-col items-start sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                <div className="text-left sm:text-right">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.requesterName}</p>
                  <p className="flex items-center gap-1 text-[11px] text-slate-400 sm:justify-end">
                    <Phone className="h-3 w-3 text-emerald-600" /> {item.requesterPhone}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-500">
                    Duration: <strong className="text-slate-800 dark:text-slate-200">{item.durationDays} days</strong>
                  </span>
                  {getStatusBadge(item.status)}
                  <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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

export default FosterHomeRequests;
