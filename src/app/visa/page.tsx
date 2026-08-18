"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Plus,
  Globe,
  X,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { VISA_COUNTRIES } from "@/lib/visa-countries";
import VisaTracker, { StoredVisa } from "@/components/VisaTracker";
import { Button, Card, Field, Select, Input } from "@/components/ui";

type RegionFilter = "all" | "europe" | "asia" | "americas" | "me_africa" | "zero_tax" | "low_income";

type StayPeriod = {
  id: string;
  startDate: string;
  endDate: string;
};

export default function VisaPage() {
  const { user } = useAuth();
  const [visas, setVisas] = useState<StoredVisa[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [countryCode, setCountryCode] = useState("PT");
  const [entryDate, setEntryDate] = useState("2026-01-15");

  // Catalog search & filters
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all");
  const [sortBy, setSortBy] = useState<"popular" | "income_asc" | "income_desc" | "duration">("popular");

  // Schengen 90/180 Calculator state
  const [schengenStays, setSchengenStays] = useState<StayPeriod[]>([
    {
      id: "1",
      startDate: "2026-05-01",
      endDate: "2026-05-30",
    },
  ]);
  const [newStayStart, setNewStayStart] = useState("");
  const [newStayEnd, setNewStayEnd] = useState("");

  // Load the current user's visas from Firestore
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const q = query(collection(db, COLLECTIONS.VISAS), where("user_id", "==", user.uid));
        const snap = await getDocs(q);
        if (!cancelled) {
          setVisas(
            snap.docs
              .map((d) => ({ id: d.id, ...(d.data() as Omit<StoredVisa, "id">) }))
              .sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1))
          );
        }
      } catch {
        /* fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const addVisa = async () => {
    if (!user || saving) return;
    setSaving(true);
    const country = VISA_COUNTRIES.find(
      (c) => c.slug.toUpperCase() === countryCode || c.slug === countryCode.toLowerCase()
    );
    const ref = doc(collection(db, COLLECTIONS.VISAS));
    const newVisa: StoredVisa = {
      id: ref.id,
      country_code: countryCode,
      entry_date: entryDate,
      max_stay_days: country?.maxStayDays ?? 90,
    };
    try {
      await setDoc(ref, { ...newVisa, user_id: user.uid, created_at: new Date().toISOString() });
      setVisas((prev) => [newVisa, ...prev]);
      setShowAddForm(false);
    } catch {
      /* ignore */
    }
    setSaving(false);
  };

  const deleteVisa = async (id: string) => {
    setVisas((prev) => prev.filter((v) => v.id !== id));
    try {
      await deleteDoc(doc(db, COLLECTIONS.VISAS, id));
    } catch {
      /* optimistic */
    }
  };

  // Schengen 90/180 calculation logic
  const schengenStats = useMemo(() => {
    const today = new Date();
    const windowStart = new Date(today.getTime() - 180 * 86400000);

    let daysUsed = 0;
    schengenStays.forEach((stay) => {
      if (!stay.startDate || !stay.endDate) return;
      const start = new Date(stay.startDate);
      const end = new Date(stay.endDate);

      // Clamp to 180 day window
      const effectiveStart = start < windowStart ? windowStart : start;
      const effectiveEnd = end > today ? today : end;

      if (effectiveEnd >= effectiveStart) {
        const diffDays = Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / 86400000) + 1;
        daysUsed += Math.max(0, diffDays);
      }
    });

    const daysRemaining = Math.max(0, 90 - daysUsed);
    const isOverstay = daysUsed > 90;

    return {
      daysUsed,
      daysRemaining,
      isOverstay,
      windowStartStr: windowStart.toLocaleDateString("fr-FR"),
    };
  }, [schengenStays]);

  const addSchengenStay = () => {
    if (!newStayStart || !newStayEnd) return;
    setSchengenStays((prev) => [
      ...prev,
      { id: Date.now().toString(), startDate: newStayStart, endDate: newStayEnd },
    ]);
    setNewStayStart("");
    setNewStayEnd("");
  };

  const removeSchengenStay = (id: string) => {
    setSchengenStays((prev) => prev.filter((s) => s.id !== id));
  };

  // Filtered and sorted 50 countries list
  const filteredCountries = useMemo(() => {
    let list = [...VISA_COUNTRIES];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.visaName.toLowerCase().includes(q) ||
          c.capitalCity.toLowerCase().includes(q)
      );
    }

    // Region category filter
    if (regionFilter !== "all") {
      if (regionFilter === "zero_tax") {
        list = list.filter((c) => c.taxFlatRate === 0);
      } else if (regionFilter === "low_income") {
        list = list.filter((c) => c.minIncome <= 2000);
      } else if (regionFilter === "europe") {
        const europeSlugs = [
          "portugal", "espagne", "italie", "estonie", "croatie", "grece", "chypre",
          "malte", "georgie", "allemagne", "pays-bas", "irlande", "royaume-uni",
          "norvege", "suede", "danemark", "finlande", "suisse", "luxembourg",
        ];
        list = list.filter((c) => europeSlugs.includes(c.slug));
      } else if (regionFilter === "asia") {
        const asiaSlugs = ["thailande", "indonesie", "malaisie", "vietnam", "philippines", "japon", "coree-du-sud"];
        list = list.filter((c) => asiaSlugs.includes(c.slug));
      } else if (regionFilter === "americas") {
        const americasSlugs = ["canada", "etats-unis", "mexique", "panama", "costa-rica", "colombie", "argentine", "bresil"];
        list = list.filter((c) => americasSlugs.includes(c.slug));
      } else if (regionFilter === "me_africa") {
        const meAfricaSlugs = ["emirats-arabes-unis", "maroc", "tunisie", "afrique-du-sud", "ile-maurice"];
        list = list.filter((c) => meAfricaSlugs.includes(c.slug));
      }
    }

    // Sort order
    if (sortBy === "income_asc") {
      list.sort((a, b) => a.minIncome - b.minIncome);
    } else if (sortBy === "income_desc") {
      list.sort((a, b) => b.minIncome - a.minIncome);
    } else if (sortBy === "duration") {
      list.sort((a, b) => b.maxStayDays - a.maxStayDays);
    }

    return list;
  }, [searchQuery, regionFilter, sortBy]);

  return (
    <motion.div
      lang="fr"
      dir="ltr"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-12 max-w-7xl mx-auto w-full pt-4 pb-20"
    >
      {/* ─── Hero Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-0)]">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/15"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold font-display text-[var(--text-0)] tracking-tight">
                Visa Tracker & Annuaire 50 Pays
              </h1>
              <span className="text-xs uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                50 Guides Actifs
              </span>
            </div>
            <p className="text-sm text-[var(--text-2)] mt-1 font-medium">
              Suivez la validité de vos séjours, calculez vos 90 jours Schengen et explorez les visas digital nomads du monde.
            </p>
          </div>
        </div>

        {user && (
          <Button variant="subtle" onClick={() => setShowAddForm((v) => !v)} className="shrink-0">
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddForm ? "Fermer" : "Ajouter un visa en cours"}
          </Button>
        )}
      </div>

      {/* ─── Add Visa Form (Logged In) ─── */}
      {user && showAddForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card variant="glass" padding="md" className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] items-end border border-emerald-500/30">
            <Field label="Pays / Destination" htmlFor="visa-country">
              <Select id="visa-country" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                {VISA_COUNTRIES.map((c) => (
                  <option key={c.slug} value={c.slug.toUpperCase()}>
                    {c.flag} {c.name} — {c.maxStayDays} jours ({c.visaName})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Date d'entrée" htmlFor="visa-date">
              <Input
                id="visa-date"
                type="date"
                value={entryDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </Field>
            <Button onClick={addVisa} loading={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
              {!saving && <Plus className="w-4 h-4" />}
              Enregistrer mon séjour
            </Button>
          </Card>
        </motion.div>
      )}

      {/* ─── Active User Visas ─── */}
      {user && visas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-0)] font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Vos Séjours & Visas Actifs ({visas.length})</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {visas.map((visa) => (
              <VisaTracker key={visa.id} visa={visa} onDelete={deleteVisa} />
            ))}
          </div>
        </div>
      )}

      {/* ─── Schengen 90/180 Days Interactive Calculator ─── */}
      <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-[var(--border-1)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-0)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[var(--text-0)] font-display">
                Calculateur Règle des 90/180 Jours Schengen
              </h2>
              <p className="text-xs text-[var(--text-3)]">
                Contrôle automatique de votre quota de séjour légal dans l&apos;espace Schengen sur une fenêtre glissante de 180 jours.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[var(--bg-2)] px-4 py-2 rounded-2xl border border-[var(--border-0)]">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-[var(--text-3)] font-mono">Jours Restants</p>
              <p
                className={`text-xl font-mono font-extrabold ${
                  schengenStats.isOverstay
                    ? "text-red-400"
                    : schengenStats.daysRemaining < 15
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {schengenStats.daysRemaining} / 90 j
              </p>
            </div>
          </div>
        </div>

        {/* Stays List & Add stay row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stays summary & inputs */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-xs font-bold uppercase text-[var(--text-2)] font-mono">
              Vos Séjours Récents en Zone Schengen :
            </p>

            <div className="space-y-2">
              {schengenStays.map((stay) => (
                <div
                  key={stay.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-1)] border border-[var(--border-0)] text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[var(--primary)]" />
                    <span className="font-mono font-semibold text-[var(--text-1)]">
                      Du {new Date(stay.startDate).toLocaleDateString("fr-FR")} au{" "}
                      {new Date(stay.endDate).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <button
                    onClick={() => removeSchengenStay(stay.id)}
                    className="text-xs text-[var(--text-3)] hover:text-red-400 p-1 rounded transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>

            {/* Input row to add a stay */}
            <div className="flex flex-wrap items-end gap-3 p-4 rounded-2xl bg-[var(--bg-2)]/60 border border-[var(--border-0)]">
              <div className="flex-1 min-w-[140px]">
                <label className="text-[11px] font-bold text-[var(--text-3)] uppercase block mb-1">
                  Date d&apos;entrée
                </label>
                <input
                  type="date"
                  value={newStayStart}
                  onChange={(e) => setNewStayStart(e.target.value)}
                  className="w-full bg-[var(--bg-1)] border border-[var(--border-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-0)] outline-none"
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-[11px] font-bold text-[var(--text-3)] uppercase block mb-1">
                  Date de sortie
                </label>
                <input
                  type="date"
                  value={newStayEnd}
                  onChange={(e) => setNewStayEnd(e.target.value)}
                  className="w-full bg-[var(--bg-1)] border border-[var(--border-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-0)] outline-none"
                />
              </div>
              <button
                onClick={addSchengenStay}
                disabled={!newStayStart || !newStayEnd}
                className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dim)] text-black text-xs font-bold disabled:opacity-40 transition-all"
              >
                + Ajouter ce séjour
              </button>
            </div>
          </div>

          {/* Status Gauge & Warnings */}
          <div className="p-6 rounded-2xl bg-[var(--bg-1)] border border-[var(--border-1)] flex flex-col justify-between space-y-4">
            <div>
              <p className="text-xs uppercase font-bold text-[var(--text-3)] font-mono">Bilan de Conformité</p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-2)]">Jours utilisés (180j glissants) :</span>
                  <span className="font-mono font-bold text-[var(--text-0)]">{schengenStats.daysUsed} jours</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--bg-3)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      schengenStats.isOverstay
                        ? "bg-red-500"
                        : schengenStats.daysUsed > 75
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.min(100, (schengenStats.daysUsed / 90) * 100)}%` }}
                  />
                </div>
              </div>

              {schengenStats.isOverstay ? (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dépassement détecté !</strong> Vous dépassez le quota de 90 jours. Risque d&apos;amende et d&apos;interdiction de territoire.
                  </span>
                </div>
              ) : (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Situation conforme.</strong> Il vous reste {schengenStats.daysRemaining} jours autorisés.
                  </span>
                </div>
              )}
            </div>

            <p className="text-[10px] text-[var(--text-3)] leading-relaxed">
              Fenêtre calculée depuis le {schengenStats.windowStartStr}. Pour un séjour supérieur à 90 jours consécutifs, optez pour un visa D8/DTV.
            </p>
          </div>
        </div>
      </div>

      {/* ─── 50-Country Digital Nomad Explorer ─── */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[var(--text-0)] font-display flex items-center gap-2">
              <Globe className="w-6 h-6 text-[var(--primary)]" />
              <span>Annuaire des 50 Visas Digital Nomads ({filteredCountries.length})</span>
            </h2>
            <p className="text-xs text-[var(--text-3)] mt-0.5">
              Conditions de revenus, durée, fiscalité et avantages comparés.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[var(--text-3)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un pays, une capitale..."
              className="w-full bg-[var(--bg-1)] border border-[var(--border-1)] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[var(--text-0)] placeholder:text-[var(--text-3)] outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap gap-1.5 p-1 bg-[var(--bg-1)] border border-[var(--border-0)] rounded-2xl">
            {[
              { id: "all", label: "Tous (50)" },
              { id: "europe", label: "🇪🇺 Europe" },
              { id: "asia", label: "🌴 Asie" },
              { id: "americas", label: "🌎 Amériques" },
              { id: "me_africa", label: "🏜️ MENA & Afrique" },
              { id: "zero_tax", label: "💎 0% Impôt" },
              { id: "low_income", label: "⚡ Revenu < 2000€" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setRegionFilter(f.id as RegionFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  regionFilter === f.id
                    ? "bg-[var(--primary)] text-black font-bold shadow-sm"
                    : "text-[var(--text-2)] hover:text-[var(--text-0)] hover:bg-[var(--bg-2)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--text-2)]">
            <span className="font-semibold text-[var(--text-3)]">Trier :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "popular" | "income_asc" | "income_desc" | "duration")}
              className="bg-[var(--bg-1)] border border-[var(--border-1)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-0)] outline-none"
            >
              <option value="popular">Par Défaut</option>
              <option value="income_asc">Revenu min (Croissant)</option>
              <option value="income_desc">Revenu min (Décroissant)</option>
              <option value="duration">Durée max séjour</option>
            </select>
          </div>
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCountries.map((c) => (
            <Link key={c.slug} href={`/visa/${c.slug}`} className="group">
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="glass-panel p-6 rounded-[24px] border border-[var(--border-1)] group-hover:border-[var(--primary)]/40 transition-all flex flex-col justify-between h-full space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{c.flag}</span>
                      <div>
                        <h3 className="text-lg font-bold text-[var(--text-0)] group-hover:text-[var(--primary)] transition-colors font-display">
                          {c.name}
                        </h3>
                        <p className="text-xs text-[var(--text-3)] font-mono">{c.capitalCity}</p>
                      </div>
                    </div>

                    {c.taxFlatRate !== undefined && (
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                          c.taxFlatRate === 0
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {c.taxFlatRate === 0 ? "0% Tax" : `${c.taxFlatRate}% Tax`}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-[var(--primary)] mb-3">{c.visaName}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-y border-[var(--border-0)] text-[var(--text-2)] font-mono">
                    <div>
                      <span className="text-[10px] uppercase text-[var(--text-3)] block">Revenu Min</span>
                      <strong className="text-[var(--text-0)]">{c.minIncome.toLocaleString()} €/m</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[var(--text-3)] block">Durée Séjour</span>
                      <strong className="text-[var(--text-0)]">{c.maxStayDays} jours</strong>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    {c.highlights.slice(0, 2).map((h, i) => (
                      <p key={i} className="text-[11px] text-[var(--text-2)] flex items-center gap-1.5 truncate">
                        <span className="w-1 h-1 rounded-full bg-[var(--primary)] shrink-0" />
                        <span>{h}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between text-xs font-bold text-[var(--primary)] border-t border-[var(--border-0)]">
                  <span>Voir le guide complet</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
