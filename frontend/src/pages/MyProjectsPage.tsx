import React, { useState, useEffect } from 'react';
import { Project, CollaborationRequest, User } from '../types';
import { api } from '../services/api';

interface MyProjectsPageProps {
  currentUser: User | null;
  onNavigate: (tab: string, entityId?: string) => void;
}

export const MyProjectsPage: React.FC<MyProjectsPageProps> = ({ currentUser, onNavigate }) => {
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([]);
  const [pendingRequests, setPendingRequests] = useState<CollaborationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'created' | 'joined' | 'requests'>('created');
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getMyProjects();
      setCreatedProjects(data.created || []);
      setJoinedProjects(data.joined || []);
      setPendingRequests(data.pending_requests || []);
    } catch (e) {
      console.error('Failed to load my projects', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleRequestAction = async (requestId: string, status: 'Accepted' | 'Rejected') => {
    try {
      await api.updateRequestStatus(requestId, status);
      setPendingRequests(prev => prev.filter(r => r.request_id !== requestId));
      setFeedbackMsg(`Join request ${status.toLowerCase()}! Team membership updated.`);
      setTimeout(() => setFeedbackMsg(null), 3500);
      loadData();
    } catch (e) {
      alert('Failed to update request');
    }
  };

  const handleShowcaseSubmit = async (projectId: string) => {
    try {
      await api.featureInShowcase(projectId);
      setFeedbackMsg('Project submitted to public Showcase! It is now featured.');
      setTimeout(() => setFeedbackMsg(null), 3500);
      loadData();
    } catch (e) {
      alert('Failed to submit to showcase');
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Telemetry Ribbon */}
      <div className="p-3 rounded-xl bg-slate-900 text-white dark:bg-slate-950 dark:border dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
          <span className="font-bold tracking-wider">[PORTFOLIO_DASHBOARD // INITIATIVES_AND_LEADS]</span>
          <span className="text-slate-400 hidden sm:inline">&bull; SRS &sect;4.3 &amp; &sect;9.1</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] text-slate-300 dark:text-slate-400">
          <span>LEADING: <strong className="text-white">{createdProjects.length} BUILDS</strong></span>
          <span>CONTRIBUTING: <strong className="text-white">{joinedProjects.length} BUILDS</strong></span>
          <span>INBOX: <strong className="text-white">{pendingRequests.length} APPLICANTS</strong></span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">My Projects</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Section 4.3 & 9.1: Manage your initiated project teams, membership roles, and applicant requests.
          </p>
        </div>

        <button
          onClick={() => onNavigate('buildspace')}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-mono font-bold pixel-box transition self-start"
        >
          + PUBLISH NEW BUILD
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl flex items-center justify-between">
          <span className="font-mono">{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-500 font-bold ml-2">&times;</button>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 font-mono text-xs">
        <button
          onClick={() => setActiveTab('created')}
          className={`pb-3 px-4 font-bold border-b-2 transition ${
            activeTab === 'created'
              ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          PROJECTS I LEAD ({createdProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('joined')}
          className={`pb-3 px-4 font-bold border-b-2 transition ${
            activeTab === 'joined'
              ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          PROJECTS I JOINED ({joinedProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-4 font-bold border-b-2 transition ${
            activeTab === 'requests'
              ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          APPLICANTS ({pendingRequests.length})
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-mono">Loading your project portfolio...</div>
      ) : activeTab === 'created' ? (
        createdProjects.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 pixel-box">
            You haven't published any projects yet. Turn an idea into reality by creating one in BuildSpace!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {createdProjects.map((p) => (
              <div
                key={p.project_id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="pixel-chip bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {p.category}
                    </span>
                    <span className="pixel-chip bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                      {p.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Stage: {p.project_stage}</span>
                  </div>

                  <h3
                    onClick={() => onNavigate('workspace', p.project_id)}
                    className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2 hover:underline cursor-pointer"
                  >
                    {p.title}
                  </h3>
                  {p.tagline && <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{p.tagline}</p>}

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{p.description}</p>

                  {/* Team status */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
                      <span>Members: {p.members?.length}</span>
                      <span className="font-bold">{p.open_roles_count || 0} open positions</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.requirements?.map((req) => (
                        <span key={req.requirement_id} className="pixel-chip bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {req.role_name} ({req.positions_filled}/{req.positions_required})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => handleShowcaseSubmit(p.project_id)}
                    className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    {p.showcase_featured ? '✓ In Showcase' : 'Submit to Showcase'}
                  </button>

                  <button
                    onClick={() => onNavigate('workspace', p.project_id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-mono font-bold transition"
                  >
                    WORKSPACE &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'joined' ? (
        joinedProjects.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 pixel-box">
            You haven't joined any external teams yet. Apply to join projects in BuildSpace!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {joinedProjects.map((p) => (
              <div
                key={p.project_id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="pixel-chip bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {p.category}
                    </span>
                    <span className="pixel-chip bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                      {p.my_role || 'Contributor'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Led by {p.creator_name} ({p.creator_college})</span>
                  </div>

                  <h3
                    onClick={() => onNavigate('workspace', p.project_id)}
                    className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2 hover:underline cursor-pointer"
                  >
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Status: {p.status}</span>
                  <button
                    onClick={() => onNavigate('workspace', p.project_id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-mono font-bold transition"
                  >
                    OPEN WORKSPACE &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Pending Applicants tab */
        pendingRequests.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 pixel-box">
            No pending join requests for your projects.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.request_id}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 pixel-box flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 font-mono">{req.sender_name}</span>
                    <span className="pixel-chip bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {req.sender_college}
                    </span>
                    <span className="text-xs text-slate-500">applied for</span>
                    <span className="pixel-chip bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                      {req.role_name}
                    </span>
                    <span className="text-xs text-slate-500">in</span>
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{req.project_title}</span>
                  </div>
                  {req.message && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{req.message}"</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleRequestAction(req.request_id, 'Accepted')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-mono font-bold transition"
                  >
                    Accept Applicant
                  </button>
                  <button
                    onClick={() => handleRequestAction(req.request_id, 'Rejected')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono transition"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

