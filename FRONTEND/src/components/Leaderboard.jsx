import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const MEDAL = ['🥇', '🥈', '🥉'];
const PODIUM_COLORS = [
    'from-yellow-400 to-amber-500',   // 1st
    'from-slate-300 to-slate-400',    // 2nd
    'from-amber-600 to-amber-700',    // 3rd
];
const PODIUM_H = ['h-28', 'h-20', 'h-14'];

function ScoreBadge({ score }) {
    const color = score >= 80 ? 'text-green-600 bg-green-50' : score >= 50 ? 'text-blue-600 bg-blue-50' : 'text-gray-500 bg-gray-100';
    return <span className={`text-xs font-black px-2 py-0.5 rounded-full ${color}`}>{score}pts</span>;
}

function AvatarInitial({ name, rank }) {
    const colors = ['from-indigo-500 to-violet-600', 'from-pink-500 to-rose-500', 'from-green-500 to-emerald-600',
        'from-orange-500 to-amber-500', 'from-cyan-500 to-blue-500', 'from-purple-500 to-indigo-600'];
    const g = colors[name.charCodeAt(0) % colors.length];
    return (
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${g} flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-sm`}>
            {rank <= 3 ? MEDAL[rank - 1] : name[0].toUpperCase()}
        </div>
    );
}

const Leaderboard = () => {
    const navigate = useNavigate();
    const me = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

    const [tab, setTab] = useState('global');
    const [globalData, setGlobalData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                if (tab === 'global') {
                    const r = await api.get('/api/leaderboard/global');
                    setGlobalData(r.data);
                }
            } catch { /* silent */ }
            setLoading(false);
        };
        fetch();
    }, [tab]);

    const top3 = globalData.slice(0, 3);
    const rest = globalData.slice(3);
    const myRank = globalData.findIndex(s => s.id === me?.id);

    // Podium order: 2nd, 1st, 3rd
    const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
    const podiumPositions = top3.length >= 3 ? [1, 0, 2] : [0, 1, 2];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 text-white px-6 py-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <div className="max-w-3xl mx-auto relative z-10 text-center">
                    <p className="text-indigo-200 text-sm font-medium mb-1">EduFlow</p>
                    <h1 className="text-4xl font-extrabold mb-2">🏆 Leaderboard</h1>
                    <p className="text-indigo-100 text-sm">Ranked by lesson completion + quiz performance</p>
                    {myRank >= 0 && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold">
                            Your rank: <span className="text-yellow-300 font-black">#{myRank + 1}</span>
                            <span className="text-indigo-200">of {globalData.length}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tab Bar */}
            <div className="flex justify-center py-5">
                <div className="bg-white border border-gray-100 rounded-xl p-1 shadow-sm flex gap-1">
                    {[{ id: 'global', label: '🌍 Global' }].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${tab === t.id ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 pb-16">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(n => <div key={n} className="h-16 bg-white rounded-2xl animate-pulse" />)}
                    </div>
                ) : globalData.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-5xl mb-3">🏅</p>
                        <p className="font-medium">No students on the board yet.</p>
                        <p className="text-sm mt-1">Complete lessons and quizzes to appear here!</p>
                    </div>
                ) : (
                    <>
                        {/* ── Podium ── */}
                        {top3.length >= 2 && (
                            <div className="flex items-end justify-center gap-4 mb-8 mt-2">
                                {podiumOrder.map((s, i) => {
                                    if (!s) return null;
                                    const origRank = podiumPositions[i]; // 0=1st,1=2nd,2=3rd
                                    return (
                                        <div key={s.id} className="flex flex-col items-center gap-2">
                                            {/* Avatar */}
                                            <div className="relative">
                                                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${PODIUM_COLORS[origRank]} flex items-center justify-center text-2xl shadow-lg`}>
                                                    {MEDAL[origRank]}
                                                </div>
                                                {origRank === 0 && (
                                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👑</div>
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-gray-800 text-center max-w-[72px] truncate">{s.username}</p>
                                            <ScoreBadge score={s.compositeScore} />
                                            {/* Podium block */}
                                            <div className={`w-20 ${PODIUM_H[origRank]} bg-gradient-to-t ${PODIUM_COLORS[origRank]} rounded-t-xl flex items-center justify-center shadow-md`}>
                                                <span className="text-white font-black text-xl">#{origRank + 1}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── Rest of list ── */}
                        <div className="space-y-2">
                            {rest.map((s) => {
                                const isMe = s.id === me?.id;
                                return (
                                    <div key={s.id}
                                        className={`flex items-center gap-4 bg-white rounded-2xl border px-4 py-3 shadow-sm hover:shadow-md transition-all
                      ${isMe ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100'}`}>
                                        {/* Rank */}
                                        <span className="w-7 text-center font-black text-gray-400 text-sm flex-shrink-0">#{s.rank}</span>
                                        <AvatarInitial name={s.username} rank={s.rank} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-gray-900 text-sm truncate">{s.username}</p>
                                                {isMe && <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">YOU</span>}
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
                                                <span>📚 {s.coursesEnrolled} courses</span>
                                                <span>✅ {s.lessonsDone} lessons</span>
                                                <span>🎯 {s.avgQuizScore}% quiz avg</span>
                                            </div>
                                        </div>
                                        <ScoreBadge score={s.compositeScore} />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Top 3 as list too (for mobile clarity) */}
                        {top3.length > 0 && (
                            <div className="mt-4 space-y-2 border-t border-dashed border-gray-200 pt-4">
                                {top3.map((s) => {
                                    const isMe = s.id === me?.id;
                                    return (
                                        <div key={s.id}
                                            className={`flex items-center gap-4 bg-white rounded-2xl border px-4 py-3 shadow-sm
                        ${isMe ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100'}`}>
                                            <span className="w-7 text-center text-lg flex-shrink-0">{MEDAL[s.rank - 1]}</span>
                                            <AvatarInitial name={s.username} rank={s.rank} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-900 text-sm truncate">{s.username}</p>
                                                    {isMe && <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">YOU</span>}
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
                                                    <span>📚 {s.coursesEnrolled} courses</span>
                                                    <span>✅ {s.lessonsDone} lessons</span>
                                                    <span>🎯 {s.avgQuizScore}% quiz avg</span>
                                                </div>
                                            </div>
                                            <ScoreBadge score={s.compositeScore} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Footer note */}
                        <p className="text-center text-xs text-gray-400 mt-6">
                            Score = 40% lesson completion + 60% quiz performance
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
