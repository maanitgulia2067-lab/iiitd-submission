import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface SkillSharePageProps {
  currentUser: User | null;
}

export const SkillSharePage: React.FC<SkillSharePageProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'partners' | 'offers' | 'requests'>('partners');
  const [partners, setPartners] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [guidanceMsg, setGuidanceMsg] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Form states
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Technical');
  const [newProficiency, setNewProficiency] = useState('Intermediate');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.getLearningPartners(),
      api.getSkillOffers(),
      api.getSkillRequests()
    ]).then(([pts, ofs, reqs]) => {
      setPartners(pts);
      setOffers(ofs);
      setRequests(reqs);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, [currentUser]);

  const handleSendGuidance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    try {
      await api.sendGuidanceRequest({
        recipient_id: selectedPartner.user_id,
        role_name: `Skill Guidance: ${selectedPartner.can_teach_skill}`,
        message: guidanceMsg.trim() || `Hi ${selectedPartner.name}, I would love to learn ${selectedPartner.can_teach_skill} from you!`
      });
      setFeedback(`Guidance request sent to ${selectedPartner.name}!`);
      setTimeout(() => setFeedback(null), 3500);
      setSelectedPartner(null);
      setGuidanceMsg('');
    } catch (e) {
      alert('Failed to send guidance request');
    }
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      await api.offerSkill({
        skill_name: newSkillName.trim(),
        category: newSkillCategory,
        proficiency: newProficiency
      });
      setFeedback(`Offered ${newSkillName.trim()} to teach!`);
      setTimeout(() => setFeedback(null), 3500);
      setShowOfferModal(false);
      setNewSkillName('');
      loadAll();
    } catch (e) {
      alert('Failed to offer skill');
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      await api.requestSkill({
        skill_name: newSkillName.trim(),
        category: newSkillCategory
      });
      setFeedback(`Posted guidance request for ${newSkillName.trim()}!`);
      setTimeout(() => setFeedback(null), 3500);
      setShowRequestModal(false);
      setNewSkillName('');
      loadAll();
    } catch (e) {
      alert('Failed to request guidance');
    }
  };

  return (
    <div className="space-y-6">
      {/* Reciprocal Protocol Syntax Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900 text-white dark:bg-slate-950 dark:border dark:border-slate-800 font-mono text-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 dark:border-slate-800/80 pb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span className="font-bold tracking-wider">[PROTOCOL: RECIPROCAL_PEER_EXCHANGE // SRS &sect;4.5]</span>
          </div>
          <span className="text-[11px] text-slate-400">ZERO_FEE &bull; BILATERAL_MATCHING</span>
        </div>
        <div className="text-[11px] text-slate-300 dark:text-slate-400 leading-relaxed overflow-x-auto">
          <code>def reciprocal_match(builder_a, builder_b): return (builder_a.offers in builder_b.learns) and (builder_b.offers in builder_a.learns)</code>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">SkillShare Exchange</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Section 4.5: Reciprocal knowledge exchange across campuses. Peer mentoring and co-learning.
          </p>
        </div>

        <div className="flex gap-2 self-start font-mono">
          <button
            onClick={() => setShowOfferModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-bold pixel-box transition"
          >
            + OFFER A SKILL (FR-037)
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold pixel-box transition"
          >
            + ASK GUIDANCE (FR-038)
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl font-mono flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="font-bold">&times;</button>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 font-mono text-xs">
        <button
          onClick={() => setActiveTab('partners')}
          className={`pb-3 px-4 font-bold transition border-b-2 ${
            activeTab === 'partners'
              ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          Suggested Learning Partners ({partners.length})
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={`pb-3 px-4 font-bold transition border-b-2 ${
            activeTab === 'offers'
              ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          Skills Offered to Teach ({offers.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-4 font-bold transition border-b-2 ${
            activeTab === 'requests'
              ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          Guidance Requested ({requests.length})
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-mono">Loading SkillShare connections...</div>
      ) : activeTab === 'partners' ? (
        <div className="space-y-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed pixel-box">
            <span className="font-bold font-mono">[RECIPROCAL LEARNING • FR-039] </span>
            The algorithm pairs students who can guide you in skills you want to learn, especially those who can also learn skills you offer!
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partners.map((p, idx) => (
              <div key={idx} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box hover:border-slate-400 dark:hover:border-slate-600 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded bg-slate-800 dark:bg-slate-700 text-white font-mono font-bold flex items-center justify-center text-sm">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{p.college_name}</p>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {p.explanation}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">Peer Exchange</span>
                  <button
                    onClick={() => setSelectedPartner(p)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-mono font-bold transition"
                  >
                    Request Guidance &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'offers' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((item, idx) => (
            <div key={idx} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">{item.skill_name}</span>
                <span className="pixel-chip bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {item.proficiency}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-semibold">{item.name}</p>
              <p className="text-slate-400 text-[11px] font-mono">{item.college_name} • {item.headline?.split(' ')[0]}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((item, idx) => (
            <div key={idx} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">{item.skill_name}</span>
                <span className="pixel-chip bg-slate-50 dark:bg-slate-800 text-slate-500 font-mono">
                  Seeking Guidance
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-semibold">{item.name}</p>
              <p className="text-slate-400 text-[11px] font-mono">{item.college_name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Guidance Request Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 pixel-box">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Request Guidance from {selectedPartner.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Learn {selectedPartner.can_teach_skill} through peer co-learning.</p>

            <form onSubmit={handleSendGuidance} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">Message</label>
                <textarea
                  rows={3}
                  value={guidanceMsg}
                  onChange={(e) => setGuidanceMsg(e.target.value)}
                  placeholder="Hey, I'd like to learn more about your experience with this skill..."
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 resize-none focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedPartner(null)}
                  className="px-4 py-2 text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-mono font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl"
                >
                  Send Guidance Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Skill Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 pixel-box">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Offer a Skill to Teach (FR-037)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Share your proficiency to guide fellow student builders.</p>

            <form onSubmit={handleOfferSubmit} className="mt-4 space-y-4 font-mono">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FastAPI, Flutter, Rust, UI/UX"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Design">Design</option>
                    <option value="Data">Data / ML</option>
                    <option value="Hardware">Hardware / Embedded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Proficiency</label>
                  <select
                    value={newProficiency}
                    onChange={(e) => setNewProficiency(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
                  >
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl"
                >
                  Publish Skill Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Skill Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 pixel-box">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Ask for Peer Skill Guidance (FR-038)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Post what you want to learn so peers can connect and teach you.</p>

            <form onSubmit={handleRequestSubmit} className="mt-4 space-y-4 font-mono">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skill You Want to Learn</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PyTorch, Kubernetes, Blender, Rust"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
                >
                  <option value="Technical">Technical</option>
                  <option value="Design">Design</option>
                  <option value="Data">Data / ML</option>
                  <option value="Hardware">Hardware / Embedded</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl"
                >
                  Post Learning Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
