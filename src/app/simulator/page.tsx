"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from "framer-motion";
import {
    Globe, DollarSign, Home, Briefcase, Sun, Plane, Zap, Check, Loader2, Save, TrendingUp, Activity
} from "lucide-react";

/* ─── 3D Tilt Card ─── */
function TiltWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative h-full transition-shadow duration-500 hover:shadow-[0_0_50px_-15px_rgba(143,245,255,0.25)] ${className}`}
    >
      <div className="absolute inset-0 bg-[var(--bg-2)]/60 rounded-[20px] border border-[var(--border-0)] backdrop-blur-xl" />
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
      <div
        className="relative h-full p-8 flex flex-col justify-between"
        style={{ transform: "translateZ(30px)" }}
      >
        {children}
      </div>
    </motion.div>
  );
}

type Country = {
    name: string; flag: string; salary: number; tax: number; cost: number; visa: string; climate: string; score: number; color: string;
};

const countries: Country[] = [
    { name: "France", flag: "🇫🇷", salary: 3800, tax: 30, cost: 1800, visa: "—", climate: "Tempéré", score: 65, color: "var(--secondary)" },
    { name: "Portugal", flag: "🇵🇹", salary: 3200, tax: 20, cost: 1100, visa: "NHR / D7", climate: "☀️ Sommeil", score: 84, color: "var(--primary)" },
    { name: "Dubaï", flag: "🇦🇪", salary: 6500, tax: 0, cost: 2800, visa: "Golden Visa", climate: "🔥 Désert", score: 78, color: "var(--tertiary)" },
    { name: "Maroc", flag: "🇲🇦", salary: 2500, tax: 15, cost: 700, visa: "Libre", climate: "☀️ Soleil", score: 81, color: "var(--error)" },
    { name: "Canada", flag: "🇨🇦", salary: 5200, tax: 28, cost: 2200, visa: "Express Entry", climate: "❄️ Froid", score: 72, color: "var(--primary-dim)" },
    { name: "Thaïlande", flag: "🇹🇭", salary: 2800, tax: 10, cost: 600, visa: "DTV", climate: "🌴 Tropical", score: 88, color: "var(--secondary-dim)" },
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
                    destination: compare.name, score: compare.score, visa: compare.visa,
                    salary: compare.salary, tax_rate: compare.tax, cost_of_living: compare.cost,
                    climate: compare.climate, savings: calcNet(compare),
                }),
            });
            if (res.ok) { setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 3000); }
            else setSaveStatus("error");
        } catch { setSaveStatus("error"); }
        finally { setIsSaving(false); }
    }, [compare]);

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Stitch Nebula Background */}
            <div className="absolute top-1/4 -right-1/4 w-[150%] h-[500px] bg-gradient-to-t from-[rgba(0,222,236,0.06)] via-[rgba(172,137,255,0.04)] to-transparent blur-3xl pointer-events-none" />

            <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12 pb-20 relative z-10">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">

                    {/* ─── Header ─── */}
                    <div className="relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-2)] border border-[var(--border-0)] text-xs font-mono-tech text-[var(--primary)] mb-6 backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
                            </span>
                            MOTEUR_DE_DESTINÉE_V10_ACTIVE
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[var(--text-0)] mb-4 leading-tight font-display">
                            Simulateur de <br/><span className="text-gradient-primary">Trajectoire</span>
                        </h1>
                        <p className="text-lg text-[var(--text-2)] max-w-2xl font-light mb-8 font-body">
                            Analyse de variables multi-dimensionnelles propulsée par Vertex AI. Identifie ton environnement orbital optimal.
                        </p>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="btn-stitch group relative inline-flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="relative flex items-center gap-2">
                                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> CALCUL...</> :
                                saveStatus === "saved" ? <><Check className="w-4 h-4" /> SIMULATION ENREGISTRÉE</> :
                                <><Save className="w-4 h-4" /> SAUVEGARDER LE VECTEUR</>}
                            </span>
                        </button>
                    </div>

                    {/* ─── Country Selector ─── */}
                    <div>
                        <p className="text-sm font-medium text-[var(--text-3)] mb-4 uppercase tracking-widest flex items-center gap-2 font-label">
                            <Activity className="w-4 h-4" /> Sélection du Noeud de Destination
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {countries.slice(1).map((c, i) => {
                                const isActive = compareIdx === i + 1;
                                return (
                                    <motion.button
                                        key={c.name}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setCompareIdx(i + 1)}
                                        className={`relative px-6 py-3 rounded-2xl text-sm font-bold transition-all border overflow-hidden backdrop-blur-xl font-body ${isActive ? 'border-[rgba(143,245,255,0.4)] text-[var(--text-0)] shadow-[0_0_25px_rgba(143,245,255,0.15)]' : 'border-[var(--border-0)] text-[var(--text-2)] hover:text-[var(--text-0)] hover:border-[var(--border-1)]'}`}
                                        style={{ background: isActive ? 'rgba(143,245,255,0.08)' : 'var(--bg-2)' }}
                                    >
                                        <span className="relative z-10 flex items-center gap-3">
                                            <span className="text-xl">{c.flag}</span>
                                            <span className="tracking-wide">{c.name}</span>
                                            {isActive && (
                                                <motion.span
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="ml-2 tag-stitch"
                                                >
                                                    {c.score} PTS
                                                </motion.span>
                                            )}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ─── Comparison Cards ─── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Current Node */}
                        <div className="relative p-8 rounded-[20px] bg-[var(--bg-2)]/50 border border-[var(--border-0)] backdrop-blur-xl flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-4 pb-6 border-b border-[var(--border-0)]">
                                    <div className="text-4xl">{current.flag}</div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-[var(--text-2)] tracking-wide font-display">{current.name}</h3>
                                        <span className="text-xs text-[var(--text-3)] font-mono-tech uppercase tracking-widest mt-1">Noeud d&apos;Origine</span>
                                    </div>
                                    <span className="text-xs font-bold font-mono-tech tracking-widest uppercase bg-[var(--error)]/10 text-[var(--error)] px-3 py-1.5 rounded-lg border border-[var(--error)]/20">ORIGINE</span>
                                </div>

                                <div className="space-y-5 mt-6">
                                    {rows.map((r) => (
                                        <div key={r.label} className="flex items-center justify-between pb-4 border-b border-[var(--border-0)] last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-[var(--bg-3)] border border-[var(--border-0)]">
                                                    <r.icon className="w-4 h-4 text-[var(--text-3)]" />
                                                </div>
                                                <span className="text-sm text-[var(--text-2)] uppercase font-semibold tracking-wider font-label">{r.label}</span>
                                            </div>
                                            <span className="text-base font-bold text-[var(--text-0)] font-mono-tech">
                                                {r.fmt(current[r.key] as never)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 mt-8 border-t border-[var(--border-0)]">
                                <span className="text-xs text-[var(--text-3)] font-mono-tech uppercase tracking-widest font-label">Capacité d&apos;Épargne MENSUELLE</span>
                                <p className="text-4xl md:text-5xl font-extrabold text-[var(--text-0)] tracking-tighter mt-2 font-mono-tech drop-shadow-sm">
                                    {calcNet(current).toLocaleString()}€
                                </p>
                            </div>
                        </div>

                        {/* Destination Node */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={compare.name}
                                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <TiltWrap>
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.06]">
                                        <Globe className="w-64 h-64 text-[var(--primary)]" />
                                    </div>

                                    <div className="flex items-center gap-4 pb-6 relative z-10 border-b border-[var(--border-0)]">
                                        <div className="text-4xl">{compare.flag}</div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-[var(--text-0)] tracking-wide font-display">{compare.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Plane className="w-4 h-4 text-[var(--text-3)]" />
                                                <span className="text-xs font-mono-tech tracking-widest uppercase text-[var(--primary)]">{compare.visa}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold font-mono-tech tracking-widest uppercase bg-[var(--primary)]/10 text-[var(--primary)] px-4 py-1.5 rounded-lg border border-[var(--primary)]/20 flex items-center shadow-[0_0_20px_rgba(143,245,255,0.12)]">
                                            <Zap className="w-4 h-4 mr-2" />
                                            {compare.score}/100
                                        </div>
                                    </div>

                                    <div className="space-y-5 mt-6 relative z-10 flex-1">
                                        {rows.map((r) => {
                                            const curr = r.key === "climate" ? 0 : (current[r.key] as number);
                                            const comp = r.key === "climate" ? 0 : (compare[r.key] as number);
                                            let diff = comp - curr;
                                            if(r.key === "tax") diff = curr - comp;

                                            return (
                                                <div key={r.label} className="flex items-center justify-between pb-4 border-b border-[var(--border-0)] last:border-0 last:pb-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-xl bg-[var(--bg-3)] border border-[var(--border-0)]">
                                                            <r.icon className="w-4 h-4 text-[var(--primary)]" />
                                                        </div>
                                                        <span className="text-sm text-[var(--text-1)] uppercase font-semibold tracking-wider font-label">{r.label}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-base font-bold text-[var(--text-0)] font-mono-tech">
                                                            {r.fmt(compare[r.key] as never)}
                                                        </span>
                                                        {r.key !== "climate" && (comp - curr) !== 0 && (
                                                            <span className={`text-[11px] font-bold font-mono-tech px-2 py-1 rounded bg-[var(--bg-3)] border border-[var(--border-0)] ${diff > 0 ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                                                                {(comp - curr) > 0 ? "+" : ""}{(comp - curr).toLocaleString()}{r.key === 'tax' ? "%" : "€"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="pt-8 mt-auto border-t border-[var(--border-0)] relative z-10">
                                        <span className="text-xs font-mono-tech uppercase tracking-widest text-[var(--primary)] font-label">Projection d&apos;Épargne MENSUELLE</span>
                                        <p className="text-4xl md:text-5xl font-extrabold tracking-tighter mt-2 text-gradient-primary font-mono-tech drop-shadow-sm">
                                            {calcNet(compare).toLocaleString()}€
                                        </p>
                                    </div>
                                </TiltWrap>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ─── Macro Impact ─── */}
                    <div className="glass-panel p-8 overflow-hidden mt-8">
                        <div className="absolute -bottom-1/2 -right-1/4 w-[1000px] h-[1000px] bg-gradient-to-tl from-[rgba(172,137,255,0.06)] via-transparent to-transparent blur-3xl rounded-full pointer-events-none" />

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10 border-b border-[var(--border-0)] pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--primary)]/15 to-[var(--secondary)]/15 border border-[var(--primary)]/20">
                                    <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-[var(--text-0)] tracking-tight font-display">Macro-Impact Financier</h3>
                                    <p className="text-sm text-[var(--text-2)] font-mono-tech mt-1">
                                        Delta Trajectoire : <span className="text-[var(--secondary)]">{current.name}</span> → <span className="text-[var(--primary)]">{compare.name}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                            {[
                                { label: "Delta Mensuel", value: diffNet, sub: "Surplus Cash-flow net" },
                                { label: "Progression 36 Mois", value: diff3Y, sub: "Capital supplémentaire accumulé" },
                                { label: "Horizon 60 Mois", value: diff5Y, sub: "Trajectoire long terme ajustée" },
                            ].map((m) => (
                                <div key={m.label}
                                    className="p-6 rounded-[16px] relative overflow-hidden group transition-all duration-300 bg-[var(--bg-1)] border border-[var(--border-0)] hover:border-[var(--border-2)]"
                                >
                                    <p className="text-xs text-[var(--text-3)] font-mono-tech uppercase tracking-widest mb-3 font-label">{m.label}</p>
                                    <p className={`text-4xl font-extrabold tracking-tighter font-mono-tech ${m.value >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                                        {m.value >= 0 ? "+" : ""}{m.value.toLocaleString()}€
                                    </p>
                                    <p className="text-xs text-[var(--text-3)] mt-4 font-medium font-body">{m.sub}</p>

                                    {m.value >= 0 && (
                                        <div className="absolute inset-x-0 bottom-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}
