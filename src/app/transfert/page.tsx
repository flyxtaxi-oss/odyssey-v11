"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Banknote, Building2, Wallet, Zap, TrendingDown, Info } from "lucide-react";
import {
  compareProviders,
  maxSavings,
  MID_MARKET_TO_MAD,
  type Corridor,
  type PayoutMethod,
} from "@/lib/remittance";

const CORRIDORS: { code: Corridor; label: string; flag: string }[] = [
  { code: "EUR", label: "Euro", flag: "🇪🇺" },
  { code: "USD", label: "Dollar US", flag: "🇺🇸" },
  { code: "GBP", label: "Livre £", flag: "🇬🇧" },
  { code: "CAD", label: "Dollar CA", flag: "🇨🇦" },
];

const PAYOUTS: { code: PayoutMethod | "any"; label: string; icon: typeof Banknote }[] = [
  { code: "any", label: "Peu importe", icon: Zap },
  { code: "bank", label: "Compte bancaire", icon: Building2 },
  { code: "cash", label: "Retrait cash", icon: Banknote },
  { code: "wallet", label: "Wallet", icon: Wallet },
];

export default function TransfertPage() {
  const [amount, setAmount] = useState(500);
  const [corridor, setCorridor] = useState<Corridor>("EUR");
  const [payout, setPayout] = useState<PayoutMethod | "any">("any");

  const quotes = useMemo(
    () => compareProviders({ amount, corridor, payout: payout === "any" ? undefined : payout }),
    [amount, corridor, payout]
  );
  const savings = useMemo(() => maxSavings(quotes), [quotes]);
  const best = quotes.find((q) => q.available);

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--text-2,#94A3B8)]">
            Comparateur MRE
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Envoyer de l&apos;argent au Maroc <span className="text-[var(--primary)]">au meilleur prix</span>
        </h1>
        <p className="mt-2 text-[var(--text-2,#94A3B8)] max-w-2xl">
          Un transfert vers le Maroc coûte en moyenne ~9&nbsp;$ (frais + marge de change cachée).
          Compare le coût réel des opérateurs et garde plus d&apos;argent pour ta famille.
        </p>
      </motion.div>

      {/* Controls */}
      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] items-end mb-6 rounded-2xl border border-[var(--border-1,#1e293b)] bg-[var(--bg-1,#0d1220)] p-5">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-widest text-[var(--text-3,#64748b)] mb-2">
            Montant à envoyer
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[var(--bg-2,#111827)] border border-[var(--border-2,#334155)] rounded-xl px-4 py-3 text-lg font-bold outline-none focus:border-[var(--primary)]"
            />
            <span className="text-lg font-bold text-[var(--text-2,#94A3B8)]">{corridor}</span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-widest text-[var(--text-3,#64748b)] mb-2">
            Devise
          </label>
          <div className="flex gap-1">
            {CORRIDORS.map((c) => (
              <button
                key={c.code}
                onClick={() => setCorridor(c.code)}
                className={`px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                  corridor === c.code
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--bg-2,#111827)] text-[var(--text-2,#94A3B8)] hover:bg-[var(--bg-3,#1f2937)]"
                }`}
                title={c.label}
              >
                {c.flag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-widest text-[var(--text-3,#64748b)] mb-2">
            Réception
          </label>
          <div className="flex gap-1">
            {PAYOUTS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.code}
                  onClick={() => setPayout(p.code)}
                  className={`px-3 py-3 rounded-xl transition-all ${
                    payout === p.code
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--bg-2,#111827)] text-[var(--text-2,#94A3B8)] hover:bg-[var(--bg-3,#1f2937)]"
                  }`}
                  title={p.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Savings banner */}
      {savings > 0 && best && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 rounded-2xl border border-[var(--success,#10B981)]/30 bg-[var(--success,#10B981)]/10 p-4 flex items-center gap-3"
        >
          <TrendingDown className="w-5 h-5 text-[var(--success,#10B981)] shrink-0" />
          <p className="text-sm">
            En choisissant <strong>{best.provider.name}</strong>, tu économises jusqu&apos;à{" "}
            <strong className="text-[var(--success,#10B981)]">
              {savings.toFixed(2)} {corridor}
            </strong>{" "}
            par rapport à l&apos;opérateur le plus cher.
          </p>
        </motion.div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {quotes.map((q, i) => (
          <motion.div
            key={q.provider.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl border p-5 transition-all ${
              i === 0 && q.available
                ? "border-[var(--primary)] bg-[var(--primary)]/5"
                : "border-[var(--border-1,#1e293b)] bg-[var(--bg-1,#0d1220)]"
            } ${!q.available ? "opacity-40" : ""}`}
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[var(--bg-2,#111827)] border border-[var(--border-2,#334155)] flex items-center justify-center font-bold text-sm">
                  {q.provider.name.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{q.provider.name}</span>
                    {i === 0 && q.available && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--primary)] text-white">
                        Meilleur prix
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--text-3,#64748b)]">
                    {q.provider.speed} · {q.provider.payout.join(", ")}
                  </span>
                </div>
              </div>

              <div className="text-right">
                {q.available ? (
                  <>
                    <div className="text-xl font-extrabold">
                      {q.receivedMAD.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} MAD
                    </div>
                    <div className="text-xs text-[var(--text-3,#64748b)]">
                      reçus · coût réel {q.realCost.toFixed(2)} {corridor} ({(q.realCostPct * 100).toFixed(1)}%)
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-[var(--text-3,#64748b)]">Indisponible pour ce choix</span>
                )}
              </div>
            </div>
            {q.provider.note && q.available && (
              <p className="mt-3 text-xs text-[var(--text-3,#64748b)] flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {q.provider.note}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Rate footer */}
      <p className="mt-6 text-xs text-[var(--text-3,#64748b)] flex items-center gap-1.5">
        <ArrowRight className="w-3 h-3" />
        Taux de référence indicatif : 1 {corridor} ≈ {MID_MARKET_TO_MAD[corridor]} MAD. Tarifs
        indicatifs (mi-2026), à confirmer chez l&apos;opérateur avant envoi.
      </p>
    </div>
  );
}
