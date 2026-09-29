import React, { useState, useEffect } from 'react';
import { AlertTriangle, PlusCircle, CheckCircle, Clock, MapPin, Tag, MessageSquare, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../services/db';
import { IssueReport, ReportCategory } from '../../types';

const CATEGORIES: ReportCategory[] = [
  'ICT & Labs',
  'Facilities',
  'Timetable Issue',
  'Hostels',
  'Safety',
  'General',
];

export const IssueReportingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [reports, setReports] = useState<IssueReport[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReportCategory>('ICT & Labs');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const update = () => {
      if (currentUser) {
        setReports(db.getReports(currentUser.id));
      }
    };
    update();
    const unsub = db.subscribe(update);
    return () => unsub();
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    db.addReport({
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      title,
      category,
      location,
      description,
      status: 'Open',
    });

    showToast({
      type: 'success',
      title: 'Report Submitted',
      message: '✓ Issue report submitted successfully. Campus staff will investigate.',
    });

    // Reset & close
    setTitle('');
    setLocation('');
    setDescription('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Campus Issue Reporting</h1>
            </div>
            <p className="text-xs text-slate-500">
              Report equipment faults, timetable overlaps, lab air conditioning, or hostel maintenance.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Issue</span>
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          My Submitted Reports ({reports.length})
        </h2>

        {reports.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No issues reported</p>
            <p className="mt-1">Notice broken projectors, lab faults or schedule clashes? Submit a ticket above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-teal-300 transition shadow-2xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>Location: {item.location}</span>
                </div>

                {item.admin_notes && (
                  <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs text-teal-900 space-y-1">
                    <p className="font-bold text-[11px] text-teal-800 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                      <span>Administration Feedback:</span>
                    </p>
                    <p className="text-slate-700">{item.admin_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Issue Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Report Campus Issue</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReportCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Title / Brief Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDMI projector not connecting, AC leak in Lab 3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Complex - Lab 3, Row 4"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the issue, when it happens, and any impact on comrades..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
