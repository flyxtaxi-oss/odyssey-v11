'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch, isSignedIn } from "@/lib/api-client";
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Target,
    Compass,
    Plus,
    CheckCircle2,
    Star,
    BrainCircuit,
    Award
} from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";

type SkillTrack = {
    id: string;
    skill_name: string;
    current_level: string;
    progress_percentage: number;
};

type Mission = {
    id: string;
    skill_track_id: string;
    mission_title: string;
    description: string;
    difficulty: string;
    xp_reward: number;
    is_completed: boolean;
};

export default function SkillAccelerator() {
    const { user } = useAuth();
    const [tracks, setTracks] = useState<SkillTrack[]>([]);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSkillName, setNewSkillName] = useState('');
    const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!isSignedIn()) {
            setTracks([]);
            setMissions([]);
            setLoading(false);
            return;
        }

        try {
            // No ?userId= — the server reads the uid from the token. Passing it
            // in the URL was how anyone could read anyone else's tracks.
            const res = await apiFetch('/api/skills');
            if (!res.ok) return;
            const data = await res.json();
            if (data.tracks) setTracks(data.tracks);
            if (data.missions) setMissions(data.missions);
            if (data.tracks?.length > 0) {
                setSelectedTrack((prev) => prev ?? data.tracks[0].id);
            }
        } catch (error) {
            console.error('Error fetching skills data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Depends on `user`: this ran once on mount, before Firebase had resolved
    // the session, and never re-ran — so a signed-in user saw an empty page.
    useEffect(() => {
        fetchData();
    }, [fetchData, user]);

    const currentTrackMissions = missions.filter(m => m.skill_track_id === selectedTrack);

    const handleCreateTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSkillName.trim()) return;

        if (!isSignedIn()) return;

        try {
            const res = await apiFetch('/api/skills', {
                method: 'POST',
                // No user_id in the body: the server takes it from the token and
                // ignores anything sent here.
                body: JSON.stringify({
                    action: 'create_track',
                    skill_name: newSkillName.trim()
                })
            });
            if (res.ok) {
                setNewSkillName('');
                fetchData();
            }
        } catch (error) {
            console.error('Error creating track:', error);
        }
    };

    const handleCompleteMission = async (missionId: string) => {
        if (!isSignedIn()) return;

        try {
            // Optimistic update
            setMissions(missions.map(m => m.id === missionId ? { ...m, is_completed: true } : m));

            const res = await apiFetch('/api/skills', {
                method: 'POST',
                body: JSON.stringify({
                    // "complete_mission" was silently rejected: the API's zod
                    // schema only accepts "update_mission", so every completion
                    // failed validation and reverted.
                    action: 'update_mission',
                    mission_id: missionId,
                    is_completed: true
                })
            });

            if (res.ok) {
                const result = await res.json();
                // Update track progress
                setTracks(tracks.map(t => {
                    if (t.id === selectedTrack) {
                        return { ...t, progress_percentage: result.newProgress, current_level: result.newLevel };
                    }
                    return t;
                }));
            } else {
                // Revert if failed
                fetchData();
            }
        } catch (error) {
            console.error('Error completing mission:', error);
            fetchData();
        }
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff.toLowerCase()) {
            case 'beginner': return 'text-[var(--accent-emerald)] bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/20';
            case 'intermediate': return 'text-[var(--accent-amber)] bg-yellow-400/10 border-yellow-500/20';
            case 'advanced': return 'text-[var(--accent-rose)] bg-[var(--accent-rose)]/10 border-[var(--accent-rose)]/20';
            default: return 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/20';
        }
    };

    if (loading) {
        return (
            <div
                lang="fr" dir="ltr" className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--tertiary)]">
                            Accélérateur de compétences
                        </h1>
                        <p className="text-[var(--text-2)] mt-2 text-lg">Progresse sur une compétence à travers des missions guidées.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-[var(--accent-amber)]" />
                            <div>
                                <p className="text-xs text-[var(--text-3)] uppercase font-semibold tracking-wider">XP gagnés</p>
                                <p className="text-xl font-bold">
                                    {missions.filter(m => m.is_completed).reduce((sum, m) => sum + m.xp_reward, 0)} XP
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create new track */}
                <div className="glass-panel p-6 rounded-2xl">
                    <form onSubmit={handleCreateTrack} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-[var(--text-2)] mb-2">
                                Quelle compétence veux-tu développer ?
                            </label>
                            <input
                                type="text"
                                value={newSkillName}
                                onChange={(e) => setNewSkillName(e.target.value)}
                                placeholder="Ex : négociation, arabe dialectal, comptabilité…"
                                className="w-full bg-[var(--bg-2)] border border-[var(--border-1)] rounded-xl px-4 py-3 text-[var(--text-0)] placeholder:text-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newSkillName.trim()}
                            className="flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:opacity-90 px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-5 h-5" />
                            Ajouter
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Skill Tracks Sidebar */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                            <BrainCircuit className="w-5 h-5 text-[var(--primary)]" />
                            Mes parcours
                        </h2>

                        {tracks.length === 0 ? (
                            <div className="text-center p-8 bg-[var(--bg-1)] border border-[var(--border-1)] rounded-2xl text-[var(--text-3)]">
                                Aucun parcours pour le moment. Ajoute une compétence ci-dessus.
                            </div>
                        ) : (
                            tracks.map(track => (
                                <motion.div
                                    key={track.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedTrack(track.id)}
                                    className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${selectedTrack === track.id
                                        ? 'bg-[var(--primary)]/10 border-[var(--primary)]/50 relative overflow-hidden'
                                        : 'bg-[var(--bg-1)] border-[var(--border-1)] hover:bg-[var(--bg-2)]'
                                        }`}
                                >
                                    {selectedTrack === track.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 to-transparent pointer-events-none" />
                                    )}
                                    <h3 className="font-semibold text-lg">{track.skill_name}</h3>
                                    <div className="flex justify-between items-center mt-2 text-sm text-[var(--text-2)]">
                                        <span>{track.current_level}</span>
                                        <span>{Math.round(track.progress_percentage)}%</span>
                                    </div>
                                    <div className="mt-3 h-1.5 bg-[var(--bg-3)] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${track.progress_percentage}%` }}
                                            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full"
                                        />
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Missions Area */}
                    <div className="lg:col-span-2">
                        {selectedTrack ? (
                            <div className="glass-panel p-8 rounded-3xl min-h-[500px]">
                                <h2 className="text-2xl font-semibold flex items-center gap-3 mb-8">
                                    <Target className="w-6 h-6 text-[var(--tertiary)]" />
                                    Missions en cours
                                </h2>

                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {currentTrackMissions.filter(m => !m.is_completed).length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-center p-12 text-[var(--text-3)] bg-[var(--bg-1)] rounded-2xl border border-[var(--border-0)] flex flex-col items-center gap-4"
                                            >
                                                <Award className="w-12 h-12 text-[var(--text-0)]/20" />
                                                <p>Toutes les missions de ce parcours sont terminées.</p>
                                            </motion.div>
                                        ) : (
                                            currentTrackMissions.filter(m => !m.is_completed).map((mission) => (
                                                <motion.div
                                                    key={mission.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="p-6 bg-[var(--bg-2)] border border-[var(--border-1)] rounded-2xl hover:border-[var(--border-2)] transition-colors group"
                                                >
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getDifficultyColor(mission.difficulty)}`}>
                                                                    {mission.difficulty}
                                                                </span>
                                                                <span className="flex items-center gap-1 text-[var(--accent-amber)] text-sm font-medium bg-yellow-400/10 px-2 py-0.5 rounded-full">
                                                                    <Star className="w-3.5 h-3.5" />
                                                                    {mission.xp_reward} XP
                                                                </span>
                                                            </div>
                                                            <h3 className="text-xl font-medium text-[var(--text-0)]/90">{mission.mission_title}</h3>
                                                            <p className="text-[var(--text-2)] mt-2 line-clamp-2">{mission.description}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCompleteMission(mission.id)}
                                                            className="w-12 h-12 rounded-full bg-[var(--bg-1)] border border-[var(--border-1)] flex items-center justify-center text-[var(--text-3)] hover:bg-[var(--accent-emerald)]/20 hover:text-[var(--accent-emerald)] hover:border-[var(--accent-emerald)]/50 transition-all duration-300 flex-shrink-0"
                                                            title="Marquer comme terminée"
                                                            aria-label={`Marquer « ${mission.mission_title} » comme terminée`}
                                                        >
                                                            <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </div>

                                {currentTrackMissions.filter(m => m.is_completed).length > 0 && (
                                    <div className="mt-12 pt-8 border-t border-[var(--border-1)]">
                                        <h3 className="text-lg font-medium text-[var(--text-3)] mb-4 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" />
                                            Completed Missions
                                        </h3>
                                        <div className="space-y-3">
                                            {currentTrackMissions.filter(m => m.is_completed).map(mission => (
                                                <div key={mission.id} className="p-4 bg-[var(--bg-1)] border border-[var(--border-0)] rounded-xl flex justify-between items-center opacity-70">
                                                    <span className="text-[var(--text-0)]/80 line-through decoration-white/30">{mission.mission_title}</span>
                                                    <span className="text-[var(--accent-amber)]/80 text-sm font-medium">+{mission.xp_reward} XP</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="glass-panel p-8 rounded-3xl min-h-[500px] flex items-center justify-center text-[var(--text-3)]">
                                <div className="text-center">
                                    <Compass className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-xl font-medium mb-2">Choisis un parcours</p>
                                    <p className="text-sm">Sélectionne un parcours à gauche pour voir ses missions.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
