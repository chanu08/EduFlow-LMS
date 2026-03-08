import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axiosInstance';

/* ─── Simple markdown-ish renderer (bold **text**) ──────────── */
function renderMessage(text) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
            ? <strong key={i}>{part.slice(2, -2)}</strong>
            : <span key={i}>{part}</span>
    );
}

/* ─── Individual chat bubble ─────────────────────────────────── */
function Bubble({ msg }) {
    const isUser = msg.role === 'user';
    return (
        <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isUser ? 'bg-blue-500 text-white' : 'bg-indigo-100 text-indigo-600'
                }`}>
                {isUser ? '👤' : '🤖'}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                {isUser ? msg.content : renderMessage(msg.content)}
            </div>
        </div>
    );
}

/* ─── Typing indicator ───────────────────────────────────────── */
function TypingIndicator() {
    return (
        <div className="flex items-end gap-2 animate-fadeIn">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs">🤖</div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                    />
                ))}
            </div>
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────── */
const AITutorChat = ({ lessonContext, lessonTitle, onClose }) => {
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            content: `👋 Hi! I'm your AI Tutor.\n\nI'm here to help you understand **${lessonTitle || 'this lesson'}**. Ask me anything!`,
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Focus input on open
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    const handleSend = async () => {
        const question = input.trim();
        if (!question || loading) return;

        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: question }]);
        setLoading(true);

        try {
            const res = await api.post(
                '/api/ai/ask',
                { question, lessonContext: lessonContext || '' }
            );
            setMessages((prev) => [...prev, { role: 'ai', content: res.data.answer }]);
        } catch (err) {
            const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
            setMessages((prev) => [...prev, { role: 'ai', content: `⚠️ ${msg}` }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const suggestions = [
        'Explain this in simple terms',
        'Give me an example',
        'What should I know next?',
    ];

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">🤖</div>
                    <div>
                        <p className="text-sm font-bold leading-none">AI Tutor</p>
                        <p className="text-xs text-blue-100 mt-0.5 leading-none">Powered by EduFlow AI</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition"
                    aria-label="Close chat"
                >
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
                {messages.map((msg, i) => (
                    <Bubble key={i} msg={msg} />
                ))}
                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
            </div>

            {/* Suggestion chips — shown only at start */}
            {messages.length === 1 && (
                <div className="px-4 pb-2 flex gap-2 flex-wrap">
                    {suggestions.map((s) => (
                        <button
                            key={s}
                            onClick={() => { setInput(s); inputRef.current?.focus(); }}
                            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-3 py-1.5 rounded-full transition"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                <div className="flex items-end gap-2 bg-white rounded-xl border border-gray-200 shadow-sm px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder="Ask anything about this lesson…"
                        className="flex-1 resize-none text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none max-h-28 leading-relaxed"
                        style={{ height: 'auto' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg flex items-center justify-center text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Send"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-1.5">Enter to send · Shift+Enter for new line</p>
            </div>
        </div>
    );
};

export default AITutorChat;
