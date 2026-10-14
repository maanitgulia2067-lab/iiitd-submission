import React, { useState } from 'react';
import { User, ProjectMatch } from '../types';

interface HomeDashboardProps {
  currentUser: User | null;
  onNavigate: (tab: string, entityId?: string) => void;
  onOpenChatWithPeer?: (peer: { user_id: string; name: string; college_short_name?: string }) => void;
  onExplainMatch?: (match: ProjectMatch) => void;
}

interface BuilderPost {
  id: string;
  authorId: string;
  authorName: string;
  authorCollege: string;
  authorRoleBadge: string;
  timeAgo: string;
  headline: string;
  body: string;
  metricsBadge: string;
  metricsHighlight: string;
  tags: string[];
  likes: number;
  comments: number;
  projectId?: string;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenChatWithPeer
}) => {
  const [filterMode, setFilterMode] = useState<'trending' | 'latest'>('trending');
  const [likedPosts, setLikedPosts] = useState<Record<string, number>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});

  // Spotlight carousel index
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  const spotlightCards = [
    {
      id: 'sp-1',
      title: 'MedScan AI — Vision Transformers on Clinical X-Rays',
      tag: '#ai-healthcare',
      colorClass: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50',
      tagClass: 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40',
      footer: 'IIT DELHI • RECRUITING BACKEND →',
      projectId: 'prj_medscan_01'
    },
    {
      id: 'sp-2',
      title: 'CampusCred — Cryptographic Proof of Student Contribution',
      tag: '#credentials',
      colorClass: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50',
      tagClass: 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40',
      footer: 'DTU • RECRUITING FRONTEND →',
      projectId: 'prj_campuscred_02'
    },
    {
      id: 'sp-3',
      title: 'HackShift 2026 — 24-Hour Inter-College Hackathon',
      tag: '#hackshift',
      colorClass: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50',
      tagClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40',
      footer: 'REGISTRATION OPEN • HYBRID →',
      tabTarget: 'events'
    }
  ];

  const initialPosts: BuilderPost[] = [
    {
      id: 'post-1',
      authorId: 'usr_priya_02',
      authorName: 'Priya Patel',
      authorCollege: 'IIT Delhi',
      authorRoleBadge: '[LEAD ARCHITECT]',
      timeAgo: '2h ago',
      headline: 'How we benchmarked Vision Transformers for 12-second anomaly screening in MedScan AI',
      body: 'Deploying edge models for clinic triage requires low memory footprints. We tested quantization pipelines on Raspberry Pi 4 and reduced latency from 1.8s to 120ms with zero loss in classification F1 score.',
      metricsBadge: '[BENCHMARK REPORT]',
      metricsHighlight: '<120ms LATENCY • 94.2% F1',
      tags: ['#pytorch', '#fastapi', '#cross-college', '#medtech'],
      likes: 1678,
      comments: 143,
      projectId: 'prj_medscan_01'
    },
    {
      id: 'post-2',
      authorId: 'usr_aarav_01',
      authorName: 'Aarav Sharma',
      authorCollege: 'DTU',
      authorRoleBadge: '[BACKEND LEAD]',
      timeAgo: '5h ago',
      headline: 'Architecting zero-knowledge student micro-credentials across 5 universities',
      body: 'CampusCred allows students to prove their pull requests, hackathon wins, and club memberships without leaking sensitive student IDs. Looking for a TypeScript/React developer to collaborate on the credential wallet UI!',
      metricsBadge: '[RFC ARCHITECTURE]',
      metricsHighlight: '5 COLLEGES • ED25519 KEYS',
      tags: ['#web3', '#cryptography', '#fastapi', '#recruiting'],
      likes: 1240,
      comments: 98,
      projectId: 'prj_campuscred_02'
    },
    {
      id: 'post-3',
      authorId: 'usr_rohan_03',
      authorName: 'Rohan Mehta',
      authorCollege: 'BITS Pilani',
      authorRoleBadge: '[DESIGN SYSTEMS]',
      timeAgo: '1d ago',
      headline: 'SignBridge shipped: Real-time sign language interpreter using WebAssembly and WebRTC',
      body: 'We partnered with IIIT Hyderabad researchers to run sign language pose-estimation in the browser at 60fps. The live demo is now accessible on the GroundUp showcase gallery.',
      metricsBadge: '[SHIPPED PRODUCT]',
      metricsHighlight: '60 FPS IN BROWSER • WEBRTC',
      tags: ['#showcase', '#webrtc', '#react', '#accessibility'],
      likes: 2190,
      comments: 245
    },
    {
      id: 'post-4',
      authorId: 'usr_vikram_05',
      authorName: 'Vikram Joshi',
      authorCollege: 'NSUT Delhi',
      authorRoleBadge: '[DEVOPS MENTOR]',
      timeAgo: '2d ago',
      headline: 'Setting up automated multi-stage CI/CD for student hackathon submissions',
      body: 'Offering free 1-on-1 mentorship on SkillShare to help project leads containerize their backend microservices with Docker Compose and GitHub Actions staging clusters.',
      metricsBadge: '[PEER TUTORIAL]',
      metricsHighlight: '100% FREE • SKILLSHARE',
      tags: ['#docker', '#kubernetes', '#peer-learning', '#mentorship'],
      likes: 890,
      comments: 42
    }
  ];

  const handleLike = (id: string, initialLikes: number) => {
    setLikedPosts(prev => ({
      ...prev,
      [id]: (prev[id] ?? initialLikes) + 1
    }));
  };

  const handleBookmark = (id: string) => {
    setBookmarkedPosts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* 1. CODE HEADLINE HERO (AWS Builder Center Spec)           */}
      {/* ========================================================= */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        {/* Interactive Syntax Block */}
        <div className="font-mono text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-purple-600 dark:text-purple-400">if </span>
            <span className="text-slate-900 dark:text-slate-100">building: </span>
            <span className="text-blue-600 dark:text-blue-400">start_here()</span>
          </div>
          {currentUser && (
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Builder: {currentUser.name} ({currentUser.college_short_name})
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          GroundUp Builder Center connects builders across university boundaries. Explore cross-campus research, recruit complementary engineering teammates, and ship tangible innovations together.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('buildspace')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-mono font-bold tracking-wide transition shadow-sm"
          >
            Build now &rarr;
          </button>
          <button
            onClick={() => onNavigate('simulator')}
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold border border-slate-300 dark:border-slate-700 transition"
          >
            Match Simulator (SRS 4.4)
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SPOTLIGHT ROW (Horizontal Carousel with < || >)        */}
      {/* ========================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              Spotlight
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              [CURATED BUILDS]
            </span>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center space-x-1 font-mono text-xs">
            <button
              onClick={() => setSpotlightIndex(prev => (prev === 0 ? spotlightCards.length - 1 : prev - 1))}
              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              &lt;
            </button>
            <span className="px-1 text-[11px] text-slate-400">||</span>
            <button
              onClick={() => setSpotlightIndex(prev => (prev === spotlightCards.length - 1 ? 0 : prev + 1))}
              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              &gt;
            </button>
          </div>
        </div>

        {/* 3 Prominent Cards Side-by-Side (h-176px) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {spotlightCards.map((card, idx) => (
            <div
              key={card.id}
              onClick={() => {
                if (card.projectId) onNavigate('workspace', card.projectId);
                else if (card.tabTarget) onNavigate(card.tabTarget);
              }}
              className={`h-[176px] p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-600 ${card.colorClass} ${
                spotlightIndex === idx ? 'ring-2 ring-slate-900 dark:ring-slate-100' : ''
              }`}
            >
              <div className="space-y-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${card.tagClass}`}>
                  {card.tag}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                  {card.title}
                </h3>
              </div>

              <div className="pt-2 border-t border-slate-200/40 dark:border-slate-700/40">
                <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 block">
                  {card.footer}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. EXPLORE STREAM (Continuous Deep Scrolling)             */}
      {/* ========================================================= */}
      <section className="space-y-4">
        {/* Pinned Subheader with Trending | Latest toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              Explore
            </h2>
            <span className="text-[10px] font-mono text-slate-400">
              Community Stream
            </span>
          </div>

          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
            <button
              onClick={() => setFilterMode('trending')}
              className={`px-3 py-1 rounded-md transition ${
                filterMode === 'trending'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setFilterMode('latest')}
              className={`px-3 py-1 rounded-md transition ${
                filterMode === 'latest'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Latest
            </button>
          </div>
        </div>

        {/* Social Builder Post Cards */}
        <div className="space-y-4">
          {initialPosts.map((post) => {
            const currentLikes = likedPosts[post.id] ?? post.likes;
            const isBookmarked = bookmarkedPosts[post.id] ?? false;

            return (
              <article
                key={post.id}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                {/* Author Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-mono font-bold flex items-center justify-center text-sm shrink-0">
                      {post.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-[13px] text-slate-900 dark:text-slate-100">
                          {post.authorName}
                        </span>
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {post.authorRoleBadge}
                        </span>
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          ✓ {post.authorCollege}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 mt-0.5 block">
                        {post.timeAgo}
                      </span>
                    </div>
                  </div>

                  {/* Connect / Chat Button */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onOpenChatWithPeer?.({
                        user_id: post.authorId,
                        name: post.authorName,
                        college_short_name: post.authorCollege
                      })}
                      className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                    >
                      💬 Chat
                    </button>
                    <button
                      onClick={() => onNavigate('discover')}
                      className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition"
                    >
                      + Connect
                    </button>
                  </div>
                </div>

                {/* Post Headline & Body + Embedded Thumbnail Card */}
                <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <h3
                      onClick={() => {
                        if (post.projectId) onNavigate('workspace', post.projectId);
                      }}
                      className="font-bold text-sm sm:text-[15px] text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer leading-snug"
                    >
                      {post.headline}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {post.body}
                    </p>
                  </div>

                  {/* Embedded Thumbnail Card (Fixed 176x96px) */}
                  <div className="w-full sm:w-[176px] h-[96px] rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-3 shrink-0 flex flex-col justify-between">
                    <span className="font-mono text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {post.metricsBadge}
                    </span>
                    <span className="font-mono text-[11px] font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {post.metricsHighlight}
                    </span>
                    <span className="font-mono text-[9px] text-blue-600 dark:text-blue-400">
                      View telemetry &rarr;
                    </span>
                  </div>
                </div>

                {/* Hashtag Rail */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {post.tags.map(t => (
                    <span
                      key={t}
                      className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Action Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(post.id, post.likes)}
                      className="flex items-center space-x-1.5 hover:text-slate-900 dark:hover:text-slate-100 transition"
                    >
                      <span>👍</span>
                      <span className="font-bold">{currentLikes}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (post.projectId) onNavigate('workspace', post.projectId);
                        else onNavigate('feed');
                      }}
                      className="flex items-center space-x-1.5 hover:text-slate-900 dark:hover:text-slate-100 transition"
                    >
                      <span>💬</span>
                      <span>{post.comments}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Link copied to clipboard!');
                        }
                      }}
                      className="hover:text-slate-900 dark:hover:text-slate-100 transition"
                    >
                      🔗 Share
                    </button>
                  </div>

                  <button
                    onClick={() => handleBookmark(post.id)}
                    className={`hover:text-slate-900 dark:hover:text-slate-100 transition ${
                      isBookmarked ? 'text-amber-600 dark:text-amber-400 font-bold' : ''
                    }`}
                  >
                    🔖 {isBookmarked ? 'Saved' : 'Bookmark'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

    </div>
  );
};
