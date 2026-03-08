import React, { useEffect, useRef, useState } from 'react';
import api from '../api/axiosInstance';

/* ─── Single message bubble ──────────────────────────── */
function MessageBubble({ msg, currentUserId }) {
    const isTeacher = msg.role === 'teacher';
    const date = new Date(msg.created_at).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit',
    });
    const dateStr = new Date(msg.created_at).toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric',
    });

    return (
        <div className={`flex gap-3 ${isTeacher ? 'items-start' : 'items-start'}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isTeacher ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                {msg.username.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
                {/* Name + badge + time */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-semibold text-gray-800">{msg.username}</span>
                    {isTeacher && (
                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            👨‍🏫 Instructor
                        </span>
                    )}
                    <span className="text-xs text-gray-400">{dateStr} · {date}</span>
                </div>

                {/* Message bubble */}
                <div className={`inline-block px-3.5 py-2.5 rounded-2xl ${isTeacher
                    ? 'bg-blue-50 border border-blue-100 text-blue-900 rounded-tl-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                    } text-sm leading-relaxed max-w-full`}>
                    {msg.message}
                </div>
            </div>
        </div>
    );
}

/* ─── Main Discussion Component ──────────────────────── */
const DiscussionBoard = ({ courseId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);

    const token = localStorage.getItem('token');
    const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

    // Fetch messages on mount
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await api.get(`/api/courses/${courseId}/discussions`);
                setMessages(res.data);
            } catch (err) {
                setError('Failed to load discussion board.');
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [courseId, token]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handlePost = async (e) => {
        e.preventDefault();
        if (!input.trim() || posting) return;
        setPosting(true);
        setError('');
        try {
            const res = await api.post(
                `/api/courses/${courseId}/discussions`,
                { message: input.trim() }
            );
            setMessages((prev) => [...prev, res.data]);
            setInput('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to post message.');
        } finally {
            setPosting(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost(e); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full" style={{ minHeight: '400px' }}>
            {/* Header info */}
            <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-gray-400">{messages.length} message{messages.length !== 1 ? 's' : ''}</p>
                <span className="text-xs text-gray-400">💬 Ask questions, share insights</span>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2" style={{ maxHeight: '420px' }}>
                {messages.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-2">💬</p>
                        <p className="font-medium text-sm">No messages yet. Be the first to ask!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble key={msg.id} msg={msg} currentUserId={user?.id} />
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Error */}
            {error && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                </div>
            )}

            {/* Input */}
            <form onSubmit={handlePost} className="mt-3 flex gap-2 items-end border-t border-gray-100 pt-3">
                <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition shadow-sm">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder="Ask a question or share a thought… (Enter to send)"
                        className="w-full resize-none text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400 leading-relaxed max-h-24"
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!input.trim() || posting}
                    className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl flex items-center justify-center shadow transition disabled:opacity-40"
                    aria-label="Send message"
                >
                    {posting ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    )}
                </button>
            </form>
        </div>
    );
};

export default DiscussionBoard;
