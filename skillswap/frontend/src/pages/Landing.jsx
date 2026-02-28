import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Video, MessageSquare, Shield, Zap, Award, Users } from 'lucide-react';

const features = [
  { icon: Video, title: 'Paid Video Sessions', desc: 'Learn 1-on-1 with expert mentors at ₹5/min. Real-time, interactive, effective.' },
  { icon: MessageSquare, title: 'Free Chat', desc: 'Message any mentor for free. Ask questions, build rapport before booking.' },
  { icon: Shield, title: 'Verified Mentors', desc: 'Every mentor is screened and verified for quality assurance.' },
  { icon: Zap, title: 'AI Matching', desc: 'Smart algorithm finds perfect mentors based on your learning goals.' },
  { icon: Award, title: 'Gamification', desc: 'Earn badges, climb leaderboards, track your skill progression.' },
  { icon: Users, title: 'Community', desc: 'Join thousands of learners and mentors growing together.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Web Developer', text: 'Found an amazing React mentor within minutes. The video sessions are crystal clear and ₹5/min is incredibly affordable!', rating: 5, avatar: 'priya' },
  { name: 'Rahul Verma', role: 'Data Scientist', text: 'As a mentor, I earned ₹12,000 in my first month teaching Python. The platform makes it so easy.', rating: 5, avatar: 'rahul' },
  { name: 'Anjali Patel', role: 'UX Designer', text: 'The AI recommendation system found me the perfect UI/UX mentor. Impressed by how well it understood my needs.', rating: 5, avatar: 'anjali' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-bg text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-dark-bg/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-display text-xl font-bold gradient-text">SkillSwap</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/mentors" className="text-sm text-white/60 hover:text-white transition-colors">Browse Mentors</Link>
            <Link to="/login" className="btn-ghost text-sm py-2 px-5">Login</Link>
            <Link to="/signup" className="btn-primary text-sm py-2 px-5">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-cyan/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay:'1s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{background:'radial-gradient(circle, rgba(108,99,255,0.05) 0%, transparent 70%)'}}></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
            <span className="badge bg-primary/20 text-primary border border-primary/30 mb-6 text-sm">
              🚀 India's #1 Skill Learning Platform
            </span>
          </motion.div>
          
          <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.1}}
            className="font-display text-6xl md:text-7xl font-bold leading-tight mb-6">
            Learn Any Skill From<br />
            <span className="gradient-text">Expert Mentors</span>
          </motion.h1>
          
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.2}}
            className="text-xl text-white/50 max-w-2xl mx-auto mb-10">
            Connect with verified mentors for 1-on-1 video sessions at just <span className="text-accent-gold font-bold">₹5/minute</span>. 
            Chat for free, book sessions, track progress.
          </motion.p>
          
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.3}}
            className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/signup" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              Start Learning Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/mentors" className="btn-ghost text-base px-8 py-4">Browse Mentors</Link>
          </motion.div>

          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.8,delay:0.5}}
            className="mt-16 flex items-center justify-center gap-8 text-sm text-white/40">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-white">10,000+</p>
              <p>Learners</p>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-white">500+</p>
              <p>Expert Mentors</p>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-white">50,000+</p>
              <p>Sessions Completed</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">Everything You Need to <span className="gradient-text">Grow</span></h2>
            <p className="text-white/40 text-lg">A complete ecosystem for peer-to-peer skill learning</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{delay:i*0.1}}
                className="glass-card p-6 hover:border-primary/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-dark-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">Loved by <span className="gradient-text">Thousands</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{opacity:0,scale:0.95}} whileInView={{opacity:1,scale:1}} transition={{delay:i*0.1}}
                className="glass-card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_,j) => <Star key={j} className="w-4 h-4 text-accent-gold fill-accent-gold" />)}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.avatar}`} alt={t.name}
                    className="w-10 h-10 rounded-full bg-primary/20" />
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent-cyan/5 pointer-events-none"></div>
            <h2 className="font-display text-4xl font-bold mb-4 relative">Ready to Start Learning?</h2>
            <p className="text-white/50 mb-8 relative">Join 10,000+ learners and start your journey today. First session guidance is free!</p>
            <Link to="/signup" className="btn-primary text-base px-10 py-4 relative inline-flex items-center gap-2">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8 px-6 text-center text-white/30 text-sm">
        <p>© 2024 SkillSwap. Built with ❤️ for Indian learners.</p>
      </footer>
    </div>
  );
}
