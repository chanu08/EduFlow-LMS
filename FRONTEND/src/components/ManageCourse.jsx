import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';

const ManageCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role !== 'teacher') {
        navigate('/dashboard');
      }
    } catch {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }

        const [courseRes, lessonsRes] = await Promise.all([
          api.get('/api/courses/${courseId}', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get('/api/courses/${courseId}/lessons', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCourse(courseRes.data);
        setLessons(lessonsRes.data);
      } catch (err) {
        console.error('Error loading course or lessons:', err);
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, navigate]);

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await api.post(
        '/api/courses/${courseId}/lessons',
        {
          title,
          video_url: videoUrl,
          content_text: content,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLessons((prev) => [...prev, response.data.lesson]);
      setTitle('');
      setVideoUrl('');
      setContent('');
    } catch (err) {
      console.error('Error creating lesson:', err);
      const message =
        err.response?.data?.error || 'Failed to create lesson. Please try again.';
      setError(message);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!course) {
    return <div className="p-8 text-red-600">Course not found.</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Manage Course</h1>
          <p className="text-gray-600">
            {course.title} &mdash; <span className="font-semibold">{course.teacher_name}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
        >
          Back to Dashboard
        </button>
      </header>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Lessons</h2>
        {lessons.length === 0 ? (
          <p className="text-gray-600">No lessons yet. Add your first lesson below.</p>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-1 text-sm text-gray-400">
                  Lesson {lesson.order_number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
                {lesson.video_url && (
                  <a
                    href={lesson.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    View Video
                  </a>
                )}
                {lesson.content_text && (
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                    {lesson.content_text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Add New Lesson</h2>
        <form onSubmit={handleAddLesson} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Video URL (optional)
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Lesson Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Write the lesson explanation, notes, or transcript..."
            />
          </div>

          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add Lesson
          </button>
        </form>
      </section>
    </div>
  );
};

export default ManageCourse;

