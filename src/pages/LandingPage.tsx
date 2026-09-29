import React from 'react';
import {
  CalendarDays,
  MapPin,
  Bell,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Shield,
  Smartphone,
  CheckCircle,
  Users,
  Compass,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from '../components/common/PWAInstallButton';

interface Props {
  onGetStarted: () => void;
  onOpenAuth: () => void;
  onNavigateTab: (tab: string) => void;
}

export const LandingPage: React.FC<Props> = ({ onGetStarted, onOpenAuth, onNavigateTab }) => {
  const { switchDemoUser } = useAuth();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 text-white p-6 sm:p-12 lg:p-16 shadow-2xl border border-emerald-800/40">
        {/* Decorative backdrop elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart University Companion</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
                Campus<span className="text-emerald-400">Echo</span>
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-emerald-200">
                Your Campus Companion.
              </p>
            </div>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              No more tussles in your day life as a comrade in MUST. CampusEcho got you... Access
              smart timetables, real-time venue collision detection, instant campus announcements,
              and seamless event updates all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onGetStarted}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition flex items-center gap-2 group cursor-pointer"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={onOpenAuth}
                className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-sm transition cursor-pointer"
              >
                Sign In / Portal
              </button>

              <PWAInstallButton variant="compact" className="py-3 px-4 text-xs font-bold" />
            </div>

            {/* Quick Demo Shortcuts */}
            <div className="pt-4 border-t border-emerald-800/60 flex items-center gap-4 text-xs text-emerald-300/80">
              <span className="font-semibold text-white">Instant Demo:</span>
              <button
                onClick={() => {
                  switchDemoUser('student');
                  onGetStarted();
                }}
                className="underline hover:text-white"
              >
                Launch Student Dashboard
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  switchDemoUser('admin');
                  onNavigateTab('admin-dashboard');
                }}
                className="underline hover:text-white"
              >
                Launch Admin Console
              </button>
            </div>
          </div>

          {/* Hero Visual Mockup Representation */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 rounded-2xl p-5 border border-emerald-500/30 shadow-2xl space-y-4 backdrop-blur-md">
              {/* Mock Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-mono text-slate-400 ml-2">campusecho.must.ac.ke</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Live Sync
                </span>
              </div>

              {/* Sample Class Card */}
              <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Today's Class • 10:00 AM
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                    In Progress
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">Database Systems & Architecture</h4>
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>📍 Science Complex — Lab 3</span>
                  <span>Dr. Evans Otieno</span>
                </div>
              </div>

              {/* Live Collision Prevention Banner */}
              <div className="bg-amber-950/80 border border-amber-500/50 rounded-xl p-3 text-xs text-amber-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Venue Collision Guard Active</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-tight">
                  Automatically flags when Lab 3 is double-booked and offers smart alternatives like Lab 2 & Room 204.
                </p>
              </div>

              {/* Mini Venue Status */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-300">Lab 3 (Science)</span>
                  <span className="text-[10px] font-bold text-amber-400">Occupied</span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-300">Room 204 (Eng)</span>
                  <span className="text-[10px] font-bold text-emerald-400">Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered for University Life
          </h2>
          <p className="text-sm text-slate-500">
            Everything students and administrators need to keep classes running on time and free from clashes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Smart Timetable */}
          <div
            onClick={() => onNavigateTab('timetable')}
            className="group p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl transition cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Smart Timetable</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Daily and weekly visual time blocks with course code, venue, and lecturer details.
            </p>
          </div>

          {/* Venue Collision Detection */}
          <div
            onClick={() => onNavigateTab('venues')}
            className="group p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-xl transition cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Venue Management</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time room occupancy, capacity checks, and automatic collision warnings.
            </p>
          </div>

          {/* Announcements */}
          <div
            onClick={() => onNavigateTab('announcements')}
            className="group p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xl transition cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Announcements</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Categorized official notices for exams, fee deadlines, academics, and emergencies.
            </p>
          </div>

          {/* Campus Events */}
          <div
            onClick={() => onNavigateTab('events')}
            className="group p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-xl transition cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Campus Events</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track university derbies, tech jams, career fairs, and academic workshops.
            </p>
          </div>

          {/* Notifications */}
          <div
            onClick={() => onNavigateTab('reports')}
            className="group p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-300 hover:shadow-xl transition cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Issue Reporting</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Report lab hardware faults, room issues, and track maintenance tickets live.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-100/80 rounded-3xl p-8 sm:p-12 border border-slate-200/60 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How CampusEcho Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 relative">
            <span className="text-4xl font-black text-emerald-100 absolute top-4 right-4">01</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900">Connect to your campus</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sign in with your student or faculty credentials. Your class timetable and faculty notices sync automatically.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 relative">
            <span className="text-4xl font-black text-emerald-100 absolute top-4 right-4">02</span>
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900">Access important information</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Check daily lecture halls, verify venue availability, and find quiet study spaces across MUST buildings.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 relative">
            <span className="text-4xl font-black text-emerald-100 absolute top-4 right-4">03</span>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900">Stay informed and organized</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Get immediate alerts if a class venue is reassigned or if a schedule collision is flagged by administrators.
            </p>
          </div>
        </div>
      </section>

      {/* Cross-Platform Banner (Mobile App Android & iOS) */}
      <section className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-8 rounded-3xl border border-emerald-800/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Smartphone className="w-4 h-4" />
            <span>Progressive Web App (PWA) Ready</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            Install CampusEcho on Android & iPhone
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Run CampusEcho like a native mobile app with home screen icons, standalone layout, and offline timetable viewing without downloading heavy APKs.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <PWAInstallButton variant="compact" className="px-5 py-3 text-sm font-bold" />
        </div>
      </section>
    </div>
  );
};
