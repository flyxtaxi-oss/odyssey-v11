"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingDown, Zap, AlertTriangle, Crown, Send } from "lucide-react";
import { CORRIDORS, rankQuotes, revealer } from "@/lib/maroc-transfert";

export default function TransfertPage() {
  const [corridorId, setCorridorId] = useState("fr");
  const [amount, setAmount] = useState(500);

  const corridor = CORRIDORS.find((c) => c.id === corridorId)!;
  const ranked = useMemo(() => rankQuotes(corridorId, amount), [corridorId, amount]);
  const rev = useMemo(() => revealer(corridorId, amount), [corridorId, amount]);
  const cur = corridor.currency === "EUR" ? "€" : "C$";

  return (
    <div className="space-y-12 max-w-4xl mx-auto w-full pt-6 pb-20">
      <header className="space-y-3">
        <Link href="/maroc" className="text-sm text-[var(--text-3)] hover:text-[var(--primary)] inline-flex items-center gap-1"><ArrowLeft size={14} /> Hub Vivre au Maroc</Link>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
          <Zap size={12} className="text-[var(--primary)]" />
          <span>Radar Transfert · le vrai coût, pas les frais affichés</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-0)]">
          Combien arrive{" "}
          <span style={{ background: "linear-gradient(135deg, #006233, #c1272d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            vraiment au bled ?
          </span>
        </h1>
        <p className="text-lg text-[var(--text-2)] max-w-2xl">
          Le coût réel d&apos;un transfert, c&apos;est surtout la <strong className="text-[var(--text-0)]">marge de change cachée</strong> — pas les frais affichés. On la calcule pour toi et on classe les opérateurs par <strong className="text-[var(--text-0)]">MAD réellement reçus</strong>.
        </p>
      </header>

      {/* Controls */}
      <section className="glass-panel p-6 md:p-8 space-y-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">Tu envoies depuis</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {CORRIDORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCorridorId(c.id)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: corridorId === c.id ? "var(--bg-3)" : "var(--bg-1)",
                  border: corridorId === c.id ? "1.5px solid var(--primary)" : "1px solid var(--border-1)",
                  color: corridorId === c.id ? "var(--text-0)" : "var(--text-2)",
                }}
              >
                {c.flag} {c.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">
            Montant envoyé : {amount.toLocaleString("fr-FR")} {cur}
          </label>
          <input type="range" min={100} max={3000} step={50} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full mt-3 accent-[var(--primary)]" />
        </div>
      </section>

      {/* Revealer */}
      <motion.section
        key={rev.annualSavingMad}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl p-8 text-center"
        style={{ background: "linear-gradient(135deg, #c1272d, #006233)" }}
      >
        <div className="relative z-10 space-y-2">
          <TrendingDown className="w-10 h-10 mx-auto text-white/90" />
          <p className="text-white/80 text-sm font-semibold uppercase tracking-wide">Si tu restes sur le pire choix ({rev.worst.operator.name})</p>
          <div className="text-5xl md:text-6xl font-extrabold text-white">
            −{rev.annualSavingMad.toLocaleString("fr-FR")} MAD<span className="text-2xl font-bold">/an</span>
          </div>
          <p className="text-white/85 max-w-md mx-auto">
            vs le meilleur ({rev.best.operator.name}), pour {amount.toLocaleString("fr-FR")} {cur} envoyés chaque mois. Soit ~{rev.diffPerSendMad.toLocaleString("fr-FR")} MAD perdus à chaque envoi.
          </p>
        </div>
      </motion.section>

      {/* Ranking */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text-0)]">Classement — MAD reçus au bled</h2>
          <span className="text-xs text-[var(--text-3)]">taux interbancaire {corridor.interbankRate} MAD/{cur}</span>
        </div>
        {ranked.map((q, i) => {
          const best = i === 0;
          const worst = i === ranked.length - 1;
          return (
            <motion.div
              key={q.operator.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-panel p-5 flex items-center gap-4"
              style={{ border: best ? "1.5px solid #00875a" : "1px solid var(--border-1)" }}
            >
              <div className="text-lg font-extrabold w-6 text-center text-[var(--text-3)]">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--text-0)]">{q.operator.name}</span>
                  {best && <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md text-white" style={{ background: "#00875a" }}><Crown size={11} /> Meilleur</span>}
                  {worst && <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: "rgba(193,39,45,0.15)", color: "#c1272d" }}><AlertTriangle size={11} /> Le + cher</span>}
                </div>
                <div className="text-xs text-[var(--text-3)] mt-0.5">
                  {q.operator.speed} · marge cachée {q.operator.fxMarginPct}% · frais {q.feeTotal.toFixed(2)} {cur} · coût réel {q.realCostPct.toFixed(1)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-[var(--text-0)]">{Math.round(q.receivedMad).toLocaleString("fr-FR")} MAD</div>
                <div className="text-xs text-[var(--text-3)]">reçus</div>
              </div>
            </motion.div>
          );
        })}
      </section>

      <section className="glass-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Send className="w-5 h-5 text-[var(--primary)]" />
          <p className="text-sm text-[var(--text-2)]">Veux-tu que J.A.R.V.I.S. surveille le meilleur taux et te prévienne ?</p>
        </div>
        <Link href="/jarvis" className="px-5 py-2.5 rounded-xl text-white font-bold text-sm whitespace-nowrap" style={{ background: "linear-gradient(135deg, #006233, #00875a)" }}>
          Activer une alerte
        </Link>
      </section>

      <p className="text-xs text-[var(--text-3)] text-center">
        Estimations représentatives 2026 (grilles tarifaires et taux indicatifs, non contractuels). Les taux réels varient chaque jour et selon l&apos;opérateur. Sources : Banque Mondiale (Remittance Prices), idealremit.
      </p>
    </div>
  );
}
