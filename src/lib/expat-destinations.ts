/**
 * expat-destinations.ts — Moteur du « Comparateur de Destinations » expat.
 *
 * Compare le Maroc à d'autres destinations populaires (Portugal, Dubaï, Espagne,
 * Géorgie, Thaïlande, Maurice) sur les MÊMES 7 axes que l'Indice de Sérénité, +
 * des faits clés (budget, facilité de visa, fiscalité, langue). Répond à la vraie
 * question d'arbitrage : « pourquoi le Maroc plutôt qu'ailleurs ? ».
 *
 * Inspiration architecturale (réimplémentation clean-room, aucun code tiers) :
 * le « système de variants » des dashboards de veille (un même socle décliné en
 * plusieurs surfaces) appliqué à l'expatriation — un moteur AGNOSTIQUE PAYS, prêt
 * à servir un futur hub /portugal, /dubai, etc. Le scoring réutilise le barème
 * d'audience de maroc-serenite (weightedScore) : une seule source de pondération.
 *
 * ⚠️ Scores & chiffres = ESTIMATIONS EXPERTES 2026 (ordre de grandeur, non
 * contractuel), pour orienter une décision, pas pour la trancher.
 */

import { type Audience } from "@/lib/maroc-data";
import {
  weightedScore,
  type SerenityDimension,
} from "@/lib/maroc-serenite";

export type Destination = {
  id: string;
  name: string;
  emoji: string;
  region: string;
  /** Scores 0–100 sur les 7 axes de l'Indice de Sérénité. */
  scores: Record<SerenityDimension, number>;
  facts: {
    /** Budget mensuel confortable 1 pers., loyer inclus, en € (estimation). */
    monthlyEur: number;
    /** Facilité d'installation longue durée 1–3 (3 = très simple). */
    visaEase: 1 | 2 | 3;
    /** Note fiscale courte. */
    tax: string;
    /** Langues utiles au quotidien. */
    languages: string;
    /** Décalage horaire vs Paris (heures). */
    tzOffsetVsParis: number;
  };
  /** L'argument fort. */
  highlight: string;
  /** Le point d'attention honnête. */
  watchout: string;
  /** Hub interne dédié si disponible. */
  href?: string;
};

export const DESTINATIONS: Destination[] = [
  {
    id: "maroc",
    name: "Maroc",
    emoji: "🇲🇦",
    region: "Afrique du Nord",
    scores: { securite: 80, pouvoirAchat: 76, sante: 80, climat: 86, connectivite: 80, communaute: 84, administratif: 72 },
    facts: { monthlyEur: 900, visaEase: 3, tax: "Abattement retraités, statut CFC, convention France–Maroc", languages: "Français, arabe, darija", tzOffsetVsParis: -1 },
    highlight: "3h de Paris, coût ÷2, fuseau quasi-européen, immense communauté FR/MRE.",
    watchout: "Administratif parfois lent ; pas (encore) de visa nomade officiel.",
    href: "/maroc",
  },
  {
    id: "portugal",
    name: "Portugal",
    emoji: "🇵🇹",
    region: "Europe du Sud",
    scores: { securite: 90, pouvoirAchat: 58, sante: 82, climat: 84, connectivite: 86, communaute: 82, administratif: 70 },
    facts: { monthlyEur: 1500, visaEase: 2, tax: "Régimes en révision (fin de l'ancien RNH) ; UE = libre installation", languages: "Portugais, anglais courant", tzOffsetVsParis: -1 },
    highlight: "Dans l'UE (zéro visa pour Européens), très sûr, anglais répandu.",
    watchout: "Coût en forte hausse (Lisbonne/Porto) ; avantage fiscal réduit depuis la réforme.",
  },
  {
    id: "dubai",
    name: "Dubaï (EAU)",
    emoji: "🇦🇪",
    region: "Golfe",
    scores: { securite: 88, pouvoirAchat: 48, sante: 88, climat: 60, connectivite: 92, communaute: 80, administratif: 82 },
    facts: { monthlyEur: 2800, visaEase: 2, tax: "0 % d'impôt sur le revenu des personnes ; visas longue durée (Golden Visa)", languages: "Anglais, arabe", tzOffsetVsParis: 3 },
    highlight: "0 % d'IR, infrastructures et connectivité de pointe, hub business mondial.",
    watchout: "Coût de la vie très élevé, été extrême, fuseau +3h éloigne de l'Europe.",
  },
  {
    id: "espagne",
    name: "Espagne",
    emoji: "🇪🇸",
    region: "Europe du Sud",
    scores: { securite: 86, pouvoirAchat: 56, sante: 84, climat: 82, connectivite: 84, communaute: 80, administratif: 64 },
    facts: { monthlyEur: 1600, visaEase: 2, tax: "Visa nomade + régime Beckham ; UE = libre installation", languages: "Espagnol, anglais (zones touristiques)", tzOffsetVsParis: 0 },
    highlight: "UE, même fuseau que Paris, vrai visa nomade, qualité de vie élevée.",
    watchout: "Coût supérieur au Maroc ; administration lente et paperasse réputée.",
  },
  {
    id: "georgie",
    name: "Géorgie",
    emoji: "🇬🇪",
    region: "Caucase",
    scores: { securite: 78, pouvoirAchat: 80, sante: 66, climat: 70, connectivite: 78, communaute: 64, administratif: 80 },
    facts: { monthlyEur: 850, visaEase: 3, tax: "Jusqu'à 1 an sans visa (selon nationalité) ; régime « small business » 1 %", languages: "Géorgien, russe, anglais (jeunes)", tzOffsetVsParis: 3 },
    highlight: "1 an sans visa pour beaucoup, fiscalité micro-entreprise à 1 %, coût bas.",
    watchout: "Santé en deçà des standards ouest-européens ; communauté FR plus réduite.",
  },
  {
    id: "thailande",
    name: "Thaïlande",
    emoji: "🇹🇭",
    region: "Asie du Sud-Est",
    scores: { securite: 74, pouvoirAchat: 78, sante: 80, climat: 72, connectivite: 80, communaute: 76, administratif: 62 },
    facts: { monthlyEur: 1100, visaEase: 2, tax: "Visas longue durée (LTR, Elite) ; fiscalité sur revenus rapatriés", languages: "Thaï, anglais (zones expat)", tzOffsetVsParis: 6 },
    highlight: "Coût bas, cliniques privées excellentes, écosystème nomade mûr.",
    watchout: "Fuseau +6h très éloigné de l'Europe ; visas à renouveler avec rigueur.",
  },
];

export type DestinationResult = Destination & {
  /** Score global pondéré par le profil. */
  score: number;
};

/** Classe les destinations par score pour un profil donné. */
export function rankDestinations(audience: Audience): DestinationResult[] {
  return DESTINATIONS.map((d) => ({ ...d, score: weightedScore(d.scores, audience) })).sort(
    (a, b) => b.score - a.score,
  );
}

export function getDestination(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id);
}

/** Position du Maroc dans le classement, pour un message d'accroche honnête. */
export function marocRank(audience: Audience): { rank: number; total: number; score: number } {
  const ranked = rankDestinations(audience);
  const idx = ranked.findIndex((d) => d.id === "maroc");
  return { rank: idx + 1, total: ranked.length, score: ranked[idx]?.score ?? 0 };
}

/** Bloc de connaissances injecté dans J.A.R.V.I.S. */
export function getDestinationsKnowledge(): string {
  const lines = rankDestinations("etranger")
    .map((d, i) => `${i + 1}. ${d.name}: ${d.score}/100, ~${d.facts.monthlyEur}€/mois. ${d.highlight}`)
    .join("\n");
  return [
    "## COMPARATEUR DE DESTINATIONS (estimations 2026, /maroc/comparateur)",
    "Compare le Maroc à Portugal, Dubaï, Espagne, Géorgie, Thaïlande sur 7 axes + budget. Classement profil « étranger » :",
    lines,
    "Reste objectif : le Maroc n'est pas toujours 1er (le Portugal/Espagne gagnent sur sécurité, Dubaï sur fiscalité). Mets en avant le bon arbitrage selon la priorité de la personne, puis renvoie vers /maroc/comparateur.",
  ].join("\n");
}
