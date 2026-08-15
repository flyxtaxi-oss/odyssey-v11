"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Laptop,
  Landmark,
  HeartPulse,
  Truck,
  Banknote,
  Home,
  IdCard,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  TrendingDown,
  Wifi,
  ChevronDown,
  Route,
  Scale,
  Brain,
  ShieldCheck,
  Radar,
  Globe2,
  type LucideIcon,
} from "lucide-react";
import {
  AUDIENCES,
  CITIES,
  INFO_CARDS,
  FAQ,
  estimateMonthlyCost,
  type Audience,
} from "@/lib/maroc-data";

const ICONS: Record<string, LucideIcon> = {
  Plane,
  Laptop,
  Landmark,
  HeartPulse,
  Truck,
  Banknote,
  Home,
  IdCard,
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function MarocPage() {
  const [audience, setAudience] = useState<Audience>("etranger");
  const [city, setCity] = useState(CITIES[0].slug);
  const [people, setPeople] = useState(1);
  const [lifestyle, setLifestyle] = useState<"eco" | "confort" | "premium">("confort");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const estimate = useMemo(
    () => estimateMonthlyCost(city, people, lifestyle),
    [city, people, lifestyle],
  );

  const activeAudience = AUDIENCES.find((a) => a.id === audience)!;
  const cards = INFO_CARDS.filter((c) => c.audience.includes(audience));
  const faqs = FAQ.filter((f) => f.audience.includes(audience));

  return (
    <motion.div
        lang="fr" dir="ltr"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
      className="space-y-16 max-w-6xl mx-auto w-full pt-6 pb-16"
    >
      {/* ─── HERO ─── */}
      <motion.section variants={fadeUp} className="relative overflow-hidden rounded-[28px] p-8 md:p-12 glass-panel">
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{ background: "radial-gradient(120% 120% at 0% 0%, #c1272d 0%, transparent 45%), radial-gradient(120% 120% at 100% 100%, #006233 0%, transparent 45%)" }}
        />
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
            <Sparkles size={12} className="text-[var(--primary)]" />
            <span>Nouveau · Maroc OS — le hub pour vivre, rentrer & investir au Maroc 🇲🇦</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] text-[var(--text-0)]">
            Vivre au Maroc,
            <br />
            <span style={{ background: "linear-gradient(135deg, #006233, #c1272d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              sans te faire avoir.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--text-2)] max-w-2xl leading-relaxed">
            Que tu sois <strong className="text-[var(--text-0)]">étranger</strong>, <strong className="text-[var(--text-0)]">MRE</strong> qui rentre, ou <strong className="text-[var(--text-0)]">Marocain</strong> qui veut évoluer :
            coût de la vie réel, visas & séjour, fiscalité, douane, immobilier, et un coach IA qui parle ta langue.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Link href="/maroc/parcours" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-white font-bold text-base hover:scale-[1.02] transition-transform" style={{ background: "linear-gradient(135deg, #006233, #00875a)" }}>
              Teste ton installation de A à Z
              <ArrowRight size={18} />
            </Link>
            <a href="#estimateur" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-bold text-base border hover:bg-[var(--bg-2)] transition-colors" style={{ borderColor: "var(--border-1)", color: "var(--text-1)" }}>
              Calcule ton budget
            </a>
          </div>
        </div>
      </motion.section>

      {/* ─── MODULES MAROC ─── */}
      <motion.section variants={fadeUp} className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text-0)]">Tes outils Maroc</h2>
          <span className="tag-cyber">Maroc OS</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: "/maroc/parcours", icon: Route, title: "Parcours A→Z", desc: "Teste ton installation, étape par étape", tag: "FLAGSHIP" },
            { href: "/maroc/serenite", icon: ShieldCheck, title: "Indice de Sérénité", desc: "Quelle ville pour toi ? 7 axes, ton profil", tag: "NOUVEAU" },
            { href: "/maroc/veille", icon: Radar, title: "Radar de Veille", desc: "Ce qui change pour les expats & MRE", tag: "NOUVEAU" },
            { href: "/maroc/comparateur", icon: Globe2, title: "Comparateur Pays", desc: "Maroc vs Portugal, Dubaï, Espagne…", tag: "NOUVEAU" },
            { href: "/maroc/transfert", icon: TrendingDown, title: "Radar Transfert", desc: "Le vrai coût pour envoyer de l'argent", tag: "VIRAL" },
            { href: "/maroc/succession", icon: Scale, title: "Succession", desc: "Héritage & taâssib, expliqué et sourcé", tag: "MUFID" },
            { href: "/jarvis", icon: Brain, title: "J.A.R.V.I.S.", desc: "Ton coach IA, branché sur la data Maroc", tag: "IA" },
          ].map((m) => (
            <Link key={m.href} href={m.href} className="glass-panel p-6 group hover:scale-[1.02] transition-transform flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-2)" }}>
                  <m.icon className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md" style={{ background: "var(--bg-2)", color: "var(--text-3)" }}>{m.tag}</span>
              </div>
              <h3 className="font-bold text-[var(--text-0)] flex items-center gap-1">{m.title}<ArrowUpRight size={15} className="text-[var(--text-3)] opacity-0 group-hover:opacity-100 transition-opacity" /></h3>
              <p className="text-sm text-[var(--text-2)] mt-1 leading-relaxed">{m.desc}</p>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* ─── AUDIENCE SELECTOR ─── */}
      <motion.section variants={fadeUp} className="space-y-5">
        <h2 className="text-xl font-bold text-[var(--text-0)]">Tu es… ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AUDIENCES.map((a) => {
            const active = a.id === audience;
            return (
              <button
                key={a.id}
                onClick={() => setAudience(a.id)}
                className="text-left rounded-2xl p-6 transition-all relative overflow-hidden"
                style={{
                  background: active ? "var(--bg-2)" : "var(--bg-1)",
                  border: active ? "2px solid var(--primary)" : "1px solid var(--border-1)",
                }}
              >
                <div className="text-3xl mb-3">{a.emoji}</div>
                <div className="font-bold text-[var(--text-0)]">{a.label}</div>
                <div className="text-xs uppercase tracking-wide text-[var(--text-3)] mt-1">{a.tagline}</div>
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={audience}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-[var(--text-2)] leading-relaxed max-w-3xl"
          >
            {activeAudience.description}
          </motion.p>
        </AnimatePresence>
      </motion.section>

      {/* ─── COST ESTIMATOR (viral angle) ─── */}
      <motion.section variants={fadeUp} id="estimateur" className="scroll-mt-24">
        <div className="glass-panel p-7 md:p-9">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #006233, #00875a)" }}>
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-0)]">Combien ça coûte vraiment ?</h2>
              <p className="text-sm text-[var(--text-3)]">Estimation mensuelle + économie annuelle vs grande ville française</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">Ville</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {CITIES.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => setCity(c.slug)}
                      className="px-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: city === c.slug ? "var(--bg-3)" : "var(--bg-1)",
                        border: city === c.slug ? "1.5px solid var(--primary)" : "1px solid var(--border-1)",
                        color: city === c.slug ? "var(--text-0)" : "var(--text-2)",
                      }}
                    >
                      {c.emoji} {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">Personnes : {people}</label>
                <input type="range" min={1} max={5} value={people} onChange={(e) => setPeople(Number(e.target.value))} className="w-full mt-3 accent-[var(--primary)]" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">Style de vie</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(["eco", "confort", "premium"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLifestyle(l)}
                      className="px-2 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
                      style={{
                        background: lifestyle === l ? "var(--bg-3)" : "var(--bg-1)",
                        border: lifestyle === l ? "1.5px solid var(--primary)" : "1px solid var(--border-1)",
                        color: lifestyle === l ? "var(--text-0)" : "var(--text-2)",
                      }}
                    >
                      {l === "eco" ? "Éco" : l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="rounded-2xl p-7 flex flex-col justify-center" style={{ background: "var(--bg-1)", border: "1px solid var(--border-1)" }}>
              <div className="text-sm text-[var(--text-3)]">Budget mensuel estimé</div>
              <div className="flex items-baseline gap-2 mt-1">
                <motion.span key={estimate.eur} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-extrabold text-[var(--text-0)]">
                  {estimate.eur.toLocaleString("fr-FR")} €
                </motion.span>
              </div>
              <div className="text-sm text-[var(--text-2)] mt-1">≈ {estimate.mad.toLocaleString("fr-FR")} MAD / mois</div>

              <div className="h-px my-5" style={{ background: "var(--border-1)" }} />

              <div className="text-sm text-[var(--text-3)]">Économie estimée vs France</div>
              <motion.div key={estimate.savingsEurPerYear} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-extrabold mt-1" style={{ color: "#00875a" }}>
                +{estimate.savingsEurPerYear.toLocaleString("fr-FR")} € / an
              </motion.div>
              <div className="text-xs text-[var(--text-3)] mt-3">
                Indice coût de vie : <strong className="text-[var(--text-1)]">{estimate.vsParisPct}/100</strong> (Paris = 100). Estimation indicative, non contractuelle.
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── CITY GRID ─── */}
      <motion.section variants={fadeUp} className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text-0)]">Où s&apos;installer ?</h2>
          <span className="tag-cyber">{CITIES.length} villes</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CITIES.map((c) => (
            <div key={c.slug} className="glass-panel p-6 group hover:scale-[1.02] transition-transform">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{c.emoji}</div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "var(--bg-2)", color: "var(--text-2)" }}>
                  {Math.round(c.monthlyMad / 10.8).toLocaleString("fr-FR")} €/mois
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-0)]">{c.name}</h3>
              <p className="text-xs font-semibold text-[var(--primary)] mt-0.5">{c.vibe}</p>
              <p className="text-sm text-[var(--text-2)] mt-3 leading-relaxed">{c.why}</p>
              <div className="flex items-center gap-3 mt-4 pt-4 text-xs text-[var(--text-3)]" style={{ borderTop: "1px solid var(--border-0)" }}>
                <span className="flex items-center gap-1"><Wifi size={13} /> {c.internetMbps} Mbps</span>
                <span>·</span>
                <span>{c.bestFor.join(" · ")}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ─── INFO CARDS (by audience) ─── */}
      <motion.section variants={fadeUp} className="space-y-5">
        <h2 className="text-xl font-bold text-[var(--text-0)]">L&apos;essentiel pour ton profil</h2>
        <AnimatePresence mode="wait">
          <motion.div
            key={audience}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {cards.map((card) => {
              const Icon = ICONS[card.icon] ?? Sparkles;
              return (
                <div key={card.title} className="glass-panel p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-2)" }}>
                      <Icon className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div className="flex gap-1" title="Difficulté administrative">
                      {[1, 2, 3].map((n) => (
                        <span key={n} className="w-1.5 h-4 rounded-full" style={{ background: n <= card.difficulty ? "var(--primary)" : "var(--bg-3)" }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-0)]">{card.title}</h3>
                    <p className="text-sm text-[var(--text-3)] mt-0.5">{card.summary}</p>
                  </div>
                  <ul className="space-y-2">
                    {card.points.map((p, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[var(--text-2)] leading-relaxed">
                        <ArrowUpRight size={15} className="text-[var(--primary)] flex-shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/* ─── FAQ ─── */}
      <motion.section variants={fadeUp} className="space-y-4 max-w-3xl">
        <h2 className="text-xl font-bold text-[var(--text-0)]">Questions fréquentes</h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="glass-panel overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                <span className="font-semibold text-[var(--text-0)]">{f.q}</span>
                <ChevronDown size={18} className="text-[var(--text-3)] flex-shrink-0 transition-transform" style={{ transform: openFaq === i ? "rotate(180deg)" : "none" }} />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-[var(--text-2)] leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ─── CTA ─── */}
      <motion.section variants={fadeUp} className="text-center space-y-6 py-12 px-6 rounded-3xl glass-panel relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "radial-gradient(80% 80% at 50% 0%, #006233 0%, transparent 60%)" }} />
        <div className="relative z-10 space-y-6">
          <div className="text-4xl">🇲🇦</div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-0)]">Ton projet Maroc, décidé en 5 minutes.</h2>
          <p className="text-[var(--text-2)] text-lg max-w-xl mx-auto">
            J.A.R.V.I.S. croise ta situation (revenu, famille, visa, objectif) avec la data réelle du pays et te dit quoi faire, étape par étape.
          </p>
          <Link href="/jarvis" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold hover:scale-[1.02] transition-transform" style={{ background: "linear-gradient(135deg, #006233, #00875a)" }}>
            Lancer mon plan Maroc
            <ArrowRight size={18} />
          </Link>
        </div>
      </motion.section>
    </motion.div>
  );
}
