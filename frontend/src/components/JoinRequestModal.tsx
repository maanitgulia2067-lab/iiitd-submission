import React, { useState } from 'react';
import { Project } from '../types';
import { api } from '../services/api';

interface JoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSuccess: () => void;
}

export const JoinRequestModal: React.FC<JoinRequestModalProps> = ({
  isOpen,
  onClose,
  project,
  onSuccess
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.sendRequest({
        recipient_id: project.creator_id,
        project_id: project.project_id,
        role_name: selectedRole || (project.requirements?.[0]?.role_name || 'Contributor'),
        request_type: 'join_project',
        message: message.trim() || 'Hi! I would love to collaborate on this project.'
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 pixel-box">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">FR-021 JOIN REQUEST</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">Apply to Join {project.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs border border-slate-300 dark:border-slate-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Role You Want to Fill
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-medium focus:outline-none"
              required
            >
              <option value="">-- Choose an open position --</option>
              {project.requirements?.map((req) => (
                <option key={req.requirement_id} value={req.role_name}>
                  {req.role_name} ({req.skill_name}) — {req.positions_required - req.positions_filled} slot left
                </option>
              ))}
              <option value="General Contributor">General Contributor / Co-Learner</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Note to Project Lead
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detail your relevant skills, why you want to contribute, and your weekly commitment..."
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium resize-none focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Join Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
