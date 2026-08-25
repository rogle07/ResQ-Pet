import { useState } from 'react';
import { Users, MapPin, Shield, Phone, Plus, CheckCircle, X, Clock, AlertTriangle, UserCheck } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  leader: string;
  phone: string;
  members: string[];
  area: string;
  status: string;
  activeRescues: number;
  completedToday: number;
  avatar: string;
  color: string;
  assignedRequests: string[];
}

const PENDING_REQUESTS = [
  { id: 'r1', animal: 'Injured Dog', emoji: '🐕', location: 'Indira Nagar, Lucknow', priority: 'High', timeAgo: '10 min ago', reportedBy: 'Rahul Sharma' },
  { id: 'r2', animal: 'Kitten Trapped', emoji: '🐈', location: 'Gomti Nagar, Lucknow', priority: 'Medium', timeAgo: '30 min ago', reportedBy: 'Priya Singh' },
  { id: 'r3', animal: 'Injured Cow', emoji: '🐄', location: 'Faizabad Road, Lucknow', priority: 'High', timeAgo: '1 hr ago', reportedBy: 'Aman Verma' },
  { id: 'r4', animal: 'Bird with Broken Wing', emoji: '🐦', location: 'Hazratganj, Lucknow', priority: 'Low', timeAgo: '2 hr ago', reportedBy: 'Neha Mishra' },
];

const PRIORITY_STYLES: Record<string, string> = {
  High: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30',
  Medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
  Low: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30',
};

const INITIAL_TEAMS: Team[] = [
  {
    id: '1', name: 'Team Alpha', leader: 'Rohit Sharma', phone: '+91 98765 43210',
    members: ['Rohit Sharma', 'Priya Singh', 'Amit Kumar', 'Neha Gupta', 'Raj Patel', 'Sunita Devi'],
    area: 'Indira Nagar, Gomti Nagar', status: 'active', activeRescues: 2, completedToday: 5,
    avatar: 'TA', color: 'bg-violet-600', assignedRequests: [],
  },
  {
    id: '2', name: 'Team Bravo', leader: 'Anita Rao', phone: '+91 87654 32109',
    members: ['Anita Rao', 'Vikram Singh', 'Meera Joshi', 'Arun Kumar', 'Kavita Sharma'],
    area: 'Hazratganj, Mahanagar', status: 'active', activeRescues: 3, completedToday: 4,
    avatar: 'TB', color: 'bg-blue-600', assignedRequests: [],
  },
  {
    id: '3', name: 'Team Charlie', leader: 'Suresh Kumar', phone: '+91 76543 21098',
    members: ['Suresh Kumar', 'Deepa Singh', 'Manoj Verma', 'Ritu Saxena'],
    area: 'Aliganj, Faizabad Road', status: 'active', activeRescues: 1, completedToday: 3,
    avatar: 'TC', color: 'bg-emerald-600', assignedRequests: [],
  },
  {
    id: '4', name: 'Team Delta', leader: 'Rekha Mishra', phone: '+91 65432 10987',
    members: ['Rekha Mishra', 'Pankaj Gupta', 'Seema Yadav'],
    area: 'Charbagh, Alambagh', status: 'standby', activeRescues: 0, completedToday: 2,
    avatar: 'TD', color: 'bg-amber-600', assignedRequests: [],
  },
];

const NgoRescueTeam = () => {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [showAddModal, setShowAddModal] = useState(false);

  // View details modal state
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);

  // Assign rescue modal state
  const [assigningTeam, setAssigningTeam] = useState<Team | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New team form
  const [newTeam, setNewTeam] = useState({ name: '', leader: '', phone: '', area: '' });

  const openAssignModal = (team: Team) => {
    setAssigningTeam(team);
    setSelectedRequestId(null);
    setSuccessMsg(null);
  };

  const handleAssignRescue = () => {
    if (!selectedRequestId || !assigningTeam) return;
    const req = PENDING_REQUESTS.find((r) => r.id === selectedRequestId);
    setAssigning(true);

    setTimeout(() => {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === assigningTeam.id
            ? { ...t, activeRescues: t.activeRescues + 1, assignedRequests: [...t.assignedRequests, selectedRequestId] }
            : t
        )
      );
      setSuccessMsg(`${req?.animal} assigned to ${assigningTeam.name}!`);
      setAssigning(false);
      setTimeout(() => {
        setAssigningTeam(null);
        setSuccessMsg(null);
      }, 1500);
    }, 800);
  };

  const toggleTeamStatus = (teamId: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, status: t.status === 'active' ? 'standby' : 'active' } : t
      )
    );
    if (viewingTeam?.id === teamId) {
      setViewingTeam((t) => (t ? { ...t, status: t.status === 'active' ? 'standby' : 'active' } : t));
    }
  };

  const handleAddTeam = () => {
    if (!newTeam.name.trim()) return;
    const t: Team = {
      id: String(Date.now()),
      name: newTeam.name,
      leader: newTeam.leader,
      phone: newTeam.phone,
      members: [newTeam.leader].filter(Boolean),
      area: newTeam.area,
      status: 'active',
      activeRescues: 0,
      completedToday: 0,
      avatar: newTeam.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2),
      color: ['bg-violet-600', 'bg-blue-600', 'bg-emerald-600', 'bg-teal-600', 'bg-rose-600'][teams.length % 5],
      assignedRequests: [],
    };
    setTeams((prev) => [...prev, t]);
    setNewTeam({ name: '', leader: '', phone: '', area: '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Rescue Team Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage and monitor all active rescue teams.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add New Team
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Teams', value: teams.length, color: 'text-violet-600' },
          { label: 'Active Teams', value: teams.filter((t) => t.status === 'active').length, color: 'text-emerald-600' },
          { label: 'Active Rescues', value: teams.reduce((a, t) => a + t.activeRescues, 0), color: 'text-blue-600' },
          { label: 'Total Members', value: teams.reduce((a, t) => a + t.members.length, 0), color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Teams Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {teams.map((team) => (
          <div key={team.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition-shadow">
            {/* Team header */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${team.color} text-sm font-black text-white`}>
                {team.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white">{team.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${team.status === 'active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'}`}>
                    {team.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Leader: <span className="font-semibold text-slate-700 dark:text-slate-300">{team.leader}</span></p>
                <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-500">
                  <Phone className="h-3 w-3" />{team.phone}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Members', value: team.members.length, icon: <Users className="h-4 w-4" /> },
                { label: 'Active Rescues', value: team.activeRescues, icon: <Shield className="h-4 w-4" /> },
                { label: 'Completed Today', value: team.completedToday, icon: <CheckCircle className="h-4 w-4" /> },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-slate-50 p-2.5 text-center dark:bg-slate-800/50">
                  <div className="flex justify-center text-violet-500 mb-1">{s.icon}</div>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-[10px] text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Area & Members */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
                <MapPin className="h-3.5 w-3.5 text-violet-500" />
                <span>{team.area}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {team.members.map((m) => (
                  <span key={m} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">{m}</span>
                ))}
              </div>
            </div>

            {/* Assigned rescues list */}
            {team.assignedRequests.length > 0 && (
              <div className="mb-4 rounded-xl bg-violet-50 px-3 py-2 dark:bg-violet-900/20">
                <p className="text-[11px] font-bold text-violet-700 dark:text-violet-400 mb-1">Newly Assigned:</p>
                {team.assignedRequests.map((rid) => {
                  const req = PENDING_REQUESTS.find((r) => r.id === rid);
                  return req ? (
                    <p key={rid} className="text-[11px] text-violet-600 dark:text-violet-300">{req.emoji} {req.animal} — {req.location}</p>
                  ) : null;
                })}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                onClick={() => setViewingTeam(team)}
                className="flex-1 rounded-xl border border-violet-200 bg-violet-50 py-2 text-xs font-bold text-violet-600 hover:bg-violet-100 transition-colors dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-400"
              >
                View Details
              </button>
              <button
                onClick={() => openAssignModal(team)}
                className="flex-1 rounded-xl bg-violet-600 py-2 text-xs font-bold text-white hover:bg-violet-700 active:scale-95 transition-all shadow-md shadow-violet-600/20"
              >
                Assign Rescue
              </button>
            </div>
          </div>
        ))}

        {/* Add team card */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-slate-400 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 dark:border-slate-700 dark:hover:bg-violet-900/10 dark:hover:text-violet-400"
        >
          <Plus className="h-8 w-8" />
          <span className="text-sm font-semibold">Add New Team</span>
        </button>
      </div>

      {/* ── View Details Modal ── */}
      {viewingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${viewingTeam.color} text-sm font-black text-white`}>
                  {viewingTeam.avatar}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">{viewingTeam.name} Details</h2>
                  <p className="text-xs text-slate-500">Leader: {viewingTeam.leader}</p>
                </div>
              </div>
              <button onClick={() => setViewingTeam(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/50">
                  <p className="text-xl font-black text-violet-600">{viewingTeam.members.length}</p>
                  <p className="text-[10px] text-slate-500">Members</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/50">
                  <p className="text-xl font-black text-blue-600">{viewingTeam.activeRescues}</p>
                  <p className="text-[10px] text-slate-500">Active Rescues</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/50">
                  <p className="text-xl font-black text-emerald-600">{viewingTeam.completedToday}</p>
                  <p className="text-[10px] text-slate-500">Completed Today</p>
                </div>
              </div>

              {/* Status & Contact */}
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Duty Status:</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${viewingTeam.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {viewingTeam.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Phone:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingTeam.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Assigned Area:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingTeam.area}</span>
                </div>
              </div>

              {/* Team Members List */}
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Team Members ({viewingTeam.members.length})</p>
                <div className="grid grid-cols-2 gap-2">
                  {viewingTeam.members.map((member, i) => (
                    <div key={member} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30">
                        {member[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{member}</p>
                        <p className="text-[10px] text-slate-400">{i === 0 ? 'Team Leader' : 'Field Rescuer'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggle Status Action */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => toggleTeamStatus(viewingTeam.id)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors ${
                    viewingTeam.status === 'active'
                      ? 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
                  }`}
                >
                  <UserCheck className="h-4 w-4" /> {viewingTeam.status === 'active' ? 'Set to Standby' : 'Set to Active'}
                </button>
                <button
                  onClick={() => {
                    const team = viewingTeam;
                    setViewingTeam(null);
                    openAssignModal(team);
                  }}
                  className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
                >
                  Assign Rescue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Rescue Modal ── */}
      {assigningTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${assigningTeam.color} text-xs font-black text-white`}>
                  {assigningTeam.avatar}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">Assign Rescue to {assigningTeam.name}</h2>
                  <p className="text-xs text-slate-500">Select a pending rescue request below</p>
                </div>
              </div>
              <button onClick={() => setAssigningTeam(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Pending requests list */}
            <div className="px-6 py-4 space-y-2 max-h-80 overflow-y-auto">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Pending / Unassigned Requests</p>
              {PENDING_REQUESTS.map((req) => (
                <button
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`w-full flex items-center gap-4 rounded-xl border-2 p-3.5 text-left transition-all ${
                    selectedRequestId === req.id
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                      : 'border-slate-100 bg-slate-50 hover:border-violet-200 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-violet-700'
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm dark:bg-slate-700">
                    {req.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{req.animal}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PRIORITY_STYLES[req.priority]}`}>{req.priority}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-violet-400" />{req.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{req.timeAgo}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">by {req.reportedBy}</p>
                  </div>
                  {selectedRequestId === req.id && (
                    <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Team capacity info */}
            <div className="mx-6 mb-4 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5 dark:bg-slate-800/50">
              <Shield className="h-4 w-4 text-violet-500 shrink-0" />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {assigningTeam.name} currently has <span className="font-bold text-violet-600">{assigningTeam.activeRescues} active rescue(s)</span>.
                Area coverage: <span className="font-semibold">{assigningTeam.area}</span>
              </p>
            </div>

            {/* Urgent warning */}
            {selectedRequestId && PENDING_REQUESTS.find(r => r.id === selectedRequestId)?.priority === 'High' && (
              <div className="mx-6 mb-4 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 dark:bg-rose-900/20">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">High Priority — Deploy team immediately!</p>
              </div>
            )}

            {/* Success */}
            {successMsg && (
              <div className="mx-6 mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-900/30">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{successMsg}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
              <button
                onClick={() => setAssigningTeam(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRescue}
                disabled={!selectedRequestId || assigning}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {assigning ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Assigning…
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" /> Confirm Rescue Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Team Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Team</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'name', placeholder: 'Team Name (e.g. Team Echo)' },
                { key: 'leader', placeholder: 'Team Leader Full Name' },
                { key: 'phone', placeholder: 'Contact Number' },
                { key: 'area', placeholder: 'Area of Operation (e.g. Aliganj, Hazratganj)' },
              ].map((f) => (
                <input
                  key={f.key}
                  value={newTeam[f.key as keyof typeof newTeam]}
                  onChange={(e) => setNewTeam((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder={f.placeholder}
                />
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400">Cancel</button>
              <button
                onClick={handleAddTeam}
                disabled={!newTeam.name.trim()}
                className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                Add Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoRescueTeam;
