import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Upload, 
  Sparkles, 
  Calculator, 
  Award, 
  Clock, 
  FileText, 
  UserCheck, 
  Plus, 
  Trash2,
  Mail,
  Lock,
  User,
  GraduationCap
} from 'lucide-react';
import { Tutor, AvailabilitySlot } from '../../types';

interface TutorRegistrationModalProps {
  onClose: () => void;
  onRegisterSuccess: (newTutor: Tutor) => void;
}

export const KOMAROVI_SUBJECT_OPTIONS = [
  'Olympiad Physics (IPhO / National)',
  'Olympiad Mathematics (IMO / National)',
  'Classical Mechanics & Electrodynamics',
  'Calculus & Mathematical Analysis',
  'Algebra & Plane Geometry',
  'General School Physics',
  'General School Mathematics',
];

export const TutorRegistrationModal: React.FC<TutorRegistrationModalProps> = ({
  onClose,
  onRegisterSuccess,
}) => {
  const [step, setStep] = useState<number>(1);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpVerified, setOtpVerified] = useState<boolean>(false);

  // Step 1: Base Account
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('Grade 12');

  // Step 2: Specializations
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Step 3: Hourly Rate
  const [hourlyRate, setHourlyRate] = useState<number>(25);

  // Step 4: Achievements & Verification Docs
  const [achievements, setAchievements] = useState<{ title: string; issuer: string; year: string }[]>([
    { title: 'National Physics Olympiad — 1st Degree Diploma', issuer: 'Ministry of Education', year: '2025' }
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Step 5: Bio & Philosophy
  const [headline, setHeadline] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [teachingPhilosophy, setTeachingPhilosophy] = useState<string>('');
  const [isOptimizingBio, setIsOptimizingBio] = useState<boolean>(false);

  // Step 6: Availability
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<{ day: string; time: string }[]>([
    { day: 'Mon', time: '16:00' },
    { day: 'Wed', time: '17:00' },
    { day: 'Fri', time: '16:00' }
  ]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlotsList = ['09:00', '11:00', '14:00', '16:00', '18:00', '20:00'];

  // Calculations for Step 3
  const tutorEarnings = (hourlyRate * 0.82).toFixed(2);
  const platformFee = (hourlyRate * 0.18).toFixed(2);

  const handleSendOTP = () => {
    if (!email) return;
    setOtpSent(true);
  };

  const handleVerifyOTP = () => {
    if (otpCode.trim().length >= 4 || email.includes('@students.gov.ge') || email.includes('komarovi')) {
      setOtpVerified(true);
    } else {
      alert('Verification code validated! (Use any 4+ digit code or komarovi email for demo)');
      setOtpVerified(true);
    }
  };

  const toggleSubject = (subj: string) => {
    if (selectedSubjects.includes(subj)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subj));
    } else {
      setSelectedSubjects([...selectedSubjects, subj]);
    }
  };

  const handleAddAchievement = () => {
    setAchievements([...achievements, { title: '', issuer: '', year: new Date().getFullYear().toString() }]);
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileNames = Array.from(e.target.files).map((f: File) => f.name);
      setUploadedFiles([...uploadedFiles, ...fileNames]);
    }
  };

  const handleOptimizeBio = () => {
    setIsOptimizingBio(true);
    setTimeout(() => {
      setHeadline(`Komarovi ${gradeLevel} • ${selectedSubjects[0] || 'Physics & Math'} Specialist`);
      setBio(`High-achieving Komarovi ${gradeLevel.toLowerCase()} student specializing in ${selectedSubjects.slice(0, 2).join(' and ') || 'Physics and Mathematics'}. Committed to helping peers build deep conceptual intuition and excel in Olympiads and school exams.`);
      setTeachingPhilosophy('First-principles problem decomposition. I guide students through breaking down complex problems step-by-step from fundamental physical and mathematical laws.');
      setIsOptimizingBio(false);
    }, 800);
  };

  const toggleSlot = (day: string, time: string) => {
    const exists = selectedTimeSlots.some((s) => s.day === day && s.time === time);
    if (exists) {
      setSelectedTimeSlots(selectedTimeSlots.filter((s) => !(s.day === day && s.time === time)));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, { day, time }]);
    }
  };

  const handleSubmitRegistration = () => {
    const formattedSlots: AvailabilitySlot[] = selectedTimeSlots.map((s, idx) => ({
      id: `slot-${idx}-${Date.now()}`,
      dayOfWeek: daysOfWeek.indexOf(s.day) + 1,
      dayName: s.day,
      time: s.time,
      isBooked: false,
    }));

    const newTutorProfile: Tutor = {
      id: `tutor-${Date.now()}`,
      fullName: fullName || 'Komarovi Tutor',
      title: headline || `Komarovi ${gradeLevel} • Verified Peer Mentor`,
      avatarUrl: '/guest-avatar.png',
      institution: `Komarovi ${gradeLevel}`,
      institutionLogo: 'Komarovi',
      degree: `Komarovi ${gradeLevel} Student`,
      graduationYear: 2026,
      verified: false, // Default false until admin review
      featured: false,
      hourlyRate: Number(hourlyRate),
      rating: 5.0,
      reviewCount: 0,
      completedHours: 0,
      responseTimeMins: 10,
      bio: bio || 'Komarovi student dedicated to peer excellence in Physics & Mathematics.',
      teachingApproach: teachingPhilosophy || 'First-principles problem solving.',
      subjects: selectedSubjects.length > 0 ? selectedSubjects : ['All Physics & Math'],
      levels: ['HIGH_SCHOOL', 'OLYMPIAD_SPECIALIST'],
      achievements: achievements.map((a) => `${a.title} (${a.year})`),
      availabilitySlots: formattedSlots,
      reviews: [],
      acceptanceRate: 'Pending Verification',
    };

    onRegisterSuccess(newTutorProfile);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full">
                  Komarovi Ecosystem Registration
                </span>
                <span className="text-xs font-mono text-slate-400">Step {step} of 6</span>
              </div>
              <h2 className="text-xl font-bold font-['Geist'] text-white mt-0.5">
                Register as Verified Komarovi Mentor
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 flex">
          <div 
            className="bg-indigo-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* STEP 1: Account Creation & Institutional Verification */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 font-['Geist']">
                  Step 1: Account Creation & Institutional Verification
                </h3>
                <p className="text-xs text-slate-500 font-['Inter']">
                  Verify your active Komarovi student or alumni status with your school email or student ID.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 font-['Geist']">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Luka Giorgadze"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 font-['Geist']">
                    Komarovi Grade Level
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium p-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Grade 10">Komarovi Grade 10</option>
                    <option value="Grade 11">Komarovi Grade 11</option>
                    <option value="Grade 12">Komarovi Grade 12</option>
                    <option value="Alumni">Komarovi Olympiad Team Alumni</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 font-['Geist']">
                    Institutional Email (@students.gov.ge / personal)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="luka.giorgadze@students.gov.ge"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 font-['Geist']">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Inline OTP Verification Box */}
              <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 font-['Geist']">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Komarovi Institutional Verification Gate</span>
                  </div>
                  {otpVerified && (
                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  )}
                </div>

                {!otpVerified ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-600">
                      Click below to send a 4-digit verification Magic Link / OTP code to your institutional email.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 4-digit OTP (e.g. 1990)"
                        className="bg-white border border-slate-200 text-slate-900 text-xs px-3 py-2 rounded-xl flex-1"
                      />
                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
                        >
                          Send Code
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleVerifyOTP}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
                        >
                          Verify OTP
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 font-semibold">
                    ✓ Institutional status verified for {email || 'Komarovi Student'}.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Physics & Math Specializations */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 font-['Geist']">
                  Step 2: Physics & Math Specializations
                </h3>
                <p className="text-xs text-slate-500 font-['Inter']">
                  Select all subjects you are qualified to mentor within the strict Komarovi curriculum.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider font-['Geist']">
                  Allowed Disciplines (Multi-Select)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {KOMAROVI_SUBJECT_OPTIONS.map((subj) => {
                    const isSelected = selectedSubjects.includes(subj);
                    return (
                      <div
                        key={subj}
                        onClick={() => toggleSubject(subj)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs font-semibold ${
                          isSelected
                            ? 'bg-indigo-50/90 border-indigo-500 text-indigo-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>{subj}</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Hourly Rate & Earnings Calculator */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 font-['Geist']">
                  Step 3: Hourly Rate & Earnings Calculator
                </h3>
                <p className="text-xs text-slate-500 font-['Inter']">
                  Set your custom lesson rate in Georgian Lari (GEL). Mentora handles automated payment splits.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 font-['Geist']">
                    Hourly Fee: {hourlyRate} GEL / Lesson
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="1"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#004ac6]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>10 GEL/Lesson</span>
                    <span>35 GEL/Lesson</span>
                    <span>60 GEL/Lesson</span>
                  </div>
                </div>

                {/* Live Revenue Breakdown Box */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-['Geist']">
                      Transparent 82 / 18 Split Breakdown
                    </span>
                    <Calculator className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                      <span className="text-[11px] text-slate-400 block font-medium">Your Take-Home Earnings (82%)</span>
                      <span className="text-xl font-bold text-emerald-400 font-['Geist']">{tutorEarnings} GEL / Lesson</span>
                    </div>

                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                      <span className="text-[11px] text-slate-400 block font-medium">Platform & Tech Fee (18%)</span>
                      <span className="text-xl font-bold text-slate-300 font-['Geist']">{platformFee} GEL / Lesson</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    * Earnings are automatically transferred to your registered bank account weekly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Academic Achievements & Verification Documents */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 font-['Geist']">
                  Step 4: Academic Achievements & Verification Documents
                </h3>
                <p className="text-xs text-slate-500 font-['Inter']">
                  Upload Olympiad diploma scans or grade transcripts. Docs are stored securely for admin verification.
                </p>
              </div>

              {/* Achievements List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider font-['Geist']">
                    Olympiad Medals & Honors
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAchievement}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Achievement
                  </button>
                </div>

                {achievements.map((ach, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <input
                      type="text"
                      value={ach.title}
                      onChange={(e) => {
                        const updated = [...achievements];
                        updated[idx].title = e.target.value;
                        setAchievements(updated);
                      }}
                      placeholder="Title (e.g. National Physics Olympiad Gold)"
                      className="bg-white border border-slate-200 text-slate-900 text-xs px-2.5 py-1.5 rounded-lg flex-1"
                    />
                    <input
                      type="text"
                      value={ach.year}
                      onChange={(e) => {
                        const updated = [...achievements];
                        updated[idx].year = e.target.value;
                        setAchievements(updated);
                      }}
                      placeholder="Year"
                      className="bg-white border border-slate-200 text-slate-900 text-xs px-2.5 py-1.5 rounded-lg w-20"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* File Uploader */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider font-['Geist']">
                  Proof Scans / Transcripts (PDF / PNG / JPG)
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center space-y-2 bg-slate-50/50 transition-colors relative">
                  <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">Click or drag diploma files to upload</p>
                  <p className="text-[11px] text-slate-400">Max size: 10MB per document (is_verified default: pending review)</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="pt-2 space-y-1">
                    {uploadedFiles.map((fname, i) => (
                      <div key={i} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-medium truncate">{fname}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Biography & Teaching Style */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 font-['Geist']">
                  Step 5: Biography & Teaching Philosophy
                </h3>
                <p className="text-xs text-slate-500 font-['Inter']">
                  Describe your mentoring approach to help Komarovi students and parents choose your profile.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleOptimizeBio}
                  disabled={isOptimizingBio}
                  className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isOptimizingBio ? 'Optimizing with AI...' : 'Optimize Bio with AI'}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 font-['Geist']">
                    Profile Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Komarovi 12th Grade • IPhO Gold Medalist"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 font-['Geist']">
                    Full Biography
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a brief overview of your academic journey at Komarovi..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 font-['Geist']">
                    Teaching Philosophy
                  </label>
                  <textarea
                    rows={2}
                    value={teachingPhilosophy}
                    onChange={(e) => setTeachingPhilosophy(e.target.value)}
                    placeholder="e.g. First-principles problem decomposition..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Weekly Availability Grid */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 font-['Geist']">
                  Step 6: Weekly Availability Grid
                </h3>
                <p className="text-xs text-slate-500 font-['Inter']">
                  Select recurring weekly time slots when you are available for trial lessons.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-700 font-['Geist']">
                  {daysOfWeek.map((d) => (
                    <div key={d} className="py-1">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {daysOfWeek.map((d) => (
                    <div key={d} className="space-y-1.5">
                      {timeSlotsList.map((t) => {
                        const active = selectedTimeSlots.some((s) => s.day === d && s.time === t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleSlot(d, t)}
                            className={`w-full py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                              active
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Controls Footer */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 disabled:opacity-40"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitRegistration}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
            >
              Submit Komarovi Application <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
