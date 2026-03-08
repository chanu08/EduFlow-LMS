import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosInstance';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const syncUser = () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { setUser(null); }
      } else {
        setUser(null);
      }
    };
    syncUser();
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  // Add scroll shadow effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close bell dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Poll notifications every 30s (only when logged in)
  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/api/notifications');
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch { /* silent */ }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleBellClick = async () => {
    setBellOpen((o) => !o);
    if (!bellOpen && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      try { await api.put('/api/notifications/read'); } catch { /* silent */ }
    }
  };

  const handleNotifClick = (notif) => {
    setBellOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };


  const isLoggedIn = !!user;
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  const navLink = (to, label) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200
          ${active
            ? 'text-indigo-700 bg-indigo-50'
            : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50/60'
          }`}
      >
        {label}
        {active && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />
        )}
      </Link>
    );
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300
      ${scrolled
        ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-gray-200/60 border-b border-gray-100'
        : 'bg-white/80 backdrop-blur-md border-b border-gray-100/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow duration-300">
              <svg className="w-4.5 h-4.5 text-white w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-lg font-extrabold tracking-tight text-gray-900">
              Edu<span className="text-indigo-600">Flow</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-0.5">

            {!isLoggedIn && (
              <>
                {navLink('/login', 'Login')}
                <Link to="/register"
                  className="ml-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200">
                  Get Started
                </Link>
              </>
            )}

            {isLoggedIn && isStudent && (
              <>
                {navLink('/dashboard', 'Dashboard')}
                {navLink('/my-courses', 'My Courses')}
                {navLink('/profile', 'Profile')}
              </>
            )}

            {isLoggedIn && isTeacher && (
              <>
                {navLink('/dashboard', 'Dashboard')}
                {navLink('/create-course', 'Create Course')}
              </>
            )}

            {isLoggedIn && user?.role === 'admin' && (
              <>
                {navLink('/dashboard', 'Dashboard')}
                {navLink('/admin', '🛡️ Admin')}
              </>
            )}

            {isLoggedIn && (
              <div className="flex items-center gap-3 ml-3 pl-3 border-l border-gray-200">

                {/* 🔔 Notification Bell */}
                <div className="relative" ref={bellRef}>
                  <button
                    onClick={handleBellClick}
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    title="Notifications"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown */}
                  {bellOpen && (
                    <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">Notifications</span>
                        <span className="text-xs text-gray-400">{notifications.filter(n => !n.is_read).length === 0 ? 'All caught up!' : `${unreadCount} unread`}</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <p className="text-2xl mb-1">🔔</p>
                            <p className="text-xs">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <button key={n.id} onClick={() => handleNotifClick(n)}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0 ${!n.is_read ? 'bg-indigo-50/50' : ''
                                }`}>
                              <div className="flex items-start gap-2">
                                {!n.is_read && <span className="flex-shrink-0 w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5" />}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-700 line-clamp-2">{n.message}</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">
                                    {new Date(n.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    {' · '}{new Date(n.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar + name */}
                <div className="hidden sm:flex items-center gap-2.5">
                  <Link to="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm hover:scale-110 transition-transform" title="View Profile">
                    {user.username.charAt(0).toUpperCase()}
                  </Link>
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs font-bold text-gray-800">{user.username}</span>
                    <span className="text-xs text-gray-400 capitalize">{user.role}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 border border-gray-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
