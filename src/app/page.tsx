"use client";

import { motion, useMotionValue, useSpring, useTransform, animate, Variants } from "framer-motion";
import {
  Brain, Globe, Users, Target, Activity, Sparkles, MessageSquare, Zap, ArrowUpRight, CheckCircle2, Mic, Send, Cpu
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

/* ─── 1. Animated Tech Counter ─── */
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 3,
      ease: [0.16, 1, 0.3, 1],
    });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [value, count, rounded]);

  return <span className="font-mono-tech tabular-nums">{display.toLocaleString()}{suffix}</span>;
}

/* ─── 2. 3D Tilt Card Component ─── */
function TiltCard({ children, className, href }: { children: React.ReactNode; className?: string; href?: string }) {
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
    x.set(e.clientX / rect.width - 0.5);
    y.set(e.clientY / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const CardContent = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative h-full transition-shadow duration-500 hover:shadow-[0_0_50px_-15px_rgba(143,245,255,0.3)] ${className}`}
    >
      <div className="absolute inset-0 bg-[var(--bg-2)]/60 rounded-[20px] border border-[var(--border-0)] backdrop-blur-xl" />
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
      <div
        className="relative h-full p-6 sm:p-8 flex flex-col justify-between"
        style={{ transform: "translateZ(40px)" }}
      >
        {children}
      </div>
    </motion.div>
  );

  return href ? (
    <Link href={href} className="block h-full perspective-1000 group">{CardContent}</Link>
  ) : (
    <div className="h-full perspective-1000 group">{CardContent}</div>
  );
}

/* ─── Mock Data ─── */
const FALLBACK_DATA = {
  odyssey_score: 912,
  sync_level: 99,
  network_nodes: 156,
  cognitive_load: 18,
  activity: [
    { text: "Vertex AI Engine Unlocked & Synced", time: "Just now", icon: Cpu, gradient: "from-[var(--primary)] to-[var(--primary-dim)]" },
    { text: "J.A.R.V.I.S. optimized daily schedule", time: "1h ago", icon: Brain, gradient: "from-[var(--secondary)] to-[var(--secondary-dim)]" },
    { text: "Language Lab: Japanese Mastery +2%", time: "3h ago", icon: MessageSquare, gradient: "from-[var(--success)] to-[#059669]" },
    { text: "SEO Geo-routing deployed globally", time: "5h ago", icon: Globe, gradient: "from-[var(--tertiary)] to-[var(--tertiary-dim)]" },
  ]
};

const subsystems = [
  { id: "jarvis", label: "J.A.R.V.I.S. Core", desc: "Powered by Gemini 1.5", icon: Brain, href: "/jarvis", status: "Vertex Active", color: "var(--secondary)" },
  { id: "simulator", label: "Life Simulator", desc: "Trajectory Mapping", icon: Target, href: "/simulator", status: "Ready", color: "var(--primary)" },
  { id: "network", label: "Neural Network", desc: "Knowledge Graph", icon: Users, href: "/safezone", status: "Syncing", color: "var(--tertiary)" },
];

export default function StitchDeepSpaceDashboard() {
  const [data] = useState(FALLBACK_DATA);
  const [prompt, setPrompt] = useState("");

  const stagger: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Stitch Nebula Background */}
      <div className="absolute top-0 -left-1/4 w-[150%] h-[500px] bg-gradient-to-b from-[rgba(143,245,255,0.06)] via-[rgba(172,137,255,0.04)] to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[rgba(255,89,227,0.04)] rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12 pb-20 relative z-10">

        {/* ─── Global AI Prompt — Stitch Celestial Style ─── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="flex flex-col items-center text-center mx-auto max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-2)] border border-[var(--border-0)] text-xs font-mono-tech text-[var(--primary)] mb-6 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
            </span>
            VERTEX AI SYSTEM NOMINAL
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[var(--text-0)] mb-6 leading-tight font-display">
            Ask <span className="text-gradient-aurora">J.A.R.V.I.S.</span><br />
            Anything.
          </h1>

          {/* Omni Input — Stitch Glass */}
          <div className="relative w-full max-w-2xl group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--tertiary)] rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center bg-[var(--bg-2)]/80 ring-1 ring-[var(--border-0)] rounded-2xl p-2 backdrop-blur-xl">
              <div className="pl-4 pr-2">
                <Sparkles className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Plan my week in Tokyo, analyze my budget, or teach me Kanji..."
                className="w-full bg-transparent border-none outline-none text-[var(--text-1)] placeholder-[var(--text-3)] py-3 text-lg font-light font-body"
              />
              <div className="flex gap-2 pr-2">
                <button title="Voice input" className="p-2 hover:bg-white/[0.05] rounded-xl transition-colors text-[var(--text-3)] hover:text-[var(--primary)]">
                  <Mic className="w-5 h-5" />
                </button>
                <button title="Send" className="p-2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dim)] text-[#005d63] rounded-xl transition-all shadow-lg shadow-[rgba(143,245,255,0.2)] hover:shadow-[rgba(143,245,255,0.4)]">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Stitch Bento Grid ─── */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* System Overview */}
          <motion.div variants={item} className="md:col-span-8 lg:col-span-8 h-[400px]">
            <TiltCard>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-[var(--text-0)] tracking-tight mb-2 font-display">System Overview</h2>
                  <p className="text-[var(--text-2)] font-light font-body">Your life trajectory is accelerating. You are in the top 1%.</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg shadow-[rgba(143,245,255,0.2)]">
                  <Activity className="w-8 h-8 text-[#005d63]" />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-auto">
                <div>
                  <p className="text-sm font-medium text-[var(--text-3)] mb-1 uppercase tracking-widest font-label">Odyssey Score</p>
                  <p className="text-5xl font-bold text-gradient-primary font-mono-tech drop-shadow-sm">
                    <AnimatedCounter value={data.odyssey_score} />
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-3)] mb-1 uppercase tracking-widest font-label">Sync Level</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-5xl font-bold text-[var(--text-0)] font-mono-tech"><AnimatedCounter value={data.sync_level} /></p>
                    <span className="text-xl text-[var(--text-2)]">%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-3)] mb-1 uppercase tracking-widest font-label">Network Nodes</p>
                  <p className="text-5xl font-bold text-[var(--text-0)] font-mono-tech"><AnimatedCounter value={data.network_nodes} /></p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-3)] mb-1 uppercase tracking-widest font-label">Cognitive Load</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-5xl font-bold text-[var(--success)] font-mono-tech"><AnimatedCounter value={data.cognitive_load} /></p>
                    <span className="text-xl text-[var(--success)]/50">%</span>
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Vertex AI Status */}
          <motion.div variants={item} className="md:col-span-4 lg:col-span-4 h-[400px]">
            <TiltCard>
              <div className="flex items-center gap-3 mb-6">
                <Cpu className="w-6 h-6 text-[var(--primary)]" />
                <h3 className="text-lg font-bold text-[var(--text-0)] uppercase tracking-widest font-display">Vertex AI Core</h3>
              </div>

              <div className="space-y-6 flex-1 flex flex-col justify-center">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-2)] font-body">Model Inference</span>
                    <span className="text-[var(--primary)] font-mono-tech">Gemini 1.5 Pro</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg-void)] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2, delay: 0.5 }} className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dim)] rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-2)] font-body">Vector Search</span>
                    <span className="text-[var(--success)] font-mono-tech">Active</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg-void)] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2, delay: 0.7 }} className="h-full bg-[var(--success)] rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-2)] font-body">Context Cache</span>
                    <span className="text-[var(--secondary)] font-mono-tech">Optimized</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg-void)] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} transition={{ duration: 2, delay: 0.9 }} className="h-full bg-gradient-to-r from-[var(--secondary)] to-[var(--secondary-dim)] rounded-full" />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button className="btn-stitch w-full py-3 text-sm font-bold uppercase tracking-widest">
                  VIEW AI LOGS
                </button>
              </div>
            </TiltCard>
          </motion.div>

          {/* Subsystems Row */}
          {subsystems.map((sys) => (
            <motion.div variants={item} key={sys.id} className="md:col-span-4 lg:col-span-4 h-[200px]">
              <TiltCard href={sys.href}>
                <div className="flex justify-between items-start mb-2">
                  <div className="p-3 rounded-2xl border border-[var(--border-0)]" style={{ background: `${sys.color}10` }}>
                    <sys.icon className="w-6 h-6" style={{ color: sys.color }} />
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border font-label uppercase tracking-wider"
                    style={{ background: `${sys.color}10`, color: sys.color, borderColor: `${sys.color}30` }}>
                    <CheckCircle2 className="w-3 h-3" /> {sys.status}
                  </div>
                </div>
                <div className="mt-auto">
                  <h3 className="text-xl font-bold text-[var(--text-0)] mb-1 group-hover:text-[var(--primary)] transition-colors flex items-center gap-2 font-display">
                    {sys.label} <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </h3>
                  <p className="text-sm text-[var(--text-2)] font-body">{sys.desc}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}

          {/* Activity Log */}
          <motion.div variants={item} className="md:col-span-12 h-auto">
            <TiltCard>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-0)] mb-1 font-display">Recent Activity</h2>
                  <p className="text-sm text-[var(--text-2)] font-body">Live feed from all connected systems and agents.</p>
                </div>
                <button className="btn-stitch text-sm">
                  View Full History
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.activity.map((act, i) => (
                  <div key={i} className="group/item flex flex-col p-4 rounded-2xl border border-[var(--border-0)] bg-[var(--bg-1)]/40 hover:bg-[var(--bg-3)]/40 transition-colors relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${act.gradient} flex items-center justify-center mb-4`}>
                      <act.icon className="w-5 h-5 text-[#005d63]" />
                    </div>
                    <p className="text-sm text-[var(--text-1)] font-medium leading-snug mb-3 flex-1 font-body">{act.text}</p>
                    <p className="text-xs text-[var(--text-3)] font-mono-tech">{act.time}</p>
                  </div>
                ))}
              </div>
            </TiltCard>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
