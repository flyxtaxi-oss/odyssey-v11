"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Globe2, ArrowUpRight, Check } from "lucide-react";
import { AUDIENCES, type Audience } from "@/lib/maroc-data";
import { DIMENSIONS } from "@/lib/maroc-serenite";
import { rankDestinations, marocRank } from "@/lib/expat-destinations";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

function scoreColor(v: number): string {
  if (v >= 85) return "#00875a";
  if (v >= 70) return "#16a34a";
  if (v >= 55) return "#d97706";
  return "#dc2626";
}

export default function ComparateurPage() {
  const [audience, setAudience] = useState<Audience>("etranger");

  const ranked = useMemo(() => rankDestinations(audience), [audience]);
  const maroc = useMemo(() => marocRank(audience), [audience]);

  return (
    <motion.main
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto px-4 py-10 space-y-10"
    >
      {/* ─── HEADER ─── */}
      <motion.header variants={fadeUp} className="space-y-4">
        <Link href="/maroc" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
          <ArrowLeft size={15} /> Hub Maroc
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #006233, #00875a)" }}>
            <Globe2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-0)]">Maroc vs le reste du monde</h1>
            <p className="text-sm text-[var(--text-3)]">Le comparatif honnête des destinations d&apos;expatriation.</p>
          </div>
        </div>
        <p className="text-[var(--text-2)] leading-relaxed max-w-3xl">
          On ne te raconte pas que le Maroc gagne partout. Choisis ton profil : chaque pays est noté
          sur les 7 mêmes axes, pondérés selon ce qui compte pour toi. À toi l&apos;arbitrage.
        </p>
        <div className="glass-panel p-4 inline-flex items-center gap-2 text-sm">
          <span className="text-xl">🇲🇦</span>
          <span className="text-[var(--text-2)]">
            Pour ce profil, le Maroc est <strong className="text-[var(--text-0)]">#{maroc.rank}/{maroc.total}</strong> avec <strong style={{ color: scoreColor(maroc.score) }}>{maroc.score}/100</strong>.
          </span>
        </div>
      </motion.header>

      {/* ─── AUDIENCE ─── */}
      <motion.section variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {AUDIENCES.map((a) => {
          const active = a.id === audience;
          return (
            <button
              key={a.id}
              onClick={() => setAudience(a.id)}
              className="text-left rounded-2xl p-4 transition-all"
              style={{
                background: active ? "var(--bg-2)" : "var(--bg-1)",
                border: active ? "2px solid var(--primary)" : "1px solid var(--border-1)",
              }}
            >
              <span className="text-xl mr-2">{a.emoji}</span>
              <span className="font-bold text-sm text-[var(--text-0)]">{a.label}</span>
            </button>
          );
        })}
      </motion.section>

      {/* ─── RANKING CARDS ─── */}
      <motion.section variants={fadeUp} className="space-y-3">
        {ranked.map((d, i) => {
          const isMaroc = d.id === "maroc";
          return (
            <div
              key={d.id}
              className="glass-panel p-5 md:p-6"
              style={{ border: isMaroc ? "2px solid var(--primary)" : "1px solid var(--border-1)" }}
            >
              <div className="flex items-center gap-4">
                <div className="text-sm font-bold w-6 text-[var(--text-3)]">#{i + 1}</div>
                <div className="text-3xl">{d.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[var(--text-0)]">{d.name}</span>
                    <span className="text-xs text-[var(--text-3)]">{d.region}</span>
                    {isMaroc && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: "var(--bg-2)", color: "var(--primary)" }}>Notre hub</span>}
                  </div>
                  <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-2)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.score}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: scoreColor(d.score) }}
                    />
                  </div>
                </div>
                <div className="text-2xl font-extrabold tabular-nums" style={{ color: scoreColor(d.score) }}>{d.score}</div>
              </div>

              {/* facts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                <Fact label="Budget / mois" value={`~${d.facts.monthlyEur.toLocaleString("fr-FR")} €`} />
                <Fact label="Installation" value={"●".repeat(d.facts.visaEase) + "○".repeat(3 - d.facts.visaEase)} />
                <Fact label="Langues" value={d.facts.languages} />
                <Fact label="Décalage Paris" value={d.facts.tzOffsetVsParis === 0 ? "même heure" : `${d.facts.tzOffsetVsParis > 0 ? "+" : ""}${d.facts.tzOffsetVsParis}h`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="text-sm text-[var(--text-1)] flex gap-2"><Check size={15} className="mt-0.5 shrink-0" style={{ color: "#16a34a" }} /> {d.highlight}</div>
                <div className="text-sm text-[var(--text-2)] flex gap-2"><span className="shrink-0">⚠️</span> {d.watchout}</div>
              </div>

              <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
                <span className="text-[11px] text-[var(--text-3)]">Fiscalité : {d.facts.tax}</span>
                {d.href && (
                  <Link href={d.href} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline">
                    Explorer {d.name} <ArrowUpRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </motion.section>

      {/* ─── AXES LEGEND ─── */}
      <motion.section variants={fadeUp} className="glass-panel p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-3">Les 7 axes notés</div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--text-2)]">
          {DIMENSIONS.map((d) => (
            <span key={d.id} title={d.hint}>{d.emoji} {d.label}</span>
          ))}
        </div>
      </motion.section>

      {/* ─── CTA + DISCLAIMER ─── */}
      <motion.section variants={fadeUp} className="space-y-4">
        <Link href="/jarvis" className="glass-panel p-5 flex items-center gap-3 group hover:scale-[1.01] transition-transform">
          <Globe2 className="w-5 h-5 text-[var(--primary)]" />
          <div className="flex-1">
            <div className="font-bold text-[var(--text-0)]">Hésitation entre deux pays ?</div>
            <div className="text-sm text-[var(--text-2)]">J.A.R.V.I.S. tranche selon ta situation (budget, famille, fiscalité, objectif).</div>
          </div>
        </Link>
        <p className="text-xs text-[var(--text-3)] leading-relaxed">
          Scores & chiffres = estimations expertes 2026 (ordre de grandeur, non contractuel). Le classement
          dépend de ton profil : aucun pays n&apos;est « le meilleur » dans l&apos;absolu. Les règles de visa et de
          fiscalité évoluent — vérifie toujours la source officielle avant de décider.
        </p>
      </motion.section>
    </motion.main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "var(--bg-1)", border: "1px solid var(--border-1)" }}>
      <div className="text-[11px] text-[var(--text-3)] uppercase tracking-wide">{label}</div>
      <div className="text-[var(--text-0)] font-semibold mt-0.5">{value}</div>
    </div>
  );
}
