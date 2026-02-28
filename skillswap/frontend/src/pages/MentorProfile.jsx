import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { Star, Shield, Github, Linkedin, Globe, MessageSquare, Video, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MentorProfile() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [booking, setBooking] = useState({ scheduledAt: '', duration: 60, skill: '', message: '' });
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/mentors/${id}`).then(r => {
      setMentor(r.data.mentor);
      setReviews(r.data.reviews || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleChat = async () => {
    if (!user) return navigate('/login');
    const { data } = await api.get(`/chat/conversation/${id}`);
    navigate(`/chat/${data.conversation._id}`);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await api.post('/bookings', { mentorId: id, ...booking });
      toast.success('Booking request sent! 📅');
      setShowBooking(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  const handleVideoCall = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.post('/sessions/start', { mentorId: id });
      navigate(`/call/${data.channelName}?sessionId=${data.session._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot start session');
    }
  };

  if (loading) return <div className="glass-card p-8 animate-pulse h-96"></div>;
  if (!mentor) return <div className="text-center py-20 text-white/40">Mentor not found</div>;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Hero Card */}
      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row gap-8 relative">
          <div className="flex-shrink-0">
            <div className="relative inline-block">
              <img src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`}
                alt={mentor.name} className="w-28 h-28 rounded-3xl object-cover ring-4 ring-primary/20" />
              {mentor.isOnline && <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-dark-card"></span>}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="font-display text-3xl font-bold">{mentor.name}</h1>
              {mentor.isVerified && (
                <span className="badge bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30">
                  <Shield className="w-3 h-3" /> Verified
                </span>
              )}
              {mentor.isMentor && <span className="badge bg-primary/20 text-primary border border-primary/30">Mentor</span>}
            </div>
            <p className="text-white/50 mb-1">{mentor.qualification} • {mentor.yearsOfExperience} years experience</p>
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-accent-gold fill-accent-gold" />
                <span className="font-medium">{mentor.rating?.toFixed(1) || '5.0'}</span>
                <span className="text-white/40">({mentor.totalRatings} reviews)</span>
              </div>
              <span className="text-white/30">•</span>
              <span className="text-white/60">{mentor.completedSessions} sessions</span>
              <span className="text-white/30">•</span>
              <span className="text-accent-gold font-bold">₹{mentor.pricePerMinute}/min</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">{mentor.bio || 'Expert mentor ready to help you grow!'}</p>
            
            {/* Action buttons */}
            {user?._id !== id && (
              <div className="flex gap-3 flex-wrap">
                <button onClick={handleChat}
                  className="btn-ghost flex items-center gap-2 py-2.5">
                  <MessageSquare className="w-4 h-4" /> Free Chat
                </button>
                <button onClick={() => setShowBooking(!showBooking)}
                  className="btn-ghost flex items-center gap-2 py-2.5">
                  <Calendar className="w-4 h-4" /> Book Session
                </button>
                {user && (
                  <button onClick={handleVideoCall}
                    className="btn-primary flex items-center gap-2 py-2.5">
                    <Video className="w-4 h-4" /> Start Call (₹{mentor.pricePerMinute}/min)
                  </button>
                )}
              </div>
            )}

            {/* Social links */}
            <div className="flex gap-3 mt-4">
              {mentor.githubLink && <a href={mentor.githubLink} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>}
              {mentor.linkedinLink && <a href={mentor.linkedinLink} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>}
              {mentor.portfolio && <a href={mentor.portfolio} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        {showBooking && (
          <div className="mt-6 pt-6 border-t border-dark-border">
            <h3 className="font-semibold mb-4">📅 Book a Session</h3>
            <form onSubmit={handleBook} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Date & Time</label>
                <input type="datetime-local" className="input text-sm" required
                  value={booking.scheduledAt} onChange={e => setBooking(p => ({...p, scheduledAt: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Duration (minutes)</label>
                <select className="input text-sm"
                  value={booking.duration} onChange={e => setBooking(p => ({...p, duration: e.target.value}))}>
                  {[30,60,90,120].map(d => <option key={d} value={d}>{d} min (₹{d * mentor.pricePerMinute})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Skill to Learn</label>
                <input className="input text-sm" placeholder="React, Python..." required
                  value={booking.skill} onChange={e => setBooking(p => ({...p, skill: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Message (optional)</label>
                <input className="input text-sm" placeholder="What do you want to learn?"
                  value={booking.message} onChange={e => setBooking(p => ({...p, message: e.target.value}))} />
              </div>
              <div className="col-span-2 flex gap-3">
                <button type="submit" className="btn-primary">Send Request</button>
                <button type="button" onClick={() => setShowBooking(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl font-semibold mb-4">Skills I Teach</h2>
        <div className="flex flex-wrap gap-2">
          {mentor.skillsTeach?.map((s, i) => (
            <span key={i} className={`badge border text-sm py-2 px-4 ${
              s.level === 'expert' ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/30' :
              s.level === 'advanced' ? 'bg-primary/20 text-primary border-primary/30' :
              'bg-white/5 text-white/60 border-dark-border'
            }`}>
              {s.name} <span className="text-xs opacity-60 ml-1">{s.level}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl font-semibold mb-4">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-6">No reviews yet. Be the first to leave one!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r._id} className="p-4 rounded-xl bg-dark-surface border border-dark-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <img src={r.learner?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.learner?.name}`}
                      alt={r.learner?.name} className="w-8 h-8 rounded-full" />
                    <p className="font-medium text-sm">{r.learner?.name}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_,j) => <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? 'text-accent-gold fill-accent-gold' : 'text-white/20'}`} />)}
                  </div>
                </div>
                <p className="text-white/60 text-sm">{r.comment}</p>
                <p className="text-white/30 text-xs mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
