/**
 * maroc-serenite.ts — Moteur de l'« Indice de Sérénité » par ville.
 *
 * Donne, pour chaque ville et chaque profil, un score 0–100 de qualité de vie
 * ressentie pour un expat / MRE, décomposé en 7 dimensions. Aide à répondre à
 * la vraie question d'avant-départ : « où vais-je être le plus serein ? ».
 *
 * Inspiration architecturale (réimplémentation clean-room, aucun code tiers) :
 * le « Country Instability Index » de projets de veille géopolitique repose sur
 *   score = risque_de_base (statique) × multiplicateur d'événements (live).
 * On garde ce principe — un socle stable modulé par des signaux temps réel — mais
 * on l'INVERSE en indice POSITIF de sérénité, multi-dimensionnel, pondéré par le
 * profil. Le « multiplicateur d'événements » devient ici l'entrée optionnelle
 * `signals[]` : aujourd'hui vide (socle seul), demain alimentée par la Veille
 * (cf. maroc-veille.ts) ou un flux d'actu local.
 *
 * ⚠️ Scores = ESTIMATIONS EXPERTES 2026 (ordre de grandeur, non contractuel),
 * calibrées à dire d'expert, pas issues d'une mesure officielle.
 */

import { CITIES, type Audience } from "@/lib/maroc-data";

/** Les 7 axes du bien-être expat. */
export type SerenityDimension =
  | "securite"
  | "pouvoirAchat"
  | "sante"
  | "climat"
  | "connectivite"
  | "communaute"
  | "administratif";

export const DIMENSIONS: {
  id: SerenityDimension;
  label: string;
  emoji: string;
  /** Ce que la dimension mesure, affiché en aide. */
  hint: string;
}[] = [
  { id: "securite", label: "Sécurité & stabilité", emoji: "🛡️", hint: "Sentiment de sécurité au quotidien et stabilité de la ville." },
  { id: "pouvoirAchat", label: "Pouvoir d'achat", emoji: "💶", hint: "Ce que vaut ton argent ici vs une grande ville européenne." },
  { id: "sante", label: "Santé & soins", emoji: "🏥", hint: "Qualité et accès aux cliniques et spécialistes." },
  { id: "climat", label: "Climat & cadre de vie", emoji: "☀️", hint: "Météo, air, mer, espaces — l'agrément de vivre là." },
  { id: "connectivite", label: "Connectivité", emoji: "📶", hint: "Fibre, 4G/5G, fiabilité pour le télétravail." },
  { id: "communaute", label: "Communauté & intégration", emoji: "🤝", hint: "Densité de la communauté expat / MRE, facilité à se faire un réseau." },
  { id: "administratif", label: "Fluidité administrative", emoji: "🗂️", hint: "Facilité des démarches : séjour, banque, services publics." },
];

/**
 * Pondération des dimensions selon le profil. Un retraité étranger ne valorise
 * pas les mêmes axes qu'un MRE qui rentre gérer des démarches, ou qu'un local
 * qui veut maximiser son pouvoir d'achat. Valeurs relatives (normalisées au calcul).
 */
export const AUDIENCE_WEIGHTS: Record<Audience, Record<SerenityDimension, number>> = {
  etranger: { securite: 1.2, pouvoirAchat: 1.2, sante: 1.0, climat: 1.4, connectivite: 1.3, communaute: 1.3, administratif: 0.9 },
  mre: { securite: 1.1, pouvoirAchat: 1.2, sante: 1.2, climat: 1.0, connectivite: 0.9, communaute: 1.2, administratif: 1.4 },
  local: { securite: 1.0, pouvoirAchat: 1.4, sante: 1.0, climat: 0.9, connectivite: 1.3, communaute: 0.9, administratif: 1.2 },
};

/**
 * Moyenne pondérée par profil d'un jeu de scores 7-axes. Réutilisable pour une
 * ville (maroc-serenite) comme pour un pays (expat-destinations) : un seul barème
 * d'audience pour toute l'app.
 */
export function weightedScore(
  scores: Record<SerenityDimension, number>,
  audience: Audience,
): number {
  const w = AUDIENCE_WEIGHTS[audience];
  const weightSum = DIMENSIONS.reduce((s, d) => s + w[d.id], 0);
  const weighted = DIMENSIONS.reduce((s, d) => s + scores[d.id] * w[d.id], 0);
  return Math.max(0, Math.min(100, Math.round(weighted / weightSum)));
}

/**
 * Scores de SOCLE par ville (0–100), à dire d'expert. Les deux axes dérivables
 * de la donnée existante (pouvoirAchat ← coût de vie, connectivite ← débit) sont
 * calculés depuis maroc-data plus bas et N'APPARAISSENT PAS ici : source unique.
 */
type QualitativeScores = Pick<
  Record<SerenityDimension, number>,
  "securite" | "sante" | "climat" | "communaute" | "administratif"
>;

const CITY_BASE: Record<string, QualitativeScores> = {
  marrakech: { securite: 78, sante: 82, climat: 80, communaute: 92, administratif: 70 },
  tanger: { securite: 74, sante: 80, climat: 78, communaute: 80, administratif: 72 },
  casablanca: { securite: 70, sante: 90, climat: 70, communaute: 78, administratif: 76 },
  rabat: { securite: 88, sante: 88, climat: 82, communaute: 74, administratif: 78 },
  agadir: { securite: 86, sante: 76, climat: 92, communaute: 82, administratif: 68 },
  essaouira: { securite: 85, sante: 64, climat: 90, communaute: 76, administratif: 60 },
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Pouvoir d'achat dérivé du coût de vie (Paris=100, plus bas = mieux). */
function purchasingPowerScore(costIndexVsParis: number): number {
  return clamp(118 - costIndexVsParis);
}

/** Connectivité dérivée du débit fibre typique. */
function connectivityScore(internetMbps: number): number {
  return clamp(40 + internetMbps * 0.18);
}

/**
 * Signal temps réel optionnel qui module une dimension d'une ville.
 * C'est l'équivalent positif/négatif du « multiplicateur d'événements ».
 * `delta` en points (ex: -8 après une actu sécurité, +5 après une réforme admin).
 * Alimenté plus tard par maroc-veille.ts ou un flux d'actu — vide par défaut.
 */
export type SerenitySignal = {
  citySlug?: string; // absent = s'applique à toutes les villes (signal national)
  dimension: SerenityDimension;
  delta: number;
  reason: string;
  /** Date ISO du signal, pour pondérer / afficher la fraîcheur. */
  dateIso: string;
};

export type DimensionScore = {
  id: SerenityDimension;
  label: string;
  emoji: string;
  hint: string;
  base: number;
  /** Score après application des signaux temps réel. */
  value: number;
  /** Somme des deltas appliqués (0 si aucun signal). */
  signalDelta: number;
};

export type SerenityResult = {
  citySlug: string;
  cityName: string;
  cityEmoji: string;
  audience: Audience;
  /** Score global 0–100, pondéré par le profil. */
  score: number;
  band: { label: string; tone: "max" | "high" | "good" | "ok" | "watch"; color: string };
  dimensions: DimensionScore[];
  /** 2 meilleurs axes (forces). */
  strengths: DimensionScore[];
  /** 2 axes les plus faibles (points de vigilance). */
  watchouts: DimensionScore[];
  /** Signaux temps réel pris en compte (pour transparence). */
  appliedSignals: SerenitySignal[];
};

function band(score: number): SerenityResult["band"] {
  if (score >= 85) return { label: "Sérénité maximale", tone: "max", color: "#00875a" };
  if (score >= 75) return { label: "Très serein", tone: "high", color: "#16a34a" };
  if (score >= 65) return { label: "Serein", tone: "good", color: "#65a30d" };
  if (score >= 55) return { label: "Correct", tone: "ok", color: "#d97706" };
  return { label: "Vigilance", tone: "watch", color: "#dc2626" };
}

/** Scores de socle complets d'une ville (qualitatifs + dérivés de la data). */
function baseScores(citySlug: string): Record<SerenityDimension, number> {
  const city = CITIES.find((c) => c.slug === citySlug) ?? CITIES[0];
  const q = CITY_BASE[city.slug] ?? CITY_BASE.marrakech;
  return {
    ...q,
    pouvoirAchat: purchasingPowerScore(city.costIndexVsParis),
    connectivite: connectivityScore(city.internetMbps),
  };
}

/**
 * Calcule l'Indice de Sérénité d'une ville pour un profil donné, en appliquant
 * d'éventuels signaux temps réel.
 */
export function computeSerenity(
  citySlug: string,
  audience: Audience,
  signals: SerenitySignal[] = [],
): SerenityResult {
  const city = CITIES.find((c) => c.slug === citySlug) ?? CITIES[0];
  const base = baseScores(city.slug);
  const applicable = signals.filter((s) => !s.citySlug || s.citySlug === city.slug);

  const dimensions: DimensionScore[] = DIMENSIONS.map((d) => {
    const signalDelta = applicable
      .filter((s) => s.dimension === d.id)
      .reduce((sum, s) => sum + s.delta, 0);
    const baseVal = base[d.id];
    return {
      id: d.id,
      label: d.label,
      emoji: d.emoji,
      hint: d.hint,
      base: baseVal,
      value: clamp(baseVal + signalDelta),
      signalDelta,
    };
  });

  const valueByDim = Object.fromEntries(dimensions.map((d) => [d.id, d.value])) as Record<
    SerenityDimension,
    number
  >;
  const score = weightedScore(valueByDim, audience);

  const ranked = [...dimensions].sort((a, b) => b.value - a.value);

  return {
    citySlug: city.slug,
    cityName: city.name,
    cityEmoji: city.emoji,
    audience,
    score,
    band: band(score),
    dimensions,
    strengths: ranked.slice(0, 2),
    watchouts: ranked.slice(-2).reverse(),
    appliedSignals: applicable,
  };
}

/** Classe toutes les villes par sérénité pour un profil (pour le comparateur). */
export function rankCities(audience: Audience, signals: SerenitySignal[] = []): SerenityResult[] {
  return CITIES.map((c) => computeSerenity(c.slug, audience, signals)).sort(
    (a, b) => b.score - a.score,
  );
}

/**
 * Bloc de connaissances compact injecté dans le system prompt de J.A.R.V.I.S.
 * pour qu'il raisonne sur des scores réels et oriente vers le bon module.
 */
export function getSereniteKnowledge(): string {
  const lines = rankCities("etranger")
    .map(
      (r, i) =>
        `${i + 1}. ${r.cityName}: ${r.score}/100 (${r.band.label}) — forces: ${r.strengths
          .map((s) => s.label)
          .join(", ")} ; vigilance: ${r.watchouts.map((w) => w.label).join(", ")}.`,
    )
    .join("\n");
  return [
    "## INDICE DE SÉRÉNITÉ Maroc (estimations expertes 2026, /maroc/serenite)",
    "Score 0–100 du bien-être expat par ville, sur 7 axes (sécurité, pouvoir d'achat, santé, climat, connectivité, communauté, administratif), pondéré par le profil (étranger/MRE/local).",
    "Classement profil « étranger qui s'installe » :",
    lines,
    "Quand on te demande « quelle ville pour moi ? » ou une comparaison, raisonne avec ces scores, adapte selon le profil, et renvoie vers /maroc/serenite.",
  ].join("\n");
}
