import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import CertificateModal from './CertificateModal';

const PLACEHOLDERS = [
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-green-400 to-teal-500',
  'from-orange-400 to-red-500',
  'from-yellow-400 to-orange-500',
  'from-teal-400 to-cyan-500',
];

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState(null);
  const [certLoading, setCertLoading] = useState(null);
  const [progressMap, setProgressMap] = useState({}); // { courseId: { completed, total } }
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/'); return; }

        const response = await api.get('/api/courses/my-courses');
        const coursesData = response.data;
        setCourses(coursesData);

        // Fetch progress for each course in parallel
        const progressEntries = await Promise.all(
          coursesData.map(async (c) => {
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
        console.error('Error fetching enrolled courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, [navigate]);

  const handleGetCertificate = async (courseId) => {
    setCertLoading(courseId);
    try {
      const res = await api.get(`/api/courses/${courseId}/certificate`);
      setCertData(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Unable to generate certificate.';
      alert(msg);
    } finally {
      setCertLoading(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 text-white px-6 py-10">
        <div className="max-w-7xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">My Courses</h1>
            <p className="text-indigo-200 mt-1 text-sm">Courses you are enrolled in.</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-semibold text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition"
          >
            ← Browse More
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-2 bg-gray-100 rounded w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🎒</p>
            <p className="font-medium text-lg text-gray-700">You haven't enrolled in any courses yet.</p>
            <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-600 font-semibold hover:underline">
              Browse courses →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => {
              const prog = progressMap[course.id] || { total: 0, completed: 0 };
              const pct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
              const isComplete = prog.total > 0 && prog.completed >= prog.total;

              return (
                <div key={course.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1.5 transition-all duration-300 ease-out group">
                  {/* Thumbnail */}
                  <div className="relative">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className={`w-full h-40 bg-gradient-to-br ${PLACEHOLDERS[idx % PLACEHOLDERS.length]} flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
                        <span className="text-4xl drop-shadow">📖</span>
                      </div>
                    )}
                    {/* Completion badge */}
                    {isComplete && (
                      <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                        ✓ Complete
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-base mb-0.5 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-1 line-clamp-2">{course.description}</p>
                    <p className="text-xs text-gray-400 mb-3">👤 {course.teacher_name}</p>

                    {/* ── Progress bar ── */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500 font-medium">
                          {prog.completed}/{prog.total} lessons
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isComplete
                            ? 'bg-green-50 text-green-600'
                            : pct > 0
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${isComplete ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                            }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/courses/${course.id}/player`)}
                          className="flex-1 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-3 py-2 rounded-xl transition shadow-sm text-center"
                        >
                          {pct > 0 && !isComplete ? '▶ Continue' : pct === 0 ? '▶ Start' : '▶ Review'}
                        </button>
                        <button
                          onClick={() => navigate(`/courses/${course.id}/quiz`)}
                          className="flex-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl transition text-center"
                        >
                          📝 Quiz
                        </button>
                      </div>

                      <button
                        onClick={() => handleGetCertificate(course.id)}
                        disabled={certLoading === course.id}
                        className={`w-full text-xs font-semibold px-3 py-2 rounded-xl transition text-center shadow-sm disabled:opacity-60 flex items-center justify-center gap-1.5 ${isComplete
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                          }`}
                      >
                        {certLoading === course.id ? (
                          <>
                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Checking…
                          </>
                        ) : isComplete ? '🎓 Download Certificate' : '🔒 Complete course to unlock'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificate modal */}
      {certData && (
        <CertificateModal certData={certData} onClose={() => setCertData(null)} />
      )}
    </div>
  );
};

export default MyCourses;
