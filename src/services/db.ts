import {
  AcademicClass,
  Announcement,
  CampusEvent,
  CollisionResult,
  Course,
  DayOfWeek,
  IssueReport,
  Lecturer,
  Notification,
  Profile,
  TimetableEntry,
  TimetableHealthReport,
  Venue,
} from '../types';
import { getSupabase } from './supabaseClient';

const STORAGE_KEYS = {
  PROFILES: 'campusecho_profiles',
  COURSES: 'campusecho_courses',
  VENUES: 'campusecho_venues',
  CLASSES: 'campusecho_classes',
  LECTURERS: 'campusecho_lecturers',
  TIMETABLE: 'campusecho_timetable',
  ANNOUNCEMENTS: 'campusecho_announcements',
  EVENTS: 'campusecho_events',
  REPORTS: 'campusecho_reports',
  NOTIFICATIONS: 'campusecho_notifications',
};

// Initial Seed Data
const INITIAL_PROFILES: Profile[] = [
  {
    id: 'student-brian-01',
    full_name: 'Brian Mwangi',
    email: 'brian.mwangi@student.must.ac.ke',
    role: 'student',
    student_id: 'CT201/0142/23',
    department: 'Computer Science',
    phone: '+254 712 345 678',
    created_at: new Date('2026-01-10').toISOString(),
  },
  {
    id: 'student-faith-02',
    full_name: 'Faith Chebet',
    email: 'faith.chebet@student.must.ac.ke',
    role: 'student',
    student_id: 'IT202/0088/24',
    department: 'Business Information Technology',
    phone: '+254 722 890 123',
    created_at: new Date('2026-02-15').toISOString(),
  },
  {
    id: 'admin-jane-01',
    full_name: 'Dr. Jane Kariuki',
    email: 'admin.kariuki@must.ac.ke',
    role: 'admin',
    department: 'Academic Registrar & Timetabling',
    phone: '+254 700 112 233',
    created_at: new Date('2025-08-01').toISOString(),
  },
];

const INITIAL_COURSES: Course[] = [
  {
    id: 'c-1',
    course_code: 'BCS 3101',
    course_name: 'Database Systems & Architecture',
    department: 'Computer Science',
    created_at: '2026-01-01',
  },
  {
    id: 'c-2',
    course_code: 'BBIT 2204',
    course_name: 'Web Application Development',
    department: 'Information Technology',
    created_at: '2026-01-01',
  },
  {
    id: 'c-3',
    course_code: 'BCS 2102',
    course_name: 'Data Structures & Algorithms',
    department: 'Computer Science',
    created_at: '2026-01-01',
  },
  {
    id: 'c-4',
    course_code: 'BCS 3205',
    course_name: 'Computer Networks & Security',
    department: 'Computer Science',
    created_at: '2026-01-01',
  },
  {
    id: 'c-5',
    course_code: 'ENG 2104',
    course_name: 'Engineering Mathematics II',
    department: 'Engineering',
    created_at: '2026-01-01',
  },
  {
    id: 'c-6',
    course_code: 'BSE 4102',
    course_name: 'Software Engineering Project Management',
    department: 'Computer Science',
    created_at: '2026-01-01',
  },
];

const INITIAL_VENUES: Venue[] = [
  {
    id: 'v-lab3',
    name: 'Lab 3',
    building: 'Science Complex',
    capacity: 45,
    description: 'Specialized Computer Lab equipped with high-spec workstations and dual projectors',
    status: 'Occupied',
    created_at: '2026-01-01',
  },
  {
    id: 'v-lab1',
    name: 'Lab 1',
    building: 'Computing Block',
    capacity: 40,
    description: 'General programming lab with Linux workstations',
    status: 'Available',
    created_at: '2026-01-01',
  },
  {
    id: 'v-lab2',
    name: 'Lab 2',
    building: 'Computing Block',
    capacity: 50,
    description: 'Hardware, networking and embedded systems laboratory',
    status: 'Available',
    created_at: '2026-01-01',
  },
  {
    id: 'v-lab5',
    name: 'Lab 5',
    building: 'Innovation Wing',
    capacity: 35,
    description: 'AI & Data Science lab with GPU accelerated nodes',
    status: 'Available',
    created_at: '2026-01-01',
  },
  {
    id: 'v-room204',
    name: 'Room 204',
    building: 'Engineering Block',
    capacity: 80,
    description: 'Tiered lecture hall with smart whiteboard and audio system',
    status: 'Available',
    created_at: '2026-01-01',
  },
  {
    id: 'v-lh1',
    name: 'LH 1 (Main Hall)',
    building: 'Lecture Theatre Complex',
    capacity: 150,
    description: 'Large auditorium for combined faculty lectures and townhalls',
    status: 'Available',
    created_at: '2026-01-01',
  },
  {
    id: 'v-sem-b',
    name: 'Seminar Room B',
    building: 'Postgraduate Center',
    capacity: 30,
    description: 'Conference room for research presentations and postgraduate defenses',
    status: 'Available',
    created_at: '2026-01-01',
  },
];

const INITIAL_CLASSES: AcademicClass[] = [
  {
    id: 'cls-cs3',
    class_name: 'BSc Computer Science',
    department: 'Computer Science',
    year: 3,
    student_count: 42,
    created_at: '2026-01-01',
  },
  {
    id: 'cls-bbit2',
    class_name: 'BBIT',
    department: 'Information Technology',
    year: 2,
    student_count: 38,
    created_at: '2026-01-01',
  },
  {
    id: 'cls-cs2',
    class_name: 'BSc Computer Science',
    department: 'Computer Science',
    year: 2,
    student_count: 45,
    created_at: '2026-01-01',
  },
  {
    id: 'cls-se4',
    class_name: 'BSc Software Engineering',
    department: 'Computer Science',
    year: 4,
    student_count: 30,
    created_at: '2026-01-01',
  },
  {
    id: 'cls-eng2',
    class_name: 'BSc Mechanical Engineering',
    department: 'Engineering',
    year: 2,
    student_count: 65,
    created_at: '2026-01-01',
  },
];

const INITIAL_LECTURERS: Lecturer[] = [
  {
    id: 'lec-otieno',
    name: 'Dr. Evans Otieno',
    email: 'evans.otieno@must.ac.ke',
    department: 'Computer Science',
    created_at: '2026-01-01',
  },
  {
    id: 'lec-wanjiku',
    name: 'Dr. Grace Wanjiku',
    email: 'grace.wanjiku@must.ac.ke',
    department: 'Information Technology',
    created_at: '2026-01-01',
  },
  {
    id: 'lec-kiprono',
    name: 'Prof. Samuel Kiprono',
    email: 'samuel.kiprono@must.ac.ke',
    department: 'Mathematics & Computing',
    created_at: '2026-01-01',
  },
  {
    id: 'lec-mutua',
    name: 'Dr. Faith Mutua',
    email: 'faith.mutua@must.ac.ke',
    department: 'Engineering',
    created_at: '2026-01-01',
  },
];

// NOTICE: Includes the deliberate collision scenario requested in Section 7 & 17
const INITIAL_TIMETABLE: TimetableEntry[] = [
  // Class 1 in Lab 3 (10:00 - 12:00)
  {
    id: 'tt-conflict-1',
    course_id: 'c-1', // Database Systems
    class_id: 'cls-cs3', // BSc Computer Science Year 3
    lecturer_id: 'lec-otieno', // Dr. Evans Otieno
    venue_id: 'v-lab3', // Lab 3
    day_of_week: 'Monday',
    start_time: '10:00',
    end_time: '12:00',
    semester: 'Semester 1',
    academic_year: '2026/2027',
    created_at: '2026-02-01T08:00:00Z',
  },
  // Class 2 in Lab 3 (11:00 - 13:00) -> DELIBERATE OVERLAP CONFLICT FOR TESTING!
  {
    id: 'tt-conflict-2',
    course_id: 'c-2', // Web Application Development
    class_id: 'cls-bbit2', // BBIT Year 2
    lecturer_id: 'lec-wanjiku', // Dr. Grace Wanjiku
    venue_id: 'v-lab3', // Lab 3 (Collision!)
    day_of_week: 'Monday',
    start_time: '11:00',
    end_time: '13:00',
    semester: 'Semester 1',
    academic_year: '2026/2027',
    created_at: '2026-02-01T08:30:00Z',
  },
  // Lecturer collision example: Dr. Grace Wanjiku scheduled at 2 places on Wednesday 09:00 - 11:00
  {
    id: 'tt-conflict-lec-1',
    course_id: 'c-2',
    class_id: 'cls-bbit2',
    lecturer_id: 'lec-wanjiku',
    venue_id: 'v-lab1',
    day_of_week: 'Wednesday',
    start_time: '09:00',
    end_time: '11:00',
    semester: 'Semester 1',
    academic_year: '2026/2027',
    created_at: '2026-02-02T09:00:00Z',
  },
  {
    id: 'tt-conflict-lec-2',
    course_id: 'c-4',
    class_id: 'cls-se4',
    lecturer_id: 'lec-wanjiku', // Same lecturer at same time!
    venue_id: 'v-room204',
    day_of_week: 'Wednesday',
    start_time: '10:00',
    end_time: '12:00', // Overlaps 10:00 - 11:00
    semester: 'Semester 1',
    academic_year: '2026/2027',
    created_at: '2026-02-02T09:15:00Z',
  },
  // Other valid, conflict-free classes
  {
    id: 'tt-3',
    course_id: 'c-3', // Data Structures
    class_id: 'cls-cs2',
    lecturer_id: 'lec-kiprono',
    venue_id: 'v-room204',
    day_of_week: 'Monday',
    start_time: '14:00',
    end_time: '16:00',
    semester: 'Semester 1',
    academic_year: '2026/2027',
    created_at: '2026-02-03T10:00:00Z',
  },
  {
    id: 'tt-4',
    course_id: 'c-4', // Networks
    class_id: 'cls-cs3',
    lecturer_id: 'lec-otieno',
    venue_id: 'v-lab2',
    day_of_week: 'Tuesday',
    start_time: '08:00',
    end_time: '10:00',
    semester: 'Semester 1',
    academic_year: '2026/2027',
    created_at: '2026-02-03T11:00:00Z',
  },
  {
    id: 'tt-5',
    course_id: 'c-5', // Engineering Maths
    class_id: 'cls-eng2',
    lecturer_id: 'lec-kiprono',
    venue_id: 'v-lh1',
    day_of_week: 'Tuesday',
    start_time: '11:00',
    end_time: '13:00',
    semester: 'Semester 1',
    academic_year: '2026/2027',
    created_at: '2026-02-04T12:00:00Z',
  },
  {
    id: 'tt-6',
    course_id: 'c-6', // Software Eng
    class_id: 'cls-se4',
    lecturer_id: 'lec-otieno',
    venue_id: 'v-sem-b',
    day_of_week: 'Thursday',
    start_time: '10:00',
    end_time: '12:00',
    semester: 'Semester 1',
    academic_year: '2026/2027',
    created_at: '2026-02-04T14:00:00Z',
  },
  {
    id: 'tt-7',
    course_id: 'c-1', // Database Systems
    class_id: 'cls-cs3',
    lecturer_id: 'lec-otieno',
    venue_id: 'v-lab1',
    day_of_week: 'Friday',
    start_time: '08:00',
    end_time: '11:00',
    semester: 'Semester 1',
    academic_year: '2026/2027',
    created_at: '2026-02-05T08:00:00Z',
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Final Examination Timetable Released (Semester 1)',
    content:
      'The University Examination Office has published the provisional exam schedule for the current academic session. Students are urged to check their student portals and report any course clashes before Friday.',
    category: 'Exams',
    priority: 'Urgent',
    author: 'Registrar Academic Affairs',
    created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  },
  {
    id: 'ann-2',
    title: 'Scheduled ICT Maintenance in Science Complex Lab 3',
    content:
      'Please note that Lab 3 workstations will undergo firmware upgrades and network switch replacements on Saturday from 8:00 AM to 4:00 PM. Alternative practical sessions are reassigned to Lab 2.',
    category: 'General',
    priority: 'High',
    author: 'ICT Directorate',
    created_at: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
  },
  {
    id: 'ann-3',
    title: 'MUST Annual Innovation & Tech Expo 2026',
    content:
      'Calling all tech comrades! Submissions are now open for software prototypes, IoT devices, and agri-tech innovations. Winning projects receive incubation funding and cloud credits.',
    category: 'Events',
    priority: 'Normal',
    author: 'Directorate of Research & Innovation',
    created_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
  },
  {
    id: 'ann-4',
    title: 'HELB & Campus Bursary Validation Deadline',
    content:
      'All government-sponsored and self-sponsored students applying for county and university tuition waivers must submit their biometric confirmation at the Student Welfare Office.',
    category: 'Fees',
    priority: 'High',
    author: 'Dean of Students',
    created_at: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
  },
];

const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'ev-1',
    title: 'Inter-Faculty Football Championship: Computing vs Engineering',
    description:
      'The biggest sports showdown of the semester! Come rally behind the tech comrades at the university sports complex.',
    venue_id: 'v-lh1',
    event_date: new Date().toISOString().split('T')[0], // Today
    start_time: '16:00',
    end_time: '18:30',
    organizer: 'MUST Sports & Games Department',
    banner_color: 'from-emerald-600 to-teal-800',
    created_at: '2026-03-01',
  },
  {
    id: 'ev-2',
    title: 'Google Developer Student Clubs (GDSC) Cloud Study Jam',
    description:
      'Hands-on workshop on Kubernetes, Cloud Run, and Gemini SDK for students. Free swags and completion badges.',
    venue_id: 'v-lab3',
    event_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // This week
    start_time: '14:00',
    end_time: '17:00',
    organizer: 'GDSC MUST Chapter',
    banner_color: 'from-blue-600 to-indigo-800',
    created_at: '2026-03-02',
  },
  {
    id: 'ev-3',
    title: 'Career & Graduate Placement Mentorship Summit',
    description:
      'Meet recruiters from top tech companies, telecom operators, and financial institutions across East Africa.',
    venue_id: 'v-lh1',
    event_date: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0], // This month
    start_time: '09:00',
    end_time: '16:00',
    organizer: 'Career Services & Alumni Association',
    banner_color: 'from-amber-600 to-orange-800',
    created_at: '2026-03-03',
  },
];

const INITIAL_REPORTS: IssueReport[] = [
  {
    id: 'rep-1',
    user_id: 'student-brian-01',
    user_name: 'Brian Mwangi',
    category: 'ICT & Labs',
    title: 'Ceiling projector lamp flicker in Room 204',
    description:
      'During lectures, the projector loses HDMI signal every 5 minutes, interrupting screen shares.',
    location: 'Engineering Block - Room 204',
    status: 'In Progress',
    admin_notes: 'Technician dispatched to replace HDMI splitter and check cable run.',
    created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  },
  {
    id: 'rep-2',
    user_id: 'student-faith-02',
    user_name: 'Faith Chebet',
    category: 'Facilities',
    title: 'Air conditioning water leakage on desk row 3',
    description:
      'Condensation dripping onto desktop power outlets near the window corner in Lab 3.',
    location: 'Science Complex - Lab 3',
    status: 'Open',
    admin_notes: '',
    created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  },
  {
    id: 'rep-3',
    user_id: 'student-brian-01',
    user_name: 'Brian Mwangi',
    category: 'Timetable Issue',
    title: 'Collision in Lab 3 between BCS and BBIT on Monday morning',
    description:
      'Both BCS 3101 and BBIT 2204 are scheduled at the same time in Lab 3. We cannot hold both practicals.',
    location: 'Science Complex - Lab 3',
    status: 'In Progress',
    admin_notes: 'Under review by Academic Registrar Timetabling Committee.',
    created_at: new Date(Date.now() - 3600 * 1000 * 36).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'student-brian-01',
    title: 'Timetable Collision Detected',
    message: 'Lab 3 has an overlapping booking for Monday between BCS 3101 and BBIT 2204.',
    type: 'conflict_alert',
    is_read: false,
    link_tab: 'timetable',
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'student-brian-01',
    title: 'Exam Schedule Published',
    message: 'Final Examination Timetable for Semester 1 has been officially released.',
    type: 'announcement',
    is_read: false,
    link_tab: 'announcements',
    created_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: 'student-brian-01',
    title: 'Issue Report Update',
    message: 'Your report "Ceiling projector lamp flicker in Room 204" is now In Progress.',
    type: 'report_update',
    is_read: true,
    link_tab: 'reports',
    created_at: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
  },
];

// Local Storage Helper
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved);
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

// Convert "HH:mm" to minutes from 00:00
export function timeToMinutes(t: string): number {
  if (!t) return 0;
  const parts = t.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

// Database Service
class DatabaseService {
  private profiles: Profile[] = [];
  private courses: Course[] = [];
  private venues: Venue[] = [];
  private classes: AcademicClass[] = [];
  private lecturers: Lecturer[] = [];
  private timetable: TimetableEntry[] = [];
  private announcements: Announcement[] = [];
  private events: CampusEvent[] = [];
  private reports: IssueReport[] = [];
  private notifications: Notification[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    this.profiles = loadFromStorage(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    this.courses = loadFromStorage(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    this.venues = loadFromStorage(STORAGE_KEYS.VENUES, INITIAL_VENUES);
    this.classes = loadFromStorage(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    this.lecturers = loadFromStorage(STORAGE_KEYS.LECTURERS, INITIAL_LECTURERS);
    this.timetable = loadFromStorage(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE);
    this.announcements = loadFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    this.events = loadFromStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    this.reports = loadFromStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    this.notifications = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public resetToSampleData() {
    this.profiles = [...INITIAL_PROFILES];
    this.courses = [...INITIAL_COURSES];
    this.venues = [...INITIAL_VENUES];
    this.classes = [...INITIAL_CLASSES];
    this.lecturers = [...INITIAL_LECTURERS];
    this.timetable = [...INITIAL_TIMETABLE];
    this.announcements = [...INITIAL_ANNOUNCEMENTS];
    this.events = [...INITIAL_EVENTS];
    this.reports = [...INITIAL_REPORTS];
    this.notifications = [...INITIAL_NOTIFICATIONS];

    saveToStorage(STORAGE_KEYS.PROFILES, this.profiles);
    saveToStorage(STORAGE_KEYS.COURSES, this.courses);
    saveToStorage(STORAGE_KEYS.VENUES, this.venues);
    saveToStorage(STORAGE_KEYS.CLASSES, this.classes);
    saveToStorage(STORAGE_KEYS.LECTURERS, this.lecturers);
    saveToStorage(STORAGE_KEYS.TIMETABLE, this.timetable);
    saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, this.announcements);
    saveToStorage(STORAGE_KEYS.EVENTS, this.events);
    saveToStorage(STORAGE_KEYS.REPORTS, this.reports);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);

    this.notify();
  }

  // --- Profiles ---
  public getProfiles(): Profile[] {
    return [...this.profiles];
  }

  public getProfileById(id: string): Profile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  public updateProfile(id: string, updates: Partial<Profile>): Profile | null {
    const index = this.profiles.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.profiles[index] = { ...this.profiles[index], ...updates };
    saveToStorage(STORAGE_KEYS.PROFILES, this.profiles);
    this.notify();
    return this.profiles[index];
  }

  // --- Courses ---
  public getCourses(): Course[] {
    return [...this.courses];
  }

  public addCourse(course: Omit<Course, 'id' | 'created_at'>): Course {
    const newCourse: Course = {
      ...course,
      id: `c-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.courses.unshift(newCourse);
    saveToStorage(STORAGE_KEYS.COURSES, this.courses);
    this.notify();
    return newCourse;
  }

  // --- Venues ---
  public getVenues(): Venue[] {
    return [...this.venues];
  }

  public getVenueById(id: string): Venue | undefined {
    return this.venues.find((v) => v.id === id);
  }

  public addVenue(venue: Omit<Venue, 'id' | 'created_at'>): Venue {
    const newVenue: Venue = {
      ...venue,
      id: `v-${Date.now()}`,
      status: venue.status || 'Available',
      created_at: new Date().toISOString(),
    };
    this.venues.push(newVenue);
    saveToStorage(STORAGE_KEYS.VENUES, this.venues);
    this.notify();
    return newVenue;
  }

  public updateVenue(id: string, updates: Partial<Venue>): Venue | null {
    const idx = this.venues.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    this.venues[idx] = { ...this.venues[idx], ...updates };
    saveToStorage(STORAGE_KEYS.VENUES, this.venues);
    this.notify();
    return this.venues[idx];
  }

  public deleteVenue(id: string): boolean {
    const initialLen = this.venues.length;
    this.venues = this.venues.filter((v) => v.id !== id);
    if (this.venues.length !== initialLen) {
      saveToStorage(STORAGE_KEYS.VENUES, this.venues);
      this.notify();
      return true;
    }
    return false;
  }

  // --- Classes & Lecturers ---
  public getClasses(): AcademicClass[] {
    return [...this.classes];
  }

  public getLecturers(): Lecturer[] {
    return [...this.lecturers];
  }

  // --- Timetable & Joins ---
  public getTimetable(): TimetableEntry[] {
    return this.timetable.map((t) => this.populateTimetableEntry(t));
  }

  private populateTimetableEntry(entry: TimetableEntry): TimetableEntry {
    return {
      ...entry,
      course: this.courses.find((c) => c.id === entry.course_id),
      class: this.classes.find((cl) => cl.id === entry.class_id),
      lecturer: this.lecturers.find((l) => l.id === entry.lecturer_id),
      venue: this.venues.find((v) => v.id === entry.venue_id),
    };
  }

  // --- COLLISION DETECTION ENGINE (Section 7) ---
  // A collision occurs when:
  // 1. The venue is the same
  // 2. The day is the same
  // 3. The class times overlap
  public checkVenueCollision(
    venueId: string,
    day: DayOfWeek,
    startTime: string,
    endTime: string,
    excludeEntryId?: string
  ): CollisionResult {
    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    if (newStart >= newEnd) {
      return {
        hasCollision: true,
        conflictingEntries: [],
        reason: 'End time must be after start time.',
      };
    }

    const conflicts = this.timetable
      .filter((entry) => {
        if (excludeEntryId && entry.id === excludeEntryId) return false;
        if (entry.venue_id !== venueId) return false;
        if (entry.day_of_week !== day) return false;

        const entryStart = timeToMinutes(entry.start_time);
        const entryEnd = timeToMinutes(entry.end_time);

        // Overlap: (newStart < entryEnd) && (newEnd > entryStart)
        return newStart < entryEnd && newEnd > entryStart;
      })
      .map((entry) => this.populateTimetableEntry(entry));

    if (conflicts.length > 0) {
      const first = conflicts[0];
      const venueName = first.venue?.name || 'Selected Venue';
      const reason = `${venueName} is already occupied from ${first.start_time} to ${first.end_time}.`;

      // Find suggested alternative venues that are AVAILABLE during this time
      const suggestedVenues = this.venues.filter((v) => {
        if (v.id === venueId) return false;
        // Check if v has any conflict at this day & time
        const hasAlternativeConflict = this.timetable.some((entry) => {
          if (entry.venue_id !== v.id || entry.day_of_week !== day) return false;
          const eStart = timeToMinutes(entry.start_time);
          const eEnd = timeToMinutes(entry.end_time);
          return newStart < eEnd && newEnd > eStart;
        });
        return !hasAlternativeConflict;
      });

      return {
        hasCollision: true,
        conflictingEntries: conflicts,
        reason,
        suggestedVenues: suggestedVenues.slice(0, 4),
      };
    }

    return {
      hasCollision: false,
      conflictingEntries: [],
    };
  }

  // Check Lecturer Collision (Lecturer cannot be in 2 classes at once)
  public checkLecturerCollision(
    lecturerId: string,
    day: DayOfWeek,
    startTime: string,
    endTime: string,
    excludeEntryId?: string
  ): { hasCollision: boolean; conflictingEntry?: TimetableEntry } {
    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    const conflict = this.timetable.find((entry) => {
      if (excludeEntryId && entry.id === excludeEntryId) return false;
      if (entry.lecturer_id !== lecturerId) return false;
      if (entry.day_of_week !== day) return false;

      const entryStart = timeToMinutes(entry.start_time);
      const entryEnd = timeToMinutes(entry.end_time);
      return newStart < entryEnd && newEnd > entryStart;
    });

    if (conflict) {
      return {
        hasCollision: true,
        conflictingEntry: this.populateTimetableEntry(conflict),
      };
    }

    return { hasCollision: false };
  }

  // Save Timetable Entry (Guarded against collisions!)
  public addTimetableEntry(
    entry: Omit<TimetableEntry, 'id' | 'created_at'>,
    bypassCheck: boolean = false
  ): { success: boolean; entry?: TimetableEntry; error?: string; collisionResult?: CollisionResult } {
    if (!bypassCheck) {
      const collision = this.checkVenueCollision(
        entry.venue_id,
        entry.day_of_week,
        entry.start_time,
        entry.end_time
      );

      if (collision.hasCollision) {
        return {
          success: false,
          error: collision.reason || 'Venue collision detected.',
          collisionResult: collision,
        };
      }
    }

    const newEntry: TimetableEntry = {
      ...entry,
      id: `tt-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    this.timetable.push(newEntry);
    saveToStorage(STORAGE_KEYS.TIMETABLE, this.timetable);

    // Create notification for students
    this.addNotification({
      user_id: 'all_students',
      title: 'Timetable Updated',
      message: `New class schedule added for ${entry.day_of_week} ${entry.start_time} - ${entry.end_time}.`,
      type: 'timetable_change',
      link_tab: 'timetable',
    });

    this.notify();
    return { success: true, entry: this.populateTimetableEntry(newEntry) };
  }

  public updateTimetableEntry(
    id: string,
    updates: Partial<TimetableEntry>,
    bypassCheck: boolean = false
  ): { success: boolean; error?: string; collisionResult?: CollisionResult } {
    const idx = this.timetable.findIndex((t) => t.id === id);
    if (idx === -1) return { success: false, error: 'Entry not found' };

    const current = this.timetable[idx];
    const candidateVenue = updates.venue_id || current.venue_id;
    const candidateDay = updates.day_of_week || current.day_of_week;
    const candidateStart = updates.start_time || current.start_time;
    const candidateEnd = updates.end_time || current.end_time;

    if (!bypassCheck) {
      const collision = this.checkVenueCollision(
        candidateVenue,
        candidateDay,
        candidateStart,
        candidateEnd,
        id
      );

      if (collision.hasCollision) {
        return {
          success: false,
          error: collision.reason || 'Venue collision detected.',
          collisionResult: collision,
        };
      }
    }

    this.timetable[idx] = { ...current, ...updates };
    saveToStorage(STORAGE_KEYS.TIMETABLE, this.timetable);
    this.notify();
    return { success: true };
  }

  public deleteTimetableEntry(id: string): boolean {
    const len = this.timetable.length;
    this.timetable = this.timetable.filter((t) => t.id !== id);
    if (this.timetable.length !== len) {
      saveToStorage(STORAGE_KEYS.TIMETABLE, this.timetable);
      this.notify();
      return true;
    }
    return false;
  }

  // --- TIMETABLE HEALTH CHECK (Section 9) ---
  public runTimetableHealthCheck(): TimetableHealthReport {
    const totalAnalyzed = this.timetable.length;
    const venueCollisions: {
      id: string;
      title: string;
      details: string;
      day: DayOfWeek;
      time: string;
      entryA: TimetableEntry;
      entryB: TimetableEntry;
    }[] = [];
    const lecturerCollisions: {
      id: string;
      title: string;
      details: string;
      day: DayOfWeek;
      time: string;
      entryA: TimetableEntry;
      entryB: TimetableEntry;
    }[] = [];

    const conflictedEntryIds = new Set<string>();

    for (let i = 0; i < this.timetable.length; i++) {
      const a = this.timetable[i];
      const startA = timeToMinutes(a.start_time);
      const endA = timeToMinutes(a.end_time);

      for (let j = i + 1; j < this.timetable.length; j++) {
        const b = this.timetable[j];
        if (a.day_of_week !== b.day_of_week) continue;

        const startB = timeToMinutes(b.start_time);
        const endB = timeToMinutes(b.end_time);
        const overlaps = startA < endB && endA > startB;

        if (!overlaps) continue;

        const popA = this.populateTimetableEntry(a);
        const popB = this.populateTimetableEntry(b);

        // 1. Venue collision check
        if (a.venue_id === b.venue_id) {
          conflictedEntryIds.add(a.id);
          conflictedEntryIds.add(b.id);
          const vName = popA.venue?.name || 'Venue';
          venueCollisions.push({
            id: `vc-${a.id}-${b.id}`,
            title: `Venue Collision at ${vName}`,
            details: `Both ${popA.course?.course_name || popA.course?.course_code} (${popA.class?.class_name}) and ${popB.course?.course_name || popB.course?.course_code} (${popB.class?.class_name}) are assigned to ${vName} at overlapping times.`,
            day: a.day_of_week,
            time: `${Math.max(startA, startB) === startA ? a.start_time : b.start_time} - ${Math.min(endA, endB) === endA ? a.end_time : b.end_time}`,
            entryA: popA,
            entryB: popB,
          });
        }

        // 2. Lecturer collision check
        if (a.lecturer_id === b.lecturer_id) {
          conflictedEntryIds.add(a.id);
          conflictedEntryIds.add(b.id);
          const lecName = popA.lecturer?.name || 'Lecturer';
          lecturerCollisions.push({
            id: `lc-${a.id}-${b.id}`,
            title: `Lecturer Conflict: ${lecName}`,
            details: `${lecName} is scheduled to teach ${popA.class?.class_name} in ${popA.venue?.name} and ${popB.class?.class_name} in ${popB.venue?.name} at the same time.`,
            day: a.day_of_week,
            time: `${a.start_time} - ${a.end_time}`,
            entryA: popA,
            entryB: popB,
          });
        }
      }
    }

    const totalConflicts = venueCollisions.length + lecturerCollisions.length;
    const conflictFreeClasses = Math.max(0, totalAnalyzed - conflictedEntryIds.size);

    return {
      totalAnalyzed,
      venueCollisions: venueCollisions.length,
      lecturerCollisions: lecturerCollisions.length,
      scheduleConflicts: totalConflicts,
      conflictFreeClasses,
      conflictItems: [
        ...venueCollisions.map((vc) => ({
          ...vc,
          type: 'venue_collision' as const,
        })),
        ...lecturerCollisions.map((lc) => ({
          ...lc,
          type: 'lecturer_collision' as const,
        })),
      ],
    };
  }

  // --- Announcements ---
  public getAnnouncements(): Announcement[] {
    return [...this.announcements].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public addAnnouncement(ann: Omit<Announcement, 'id' | 'created_at'>): Announcement {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.announcements.unshift(newAnn);
    saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, this.announcements);

    // Push notification to students
    this.addNotification({
      user_id: 'all_students',
      title: `Announcement: ${newAnn.title}`,
      message: newAnn.content.slice(0, 100) + '...',
      type: 'announcement',
      link_tab: 'announcements',
    });

    this.notify();
    return newAnn;
  }

  public updateAnnouncement(id: string, updates: Partial<Announcement>): Announcement | null {
    const idx = this.announcements.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.announcements[idx] = { ...this.announcements[idx], ...updates };
    saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, this.announcements);
    this.notify();
    return this.announcements[idx];
  }

  public deleteAnnouncement(id: string): boolean {
    const len = this.announcements.length;
    this.announcements = this.announcements.filter((a) => a.id !== id);
    if (this.announcements.length !== len) {
      saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, this.announcements);
      this.notify();
      return true;
    }
    return false;
  }

  // --- Events ---
  public getEvents(): CampusEvent[] {
    return this.events
      .map((ev) => ({
        ...ev,
        venue: this.venues.find((v) => v.id === ev.venue_id),
      }))
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }

  public addEvent(ev: Omit<CampusEvent, 'id' | 'created_at'>): CampusEvent {
    const newEv: CampusEvent = {
      ...ev,
      id: `ev-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.events.push(newEv);
    saveToStorage(STORAGE_KEYS.EVENTS, this.events);

    this.addNotification({
      user_id: 'all_students',
      title: `Upcoming Event: ${newEv.title}`,
      message: `Scheduled on ${newEv.event_date} from ${newEv.start_time} to ${newEv.end_time}.`,
      type: 'event_reminder',
      link_tab: 'events',
    });

    this.notify();
    return {
      ...newEv,
      venue: this.venues.find((v) => v.id === newEv.venue_id),
    };
  }

  public updateEvent(id: string, updates: Partial<CampusEvent>): CampusEvent | null {
    const idx = this.events.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.events[idx] = { ...this.events[idx], ...updates };
    saveToStorage(STORAGE_KEYS.EVENTS, this.events);
    this.notify();
    return this.events[idx];
  }

  public deleteEvent(id: string): boolean {
    const len = this.events.length;
    this.events = this.events.filter((e) => e.id !== id);
    if (this.events.length !== len) {
      saveToStorage(STORAGE_KEYS.EVENTS, this.events);
      this.notify();
      return true;
    }
    return false;
  }

  // --- Reports (Student Issues) ---
  public getReports(userId?: string): IssueReport[] {
    if (userId) {
      return this.reports.filter((r) => r.user_id === userId);
    }
    return [...this.reports].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public addReport(rep: Omit<IssueReport, 'id' | 'created_at' | 'updated_at'>): IssueReport {
    const newRep: IssueReport = {
      ...rep,
      id: `rep-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.reports.unshift(newRep);
    saveToStorage(STORAGE_KEYS.REPORTS, this.reports);
    this.notify();
    return newRep;
  }

  public updateReportStatus(
    id: string,
    status: IssueReport['status'],
    admin_notes?: string
  ): IssueReport | null {
    const idx = this.reports.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const current = this.reports[idx];
    this.reports[idx] = {
      ...current,
      status,
      admin_notes: admin_notes !== undefined ? admin_notes : current.admin_notes,
      updated_at: new Date().toISOString(),
    };

    saveToStorage(STORAGE_KEYS.REPORTS, this.reports);

    // Notify student about report update
    this.addNotification({
      user_id: current.user_id,
      title: `Report Status: ${status}`,
      message: `Your report "${current.title}" has been updated to "${status}".`,
      type: 'report_update',
      link_tab: 'reports',
    });

    this.notify();
    return this.reports[idx];
  }

  // --- Notifications ---
  public getNotifications(userId: string): Notification[] {
    return this.notifications.filter(
      (n) => n.user_id === userId || n.user_id === 'all_students'
    );
  }

  public addNotification(
    notif: Omit<Notification, 'id' | 'created_at' | 'is_read'>
  ): Notification {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.notifications.unshift(newNotif);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
    return newNotif;
  }

  public markNotificationAsRead(id: string) {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.notifications[idx].is_read = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
      this.notify();
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    this.notifications.forEach((n) => {
      if (n.user_id === userId || n.user_id === 'all_students') {
        n.is_read = true;
      }
    });
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  // --- Global Search (Section 12) ---
  public searchCampus(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        venues: [],
        courses: [],
        events: [],
        announcements: [],
      };
    }

    const matchedVenues = this.venues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.building.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
    );

    const matchedCourses = this.courses.filter(
      (c) =>
        c.course_code.toLowerCase().includes(q) ||
        c.course_name.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
    );

    const matchedEvents = this.getEvents().filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        (e.venue && e.venue.name.toLowerCase().includes(q))
    );

    const matchedAnnouncements = this.announcements.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );

    return {
      venues: matchedVenues,
      courses: matchedCourses,
      events: matchedEvents,
      announcements: matchedAnnouncements,
    };
  }
}

export const db = new DatabaseService();
