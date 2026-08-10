import React, { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  Star, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Settings, 
  Video,
  ExternalLink,
  Link2,
  StopCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Booking, Tutor } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';

interface TutorDashboardProps {
  bookings: Booking[];
  currentTutor?: Tutor | null;
  onAcceptBooking: (bookingId: string) => void;
  onDeclineBooking: (bookingId: string) => void;
  onCompleteBooking: (bookingId: string) => void;
  onOpenSettings: () => void;
  onOpenChat: (bookingId: string) => void;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({
  bookings,
  currentTutor,
  onAcceptBooking,
  onDeclineBooking,
  onCompleteBooking,
  onOpenSettings,
  onOpenChat,
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'earnings'>('requests');
  const { currentUser } = useAuth();
  const { t } = useLang();

  const avatarSrc =
    currentTutor?.avatarUrl ||
    currentUser?.avatarUrl ||
    '/guest-avatar.png';

  // Real stats derived from bookings
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalSessions = completedBookings.length;

  // Simple earnings chart by month
  const earningsData = React.useMemo(() => {
    const byMonth: Record<string, number> = {};
    completedBookings.forEach((b) => {
      const month = new Date(b.createdAt).toLocaleString('default', { month: 'short' });
      byMonth[month] = (byMonth[month] || 0) + (b.totalPrice || 0);
    });
    return Object.entries(byMonth).map(([month, earnings]) => ({ month, earnings }));
  }, [completedBookings]);

  const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
    DECLINED: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <div className="py-8 bg-[#f7f9fb] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Pending Review Banner */}
        {(!currentTutor || !currentTutor.verified || currentTutor.verificationStatus === 'PENDING') && (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-center gap-3 text-amber-900 shadow-2xs">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs font-semibold leading-relaxed">
              {t('tutor.pendingReview')}
            </p>
          </div>
        )}

        {/* Mentor Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={avatarSrc}
              alt={currentTutor?.fullName || currentUser?.fullName || 'Tutor Avatar'}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold font-['Geist'] text-white">
                  {currentTutor ? currentTutor.fullName : (currentUser?.fullName || '[Tutor Name]')}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{currentTutor ? currentTutor.institution : 'Komarovi'}</span>
                </span>
              </div>
              <p className="text-xs font-semibold text-indigo-400">
                {currentTutor?.title || t('tutor.defaultTitle')}
              </p>
              <p className="text-xs text-slate-300">
                {t('tutor.schoolRate')} • {currentTutor ? currentTutor.hourlyRate : 25} GEL/Lesson • {currentTutor?.verified ? t('tutor.verified') : t('tutor.pendingVerification')}
              </p>
              {currentTutor?.bio && (
                <p className="text-xs text-slate-300 mt-2 max-w-xl font-['Inter'] leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                  "{currentTutor.bio}"
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onOpenSettings} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/10 transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>{t('tutor.settings')}</span>
            </button>
          </div>
        </div>

        {/* Real Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total Earned</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 font-['Geist']">
              {totalEarnings > 0 ? `${totalEarnings} ₾` : '—'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              From {completedBookings.length} completed sessions
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Sessions Completed</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 font-['Geist']">
              {totalSessions > 0 ? `${totalSessions}` : '—'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {pendingBookings.length} pending request{pendingBookings.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Confirmed Sessions</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 font-['Geist']">
              {confirmedBookings.length > 0 ? confirmedBookings.length : '—'}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold">
              {confirmedBookings.length > 0 ? 'Upcoming sessions' : 'No confirmed sessions yet'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>{t('tutor.rating')}</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-500 font-['Geist']">
              {currentTutor?.rating ? `${currentTutor.rating} ★` : '—'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {currentTutor?.reviewCount ? `${currentTutor.reviewCount} review${currentTutor.reviewCount !== 1 ? 's' : ''}` : 'No reviews yet'}
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-6 text-sm font-medium">
              <button
                onClick={() => setActiveTab('requests')}
                className={`pb-1 border-b-2 transition-colors ${
                  activeTab === 'requests'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t('tutor.tabRequests')} ({bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length})
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`pb-1 border-b-2 transition-colors ${
                  activeTab === 'earnings'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t('tutor.tabEarnings')}
              </button>
            </div>
          </div>

          {/* TAB 1: BOOKING REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-4"
                  >
                    {/* Top row: info + status badge */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm font-['Geist']">{b.studentName}</h4>
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {b.subjectName}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusColor[b.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {new Date(b.date).toLocaleDateString()} • {b.timeSlot} • <strong>{b.totalPrice} GEL/Lesson</strong>
                        </p>
                        {b.studentNotes && (
                          <p className="text-xs text-slate-500 mt-1 italic">
                            "{b.studentNotes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Meeting link — only for CONFIRMED */}
                    {b.status === 'CONFIRMED' && b.meetingLink && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-mono text-emerald-800 flex-1 truncate">{b.meetingLink}</span>
                        <a
                          href={b.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open
                        </a>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => onOpenChat(b.id)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                      >
                        💬 Chat
                      </button>

                      {b.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => onAcceptBooking(b.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Accept
                          </button>
                          <button
                            onClick={() => onDeclineBooking(b.id)}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-xl flex items-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        </>
                      )}

                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => onCompleteBooking(b.id)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                        >
                          <StopCircle className="w-3.5 h-3.5" />
                          End Course
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  {t('tutor.noRequests')}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm font-['Geist']">
                {t('tutor.earningsChart')}
              </h3>
              {earningsData.length > 0 ? (
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={earningsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="earnings" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  No completed sessions yet. Earnings will appear here after you complete sessions.
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
