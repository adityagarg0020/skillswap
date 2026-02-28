import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import useAuthStore from '../context/authStore'
import toast from 'react-hot-toast'

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result.success) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your learning journey">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Email</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Password</label>
          <div className="relative">
            <input
              className="input pr-12"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        <div className="flex justify-end">
          <a href="#" className="text-sm" style={{ color: '#00ff87' }}>Forgot password?</a>
        </div>
        
        <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
        </button>
        
        <div className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#00ff87' }}>Create one free</Link>
        </div>
        
        {/* Quick test logins */}
        <div className="border-t border-white/5 pt-4">
          <p className="text-xs text-slate-600 mb-2 text-center">Quick test login:</p>
          <div className="flex gap-2">
            {[
              { label: 'Learner', email: 'user@skillswap.test', pass: 'test1234' },
              { label: 'Mentor', email: 'arjun@skillswap.test', pass: 'test1234' },
              { label: 'Admin', email: 'admin@skillswap.test', pass: 'admin1234' },
            ].map(({ label, email, pass }) => (
              <button key={label} type="button"
                onClick={() => setForm({ email, password: pass })}
                className="flex-1 text-xs py-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}

export function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', isMentor: false, referralCode: '' })
  const [showPass, setShowPass] = useState(false)
  const { signup, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    const result = await signup(form)
    if (result.success) {
      toast.success('Welcome to SkillSwap! 🎉')
      navigate('/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join 50,000+ learners on SkillSwap">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
          <input className="input" type="text" placeholder="Your name"
            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Email</label>
          <input className="input" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Password</label>
          <div className="relative">
            <input className="input pr-12" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Referral Code (optional)</label>
          <input className="input" type="text" placeholder="Enter referral code for ₹25 bonus"
            value={form.referralCode} onChange={e => setForm(p => ({ ...p, referralCode: e.target.value }))} />
        </div>
        
        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-3">
          {[{ id: false, label: '📚 I want to Learn', desc: 'Find mentors' }, { id: true, label: '🎓 I want to Teach', desc: 'Earn money' }].map(opt => (
            <button key={String(opt.id)} type="button"
              onClick={() => setForm(p => ({ ...p, isMentor: opt.id }))}
              className="p-3 rounded-xl text-left transition-all text-sm"
              style={{
                background: form.isMentor === opt.id ? 'rgba(0,255,135,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${form.isMentor === opt.id ? 'rgba(0,255,135,0.4)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <div className="font-medium">{opt.label}</div>
              <div className="text-slate-500 text-xs mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
        
        <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
        </button>
        
        <p className="text-xs text-slate-500 text-center">
          By signing up, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>
        </p>
        
        <div className="text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" style={{ color: '#00ff87' }}>Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  )
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-lg"
            style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)', color: '#0a0f1e' }}>S</div>
          <span className="font-display text-xl font-bold">SkillSwap</span>
        </Link>
        
        <div className="glass p-8">
          <h1 className="font-display text-2xl font-bold mb-1">{title}</h1>
          <p className="text-slate-500 text-sm mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
