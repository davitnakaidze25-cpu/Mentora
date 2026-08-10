import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Bell,
  MessageSquare,
  ShieldCheck,
  Home,
  Search,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { Notification } from '../../types';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  bookingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  bookingCount,
}) => {
  const { currentUser, logout } = useAuth();
  const { t, locale, setLocale } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const isTutor = currentUser?.role === 'TUTOR';
  const isAdmin = currentUser?.role === 'ADMIN';

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/notifications/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
      }
    } catch {}
  };

  useEffect(() => {
    if (!currentUser) { setNotifications([]); return; }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    if (!currentUser) return;
    try {
      await fetch(`/api/notifications/read-all/${currentUser.id}`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const markOneRead = async (notifId: string) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
    } catch {}
  };

  const handleNotificationClick = async (notif: Notification) => {
    markOneRead(notif.id);
    setNotifOpen(false);

    const msg = notif.message.toLowerCase();
    if (msg.includes('message from') || msg.includes('💬')) {
      navigate('/chat');
    } else if (msg.includes('booking request') || msg.includes('accepted your booking') || msg.includes('declined your booking') || msg.includes('completed')) {
      navigate('/dashboard');
    } else if (msg.includes('review')) {
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const navLink = (path: string, label: string) => (
    <Link
      to={path}
      onClick={() => setMobileOpen(false)}
      className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
        currentPath === path ? 'text-indigo-600 font-bold' : 'text-slate-600'
      }`}
    >
      {label}
    </Link>
  );

  const dashboardLabel = isTutor ? (t('navbar.tutorDashboard') || 'Tutor Dashboard') : isAdmin ? 'Admin Panel' : (t('dashboard.student.title') || 'Student Dashboard');

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo - enlarged 3x */}
          <Link
            to={isTutor ? '/dashboard' : '/'}
            className="flex items-center shrink-0 hover:opacity-90 transition-opacity relative z-10 translate-y-1.5"
          >
            <img
              src="/logo.png"
              alt="Mentora Logo"
              className="h-28 w-auto object-contain -my-6 drop-shadow-xs"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {!isAdmin && navLink('/', t('nav.overview') || 'Overview')}
            {!isTutor && !isAdmin && navLink('/tutors', t('nav.findMentors') || 'Find Mentors')}
            {currentUser && navLink('/dashboard', dashboardLabel)}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">

            {/* Language Toggle */}
            <button
              onClick={() => setLocale(locale === 'en' ? 'ka' : 'en')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
            >
              {locale === 'en' ? 'EN / KA' : 'KA / EN'}
            </button>

            {currentUser && (
              <>
                {/* Global Messages Button */}
                <Link
                  to="/chat"
                  title="Messages"
                  className={`relative p-2 rounded-xl hover:bg-slate-100 transition-colors ${
                    currentPath === '/chat' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen((o) => !o); }}
                    className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <span className="text-sm font-bold text-slate-900 font-['Geist']">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500">
                            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 20).map((n) => (
                            <button
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                                !n.isRead ? 'bg-indigo-50/50' : ''
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-indigo-500' : 'bg-transparent'}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
                                  {n.message}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {new Date(n.createdAt).toLocaleString([], {
                                    month: 'short', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar + Logout */}
                <div className="flex items-center gap-2 ml-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.fullName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {currentUser.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:block text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                      {currentUser.fullName.split(' ')[0]}
                    </span>
                    {(isTutor || isAdmin) && (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    title="Log Out"
                    className="p-2 rounded-xl hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {!currentUser && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  {t('navbar.logIn') || 'Log In'}
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                >
                  {t('navbar.signUp') || 'Register'}
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          {!isAdmin && (
            <Link to="/" onClick={() => setMobileOpen(false)} className="block w-full text-left text-sm font-medium text-slate-700 py-2">
              🏠 {t('nav.overview') || 'Overview'}
            </Link>
          )}
          {!isTutor && !isAdmin && (
            <Link to="/tutors" onClick={() => setMobileOpen(false)} className="block w-full text-left text-sm font-medium text-slate-700 py-2">
              🔍 {t('nav.findMentors') || 'Find Mentors'}
            </Link>
          )}
          {currentUser && (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block w-full text-left text-sm font-medium text-slate-700 py-2">
                📊 {dashboardLabel}
              </Link>
              <Link to="/chat" onClick={() => setMobileOpen(false)} className="block w-full text-left text-sm font-medium text-slate-700 py-2">
                💬 Messages
              </Link>
              <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }} className="block w-full text-left text-sm font-medium text-rose-600 py-2">
                🚪 {t('navbar.signOut') || 'Log Out'}
              </button>
            </>
          )}
          {!currentUser && (
            <>
              <button onClick={() => { onOpenAuth('login'); setMobileOpen(false); }} className="block w-full text-left text-sm font-medium text-slate-700 py-2">
                {t('navbar.logIn') || 'Log In'}
              </button>
              <button onClick={() => { onOpenAuth('register'); setMobileOpen(false); }} className="block w-full text-left text-sm font-semibold text-indigo-600 py-2">
                {t('navbar.signUp') || 'Register'}
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};