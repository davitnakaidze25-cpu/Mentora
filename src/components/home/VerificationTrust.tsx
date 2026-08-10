import React from 'react';
import { 
  ShieldCheck, 
  FileCheck2, 
  UserCheck, 
  Video, 
  Award, 
  CheckCircle2, 
  TrendingUp,
  Percent
} from 'lucide-react';
import { useLang } from '../../context/LangContext';

export const VerificationTrust: React.FC = () => {
  const { t } = useLang();

  const steps = [
    {
      step: '01',
      title: t('trust.step1Title'),
      description: t('trust.step1Desc'),
      icon: <FileCheck2 className="w-6 h-6 text-blue-600" />
    },
    {
      step: '02',
      title: t('trust.step2Title'),
      description: t('trust.step2Desc'),
      icon: <UserCheck className="w-6 h-6 text-emerald-600" />
    },
    {
      step: '03',
      title: t('trust.step3Title'),
      description: t('trust.step3Desc'),
      icon: <Video className="w-6 h-6 text-indigo-600" />
    },
    {
      step: '04',
      title: t('trust.step4Title'),
      description: t('trust.step4Desc'),
      icon: <TrendingUp className="w-6 h-6 text-amber-600" />
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md font-['Geist']">
              {t('trust.badge')}
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-['Geist'] tracking-tight leading-tight">
              {t('trust.title')} <br />
              <span className="text-indigo-600">{t('trust.titleHighlight')}</span>
            </h2>

            <p className="text-sm text-slate-600 font-['Inter'] leading-relaxed">
              {t('trust.subheading')}
            </p>

            {/* Acceptance Rate Callout Card */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-indigo-300 tracking-wider">
                  {t('trust.networkTitle')}
                </span>
                <span className="text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  {t('trust.verifiedBadge')}
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-bold font-['Geist'] text-white">
                {t('trust.mentorsCount')}
              </div>

              <p className="text-xs text-slate-300">
                {t('trust.verificationNote')}
              </p>
            </div>
          </div>

          {/* Right 4-Steps Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((s) => (
              <div
                key={s.step}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-slate-300 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center">
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    {s.step}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-['Geist']">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
