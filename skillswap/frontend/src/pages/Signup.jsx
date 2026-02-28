import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', isMentor: false, referralCode: '' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created! Welcome to SkillSwap 🎉');
      navigate('/profile/edit');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-display text-xl font-bold gradient-text">SkillSwap</span>
            </Link>
            <h1 className="font-display text-2xl font-bold mb-2">Create Account</h1>
            <p className="text-white/40 text-sm">Join 10,000+ learners today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Full Name</label>
              <input className="input" placeholder="Rahul Sharma"
                value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Password</label>
              <input type="password" className="input" placeholder="Min 8 characters"
                value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} minLength={8} required />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Referral Code (optional)</label>
              <input className="input" placeholder="Enter referral code for ₹50 bonus"
                value={form.referralCode} onChange={e => setForm(p => ({...p, referralCode: e.target.value}))} />
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-dark-surface border border-dark-border">
              <input type="checkbox" id="isMentor" checked={form.isMentor}
                onChange={e => setForm(p => ({...p, isMentor: e.target.checked}))}
                className="w-4 h-4 accent-primary" />
              <label htmlFor="isMentor" className="text-sm">
                <span className="font-medium">I want to be a Mentor</span>
                <span className="text-white/40 ml-2">and earn by teaching</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-light transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
