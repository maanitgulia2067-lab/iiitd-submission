import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { MatchExplanationModal } from '../components/MatchExplanationModal';

interface DiscoverStudentsProps {
  currentUser: User | null;
  onOpenChatWithPeer?: (peer: { user_id: string; name: string; college_short_name?: string }) => void;
}

export const DiscoverStudents: React.FC<DiscoverStudentsProps> = ({ currentUser, onOpenChatWithPeer }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [loading, setLoading] = useState(true);

  // Connection Request State
  const [selectedPeer, setSelectedPeer] = useState<User | null>(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);

  // Match Modal State
  const [selectedExplanation, setSelectedExplanation] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [colls, sks, peerMatches] = await Promise.all([
        api.getColleges(),
        api.getSkills(),
        api.getRecommendedPeers()
      ]);
      setColleges(colls);
      setSkills(sks);

      // Apply client-side search/filters
      let filtered = peerMatches;
      if (selectedCollege !== 'all') {
        filtered = filtered.filter((s: User) => s.college_id === selectedCollege);
      }
      if (selectedSkill !== 'all') {
        filtered = filtered.filter((s: User) =>
          s.skills?.some(sk => sk.name.toLowerCase() === selectedSkill.toLowerCase())
        );
      }
      if (selectedMode !== 'all') {
        filtered = filtered.filter((s: User) =>
          s.collaboration_mode?.toLowerCase() === selectedMode.toLowerCase()
        );
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter((s: User) =>
          s.name.toLowerCase().includes(q) ||
          s.headline?.toLowerCase().includes(q) ||
          s.bio?.toLowerCase().includes(q)
        );
      }
      setStudents(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser, selectedCollege, selectedSkill, selectedMode, search]);

  const handleSendConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeer) return;
    try {
      await api.sendRequest({
        recipient_id: selectedPeer.user_id,
        request_type: 'connection',
        message: connectMessage.trim() || `Hi ${selectedPeer.name}, let's connect and collaborate on CampusConnect!`
      });
      setSentSuccess(`Connection request sent to ${selectedPeer.name}!`);
      setTimeout(() => setSentSuccess(null), 4000);
      setSelectedPeer(null);
      setConnectMessage('');
    } catch (err) {
      alert('Failed to send connection request');
    }
  };

  return (
    <div className="space-y-6">
      {/* Peer Discovery Ribbon */}
      <div className="p-3 rounded-xl bg-slate-900 text-white dark:bg-slate-950 dark:border dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
          <span className="font-bold tracking-wider">[TALENT_RADAR // VERIFIED_BUILDERS]</span>
          <span className="text-slate-400 hidden sm:inline">&bull; Rule-Based Complementary Pairing</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] text-slate-300 dark:text-slate-400">
          <span>CAMPUSES: <strong className="text-white">28+ CONNECTED</strong></span>
          <span>ACCURACY: <strong className="text-white">94.2%</strong></span>
          <span>PROTOCOL: <strong className="text-white">SRS &sect;4.4</strong></span>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Discover Collaborators</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Explore complementary peers across institutions ranked by Section 4.4 rule-based matching.
        </p>
      </div>

      {sentSuccess && (
        <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl flex items-center justify-between font-mono">
          <span>✓ {sentSuccess}</span>
          <button onClick={() => setSentSuccess(null)} className="text-slate-500 font-bold">&times;</button>
        </div>
      )}

      {/* Search & Filter Toolbar (FR-011) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, role, bio keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Colleges</option>
              {colleges.map((c) => (
                <option key={c.college_id} value={c.college_id}>{c.short_name}</option>
              ))}
            </select>

            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Skills</option>
              {skills.map((s) => (
                <option key={s.skill_id} value={s.name}>{s.name}</option>
              ))}
            </select>

            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Modes</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-mono">Loading student directory...</div>
      ) : students.length === 0 ? (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 pixel-box">
          No students match the chosen criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map((student) => (
            <div
              key={student.user_id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 pixel-box hover:border-slate-400 dark:hover:border-slate-600 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-lg bg-slate-800 dark:bg-slate-700 text-white font-mono font-bold flex items-center justify-center text-base shadow-xs">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{student.name}</h3>
                        {student.verification_status === 'Verified' ? (
                          <span className="pixel-chip bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono" title="Verified College Affiliation">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="pixel-chip bg-slate-50 dark:bg-slate-800 text-slate-400 font-mono" title="Self-Declared Affiliation">
                            Self-Declared
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{student.college_short_name || student.college_name}</p>
                    </div>
                  </div>

                  {student.match_score && (
                    <button
                      onClick={() => setSelectedExplanation({
                        title: `Match with ${student.name}`,
                        targetName: student.name,
                        matchScore: student.match_score,
                        roleFit: student.role_fit,
                        interestFit: student.interest_fit,
                        learningFit: student.learning_fit,
                        availabilityFit: student.availability_fit,
                        explanations: student.explanations
                      })}
                      className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-[11px] font-mono font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      title="Click to view explanation"
                    >
                      {student.match_score}% Match
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-3 leading-snug">{student.headline}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{student.bio}</p>

                {/* Match Reason Banner */}
                {student.summary_explanation && (
                  <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300">
                    <p className="line-clamp-2 leading-snug">{student.summary_explanation}</p>
                  </div>
                )}

                {/* Skills I Can Offer */}
                <div className="mt-4 space-y-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Can Contribute</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {student.skills?.filter(s => s.can_contribute).map(s => (
                        <span key={s.skill_id} className="pixel-chip bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills I Want to Learn */}
                  {student.skills?.some(s => s.wants_to_learn) && (
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Learning Goals</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {student.skills?.filter(s => s.wants_to_learn).map(s => (
                          <span key={s.skill_id} className="pixel-chip bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {student.collaboration_mode} • ~{student.availability_hours}h/wk
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onOpenChatWithPeer?.({
                      user_id: student.user_id,
                      name: student.name,
                      college_short_name: student.college_short_name || student.college_name
                    })}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 transition"
                  >
                    💬 Chat
                  </button>
                  <button
                    onClick={() => setSelectedPeer(student)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-mono font-bold transition"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connection Request Modal */}
      {selectedPeer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 pixel-box">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Connect with {selectedPeer.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Send a collaboration invite to start exchanging skills or co-building.</p>

            <form onSubmit={handleSendConnection} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">Message</label>
                <textarea
                  rows={3}
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  placeholder="Hey, noticed you're working with PyTorch and interested in HealthTech..."
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:outline-none resize-none font-medium"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedPeer(null)}
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

      {/* Match Explanation Modal */}
      {selectedExplanation && (
        <MatchExplanationModal
          isOpen={true}
          onClose={() => setSelectedExplanation(null)}
          {...selectedExplanation}
        />
      )}
    </div>
  );
};
