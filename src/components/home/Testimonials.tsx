import React from 'react';
import { Star, TrendingUp, Quote } from 'lucide-react';
import { useLang } from '../../context/LangContext';

export const Testimonials: React.FC = () => {
  const { t } = useLang();

  const reviews = [
    {
      id: '1',
      name: 'Julian Sterling',
      role: t('testimonials.rev1Role'),
      impact: t('testimonials.rev1Impact'),
      text: t('testimonials.rev1Text'),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: '2',
      name: 'Elena T.',
      role: t('testimonials.rev2Role'),
      impact: t('testimonials.rev2Impact'),
      text: t('testimonials.rev2Text'),
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: '3',
      name: 'Giorgi T.',
      role: t('testimonials.rev3Role'),
      impact: t('testimonials.rev3Impact'),
      text: t('testimonials.rev3Text'),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    }
  ];

  return (
    <section className="py-16 bg-[#f7f9fb] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#004ac6] bg-[#004ac6]/10 px-3 py-1 rounded-md font-['Geist']">
            {t('testimonials.badge')}
          </span>
          <h2 className="text-3xl font-bold text-[#0f172a] font-['Geist'] tracking-tight">
            {t('testimonials.title')}
          </h2>
          <p className="text-sm text-[#505f76]">
            {t('testimonials.subheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-200" />
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{r.impact}</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-['Inter']">
                  "{r.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 font-['Geist']">{r.name}</h4>
                  <p className="text-[11px] text-slate-500">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
