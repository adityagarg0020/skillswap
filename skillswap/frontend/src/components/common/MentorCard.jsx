import { Link } from 'react-router-dom';
import { Star, Clock, Shield, Video } from 'lucide-react';

export default function MentorCard({ mentor }) {
  return (
    <Link to={`/users/${mentor._id}`} className="glass-card p-5 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] block group">
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <img src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`}
            alt={mentor.name} className="w-14 h-14 rounded-2xl object-cover" />
          {mentor.isOnline && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-card"></span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{mentor.name}</h3>
            {mentor.isVerified && <Shield className="w-3.5 h-3.5 text-accent-cyan flex-shrink-0" />}
          </div>
          <p className="text-white/40 text-xs">{mentor.yearsOfExperience}y exp • {mentor.qualification || 'Professional'}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-accent-gold fill-accent-gold" />
            <span className="text-xs font-medium">{mentor.rating?.toFixed(1) || '5.0'}</span>
            <span className="text-white/30 text-xs">({mentor.totalRatings || 0})</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-accent-gold font-bold text-sm">₹{mentor.pricePerMinute}/min</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {mentor.skillsTeach?.slice(0, 3).map((s, i) => (
          <span key={i} className="badge bg-primary/10 text-primary text-xs">{s.name}</span>
        ))}
        {mentor.skillsTeach?.length > 3 && (
          <span className="badge bg-white/5 text-white/40 text-xs">+{mentor.skillsTeach.length - 3}</span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-white/40">
        <span className="flex items-center gap-1"><Video className="w-3 h-3" />{mentor.completedSessions} sessions</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mentor.responseTime || '< 1'} min response</span>
      </div>
    </Link>
  );
}
