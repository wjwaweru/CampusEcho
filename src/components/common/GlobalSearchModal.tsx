import React, { useState, useEffect } from 'react';
import { Search, X, MapPin, BookOpen, Calendar, Bell, ArrowRight } from 'lucide-react';
import { db } from '../../services/db';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string, meta?: any) => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ isOpen, onClose, onNavigateTab }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    venues: any[];
    courses: any[];
    events: any[];
    announcements: any[];
  }>({
    venues: [],
    courses: [],
    events: [],
    announcements: [],
  });

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ venues: [], courses: [], events: [], announcements: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ venues: [], courses: [], events: [], announcements: [] });
      return;
    }
    const searchRes = db.searchCampus(query);
    setResults(searchRes);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.venues.length +
    results.courses.length +
    results.events.length +
    results.announcements.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search venues (e.g. Lab 3), courses, events, announcements..."
            className="w-full text-sm font-medium bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-200/60 hover:bg-slate-200 rounded-lg transition"
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-5">
          {!query.trim() && (
            <div className="py-8 text-center text-slate-400 text-xs">
              <p className="font-semibold text-slate-500 mb-1">Quick Campus Lookups</p>
              <p>Type "Lab 3", "Database", "Hackathon", "Exams" or "Engineering"</p>
            </div>
          )}

          {query.trim() && totalResults === 0 && (
            <div className="py-10 text-center text-slate-400 text-xs">
              <p className="font-semibold text-slate-600 mb-1">No campus records found</p>
              <p>Try searching for a different room, course code, or event keyword.</p>
            </div>
          )}

          {/* Venues Results */}
          {results.venues.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Venues ({results.venues.length})</span>
              </div>
              <div className="space-y-2">
                {results.venues.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      onNavigateTab('venues');
                      onClose();
                    }}
                    className="group p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                          {v.name}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">({v.building})</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            v.status === 'Available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {v.status || 'Available'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Capacity: <strong className="text-slate-700">{v.capacity}</strong> comrades • {v.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courses Results */}
          {results.courses.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Courses & Units ({results.courses.length})</span>
              </div>
              <div className="space-y-2">
                {results.courses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onNavigateTab('timetable');
                      onClose();
                    }}
                    className="group p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                          {c.course_code}
                        </span>
                        <span className="font-semibold text-sm text-slate-900 group-hover:text-blue-700">
                          {c.course_name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Department: {c.department}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Results */}
          {results.events.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>Events ({results.events.length})</span>
              </div>
              <div className="space-y-2">
                {results.events.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => {
                      onNavigateTab('events');
                      onClose();
                    }}
                    className="group p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-sm text-slate-900 group-hover:text-purple-700">
                        {e.title}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {e.event_date} • {e.start_time} - {e.end_time} • {e.venue?.name || 'Campus Venue'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Announcements Results */}
          {results.announcements.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span>Announcements ({results.announcements.length})</span>
              </div>
              <div className="space-y-2">
                {results.announcements.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      onNavigateTab('announcements');
                      onClose();
                    }}
                    className="group p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          {a.category}
                        </span>
                        <span className="font-semibold text-sm text-slate-900 group-hover:text-amber-700">
                          {a.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{a.content}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
