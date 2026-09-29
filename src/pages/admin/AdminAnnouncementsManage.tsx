import React, { useState, useEffect } from 'react';
import { Bell, PlusCircle, Trash2, Edit2, AlertTriangle, CheckCircle, Tag } from 'lucide-react';
import { db } from '../../services/db';
import { Announcement, AnnouncementCategory, AnnouncementPriority } from '../../types';
import { useNotification } from '../../context/NotificationContext';

const CATEGORIES: AnnouncementCategory[] = ['Academic', 'General', 'Emergency', 'Events', 'Fees', 'Exams'];
const PRIORITIES: AnnouncementPriority[] = ['Low', 'Normal', 'High', 'Urgent'];

export const AdminAnnouncementsManage: React.FC = () => {
  const { showToast } = useNotification();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('Academic');
  const [priority, setPriority] = useState<AnnouncementPriority>('Normal');

  useEffect(() => {
    const update = () => setAnnouncements(db.getAnnouncements());
    update();
    const unsub = db.subscribe(update);
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setContent('');
    setCategory('Academic');
    setPriority('Normal');
    setShowModal(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditingItem(a);
    setTitle(a.title);
    setContent(a.content);
    setCategory(a.category);
    setPriority(a.priority);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      db.updateAnnouncement(editingItem.id, {
        title,
        content,
        category,
        priority,
      });
      showToast({
        type: 'success',
        title: 'Announcement Updated',
        message: '✓ Announcement updated successfully.',
      });
    } else {
      db.addAnnouncement({
        title,
        content,
        category,
        priority,
        author: 'Academic Registrar & Timetable Office',
      });
      showToast({
        type: 'success',
        title: 'Announcement Published',
        message: '✓ Announcement published to all comrades.',
      });
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, aTitle: string) => {
    if (window.confirm(`Delete announcement "${aTitle}"?`)) {
      db.deleteAnnouncement(id);
      showToast({
        type: 'info',
        title: 'Notice Removed',
        message: 'Announcement deleted successfully.',
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
                <Bell className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Official Campus Announcements Manager
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Publish official memos, exam schedules, urgent notices, and fee guidelines.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Announcement</span>
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-amber-300 shadow-2xs transition flex flex-col sm:flex-row sm:items-start justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                  {a.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    a.priority === 'Urgent'
                      ? 'bg-rose-100 text-rose-800'
                      : a.priority === 'High'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {a.priority} Priority
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-black text-sm text-slate-900">{a.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{a.content}</p>
            </div>

            <div className="flex sm:flex-col items-center gap-2 shrink-0">
              <button
                onClick={() => handleOpenEdit(a)}
                className="p-2 rounded-xl text-slate-500 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 transition"
                title="Edit Announcement"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(a.id, a.title)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                title="Delete Announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {editingItem ? 'Edit Announcement' : 'Publish New Announcement'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Announcement Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End of Semester Examination Timetable Released"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 bg-white"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p} Priority
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Announcement Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter full announcement details for students..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  {editingItem ? 'Update Announcement' : 'Publish to Comrades'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
