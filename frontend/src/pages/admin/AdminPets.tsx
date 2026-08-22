import { useEffect, useState } from 'react';
import { adminApi } from '@/features/admin/adminApi';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Pet } from '@/types';

const AdminPets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.getPets({ status: statusFilter || undefined }).then((data) => {
      setPets(data.pets);
      setLoading(false);
    });
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (id: string) => {
    if (!confirm('Remove this pet record? This cannot be undone.')) return;
    await adminApi.deletePet(id);
    setPets((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Pets</h2>

      <div className="mt-4 flex gap-2">
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="safe">Safe</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
          <option value="in_rescue">In Rescue</option>
          <option value="in_foster">In Foster</option>
          <option value="adopted">Adopted</option>
        </select>
        <button onClick={load} className="btn-secondary">Filter</button>
      </div>

      {loading ? (
        <p className="mt-6 font-mono text-sm text-mist-500">loading…</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 dark:border-bone/10">
          <table className="w-full text-sm">
            <thead className="bg-moss-50 text-left dark:bg-moss-700/10">
              <tr>
                <th className="px-4 py-3 font-medium">Pet</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Species</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet._id} className="border-t border-ink/5 dark:border-bone/5">
                  <td className="px-4 py-3">{pet.name} <span className="font-mono text-xs text-mist-500">{pet.petId}</span></td>
                  <td className="px-4 py-3 text-ink/60 dark:text-bone/60">
                    {typeof pet.owner === 'object' ? pet.owner.name : pet.owner}
                  </td>
                  <td className="px-4 py-3 capitalize">{pet.species}</td>
                  <td className="px-4 py-3"><StatusBadge status={pet.status} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(pet._id)} className="text-xs font-medium text-coral-600 hover:underline">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPets;
