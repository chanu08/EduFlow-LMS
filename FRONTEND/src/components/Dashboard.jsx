import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', icon: '🌤️' };
  if (h < 18) return { text: 'Good afternoon', icon: '☀️' };
  return { text: 'Good evening', icon: '🌙' };
}

const PLACEHOLDERS = [
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-green-400 to-teal-500',
  'from-orange-400 to-red-500',
  'from-yellow-400 to-orange-500',
  'from-teal-400 to-cyan-500',
];

/* ─── Circular progress (PieChart donut) ────────────── */
function CompletionRing({ percent }) {
  const data = [
    { value: percent },
    { value: 100 - percent },
  ];
  const color = percent >= 75 ? '#22c55e' : percent >= 40 ? '#3b82f6' : '#f59e0b';
  return (
    <div className="relative w-32 h-32">
      <PieChart width={128} height={128}>
        <Pie
          data={data}
          cx={60} cy={60}
          innerRadius={44} outerRadius={58}
          startAngle={90} endAngle={-270}
          dataKey="value"
          strokeWidth={0}
        >
          <Cell fill={color} />
          <Cell fill="#e5e7eb" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-gray-900">{percent}%</span>
        <span className="text-xs text-gray-400 font-medium">done</span>
      </div>
    </div>
  );
}

/* ─── Custom BarChart tooltip ────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-xs">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        <p className="text-blue-600">✅ Completed: <b>{payload[0]?.value}</b></p>
        <p className="text-gray-400">📚 Total: <b>{payload[1]?.value}</b></p>
      </div>
    );
  }
  return null;
}

/* ─── Analytics section ─────────────────────────────── */
function AnalyticsSection({ isStudent, isTeacher }) {
  const [analytics, setAnalytics] = useState(null);
  const [teacherStats, setTeacherStats] = useState(null);

  useEffect(() => {
    if (isStudent) {
      api.get('/api/analytics/student')
        .then((r) => setAnalytics(r.data))
        .catch((e) => console.error('Analytics fetch error:', e));
    }
    if (isTeacher) {
      api.get('/api/analytics/teacher')
        .then((r) => setTeacherStats(r.data))
        .catch((e) => console.error('Teacher analytics error:', e));
    }
  }, [isStudent, isTeacher]);

  // Teacher view
  if (isTeacher) {
    if (!teacherStats) return null;
    return (
      <div className="max-w-7xl mx-auto px-6 pb-2 pt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">📊 Course Performance</h2>
        {teacherStats.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm">Create your first course to see analytics here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teacherStats.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                <p className="text-sm font-bold text-gray-900 line-clamp-1 mb-4">{course.title}</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-black text-indigo-600">{course.enrolledCount}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">Enrolled</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-blue-500">{course.avgCompletionPct}%</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">Avg Completion</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-green-500">{course.avgQuizScore}%</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">Avg Quiz</p>
                  </div>
                </div>
                <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                    style={{ width: `${course.avgCompletionPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Student view
  if (!isStudent || !analytics) return null;
  const { completionPercent, completedLessons, totalLessons, courseBreakdown } = analytics;
  const isEmpty = totalLessons === 0;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-2 pt-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">📊 Learning Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5">
          <CompletionRing percent={completionPercent} />
          <div>
            <p className="text-sm font-bold text-gray-800">Overall Completion</p>
            <p className="text-xs text-gray-400 mt-1">{completedLessons} of {totalLessons} lessons completed</p>
            {isEmpty && <p className="text-xs text-blue-500 mt-2">Enroll in a course to get started!</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-center">
          <p className="text-3xl font-black text-blue-600">{completedLessons}</p>
          <p className="text-sm font-semibold text-gray-700 mt-1">Lessons Completed</p>
          <p className="text-xs text-gray-400">out of {totalLessons} total</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-center">
          <p className="text-3xl font-black text-indigo-600">{courseBreakdown.length}</p>
          <p className="text-sm font-semibold text-gray-700 mt-1">Courses Enrolled</p>
          <p className="text-xs text-gray-400">keep learning!</p>
        </div>
      </div>
      {courseBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-4">
          <p className="text-sm font-bold text-gray-800 mb-4">Progress by Course</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={courseBreakdown} barCategoryGap="30%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="course" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', radius: 6 }} />
              <Bar dataKey="completed" name="Completed" radius={[6, 6, 0, 0]} fill="#3b82f6" />
              <Bar dataKey="total" name="Total" radius={[6, 6, 0, 0]} fill="#e0e7ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────── */
const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Debounce search input — wait 400ms after user stops typing
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 400);
  }, []);

  const handleSearchClear = () => {
    setSearchQuery('');
    setDebouncedSearch('');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {};
        const response = await api.get('/api/courses', { params });
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [debouncedSearch]);

  const handleEnroll = async (courseId) => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    setEnrollingId(courseId);
    try {
      await api.post(
        `/api/courses/${courseId}/enroll`,
        {}
      );
      alert('Enrolled successfully! Go to My Courses to start learning.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to enroll.');
    } finally {
      setEnrollingId(null);
    }
  };

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  const greeting = getGreeting();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white px-6 py-12">
        {/* Decorative dots */}
        <div className="absolute top-4 right-10 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-56 h-56 rounded-full bg-violet-400/10 blur-3xl pointer-events-none" />
        <div className="absolute top-3 right-40 w-2 h-2 rounded-full bg-white/30" />
        <div className="absolute top-8 right-56 w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="absolute bottom-5 left-20 w-2 h-2 rounded-full bg-indigo-300/40" />
        <div className="max-w-7xl mx-auto relative z-10">
          <p className="text-indigo-200 text-sm font-medium mb-1">{greeting.icon} {greeting.text},</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-1.5">
            {user?.username || (isTeacher ? 'Teacher' : 'Student')} 👋
          </h1>
          <p className="text-indigo-100 text-sm">
            {isTeacher
              ? 'Manage your courses or create a brand new one.'
              : 'Browse courses, track your progress, and keep learning.'}
          </p>
          {isTeacher && (
            <button
              onClick={() => navigate('/create-course')}
              className="mt-5 inline-flex items-center gap-2 bg-white text-indigo-700 font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="text-lg leading-none">＋</span> Create New Course
            </button>
          )}
          {isStudent && (
            <div className="mt-4 flex gap-4">
              <button onClick={() => navigate('/my-courses')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-100 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl transition">
                📖 My Courses
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Analytics section */}
      <AnalyticsSection isStudent={isStudent} isTeacher={isTeacher} />

      {/* Search + Course grid */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search courses by title or topic…"
              className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
            {searchQuery && (
              <button
                onClick={handleSearchClear}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 text-lg"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          {debouncedSearch && (
            <p className="mt-2 text-sm text-gray-500">
              {loading ? 'Searching…' : `${courses.length} result${courses.length !== 1 ? 's' : ''} for `}
              {!loading && <span className="font-semibold text-gray-800">"{debouncedSearch}"</span>}
            </p>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-5">
          {debouncedSearch ? 'Search Results' : isTeacher ? 'All Published Courses' : 'Available Courses'}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            {debouncedSearch ? (
              <>
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-medium text-lg">No courses found for "{debouncedSearch}"</p>
                <button onClick={handleSearchClear} className="mt-4 text-blue-600 font-semibold hover:underline text-sm">
                  Clear search → show all courses
                </button>
              </>
            ) : (
              <>
                <p className="text-5xl mb-4">📚</p>
                <p className="font-medium">No courses published yet.</p>
                {isTeacher && (
                  <button onClick={() => navigate('/create-course')} className="mt-4 text-blue-600 font-semibold hover:underline">
                    Create the first one →
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => (
              <div key={course.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1.5 transition-all duration-300 ease-out">
                <div className="cursor-pointer relative" onClick={() => navigate(`/courses/${course.id}`)}>
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className={`w-full h-44 bg-gradient-to-br ${PLACEHOLDERS[idx % PLACEHOLDERS.length]} flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
                      <span className="text-5xl drop-shadow-lg">📖</span>
                    </div>
                  )}
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 text-xs font-bold bg-white/90 backdrop-blur-sm text-indigo-700 px-2.5 py-1 rounded-full shadow-sm border border-white/50">
                    📚 Course
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1 cursor-pointer hover:text-indigo-700 transition-colors"
                    onClick={() => navigate(`/courses/${course.id}`)}>
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">👤 {course.teacher_name}</span>
                    {isStudent && (
                      <button onClick={() => handleEnroll(course.id)} disabled={enrollingId === course.id}
                        className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-60">
                        {enrollingId === course.id ? 'Enrolling…' : 'Enroll'}
                      </button>
                    )}
                    {isTeacher && (
                      <button onClick={() => navigate(`/manage-course/${course.id}`)}
                        className="text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition">
                        Manage →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;