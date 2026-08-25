import { useState } from 'react';
import { Package, Stethoscope, Truck, Shield, Plus, AlertTriangle, X, Minus } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  category: string;
  quantity: number;
  available: number;
  unit: string;
  status: string;
}

const INITIAL_RESOURCES: Resource[] = [
  { id: '1', name: 'Animal Stretchers', category: 'Equipment', quantity: 8, available: 5, unit: 'units', status: 'good' },
  { id: '2', name: 'First Aid Kits', category: 'Medical', quantity: 20, available: 14, unit: 'kits', status: 'good' },
  { id: '3', name: 'Rescue Vehicles', category: 'Transport', quantity: 3, available: 2, unit: 'vehicles', status: 'good' },
  { id: '4', name: 'Animal Cages (Small)', category: 'Equipment', quantity: 15, available: 3, unit: 'units', status: 'low' },
  { id: '5', name: 'IV Drip Sets', category: 'Medical', quantity: 50, available: 8, unit: 'sets', status: 'critical' },
  { id: '6', name: 'Animal Food Bags', category: 'Supplies', quantity: 100, available: 42, unit: 'kg bags', status: 'good' },
  { id: '7', name: 'Tranquilizer Darts', category: 'Medical', quantity: 30, available: 5, unit: 'units', status: 'low' },
  { id: '8', name: 'Capture Nets', category: 'Equipment', quantity: 10, available: 7, unit: 'units', status: 'good' },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Equipment: <Shield className="h-5 w-5" />,
  Medical: <Stethoscope className="h-5 w-5" />,
  Transport: <Truck className="h-5 w-5" />,
  Supplies: <Package className="h-5 w-5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Equipment: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30',
  Medical: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30',
  Transport: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
  Supplies: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
};

const STATUS_DOT: Record<string, string> = { good: 'bg-emerald-500', low: 'bg-amber-500', critical: 'bg-rose-500' };

const getStatus = (available: number, quantity: number): string => {
  const pct = (available / quantity) * 100;
  if (pct <= 15) return 'critical';
  if (pct <= 30) return 'low';
  return 'good';
};

const NgoResources = () => {
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [filterCategory, setFilterCategory] = useState('All');
  const categories = ['All', 'Equipment', 'Medical', 'Transport', 'Supplies'];

  // Update Stock Modal state
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [newAvailable, setNewAvailable] = useState(0);
  const [newTotal, setNewTotal] = useState(0);
  const [updateNote, setUpdateNote] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Add Resource Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResource, setNewResource] = useState({ name: '', category: 'Equipment', quantity: '', available: '', unit: '' });

  const filtered = filterCategory === 'All' ? resources : resources.filter((r) => r.category === filterCategory);
  const criticalCount = resources.filter((r) => r.status === 'critical').length;
  const lowCount = resources.filter((r) => r.status === 'low').length;

  const openUpdateModal = (r: Resource) => {
    setEditingResource(r);
    setNewAvailable(r.available);
    setNewTotal(r.quantity);
    setUpdateNote('');
    setUpdateSuccess(false);
  };

  const handleUpdateStock = () => {
    if (!editingResource) return;
    const updated: Resource = {
      ...editingResource,
      available: newAvailable,
      quantity: newTotal,
      status: getStatus(newAvailable, newTotal),
    };
    setResources((prev) => prev.map((r) => (r.id === editingResource.id ? updated : r)));
    setUpdateSuccess(true);
    setTimeout(() => setEditingResource(null), 1200);
  };

  const handleAddResource = () => {
    if (!newResource.name.trim() || !newResource.quantity || !newResource.unit) return;
    const qty = parseInt(newResource.quantity);
    const avl = parseInt(newResource.available || newResource.quantity);
    const r: Resource = {
      id: String(Date.now()),
      name: newResource.name,
      category: newResource.category,
      quantity: qty,
      available: avl,
      unit: newResource.unit,
      status: getStatus(avl, qty),
    };
    setResources((prev) => [...prev, r]);
    setNewResource({ name: '', category: 'Equipment', quantity: '', available: '', unit: '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Resources & Equipment</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track inventory of all rescue resources and equipment.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Resource
        </button>
      </div>

      {/* Alert banner */}
      {(criticalCount > 0 || lowCount > 0) && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Resource Alert</p>
            <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
              {criticalCount > 0 && <span className="text-rose-600 font-semibold">{criticalCount} critical </span>}
              {criticalCount > 0 && lowCount > 0 && 'and '}
              {lowCount > 0 && <span className="font-semibold">{lowCount} low stock </span>}
              items need restocking immediately.
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Items', value: resources.length, color: 'text-violet-600' },
          { label: 'Critical Stock', value: resources.filter((r) => r.status === 'critical').length, color: 'text-rose-600' },
          { label: 'Low Stock', value: resources.filter((r) => r.status === 'low').length, color: 'text-amber-600' },
          { label: 'Well Stocked', value: resources.filter((r) => r.status === 'good').length, color: 'text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${filterCategory === c ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((r) => {
          const pct = Math.round((r.available / r.quantity) * 100);
          const barColor = r.status === 'good' ? 'bg-emerald-500' : r.status === 'low' ? 'bg-amber-500' : 'bg-rose-500';
          return (
            <div key={r.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${CATEGORY_COLORS[r.category] || 'bg-slate-100 text-slate-500'}`}>
                  {CATEGORY_ICONS[r.category] || <Package className="h-5 w-5" />}
                </div>
                <span className={`flex h-2.5 w-2.5 rounded-full ${STATUS_DOT[r.status]}`} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{r.name}</h3>
              <p className="text-[11px] text-slate-500 mb-3">{r.category}</p>
              <div className="mb-2">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Available</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{r.available}/{r.quantity} {r.unit}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-2 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{pct}% available</p>
              </div>
              <button
                onClick={() => openUpdateModal(r)}
                className={`w-full rounded-lg py-1.5 text-[11px] font-bold transition-colors mt-1 ${
                  r.status === 'critical' || r.status === 'low'
                    ? 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                {r.status === 'critical' || r.status === 'low' ? '⚠️ Restock Now' : 'Update Stock'}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Update Stock Modal ── */}
      {editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">Update Stock</h2>
                <p className="text-xs text-slate-500 mt-0.5">{editingResource.name} · {editingResource.category}</p>
              </div>
              <button onClick={() => setEditingResource(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Available qty with +/- */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Available Quantity ({editingResource.unit})
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNewAvailable((v) => Math.max(0, v - 1))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={newAvailable}
                    onChange={(e) => setNewAvailable(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-lg font-bold focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    onClick={() => setNewAvailable((v) => Math.min(newTotal, v + 1))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Total qty */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Total Quantity ({editingResource.unit})
                </label>
                <input
                  type="number"
                  value={newTotal}
                  onChange={(e) => setNewTotal(Math.max(newAvailable, parseInt(e.target.value) || 0))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Update note */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Update Note (optional)</label>
                <input
                  type="text"
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  placeholder="e.g. Restocked from supplier, used 5 during rescue"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Preview new status */}
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <p className="text-[11px] font-semibold text-slate-500 mb-1">Preview after update</p>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      newTotal === 0 ? 'bg-slate-300' : (newAvailable / newTotal) * 100 > 30 ? 'bg-emerald-500' : (newAvailable / newTotal) * 100 > 15 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: newTotal > 0 ? `${(newAvailable / newTotal) * 100}%` : '0%' }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{newAvailable} / {newTotal} {editingResource.unit} available</p>
              </div>

              {/* Success */}
              {updateSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-900/30">
                  <span className="text-emerald-600 text-lg">✅</span>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Stock updated successfully!</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
              <button onClick={() => setEditingResource(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700">Cancel</button>
              <button
                onClick={handleUpdateStock}
                disabled={updateSuccess}
                className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Resource Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Resource</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <input value={newResource.name} onChange={(e) => setNewResource((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Resource Name" />
              <select value={newResource.category} onChange={(e) => setNewResource((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                {['Equipment', 'Medical', 'Transport', 'Supplies'].map((c) => <option key={c}>{c}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={newResource.quantity} onChange={(e) => setNewResource((p) => ({ ...p, quantity: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Total Qty" />
                <input type="number" value={newResource.available} onChange={(e) => setNewResource((p) => ({ ...p, available: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Available Qty" />
              </div>
              <input value={newResource.unit} onChange={(e) => setNewResource((p) => ({ ...p, unit: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Unit (e.g. units, kits, kg bags)" />
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700">Cancel</button>
              <button onClick={handleAddResource} disabled={!newResource.name.trim()} className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50">Add Resource</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoResources;
