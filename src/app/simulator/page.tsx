"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  DollarSign,
  Home,
  Briefcase,
  Sun,
  Check,
  Loader2,
  Save,
  Sliders,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { apiFetch } from "@/lib/api-client";

type CountryMeta = {
  id: string;
  name: string;
  flag: string;
  taxRate: number; // Effective or flat rate %
  taxRegime: string;
  baseCost: number; // Single person comfort cost €/m
  visa: string;
  climate: string;
  internetSpeed: string;
  qualityOfLife: number; // /100
  color: string;
  highlights: string[];
};

const COUNTRY_PROFILES: CountryMeta[] = [
  {
    id: "fr",
    name: "France",
    flag: "🇫🇷",
    taxRate: 32,
    taxRegime: "Barème progressif + CSG",
    baseCost: 1850,
    visa: "Résident / Citoyen",
    climate: "Tempéré (4 saisons)",
    internetSpeed: "250 Mbps",
    qualityOfLife: 78,
    color: "#3B82F6",
    highlights: ["Système de santé", "Protection sociale", "Qualité de vie culturelle"],
  },
  {
    id: "pt",
    name: "Portugal",
    flag: "🇵🇹",
    taxRate: 20,
    taxRegime: "NHR / RNH (20% fixe)",
    baseCost: 1250,
    visa: "Visa D8 Digital Nomad",
    climate: "Méditerranéen (300j soleil)",
    internetSpeed: "300 Mbps",
    qualityOfLife: 88,
    color: "#10B981",
    highlights: ["Exonération ou 20% fixe", "Sécurité #1 Europe", "Hubs Lisbonne & Porto"],
  },
  {
    id: "ae",
    name: "Dubaï (Émirats)",
    flag: "🇦🇪",
    taxRate: 0,
    taxRegime: "0% Impôt sur le revenu",
    baseCost: 2650,
    visa: "Golden Visa (10 ans) / Virtual Worker",
    climate: "Désertique chaud",
    internetSpeed: "400 Mbps",
    qualityOfLife: 84,
    color: "#F59E0B",
    highlights: ["Zéro fiscalité perso", "Hub business mondial", "Sécurité absolue 24/7"],
  },
  {
    id: "ma",
    name: "Maroc",
    flag: "🇲🇦",
    taxRate: 15,
    taxRegime: "Statut Expat / Auto-Entrepreneur",
    baseCost: 850,
    visa: "Séjour libre / Carte de séjour",
    climate: "Ensoleillé (320j soleil)",
    internetSpeed: "150 Mbps",
    qualityOfLife: 82,
    color: "#EF4444",
    highlights: ["Proximité France (3h vol)", "Francophone & accueillant", "Coût de vie ultra doux"],
  },
  {
    id: "es",
    name: "Espagne",
    flag: "🇪🇸",
    taxRate: 24,
    taxRegime: "Loi Beckham (24% forfaitaire)",
    baseCost: 1450,
    visa: "Visa Digital Nomad",
    climate: "Méditerranéen",
    internetSpeed: "350 Mbps",
    qualityOfLife: 86,
    color: "#EC4899",
    highlights: ["Loi Beckham 24% sur 6 ans", "Ambiance & gastronomie", "Réseau TGV & vols"],
  },
  {
    id: "th",
    name: "Thaïlande",
    flag: "🇹🇭",
    taxRate: 10,
    taxRegime: "Visa DTV / LTR Expat",
    baseCost: 750,
    visa: "DTV (5 ans) / LTR (10 ans)",
    climate: "Tropical chaud",
    internetSpeed: "300 Mbps",
    qualityOfLife: 87,
    color: "#8B5CF6",
    highlights: ["DTV 5 ans très accessible", "Capitale nomade Chiang Mai / Phuket", "Coût imbattable"],
  },
];

export default function SimulatorPage() {
  // User input controls
  const [grossSalary, setGrossSalary] = useState<number>(4500);
  const [lifestyle, setLifestyle] = useState<"eco" | "confort" | "premium">("confort");
  const [familyStatus, setFamilyStatus] = useState<"solo" | "couple" | "famille">("solo");
  const [selectedCountryId, setSelectedCountryId] = useState<string>("pt");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [activeTab, setActiveTab] = useState<"comparison" | "trajectory" | "breakdown">("comparison");

  // Lifestyle cost multiplier
  const lifestyleMultiplier = useMemo(() => {
    switch (lifestyle) {
      case "eco":
        return 0.75;
      case "premium":
        return 1.6;
      default:
        return 1.0;
    }
  }, [lifestyle]);

  // Family cost multiplier
  const familyMultiplier = useMemo(() => {
    switch (familyStatus) {
      case "couple":
        return 1.5;
      case "famille":
        return 2.1;
      default:
        return 1.0;
    }
  }, [familyStatus]);

  // Dynamic calculations for each country based on user input
  const computedCountries = useMemo(() => {
    return COUNTRY_PROFILES.map((c) => {
      const taxAmount = (grossSalary * c.taxRate) / 100;
      const netAfterTax = grossSalary - taxAmount;
      const monthlyCost = Math.round(c.baseCost * lifestyleMultiplier * familyMultiplier);
      const monthlySavings = Math.max(0, netAfterTax - monthlyCost);
      const savings1Y = monthlySavings * 12;
      const savings3Y = monthlySavings * 36;
      const savings5Y = monthlySavings * 60;
      const savings10Y = monthlySavings * 120;

      return {
        ...c,
        taxAmount,
        netAfterTax,
        monthlyCost,
        monthlySavings,
        savings1Y,
        savings3Y,
        savings5Y,
        savings10Y,
      };
    });
  }, [grossSalary, lifestyleMultiplier, familyMultiplier]);

  const france = useMemo(
    () => computedCountries.find((c) => c.id === "fr") || computedCountries[0],
    [computedCountries]
  );
  const targetCountry = useMemo(
    () => computedCountries.find((c) => c.id === selectedCountryId) || computedCountries[1],
    [computedCountries, selectedCountryId]
  );

  // Net monthly savings difference vs France
  const diffSavingsMonthly = targetCountry.monthlySavings - france.monthlySavings;
  const diffSavings5Y = targetCountry.savings5Y - france.savings5Y;

  // Chart data: 5-year savings trajectory
  const trajectoryChartData = useMemo(() => {
    const years = [0, 1, 2, 3, 4, 5];
    return years.map((y) => {
      const entry: Record<string, number | string> = { year: `${y} an${y > 1 ? "s" : ""}` };
      computedCountries.forEach((c) => {
        entry[c.name] = c.monthlySavings * 12 * y;
      });
      return entry;
    });
  }, [computedCountries]);

  // Chart data: monthly breakdown (Tax, Cost, Savings)
  const breakdownChartData = useMemo(() => {
    return computedCountries.map((c) => ({
      name: c.name,
      Impôts: Math.round(c.taxAmount),
      "Coût de vie": Math.round(c.monthlyCost),
      "Épargne Nette": Math.round(c.monthlySavings),
    }));
  }, [computedCountries]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const res = await apiFetch("/api/simulator", {
        method: "POST",
        body: JSON.stringify({
          destination: targetCountry.name,
          score: targetCountry.qualityOfLife,
          visa: targetCountry.visa,
          salary: grossSalary,
          tax_rate: targetCountry.taxRate,
          cost_of_living: targetCountry.monthlyCost,
          climate: targetCountry.climate,
          savings: targetCountry.monthlySavings,
          net_gain_vs_france: diffSavings5Y,
        }),
      });
      if (res.ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [targetCountry, grossSalary, diffSavings5Y]);

  return (
    <div lang="fr" dir="ltr" className="min-h-screen relative overflow-hidden pb-24">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 -right-1/4 w-[120%] h-[550px] bg-gradient-to-t from-[rgba(14,165,233,0.06)] via-[rgba(139,92,246,0.04)] to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 space-y-10 relative z-10">
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-1)] border border-[var(--border-2)] text-xs font-mono text-[var(--primary)] mb-3 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
              </span>
              <span>SIMULATEUR FISCAL & ARBITRAGE GÉOGRAPHIQUE 2026</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--text-0)] font-display leading-[1.1]">
              Arbitrez votre vie sur <span className="text-gradient-primary">des chiffres réels</span>.
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-2)] max-w-3xl mt-3 font-medium leading-relaxed">
              Ajustez vos revenus et votre mode de vie pour comparer instantanément impôts, coût de la vie et
              capacité d&apos;épargne cumulée entre la France et les meilleures destinations nomades.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-stitch px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-[var(--primary)]/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Sauvegardé !
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Enregistrer la simulation
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── Interactive Parameter Controls ─── */}
        <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-[var(--border-1)] shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-2 pb-5 border-b border-[var(--border-0)] mb-6 text-sm font-bold text-[var(--text-1)] uppercase tracking-wider font-display">
            <Sliders className="w-4 h-4 text-[var(--primary)]" />
            <span>Paramètres de Votre Situation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Salary Slider & Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="gross-salary-input" className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
                  Revenu Brut Mensuel
                </label>
                <div className="flex items-center gap-1 text-lg font-mono font-extrabold text-[var(--text-0)] bg-[var(--bg-2)] px-3 py-1 rounded-xl border border-[var(--border-1)]">
                  <input
                    id="gross-salary-input"
                    type="number"
                    min={1000}
                    max={30000}
                    step={100}
                    value={grossSalary}
                    onChange={(e) => setGrossSalary(Math.max(500, Number(e.target.value) || 0))}
                    className="w-24 bg-transparent text-right outline-none font-mono"
                    aria-label="Revenu Brut Mensuel en euros"
                  />
                  <span>€/m</span>
                </div>
              </div>

              <input
                type="range"
                min={1500}
                max={20000}
                step={250}
                value={grossSalary}
                onChange={(e) => setGrossSalary(Number(e.target.value))}
                className="w-full accent-[var(--primary)] h-2 bg-[var(--bg-3)] rounded-lg cursor-pointer"
                aria-label="Revenu Brut Mensuel curseur"
              />

              <div className="flex justify-between text-[11px] text-[var(--text-3)] font-mono">
                <span>1 500 €</span>
                <span>10 000 €</span>
                <span>20 000 €+</span>
              </div>
            </div>

            {/* Lifestyle selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
                Standing / Mode de Vie
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "eco", label: "Éco", desc: "Studio / Coliving" },
                  { id: "confort", label: "Confort", desc: "T2 Moderne" },
                  { id: "premium", label: "Premium", desc: "Villa / Penthouse" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLifestyle(item.id as "eco" | "confort" | "premium")}
                    className={`py-3 px-2 rounded-2xl text-center transition-all border ${
                      lifestyle === item.id
                        ? "bg-[var(--primary)]/15 border-[var(--primary)] text-[var(--text-0)] font-bold shadow-md shadow-[var(--primary)]/10"
                        : "bg-[var(--bg-2)] border-[var(--border-0)] text-[var(--text-2)] hover:text-[var(--text-0)]"
                    }`}
                  >
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-[var(--text-3)] mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Family status */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
                Situation Foyer
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "solo", label: "Solo", desc: "1 personne" },
                  { id: "couple", label: "Couple", desc: "2 personnes" },
                  { id: "famille", label: "Famille", desc: "Couple + Enfants" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFamilyStatus(item.id as "solo" | "couple" | "famille")}
                    className={`py-3 px-2 rounded-2xl text-center transition-all border ${
                      familyStatus === item.id
                        ? "bg-[var(--secondary)]/15 border-[var(--secondary)] text-[var(--text-0)] font-bold shadow-md shadow-[var(--secondary)]/10"
                        : "bg-[var(--bg-2)] border-[var(--border-0)] text-[var(--text-2)] hover:text-[var(--text-0)]"
                    }`}
                  >
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-[var(--text-3)] mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Destination Picker Pills ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] flex items-center gap-1.5 font-mono">
              <Globe className="w-3.5 h-3.5 text-[var(--primary)]" />
              Choisissez la Destination à Comparer avec la France :
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {computedCountries
              .filter((c) => c.id !== "fr")
              .map((c) => {
                const isActive = c.id === selectedCountryId;
                const gainMonthly = c.monthlySavings - france.monthlySavings;

                return (
                  <motion.button
                    key={c.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCountryId(c.id)}
                    className={`p-4 rounded-2xl text-left transition-all border relative overflow-hidden ${
                      isActive
                        ? "bg-[var(--bg-2)] border-[var(--primary)] shadow-lg shadow-[var(--primary)]/15"
                        : "bg-[var(--bg-1)] border-[var(--border-1)] hover:border-[var(--border-2)] text-[var(--text-2)]"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-full bg-[var(--primary)]" />
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{c.flag}</span>
                      <span
                        className={`text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-md ${
                          gainMonthly >= 0
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {gainMonthly >= 0 ? `+${gainMonthly.toLocaleString()}€/m` : `${gainMonthly.toLocaleString()}€/m`}
                      </span>
                    </div>
                    <p className="text-sm font-extrabold text-[var(--text-0)] font-display">{c.name}</p>
                    <p className="text-[11px] text-[var(--text-3)] mt-0.5 truncate">{c.taxRegime}</p>
                  </motion.button>
                );
              })}
          </div>
        </div>

        {/* ─── Hero Duel Comparison Cards ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* France Card */}
          <div className="glass-panel p-8 rounded-[28px] border border-[var(--border-1)] flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[var(--border-0)]">
                <div className="flex items-center gap-3.5">
                  <span className="text-4xl">{france.flag}</span>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[var(--text-0)] font-display">{france.name}</h3>
                    <p className="text-xs text-[var(--text-3)] uppercase font-mono">Situation de départ</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  {france.taxRate}% D&apos;IMPÔTS
                </span>
              </div>

              <div className="space-y-4 my-6">
                <div className="flex justify-between py-2 border-b border-[var(--border-0)] text-sm">
                  <span className="text-[var(--text-2)] flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[var(--text-3)]" /> Impôts & Cotisations estimés
                  </span>
                  <span className="font-mono font-bold text-red-400">
                    -{Math.round(france.taxAmount).toLocaleString()} €/m
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-[var(--border-0)] text-sm">
                  <span className="text-[var(--text-2)] flex items-center gap-2">
                    <Home className="w-4 h-4 text-[var(--text-3)]" /> Coût de la vie ({lifestyle})
                  </span>
                  <span className="font-mono font-bold text-[var(--text-1)]">
                    -{france.monthlyCost.toLocaleString()} €/m
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-[var(--border-0)] text-sm">
                  <span className="text-[var(--text-2)] flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[var(--text-3)]" /> Revenu Net Réel Disponible
                  </span>
                  <span className="font-mono font-bold text-[var(--text-0)]">
                    {Math.round(france.netAfterTax).toLocaleString()} €/m
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-0)] bg-[var(--bg-2)]/40 -mx-8 -mb-8 p-8 rounded-b-[28px]">
              <span className="text-xs uppercase font-bold text-[var(--text-3)] font-mono">
                Capacité d&apos;Épargne Mensuelle
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-[var(--text-0)] font-mono mt-1">
                {france.monthlySavings.toLocaleString()} €{" "}
                <span className="text-xs text-[var(--text-3)] font-sans font-normal">/ mois</span>
              </p>
              <p className="text-xs text-[var(--text-3)] mt-2">
                Soit {france.savings5Y.toLocaleString()} € épargnés sur 5 ans.
              </p>
            </div>
          </div>

          {/* Destination Target Card */}
          <div className="glass-panel p-8 rounded-[28px] border-2 border-[var(--primary)]/40 shadow-[0_0_50px_rgba(14,165,233,0.1)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black font-extrabold text-xs rounded-bl-2xl uppercase tracking-widest font-mono">
              OPTIMISATION GAGNANTE
            </div>

            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[var(--border-0)] mt-2">
                <div className="flex items-center gap-3.5">
                  <span className="text-4xl">{targetCountry.flag}</span>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[var(--text-0)] font-display">
                      {targetCountry.name}
                    </h3>
                    <p className="text-xs text-[var(--primary)] font-mono font-semibold">
                      {targetCountry.visa}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {targetCountry.taxRate}% FISCALITÉ
                </span>
              </div>

              <div className="space-y-4 my-6">
                <div className="flex justify-between py-2 border-b border-[var(--border-0)] text-sm">
                  <span className="text-[var(--text-2)] flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[var(--text-3)]" /> Impôts effectifs ({targetCountry.taxRegime})
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    -{Math.round(targetCountry.taxAmount).toLocaleString()} €/m
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-[var(--border-0)] text-sm">
                  <span className="text-[var(--text-2)] flex items-center gap-2">
                    <Home className="w-4 h-4 text-[var(--text-3)]" /> Coût de la vie ({lifestyle})
                  </span>
                  <span className="font-mono font-bold text-[var(--text-1)]">
                    -{targetCountry.monthlyCost.toLocaleString()} €/m
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-[var(--border-0)] text-sm">
                  <span className="text-[var(--text-2)] flex items-center gap-2">
                    <Sun className="w-4 h-4 text-[var(--text-3)]" /> Climat & Qualité de Vie
                  </span>
                  <span className="font-bold text-[var(--primary)]">
                    {targetCountry.climate} ({targetCountry.qualityOfLife}/100)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-0)] bg-[var(--primary)]/10 -mx-8 -mb-8 p-8 rounded-b-[28px]">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-[var(--primary)] font-mono">
                  Capacité d&apos;Épargne Mensuelle
                </span>
                <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded-full bg-emerald-500 text-black">
                  +{diffSavingsMonthly.toLocaleString()} €/m vs FR
                </span>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[var(--text-0)] font-mono mt-1">
                {targetCountry.monthlySavings.toLocaleString()} €{" "}
                <span className="text-xs text-[var(--text-3)] font-sans font-normal">/ mois</span>
              </p>
              <p className="text-xs text-[var(--text-2)] mt-2 font-medium">
                🎯 <strong>Gain net d&apos;enrichissement sur 5 ans : +{diffSavings5Y.toLocaleString()} €</strong> par
                rapport à la France.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Visual Analysis Tabs (Charts & Matrix) ─── */}
        <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-[var(--border-1)] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-0)]">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-xl font-extrabold text-[var(--text-0)] font-display">
                Projections & Graphiques Comparatifs
              </h2>
            </div>

            <div className="flex gap-1 p-1 bg-[var(--bg-2)] rounded-xl border border-[var(--border-0)] text-xs font-bold">
              <button
                onClick={() => setActiveTab("comparison")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "comparison"
                    ? "bg-[var(--primary)] text-black"
                    : "text-[var(--text-2)] hover:text-[var(--text-0)]"
                }`}
              >
                Matrice Globale
              </button>
              <button
                onClick={() => setActiveTab("trajectory")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "trajectory"
                    ? "bg-[var(--primary)] text-black"
                    : "text-[var(--text-2)] hover:text-[var(--text-0)]"
                }`}
              >
                Trajectoire 5 Ans
              </button>
              <button
                onClick={() => setActiveTab("breakdown")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "breakdown"
                    ? "bg-[var(--primary)] text-black"
                    : "text-[var(--text-2)] hover:text-[var(--text-0)]"
                }`}
              >
                Ventilation Mensuelle
              </button>
            </div>
          </div>

          {/* Tab 1: Full Comparison Matrix */}
          {activeTab === "comparison" && (
            <div className="overflow-x-auto custom-scroll">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-0)] text-xs uppercase font-mono text-[var(--text-3)]">
                    <th className="pb-3 font-semibold">Pays</th>
                    <th className="pb-3 font-semibold">Taux Fiscal</th>
                    <th className="pb-3 font-semibold">Coût de Vie</th>
                    <th className="pb-3 font-semibold">Épargne / Mois</th>
                    <th className="pb-3 font-semibold">Épargne 5 Ans</th>
                    <th className="pb-3 font-semibold">Gain vs France</th>
                    <th className="pb-3 font-semibold">Visa Principal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-0)]">
                  {computedCountries.map((c) => {
                    const gain5Y = c.savings5Y - france.savings5Y;
                    const isSelected = c.id === selectedCountryId;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCountryId(c.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[var(--primary)]/10 font-bold"
                            : "hover:bg-[var(--bg-2)]/60 text-[var(--text-1)]"
                        }`}
                      >
                        <td className="py-3.5 flex items-center gap-2">
                          <span className="text-xl">{c.flag}</span>
                          <span className="font-bold text-[var(--text-0)]">{c.name}</span>
                        </td>
                        <td className="py-3.5 font-mono text-[var(--text-2)]">
                          {c.taxRate}% <span className="text-xs text-[var(--text-3)]">({c.taxRegime})</span>
                        </td>
                        <td className="py-3.5 font-mono">{c.monthlyCost.toLocaleString()} €</td>
                        <td className="py-3.5 font-mono font-bold text-emerald-400">
                          {c.monthlySavings.toLocaleString()} €
                        </td>
                        <td className="py-3.5 font-mono font-bold text-[var(--text-0)]">
                          {c.savings5Y.toLocaleString()} €
                        </td>
                        <td className="py-3.5 font-mono font-extrabold">
                          {c.id === "fr" ? (
                            <span className="text-[var(--text-3)]">Référence</span>
                          ) : (
                            <span className={gain5Y >= 0 ? "text-emerald-400" : "text-red-400"}>
                              {gain5Y >= 0 ? `+${gain5Y.toLocaleString()} €` : `${gain5Y.toLocaleString()} €`}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-xs text-[var(--text-3)]">{c.visa}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: 5-Year Trajectory Chart */}
          {activeTab === "trajectory" && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-3)] font-mono">
                Évolution de votre capital net cumulé en fonction du pays de résidence (Revenu : {grossSalary.toLocaleString()}€/m)
              </p>
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trajectoryChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      {computedCountries.map((c) => (
                        <linearGradient key={c.id} id={`grad-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={c.color} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={c.color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis dataKey="year" stroke="var(--text-3)" fontSize={12} tickLine={false} />
                    <YAxis
                      stroke="var(--text-3)"
                      fontSize={12}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-1)",
                        border: "1px solid var(--border-1)",
                        borderRadius: "16px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      }}
                      formatter={(val: unknown) => `${Number(val || 0).toLocaleString()} €`}
                    />
                    <Legend />
                    {computedCountries.map((c) => (
                      <Area
                        key={c.id}
                        type="monotone"
                        dataKey={c.name}
                        stroke={c.color}
                        strokeWidth={c.id === selectedCountryId ? 3 : 1.5}
                        fillOpacity={1}
                        fill={`url(#grad-${c.id})`}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tab 3: Monthly Breakdown Bar Chart */}
          {activeTab === "breakdown" && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-3)] font-mono">
                Ventilation mensuelle du revenu brut ({grossSalary.toLocaleString()}€/m) : Impôts vs Dépenses vs Épargne
              </p>
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdownChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="var(--text-3)" fontSize={12} tickLine={false} />
                    <YAxis
                      stroke="var(--text-3)"
                      fontSize={12}
                      tickFormatter={(v) => `${(v / 1000).toFixed(1)}k€`}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-1)",
                        border: "1px solid var(--border-1)",
                        borderRadius: "16px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      }}
                      formatter={(val: unknown) => `${Number(val || 0).toLocaleString()} €`}
                    />
                    <Legend />
                    <Bar dataKey="Impôts" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Coût de vie" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Épargne Nette" stackId="a" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
