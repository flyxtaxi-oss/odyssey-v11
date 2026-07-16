"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Globe,
  Shield,
  Sparkles,
  ArrowRight,
  Check,
  TrendingDown,
  Zap,
  Users,
  Star,
} from "lucide-react";

/**
 * MarketingLanding — Conversion-optimized landing for non-authenticated visitors.
 * Strategy (based on 2026 market analysis):
 *   - Hook with concrete €€€ savings (US-style direct marketing adapted to FR)
 *   - Differentiate vs Nomadlist (AI + français + community)
 *   - Social proof + scarcity
 *   - Single primary CTA
 */
export function MarketingLanding() {
  return (
    <div className="space-y-24 py-8">
      {/* ─── HERO ─── */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}
        >
          <Sparkles size={12} className="text-[var(--primary)]" />
          <span>Le premier Life OS IA pour expats francophones</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--text-0)] leading-[1.1]"
        >
          Quitte la France.
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #2563EB, #7C3AED, #EC4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Économise €8 400/an.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-[var(--text-2)] leading-relaxed max-w-2xl mx-auto"
        >
          Compare 50+ pays. Pilote tes visas. Coache-toi avec <strong className="text-[var(--text-0)]">J.A.R.V.I.S.</strong>,
          l&apos;IA qui te dit où vivre, comment partir, et combien tu vas vraiment économiser.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
        >
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-base hover:scale-[1.02] transition-transform"
            style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
          >
            Lance ta simulation gratuite
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/simulator"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base border hover:bg-[var(--bg-2)] transition-colors"
            style={{
              borderColor: "var(--border-1)",
              color: "var(--text-1)",
            }}
          >
            Voir le simulateur
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-[var(--text-3)] pt-3"
        >
          ✓ Aucune CB requise • ✓ 3 simulations gratuites • ✓ Conseil IA en français
        </motion.p>
      </section>

      {/* ─── SOCIAL PROOF (numbers) ─── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <Metric value="50+" label="pays comparés" />
        <Metric value="2min" label="pour ta première sim" />
        <Metric value="€8.4k" label="économie moyenne / an" />
        <Metric value="4.8/5" label="satisfaction (127 avis)" />
      </section>

      {/* ─── 4 PILIERS ─── */}
      <section className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-[var(--text-0)]">Tout ce que Nomadlist ne te donne pas</h2>
          <p className="text-[var(--text-2)]">L&apos;IA, le français, la vraie data fiscale et la communauté vérifiée.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Pillar
            icon={Brain}
            title="J.A.R.V.I.S."
            subtitle="5 personas IA (Sage, Stratège, Coach, Exécuteur, Ami)"
            description="Discute en français avec ton coach IA personnel. Décisions complexes (visa, fiscalité, ville) débloquées en 5 minutes."
            color="from-blue-500 to-purple-600"
          />
          <Pillar
            icon={Globe}
            title="Simulateur multipays"
            subtitle="50 pays, fiscalité réelle, projections finance"
            description="Compare Lisbonne vs Tallinn vs Dubaï pour ton profil. Avec ton vrai revenu, ta vraie situation familiale. Pas de bullshit."
            color="from-emerald-500 to-teal-600"
          />
          <Pillar
            icon={Shield}
            title="Visa Tracker"
            subtitle="Schengen, D7, DTV, et 47 autres visas"
            description="Ne rate plus une date limite. Alertes auto, calcul automatique des jours restants, doc requis par pays."
            color="from-amber-500 to-orange-600"
          />
          <Pillar
            icon={Users}
            title="Safe-Zone"
            subtitle="Communauté vérifiée — pas Reddit, pas Facebook"
            description="Échange avec de vrais expats déjà sur place. Identité vérifiée, zéro spam, zéro fake."
            color="from-pink-500 to-rose-600"
          />
        </div>
      </section>

      {/* ─── COMPARISON vs NOMADLIST ─── */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-[var(--text-0)]">Odyssey vs Nomadlist</h2>
          <p className="text-[var(--text-2)]">La comparaison brutalement honnête.</p>
        </div>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-1)", border: "1px solid var(--border-1)" }}
        >
          <div className="grid grid-cols-3 text-sm">
            <Cell head>Feature</Cell>
            <Cell head>Nomadlist</Cell>
            <Cell head highlight>Odyssey</Cell>
            <ComparisonRow label="IA conversationnelle" left="❌" right="✅ JARVIS (5 personas)" />
            <ComparisonRow label="Français natif" left="❌ EN only" right="✅" />
            <ComparisonRow label="Simulation fiscale réelle" left="❌" right="✅" />
            <ComparisonRow label="Visa Tracker" left="❌" right="✅ 50 visas" />
            <ComparisonRow label="Bail mobilité FR" left="❌" right="✅ via SeLoger" />
            <ComparisonRow label="Prix" left="$99 / an" right="Free / €19 mo" />
            <ComparisonRow label="Communauté vérifiée" left="🟡 Slack payant" right="✅ Safe-Zone" />
          </div>
        </div>
      </section>

      {/* ─── SPOTLIGHT MAROC (angle viral) ─── */}
      <section className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-12">
          <div
            className="absolute inset-0 opacity-[0.13] pointer-events-none"
            style={{
              background:
                "radial-gradient(120% 120% at 0% 0%, #c1272d 0%, transparent 45%), radial-gradient(120% 120% at 100% 100%, #006233 0%, transparent 45%)",
            }}
          />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="text-4xl">🇲🇦</div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-0)]">
                Nouveau : <span style={{ background: "linear-gradient(135deg, #006233, #c1272d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Vivre au Maroc</span>
              </h2>
              <p className="text-[var(--text-2)] leading-relaxed">
                Le seul hub qui sert à la fois les <strong className="text-[var(--text-0)]">étrangers</strong> qui s&apos;installent, les <strong className="text-[var(--text-0)]">MRE</strong> qui rentrent, et les <strong className="text-[var(--text-0)]">Marocains</strong> qui veulent évoluer. Coût de la vie réel, séjour, fiscalité, douane, immobilier — et un estimateur de budget en direct.
              </p>
              <Link
                href="/maroc"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold hover:scale-[1.02] transition-transform"
                style={{ background: "linear-gradient(135deg, #006233, #00875a)" }}
              >
                Découvrir le hub Maroc
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric value="~750€" label="budget/mois à Agadir" />
              <Metric value="6 villes" label="comparées en détail" />
              <Metric value="3 profils" label="étranger · MRE · local" />
              <Metric value="-80%" label="abattement IR retraités" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-[var(--text-0)]">Pricing simple</h2>
          <p className="text-[var(--text-2)]">Commence gratuit. Upgrade quand tu veux.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PricingCard
            name="Free"
            price="0€"
            tagline="Pour tester"
            features={[
              "3 simulations / mois",
              "JARVIS limité (1 persona)",
              "Visa Tracker basique",
              "Accès lecture Safe-Zone",
            ]}
            cta="Commencer gratuitement"
            ctaLink="/login"
          />
          <PricingCard
            highlight
            name="Pro"
            price="19€"
            period="/mois"
            tagline="Le plus populaire"
            features={[
              "Simulations illimitées",
              "JARVIS complet (5 personas)",
              "Prédictions GraphRAG",
              "Safe-Zone vérifiée",
              "Multi-pays dashboard",
              "Annuel : 159€/an (-30%)",
            ]}
            cta="Passer Pro"
            ctaLink="/login?plan=pro"
          />
          <PricingCard
            name="Pro Max"
            price="49€"
            period="/mois"
            tagline="Pour les sérieux"
            features={[
              "Tout Pro +",
              "API prioritaire",
              "Consult trimestriel 1-on-1",
              "Projections fiscales avancées",
              "Annuel : 399€/an",
            ]}
            cta="Passer Pro Max"
            ctaLink="/login?plan=promax"
          />
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="max-w-2xl mx-auto text-center space-y-6 py-12 px-6 rounded-3xl glass-panel">
        <Sparkles className="w-12 h-12 mx-auto text-[var(--primary)]" />
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-0)]">
          Arrête de procrastiner ton expatriation.
        </h2>
        <p className="text-[var(--text-2)] text-lg">
          En 2 minutes, tu sauras où tu paies le moins d&apos;impôts pour ton profil. Gratuit, sans CB.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold hover:scale-[1.02] transition-transform"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
        >
          Lancer ma simulation maintenant
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}

/* ─── Sub-components ─── */

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass-panel p-4 text-center">
      <div
        className="text-3xl font-extrabold"
        style={{
          background: "linear-gradient(135deg, var(--primary), var(--secondary))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {value}
      </div>
      <div className="text-xs text-[var(--text-3)] mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function Pillar({
  icon: Icon,
  title,
  subtitle,
  description,
  color,
}: {
  icon: typeof Brain;
  title: string;
  subtitle: string;
  description: string;
  color: string;
}) {
  return (
    <div
      className="glass-panel p-6 space-y-3 hover:scale-[1.02] transition-transform"
      style={{ border: "1px solid var(--border-1)" }}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-[var(--text-0)]">{title}</h3>
        <p className="text-sm text-[var(--text-3)]">{subtitle}</p>
      </div>
      <p className="text-[var(--text-2)] text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Cell({ children, head = false, highlight = false }: { children: React.ReactNode; head?: boolean; highlight?: boolean }) {
  return (
    <div
      className={`px-4 py-3 ${head ? "font-bold" : ""} ${highlight ? "text-[var(--primary)]" : "text-[var(--text-1)]"}`}
      style={{
        background: head ? "var(--bg-2)" : "transparent",
        borderBottom: "1px solid var(--border-0)",
      }}
    >
      {children}
    </div>
  );
}

function ComparisonRow({ label, left, right }: { label: string; left: string; right: string }) {
  return (
    <>
      <Cell>{label}</Cell>
      <Cell>{left}</Cell>
      <Cell highlight>{right}</Cell>
    </>
  );
}

function PricingCard({
  name,
  price,
  period,
  tagline,
  features,
  cta,
  ctaLink,
  highlight = false,
}: {
  name: string;
  price: string;
  period?: string;
  tagline: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="glass-panel p-6 space-y-4 relative"
      style={{
        border: highlight ? "2px solid var(--primary)" : "1px solid var(--border-1)",
      }}
    >
      {highlight && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
        >
          Plus populaire
        </div>
      )}
      <div>
        <h3 className="text-xl font-bold text-[var(--text-0)]">{name}</h3>
        <p className="text-xs text-[var(--text-3)] uppercase tracking-wide">{tagline}</p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-[var(--text-0)]">{price}</span>
        {period && <span className="text-sm text-[var(--text-3)]">{period}</span>}
      </div>
      <ul className="space-y-2">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-[var(--text-1)]">
            <Check size={16} className="text-[var(--success)] flex-shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaLink}
        className={`block text-center px-4 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] ${highlight ? "text-white" : "text-[var(--text-1)] border"}`}
        style={
          highlight
            ? { background: "linear-gradient(135deg, #2563EB, #7C3AED)" }
            : { borderColor: "var(--border-1)" }
        }
      >
        {cta}
      </Link>
    </div>
  );
}
