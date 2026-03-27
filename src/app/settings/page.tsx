"use client";

import { motion } from "framer-motion";
import {
    Settings as SettingsIcon,
    Shield,
    Bell,
    Palette,
    ChevronRight,
    LogOut,
    Smartphone,
    Moon,
    Zap,
    Download,
    Lock,
} from "lucide-react";
import { useState } from "react";

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
    return (
        <button
            onClick={onChange}
            className="w-11 h-[24px] rounded-full relative transition-all duration-300 shrink-0 outline-none"
            style={{
                background: enabled ? "var(--primary)" : "var(--bg-3)",
                border: enabled ? "1px solid var(--primary)" : "1px solid var(--border-1)",
                boxShadow: enabled ? "inset 0 1px 4px rgba(0,0,0,0.2)" : "inset 0 1px 3px rgba(0,0,0,0.5)",
            }}
        >
            <motion.div
                className="w-[18px] h-[18px] rounded-full absolute top-[2px]"
                animate={{ left: enabled ? 24 : 3 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{
                    background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
                }}
            />
        </button>
    );
}

export default function SettingsPage() {
    const [toggles, setToggles] = useState<Record<string, boolean>>({
        memory: true,
        extraction: true,
        opportunities: true,
        mentors: true,
        weekly: true,
        biometric: false,
    });

    const toggle = (key: string) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-8">
            {/* ─── Header ─── */}
            <motion.div variants={fadeUp} className="relative mt-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 mb-4">
                    <SettingsIcon className="w-4 h-4 text-[var(--primary)]" />
                    <span className="section-label tracking-widest text-[var(--text-2)] font-mono-tech uppercase">Paramètres_Système_V10</span>
                </div>
                <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] font-extrabold tracking-tight leading-[1] text-[var(--text-0)] font-display">
                    Configuration <span className="text-gradient-primary">DeepSpace</span>
                </h1>
            </motion.div>

            {/* ─── Profile ─── */}
            <motion.div variants={fadeUp} className="glass-panel p-6 md:p-8 relative overflow-hidden group bg-[var(--bg-1)] border border-[var(--border-1)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.02] pointer-events-none mix-blend-screen"
                    style={{ background: "radial-gradient(circle at 100% 0%, #ffffff, transparent 70%)" }} />

                <div className="flex items-center gap-5 mb-8 relative z-10 border-b border-[var(--border-0)] pb-6">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold relative bg-[var(--bg-2)] border border-[var(--border-2)] text-[var(--text-0)] shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    >
                        J
                        <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--success)] border-[2px] border-[var(--bg-1)]" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-[20px] font-bold text-[var(--text-0)] tracking-wide">Jibril</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-gradient-to-r from-[var(--primary)]/15 to-[var(--secondary)]/15 border border-[var(--primary)]/25 text-[var(--primary)]">EXECUTIVE</span>
                            <span className="text-[10px] text-[var(--text-3)] font-mono-tech uppercase tracking-widest">France 🇫🇷</span>
                        </div>
                    </div>
                    <button className="btn-stitch px-4 py-2 text-[11px]">
                        ÉDITER
                    </button>
                </div>

                <div className="space-y-0 relative z-10">
                    {[
                        { label: "IDENTIFIANT", value: "jibril@odyssey.ai" },
                        { label: "CLASSE", value: "Opérateur Master" },
                        { label: "COORDONNÉES", value: "France 🇫🇷" },
                        { label: "UPTIME", value: "Février 2026" },
                        { label: "NIVEAU", value: "V10 DEEPSPACE ✨" },
                    ].map((r) => (
                        <div key={r.label} className="flex justify-between py-3 group/row cursor-pointer hover:bg-[var(--bg-2)] -mx-4 px-4 rounded-lg transition-all border-b border-[var(--border-0)] last:border-0">
                            <span className="text-[11px] font-mono-tech uppercase tracking-widest text-[var(--text-3)]">{r.label}</span>
                            <span className="text-[13px] font-mono-tech font-bold text-[var(--text-1)] group-hover/row:text-[var(--text-0)] transition-colors">{r.value}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ─── IA & Privacy ─── */}
            <motion.div variants={fadeUp} className="glass-panel p-6 md:p-8 space-y-2 relative overflow-hidden bg-[var(--bg-0)] border border-[var(--border-1)] shadow-none">

                <div className="flex items-center gap-4 mb-6 relative z-10 border-b border-[var(--border-0)] pb-4">
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-[var(--bg-2)] border border-[var(--border-1)] shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                        <Shield className="w-5 h-5 text-[var(--text-1)]" />
                    </div>
                    <div>
                        <h2 className="text-[16px] font-bold text-[var(--text-0)] tracking-wide">IA & Cryptographie</h2>
                        <p className="text-[10px] text-[var(--text-3)] font-mono-tech uppercase tracking-widest mt-1">Gouvernance des données</p>
                    </div>
                </div>
                {[
                    { key: "memory", label: "Mémoire J.A.R.V.I.S.", desc: "Conservation du contexte conversationnel", icon: Zap },
                    { key: "extraction", label: "Auto-Extraction Profil", desc: "Scan et enrichissement des métadonnées", icon: Download },
                    { key: "biometric", label: "Verrou Biométrique", desc: "Authentification rétinienne/digitale", icon: Lock },
                ].map((t) => (
                    <div key={t.key} className="flex items-center justify-between py-4 hover:bg-[var(--bg-1)] -mx-4 px-4 rounded-lg transition-all relative z-10 border-b border-[var(--border-0)] last:border-0">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-2)] border border-[var(--border-1)]">
                                <t.icon className="w-4 h-4 text-[var(--text-2)]" />
                            </div>
                            <div>
                                <span className="text-[13px] text-[var(--text-1)] font-bold tracking-wide">{t.label}</span>
                                <p className="text-[11px] text-[var(--text-3)]">{t.desc}</p>
                            </div>
                        </div>
                        <Toggle enabled={toggles[t.key]} onChange={() => toggle(t.key)} />
                    </div>
                ))}
            </motion.div>

            {/* ─── Notifications ─── */}
            <motion.div variants={fadeUp} className="glass-panel p-6 md:p-8 space-y-2 relative overflow-hidden bg-[var(--bg-0)] border border-[var(--border-1)] shadow-none">

                <div className="flex items-center gap-4 mb-6 relative z-10 border-b border-[var(--border-0)] pb-4">
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-[var(--bg-2)] border border-[var(--border-1)] shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                        <Bell className="w-5 h-5 text-[var(--text-1)]" />
                    </div>
                    <div>
                        <h2 className="text-[16px] font-bold text-[var(--text-0)] tracking-wide">Télémétrie</h2>
                        <p className="text-[10px] text-[var(--text-3)] font-mono-tech uppercase tracking-widest mt-1">Alertes & Rapports</p>
                    </div>
                </div>
                {[
                    { key: "opportunities", label: "Détection d'opportunités", desc: "Alertes en temps réel (Jobs, Immo, Visas)" },
                    { key: "mentors", label: "Matching Réseau", desc: "Signaux de compatibilité avec Mentors" },
                    { key: "weekly", label: "Synthèse Hebdomadaire", desc: "Rapport PDF des métriques d'évolution" },
                ].map((t) => (
                    <div key={t.key} className="flex items-center justify-between py-4 hover:bg-[var(--bg-1)] -mx-4 px-4 rounded-lg transition-all relative z-10 border-b border-[var(--border-0)] last:border-0">
                        <div>
                            <span className="text-[13px] text-[var(--text-1)] font-bold tracking-wide">{t.label}</span>
                            <p className="text-[11px] text-[var(--text-3)]">{t.desc}</p>
                        </div>
                        <Toggle enabled={toggles[t.key]} onChange={() => toggle(t.key)} />
                    </div>
                ))}
            </motion.div>

            {/* ─── Appearance ─── */}
            <motion.div variants={fadeUp} className="glass-panel p-6 md:p-8 relative overflow-hidden bg-[var(--bg-0)] border border-[var(--border-1)] shadow-none">

                <div className="flex items-center gap-4 mb-6 relative z-10 border-b border-[var(--border-0)] pb-4">
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-[var(--bg-2)] border border-[var(--border-1)] shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                        <Palette className="w-5 h-5 text-[var(--text-1)]" />
                    </div>
                    <div>
                        <h2 className="text-[16px] font-bold text-[var(--text-0)] tracking-wide">Interface Holographique</h2>
                        <p className="text-[10px] text-[var(--text-3)] font-mono-tech uppercase tracking-widest mt-1">Esthétique V10 DeepSpace Nebula</p>
                    </div>
                </div>
                {[
                    { label: "Design System", value: "STITCH DEEPSPACE (Actif)", icon: Moon },
                    { label: "Langue Encodeur", value: "FR-FR", icon: Smartphone },
                    { label: "Particules & Mesh", value: "DÉSACTIVÉ (Clean)", icon: Zap },
                ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between py-4 cursor-pointer hover:bg-[var(--bg-1)] -mx-4 px-4 rounded-lg transition-all relative z-10 border-b border-[var(--border-0)] last:border-0 group/row">
                        <div className="flex items-center gap-4">
                            <r.icon className="w-4 h-4 text-[var(--text-3)] group-hover/row:text-[var(--text-1)] transition-colors" />
                            <span className="text-[13px] font-bold text-[var(--text-1)] tracking-wide">{r.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono-tech font-bold text-[var(--text-1)] drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{r.value}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-3)]" />
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* ─── Footer ─── */}
            <motion.div variants={fadeUp} className="text-center py-8 space-y-3">
                <button className="text-[11px] font-mono-tech font-bold tracking-widest text-[var(--text-2)] hover:text-[var(--text-0)] hover:bg-[var(--bg-2)] px-4 py-2 rounded-lg transition-all flex items-center gap-2 mx-auto border border-transparent hover:border-[var(--border-2)]">
                    <LogOut className="w-3.5 h-3.5" />
                    A R T É F A C T _ D É C O N N E X I O N
                </button>
                <p className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--text-3)] opacity-60">
                    O D Y S S E Y _ O S <span className="text-gradient-primary font-bold ml-1">v 1 0 . 0 . 0</span>
                </p>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-[var(--text-1)] to-transparent mx-auto opacity-30" />
            </motion.div>
        </motion.div>
    );
}
