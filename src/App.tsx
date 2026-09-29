import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { SupabaseSettingsModal } from './components/common/SupabaseSettingsModal';
import { AuthModal } from './pages/AuthModal';

// Student Pages
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { TimetablePage } from './pages/student/TimetablePage';
import { VenuesPage } from './pages/student/VenuesPage';
import { AnnouncementsPage } from './pages/student/AnnouncementsPage';
import { EventsPage } from './pages/student/EventsPage';
import { IssueReportingPage } from './pages/student/IssueReportingPage';
import { GmailInboxPage } from './pages/GmailInboxPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTimetableManage } from './pages/admin/AdminTimetableManage';
import { AdminHealthCheck } from './pages/admin/AdminHealthCheck';
import { AdminVenuesManage } from './pages/admin/AdminVenuesManage';
import { AdminAnnouncementsManage } from './pages/admin/AdminAnnouncementsManage';
import { AdminReportsManage } from './pages/admin/AdminReportsManage';
import { AdminStudentsList } from './pages/admin/AdminStudentsList';

import { Smartphone, Monitor, Shield, ArrowLeft } from 'lucide-react';

function MainApp() {
  const { isAuthenticated, isAdmin, currentUser, switchDemoUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [deviceSimulator, setDeviceSimulator] = useState<'responsive' | 'mobile'>('responsive');

  // Handle keyboard shortcut for search (Ctrl+K or Cmd+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (tab: string) => {
    // If student attempts to navigate to admin tab, guard it
    if (tab.startsWith('admin-') && !isAdmin) {
      setActiveTab('home');
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return (
          <LandingPage
            onGetStarted={() => handleNavigate('home')}
            onOpenAuth={() => setIsAuthOpen(true)}
            onNavigateTab={handleNavigate}
          />
        );
      case 'home':
      case 'dashboard':
        return <StudentDashboard onNavigateTab={handleNavigate} />;
      case 'timetable':
        return <TimetablePage />;
      case 'venues':
        return <VenuesPage />;
      case 'announcements':
        return <AnnouncementsPage />;
      case 'events':
        return <EventsPage />;
      case 'reports':
        return <IssueReportingPage />;
      case 'gmail':
      case 'mail':
        return <GmailInboxPage />;

      // Protected Admin Routes
      case 'admin-dashboard':
        return isAdmin ? (
          <AdminDashboard onNavigateTab={handleNavigate} />
        ) : (
          <StudentDashboard onNavigateTab={handleNavigate} />
        );
      case 'admin-timetable':
        return isAdmin ? (
          <AdminTimetableManage />
        ) : (
          <StudentDashboard onNavigateTab={handleNavigate} />
        );
      case 'admin-health':
        return isAdmin ? <AdminHealthCheck /> : <StudentDashboard onNavigateTab={handleNavigate} />;
      case 'admin-venues':
        return isAdmin ? <AdminVenuesManage /> : <StudentDashboard onNavigateTab={handleNavigate} />;
      case 'admin-announcements':
        return isAdmin ? (
          <AdminAnnouncementsManage />
        ) : (
          <StudentDashboard onNavigateTab={handleNavigate} />
        );
      case 'admin-reports':
        return isAdmin ? <AdminReportsManage /> : <StudentDashboard onNavigateTab={handleNavigate} />;
      case 'admin-students':
        return isAdmin ? <AdminStudentsList /> : <StudentDashboard onNavigateTab={handleNavigate} />;

      default:
        return <StudentDashboard onNavigateTab={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Testing Control Bar: Quick Role Switcher + Device Simulator Toggle */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 z-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-400">CampusEcho Demo Control:</span>
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => {
                switchDemoUser('student');
                handleNavigate('home');
              }}
              className={`px-2 py-0.5 rounded font-bold transition ${
                !isAdmin
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👨‍🎓 Student Role (Brian Mwangi)
            </button>
            <button
              onClick={() => {
                switchDemoUser('admin');
                handleNavigate('admin-dashboard');
              }}
              className={`px-2 py-0.5 rounded font-bold transition ${
                isAdmin
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛡️ Admin Role (Dr. Jane Kariuki)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Landing page link */}
          <button
            onClick={() => handleNavigate(activeTab === 'landing' ? 'home' : 'landing')}
            className="text-slate-400 hover:text-emerald-400 transition underline"
          >
            {activeTab === 'landing' ? 'Return to Portal' : 'View Public Landing Page'}
          </button>

          {/* Viewport simulator toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-[11px]">
            <button
              onClick={() => setDeviceSimulator('responsive')}
              className={`px-2 py-0.5 rounded flex items-center gap-1 transition ${
                deviceSimulator === 'responsive'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Responsive Web View"
            >
              <Monitor className="w-3 h-3" />
              <span>Web</span>
            </button>
            <button
              onClick={() => setDeviceSimulator('mobile')}
              className={`px-2 py-0.5 rounded flex items-center gap-1 transition ${
                deviceSimulator === 'mobile'
                  ? 'bg-slate-700 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile Device Simulator (Android / iOS)"
            >
              <Smartphone className="w-3 h-3" />
              <span>Mobile App</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main App Container (with optional Mobile Simulator Framing) */}
      <div
        className={
          deviceSimulator === 'mobile'
            ? 'flex-1 flex items-center justify-center p-4 bg-slate-800'
            : 'flex-1 flex flex-col'
        }
      >
        <div
          className={
            deviceSimulator === 'mobile'
              ? 'w-full max-w-[420px] h-[860px] bg-slate-50 rounded-[44px] shadow-2xl border-[10px] border-slate-950 overflow-hidden flex flex-col relative ring-1 ring-slate-700'
              : 'flex-1 flex flex-col'
          }
        >
          {/* Mobile phone camera notch when in simulator mode */}
          {deviceSimulator === 'mobile' && (
            <div className="w-full bg-slate-950 h-6 flex items-center justify-center shrink-0">
              <div className="w-24 h-4 bg-slate-950 rounded-b-xl flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-800 mr-2" />
                <div className="w-8 h-1 bg-slate-800 rounded-full" />
              </div>
            </div>
          )}

          {/* Navigation Bar */}
          <Navbar
            activeTab={activeTab}
            onNavigateTab={handleNavigate}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenSupabase={() => setIsSupabaseOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />

          {/* Subheader breadcrumb for Admin subpages */}
          {activeTab.startsWith('admin-') && (
            <div className="bg-amber-500/10 border-b border-amber-200/80 px-4 sm:px-8 py-2 text-xs flex items-center justify-between text-amber-950">
              <div className="flex items-center gap-2 font-bold">
                <Shield className="w-4 h-4 text-amber-700" />
                <span>Administrator Mode:</span>
                <span className="capitalize font-black text-amber-900">
                  {activeTab.replace('admin-', '')}
                </span>
              </div>
              <div className="flex items-center gap-3 font-semibold text-[11px]">
                <button
                  onClick={() => handleNavigate('admin-dashboard')}
                  className="hover:underline text-amber-900"
                >
                  Overview
                </button>
                <button
                  onClick={() => handleNavigate('admin-timetable')}
                  className="hover:underline text-amber-900"
                >
                  Schedule Class
                </button>
                <button
                  onClick={() => handleNavigate('admin-health')}
                  className="hover:underline text-amber-900"
                >
                  Health Check
                </button>
                <button
                  onClick={() => handleNavigate('admin-venues')}
                  className="hover:underline text-amber-900"
                >
                  Venues
                </button>
                <button
                  onClick={() => handleNavigate('admin-students')}
                  className="hover:underline text-amber-900"
                >
                  Students
                </button>
              </div>
            </div>
          )}

          {/* Page Content Body */}
          <main
            className={`flex-1 ${
              deviceSimulator === 'mobile'
                ? 'overflow-y-auto px-4 py-5'
                : 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6'
            }`}
          >
            {renderActivePage()}
          </main>

          {/* Footer (Full or hidden on mobile mode) */}
          {deviceSimulator !== 'mobile' && (
            <Footer onNavigateTab={handleNavigate} onOpenAuth={() => setIsAuthOpen(true)} />
          )}

          {/* Bottom Navigation for Mobile / Tablet Viewports */}
          <BottomNav activeTab={activeTab} onNavigateTab={handleNavigate} />
        </div>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateTab={handleNavigate}
      />

      <SupabaseSettingsModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}
