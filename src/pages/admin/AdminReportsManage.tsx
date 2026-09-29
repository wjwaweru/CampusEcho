import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, MessageSquare, MapPin, Search } from 'lucide-react';
import { db } from '../../services/db';
import { IssueReport, ReportStatus } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminReportsManage: React.FC = () => {
  const { showToast } = useNotification();
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState<ReportStatus>('In Progress');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const update = () => setReports(db.getReports());
    update();
    const unsub = db.subscribe(update);
    return () => unsub();
  }, []);

  const handleSelectReport = (r: IssueReport) => {
    setSelectedReport(r);
    setAdminNotes(r.admin_notes || '');
    setNewStatus(r.status);
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    db.updateReportStatus(selectedReport.id, newStatus, adminNotes);
    showToast({
      type: 'success',
      title: 'Report Updated',
      message: `✓ Status updated to ${newStatus} with response sent to comrade.`,
    });
    setSelectedReport(null);
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Student Reports & Maintenance Triage
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Review facility issues, lab tech tickets, and schedule concerns reported by comrades.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setStatusFilter('Open')}
              className={`px-3 py-1.5 rounded-xl transition ${
                statusFilter === 'Open'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Open ({reports.filter((r) => r.status === 'Open').length})
            </button>
            <button
              onClick={() => setStatusFilter('In Progress')}
              className={`px-3 py-1.5 rounded-xl transition ${
                statusFilter === 'In Progress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              In Progress ({reports.filter((r) => r.status === 'In Progress').length})
            </button>
            <button
              onClick={() => setStatusFilter('Resolved')}
              className={`px-3 py-1.5 rounded-xl transition ${
                statusFilter === 'Resolved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Resolved ({reports.filter((r) => r.status === 'Resolved').length})
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {r.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    r.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : r.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {r.status}
                </span>
              </div>

              <h3 className="font-black text-sm text-slate-900 leading-snug">{r.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>By: {r.user_name || 'Comrade'}</span>
                <span>{new Date(r.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="truncate">{r.location}</span>
              </div>

              {r.admin_notes && (
                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-100">
                  <strong>Staff Note:</strong> {r.admin_notes}
                </div>
              )}

              <button
                onClick={() => handleSelectReport(r)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
              >
                Update Ticket Status
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">Update Report Status</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900 text-xs">{selectedReport.title}</p>
                <p className="text-slate-500 text-[11px] mt-1">{selectedReport.description}</p>
                <p className="text-slate-400 text-[11px] mt-1">📍 {selectedReport.location}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 bg-white"
                >
                  <option value="Open">Open (Pending review)</option>
                  <option value="In Progress">In Progress (Technician assigned)</option>
                  <option value="Resolved">Resolved (Fixed & verified)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Administrator Response / Notes (Visible to Comrade)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Technician sent to replace HDMI projector splitter. Checked and operational."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition"
                >
                  Update & Notify Comrade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
