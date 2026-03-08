import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';

/* ─── Circular progress ring ─────────────────────────── */
const ProgressRing = ({ pct, size = 56, stroke = 5 }) => {
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="#e5e7eb" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="#6366f1" strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
    );
};

const GRADIENT_COLORS = [
    'from-blue-400 to-indigo-500',
    'from-violet-500 to-purple-600',
    'from-green-400 to-teal-500',
    'from-orange-400 to-red-500',
    'from-pink-400 to-rose-500',
    'from-cyan-400 to-blue-500',
];

const Profile = () => {
    const navigate = useNavigate();
    const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [progressMap, setProgressMap] = useState({});   // courseId -> { completed, total }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user) { navigate('/login'); return; }

        const fetchAll = async () => {
            try {
                // Fetch courses the student is enrolled in
                const coursesRes = await api.get('/api/users/my-courses');
                const courses = coursesRes.data || [];
                setEnrolledCourses(courses);

                // Fetch progress for each course in parallel
                const progressEntries = await Promise.all(
                    courses.map(async (c) => {
                        try {
                            const [lessonsRes, completedRes] = await Promise.all([
                                api.get(`/api/courses/${c.id}/lessons`),
                                api.get(`/api/lessons/course/${c.id}/completed`),
                            ]);
                            return [c.id, {
                                total: lessonsRes.data.length,
                                completed: (completedRes.data.completedLessonIds || []).length,
                            }];
                        } catch {
                            return [c.id, { total: 0, completed: 0 }];
                        }
                    })
                );
                setProgressMap(Object.fromEntries(progressEntries));
            } catch (err) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [navigate]);

    const totalCompleted = Object.values(progressMap).filter(
        (p) => p.total > 0 && p.completed >= p.total
    ).length;

    const overallPct = enrolledCourses.length === 0 ? 0 : Math.round(
        Object.values(progressMap).reduce((sum, p) => sum + (p.total > 0 ? p.completed / p.total : 0), 0)
        / enrolledCourses.length * 100
    );

    const initials = user?.username?.slice(0, 2).toUpperCase() || '??';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Header ── */}
            <div className="bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 text-white">
                <div className="max-w-5xl mx-auto px-6 py-10">
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-3xl font-black shadow-lg">
                            {initials}
                        </div>
                        <div>
                            <p className="text-indigo-200 text-sm font-medium capitalize">
                                {user?.role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
                            </p>
                            <h1 className="text-3xl font-black">{user?.username}</h1>
                            <p className="text-indigo-200 text-sm mt-0.5">{user?.email}</p>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="mt-8 grid grid-cols-3 gap-4">
                        {[
                            { label: 'Enrolled', value: enrolledCourses.length, icon: '📚' },
                            { label: 'Completed', value: totalCompleted, icon: '🏆' },
                            { label: 'Avg Progress', value: `${overallPct}%`, icon: '📊' },
                        ].map((s) => (
                            <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-4 text-center">
                                <p className="text-2xl mb-1">{s.icon}</p>
                                <p className="text-2xl font-black">{s.value}</p>
                                <p className="text-indigo-200 text-xs mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-16 text-red-500">{error}</div>
                ) : enrolledCourses.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-5xl mb-4">🎒</p>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No courses yet</h2>
                        <p className="text-gray-500 text-sm mb-6">Browse the dashboard and enroll in your first course!</p>
                        <Link to="/dashboard"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                            Browse Courses →
                        </Link>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-5">My Courses</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {enrolledCourses.map((course, idx) => {
                                const prog = progressMap[course.id] || { total: 0, completed: 0 };
                                const pct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
                                const done = pct === 100;
                                return (
                                    <div key={course.id}
                                        onClick={() => navigate(`/courses/${course.id}/player`)}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
                                    >
                                        {/* Colour strip */}
                                        <div className={`h-1.5 w-full bg-gradient-to-r ${GRADIENT_COLORS[idx % GRADIENT_COLORS.length]}`} />
                                        <div className="p-5 flex gap-4 items-start">
                                            {/* Ring */}
                                            <div className="relative flex-shrink-0">
                                                <ProgressRing pct={pct} />
                                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-600">
                                                    {pct}%
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-indigo-700 transition-colors">
                                                        {course.title}
                                                    </h3>
                                                    {done && (
                                                        <span className="flex-shrink-0 text-xs font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                                                            ✓ Done
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {prog.completed}/{prog.total} lessons complete
                                                </p>
                                                {/* Progress bar */}
                                                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${done ? 'bg-green-500' : 'bg-indigo-500'}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Certificates earned */}
                        {totalCompleted > 0 && (
                            <div className="mt-10">
                                <h2 className="text-xl font-extrabold text-gray-900 mb-5">🏆 Certificates Earned</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {enrolledCourses
                                        .filter((c) => {
                                            const p = progressMap[c.id];
                                            return p && p.total > 0 && p.completed >= p.total;
                                        })
                                        .map((c, idx) => (
                                            <Link
                                                key={c.id}
                                                to="/my-courses"
                                                className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                                                    🎓
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{c.title}</p>
                                                    <p className="text-xs text-yellow-700 mt-0.5">Certificate available · Click to download</p>
                                                </div>
                                            </Link>
                                        ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
