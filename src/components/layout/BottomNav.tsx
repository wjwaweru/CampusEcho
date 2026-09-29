import React from 'react';
import { LayoutDashboard, CalendarDays, MapPin, Calendar, Bell, AlertCircle, Shield, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onNavigateTab }) => {
  const { isAdmin } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 safe-area-pb shadow-lg">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onNavigateTab('home')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'home' || activeTab === 'dashboard'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => onNavigateTab('timetable')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'timetable'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Timetable</span>
        </button>

        <button
          onClick={() => onNavigateTab('venues')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'venues'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Venues</span>
        </button>

        <button
          onClick={() => onNavigateTab('gmail')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'gmail'
              ? 'text-rose-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Mail className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Gmail</span>
        </button>

        <button
          onClick={() => onNavigateTab('announcements')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'announcements'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Notices</span>
        </button>

        {isAdmin ? (
          <button
            onClick={() => onNavigateTab('admin-dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
              activeTab.startsWith('admin-')
                ? 'text-amber-700 font-bold'
                : 'text-amber-900 hover:text-amber-950'
            }`}
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Admin</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigateTab('reports')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
              activeTab === 'reports'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Reports</span>
          </button>
        )}
      </div>
    </nav>
  );
};
