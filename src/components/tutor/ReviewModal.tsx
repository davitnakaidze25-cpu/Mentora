import React, { useState } from 'react';
import { Star, X, CheckCircle2, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ReviewModalProps {
  bookingId: string;
  tutorProfileId: string;
  tutorName: string;
  tutorAvatar?: string;
  subjectName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  bookingId,
  tutorProfileId,
  tutorName,
  tutorAvatar,
  subjectName,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || rating === 0 || !comment.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          authorId: currentUser.id,
          tutorProfileId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to submit review.');
      } else {
        setSubmitted(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2200);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  const ratingColors = ['', 'text-rose-500', 'text-orange-500', 'text-amber-500', 'text-lime-600', 'text-emerald-600'];

  const activeRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6">
          {/* Decorative star burst */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-400">
              <path d="M50 5 L61 35 L95 35 L68 57 L79 91 L50 70 L21 91 L32 57 L5 35 L39 35 Z"/>
            </svg>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            {tutorAvatar ? (
              <img
                src={tutorAvatar}
                alt={tutorName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl border-2 border-white/20">
                {tutorName.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">
                Rate Your Session
              </p>
              <h2 className="text-lg font-bold font-['Geist']">{tutorName}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{subjectName}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto animate-bounce-once">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg font-['Geist']">Review Submitted!</p>
                <p className="text-xs text-slate-500 mt-1">
                  Thank you for your {rating}-star feedback. It helps the Mentora community!
                </p>
              </div>
              <div className="flex justify-center gap-1 pt-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-6 h-6 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 font-['Geist']">
                  Your Rating
                </label>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-all duration-150 hover:scale-125 active:scale-110 focus:outline-none"
                        title={ratingLabels[star]}
                      >
                        <Star
                          className={`w-10 h-10 transition-colors duration-150 drop-shadow-sm ${
                            star <= activeRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 fill-slate-100'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className={`h-5 text-sm font-bold transition-all ${activeRating > 0 ? ratingColors[activeRating] : 'text-transparent'}`}>
                    {activeRating > 0 ? ratingLabels[activeRating] : 'Select a rating'}
                  </div>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-['Geist']">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Your Comments
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience — what was great, what helped you most..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm p-3.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1 text-right">
                  {comment.length} characters
                </p>
              </div>

              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rating === 0 || !comment.trim() || submitting}
                  className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Star className="w-3.5 h-3.5 fill-white" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
