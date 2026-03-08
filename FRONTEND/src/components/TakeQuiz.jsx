import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';

/* ─── Result helpers ─────────────────────────────────────────── */
function getGrade(pct) {
  if (pct >= 90) return { label: 'Excellent!', emoji: '🏆', color: 'text-yellow-500' };
  if (pct >= 75) return { label: 'Great Job!', emoji: '🎉', color: 'text-green-500' };
  if (pct >= 50) return { label: 'Good Effort', emoji: '👍', color: 'text-blue-500' };
  return { label: 'Keep Trying', emoji: '💪', color: 'text-red-500' };
}

/* ─── Sub-components ─────────────────────────────────────────── */
function ProgressBar({ current, total }) {
  const pct = Math.round(((current) / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
        <span>Question {current} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuestionCard({ question, qIndex, total, selectedAnswer, onSelect, onNext, onPrev, onSubmit, isLast, submitting }) {
  return (
    <div className="animate-fadeIn">
      {/* Question */}
      <div className="mb-6">
        <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
          Question {qIndex + 1}
        </span>
        <h2 className="text-lg font-bold text-gray-900 leading-snug">
          {question.question_text}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {Array.isArray(question.options) && question.options.map((opt, optIdx) => {
          const selected = selectedAnswer === optIdx;
          return (
            <button
              key={optIdx}
              type="button"
              onClick={() => onSelect(optIdx)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${selected
                ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-gray-50'
                }`}
            >
              {/* Circle */}
              <span className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${selected
                ? 'border-indigo-500 bg-indigo-500 text-white'
                : 'border-gray-300 text-gray-400'
                }`}>
                {String.fromCharCode(65 + optIdx)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={qIndex === 0}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-30 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit Quiz ✓'}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={selectedAnswer === null}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-40"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function ResultScreen({ result, quizTitle, onRetry, onBack }) {
  const grade = getGrade(result.scorePercent);
  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference - (result.scorePercent / 100) * circumference;
  const isNewBest = result.attemptCount > 1 && result.scorePercent >= result.bestScore;

  return (
    <div className="animate-fadeIn text-center">
      {/* Circular score */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="36" fill="none"
              stroke="url(#scoreGrad)" strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-2xl font-black text-gray-900">{result.scorePercent}%</span>
          </div>
        </div>
      </div>

      <div>{grade.emoji && <div className="text-4xl mb-2">{grade.emoji}</div>}</div>
      <h2 className={`text-2xl font-black mb-1 ${grade.color}`}>{grade.label}</h2>
      <p className="text-gray-500 text-sm mb-2">{quizTitle}</p>
      <p className="text-gray-700 font-medium mb-4">
        You got <span className="text-blue-600 font-bold">{result.correctAnswers}</span> out of{' '}
        <span className="font-bold">{result.totalQuestions}</span> questions correct.
      </p>

      {/* Best score + attempt count */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className={`px-4 py-2 rounded-xl border-2 ${isNewBest ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'
          }`}>
          <p className="text-xs text-gray-500 font-medium">🏆 Best Score</p>
          <p className={`text-lg font-black ${isNewBest ? 'text-yellow-600' : 'text-gray-700'
            }`}>{result.bestScore}%</p>
          {isNewBest && <p className="text-xs text-yellow-500 font-semibold">New Record!</p>}
        </div>
        <div className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 font-medium">📋 Attempt</p>
          <p className="text-lg font-black text-gray-700">#{result.attemptCount}</p>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold shadow transition flex items-center gap-2"
        >
          🔄 Retake Quiz
        </button>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
        >
          My Courses →
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */
const TakeQuiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/'); return; }

        const res = await api.get(
          `/api/quizzes/course/${courseId}`
        );
        setQuiz(res.data);
        setAnswers(new Array(res.data.questions.length).fill(null));
      } catch (err) {
        const message = err.response?.data?.error || err.response?.data?.message || 'Failed to load quiz.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [courseId, navigate]);

  const handleSelect = (optIdx) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = optIdx;
      return next;
    });
  };

  const handleNext = () => setCurrentQ((q) => Math.min(q + 1, quiz.questions.length - 1));
  const handlePrev = () => setCurrentQ((q) => Math.max(q - 1, 0));

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.post(
        `/api/quizzes/${quiz.quizId}/submit`,
        { answers }
      );
      setResult(res.data);
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Failed to submit quiz.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setCurrentQ(0);
    setAnswers(new Array(quiz.questions.length).fill(null));
  };

  /* ── Render states ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading quiz…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-3">😕</div>
          <h2 className="font-bold text-gray-900 text-lg mb-2">Couldn't Load Quiz</h2>
          <p className="text-sm text-red-600 mb-6">{error}</p>
          <button onClick={() => navigate('/my-courses')} className="text-blue-600 font-semibold hover:underline text-sm">
            ← Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-3">📭</div>
          <h2 className="font-bold text-gray-900 text-lg mb-2">No Quiz Available</h2>
          <p className="text-sm text-gray-500 mb-6">The teacher hasn't added a quiz to this course yet.</p>
          <button onClick={() => navigate('/my-courses')} className="text-blue-600 font-semibold hover:underline text-sm">
            ← Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions;
  const isLast = currentQ === questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10 px-4 flex items-start justify-center">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{quiz.title}</h1>
            <p className="text-sm text-gray-400">{questions.length} questions</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-gray-600 font-medium transition"
          >
            ✕ Exit
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-7">
          {result ? (
            <ResultScreen
              result={result}
              quizTitle={quiz.title}
              onRetry={handleRetry}
              onBack={() => navigate('/my-courses')}
            />
          ) : (
            <>
              <div className="mb-7">
                <ProgressBar current={currentQ + 1} total={questions.length} />
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              <QuestionCard
                key={currentQ}
                question={questions[currentQ]}
                qIndex={currentQ}
                total={questions.length}
                selectedAnswer={answers[currentQ]}
                onSelect={handleSelect}
                onNext={handleNext}
                onPrev={handlePrev}
                onSubmit={handleSubmit}
                isLast={isLast}
                submitting={submitting}
              />
            </>
          )}
        </div>

        {/* Answer dots overview */}
        {!result && (
          <div className="mt-4 flex justify-center gap-1.5 flex-wrap">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all border-2 ${i === currentQ
                  ? 'border-indigo-500 bg-indigo-500 text-white'
                  : answers[i] !== null
                    ? 'border-green-400 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-400 hover:border-gray-400'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;
