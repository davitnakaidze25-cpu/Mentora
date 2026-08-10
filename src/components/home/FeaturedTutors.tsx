import React, { useState } from 'react';
import { ArrowUpDown, Filter } from 'lucide-react';
import { Tutor } from '../../types';
import { TutorCard } from '../tutor/TutorCard';
import { useLang } from '../../context/LangContext';

interface FeaturedTutorsProps {
  tutors: Tutor[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSelectTutor: (tutor: Tutor) => void;
  onBookTutor: (tutor: Tutor) => void;
}

export const FeaturedTutors: React.FC<FeaturedTutorsProps> = ({
  tutors,
  selectedCategory,
  onCategoryChange,
  onSelectTutor,
  onBookTutor,
}) => {
  const { t } = useLang();
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'hours'>('rating');

  const categories = [
    'All',
    'STEM',
  ];

  // Client-side sorting
  const sortedTutors = [...tutors].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price_asc') return a.hourlyRate - b.hourlyRate;
    if (sortBy === 'price_desc') return b.hourlyRate - a.hourlyRate;
    if (sortBy === 'hours') return b.completedHours - a.completedHours;
    return 0;
  });

  return (
    <section id="tutors" className="py-16 lg:py-20 bg-[#f7f9fb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title & Subheading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md mb-2 font-['Geist']">
              {t('featured.badge')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-['Geist'] tracking-tight">
              {t('featured.title')}
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl font-['Inter']">
              {t('featured.subheading')}
            </p>
          </div>

        </div>

        {/* Filters & Sorting Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">{t('featured.sortBy')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="rating">{t('featured.topRated')}</option>
              <option value="price_asc">{t('featured.priceAsc')}</option>
              <option value="price_desc">{t('featured.priceDesc')}</option>
              <option value="hours">{t('featured.mostHours')}</option>
            </select>
          </div>

        </div>

        {/* Tutors Grid / Empty State */}
        {sortedTutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                onSelectTutor={onSelectTutor}
                onBookTutor={onBookTutor}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-['Geist'] text-slate-900">No verified mentors listed yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-['Inter']">
                Are you a Komarovi student or alumnus excel in Physics or Mathematics?
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
