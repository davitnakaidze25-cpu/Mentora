/**
 * profileService — queries Supabase directly for reliability on Vercel.
 */

import { supabase } from '../lib/supabase';

export interface ServiceTutor {
  id: string;
  fullName: string;
  title: string;
  avatarUrl: string;
  institution: string;
  degree: string;
  graduationYear: number;
  verified: boolean;
  verificationStatus: string;
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

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function mapRow(t: any): ServiceTutor {
  const user = t.user ?? {};
  const subjects = (t.TutorSubject ?? []).map((ts: any) => ts.Subject?.name ?? ts.subject?.name ?? '');
  const levels = (t.TutorSubject ?? []).map((ts: any) => ts.level ?? '');
  const slots = (t.AvailabilitySlot ?? []).map((s: any) => ({
    id: s.id,
    dayOfWeek: s.dayOfWeek,
    dayName: DAYS[s.dayOfWeek] ?? '',
    time: s.startTime,
    isBooked: s.isBooked,
  }));
  const reviews = (t.Review ?? []).map((r: any) => ({
    id: r.id,
    authorName: r.author?.fullName ?? 'Student',
    authorRole: r.author?.role ?? 'STUDENT',
    rating: r.rating,
    date: r.createdAt?.split('T')[0] ?? '',
    comment: r.comment ?? '',
    subjectName: 'Physics/Math',
    scoreImpact: r.scoreImpact ?? '',
  }));

  return {
    id: t.id,
    fullName: user.fullName ?? 'Komarovi Mentor',
    title: t.headline ?? '',
    avatarUrl: user.avatarUrl ?? '/guest-avatar.png',
    institution: t.institution ?? '',
    degree: t.degree ?? '',
    graduationYear: t.graduationYear ?? 2026,
    verified: t.verificationStatus === 'VERIFIED',
    verificationStatus: t.verificationStatus ?? 'PENDING',
    featured: t.featured ?? false,
    hourlyRate: t.hourlyRate ?? 0,
    rating: t.rating ?? 5,
    reviewCount: t.reviewCount ?? 0,
    completedHours: t.completedHours ?? 0,
    responseTimeMins: t.responseTimeMins ?? 15,
    bio: t.bio ?? '',
    teachingApproach: 'First-principles problem solving.',
    subjects,
    levels,
    achievements: [],
    availabilitySlots: slots,
    reviews,
  };
}

const TUTOR_SELECT = `
  id, headline, bio, hourlyRate, institution, degree, graduationYear,
  verificationStatus, rating, reviewCount, completedHours, responseTimeMins, featured, createdAt, userId,
  user:userId(fullName, avatarUrl),
  TutorSubject(level, Subject(name)),
  AvailabilitySlot(id, dayOfWeek, startTime, isBooked),
  Review(id, rating, comment, scoreImpact, createdAt, author:authorId(fullName, role))
`;

export async function getTutors(filters?: TutorFilterOptions): Promise<ServiceTutor[]> {
  let query = supabase
    .from('TutorProfile')
    .select(TUTOR_SELECT)
    .eq('verificationStatus', 'VERIFIED');

  if (filters?.minPrice) query = query.gte('hourlyRate', filters.minPrice);
  if (filters?.maxPrice) query = query.lte('hourlyRate', filters.maxPrice);
  if (filters?.minRating) query = query.gte('rating', filters.minRating);
  if (filters?.sortBy === 'rating') query = query.order('rating', { ascending: false });
  else if (filters?.sortBy === 'price_asc') query = query.order('hourlyRate', { ascending: true });
  else if (filters?.sortBy === 'price_desc') query = query.order('hourlyRate', { ascending: false });

  const { data, error } = await query;
  if (error) { console.error('[profileService] getTutors error:', error); return []; }

  let results = (data as any[]).map(mapRow);

  if (filters?.query?.trim()) {
    const q = filters.query.toLowerCase();
    results = results.filter(t =>
      t.fullName.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.institution.toLowerCase().includes(q) ||
      t.bio.toLowerCase().includes(q) ||
      t.subjects.some((s: string) => s.toLowerCase().includes(q))
    );
  }
  if (filters?.subject && filters.subject !== 'All') {
    results = results.filter(t => t.subjects.includes(filters.subject!));
  }
  if (filters?.institution && filters.institution !== 'All') {
    results = results.filter(t => t.institution.toLowerCase().includes(filters.institution!.toLowerCase()));
  }

  return results;
}

export async function getTutorById(id: string): Promise<ServiceTutor | null> {
  const { data, error } = await supabase
    .from('TutorProfile')
    .select(TUTOR_SELECT)
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return mapRow(data);
}

export async function getTutorProfileByUserId(userId: string): Promise<ServiceTutor | null> {
  const { data, error } = await supabase
    .from('TutorProfile')
    .select(TUTOR_SELECT)
    .eq('userId', userId)
    .single();
  if (error || !data) return null;
  return mapRow(data);
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
  const { subjects: _subjects, teachingApproach: _ta, ...rest } = payload;
  const { error } = await supabase
    .from('TutorProfile')
    .update(rest)
    .eq('id', id);
  if (error) { console.error('[profileService] updateTutorProfile error:', error); return null; }
  return getTutorById(id);
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
