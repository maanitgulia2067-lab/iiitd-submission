import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface StudentProfileProps {
  currentUser: User | null;
  onProfileUpdated: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ currentUser, onProfileUpdated }) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [availabilityHours, setAvailabilityHours] = useState(10);
  const [collaborationMode, setCollaborationMode] = useState('Remote');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [contributeSkills, setContributeSkills] = useState<string[]>([]);
  const [learnSkills, setLearnSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  // Input helpers
  const [newContributeSkill, setNewContributeSkill] = useState('');
  const [newLearnSkill, setNewLearnSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getCurrentUser();
      setProfile(data);
      setName(data.name || '');
      setHeadline(data.headline || '');
      setBio(data.bio || '');
      setAvailabilityHours(data.availability_hours || 10);
      setCollaborationMode(data.collaboration_mode || 'Remote');
      setGithubUrl(data.github_url || '');
      setLinkedinUrl(data.linkedin_url || '');
      setPortfolioUrl(data.portfolio_url || '');
      setContributeSkills(data.skills?.filter((s: any) => s.can_contribute).map((s: any) => s.name) || []);
      setLearnSkills(data.skills?.filter((s: any) => s.wants_to_learn).map((s: any) => s.name) || []);
      setInterests(data.interests?.map((i: any) => i.name) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      await api.updateStudent(profile.user_id, {
        name,
        headline,
        bio,
        availability_hours: availabilityHours,
        collaboration_mode: collaborationMode,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
        skills_contribute: contributeSkills,
        skills_learn: learnSkills,
        interests: interests
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      onProfileUpdated();
    } catch (e) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addContributeSkill = () => {
    if (newContributeSkill.trim() && !contributeSkills.includes(newContributeSkill.trim())) {
      setContributeSkills([...contributeSkills, newContributeSkill.trim()]);
      setNewContributeSkill('');
    }
  };

  const addLearnSkill = () => {
    if (newLearnSkill.trim() && !learnSkills.includes(newLearnSkill.trim())) {
      setLearnSkills([...learnSkills, newLearnSkill.trim()]);
      setNewLearnSkill('');
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400 font-mono">Loading profile data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Identity Terminal Ribbon */}
      <div className="p-3 rounded-xl bg-slate-900 text-white dark:bg-slate-950 dark:border dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
          <span className="font-bold tracking-wider">[IDENTITY_SPEC // BUILDER_PASSPORT]</span>
          <span className="text-slate-400 hidden sm:inline">&bull; SRS &sect;4.1</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] text-slate-300 dark:text-slate-400">
          <span>AFFILIATION: <strong className="text-white">{profile?.verification_status?.toUpperCase() || 'VERIFIED'}</strong></span>
          <span>COMMITMENT: <strong className="text-white">{profile?.availability_hours || 10} HRS/WK</strong></span>
          <span>MODE: <strong className="text-white">{profile?.collaboration_mode?.toUpperCase() || 'REMOTE'}</strong></span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">My Profile & Portfolio</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Section 4.1: Manage your contribution skills, learning goals, verified affiliation, and availability.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-xl animate-in fade-in">
            ✓ Changes saved successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 pixel-box space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-mono font-extrabold text-2xl flex items-center justify-center pixel-box">
                {profile?.name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{profile?.name}</h3>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {profile?.college_name || 'Delhi Technological University'}
                  </span>
                  <span className="pixel-chip bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {profile?.verification_status === 'Verified' ? '✓ Verified Affiliation' : 'Self-Declared'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">Headline (Role / Specialization)</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">Bio & Collaboration Objective</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 font-medium resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Availability (Hours / Week)</label>
              <input
                type="number"
                min={1}
                max={40}
                value={availabilityHours}
                onChange={(e) => setAvailabilityHours(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Preferred Collaboration Mode</label>
              <select
                value={collaborationMode}
                onChange={(e) => setCollaborationMode(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 font-medium"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="In-person">In-Person</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skills Management (FR-003, FR-005, FR-006) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 pixel-box space-y-5">
          <h3 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 uppercase tracking-wider">Skills & Learning Goals</h3>

          {/* Skills I Can Offer */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Skills I Can Contribute to Projects (FR-006)
            </label>
            <div className="flex gap-2 mb-2 font-mono">
              <input
                type="text"
                placeholder="Add skill (e.g. Java, FastAPI, React)..."
                value={newContributeSkill}
                onChange={(e) => setNewContributeSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addContributeSkill(); } }}
                className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 font-medium"
              />
              <button
                type="button"
                onClick={addContributeSkill}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono">
              {contributeSkills.map((sk) => (
                <span key={sk} className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700">
                  <span>{sk}</span>
                  <button type="button" onClick={() => setContributeSkills(contributeSkills.filter(s => s !== sk))} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Skills I Want to Learn */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Skills I Want to Learn / Goals (FR-005)
            </label>
            <div className="flex gap-2 mb-2 font-mono">
              <input
                type="text"
                placeholder="Add learning goal (e.g. PyTorch, Rust, UI/UX)..."
                value={newLearnSkill}
                onChange={(e) => setNewLearnSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLearnSkill(); } }}
                className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 font-medium"
              />
              <button
                type="button"
                onClick={addLearnSkill}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono">
              {learnSkills.map((sk) => (
                <span key={sk} className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border border-slate-200 dark:border-slate-700">
                  <span>{sk}</span>
                  <button type="button" onClick={() => setLearnSkills(learnSkills.filter(s => s !== sk))} className="text-slate-400 hover:text-slate-600 ml-1">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Domain Interests (FR-004)
            </label>
            <div className="flex gap-2 mb-2 font-mono">
              <input
                type="text"
                placeholder="Add interest (e.g. Artificial Intelligence, ClimateTech)..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
                className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 font-medium"
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono">
              {interests.map((it) => (
                <span key={it} className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700">
                  <span>{it}</span>
                  <button type="button" onClick={() => setInterests(interests.filter(i => i !== it))} className="text-slate-400 hover:text-slate-600 ml-1">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio & External Repos (FR-008) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 pixel-box space-y-4">
          <h3 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 uppercase tracking-wider">Portfolio & Links (FR-008)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub Profile</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">LinkedIn Profile</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Personal Portfolio Demo</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-mono font-bold transition pixel-box disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
