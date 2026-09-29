import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Bell,
  Database,
  User,
  LogOut,
  Shield,
  Smartphone,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Notification } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface Props {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenSupabase: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onNavigateTab,
  onOpenSearch,
  onOpenSupabase,
  onOpenAuth,
}) => {
  const { currentUser, role, isAdmin, logout, switchDemoUser, isSupabaseLive } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const updateNotifs = () => {
      if (currentUser) {
        setNotifications(db.getNotifications(currentUser.id));
      } else {
        setNotifications([]);
      }
    };

    updateNotifs();
    const unsubscribe = db.subscribe(updateNotifs);
    return () => unsubscribe();
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = () => {
    if (currentUser) {
      db.markAllNotificationsAsRead(currentUser.id);
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    db.markNotificationAsRead(notif.id);
    if (notif.link_tab) {
      onNavigateTab(notif.link_tab);
    }
    setShowNotifDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20 group-hover:scale-105 transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                    Campus<span className="text-emerald-600">Echo</span>
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                    MUST
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                  Smart Campus Companion
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-6 text-xs font-semibold">
              <button
                onClick={() => onNavigateTab('home')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'home' || activeTab === 'dashboard'
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigateTab('timetable')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'timetable'
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Timetable
              </button>
              <button
                onClick={() => onNavigateTab('venues')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'venues'
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Venues
              </button>
              <button
                onClick={() => onNavigateTab('events')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'events'
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Events
              </button>
              <button
                onClick={() => onNavigateTab('announcements')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'announcements'
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Announcements
              </button>
              <button
                onClick={() => onNavigateTab('reports')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'reports'
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Report Issue
              </button>

              {isAdmin && (
                <button
                  onClick={() => onNavigateTab('admin-dashboard')}
                  className={`ml-2 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    activeTab.startsWith('admin-')
                      ? 'bg-amber-600 text-white font-bold shadow-sm'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </button>
              )}
            </nav>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 transition text-xs"
              title="Search Venues, Courses, Events"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden lg:inline text-[11px] font-medium text-slate-400">Search campus...</span>
              <kbd className="hidden lg:inline px-1.5 py-0.5 text-[9px] font-bold bg-white text-slate-400 border border-slate-200 rounded">
                ⌘K
              </kbd>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton variant="compact" />

            {/* Supabase Connection Status Pill */}
            <button
              onClick={onOpenSupabase}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isSupabaseLive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Supabase PostgreSQL Settings & Schema"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Supabase</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  setShowUserDropdown(false);
                }}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white ring-2 ring-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">Notifications</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {unreadCount} new
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-emerald-700 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                            !n.is_read ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {n.type === 'conflict_alert' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-xs leading-tight mb-0.5">
                              {n.title}
                            </p>
                            <p className="text-slate-600 text-[11px] line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserDropdown(!showUserDropdown);
                    setShowNotifDropdown(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-2xs ${
                      isAdmin ? 'bg-amber-600' : 'bg-emerald-600'
                    }`}
                  >
                    {currentUser.full_name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <p className="font-bold text-slate-800 leading-tight">
                      {currentUser.full_name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">{currentUser.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in">
                    <div className="p-3 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                      <p className="font-bold text-xs text-slate-900">{currentUser.full_name}</p>
                      <p className="text-[11px] text-slate-500 break-all">{currentUser.email}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isAdmin ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {currentUser.role}
                        </span>
                        {currentUser.student_id && (
                          <span className="text-[10px] font-mono text-slate-500">
                            {currentUser.student_id}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Role quick switch for testing */}
                    <div className="p-2 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Switch Demo Role:
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <button
                          onClick={() => {
                            switchDemoUser('student');
                            setShowUserDropdown(false);
                            onNavigateTab('home');
                          }}
                          className={`py-1.5 px-2 rounded-lg font-bold border transition ${
                            !isAdmin
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          👨‍🎓 Student
                        </button>
                        <button
                          onClick={() => {
                            switchDemoUser('admin');
                            setShowUserDropdown(false);
                            onNavigateTab('admin-dashboard');
                          }}
                          className={`py-1.5 px-2 rounded-lg font-bold border transition ${
                            isAdmin
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          🛡️ Admin
                        </button>
                      </div>
                    </div>

                    <div className="space-y-0.5 text-xs mt-1">
                      <button
                        onClick={() => {
                          onOpenSupabase();
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-left"
                      >
                        <Database className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Supabase Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-left font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
