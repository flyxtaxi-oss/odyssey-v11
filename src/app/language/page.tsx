"use client";

import { useState, useEffect } from 'react';
import { Globe, BookOpen, MessageSquare, PlayCircle, Star, Flame, Award, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const MOCK_PROFILE = {
    target_language: 'English',
    native_language: 'French',
    current_level: 'B1',
    streak_days: 14,
    xp_points: 850,
    daily_goal_progress: 60, // percentage
};

const FLASHCARDS = [
    { id: 1, front: 'To entail', back: 'Impliquer, entraîner', next_review: '2023-11-20' },
    { id: 2, front: 'Overwhelming', back: 'Écrasant, accablant', next_review: '2023-11-20' },
    { id: 3, front: 'To commute', back: 'Faire le trajet (travail/domicile)', next_review: '2023-11-20' },
];

const SCENARIOS = [
    { id: 1, title: 'Job Interview', level: 'B2', description: 'Practice a mock interview for a software engineering role.', icon: <Award className="w-5 h-5" /> },
    { id: 2, title: 'Ordering in a Restaurant', level: 'A2', description: 'Order a 3-course meal and handle dietary restrictions.', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 3, title: 'Check-in at the Airport', level: 'B1', description: 'Handle luggage issues and boarding pass printing at the counter.', icon: <Globe className="w-5 h-5" /> },
];

export default function LanguageLabPage() {
    const [activeTab, setActiveTab] = useState('flashcards');
    const [learningMode, setLearningMode] = useState<'idle' | 'flashcards' | 'roleplay' | 'placement'>('idle');
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    // Components for Learning Modes
    const FlashcardMode = () => {
        if (currentCardIndex >= FLASHCARDS.length) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)] rounded-full flex items-center justify-center mb-4">
                        <Star className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-[var(--text-0)]">Review Complete!</h2>
                    <p className="text-[var(--text-2)] max-w-md">You've successfully reviewed all your due flashcards. +50 XP</p>
                    <button onClick={() => setLearningMode('idle')} className="btn-stitch rounded-full px-8 py-4 text-lg mt-6">
                        Return to Dashboard
                    </button>
                </div>
            );
        }

        const card = FLASHCARDS[currentCardIndex];

        return (
            <div className="max-w-2xl mx-auto py-10">
                <div className="flex justify-between items-center mb-8">
                    <button className="btn-ghost-glow" onClick={() => setLearningMode('idle')}>Back</button>
                    <div className="text-sm font-medium text-[var(--text-3)]">
                        Card {currentCardIndex + 1} of {FLASHCARDS.length}
                    </div>
                    <div className="w-16" /> {/* Spacer */}
                </div>

                <div
                    className="aspect-video glass-panel flex flex-col items-center justify-center p-8 cursor-pointer relative overflow-hidden group transition-all"
                    onClick={() => setShowAnswer(true)}
                >
                    <div className="absolute inset-0 bg-[var(--gradient-card-border)] opacity-0 group-hover:opacity-20 transition-opacity" />
                    <h2 className="text-4xl font-bold mb-4 text-[var(--text-0)] text-glow">{card.front}</h2>

                    {showAnswer ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl text-[var(--accent-cyan)] font-medium"
                        >
                            {card.back}
                        </motion.div>
                    ) : (
                        <p className="text-[var(--text-3)] mt-4 text-sm uppercase font-mono-tech tracking-wider">Click to reveal</p>
                    )}
                </div>

                {showAnswer && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4 mt-8"
                    >
                        <button
                            className="flex-1 rounded-2xl py-6 border border-[var(--accent-rose)]/20 hover:bg-[var(--accent-rose)]/10 text-[var(--accent-rose)] transition-colors font-bold"
                            onClick={() => { setShowAnswer(false); setCurrentCardIndex(prev => prev + 1); }}
                        >
                            Hard
                        </button>
                        <button
                            className="flex-1 rounded-2xl py-6 border border-[var(--accent-amber)]/20 hover:bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] transition-colors font-bold"
                            onClick={() => { setShowAnswer(false); setCurrentCardIndex(prev => prev + 1); }}
                        >
                            Good
                        </button>
                        <button
                            className="flex-1 rounded-2xl py-6 border border-[var(--accent-emerald)]/20 hover:bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] transition-colors font-bold"
                            onClick={() => { setShowAnswer(false); setCurrentCardIndex(prev => prev + 1); }}
                        >
                            Easy
                        </button>
                    </motion.div>
                )}
            </div>
        );
    };

    const RoleplayMode = () => (
        <div className="max-w-4xl mx-auto py-10 h-[70vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <button className="btn-ghost-glow" onClick={() => setLearningMode('idle')}>End Session</button>
                <div className="text-sm font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Roleplay: Job Interview
                </div>
                <span className="tag-cyber">B2 Level</span>
            </div>

            <div className="flex-1 glass-panel p-6 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-6 p-4 custom-scroll">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center shrink-0">
                            <span className="font-bold text-[var(--primary)]">AI</span>
                        </div>
                        <div className="bg-[var(--bg-3)] p-4 rounded-2xl rounded-tl-sm text-[var(--text-1)]">
                            Welcome to the interview. Could you please start by telling me a little bit about your background and your most recent role?
                        </div>
                    </div>

                    <div className="flex items-end gap-4 justify-end">
                        <div className="bg-[var(--primary)] p-4 rounded-2xl rounded-tr-sm text-[var(--bg-0)] max-w-[80%] shadow-lg">
                            Thank you. I have been working as a software engineer for the past 4 years, mainly focusing on frontend development with React.
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center shrink-0">
                            <span className="font-bold text-[var(--primary)]">AI</span>
                        </div>
                        <div className="bg-[var(--bg-3)] p-4 rounded-2xl rounded-tl-sm text-[var(--text-1)]">
                            That's great. What would you say was your biggest technical challenge in your last React project, and how did you overcome it?
                            <div className="mt-3 pt-3 border-t border-[var(--border-0)] text-xs text-[var(--text-2)] flex items-center gap-2">
                                <Star className="w-3 h-3 text-[var(--accent-amber)]" /> Grammar tip: Use "What were" if referring to multiple challenges, but "What was" is correct here. Good job on your vocabulary!
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border-0)] flex gap-4">
                    <input
                        title="Chat Input"
                        type="text"
                        placeholder="Type your response or use voice..."
                        className="input-sci-fi flex-1 rounded-full px-6 py-3"
                    />
                    <button title="Send" className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-[var(--primary)] hover:brightness-110 text-[var(--bg-0)] transition-all shadow-lg hover:shadow-[0_0_15px_rgba(143,245,255,0.3)]">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 mt-16 max-w-6xl min-h-screen">

            {learningMode === 'idle' && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-[var(--text-0)] font-display">Language Lab</h1>
                        <p className="text-[var(--text-3)] text-lg">Master a new language with JARVIS precision.</p>
                    </div>
                    <button onClick={() => setLearningMode('placement')} className="btn-ghost-glow border border-[var(--border-1)] rounded-full px-6 py-3 hover:bg-[var(--bg-3)]">
                        Take Placement Test
                    </button>
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div
                    key={learningMode}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {learningMode === 'idle' ? (
                        <div className="space-y-10">

                            {/* Dashboard Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
                                    <Globe className="w-8 h-8 text-[var(--accent-cyan)] mb-3" />
                                    <div className="text-2xl font-bold text-[var(--text-0)]">{MOCK_PROFILE.target_language}</div>
                                    <div className="text-sm font-bold text-[var(--text-3)] uppercase tracking-wider mt-1">Learning</div>
                                </div>

                                <div className="glow-card">
                                    <div className="glass-panel p-6 flex flex-col items-center justify-center text-center h-full">
                                        <div className="text-4xl font-black text-gradient-shimmer mb-1">
                                            {MOCK_PROFILE.current_level}
                                        </div>
                                        <div className="text-sm font-bold text-[var(--text-3)] uppercase tracking-wider mt-1">Current Level</div>
                                    </div>
                                </div>

                                <div className="glass-panel p-6 flex flex-col items-center justify-center text-center group">
                                    <div className="relative">
                                        <Flame className="w-8 h-8 text-[var(--accent-rose)] mb-3 group-hover:scale-110 transition-transform" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--tertiary)] rounded-full animate-pulse" />
                                    </div>
                                    <div className="text-2xl font-bold text-[var(--text-0)]">{MOCK_PROFILE.streak_days}</div>
                                    <div className="text-sm font-bold text-[var(--text-3)] uppercase tracking-wider mt-1">Day Streak</div>
                                </div>

                                <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
                                    <Award className="w-8 h-8 text-[var(--accent-amber)] mb-3" />
                                    <div className="text-2xl font-bold text-[var(--text-0)]">{MOCK_PROFILE.xp_points}</div>
                                    <div className="text-sm font-bold text-[var(--text-3)] uppercase tracking-wider mt-1">Total XP</div>
                                </div>
                            </div>

                            {/* Tabs navigation */}
                            <div className="flex bg-[var(--bg-2)] border border-[var(--border-0)] p-1 rounded-xl w-fit mb-8 shadow-inner">
                                {['flashcards', 'roleplay', 'progress'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold uppercase transition-all ${activeTab === tab ? 'bg-[var(--primary)] text-[var(--bg-0)] shadow-md' : 'text-[var(--text-2)] hover:text-[var(--text-1)]'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'flashcards' && (
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="glass-panel p-8 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-[var(--gradient-card-border)] opacity-10 group-hover:opacity-20 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-3 bg-[var(--primary)]/20 rounded-xl">
                                                    <BookOpen className="w-6 h-6 text-[var(--primary)]" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-[var(--text-0)]">Daily Review</h2>
                                                    <p className="text-[var(--text-3)] text-sm">You have {FLASHCARDS.length} cards to review today.</p>
                                                </div>
                                            </div>
                                            <div className="my-8">
                                                <div className="flex justify-between text-sm mb-3">
                                                    <span className="text-[var(--text-2)] font-semibold uppercase">Daily Goal</span>
                                                    <span className="font-bold text-[var(--accent-emerald)]">{MOCK_PROFILE.daily_goal_progress}%</span>
                                                </div>
                                                <div className="h-2 bg-[var(--bg-3)] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[var(--accent-emerald)] rounded-full" style={{ width: `${MOCK_PROFILE.daily_goal_progress}%` }} />
                                                </div>
                                            </div>
                                            <button
                                                className="btn-stitch w-full flex justify-center py-4"
                                                onClick={() => {
                                                    setCurrentCardIndex(0);
                                                    setShowAnswer(false);
                                                    setLearningMode('flashcards');
                                                }}
                                            >
                                                Start Review Session
                                            </button>
                                        </div>
                                    </div>

                                    <div className="glass-panel p-8">
                                        <h2 className="text-xl font-bold text-[var(--text-0)] mb-6">Recent Cards</h2>
                                        <div className="space-y-4">
                                            {FLASHCARDS.slice(0, 3).map(card => (
                                                <div key={card.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-2)] border border-[var(--border-0)] hover:border-[var(--border-1)] transition-colors">
                                                    <span className="font-medium text-[var(--text-1)]">{card.front}</span>
                                                    <span className="text-xs font-mono-tech text-[var(--text-3)] px-3 py-1 bg-[var(--bg-3)] rounded-lg">{card.next_review}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'roleplay' && (
                                <div className="grid md:grid-cols-3 gap-6">
                                    {SCENARIOS.map(scenario => (
                                        <div
                                            key={scenario.id}
                                            className="glass-panel p-6 flex flex-col justify-between cursor-pointer group hover:border-[var(--primary)] hover:shadow-[0_0_20px_rgba(143,245,255,0.08)] transition-all min-h-[220px]"
                                            onClick={() => setLearningMode('roleplay')}
                                        >
                                            <div>
                                                <div className="flex justify-between items-start mb-5">
                                                    <div className="p-3 bg-[var(--bg-3)] rounded-2xl group-hover:bg-[var(--primary)]/20 transition-colors">
                                                        <span className="text-[var(--accent-cyan)]">{scenario.icon}</span>
                                                    </div>
                                                    <span className="tag-cyber">{scenario.level}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-[var(--text-0)] mb-3">{scenario.title}</h3>
                                                <p className="text-[var(--text-3)] text-sm leading-relaxed">
                                                    {scenario.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center text-[var(--primary)] text-sm font-bold uppercase tracking-wider mt-6 group-hover:translate-x-1 transition-transform">
                                                Start Scenario <ArrowRight className="w-4 h-4 ml-2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'progress' && (
                                <div className="glass-panel p-16 text-center border-dashed border-2 border-[var(--border-0)]">
                                    <h3 className="text-xl font-bold text-[var(--text-0)] mb-2">Detailed Analytics</h3>
                                    <p className="text-[var(--text-3)]">Your mastery grid, skill breakdowns, and performance charts will appear here as you complete lessons.</p>
                                </div>
                            )}
                        </div>
                    ) : learningMode === 'flashcards' ? (
                        <FlashcardMode />
                    ) : learningMode === 'roleplay' ? (
                        <RoleplayMode />
                    ) : (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center glass-panel p-12 max-w-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-[var(--gradient-blue-purple)] opacity-10" />
                                <h2 className="text-3xl font-extrabold text-[var(--text-0)] mb-4">Placement Test</h2>
                                <p className="text-[var(--text-2)] mb-10 text-lg leading-relaxed">Take a precise, adaptive 10-minute AI assessment to calibrate your language level perfectly.</p>
                                <button onClick={() => setLearningMode('idle')} className="btn-stitch px-8 py-4 text-lg">
                                    Start Assessment
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
