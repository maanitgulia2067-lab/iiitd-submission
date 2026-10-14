import React, { useState, useEffect, useRef } from 'react';
import { User, NotificationItem } from '../types';
import { api, setAuthToken } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string, entityId?: string) => void;
  currentUser: User | null;
  onUserSwitch: (user: User) => void;
  onSearch?: (query: string) => void;
  onOpenCreateProject?: () => void;
  onOpenOfferSkill?: () => void;
  onOpenPublishEvent?: () => void;
  onOpenRegisterStudent?: () => void;
  onOpenChatWithPeer?: (peer: { user_id: string; name: string; college_short_name?: string }) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onUserSwitch,
  onSearch,
  onOpenCreateProject,
  onOpenOfferSkill,
  onOpenPublishEvent,
  onOpenRegisterStudent,
  onOpenChatWithPeer
}) => {
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown states
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showSideDrawer, setShowSideDrawer] = useState(false);

  const { theme, setTheme } = useTheme();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getDemoUsers().then(setDemoUsers).catch(() => {});
    if (currentUser) {
      api.getNotifications().then(setNotifications).catch(() => {});
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setShowCreateMenu(false);
        setShowNotifMenu(false);
        setShowSettingsMenu(false);
        setShowAppSwitcher(false);
        setShowPersonaMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read_status).length;

  const handleSelectUser = (u: User) => {
    setAuthToken(u.user_id);
    onUserSwitch(u);
    setShowPersonaMenu(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    setCurrentTab('builders');
  };

  // Row 2 Navigation link pills
  const navPills = [
    { id: 'feed', label: 'Feed' },
    { id: 'simulator', label: 'Simulator' },
    { id: 'builders', label: 'Builders' },
    { id: 'buildspace', label: 'BuildSpace' },
    { id: 'myprojects', label: 'My Projects' },
    { id: 'skillshare', label: 'SkillShare' },
    { id: 'events', label: 'Events' },
    { id: 'clubs', label: 'Clubs' },
    { id: 'showcase', label: 'Showcase' },
  ];

  return (
    <div ref={navRef} className="sticky top-0 z-40 w-full transition-colors font-sans shadow-2xs">
      {/* ========================================================= */}
      {/* MODE 1: CLEAN LANDING PAGE HEADER (Non-Clashing)          */}
      {/* ========================================================= */}
      {currentTab === 'landing' ? (
        <header className="h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
            
            {/* Brand Monogram */}
            <div
              onClick={() => setCurrentTab('landing')}
              className="flex items-center space-x-2.5 cursor-pointer group select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-mono text-xs font-black shadow-xs">
                ▲
              </div>
              <div>
                <span className="font-extrabold text-[16px] tracking-tight text-slate-900 dark:text-slate-100">
                  GroundUp
                </span>
                <span className="block text-[8px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider -mt-0.5">
                  Student Collaboration Platform
                </span>
              </div>
            </div>

            {/* Quiet Centered Links */}
            <div className="hidden md:flex items-center space-x-6 text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
              <button
                onClick={() => setCurrentTab('landing')}
                className="text-slate-900 dark:text-slate-100 font-bold hover:text-slate-900"
              >
                Overview
              </button>
              <button
                onClick={() => setCurrentTab('simulator')}
                className="hover:text-slate-900 dark:hover:text-slate-100 transition"
              >
                Match Simulator
              </button>
              <button
                onClick={() => setCurrentTab('builders')}
                className="hover:text-slate-900 dark:hover:text-slate-100 transition"
              >
                Builders Directory
              </button>
              <button
                onClick={() => setCurrentTab('buildspace')}
                className="hover:text-slate-900 dark:hover:text-slate-100 transition"
              >
                Active Builds
              </button>
            </div>

            {/* Right: Theme Switcher & Launch Button */}
            <div className="flex items-center space-x-3">
              {/* 3-Way Theme toggle (Light / Dark / System) */}
              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-2 py-1 rounded transition ${
                    theme === 'light'
                      ? 'bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                  title="Light mode"
                >
                  ☀️ Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-2 py-1 rounded transition ${
                    theme === 'dark'
                      ? 'bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                  title="Dark mode"
                >
                  🌙 Dark
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`px-2 py-1 rounded transition ${
                    theme === 'system'
                      ? 'bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                  title="System mode"
                >
                  💻 System
                </button>
              </div>

              {/* Persona Pill */}
              <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>{currentUser?.name?.split(' ')[0] || 'Aarav'} ({currentUser?.college_short_name || 'DTU'})</span>
              </div>

              {/* Pop up to Builder Center */}
              <button
                onClick={() => setCurrentTab('feed')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-mono font-bold tracking-wide transition shadow-sm flex items-center space-x-1.5"
              >
                <span>Launch Builder Center</span>
                <span>&rarr;</span>
              </button>
            </div>

          </div>
        </header>
      ) : (
        /* ========================================================= */
        /* MODE 2: ACTIVE BUILDER CENTER 2-ROW TOP BAR               */
        /* ========================================================= */
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          {/* ROW 1: TOP UTILITY BAR (h-14, 56px) */}
          <div className="h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
              
              {/* Brand Monogram (Left) */}
              <div
                onClick={() => setCurrentTab('landing')}
                className="flex items-center space-x-2.5 cursor-pointer shrink-0 group select-none"
                title="Return to Landing Overview"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-950 border border-slate-700/80 flex items-center justify-center text-white font-mono text-xs shadow-xs group-hover:border-slate-500 transition">
                  ▲
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-[15px] tracking-tight text-slate-900 dark:text-slate-100">
                    GroundUp
                  </span>
                  <span className="hidden sm:inline-block font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    [BUILDER CENTER]
                  </span>
                </div>
              </div>

              {/* Centered Global Search Input (Capsule shape, max 480px, h-34px) */}
              <form onSubmit={handleSearchSubmit} className="flex-1 max-w-[480px] hidden md:block">
                <div className="relative flex items-center w-full">
                  <span className="absolute left-3.5 text-slate-400 text-xs pointer-events-none">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search builders, active builds, tags, tech stacks..."
                    className="w-full h-[34px] pl-9 pr-4 text-xs rounded-full bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-slate-400 dark:focus:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition"
                  />
                </div>
              </form>

              {/* Feature Action Bar (Right Side: 5 Touch Targets) */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                
                {/* 1. [+] Create Action Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowCreateMenu(!showCreateMenu);
                      setShowNotifMenu(false);
                      setShowSettingsMenu(false);
                      setShowAppSwitcher(false);
                      setShowPersonaMenu(false);
                    }}
                    title="Create New Action"
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition"
                  >
                    +
                  </button>
                  {showCreateMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <button
                        onClick={() => {
                          setShowCreateMenu(false);
                          onOpenCreateProject?.();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-mono rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center space-x-2"
                      >
                        <span>🛠️</span>
                        <span>+ New Project (BuildSpace)</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateMenu(false);
                          onOpenOfferSkill?.();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-mono rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center space-x-2"
                      >
                        <span>🎓</span>
                        <span>+ Offer a Skill (SkillShare)</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateMenu(false);
                          onOpenPublishEvent?.();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-mono rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center space-x-2"
                      >
                        <span>🏆</span>
                        <span>+ Publish Event / Hackathon</span>
                      </button>
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>
                      <button
                        onClick={() => {
                          setShowCreateMenu(false);
                          onOpenRegisterStudent?.();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-mono font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center space-x-2"
                      >
                        <span>👤</span>
                        <span>+ Register New Student [DB]</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. [🔔] Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifMenu(!showNotifMenu);
                      setShowCreateMenu(false);
                      setShowSettingsMenu(false);
                      setShowAppSwitcher(false);
                      setShowPersonaMenu(false);
                    }}
                    title="Notifications"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm relative transition"
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[9px] font-mono font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifMenu && (
                    <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                          [NOTIFICATIONS]
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {unreadCount} unread
                        </span>
                      </div>
                      <div className="max-h-60 overflow-y-auto mt-2 space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-400 py-3 text-center font-mono">No notifications</p>
                        ) : (
                          notifications.slice(0, 6).map(n => (
                            <div
                              key={n.notification_id}
                              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-tight"
                            >
                              <p>{n.message}</p>
                              <span className="text-[9px] font-mono text-slate-400 mt-1 block">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. [⚙️] Settings & Theme */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSettingsMenu(!showSettingsMenu);
                      setShowCreateMenu(false);
                      setShowNotifMenu(false);
                      setShowAppSwitcher(false);
                      setShowPersonaMenu(false);
                    }}
                    title="Settings & Appearance"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition"
                  >
                    ⚙️
                  </button>
                  {showSettingsMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <p className="text-[10px] font-mono uppercase font-bold text-slate-400 mb-2 px-1">
                        Appearance Mode
                      </p>
                      <div className="space-y-1">
                        {[
                          { id: 'light', label: '☀️ Light' },
                          { id: 'dark', label: '🌙 Dark' },
                          { id: 'system', label: '💻 System' },
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setTheme(opt.id as any);
                              setShowSettingsMenu(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                              theme === opt.id
                                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {theme === opt.id && <span className="text-[10px]">●</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. [⊞] Workspace App Switcher */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowAppSwitcher(!showAppSwitcher);
                      setShowCreateMenu(false);
                      setShowNotifMenu(false);
                      setShowSettingsMenu(false);
                      setShowPersonaMenu(false);
                    }}
                    title="Workspace App Switcher"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-mono transition"
                  >
                    ⊞
                  </button>
                  {showAppSwitcher && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-2 px-1">
                        Workspace Apps
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'buildspace', icon: '🛠️', label: 'BuildSpace' },
                          { id: 'skillshare', icon: '🎓', label: 'SkillShare' },
                          { id: 'events', icon: '🏆', label: 'Opportunities' },
                          { id: 'clubs', icon: '🏛️', label: 'Clubs' },
                          { id: 'myprojects', icon: '📂', label: 'My Projects' },
                          { id: 'showcase', icon: '⭐', label: 'Showcase' },
                        ].map(app => (
                          <button
                            key={app.id}
                            onClick={() => {
                              setCurrentTab(app.id);
                              setShowAppSwitcher(false);
                            }}
                            className="p-2 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-2"
                          >
                            <span className="text-sm">{app.icon}</span>
                            <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                              {app.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Persona Pill / Avatar (1-Click Switcher) */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowPersonaMenu(!showPersonaMenu);
                      setShowCreateMenu(false);
                      setShowNotifMenu(false);
                      setShowSettingsMenu(false);
                      setShowAppSwitcher(false);
                    }}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    <div className="w-[22px] h-[22px] rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[10px] font-mono font-bold flex items-center justify-center">
                      {currentUser?.name?.charAt(0) || 'A'}
                    </div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 hidden sm:inline-block">
                      {currentUser?.name?.split(' ')[0] || 'Aarav'}
                    </span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </button>

                  {showPersonaMenu && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                          Active Student Session
                        </span>
                        <p className="font-bold text-xs text-slate-900 dark:text-slate-100 mt-0.5">
                          {currentUser?.name}
                        </p>
                        <span className="text-[10px] font-mono text-slate-500">
                          {currentUser?.college_short_name} • {currentUser?.collaboration_mode}
                        </span>
                      </div>
                      <div className="py-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 px-2 py-1 block">
                          Switch Persona:
                        </span>
                        {demoUsers.map(u => (
                          <button
                            key={u.user_id}
                            onClick={() => handleSelectUser(u)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                              currentUser?.user_id === u.user_id
                                ? 'bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span>{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {u.college_short_name}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setShowPersonaMenu(false);
                            setCurrentTab('profile');
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                          View & Edit Profile →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* ROW 2: SUBHEADER BAR (h-11, 44px) */}
          <div className="h-11 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
              
              {/* Page Identity (Left) */}
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-[15px] font-bold text-slate-900 dark:text-slate-100 tracking-tight font-mono">
                  Builder Center
                </span>
                <span className="hidden sm:inline-block font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  [CROSS-COLLEGE]
                </span>
              </div>

              {/* Navigation Link Pills (Center) */}
              <nav className="hidden lg:flex items-center space-x-1 overflow-x-auto py-1">
                {navPills.map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setCurrentTab(pill.id)}
                    className={`px-3 py-1 rounded-md text-[11px] font-mono font-semibold transition ${
                      currentTab === pill.id
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </nav>

              {/* Top-Right Menu Button (`MENU ≡`) */}
              <div className="shrink-0">
                <button
                  onClick={() => setShowSideDrawer(true)}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 transition flex items-center space-x-1.5"
                >
                  <span>MENU</span>
                  <span>≡</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SLIDE-OVER SIDE DRAWER (`≡ MENU`)                          */}
      {/* ========================================================= */}
      {showSideDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div
            onClick={() => setShowSideDrawer(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xs transition-opacity"
          />

          <div className="relative w-80 max-w-full h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10">
            <div className="space-y-6">
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="font-mono text-xs font-bold uppercase text-slate-900 dark:text-slate-100">
                  [PAGES DIRECTORY]
                </span>
                <button
                  onClick={() => setShowSideDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {/* Active User Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-mono font-bold flex items-center justify-center text-sm">
                    {currentUser?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {currentUser?.name}
                    </p>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      ✓ {currentUser?.college_short_name} • {currentUser?.collaboration_mode}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSideDrawer(false);
                    setCurrentTab('profile');
                  }}
                  className="w-full mt-3 py-1.5 text-center text-[11px] font-mono font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 transition"
                >
                  PROFILE →
                </button>
              </div>

              {/* Categorized Page List */}
              <div className="space-y-5">
                {/* 01. Builder Spaces */}
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block mb-2">
                    01. Builder Spaces
                  </span>
                  <div className="space-y-1">
                    {[
                      { id: 'feed', icon: '🏠', label: 'Builder Feed', badge: '[TRENDING]' },
                      { id: 'simulator', icon: '🚀', label: 'Match Simulator', badge: '[SRS 4.4]' },
                      { id: 'builders', icon: '🔍', label: 'Discover Builders', badge: '[PEERS]' },
                      { id: 'buildspace', icon: '🛠️', label: 'BuildSpace Projects', badge: '[BUILDS]' },
                      { id: 'myprojects', icon: '📂', label: 'My Projects', badge: '[LEADS]' },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setShowSideDrawer(false);
                          setCurrentTab(item.id);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                          currentTab === item.id
                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                        <span className="text-[9px] opacity-60">{item.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 02. Learning & Community */}
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block mb-2">
                    02. Learning & Community
                  </span>
                  <div className="space-y-1">
                    {[
                      { id: 'skillshare', icon: '🎓', label: 'SkillShare Network', badge: '[EXCHANGE]' },
                      { id: 'events', icon: '🏆', label: 'Opportunity Hub', badge: '[HACKATHONS]' },
                      { id: 'clubs', icon: '🏛️', label: 'Campus Clubs', badge: '[SOCIETIES]' },
                      { id: 'showcase', icon: '⭐', label: 'Project Showcase', badge: '[SHIPPED]' },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setShowSideDrawer(false);
                          setCurrentTab(item.id);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                          currentTab === item.id
                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                        <span className="text-[9px] opacity-60">{item.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 03. Communication & Tools */}
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block mb-2">
                    03. Communication & Tools
                  </span>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setShowSideDrawer(false);
                        onOpenChatWithPeer?.({
                          user_id: 'usr_priya_02',
                          name: 'Priya Patel',
                          college_short_name: 'IIT Delhi'
                        });
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between"
                    >
                      <span className="flex items-center space-x-2">
                        <span>💬</span>
                        <span>Direct Messages</span>
                      </span>
                      <span className="text-[9px] opacity-60">[CHATS]</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowSideDrawer(false);
                        setCurrentTab('profile');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between"
                    >
                      <span className="flex items-center space-x-2">
                        <span>👤</span>
                        <span>My Profile</span>
                      </span>
                      <span className="text-[9px] opacity-60">[SETTINGS]</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowSideDrawer(false);
                        onOpenRegisterStudent?.();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between"
                    >
                      <span className="flex items-center space-x-2">
                        <span>+</span>
                        <span>Register New Student</span>
                      </span>
                      <span className="text-[9px] font-bold text-slate-500">[DB]</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-400">
              GroundUp Builder Center • Cross-College Edition
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
