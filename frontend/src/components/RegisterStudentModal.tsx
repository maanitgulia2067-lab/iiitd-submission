import React, { useState } from 'react';
import { api, setAuthToken } from '../services/api';
import { User, College } from '../types';

interface RegisterStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserRegistered: (user: User) => void;
  colleges: College[];
}

export const RegisterStudentModal: React.FC<RegisterStudentModalProps> = ({
  isOpen,
  onClose,
  onUserRegistered,
  colleges
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college_id: colleges[0]?.college_id || 'clg_dtu',
    headline: '',
    bio: '',
    availability_hours: 10,
    collaboration_mode: 'Remote',
    skills: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Name, email, and password are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await api.register({
        ...formData,
        skills: skillsArray
      });

      if (res.token) {
        setAuthToken(res.token);
      }

      if (res.user) {
        onUserRegistered(res.user);
      } else {
        const me = await api.getCurrentUser();
        onUserRegistered(me);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-slate-100"></span>
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              [REGISTER NEW STUDENT • SQLITE]
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Maya Iyer"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="maya@iitd.ac.in"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                College Affiliation *
              </label>
              <select
                value={formData.college_id}
                onChange={e => setFormData({ ...formData, college_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                {colleges.map(c => (
                  <option key={c.college_id} value={c.college_id}>
                    {c.short_name} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Headline / Role
            </label>
            <input
              type="text"
              value={formData.headline}
              onChange={e => setFormData({ ...formData, headline: e.target.value })}
              placeholder="e.g. Distributed Systems & Rust Builder"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Bio & Interests
            </label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell other builders what you like creating and what projects you want to build..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Availability (Hours/Week)
              </label>
              <input
                type="number"
                min={2}
                max={40}
                value={formData.availability_hours}
                onChange={e => setFormData({ ...formData, availability_hours: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Collaboration Mode
              </label>
              <select
                value={formData.collaboration_mode}
                onChange={e => setFormData({ ...formData, collaboration_mode: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="In-person">In-person</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Skills (comma separated)
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={e => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g. Python, Rust, Docker, PostgreSQL"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-mono font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 transition disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'REGISTER & LOGIN →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

