import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Tutor, AvailabilitySlot, Booking } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface BookingModalProps {
  tutor: Tutor | null;
  initialSlot?: AvailabilitySlot | null;
  onClose: () => void;
  onCompleteBooking: (newBooking: Booking) => void;
}

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function CalendarPicker({ selectedDate, onSelect }: { selectedDate: Date | null; onSelect: (d: Date) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <span className="text-sm font-bold text-slate-900 font-['Geist']">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {DAYS.map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-bold text-slate-500 uppercase">{d}</div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} className="aspect-square" />;
          const date = new Date(viewYear, viewMonth, day);
          date.setHours(0, 0, 0, 0);
          const isPast = date < today;
          const isSelected = selectedDate?.getFullYear() === viewYear &&
            selectedDate?.getMonth() === viewMonth &&
            selectedDate?.getDate() === day;
          const isToday = date.getTime() === today.getTime();

          return (
            <button
              key={idx}
              onClick={() => !isPast && onSelect(new Date(viewYear, viewMonth, day))}
              disabled={isPast}
              className={`aspect-square flex items-center justify-center text-xs font-medium transition-all rounded-lg m-0.5
                ${isPast ? 'text-slate-300 cursor-not-allowed' : 'cursor-pointer hover:bg-indigo-50'}
                ${isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-sm' : ''}
                ${isToday && !isSelected ? 'ring-2 ring-indigo-400 ring-offset-1 text-indigo-700 font-bold' : ''}
                ${!isSelected && !isToday && !isPast ? 'text-slate-700' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const BookingModal: React.FC<BookingModalProps> = ({
  tutor,
  initialSlot,
  onClose,
  onCompleteBooking,
}) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const subjects = tutor?.subjects && tutor.subjects.length > 0 ? tutor.subjects : ['Math', 'Physics', 'STEM'];
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [studentNotes, setStudentNotes] = useState('');
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill from logged-in user
  const studentName = currentUser?.fullName || '';
  const studentEmail = currentUser?.email || '';

  if (!tutor) return null;

  const canProceedToStep3 = selectedDate !== null && selectedTime !== '';

  const handleConfirmAndPay = async () => {
    if (!canProceedToStep3 || submitting) return;
    setSubmitting(true);

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {}

    const dateStr = selectedDate!.toISOString().split('T')[0];
    const timeSlot = `${selectedTime} – negotiable via chat`;

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      tutorId: tutor.id,
      tutorName: tutor.fullName,
      tutorAvatar: tutor.avatarUrl,
      tutorInstitution: tutor.institution,
      subjectName: selectedSubject,
      date: selectedDate!.toISOString(),
      timeSlot,
      durationMins: 60,
      status: 'PENDING',
      totalPrice: tutor.hourlyRate,
      studentName,
      studentNotes,
      meetingLink: undefined, // Generated only after mentor accepts
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId: tutor.id,
          subjectName: selectedSubject,
          date: selectedDate!.toISOString(),
          timeSlot,
          studentId: currentUser?.id,
          studentName,
          studentNotes,
          totalPrice: tutor.hourlyRate,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          // Use the server-returned booking (has real ID)
          onCompleteBooking(data.data);
          setCreatedBooking(data.data);
          setStep(4);
          setSubmitting(false);
          return;
        }
      }
    } catch {}

    // Fallback: use client-side booking object
    onCompleteBooking(newBooking);
    setCreatedBooking(newBooking);
    setStep(4);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">
                Step {step} of 4
              </span>
            </div>
            <h2 className="text-xl font-bold font-['Geist'] text-white mt-1">
              {step === 4 ? 'Request Sent!' : `Book Session with ${tutor.fullName}`}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* STEP 1: SUBJECT & NOTES */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200/60 flex items-center gap-3">
                <img src={tutor.avatarUrl || '/guest-avatar.png'} alt="" className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-['Geist']">{tutor.fullName}</h4>
                  <p className="text-xs text-slate-600">{tutor.title} • {tutor.hourlyRate} GEL/Lesson</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 font-['Geist']">
                  Select Focus Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30"
                >
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 font-['Geist']">
                  Additional Comments (Optional)
                </label>
                <textarea
                  rows={3}
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="e.g. Preparing for National Physics Olympiad. Need help with Lagrangian dynamics..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2"
                >
                  <span>Select Date & Time</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VISUAL CALENDAR & TIME PICKER */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-['Geist'] mb-3">
                  Select a Date
                </h3>
                <CalendarPicker selectedDate={selectedDate} onSelect={setSelectedDate} />
              </div>

              {selectedDate && (
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-['Geist'] mb-2">
                    Select a Time for {selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                          selectedTime === slot
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Negotiation note */}
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>Note:</strong> Exact times are negotiable via chat after the mentor accepts your request.</span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Back
                </button>

                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedToStep3}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  <span>Review & Confirm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & CONFIRM */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm font-['Geist'] border-b border-slate-200 pb-2">
                  Session Summary
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-500 block">Mentor</span>
                    <strong className="text-slate-900 font-semibold">{tutor.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Subject</span>
                    <strong className="text-slate-900 font-semibold">{selectedSubject}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date</span>
                    <strong className="text-slate-900 font-semibold">
                      {selectedDate?.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Time</span>
                    <strong className="text-slate-900 font-semibold">{selectedTime}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Student</span>
                    <strong className="text-slate-900 font-semibold">{studentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duration</span>
                    <strong className="text-slate-900 font-semibold">60 Minutes</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Mentor Rate</span>
                    <span>{tutor.hourlyRate} GEL/Lesson</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Platform Fee</span>
                    <span className="text-emerald-600 font-semibold">0 GEL (Pay-as-you-go)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">Total</span>
                    <strong className="text-lg font-bold font-['Geist'] text-indigo-600">
                      {tutor.hourlyRate} GEL
                    </strong>
                  </div>
                </div>
              </div>

              {studentNotes && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <strong className="text-slate-500 block uppercase tracking-wider mb-1">Your Notes</strong>
                  {studentNotes}
                </div>
              )}

              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Risk-Free:</strong> If unsatisfied with your first session, Mentora offers a 100% refund guarantee.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Back
                </button>

                <button
                  onClick={handleConfirmAndPay}
                  disabled={submitting}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  <span>Send Booking Request</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION */}
          {step === 4 && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-['Geist'] text-slate-900">
                  Request Sent!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your booking request has been sent to <strong>{tutor.fullName}</strong>. 
                  You will be notified as soon as they accept. The meeting link will appear in your dashboard after confirmation.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-800 flex items-start gap-2.5 text-left">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Next step:</strong> Use the chat to coordinate exact timing with your mentor. Remember — times are negotiable!
                </span>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-sm hover:bg-indigo-700"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
