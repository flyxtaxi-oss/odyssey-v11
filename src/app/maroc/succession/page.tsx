"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Scale, Info, AlertTriangle, Sparkles, Users } from "lucide-react";
import {
  computeSuccession,
  sharePct,
  SUCCESSION_SOURCES,
  type DeceasedGender,
  type SuccessionInput,
} from "@/lib/maroc-succession";

export default function SuccessionPage() {
  const [input, setInput] = useState<SuccessionInput>({
    deceasedGender: "homme",
    hasSpouse: true,
    sons: 0,
    daughters: 2,
    fatherAlive: false,
    motherAlive: true,
  });

  const set = <K extends keyof SuccessionInput>(k: K, v: SuccessionInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => computeSuccession(input), [input]);

  return (
    <div className="space-y-12 max-w-4xl mx-auto w-full pt-6 pb-20">
      <header className="space-y-3">
        <Link href="/maroc" className="text-sm text-[var(--text-3)] hover:text-[var(--primary)] inline-flex items-center gap-1"><ArrowLeft size={14} /> Hub Vivre au Maroc</Link>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
          <Scale size={12} className="text-[var(--primary)]" />
          <span>Mufid · droit successoral marocain, expliqué et sourcé</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-0)]">
          Qui hérite de quoi,{" "}
          <span style={{ background: "linear-gradient(135deg, #006233, #c1272d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            selon ta famille ?
          </span>
        </h1>
        <p className="text-lg text-[var(--text-2)] max-w-2xl">
          Visualise la répartition successorale (Fara&apos;id) selon le Code de la famille, et comprends l&apos;enjeu du <strong className="text-[var(--text-0)]">taâssib</strong> au cœur de la réforme de la Moudawana.
        </p>
      </header>

      {/* Disclaimer */}
      <div className="flex gap-3 p-4 rounded-2xl" style={{ background: "rgba(193,39,45,0.06)", border: "1px solid rgba(193,39,45,0.2)" }}>
        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#c1272d" }} />
        <p className="text-sm text-[var(--text-2)] leading-relaxed">
          <strong className="text-[var(--text-0)]">Outil éducatif, pas un conseil juridique.</strong> Il couvre les cas courants (conjoint, enfants, parents). Pour toute succession réelle, consulte un adoul ou un notaire.
        </p>
      </div>

      {/* Inputs */}
      <section className="glass-panel p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Le défunt est">
            <Segmented
              options={[{ v: "homme" as DeceasedGender, label: "Un homme" }, { v: "femme" as DeceasedGender, label: "Une femme" }]}
              value={input.deceasedGender}
              onChange={(v) => set("deceasedGender", v)}
            />
          </Field>
          <Field label={input.deceasedGender === "homme" ? "Épouse survivante ?" : "Époux survivant ?"}>
            <Segmented
              options={[{ v: true, label: "Oui" }, { v: false, label: "Non" }]}
              value={input.hasSpouse}
              onChange={(v) => set("hasSpouse", v)}
            />
          </Field>
          <Field label={`Fils : ${input.sons}`}>
            <input type="range" min={0} max={5} value={input.sons} onChange={(e) => set("sons", Number(e.target.value))} className="w-full accent-[var(--primary)]" />
          </Field>
          <Field label={`Filles : ${input.daughters}`}>
            <input type="range" min={0} max={5} value={input.daughters} onChange={(e) => set("daughters", Number(e.target.value))} className="w-full accent-[var(--primary)]" />
          </Field>
          <Field label="Père vivant ?">
            <Segmented options={[{ v: true, label: "Oui" }, { v: false, label: "Non" }]} value={input.fatherAlive} onChange={(v) => set("fatherAlive", v)} />
          </Field>
          <Field label="Mère vivante ?">
            <Segmented options={[{ v: true, label: "Oui" }, { v: false, label: "Non" }]} value={input.motherAlive} onChange={(v) => set("motherAlive", v)} />
          </Field>
        </div>
      </section>

      {/* Result */}
      {result.requiresExpert || !result.shares ? (
        <section className="glass-panel p-8 text-center space-y-3">
          <Users className="w-10 h-10 mx-auto text-[var(--text-3)]" />
          <h2 className="text-xl font-bold text-[var(--text-0)]">Ce cas dépasse le simulateur</h2>
          {result.notes.map((n, i) => (
            <p key={i} className="text-sm text-[var(--text-2)] max-w-lg mx-auto">{n}</p>
          ))}
          <Link href="/jarvis" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold mt-2" style={{ background: "linear-gradient(135deg, #006233, #00875a)" }}>
            Demander à J.A.R.V.I.S.
          </Link>
        </section>
      ) : (
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-[var(--text-0)]">Répartition de la succession</h2>
          <div className="space-y-3">
            {result.shares.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="glass-panel p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[var(--text-0)] flex items-center gap-2">
                    {s.who}
                    {s.isTaassib && <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: "rgba(193,39,45,0.15)", color: "#c1272d" }}>taâssib</span>}
                  </span>
                  <span className="text-lg font-extrabold text-[var(--text-0)]">{sharePct(s.fraction)}</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--bg-3)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: s.isTaassib ? "linear-gradient(90deg,#c1272d,#e0524f)" : "linear-gradient(90deg,#006233,#00875a)" }} initial={{ width: 0 }} animate={{ width: `${s.fraction * 100}%` }} transition={{ duration: 0.6 }} />
                </div>
                <p className="text-xs text-[var(--text-3)] mt-2">{s.basis}</p>
              </motion.div>
            ))}
          </div>

          {result.reformImpact && (
            <div className="flex gap-3 p-5 rounded-2xl" style={{ background: "var(--bg-1)", border: "1px solid var(--border-2)" }}>
              <Sparkles size={18} className="flex-shrink-0 mt-0.5 text-[var(--primary)]" />
              <p className="text-sm text-[var(--text-2)] leading-relaxed"><strong className="text-[var(--text-0)]">Enjeu réforme : </strong>{result.reformImpact}</p>
            </div>
          )}

          {result.notes.length > 0 && (
            <div className="space-y-2">
              {result.notes.map((n, i) => (
                <div key={i} className="flex gap-2 text-sm text-[var(--text-3)]">
                  <Info size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{n}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Sources */}
      <section className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--text-3)]">Sources</h3>
        {SUCCESSION_SOURCES.map((s) => (
          <p key={s} className="text-xs text-[var(--text-3)]">• {s}</p>
        ))}
      </section>
    </div>
  );
}

/* ─── Sub-components ─── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">{label}</label>
      {children}
    </div>
  );
}

function Segmented<T extends string | boolean>({ options, value, onChange }: { options: { v: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={String(o.v)}
          onClick={() => onChange(o.v)}
          className="px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: value === o.v ? "var(--bg-3)" : "var(--bg-1)",
            border: value === o.v ? "1.5px solid var(--primary)" : "1px solid var(--border-1)",
            color: value === o.v ? "var(--text-0)" : "var(--text-2)",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
