import React, { useState } from 'react';
import { 
  Calendar, 
  Clock,
  Video, 
  CheckCircle2, 
  Plus, 
  BookOpen,
  MessageSquare,
  Star,
  Link2,
  AlertCircle,
  StopCircle
} from 'lucide-react';
import { Booking } from '../../types';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import { ReviewModal } from '../tutor/ReviewModal';

interface StudentDashboardProps {
  bookings: Booking[];
  onBookNewSession: () => void;
  onCancelBooking: (bookingId: string) => void;
  onEndCourse: (bookingId: string) => void;
  onOpenChat: (bookingId: string) => void;
  onOpenSettings?: () => void;
}

interface ReviewEligibility {
  canReview: boolean;
  bookingId: string | null;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  bookings,
  onBookNewSession,
  onCancelBooking,
  onEndCourse,
  onOpenChat,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const { t } = useLang();
  const { currentUser } = useAuth();

  // Track which bookings have been reviewed (locally, after submission)
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<string>>(new Set());
  // Review modal state
  const [reviewTarget, setReviewTarget] = useState<{
    bookingId: string;
    tutorProfileId: string;
    tutorName: string;
    tutorAvatar?: string;
    subjectName: string;
  } | null>(null);

  const upcomingBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING');
  const pastBookings = bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'CANCELLED' || b.status === 'DECLINED');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

  // Stats derived from real data
  const activeMentors = new Set(upcomingBookings.map((b) => b.tutorId)).size;

  const chartData = [
    { week: 'W1', hours: upcomingBookings.length > 0 ? 2 : 0 },
    { week: 'W2', hours: upcomingBookings.length > 0 ? 3 : 0 },
    { week: 'W3', hours: completedBookings.length > 0 ? completedBookings.length * 1.5 : 0 },
    { week: 'W4', hours: completedBookings.length > 0 ? completedBookings.length * 2 : 0 },
  ];

  const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    CANCELLED: 'bg-rose-50 text-rose-600 border-rose-200',
    DECLINED: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <div className="py-8 bg-[#f7f9fb] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatarUrl || "/guest-avatar.png"}
              alt={currentUser?.fullName || "Student"}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 font-['Geist']">
                  {t('student.welcomeBack')} {currentUser?.fullName?.split(' ')[0] || '[Student]'}
                </h1>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {t('student.school')}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {currentUser?.grade ? `Grade ${currentUser.grade}` : 'Student'} • Mentora Platform
              </p>
              {currentUser?.bio && (
                <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic max-w-md">
                  "{currentUser.bio}"
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Edit Profile</span>
              </button>
            )}
            <button
              onClick={onBookNewSession}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('student.bookNew')}</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>{t('student.upcomingLessons')}</span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 font-['Geist']">
              {upcomingBookings.length > 0 ? upcomingBookings.length : '—'}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {upcomingBookings.length > 0 ? `${upcomingBookings.filter(b => b.status === 'CONFIRMED').length} confirmed` : 'No upcoming sessions'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Completed Sessions</span>
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 font-['Geist']">
              {completedBookings.length > 0 ? completedBookings.length : '—'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {completedBookings.length > 0 ? 'Sessions finished' : 'No sessions yet'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>{t('student.activeMentors')}</span>
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 font-['Geist']">
              {activeMentors > 0 ? activeMentors : '—'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {activeMentors > 0 ? `Active mentor${activeMentors !== 1 ? 's' : ''}` : 'No active mentors'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Reviews Given</span>
              <Star className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-amber-500 font-['Geist']">
              {reviewedBookingIds.size > 0 ? reviewedBookingIds.size : '—'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {completedBookings.length > 0 ? `${completedBookings.length} eligible` : 'Complete sessions to review'}
            </p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-6 text-sm font-medium">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`pb-1 border-b-2 transition-colors ${
                  activeTab === 'upcoming'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t('student.tabUpcoming')} ({upcomingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-1 border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t('student.tabHistory')} ({pastBookings.length})
              </button>
            </div>
          </div>

          {/* UPCOMING SESSIONS */}
          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-4 hover:border-slate-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {b.tutorAvatar ? (
                          <img src={b.tutorAvatar} alt={b.tutorName} className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                            {b.tutorName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-sm font-['Geist']">{b.tutorName}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusColor[b.status] || ''}`}>
                              {b.status}
                            </span>
                          </div>
                          <p className="text-xs text-indigo-600 font-medium mt-0.5">
                            {b.subjectName} • {b.tutorInstitution}
                          </p>
                          <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(b.date).toLocaleDateString()} • {b.timeSlot}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {/* Meeting link only shown when CONFIRMED */}
                        {b.status === 'CONFIRMED' && b.meetingLink ? (
                          <a
                            href={b.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Meeting</span>
                          </a>
                        ) : b.status === 'PENDING' ? (
                          <span className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl font-medium">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Awaiting Mentor Approval
                          </span>
                        ) : null}

                        <button
                          onClick={() => onOpenChat(b.id)}
                          className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors"
                          title="Open Messages"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {/* End Course — available on CONFIRMED sessions */}
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => {
                              onEndCourse(b.id);
                              // Auto-open review modal for student
                              setTimeout(() => {
                                setReviewTarget({
                                  bookingId: b.id,
                                  tutorProfileId: b.tutorId,
                                  tutorName: b.tutorName,
                                  tutorAvatar: b.tutorAvatar,
                                  subjectName: b.subjectName,
                                });
                              }, 600);
                            }}
                            className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                          >
                            <StopCircle className="w-3.5 h-3.5" />
                            End Course
                          </button>
                        )}

                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => onCancelBooking(b.id)}
                            className="px-3 py-2.5 text-slate-500 hover:text-rose-600 text-xs font-medium"
                          >
                            {t('student.cancelLesson')}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Meeting link display row for CONFIRMED */}
                    {b.status === 'CONFIRMED' && b.meetingLink && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-mono text-emerald-800 flex-1 truncate">{b.meetingLink}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                    <Calendar className="w-7 h-7 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">{t('student.noUpcoming')}</p>
                  <button onClick={onBookNewSession} className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl">
                    {t('student.scheduleLesson')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {pastBookings.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No past sessions yet.
                </div>
              ) : (
                pastBookings.map((b) => {
                  const isCompleted = b.status === 'COMPLETED';
                  const alreadyReviewed = reviewedBookingIds.has(b.id);

                  return (
                    <div key={b.id} className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
                      <div>
                        <strong className="text-slate-900 block font-['Geist'] text-sm">{b.subjectName}</strong>
                        <span className="text-slate-500">{b.tutorName} • {new Date(b.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-md font-semibold text-[10px] border ${statusColor[b.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {b.status}
                        </span>

                        {/* Review button — only for COMPLETED, one per booking */}
                        {isCompleted && !alreadyReviewed && (
                          <button
                            onClick={() => setReviewTarget({
                              bookingId: b.id,
                              tutorProfileId: b.tutorId,
                              tutorName: b.tutorName,
                              subjectName: b.subjectName,
                            })}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-semibold text-[11px] transition-colors"
                          >
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            Leave Review
                          </button>
                        )}

                        {isCompleted && alreadyReviewed && (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Reviewed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

      </div>

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal
          bookingId={reviewTarget.bookingId}
          tutorProfileId={reviewTarget.tutorProfileId}
          tutorName={reviewTarget.tutorName}
          tutorAvatar={reviewTarget.tutorAvatar}
          subjectName={reviewTarget.subjectName}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => {
            setReviewedBookingIds((prev) => new Set(prev).add(reviewTarget.bookingId));
            setReviewTarget(null);
          }}
        />
      )}
    </div>
  );
};
