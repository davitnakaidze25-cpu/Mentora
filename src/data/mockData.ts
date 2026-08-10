import { Tutor, Subject, Review, Booking } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'subj-1', name: 'All Physics & Math', category: 'STEM', description: 'Comprehensive physics and mathematics guidance for all school grades', popularCount: 2420 },
  { id: 'subj-2', name: 'Olympiad Physics', category: 'STEM', description: 'National and International Physics Olympiad (IPhO) preparation', popularCount: 1890 },
  { id: 'subj-3', name: 'Olympiad Math', category: 'STEM', description: 'National & International Mathematical Olympiad (IMO) proof training', popularCount: 2150 },
  { id: 'subj-4', name: 'Calculus & Analysis', category: 'STEM', description: 'Differential & integral calculus, limits, series & real analysis', popularCount: 1640 },
  { id: 'subj-5', name: 'Algebra & Geometry', category: 'STEM', description: 'Advanced polynomial algebra, synthetic and vector geometry', popularCount: 2100 },
  { id: 'subj-6', name: 'Classical Mechanics', category: 'STEM', description: 'Newtonian dynamics, conservation laws, rotational motion & statics', popularCount: 1350 },
];

export const MOCK_TUTORS: Tutor[] = [];

export const MOCK_BOOKINGS: Booking[] = [];

export const TRUST_METRICS = {
  activeTutors: '150+',
  acceptanceRate: 'Komarovi Verified',
  verifiedHours: '2,500+',
  avgScoreIncrease: 'National Olympiad Rank Improvement',
  satisfactionGuarantee: '100% Satisfaction or Full Refund'
};

export const UNIVERSITY_LOGOS = [
  { name: 'Komarovi Grade 10', label: 'Komarovi School Grade 10 Mentors' },
  { name: 'Komarovi Grade 11', label: 'Komarovi School Grade 11 Mentors' },
  { name: 'Komarovi Grade 12', label: 'Komarovi School Grade 12 Mentors' },
  { name: 'Komarovi Alumni', label: 'Komarovi Olympiad Alumni' },
  { name: 'National Public School N199', label: 'Komarovi School N199' },
];
