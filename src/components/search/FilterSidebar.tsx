import React from 'react';
import { Search, SlidersHorizontal, RotateCcw, Star, ShieldCheck } from 'lucide-react';
import { FilterOptions } from '../../types';
import { useLang } from '../../context/LangContext';

interface FilterSidebarProps {
  filters: FilterOptions;
  onChangeFilters: (newFilters: FilterOptions) => void;
  onResetFilters: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
}) => {
  const { t } = useLang();

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
      
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm font-['Geist']">
          <SlidersHorizontal className="w-4 h-4 text-[#004ac6]" />
          <span>{t('filter.title')}</span>
        </div>

        <button
          onClick={onResetFilters}
          className="text-xs text-slate-500 hover:text-[#004ac6] flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t('filter.reset')}</span>
        </button>
      </div>

      {/* Subject Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 font-['Geist']">
          {t('filter.subjectLabel')}
        </label>
        <select
          value={filters.subject}
          onChange={(e) => onChangeFilters({ ...filters, subject: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium p-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20"
        >
          <option value="All">{t('filter.subjectAll')}</option>
          <option value="Math">Math</option>
          <option value="Physics">Physics</option>
          <option value="STEM">STEM</option>
        </select>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
          <span className="uppercase tracking-wider font-['Geist']">{t('filter.maxFee')}</span>
          <span className="text-[#004ac6] font-bold">{filters.maxPrice} GEL/Lesson</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={filters.maxPrice}
          onChange={(e) => onChangeFilters({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#004ac6]"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>10 GEL/Lesson</span>
          <span>50 GEL/Lesson</span>
          <span>100 GEL/Lesson</span>
        </div>
      </div>

      {/* Minimum Rating — full 0–5 range slider */}
      <div>
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
          <span className="uppercase tracking-wider font-['Geist']">{t('filter.minRating')}</span>
          <span className="flex items-center gap-1 text-[#004ac6] font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {filters.minRating === 0 ? 'Any' : `${filters.minRating}★ & up`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={filters.minRating}
          onChange={(e) => onChangeFilters({ ...filters, minRating: Number(e.target.value) })}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#004ac6]"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>Any</span>
          <span>2.5★</span>
          <span>5★</span>
        </div>
      </div>

      {/* Komarovi Grade Level Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 font-['Geist']">
          {t('filter.gradeLevel')}
        </label>
        <select
          value={filters.institution}
          onChange={(e) => onChangeFilters({ ...filters, institution: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium p-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20"
        >
          <option value="All">{t('filter.gradeAll')}</option>
          <option value="Grade 10">{t('filter.grade10')}</option>
          <option value="Grade 11">{t('filter.grade11')}</option>
          <option value="Grade 12">{t('filter.grade12')}</option>
          <option value="Alumni">{t('filter.alumni')}</option>
        </select>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>{t('filter.verified')}</span>
      </div>

    </div>
  );
};
