import React, { useState } from 'react';
import { 
  X, 
  Star, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  Award, 
  Calendar, 
  BookOpen, 
  Play, 
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Check
} from 'lucide-react';
import { Tutor, AvailabilitySlot } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useLang } from '../../context/LangContext';

interface TutorProfileModalProps {
  tutor: Tutor | null;
  onClose: () => void;
  onBookSession: (tutor: Tutor, selectedSlot?: AvailabilitySlot) => void;
  isPage?: boolean;
}

export const TutorProfileModal: React.FC<TutorProfileModalProps> = ({
  tutor,
  onClose,
  onBookSession,
  isPage = false,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'reviews'>('overview');
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const { t } = useLang();

  if (!tutor) return null;

  const content = (
    <>
        {/* Top Header Banner */}
        <div className="relative bg-slate-900 text-white p-6 sm:p-8">
          {!isPage && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <img
                src={tutor.avatarUrl || '/guest-avatar.png'}
                alt={tutor.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-white/20 shadow-md"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Online" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {tutor.institution} Alumni
                </span>
                {tutor.acceptanceRate && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Acceptance: {tutor.acceptanceRate}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold font-['Geist'] text-white">
                  {tutor.fullName}
                </h2>
                {tutor.verified && (
                  <CheckCircle2 className="w-6 h-6 text-indigo-400" title="Identity & Academic Verification Approved" />
                )}
              </div>

              <p className="text-sm text-slate-300 font-medium">
                {tutor.title}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/25 px-3 py-1.5 rounded-full">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 transition-colors ${
                      s <= Math.round(tutor.rating) ? 'fill-amber-400 text-amber-400' : 'text-amber-400/30'
                    }`} />
                  ))}
                  <strong className="text-amber-300 font-bold ml-1">
                    {tutor.reviewCount === 0 ? 'New' : tutor.rating.toFixed(1)}
                  </strong>
                  <span className="text-slate-400">({tutor.reviewCount} reviews)</span>
                </span>
                <span>•</span>
                <span>{tutor.completedHours} {t('tutorCard.hrsTaught', { n: '' }).replace('{n}', '').trim()}</span>
              </div>
            </div>

            {/* Rate & Direct Book CTA */}
            <div className="text-left sm:text-right shrink-0 bg-white/10 p-4 rounded-2xl border border-white/10">
              <div className="text-xs text-slate-300">{t('profile.hourlyFee')}</div>
              <div className="text-2xl sm:text-3xl font-bold font-['Geist'] text-white">
                {formatCurrency(tutor.hourlyRate)}
                <span className="text-xs font-normal text-slate-300">GEL/Lesson</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium mt-1">
                {t('profile.guarantee')}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 border-t border-white/10 mt-6 pt-4 text-sm font-medium text-slate-300">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-1 border-b-2 transition-colors ${
                activeTab === 'overview' ? 'border-indigo-400 text-white font-bold' : 'border-transparent hover:text-white'
              }`}
            >
              {t('profile.tabOverview')}
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`pb-1 border-b-2 transition-colors ${
                activeTab === 'schedule' ? 'border-indigo-400 text-white font-bold' : 'border-transparent hover:text-white'
              }`}
            >
              {t('profile.tabSchedule')}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-1 border-b-2 transition-colors ${
                activeTab === 'reviews' ? 'border-indigo-400 text-white font-bold' : 'border-transparent hover:text-white'
              }`}
            >
              {t('profile.tabReviews')} ({tutor.reviews.length})
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Video introduction placeholder */}
              {tutor.videoThumbnail && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group aspect-video max-h-64 flex items-center justify-center">
                  <img
                    src={tutor.videoThumbnail}
                    alt="Video Introduction"
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <button className="absolute w-14 h-14 rounded-full bg-[#004ac6] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-1" />
                  </button>
                  <span className="absolute bottom-3 left-4 text-xs font-semibold text-white bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-xs">
                    {t('profile.videoIntro')}
                  </span>
                </div>
              )}

              {/* Bio & Teaching Approach */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm font-['Geist'] flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    <span>{t('profile.academicBio')}</span>
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed font-['Inter']">
                    {tutor.bio}
                  </p>
                </div>

                <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-200/60 space-y-2">
                  <h3 className="font-bold text-indigo-900 text-sm font-['Geist'] flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>{t('profile.teachingApproach')}</span>
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed font-['Inter']">
                    {tutor.teachingApproach}
                  </p>
                </div>
              </div>

              {/* Subjects & Competencies */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm font-['Geist']">
                  {t('profile.specializedSubjects')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects.map((s) => (
                    <span
                      key={s}
                      className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Honors & Key Achievements */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-sm font-['Geist']">
                  {t('profile.honorsTitle')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tutor.achievements.map((ach, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-start gap-2.5 shadow-2xs text-xs text-slate-800"
                    >
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{ach}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SCHEDULE & AVAILABILITY */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-['Geist']">
                    {t('profile.selectSlot')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('profile.slotNote')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {tutor.availabilitySlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      disabled={slot.isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                        slot.isBooked
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'bg-blue-50 border-[#004ac6] text-[#004ac6] ring-2 ring-[#004ac6]/20 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold font-['Geist']">
                          {slot.dayName} ({slot.dateStr || t('profile.upcoming')})
                        </div>
                        <div className="text-sm font-semibold mt-0.5">
                          {slot.time}
                        </div>
                      </div>

                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        slot.isBooked ? 'bg-slate-200 text-slate-500' : isSelected ? 'bg-[#004ac6] text-white' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {slot.isBooked ? t('profile.slotBooked') : isSelected ? t('profile.slotSelected') : t('profile.slotAvailable')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-5">
              {/* Aggregate Rating Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold font-['Geist'] text-white">
                      {tutor.reviewCount === 0 ? '—' : tutor.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-slate-400">/ 5.0</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Based on {tutor.reviewCount} verified {tutor.reviewCount === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-6 h-6 ${
                        s <= Math.round(tutor.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600 fill-slate-700'
                      }`} />
                    ))}
                  </div>
                  {tutor.reviewCount > 0 && (
                    <p className="text-[11px] text-emerald-400 font-semibold mt-1">★ Verified sessions only</p>
                  )}
                </div>
              </div>

              {/* Review Cards */}
              <div className="space-y-3">
                {tutor.reviews.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                      <Star className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">No reviews yet</p>
                    <p className="text-xs text-slate-400">Be the first to work with this mentor!</p>
                  </div>
                ) : (
                  tutor.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Student avatar initial */}
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {rev.authorName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 font-['Geist']">{rev.authorName}</h4>
                            <p className="text-[11px] text-slate-500">{rev.authorRole} • {rev.subjectName}</p>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">{rev.date}</span>
                      </div>

                      {/* Star Rating Row */}
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'
                          }`} />
                        ))}
                        <span className="text-[11px] font-bold text-amber-600 ml-1.5">{rev.rating}.0</span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-['Inter']">
                        "{rev.comment}"
                      </p>

                      {rev.scoreImpact && (
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>{t('profile.verifiedOutcome')} {rev.scoreImpact}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            {tutor.fullName} • {t('profile.selectedFee')} <strong className="text-indigo-600">{formatCurrency(tutor.hourlyRate)} GEL/Lesson</strong>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isPage && (
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-100 transition-colors"
              >
                {t('profile.cancel')}
              </button>
            )}

            <button
              onClick={() => onBookSession(tutor, selectedSlot || undefined)}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('profile.bookTrial')}</span>
            </button>
          </div>
        </div>
    </>
  );

  if (isPage) {
    return <div className="w-full min-h-screen bg-slate-50 flex flex-col">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-4xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
};
