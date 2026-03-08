import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

const CreateCourse = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        description: '',
        thumbnail_url: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if not a teacher
    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) {
            navigate('/');
            return;
        }
        try {
            const user = JSON.parse(stored);
            if (user.role !== 'teacher') navigate('/dashboard');
        } catch {
            navigate('/');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/api/courses/create', form);

            const newCourseId = response.data.course.id;
            navigate(`/manage-course/${newCourseId}`);
        } catch (err) {
            const message =
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to create course. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium mb-4 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Create a New Course</h1>
                    <p className="text-gray-500 mt-1 text-sm">Fill in the details below to publish your course.</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    {error && (
                        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Course Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Introduction to Python"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                                rows={4}
                                placeholder="What will students learn in this course?"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Thumbnail URL
                                <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
                            </label>
                            <input
                                type="url"
                                name="thumbnail_url"
                                value={form.thumbnail_url}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                            />
                            {form.thumbnail_url && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 h-36 bg-gray-50">
                                    <img
                                        src={form.thumbnail_url}
                                        alt="Thumbnail preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-60"
                            >
                                {loading ? 'Creating…' : '🚀 Publish Course'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;
