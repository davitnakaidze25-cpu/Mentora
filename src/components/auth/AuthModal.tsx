import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { X, Mail, Lock, User, ShieldCheck, Loader2, Chrome, GraduationCap, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (role: string) => void;
  initialMode?: Mode;
}

type Tab = 'student' | 'tutor';
type Mode = 'login' | 'register';

// Zod schemas
const studentRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  email: z.string().email('A valid email is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  grade: z.string().min(1, 'Grade is required.'),
});

const tutorRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  email: z
    .string()
    .email('A valid email is required.')
    .refine((v) => v.toLowerCase().endsWith('@students.gov.ge'), {
      message: 'Tutors must use a valid @students.gov.ge email address.',
    }),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const loginSchema = z.object({
  email: z.string().email('A valid email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

type StudentRegisterForm = z.infer<typeof studentRegisterSchema>;
type TutorRegisterForm = z.infer<typeof tutorRegisterSchema>;
type LoginForm = z.infer<typeof loginSchema>;

function zodValidate<T>(schema: z.ZodSchema<T>, data: unknown): { values?: T; errors?: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) return { values: result.data };
  const errors: Record<string, string> = {};
  (result.error.issues ?? []).forEach((e: z.ZodIssue) => {
    const key = e.path[0] as string;
    if (!errors[key]) errors[key] = e.message;
  });
  return { errors };
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, initialMode = 'login' }) => {
  const { t } = useLang();
  const { login, register: authRegister, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab | null>(initialMode === 'register' ? null : 'student');
  const [mode, setMode] = useState<Mode>(initialMode);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { register, handleSubmit, reset, watch } = useForm<any>();

  const switchMode = (m: Mode) => {
    setMode(m);
    setActiveTab(m === 'register' ? null : 'student');
    setServerError('');
    setFieldErrors({});
    reset();
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setServerError('');
    setFieldErrors({});
    reset();
  };

  const onSubmit = async (raw: any) => {
    setServerError('');
    setFieldErrors({});

    let validated: any;
    if (mode === 'login') {
      const r = zodValidate(loginSchema, raw);
      if (r.errors) { setFieldErrors(r.errors); return; }
      validated = r.values;
    } else if (activeTab === 'student') {
      const r = zodValidate(studentRegisterSchema, raw);
      if (r.errors) { setFieldErrors(r.errors); return; }
      validated = r.values;
    } else if (activeTab === 'tutor') {
      const r = zodValidate(tutorRegisterSchema, raw);
      if (r.errors) { setFieldErrors(r.errors); return; }
      validated = r.values;
    } else {
      setServerError('Choose whether you are a Student/Parent or a Komarovi Mentor.');
      return;
    }

    try {
      if (mode === 'login') {
        const user = await login(validated.email, validated.password);
        onSuccess(user.role);
      } else {
        const role = activeTab === 'tutor' ? 'TUTOR' : 'STUDENT';
        const user = await authRegister({ ...validated, role });
        onSuccess(user.role);
      }
      onClose();
    } catch (e: any) {
      setServerError(e.message ?? t('auth.errorGeneric'));
    }
  };

  const handleGoogleAuth = () => {
    // Google OAuth stub — wire GOOGLE_CLIENT_ID when available
    setServerError('Google OAuth integration requires a configured Google Client ID. Please use email/password for now.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-7">
          {/* Logo + Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text)] font-['Geist']">
                {mode === 'login' ? t('auth.signIn') : t('auth.createAccount')}
              </h2>
              <p className="text-xs text-[var(--color-muted)]">Mentora Academic Platform</p>
            </div>
          </div>

          {/* Role choice is required before registration. */}
          {mode === 'register' && (
            <div className="flex gap-2 mb-6 bg-[var(--color-bg)] p-1.5 rounded-2xl">
              <button
                onClick={() => switchTab('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'student'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                {t('auth.roleStudent')}
              </button>
              <button
                onClick={() => switchTab('tutor')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'tutor'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('auth.roleTutor')}
              </button>
            </div>
          )}

          {/* Tutor domain note */}
          {mode === 'register' && activeTab === 'tutor' && (
            <div className="mb-5 flex items-start gap-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed">
                Tutors must register with a <strong>@students.gov.ge</strong> email address.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Full name (register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1.5">
                  {t('auth.fullName')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--color-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="Giorgi Beridze"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                </div>
                {fieldErrors.fullName && <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>}
              </div>
            )}

            {/* Grade (student register only) */}
            {mode === 'register' && activeTab === 'student' && (
              <div>
                <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1.5">
                  Grade Level
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-[var(--color-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    {...register('grade')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all appearance-none"
                  >
                    <option value="">Select Grade</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
                {fieldErrors.grade && <p className="text-xs text-red-500 mt-1">{fieldErrors.grade}</p>}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--color-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder={activeTab === 'tutor' && mode === 'register' ? 'yourname@students.gov.ge' : 'you@example.com'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--color-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder={mode === 'register' ? 'Minimum 8 characters' : '••••••••'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
              </div>
              {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 rounded-xl p-3.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-400 font-medium">{serverError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('auth.submitting')}
                </>
              ) : mode === 'login' ? (
                t('auth.signIn')
              ) : (
                t('auth.createAccount')
              )}
            </button>

            {/* Divider + Google (student only) */}
            {(mode === 'register' && activeTab === 'student') || mode === 'login' ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[var(--color-border)]" />
                  <span className="text-xs text-[var(--color-muted)] font-medium">or</span>
                  <div className="h-px flex-1 bg-[var(--color-border)]" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full py-3 border border-[var(--color-border)] hover:border-indigo-400 bg-[var(--color-bg)] text-[var(--color-text)] font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2.5 hover:shadow-sm"
                >
                  <Chrome className="w-4 h-4 text-indigo-500" />
                  {t('auth.googleSignIn')}
                </button>
              </>
            ) : null}
          </form>

          {/* Mode switcher */}
          <p className="mt-5 text-center text-xs text-[var(--color-muted)]">
            {mode === 'login' ? t('auth.orSignUp') : t('auth.orSignIn')}{' '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-indigo-500 font-semibold hover:underline"
            >
              {mode === 'login' ? t('auth.createAccount') : t('auth.signIn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
