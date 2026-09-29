import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../services/db';
import { getSupabase } from '../services/supabaseClient';
import { Profile, UserRole } from '../types';

interface AuthContextType {
  currentUser: Profile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUp: (params: {
    fullName: string;
    email: string;
    password?: string;
    role: UserRole;
    studentId?: string;
    department: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateCurrentUserProfile: (updates: Partial<Profile>) => void;
  switchDemoUser: (userRole: UserRole) => void;
  isSupabaseLive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    // Default to the student Brian Mwangi so the user lands straight into a rich demo experience
    const profiles = db.getProfiles();
    const savedUserId = localStorage.getItem('campusecho_current_user_id');
    if (savedUserId) {
      const found = profiles.find((p) => p.id === savedUserId);
      if (found) return found;
    }
    return profiles.find((p) => p.role === 'student') || profiles[0] || null;
  });

  const [isSupabaseLive, setIsSupabaseLive] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (sb) {
      setIsSupabaseLive(true);
      sb.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile = db.getProfiles().find((p) => p.email === session.user.email);
          if (profile) {
            setCurrentUser(profile);
          }
        }
      });

      const {
        data: { subscription },
      } = sb.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile = db.getProfiles().find((p) => p.email === session.user.email);
          if (profile) setCurrentUser(profile);
        } else if (!localStorage.getItem('campusecho_current_user_id')) {
          setCurrentUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setIsSupabaseLive(false);
    }
  }, []);

  const login = async (email: string, password?: string, designatedRole?: UserRole) => {
    const sb = getSupabase();
    if (sb && password) {
      try {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const profile = db.getProfiles().find((p) => p.email === data.user?.email);
          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem('campusecho_current_user_id', profile.id);
            return { success: true };
          }
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Login failed';
        return { success: false, error: errMsg };
      }
    }

    // Local / Demo Login Flow
    const profiles = db.getProfiles();
    let found = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      // Create profile on the fly if testing with custom email
      const isMustAdmin = email.toLowerCase().includes('admin') || designatedRole === 'admin';
      const newProf: Profile = {
        id: `user-${Date.now()}`,
        full_name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
        email: email,
        role: isMustAdmin ? 'admin' : 'student',
        student_id: isMustAdmin ? undefined : `CT201/${Math.floor(1000 + Math.random() * 9000)}/25`,
        department: isMustAdmin ? 'Dean of Students' : 'Computing & Informatics',
        created_at: new Date().toISOString(),
      };
      found = newProf;
    }

    setCurrentUser(found);
    localStorage.setItem('campusecho_current_user_id', found.id);
    return { success: true };
  };

  const signUp = async (params: {
    fullName: string;
    email: string;
    password?: string;
    role: UserRole;
    studentId?: string;
    department: string;
  }) => {
    const sb = getSupabase();
    if (sb && params.password) {
      try {
        const { data, error } = await sb.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              full_name: params.fullName,
              role: params.role,
              student_id: params.studentId,
              department: params.department,
            },
          },
        });
        if (error) return { success: false, error: error.message };
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : 'Sign up error';
        return { success: false, error: errMsg };
      }
    }

    const newProfile: Profile = {
      id: `prof-${Date.now()}`,
      full_name: params.fullName,
      email: params.email,
      role: params.role,
      student_id: params.studentId,
      department: params.department,
      created_at: new Date().toISOString(),
    };

    setCurrentUser(newProfile);
    localStorage.setItem('campusecho_current_user_id', newProfile.id);
    return { success: true };
  };

  const logout = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    localStorage.removeItem('campusecho_current_user_id');
    setCurrentUser(null);
  };

  const updateCurrentUserProfile = (updates: Partial<Profile>) => {
    if (!currentUser) return;
    const updated = db.updateProfile(currentUser.id, updates);
    if (updated) {
      setCurrentUser(updated);
    }
  };

  const switchDemoUser = (userRole: UserRole) => {
    const profiles = db.getProfiles();
    const target = profiles.find((p) => p.role === userRole);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('campusecho_current_user_id', target.id);
    }
  };

  const role: UserRole = currentUser?.role || 'student';
  const isAuthenticated = currentUser !== null;
  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAuthenticated,
        isAdmin,
        isStudent,
        login,
        signUp,
        logout,
        updateCurrentUserProfile,
        switchDemoUser,
        isSupabaseLive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
