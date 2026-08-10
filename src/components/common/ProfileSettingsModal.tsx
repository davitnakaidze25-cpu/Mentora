import React, { useState } from 'react';
import { X, User, Settings, ShieldCheck, AlertCircle, CheckCircle2, Clock, Search, ChevronRight, Upload } from 'lucide-react';
import { AuthUser } from '../../context/AuthContext';
import { Tutor } from '../../types';

interface ProfileSettingsModalProps {
  user: AuthUser;
  tutorProfile: Tutor | null;
  onClose: () => void;
  onSave: (
    userUpdate: { fullName?: string; avatarUrl?: string; bio?: string } | null,
    tutorUpdate: { headline?: string; bio?: string; hourlyRate?: number; subjects?: string[] } | null
  ) => Promise<void>;
}

const AVAILABLE_SUBJECTS = ['Math', 'Physics', 'STEM'];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  user,
  tutorProfile,
  onClose,
  onSave,
}) => {
  const [tab, setTab] = useState<'profile' | 'tutor'>('profile');
  const [fullName, setFullName] = useState(user.fullName);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '');
  const [studentBio, setStudentBio] = useState(user.bio ?? '');
  const [headline, setHeadline] = useState(tutorProfile?.title ?? '');
  const [bio, setBio] = useState(tutorProfile?.bio ?? '');
  const [hourlyRate, setHourlyRate] = useState(tutorProfile?.hourlyRate ?? 25);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(tutorProfile?.subjects ?? ['Physics', 'Mathematics']);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const isTutor = user.role === 'TUTOR';

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const userUpdate: { fullName?: string; avatarUrl?: string; bio?: string } = {};
      if (fullName !== user.fullName) userUpdate.fullName = fullName;
      if (avatarUrl !== (user.avatarUrl ?? '')) userUpdate.avatarUrl = avatarUrl;
      if (studentBio !== (user.bio ?? '')) userUpdate.bio = studentBio;

      const subjectsChanged =
        JSON.stringify([...selectedSubjects].sort()) !==
        JSON.stringify([...(tutorProfile?.subjects ?? [])].sort());

      const tutorUpdate = isTutor
        ? {
            headline: headline !== (tutorProfile?.title ?? '') ? headline : undefined,
            bio: bio !== (tutorProfile?.bio ?? '') ? bio : undefined,
            hourlyRate: hourlyRate !== tutorProfile?.hourlyRate ? hourlyRate : undefined,
            subjects: subjectsChanged ? selectedSubjects : undefined,
          }
        : null;

      await onSave(
        Object.keys(userUpdate).length ? userUpdate : null,
        tutorUpdate && Object.values(tutorUpdate).some((v) => v !== undefined) ? tutorUpdate : null
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message ?? 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-7">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text)] font-['Geist']">Account Settings</h2>
              <p className="text-xs text-[var(--color-muted)]">{user.email}</p>
            </div>
          </div>

          {/* Tabs (only for tutors) */}
          {isTutor && (
            <div className="flex gap-2 mb-6 bg-[var(--color-bg)] p-1.5 rounded-2xl">
              {(['profile', 'tutor'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all capitalize ${
                    tab === t
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {t === 'profile' ? 'Personal Info' : 'Mentor Profile'}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {tab === 'profile' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[var(--color-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1.5">Profile Photo</label>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-[var(--color-border)] overflow-hidden flex items-center justify-center shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-indigo-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Upload photo from gallery</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                setError('File size exceeds 2MB limit.');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setAvatarUrl(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <p className="text-[11px] text-[var(--color-muted)]">PNG, JPG, WebP up to 2MB</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-[var(--color-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Or enter image URL (https://...)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1.5">Short Bio / Description</label>
                  <textarea
                    rows={2}
                    value={studentBio}
                    onChange={(e) => setStudentBio(e.target.value)}
                    placeholder="Tell mentors about yourself, your learning goals, and schedule preferences..."
                    className="w-full px-4 py-2.5 rounded-xl border text-xs bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-[var(--color-text)]">Role: {user.role}</p>
                    <p className="text-[var(--color-muted)] mt-0.5">{user.email}</p>
                  </div>
                </div>
              </>
            )}

            {tab === 'tutor' && isTutor && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1.5">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Komarovi Olympiad Physics Mentor"
                    className="w-full px-4 py-3 rounded-xl border text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1.5">Bio</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your teaching approach, background, and achievements..."
                    className="w-full px-4 py-3 rounded-xl border text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1.5">Subjects Taught</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SUBJECTS.map((sub) => {
                      const isSelected = selectedSubjects.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => toggleSubject(sub)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-indigo-400'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{sub}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1.5">Hourly Rate (GEL)</label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 rounded-xl p-3.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            {saved && (
              <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Changes saved successfully.</p>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  Save Changes
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
