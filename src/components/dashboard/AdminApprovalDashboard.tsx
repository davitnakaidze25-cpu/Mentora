import React, { useEffect, useState, useCallback } from 'react';
import {
  ShieldCheck, ShieldX, Clock, CheckCircle2, XCircle, RefreshCw, Users, Trash2,
  BookOpen, Star, ToggleLeft, ToggleRight, Search, ChevronDown, AlertTriangle,
  UserCog, Calendar, Filter, Crown, GraduationCap, UserCheck, Loader2, X
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingTutor {
  id: string;
  fullName: string;
  email: string;
  institution: string;
  verificationStatus: string;
  featured: boolean;
  rating: number;
  hourlyRate: number;
  createdAt?: string;
}

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN' | 'PARENT';
  avatarUrl?: string;
  createdAt: string;
  grade?: string;
  tutorProfile: {
    id: string;
    verificationStatus: string;
    featured: boolean;
    rating: number;
    hourlyRate: number;
  } | null;
}

interface AdminBooking {
  id: string;
  tutorName: string;
  studentName: string;
  subjectName: string;
  date: string;
  status: string;
  totalPrice: number;
  createdAt: string;
}

type AdminTab = 'tutors' | 'users' | 'bookings';

// ─── Confirm Dialog ────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger = true }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
    <div
      className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl space-y-4 animate-[scaleIn_0.15s_ease-out]"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-red-100 dark:bg-red-950' : 'bg-amber-100 dark:bg-amber-950'}`}>
          <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-amber-600'}`} />
        </div>
        <div>
          <h3 className="font-bold text-sm font-['Geist']" style={{ color: 'var(--color-text)' }}>{title}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>{message}</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold rounded-xl border transition-colors"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusBadge = (status: string) => {
  const cfg: Record<string, { cls: string; icon: React.ReactNode }> = {
    PENDING:   { cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',   icon: <Clock className="w-3 h-3" /> },
    VERIFIED:  { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800', icon: <CheckCircle2 className="w-3 h-3" /> },
    REJECTED:  { cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',         icon: <XCircle className="w-3 h-3" /> },
    CONFIRMED: { cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',       icon: <CheckCircle2 className="w-3 h-3" /> },
    COMPLETED: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800', icon: <Star className="w-3 h-3" /> },
    CANCELLED: { cls: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',   icon: <XCircle className="w-3 h-3" /> },
    DECLINED:  { cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',            icon: <XCircle className="w-3 h-3" /> },
  };
  const { cls, icon } = cfg[status] ?? { cls: 'bg-slate-100 text-slate-600 border-slate-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cls}`}>
      {icon}{status}
    </span>
  );
};

const roleBadge = (role: string) => {
  const cfg: Record<string, string> = {
    ADMIN:   'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
    TUTOR:   'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800',
    STUDENT: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
    PARENT:  'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg[role] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {role}
    </span>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

interface AdminApprovalDashboardProps {
  onTutorStatusChange?: (tutorId: string, newStatus: string) => void;
}

export const AdminApprovalDashboard: React.FC<AdminApprovalDashboardProps> = ({ onTutorStatusChange }) => {
  const [tab, setTab] = useState<AdminTab>('tutors');

  // Tutor state
  const [tutors, setTutors] = useState<PendingTutor[]>([]);
  const [tutorLoading, setTutorLoading] = useState(true);
  const [tutorProcessing, setTutorProcessing] = useState<string | null>(null);
  const [tutorFilter, setTutorFilter] = useState<'All' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');

  // User state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [userProcessing, setUserProcessing] = useState<string | null>(null);

  // Booking state
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('All');
  const [bookingProcessing, setBookingProcessing] = useState<string | null>(null);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string; message: string; onConfirm: () => void; confirmLabel?: string; danger?: boolean;
  } | null>(null);

  // ── Tutor loaders ────────────────────────────────────────────────────

  const loadTutors = useCallback(async () => {
    setTutorLoading(true);
    try {
      const status = tutorFilter === 'All' ? '' : tutorFilter;
      const res = await fetch(`/api/tutors?status=${status}`);
      const data = await res.json();
      if (data.success) {
        setTutors(
          (data.data as any[]).map((t) => ({
            id: t.id,
            fullName: t.fullName,
            email: t.email ?? '',
            institution: t.institution,
            verificationStatus: t.verificationStatus ?? 'PENDING',
            featured: t.featured ?? false,
            rating: t.rating ?? 0,
            hourlyRate: t.hourlyRate ?? 0,
            createdAt: t.createdAt,
          }))
        );
      }
    } catch { /* silent */ }
    finally { setTutorLoading(false); }
  }, [tutorFilter]);

  const handleTutorDecision = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    setTutorProcessing(id);
    try {
      await fetch(`/api/tutors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: status }),
      });
      setTutors((prev) => prev.map((t) => (t.id === id ? { ...t, verificationStatus: status } : t)));
      // Immediately sync parent app state so student view updates without reload
      onTutorStatusChange?.(id, status);
    } finally { setTutorProcessing(null); }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    setTutorProcessing(id);
    try {
      await fetch(`/api/admin/tutors/${id}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !featured }),
      });
      setTutors((prev) => prev.map((t) => (t.id === id ? { ...t, featured: !featured } : t)));
    } finally { setTutorProcessing(null); }
  };

  const handleDeleteTutor = (id: string) => {
    setConfirmDialog({
      title: 'Delete Tutor Profile',
      message: 'This will permanently delete the tutor profile, all their bookings, and reviews. This cannot be undone.',
      confirmLabel: 'Delete Profile',
      onConfirm: async () => {
        setConfirmDialog(null);
        setTutorProcessing(id);
        try {
          await fetch(`/api/admin/tutors/${id}`, { method: 'DELETE' });
          setTutors((prev) => prev.filter((t) => t.id !== id));
        } finally { setTutorProcessing(null); }
      },
    });
  };

  // ── User loaders ─────────────────────────────────────────────────────

  const loadUsers = useCallback(async () => {
    setUserLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'All') params.set('role', roleFilter);
      if (userSearch.trim()) params.set('search', userSearch.trim());
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch { /* silent */ }
    finally { setUserLoading(false); }
  }, [roleFilter, userSearch]);

  const handleDeleteUser = (user: AdminUser) => {
    setConfirmDialog({
      title: `Delete "${user.fullName}"`,
      message: `Permanently delete this user account and all associated data (bookings, messages, reviews). Cannot be undone.`,
      confirmLabel: 'Delete User',
      onConfirm: async () => {
        setConfirmDialog(null);
        setUserProcessing(user.id);
        try {
          await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
          setUsers((prev) => prev.filter((u) => u.id !== user.id));
        } finally { setUserProcessing(null); }
      },
    });
  };

  const handleChangeRole = (user: AdminUser, newRole: string) => {
    setConfirmDialog({
      title: `Change Role to ${newRole}`,
      message: `Change ${user.fullName}'s role from ${user.role} to ${newRole}?`,
      confirmLabel: 'Change Role',
      danger: false,
      onConfirm: async () => {
        setConfirmDialog(null);
        setUserProcessing(user.id);
        try {
          await fetch(`/api/admin/users/${user.id}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
          });
          setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole as any } : u)));
        } finally { setUserProcessing(null); }
      },
    });
  };

  // ── Booking loaders ───────────────────────────────────────────────────

  const loadBookings = useCallback(async () => {
    setBookingLoading(true);
    try {
      const params = new URLSearchParams();
      if (bookingFilter !== 'All') params.set('status', bookingFilter);
      const res = await fetch(`/api/admin/bookings?${params}`);
      const data = await res.json();
      if (data.success) setBookings(data.data);
    } catch { /* silent */ }
    finally { setBookingLoading(false); }
  }, [bookingFilter]);

  const handleDeleteBooking = (id: string) => {
    setConfirmDialog({
      title: 'Delete Booking',
      message: 'This will permanently delete the booking and any associated messages or reviews.',
      confirmLabel: 'Delete Booking',
      onConfirm: async () => {
        setConfirmDialog(null);
        setBookingProcessing(id);
        try {
          await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
          setBookings((prev) => prev.filter((b) => b.id !== id));
        } finally { setBookingProcessing(null); }
      },
    });
  };

  const handleChangeBookingStatus = async (id: string, status: string) => {
    setBookingProcessing(id);
    try {
      await fetch(`/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } finally { setBookingProcessing(null); }
  };

  // ── Effect hooks ──────────────────────────────────────────────────────

  useEffect(() => { loadTutors(); }, [loadTutors]);
  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab, loadUsers]);
  useEffect(() => { if (tab === 'bookings') loadBookings(); }, [tab, loadBookings]);

  // ── Derived counts ────────────────────────────────────────────────────

  const pendingCount = tutors.filter((t) => t.verificationStatus === 'PENDING').length;
  const verifiedCount = tutors.filter((t) => t.verificationStatus === 'VERIFIED').length;

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'tutors',   label: 'Tutor Approvals', icon: <ShieldCheck className="w-4 h-4" />, badge: pendingCount },
    { id: 'users',    label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { id: 'bookings', label: 'Bookings',         icon: <BookOpen className="w-4 h-4" /> },
  ];

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="py-8 min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header */}
        <div
          className="p-6 rounded-2xl border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-['Geist']" style={{ color: 'var(--color-text)' }}>
                Admin Control Panel
              </h1>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Manage users, tutors, and bookings — with full delete &amp; manipulation access
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Tutors', value: tutors.length, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
              { label: 'Pending Review', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
              { label: 'Verified', value: verifiedCount, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
              { label: 'Total Users', value: users.length || '—', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <div className={`text-2xl font-bold font-['Geist'] ${color}`}>{value}</div>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--color-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all relative ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              style={tab !== t.id ? { color: 'var(--color-muted)' } : undefined}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              {t.badge != null && t.badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20' : 'bg-amber-500 text-white'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tutor Approvals Tab ─────────────────────────────────────── */}
        {tab === 'tutors' && (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {/* Toolbar */}
            <div className="p-4 flex flex-wrap items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex gap-1.5 flex-1">
                {(['All', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTutorFilter(f)}
                    className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                      tutorFilter === f ? 'bg-indigo-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={tutorFilter !== f ? { color: 'var(--color-muted)' } : undefined}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button
                onClick={loadTutors}
                className="p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {tutorLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: 'var(--color-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading tutors…</p>
              </div>
            ) : tutors.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <ShieldX className="w-8 h-8 mx-auto" style={{ color: 'var(--color-muted)' }} />
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>No tutors found</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Try a different filter.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {tutors.map((tutor) => (
                  <div key={tutor.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm font-['Geist'] truncate" style={{ color: 'var(--color-text)' }}>
                          {tutor.fullName}
                        </span>
                        {statusBadge(tutor.verificationStatus)}
                        {tutor.featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                            <Star className="w-3 h-3" /> Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
                        {tutor.email} · {tutor.institution}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        ⭐ {tutor.rating.toFixed(1)} · ${tutor.hourlyRate}/hr
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {/* Featured Toggle */}
                      <button
                        disabled={tutorProcessing === tutor.id}
                        onClick={() => handleToggleFeatured(tutor.id, tutor.featured)}
                        title={tutor.featured ? 'Remove featured' : 'Mark as featured'}
                        className="p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                      >
                        {tutor.featured ? <ToggleRight className="w-4 h-4 text-amber-500" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>

                      {/* Approve/Reject */}
                      {tutor.verificationStatus === 'PENDING' && (
                        <>
                          <button
                            disabled={tutorProcessing === tutor.id}
                            onClick={() => handleTutorDecision(tutor.id, 'VERIFIED')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            disabled={tutorProcessing === tutor.id}
                            onClick={() => handleTutorDecision(tutor.id, 'REJECTED')}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                      {tutor.verificationStatus === 'REJECTED' && (
                        <button
                          disabled={tutorProcessing === tutor.id}
                          onClick={() => handleTutorDecision(tutor.id, 'VERIFIED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Re-approve
                        </button>
                      )}
                      {tutor.verificationStatus === 'VERIFIED' && (
                        <button
                          disabled={tutorProcessing === tutor.id}
                          onClick={() => handleTutorDecision(tutor.id, 'REJECTED')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                        >
                          <ShieldX className="w-3.5 h-3.5" /> Revoke
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        disabled={tutorProcessing === tutor.id}
                        onClick={() => handleDeleteTutor(tutor.id)}
                        className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors"
                        title="Delete tutor profile"
                      >
                        {tutorProcessing === tutor.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── User Management Tab ─────────────────────────────────────── */}
        {tab === 'users' && (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {/* Toolbar */}
            <div className="p-4 flex flex-wrap items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex-1 relative min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--color-muted)' }} />
                <input
                  type="text"
                  placeholder="Search users…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border outline-none focus:ring-1 focus:ring-indigo-500"
                  style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
                {userSearch && (
                  <button onClick={() => setUserSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5" style={{ color: 'var(--color-muted)' }} />
                  </button>
                )}
              </div>
              <div className="flex gap-1.5">
                {['All', 'STUDENT', 'TUTOR', 'ADMIN', 'PARENT'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                      roleFilter === r ? 'bg-indigo-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={roleFilter !== r ? { color: 'var(--color-muted)' } : undefined}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <button
                onClick={loadUsers}
                className="p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {userLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: 'var(--color-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading users…</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Users className="w-8 h-8 mx-auto" style={{ color: 'var(--color-muted)' }} />
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>No users found</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {users.map((user) => (
                  <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                      {user.avatarUrl
                        ? <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                        : user.fullName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm font-['Geist'] truncate" style={{ color: 'var(--color-text)' }}>
                          {user.fullName}
                        </span>
                        {roleBadge(user.role)}
                        {user.tutorProfile && statusBadge(user.tutorProfile.verificationStatus)}
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
                        {user.email}{user.grade ? ` · Grade ${user.grade}` : ''}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {/* Role change dropdown */}
                      <div className="relative group/role">
                        <select
                          value={user.role}
                          disabled={userProcessing === user.id}
                          onChange={(e) => handleChangeRole(user, e.target.value)}
                          className="appearance-none pl-2 pr-6 py-1.5 text-[11px] font-semibold rounded-lg border outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                          style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="TUTOR">TUTOR</option>
                          <option value="PARENT">PARENT</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--color-muted)' }} />
                      </div>

                      {/* Delete */}
                      <button
                        disabled={userProcessing === user.id}
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors"
                        title="Delete user"
                      >
                        {userProcessing === user.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Bookings Tab ────────────────────────────────────────────── */}
        {tab === 'bookings' && (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {/* Toolbar */}
            <div className="p-4 flex flex-wrap items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex gap-1.5 flex-1 flex-wrap">
                {['All', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'DECLINED'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setBookingFilter(s)}
                    className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                      bookingFilter === s ? 'bg-indigo-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={bookingFilter !== s ? { color: 'var(--color-muted)' } : undefined}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={loadBookings}
                className="p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {bookingLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: 'var(--color-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading bookings…</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Calendar className="w-8 h-8 mx-auto" style={{ color: 'var(--color-muted)' }} />
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>No bookings found</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm font-['Geist']" style={{ color: 'var(--color-text)' }}>
                          {booking.subjectName}
                        </span>
                        {statusBadge(booking.status)}
                      </div>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        <span className="font-semibold">{booking.studentName}</span> → <span className="font-semibold">{booking.tutorName}</span>
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                        {new Date(booking.date).toLocaleDateString()} · ${booking.totalPrice}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {/* Status changer */}
                      <div className="relative">
                        <select
                          value={booking.status}
                          disabled={bookingProcessing === booking.id}
                          onChange={(e) => handleChangeBookingStatus(booking.id, e.target.value)}
                          className="appearance-none pl-2 pr-6 py-1.5 text-[11px] font-semibold rounded-lg border outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                          style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                        >
                          {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'DECLINED'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--color-muted)' }} />
                      </div>

                      {/* Delete */}
                      <button
                        disabled={bookingProcessing === booking.id}
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors"
                        title="Delete booking"
                      >
                        {bookingProcessing === booking.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          danger={confirmDialog.danger}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
};
