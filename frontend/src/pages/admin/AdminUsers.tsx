import { useEffect, useState } from 'react';
import { adminApi } from '@/features/admin/adminApi';
import type { User } from '@/types';

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.getUsers({ search: search || undefined, role: roleFilter || undefined }).then((data) => {
      setUsers(data.users);
      setLoading(false);
    });
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const search_ = () => load();

  const toggleActive = async (user: User) => {
    setActingId(user._id);
    try {
      const nextActive = !user.isActive;
      await adminApi.setUserActive(user._id, nextActive);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, isActive: nextActive } : u)));
    } finally {
      setActingId(null);
    }
  };

  const verify = async (id: string) => {
    setActingId(id);
    try {
      await adminApi.verifyOrganization(id);
      load();
    } finally {
      setActingId(null);
    }
  };

  const needsVerification = (u: User) =>
    ['ngo', 'rescue_team', 'veterinarian', 'foster_home'].includes(u.role) &&
    !(u.ngoDetails?.verified || u.rescueTeamDetails?.verified || u.veterinarianDetails?.verified || u.fosterHomeDetails?.verified);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Users</h2>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className="input max-w-xs"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search_()}
        />
        <select className="input w-auto" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); }}>
          <option value="">All roles</option>
          <option value="owner">Owner</option>
          <option value="rescue_team">Rescue Team</option>
          <option value="ngo">NGO</option>
          <option value="foster_home">Foster Home</option>
          <option value="veterinarian">Veterinarian</option>
          <option value="finder">Finder</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={search_} className="btn-secondary">Filter</button>
      </div>

      {loading ? (
        <p className="mt-6 font-mono text-sm text-mist-500">loading…</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 dark:border-bone/10">
          <table className="w-full text-sm">
            <thead className="bg-moss-50 text-left dark:bg-moss-700/10">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-ink/5 dark:border-bone/5">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-ink/60 dark:text-bone/60">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    {u.isActive === false ? (
                      <span className="text-coral-600">Inactive</span>
                    ) : (
                      <span className="text-moss-600">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleActive(u)}
                        disabled={actingId === u._id}
                        className="text-xs font-medium text-ink/70 hover:underline dark:text-bone/70"
                      >
                        {u.isActive === false ? 'Activate' : 'Deactivate'}
                      </button>
                      {needsVerification(u) && (
                        <button
                          onClick={() => verify(u._id)}
                          disabled={actingId === u._id}
                          className="text-xs font-medium text-moss-600 hover:underline"
                        >
                          Verify
                        </button>
                      )}
                    </div>
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

export default AdminUsers;
