import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Edit3, Star, Shield, Github, Linkedin, Globe, Copy, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, wallet } = useAuthStore();

  const copyReferral = () => {
    navigator.clipboard.writeText(user?.referralCode || '');
    toast.success('Referral code copied!');
  };

  const badgeMap = { 'first_session':'🎉 First Session','ten_sessions':'🔥 10 Sessions','50_sessions':'🏆 50 Sessions','top_rated':'⭐ Top Rated' };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative flex items-start gap-8">
          <div className="relative">
            <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name} className="w-24 h-24 rounded-3xl ring-4 ring-primary/20" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-card"></span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-3xl font-bold">{user?.name}</h1>
              {user?.isVerified && <Shield className="w-5 h-5 text-accent-cyan" />}
            </div>
            <p className="text-white/50 mb-1">{user?.qualification} • {user?.yearsOfExperience || 0} years exp</p>
            <div className="flex items-center gap-1 mb-4">
              <Star className="w-4 h-4 text-accent-gold fill-accent-gold" />
              <span className="font-medium">{user?.rating?.toFixed(1) || '5.0'}</span>
              <span className="text-white/40 text-sm">({user?.totalRatings || 0} reviews)</span>
            </div>
            <p className="text-white/60 mb-6">{user?.bio || 'No bio yet. Add one to attract more connections!'}</p>
            <div className="flex gap-3">
              <Link to="/profile/edit" className="btn-primary flex items-center gap-2 py-2.5">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </Link>
              <div className="flex gap-2">
                {user?.githubLink && <a href={user.githubLink} target="_blank" className="p-2.5 btn-ghost"><Github className="w-4 h-4" /></a>}
                {user?.linkedinLink && <a href={user.linkedinLink} target="_blank" className="p-2.5 btn-ghost"><Linkedin className="w-4 h-4" /></a>}
                {user?.portfolio && <a href={user.portfolio} target="_blank" className="p-2.5 btn-ghost"><Globe className="w-4 h-4" /></a>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Sessions', value: user?.totalSessions || 0 },
          { label: 'Completed', value: user?.completedSessions || 0 },
          { label: 'Level', value: user?.level || 1 },
          { label: 'Points', value: user?.points || 0 },
        ].map((s, i) => (
          <div key={i} className="glass-card p-5 text-center">
            <p className="font-display text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-white/40 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {user?.badges?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4">Badges 🏅</h2>
          <div className="flex flex-wrap gap-3">
            {user.badges.map(b => (
              <span key={b} className="badge bg-primary/20 text-primary border border-primary/30 py-2 px-4 text-sm">{badgeMap[b] || b}</span>
            ))}
          </div>
        </div>
      )}

      {/* Referral */}
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-2">Referral Program 🎁</h2>
        <p className="text-white/40 text-sm mb-4">Invite friends and earn ₹50 bonus when they sign up!</p>
        <div className="flex gap-3">
          <div className="flex-1 bg-dark-surface border border-dark-border rounded-xl px-4 py-3 font-mono text-lg tracking-widest text-primary">
            {user?.referralCode}
          </div>
          <button onClick={copyReferral} className="btn-ghost flex items-center gap-2">
            <Copy className="w-4 h-4" /> Copy
          </button>
        </div>
      </div>
    </div>
  );
}
