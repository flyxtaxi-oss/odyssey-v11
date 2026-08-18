"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Globe,
  Flame,
  Award,
  ArrowRight,
  Volume2,
  CheckCircle2,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
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
  category?: string;
  mastery_level: number;
  next_review_at: string;
};

type Scenario = {
  id: number;
  title: string;
  level: string;
  category: string;
  description: string;
};

const STARTER_FLASHCARDS: Flashcard[] = [
  { id: "1", front: "Tax residency", back: "Résidence fiscale", category: "Finance", mastery_level: 1, next_review_at: "" },
  { id: "2", front: "Digital nomad visa", back: "Visa travailleur nomade", category: "Visa", mastery_level: 2, next_review_at: "" },
  { id: "3", front: "Proof of income", back: "Justificatif de revenus", category: "Admin", mastery_level: 1, next_review_at: "" },
  { id: "4", front: "Health insurance coverage", back: "Couverture d'assurance santé", category: "Santé", mastery_level: 3, next_review_at: "" },
  { id: "5", front: "Coworking space day pass", back: "Pass journée espace de coworking", category: "Nomade", mastery_level: 2, next_review_at: "" },
  { id: "6", front: "Double taxation treaty", back: "Convention de non-double imposition", category: "Fiscalité", mastery_level: 1, next_review_at: "" },
  { id: "7", front: "Lease agreement / rental contract", back: "Contrat de bail / location", category: "Logement", mastery_level: 2, next_review_at: "" },
];

export default function LanguageLabPage() {
  const [learningMode, setLearningMode] = useState<"idle" | "flashcards">("idle");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("Anglais (Expat Business)");

  const [profile, setProfile] = useState<LanguageProfile>({
    id: "",
    target_language: "Anglais",
    native_language: "Français",
    current_level: "B2",
    streak_days: 14,
    xp_points: 620,
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(STARTER_FLASHCARDS);
  const [scenarios] = useState<Scenario[]>([
    {
      id: 1,
      title: "Entretien d'embauche Tech Remote",
      level: "B2",
      category: "Carrière",
      description: "Simule un entretien avec un recruteur international pour un poste à distance.",
    },
    {
      id: 2,
      title: "Négociation de bail & Appartement",
      level: "A2",
      category: "Installation",
      description: "Échange avec un propriétaire anglophone : caution, durée, internet et charges incluses.",
    },
    {
      id: 3,
      title: "Rendez-vous immigration & Visa",
      level: "B1",
      category: "Administration",
      description: "Présente ton dossier nomade et réponds aux questions des agents consulaires.",
    },
  ]);

  // Fetch language data from API if signed in
  useEffect(() => {
    if (!isSignedIn()) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/language");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          if (data.profiles?.length > 0) {
            setProfile(data.profiles[0]);
          }
          if (data.progress?.length > 0) {
            setFlashcards((prev) => [
              ...data.progress.map((p: Record<string, unknown>) => ({
                id: p.id as string,
                front: (p.front as string) || (p.word as string) || "Card",
                back: (p.back as string) || (p.translation as string) || "Translation",
                mastery_level: (p.mastery_level as number) || 0,
                next_review_at: (p.next_review_at as string) || "",
              })),
              ...prev,
            ]);
          }
        }
      } catch {
        /* fallback to starters */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const speak = (text: string, lang = "en-US") => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  const gradeCard = useCallback(
    async (quality: number) => {
      const card = flashcards[currentCardIndex];
      setShowAnswer(false);
      setCurrentCardIndex((prev) => prev + 1);

      // Add XP bonus locally
      setProfile((p) => ({ ...p, xp_points: p.xp_points + quality * 5 }));

      if (!card || !isSignedIn()) return;
      try {
        await apiFetch("/api/language", {
          method: "POST",
          body: JSON.stringify({
            action: "complete_review",
            payload: { card_id: card.id, quality, current_level: card.mastery_level },
          }),
        });
      } catch {
        /* best effort */
      }
    },
    [flashcards, currentCardIndex]
  );

  const currentCard = flashcards[currentCardIndex];

  return (
    <div lang="fr" dir="ltr" className="max-w-6xl mx-auto w-full pt-4 pb-20 space-y-10">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-0)]">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-cyan-500/15"
            style={{ background: "linear-gradient(135deg, #0EA5E9, #2563EB)" }}
          >
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold font-display text-[var(--text-0)] tracking-tight">
                Language Lab & SRS
              </h1>
              <span className="text-xs uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)]">
                Expat Vocab
              </span>
            </div>
            <p className="text-sm text-[var(--text-2)] mt-1 font-medium">
              Système de répétition espacée (SM-2) et mises en situation réelles pour nomades et expats.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-[var(--bg-1)] border border-[var(--border-1)] rounded-2xl px-4 py-2.5 text-xs font-bold text-[var(--text-0)] outline-none"
          >
            <option value="Anglais (Expat Business)">🇺🇸 Anglais (Expat Business)</option>
            <option value="Espagnol (Nomade)">🇪🇸 Espagnol (Nomade)</option>
            <option value="Portugais (Installation)">🇵🇹 Portugais (Installation)</option>
            <option value="Darija / Arabe Marocain">🇲🇦 Darija / Arabe Marocain</option>
          </select>
        </div>
      </div>

      {/* ─── Gamification & Stats Grid ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <Globe className="w-6 h-6 text-[var(--primary)] mb-2" />
          <div className="text-xl font-extrabold text-[var(--text-0)] font-display">{profile.target_language}</div>
          <div className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider mt-0.5">Langue Active</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center border-2 border-[var(--primary)]/30">
          <span className="text-2xl font-black text-gradient-primary font-mono">{profile.current_level}</span>
          <div className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider mt-0.5">Niveau Actuel</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-orange-400 mb-1">
            <Flame className="w-6 h-6 fill-orange-400" />
            <span className="text-xl font-black font-mono">{profile.streak_days}</span>
          </div>
          <div className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider">Jours de Streak</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-amber-400 mb-1">
            <Award className="w-6 h-6" />
            <span className="text-xl font-black font-mono">{profile.xp_points} XP</span>
          </div>
          <div className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider">Points d&apos;Expérience</div>
        </div>
      </div>

      {/* ─── Flashcards Training Mode ─── */}
      {learningMode === "flashcards" ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setLearningMode("idle");
                setCurrentCardIndex(0);
                setShowAnswer(false);
              }}
              className="text-xs font-bold text-[var(--text-2)] hover:text-[var(--text-0)] flex items-center gap-1"
            >
              ← Quitter la session
            </button>
            <span className="text-xs font-mono font-bold text-[var(--primary)]">
              Carte {Math.min(flashcards.length, currentCardIndex + 1)} / {flashcards.length}
            </span>
          </div>

          {currentCardIndex >= flashcards.length ? (
            <div className="glass-panel p-10 rounded-3xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-0)] font-display">Session terminée avec succès !</h2>
              <p className="text-sm text-[var(--text-2)] max-w-md mx-auto">
                Toutes les cartes du paquet ont été révisées. Vous avez gagné +35 XP.
              </p>
              <button
                onClick={() => {
                  setLearningMode("idle");
                  setCurrentCardIndex(0);
                  setShowAnswer(false);
                }}
                className="btn-stitch px-8 py-3 rounded-2xl font-bold text-sm"
              >
                Retour au tableau de bord
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Interactive Flashcard with Flip */}
              <div
                onClick={() => setShowAnswer((v) => !v)}
                className="glass-panel p-12 rounded-[28px] border-2 border-[var(--border-1)] hover:border-[var(--primary)]/50 transition-all cursor-pointer min-h-[260px] flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl group"
              >
                <div className="absolute top-4 left-4 text-[10px] uppercase font-mono font-bold text-[var(--text-3)] px-2.5 py-1 rounded-md bg-[var(--bg-2)]">
                  {currentCard?.category || "Vocabulaire"}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentCard.front);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--bg-2)] hover:bg-[var(--bg-3)] text-[var(--text-2)] hover:text-[var(--primary)] transition-colors"
                  title="Écouter la prononciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <p className="text-3xl sm:text-4xl font-extrabold text-[var(--text-0)] font-display tracking-tight mb-4">
                  {currentCard?.front}
                </p>

                {showAnswer ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-4 border-t border-[var(--border-0)] w-full text-center"
                  >
                    <p className="text-2xl font-bold text-[var(--primary)] font-display">{currentCard?.back}</p>
                  </motion.div>
                ) : (
                  <span className="text-xs font-mono uppercase text-[var(--text-3)] tracking-widest mt-4">
                    Cliquez pour révéler la traduction
                  </span>
                )}
              </div>

              {/* Quality Grading Buttons (SM-2 SRS) */}
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-3 gap-3"
                >
                  <button
                    onClick={() => gradeCard(2)}
                    className="py-4 px-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs transition-all"
                  >
                    Difficile (+10 XP)
                  </button>
                  <button
                    onClick={() => gradeCard(4)}
                    className="py-4 px-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs transition-all"
                  >
                    Correct (+20 XP)
                  </button>
                  <button
                    onClick={() => gradeCard(5)}
                    className="py-4 px-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all"
                  >
                    Parfait (+25 XP)
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ─── Idle Dashboard Modules ─── */
        <div className="space-y-8">
          {/* Main Flashcard Deck Callout */}
          <div className="glass-panel p-8 rounded-[28px] border-2 border-[var(--primary)]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-xs uppercase font-mono font-bold text-[var(--primary)]">
                Répétition Espacée Quotidienne
              </span>
              <h2 className="text-2xl font-extrabold text-[var(--text-0)] font-display">
                Deck Expatriation & Nomade ({flashcards.length} cartes)
              </h2>
              <p className="text-sm text-[var(--text-2)] max-w-xl">
                Entraînez-vous avec les termes essentiels : baux, conventions fiscales, visas, banque et négociation.
              </p>
            </div>

            <button
              onClick={() => {
                setLearningMode("flashcards");
                setCurrentCardIndex(0);
                setShowAnswer(false);
              }}
              className="btn-stitch px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-[var(--primary)]/20 shrink-0"
            >
              Lancer la session express →
            </button>
          </div>

          {/* Real-world scenarios */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[var(--text-0)] font-display flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
                <span>Mises en Situation Réelles (Roleplay IA)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {scenarios.map((s) => (
                <div
                  key={s.id}
                  className="glass-panel p-6 rounded-2xl border border-[var(--border-1)] flex flex-col justify-between space-y-4 hover:border-[var(--primary)]/40 transition-colors group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--bg-2)] text-[var(--primary)]">
                        {s.category}
                      </span>
                      <span className="text-xs font-bold text-emerald-400">{s.level}</span>
                    </div>
                    <h4 className="text-base font-bold text-[var(--text-0)] font-display group-hover:text-[var(--primary)] transition-colors">
                      {s.title}
                    </h4>
                    <p className="text-xs text-[var(--text-2)] mt-2 leading-relaxed">{s.description}</p>
                  </div>

                  <button
                    onClick={() => {
                      setLearningMode("flashcards");
                      setCurrentCardIndex(0);
                    }}
                    className="flex items-center justify-between text-xs font-bold text-[var(--primary)] pt-3 border-t border-[var(--border-0)]"
                  >
                    <span>Démarrer le scénario</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
