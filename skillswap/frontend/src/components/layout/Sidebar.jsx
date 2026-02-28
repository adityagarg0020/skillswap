import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Users, MessageSquare, Video, Wallet, Calendar, Settings, LogOut, ShieldCheck, Star } from 'lucide-react';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/mentors', icon: Users, label: 'Mentors' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-dark-card border-r border-dark-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-border">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center">
            <Star className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-display text-xl font-bold gradient-text">SkillSwap</span>
        </NavLink>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-dark-border">
        <NavLink to="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="relative">
            <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-card"></span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/40 truncate">{user?.isMentor ? 'Mentor' : 'Learner'}</p>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive ? 'bg-primary/20 text-primary border border-primary/20' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`
          }>
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive ? 'bg-accent/20 text-accent border border-accent/20' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`
          }>
            <ShieldCheck className="w-4 h-4" />
            Admin
          </NavLink>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-dark-border">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-white/50 hover:text-accent hover:bg-accent/10 transition-all">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
