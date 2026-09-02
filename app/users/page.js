'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Users, Trash2, Crown, GraduationCap } from 'lucide-react';

export default function UsersPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/users').then(r=>r.json()).then(d=>{ setUsers(Array.isArray(d)?d:[]); setLoading(false); }); }, []);

  const del = async (id) => {
    if (!confirm('Delete this user?')) return;
    await fetch('/api/users/' + id, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u._id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 font-display flex items-center gap-2"><Users className="text-indigo-600"/> Registered Users</h1>
      {loading ? <p className="text-slate-400">Loading...</p> : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr><th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th><th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th><th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th><th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>{isAdmin && <th className="px-5 py-3.5"></th>}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><img src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50'} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" /><span className="font-medium text-slate-800">{u.name}</span></div></td>
                  <td className="px-5 py-4 text-slate-500">{u.email}</td>
                  <td className="px-5 py-4">{u.role === 'ADMIN' ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><Crown size={10}/> ADMIN</span> : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><GraduationCap size={10}/> USER</span>}</td>
                  <td className="px-5 py-4"><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">{u.status}</span></td>
                  {isAdmin && <td className="px-5 py-4"><button onClick={() => del(u._id)} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={14}/></button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}