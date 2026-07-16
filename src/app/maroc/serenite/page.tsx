"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { AUDIENCES, type Audience } from "@/lib/maroc-data";
import { rankCities, computeSerenity } from "@/lib/maroc-serenite";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function SerenitePage() {
  const [audience, setAudience] = useState<Audience>("etranger");
  const [selected, setSelected] = useState<string>("marrakech");

  const ranked = useMemo(() => rankCities(audience), [audience]);
  const detail = useMemo(() => computeSerenity(selected, audience), [selected, audience]);

  return (
    <motion.main
      variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto px-4 py-10 space-y-12"
    >
      {/* ─── HEADER ─── */}
      <motion.header variants={fadeUp} className="space-y-4">
        <Link href="/maroc" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
          <ArrowLeft size={15} /> Hub Maroc
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #006233, #00875a)" }}>
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-0)]">Indice de Sérénité</h1>
            <p className="text-sm text-[var(--text-3)]">Où seras-tu le plus serein au Maroc ? 7 axes, ton profil.</p>
          </div>
        </div>
        <p className="text-[var(--text-2)] leading-relaxed max-w-3xl">
          Un score 0–100 par ville, pondéré selon ce qui compte <em>pour toi</em>. Choisis ton profil :
          les axes se repondèrent automatiquement (un retraité ne valorise pas la connectivité comme un nomade).
        </p>
      </motion.header>

      {/* ─── AUDIENCE SELECTOR ─── */}
      <motion.section variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {AUDIENCES.map((a) => {
          const active = a.id === audience;
          return (
            <button
              key={a.id}
              onClick={() => setAudience(a.id)}
              className="text-left rounded-2xl p-5 transition-all"
              style={{
                background: active ? "var(--bg-2)" : "var(--bg-1)",
                border: active ? "2px solid var(--primary)" : "1px solid var(--border-1)",
              }}
            >
              <div className="text-2xl mb-2">{a.emoji}</div>
              <div className="font-bold text-sm text-[var(--text-0)]">{a.label}</div>
            </button>
          );
        })}
      </motion.section>

      {/* ─── RANKING ─── */}
      <motion.section variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text-0)]">Classement des villes</h2>
          <span className="tag-cyber">{ranked.length} villes</span>
        </div>
        <div className="space-y-3">
          {ranked.map((r, i) => {
            const isSel = r.citySlug === selected;
            return (
              <button
                key={r.citySlug}
                onClick={() => setSelected(r.citySlug)}
                className="w-full text-left glass-panel p-4 md:p-5 transition-all hover:scale-[1.01]"
                style={{ border: isSel ? "2px solid var(--primary)" : "1px solid var(--border-1)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm font-bold w-6 text-[var(--text-3)]">#{i + 1}</div>
                  <div className="text-2xl">{r.cityEmoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-[var(--text-0)]">{r.cityName}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: "var(--bg-2)", color: r.band.color }}>
                        {r.band.label}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-2)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.score}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: r.band.color }}
                      />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold tabular-nums" style={{ color: r.band.color }}>
                    {r.score}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* ─── DETAIL (selected city) ─── */}
      <motion.section variants={fadeUp} className="glass-panel p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-bold text-[var(--text-0)] flex items-center gap-2">
            <span className="text-2xl">{detail.cityEmoji}</span> {detail.cityName} — détail des 7 axes
          </h2>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold" style={{ color: detail.band.color }}>{detail.score}</span>
            <span className="text-sm text-[var(--text-3)]">/100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {detail.dimensions.map((d) => (
            <div key={d.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-1)] font-medium" title={d.hint}>{d.emoji} {d.label}</span>
                <span className="tabular-nums text-[var(--text-2)] font-semibold">{d.value}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-2)" }}>
                <motion.div
                  key={`${detail.citySlug}-${d.id}-${d.value}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${d.value}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: scoreColor(d.value) }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl p-4" style={{ background: "var(--bg-1)", border: "1px solid var(--border-1)" }}>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-2">✅ Forces</div>
            <ul className="text-sm text-[var(--text-1)] space-y-1">
              {detail.strengths.map((s) => <li key={s.id}>{s.emoji} {s.label} — <strong>{s.value}</strong></li>)}
            </ul>
          </div>
          <div className="rounded-xl p-4" style={{ background: "var(--bg-1)", border: "1px solid var(--border-1)" }}>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-2">⚠️ Points de vigilance</div>
            <ul className="text-sm text-[var(--text-1)] space-y-1">
              {detail.watchouts.map((w) => <li key={w.id}>{w.emoji} {w.label} — <strong>{w.value}</strong></li>)}
            </ul>
          </div>
        </div>
      </motion.section>

      {/* ─── CTA + DISCLAIMER ─── */}
      <motion.section variants={fadeUp} className="space-y-4">
        <Link
          href="/jarvis"
          className="glass-panel p-5 flex items-center gap-3 group hover:scale-[1.01] transition-transform"
        >
          <Sparkles className="w-5 h-5 text-[var(--primary)]" />
          <div className="flex-1">
            <div className="font-bold text-[var(--text-0)]">Pas sûr de ton choix ?</div>
            <div className="text-sm text-[var(--text-2)]">Demande à J.A.R.V.I.S. de comparer selon ta situation exacte.</div>
          </div>
        </Link>
        <p className="text-xs text-[var(--text-3)] leading-relaxed">
          Scores = estimations expertes 2026 (ordre de grandeur, non contractuel), calibrées à dire d&apos;expert.
          Les axes « pouvoir d&apos;achat » et « connectivité » sont dérivés de la data coût de vie / débit du hub.
          À terme, ces scores intégreront des signaux d&apos;actualité temps réel (cf. Radar de Veille).
        </p>
      </motion.section>
    </motion.main>
  );
}

function scoreColor(v: number): string {
  if (v >= 85) return "#00875a";
  if (v >= 70) return "#16a34a";
  if (v >= 55) return "#d97706";
  return "#dc2626";
}
