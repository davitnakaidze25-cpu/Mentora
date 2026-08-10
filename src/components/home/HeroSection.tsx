import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeroSectionProps {
  onSearch: (query: string, subject: string, level: string) => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onViewChange?: (view: string) => void;
}

const heroImages = [
  { src: '/hero1.png', label: 'Math', title: 'Math', heading: 'h1' },
  { src: '/hero2.png', label: 'Physics', title: 'Physics', heading: 'h2' },
  { src: '/hero3.png', label: 'STEM', title: 'STEM', heading: 'h3' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch, onOpenAuth, onViewChange }) => {
  const { currentUser } = useAuth();
  const isTutor = currentUser?.role === 'TUTOR';
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('All');
  const [activeSlide, setActiveSlide] = useState(0);
  const submit = (e: React.FormEvent) => { e.preventDefault(); onSearch(query, subject, 'All'); };

  const handleTutorClick = () => {
    if (currentUser) {
      onViewChange?.(isTutor ? 'tutor-dashboard' : 'home');
    } else {
      onOpenAuth?.('register');
    }
  };

  const handleStudentClick = () => {
    if (currentUser) {
      onViewChange?.(isTutor ? 'tutor-dashboard' : 'student-dashboard');
    } else {
      onOpenAuth?.('register');
    }
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f9fb] to-white pb-16 lg:pb-20 border-b border-slate-200/80">
      <div className="w-full">
        <div className="relative overflow-hidden bg-slate-100">
          <div className="relative h-[360px] sm:h-[520px] lg:h-[700px]">
            {heroImages.map(({ src, label, title, heading }, index) => (
              <div
                key={src}
                className={`absolute inset-0 transition-all duration-700 ${index === activeSlide ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'}`}
              >
                <img
                  src={src}
                  alt={label}
                  className="h-full w-full object-cover brightness-75 contrast-110 saturate-75"
                  onError={(event) => { event.currentTarget.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/35 to-slate-950/85" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[0.2em] text-white uppercase drop-shadow-lg">
                    {heading === 'h1' ? (
                      <h1>{title}</h1>
                    ) : heading === 'h2' ? (
                      <h2>{title}</h2>
                    ) : (
                      <h3>{title}</h3>
                    )}
                  </div>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleTutorClick}
                      className="rounded-full border border-white/70 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                    >
                      {currentUser && isTutor ? 'My Dashboard' : 'Tutor'}
                    </button>
                    <button
                      type="button"
                      onClick={handleStudentClick}
                      className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500"
                    >
                      {currentUser && !isTutor ? 'My Dashboard' : 'Student'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {heroImages.map((image, index) => (
              <button
                key={image.src}
                onClick={() => setActiveSlide(index)}
                aria-label={`Show slide ${index + 1}`}
                className={`h-2 rounded-full transition-all ${activeSlide === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-['Geist'] leading-tight">Find a Komarovi Mentor for Physics &amp; Mathematics.</h1>
          <p className="text-lg text-slate-600">Connect with verified Komarovi high-achievers for 1-on-1 tutoring.</p>
        </div>

        <form onSubmit={submit} className="mt-9 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a subject or mentor"
              className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 text-sm pl-11 pr-4 py-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full sm:w-48 bg-slate-50/70 border border-slate-200 text-slate-900 text-xs font-medium px-3 py-3 rounded-xl"
          >
            <option value="All">Physics &amp; Math</option>
            <option value="Olympiad Physics">Olympiad Physics</option>
            <option value="Olympiad Math">Olympiad Math</option>
            <option value="Calculus & Analysis">Calculus &amp; Analysis</option>
            <option value="Algebra & Geometry">Algebra &amp; Geometry</option>
          </select>
          <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />Find Mentors
          </button>
        </form>
      </div>
    </section>
  );
};

