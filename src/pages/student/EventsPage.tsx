import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Filter, Sparkles } from 'lucide-react';
import { db } from '../../services/db';
import { CampusEvent } from '../../types';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    const update = () => setEvents(db.getEvents());
    update();
    const unsub = db.subscribe(update);
    return () => unsub();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const endOfWeek = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const filteredEvents = events.filter((ev) => {
    if (filterPeriod === 'today') {
      return ev.event_date === todayStr;
    }
    if (filterPeriod === 'week') {
      return ev.event_date >= todayStr && ev.event_date <= endOfWeek;
    }
    if (filterPeriod === 'month') {
      return ev.event_date >= todayStr && ev.event_date <= endOfMonth;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Campus Events & Activities</h1>
            </div>
            <p className="text-xs text-slate-500">
              Tech hackathons, sports derbies, career summits, and academic workshops at MUST.
            </p>
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterPeriod === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilterPeriod('today')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterPeriod === 'today'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilterPeriod('week')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterPeriod === 'week'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setFilterPeriod('month')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterPeriod === 'month'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No campus events match this filter</p>
            <p className="mt-1">Try selecting "All Events" to view upcoming dates.</p>
          </div>
        ) : (
          filteredEvents.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-purple-700 mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 font-mono">
                    📅 {item.event_date}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {item.start_time} - {item.end_time}
                    </span>
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1 font-semibold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>{item.venue?.name || 'Main Campus Venue'}</span>
                </div>
                <span className="text-[11px] truncate max-w-[130px]">{item.organizer}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
