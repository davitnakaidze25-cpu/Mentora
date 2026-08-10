import React from 'react';
import { Search, Handshake, ShieldCheck, ArrowRight, DollarSign, CheckCircle2, Video, Award, Clock } from 'lucide-react';
import { useLang } from '../../context/LangContext';

interface PricingSectionProps {
  onSelectTier: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectTier }) => {
  const { t } = useLang();

  return (
    <section className="py-16 lg:py-24 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md font-['Geist'] border border-indigo-200">
            {t('pricing.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-['Geist'] tracking-tight">
            {t('pricing.title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-['Inter'] leading-relaxed">
            {t('pricing.subheading')}
          </p>
        </div>

        {/* 2-Column Workflow Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Column 1: For Parents / Students */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-indigo-200 hover:shadow-md transition-all">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/70 border border-indigo-200 px-3 py-1 rounded-full uppercase tracking-wide">
                  {t('pricing.studentJourney')}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 font-['Geist'] leading-snug">
                  {t('pricing.studentTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-['Inter']">
                  {t('pricing.studentDesc')}
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-200/80">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>{t('pricing.rate1')}</strong>{t('pricing.rate1Desc')}</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>{t('pricing.rate2')}</strong>{t('pricing.rate2Desc')}</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>{t('pricing.rate3')}</strong>{t('pricing.rate3Desc')}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onSelectTier}
                className="w-full py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>{t('pricing.browseBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Column 2: For Mentors */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center shadow-sm">
                  <Handshake className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700 px-3 py-1 rounded-full uppercase tracking-wide">
                  {t('pricing.tutorJourney')}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white font-['Geist'] leading-snug">
                  {t('pricing.tutorTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-['Inter']">
                  {t('pricing.tutorDesc')}
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>{t('pricing.tutorRate1')}</strong>{t('pricing.tutorRate1Desc')}</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>{t('pricing.tutorRate2')}</strong>{t('pricing.tutorRate2Desc')}</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>{t('pricing.tutorRate3')}</strong>{t('pricing.tutorRate3Desc')}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onSelectTier}
                className="w-full py-3 px-5 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>{t('pricing.applyBtn')}</span>
                <ArrowRight className="w-4 h-4 text-slate-900" />
              </button>
            </div>
          </div>

        </div>

        {/* Infographic Workflow Bar */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center font-['Geist']">
            {t('pricing.howItWorks')}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center space-y-1">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs mb-1">
                1
              </div>
              <h5 className="font-bold text-xs text-slate-900 font-['Geist']">{t('pricing.step1Title')}</h5>
              <p className="text-[11px] text-slate-500">{t('pricing.step1Desc')}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center space-y-1">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs mb-1">
                2
              </div>
              <h5 className="font-bold text-xs text-slate-900 font-['Geist']">{t('pricing.step2Title')}</h5>
              <p className="text-[11px] text-slate-500">{t('pricing.step2Desc')}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center space-y-1">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs mb-1">
                3
              </div>
              <h5 className="font-bold text-xs text-slate-900 font-['Geist']">{t('pricing.step3Title')}</h5>
              <p className="text-[11px] text-slate-500">{t('pricing.step3Desc')}</p>
            </div>
          </div>
        </div>

        {/* Satisfaction Guarantee Banner */}
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-950 font-['Geist']">
                {t('pricing.guaranteeTitle')}
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed mt-0.5 font-['Inter']">
                {t('pricing.guaranteeDesc')}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
