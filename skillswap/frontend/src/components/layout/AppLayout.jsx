import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, Search, MessageSquare, Video, Wallet, Calendar, 
  Settings, LogOut, Bell, ChevronRight, User, Shield, Menu, X 
} from 'lucide-react'
import useAuthStore from '../../context/authStore'
import { getSocket } from '../../services/socket'

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/search', icon: Search, label: 'Find Mentors' },
  { path: '/chat', icon: MessageSquare, label: 'Messages' },
  { path: '/bookings', icon: Calendar, label: 'Bookings' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/profile', icon: User, label: 'My Profile' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function AppLayout({ children }) {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [unread, setUnread] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    socket.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 20))
      setUnread(prev => prev + 1)
    })

    return () => socket.off('notification')
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0f1e' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 w-64 flex flex-col py-6 px-4 transition-transform duration-300
        md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ background: '#0d1424', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)', color: '#0a0f1e' }}>S</div>
          <span className="font-display text-lg font-bold">SkillSwap</span>
          <button className="ml-auto md:hidden" onClick={() => setMobileOpen(false)}>
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        
        {/* User info */}
        <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl mb-6 hover:bg-white/5 transition-colors">
          <div className="relative">
            {user?.avatar ? (
              <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)', color: '#0a0f1e' }}>
                {user?.name?.[0] || 'U'}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 online-dot" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{user?.name}</div>
            <div className="text-xs text-slate-500 truncate">
              {user?.role === 'mentor' ? '🎓 Mentor' : '📚 Learner'} 
              {user?.isVerified && ' ✅'}
            </div>
          </div>
        </Link>
        
        {/* Wallet balance quick view */}
        <Link to="/wallet" className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-4 text-sm"
          style={{ background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.15)' }}>
          <span className="text-slate-400">Wallet Balance</span>
          <span className="font-semibold" style={{ color: '#00ff87' }}>₹{user?.walletBalance || 0}</span>
        </Link>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path
            return (
              <Link key={path} to={path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  background: active ? 'rgba(0,255,135,0.1)' : 'transparent',
                  color: active ? '#00ff87' : '#94a3b8',
                  border: active ? '1px solid rgba(0,255,135,0.2)' : '1px solid transparent',
                }}>
                <Icon size={17} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
          
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
              <Shield size={17} /> Admin Panel
            </Link>
          )}
        </nav>
        
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-400 transition-colors mt-2">
          <LogOut size={17} /> Sign Out
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <button className="md:hidden text-slate-400" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          
          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ background: '#00ff87', color: '#0a0f1e' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-xl z-50"
                style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <button onClick={() => { setUnread(0); setShowNotifs(false) }} className="text-xs" style={{ color: '#00ff87' }}>
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-slate-500 text-sm py-8">No notifications yet</p>
                  ) : notifications.map((n, i) => (
                    <div key={i} className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{n.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  )
}
