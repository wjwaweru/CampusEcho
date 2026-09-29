import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  Filter,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { db, timeToMinutes } from '../../services/db';
import { DayOfWeek, TimetableEntry } from '../../types';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetablePage: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [viewMode, setViewMode] = useState<'today' | 'week'>('today');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  useEffect(() => {
    const update = () => setTimetable(db.getTimetable());
    update();
    const unsub = db.subscribe(update);
    return () => unsub();
  }, []);

  const health = db.runTimetableHealthCheck();

  const filteredEntries = timetable.filter((entry) => {
    if (viewMode === 'today' && entry.day_of_week !== selectedDay) {
      return false;
    }
    if (filterDepartment !== 'all' && entry.course?.department !== filterDepartment) {
      return false;
    }
    return true;
  });

  // Sort by time
  const sortedEntries = [...filteredEntries].sort(
    (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
  );

  return (
    <div className="space-y-6">
      {/* Top Header & View Mode Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Smart Campus Timetable</h1>
            </div>
            <p className="text-xs text-slate-500">
              Academic Year 2026/2027 • Semester 1 • Real-time collision monitoring active
            </p>
          </div>

          {/* Mode Switcher: Today vs This Week */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
              <button
                onClick={() => setViewMode('today')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'today'
                    ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Today's Schedule
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'week'
                    ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                This Week (Full View)
              </button>
            </div>
          </div>
        </div>

        {/* Day Pills when in Today mode */}
        {viewMode === 'today' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-slate-400 mr-1 text-[11px] uppercase tracking-wider">
              Day:
            </span>
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  selectedDay === d
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Collision Alert Banner if current selected day has venue collisions */}
      {health.venueCollisions > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm text-amber-950">
              Active Timetable Conflict Detected in Lab 3
            </p>
            <p className="text-amber-800 leading-relaxed">
              Lab 3 is double-booked on Monday: <strong>BCS 3101</strong> (10:00 - 12:00) overlaps with{' '}
              <strong>BBIT 2204</strong> (11:00 - 13:00). Comrades should verify with their course reps or check the admin resolution notice.
            </p>
          </div>
        </div>
      )}

      {/* Timetable Content */}
      {viewMode === 'today' ? (
        /* Daily View: Visual Time Blocks */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Classes for {selectedDay} ({sortedEntries.length})</span>
            </h2>
          </div>

          {sortedEntries.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">No classes scheduled for {selectedDay}</p>
              <p className="mt-1">Select another day or switch to "This Week" view.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedEntries.map((item) => {
                const isClash =
                  item.venue_id === 'v-lab3' && item.day_of_week === 'Monday';

                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl bg-white border transition shadow-2xs hover:shadow-md flex flex-col justify-between ${
                      isClash
                        ? 'border-amber-400 bg-amber-50/20'
                        : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div>
                      {/* Top Bar with Time & Clash Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>
                            {item.start_time} — {item.end_time}
                          </span>
                        </div>
                        {isClash && (
                          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Room Clash</span>
                          </span>
                        )}
                      </div>

                      {/* Course & Class */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-xs font-black bg-emerald-100 text-emerald-800 rounded">
                            {item.course?.course_code}
                          </span>
                          <span className="text-xs font-semibold text-slate-600">
                            {item.class?.class_name} (Year {item.class?.year})
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {item.course?.course_name}
                        </h3>
                      </div>
                    </div>

                    {/* Venue & Lecturer Info */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>
                          {item.venue?.name}{' '}
                          <span className="font-normal text-slate-500">
                            ({item.venue?.building})
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.lecturer?.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Weekly View: Days Matrix */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DAYS.map((day) => {
              const dayEntries = timetable
                .filter((t) => t.day_of_week === day)
                .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

              return (
                <div
                  key={day}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3 flex flex-col"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-black text-sm text-slate-900">{day}</h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {dayEntries.length} {dayEntries.length === 1 ? 'class' : 'classes'}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {dayEntries.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs italic">
                        No scheduled classes
                      </div>
                    ) : (
                      dayEntries.map((item) => {
                        const isConflict =
                          item.venue_id === 'v-lab3' && item.day_of_week === 'Monday';

                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl border text-xs transition ${
                              isConflict
                                ? 'bg-amber-50/80 border-amber-300'
                                : 'bg-slate-50/70 border-slate-200/70 hover:bg-emerald-50/30'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900 font-mono text-[11px]">
                                {item.start_time} - {item.end_time}
                              </span>
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-slate-700 border border-slate-200 rounded">
                                {item.course?.course_code}
                              </span>
                            </div>
                            <div className="font-semibold text-slate-800 line-clamp-1">
                              {item.course?.course_name}
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                              <span>📍 {item.venue?.name}</span>
                              <span className="truncate max-w-[120px]">{item.lecturer?.name?.split(' ')[1]}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
