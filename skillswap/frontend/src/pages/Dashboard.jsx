import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { Video, MessageSquare, Calendar, TrendingUp, Star, Clock, Award } from 'lucide-react';
import api from '../services/api';
import MentorCard from '../components/common/MentorCard';

export default function Dashboard() {
  const { user, wallet, refreshMe } = useAuthStore();
  const [recommended, setRecommended] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        await refreshMe();
        const [rec, sess, book] = await Promise.all([
          api.get('/mentors/recommendations'),
          api.get('/sessions'),
          api.get('/bookings'),
        ]);
        setRecommended(rec.data.mentors || []);
        setSessions(sess.data.sessions || []);
        setBookings(book.data.bookings?.filter(b => b.status === 'accepted' || b.status === 'pending').slice(0,5) || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const stats = [
    { label: 'Total Sessions', value: user?.totalSessions || 0, icon: Video, color: 'text-primary' },
    { label: 'Completed', value: user?.completedSessions || 0, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Rating', value: user?.rating ? user.rating.toFixed(1) : 'N/A', icon: Star, color: 'text-accent-gold' },
    { label: 'Points', value: user?.points || 0, icon: Award, color: 'text-accent-cyan' },
  ];

  const badgeMap = {
    'first_session': { label: 'First Session', emoji: '🎉' },
    'ten_sessions': { label: '10 Sessions', emoji: '🔥' },
    '50_sessions': { label: '50 Sessions', emoji: '🏆' },
    'top_rated': { label: 'Top Rated', emoji: '⭐' },
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="glass-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-white/50">Ready to learn something amazing today?</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/40">Wallet Balance</p>
            <p className="font-display text-3xl font-bold text-accent-gold">₹{wallet?.balance?.toFixed(0) || 0}</p>
            <Link to="/wallet" className="text-primary text-sm hover:underline">Add Money →</Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
            className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-white/40 text-sm">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { to: '/mentors', icon: '🔍', label: 'Find Mentors', color: 'from-primary/20 to-primary/5' },
          { to: '/chat', icon: '💬', label: 'Messages', color: 'from-accent-cyan/20 to-accent-cyan/5' },
          { to: '/bookings', icon: '📅', label: 'Bookings', color: 'from-green-500/20 to-green-500/5' },
          { to: '/wallet', icon: '💰', label: 'Add Money', color: 'from-accent-gold/20 to-accent-gold/5' },
        ].map((a, i) => (
          <Link key={i} to={a.to}
            className={`glass-card p-5 flex flex-col items-center gap-3 hover:scale-105 transition-transform bg-gradient-to-br ${a.color}`}>
            <span className="text-3xl">{a.icon}</span>
            <span className="text-sm font-medium">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Badges */}
      {user?.badges?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Your Badges 🏅</h2>
          <div className="flex flex-wrap gap-3">
            {user.badges.map(b => (
              <div key={b} className="badge bg-primary/20 text-primary border border-primary/30 text-sm py-2 px-4">
                {badgeMap[b]?.emoji} {badgeMap[b]?.label || b}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Bookings */}
      {bookings.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Upcoming Sessions</h2>
            <Link to="/bookings" className="text-primary text-sm hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b._id} className="flex items-center gap-4 p-4 rounded-xl bg-dark-surface border border-dark-border">
                <img src={b.mentor?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${b.mentor?.name}`}
                  alt={b.mentor?.name} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{b.mentor?.name}</p>
                  <p className="text-white/40 text-xs">{b.skill}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/60">{new Date(b.scheduledAt).toLocaleDateString()}</p>
                  <span className={`badge text-xs ${b.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Mentors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Recommended Mentors ✨</h2>
          <Link to="/mentors" className="text-primary text-sm hover:underline">See all</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="glass-card h-48 animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map(m => <MentorCard key={m._id} mentor={m} />)}
          </div>
        )}
      </div>
    </div>
  );
}
