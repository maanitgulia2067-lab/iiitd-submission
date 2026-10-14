import React, { useState, useEffect } from 'react';
import { Club, ClubPartnership } from '../types';
import { api } from '../services/api';

export const CommunitiesPage: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [partnerships, setPartnerships] = useState<ClubPartnership[]>([]);
  const [activeTab, setActiveTab] = useState<'societies' | 'partnerships'>('societies');
  const [loading, setLoading] = useState(true);
  const [partnershipTarget, setPartnershipTarget] = useState<Club | null>(null);
  const [proposal, setProposal] = useState('');
  const [title, setTitle] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getClubs(),
      api.getClubPartnerships()
    ]).then(([clbs, prts]) => {
      setClubs(clbs);
      setPartnerships(prts);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnershipTarget) return;
    try {
      await api.proposeClubPartnership({
        recipient_club_id: partnershipTarget.club_id,
        title: title.trim(),
        proposal: proposal.trim()
      });
      setSuccessMsg(`Partnership proposal submitted to ${partnershipTarget.name}!`);
      setPartnershipTarget(null);
      setTitle('');
      setProposal('');
      setTimeout(() => setSuccessMsg(null), 4000);
      loadData();
    } catch (e) {
      alert('Failed to submit proposal');
    }
  };

  const filteredClubs = clubs.filter((c) => {
    if (selectedCategory !== 'all' && c.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.college_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Collegiate Federation Banner */}
      <div className="p-3 rounded-xl bg-slate-900 text-white dark:bg-slate-950 dark:border dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span className="font-bold tracking-wider">[FEDERATION // INTER-COLLEGE_SOCIETIES]</span>
          <span className="text-slate-400 hidden sm:inline">&bull; Cross-Campus Alliance Network</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] text-slate-300 dark:text-slate-400">
          <span>CHAPTERS: <strong className="text-white">6 VERIFIED</strong></span>
          <span>ALLIANCES: <strong className="text-white">SRS &sect;4.6</strong></span>
          <span>INITIATIVES: <strong className="text-white">JOINT HOSTING</strong></span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Campus Network & Societies</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Section 4.6: Explore verified student clubs across colleges. Propose joint hackathons, workshops, and inter-college initiatives.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl font-mono flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold">&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 font-mono text-xs">
        <button
          onClick={() => setActiveTab('societies')}
          className={`pb-3 px-4 font-bold border-b-2 transition ${
            activeTab === 'societies'
              ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          COLLEGIATE SOCIETIES ({clubs.length})
        </button>
        <button
          onClick={() => setActiveTab('partnerships')}
          className={`pb-3 px-4 font-bold border-b-2 transition ${
            activeTab === 'partnerships'
              ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          INTER-CAMPUS PARTNERSHIPS ({partnerships.length})
        </button>
      </div>

      {activeTab === 'societies' && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search societies by name, domain, college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-2 font-mono">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Domains</option>
              <option value="ai & ml">AI & ML</option>
              <option value="software & cloud">Software & Cloud</option>
              <option value="robotics & hardware">Robotics & Hardware</option>
              <option value="entrepreneurship">Entrepreneurship</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-mono">Loading collegiate societies...</div>
      ) : activeTab === 'societies' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredClubs.map((c) => (
            <div
              key={c.club_id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 pixel-box hover:border-slate-400 dark:hover:border-slate-600 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="pixel-chip bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {c.category}
                      </span>
                      <span className="pixel-chip bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                        {c.college_short_name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        ✓ {c.verification_status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">{c.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">{c.college_name}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">{c.description}</p>

                <div className="mt-4 flex items-center space-x-4 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>👥 ~{c.member_count} active builders</span>
                  {c.lead_name && <span>Lead: {c.lead_name}</span>}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono">
                <a
                  href={c.website || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                >
                  Visit Portal &rarr;
                </a>
                <button
                  onClick={() => setPartnershipTarget(c)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-bold transition pixel-box"
                >
                  Propose Partnership (FR-045)
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Active Partnerships list */
        <div className="space-y-4">
          {partnerships.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 pixel-box">
              No active cross-campus partnerships currently listed. Propose one to connect societies!
            </div>
          ) : (
            partnerships.map((prt) => (
              <div
                key={prt.partnership_id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="pixel-chip bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                      {prt.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {prt.sender_club_name} ({prt.sender_college}) ⇄ {prt.recipient_club_name} ({prt.recipient_college})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{prt.created_at?.split(' ')[0] || 'Recent'}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{prt.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{prt.proposal}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Partnership Proposal Modal (FR-045) */}
      {partnershipTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 pixel-box font-mono">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Partner with {partnershipTarget.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Submit an inter-college initiative proposal (FR-045).</p>

            <form onSubmit={handlePropose} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initiative Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Joint 48-Hour AI Hackathon or Speaker Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Proposal & Mutual Benefit</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the joint event, shared mentorship, or resource exchange..."
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setPartnershipTarget(null)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
