"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain, Sparkles, Users, Target, TrendingUp, Clock,
    ArrowRight, Loader2, Share2, Download, Star, Globe,
    Building2, Briefcase, Wallet, Heart, Languages, Network
} from "lucide-react";

type ScenarioType = "relocation" | "career" | "investment" | "lifestyle" | "social";

interface UserProfile {
    nationality: string;
    current_location: string;
    budget: number;
    income: number;
    skills: string[];
    goals: string[];
    family_status: string;
    language_level: Record<string, number>;
}

interface PredictionResult {
    id: string;
    success_score: number;
    final_state: {
        happiness: number;
        financial_health: number;
        social_integration: number;
        career_progress: number;
        language_progress: number;
        visa_status: string;
        network_size: number;
    };
    key_events: Array<{ id: string; type: string; description: string; impact: number }>;
    recommendations: Array<{
        category: string;
        priority: string;
        title: string;
        description: string;
        action: string;
    }>;
    timeline: Array<{ month: number; event: string; impact: number; category: string }>;
    agent_summaries: Array<{
        agent: { type: string; name: string; personality: string };
        total_interactions: number;
        key_insights: string[];
        relationship_to_user: string;
    }>;
}

const scenarios = [
    { id: "relocation", label: "Déménagement", icon: Building2, desc: "Prédire votre intégration dans un nouveau pays" },
    { id: "career", label: "Carrière", icon: Briefcase, desc: "Évolution professionnelle et opportunités" },
    { id: "investment", label: "Investissement", icon: Wallet, desc: " projections financières à long terme" },
    { id: "lifestyle", label: "Mode de vie", icon: Heart, desc: "Qualité de vie et bien-être" },
    { id: "social", label: "Social", icon: Network, desc: "Réseau et relations sociales" },
];

const destinations = [
    { id: "portugal", name: "Portugal", flag: "🇵🇹" },
    { id: "dubai", name: "Dubaï", flag: "🇦🇪" },
    { id: "thailand", name: "Thaïlande", flag: "🇹🇭" },
    { id: "singapore", name: "Singapour", flag: "🇸🇬" },
    { id: "spain", name: "Espagne", flag: "🇪🇸" },
    { id: "mexico", name: "Mexique", flag: "🇲🇽" },
];

const skillsList = [
    "Développement Web", "Marketing Digital", "Design", "Gestion de projet",
    "Data Science", "Communication", "Sales", "Finance", "Langues", "Leadership"
];

export default function PredictPage() {
    const [step, setStep] = useState<"query" | "profile" | "simulating" | "results">("query");
    const [query, setQuery] = useState("");
    const [scenario, setScenario] = useState<ScenarioType>("relocation");
    const [destination, setDestination] = useState("portugal");
    const [timeHorizon, setTimeHorizon] = useState(12);
    
    const [profile, setProfile] = useState<UserProfile>({
        nationality: "française",
        current_location: "France",
        budget: 2000,
        income: 3500,
        skills: [],
        goals: ["Expérience internationale", "Équilibre vie pro/perso"],
        family_status: "célibataire",
        language_level: { en: 70 },
    });
    const [isSimulating, setIsSimulating] = useState(false);
    const [result, setResult] = useState<PredictionResult | null>(null);

    const toggleSkill = (skill: string) => {
        setProfile(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }));
    };

    const runSimulation = useCallback(async () => {
        if (!query.trim() || profile.skills.length === 0) return;
        
        setIsSimulating(true);
        setStep("simulating");

        try {
            const res = await fetch("/api/simulation/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query,
                    user_profile: profile,
                    scenario,
                    destination,
                    time_horizon: timeHorizon,
                    rounds: 50,
                }),
            });

            const data = await res.json();
            if (data.prediction) {
                setResult(data.prediction);
                setStep("results");
            }
        } catch (error) {
            console.error("Simulation error:", error);
        } finally {
            setIsSimulating(false);
        }
    }, [query, profile, scenario, destination, timeHorizon]);

    const getScoreColor = (score: number) => {
        if (score >= 70) return "text-[var(--success)]";
        if (score >= 40) return "text-[var(--secondary)]";
        return "text-[var(--error)]";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 70) return "Excellent";
        if (score >= 50) return "Bon";
        if (score >= 30) return "Modéré";
        return "Risqué";
    };

    const sharePrediction = async () => {
        if (!result) return;
        
        const shareData = {
            score: result.success_score,
            destination,
            scenario,
            timeHorizon,
            label: getScoreLabel(result.success_score),
        };
        
        const shareText = `🎯 Ma prédiction Odyssey: ${shareData.score}/100 (${shareData.label})
🌍 Destination: ${destinations.find(d => d.id === destination)?.name || destination}
📅 Horizon: ${timeHorizon} mois
🔮 Scenario: ${scenarios.find(s => s.id === scenario)?.label}

Teste aussi: https://odyssey-ai.app/simulator/predict`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Ma Prédiction Odyssey',
                    text: shareText,
                    url: window.location.origin + '/simulator/predict',
                });
            } catch (e) {
                // User cancelled or error
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(shareText);
                alert('Copié dans le presse-papiers!');
            } catch (e) {
                console.error('Copy failed:', e);
            }
        }
    };

    const exportReport = () => {
        if (!result) return;
        
        const reportText = `
🎯 RAPPORT DE PRÉDICTION - ODYSSEY.AI
═══════════════════════════════════════

📊 SCORE DE SUCCÈS: ${result.success_score}/100 (${getScoreLabel(result.success_score)})

🌍 PARAMÈTRES:
- Destination: ${destinations.find(d => d.id === destination)?.name || destination}
- Scenario: ${scenarios.find(s => s.id === scenario)?.label}
- Horizon: ${timeHorizon} mois
- Question: ${query.slice(0, 100)}...

📈 MÉTRIQUES:
- Bonheur: ${result.final_state.happiness}/100
- Finance: ${result.final_state.financial_health}/100
- Social: ${result.final_state.social_integration}/100
- Carrière: ${result.final_state.career_progress}/100
- Langue: ${result.final_state.language_progress}/100

💡 RECOMMANDATIONS:
${result.recommendations.map((r, i) => `${i+1}. [${r.priority.toUpperCase()}] ${r.title}: ${r.action}`).join('\n')}

🔮 ÉVÉNEMENTS CLÉS:
${result.key_events.slice(0, 5).map((e, i) => `${i+1}. ${e.description}`).join('\n')}

═══════════════════════════════════════
Généré par Odyssey.ai - Life Operating System
        `.trim();
        
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prediction-odyssey-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="absolute top-1/4 -left-1/4 w-[1000px] h-[600px] bg-gradient-to-r from-[rgba(143,245,255,0.08)] via-[rgba(172,137,255,0.06)] to-transparent blur-3xl pointer-events-none" />
            
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 relative z-10">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-2)] border border-[var(--primary)]/30 text-xs font-mono-tech text-[var(--primary)] mb-6 backdrop-blur-md">
                            <Sparkles className="w-3 h-3" />
                            MIROFISH INSPIRED ENGINE
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-0)] mb-4 font-display">
                            Prédire <span className="text-gradient-primary">Votre Avenir</span>
                        </h1>
                        <p className="text-lg text-[var(--text-2)] max-w-2xl mx-auto font-body">
                            Lancez une simulation multi-agents pour voir comment votre vie pourrait évoluer.
                            Inspired par la technologie de MiroFish (49.8k ⭐)
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === "query" && (
                            <motion.div
                                key="query"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-3xl mx-auto space-y-8"
                            >
                                {/* Question Input */}
                                <div className="glass-panel p-8">
                                    <label className="block text-sm font-medium text-[var(--text-1)] mb-4 font-label">
                                        <Brain className="w-4 h-4 inline mr-2" />
                                        Quelle question souhaitez-vous explorer?
                                    </label>
                                    <textarea
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Ex: Si je déménage à Lisbonne en 2025, quelle sera ma trajectoire professionnelle et sociale sur 2 ans?"
                                        className="w-full h-32 px-4 py-3 bg-[var(--bg-3)] border border-[var(--border-0)] rounded-xl text-[var(--text-0)] placeholder:text-[var(--text-3)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none font-body resize-none"
                                    />
                                </div>

                                {/* Scenario Selection */}
                                <div className="glass-panel p-8">
                                    <label className="block text-sm font-medium text-[var(--text-1)] mb-4 font-label">
                                        <Target className="w-4 h-4 inline mr-2" />
                                        Type de scénario
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {scenarios.map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => setScenario(s.id as ScenarioType)}
                                                className={`p-4 rounded-xl border text-left transition-all ${scenario === s.id ? 'border-[var(--primary)] bg-[var(--primary)]/10' : 'border-[var(--border-0)] bg-[var(--bg-2)] hover:border-[var(--border-1)]'}`}
                                            >
                                                <s.icon className={`w-6 h-6 mb-2 ${scenario === s.id ? 'text-[var(--primary)]' : 'text-[var(--text-2)]'}`} />
                                                <span className="text-sm font-medium text-[var(--text-0)]">{s.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Destination */}
                                <div className="glass-panel p-8">
                                    <label className="block text-sm font-medium text-[var(--text-1)] mb-4 font-label">
                                        <Globe className="w-4 h-4 inline mr-2" />
                                        Destination
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {destinations.map((d) => (
                                            <button
                                                key={d.id}
                                                onClick={() => setDestination(d.id)}
                                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${destination === d.id ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border-0)] bg-[var(--bg-2)] text-[var(--text-2)]'}`}
                                            >
                                                {d.flag} {d.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Time Horizon */}
                                <div className="glass-panel p-8">
                                    <label className="block text-sm font-medium text-[var(--text-1)] mb-4 font-label">
                                        <Clock className="w-4 h-4 inline mr-2" />
                                        Horizon temporel: {timeHorizon} mois
                                    </label>
                                    <input
                                        type="range"
                                        min="6"
                                        max="60"
                                        value={timeHorizon}
                                        onChange={(e) => setTimeHorizon(Number(e.target.value))}
                                        className="w-full h-2 bg-[var(--bg-3)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                                    />
                                    <div className="flex justify-between text-xs text-[var(--text-3)] mt-2">
                                        <span>6 mois</span>
                                        <span>5 ans</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep("profile")}
                                    disabled={!query.trim()}
                                    className="btn-stitch w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Configurer mon profil <ArrowRight className="w-5 h-5" />
                                    </span>
                                </button>
                            </motion.div>
                        )}

                        {step === "profile" && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-3xl mx-auto space-y-8"
                            >
                                <div className="glass-panel p-8">
                                    <h3 className="text-xl font-bold text-[var(--text-0)] mb-6 font-display">
                                        <Users className="w-5 h-5 inline mr-2 text-[var(--primary)]" />
                                        Profil personnel
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm text-[var(--text-2)] mb-2">Nationalité</label>
                                            <input
                                                type="text"
                                                value={profile.nationality}
                                                onChange={(e) => setProfile(p => ({ ...p, nationality: e.target.value }))}
                                                className="w-full px-3 py-2 bg-[var(--bg-3)] border border-[var(--border-0)] rounded-lg text-[var(--text-0)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-[var(--text-2)] mb-2">Situation familiale</label>
                                            <select
                                                value={profile.family_status}
                                                onChange={(e) => setProfile(p => ({ ...p, family_status: e.target.value }))}
                                                className="w-full px-3 py-2 bg-[var(--bg-3)] border border-[var(--border-0)] rounded-lg text-[var(--text-0)]"
                                            >
                                                <option value="célibataire">Célibataire</option>
                                                <option value="en couple">En couple</option>
                                                <option value="famille">Famille avec enfants</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-[var(--text-2)] mb-2">Budget mensuel (€)</label>
                                            <input
                                                type="number"
                                                value={profile.budget}
                                                onChange={(e) => setProfile(p => ({ ...p, budget: Number(e.target.value) }))}
                                                className="w-full px-3 py-2 bg-[var(--bg-3)] border border-[var(--border-0)] rounded-lg text-[var(--text-0)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-[var(--text-2)] mb-2">Revenu mensuel (€)</label>
                                            <input
                                                type="number"
                                                value={profile.income}
                                                onChange={(e) => setProfile(p => ({ ...p, income: Number(e.target.value) }))}
                                                className="w-full px-3 py-2 bg-[var(--bg-3)] border border-[var(--border-0)] rounded-lg text-[var(--text-0)]"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm text-[var(--text-2)] mb-3">Compétences</label>
                                        <div className="flex flex-wrap gap-2">
                                            {skillsList.map((skill) => (
                                                <button
                                                    key={skill}
                                                    onClick={() => toggleSkill(skill)}
                                                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${profile.skills.includes(skill) ? 'bg-[var(--primary)] text-[var(--bg-0)]' : 'bg-[var(--bg-3)] text-[var(--text-2)] border border-[var(--border-0)]'}`}
                                                >
                                                    {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[var(--text-2)] mb-2">Niveau anglais (%)</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={profile.language_level.en || 0}
                                            onChange={(e) => setProfile(p => ({ ...p, language_level: { en: Number(e.target.value) } }))}
                                            className="w-full h-2 bg-[var(--bg-3)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                                        />
                                        <span className="text-sm text-[var(--text-1)]">{profile.language_level.en}%</span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep("query")}
                                        className="flex-1 py-4 border border-[var(--border-0)] rounded-xl text-[var(--text-1)] hover:bg-[var(--bg-2)] transition-colors"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        onClick={runSimulation}
                                        disabled={profile.skills.length === 0}
                                        className="flex-[2] btn-stitch disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <Sparkles className="w-5 h-5" />
                                            Lancer la simulation
                                        </span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === "simulating" && (
                            <motion.div
                                key="simulating"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="max-w-2xl mx-auto text-center py-20"
                            >
                                <div className="relative w-32 h-32 mx-auto mb-8">
                                    <div className="absolute inset-0 border-4 border-[var(--primary)]/30 rounded-full" />
                                    <div className="absolute inset-0 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                                    <Brain className="absolute inset-0 m-auto w-12 h-12 text-[var(--primary)]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[var(--text-0)] mb-4 font-display">
                                    Simulation en cours...
                                </h3>
                                <p className="text-[var(--text-2)] mb-6 font-body">
                                    {isSimulating ? "Les agents interagissent pour prédire votre scénario..." : "Génération du rapport..."}
                                </p>
                                <div className="flex justify-center gap-2">
                                    {[0, 1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="w-3 h-3 bg-[var(--primary)] rounded-full animate-bounce"
                                            style={{ animationDelay: `${i * 0.2}s` }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === "results" && result && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                {/* Score Overview */}
                                <div className="glass-panel p-8 text-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-2)] border border-[var(--border-0)] text-xs font-mono-tech text-[var(--primary)] mb-6">
                                        <TrendingUp className="w-3 h-3" />
                                        SCORE DE SUCCÈS
                                    </div>
                                    <div className="text-8xl font-bold mb-2 font-display">
                                        <span className={getScoreColor(result.success_score)}>{result.success_score}</span>
                                        <span className="text-4xl text-[var(--text-2)]">/100</span>
                                    </div>
                                    <p className="text-xl text-[var(--text-1)] font-medium">{getScoreLabel(result.success_score)}</p>
                                    
                                    <div className="flex justify-center gap-6 mt-8">
                                        <button onClick={sharePrediction} className="btn-stitch flex items-center gap-2">
                                            <Share2 className="w-4 h-4" />
                                            Partager
                                        </button>
                                        <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2 border border-[var(--border-0)] rounded-lg text-[var(--text-1)] hover:bg-[var(--bg-2)]">
                                            <Download className="w-4 h-4" />
                                           Exporter
                                        </button>
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: "Bonheur", value: result.final_state.happiness, icon: Heart },
                                        { label: "Finance", value: result.final_state.financial_health, icon: Wallet },
                                        { label: "Social", value: result.final_state.social_integration, icon: Network },
                                        { label: "Carrière", value: result.final_state.career_progress, icon: Briefcase },
                                    ].map((m) => (
                                        <div key={m.label} className="glass-panel p-6 text-center">
                                            <m.icon className="w-6 h-6 mx-auto mb-2 text-[var(--primary)]" />
                                            <p className="text-3xl font-bold text-[var(--text-0)] font-mono-tech">{m.value}</p>
                                            <p className="text-sm text-[var(--text-2)]">{m.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Recommendations */}
                                <div className="glass-panel p-8">
                                    <h3 className="text-xl font-bold text-[var(--text-0)] mb-6 font-display">
                                        <Star className="w-5 h-5 inline mr-2 text-[var(--secondary)]" />
                                        Recommandations
                                    </h3>
                                    <div className="space-y-4">
                                        {result.recommendations.map((rec, i) => (
                                            <div key={i} className="p-4 bg-[var(--bg-2)] rounded-xl border border-[var(--border-0)]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded ${rec.priority === 'high' ? 'bg-[var(--error)]/20 text-[var(--error)]' : rec.priority === 'medium' ? 'bg-[var(--secondary)]/20 text-[var(--secondary)]' : 'bg-[var(--text-3)]/20 text-[var(--text-2)]'}`}>
                                                        {rec.priority}
                                                    </span>
                                                    <span className="text-sm text-[var(--text-2)]">{rec.category}</span>
                                                </div>
                                                <h4 className="font-bold text-[var(--text-0)] mb-1">{rec.title}</h4>
                                                <p className="text-sm text-[var(--text-2)] mb-2">{rec.description}</p>
                                                <p className="text-sm text-[var(--primary)]">→ {rec.action}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Key Events */}
                                <div className="glass-panel p-8">
                                    <h3 className="text-xl font-bold text-[var(--text-0)] mb-6 font-display">
                                        <Clock className="w-5 h-5 inline mr-2 text-[var(--primary)]" />
                                        Événements clés
                                    </h3>
                                    <div className="space-y-3">
                                        {result.key_events.slice(0, 5).map((evt, i) => (
                                            <div key={i} className="flex items-center gap-4 p-3 bg-[var(--bg-2)] rounded-lg">
                                                <div className={`w-2 h-2 rounded-full ${evt.impact > 0.4 ? 'bg-[var(--success)]' : evt.impact > 0.2 ? 'bg-[var(--secondary)]' : 'bg-[var(--error)]'}`} />
                                                <span className="flex-1 text-sm text-[var(--text-1)]">{evt.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Agents Summary */}
                                <div className="glass-panel p-8">
                                    <h3 className="text-xl font-bold text-[var(--text-0)] mb-6 font-display">
                                        <Users className="w-5 h-5 inline mr-2 text-[var(--secondary)]" />
                                        Agents clés simulés
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {result.agent_summaries.slice(0, 4).map((agent, i) => (
                                            <div key={i} className="p-4 bg-[var(--bg-2)] rounded-xl border border-[var(--border-0)]">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-[var(--primary)]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[var(--text-0)]">{agent.agent.name}</p>
                                                        <p className="text-xs text-[var(--text-2)]">{agent.agent.type}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-[var(--text-2)] italic">"{agent.agent.personality}"</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded ${agent.relationship_to_user === 'allié' ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--text-3)]/20 text-[var(--text-2)]'}`}>
                                                        {agent.relationship_to_user}
                                                    </span>
                                                    <span className="text-xs text-[var(--text-3)]">{agent.total_interactions} interactions</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setStep("query"); setResult(null); }}
                                    className="btn-stitch w-full py-4"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <Brain className="w-5 h-5" />
                                        Nouvelle simulation
                                    </span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}