import React, { useState, useEffect } from 'react';
import { MapPin, Users, CheckCircle2, Clock, Search, Building2, Calendar, AlertCircle } from 'lucide-react';
import { db } from '../../services/db';
import { TimetableEntry, Venue } from '../../types';

export const VenuesPage: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedVenueForSchedule, setSelectedVenueForSchedule] = useState<Venue | null>(null);

  useEffect(() => {
    const update = () => {
      setVenues(db.getVenues());
      setTimetable(db.getTimetable());
    };
    update();
    const unsub = db.subscribe(update);
    return () => unsub();
  }, []);

  const buildings = Array.from(new Set(venues.map((v) => v.building)));

  const filteredVenues = venues.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBuilding = selectedBuilding === 'all' || v.building === selectedBuilding;
    return matchesSearch && matchesBuilding;
  });

  const getVenueBookings = (venueId: string) => {
    return timetable.filter((t) => t.venue_id === venueId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Campus Venues & Labs</h1>
            </div>
            <p className="text-xs text-slate-500">
              Check lecture room occupancy, computer lab capacities, and schedule bookings across MUST campuses.
            </p>
          </div>
        </div>

        {/* Search & Building Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by venue name (e.g. Lab 3, Room 204)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
            <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider shrink-0">
              Building:
            </span>
            <button
              onClick={() => setSelectedBuilding('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedBuilding === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Buildings
            </button>
            {buildings.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBuilding(b)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  selectedBuilding === b
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVenues.map((venue) => {
          const bookings = getVenueBookings(venue.id);
          const isOccupied = venue.status === 'Occupied' || bookings.length > 2;

          return (
            <div
              key={venue.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900">{venue.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{venue.building}</span>
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      venue.status === 'Available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {venue.status || 'Available'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                  {venue.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>
                      Capacity: <strong className="text-slate-900">{venue.capacity}</strong> comrades
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {bookings.length} {bookings.length === 1 ? 'weekly booking' : 'weekly bookings'}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedVenueForSchedule(venue)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-800 font-bold text-xs border border-slate-200 hover:border-blue-200 transition flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Room Schedule</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Schedule Modal */}
      {selectedVenueForSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {selectedVenueForSchedule.name} Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedVenueForSchedule.building} • Max Capacity: {selectedVenueForSchedule.capacity} students
                </p>
              </div>
              <button
                onClick={() => setSelectedVenueForSchedule(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Weekly Timetable Bookings:
              </p>

              {getVenueBookings(selectedVenueForSchedule.id).length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No scheduled classes in this venue. Free for study or booking.
                </div>
              ) : (
                getVenueBookings(selectedVenueForSchedule.id).map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{entry.day_of_week}</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                          {entry.course?.course_code}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5 font-medium">{entry.course?.course_name}</p>
                      <p className="text-[11px] text-slate-400">
                        {entry.class?.class_name} • Lecturer: {entry.lecturer?.name}
                      </p>
                    </div>
                    <div className="font-mono font-bold text-slate-800 text-right shrink-0">
                      {entry.start_time} - {entry.end_time}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setSelectedVenueForSchedule(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
