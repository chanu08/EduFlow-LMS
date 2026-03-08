import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import AITutorChat from './AITutorChat';
import DiscussionBoard from './DiscussionBoard';
import LiveSession from './LiveSession';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('lessons');
  const [toast, setToast] = useState(''); // auto-complete toast

  const userRole = (() => { try { return JSON.parse(localStorage.getItem('user'))?.role; } catch { return null; } })();
  const isTeacher = userRole === 'teacher';

  const playerRef = useRef(null);       // YouTube Player instance
  const playerDivRef = useRef(null);    // DOM target for the player
  const activeLessonRef = useRef(null); // stable ref so callbacks see latest lesson
  const lessonsRef = useRef([]);        // stable ref for lesson list

  // Keep refs in sync
  useEffect(() => { activeLessonRef.current = activeLesson; }, [activeLesson]);
  useEffect(() => { lessonsRef.current = lessons; }, [lessons]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/'); return; }

        const [courseRes, lessonsRes, completedRes] = await Promise.all([
          api.get(`/api/courses/${courseId}`),
          api.get(`/api/courses/${courseId}/lessons`),
          api.get(`/api/lessons/course/${courseId}/completed`),
        ]);

        setCourse(courseRes.data);
        setLessons(lessonsRes.data);
        setCompletedLessonIds(completedRes.data.completedLessonIds || []);
        if (lessonsRes.data.length > 0) setActiveLesson(lessonsRes.data[0]);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load course content.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, navigate]);

  const handleToggleComplete = useCallback(async (lessonId) => {
    try {
      const response = await api.post(`/api/lessons/${lessonId}/complete`, {});
      const { is_completed } = response.data;
      setCompletedLessonIds((prev) =>
        is_completed ? Array.from(new Set([...prev, lessonId])) : prev.filter((id) => id !== lessonId)
      );
      return is_completed;
    } catch (err) {
      console.error('Error updating lesson progress:', err);
      return false;
    }
  }, []);

  // ── YouTube IFrame API ───────────────────────────────────────
  const extractVideoId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  };

  const initPlayer = useCallback((videoId) => {
    if (!playerDivRef.current) return;
    if (playerRef.current) {
      // Reuse existing player — just load new video
      playerRef.current.loadVideoById(videoId);
      return;
    }
    playerRef.current = new window.YT.Player(playerDivRef.current, {
      videoId,
      width: '100%',
      height: '100%',
      playerVars: { rel: 0, modestbranding: 1 },
      events: {
        onStateChange: (event) => {
          // State 0 = ended
          if (event.data === 0) {
            const lesson = activeLessonRef.current;
            if (!lesson) return;
            // Only auto-mark if not already done
            setCompletedLessonIds((prev) => {
              if (prev.includes(lesson.id)) return prev;
              // Fire API call
              api.post(`/api/lessons/${lesson.id}/complete`, {}).catch(console.error);
              showToast('✅ Lesson complete! Great work 🎉');
              // Auto-advance to next lesson
              const all = lessonsRef.current;
              const idx = all.findIndex((l) => l.id === lesson.id);
              if (idx !== -1 && idx < all.length - 1) {
                setTimeout(() => setActiveLesson(all[idx + 1]), 1200);
              }
              return Array.from(new Set([...prev, lesson.id]));
            });
          }
        },
      },
    });
  }, []);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) return; // already loaded
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }, []);

  // Init / switch player when activeLesson changes
  useEffect(() => {
    if (!activeLesson?.video_url) return;
    const videoId = extractVideoId(activeLesson.video_url);
    if (!videoId) return;
    const tryInit = () => {
      if (window.YT && window.YT.Player) {
        initPlayer(videoId);
      } else {
        window.onYouTubeIframeAPIReady = () => initPlayer(videoId);
      }
    };
    // Small delay so the DOM div is rendered
    const t = setTimeout(tryInit, 100);
    return () => clearTimeout(t);
  }, [activeLesson, initPlayer]);

  // Destroy player on unmount
  useEffect(() => () => {
    if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null; }
  }, []);

  const completedCount = completedLessonIds.length;
  const totalCount = lessons.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6 md:p-8">
        <div className="max-w-7xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-xl w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="flex gap-6 mt-6">
            <div className="w-1/3 space-y-2">
              {[1, 2, 3, 4].map(n => <div key={n} className="h-12 bg-gray-200 rounded-xl" />)}
            </div>
            <div className="flex-1 bg-gray-200 rounded-2xl h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center p-8">
        <div className="bg-white border border-red-100 rounded-2xl shadow-lg p-10 text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Couldn't load course</h2>
          <p className="text-red-600 text-sm mb-6">{error}</p>
          <button onClick={() => navigate('/my-courses')} className="btn-primary">
            ← Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  if (!course || lessons.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center p-8">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-10 text-center max-w-md">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No lessons yet</h2>
          <p className="text-gray-500 text-sm">The instructor hasn't added any lessons to this course yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">

      {/* ── Course header ── */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-indigo-200 text-xs font-medium mb-2">
                <button onClick={() => navigate('/my-courses')} className="hover:text-white transition">My Courses</button>
                <span>›</span>
                <span className="text-white line-clamp-1">{course.title}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight line-clamp-2">{course.title}</h1>
              <p className="text-indigo-200 text-sm mt-1">👨‍🏫 {course.teacher_name}</p>
            </div>

            {/* Progress pill */}
            <div className="flex-shrink-0 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-center min-w-[100px]">
              <p className="text-2xl font-black">{progressPct}%</p>
              <p className="text-indigo-200 text-xs mt-0.5">Complete</p>
              <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-green-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row gap-5">

        {/* LEFT — Lessons sidebar */}
        <aside className="md:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Lessons</h2>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {completedCount}/{totalCount}
              </span>
            </div>

            <ul className="divide-y divide-gray-50 max-h-[calc(100vh-280px)] overflow-y-auto">
              {lessons.map((lesson) => {
                const isActive = activeLesson?.id === lesson.id;
                const isDone = completedLessonIds.includes(lesson.id);
                return (
                  <li
                    key={lesson.id}
                    onClick={() => { setActiveLesson(lesson); setActiveTab('lessons'); }}
                    className={`group flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all duration-200
                      ${isActive
                        ? 'bg-indigo-50 border-l-2 border-indigo-500'
                        : 'hover:bg-gray-50/80 border-l-2 border-transparent'
                      }`}
                  >
                    {/* Order badge */}
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5
                      ${isActive ? 'bg-indigo-600 text-white' : isDone ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {isDone ? '✓' : lesson.order_number}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium line-clamp-2 leading-snug
                        ${isActive ? 'text-indigo-700' : isDone ? 'text-green-700' : 'text-gray-700'}`}>
                        {lesson.title}
                      </p>
                    </div>

                    {/* Complete toggle */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleComplete(lesson.id); }}
                      title={isDone ? 'Mark incomplete' : 'Mark complete'}
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 mt-0.5
                        ${isDone
                          ? 'bg-green-500 border-green-500 text-white flex items-center justify-center'
                          : 'border-gray-200 hover:border-green-400 group-hover:border-indigo-300'
                        }`}
                    >
                      {isDone && <span className="text-[10px] font-bold">✓</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* RIGHT — Main content */}
        <section className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Tab bar */}
            <div className="flex gap-0 border-b border-gray-100 px-2 pt-2">
              {[
                { key: 'lessons', icon: '📖', label: 'Lesson' },
                { key: 'discussion', icon: '💬', label: 'Q&A' },
                { key: 'live', icon: '📡', label: 'Live' },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all duration-200
                    ${activeTab === key
                      ? 'text-indigo-700 bg-indigo-50 border-b-2 border-indigo-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-5 md:p-6">
              {activeTab === 'lessons' ? (
                <div className="animate-fadeIn">
                  <h2 className="text-xl font-extrabold tracking-tight text-gray-900 mb-4">
                    {activeLesson?.title}
                  </h2>

                  {activeLesson?.video_url && (
                    <div className="w-full aspect-video bg-gray-900 rounded-xl overflow-hidden mb-5 shadow-lg">
                      {extractVideoId(activeLesson.video_url) ? (
                        // YouTube IFrame API player — auto-marks complete on video end
                        <div ref={playerDivRef} className="w-full h-full" />
                      ) : (
                        // Fallback for non-YouTube URLs
                        <iframe
                          src={activeLesson.video_url}
                          title={activeLesson.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </div>
                  )}

                  {activeLesson?.content_text && (
                    <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-indigo-100/60 rounded-xl p-5">
                      <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <span>📝</span> Lesson Notes
                      </h3>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {activeLesson.content_text}
                      </p>
                    </div>
                  )}
                </div>
              ) : activeTab === 'discussion' ? (
                <div className="animate-fadeIn">
                  <DiscussionBoard courseId={courseId} />
                </div>
              ) : (
                <div className="animate-fadeIn">
                  <LiveSession courseId={courseId} isTeacher={isTeacher} />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ── Toast notification ── */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-bounceIn">
          <div className="bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2">
            {toast}
          </div>
        </div>
      )}

      {/* ── Floating AI Tutor button ── */}
      <button
        onClick={() => setIsChatOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-xl transition-all duration-300
          ${isChatOpen
            ? 'bg-red-500 hover:bg-red-600 rotate-90'
            : 'bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:-translate-y-1 shadow-indigo-300'
          }`}
        title={isChatOpen ? 'Close AI Tutor' : 'Ask AI Tutor'}
      >
        {!isChatOpen && (
          <span className="absolute w-full h-full rounded-2xl bg-indigo-400 opacity-30 animate-ping" />
        )}
        <span className="relative z-10">{isChatOpen ? '✕' : '🤖'}</span>
      </button>

      {/* ── Sliding AI chat panel ── */}
      <div className={`fixed top-0 right-0 h-full w-80 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <AITutorChat
          lessonTitle={activeLesson?.title}
          lessonContext={activeLesson?.content_text || ''}
          onClose={() => setIsChatOpen(false)}
        />
      </div>

      {isChatOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={() => setIsChatOpen(false)} />
      )}
    </div>
  );
};

export default CoursePlayer;
