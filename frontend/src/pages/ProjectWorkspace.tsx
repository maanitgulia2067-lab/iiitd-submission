import React, { useState, useEffect } from 'react';
import { Project, User } from '../types';
import { api } from '../services/api';

interface ProjectWorkspaceProps {
  projectId: string;
  currentUser: User | null;
  onBack: () => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ projectId, currentUser, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  // New milestone form state
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  // New resource form state
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResType, setNewResType] = useState('Link');

  // Invite modal state (FR-022)
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitePeerId, setInvitePeerId] = useState('');
  const [inviteRoleName, setInviteRoleName] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [demoPeers, setDemoPeers] = useState<User[]>([]);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Discussion & briefs state
  const [projectMessages, setProjectMessages] = useState<any[]>([]);
  const [newProjectBrief, setNewProjectBrief] = useState('');
  const [sendingBrief, setSendingBrief] = useState(false);

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await api.getProject(projectId);
      setProject(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectMessages = async () => {
    try {
      const msgs = await api.getProjectMessages(projectId);
      setProjectMessages(msgs || []);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadProject();
    loadProjectMessages();
    api.getDemoUsers().then(setDemoPeers).catch(() => {});
  }, [projectId]);

  const handlePostBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectBrief.trim()) return;
    setSendingBrief(true);
    try {
      await api.sendProjectMessage(projectId, newProjectBrief.trim());
      setNewProjectBrief('');
      loadProjectMessages();
    } catch (err) {
      alert('Failed to post brief');
    } finally {
      setSendingBrief(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await api.createTask(projectId, {
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        assigned_user_id: newTaskAssignee || null,
        status: 'Todo'
      });
      setNewTaskTitle('');
      setNewTaskDesc('');
      loadProject();
    } catch (e) {
      alert('Failed to add task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await api.updateTask(projectId, taskId, { status });
      loadProject();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    try {
      await api.createMilestone(projectId, {
        title: newMilestoneTitle.trim(),
        due_date: newMilestoneDate || '2026-11-15'
      });
      setNewMilestoneTitle('');
      setNewMilestoneDate('');
      loadProject();
    } catch (e) {
      alert('Failed to add milestone');
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim() || !newResUrl.trim()) return;
    try {
      await api.addResource(projectId, {
        title: newResTitle.trim(),
        url: newResUrl.trim(),
        resource_type: newResType
      });
      setNewResTitle('');
      setNewResUrl('');
      loadProject();
    } catch (e) {
      alert('Failed to add resource');
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await api.updateProjectStatus(projectId, status);
      loadProject();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitePeerId) return;
    try {
      await api.inviteTeammate(projectId, {
        recipient_id: invitePeerId,
        role_name: inviteRoleName || (project?.requirements?.[0]?.role_name || 'Contributor'),
        message: inviteMsg.trim() || `Join our project ${project?.title}!`
      });
      setInviteSuccess('Teammate invitation sent!');
      setTimeout(() => setInviteSuccess(null), 3000);
      setShowInviteModal(false);
      setInvitePeerId('');
      setInviteMsg('');
    } catch (e) {
      alert('Failed to send invitation');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400 font-mono">Loading project workspace...</div>;
  }

  if (!project) {
    return <div className="p-8 text-center text-sm text-slate-500 font-mono">Project not found.</div>;
  }

  const isLeader = currentUser?.user_id === project.creator_id;
  const tasksTodo = project.tasks?.filter(t => t.status === 'Todo') || [];
  const tasksInProgress = project.tasks?.filter(t => t.status === 'In Progress') || [];
  const tasksDone = project.tasks?.filter(t => t.status === 'Done') || [];

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to BuildSpace</span>
        </button>

        {/* Project Status Control */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">Status:</span>
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={!isLeader}
            className="text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-slate-800 dark:text-slate-200"
          >
            <option value="Recruiting">Recruiting</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Paused">Paused</option>
          </select>
        </div>
      </div>

      {inviteSuccess && (
        <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl font-mono">
          ✓ {inviteSuccess}
        </div>
      )}

      {/* Workspace Terminal Ribbon */}
      <div className="p-3 rounded-xl bg-slate-900 text-white dark:bg-slate-950 dark:border dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          <span className="font-bold tracking-wider">[WORKSPACE_TERMINAL // {project.title.toUpperCase()}]</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] text-slate-300 dark:text-slate-400">
          <span>STAGE: <strong className="text-white">{project.project_stage.toUpperCase()}</strong></span>
          <span>SPRINT: <strong className="text-white">{project.status.toUpperCase()}</strong></span>
          <span>KANBAN: <strong className="text-white">{(project.tasks?.length || 0)} TASKS</strong></span>
        </div>
      </div>

      {/* Workspace Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 pixel-box space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="pixel-chip bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {project.category}
              </span>
              <span className="pixel-chip bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                {project.project_stage}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Led by {project.creator_name} ({project.creator_college_full || project.creator_college})
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">{project.title}</h1>
            {project.tagline && (
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">{project.tagline}</p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-3xl">{project.description}</p>
          </div>

          <div className="shrink-0 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
            <div><span className="font-semibold text-slate-900 dark:text-slate-100">Mode:</span> {project.collaboration_mode}</div>
            <div><span className="font-semibold text-slate-900 dark:text-slate-100">Commitment:</span> {project.expected_commitment}</div>
            <div><span className="font-semibold text-slate-900 dark:text-slate-100">Visibility:</span> {project.visibility}</div>
            {project.repository_url && (
              <div>
                <a href={project.repository_url} target="_blank" rel="noreferrer" className="text-slate-900 dark:text-slate-100 hover:underline font-bold">
                  GitHub Repository &rarr;
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Team Members & Open Roles */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Team Members ({project.members?.length})
              </h3>
              <button
                onClick={() => setShowInviteModal(true)}
                className="text-[11px] font-mono font-bold text-slate-900 dark:text-slate-100 hover:underline"
              >
                + Invite Teammate (FR-022)
              </button>
            </div>
            <div className="space-y-2">
              {project.members?.map((m) => (
                <div key={m.membership_id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded bg-slate-800 dark:bg-slate-700 text-white font-mono font-bold flex items-center justify-center text-xs">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{m.name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{m.college_name}</span>
                    </div>
                  </div>
                  <span className="pixel-chip bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Role Status & Positions (FR-024)
            </h3>
            <div className="space-y-2">
              {project.requirements?.map((req) => (
                <div key={req.requirement_id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{req.role_name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Skill: {req.skill_name}</span>
                  </div>
                  <span className="pixel-chip bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {req.positions_filled}/{req.positions_required} Filled
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Board (FR-026 Kanban-style Tasks) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Project Task Board</h2>
          <span className="text-xs text-slate-500 font-mono">FR-026 Interactive Project Tasks</span>
        </div>

        {/* Add Task Input */}
        <form onSubmit={handleCreateTask} className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            placeholder="New task title (e.g. Implement API endpoint, Design auth screen)..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 font-medium focus:outline-none"
          />
          <select
            value={newTaskAssignee}
            onChange={(e) => setNewTaskAssignee(e.target.value)}
            className="text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 p-2"
          >
            <option value="">Assign to member</option>
            {project.members?.map((m) => (
              <option key={m.user_id} value={m.user_id}>{m.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl text-xs font-mono font-bold transition shrink-0"
          >
            + Add Task
          </button>
        </form>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Todo */}
          <div className="bg-slate-100/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Todo</span>
              <span className="pixel-chip bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {tasksTodo.length}
              </span>
            </div>
            <div className="space-y-2">
              {tasksTodo.map((t) => (
                <div key={t.task_id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 pixel-box space-y-1.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.title}</p>
                  {t.description && <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.description}</p>}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400">{t.assigned_user_name || 'Unassigned'}</span>
                    <button
                      onClick={() => handleUpdateTaskStatus(t.task_id, 'In Progress')}
                      className="text-[10px] font-mono font-bold text-slate-900 dark:text-slate-100 hover:underline"
                    >
                      Start &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-slate-100/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">In Progress</span>
              <span className="pixel-chip bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {tasksInProgress.length}
              </span>
            </div>
            <div className="space-y-2">
              {tasksInProgress.map((t) => (
                <div key={t.task_id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 pixel-box space-y-1.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.title}</p>
                  {t.description && <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.description}</p>}
                  <div className="flex items-center justify-between pt-1 font-mono text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400">{t.assigned_user_name || 'Active'}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdateTaskStatus(t.task_id, 'Todo')}
                        className="text-slate-400 hover:underline"
                      >
                        &larr; Todo
                      </button>
                      <button
                        onClick={() => handleUpdateTaskStatus(t.task_id, 'Done')}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:underline"
                      >
                        Done &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Done */}
          <div className="bg-slate-100/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Completed</span>
              <span className="pixel-chip bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {tasksDone.length}
              </span>
            </div>
            <div className="space-y-2">
              {tasksDone.map((t) => (
                <div key={t.task_id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 pixel-box space-y-1">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 line-through">{t.title}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-500">
                    <span>✓ Finished</span>
                    <button
                      onClick={() => handleUpdateTaskStatus(t.task_id, 'In Progress')}
                      className="text-slate-400 hover:underline"
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Discussion & Project Briefs Space (AWS Builder Center Spec) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Team Discussion & Project Briefs
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Live asynchronous communication space for all project contributors
            </p>
          </div>
          <span className="pixel-chip bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {projectMessages.length} Messages
          </span>
        </div>

        {/* Message Stream */}
        <div className="max-h-60 overflow-y-auto space-y-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40">
          {projectMessages.length === 0 ? (
            <div className="text-center py-6 text-xs font-mono text-slate-400">
              No briefs posted yet. Share a technical update or question with your team below.
            </div>
          ) : (
            projectMessages.map((msg, idx) => (
              <div key={msg.message_id || idx} className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{msg.sender_name}</span>
                    {msg.college_short_name && (
                      <span className="text-[10px] font-mono text-slate-500">({msg.college_short_name})</span>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">
                    {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{msg.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Post Brief Form */}
        <form onSubmit={handlePostBrief} className="flex gap-2">
          <input
            type="text"
            required
            value={newProjectBrief}
            onChange={e => setNewProjectBrief(e.target.value)}
            placeholder="Post a project update, architecture note, or meeting brief..."
            className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sendingBrief || !newProjectBrief.trim()}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-mono font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition disabled:opacity-50 shrink-0"
          >
            POST BRIEF &rarr;
          </button>
        </form>
      </div>

      {/* Milestones & Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Milestones (FR-027) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Milestones (FR-027)</h3>
          </div>
          <form onSubmit={handleAddMilestone} className="flex gap-2 font-mono">
            <input
              type="text"
              placeholder="Milestone title..."
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
            />
            <button type="submit" className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl text-xs font-bold">
              Add
            </button>
          </form>
          <div className="space-y-2">
            {project.milestones?.map((m) => (
              <div key={m.milestone_id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{m.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">{m.due_date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resources (FR-028) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Shared Resources (FR-028)</h3>
          </div>
          <form onSubmit={handleAddResource} className="flex flex-col gap-2 font-mono">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Resource title (e.g. Figma, API docs)..."
                value={newResTitle}
                onChange={(e) => setNewResTitle(e.target.value)}
                className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
              />
              <select
                value={newResType}
                onChange={(e) => setNewResType(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
              >
                <option value="Link">Link</option>
                <option value="Document">Document</option>
                <option value="Figma">Figma</option>
                <option value="GitHub">GitHub</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={newResUrl}
                onChange={(e) => setNewResUrl(e.target.value)}
                className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
              />
              <button type="submit" className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl text-xs font-bold">
                Add
              </button>
            </div>
          </form>
          <div className="space-y-2">
            {project.resources?.map((r) => (
              <div key={r.resource_id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{r.title}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{r.resource_type}</span>
                </div>
                <a href={r.url} target="_blank" rel="noreferrer" className="text-slate-900 dark:text-slate-100 font-bold hover:underline text-xs font-mono">
                  Open &rarr;
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite Teammate Modal (FR-022) */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 pixel-box">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Invite a Teammate (FR-022)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recruit students across colleges directly into open positions.</p>

            <form onSubmit={handleSendInvite} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
                <select
                  value={invitePeerId}
                  onChange={(e) => setInvitePeerId(e.target.value)}
                  className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5"
                  required
                >
                  <option value="">-- Choose student across colleges --</option>
                  {demoPeers.filter(u => u.user_id !== currentUser?.user_id).map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.name} ({u.college_short_name}) — {u.headline?.split(' ')[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Position</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Engineer, ML Specialist"
                  value={inviteRoleName}
                  onChange={(e) => setInviteRoleName(e.target.value)}
                  className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">Personal Invitation Note</label>
                <textarea
                  rows={2}
                  value={inviteMsg}
                  onChange={(e) => setInviteMsg(e.target.value)}
                  placeholder="Explain why their skill set is ideal for this build..."
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-mono font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
