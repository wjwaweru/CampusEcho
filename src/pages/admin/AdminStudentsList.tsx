import React, { useState, useEffect } from 'react';
import { Users, Search, GraduationCap, Mail, Phone, Building2, Shield } from 'lucide-react';
import { db } from '../../services/db';
import { Profile } from '../../types';

export const AdminStudentsList: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    setProfiles(db.getProfiles());
    const unsub = db.subscribe(() => {
      setProfiles(db.getProfiles());
    });
    return () => unsub();
  }, []);

  const students = profiles.filter((p) => p.role === 'student');

  const filtered = students.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.student_id && p.student_id.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = departmentFilter === 'all' || p.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(students.map((s) => s.department)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Enrolled Comrades Directory
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Admin-restricted view of student registrations, departments, and credentials.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search comrade by name, reg number (e.g. CT201/0142/23), or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
            <button
              onClick={() => setDepartmentFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                departmentFilter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Departments
            </button>
            {departments.map((d) => (
              <button
                key={d}
                onClick={() => setDepartmentFilter(d)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  departmentFilter === d
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Students Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm shadow-2xs">
                  {s.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 leading-snug">{s.full_name}</h3>
                  <span className="text-[11px] font-mono font-bold text-emerald-700">
                    {s.student_id || 'ID Pending'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                {s.role}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <p className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{s.department}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{s.email}</span>
              </p>
              {s.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{s.phone}</span>
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
              <span>Registered: {new Date(s.created_at).toLocaleDateString()}</span>
              <span className="font-bold text-emerald-600">Active Comrade</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
