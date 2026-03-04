'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Target,
    Compass,
    Plus,
    CheckCircle2,
    Star,
    ArrowRight,
    TrendingUp,
    BrainCircuit,
    Award
} from 'lucide-react';

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

const USER_ID = 'test-user-id'; // Using same placeholder as language lab

export default function SkillAccelerator() {
    const [tracks, setTracks] = useState<SkillTrack[]>([]);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSkillName, setNewSkillName] = useState('');
    const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/skills?userId=${USER_ID}`);
            const data = await res.json();
            if (data.tracks) setTracks(data.tracks);
            if (data.missions) setMissions(data.missions);
            if (data.tracks && data.tracks.length > 0 && !selectedTrack) {
                setSelectedTrack(data.tracks[0].id);
            }
        } catch (error) {
            console.error('Error fetching skills data:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentTrackMissions = missions.filter(m => m.skill_track_id === selectedTrack);

    const handleCreateTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSkillName.trim()) return;

        try {
            const res = await fetch('/api/skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_track',
                    user_id: USER_ID,
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
        try {
            // Optimistic update
            setMissions(missions.map(m => m.id === missionId ? { ...m, is_completed: true } : m));

            const res = await fetch('/api/skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'complete_mission',
                    mission_id: missionId
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
            case 'beginner': return 'text-green-400 bg-green-400/10 border-green-500/20';
            case 'intermediate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20';
            case 'advanced': return 'text-red-400 bg-red-400/10 border-red-500/20';
            default: return 'text-blue-400 bg-blue-400/10 border-blue-500/20';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070B19] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070B19] text-white p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                            Skill Accelerator
                        </h1>
                        <p className="text-white/60 mt-2 text-lg">Master new capabilities through guided missions.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <div>
                                <p className="text-xs text-white/50 uppercase font-semibold tracking-wider">Total XP Earned</p>
                                <p className="text-xl font-bold">
                                    {missions.filter(m => m.is_completed).reduce((sum, m) => sum + m.xp_reward, 0)} XP
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create new track */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
                    <form onSubmit={handleCreateTrack} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                What do you want to learn next?
                            </label>
                            <input
                                type="text"
                                value={newSkillName}
                                onChange={(e) => setNewSkillName(e.target.value)}
                                placeholder="e.g. Machine Learning, Public Speaking, React Native..."
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newSkillName.trim()}
                            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-5 h-5" />
                            Add Skill
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Skill Tracks Sidebar */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                            <BrainCircuit className="w-5 h-5 text-indigo-400" />
                            Active Tracks
                        </h2>

                        {tracks.length === 0 ? (
                            <div className="text-center p-8 bg-white/5 border border-white/10 rounded-2xl text-white/50">
                                No skills tracked yet. Start tracking above!
                            </div>
                        ) : (
                            tracks.map(track => (
                                <motion.div
                                    key={track.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedTrack(track.id)}
                                    className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${selectedTrack === track.id
                                        ? 'bg-indigo-500/10 border-indigo-500/50 relative overflow-hidden'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {selectedTrack === track.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
                                    )}
                                    <h3 className="font-semibold text-lg">{track.skill_name}</h3>
                                    <div className="flex justify-between items-center mt-2 text-sm text-white/60">
                                        <span>{track.current_level}</span>
                                        <span>{Math.round(track.progress_percentage)}%</span>
                                    </div>
                                    <div className="mt-3 h-1.5 bg-black/50 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${track.progress_percentage}%` }}
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                        />
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Missions Area */}
                    <div className="lg:col-span-2">
                        {selectedTrack ? (
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl min-h-[500px]">
                                <h2 className="text-2xl font-semibold flex items-center gap-3 mb-8">
                                    <Target className="w-6 h-6 text-pink-400" />
                                    Active Missions
                                </h2>

                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {currentTrackMissions.filter(m => !m.is_completed).length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-center p-12 text-white/50 bg-black/20 rounded-2xl border border-white/5 flex flex-col items-center gap-4"
                                            >
                                                <Award className="w-12 h-12 text-white/20" />
                                                <p>All missions completed for this track!</p>
                                            </motion.div>
                                        ) : (
                                            currentTrackMissions.filter(m => !m.is_completed).map((mission) => (
                                                <motion.div
                                                    key={mission.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="p-6 bg-black/40 border border-white/10 rounded-2xl hover:border-white/20 transition-colors group"
                                                >
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getDifficultyColor(mission.difficulty)}`}>
                                                                    {mission.difficulty}
                                                                </span>
                                                                <span className="flex items-center gap-1 text-yellow-400 text-sm font-medium bg-yellow-400/10 px-2 py-0.5 rounded-full">
                                                                    <Star className="w-3.5 h-3.5" />
                                                                    {mission.xp_reward} XP
                                                                </span>
                                                            </div>
                                                            <h3 className="text-xl font-medium text-white/90">{mission.mission_title}</h3>
                                                            <p className="text-white/60 mt-2 line-clamp-2">{mission.description}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCompleteMission(mission.id)}
                                                            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/50 transition-all duration-300 flex-shrink-0"
                                                            title="Mark as completed"
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
                                    <div className="mt-12 pt-8 border-t border-white/10">
                                        <h3 className="text-lg font-medium text-white/50 mb-4 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" />
                                            Completed Missions
                                        </h3>
                                        <div className="space-y-3">
                                            {currentTrackMissions.filter(m => m.is_completed).map(mission => (
                                                <div key={mission.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center opacity-70">
                                                    <span className="text-white/80 line-through decoration-white/30">{mission.mission_title}</span>
                                                    <span className="text-yellow-400/80 text-sm font-medium">+{mission.xp_reward} XP</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl min-h-[500px] flex items-center justify-center text-white/40">
                                <div className="text-center">
                                    <Compass className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-xl font-medium mb-2">Select a track</p>
                                    <p className="text-sm">Choose a skill on the left to view active missions.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
