import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  PlusCircle,
  Trash2,
  Edit2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info,
} from 'lucide-react';
import { db, timeToMinutes } from '../../services/db';
import {
  AcademicClass,
  CollisionResult,
  Course,
  DayOfWeek,
  Lecturer,
  TimetableEntry,
  Venue,
} from '../../types';
import { useNotification } from '../../context/NotificationContext';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const AdminTimetableManage: React.FC = () => {
  const { showToast } = useNotification();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  // Form Fields (Section 18 Flow)
  const [courseId, setCourseId] = useState('');
  const [classId, setClassId] = useState('');
  const [lecturerId, setLecturerId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('Monday');
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('13:00');
  const [venueId, setVenueId] = useState('');

  // Collision state
  const [collisionResult, setCollisionResult] = useState<CollisionResult | null>(null);
  const [lecturerCollisionWarning, setLecturerCollisionWarning] = useState<string | null>(null);

  // Filter & Search
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');

  useEffect(() => {
    const update = () => {
      setTimetable(db.getTimetable());
      const c = db.getCourses();
      const cl = db.getClasses();
      const l = db.getLecturers();
      const v = db.getVenues();
      setCourses(c);
      setClasses(cl);
      setLecturers(l);
      setVenues(v);

      if (c.length > 0 && !courseId) setCourseId(c[1]?.id || c[0].id); // default to BBIT 2204
      if (cl.length > 0 && !classId) setClassId(cl[1]?.id || cl[0].id); // default to BBIT
      if (l.length > 0 && !lecturerId) setLecturerId(l[1]?.id || l[0].id);
      if (v.length > 0 && !venueId) setVenueId(v[0].id); // Lab 3 by default
    };

    update();
    const unsub = db.subscribe(update);
    return () => unsub();
  }, []);

  // Automatic real-time collision check whenever venue, day, start_time or end_time changes!
  useEffect(() => {
    if (!venueId || !dayOfWeek || !startTime || !endTime) {
      setCollisionResult(null);
      return;
    }

    const check = db.checkVenueCollision(venueId, dayOfWeek, startTime, endTime);
    setCollisionResult(check);

    // Also check lecturer collision
    if (lecturerId) {
      const lecCheck = db.checkLecturerCollision(lecturerId, dayOfWeek, startTime, endTime);
      if (lecCheck.hasCollision && lecCheck.conflictingEntry) {
        setLecturerCollisionWarning(
          `Lecturer is already teaching ${lecCheck.conflictingEntry.course?.course_code} (${lecCheck.conflictingEntry.start_time}-${lecCheck.conflictingEntry.end_time}) in ${lecCheck.conflictingEntry.venue?.name}.`
        );
      } else {
        setLecturerCollisionWarning(null);
      }
    }
  }, [venueId, dayOfWeek, startTime, endTime, lecturerId]);

  // Load exact test collision scenario from prompt
  const handleLoadTestScenario = () => {
    // Prompt scenario:
    // Existing: Lab 3, 10:00 AM – 12:00 PM, BSc Computer Science
    // Administrator attempts to create: Lab 3, 11:00 AM – 1:00 PM, BBIT
    const bbitCourse = courses.find((c) => c.course_code.includes('BBIT')) || courses[1];
    const bbitClass = classes.find((cl) => cl.class_name.includes('BBIT')) || classes[1];
    const lab3 = venues.find((v) => v.name.includes('Lab 3')) || venues[0];

    if (bbitCourse) setCourseId(bbitCourse.id);
    if (bbitClass) setClassId(bbitClass.id);
    if (lab3) setVenueId(lab3.id);
    setDayOfWeek('Monday');
    setStartTime('11:00');
    setEndTime('13:00');

    showToast({
      type: 'warning',
      title: 'Test Collision Loaded',
      message: 'Configured Lab 3 at 11:00 AM - 1:00 PM on Monday. Notice the collision alert below!',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (collisionResult?.hasCollision) {
      showToast({
        type: 'error',
        title: 'Save Blocked: Venue Collision',
        message: 'Cannot save entry while a venue collision is detected. Please select an alternative venue.',
      });
      return;
    }

    const res = db.addTimetableEntry({
      course_id: courseId,
      class_id: classId,
      lecturer_id: lecturerId,
      venue_id: venueId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      semester: 'Semester 1',
      academic_year: '2026/2027',
    });

    if (res.success) {
      showToast({
        type: 'success',
        title: 'Timetable Entry Saved',
        message: '✓ Timetable saved successfully. No venue collision detected.',
      });
    } else {
      showToast({
        type: 'error',
        title: 'Collision Error',
        message: res.error || 'Failed to save entry.',
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this class timetable entry?')) {
      db.deleteTimetableEntry(id);
      showToast({
        type: 'info',
        title: 'Class Removed',
        message: 'Timetable entry deleted successfully.',
      });
    }
  };

  const filteredTimetable = timetable.filter((t) => {
    if (selectedDayFilter === 'all') return true;
    return t.day_of_week === selectedDayFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Venue Collision Detection & Timetable Manager
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              CampusEcho strictly validates venue availability before saving. Double-bookings are blocked with instant alternative suggestions.
            </p>
          </div>

          <button
            onClick={handleLoadTestScenario}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Prompt Test Collision (Lab 3)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Side Form (Section 18) vs Right Side Collision Guard Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Schedule New Timetable Entry</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">Academic Year 2026/2027</span>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Step 1: Course */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">1. Academic Course / Unit</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.course_code} — {c.course_name} ({c.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Class & Step 3: Lecturer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">2. Target Student Class</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
                >
                  {classes.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.class_name} (Year {cl.year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">3. Assigned Lecturer</label>
                <select
                  value={lecturerId}
                  onChange={(e) => setLecturerId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
                >
                  {lecturers.map((lec) => (
                    <option key={lec.id} value={lec.id}>
                      {lec.name} ({lec.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 4: Day & Times */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">4. Day of the Week</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">5. Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">6. End Time</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Step 7: Venue Selection with live capacity indicators */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                7. Assigned Venue (Checks real-time availability)
              </label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border font-semibold transition ${
                  collisionResult?.hasCollision
                    ? 'border-rose-400 bg-rose-50 text-rose-900 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white'
                }`}
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.building} (Capacity: {v.capacity} students)
                  </option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Rule check: Overlap = (newStart &lt; existingEnd) &amp;&amp; (newEnd &gt; existingStart)
              </span>

              <button
                type="submit"
                disabled={collisionResult?.hasCollision}
                className={`px-6 py-3 rounded-xl font-black text-xs shadow-md transition flex items-center gap-2 ${
                  collisionResult?.hasCollision
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save Timetable Entry</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Collision Detection Feedback Panel (Section 7) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Collision Monitor</span>
            </h3>

            {/* If collision detected */}
            {collisionResult?.hasCollision ? (
              <div className="space-y-4 animate-in fade-in">
                {/* ⚠️ VENUE COLLISION DETECTED banner */}
                <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 font-black text-sm">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>⚠️ VENUE COLLISION DETECTED</span>
                  </div>

                  <p className="text-xs font-bold text-rose-900 leading-snug">
                    "{collisionResult.reason}"
                  </p>

                  <div className="p-3 bg-white rounded-xl border border-rose-200 text-xs text-slate-800 space-y-1">
                    <p className="font-bold text-[11px] text-rose-800 uppercase tracking-wider">
                      Conflicting Class Details:
                    </p>
                    {collisionResult.conflictingEntries.map((ce) => (
                      <div key={ce.id} className="pt-1">
                        <div className="font-black text-slate-900">
                          {ce.course?.course_code} — {ce.course?.course_name}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Class: <strong>{ce.class?.class_name}</strong> • Time: <strong>{ce.start_time} - {ce.end_time}</strong>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Lecturer: {ce.lecturer?.name}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] font-semibold text-rose-800 italic pt-1">
                    Do NOT save the conflicting timetable entry unless you change the venue or time.
                  </p>
                </div>

                {/* Suggested Alternatives (Section 8) */}
                {collisionResult.suggestedVenues && collisionResult.suggestedVenues.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2.5">
                    <div className="flex items-center gap-2 font-black text-xs text-emerald-900">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Suggested Alternative Venues:</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {collisionResult.suggestedVenues.map((alt) => (
                        <div
                          key={alt.id}
                          onClick={() => setVenueId(alt.id)}
                          className="p-2.5 rounded-xl bg-white hover:bg-emerald-100/60 border border-emerald-200 cursor-pointer transition flex items-center justify-between group"
                        >
                          <div>
                            <span className="font-black text-slate-900 group-hover:text-emerald-800">
                              {alt.name}
                            </span>
                            <span className="text-[11px] text-slate-500 ml-1.5">
                              ({alt.building}, Cap: {alt.capacity})
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200">
                            ✓ Select {alt.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* All Clear / Free to Book */
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-black text-sm text-emerald-900">Venue is Available</h4>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-xs mx-auto">
                  Selected venue is free on {dayOfWeek} between {startTime} and {endTime}. No overlapping classes detected.
                </p>
              </div>
            )}

            {/* Lecturer collision warning banner if any */}
            {lecturerCollisionWarning && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[11px]">Notice: Lecturer Double Booking</p>
                  <p className="text-[11px] text-amber-800">{lecturerCollisionWarning}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timetable Entries List with Day Filter */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">All Scheduled Classes ({timetable.length})</h3>
            <p className="text-xs text-slate-500">Manage and delete existing allocations.</p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedDayFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                selectedDayFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Days
            </button>
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDayFilter(d)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  selectedDayFilter === d
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTimetable.map((entry) => {
            const isDeliberateConflict =
              entry.venue_id === 'v-lab3' && entry.day_of_week === 'Monday';

            return (
              <div
                key={entry.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                  isDeliberateConflict
                    ? 'bg-amber-50/70 border-amber-300'
                    : 'bg-slate-50/50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-900 font-mono">
                      {entry.day_of_week} • {entry.start_time} - {entry.end_time}
                    </span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete class entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 text-[10px] font-black bg-white text-slate-800 border border-slate-200 rounded">
                      {entry.course?.course_code}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {entry.class?.class_name}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                    {entry.course?.course_name}
                  </h4>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">📍 {entry.venue?.name}</span>
                  <span className="truncate max-w-[120px]">{entry.lecturer?.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
