import React, { useState } from 'react';
import { LogIn, UserPlus, KeyRound, X, GraduationCap, ShieldCheck, Mail, Lock, User, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'reset';
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [loading, setLoading] = useState(false);

  const { login, signUp, switchDemoUser } = useAuth();
  const { showToast } = useNotification();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password, role);
        if (res.success) {
          showToast({
            type: 'success',
            title: 'Welcome Back',
            message: `Signed in successfully.`,
          });
          onClose();
        } else {
          showToast({
            type: 'error',
            title: 'Login Error',
            message: res.error || 'Invalid credentials.',
          });
        }
      } else if (mode === 'signup') {
        const res = await signUp({
          fullName,
          email,
          password,
          role,
          studentId: role === 'student' ? studentId : undefined,
          department,
        });
        if (res.success) {
          showToast({
            type: 'success',
            title: 'Account Created',
            message: `Welcome to CampusEcho, ${fullName}!`,
          });
          onClose();
        } else {
          showToast({
            type: 'error',
            title: 'Signup Failed',
            message: res.error || 'Failed to create account.',
          });
        }
      } else if (mode === 'reset') {
        showToast({
          type: 'info',
          title: 'Password Reset Sent',
          message: `If ${email} is registered, a recovery link has been dispatched.`,
        });
        setMode('login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoStudent = () => {
    switchDemoUser('student');
    showToast({
      type: 'success',
      title: 'Demo Student Active',
      message: 'Logged in as Brian Mwangi (BSc Computer Science, Year 3).',
    });
    onClose();
  };

  const handleQuickDemoAdmin = () => {
    switchDemoUser('admin');
    showToast({
      type: 'warning',
      title: 'Administrator Mode Active',
      message: 'Logged in as Dr. Jane Kariuki (Timetable Coordinator & Dean).',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <GraduationCap className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">CampusEcho Auth</h3>
              <p className="text-xs text-emerald-200">Supabase Authentication & Role Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Demo fast switch buttons */}
        <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500">Quick Test:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleQuickDemoStudent}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-bold shadow-2xs transition"
            >
              👨‍🎓 Student Demo
            </button>
            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-lg font-bold shadow-2xs transition"
            >
              🛡️ Admin Demo
            </button>
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex border-b border-slate-200 text-xs font-semibold bg-white">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              mode === 'login'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              mode === 'signup'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => setMode('reset')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              mode === 'reset'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dennis Omondi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                {role === 'student' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Student Reg ID</label>
                    <input
                      type="text"
                      required
                      placeholder="CT201/0142/23"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Campus Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="name@student.must.ac.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-emerald-700 hover:underline text-[11px]"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to CampusEcho</span>
              </>
            ) : mode === 'signup' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Comrade Account</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Send Password Reset</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
