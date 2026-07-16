"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Radar, ArrowUpRight } from "lucide-react";
import { AUDIENCES, type Audience } from "@/lib/maroc-data";
import {
  CATEGORIES,
  STATUS_META,
  filterItems,
  type VeilleCategory,
} from "@/lib/maroc-veille";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export default function VeillePage() {
  const [audience, setAudience] = useState<Audience>("etranger");
  const [category, setCategory] = useState<VeilleCategory | "all">("all");

  const items = useMemo(() => filterItems({ audience, category }), [audience, category]);

  return (
    <motion.main
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto px-4 py-10 space-y-10"
    >
      {/* ─── HEADER ─── */}
      <motion.header variants={fadeUp} className="space-y-4">
        <Link href="/maroc" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
          <ArrowLeft size={15} /> Hub Maroc
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #006233, #00875a)" }}>
            <Radar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-0)]">Radar de Veille</h1>
            <p className="text-sm text-[var(--text-3)]">Ce qui change — ou va changer — pour toi au Maroc.</p>
          </div>
        </div>
        <p className="text-[var(--text-2)] leading-relaxed max-w-3xl">
          Chaque info porte un <strong>statut honnête</strong> : une réforme « proposée » n&apos;est jamais
          présentée comme un droit en vigueur. Plus une phrase d&apos;enjeu : <em>pourquoi ça te concerne</em>.
        </p>
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

      {/* ─── CATEGORY FILTER ─── */}
      <motion.section variants={fadeUp} className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("all")}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: category === "all" ? "var(--bg-3)" : "var(--bg-1)",
            border: category === "all" ? "1.5px solid var(--primary)" : "1px solid var(--border-1)",
            color: category === "all" ? "var(--text-0)" : "var(--text-2)",
          }}
        >
          Tout
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: category === c.id ? "var(--bg-3)" : "var(--bg-1)",
              border: category === c.id ? "1.5px solid var(--primary)" : "1px solid var(--border-1)",
              color: category === c.id ? "var(--text-0)" : "var(--text-2)",
            }}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </motion.section>

      {/* ─── TIMELINE ─── */}
      <motion.section variants={fadeUp} className="space-y-4">
        <AnimatePresence mode="popLayout">
          {items.map((it) => {
            const st = STATUS_META[it.status];
            const cat = CATEGORIES.find((c) => c.id === it.category);
            return (
              <motion.article
                key={it.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="glass-panel p-5 md:p-6"
                style={{ borderLeft: `3px solid ${st.color}` }}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-3)]">
                    <span>{cat?.emoji} {cat?.label}</span>
                    <span>·</span>
                    <span>{dateFmt(it.dateIso)}</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: "var(--bg-2)", color: st.color }}>
                    {st.label}
                  </span>
                </div>

                <h3 className="font-bold text-[var(--text-0)] mt-3">{it.title}</h3>
                <p className="text-sm text-[var(--text-2)] mt-1 leading-relaxed">{it.summary}</p>

                <div className="mt-3 rounded-xl p-3" style={{ background: "var(--bg-1)", border: "1px solid var(--border-1)" }}>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)] mb-1">Pourquoi ça te concerne</div>
                  <p className="text-sm text-[var(--text-1)] leading-relaxed">{it.whyItMatters}</p>
                </div>

                <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
                  <span className="text-[11px] text-[var(--text-3)]">
                    Source : {it.source} · fiabilité {"●".repeat(it.confidence)}{"○".repeat(3 - it.confidence)}
                  </span>
                  {it.action && (
                    <Link href={it.action.href} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline">
                      {it.action.label} <ArrowUpRight size={14} />
                    </Link>
                  )}
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>

        {items.length === 0 && (
          <p className="text-center text-[var(--text-3)] py-10">Aucune info pour ce filtre.</p>
        )}
      </motion.section>

      {/* ─── DISCLAIMER ─── */}
      <motion.section variants={fadeUp}>
        <p className="text-xs text-[var(--text-3)] leading-relaxed">
          Information éducative, pas un conseil juridique ou fiscal. Socle éditorial estimé au 28 juin 2026 ;
          vérifie toujours la source officielle avant d&apos;agir. Les phrases d&apos;enjeu suivent un format éditorial
          contrôlé, avec ancrage de date pour éviter toute affirmation erronée sur une réforme non votée.
        </p>
      </motion.section>
    </motion.main>
  );
}
