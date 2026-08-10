export type EducationLevel = 'HIGH_SCHOOL' | 'UNDERGRADUATE' | 'GRADUATE' | 'OLYMPIAD_SPECIALIST' | 'PROFESSIONAL';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'DECLINED';

export interface Subject {
  id: string;
  name: string;
  category: 'STEM' | 'Olympiad' | 'Competition Math' | 'Physics' | 'Mathematics';
  iconName?: string;
  description?: string;
  popularCount?: number;
}

export interface AvailabilitySlot {
  id: string;
  dayOfWeek: number; // 0=Sun, 1=Mon...
  dayName: string;   // 'Mon', 'Tue'...
  dateStr?: string;  // '2026-08-05'
  time: string;      // '09:00 AM'
  isBooked: boolean;
}

export interface Review {
  id: string;
  authorName: string;
  authorRole: string; // 'Komarovi Student', 'Parent of High Schooler'
  authorAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  subjectName: string;
  scoreImpact?: string; // e.g. 'A+ in Quantum Mechanics', 'USAMO Qualifier', '+1.2 GPA in Physics'
}

export interface Tutor {
  id: string;
  fullName: string;
  title: string;
  avatarUrl: string;
  institution: string;
  institutionLogo?: string;
  degree: string;
  graduationYear: number;
  verified: boolean;
  verificationStatus?: string;
  featured?: boolean;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  completedHours: number;
  responseTimeMins: number;
  bio: string;
  teachingApproach: string;
  subjects: string[];
  levels: EducationLevel[];
  achievements: string[];
  availabilitySlots: AvailabilitySlot[];
  reviews: Review[];
  videoThumbnail?: string;
  acceptanceRate?: string;
}

export interface Booking {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar: string;
  tutorInstitution: string;
  subjectName: string;
  date: string;
  timeSlot: string;
  durationMins: number;
  status: BookingStatus;
  totalPrice: number;
  studentId?: string;
  studentName: string;
  studentNotes?: string;
  meetingLink?: string;
  createdAt: string;
}

export interface FilterOptions {
  searchQuery: string;
  subject: string;
  level: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  institution: string;
  sortBy: 'recommended' | 'rating' | 'price_asc' | 'price_desc' | 'hours';
}

export interface DashboardStats {
  totalHoursStudied: number;
  activeTutorsCount: number;
  upcomingSessionsCount: number;
  averageScoreImprovement: string;
  monthlySpent: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
