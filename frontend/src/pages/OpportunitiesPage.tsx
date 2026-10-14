import React, { useState, useEffect } from 'react';
import { EventItem } from '../types';
import { api } from '../services/api';

interface OpportunitiesPageProps {
  onNavigate?: (tab: string, entityId?: string) => void;
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({ onNavigate }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cc_bookmarks') || '[]');
    } catch {
      return [];
    }
  });
  const [onlySaved, setOnlySaved] = useState(false);

  // New Event Modal (FR-048)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Hackathon');
  const [newDesc, setNewDesc] = useState('');
  const [newStart, setNewStart] = useState('2026-11-20');
  const [newVenue, setNewVenue] = useState('Online / Campus Hybrid');
  const [newMode, setNewMode] = useState('Online');
  const [newRegUrl, setNewRegUrl] = useState('');
  const [newDeadline, setNewDeadline] = useState('2026-11-18');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchEvents = () => {
    setLoading(true);
    api.getEvents().then(setEvents).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const toggleBookmark = (id: string) => {
    let updated: string[];
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter(x => x !== id);
    } else {
      updated = [...bookmarkedIds, id];
    }
    setBookmarkedIds(updated);
    localStorage.setItem('cc_bookmarks', JSON.stringify(updated));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.createEvent({
        title: newTitle.trim(),
        category: newCategory,
        description: newDesc.trim(),
        start_time: newStart,
        venue: newVenue,
        mode: newMode,
        eligibility: 'Open to all college students',
        registration_url: newRegUrl.trim(),
        deadline: newDeadline
      });
      setFeedback(`Published ${newTitle.trim()} to Opportunity Hub!`);
      setTimeout(() => setFeedback(null), 3500);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      fetchEvents();
    } catch (e) {
      alert('Failed to publish event');
    }
  };

  const handleRecruitTeam = (_evt: EventItem) => {
    if (onNavigate) {
      onNavigate('buildspace');
    }
  };

  const filteredEvents = events.filter((evt) => {
    if (onlySaved && !bookmarkedIds.includes(evt.event_id)) return false;
    if (selectedCategory !== 'all' && evt.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (selectedMode !== 'all' && evt.mode.toLowerCase() !== selectedMode.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        evt.venue.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Sprint Radar Telemetry Banner */}
      <div className="p-3 rounded-xl bg-slate-900 text-white dark:bg-slate-950 dark:border dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="font-bold tracking-wider">[EVENT_RADAR // SPRINT_CALENDAR]</span>
          <span className="text-slate-400 hidden sm:inline">&bull; Hackathons &amp; Design Sprints</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] text-slate-300 dark:text-slate-400">
          <span>UPCOMING: <strong className="text-white">HACKSHIFT 2026</strong></span>
          <span>REGISTRATION: <strong className="text-white">OPEN</strong></span>
          <span>ELIGIBILITY: <strong className="text-white">CROSS-COLLEGE</strong></span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Opportunity Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Section 4.7: Hackathons, datathons, and student competitions. Recruit balanced teams and track registration deadlines.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-mono font-bold pixel-box transition self-start"
        >
          + POST OPPORTUNITY (FR-048)
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl font-mono flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="font-bold">&times;</button>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 pixel-box flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search opportunities by keyword, topic, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap gap-2 font-mono">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="hackathon">Hackathon</option>
            <option value="competition">Competition</option>
            <option value="workshop">Workshop</option>
          </select>

          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Modes</option>
            <option value="online">Online</option>
            <option value="in-person">In-Person</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <button
            onClick={() => setOnlySaved(!onlySaved)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              onlySaved
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            ★ Bookmarked ({bookmarkedIds.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-mono">Loading collegiate opportunities...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 pixel-box">
          No opportunities match your filter. Check back soon or publish an initiative!
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((evt) => (
            <div
              key={evt.event_id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 pixel-box hover:border-slate-400 dark:hover:border-slate-600 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center space-x-2">
                  <span className="pixel-chip bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {evt.category}
                  </span>
                  <span className="pixel-chip bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {evt.mode}
                  </span>
                  {evt.deadline && (
                    <span className="pixel-chip bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                      Deadline: {evt.deadline}
                    </span>
                  )}
                  <button
                    onClick={() => toggleBookmark(evt.event_id)}
                    className="text-xs p-1 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
                    title={bookmarkedIds.includes(evt.event_id) ? "Remove Bookmark" : "Save Opportunity"}
                  >
                    {bookmarkedIds.includes(evt.event_id) ? '★ Saved' : '☆ Save'}
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{evt.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{evt.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                  <span>📅 Starts: {evt.start_time}</span>
                  <span>📍 Venue: {evt.venue}</span>
                  <span>🎓 {evt.eligibility}</span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2 font-mono">
                {evt.registration_url && (
                  <a
                    href={evt.registration_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-bold text-center pixel-box transition"
                  >
                    Apply / Register &rarr;
                  </a>
                )}
                <button
                  onClick={() => handleRecruitTeam(evt)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold text-center pixel-box transition"
                >
                  Recruit Team on BuildSpace
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Opportunity Modal (FR-048) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 pixel-box font-mono animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Publish Collegiate Opportunity (FR-048)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">List hackathons, competitions, or workshops for students across campuses.</p>

            <form onSubmit={handleCreateEvent} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Opportunity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Inter-College AI HackShift 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Competition">Competition</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Datathon">Datathon</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mode</label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
                  >
                    <option value="Online">Online</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description & Tracks</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail the themes, prize format, and guidelines..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Venue / Platform</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Campus Auditorium / Virtual Discord"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Registration Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Registration URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newRegUrl}
                  onChange={(e) => setNewRegUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl"
                >
                  Publish Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
