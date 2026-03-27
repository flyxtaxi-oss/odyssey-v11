"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Sparkles,
    X,
    MapPin,
    Calendar,
    Utensils,
    Plane,
    Mail,
    Clock,
    ArrowRight,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ActionPlan = {
    id: string;
    intent: string;
    description: string;
    toolName: string;
    parameters: Record<string, unknown>;
    requiresConfirmation: boolean;
    estimatedDuration?: string;
    risks?: string[];
    undoable: boolean;
};

type ActionReceipt = {
    id: string;
    planId: string;
    intent: string;
    status: string;
    toolName: string;
    output?: unknown;
    error?: string;
    executedAt: string;
    durationMs: number;
    undoInstructions?: string;
};

type RestaurantResult = {
    name: string;
    cuisine: string;
    rating: number;
    priceLevel: string;
    address: string;
    distance: string;
    openNow: boolean;
    phone: string;
    website: string;
    mapLink: string;
    highlights: string[];
};

type Phase = "idle" | "planning" | "confirming" | "executing" | "done" | "error" | "vision_analyzing";

// ─── Suggestion chips ────────────────────────────────────────────────────────

const SUGGESTIONS = [
    { icon: Utensils, label: "Japonais ce soir 20h", color: "#F97316" },
    { icon: MapPin, label: "Meilleur brunch à Bruxelles", color: "#06B6D4" },
    { icon: Calendar, label: "Planifie ma semaine", color: "#8B5CF6" },
    { icon: Plane, label: "Checklist expatriation Portugal", color: "#10B981" },
    { icon: Mail, label: "Rédige un email de suivi", color: "#EC4899" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function CommandCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [phase, setPhase] = useState<Phase>("idle");
    const [plan, setPlan] = useState<ActionPlan | null>(null);
    const [receipt, setReceipt] = useState<ActionReceipt | null>(null);
    const [visionResult, setVisionResult] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // ⌘K shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    // Auto-focus input
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            resetState();
        }
    }, [isOpen]);

    const resetState = useCallback(() => {
        setQuery("");
        setPhase("idle");
        setPlan(null);
        setReceipt(null);
        setVisionResult(null);
        setUploadedImage(null);
        setError("");
    }, []);

    // ─── Step 1: Plan ─────────────────────────────────────────────────────────

    const handleSubmit = async (text?: string) => {
        const q = text || query;
        if (!q.trim() && !uploadedImage) return;

        // If an image is uploaded, use the Vision flow
        if (uploadedImage) {
            await handleVisionAnalysis(q, uploadedImage);
            return;
        }

        setQuery(q);
        setPhase("planning");
        setError("");

        try {
            const res = await fetch("/api/agent/plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setPlan(data.plan);

            if (!data.plan.requiresConfirmation) {
                // Auto-execute safe actions (e.g., search)
                await executeAction(data.plan);
            } else {
                setPhase("confirming");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur de planification");
            setPhase("error");
        }
    };

    // ─── Vision Flow ──────────────────────────────────────────────────────────

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage(reader.result as string);
            // Optionally auto-submit if an image is dropped
            // handleVisionAnalysis(query, reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleVisionAnalysis = async (q: string, base64Image: string) => {
        setPhase("vision_analyzing");
        setError("");
        try {
            const res = await fetch("/api/agent/vision", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q, imageBase64: base64Image }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setVisionResult(data.analysis);
            setPhase("done");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur d'analyse d'image");
            setPhase("error");
        }
    };

    // ─── Step 2: Execute ──────────────────────────────────────────────────────

    const executeAction = async (actionPlan: ActionPlan) => {
        setPhase("executing");

        try {
            const res = await fetch("/api/agent/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId: actionPlan.id,
                    toolName: actionPlan.toolName,
                    parameters: actionPlan.parameters,
                    confirmed: true,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setReceipt(data.receipt);
            setPhase("done");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur d'exécution");
            setPhase("error");
        }
    };

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            {/* Trigger button (always visible) */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl
          bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30
          hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105
          transition-all duration-300 group"
            >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="text-sm font-medium">Command Center</span>
                <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono">⌘K</kbd>
            </button>

            {/* Modal overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 400 }}
                            className="fixed inset-x-0 top-[10vh] md:top-[15vh] mx-auto z-[101] w-full max-w-[640px] px-4"
                        >
                            <div className="rounded-2xl border border-white/10 bg-[#0D1117]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden">
                                {/* Search input */}
                                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 relative">
                                    {phase === "executing" ? (
                                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
                                    ) : phase === "done" ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    ) : (
                                        <Search className="w-5 h-5 text-white/40 shrink-0" />
                                    )}
                                    <input
                                        ref={inputRef}
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                        placeholder="Que puis-je faire pour toi ? ou dépose une image..."
                                        className="flex-1 bg-transparent text-white text-[15px] placeholder:text-white/30 outline-none pr-28"
                                        disabled={phase === "executing" || phase === "vision_analyzing"}
                                    />
                                    
                                    <div className="absolute right-12 flex items-center gap-2">
                                        <label className="cursor-pointer text-white/30 hover:text-indigo-400 transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-lg">
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={phase === "executing" || phase === "vision_analyzing"}
                                            />
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                        </label>
                                    </div>

                                    <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/60 ml-2">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Content area */}
                                <div className="max-h-[65vh] md:max-h-[50vh] overflow-y-auto">
                                    <AnimatePresence mode="wait">
                                        {/* ─── Idle: Suggestions ─────────────────────────── */}
                                        {phase === "idle" && (
                                            <motion.div
                                                key="idle"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="p-4"
                                            >
                                                <p className="text-[11px] uppercase tracking-widest text-white/30 mb-3 px-1">
                                                    Suggestions
                                                </p>
                                                <div className="space-y-1">
                                                    {SUGGESTIONS.map(({ icon: Icon, label, color }) => (
                                                        <button
                                                            key={label}
                                                            onClick={() => { setQuery(label); handleSubmit(label); }}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                hover:bg-white/5 transition-colors text-left group"
                                                        >
                                                            <div
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                                style={{ background: `${color}15` }}
                                                            >
                                                                <Icon className="w-4 h-4" style={{ color }} />
                                                            </div>
                                                            <span className="text-sm text-white/70 group-hover:text-white/90">
                                                                {label}
                                                            </span>
                                                            <ArrowRight className="w-3.5 h-3.5 text-white/20 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* ─── Planning: Loading ──────────────────────────── */}
                                        {phase === "planning" && (
                                            <motion.div
                                                key="planning"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="p-8 text-center"
                                            >
                                                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
                                                <p className="text-sm text-white/50">JARVIS analyse ta demande…</p>
                                            </motion.div>
                                        )}

                                        {/* ─── Confirming: Show plan + confirm button ─────── */}
                                        {phase === "confirming" && plan && (
                                            <motion.div
                                                key="confirming"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="p-5"
                                            >
                                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
                                                    <p className="text-sm font-medium text-yellow-400 mb-1">⚠️ Confirmation requise</p>
                                                    <p className="text-sm text-white/70">{plan.description}</p>
                                                    {plan.risks?.map((r, i) => (
                                                        <p key={i} className="text-xs text-yellow-500/60 mt-1">⚡ {r}</p>
                                                    ))}
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => executeAction(plan)}
                                                        className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500
                              text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Confirmer
                                                    </button>
                                                    <button
                                                        onClick={resetState}
                                                        className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10
                              text-white/60 text-sm transition-colors"
                                                    >
                                                        Annuler
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* ─── Executing ──────────────────────────────────── */}
                                        {phase === "executing" && (
                                            <motion.div
                                                key="executing"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="p-8 text-center"
                                            >
                                                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
                                                <p className="text-sm text-white/50">Exécution en cours…</p>
                                            </motion.div>
                                        )}

                                        {/* ─── Vision Analyzing ──────────────────────────────────── */}
                                        {phase === "vision_analyzing" && (
                                            <motion.div
                                                key="vision_analyzing"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="p-8 text-center"
                                            >
                                                <div className="relative w-16 h-16 mx-auto mb-4">
                                                    {uploadedImage && (
                                                        <img src={uploadedImage} alt="analyzing" className="w-full h-full object-cover rounded-xl opacity-50" />
                                                    )}
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                                                    </div>
                                                </div>
                                                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin mx-auto mb-2" />
                                                <p className="text-sm text-white/50">JARVIS analyse votre image...</p>
                                            </motion.div>
                                        )}

                                        {/* ─── Done: Show results ─────────────────────────── */}
                                        {phase === "done" && (receipt || visionResult) && (
                                            <motion.div
                                                key="done"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="p-5"
                                            >
                                                {visionResult ? (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Sparkles className="w-4 h-4 text-indigo-400" />
                                                            <span className="text-sm text-indigo-400 font-medium">Analyse Visuelle</span>
                                                        </div>
                                                        {uploadedImage && (
                                                            <div className="rounded-xl overflow-hidden border border-white/10 w-full max-h-48 flex justify-center bg-black/50">
                                                                <img src={uploadedImage} alt="Uploaded" className="object-contain h-full" />
                                                            </div>
                                                        )}
                                                        <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-xl">
                                                            {visionResult}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    receipt && <ResultsView receipt={receipt} />
                                                )}
                                                <div className="mt-4 flex gap-3">
                                                    <button
                                                        onClick={resetState}
                                                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10
                              text-white/60 text-sm transition-colors"
                                                    >
                                                        Nouvelle recherche
                                                    </button>
                                                    <button
                                                        onClick={() => setIsOpen(false)}
                                                        className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30
                              text-indigo-400 text-sm transition-colors"
                                                    >
                                                        Fermer
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* ─── Error ──────────────────────────────────────── */}
                                        {phase === "error" && (
                                            <motion.div
                                                key="error"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="p-5"
                                            >
                                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-red-400">Erreur</p>
                                                        <p className="text-sm text-white/50 mt-1">{error}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={resetState}
                                                    className="mt-3 w-full px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10
                            text-white/60 text-sm transition-colors"
                                                >
                                                    Réessayer
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                        <span className="text-[11px] text-white/30">JARVIS Action Engine</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-white/20">
                                        <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] font-mono">Enter</kbd>
                                        <span>exécuter</span>
                                        <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] font-mono">Esc</kbd>
                                        <span>fermer</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── Results View ────────────────────────────────────────────────────────────

function ResultsView({ receipt }: { receipt: ActionReceipt }) {
    const output = receipt.output as Record<string, unknown> | undefined;

    if (receipt.intent === "search_restaurants" && output?.results) {
        const restaurants = output.results as RestaurantResult[];
        const source = output.source as string;

        return (
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-medium">
                        {restaurants.length} restaurants trouvés
                    </span>
                    <span className="text-[10px] text-white/20 ml-auto">
                        {source === "google_places" ? "Google Places" : "Base locale"} • {receipt.durationMs}ms
                    </span>
                </div>

                <div className="space-y-2">
                    {restaurants.map((r, i) => (
                        <motion.div
                            key={r.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 rounded-xl p-4 hover:bg-white/8 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-1">
                                <h4 className="text-sm font-semibold text-white">{r.name}</h4>
                                <div className="flex items-center gap-1">
                                    <span className="text-yellow-400 text-xs">★</span>
                                    <span className="text-xs text-white/60">{r.rating}</span>
                                    <span className="text-xs text-white/30 ml-1">{r.priceLevel}</span>
                                </div>
                            </div>
                            <p className="text-xs text-indigo-400 mb-1">{r.cuisine}</p>
                            <p className="text-xs text-white/40 mb-2">{r.address} • {r.distance}</p>
                            {r.highlights.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {r.highlights.map((h) => (
                                        <span key={h} className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-500/10 text-indigo-300">
                                            {h}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2 mt-2">
                                <a
                                    href={r.mapLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10
                    text-xs text-white/50 hover:text-white/80 transition-colors"
                                >
                                    <MapPin className="w-3 h-3" />
                                    Maps
                                </a>
                                {r.website && (
                                    <a
                                        href={r.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10
                      text-xs text-white/50 hover:text-white/80 transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Site
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    // Booking result
    if (receipt.intent === "book_restaurant" && output) {
        const data = output as Record<string, unknown>;
        const steps = data.steps as string[] | undefined;

        return (
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-medium">
                        {data.method === "api" ? "Réservation confirmée !" : "Guide de réservation prêt"}
                    </span>
                </div>
                {!!data.message && <p className="text-sm text-white/70 mb-3">{data.message as string}</p>}
                {steps && (
                    <div className="space-y-1">
                        {steps.map((step, i) => (
                            <p key={i} className="text-xs text-white/50">{step}</p>
                        ))}
                    </div>
                )}
                {receipt.undoInstructions && (
                    <p className="text-[11px] text-white/30 mt-3 italic">
                        ↩ {receipt.undoInstructions}
                    </p>
                )}
            </div>
        );
    }

    // Generic result
    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                {receipt.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-sm font-medium ${receipt.status === "completed" ? "text-emerald-400" : "text-red-400"}`}>
                    {receipt.status === "completed" ? "Action terminée" : "Échec"}
                </span>
                <span className="text-[10px] text-white/20 ml-auto">{receipt.durationMs}ms</span>
            </div>
            {receipt.error && <p className="text-xs text-red-400/60">{receipt.error}</p>}
            {!!receipt.output && (
                <pre className="text-xs text-white/40 mt-2 bg-white/5 p-3 rounded-lg overflow-auto max-h-40">
                    {JSON.stringify(receipt.output, null, 2)}
                </pre>
            )}
        </div>
    );
}
