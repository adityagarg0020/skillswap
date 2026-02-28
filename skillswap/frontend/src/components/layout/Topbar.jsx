import { Bell, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function Topbar() {
  const { wallet } = useAuthStore();
  const [search, setSearch] = useState('');
  const [notifCount, setNotifCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/notifications').then(r => {
      setNotifCount(r.data.notifications?.filter(n => !n.isRead).length || 0);
    }).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/mentors?skill=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="h-16 border-b border-dark-border bg-dark-card flex items-center justify-between px-6">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Search className="w-4 h-4 text-white/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search mentors, skills..."
          className="bg-transparent text-sm text-white/80 placeholder:text-white/30 focus:outline-none flex-1"
        />
      </div>
      
      <div className="flex items-center gap-4">
        {wallet && (
          <button onClick={() => navigate('/wallet')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm">
            <span className="text-accent-gold">₹</span>
            <span className="font-medium">{wallet.balance?.toFixed(0)}</span>
          </button>
        )}
        
        <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5 text-white/60" />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full text-xs flex items-center justify-center font-bold">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
