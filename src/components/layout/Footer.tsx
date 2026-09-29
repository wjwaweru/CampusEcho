import React from 'react';
import { GraduationCap, Heart, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

interface Props {
  onNavigateTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Footer: React.FC<Props> = ({ onNavigateTab, onOpenAuth }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pb-16 md:pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-base font-black text-white tracking-tight">CampusEcho</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Your Smart Campus Companion. No more tussles in your day life as a comrade in MUST.
              CampusEcho got you.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Built for Android, iOS & Web</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Campus Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigateTab('timetable')}
                  className="hover:text-emerald-400 transition"
                >
                  Smart Timetable
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('venues')}
                  className="hover:text-emerald-400 transition"
                >
                  Venue Availability
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('announcements')}
                  className="hover:text-emerald-400 transition"
                >
                  Official Announcements
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('events')}
                  className="hover:text-emerald-400 transition"
                >
                  Campus Events
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('reports')}
                  className="hover:text-emerald-400 transition"
                >
                  Report Campus Issue
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('gmail')}
                  className="hover:text-emerald-400 transition"
                >
                  Campus Gmail
                </button>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Core Capabilities
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>✓ Live Venue Collision Prevention</li>
              <li>✓ Rule-Based Timetable Health Check</li>
              <li>✓ Role-Based Supabase Integration</li>
              <li>✓ Real-Time Notifications</li>
              <li>✓ Mobile PWA Standalone Mode</li>
            </ul>
          </div>

          {/* Contact / Help */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Contact & Support</h4>
            <div className="space-y-2 text-slate-400">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Meru University of Science & Technology</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>campusecho@must.ac.ke</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>+254 700 000 000</span>
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  Student / Admin Portal
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} CampusEcho — Built with passion for MUST Comrades.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">About</span>
            <span className="hover:text-slate-400 cursor-pointer">Features</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
