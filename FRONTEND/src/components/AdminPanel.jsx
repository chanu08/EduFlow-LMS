import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const ROLE_COLORS = {
    student: 'bg-blue-100 text-blue-700',
    teacher: 'bg-indigo-100 text-indigo-700',
    admin: 'bg-red-100 text-red-700',
};

function StatCard({ icon, label, value, color }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
            <div>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
            </div>
        </div>
    );
}

const AdminPanel = () => {
    const navigate = useNavigate();
    const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [userTotal, setUserTotal] = useState(0);
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');

    // Redirect if not admin
    useEffect(() => {
        if (!user || user.role !== 'admin') navigate('/dashboard');
    }, [navigate, user]);

    // Fetch stats
    useEffect(() => {
        api.get('/api/admin/stats').then(r => setStats(r.data)).catch(() => { });
    }, []);

    // Fetch users
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const r = await api.get('/api/admin/users', { params: { search, page, limit: 15 } });
            setUsers(r.data.users);
            setUserTotal(r.data.total);
        } catch { /* silent */ }
        setLoading(false);
    }, [search, page]);

    useEffect(() => { if (tab === 'users') fetchUsers(); }, [tab, fetchUsers]);

    // Fetch courses
    useEffect(() => {
        if (tab === 'courses') {
            api.get('/api/admin/courses').then(r => setCourses(r.data)).catch(() => { });
        }
    }, [tab]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.patch(`/api/admin/users/${userId}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            showToast('Role updated successfully');
        } catch { showToast('Failed to update role'); }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/api/admin/users/${userId}`);
            setUsers(prev => prev.filter(u => u.id !== userId));
            setUserTotal(t => t - 1);
            showToast('User deleted');
        } catch { showToast('Failed to delete user'); }
    };

    const handleDeleteCourse = async (courseId, title) => {
        if (!window.confirm(`Delete course "${title}"? All enrollments will be lost.`)) return;
        try {
            await api.delete(`/api/admin/courses/${courseId}`);
            setCourses(prev => prev.filter(c => c.id !== courseId));
            showToast('Course deleted');
        } catch { showToast('Failed to delete course'); }
    };

    const TABS = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'users', label: '👥 Users' },
        { id: 'courses', label: '📚 Courses' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl animate-fadeIn">
                    {toast}
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-br from-red-600 via-rose-600 to-pink-700 text-white px-6 py-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🛡️</div>
                        <h1 className="text-3xl font-extrabold">Admin Panel</h1>
                    </div>
                    <p className="text-rose-200 text-sm">Full control over users, courses, and platform settings.</p>

                    {/* Stats row in header */}
                    {stats && (
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: 'Users', value: stats.totalUsers, icon: '👤' },
                                { label: 'Courses', value: stats.totalCourses, icon: '📚' },
                                { label: 'Enrollments', value: stats.totalEnrollments, icon: '🎓' },
                                { label: 'Revenue (₹)', value: `₹${(stats.totalRevenue / 100).toLocaleString('en-IN')}`, icon: '💰' },
                            ].map(s => (
                                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-center">
                                    <p className="text-xl mb-0.5">{s.icon}</p>
                                    <p className="text-xl font-black">{s.value}</p>
                                    <p className="text-xs text-rose-200">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Tab bar */}
            <div className="max-w-7xl mx-auto px-6 pt-6">
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-800'
                                }`}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            <div className="max-w-7xl mx-auto px-6 py-6">

                {/* ── OVERVIEW ── */}
                {tab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats ? <>
                            <StatCard icon="👤" label="Total Users" value={stats.totalUsers} color="bg-blue-50 text-blue-600" />
                            <StatCard icon="📚" label="Total Courses" value={stats.totalCourses} color="bg-indigo-50 text-indigo-600" />
                            <StatCard icon="🎓" label="Total Enrollments" value={stats.totalEnrollments} color="bg-green-50 text-green-600" />
                            <StatCard icon="💰" label="Total Revenue" value={`₹${(stats.totalRevenue / 100).toLocaleString('en-IN')}`} color="bg-yellow-50 text-yellow-600" />
                        </> : (
                            [1, 2, 3, 4].map(n => <div key={n} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)
                        )}
                    </div>
                )}

                {/* ── USERS ── */}
                {tab === 'users' && (
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <input
                                type="text" placeholder="Search users…" value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                className="flex-1 max-w-sm px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                            />
                            <span className="text-sm text-gray-500">{userTotal} users</span>
                        </div>

                        {loading ? (
                            <div className="space-y-3">{[1, 2, 3, 4, 5].map(n => <div key={n} className="h-12 bg-gray-200 rounded-xl animate-pulse" />)}</div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="text-left px-5 py-3 font-semibold text-gray-600">User</th>
                                            <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
                                            <th className="text-left px-5 py-3 font-semibold text-gray-600">Role</th>
                                            <th className="text-left px-5 py-3 font-semibold text-gray-600">Joined</th>
                                            <th className="px-5 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                                <td className="px-5 py-3 font-medium text-gray-900">{u.username}</td>
                                                <td className="px-5 py-3 text-gray-500">{u.email}</td>
                                                <td className="px-5 py-3">
                                                    <select
                                                        value={u.role}
                                                        onChange={e => handleRoleChange(u.id, e.target.value)}
                                                        className={`text-xs font-bold px-2 py-1 rounded-lg border-0 cursor-pointer ${ROLE_COLORS[u.role]}`}
                                                    >
                                                        <option value="student">student</option>
                                                        <option value="teacher">teacher</option>
                                                        <option value="admin">admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-5 py-3 text-gray-400 text-xs">
                                                    {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <button onClick={() => handleDeleteUser(u.id, u.username)}
                                                        className="text-xs font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition">
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {userTotal > 15 && (
                                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                                            className="text-xs font-bold text-gray-500 disabled:opacity-30 hover:text-gray-800 transition">← Prev</button>
                                        <span className="text-xs text-gray-400">Page {page} of {Math.ceil(userTotal / 15)}</span>
                                        <button disabled={page >= Math.ceil(userTotal / 15)} onClick={() => setPage(p => p + 1)}
                                            className="text-xs font-bold text-gray-500 disabled:opacity-30 hover:text-gray-800 transition">Next →</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── COURSES ── */}
                {tab === 'courses' && (
                    <div>
                        <p className="text-sm text-gray-500 mb-4">{courses.length} total courses</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courses.map(c => (
                                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 flex-1">{c.title}</h3>
                                        <button onClick={() => handleDeleteCourse(c.id, c.title)}
                                            className="flex-shrink-0 text-xs font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition">
                                            Delete
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-3">by {c.teacher_name}</p>
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-1 rounded-lg">
                                            👤 {c.enrollment_count} enrolled
                                        </span>
                                        {parseInt(c.price) > 0 ? (
                                            <span className="bg-green-50 text-green-700 font-semibold px-2 py-1 rounded-lg">
                                                ₹{(parseInt(c.price) / 100).toFixed(0)}
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-500 font-semibold px-2 py-1 rounded-lg">Free</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
