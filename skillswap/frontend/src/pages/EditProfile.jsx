import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

export default function EditProfile() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bio: '', qualification: '', yearsOfExperience: 0,
    githubLink: '', linkedinLink: '', portfolio: '',
    pricePerMinute: 5,
    skillsTeach: [], skillsLearn: [],
  });
  const [newTeachSkill, setNewTeachSkill] = useState({ name: '', level: 'intermediate' });
  const [newLearnSkill, setNewLearnSkill] = useState({ name: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        bio: user.bio || '', qualification: user.qualification || '',
        yearsOfExperience: user.yearsOfExperience || 0,
        githubLink: user.githubLink || '', linkedinLink: user.linkedinLink || '',
        portfolio: user.portfolio || '', pricePerMinute: user.pricePerMinute || 5,
        skillsTeach: user.skillsTeach || [], skillsLearn: user.skillsLearn || [],
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data.user);
      toast.success('Profile updated! ✅');
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  const addTeachSkill = () => {
    if (!newTeachSkill.name.trim()) return;
    setForm(p => ({ ...p, skillsTeach: [...p.skillsTeach, { ...newTeachSkill }] }));
    setNewTeachSkill({ name: '', level: 'intermediate' });
  };

  const addLearnSkill = () => {
    if (!newLearnSkill.name.trim()) return;
    setForm(p => ({ ...p, skillsLearn: [...p.skillsLearn, { name: newLearnSkill.name, level: 'beginner' }] }));
    setNewLearnSkill({ name: '' });
  };

  const Field = ({ label, name, type = 'text', ...props }) => (
    <div>
      <label className="text-sm text-white/60 mb-1.5 block">{label}</label>
      <input type={type} className="input" value={form[name]} name={name}
        onChange={e => setForm(p => ({ ...p, [name]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        {...props} />
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold mb-1">Edit Profile</h1>
        <p className="text-white/40">Complete your profile to attract more learners</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Basic Info</h2>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Bio</label>
            <textarea className="input resize-none h-28" placeholder="Tell learners about yourself..."
              value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Qualification</label>
              <select className="input text-sm" value={form.qualification}
                onChange={e => setForm(p => ({...p, qualification: e.target.value}))}>
                <option value="">Select...</option>
                {['High School','Diploma','Bachelors','Masters','PhD','Self-Taught','Professional'].map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
            <Field label="Years of Experience" name="yearsOfExperience" type="number" min="0" max="50" />
          </div>
        </div>

        {user?.isMentor && (
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Mentor Settings</h2>
            <Field label="Price per minute (₹)" name="pricePerMinute" type="number" min="1" max="500" />
          </div>
        )}

        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Skills I Teach</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.skillsTeach.map((s, i) => (
              <span key={i} className="badge bg-primary/20 text-primary border border-primary/30 flex items-center gap-2">
                {s.name} ({s.level})
                <button type="button" onClick={() => setForm(p => ({ ...p, skillsTeach: p.skillsTeach.filter((_,j)=>j!==i) }))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Skill name (e.g. React)"
              value={newTeachSkill.name} onChange={e => setNewTeachSkill(p => ({...p, name: e.target.value}))}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTeachSkill())} />
            <select className="input w-36" value={newTeachSkill.level}
              onChange={e => setNewTeachSkill(p => ({...p, level: e.target.value}))}>
              {['beginner','intermediate','advanced','expert'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <button type="button" onClick={addTeachSkill} className="btn-primary px-4 py-2.5">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Skills I Want to Learn</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.skillsLearn.map((s, i) => (
              <span key={i} className="badge bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 flex items-center gap-2">
                {s.name}
                <button type="button" onClick={() => setForm(p => ({ ...p, skillsLearn: p.skillsLearn.filter((_,j)=>j!==i) }))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Skill to learn (e.g. Python)"
              value={newLearnSkill.name} onChange={e => setNewLearnSkill({ name: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLearnSkill())} />
            <button type="button" onClick={addLearnSkill} className="btn-primary px-4 py-2.5">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Social Links</h2>
          <Field label="GitHub" name="githubLink" placeholder="https://github.com/username" />
          <Field label="LinkedIn" name="linkedinLink" placeholder="https://linkedin.com/in/username" />
          <Field label="Portfolio" name="portfolio" placeholder="https://yourwebsite.com" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary px-8">
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
          <button type="button" onClick={() => navigate('/profile')} className="btn-ghost px-8">Cancel</button>
        </div>
      </form>
    </div>
  );
}
