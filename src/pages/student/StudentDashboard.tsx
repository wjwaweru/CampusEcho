import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  MapPin,
  Bell,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Clock,
  User,
  CheckCircle,
  ExternalLink,
  PlusCircle,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db, timeToMinutes } from '../../services/db';
import { Announcement, CampusEvent, DayOfWeek, IssueReport, Notification, TimetableEntry } from '../../types';
import { PWAInstallButton } from '../../components/common/PWAInstallButton';

interface Props {
  onNavigateTab: (tab: string) => void;
  onOpenReportModal?: () => void;
}

export const StudentDashboard: React.FC<Props> = ({ onNavigateTab, onOpenReportModal }) => {
  const { currentUser } = useAuth();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [myReports, setMyReports] = useState<IssueReport[]>([]);

  useEffect(() => {
    const refreshData = () => {
      setTimetable(db.getTimetable());
      setAnnouncements(db.getAnnouncements());
      setEvents(db.getEvents());
      if (currentUser) {
        setNotifications(db.getNotifications(currentUser.id));
        setMyReports(db.getReports(currentUser.id));
      }
    };

    refreshData();
    const unsub = db.subscribe(refreshData);
    return () => unsub();
  }, [currentUser]);

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Determine current day of week (e.g. Monday)
  const daysOfWeek: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as any;
  const currentDayIndex = new Date().getDay();
  // If weekend, default to Monday for demonstration so the student always sees classes!
  const todayName: DayOfWeek = (currentDayIndex === 0 || currentDayIndex === 6) ? 'Monday' : daysOfWeek[currentDayIndex];

  // Filter today's classes
  const todayClasses = timetable
    .filter((t) => t.day_of_week === todayName)
    .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

  // Determine class status based on current time
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const getClassStatus = (startTime: string, endTime: string) => {
    const s = timeToMinutes(startTime);
    const e = timeToMinutes(endTime);
    if (nowMinutes >= s && nowMinutes <= e) return { label: 'In Progress', color: 'bg-emerald-100 text-emerald-800 animate-pulse' };
    if (nowMinutes < s) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Completed', color: 'bg-slate-100 text-slate-600' };
  };

  // Next upcoming campus event
  const nextEvent = events[0] || null;

  // Latest 3 announcements
  const latestAnnouncements = announcements.slice(0, 3);

  // Check if there are active collisions on today's classes
  const health = db.runTimetableHealthCheck();
  const hasLab3Collision = health.venueCollisions > 0;

  return (
    <div className="space-y-6">
      {/* PWA Mobile Banner */}
      <PWAInstallButton variant="banner" />

      {/* Welcome Section */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              MUST Comrade Portal • {todayName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {getGreeting()}, {currentUser?.full_name || 'Comrade'}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90">
              Department of {currentUser?.department || 'Computer Science'} • Reg: {currentUser?.student_id || 'CT201/0142/23'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('timetable')}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <CalendarDays className="w-4 h-4 text-emerald-700" />
              <span>Full Timetable</span>
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Timetable Conflict Notification Banner (if any) */}
      {hasLab3Collision && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs sm:text-sm text-amber-900">
                ⚠️ Notice: Timetable Collision Alert in Lab 3
              </p>
              <p className="text-xs text-amber-800/90">
                A venue clash between BCS 3101 and BBIT 2204 in Science Complex Lab 3 has been flagged for resolution by the Academic Registrar.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('timetable')}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition self-start sm:self-auto"
          >
            Review Timetable
          </button>
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <button
          onClick={() => onNavigateTab('timetable')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition text-left space-y-2 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">
               My Timetable
            </div>
            <div className="text-[11px] text-slate-500">Daily & Weekly</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('venues')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition text-left space-y-2 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700">
              Find Venue
            </div>
            <div className="text-[11px] text-slate-500">Labs & Availability</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('gmail')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-rose-300 hover:shadow-md transition text-left space-y-2 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-105 transition">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 group-hover:text-rose-700">
              Campus Gmail
            </div>
            <div className="text-[11px] text-slate-500">Inbox & Comrades</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('events')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition text-left space-y-2 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 group-hover:text-purple-700">
              Campus Events
            </div>
            <div className="text-[11px] text-slate-500">Derbies & Fairs</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('reports')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition text-left space-y-2 group cursor-pointer col-span-2 sm:col-span-1"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 group-hover:text-amber-700">
              Report Issue
            </div>
            <div className="text-[11px] text-slate-500">Facilities & Tech</div>
          </div>
        </button>
      </div>

      {/* Main Grid: Today's Classes + Upcoming Event & Latest Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Classes Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Today's Classes ({todayName})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('timetable')}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>View week</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todayClasses.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-medium text-slate-600">No scheduled classes today</p>
                <p className="text-slate-400 mt-0.5">Enjoy your free revision hours or check library resources.</p>
              </div>
            ) : (
              todayClasses.map((item) => {
                const status = getClassStatus(item.start_time, item.end_time);
                const isConflict =
                  item.venue_id === 'v-lab3' && item.day_of_week === 'Monday';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl bg-white border transition shadow-2xs hover:shadow-md ${
                      isConflict
                        ? 'border-amber-400 bg-amber-50/20'
                        : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 text-[11px] font-black bg-slate-900 text-white rounded-md">
                            {item.course?.course_code || 'CODE'}
                          </span>
                          <span className="text-xs font-bold text-slate-600">
                            {item.class?.class_name} (Year {item.class?.year})
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                          {isConflict && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                              ⚠️ Collision Flagged
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-slate-900">
                          {item.course?.course_name || 'Class Title'}
                        </h3>
                      </div>

                      {/* Time Pill */}
                      <div className="shrink-0 text-right">
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {item.start_time} - {item.end_time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {item.venue?.name} ({item.venue?.building})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.lecturer?.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Event & Latest Announcements Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Event Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Upcoming Event</span>
              </h2>
              <button
                onClick={() => onNavigateTab('events')}
                className="text-xs font-semibold text-purple-700 hover:underline"
              >
                All events
              </button>
            </div>

            {nextEvent ? (
              <div
                onClick={() => onNavigateTab('events')}
                className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950 text-white border border-purple-800/40 shadow-md cursor-pointer hover:shadow-xl transition group"
              >
                <div className="flex items-center justify-between text-xs text-purple-300 font-bold mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30">
                    {nextEvent.event_date}
                  </span>
                  <span>
                    {nextEvent.start_time} - {nextEvent.end_time}
                  </span>
                </div>
                <h3 className="font-black text-sm text-white group-hover:text-purple-200 transition">
                  {nextEvent.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                  {nextEvent.description}
                </p>
                <div className="mt-3 pt-3 border-t border-purple-800/50 flex items-center justify-between text-[11px] text-purple-300">
                  <span>📍 {nextEvent.venue?.name || 'Main Campus'}</span>
                  <span>{nextEvent.organizer}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-400 text-center">
                No events scheduled this week
              </div>
            )}
          </div>

          {/* Latest Announcements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>Latest Announcements</span>
              </h2>
              <button
                onClick={() => onNavigateTab('announcements')}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                View all ({announcements.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {latestAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => onNavigateTab('announcements')}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        ann.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : ann.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ann.category} • {ann.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{ann.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
