import React, { useState } from 'react';
import { 
  Star, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Award, 
  Heart, 
  Sparkles, 
  GraduationCap,
  ArrowUpRight
} from 'lucide-react';
import { Tutor } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useLang } from '../../context/LangContext';

interface TutorCardProps {
  tutor: Tutor;
  onSelectTutor: (tutor: Tutor) => void;
  onBookTutor: (tutor: Tutor) => void;
}

export const TutorCard: React.FC<TutorCardProps> = ({
  tutor,
  onSelectTutor,
  onBookTutor,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { t } = useLang();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group relative">
      
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          
          <div className="flex items-start gap-3.5">
            {/* Avatar Container with Online Indicator */}
            <div className="relative shrink-0">
              <img
                src={tutor.avatarUrl || '/guest-avatar.png'}
                alt={tutor.fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shadow-2xs group-hover:scale-[1.02] transition-transform"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Online & Available for Booking" />
            </div>

            {/* Name, Title & Institution */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 
                  onClick={() => onSelectTutor(tutor)}
                  className="font-bold text-lg text-[#0f172a] font-['Geist'] hover:text-indigo-600 cursor-pointer transition-colors"
                >
                  {tutor.fullName}
                </h3>
                {tutor.verified && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" title="100% Background & Credential Verified" />
                )}
              </div>

              <p className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>{tutor.institution}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-normal">{tutor.degree}</span>
              </p>

              <p className="text-xs text-slate-600 line-clamp-1 font-medium">
                {tutor.title}
              </p>
            </div>
          </div>

          {/* Rate & Favorite Toggle */}
          <div className="text-right shrink-0">
            <div className="text-xl sm:text-2xl font-bold text-[#0f172a] font-['Geist']">
              {formatCurrency(tutor.hourlyRate)}
              <span className="text-xs font-normal text-slate-500">GEL/Lesson</span>
            </div>

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="mt-2 p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              title={isFavorite ? 'Remove from saved mentors' : 'Save mentor'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats & Response Time Bar */}
        <div className="py-3 flex flex-wrap items-center justify-between text-xs text-slate-600 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold text-slate-900">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{tutor.reviewCount === 0 ? 'New' : tutor.rating.toFixed(2)}</span>
              <span className="text-slate-400 font-normal">({tutor.reviewCount})</span>
            </span>

            <span className="text-slate-300">•</span>

            <span className="text-slate-600 font-medium">
              {t('tutorCard.hrsTaught', { n: tutor.completedHours.toLocaleString() })}
            </span>
          </div>
        </div>

        {/* Subject Tags Chips */}
        <div className="pt-3.5 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {tutor.subjects.map((sub) => (
              <span
                key={sub}
                className="text-[11px] font-semibold bg-indigo-50/80 text-indigo-700 border border-indigo-200/60 px-2.5 py-1 rounded-md"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>

        {/* Bio Snippet */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 my-2 font-['Inter']">
          {tutor.bio}
        </p>

        {/* Achievement Highlight */}
        {tutor.achievements && tutor.achievements.length > 0 && (
          <div className="my-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 text-[11px] text-slate-700 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-medium truncate">{tutor.achievements[0]}</span>
          </div>
        )}
      </div>

      {/* Action Footer Buttons */}
      <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5 mt-2">
        <button
          onClick={() => onSelectTutor(tutor)}
          className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-[#0f172a] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
        >
          <span>{t('tutorCard.viewProfile')}</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => onBookTutor(tutor)}
          className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t('tutorCard.bookTrial')}</span>
        </button>
      </div>

    </div>
  );
};
