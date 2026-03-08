import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* ─── Data ────────────────────────────────────────────────────── */
const FEATURES = [
    { emoji: '🤖', title: 'AI-Powered Tutor', desc: 'Instant, context-aware answers from Gemini AI while watching lessons — like a personal tutor 24/7.', color: 'from-blue-500 to-indigo-600', border: 'border-blue-100', bg: 'bg-blue-50' },
    { emoji: '🎓', title: 'Verified Certificates', desc: 'Earn downloadable PDF certificates on course completion — recognized proof of your new skills.', color: 'from-yellow-400 to-orange-500', border: 'border-yellow-100', bg: 'bg-yellow-50' },
    { emoji: '📝', title: 'Interactive Quizzes', desc: 'Test knowledge with step-by-step quizzes, instant scoring, and grade feedback to track real learning.', color: 'from-green-500 to-teal-600', border: 'border-green-100', bg: 'bg-green-50' },
    { emoji: '💬', title: 'Q&A Discussion Boards', desc: 'Ask questions, get answers from instructors, and collaborate with peers inside every course.', color: 'from-purple-500 to-pink-600', border: 'border-purple-100', bg: 'bg-purple-50' },
    { emoji: '📊', title: 'Progress Analytics', desc: 'Visual dashboards track lesson completion and quiz scores so you always know where you stand.', color: 'from-red-500 to-rose-600', border: 'border-red-100', bg: 'bg-red-50' },
    { emoji: '👨‍🏫', title: 'Expert Instructors', desc: 'Learn from verified teachers who build structured courses with video lessons and rich content.', color: 'from-cyan-500 to-blue-600', border: 'border-cyan-100', bg: 'bg-cyan-50' },
];

const STATS = [
    { value: 10000, display: '10K+', label: 'Students Enrolled', icon: '🎓' },
    { value: 500, display: '500+', label: 'Courses Available', icon: '📚' },
    { value: 200, display: '200+', label: 'Expert Instructors', icon: '👨‍🏫' },
    { value: 95, display: '95%', label: 'Satisfaction Rate', icon: '⭐' },
];

const TESTIMONIALS = [
    { name: 'Aarav Singh', role: 'Software Engineer', avatar: 'AS', color: 'from-blue-500 to-indigo-600', stars: 5, text: "EduFlow's AI Tutor answered my questions instantly mid-lesson. It's like having a professor in my pocket." },
    { name: 'Priya Mehta', role: 'Data Analyst', avatar: 'PM', color: 'from-purple-500 to-pink-500', stars: 5, text: 'Earned my first certificate in 3 weeks. The progress tracking kept me motivated the whole way through.' },
    { name: 'Rohan Das', role: 'Product Designer', avatar: 'RD', color: 'from-green-500 to-teal-500', stars: 5, text: 'The Q&A boards made me feel like part of a real class. My instructor responded within hours.' },
];

const STEPS = [
    { num: '01', icon: '📋', title: 'Create Your Account', desc: 'Sign up free as a student or teacher in under a minute. No credit card needed.' },
    { num: '02', icon: '📚', title: 'Enroll in a Course', desc: 'Browse courses and enroll instantly. Start learning right away from any device.' },
    { num: '03', icon: '🏆', title: 'Earn Your Certificate', desc: 'Complete lessons and quizzes to download your verified PDF certificate.' },
];

/* ─── Animated counter hook ───────────────────────────────────── */
function useCountUp(target, duration = 1800) {
    const [count, setCount] = useState(0);
    const started = useRef(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const startTime = performance.now();
                const tick = (now) => {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
                    setCount(Math.floor(eased * target));
                    if (progress < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            }
        }, { threshold: 0.4 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return [count, ref];
}

/* ─── Stat card with count-up ─────────────────────────────────── */
function StatCard({ stat }) {
    const [count, ref] = useCountUp(stat.value);
    const suffix = stat.display.replace(/[\d.]/g, '');
    return (
        <div ref={ref} className="text-center">
            <p className="text-3xl mb-1">{stat.icon}</p>
            <p className="text-4xl font-black text-white stat-number">
                {count.toLocaleString()}{suffix}
            </p>
            <p className="text-indigo-200 text-sm mt-1 font-medium">{stat.label}</p>
        </div>
    );
}

/* ─── Main component ──────────────────────────────────────────── */
const LandingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) navigate('/dashboard', { replace: true });
    }, [navigate]);

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">

            {/* ── Navbar ────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm shadow-gray-100/50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span className="text-lg font-extrabold tracking-tight text-gray-900">Edu<span className="text-indigo-600">Flow</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition px-3 py-1.5">Login</Link>
                        <Link to="/register" className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2 rounded-xl shadow-md shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200">
                            Get Started Free →
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ──────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 animate-gradient text-white">
                {/* Decorative blobs */}
                <div className="blob absolute w-[500px] h-[500px] bg-white/5 -top-32 -left-32 pointer-events-none" />
                <div className="blob absolute w-[400px] h-[400px] bg-indigo-400/10 -bottom-20 -right-20 pointer-events-none" style={{ animationDelay: '3s' }} />
                <div className="blob absolute w-72 h-72 bg-violet-300/10 top-1/2 left-1/2 -translate-x-1/2 pointer-events-none" style={{ animationDelay: '6s' }} />

                <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36 text-center">
                    {/* Badge */}
                    <div className="animate-fadeInUp">
                        <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold px-5 py-2 rounded-full mb-8 backdrop-blur-sm border border-white/20 shadow-lg">
                            🚀 Now powered by Gemini AI
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6 tracking-tight animate-fadeInUp-d1">
                        Master Your Future<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300">
                            with EduFlow
                        </span>
                    </h1>

                    <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeInUp-d2">
                        The modern LMS built for the next generation — AI tutoring, interactive quizzes,
                        live Q&A boards, and downloadable certificates to prove your skills.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp-d3">
                        <Link to="/register"
                            className="px-8 py-4 bg-white text-indigo-700 font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 text-base">
                            Get Started — It's Free
                        </Link>
                        <Link to="/login"
                            className="px-8 py-4 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-2xl backdrop-blur-sm border border-white/25 transition text-base">
                            Sign In →
                        </Link>
                    </div>

                    <p className="mt-8 text-indigo-200 text-sm animate-fadeInUp-d4">
                        Trusted by <strong className="text-white">10,000+</strong> learners and educators worldwide
                    </p>

                    {/* Floating mini cards */}
                    <div className="mt-16 flex justify-center gap-4 flex-wrap animate-fadeInUp-d5">
                        {[
                            { icon: '🤖', label: 'AI Tutor' },
                            { icon: '🎓', label: 'Certificates' },
                            { icon: '📊', label: 'Analytics' },
                            { icon: '💬', label: 'Q&A Boards' },
                        ].map((card, i) => (
                            <div
                                key={card.label}
                                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-2.5 text-sm font-semibold animate-float"
                                style={{ animationDelay: `${i * 0.8}s` }}
                            >
                                <span className="text-xl">{card.icon}</span>
                                <span>{card.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Stats bar ─────────────────────────────────────────── */}
            <section className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 text-white py-14">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((s) => <StatCard key={s.label} stat={s} />)}
                </div>
            </section>

            {/* ── Features ──────────────────────────────────────────── */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full mb-4">Why EduFlow?</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                            Everything you need to<br className="hidden md:block" /> learn and grow
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((f) => (
                            <div key={f.title}
                                className={`bg-white rounded-2xl p-6 border ${f.border} shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group`}>
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                    {f.emoji}
                                </div>
                                <h3 className="text-base font-extrabold text-gray-900 mb-2">{f.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── For Instructors ───────────────────────────────────── */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left: text */}
                        <div>
                            <span className="inline-block text-xs font-bold text-violet-600 uppercase tracking-widest bg-violet-50 border border-violet-100 px-4 py-1.5 rounded-full mb-6">For Instructors</span>
                            <h2 className="text-4xl font-black text-gray-900 leading-tight mb-6">
                                Turn your knowledge<br />into a course — fast
                            </h2>
                            <p className="text-gray-500 text-lg leading-relaxed mb-8">
                                EduFlow makes it easy to create, publish, and manage courses. Add video lessons, written content, interactive quizzes, and let students earn verified certificates.
                            </p>
                            <ul className="space-y-3 mb-10">
                                {[
                                    'Create structured video + text lessons',
                                    'Build custom quizzes with auto-grading',
                                    'Students earn downloadable certificates',
                                    'Manage your courses from one dashboard',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all text-sm">
                                Start Teaching Free →
                            </Link>
                        </div>
                        {/* Right: visual */}
                        <div className="relative">
                            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl p-8 border border-indigo-100">
                                {/* Mock course editor card */}
                                <div className="bg-white rounded-2xl shadow-lg p-5 mb-4 border border-gray-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-lg">📚</div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">Introduction to React</p>
                                            <p className="text-xs text-gray-400">12 lessons · 3 quizzes</p>
                                        </div>
                                        <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Published</span>
                                    </div>
                                    <div className="space-y-2">
                                        {['Getting Started with JSX', 'Components & Props', 'State & Hooks'].map((l, i) => (
                                            <div key={l} className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50">
                                                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                                                <span className="text-xs text-gray-700 font-medium">{l}</span>
                                                <span className="ml-auto text-xs text-gray-400">📹</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Mini stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[{ v: '48', l: 'Students' }, { v: '4.9', l: 'Rating' }, { v: '89%', l: 'Completion' }].map((s) => (
                                        <div key={s.l} className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                                            <p className="text-xl font-black text-indigo-600">{s.v}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{s.l}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Floating badge */}
                            <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 text-xs font-black px-4 py-2 rounded-2xl shadow-lg animate-float">
                                🏆 Earn while you teach!
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── How it works ──────────────────────────────────────── */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <span className="inline-block text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 border border-green-100 px-4 py-1.5 rounded-full mb-4">Simple & Fast</span>
                    <h2 className="text-4xl font-black text-gray-900 mb-16">Get learning in 3 steps</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
                        {/* Connector line */}
                        <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-200 z-0" style={{ left: '22%', right: '22%' }} />
                        {STEPS.map((item, i) => (
                            <div key={item.title} className="relative flex flex-col items-center z-10" style={{ animationDelay: `${i * 0.15}s` }}>
                                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-200 mb-5">
                                    {item.icon}
                                    <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-yellow-400 text-gray-900 text-xs font-black flex items-center justify-center shadow-md">
                                        {parseInt(item.num)}
                                    </span>
                                </div>
                                <h3 className="font-extrabold text-gray-900 mb-2 text-lg">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ──────────────────────────────────────── */}
            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <span className="inline-block text-xs font-bold text-yellow-600 uppercase tracking-widest bg-yellow-50 border border-yellow-100 px-4 py-1.5 rounded-full mb-4">Student Stories</span>
                    <h2 className="text-4xl font-black text-gray-900 mb-14">Loved by learners</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t) => (
                            <div key={t.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="flex mb-4">
                                    {Array.from({ length: t.stars }).map((_, i) => (
                                        <span key={i} className="text-yellow-400 text-lg">★</span>
                                    ))}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} text-white text-sm font-bold flex items-center justify-center`}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{t.name}</p>
                                        <p className="text-xs text-gray-400">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────── */}
            <section className="py-24 bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 animate-gradient text-white text-center relative overflow-hidden">
                <div className="blob absolute w-96 h-96 bg-white/5 -top-24 -left-24 pointer-events-none" />
                <div className="blob absolute w-72 h-72 bg-indigo-400/10 -bottom-12 -right-12 pointer-events-none" style={{ animationDelay: '4s' }} />
                <div className="relative max-w-3xl mx-auto px-6">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Ready to start learning?</h2>
                    <p className="text-indigo-100 mb-10 text-lg">Join thousands of students and educators — completely free.</p>
                    <Link to="/register"
                        className="relative inline-flex items-center gap-2 px-10 py-4 bg-white text-indigo-700 font-black rounded-2xl shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300 text-base">
                        Create Free Account →
                    </Link>
                    <p className="mt-6 text-indigo-200 text-sm">No credit card · Cancel anytime · Start in 60 seconds</p>
                </div>
            </section>

            {/* ── Footer ────────────────────────────────────────────── */}
            <footer className="bg-gray-950 text-gray-400 py-14">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <span className="text-white font-extrabold text-xl">Edu<span className="text-indigo-400">Flow</span></span>
                            </div>
                            <p className="text-sm leading-relaxed max-w-xs">
                                The modern LMS that puts AI-powered learning in the hands of every student and teacher.
                            </p>
                        </div>
                        {[
                            { heading: 'Platform', links: ['Dashboard', 'My Courses', 'Create Course', 'AI Tutor'] },
                            { heading: 'Company', links: ['About', 'Blog', 'Privacy Policy', 'Terms of Service'] },
                        ].map((col) => (
                            <div key={col.heading}>
                                <p className="text-white font-semibold text-sm mb-4">{col.heading}</p>
                                <ul className="space-y-2.5">
                                    {col.links.map((l) => (
                                        <li key={l}>
                                            <span className="text-sm hover:text-white transition cursor-pointer">{l}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-600">
                        © {new Date().getFullYear()} EduFlow LMS. Built with ❤️ using React, Node.js & Gemini AI.
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default LandingPage;
