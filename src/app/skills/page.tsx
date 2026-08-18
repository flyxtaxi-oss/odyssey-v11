"use client";

import React, { useState, useEffect, useMemo } from "react";
import { apiFetch, isSignedIn } from "@/lib/api-client";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type SkillTrack = {
  id: string;
  skill_name: string;
  current_level: string;
  progress_percentage: number;
  icon?: string;
  category?: string;
};

type Mission = {
  id: string;
  skill_track_id: string;
  mission_title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  xp_reward: number;
  is_completed: boolean;
};

const STARTER_TRACKS: SkillTrack[] = [
  {
    id: "track-tax",
    skill_name: "Fiscalité & Résidence Internationale",
    current_level: "Niveau 2 • Stratege",
    progress_percentage: 65,
    category: "Finance & Légal",
  },
  {
    id: "track-reloc",
    skill_name: "Logistique & Installation Nomade",
    current_level: "Niveau 3 • Expert",
    progress_percentage: 80,
    category: "Installation",
  },
  {
    id: "track-net",
    skill_name: "Networking & Intégration Locale",
    current_level: "Niveau 1 • Apprenti",
    progress_percentage: 35,
    category: "Social",
  },
  {
    id: "track-security",
    skill_name: "Sécurité & Prévoyance Santé",
    current_level: "Niveau 2 • Opérateur",
    progress_percentage: 50,
    category: "Santé",
  },
];

const STARTER_MISSIONS: Mission[] = [
  {
    id: "m-1",
    skill_track_id: "track-tax",
    mission_title: "Maîtriser la règle des 183 jours et le centre des intérêts économiques",
    description: "Comprendre les critères de rattachement fiscal selon l'article 4B du CGI français et les conventions bilatérales.",
    difficulty: "beginner",
    xp_reward: 50,
    is_completed: true,
  },
  {
    id: "m-2",
    skill_track_id: "track-tax",
    mission_title: "Comparer 3 régimes fiscaux pour nomades (NHR, Beckham, Dubaï 0%)",
    description: "Effectuer une simulation complète de charges et impôts avec le simulateur Odyssey.",
    difficulty: "intermediate",
    xp_reward: 100,
    is_completed: true,
  },
  {
    id: "m-3",
    skill_track_id: "track-tax",
    mission_title: "Mettre en place une structure de facturation transfrontalière",
    description: "Valider l'éligibilité de sa société avec un fiscaliste ou un conseiller qualifié.",
    difficulty: "advanced",
    xp_reward: 150,
    is_completed: false,
  },
  {
    id: "m-4",
    skill_track_id: "track-reloc",
    mission_title: "Ouvrir un compte bancaire multi-devises (Wise / Revolut Pro)",
    description: "Configurer les cartes virtuelles, IBAN locaux et transferts sans frais cachés.",
    difficulty: "beginner",
    xp_reward: 50,
    is_completed: true,
  },
  {
    id: "m-5",
    skill_track_id: "track-reloc",
    mission_title: "Boucler la résiliation des baux et contrats français",
    description: "Envoyer les préavis conformes avec justificatif d'expatriation ou mutation.",
    difficulty: "intermediate",
    xp_reward: 100,
    is_completed: true,
  },
  {
    id: "m-6",
    skill_track_id: "track-reloc",
    mission_title: "Valider l'hébergement du 1er mois et pass coworking",
    description: "Sécuriser un bail temporaire et tester la vitesse internet (>100 Mbps).",
    difficulty: "intermediate",
    xp_reward: 100,
    is_completed: false,
  },
  {
    id: "m-7",
    skill_track_id: "track-net",
    mission_title: "Rejoindre 2 hubs locaux d'expatriés et nomades",
    description: "Participer à un premier meetup ou événement de networking sur place.",
    difficulty: "beginner",
    xp_reward: 50,
    is_completed: false,
  },
  {
    id: "m-8",
    skill_track_id: "track-security",
    mission_title: "Souscrire une assurance santé internationale au 1er euro ou CFE",
    description: "Vérifier le rapatriement, l'hospitalisation et la couverture mondiale.",
    difficulty: "intermediate",
    xp_reward: 100,
    is_completed: true,
  },
];

export default function SkillAccelerator() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<SkillTrack[]>(STARTER_TRACKS);
  const [missions, setMissions] = useState<Mission[]>(STARTER_MISSIONS);
  const [selectedTrack, setSelectedTrack] = useState<string>("track-tax");
  const [newSkillName, setNewSkillName] = useState("");

  useEffect(() => {
    if (!isSignedIn()) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/skills");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          if (data.tracks?.length > 0) {
            setTracks(data.tracks);
            setSelectedTrack(data.tracks[0].id);
          }
          if (data.missions?.length > 0) {
            setMissions(data.missions);
          }
        }
      } catch (error) {
        console.error("Error fetching skills data:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const currentTrack = useMemo(
    () => tracks.find((t) => t.id === selectedTrack) || tracks[0],
    [tracks, selectedTrack]
  );

  const currentMissions = useMemo(
    () => missions.filter((m) => m.skill_track_id === selectedTrack),
    [missions, selectedTrack]
  );

  const totalXP = useMemo(
    () => missions.filter((m) => m.is_completed).reduce((sum, m) => sum + m.xp_reward, 0),
    [missions]
  );

  const handleToggleMission = async (missionId: string) => {
    const target = missions.find((m) => m.id === missionId);
    if (!target) return;

    const nextState = !target.is_completed;
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, is_completed: nextState } : m))
    );

    // Update track percentage
    const trackMissions = missions.map((m) =>
      m.id === missionId ? { ...m, is_completed: nextState } : m
    ).filter((m) => m.skill_track_id === selectedTrack);

    const completed = trackMissions.filter((m) => m.is_completed).length;
    const pct = trackMissions.length ? Math.round((completed / trackMissions.length) * 100) : 0;

    setTracks((prev) =>
      prev.map((t) => (t.id === selectedTrack ? { ...t, progress_percentage: pct } : t))
    );

    if (isSignedIn()) {
      try {
        await apiFetch("/api/skills", {
          method: "POST",
          body: JSON.stringify({
            action: "update_mission",
            mission_id: missionId,
            is_completed: nextState,
          }),
        });
      } catch {
        /* optimistic */
      }
    }
  };

  const handleCreateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newId = `track-${Date.now()}`;
    const newTrack: SkillTrack = {
      id: newId,
      skill_name: newSkillName.trim(),
      current_level: "Niveau 1 • Apprenti",
      progress_percentage: 0,
      category: "Personnel",
    };

    setTracks((prev) => [...prev, newTrack]);
    setSelectedTrack(newId);
    setNewSkillName("");

    if (isSignedIn()) {
      try {
        await apiFetch("/api/skills", {
          method: "POST",
          body: JSON.stringify({
            action: "create_track",
            skill_name: newSkillName.trim(),
          }),
        });
      } catch {
        /* optimistic */
      }
    }
  };

  return (
    <motion.div
      lang="fr"
      dir="ltr"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto w-full pt-4 pb-20 space-y-10"
    >
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-0)]">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/15"
            style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}
          >
            <Target className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold font-display text-[var(--text-0)] tracking-tight">
                Accélérateur de Compétences & Quêtes
              </h1>
              <span className="text-xs uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400">
                SKILL TREE
              </span>
            </div>
            <p className="text-sm text-[var(--text-2)] mt-1 font-medium">
              Progression par paliers vers l&apos;autonomie internationale complète.
            </p>
          </div>
        </div>

        {/* XP Badge */}
        <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-3 border border-[var(--border-1)] shrink-0">
          <Trophy className="w-6 h-6 text-amber-400" />
          <div>
            <p className="text-[10px] uppercase font-mono font-bold text-[var(--text-3)]">Capital XP</p>
            <p className="text-xl font-extrabold text-[var(--text-0)] font-mono">{totalXP} XP</p>
          </div>
        </div>
      </div>

      {/* ─── Main Two-Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Tracks Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase text-[var(--text-2)] font-mono">
              Filières d&apos;Excellence ({tracks.length})
            </h2>
          </div>

          <div className="space-y-3">
            {tracks.map((t) => {
              const isSelected = t.id === selectedTrack;
              return (
                <motion.div
                  key={t.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedTrack(t.id)}
                  className={`p-5 rounded-2xl cursor-pointer border transition-all ${
                    isSelected
                      ? "bg-[var(--bg-2)] border-[var(--primary)] shadow-lg shadow-[var(--primary)]/10"
                      : "bg-[var(--bg-1)] border-[var(--border-1)] hover:border-[var(--border-2)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--bg-3)] text-[var(--text-2)]">
                      {t.category || "Filière"}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-[var(--primary)]">
                      {t.progress_percentage}%
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[var(--text-0)] font-display">{t.skill_name}</h3>
                  <p className="text-xs text-[var(--text-3)] mt-1">{t.current_level}</p>

                  <div className="w-full h-2 rounded-full bg-[var(--bg-3)] mt-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all duration-500"
                      style={{ width: `${t.progress_percentage}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Add custom track */}
          <form onSubmit={handleCreateTrack} className="pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Nouvelle filière..."
                className="flex-1 bg-[var(--bg-1)] border border-[var(--border-1)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-0)] outline-none"
              />
              <button
                type="submit"
                disabled={!newSkillName.trim()}
                className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dim)] text-black font-bold text-xs disabled:opacity-40"
              >
                +
              </button>
            </div>
          </form>
        </div>

        {/* Right: Missions in Selected Track */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-[var(--border-1)] space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-[var(--border-0)]">
              <div>
                <span className="text-xs uppercase font-mono font-bold text-[var(--primary)]">
                  Missions de la filière
                </span>
                <h2 className="text-2xl font-extrabold text-[var(--text-0)] font-display mt-0.5">
                  {currentTrack.skill_name}
                </h2>
                <p className="text-xs text-[var(--text-3)] mt-1">{currentTrack.current_level}</p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black text-gradient-primary font-mono">
                  {currentTrack.progress_percentage}%
                </span>
                <p className="text-[10px] text-[var(--text-3)] uppercase font-mono">Complété</p>
              </div>
            </div>

            {/* Missions List */}
            <div className="space-y-3">
              {currentMissions.length === 0 ? (
                <div className="text-center py-10 text-sm text-[var(--text-3)]">
                  Aucune mission définie dans cette filière.
                </div>
              ) : (
                currentMissions.map((m) => (
                  <motion.div
                    key={m.id}
                    whileHover={{ scale: 1.005 }}
                    onClick={() => handleToggleMission(m.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                      m.is_completed
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : "bg-[var(--bg-1)] border-[var(--border-1)] hover:border-[var(--primary)]/40"
                    }`}
                  >
                    <div className="pt-0.5">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          m.is_completed
                            ? "bg-emerald-500 text-black font-bold"
                            : "border-2 border-[var(--border-2)] text-transparent"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h4
                          className={`text-sm font-bold ${
                            m.is_completed
                              ? "text-emerald-300 line-through decoration-emerald-500/50"
                              : "text-[var(--text-0)]"
                          }`}
                        >
                          {m.mission_title}
                        </h4>
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md shrink-0">
                          +{m.xp_reward} XP
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-2)] mt-1.5 leading-relaxed">{m.description}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
