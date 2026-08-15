"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Circle,
  FileText,
  Clock,
  Wallet,
  ArrowRight,
  RotateCcw,
  Car,
  Sparkles,
} from "lucide-react";
import {
  FROM_COUNTRIES,
  GOALS,
  generateParcours,
  DEFAULT_PROFILE,
  type Profile,
  type Status,
  type Family,
  type Goal,
  type FromCountry,
} from "@/lib/maroc-parcours";
import { CITIES, EUR_TO_MAD } from "@/lib/maroc-data";

const STORAGE_KEY = "maroc-parcours-done";

export default function ParcoursPage() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Load progress
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage after mount (avoids SSR mismatch)
      if (raw) setDone(new Set(JSON.parse(raw)));
    } catch { /* noop */ }
    setLoaded(true);
  }, []);

  // Persist progress
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
  }, [done, loaded]);

  const parcours = useMemo(() => generateParcours(profile), [profile]);
  const doneCount = parcours.phases.reduce(
    (n, ph) => n + ph.steps.filter((s) => done.has(s.id)).length,
    0,
  );
  const pct = parcours.totalSteps ? Math.round((doneCount / parcours.totalSteps) * 100) : 0;

  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setProfile((p) => ({ ...p, [k]: v }));

  return (
    <div
        lang="fr" dir="ltr" className="space-y-12 max-w-5xl mx-auto w-full pt-6 pb-20">
      {/* Header */}
      <header className="space-y-3">
        <Link href="/maroc" className="text-sm text-[var(--text-3)] hover:text-[var(--primary)]">← Hub Vivre au Maroc</Link>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
          <Sparkles size={12} className="text-[var(--primary)]" />
          <span>Parcours A→Z · teste ton installation avant de partir</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-0)]">
          Ton installation au Maroc,{" "}
          <span style={{ background: "linear-gradient(135deg, #006233, #c1272d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            étape par étape.
          </span>
        </h1>
        <p className="text-lg text-[var(--text-2)] max-w-2xl">
          Réponds à 6 questions, et on génère ta feuille de route complète : papiers, déménagement, arrivée, installation. Coche au fur et à mesure — ta progression est sauvegardée.
        </p>
      </header>

      {/* Profile builder */}
      <section className="glass-panel p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-bold text-[var(--text-0)]">Ton profil</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Tu pars de…">
            <select
              value={profile.fromCountry}
              onChange={(e) => set("fromCountry", e.target.value as FromCountry)}
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "var(--bg-1)", border: "1px solid var(--border-1)", color: "var(--text-0)" }}
            >
              {FROM_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Tu es…">
            <Segmented
              options={[
                { v: "mre" as Status, label: "MRE / binational" },
                { v: "etranger" as Status, label: "Étranger" },
              ]}
              value={profile.status}
              onChange={(v) => set("status", v)}
            />
          </Field>

          <Field label="Situation familiale">
            <Segmented
              options={[
                { v: "solo" as Family, label: "Solo" },
                { v: "couple" as Family, label: "Couple" },
                { v: "famille" as Family, label: "Famille" },
              ]}
              value={profile.family}
              onChange={(v) => set("family", v)}
            />
          </Field>

          <Field label={`Enfants : ${profile.kids}`}>
            <input
              type="range" min={0} max={5} value={profile.kids}
              onChange={(e) => set("kids", Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </Field>

          <Field label="Ton objectif">
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => set("goal", g.id as Goal)}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all"
                  style={{
                    background: profile.goal === g.id ? "var(--bg-3)" : "var(--bg-1)",
                    border: profile.goal === g.id ? "1.5px solid var(--primary)" : "1px solid var(--border-1)",
                    color: profile.goal === g.id ? "var(--text-0)" : "var(--text-2)",
                  }}
                >
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Ville cible">
            <select
              value={profile.citySlug}
              onChange={(e) => set("citySlug", e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "var(--bg-1)", border: "1px solid var(--border-1)", color: "var(--text-0)" }}
            >
              {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>)}
            </select>
          </Field>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={profile.hasVehicle} onChange={(e) => set("hasVehicle", e.target.checked)} className="accent-[var(--primary)] w-4 h-4" />
          <span className="text-sm text-[var(--text-1)] flex items-center gap-1.5"><Car size={15} /> J&apos;importe mon véhicule</span>
        </label>
      </section>

      {/* Summary + progress */}
      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <SummaryCard label="Étapes" value={`${parcours.totalSteps}`} />
        <SummaryCard label="Coût démarches" value={`~${parcours.totalCostEur.toLocaleString("fr-FR")} €`} />
        <SummaryCard label="Ville" value={`${parcours.city.emoji} ${parcours.city.name}`} />
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-[var(--text-3)]">Progression</span>
            <span className="text-sm font-bold text-[var(--text-0)]">{pct}%</span>
          </div>
          <div className="h-2 mt-3 rounded-full overflow-hidden" style={{ background: "var(--bg-3)" }}>
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #006233, #00875a)" }} animate={{ width: `${pct}%` }} transition={{ duration: 0.3 }} />
          </div>
          {doneCount > 0 && (
            <button onClick={() => setDone(new Set())} className="text-xs text-[var(--text-3)] hover:text-[var(--error)] mt-3 inline-flex items-center gap-1">
              <RotateCcw size={12} /> Réinitialiser
            </button>
          )}
        </div>
      </section>

      {/* Roadmap */}
      <section className="space-y-10">
        {parcours.phases.map((ph, phi) => (
          <motion.div
            key={ph.phase}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: phi * 0.05 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{ph.emoji}</span>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-0)]">{ph.label}</h2>
                <p className="text-sm text-[var(--text-3)]">{ph.desc}</p>
              </div>
            </div>

            <div className="space-y-3">
              {ph.steps.map((s) => {
                const isDone = done.has(s.id);
                return (
                  <div
                    key={s.id}
                    className="glass-panel p-5 transition-all"
                    style={{ opacity: isDone ? 0.65 : 1 }}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggle(s.id)}
                        className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                        aria-label={isDone ? "Marquer non fait" : "Marquer fait"}
                      >
                        {isDone ? (
                          <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#00875a" }}>
                            <Check size={14} className="text-white" />
                          </span>
                        ) : (
                          <Circle size={24} className="text-[var(--text-3)]" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className={`font-bold text-[var(--text-0)] ${isDone ? "line-through" : ""}`}>{s.title}</h3>
                          <div className="flex gap-1 flex-shrink-0 mt-1" title="Difficulté">
                            {[1, 2, 3].map((n) => (
                              <span key={n} className="w-1.5 h-3.5 rounded-full" style={{ background: n <= s.difficulty ? "var(--primary)" : "var(--bg-3)" }} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-[var(--text-2)] mt-1 leading-relaxed">{s.summary}</p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-[var(--text-3)]">
                          <span className="flex items-center gap-1"><Clock size={12} /> {s.duration}</span>
                          <span className="flex items-center gap-1"><Wallet size={12} /> {s.costEur === 0 ? "Gratuit" : `~${s.costEur.toLocaleString("fr-FR")} €`}</span>
                          {s.docs.length > 0 && (
                            <span className="flex items-center gap-1"><FileText size={12} /> {s.docs.length} doc{s.docs.length > 1 ? "s" : ""}</span>
                          )}
                        </div>

                        {s.docs.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {s.docs.map((d) => (
                              <span key={d} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "var(--bg-2)", color: "var(--text-2)" }}>{d}</span>
                            ))}
                          </div>
                        )}

                        {s.tip && (
                          <p className="text-xs mt-3 px-3 py-2 rounded-lg leading-relaxed" style={{ background: "var(--bg-1)", border: "1px solid var(--border-1)", color: "var(--text-2)" }}>
                            💡 {s.tip}
                          </p>
                        )}

                        {s.test && (
                          <Link href={s.test.href} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] mt-3 hover:gap-2 transition-all">
                            {s.test.label} <ArrowRight size={14} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </section>

      {/* Completion / CTA */}
      <AnimatePresence>
        {pct === 100 && (
          <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-10 rounded-3xl glass-panel">
            <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-bold text-[var(--text-0)]">Bravo — ton parcours est complet !</h2>
            <p className="text-[var(--text-2)]">Tu es prêt pour ton installation au Maroc. Affine ta stratégie avec J.A.R.V.I.S.</p>
            <Link href="/jarvis" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-bold" style={{ background: "linear-gradient(135deg, #006233, #00875a)" }}>
              Valider mon plan avec J.A.R.V.I.S. <ArrowRight size={18} />
            </Link>
          </motion.section>
        )}
      </AnimatePresence>

      <p className="text-xs text-[var(--text-3)] text-center">
        Estimations indicatives 2026 (1€≈{EUR_TO_MAD} MAD), non contractuelles. Vérifie les conditions exactes auprès des autorités compétentes.
      </p>
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

function Segmented<T extends string>({ options, value, onChange }: { options: { v: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.v}
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-5">
      <div className="text-xs uppercase tracking-wide text-[var(--text-3)]">{label}</div>
      <div className="text-xl font-extrabold text-[var(--text-0)] mt-1">{value}</div>
    </div>
  );
}
