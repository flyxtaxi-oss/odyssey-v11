"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe,
    DollarSign,
    Home,
    Briefcase,
    Sun,
    TrendingUp,
    Plane,
    Zap,
    ArrowRight,
    BarChart3,
    ChevronRight,
    Save,
    Check,
    Loader2,
} from "lucide-react";

type Country = {
    name: string;
    flag: string;
    salary: number;
    tax: number;
    cost: number;
    visa: string;
    climate: string;
    score: number;
    color: string;
};

const countries: Country[] = [
    { name: "France", flag: "🇫🇷", salary: 3800, tax: 30, cost: 1800, visa: "—", climate: "Tempéré", score: 65, color: "#6366f1" },
    { name: "Portugal", flag: "🇵🇹", salary: 3200, tax: 20, cost: 1100, visa: "NHR / D7", climate: "☀️ Sommeil", score: 84, color: "var(--text-1)" },
    { name: "Dubaï", flag: "🇦🇪", salary: 6500, tax: 0, cost: 2800, visa: "Golden Visa", climate: "🔥 Désert", score: 78, color: "var(--text-1)" },
    { name: "Maroc", flag: "🇲🇦", salary: 2500, tax: 15, cost: 700, visa: "Libre", climate: "☀️ Soleil", score: 81, color: "var(--text-1)" },
    { name: "Canada", flag: "🇨🇦", salary: 5200, tax: 28, cost: 2200, visa: "Express Entry", climate: "❄️ Froid", score: 72, color: "var(--text-1)" },
    { name: "Thaïlande", flag: "🇹🇭", salary: 2800, tax: 10, cost: 600, visa: "DTV", climate: "🌴 Tropical", score: 88, color: "var(--text-1)" },
];

const calcNet = (c: Country) => c.salary - (c.salary * c.tax) / 100 - c.cost;
const calcYearly = (c: Country, y: number) => calcNet(c) * 12 * y;

const rows = [
    { icon: Briefcase, label: "Salaire Brut", key: "salary" as const, fmt: (v: number) => `${v.toLocaleString()}€/m` },
    { icon: DollarSign, label: "Impôts", key: "tax" as const, fmt: (v: number) => `${v}%` },
    { icon: Home, label: "Coût de la vie", key: "cost" as const, fmt: (v: number) => `${v.toLocaleString()}€/m` },
    { icon: Sun, label: "Climat", key: "climate" as const, fmt: (v: string) => v },
];

export default function SimulatorPage() {
    const [compareIdx, setCompareIdx] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
    const current = countries[0];
    const compare = countries[compareIdx];
    const diffNet = calcNet(compare) - calcNet(current);
    const diff3Y = calcYearly(compare, 3) - calcYearly(current, 3);
    const diff5Y = calcYearly(compare, 5) - calcYearly(current, 5);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        setSaveStatus("idle");
        try {
            const res = await fetch("/api/simulator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destination: compare.name,
                    score: compare.score,
                    visa: compare.visa,
                    salary: compare.salary,
                    tax_rate: compare.tax,
                    cost_of_living: compare.cost,
                    climate: compare.climate,
                    savings: calcNet(compare),
                }),
            });
            if (res.ok) {
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 3000);
            } else {
                setSaveStatus("error");
            }
        } catch {
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    }, [compare]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            {/* ─── Header ─── */}
            <div className="relative mt-2">
                <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-4 h-4 text-[var(--accent-indigo)]" />
                    <span className="section-label tracking-widest text-[var(--text-2)] font-mono-tech">MOTEUR_DE_DESTINÉE_V9</span>
                </div>
                <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] font-extrabold tracking-tight leading-[1] text-[var(--text-0)]">
                    Simulateur de <span className="text-gradient-shimmer" data-text="Trajectoire">Trajectoire</span>
                </h1>
                <p className="text-[14px] text-[var(--text-3)] font-mono-tech uppercase tracking-widest mt-4 max-w-lg leading-relaxed">
                    Comparaison multi-factorielle. Base de destination vs Situation actuelle.
                </p>
                <div className="mt-6">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-sci-fi text-[11px] px-5 py-2.5 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> SAUVEGARDE...</>
                        ) : saveStatus === "saved" ? (
                            <><Check className="w-3.5 h-3.5 text-emerald-400" /> SIMULATION SAUVEGARDÉE</>
                        ) : (
                            <><Save className="w-3.5 h-3.5" /> SAUVEGARDER SIMULATION</>
                        )}
                    </motion.button>
                </div>
            </div>

            {/* ─── Country Selector ─── */}
            <div className="flex flex-wrap gap-3">
                {countries.slice(1).map((c, i) => (
                    <motion.button
                        key={c.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCompareIdx(i + 1)}
                        className="relative px-5 py-3 rounded-2xl text-[13px] font-bold transition-all border overflow-hidden"
                        style={{
                            background: compareIdx === i + 1 ? "var(--bg-1)" : "var(--bg-0)",
                            color: compareIdx === i + 1 ? "var(--text-0)" : "var(--text-2)",
                            borderColor: compareIdx === i + 1 ? "var(--border-2)" : "var(--border-0)",
                            boxShadow: compareIdx === i + 1 ? "0 4px 20px rgba(0,0,0,0.5)" : "none",
                        }}
                    >
                        {compareIdx === i + 1 && (
                            <motion.div
                                layoutId="country-pill-v7"
                                className="absolute inset-0 pointer-events-none"
                                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <span className="text-lg opacity-90">{c.flag}</span>
                            <span className="tracking-wide">{c.name}</span>
                            {compareIdx === i + 1 && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="ml-2 text-[10px] font-mono-tech px-2 py-0.5 rounded border border-[var(--border-1)] text-[var(--text-0)] bg-[var(--bg-2)]"
                                >
                                    {c.score}%
                                </motion.span>
                            )}
                        </span>
                    </motion.button>
                ))}
            </div>

            {/* ─── Comparison Cards ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Current */}
                <div className="glass-panel p-8 space-y-5 bg-[var(--bg-1)] border-[var(--border-1)] shadow-none">
                    <div className="flex items-center gap-4 pb-5 border-b border-[var(--border-0)]">
                        <span className="text-3xl opacity-90">{current.flag}</span>
                        <div className="flex-1">
                            <h3 className="text-[18px] font-bold text-[var(--text-0)] tracking-wide">{current.name}</h3>
                            <span className="text-[10px] text-[var(--text-3)] font-mono-tech uppercase tracking-widest mt-1">Situation actuelle Base</span>
                        </div>
                        <span className="text-[11px] font-bold font-mono tracking-widest uppercase bg-[var(--bg-2)] text-[var(--text-2)] px-3 py-1 rounded border border-[var(--border-1)]">ORIGINE</span>
                    </div>

                    <div className="space-y-4">
                        {rows.map((r) => (
                            <div key={r.label} className="flex items-center justify-between pb-3 border-b border-[var(--border-0)] last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-lg bg-[var(--bg-2)] border border-[var(--border-1)]">
                                        <r.icon className="w-4 h-4 text-[var(--text-2)]" />
                                    </div>
                                    <span className="text-[13px] text-[var(--text-2)] uppercase font-semibold tracking-wide">{r.label}</span>
                                </div>
                                <span className="text-[14px] font-bold text-[var(--text-0)] font-mono-tech">
                                    {r.fmt(current[r.key] as never)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2">
                        <span className="text-[10px] text-[var(--text-3)] font-mono-tech uppercase tracking-widest">Capacité d'Epargne (Reste à vivre)</span>
                        <p className="text-[36px] font-extrabold text-[var(--text-0)] tracking-tighter mt-1">
                            {calcNet(current).toLocaleString()}€
                        </p>
                    </div>
                </div>

                {/* Compare */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={compare.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="glass-panel p-8 space-y-5 relative overflow-hidden bg-[var(--bg-1)] border-[var(--border-2)]"
                        style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" }}
                    >
                        {/* Shimmer gradient (subtle) */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.03] pointer-events-none mix-blend-screen"
                            style={{ background: `radial-gradient(circle at 80% -20%, #ffffff, transparent 60%)`, filter: "blur(40px)" }} />

                        <div className="flex items-center gap-4 pb-5 relative z-10 border-b border-[var(--border-1)]">
                            <span className="text-3xl opacity-90">{compare.flag}</span>
                            <div className="flex-1">
                                <h3 className="text-[18px] font-bold text-[var(--text-0)] tracking-wide">{compare.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Plane className="w-3.5 h-3.5 text-[var(--text-2)]" />
                                    <span className="text-[10px] font-mono-tech tracking-widest uppercase text-[var(--text-2)]">{compare.visa}</span>
                                </div>
                            </div>
                            <div className="text-[11px] font-bold font-mono tracking-widest uppercase bg-[var(--bg-2)] text-[var(--text-0)] px-3 py-1 rounded border border-[var(--border-2)] flex items-center shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                                <Zap className="w-3.5 h-3.5 mr-1 text-[var(--text-1)]" />
                                {compare.score}/100
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {rows.map((r) => {
                                const curr = r.key === "climate" ? 0 : (current[r.key] as number);
                                const comp = r.key === "climate" ? 0 : (compare[r.key] as number);
                                const diff = r.key === "tax" ? curr - comp : comp - curr;
                                return (
                                    <div key={r.label} className="flex items-center justify-between pb-3 border-b border-[var(--border-0)] last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-lg bg-[var(--bg-2)] border border-[var(--border-1)]">
                                                <r.icon className="w-4 h-4 text-[var(--text-1)]" />
                                            </div>
                                            <span className="text-[13px] text-[var(--text-1)] uppercase font-semibold tracking-wide">{r.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[14px] font-bold text-[var(--text-0)] font-mono-tech">
                                                {r.fmt(compare[r.key] as never)}
                                            </span>
                                            {r.key !== "climate" && diff !== 0 && (
                                                <span className={`text-[12px] font-bold font-mono-tech px-2 py-0.5 rounded border border-[var(--border-1)] ${diff > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                                    {diff > 0 ? "+" : ""}{diff > 0 ? "▲" : "▼"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-2 relative z-10">
                            <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--text-2)]">Projection d'Épargne MENSUELLE</span>
                            <p className="text-[40px] font-extrabold tracking-tighter mt-1 text-[var(--text-0)]">
                                {calcNet(compare).toLocaleString()}€
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ─── Impact financier ─── */}
            <div className="glass-panel p-8 relative overflow-hidden bg-[var(--bg-1)] border-[var(--border-1)] shadow-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.02] pointer-events-none mix-blend-screen"
                    style={{ background: `radial-gradient(circle at 90% -10%, #ffffff, transparent 70%)`, filter: "blur(50px)" }} />

                <div className="flex items-center gap-4 mb-8 relative z-10 border-b border-[var(--border-0)] pb-5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--bg-2)] border border-[var(--border-1)]">
                        <BarChart3 className="w-5 h-5 text-[var(--text-0)]" />
                    </div>
                    <div>
                        <h3 className="text-[18px] font-bold text-[var(--text-0)] tracking-wide">Macro-Impact Financier</h3>
                        <p className="text-[10px] text-[var(--text-3)] font-mono-tech uppercase tracking-widest mt-1">
                            {current.name} vs {compare.name}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {[
                        { label: "Différence Men.", value: diffNet, sub: "Cash-flow /mois" },
                        { label: "Projection 3 ANS", value: diff3Y, sub: "Capital supplémentaire" },
                        { label: "Projection 5 ANS", value: diff5Y, sub: "Capital supplémentaire" },
                    ].map((m) => (
                        <div key={m.label}
                            className="text-center py-6 px-4 rounded-[16px] relative overflow-hidden group transition-all duration-300 hover:bg-[var(--bg-2)]"
                            style={{ background: "var(--bg-0)", border: "1px solid var(--border-1)" }}>

                            <p className="text-[10px] text-[var(--text-2)] font-mono-tech uppercase tracking-widest mb-3">{m.label}</p>

                            <p className={`text-[36px] font-extrabold tracking-tighter font-mono-tech ${m.value >= 0 ? "text-[var(--text-0)]" : "text-[var(--text-0)]"} ${m.value >= 0 ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" : "drop-shadow-none"}`}>
                                {m.value >= 0 ? "+" : ""}{m.value.toLocaleString()}€
                            </p>

                            <p className="text-[10px] text-[var(--text-3)] mt-3 tracking-widest uppercase">{m.sub}</p>

                            {m.value >= 0 && (
                                <div className="absolute inset-x-0 bottom-0 h-[1px] opacity-20 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-[var(--text-1)] to-transparent" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
