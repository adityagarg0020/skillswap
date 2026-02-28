import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowRight, Star, Users, Zap, Shield, Play, ChevronRight, Code, Palette, Brain, BarChart, Globe, Layers } from 'lucide-react'

const FEATURED_SKILLS = ['React.js', 'Python', 'Machine Learning', 'UI/UX Design', 'Node.js', 'Data Science', 'Flutter', 'Kubernetes']
const STATS = [
  { value: '10,000+', label: 'Expert Mentors' },
  { value: '₹5/min', label: 'Starting Price' },
  { value: '4.9★', label: 'Avg Rating' },
  { value: '50K+', label: 'Sessions Done' },
]
const FEATURES = [
  { icon: Zap, title: 'Live Video Sessions', desc: 'HD video calls with screen sharing and real-time collaboration tools built in.', color: '#00ff87' },
  { icon: Brain, title: 'AI-Powered Matching', desc: 'Our algorithm finds the perfect mentor based on your goals and learning style.', color: '#00d4ff' },
  { icon: Shield, title: 'Pay As You Learn', desc: 'Only ₹5 per minute. No subscriptions. Stop anytime. Money stays in your wallet.', color: '#a78bfa' },
  { icon: Code, title: 'Code Together', desc: 'Collaborative code editor built into video calls for live coding sessions.', color: '#fb923c' },
  { icon: Star, title: 'Verified Experts', desc: 'All mentors are reviewed and verified. Ratings from real learners.', color: '#fbbf24' },
  { icon: BarChart, title: 'Track Progress', desc: 'Dashboard shows your skill growth, completed sessions, and learning path.', color: '#f472b6' },
]
const TESTIMONIALS = [
  { name: 'Kavya R.', role: 'Frontend Developer', text: 'Learned React in 2 weeks with live mentoring. The video quality and collaborative coding made it so much better than any course.', rating: 5, skill: 'React.js' },
  { name: 'Amit S.', role: 'Data Analyst', text: 'Priya explained ML concepts in ways no YouTube video could. Worth every rupee. Already got a new job!', rating: 5, skill: 'Machine Learning' },
  { name: 'Rohan M.', role: 'CS Student', text: 'As a mentor, I\'ve earned ₹12,000 in my first month. The platform makes teaching genuinely rewarding.', rating: 5, skill: 'Python' },
]

export default function LandingPage() {
  const [currentSkill, setCurrentSkill] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSkill(prev => (prev + 1) % FEATURED_SKILLS.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(10,15,30,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold"
            style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)' }}>
            <span style={{ color: '#0a0f1e' }}>S</span>
          </div>
          <span className="font-display font-bold text-xl">SkillSwap</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How it works', 'Pricing', 'Mentors'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-sm text-slate-400 hover:text-white transition-colors">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
          <Link to="/signup" className="btn-primary text-sm py-2 px-4">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,255,135,0.1), transparent 70%)' }} />
        
        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{ background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', color: '#00ff87' }}>
            <Zap size={14} />
            Now with AI-powered mentor matching
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Learn{' '}
            <span className="gradient-text" key={currentSkill}
              style={{ animation: 'fadeIn 0.5s ease', display: 'inline-block', minWidth: '280px' }}>
              {FEATURED_SKILLS[currentSkill]}
            </span>
            <br />from real experts
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with verified mentors for live video sessions. Pay only ₹5/min.
            No subscriptions, no BS — just real skills from real people.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/signup" className="btn-primary flex items-center justify-center gap-2 text-base py-4 px-8">
              Start Learning Free <ArrowRight size={18} />
            </Link>
            <Link to="/signup?mentor=true" className="btn-secondary flex items-center justify-center gap-2 text-base py-4 px-8">
              <Play size={18} /> Become a Mentor
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {STATS.map((stat, i) => (
              <div key={i} className="glass p-5 text-center">
                <div className="font-display text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentor Preview Cards */}
      <section className="py-12 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {[
              { name: 'Arjun Sharma', skill: 'React.js', price: 8, rating: 4.9, sessions: 142, avatar: '👨‍💻' },
              { name: 'Priya Patel', skill: 'Machine Learning', price: 10, rating: 4.8, sessions: 89, avatar: '👩‍🔬' },
              { name: 'Rahul Kumar', skill: 'UI/UX Design', price: 6, rating: 4.7, sessions: 54, avatar: '🎨' },
              { name: 'Sneha Iyer', skill: 'Kubernetes', price: 9, rating: 4.6, sessions: 41, avatar: '⚡' },
              { name: 'Vikram Das', skill: 'Flutter', price: 7, rating: 4.9, sessions: 73, avatar: '📱' },
            ].map((mentor, i) => (
              <Link key={i} to="/search"
                className="glass glass-hover p-5 min-w-64 flex-shrink-0 cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {mentor.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{mentor.name}</div>
                    <div className="text-sm text-slate-400">{mentor.skill}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    <Star size={12} fill="currentColor" /> {mentor.rating}
                    <span className="text-slate-500">({mentor.sessions})</span>
                  </div>
                  <div className="text-sm font-medium" style={{ color: '#00ff87' }}>₹{mentor.price}/min</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">Everything you need to <span className="gradient-text">learn faster</span></h2>
            <p className="text-slate-400 text-lg">Tools built for both learners and mentors</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <div key={i} className="glass glass-hover p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">How <span className="gradient-text">SkillSwap</span> works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Find Your Mentor', desc: 'Search by skill, price, or rating. Our AI recommends the best matches for you.' },
              { step: '02', title: 'Add Wallet Balance', desc: 'Add money via Razorpay. Minimum ₹10. Balance stays in your wallet until used.' },
              { step: '03', title: 'Learn Live', desc: 'Video call, share screen, code together. Pay only for time you actually spend.' },
            ].map(({ step, title, desc }, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 font-display font-bold text-lg"
                  style={{ background: 'linear-gradient(135deg, rgba(0,255,135,0.15), rgba(0,212,255,0.15))', border: '1px solid rgba(0,255,135,0.3)', color: '#00ff87' }}>
                  {step}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center mb-16">
            What learners <span className="gradient-text">say</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="glass p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} className="text-yellow-400" fill="currentColor" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)', color: '#0a0f1e' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role} · Learned {t.skill}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass p-12"
          style={{ background: 'linear-gradient(135deg, rgba(0,255,135,0.05), rgba(0,212,255,0.05))' }}>
          <h2 className="font-display text-4xl font-bold mb-4">Ready to <span className="gradient-text">level up?</span></h2>
          <p className="text-slate-400 mb-8">Join 50,000+ learners growing their skills with SkillSwap</p>
          <Link to="/signup" className="btn-primary inline-flex items-center gap-2 text-lg py-4 px-10">
            Start for Free <ArrowRight size={20} />
          </Link>
          <p className="text-xs text-slate-600 mt-4">No credit card needed · ₹25 signup bonus</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)' }}>
              <span style={{ color: '#0a0f1e' }}>S</span>
            </div>
            <span className="font-display font-bold">SkillSwap</span>
          </div>
          <p className="text-sm text-slate-600">© 2024 SkillSwap. Built with ❤️ for learners.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
