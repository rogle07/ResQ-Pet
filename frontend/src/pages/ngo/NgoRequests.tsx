import { useState } from 'react';
import { Clock, MapPin, AlertTriangle, CheckCircle, Filter, Search, Plus, X, Users, Shield, Phone } from 'lucide-react';

const TEAMS = [
  { id: '1', name: 'Team Alpha', avatar: 'TA', color: 'bg-violet-600', leader: 'Rohit Sharma', phone: '+91 98765 43210', area: 'Indira Nagar, Gomti Nagar', activeRescues: 2, status: 'active' },
  { id: '2', name: 'Team Bravo', avatar: 'TB', color: 'bg-blue-600', leader: 'Anita Rao', phone: '+91 87654 32109', area: 'Hazratganj, Mahanagar', activeRescues: 3, status: 'active' },
  { id: '3', name: 'Team Charlie', avatar: 'TC', color: 'bg-emerald-600', leader: 'Suresh Kumar', phone: '+91 76543 21098', area: 'Aliganj, Faizabad Road', activeRescues: 1, status: 'active' },
  { id: '4', name: 'Team Delta', avatar: 'TD', color: 'bg-amber-600', leader: 'Rekha Mishra', phone: '+91 65432 10987', area: 'Charbagh, Alambagh', activeRescues: 0, status: 'standby' },
];

interface Request {
  id: string;
  animal: string;
  emoji: string;
  location: string;
  reportedBy: string;
  timeAgo: string;
  priority: string;
  status: string;
  description: string;
  assignedTeam?: string;
}

const INITIAL_REQUESTS: Request[] = [
  { id: '1', animal: 'Injured Dog', emoji: '🐕', location: 'Indira Nagar, Lucknow', reportedBy: 'Rahul Sharma', timeAgo: '10 min ago', priority: 'High', status: 'pending', description: 'Dog was hit by a vehicle on the main road and cannot stand.' },
  { id: '2', animal: 'Kitten Trapped', emoji: '🐈', location: 'Gomti Nagar, Lucknow', reportedBy: 'Priya Singh', timeAgo: '30 min ago', priority: 'Medium', status: 'in_progress', description: 'Small kitten stuck inside a drain near the market.' },
  { id: '3', animal: 'Injured Cow', emoji: '🐄', location: 'Faizabad Road, Lucknow', reportedBy: 'Aman Verma', timeAgo: '1 hr ago', priority: 'High', status: 'in_progress', description: 'Cow hit by a truck, bleeding from leg, needs immediate vet.' },
  { id: '4', animal: 'Bird with Broken Wing', emoji: '🐦', location: 'Hazratganj, Lucknow', reportedBy: 'Neha Mishra', timeAgo: '2 hr ago', priority: 'Low', status: 'pending', description: 'Small pigeon with visibly broken wing found on footpath.' },
  { id: '5', animal: 'Stray Dogs Pack', emoji: '🐕‍🦺', location: 'Aliganj, Lucknow', reportedBy: 'Suresh Kumar', timeAgo: '3 hr ago', priority: 'Medium', status: 'resolved', description: 'Pack of 6-7 aggressive stray dogs causing panic in residential area.' },
  { id: '6', animal: 'Abandoned Puppies', emoji: '🐶', location: 'Mahanagar, Lucknow', reportedBy: 'Anita Rao', timeAgo: '5 hr ago', priority: 'Medium', status: 'resolved', description: '4 newborn puppies abandoned in a cardboard box.' },
];

const PRIORITY_STYLES: Record<string, string> = {
  High: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30',
  Medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
  Low: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800',
  in_progress: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
  resolved: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
  assigned: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30',
};

const NgoRequests = () => {
  const [requests, setRequests] = useState<Request[]>(INITIAL_REQUESTS);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Assign Team Modal state
  const [assigningRequest, setAssigningRequest] = useState<Request | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Request Modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAnimal, setNewAnimal] = useState('');
  const [newPriority, setNewPriority] = useState('High');
  const [newLocation, setNewLocation] = useState('');
  const [newReporter, setNewReporter] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const filtered = requests.filter((r) => {
    const matchSearch = r.animal.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === 'All' || r.priority === filterPriority;
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchSearch && matchPriority && matchStatus;
  });

  const openAssignModal = (req: Request) => {
    setAssigningRequest(req);
    setSelectedTeamId(null);
    setSuccessMsg(null);
  };

  const handleAssign = () => {
    if (!selectedTeamId || !assigningRequest) return;
    setAssigning(true);
    const team = TEAMS.find((t) => t.id === selectedTeamId);

    setTimeout(() => {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === assigningRequest.id
            ? { ...r, status: 'assigned', assignedTeam: team?.name }
            : r
        )
      );
      setSuccessMsg(`Successfully assigned to ${team?.name}!`);
      setAssigning(false);

      setTimeout(() => {
        setAssigningRequest(null);
        setSuccessMsg(null);
      }, 1500);
    }, 800);
  };

  const handleCreateRequest = () => {
    if (!newAnimal.trim() || !newLocation.trim()) return;
    const emojiMap: Record<string, string> = {
      dog: '🐕',
      cat: '🐈',
      cow: '🐄',
      bird: '🐦',
      puppy: '🐶',
      kitten: '🐱',
    };
    const lower = newAnimal.toLowerCase();
    const foundEmojiKey = Object.keys(emojiMap).find((k) => lower.includes(k));
    const emoji = foundEmojiKey ? emojiMap[foundEmojiKey] : '🐾';

    const created: Request = {
      id: String(Date.now()),
      animal: newAnimal,
      emoji,
      location: newLocation,
      reportedBy: newReporter || 'Anonymous Citizen',
      timeAgo: 'Just now',
      priority: newPriority,
      status: 'pending',
      description: newDesc || 'Animal reported in distress needing emergency assistance.',
    };

    setRequests((prev) => [created, ...prev]);
    setNewAnimal('');
    setNewLocation('');
    setNewReporter('');
    setNewDesc('');
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Requests / Reports</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All incoming rescue requests and animal distress reports.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Request
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-800 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          {['All', 'High', 'Medium', 'Low'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${filterPriority === p ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'}`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {['All', 'pending', 'assigned', 'in_progress', 'resolved'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${filterStatus === s ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Stat bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Requests', value: requests.length, icon: <AlertTriangle className="h-5 w-5" />, color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' },
          { label: 'In Progress / Assigned', value: requests.filter((r) => r.status === 'in_progress' || r.status === 'assigned').length, icon: <Clock className="h-5 w-5" />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Resolved', value: requests.filter((r) => r.status === 'resolved').length, icon: <CheckCircle className="h-5 w-5" />, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            No requests match your filters.
          </div>
        )}
        {filtered.map((req) => (
          <div key={req.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-3xl dark:bg-slate-800">
                {req.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">{req.animal}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${PRIORITY_STYLES[req.priority]}`}>{req.priority} Priority</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${STATUS_STYLES[req.status] || STATUS_STYLES.pending}`}>{req.status.replace('_', ' ')}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{req.description}</p>
                <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{req.timeAgo}</span>
                  <span>Reported by: <span className="font-semibold text-slate-700 dark:text-slate-300">{req.reportedBy}</span></span>
                  {req.assignedTeam && (
                    <span className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-semibold">
                      <Shield className="h-3 w-3" /> Assigned to: {req.assignedTeam}
                    </span>
                  )}
                </div>
              </div>
              {req.status !== 'resolved' && (
                <button
                  onClick={() => openAssignModal(req)}
                  className="shrink-0 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 active:scale-95 transition-all shadow-md shadow-violet-600/20"
                >
                  {req.assignedTeam ? 'Reassign Team' : 'Assign Team'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── New Request Modal ── */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Create Rescue Request</h2>
              <button onClick={() => setShowNewModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Animal / Distress Title *</label>
                <input
                  value={newAnimal}
                  onChange={(e) => setNewAnimal(e.target.value)}
                  placeholder="e.g. Injured Stray Dog"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Reported By</label>
                  <input
                    value={newReporter}
                    onChange={(e) => setNewReporter(e.target.value)}
                    placeholder="e.g. Citizen Name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Location / Landmark *</label>
                <input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Near Wave Mall, Gomti Nagar, Lucknow"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Situation Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe the condition of the animal and urgency..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
              <button onClick={() => setShowNewModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700">Cancel</button>
              <button
                onClick={handleCreateRequest}
                disabled={!newAnimal.trim() || !newLocation.trim()}
                className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Team Modal ── */}
      {assigningRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">Assign Rescue Team</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {assigningRequest.emoji} {assigningRequest.animal} — {assigningRequest.location}
                </p>
              </div>
              <button
                onClick={() => setAssigningRequest(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pt-3 pb-1">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${PRIORITY_STYLES[assigningRequest.priority]}`}>
                  {assigningRequest.priority} Priority
                </span>
                <span className="text-[11px] text-slate-500">Select an available team below:</span>
              </div>
            </div>

            <div className="px-6 pb-4 space-y-2 max-h-72 overflow-y-auto">
              {TEAMS.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`w-full flex items-center gap-4 rounded-xl border-2 p-3.5 text-left transition-all ${
                    selectedTeamId === team.id
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                      : 'border-slate-100 bg-slate-50 hover:border-violet-200 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-violet-700'
                  }`}
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${team.color} text-sm font-black text-white`}>
                    {team.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{team.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${team.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {team.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Leader: {team.leader}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-violet-400" />{team.area}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{team.phone}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-black text-slate-900 dark:text-white">{team.activeRescues}</p>
                    <p className="text-[10px] text-slate-400">active rescues</p>
                    {selectedTeamId === team.id && (
                      <div className="mt-1 flex h-5 w-5 ml-auto items-center justify-center rounded-full bg-violet-600">
                        <CheckCircle className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {successMsg && (
              <div className="mx-6 mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-900/30">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{successMsg}</p>
              </div>
            )}

            <div className="flex gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
              <button
                onClick={() => setAssigningRequest(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedTeamId || assigning}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {assigning ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Assigning…
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" /> Confirm Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoRequests;
