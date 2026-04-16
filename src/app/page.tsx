"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Brain,
  Globe,
  Users,
  TrendingUp,
  Zap,
  Target,
  ArrowUpRight,
  Activity,
  Sparkles,
  MessageSquare,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import VisaTracker from "@/components/VisaTracker";
import { NotificationEngine } from "@/lib/notification-engine";

/* ─── Animated Number Counter ─── */
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
    });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [value, count, rounded]);

  return <span className="font-mono-tech">{display.toLocaleString()}{suffix}</span>;
}

/* ─── Types ─── */
type DashboardData = {
  odyssey_score: number;
  odyssey_trend: string;
  mental_clarity: number;
  clarity_status: string;
  countries_simulated: number;
  countries_status: string;
  network_nodes: number;
  network_status: string;
  activity: {
    conversations_today: number;
    posts_this_week: number;
    simulations_run: number;
    badges_earned: number;
  };
  source: string;
};

/* ─── Fallback Data ─── */
const FALLBACK: DashboardData = {
  odyssey_score: 742,
  odyssey_trend: "+12",
  mental_clarity: 82,
  clarity_status: "synced",
  countries_simulated: 7,
  countries_status: "en cache",
  network_nodes: 14,
  network_status: "actifs",
  activity: { conversations_today: 3, posts_this_week: 5, simulations_run: 12, badges_earned: 4 },
  source: "static",
};

const engines = [
  {
    label: "J.A.R.V.I.S.",
    desc: "Intelligence personnelle core",
    href: "/jarvis",
    icon: Brain,
    gradientClass: "module-card-blue",
    tag: "SYS ACTIVE",
  },
  {
    label: "Prédire le Futur",
    desc: "Simulation multi-agents IA",
    href: "/simulator/predict",
    icon: Sparkles,
    gradientClass: "module-card-purple",
    tag: "NEW",
  },
  {
    label: "Simulateur de Vie",
    desc: "Moteur prédictif multipays",
    href: "/simulator",
    icon: Globe,
    gradientClass: "module-card-teal",
    tag: "6 PAYS",
  },
  {
    label: "Visa Tracker",
    desc: "Suivi intelligent des visas",
    href: "/visa",
    icon: Shield,
    gradientClass: "module-card-teal",
    tag: "LIVE",
  },
  {
    label: "Safe-Zone",
    desc: "Réseau crypté modéré",
    href: "/safezone",
    icon: Users,
    gradientClass: "module-card-rose",
    tag: "156 NODES",
  },
  {
    label: "Language Lab",
    desc: "Immersion linguistique & IA",
    href: "/language",
    icon: MessageSquare,
    gradientClass: "module-card-blue",
    tag: "A1 -> C2",
  },
  {
    label: "Skill Accelerator",
    desc: "Apprentissage & Missions XP",
    href: "/skills",
    icon: Target,
    gradientClass: "module-card-teal",
    tag: "MASTERY",
  },
];

const scoreAxes = [
  { label: "Clarté Mentale", value: 82, gradient: "linear-gradient(90deg, #2563EB, #7C3AED)" },
  { label: "Santé Financière", value: 64, gradient: "linear-gradient(90deg, #0D9488, #10B981)" },
  { label: "Mobilité Globale", value: 91, gradient: "linear-gradient(90deg, #4F46E5, #0EA5E9)" },
  { label: "Réseau & Mentors", value: 73, gradient: "linear-gradient(90deg, #7C3AED, #D946EF)" },
  { label: "Exécution & Action", value: 95, gradient: "linear-gradient(90deg, #F43F5E, #F97316)" },
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -6, transition: { type: "spring", stiffness: 400, damping: 20 } },
  tap: { scale: 0.97, transition: { duration: 0.1 } },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>(FALLBACK);
  const [isLive, setIsLive] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) return;
      const json = await res.json();
      setData(json);
      setIsLive(json.source !== "static");
    } catch { /* fallback to static */ }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // Demande la permission pour les alertes J.A.R.V.I.S (Push Notifications)
  useEffect(() => {
    NotificationEngine.requestPushPermission();
  }, []);

  const stats = [
    { label: "Odyssey Score", value: data.odyssey_score, unit: "PTS", icon: Zap, delta: data.odyssey_trend, period: "cette semaine" },
    { label: "Clarté Mentale", value: data.mental_clarity, unit: "%", icon: Brain, delta: "+5", period: data.clarity_status },
    { label: "Pays Simulés", value: data.countries_simulated, unit: "PAYS", icon: Globe, delta: "+2", period: data.countries_status },
    { label: "Connexions", value: data.network_nodes, unit: "NODES", icon: Users, delta: "+3", period: data.network_status },
  ];

  const timeline = [
    { text: `${data.activity.conversations_today} conversations aujourd'hui`, time: "Temps réel", icon: Brain },
    { text: `${data.activity.posts_this_week} posts cette semaine`, time: "Safe-Zone", icon: Users },
    { text: `${data.activity.simulations_run} simulations lancées`, time: "Simulateur", icon: Globe },
    { text: `${data.activity.badges_earned} badges obtenus`, time: "Progression", icon: Sparkles },
  ];
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-16 max-w-7xl mx-auto w-full pt-6 pb-12">
      {/* ─── Hero ─── */}
      <motion.div variants={fadeUp} className="relative mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-emerald)] animate-pulse" />
          <span className="text-sm font-semibold text-[var(--accent-emerald)]">Système en ligne</span>
        </div>
        <h1 className="text-[clamp(3rem,7vw,4.5rem)] font-extrabold tracking-tight leading-[1.05] text-[var(--text-0)]">
          Bonjour, <span className="text-gradient-shimmer">{user?.displayName || user?.email?.split('@')[0] || 'Explorateur'}</span>.
        </h1>
        <p className="text-lg text-[var(--text-3)] mt-4 max-w-xl leading-relaxed">
          Tous vos modules sont synchronisés. Explorez vos données et prenez les meilleures décisions.
        </p>
      </motion.div>

      {/* ─── Stats Grid (Glow Cards) ─── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } },
            }}
            initial="hidden"
            animate="show"
            whileHover="hover"
            whileTap="tap"
            custom={i}
          >
            <div className="glow-card relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="glass-panel p-7 relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ background: 'rgba(37, 99, 235, 0.15)' }}
                  >
                    <s.icon className="w-6 h-6 text-[var(--accent-indigo)]" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-[var(--accent-emerald)] bg-[rgba(16,185,129,0.1)] px-3 py-1.5 rounded-lg">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {s.delta}
                  </div>
                </div>

                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-4xl font-extrabold tracking-tight text-[var(--text-0)]">
                    <AnimatedCounter value={s.value} />
                  </span>
                  <span className="text-sm font-bold text-[var(--text-3)] uppercase">{s.unit}</span>
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--border-0)]">
                  <p className="text-xs text-[var(--text-2)] font-semibold uppercase tracking-wider">{s.label}</p>
                  <p className="text-xs text-[var(--text-3)]">{s.period}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Module Cards (Vibrant Gradient Backgrounds) ─── */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-[var(--text-0)]">Modules Actifs</h2>
          <span className="tag-cyber">6 Modules</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {engines.map((e, i) => (
            <Link key={e.href} href={e.href}>
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  show: { opacity: 1, scale: 1, transition: { delay: i * 0.08, duration: 0.4 } },
                }}
                initial="hidden"
                animate="show"
                whileHover={{ y: -8, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`${e.gradientClass} rounded-[20px] p-7 cursor-pointer group relative h-full min-h-[180px] flex flex-col justify-between shadow-lg`}
              >
                {/* Subtle white overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

                <div className="relative z-10 flex items-center justify-between mb-auto">
                  <motion.div 
                    className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <e.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <span className="text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white">
                    {e.tag}
                  </span>
                </div>

                <div className="relative z-10 mt-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{e.label}</h3>
                    <ArrowUpRight className="w-5 h-5 text-white/60 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                  </div>
                  <p className="text-sm text-white/70 mt-1">{e.desc}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ─── Score + Timeline Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Odyssey Score */}
        <motion.div variants={fadeUp} className="lg:col-span-3">
          <div className="glass-panel p-8">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-[var(--border-0)]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--gradient-blue-purple)' }}>
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-0)]">Sys.Score</h2>
                  <p className="text-sm text-[var(--text-3)] mt-0.5">Performance globale</p>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tight text-[var(--text-0)]">
                  <AnimatedCounter value={742} />
                </span>
                <span className="text-lg font-semibold text-[var(--text-3)]">/1000</span>
              </div>
            </div>

            <div className="space-y-6">
              {scoreAxes.map((axis, i) => (
                <motion.div
                  key={axis.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                >
                  <div className="flex justify-between mb-2.5">
                    <span className="text-sm font-semibold text-[var(--text-2)]">{axis.label}</span>
                    <span className="text-sm font-bold text-[var(--text-0)]">{axis.value}%</span>
                  </div>
                  <div className="h-2.5 bg-[var(--bg-3)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${axis.value}%` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: axis.gradient }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <div className="flex flex-col gap-6 h-full">
            {/* Injection du composant stratégique Visa Tracker */}
            <VisaTracker countryCode="TH" entryDate="2024-03-01" />
            
            <div className="glass-panel p-8 flex-1">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border-0)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(124, 58, 237, 0.15)' }}>
                    <Activity className="w-5 h-5 text-[var(--accent-magenta)]" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-0)]">Activité</h2>
                </div>
                <button className="text-xs font-bold tracking-wider px-4 py-2 rounded-xl bg-[var(--bg-3)] text-[var(--text-1)] hover:text-[var(--text-0)] hover:bg-[var(--bg-4)] transition-colors border border-[var(--border-0)]">
                  TOUT VOIR
                </button>
              </div>

              <div className="space-y-5">
                {timeline.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="group"
                  >
                    <div className="flex items-start gap-4 cursor-pointer p-3 rounded-xl hover:bg-[var(--bg-3)] transition-colors -mx-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[var(--bg-3)] border border-[var(--border-0)] group-hover:border-[var(--border-1)] mt-0.5">
                        <t.icon className="w-4 h-4 text-[var(--text-2)] group-hover:text-[var(--accent-indigo)] transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-1)] group-hover:text-[var(--text-0)] transition-colors leading-snug">
                          {t.text}
                        </p>
                        <p className="text-xs text-[var(--text-3)] mt-1.5">{t.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
