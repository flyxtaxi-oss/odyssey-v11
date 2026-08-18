"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Search,
  X,
  Sparkles,
  ArrowRight,
  Globe,
  Shield,
  MapPin,
  Users,
  MessageSquare,
  Target,
  Settings,
  Calculator,
  Compass,
  Command,
  Loader2,
  CheckCircle2,
  WifiOff,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { VISA_COUNTRIES } from "@/lib/visa-countries";
import { useOfflineDB, offlineDB } from "@/lib/offline-db";
import { apiFetch } from "@/lib/api-client";

/** Event any component can dispatch on `window` to open the command palette. */
export const OPEN_COMMAND_CENTER = "odyssey:open-command-center";

type CommandItem = {
  id: string;
  title: string;
  subtitle: string;
  category: "Navigation" | "Visas & Pays" | "Outils & IA" | "Maroc OS";
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  href?: string;
  action?: () => void;
  badge?: string;
  flag?: string;
};

export default function CommandCenter() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<"search" | "ai">("search");
  const [status, setStatus] = useState<"idle" | "thinking" | "executing" | "success" | "offline">("idle");
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const { isOnline } = useOfflineDB();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K & Cmd+J / Ctrl+J)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "k" || e.key.toLowerCase() === "j")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // External open trigger
  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener(OPEN_COMMAND_CENTER, open);
    return () => window.removeEventListener(OPEN_COMMAND_CENTER, open);
  }, []);

  // Auto-focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Static navigation routes & features
  const staticItems: CommandItem[] = useMemo(
    () => [
      {
        id: "nav-dash",
        title: "Tableau de Bord",
        subtitle: "Aperçu de ton Odyssey Score et activités",
        category: "Navigation",
        icon: Compass,
        href: "/",
        badge: "ACCUEIL",
      },
      {
        id: "nav-jarvis",
        title: "J.A.R.V.I.S. Multi-Persona",
        subtitle: "Assistant IA stratégique, coach et exécuteur",
        category: "Outils & IA",
        icon: Brain,
        href: "/jarvis",
        badge: "FLAGSHIP",
      },
      {
        id: "nav-sim",
        title: "Simulateur Fiscal & Trajectoire",
        subtitle: "Compare impôts, salaires nets et épargne multipays",
        category: "Outils & IA",
        icon: Calculator,
        href: "/simulator",
        badge: "6 PAYS",
      },
      {
        id: "nav-predict",
        title: "Moteur Prédictif Multi-Agents",
        subtitle: "Simule tes 50 prochains mois à l'international",
        category: "Outils & IA",
        icon: Sparkles,
        href: "/simulator/predict",
        badge: "NOUVEAU",
      },
      {
        id: "nav-visa",
        title: "Visa Tracker & 50 Pays",
        subtitle: "Annuaire des visas nomades et calcul Schengen 90/180",
        category: "Visas & Pays",
        icon: Shield,
        href: "/visa",
        badge: "50 GUIDES",
      },
      {
        id: "nav-maroc",
        title: "Maroc OS — Hub Expatriation",
        subtitle: "Guides villes, fiscalité, démarches et coûts réels",
        category: "Maroc OS",
        icon: MapPin,
        href: "/maroc",
        badge: "🇲🇦 NOUVEAU",
      },
      {
        id: "nav-maroc-parcours",
        title: "Maroc Parcours A→Z",
        subtitle: "Feuille de route pas à pas pour s'installer",
        category: "Maroc OS",
        icon: Compass,
        href: "/maroc/parcours",
      },
      {
        id: "nav-maroc-serenite",
        title: "Indice de Sérénité Maroc",
        subtitle: "Trouve la ville marocaine idéale pour ton profil",
        category: "Maroc OS",
        icon: Shield,
        href: "/maroc/serenite",
      },
      {
        id: "nav-maroc-comp",
        title: "Comparateur Maroc vs Monde",
        subtitle: "Maroc vs Portugal, Dubaï, Espagne...",
        category: "Maroc OS",
        icon: Globe,
        href: "/maroc/comparateur",
      },
      {
        id: "nav-safezone",
        title: "La Safe-Zone",
        subtitle: "Communauté d'expatriés modérée par IA",
        category: "Navigation",
        icon: Users,
        href: "/safezone",
      },
      {
        id: "nav-lang",
        title: "Language Lab",
        subtitle: "Apprentissage express et répétition espacée (SRS)",
        category: "Outils & IA",
        icon: MessageSquare,
        href: "/language",
      },
      {
        id: "nav-skills",
        title: "Accélérateur de Compétences",
        subtitle: "Arbre de compétences et missions gamifiées",
        category: "Navigation",
        icon: Target,
        href: "/skills",
      },
      {
        id: "nav-settings",
        title: "Paramètres & Sécurité",
        subtitle: "Préférences, clés, export RGPD et profil",
        category: "Navigation",
        icon: Settings,
        href: "/settings",
      },
    ],
    []
  );

  // Country guides items
  const countryItems: CommandItem[] = useMemo(
    () =>
      VISA_COUNTRIES.map((c) => ({
        id: `visa-${c.slug}`,
        title: `Visa Nomad ${c.name}`,
        subtitle: `${c.visaName} • Dès ${c.minIncome.toLocaleString()}€/m • ${c.maxStayDays} jours`,
        category: "Visas & Pays",
        icon: Globe,
        href: `/visa/${c.slug}`,
        flag: c.flag,
        badge: c.taxFlatRate !== undefined ? `${c.taxFlatRate}% tax` : undefined,
      })),
    []
  );

  // Filtered items based on query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staticItems;

    const all = [...staticItems, ...countryItems];
    return all.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = item.subtitle.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      return matchTitle || matchSubtitle || matchCategory;
    });
  }, [query, staticItems, countryItems]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      scrollToSelected(selectedIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      scrollToSelected(selectedIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (mode === "ai" || query.startsWith("/ai ") || query.startsWith("?")) {
        handleAiSubmit();
      } else if (filteredItems[selectedIndex]) {
        executeItem(filteredItems[selectedIndex]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      setMode((prev) => (prev === "search" ? "ai" : "search"));
    }
  };

  const scrollToSelected = (index: number) => {
    if (!resultsContainerRef.current) return;
    const items = resultsContainerRef.current.querySelectorAll("[data-command-item]");
    const target = items[index] as HTMLElement | undefined;
    if (target) {
      target.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };

  const executeItem = (item: CommandItem) => {
    setIsOpen(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  // AI action execution
  const handleAiSubmit = async () => {
    const promptText = query.replace(/^\/ai\s+|\?/, "").trim();
    if (!promptText) return;

    if (!isOnline) {
      setStatus("offline");
      setAiResponse("Vous êtes hors-ligne. L'action a été mise en file d'attente.");
      await offlineDB.addToSyncQueue("agent", "create", { prompt: promptText });
      return;
    }

    setStatus("thinking");
    setAiResponse(null);

    try {
      const res = await apiFetch("/api/agent", {
        method: "POST",
        body: JSON.stringify({ prompt: promptText }),
      });

      const data = await res.json();
      if (data.actionExecuted) {
        setStatus("executing");
        setAiResponse(`Exécution de l'outil : ${data.tool}...`);
        setTimeout(() => {
          setStatus("success");
          setAiResponse(data.reply || "Action exécutée avec succès.");
        }, 1200);
      } else {
        setStatus("success");
        setAiResponse(data.reply || "J'ai bien analysé votre demande.");
      }
    } catch {
      setStatus("idle");
      setAiResponse("Impossible de joindre le moteur J.A.R.V.I.S.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[14vh] px-4 bg-black/70 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: -16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: -16, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 420 }}
            className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-[var(--border-1)] bg-[var(--bg-1)] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_40px_rgba(14,165,233,0.12)] backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Mode bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-0)] bg-[var(--bg-2)]/60 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)]">
                  <Command className="w-3 h-3" />
                </div>
                <span className="font-semibold text-[var(--text-1)] tracking-wide font-display">
                  Odyssey Command Center
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode(mode === "search" ? "ai" : "search")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    mode === "ai"
                      ? "bg-[var(--primary)] text-black font-bold shadow-sm"
                      : "bg-[var(--bg-3)] text-[var(--text-2)] hover:text-[var(--text-0)]"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Mode IA</span>
                  <kbd className="text-[10px] opacity-70 ml-0.5">Tab</kbd>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-[var(--bg-3)] text-[var(--text-3)] hover:text-[var(--text-0)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Input form */}
            <div className="relative flex items-center px-5 py-4 border-b border-[var(--border-0)] bg-[var(--bg-0)]/80">
              {mode === "ai" ? (
                <Brain className="w-5 h-5 text-[var(--secondary)] shrink-0 animate-pulse" />
              ) : (
                <Search className="w-5 h-5 text-[var(--primary)] shrink-0" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  mode === "ai"
                    ? "Demandez à J.A.R.V.I.S. (ex: simuler un départ au Portugal avec 4000€/m)..."
                    : "Rechercher une destination, un visa, un simulateur ou une action..."
                }
                className="w-full bg-transparent text-[var(--text-0)] placeholder:text-[var(--text-3)] px-3 text-base outline-none font-medium"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 text-[var(--text-3)] hover:text-[var(--text-0)] text-xs rounded-md"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* AI Response Display */}
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-[var(--bg-2)]/80 border-b border-[var(--border-0)] text-sm text-[var(--text-1)] flex items-start gap-3"
              >
                {status === "thinking" || status === "executing" ? (
                  <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin shrink-0 mt-0.5" />
                ) : status === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <WifiOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 leading-relaxed">{aiResponse}</div>
              </motion.div>
            )}

            {/* Results list */}
            <div
              ref={resultsContainerRef}
              className="max-h-[380px] overflow-y-auto p-2 space-y-1 custom-scroll"
            >
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-[var(--text-3)] space-y-2">
                  <p className="text-sm">Aucun résultat trouvé pour « {query} »</p>
                  <p className="text-xs text-[var(--text-3)]">
                    Appuyez sur <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-3)]">Tab</kbd> pour demander à
                    l&apos;IA
                  </p>
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      data-command-item
                      onClick={() => executeItem(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--text-0)]"
                          : "hover:bg-[var(--bg-2)] text-[var(--text-2)] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-colors ${
                            isSelected
                              ? "bg-[var(--primary)] text-black font-bold shadow-md shadow-[var(--primary)]/20"
                              : "bg-[var(--bg-2)] text-[var(--text-1)] border border-[var(--border-0)]"
                          }`}
                        >
                          {item.flag ? <span>{item.flag}</span> : <Icon className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[var(--text-0)] truncate flex items-center gap-2">
                            <span>{item.title}</span>
                            {item.badge && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--bg-3)] text-[var(--primary)]">
                                {item.badge}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-[var(--text-3)] truncate mt-0.5">{item.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-[11px] text-[var(--text-3)] font-mono">{item.category}</span>
                        {isSelected && <ArrowRight className="w-4 h-4 text-[var(--primary)]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border-0)] bg-[var(--bg-2)]/60 text-[11px] text-[var(--text-3)]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-3)] border border-[var(--border-0)]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-3)] border border-[var(--border-0)]">↓</kbd> Naviguer
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-3)] border border-[var(--border-0)]">↵</kbd> Ouvrir
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-3)] border border-[var(--border-0)]">Esc</kbd> Fermer
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[var(--primary)] font-semibold">
                <Zap className="w-3 h-3" />
                <span>50 Pays Indexés</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}