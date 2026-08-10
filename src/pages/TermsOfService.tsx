import { Link } from 'react-router-dom';

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
          <div className="mb-6 inline-flex items-center rounded-full bg-indigo-600/10 px-4 py-2 text-sm font-semibold text-indigo-300 ring-1 ring-indigo-500/20">
            Terms of Service
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-white">Terms & Conditions</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              These terms explain how Mentora operates as a peer-to-peer tutoring directory and the responsibilities of everyone who uses the platform.
            </p>
            <Link
              to="/"
              className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white">Platform Scope</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Mentora is a peer-to-peer matchmaking directory for school STEM tutoring. We connect verified Komarovi students and alumni with learners, but we are not an escrow service or financial institution.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white">Direct Peer Payments</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Payments are settled directly between students and tutors using local mobile banking. Users are responsible for verifying the transferred amounts and ensuring the correct recipient receives payment.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white">Community Standards</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              All users must respect academic integrity, maintain respectful communication, and comply with domain-restricted account eligibility. Mentora reserves the right to remove users who violate these expectations.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white">Reviews & Performance Ledger</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Tutors agree to transparent review logging and metric tracking on their profiles. Performance history, ratings, and review summaries help students choose the right mentor while promoting accountability.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
