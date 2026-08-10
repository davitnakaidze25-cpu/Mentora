/**
 * profileService — abstraction over /api/tutors endpoints.
 * Firebase equivalent would use:
 *   firebase.firestore().collection('tutorProfiles')
 */

export interface ServiceTutor {
  id: string;
  fullName: string;
  title: string;
  avatarUrl: string;
  institution: string;
  degree: string;
  graduationYear: number;
  verified: boolean;
  featured?: boolean;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  completedHours: number;
  responseTimeMins: number;
  bio: string;
  teachingApproach: string;
  subjects: string[];
  levels: string[];
  achievements: string[];
  availabilitySlots: {
    id: string;
    dayOfWeek: number;
    dayName: string;
    time: string;
    isBooked: boolean;
  }[];
  reviews: {
    id: string;
    authorName: string;
    authorRole: string;
    rating: number;
    date: string;
    comment: string;
    subjectName: string;
    scoreImpact?: string;
  }[];
}

export interface CreateTutorPayload {
  fullName: string;
  email: string;
  gradeLevel: string;
  hourlyRate: number;
  headline: string;
  bio: string;
  subjects: string[];
}

export interface TutorFilterOptions {
  query?: string;
  subject?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  institution?: string;
  sortBy?: string;
}

export async function getTutors(filters?: TutorFilterOptions): Promise<ServiceTutor[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });
  }
  const res = await fetch(`/api/tutors?${params.toString()}`);
  const data = await res.json();
  return data.success ? (data.data as ServiceTutor[]) : [];
}

export async function getTutorById(id: string): Promise<ServiceTutor | null> {
  const res = await fetch(`/api/tutors/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? (data.data as ServiceTutor) : null;
}

export async function getTutorProfileByUserId(userId: string): Promise<ServiceTutor | null> {
  const res = await fetch(`/api/tutor-profile/user/${userId}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? (data.data as ServiceTutor) : null;
}

export async function updateTutorProfile(id: string, payload: Partial<{
  headline: string;
  bio: string;
  hourlyRate: number;
  institution: string;
  degree: string;
  graduationYear: number;
  teachingApproach: string;
  subjects: string[];
}>): Promise<ServiceTutor | null> {
  const res = await fetch(`/api/tutors/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? (data.data as ServiceTutor) : null;
}

export async function createTutorProfile(payload: CreateTutorPayload): Promise<ServiceTutor | null> {
  const res = await fetch('/api/tutors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.success ? (data.data as ServiceTutor) : null;
}
