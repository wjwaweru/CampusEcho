import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { db } from '../../services/db';
import { TimetableHealthReport } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminHealthCheck: React.FC = () => {
  const { showToast } = useNotification();
  const [report, setReport] = useState<TimetableHealthReport | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const runScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = db.runTimetableHealthCheck();
      setReport(res);
      setIsScanning(false);
      showToast({
        type: 'info',
        title: 'Timetable Scan Complete',
        message: `Scanned ${res.totalAnalyzed} classes. ${res.scheduleConflicts} conflict(s) detected.`,
      });
    }, 400);
  };

  useEffect(() => {
    runScan();
    const unsub = db.subscribe(() => {
      setReport(db.runTimetableHealthCheck());
    });
    return () => unsub();
  }, []);

  const handleQuickResolveVenue = (conflict: any) => {
    // Find an alternative venue for Entry B
    const venues = db.getVenues();
    const alternative = venues.find(
      (v) => v.id !== conflict.entryB.venue_id && v.status === 'Available'
    );

    if (alternative) {
      db.updateTimetableEntry(
        conflict.entryB.id,
        {
          venue_id: alternative.id,
        },
        true // bypass to apply resolution
      );

      showToast({
        type: 'success',
        title: 'Conflict Resolved',
        message: `✓ Reassigned ${conflict.entryB.course?.course_code} from ${conflict.entryA.venue?.name} to ${alternative.name}.`,
      });
      setSelectedConflict(null);
    } else {
      showToast({
        type: 'warning',
        title: 'No Alternative Found',
        message: 'Please manually create or free a venue first.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Timetable Health Check
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Rule-based integrity engine scanning for venue collisions, lecturer clashes, and room allocation health.
            </p>
          </div>

          <button
            onClick={runScan}
            disabled={isScanning}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Re-Run Health Scan'}</span>
          </button>
        </div>

        {/* Section 9: Statistics Cards */}
        {report && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-2xl font-black text-slate-900">{report.totalAnalyzed}</span>
              <p className="text-[10px] font-bold uppercase text-slate-500 mt-0.5">Classes Analyzed</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-center">
              <span className="text-2xl font-black text-amber-800">{report.venueCollisions}</span>
              <p className="text-[10px] font-bold uppercase text-amber-700 mt-0.5">Venue Collisions</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-center">
              <span className="text-2xl font-black text-rose-800">{report.lecturerCollisions}</span>
              <p className="text-[10px] font-bold uppercase text-rose-700 mt-0.5">Lecturer Clashes</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-300 text-center">
              <span className="text-2xl font-black text-purple-800">{report.scheduleConflicts}</span>
              <p className="text-[10px] font-bold uppercase text-purple-700 mt-0.5">Total Conflicts</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-center col-span-2 sm:col-span-1">
              <span className="text-2xl font-black text-emerald-800">
                {report.conflictFreeClasses}
              </span>
              <p className="text-[10px] font-bold uppercase text-emerald-700 mt-0.5">Conflict-Free</p>
            </div>
          </div>
        )}
      </div>

      {/* Conflicts List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Identified Conflicts ({report?.conflictItems.length || 0})
          </h2>

          {!report || report.conflictItems.length === 0 ? (
            <div className="p-10 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-black text-base text-slate-900">Zero Timetable Conflicts!</h3>
              <p className="text-slate-500 mt-1">
                All scheduled classes have unique venues and conflict-free lecturers.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {report.conflictItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedConflict(item)}
                  className={`p-4 rounded-2xl bg-white border cursor-pointer transition shadow-2xs hover:shadow-md ${
                    selectedConflict?.id === item.id
                      ? 'border-amber-500 ring-2 ring-amber-300'
                      : 'border-slate-200 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      {item.type === 'venue_collision' ? 'Venue Collision' : 'Lecturer Clash'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {item.day} • {item.time}
                    </span>
                  </div>

                  <h3 className="font-black text-sm text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.details}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-amber-800 font-bold">
                    <span>Click to inspect & resolve</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Breakdown Inspection Card (Section 9) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4 sticky top-20">
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Conflict Inspection Details</span>
            </h3>

            {selectedConflict ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-900">{selectedConflict.title}</span>
                  <p className="text-slate-600">{selectedConflict.details}</p>
                </div>

                {/* Class A */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Class A:</span>
                  <p className="font-black text-slate-900 text-sm">
                    {selectedConflict.entryA.course?.course_code} — {selectedConflict.entryA.course?.course_name}
                  </p>
                  <p className="text-slate-600">
                    Class: <strong>{selectedConflict.entryA.class?.class_name}</strong>
                  </p>
                  <p className="text-slate-600">
                    Venue: <strong>{selectedConflict.entryA.venue?.name}</strong> ({selectedConflict.entryA.venue?.building})
                  </p>
                  <p className="text-slate-600 font-mono">
                    Time: {selectedConflict.entryA.day_of_week}, {selectedConflict.entryA.start_time} - {selectedConflict.entryA.end_time}
                  </p>
                </div>

                {/* Class B (Conflicting Class) */}
                <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/50 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-rose-600">
                    Conflicting Class B:
                  </span>
                  <p className="font-black text-slate-900 text-sm">
                    {selectedConflict.entryB.course?.course_code} — {selectedConflict.entryB.course?.course_name}
                  </p>
                  <p className="text-slate-600">
                    Class: <strong>{selectedConflict.entryB.class?.class_name}</strong>
                  </p>
                  <p className="text-slate-600">
                    Venue: <strong>{selectedConflict.entryB.venue?.name}</strong> ({selectedConflict.entryB.venue?.building})
                  </p>
                  <p className="text-slate-600 font-mono">
                    Time: {selectedConflict.entryB.day_of_week}, {selectedConflict.entryB.start_time} - {selectedConflict.entryB.end_time}
                  </p>
                </div>

                {/* Resolution Action */}
                <button
                  onClick={() => handleQuickResolveVenue(selectedConflict)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Reassign Class B to Available Venue</span>
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Select any conflict from the left list to see full details (Course, Class, Venue, Time, and Conflicting Class) and resolve it.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
