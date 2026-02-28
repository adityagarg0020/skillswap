import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Calendar, Clock, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = { pending:'bg-yellow-500/20 text-yellow-400', accepted:'bg-green-500/20 text-green-400', rejected:'bg-red-500/20 text-red-400', completed:'bg-primary/20 text-primary', cancelled:'bg-white/10 text-white/40' };

export default function Bookings() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    api.get('/bookings').then(r => setBookings(r.data.bookings || []));
  }, []);

  const handleStatus = async (bookingId, status) => {
    await api.patch(`/bookings/${bookingId}/status`, { status });
    setBookings(p => p.map(b => b._id === bookingId ? {...b, status} : b));
    toast.success(`Booking ${status}`);
  };

  const filtered = bookings.filter(b => {
    if (tab === 'upcoming') return ['pending','accepted'].includes(b.status);
    if (tab === 'history') return ['completed','rejected','cancelled'].includes(b.status);
    return true;
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold mb-1">Bookings</h1>
        <p className="text-white/40">Manage your session requests</p>
      </div>

      <div className="flex gap-2">
        {['upcoming','history','all'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${tab === t ? 'bg-primary text-white' : 'glass text-white/60 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No bookings in this category</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => {
            const other = user?._id === b.mentor?._id ? b.learner : b.mentor;
            const isMentor = user?._id === b.mentor?._id;
            return (
              <div key={b._id} className="glass-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={other?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.name}`}
                      alt={other?.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <p className="font-semibold">{other?.name}</p>
                      <p className="text-white/40 text-sm">{isMentor ? 'Learner' : 'Mentor'} • {b.skill}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-white/40">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(b.scheduledAt).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.duration} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`badge text-xs ${statusColors[b.status]}`}>{b.status}</span>
                    {isMentor && b.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatus(b._id, 'accepted')}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleStatus(b._id, 'rejected')}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {b.message && <p className="mt-4 pt-4 border-t border-dark-border text-sm text-white/50">"{b.message}"</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
