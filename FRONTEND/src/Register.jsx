import React, { useState } from 'react';
import api from './api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [form, setForm] = useState({ username: '', email: '', password: '', role: 'student' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/api/auth/register', form);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.errors?.[0] ||
                'Registration failed. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* ── Left branding panel ── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700 animate-gradient flex-col items-center justify-center p-12 text-white">
                <div className="blob absolute w-80 h-80 bg-white/10 -top-24 -right-20" />
                <div className="blob absolute w-60 h-60 bg-violet-400/20 bottom-10 -left-16" style={{ animationDelay: '4s' }} />

                <div className="relative z-10 text-center animate-fadeInUp">
                    <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-6 shadow-2xl animate-float">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-3">Join EduFlow</h1>
                    <p className="text-indigo-200 text-lg leading-relaxed max-w-sm mx-auto">
                        Start your learning journey today. Free forever for students and teachers.
                    </p>

                    {/* Role comparison */}
                    <div className="mt-10 grid grid-cols-2 gap-3 animate-fadeInUp-d3">
                        {[
                            { icon: '🎓', role: 'Student', perks: ['Browse all courses', 'AI Tutor access', 'Earn certificates'] },
                            { icon: '🏫', role: 'Teacher', perks: ['Create courses', 'Add quizzes', 'Manage students'] },
                        ].map((r) => (
                            <div key={r.role} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-left">
                                <div className="text-2xl mb-2">{r.icon}</div>
                                <p className="font-bold text-sm mb-2">{r.role}</p>
                                <ul className="space-y-1">
                                    {r.perks.map((p) => (
                                        <li key={p} className="text-xs text-indigo-200 flex items-center gap-1.5">
                                            <span className="text-green-400">✓</span> {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50 overflow-y-auto">
                {/* Mobile logo */}
                <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <span className="text-xl font-black text-gray-900">Edu<span className="text-indigo-600">Flow</span></span>
                </Link>

                <div className="w-full max-w-[420px] animate-fadeInUp">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-gray-900">Create your account</h2>
                        <p className="text-gray-500 mt-1.5 text-sm">Join 10,000+ learners and educators on EduFlow.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-8">
                        {error && (
                            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2 animate-fadeIn">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Role picker — first for clarity */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">I want to join as a...</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'student', icon: '🎓', label: 'Student' },
                                        { value: 'teacher', icon: '🏫', label: 'Teacher' },
                                    ].map((r) => (
                                        <label
                                            key={r.value}
                                            className={`flex items-center justify-center gap-2 cursor-pointer rounded-xl border-2 py-3 text-sm font-semibold transition-all ${form.role === r.value
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                                                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-indigo-200 hover:bg-indigo-50/40'
                                                }`}
                                        >
                                            <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={handleChange} className="sr-only" />
                                            {r.icon} {r.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                                <input
                                    type="text" name="username" value={form.username} onChange={handleChange} required
                                    placeholder="e.g. john_doe"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                                <input
                                    type="email" name="email" value={form.email} onChange={handleChange} required
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                                        required minLength={6} placeholder="At least 6 characters"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-11 text-sm placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                    <button type="button" onClick={() => setShowPass(v => !v)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 text-xs font-medium transition">
                                        {showPass ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:translate-y-0"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Creating Account…
                                    </span>
                                ) : 'Create Free Account →'}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Sign in</Link>
                        </p>
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-400">
                        <Link to="/" className="hover:text-gray-600 transition">← Back to home</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
