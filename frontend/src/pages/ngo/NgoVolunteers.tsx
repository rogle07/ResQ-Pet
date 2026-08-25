import { useState } from 'react';
import { Users, Phone, Mail, MapPin, Shield, Plus, Star, Search, X, Edit3, Save } from 'lucide-react';

interface Volunteer {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  area: string;
  team: string | null;
  status: string;
  rescuesCompleted: number;
  joinedDate: string;
  rating: number;
  avatar: string;
  color: string;
  bio?: string;
  skills?: string[];
  availability?: string;
}

const INITIAL_VOLUNTEERS: Volunteer[] = [
  { id: '1', name: 'Rahul Sharma', role: 'Field Rescuer', phone: '+91 98765 43210', email: 'rahul@example.com', area: 'Indira Nagar', team: 'Team Alpha', status: 'active', rescuesCompleted: 24, joinedDate: 'Jan 2025', rating: 4.9, avatar: 'RS', color: 'bg-violet-600', bio: 'Passionate animal lover with 3+ years of field rescue experience. Expert in dog and cow handling.', skills: ['Field Rescue', 'Dog Handling', 'First Aid', 'Transport'], availability: 'Mon–Sat, 6 AM – 8 PM' },
  { id: '2', name: 'Priya Singh', role: 'Medical Assistant', phone: '+91 87654 32109', email: 'priya@example.com', area: 'Gomti Nagar', team: 'Team Bravo', status: 'active', rescuesCompleted: 18, joinedDate: 'Mar 2025', rating: 4.8, avatar: 'PS', color: 'bg-blue-600', bio: 'Trained veterinary assistant supporting medical treatments for rescued animals.', skills: ['Wound Care', 'IV Drips', 'Medication', 'Record Keeping'], availability: 'Daily, 9 AM – 6 PM' },
  { id: '3', name: 'Aman Verma', role: 'Driver / Transport', phone: '+91 76543 21098', email: 'aman@example.com', area: 'Faizabad Road', team: 'Team Alpha', status: 'active', rescuesCompleted: 31, joinedDate: 'Nov 2024', rating: 5.0, avatar: 'AV', color: 'bg-emerald-600', bio: 'Dedicated transport volunteer with a rescue van. Available for emergency animal transport 24/7.', skills: ['Driving', 'Animal Loading', 'Emergency Response', 'Navigation'], availability: '24/7 On Call' },
  { id: '4', name: 'Neha Mishra', role: 'Awareness Coordinator', phone: '+91 65432 10987', email: 'neha@example.com', area: 'Hazratganj', team: null, status: 'active', rescuesCompleted: 12, joinedDate: 'Jun 2025', rating: 4.7, avatar: 'NM', color: 'bg-amber-600', bio: 'Runs community awareness programs about animal welfare and stray animal care.', skills: ['Public Speaking', 'Social Media', 'Event Planning', 'Fundraising'], availability: 'Weekends & Evenings' },
  { id: '5', name: 'Suresh Kumar', role: 'Field Rescuer', phone: '+91 54321 09876', email: 'suresh@example.com', area: 'Aliganj', team: 'Team Charlie', status: 'inactive', rescuesCompleted: 9, joinedDate: 'Aug 2025', rating: 4.5, avatar: 'SK', color: 'bg-rose-600', bio: 'New volunteer with enthusiasm for animal welfare. Currently on short leave.', skills: ['Field Rescue', 'Basic First Aid'], availability: 'Currently unavailable' },
  { id: '6', name: 'Anita Rao', role: 'Team Leader', phone: '+91 43210 98765', email: 'anita@example.com', area: 'Mahanagar', team: 'Team Bravo', status: 'active', rescuesCompleted: 45, joinedDate: 'Sep 2024', rating: 5.0, avatar: 'AR', color: 'bg-teal-600', bio: 'Experienced team leader coordinating rescue operations across Mahanagar and Hazratganj.', skills: ['Leadership', 'Coordination', 'Animal Handling', 'Team Management', 'Crisis Response'], availability: 'Mon–Sun, 7 AM – 9 PM' },
];

const NgoVolunteers = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(INITIAL_VOLUNTEERS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [viewingVolunteer, setViewingVolunteer] = useState<Volunteer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Volunteer>>({});

  // New volunteer form state
  const [newVol, setNewVol] = useState({
    name: '',
    role: 'Field Rescuer',
    phone: '',
    email: '',
    area: '',
  });

  const filtered = volunteers.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.role.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const toggleStatus = (id: string) => {
    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: v.status === 'active' ? 'inactive' : 'active' } : v
      )
    );
    if (viewingVolunteer?.id === id) {
      setViewingVolunteer((v) => v ? { ...v, status: v.status === 'active' ? 'inactive' : 'active' } : v);
    }
  };

  const startEditing = (vol: Volunteer) => {
    setEditForm({ ...vol });
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!viewingVolunteer || !editForm.name) return;
    const updated = { ...viewingVolunteer, ...editForm } as Volunteer;
    setVolunteers((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    setViewingVolunteer(updated);
    setIsEditing(false);
  };

  const handleAddVolunteer = () => {
    if (!newVol.name.trim() || !newVol.phone.trim()) return;
    const initials = newVol.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['bg-violet-600', 'bg-blue-600', 'bg-emerald-600', 'bg-teal-600', 'bg-rose-600', 'bg-amber-600'];
    const created: Volunteer = {
      id: String(Date.now()),
      name: newVol.name,
      role: newVol.role,
      phone: newVol.phone,
      email: newVol.email || `${newVol.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      area: newVol.area || 'Lucknow',
      team: null,
      status: 'active',
      rescuesCompleted: 0,
      joinedDate: 'Aug 2026',
      rating: 5.0,
      avatar: initials || 'VO',
      color: colors[volunteers.length % colors.length],
      bio: 'Newly registered volunteer ready to assist in animal welfare and rescues.',
      skills: ['Animal Welfare', 'Field Assistance'],
      availability: 'Available on call',
    };
    setVolunteers((prev) => [created, ...prev]);
    setNewVol({ name: '', role: 'Field Rescuer', phone: '', email: '', area: '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Volunteers</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your volunteer network and track their contributions.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Volunteer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Volunteers', value: volunteers.length, color: 'text-violet-600' },
          { label: 'Active', value: volunteers.filter((v) => v.status === 'active').length, color: 'text-emerald-600' },
          { label: 'Total Rescues', value: volunteers.reduce((a, v) => a + v.rescuesCompleted, 0), color: 'text-blue-600' },
          { label: 'Avg Rating', value: (volunteers.reduce((a, v) => a + v.rating, 0) / (volunteers.length || 1)).toFixed(1), color: 'text-amber-500' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search volunteers..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
        </div>
        <div className="flex gap-2">
          {['All', 'active', 'inactive'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`rounded-xl px-4 py-2 text-xs font-bold capitalize transition-colors ${filterStatus === s ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Volunteer Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v) => (
          <div key={v.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${v.color} text-sm font-black text-white`}>{v.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{v.name}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${v.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{v.status}</span>
                </div>
                <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold">{v.role}</p>
                {v.team && <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><Shield className="h-3 w-3" />{v.team}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="rounded-xl bg-slate-50 p-2.5 text-center dark:bg-slate-800/50">
                <p className="text-lg font-black text-slate-900 dark:text-white">{v.rescuesCompleted}</p>
                <p className="text-[10px] text-slate-500">Rescues</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 text-center dark:bg-slate-800/50">
                <p className="text-lg font-black text-amber-500 flex items-center justify-center gap-0.5"><Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />{v.rating}</p>
                <p className="text-[10px] text-slate-500">Rating</p>
              </div>
            </div>
            <div className="space-y-1.5 mb-4 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-violet-500" />{v.phone}</div>
              <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-violet-500" />{v.email}</div>
              <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-violet-500" />{v.area}</div>
              <div className="flex items-center gap-1.5"><Users className="h-3 w-3 text-violet-500" />Joined: {v.joinedDate}</div>
            </div>
            <button
              onClick={() => {
                setViewingVolunteer(v);
                setIsEditing(false);
              }}
              className="w-full rounded-xl bg-violet-50 py-2 text-xs font-bold text-violet-600 hover:bg-violet-100 transition-colors dark:bg-violet-900/20 dark:text-violet-400"
            >
              View Profile
            </button>
          </div>
        ))}
      </div>

      {/* ── View / Edit Profile Modal ── */}
      {viewingVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header banner */}
            <div className={`h-24 ${viewingVolunteer.color} relative`}>
              <button onClick={() => setViewingVolunteer(null)} className="absolute right-4 top-4 rounded-lg p-1.5 bg-black/20 text-white hover:bg-black/30">
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Avatar overlapping */}
            <div className="px-6 pb-6">
              <div className="-mt-8 mb-3 flex items-end justify-between">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white ${viewingVolunteer.color} text-lg font-black text-white dark:border-slate-900`}>
                  {viewingVolunteer.avatar}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${viewingVolunteer.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {viewingVolunteer.status}
                </span>
              </div>

              {!isEditing ? (
                <>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{viewingVolunteer.name}</h2>
                  <p className="text-sm text-violet-600 font-semibold">{viewingVolunteer.role}</p>
                  {viewingVolunteer.team && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Shield className="h-3 w-3" />{viewingVolunteer.team}</p>
                  )}

                  {/* Bio */}
                  {viewingVolunteer.bio && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{viewingVolunteer.bio}"</p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { label: 'Rescues', value: viewingVolunteer.rescuesCompleted, color: 'text-violet-600' },
                      { label: 'Rating', value: viewingVolunteer.rating, color: 'text-amber-500' },
                      { label: 'Joined', value: viewingVolunteer.joinedDate, color: 'text-blue-600' },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/50">
                        <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-slate-500">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Contact details */}
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Phone className="h-4 w-4 text-violet-500" />{viewingVolunteer.phone}</div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Mail className="h-4 w-4 text-violet-500" />{viewingVolunteer.email}</div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><MapPin className="h-4 w-4 text-violet-500" />{viewingVolunteer.area}</div>
                  </div>

                  {/* Skills */}
                  {viewingVolunteer.skills && (
                    <div className="mt-4">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {viewingVolunteer.skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  {viewingVolunteer.availability && (
                    <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-2.5 dark:bg-emerald-900/20">
                      <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Availability</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-500">{viewingVolunteer.availability}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => toggleStatus(viewingVolunteer.id)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors ${
                        viewingVolunteer.status === 'active'
                          ? 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:border-rose-800'
                          : 'bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800'
                      }`}
                    >
                      {viewingVolunteer.status === 'active' ? 'Mark Inactive' : 'Mark Active'}
                    </button>
                    <button
                      onClick={() => startEditing(viewingVolunteer)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" /> Edit Profile
                    </button>
                  </div>
                </>
              ) : (
                /* Edit Form */
                <div className="space-y-4 pt-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Edit Volunteer Details</h3>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Full Name</label>
                    <input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Role / Specialization</label>
                    <input
                      value={editForm.role || ''}
                      onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Phone</label>
                      <input
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Area</label>
                      <input
                        value={editForm.area || ''}
                        onChange={(e) => setEditForm((p) => ({ ...p, area: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Bio / Notes</label>
                    <textarea
                      rows={3}
                      value={editForm.bio || ''}
                      onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
                    >
                      <Save className="h-4 w-4" /> Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Add Volunteer Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Volunteer</h2>
              <button onClick={() => setShowAdd(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Full Name *</label>
                <input
                  value={newVol.name}
                  onChange={(e) => setNewVol((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Alok Verma"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Role / Specialization</label>
                <select
                  value={newVol.role}
                  onChange={(e) => setNewVol((p) => ({ ...p, role: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option>Field Rescuer</option>
                  <option>Medical Assistant</option>
                  <option>Driver / Transport</option>
                  <option>Awareness Coordinator</option>
                  <option>Shelter Caretaker</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Phone Number *</label>
                <input
                  value={newVol.phone}
                  onChange={(e) => setNewVol((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="+91 98765 00000"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Email Address</label>
                <input
                  value={newVol.email}
                  onChange={(e) => setNewVol((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="alok@example.com"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Area of Service</label>
                <input
                  value={newVol.area}
                  onChange={(e) => setNewVol((p) => ({ ...p, area: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Aliganj, Gomti Nagar"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700">Cancel</button>
              <button
                onClick={handleAddVolunteer}
                disabled={!newVol.name.trim() || !newVol.phone.trim()}
                className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                Add Volunteer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoVolunteers;
