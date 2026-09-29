export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- CAMPUS ECHO — PostgreSQL Database Schema for Supabase
-- Run this in your Supabase SQL Editor to provision all tables and security policies.
-- ==============================================================================

-- 1. PROFILES TABLE (Linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  student_id TEXT,
  department TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code TEXT NOT NULL UNIQUE,
  course_name TEXT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. VENUES TABLE
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  building TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. CLASSES TABLE
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_name TEXT NOT NULL,
  department TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. LECTURERS TABLE
CREATE TABLE IF NOT EXISTS public.lecturers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. TIMETABLE TABLE
CREATE TABLE IF NOT EXISTS public.timetable (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  lecturer_id UUID REFERENCES public.lecturers(id) ON DELETE RESTRICT NOT NULL,
  venue_id UUID REFERENCES public.venues(id) ON DELETE RESTRICT NOT NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  semester TEXT NOT NULL DEFAULT 'Semester 1',
  academic_year TEXT NOT NULL DEFAULT '2026/2027',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- 7. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Academic', 'General', 'Emergency', 'Events', 'Fees', 'Exams')),
  priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  organizer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. ISSUE REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.issue_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Users can read their own profile, Admins can read all profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Public read access for academic resources (courses, venues, classes, lecturers, timetable, announcements, events)
CREATE POLICY "Public read courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read venues" ON public.venues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read classes" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read lecturers" ON public.lecturers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read timetable" ON public.timetable FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read events" ON public.events FOR SELECT TO authenticated USING (true);

-- Admin write access for campus data
CREATE POLICY "Admin write courses" ON public.courses FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin write venues" ON public.venues FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin write classes" ON public.classes FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin write lecturers" ON public.lecturers FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin write timetable" ON public.timetable FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin write announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin write events" ON public.events FOR ALL TO authenticated USING (public.is_admin());

-- Issue reports: Students create and read their own, Admins view and manage all
CREATE POLICY "Students can read their own reports" ON public.issue_reports
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Students can insert their own reports" ON public.issue_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update reports" ON public.issue_reports
  FOR UPDATE TO authenticated USING (public.is_admin());

-- Notifications: Users only read and update their own notifications
CREATE POLICY "Users can access own notifications" ON public.notifications
  FOR ALL TO authenticated USING (auth.uid() = user_id);
`;
