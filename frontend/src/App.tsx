import React, { useState, useEffect } from 'react';
import { User, College } from './types';
import { api, setAuthToken } from './services/api';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { RegisterStudentModal } from './components/RegisterStudentModal';
import { DirectChatModal } from './components/DirectChatModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { HomeDashboard } from './pages/HomeDashboard';
import { DiscoverStudents } from './pages/DiscoverStudents';
import { BuildSpace } from './pages/BuildSpace';
import { MyProjectsPage } from './pages/MyProjectsPage';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { SkillSharePage } from './pages/SkillSharePage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { ShowcasePage } from './pages/ShowcasePage';
import { StudentProfile } from './pages/StudentProfile';

const AppContent: React.FC = () => {
  // Start on clean Landing Page as requested
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('prj_medscan_01');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);

  // Modals state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [chatPeer, setChatPeer] = useState<{ user_id: string; name: string; college_short_name?: string } | null>(null);

  const fetchUser = async () => {
    try {
      const [u, demos, colls] = await Promise.all([
        api.getCurrentUser(),
        api.getDemoUsers(),
        api.getColleges()
      ]);
      setCurrentUser(u);
      setDemoUsers(demos);
      setColleges(colls);
    } catch (e) {
      console.error('Failed to load user', e);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleNavigate = (tab: string, entityId?: string) => {
    if (tab === 'workspace' && entityId) {
      setSelectedProjectId(entityId);
    }
    // Handle tab alias mappings
    if (tab === 'dashboard') setCurrentTab('feed');
    else if (tab === 'discover') setCurrentTab('builders');
    else if (tab === 'opportunities') setCurrentTab('events');
    else if (tab === 'communities') setCurrentTab('clubs');
    else setCurrentTab(tab);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserSwitch = (user: User) => {
    setAuthToken(user.user_id);
    setCurrentUser(user);
    fetchUser();
  };

  const handleUserRegistered = (newUser: User) => {
    setCurrentUser(newUser);
    fetchUser();
    setCurrentTab('feed');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleNavigate}
        currentUser={currentUser}
        onUserSwitch={handleUserSwitch}
        onOpenCreateProject={() => handleNavigate('buildspace')}
        onOpenOfferSkill={() => handleNavigate('skillshare')}
        onOpenPublishEvent={() => handleNavigate('events')}
        onOpenRegisterStudent={() => setShowRegisterModal(true)}
        onOpenChatWithPeer={peer => setChatPeer(peer)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loadingUser ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-2 font-mono">
              <div className="w-8 h-8 border-2 border-slate-900 dark:border-slate-100 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Connecting to GroundUp Builder Center...</p>
            </div>
          </div>
        ) : (
          <>
            {/* 1. Feed / Home (AWS Builder Center Spec) */}
            {(currentTab === 'feed' || currentTab === 'dashboard') && (
              <HomeDashboard
                currentUser={currentUser}
                onNavigate={handleNavigate}
                onOpenChatWithPeer={peer => setChatPeer(peer)}
              />
            )}

            {/* 2. Clean Landing Page */}
            {currentTab === 'landing' && (
              <LandingPage
                onNavigate={handleNavigate}
                currentUser={currentUser}
                onUserSwitch={handleUserSwitch}
                demoUsers={demoUsers}
                mode="landing"
              />
            )}

            {/* 3. Simulator (SRS 4.4 Simulation Engine) */}
            {currentTab === 'simulator' && (
              <LandingPage
                onNavigate={handleNavigate}
                currentUser={currentUser}
                onUserSwitch={handleUserSwitch}
                demoUsers={demoUsers}
                mode="simulator"
              />
            )}

            {/* 3. Builders / Discover */}
            {(currentTab === 'builders' || currentTab === 'discover') && (
              <DiscoverStudents
                currentUser={currentUser}
                onOpenChatWithPeer={peer => setChatPeer(peer)}
              />
            )}

            {/* 4. BuildSpace */}
            {currentTab === 'buildspace' && (
              <BuildSpace
                currentUser={currentUser}
                onNavigate={handleNavigate}
              />
            )}

            {/* 5. My Projects */}
            {currentTab === 'myprojects' && (
              <MyProjectsPage
                currentUser={currentUser}
                onNavigate={handleNavigate}
              />
            )}

            {/* 6. Workspace */}
            {currentTab === 'workspace' && (
              <ProjectWorkspace
                projectId={selectedProjectId}
                currentUser={currentUser}
                onBack={() => setCurrentTab('buildspace')}
              />
            )}

            {/* 7. SkillShare */}
            {currentTab === 'skillshare' && (
              <SkillSharePage
                currentUser={currentUser}
              />
            )}

            {/* 8. Events / Opportunity Hub */}
            {(currentTab === 'events' || currentTab === 'opportunities') && (
              <OpportunitiesPage
                onNavigate={handleNavigate}
              />
            )}

            {/* 9. Clubs / Communities */}
            {(currentTab === 'clubs' || currentTab === 'communities') && (
              <CommunitiesPage />
            )}

            {/* 10. Showcase */}
            {currentTab === 'showcase' && (
              <ShowcasePage />
            )}

            {/* 11. Profile */}
            {currentTab === 'profile' && (
              <StudentProfile
                currentUser={currentUser}
                onProfileUpdated={fetchUser}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <RegisterStudentModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onUserRegistered={handleUserRegistered}
        colleges={colleges}
      />

      <DirectChatModal
        isOpen={Boolean(chatPeer)}
        onClose={() => setChatPeer(null)}
        peer={chatPeer}
        currentUser={currentUser}
      />

      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};
