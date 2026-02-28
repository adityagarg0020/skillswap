import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { Star, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/3 w-60 h-60 bg-accent-cyan/10 rounded-full blur-3xl"></div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md relative">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-display text-xl font-bold gradient-text">SkillSwap</span>
            </Link>
            <h1 className="font-display text-2xl font-bold mb-2">Welcome back</h1>
            <p className="text-white/40 text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input pr-10" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary-light transition-colors">Sign up free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
