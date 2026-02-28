import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStore } from '../../store/authStore';
import { connectSocket, disconnectSocket, getSocket } from '../../services/socket';
import toast from 'react-hot-toast';

export default function Layout() {
  const { user, refreshMe } = useAuthStore();

  useEffect(() => {
    if (user) {
      const socket = connectSocket(user._id);
      
      socket.on('notification', (notif) => {
        toast.custom((t) => (
          <div className={`glass-card p-4 flex items-start gap-3 max-w-sm ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
            <span className="text-2xl">{notif.type === 'session' ? '📹' : notif.type === 'payment' ? '💰' : '🔔'}</span>
            <div>
              <p className="font-medium text-white text-sm">{notif.title}</p>
              <p className="text-white/60 text-xs mt-0.5">{notif.message}</p>
            </div>
          </div>
        ));
      });

      socket.on('incoming_call', ({ from, channelName }) => {
        toast.custom((t) => (
          <div className="glass-card p-4 max-w-sm">
            <p className="font-medium text-white mb-3">📹 Incoming Video Call</p>
            <div className="flex gap-2">
              <button onClick={() => { window.location.href = `/call/${channelName}`; toast.dismiss(t.id); }}
                className="btn-primary text-sm py-2">Accept</button>
              <button onClick={() => toast.dismiss(t.id)} className="btn-ghost text-sm py-2">Decline</button>
            </div>
          </div>
        ), { duration: 30000 });
      });

      return () => disconnectSocket();
    }
  }, [user?._id]);

  return (
    <div className="flex h-screen overflow-hidden bg-dark-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
