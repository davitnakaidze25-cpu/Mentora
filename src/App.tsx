import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Messenger } from './components/chat/Messenger';
import { Footer } from './components/common/Footer';
import { ScrollToTop } from './components/common/ScrollToTop';
import { HeroSection } from './components/home/HeroSection';
import { FeaturedTutors } from './components/home/FeaturedTutors';
import { SubjectCategories } from './components/home/SubjectCategories';
import { TutorProfileModal } from './components/tutor/TutorProfileModal';
import { BookingModal } from './components/tutor/BookingModal';
import { ProfileSettingsModal } from './components/common/ProfileSettingsModal';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { TutorDashboard } from './components/dashboard/TutorDashboard';
import { AdminApprovalDashboard } from './components/dashboard/AdminApprovalDashboard';
import { FilterSidebar } from './components/search/FilterSidebar';
import { TutorCard } from './components/tutor/TutorCard';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './context/AuthContext';
import { getTutorProfileByUserId, updateTutorProfile } from './services/profileService';
import { MOCK_TUTORS, INITIAL_SUBJECTS, MOCK_BOOKINGS } from './data/mockData';
import { Tutor, Subject, Booking, FilterOptions, AvailabilitySlot } from './types';
import { TutorProfilePage } from './pages/TutorProfilePage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [messengerOtherUserId, setMessengerOtherUserId] = useState<string | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>(MOCK_TUTORS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [selectedTutorForProfile, setSelectedTutorForProfile] = useState<Tutor | null>(null);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState<Tutor | null>(null);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<AvailabilitySlot | null>(null);
  const [currentTutorProfile, setCurrentTutorProfile] = useState<Tutor | null>(null);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [pendingAuthPath, setPendingAuthPath] = useState<string | null>(null);

  const { currentUser, updateProfile } = useAuth();
  const isTutor = currentUser?.role === 'TUTOR';
  const isAdmin = currentUser?.role === 'ADMIN';
  const canBook = !!currentUser && !isTutor && !isAdmin;

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    subject: 'All',
    level: 'All',
    minPrice: 10,
    maxPrice: 100,
    minRating: 0,
    institution: 'All',
    sortBy: 'recommended'
  });

  const loadBookings = async () => {
    if (!currentUser) return;
    try {
      const params = new URLSearchParams();
      if (currentUser.role === 'STUDENT') {
        params.set('studentId', currentUser.id);
      } else if (currentUser.role === 'TUTOR') {
        if (currentTutorProfile) {
          params.set('tutorProfileId', currentTutorProfile.id);
        } else {
          const profile = await getTutorProfileByUserId(currentUser.id);
          if (profile) {
            setCurrentTutorProfile(profile);
            params.set('tutorProfileId', profile.id);
          }
        }
      }
      
      const bookRes = await fetch(`/api/bookings?${params}`);
      if (bookRes.ok) {
        const bData = await bookRes.json();
        if (bData.data) setBookings(bData.data);
      }
    } catch {}
  };

  useEffect(() => {
    async function loadData() {
      try {
        const tutorsRes = await fetch('/api/tutors');
        if (tutorsRes.ok) {
          const tData = await tutorsRes.json();
          if (tData.data) setTutors(tData.data);
        }

        const subRes = await fetch('/api/subjects');
        if (subRes.ok) {
          const sData = await subRes.json();
          if (sData.data) setSubjects(sData.data);
        }
      } catch (err) {
        console.warn('API error, using fallback mock data', err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    loadBookings();
  }, [currentUser, currentTutorProfile]);

  useEffect(() => {
    async function loadCurrentTutorProfile() {
      if (!currentUser || currentUser.role !== 'TUTOR') {
        setCurrentTutorProfile(null);
        return;
      }
      try {
        const profile = await getTutorProfileByUserId(currentUser.id);
        if (profile) setCurrentTutorProfile(profile);
      } catch (err) {
        console.warn('Unable to load tutor profile:', err);
      }
    }
    loadCurrentTutorProfile();
  }, [currentUser]);

  const openAuth = (mode: 'login' | 'register' = 'login', redirectPath?: string) => {
    setAuthMode(mode);
    setPendingAuthPath(redirectPath ?? null);
    setAuthOpen(true);
  };

  const handleOpenMessenger = (otherUserId?: string) => {
    setMessengerOtherUserId(otherUserId || null);
    navigate('/chat');
  };

  const handleOpenChat = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      if (isTutor) {
        setMessengerOtherUserId(booking.studentId || null);
      } else {
        const tutor = tutors.find(t => t.id === booking.tutorId);
        const mentorUserId = (tutor as any)?.userId || booking.tutorId;
        setMessengerOtherUserId(mentorUserId || null);
      }
    }
    navigate('/chat');
  };

  const handleSearchFromHero = (query: string, subject: string, level: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query, subject, level }));
    navigate('/tutors');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSubjectCategory = (subjectName: string) => {
    setFilters((prev) => ({ ...prev, subject: subjectName }));
    navigate('/tutors');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (tutor: Tutor, slot?: AvailabilitySlot) => {
    if (!canBook) return openAuth('login');
    setSelectedTutorForBooking(tutor);
    setSelectedSlotForBooking(slot || null);
  };

  const handleCompleteBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleCancelBooking = async (bookingId: string) => {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)));
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
    } catch {}
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.data;
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, status: 'CONFIRMED', meetingLink: updated?.meetingLink || b.meetingLink }
              : b
          )
        );
      } else {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'CONFIRMED' } : b)));
      }
    } catch {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'CONFIRMED' } : b)));
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'DECLINED' as any } : b)));
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DECLINED' }),
      });
    } catch {}
  };

  const handleCompleteSession = async (bookingId: string) => {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'COMPLETED' } : b)));
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
    } catch {}
  };

  const filteredTutors = tutors.filter((t) => {
    if (!t.verified) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        t.fullName.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.institution.toLowerCase().includes(q) ||
        t.bio.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filters.subject !== 'All') {
      const targetSub = filters.subject.toLowerCase();
      const hasSubject = t.subjects.some((s) => {
        const lower = s.toLowerCase();
        if (targetSub === 'math') {
          return lower === 'math' || lower === 'mathematics' || lower.includes('math');
        }
        return lower === targetSub || lower.includes(targetSub);
      });
      if (!hasSubject) return false;
    }
    if (filters.institution !== 'All' && !t.institution.toLowerCase().includes(filters.institution.toLowerCase())) return false;
    if (t.hourlyRate > filters.maxPrice) return false;
    if (filters.minRating > 0 && t.rating < filters.minRating) return false;
    return true;
  });

  const handleTutorStatusChange = (tutorId: string, newStatus: string) => {
    setTutors((prev) =>
      prev.map((t) =>
        t.id === tutorId
          ? { ...t, verified: newStatus === 'VERIFIED', verificationStatus: newStatus }
          : t
      )
    );
  };
  
  // Backwards compatibility for HeroSection
  const changeViewLegacy = (view: string) => {
    const viewToPath: Record<string, string> = {
      'home': '/',
      'tutors': '/tutors',
      'student-dashboard': '/dashboard',
      'tutor-dashboard': '/dashboard',
      'admin-approvals': '/dashboard',
      'messenger': '/chat'
    };
    navigate(viewToPath[view] || '/');
  };

  return (
    <div
      className="min-h-screen text-[var(--color-text)] font-['Inter'] flex flex-col justify-between selection:bg-indigo-600 selection:text-white"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <Navbar
        onOpenAuth={openAuth as any}
        bookingCount={bookings.filter((b) => b.status === 'CONFIRMED').length}
      />

      <ScrollToTop />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={
            isTutor ? <Navigate to="/dashboard" replace /> : (
              <>
                <HeroSection onSearch={handleSearchFromHero} onOpenAuth={openAuth} onViewChange={changeViewLegacy} />
                <FeaturedTutors
                  tutors={tutors}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  onSelectTutor={(t) => setSelectedTutorForProfile(t)}
                  onBookTutor={(t) => handleOpenBooking(t)}
                />
                <SubjectCategories subjects={subjects} onSelectSubject={handleSelectSubjectCategory} />
              </>
            )
          } />

          <Route path="/tutors" element={
            isTutor ? <Navigate to="/dashboard" replace /> : (
              <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
                  <h1 className="text-3xl font-bold font-['Geist'] text-slate-900">Explore Verified Komarovi Academic Mentors</h1>
                  <p className="text-xs text-slate-500">Filter by subject specialization, Komarovi grade level, hourly rate, and peer ratings.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                  <div className="lg:col-span-1">
                    <FilterSidebar
                      filters={filters}
                      onChangeFilters={setFilters}
                      onResetFilters={() =>
                        setFilters({
                          searchQuery: '', subject: 'All', level: 'All', minPrice: 10, maxPrice: 100, minRating: 0, institution: 'All', sortBy: 'recommended'
                        })
                      }
                    />
                  </div>
                  <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-medium px-1">
                      <span>Showing {filteredTutors.length} verified mentors</span>
                    </div>
                    {filteredTutors.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredTutors.map((t) => (
                          <TutorCard
                            key={t.id}
                            tutor={t}
                            onSelectTutor={(tutor) => navigate(`/tutors/${tutor.id}`)}
                            onBookTutor={(tutor) => handleOpenBooking(tutor)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
                        <h3 className="text-xl font-bold font-['Geist'] text-slate-900">No verified mentors listed yet</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto font-['Inter']">Are you a Komarovi student or alumnus excelling in Physics or Mathematics?</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          } />

          <Route path="/tutors/:id" element={
            <TutorProfilePage tutors={tutors} onBookSession={(tutor, slot) => handleOpenBooking(tutor, slot)} />
          } />

          <Route path="/dashboard" element={
            !currentUser ? <Navigate to="/" replace /> :
            isTutor ? (
              <TutorDashboard
                bookings={bookings}
                currentTutor={currentTutorProfile}
                onAcceptBooking={handleAcceptBooking}
                onDeclineBooking={handleDeclineBooking}
                onCompleteBooking={handleCompleteSession}
                onOpenSettings={() => setProfileSettingsOpen(true)}
                onOpenChat={handleOpenChat}
              />
            ) : isAdmin ? (
              <AdminApprovalDashboard onTutorStatusChange={handleTutorStatusChange} />
            ) : (
              <StudentDashboard
                bookings={bookings}
                onBookNewSession={() => { navigate('/tutors'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                onCancelBooking={handleCancelBooking}
                onEndCourse={handleCompleteSession}
                onOpenChat={handleOpenChat}
                onOpenSettings={() => setProfileSettingsOpen(true)}
              />
            )
          } />

          <Route path="/chat" element={
            !currentUser ? <Navigate to="/" replace /> :
            <Messenger initialOtherUserId={messengerOtherUserId} />
          } />

          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {location.pathname !== '/chat' && <Footer />}

      {/* Legacy profile modal support for featured tutors (which don't use routing directly) */}
      {selectedTutorForProfile && (
        <TutorProfileModal
          tutor={selectedTutorForProfile}
          onClose={() => setSelectedTutorForProfile(null)}
          onBookSession={(tutor, slot) => {
            setSelectedTutorForProfile(null);
            handleOpenBooking(tutor, slot);
          }}
        />
      )}

      {selectedTutorForBooking && (
        <BookingModal
          tutor={selectedTutorForBooking}
          initialSlot={selectedSlotForBooking}
          onClose={() => {
            setSelectedTutorForBooking(null);
            setSelectedSlotForBooking(null);
          }}
          onCompleteBooking={handleCompleteBooking}
        />
      )}

      {profileSettingsOpen && currentUser && (
        <ProfileSettingsModal
          user={currentUser}
          tutorProfile={currentTutorProfile}
          onClose={() => setProfileSettingsOpen(false)}
          onSave={async (userUpdate, tutorUpdate) => {
            let newAvatarUrl: string | undefined;
            if (userUpdate && Object.keys(userUpdate).length > 0) {
              const savedUser = await updateProfile(userUpdate);
              newAvatarUrl = savedUser.avatarUrl;
            }

            if (tutorUpdate && currentTutorProfile) {
              const raw = await updateTutorProfile(currentTutorProfile.id, tutorUpdate);
              if (raw) {
                const patch: Partial<typeof currentTutorProfile> = {
                  bio: (raw as any).bio ?? currentTutorProfile.bio,
                  title: (raw as any).headline ?? (raw as any).title ?? currentTutorProfile.title,
                  hourlyRate: (raw as any).hourlyRate ?? currentTutorProfile.hourlyRate,
                  subjects: (raw as any).subjects ?? currentTutorProfile.subjects,
                };
                if (newAvatarUrl !== undefined) patch.avatarUrl = newAvatarUrl;
                setCurrentTutorProfile((prev) => prev ? { ...prev, ...patch } : prev);
                setTutors((prev) => prev.map((t) => (t.id === currentTutorProfile.id ? { ...t, ...patch } : t)));
                return;
              }
            }

            if (newAvatarUrl !== undefined) {
              setCurrentTutorProfile((prev) => {
                if (prev) return { ...prev, avatarUrl: newAvatarUrl! };
                return prev;
              });
              if (currentTutorProfile) {
                setTutors((prev) => prev.map((t) => t.id === currentTutorProfile.id ? { ...t, avatarUrl: newAvatarUrl! } : t));
              }
            }
          }}
        />
      )}

      {authOpen && (
        <AuthModal
          onClose={() => { setAuthOpen(false); setPendingAuthPath(null); }}
          initialMode={authMode}
          onSuccess={(role) => {
            setAuthOpen(false);
            const destination = pendingAuthPath ?? (role === 'TUTOR' ? '/dashboard' : '/dashboard');
            setPendingAuthPath(null);
            navigate(destination);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}

