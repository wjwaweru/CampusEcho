export type UserRole = 'student' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  student_id?: string;
  department: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
}

export interface Course {
  id: string;
  course_code: string;
  course_name: string;
  department: string;
  created_at: string;
}

export type VenueStatus = 'Available' | 'Occupied' | 'Maintenance';

export interface Venue {
  id: string;
  name: string;
  building: string;
  capacity: number;
  description: string;
  status?: VenueStatus;
  created_at: string;
}

export interface AcademicClass {
  id: string;
  class_name: string;
  department: string;
  year: number; // e.g. 1, 2, 3, 4
  student_count?: number;
  created_at: string;
}

export interface Lecturer {
  id: string;
  name: string;
  email: string;
  department: string;
  created_at: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetableEntry {
  id: string;
  course_id: string;
  class_id: string;
  lecturer_id: string;
  venue_id: string;
  day_of_week: DayOfWeek;
  start_time: string; // HH:mm format, e.g. "10:00"
  end_time: string;   // HH:mm format, e.g. "12:00"
  semester: string;   // e.g. "Semester 1"
  academic_year: string; // e.g. "2026/2027"
  created_at: string;

  // Joined fields for easy display
  course?: Course;
  class?: AcademicClass;
  lecturer?: Lecturer;
  venue?: Venue;
}

export type AnnouncementCategory =
  | 'Academic'
  | 'General'
  | 'Emergency'
  | 'Events'
  | 'Fees'
  | 'Exams';

export type AnnouncementPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  author?: string;
  created_at: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  venue_id: string;
  event_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  organizer: string;
  banner_color?: string;
  created_at: string;

  venue?: Venue;
}

export type ReportCategory = 'Facilities' | 'ICT & Labs' | 'Timetable Issue' | 'Hostels' | 'Safety' | 'General';
export type ReportStatus = 'Open' | 'In Progress' | 'Resolved';

export interface IssueReport {
  id: string;
  user_id: string;
  user_name?: string;
  category: ReportCategory;
  title: string;
  description: string;
  location: string;
  status: ReportStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'announcement'
  | 'timetable_change'
  | 'venue_change'
  | 'event_reminder'
  | 'report_update'
  | 'conflict_alert';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link_tab?: string;
  created_at: string;
}

export interface CollisionResult {
  hasCollision: boolean;
  conflictingEntries: TimetableEntry[];
  reason?: string;
  suggestedVenues?: Venue[];
}

export interface TimetableHealthReport {
  totalAnalyzed: number;
  venueCollisions: number;
  lecturerCollisions: number;
  scheduleConflicts: number;
  conflictFreeClasses: number;
  conflictItems: {
    id: string;
    type: 'venue_collision' | 'lecturer_collision' | 'overlap';
    title: string;
    details: string;
    day: DayOfWeek;
    time: string;
    entryA: TimetableEntry;
    entryB: TimetableEntry;
  }[];
}
