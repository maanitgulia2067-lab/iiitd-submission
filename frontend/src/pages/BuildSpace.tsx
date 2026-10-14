import React, { useState, useEffect } from 'react';
import { Project, User } from '../types';
import { api } from '../services/api';
import { JoinRequestModal } from '../components/JoinRequestModal';

interface BuildSpaceProps {
  currentUser: User | null;
  onNavigate: (tab: string, entityId?: string) => void;
}

export const BuildSpace: React.FC<BuildSpaceProps> = ({ currentUser, onNavigate }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJoinProject, setSelectedJoinProject] = useState<Project | null>(null);

  // New Project Form
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [newCategory, setNewCategory] = useState('AI/ML');
  const [newStage, setNewStage] = useState('Idea');
  const [newCommitment, setNewCommitment] = useState('8-10 hrs/week');
  const [newMode, setNewMode] = useState('Remote');
  const [newRoles, setNewRoles] = useState<{ role_name: string; skill_name: string; positions_required: number }[]>([
    { role_name: 'Frontend Developer', skill_name: 'React', positions_required: 1 },
    { role_name: 'Backend Developer', skill_name: 'FastAPI', positions_required: 1 }
  ]);
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects({
        category: selectedCategory,
        stage: selectedStage,
        search: search.trim()
      });
      setProjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, selectedStage, search, currentUser]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.createProject({
        title: newTitle,
        tagline: newTagline,
        description: newDesc,
        problem_statement: newProblem,
        category: newCategory,
        project_stage: newStage,
        expected_commitment: newCommitment,
        collaboration_mode: newMode,
        visibility: 'Public',
        requirements: newRoles
      });
      setShowCreateModal(false);
      // Reset form
      setNewTitle('');
      setNewTagline('');
      setNewDesc('');
      setNewProblem('');
      fetchProjects();
    } catch (err) {
      alert('Failed to publish project');
    } finally {
      setCreating(false);
    }
  };

  const addRoleField = () => {
    setNewRoles([...newRoles, { role_name: '', skill_name: '', positions_required: 1 }]);
  };

  const removeRoleField = (index: number) => {
    setNewRoles(newRoles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Blueprint Subheader Ribbon */}
      <div className="p-3 rounded-xl bg-slate-900 text-white dark:bg-slate-950 dark:border dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          <span className="font-bold tracking-wider">[BUILDSPACE // PROJECT_BLUEPRINTS]</span>
          <span className="text-slate-400 hidden sm:inline">&bull; Cross-College Team Formation</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] text-slate-300 dark:text-slate-400">
          <span>REPOSITORIES: <strong className="text-white">14 ACTIVE</strong></span>
          <span>ROLES: <strong className="text-white">26 OPEN</strong></span>
          <span>PROTOCOL: <strong className="text-white">SRS &sect;4.3</strong></span>
        </div>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">BuildSpace Blueprints</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Section 4.3: Turn collaborative ideas into shipped products. Define required skills and recruit cross-campus co-builders.
          </p>
        </div>
        <div className="flex gap-2 self-start font-mono">
          <button
            onClick={() => onNavigate('myprojects')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
          >
            My Projects
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-bold pixel-box transition"
          >
            <span>+ PUBLISH BUILD</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search projects by title, problem, or technology..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Domains</option>
            <option value="ai/ml">AI / ML</option>
            <option value="web">Web & Fullstack</option>
            <option value="iot">IoT & Hardware</option>
            <option value="social impact">Social Impact</option>
          </select>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Stages</option>
            <option value="idea">Idea</option>
            <option value="prototype">Prototype</option>
            <option value="in development">In Development</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-mono">Loading BuildSpace projects...</div>
      ) : projects.length === 0 ? (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 pixel-box">
          No projects match your filter. Be the first to start a new build!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.project_id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 pixel-box hover:border-slate-400 dark:hover:border-slate-600 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="pixel-chip bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {proj.category}
                      </span>
                      <span className="pixel-chip bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                        {proj.project_stage}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        by {proj.creator_name} ({proj.creator_college})
                      </span>
                    </div>
                    <h2
                      onClick={() => onNavigate('workspace', proj.project_id)}
                      className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2 hover:underline transition cursor-pointer"
                    >
                      {proj.title}
                    </h2>
                    {proj.tagline && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">{proj.tagline}</p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                  {proj.description}
                </p>

                {/* Problem Statement Box */}
                {proj.problem_statement && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Problem: </span>
                    <span className="line-clamp-2">{proj.problem_statement}</span>
                  </div>
                )}

                {/* Open Positions & Skills Needed (FR-020 & FR-034) */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Open Positions Needed</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">{proj.open_roles_count || 0} open</span>
                  </div>
                  <div className="space-y-1.5">
                    {proj.requirements?.map((req) => (
                      <div
                        key={req.requirement_id}
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{req.role_name}</span>
                          <span className="pixel-chip bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {req.skill_name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {req.positions_filled}/{req.positions_required} filled
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Members list */}
                <div className="mt-4 flex items-center space-x-2">
                  <span className="text-[11px] font-mono text-slate-400">Team:</span>
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {proj.members?.map((m) => (
                      <div
                        key={m.membership_id}
                        className="inline-block h-6 w-6 rounded bg-slate-800 dark:bg-slate-700 text-white font-mono font-bold text-[10px] flex items-center justify-center border border-white dark:border-slate-900"
                        title={`${m.name} (${m.role})`}
                      >
                        {m.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {proj.members?.length} members ({proj.collaboration_mode} • {proj.expected_commitment})
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('workspace', proj.project_id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold transition"
                >
                  Workspace & Tasks &rarr;
                </button>
                <button
                  onClick={() => setSelectedJoinProject(proj)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-mono font-bold transition shadow-xs"
                >
                  Apply to Join
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Start Project Modal (FR-017) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 pixel-box animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">FR-017 CREATE PROJECT</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">Publish a New Project Idea</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., MedScan AI, CampusCred, SolarGrid"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">Tagline (One sentence pitch)</label>
                <input
                  type="text"
                  placeholder="e.g., Realtime preliminary radiograph screening with edge vision transformers"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Domain Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 font-medium"
                  >
                    <option value="AI/ML">AI / Machine Learning</option>
                    <option value="Web">Web & Cloud Systems</option>
                    <option value="IoT">IoT & Robotics</option>
                    <option value="Social Impact">Social Impact & Accessibility</option>
                    <option value="Open Source">Open Source Utilities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Stage</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 font-medium"
                  >
                    <option value="Idea">Idea</option>
                    <option value="Prototype">Prototype</option>
                    <option value="In Development">In Development</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what the project does, the technical architecture, and the roadmap..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:outline-none resize-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">Problem Being Solved</label>
                <textarea
                  rows={2}
                  placeholder="What friction or student/clinical challenge does this address?"
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:outline-none resize-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Commitment</label>
                  <input
                    type="text"
                    value={newCommitment}
                    onChange={(e) => setNewCommitment(e.target.value)}
                    placeholder="e.g. 8-10 hrs/week"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mode</label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 font-medium"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="In-person">In-Person</option>
                  </select>
                </div>
              </div>

              {/* Define Open Roles (FR-020) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">Required Roles & Skills Needed</span>
                  <button
                    type="button"
                    onClick={addRoleField}
                    className="text-xs font-mono text-slate-900 dark:text-slate-100 hover:underline font-bold"
                  >
                    + Add Role
                  </button>
                </div>

                <div className="space-y-2">
                  {newRoles.map((role, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Role (e.g. Frontend Dev)"
                        value={role.role_name}
                        onChange={(e) => {
                          const updated = [...newRoles];
                          updated[idx].role_name = e.target.value;
                          setNewRoles(updated);
                        }}
                        className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 font-medium"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Primary Skill (e.g. React)"
                        value={role.skill_name}
                        onChange={(e) => {
                          const updated = [...newRoles];
                          updated[idx].skill_name = e.target.value;
                          setNewRoles(updated);
                        }}
                        className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 font-mono"
                        required
                      />
                      {newRoles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoleField(idx)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 text-sm font-bold"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-50"
                >
                  {creating ? 'Publishing...' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Request Modal */}
      {selectedJoinProject && (
        <JoinRequestModal
          isOpen={true}
          onClose={() => setSelectedJoinProject(null)}
          project={selectedJoinProject}
          onSuccess={() => {
            fetchProjects();
          }}
        />
      )}
    </div>
  );
};
