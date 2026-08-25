import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  Eye,
  Edit2,
  ChevronLeft,
  Phone,
  Plus,
} from 'lucide-react';
import { INITIAL_APPOINTMENTS } from '@/data/veterinarianMockData';
import { VetAppointment } from '@/types/veterinarian';
import { NewAppointmentModal } from '@/components/veterinarian/NewAppointmentModal';

type FilterTab = 'All' | 'Today' | 'Upcoming' | 'Completed' | 'Cancelled';

export const VeterinarianAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<VetAppointment[]>(INITIAL_APPOINTMENTS);
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewModalOpen, setNewModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState<VetAppointment | null>(null);

  const itemsPerPage = 5;

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Tab filter
      if (activeTab === 'Today' && apt.date !== '2026-05-20') return false;
      if (activeTab === 'Upcoming' && apt.status !== 'Upcoming' && apt.status !== 'Scheduled') return false;
      if (activeTab === 'Completed' && apt.status !== 'Completed') return false;
      if (activeTab === 'Cancelled' && apt.status !== 'Cancelled') return false;

      // Date filter
      if (dateFilter && apt.date !== dateFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          apt.petName.toLowerCase().includes(q) ||
          apt.ownerName.toLowerCase().includes(q) ||
          apt.ownerPhone.includes(q) ||
          apt.breed.toLowerCase().includes(q) ||
          apt.purpose.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [appointments, activeTab, dateFilter, searchQuery]);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage) || 1;
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddAppointment = (newApt: VetAppointment) => {
    setAppointments((prev) => [newApt, ...prev]);
  };

  const handleStatusUpdate = (id: string, newStatus: VetAppointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (selectedApt && selectedApt.id === id) {
      setSelectedApt((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const getStatusBadge = (status: VetAppointment['status']) => {
    switch (status) {
      case 'Scheduled':
        return (
          <span className="inline-flex items-center rounded-xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            Scheduled
          </span>
        );
      case 'Upcoming':
        return (
          <span className="inline-flex items-center rounded-xl bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            Upcoming
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center rounded-xl bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
            Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center rounded-xl bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-xl bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/veterinarian" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">Appointments</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
          Appointments
        </h1>
      </div>

      {/* Top Filter Bar & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Today', 'Upcoming', 'Completed', 'Cancelled'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-[#1e6f42] text-white shadow-md shadow-emerald-950/20'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => setNewModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-[#1e6f42] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#165a34] shadow-md shadow-emerald-950/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" /> + New Appointment
        </button>
      </div>

      {/* Search and Date Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search appointment by pet, owner, phone or purpose..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="relative">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/60 font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Pet Details</th>
                <th className="px-6 py-4">Owner Details</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-semibold">
                    No appointments match the criteria.
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                  >
                    {/* Time */}
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 block">{apt.time}</span>
                      <span className="text-[10px] text-slate-400">{apt.date}</span>
                    </td>

                    {/* Pet Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={apt.image}
                          alt={apt.petName}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <p
                            onClick={() => navigate('/veterinarian/patients/P-101')}
                            className="font-extrabold text-slate-900 dark:text-white hover:text-emerald-700 cursor-pointer"
                          >
                            {apt.petName}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            {apt.species} • {apt.age} • {apt.breed}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Owner Details */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{apt.ownerName}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-emerald-600" />
                        <a href={`tel:${apt.ownerPhone}`} className="hover:underline">
                          {apt.ownerPhone}
                        </a>
                      </p>
                    </td>

                    {/* Purpose */}
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      {apt.purpose}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">{getStatusBadge(apt.status)}</td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedApt(apt)}
                          title="View Details"
                          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSelectedApt(apt)}
                          title="Edit / Reschedule"
                          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of{' '}
            {filteredAppointments.length} appointments
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold transition-all ${
                  currentPage === page
                    ? 'bg-[#1e6f42] text-white shadow-sm'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Appointment Details</h3>
              <button
                onClick={() => setSelectedApt(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl dark:bg-slate-800/40">
              <img
                src={selectedApt.image}
                alt={selectedApt.petName}
                className="h-14 w-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">{selectedApt.petName}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedApt.species} • {selectedApt.age} • {selectedApt.breed}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                  Owner: {selectedApt.ownerName} ({selectedApt.ownerPhone})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Schedule</span>
                <p className="font-bold text-slate-800 dark:text-white">{selectedApt.date} at {selectedApt.time}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Purpose</span>
                <p className="font-bold text-slate-800 dark:text-white">{selectedApt.purpose}</p>
              </div>
            </div>

            {selectedApt.notes && (
              <div className="p-3 bg-slate-50 rounded-xl dark:bg-slate-800/40 text-xs">
                <span className="text-[10px] text-slate-400 block uppercase font-bold mb-1">Clinical Remarks</span>
                <p className="text-slate-600 dark:text-slate-300">{selectedApt.notes}</p>
              </div>
            )}

            {/* Quick Status Modifiers */}
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold mb-2">Update Appointment Status</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusUpdate(selectedApt.id, 'Completed')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  ✓ Mark Completed
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedApt.id, 'Scheduled')}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  Schedule Next
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedApt.id, 'Cancelled')}
                  className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300"
                >
                  Cancel Appointment
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => navigate('/veterinarian/records')}
                className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Open Medical Record ➔
              </button>
              <button
                onClick={() => setSelectedApt(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 dark:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      <NewAppointmentModal
        isOpen={isNewModalOpen}
        onClose={() => setNewModalOpen(false)}
        onAddAppointment={handleAddAppointment}
      />
    </div>
  );
};
export default VeterinarianAppointments;
