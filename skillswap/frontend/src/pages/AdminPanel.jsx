import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, DollarSign, Video, ShieldCheck, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data));
    api.get('/admin/users').then(r => setUsers(r.data.users || []));
  }, []);

  const handleBan = async (userId, ban) => {
    await api.patch(`/admin/users/${userId}/ban`, { ban });
    setUsers(p => p.map(u => u._id === userId ? {...u, isBanned: ban} : u));
    toast.success(ban ? 'User banned' : 'User unbanned');
  };

  const handleVerify = async (userId) => {
    await api.patch(`/admin/users/${userId}/verify-mentor`);
    setUsers(p => p.map(u => u._id === userId ? {...u, isVerified: true} : u));
    toast.success('Mentor verified!');
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold mb-1">Admin Panel</h1>
        <p className="text-white/40">Platform management & analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: stats.users, icon: Users, color: 'text-primary' },
          { label: 'Sessions Completed', value: stats.sessions, icon: Video, color: 'text-green-400' },
          { label: 'Total Revenue', value: `₹${stats.revenue || 0}`, icon: DollarSign, color: 'text-accent-gold' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-6">
            <s.icon className={`w-8 h-8 ${s.color} mb-3`} />
            <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-white/40 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl font-semibold mb-4">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border text-white/40 text-left">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {users.map(u => (
                <tr key={u._id} className="border-b border-dark-border/50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                        alt={u.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-white/40 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`badge text-xs ${u.isMentor ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/60'}`}>
                      {u.role === 'admin' ? '👑 Admin' : u.isMentor ? 'Mentor' : 'Learner'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`badge text-xs ${u.isBanned ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {u.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 text-white/40">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {u.isMentor && !u.isVerified && (
                        <button onClick={() => handleVerify(u._id)}
                          className="p-1.5 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors" title="Verify mentor">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {u.role !== 'admin' && (
                        <button onClick={() => handleBan(u._id, !u.isBanned)}
                          className={`p-1.5 rounded-lg transition-colors ${u.isBanned ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                          title={u.isBanned ? 'Unban' : 'Ban'}>
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
