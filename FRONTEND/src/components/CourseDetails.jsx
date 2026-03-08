import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

/* ─── Star display / picker ──────────────────────────────────── */
function StarDisplay({ rating, size = 'md' }) {
    const sz = size === 'sm' ? 'text-sm' : 'text-xl';
    return (
        <span className={sz} aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={s <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
            ))}
        </span>
    );
}

function StarPicker({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
                <button
                    key={s}
                    type="button"
                    onClick={() => onChange(s)}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    className={`text-3xl transition-transform duration-75 hover:scale-110 ${s <= (hovered || value) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                    aria-label={`Rate ${s} star${s > 1 ? 's' : ''}`}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

/* ─── Review Card ────────────────────────────────────────────── */
function ReviewCard({ review }) {
    const date = new Date(review.created_at).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        {review.student_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{review.student_name}</span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                    <StarDisplay rating={review.rating} size="sm" />
                    <span className="text-xs text-gray-400">{date}</span>
                </div>
            </div>
            {review.comment && (
                <p className="text-sm text-gray-600 leading-relaxed mt-2">{review.comment}</p>
            )}
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    })();
    const token = localStorage.getItem('token');
    const isStudent = user?.role === 'student';

    const [course, setCourse] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);

    // Review form state
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState('');
    const [submitErr, setSubmitErr] = useState('');

    const fetchReviews = useCallback(async () => {
        const res = await api.get(`/api/courses/${courseId}/reviews`);
        setReviews(res.data.reviews);
        setAverageRating(res.data.averageRating);
        setTotalReviews(res.data.totalReviews);
    }, [courseId]);

    useEffect(() => {
        const init = async () => {
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const [courseRes] = await Promise.all([
                    api.get(`/api/courses/${courseId}`, { headers }),
                ]);
                setCourse(courseRes.data);

                await fetchReviews();

                // Check enrollment
                if (isStudent && token) {
                    const myCoursesRes = await api.get('/api/courses/my-courses', { headers });
                    const enrolled = myCoursesRes.data.some((c) => String(c.id) === String(courseId));
                    setIsEnrolled(enrolled);
                }
            } catch (err) {
                console.error('Error loading course details:', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [courseId, token, isStudent, fetchReviews]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (rating === 0) { setSubmitErr('Please select a star rating.'); return; }
        setSubmitErr('');
        setSubmitMsg('');
        setSubmitting(true);
        try {
            await api.post(
                `/api/courses/${courseId}/reviews`,
                { rating, comment }
            );
            setSubmitMsg('Your review has been submitted! ✓');
            setRating(0);
            setComment('');
            await fetchReviews(); // Refresh list
        } catch (err) {
            setSubmitErr(err.response?.data?.error || 'Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Course not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-blue-200 hover:text-white text-sm font-medium mb-4 flex items-center gap-1 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <h1 className="text-3xl font-black mb-2 leading-snug">{course.title}</h1>
                    <p className="text-blue-100 text-sm mb-4 max-w-2xl">{course.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-blue-100">
                            <span>👤</span> {course.teacher_name}
                        </span>
                        {totalReviews > 0 && (
                            <span className="flex items-center gap-1">
                                <StarDisplay rating={Math.round(averageRating)} size="sm" />
                                <span className="text-yellow-300 font-bold">{averageRating}</span>
                                <span className="text-blue-200">({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
                            </span>
                        )}
                    </div>

                    {/* CTA buttons */}
                    <div className="mt-6 flex flex-wrap gap-3">
                        {isStudent && isEnrolled && (
                            <>
                                <button
                                    onClick={() => navigate(`/courses/${courseId}/player`)}
                                    className="bg-white text-blue-700 font-bold text-sm px-5 py-2.5 rounded-xl shadow hover:shadow-md transition"
                                >
                                    ▶ Continue Learning
                                </button>
                                <button
                                    onClick={() => navigate(`/courses/${courseId}/quiz`)}
                                    className="bg-white/20 hover:bg-white/30 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition"
                                >
                                    📝 Take Quiz
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
                {/* ── Reviews Section ── */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        ⭐ Student Reviews
                        {totalReviews > 0 && (
                            <span className="text-sm font-normal text-gray-500">
                                — {averageRating} avg from {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h2>

                    {/* Submit Form — enrolled students only */}
                    {isStudent && isEnrolled && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                            <h3 className="text-base font-semibold text-gray-800 mb-4">Leave a Review</h3>

                            {submitMsg && (
                                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700">
                                    {submitMsg}
                                </div>
                            )}
                            {submitErr && (
                                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
                                    {submitErr}
                                </div>
                            )}

                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                                    <StarPicker value={rating} onChange={setRating} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Comment <span className="text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={3}
                                        placeholder="What did you think of this course?"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-60"
                                >
                                    {submitting ? 'Submitting…' : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Reviews list */}
                    {reviews.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-4xl mb-3">💬</p>
                            <p className="font-medium">No reviews yet. Be the first!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CourseDetails;
