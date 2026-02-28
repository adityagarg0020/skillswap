import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Shield, Bell, Moon, Key } from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [pref, setPref] = useState({ darkMode: user?.darkMode ?? true, emailNotifications: user?.emailNotifications ?? true });

  const savePrefs = async () => {
    await api.put('/users/profile', pref);
    updateUser(pref);
    toast.success('Preferences saved');
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) return toast.error('Passwords do not match');
    toast.error('Password change: connect to a dedicated endpoint in your backend');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold mb-1">Settings</h1>
        <p className="text-white/40">Manage your account preferences</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Preferences</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark Mode</p>
            <p className="text-xs text-white/40">Toggle dark/light theme</p>
          </div>
          <button onClick={() => setPref(p => ({...p, darkMode: !p.darkMode}))}
            className={`w-12 h-6 rounded-full transition-colors relative ${pref.darkMode ? 'bg-primary' : 'bg-dark-border'}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${pref.darkMode ? 'right-1' : 'left-1'}`}></span>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Email Notifications</p>
            <p className="text-xs text-white/40">Receive booking & session updates</p>
          </div>
          <button onClick={() => setPref(p => ({...p, emailNotifications: !p.emailNotifications}))}
            className={`w-12 h-6 rounded-full transition-colors relative ${pref.emailNotifications ? 'bg-primary' : 'bg-dark-border'}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${pref.emailNotifications ? 'right-1' : 'left-1'}`}></span>
          </button>
        </div>
        <button onClick={savePrefs} className="btn-primary">Save Preferences</button>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Change Password</h2>
        </div>
        <form onSubmit={changePassword} className="space-y-3">
          <input type="password" className="input" placeholder="Current password"
            value={passwords.current} onChange={e => setPasswords(p => ({...p, current: e.target.value}))} />
          <input type="password" className="input" placeholder="New password"
            value={passwords.newPass} onChange={e => setPasswords(p => ({...p, newPass: e.target.value}))} />
          <input type="password" className="input" placeholder="Confirm new password"
            value={passwords.confirm} onChange={e => setPasswords(p => ({...p, confirm: e.target.value}))} />
          <button type="submit" className="btn-primary">Update Password</button>
        </form>
      </div>

      <div className="glass-card p-6 border border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-accent" />
          <h2 className="font-semibold text-accent">Danger Zone</h2>
        </div>
        <p className="text-white/40 text-sm mb-4">Permanently delete your account and all associated data.</p>
        <button className="px-5 py-2.5 rounded-xl border border-accent/30 text-accent text-sm hover:bg-accent/10 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
