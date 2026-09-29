import React, { useState, useEffect } from 'react';
import { Bell, Filter, Search, Calendar, AlertTriangle, ShieldAlert, Award, FileText } from 'lucide-react';
import { db } from '../../services/db';
import { Announcement, AnnouncementCategory } from '../../types';

const CATEGORIES: (AnnouncementCategory | 'All')[] = [
  'All',
  'Academic',
  'Exams',
  'Fees',
  'Events',
  'General',
  'Emergency',
];

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<AnnouncementCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const update = () => setAnnouncements(db.getAnnouncements());
    update();
    const unsub = db.subscribe(update);
    return () => unsub();
  }, []);

  const filtered = announcements.filter((a) => {
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
                Official Campus Announcements
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Verified notices from Registrar, Dean of Students, Examination Directorate & Student Welfare.
            </p>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search announcements by keywords (e.g. Exam, Bursary, Lab)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
            <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No announcements found</p>
            <p className="mt-1">Try selecting "All" categories or adjusting your search term.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isUrgent = item.priority === 'Urgent';
            const isHigh = item.priority === 'High';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl bg-white border transition shadow-2xs hover:shadow-md space-y-3 ${
                  isUrgent
                    ? 'border-rose-400 bg-rose-50/15'
                    : isHigh
                    ? 'border-amber-300 bg-amber-50/15'
                    : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                        item.category === 'Exams'
                          ? 'bg-purple-100 text-purple-800'
                          : item.category === 'Fees'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.category === 'Emergency'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.category}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isUrgent
                          ? 'bg-rose-600 text-white animate-pulse'
                          : isHigh
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.priority} Priority
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(item.created_at).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Issued by: {item.author || 'Academic Administration'}</span>
                  <span>Official Memo</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
