import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Award, ArrowRight, CheckCircle, Mail } from 'lucide-react';
import { useLang } from '../../context/LangContext';

export const Footer: React.FC = () => {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#0f172a] text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white font-['Geist']">Mentora</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">{t('footer.brandSub')}</p>
            <div className="pt-2 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-xs bg-slate-800/80 text-slate-300 px-3 py-1.5 rounded-md border border-slate-700/60">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('footer.verifiedBadge')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-slate-800/80 text-slate-300 px-3 py-1.5 rounded-md border border-slate-700/60">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{t('footer.acceptanceBadge')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-['Geist']">{t('footer.featuredSubjectsHeader')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#tutors" className="hover:text-white transition-colors">Math</a></li>
              <li><a href="#tutors" className="hover:text-white transition-colors">Physics</a></li>
              <li><a href="#tutors" className="hover:text-white transition-colors">STEM</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-['Geist']">{t('footer.mentorInstHeader')}</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-400">Komarovi Olympiad Team Alumni</span></li>
              <li><span className="text-slate-400">National Physics & Math Public School N199</span></li>
              <li><span className="text-slate-400">Komarovi Gold & Silver Medalists</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-['Geist']">{t('footer.journalHeader')}</h4>
            <p className="text-xs text-slate-400">{t('footer.journalDesc')}</p>
            {subscribed ? (
              <div className="bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 p-3 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Subscribed! Check your inbox for our Physics & Math Olympiad strategy guide.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your institutional email..."
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white pl-9 pr-3 py-2 text-xs rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{t('footer.subscribeBtn')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Mentora Academic Network. {t('footer.allRights')}</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">{t('footer.terms')}</Link>
            <Link to="/" className="hover:text-slate-400 transition-colors">{t('footer.guarantee')}</Link>
            <Link to="/" className="hover:text-slate-400 transition-colors">{t('footer.integrity')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
