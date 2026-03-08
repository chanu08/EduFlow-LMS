import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';

const LiveSession = ({ courseId, isTeacher }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [activeRoom, setActiveRoom] = useState(null); // room_name for joined session

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const r = await api.get(`/api/courses/${courseId}/sessions`);
            setSessions(r.data);
        } catch { /* silent */ }
        setLoading(false);
    };

    useEffect(() => { fetchSessions(); }, [courseId]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title.trim() || !scheduledAt) return;
        setSubmitting(true);
        try {
            const r = await api.post(`/api/courses/${courseId}/sessions`, { title, scheduledAt });
            setSessions(prev => [...prev, r.data]);
            setTitle(''); setScheduledAt(''); setShowForm(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create session.');
        }
        setSubmitting(false);
    };

    const handleDelete = async (sessionId) => {
        if (!window.confirm('Delete this live session?')) return;
        try {
            await api.delete(`/api/courses/${courseId}/sessions/${sessionId}`);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
        } catch { alert('Failed to delete session.'); }
    };

    const now = new Date();
    const upcoming = sessions.filter(s => new Date(s.scheduled_at) > now);
    const past = sessions.filter(s => new Date(s.scheduled_at) <= now);

    if (activeRoom) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex flex-col">
                <div className="flex items-center gap-3 bg-gray-900 px-4 py-3">
                    <button onClick={() => setActiveRoom(null)}
                        className="text-white bg-red-600 hover:bg-red-700 text-sm font-bold px-4 py-2 rounded-lg transition">
                        ← Leave Session
                    </button>
                    <span className="text-white font-semibold text-sm">
                        🔴 Live Session — {sessions.find(s => s.room_name === activeRoom)?.title}
                    </span>
                </div>
                <iframe
                    src={`https://meet.jit.si/${activeRoom}`}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    className="flex-1 w-full border-0"
                    title="Jitsi Live Session"
                />
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    📡 Live Sessions
                </h2>
                {isTeacher && (
                    <button onClick={() => setShowForm(!showForm)}
                        className="text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-3 py-1.5 rounded-xl shadow hover:-translate-y-0.5 transition-all">
                        {showForm ? '✕ Cancel' : '＋ Schedule'}
                    </button>
                )}
            </div>

            {/* Schedule form (teacher only) */}
            {showForm && isTeacher && (
                <form onSubmit={handleCreate}
                    className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-4 space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">Session Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} required
                            placeholder="e.g. Week 3 Live Q&A"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">Date & Time</label>
                        <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                    </div>
                    <button type="submit" disabled={submitting}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition disabled:opacity-60">
                        {submitting ? 'Scheduling…' : 'Schedule Session'}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="space-y-2">{[1, 2].map(n => <div key={n} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <p className="text-3xl mb-2">📅</p>
                    <p className="text-xs">No live sessions scheduled yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Upcoming */}
                    {upcoming.length > 0 && (
                        <>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Upcoming</p>
                            {upcoming.map(s => (
                                <SessionCard key={s.id} session={s} isTeacher={isTeacher}
                                    onJoin={() => setActiveRoom(s.room_name)}
                                    onDelete={() => handleDelete(s.id)}
                                    upcoming />
                            ))}
                        </>
                    )}
                    {/* Past */}
                    {past.length > 0 && (
                        <>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-3">Past</p>
                            {past.map(s => (
                                <SessionCard key={s.id} session={s} isTeacher={isTeacher}
                                    onJoin={() => setActiveRoom(s.room_name)}
                                    onDelete={() => handleDelete(s.id)}
                                    upcoming={false} />
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

function SessionCard({ session, isTeacher, onJoin, onDelete, upcoming }) {
    const dt = new Date(session.scheduled_at);
    return (
        <div className={`rounded-xl border p-3 ${upcoming ? 'bg-white border-indigo-100' : 'bg-gray-50 border-gray-100 opacity-70'}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        {upcoming && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />}
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{session.title}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                        {dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' · '}
                        {dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={onJoin}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${upcoming
                                ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                            }`}>
                        {upcoming ? '🎥 Join' : '▶ Replay'}
                    </button>
                    {isTeacher && (
                        <button onClick={onDelete}
                            className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg transition">
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LiveSession;
