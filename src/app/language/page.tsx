"use client";

import { useState, useEffect, useCallback } from 'react';
import { Globe, BookOpen, MessageSquare, Star, Flame, Award, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, isSignedIn } from "@/lib/api-client";

type LanguageProfile = {
    id: string;
    target_language: string;
    native_language: string;
    current_level: string;
    streak_days: number;
    xp_points: number;
};

type Flashcard = {
    id: string;
    front: string;
    back: string;
    mastery_level: number;
    next_review_at: string;
};

type Scenario = {
    id: number;
    title: string;
    level: string;
    description: string;
};

export default function LanguageLabPage() {
    const [activeTab, setActiveTab] = useState('flashcards');
    const [learningMode, setLearningMode] = useState<'idle' | 'flashcards' | 'roleplay' | 'placement'>('idle');
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [profile, setProfile] = useState<LanguageProfile>({
        id: "", target_language: "English", native_language: "French",
        current_level: "A1", streak_days: 0, xp_points: 0,
    });
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [scenarios] = useState<Scenario[]>([
        { id: 1, title: "Entretien d'embauche", level: "B2", description: "Simule un entretien pour un poste de développeur." },
        { id: 2, title: "Commander au restaurant", level: "A2", description: "Commande un repas complet et gère les restrictions alimentaires." },
        { id: 3, title: "Enregistrement à l'aéroport", level: "B1", description: "Gère un souci de bagage et l'impression de la carte d'embarquement." },
    ]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch language data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!isSignedIn()) { setIsLoading(false); return; }

                const res = await apiFetch("/api/language");
                if (res.ok) {
                    const data = await res.json();
                    if (data.profiles?.length > 0) {
                        setProfile(data.profiles[0]);
                    }
                    if (data.progress?.length > 0) {
                        setFlashcards(data.progress.map((p: Record<string, unknown>) => ({
                            id: p.id as string,
                            front: (p.front as string) || (p.word as string) || "Card",
                            back: (p.back as string) || (p.translation as string) || "Translation",
                            mastery_level: (p.mastery_level as number) || 0,
                            next_review_at: (p.next_review_at as string) || new Date().toISOString(),
                        })));
                    }
                }
            } catch { /* ignore */ }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    // Fetch SRS cards for review
    const fetchReviewCards = useCallback(async () => {
        try {
            if (!isSignedIn()) return;

            const res = await apiFetch("/api/language", {
                method: "POST",
                body: JSON.stringify({ action: "srs_review" }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.cards?.length > 0) {
                    setFlashcards(data.cards.map((c: Record<string, unknown>) => ({
                        id: c.id as string,
                        front: (c.front as string) || (c.word as string) || "Card",
                        back: (c.back as string) || (c.translation as string) || "Translation",
                        mastery_level: (c.mastery_level as number) || 0,
                        next_review_at: (c.next_review_at as string) || new Date().toISOString(),
                    })));
                }
            }
        } catch { /* ignore */ }
    }, []);

    // Grade a card and advance. The three buttons used to be identical — they
    // just skipped forward, so the SM-2 backend (complete_review) that schedules
    // the next review was never called and spaced repetition did nothing. Each
    // button now sends its real quality score on the SM-2 scale (again=2,
    // good=4, easy=5) and the server persists the next review date.
    const gradeCard = useCallback(async (quality: number) => {
        const card = flashcards[currentCardIndex];
        setShowAnswer(false);
        setCurrentCardIndex(prev => prev + 1);
        if (!card) return;
        try {
            if (!isSignedIn()) return;
            await apiFetch("/api/language", {
                method: "POST",
                body: JSON.stringify({
                    action: "complete_review",
                    payload: { card_id: card.id, quality, current_level: card.mastery_level },
                }),
            });
        } catch { /* the card already advanced; scheduling is best-effort */ }
    }, [flashcards, currentCardIndex]);

    const dailyGoalProgress = profile.xp_points > 0 ? Math.min(100, Math.round((profile.xp_points / 1000) * 100)) : 0;

    // Components for Learning Modes
    const FlashcardMode = () => {
        if (flashcards.length === 0 || currentCardIndex >= flashcards.length) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)] rounded-full flex items-center justify-center mb-4">
                        <Star className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-[var(--text-0)]">Révision terminée !</h2>
                    <p className="text-[var(--text-2)] max-w-md">
                        {flashcards.length > 0 ? "Tu as révisé toutes tes cartes du jour. +50 XP" : "Aucune carte à réviser. Crée d'abord un profil de langue."}
                    </p>
                    <button onClick={() => { setLearningMode('idle'); fetchReviewCards(); }} className="btn-stitch rounded-full px-8 py-4 text-lg mt-6">
                        Retour au tableau de bord
                    </button>
                </div>
            );
        }

        const card = flashcards[currentCardIndex];

        return (
            <div className="max-w-2xl mx-auto py-10">
                <div className="flex justify-between items-center mb-8">
                    <button className="btn-ghost-glow" onClick={() => setLearningMode('idle')}>Retour</button>
                    <div className="text-sm font-medium text-[var(--text-3)]">
                        Carte {currentCardIndex + 1} sur {flashcards.length}
                    </div>
                    <div className="w-16" /> {/* Spacer */}
                </div>

                {/* A real <button>, not a <div onClick>: the review flow was
                    unreachable by keyboard and unannounced by screen readers.
                    A button brings focus, Enter/Space activation and semantics
                    for free. Disabled once revealed so it stops being a target. */}
                <button
                    type="button"
                    onClick={() => setShowAnswer(true)}
                    disabled={showAnswer}
                    aria-label={showAnswer ? `Réponse : ${card.back}` : `Révéler la réponse pour : ${card.front}`}
                    className="w-full text-left aspect-video glass-panel flex flex-col items-center justify-center p-8 cursor-pointer relative overflow-hidden group transition-all disabled:cursor-default focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
                >
                    <div className="absolute inset-0 bg-[var(--gradient-card-border)] opacity-0 group-hover:opacity-20 transition-opacity" aria-hidden="true" />
                    <span className="text-4xl font-bold mb-4 text-[var(--text-0)] text-glow">{card.front}</span>

                    {showAnswer ? (
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl text-[var(--accent-cyan)] font-medium"
                        >
                            {card.back}
                        </motion.span>
                    ) : (
                        <span className="text-[var(--text-3)] mt-4 text-sm uppercase font-mono-tech tracking-wider">Cliquer pour révéler</span>
                    )}
                </button>

                {showAnswer && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4 mt-8"
                    >
                        <button
                            className="flex-1 rounded-2xl py-6 border border-[var(--accent-rose)]/20 hover:bg-[var(--accent-rose)]/10 text-[var(--accent-rose)] transition-colors font-bold focus-visible:ring-2 focus-visible:ring-[var(--accent-rose)] focus-visible:outline-none"
                            onClick={() => gradeCard(2)}
                        >
                            Difficile
                        </button>
                        <button
                            className="flex-1 rounded-2xl py-6 border border-[var(--accent-amber)]/20 hover:bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] transition-colors font-bold focus-visible:ring-2 focus-visible:ring-[var(--accent-amber)] focus-visible:outline-none"
                            onClick={() => gradeCard(4)}
                        >
                            Correct
                        </button>
                        <button
                            className="flex-1 rounded-2xl py-6 border border-[var(--accent-emerald)]/20 hover:bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] transition-colors font-bold focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:outline-none"
                            onClick={() => gradeCard(5)}
                        >
                            Facile
                        </button>
                    </motion.div>
                )}
            </div>
        );
    };

    const RoleplayMode = () => (
        <div className="max-w-4xl mx-auto py-10 h-[70vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <button className="btn-ghost-glow" onClick={() => setLearningMode('idle')}>Terminer la session</button>
                <div className="text-sm font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Mise en situation : entretien d&apos;embauche
                </div>
                <span className="tag-cyber">Niveau B2</span>
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
                            That&apos;s great. What would you say was your biggest technical challenge in your last React project, and how did you overcome it?
                            <div className="mt-3 pt-3 border-t border-[var(--border-0)] text-xs text-[var(--text-2)] flex items-center gap-2">
                                <Star className="w-3 h-3 text-[var(--accent-amber)]" /> Grammar tip: Use &quot;What were&quot; if referring to multiple challenges, but &quot;What was&quot; is correct here. Good job on your vocabulary!
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border-0)] flex gap-4">
                    <input
                        title="Chat Input"
                        type="text"
                        placeholder="Écris ta réponse ou utilise la voix..."
                        className="input-sci-fi flex-1 rounded-full px-6 py-3"
                    />
                    <button title="Send" className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-[var(--primary)] hover:brightness-110 text-[var(--bg-0)] transition-all shadow-lg hover:shadow-[0_0_15px_rgba(143,245,255,0.3)]">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );

    // The profile and card counts come from Firestore. Without this the page
    // rendered "0 cartes à réviser" and "A1" during the fetch, then snapped to
    // the real values — indistinguishable from an empty account.
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 mt-16 max-w-6xl">
                <div className="h-12 w-64 rounded-xl bg-[var(--bg-2)] animate-pulse mb-3" />
                <div className="h-5 w-96 max-w-full rounded-lg bg-[var(--bg-2)] animate-pulse mb-12" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="glass-panel h-36 animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-panel h-52 animate-pulse" />
                    <div className="glass-panel h-52 animate-pulse" />
                </div>
                <span className="sr-only">Chargement de ton profil de langue…</span>
            </div>
        );
    }

    return (
        <div lang="fr" dir="ltr" className="container mx-auto px-4 py-8 mt-16 max-w-6xl min-h-screen">

            {learningMode === 'idle' && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-[var(--text-0)] font-display">Language Lab</h1>
                        <p className="text-[var(--text-3)] text-lg">Progresse dans une nouvelle langue avec JARVIS.</p>
                    </div>
                    <button onClick={() => setLearningMode('placement')} className="btn-ghost-glow border border-[var(--border-1)] rounded-full px-6 py-3 hover:bg-[var(--bg-3)]">
                        Test de niveau
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
                                    <div className="text-2xl font-bold text-[var(--text-0)]">{profile.target_language}</div>
                                    <div className="text-sm font-bold text-[var(--text-3)] uppercase tracking-wider mt-1">Langue</div>
                                </div>

                                <div className="glow-card">
                                    <div className="glass-panel p-6 flex flex-col items-center justify-center text-center h-full">
                                        <div className="text-4xl font-black text-gradient-shimmer mb-1">
                                            {profile.current_level}
                                        </div>
                                        <div className="text-sm font-bold text-[var(--text-3)] uppercase tracking-wider mt-1">Niveau actuel</div>
                                    </div>
                                </div>

                                <div className="glass-panel p-6 flex flex-col items-center justify-center text-center group">
                                    <div className="relative">
                                        <Flame className="w-8 h-8 text-[var(--accent-rose)] mb-3 group-hover:scale-110 transition-transform" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--tertiary)] rounded-full animate-pulse" />
                                    </div>
                                    <div className="text-2xl font-bold text-[var(--text-0)]">{profile.streak_days}</div>
                                    <div className="text-sm font-bold text-[var(--text-3)] uppercase tracking-wider mt-1">Jours d&apos;affilée</div>
                                </div>

                                <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
                                    <Award className="w-8 h-8 text-[var(--accent-amber)] mb-3" />
                                    <div className="text-2xl font-bold text-[var(--text-0)]">{profile.xp_points}</div>
                                    <div className="text-sm font-bold text-[var(--text-3)] uppercase tracking-wider mt-1">XP total</div>
                                </div>
                            </div>

                            {/* Tabs navigation */}
                            <div className="flex bg-[var(--bg-2)] border border-[var(--border-0)] p-1 rounded-xl w-fit mb-8 shadow-inner">
                                {[
                                    { key: 'flashcards', label: 'Cartes' },
                                    { key: 'roleplay', label: 'Dialogue' },
                                    { key: 'progress', label: 'Progrès' },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        aria-pressed={activeTab === tab.key}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold uppercase transition-all ${activeTab === tab.key ? 'bg-[var(--primary)] text-[var(--bg-0)] shadow-md' : 'text-[var(--text-2)] hover:text-[var(--text-1)]'}`}
                                    >
                                        {tab.label}
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
                                                    <h2 className="text-xl font-bold text-[var(--text-0)]">Révision du jour</h2>
                                                    <p className="text-[var(--text-3)] text-sm">Tu as {flashcards.length} cartes à réviser aujourd&apos;hui.</p>
                                                </div>
                                            </div>
                                            <div className="my-8">
                                                <div className="flex justify-between text-sm mb-3">
                                                    <span className="text-[var(--text-2)] font-semibold uppercase">Objectif du jour</span>
                                                    <span className="font-bold text-[var(--accent-emerald)]">{dailyGoalProgress}%</span>
                                                </div>
                                                <div className="h-2 bg-[var(--bg-3)] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[var(--accent-emerald)] rounded-full" style={{ width: `${dailyGoalProgress}%` }} />
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
                                                Démarrer la révision
                                            </button>
                                        </div>
                                    </div>

                                    <div className="glass-panel p-8">
                                        <h2 className="text-xl font-bold text-[var(--text-0)] mb-6">Cartes récentes</h2>
                                        <div className="space-y-4">
                                            {flashcards.slice(0, 3).map(card => (
                                                <div key={card.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-2)] border border-[var(--border-0)] hover:border-[var(--border-1)] transition-colors">
                                                    <span className="font-medium text-[var(--text-1)]">{card.front}</span>
                                                    <span className="text-xs font-mono-tech text-[var(--text-3)] px-3 py-1 bg-[var(--bg-3)] rounded-lg">{card.next_review_at ? new Date(card.next_review_at).toLocaleDateString("fr-FR") : "—"}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'roleplay' && (
                                <div className="grid md:grid-cols-3 gap-6">
                                    {scenarios.map(scenario => (
                                        <div
                                            key={scenario.id}
                                            className="glass-panel p-6 flex flex-col justify-between cursor-pointer group hover:border-[var(--primary)] hover:shadow-[0_0_20px_rgba(143,245,255,0.08)] transition-all min-h-[220px]"
                                            onClick={() => setLearningMode('roleplay')}
                                        >
                                            <div>
                                                <div className="flex justify-between items-start mb-5">
                                                    <div className="p-3 bg-[var(--bg-3)] rounded-2xl group-hover:bg-[var(--primary)]/20 transition-colors">
                                                        <span className="text-[var(--accent-cyan)]"><MessageSquare className="w-5 h-5" /></span>
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
                        FlashcardMode()
                    ) : learningMode === 'roleplay' ? (
                        RoleplayMode()
                    ) : (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center glass-panel p-12 max-w-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-[var(--gradient-blue-purple)] opacity-10" />
                                <h2 className="text-3xl font-extrabold text-[var(--text-0)] mb-4">Test de niveau</h2>
                                <p className="text-[var(--text-2)] mb-10 text-lg leading-relaxed">Passe un test adaptatif de 10 minutes pour situer précisément ton niveau de langue.</p>
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
