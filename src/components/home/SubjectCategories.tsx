import React from 'react';
import { 
  Atom, 
  Calculator, 
  Sigma,
  Waves, 
  BarChart3, 
  TrendingUp, 
  Trophy,
  ArrowRight
} from 'lucide-react';
import { Subject } from '../../types';
import { useLang } from '../../context/LangContext';

interface SubjectCategoriesProps {
  subjects: Subject[];
  onSelectSubject: (subjectName: string) => void;
}

export const SubjectCategories: React.FC<SubjectCategoriesProps> = ({
  subjects,
  onSelectSubject,
}) => {
  const { t } = useLang();

  const getSubjectIcon = (name: string) => {
    if (name.includes('Quantum') || name.includes('Physics')) return <Atom className="w-6 h-6 text-blue-600" />;
    if (name.includes('Calculus') || name.includes('Analysis')) return <Calculator className="w-6 h-6 text-indigo-600" />;
    if (name.includes('Differential') || name.includes('PDE')) return <Waves className="w-6 h-6 text-cyan-600" />;
    if (name.includes('Algebra')) return <Sigma className="w-6 h-6 text-violet-600" />;
    if (name.includes('Mechanics') || name.includes('Fluid')) return <BarChart3 className="w-6 h-6 text-teal-600" />;
    if (name.includes('USAMO') || name.includes('Putnam') || name.includes('Olympiad')) return <Trophy className="w-6 h-6 text-amber-500" />;
    if (name.includes('Computational')) return <TrendingUp className="w-6 h-6 text-emerald-600" />;
    return <Trophy className="w-6 h-6 text-amber-500" />;
  };

  return (
    <section className="py-16 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md font-['Geist']">
            {t('subjects.badge')}
          </span>
          <h2 className="text-3xl font-bold text-slate-900 font-['Geist'] tracking-tight">
            {t('subjects.title')}
          </h2>
          <p className="text-sm text-slate-600">
            {t('subjects.subheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subjects.map((subj) => (
            <div
              key={subj.id}
              onClick={() => onSelectSubject(subj.name)}
              className="group p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getSubjectIcon(subj.name)}
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 font-['Geist'] group-hover:text-indigo-600 transition-colors">
                    {subj.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {subj.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-800">
                  {t('subjects.studentsMentored', { count: subj.popularCount?.toLocaleString() || 0 })}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
