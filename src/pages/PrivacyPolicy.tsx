import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
          <div className="mb-6 inline-flex items-center rounded-full bg-indigo-600/10 px-4 py-2 text-sm font-semibold text-indigo-300 ring-1 ring-indigo-500/20">
            Privacy Policy
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-white">Privacy & Data Protection</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Mentora respects your privacy and protects your information while supporting trusted school tutoring connections.
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
            <h2 className="text-2xl font-semibold text-white">Information We Collect</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              We collect information necessary to support safe mentoring across the Komarovi school network. This includes school email addresses, profile details, chat logs, session records, and uploaded proof of payment screenshots when students submit TBC/BOG transfer confirmations.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white">How We Use Data</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Collected data is used to verify accounts within the school ecosystem, coordinate tutoring bookings, and maintain platform security. We use this information to match students with verified tutors and to support administrative review in case of disputes.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white">Payment Proof Handling</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Uploaded payment proof screenshots for TBC or BOG transactions are stored securely and are accessible only by authorized Mentora staff for the purpose of transaction verification. These uploads are not shared outside the platform and are retained only as long as necessary to confirm payment.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white">Data Protection & Rights</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              We do not sell or share student data with third parties. Student information remains within the Mentora platform and is used exclusively for tutoring coordination and verification. Users can request account deletion, and we will remove personal data in accordance with our retention policies.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

