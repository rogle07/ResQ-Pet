import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  CheckSquare, Plus, Clock, AlertTriangle, CheckCircle2,
  User, Calendar, Filter, Sun, Moon, Trash2, Edit3
} from 'lucide-react';

type Priority = 'High' | 'Medium' | 'Low';
type Status = 'Pending' | 'In Progress' | 'Completed';

interface Task {
  id: number;
  title: string;
  assignedTo: string;
  avatar: string;
  priority: Priority;
  status: Status;
  due: string;
  location: string;
  animal: string;
}

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Rescue injured dog near Haldwani bypass', assignedTo: 'Arjun Sharma', avatar: '👮', priority: 'High', status: 'In Progress', due: 'Today, 2:00 PM', location: 'Haldwani', animal: '🐕 Dog' },
  { id: 2, title: 'Transport rescued cow to Rudrapur shelter', assignedTo: 'Dev Kumar', avatar: '🚐', priority: 'High', status: 'Pending', due: 'Today, 4:00 PM', location: 'Rudrapur', animal: '🐄 Cow' },
  { id: 3, title: 'Medical checkup for 3 rescued cats', assignedTo: 'Kavita Rawat', avatar: '👩‍🔬', priority: 'Medium', status: 'In Progress', due: 'Today, 5:00 PM', location: 'Nainital', animal: '🐈 Cat' },
  { id: 4, title: 'Patrol Ramnagar wildlife corridor', assignedTo: 'Rohan Singh', avatar: '🧑‍🚒', priority: 'Medium', status: 'Pending', due: 'Tomorrow, 8:00 AM', location: 'Ramnagar', animal: '🐆 Wild' },
  { id: 5, title: 'Set up feeding station at Bhimtal', assignedTo: 'Priya Mehta', avatar: '👩‍⚕️', priority: 'Low', status: 'Completed', due: 'Yesterday', location: 'Bhimtal', animal: '🐾 Mixed' },
  { id: 6, title: 'Follow up on reported monkey sighting', assignedTo: 'Arjun Sharma', avatar: '👮', priority: 'Medium', status: 'Completed', due: 'Yesterday', location: 'Nainital', animal: '🐒 Monkey' },
  { id: 7, title: 'Collect stray animals report from Kashipur', assignedTo: 'Rohan Singh', avatar: '🧑‍🚒', priority: 'Low', status: 'Pending', due: 'Tomorrow, 10:00 AM', location: 'Kashipur', animal: '🐾 Mixed' },
];

const PRIORITY_STYLES: Record<Priority, string> = {
  High: 'bg-red-500/15 text-red-400 border border-red-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  Low: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
};

const STATUS_STYLES: Record<Status, string> = {
  Pending: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  'In Progress': 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  Completed: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
};

const TasksAssignments = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filterStatus, setFilterStatus] = useState<'All' | Status>('All');
  const [filterPriority, setFilterPriority] = useState<'All' | Priority>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState('');

  const bg = isDark ? 'bg-[#040d17]' : 'bg-slate-100';
  const cardBg = isDark ? 'bg-[#071726]' : 'bg-white';
  const cardBorder = isDark ? 'border-[#12314a]' : 'border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';

  const filtered = tasks.filter(t => {
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchStatus && matchPriority;
  });

  const counts = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
  };

  const cycleStatus = (id: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next: Record<Status, Status> = { 'Pending': 'In Progress', 'In Progress': 'Completed', 'Completed': 'Pending' };
      return { ...t, status: next[t.status] };
    }));
  };

  const deleteTask = (id: number) => setTasks(prev => prev.filter(t => t.id !== id));

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, {
      id: Date.now(), title: newTask, assignedTo: 'Unassigned', avatar: '🦺',
      priority: 'Medium', status: 'Pending', due: 'TBD', location: 'TBD', animal: '🐾 Unknown'
    }]);
    setNewTask('');
    setShowAddModal(false);
  };

  return (
    <div className={`-m-3.5 sm:-m-5 md:-m-6 min-h-screen ${bg} ${textPrimary} p-4 sm:p-6 space-y-5 transition-colors duration-300`}>
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${isDark ? 'border-[#0d2235]' : 'border-slate-200'} pb-4`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
            <CheckSquare className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${textPrimary}`}>Tasks & Assignments</h1>
            <p className={`text-xs ${textSecondary}`}>Manage and track all rescue team tasks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Task
          </button>
          <button onClick={toggleTheme} className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${isDark ? 'border-[#14344f] bg-[#071624] text-amber-400' : 'border-slate-200 bg-white text-slate-600'}`}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Tasks', value: counts.total, icon: <CheckSquare className="h-5 w-5" />, color: 'text-blue-400', iconBg: isDark ? 'bg-blue-600/20' : 'bg-blue-100' },
          { label: 'Pending', value: counts.pending, icon: <Clock className="h-5 w-5" />, color: 'text-amber-400', iconBg: isDark ? 'bg-amber-600/20' : 'bg-amber-100' },
          { label: 'In Progress', value: counts.inProgress, icon: <AlertTriangle className="h-5 w-5" />, color: 'text-orange-400', iconBg: isDark ? 'bg-orange-600/20' : 'bg-orange-100' },
          { label: 'Completed', value: counts.completed, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-emerald-400', iconBg: isDark ? 'bg-emerald-600/20' : 'bg-emerald-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border ${cardBorder} ${cardBg} p-4 flex items-center gap-3`}>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${s.iconBg} ${s.color}`}>{s.icon}</div>
            <div>
              <div className={`text-xs ${textSecondary}`}>{s.label}</div>
              <div className={`text-2xl font-black ${textPrimary}`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-4 flex flex-wrap items-center gap-3`}>
        <div className="flex items-center gap-1.5">
          <Filter className={`h-3.5 w-3.5 ${textSecondary}`} />
          <span className={`text-xs font-semibold ${textSecondary}`}>Filter:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['All', 'Pending', 'In Progress', 'Completed'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s as typeof filterStatus)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${filterStatus === s ? 'bg-emerald-600 text-white' : isDark ? 'bg-[#0b2133] text-slate-300 hover:bg-[#102d45]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 ml-4">
          {(['All', 'High', 'Medium', 'Low'] as const).map(p => (
            <button key={p} onClick={() => setFilterPriority(p as typeof filterPriority)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${filterPriority === p ? 'bg-blue-600 text-white' : isDark ? 'bg-[#0b2133] text-slate-300 hover:bg-[#102d45]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-10 text-center`}>
            <div className="text-4xl mb-2">📋</div>
            <p className={`text-sm ${textSecondary}`}>No tasks match your filters</p>
          </div>
        ) : filtered.map(task => (
          <div key={task.id} className={`rounded-2xl border ${cardBorder} ${cardBg} p-4 flex flex-wrap items-center gap-4 group transition-all hover:border-emerald-500/40`}>
            {/* Checkbox */}
            <button onClick={() => cycleStatus(task.id)} className={`shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.status === 'Completed' ? 'bg-emerald-600 border-emerald-600' : isDark ? 'border-slate-600 hover:border-emerald-500' : 'border-slate-300 hover:border-emerald-500'
            }`}>
              {task.status === 'Completed' && <CheckCircle2 className="h-3 w-3 text-white" />}
            </button>

            {/* Title & Meta */}
            <div className="flex-1 min-w-0">
              <div className={`flex items-center gap-2 flex-wrap`}>
                <p className={`text-sm font-semibold ${task.status === 'Completed' ? 'line-through ' + textSecondary : textPrimary}`}>{task.title}</p>
                <span className="text-xs">{task.animal}</span>
              </div>
              <div className={`flex flex-wrap items-center gap-3 mt-1 text-[10px] ${textSecondary}`}>
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {task.assignedTo}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {task.due}</span>
                <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {task.location}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 shrink-0">
              <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${PRIORITY_STYLES[task.priority]}`}>{task.priority}</span>
              <button onClick={() => cycleStatus(task.id)} className={`rounded-lg px-2 py-0.5 text-[10px] font-bold cursor-pointer hover:opacity-80 ${STATUS_STYLES[task.status]}`}>
                {task.status}
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button className={`h-7 w-7 flex items-center justify-center rounded-lg border transition-colors ${isDark ? 'border-[#14344f] text-slate-400 hover:text-white' : 'border-slate-200 text-slate-400 hover:text-slate-700'}`}>
                <Edit3 className="h-3 w-3" />
              </button>
              <button onClick={() => deleteTask(task.id)} className="h-7 w-7 flex items-center justify-center rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className={`relative w-full max-w-md rounded-2xl border ${cardBorder} ${cardBg} p-6 shadow-2xl`}>
            <h3 className={`text-base font-bold ${textPrimary} mb-4`}>Add New Task</h3>
            <input
              autoFocus
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="Enter task description..."
              className={`w-full rounded-xl border py-2.5 px-4 text-sm focus:border-emerald-500 focus:outline-none mb-4 ${isDark ? 'bg-[#05111d] border-[#14344f] text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)} className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition-colors ${isDark ? 'border-[#14344f] text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>Cancel</button>
              <button onClick={addTask} className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksAssignments;
