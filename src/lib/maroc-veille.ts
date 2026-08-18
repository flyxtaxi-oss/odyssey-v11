/**
 * maroc-veille.ts — Moteur du « Radar de Veille » réglementaire.
 *
 * Suit ce qui CHANGE (ou va changer) et impacte les expats / MRE : séjour, visa,
 * fiscalité, devises, immobilier, famille/succession, douane. Chaque entrée porte
 * un STATUT honnête (en vigueur / proposé / à venir / rumeur) et une phrase
 * « pourquoi ça te concerne » qui traduit l'enjeu en action.
 *
 * Inspiration architecturale (réimplémentation clean-room, aucun code tiers) :
 * les dashboards de veille géopolitique enrichissent chaque actu d'UNE phrase
 * d'enjeu via LLM, avec deux garde-fous repris ici :
 *   1. ANCRAGE DE DATE dans le prompt système — sans « date du jour » explicite,
 *      un LLM comble les trous d'année avec ses a priori d'entraînement et invente
 *      des dates. cf. buildVeilleBriefPrompt().
 *   2. STATUT EXPLICITE — une réforme proposée n'est JAMAIS présentée comme un
 *      droit en vigueur (aligné sur l'avertissement de maroc-succession.ts).
 *
 * Aujourd'hui : données de SOCLE éditoriales (estimations juin 2026). Demain :
 * un cron (n8n / route edge) ingère 3–5 flux Maroc/MRE, déduplique, et appelle
 * buildVeilleBriefPrompt() pour générer le champ `whyItMatters` — sans toucher au
 * reste du moteur.
 *
 * ⚠️ INFORMATION ÉDUCATIVE, PAS UN CONSEIL JURIDIQUE OU FISCAL. Vérifie toujours
 * auprès de la source officielle / d'un professionnel avant d'agir.
 */

import type { Audience } from "@/lib/maroc-data";

export type VeilleCategory =
  | "sejour"
  | "fiscalite"
  | "devises"
  | "immobilier"
  | "famille"
  | "douane";

export const CATEGORIES: { id: VeilleCategory; label: string; emoji: string }[] = [
  { id: "sejour", label: "Séjour & visa", emoji: "🛂" },
  { id: "fiscalite", label: "Fiscalité", emoji: "🏛️" },
  { id: "devises", label: "Devises & transfert", emoji: "💱" },
  { id: "immobilier", label: "Immobilier", emoji: "🏠" },
  { id: "famille", label: "Famille & succession", emoji: "⚖️" },
  { id: "douane", label: "Douane & import", emoji: "📦" },
];

/**
 * Statut de l'information. L'ordre encode la « force » juridique décroissante de
 * certitude, utilisé pour le tri et le code couleur.
 */
export type VeilleStatus = "en_vigueur" | "propose" | "a_venir" | "rumeur";

export const STATUS_META: Record<
  VeilleStatus,
  { label: string; color: string; weight: number }
> = {
  en_vigueur: { label: "En vigueur", color: "#16a34a", weight: 0 },
  propose: { label: "Proposé", color: "#d97706", weight: 1 },
  a_venir: { label: "À venir", color: "#2563eb", weight: 2 },
  rumeur: { label: "Rumeur / non confirmé", color: "#6b7280", weight: 3 },
};

export type VeilleItem = {
  id: string;
  category: VeilleCategory;
  status: VeilleStatus;
  title: string;
  /** Résumé factuel et sobre de ce qui change. */
  summary: string;
  /** UNE phrase d'enjeu : « pourquoi ça te concerne ». Patron brief réutilisé. */
  whyItMatters: string;
  audience: Audience[];
  /** Date ISO de l'info (publication / dernière MAJ connue). */
  dateIso: string;
  /** Source citée (officielle de préférence). */
  source: string;
  /** Confiance éditoriale 1–3 (3 = source officielle confirmée). */
  confidence: 1 | 2 | 3;
  /** Action interne suggérée. */
  action?: { label: string; href: string };
};

/**
 * SOCLE éditorial — état au 28 juin 2026. Estimations / lectures expertes,
 * à mettre à jour. Toute réforme non votée porte le statut `propose`/`a_venir`.
 */
export const VEILLE_ITEMS: VeilleItem[] = [
  {
    id: "moudawana-2026",
    category: "famille",
    status: "propose",
    title: "Réforme du Code de la famille (Moudawana)",
    summary:
      "Le chantier de réforme (≈139 amendements : tutelle, héritage, mariage, garde) reste en débat. Au 28 juin 2026, il N'est PAS encore voté ni promulgué.",
    whyItMatters:
      "Tant que le texte n'est pas publié au Bulletin officiel, le droit applicable à ta succession reste la Moudawana de 2004 — ne planifie rien sur la base des annonces.",
    audience: ["mre", "etranger", "local"],
    dateIso: "2026-06-15",
    source: "Débat parlementaire / presse nationale (suivi Odyssey)",
    confidence: 2,
    action: { label: "Calculateur de succession", href: "/maroc/succession" },
  },
  {
    id: "retraite-abattement",
    category: "fiscalite",
    status: "en_vigueur",
    title: "Abattement fiscal sur les pensions étrangères",
    summary:
      "Pour un résident fiscal, les pensions de source étrangère bénéficient d'un abattement marqué (de l'ordre de 80 % puis 70 %) sur l'IR, sous conditions de transfert.",
    whyItMatters:
      "Si tu es retraité, devenir résident fiscal marocain peut réduire fortement l'impôt sur ta pension — mais l'avantage dépend du transfert effectif des fonds, à valider en amont.",
    audience: ["etranger", "mre"],
    dateIso: "2026-01-01",
    source: "Code général des impôts (régime des pensions, résidents)",
    confidence: 3,
    action: { label: "En parler à J.A.R.V.I.S.", href: "/jarvis" },
  },
  {
    id: "dirham-convertible",
    category: "devises",
    status: "en_vigueur",
    title: "Compte en dirhams convertibles pour MRE",
    summary:
      "Le compte en dirhams convertibles permet de rapatrier des devises ET de les ressortir librement. À ouvrir idéalement depuis l'étranger.",
    whyItMatters:
      "Sans ce compte, des fonds basculés en dirham non-convertible voient leur sortie restreinte — un piège classique au moment de repartir ou réinvestir ailleurs.",
    audience: ["mre"],
    dateIso: "2026-01-01",
    source: "Réglementation de change (Office des Changes)",
    confidence: 3,
    action: { label: "Radar Transfert", href: "/maroc/transfert" },
  },
  {
    id: "visa-nomade",
    category: "sejour",
    status: "rumeur",
    title: "Visa « digital nomad » dédié",
    summary:
      "Aucun visa nomade officiel à ce jour. La plupart des télétravailleurs restent sur le séjour 90 jours renouvelé / la carte d'immatriculation.",
    whyItMatters:
      "Ne base pas ton installation sur un statut nomade qui n'existe pas encore : prévois la voie carte de séjour, seule option durable et légale aujourd'hui.",
    audience: ["etranger"],
    dateIso: "2026-05-20",
    source: "Veille Odyssey (aucune source officielle confirmée)",
    confidence: 1,
    action: { label: "Parcours d'installation", href: "/maroc/parcours" },
  },
  {
    id: "cfc-statut",
    category: "fiscalite",
    status: "en_vigueur",
    title: "Statut Casablanca Finance City (CFC)",
    summary:
      "Le statut CFC offre un régime fiscal allégé (IS réduit) pour les sociétés éligibles à vocation régionale/internationale.",
    whyItMatters:
      "Si tu montes une activité tournée vers l'export ou l'Afrique, le statut CFC peut changer ton équation fiscale — à arbitrer dès la création de la structure.",
    audience: ["etranger", "mre", "local"],
    dateIso: "2026-01-01",
    source: "Casablanca Finance City Authority",
    confidence: 3,
  },
  {
    id: "carte-sejour-digitalisation",
    category: "sejour",
    status: "a_venir",
    title: "Digitalisation des démarches de séjour",
    summary:
      "Montée en charge progressive des télé-services (prise de rendez-vous, suivi de dossier) pour les titres de séjour et actes consulaires.",
    whyItMatters:
      "À surveiller : une partie des démarches qui imposaient un déplacement pourrait passer en ligne, réduisant les délais — vérifie le canal officiel avant de te déplacer.",
    audience: ["etranger", "mre"],
    dateIso: "2026-04-10",
    source: "Portails publics (déploiement en cours)",
    confidence: 2,
    action: { label: "Parcours d'installation", href: "/maroc/parcours" },
  },
  {
    id: "immobilier-etrangers",
    category: "immobilier",
    status: "en_vigueur",
    title: "Achat immobilier ouvert aux étrangers et MRE",
    summary:
      "Étrangers et MRE peuvent acheter librement, sauf les terrains agricoles. Frais d'acquisition ≈ 6–8 % (notaire, enregistrement, conservation foncière).",
    whyItMatters:
      "Le vrai risque n'est pas la nationalité mais le titre : un bien non « titré » (melkia) peut bloquer la revente — passe systématiquement par un notaire.",
    audience: ["etranger", "mre"],
    dateIso: "2026-01-01",
    source: "Droit foncier marocain (pratique notariale)",
    confidence: 3,
  },
  {
    id: "franchise-douane-retour",
    category: "douane",
    status: "en_vigueur",
    title: "Franchise douanière au retour définitif (MRE)",
    summary:
      "Le statut « retour définitif » ouvre une franchise des droits sur les effets personnels usagés, sous conditions (résidence > 1 an à l'étranger, inventaire, délais).",
    whyItMatters:
      "La franchise se prépare AVANT le départ via le consulat : t'y prendre une fois arrivé, c'est risquer de payer les droits sur tout ton déménagement.",
    audience: ["mre"],
    dateIso: "2026-01-01",
    source: "Administration des Douanes (ADII)",
    confidence: 3,
    action: { label: "Parcours d'installation", href: "/maroc/parcours" },
  },
];

/** Tri par défaut : certitude (statut) puis fraîcheur (date décroissante). */
export function sortedItems(items: VeilleItem[] = VEILLE_ITEMS): VeilleItem[] {
  return [...items].sort((a, b) => {
    const w = STATUS_META[a.status].weight - STATUS_META[b.status].weight;
    if (w !== 0) return w;
    return b.dateIso.localeCompare(a.dateIso);
  });
}

/** Filtre par audience et/ou catégorie. */
export function filterItems(opts: {
  audience?: Audience;
  category?: VeilleCategory | "all";
}): VeilleItem[] {
  return sortedItems().filter((it) => {
    const okAud = !opts.audience || it.audience.includes(opts.audience);
    const okCat = !opts.category || opts.category === "all" || it.category === opts.category;
    return okAud && okCat;
  });
}

/**
 * Construit le prompt système d'enrichissement « pourquoi ça te concerne » avec
 * ANCRAGE DE DATE — garde-fou anti-hallucination clé : sans cette ligne, le LLM
 * comble les dates manquantes par ses a priori d'entraînement et peut affirmer
 * qu'une réforme est « entrée en vigueur en 2024 » alors qu'elle est en débat.
 *
 * `todayIso` est injectable pour des tests déterministes ; en production, ne rien
 * passer → date du jour (UTC). Un override malformé retombe sur aujourd'hui.
 */
export function buildVeilleBriefPrompt(todayIso?: string): string {
  const today =
    todayIso && /^\d{4}-\d{2}-\d{2}$/.test(todayIso)
      ? todayIso
      : new Date().toISOString().slice(0, 10);
  return [
    "Tu es l'éditeur du Radar de Veille Maroc d'Odyssey, pour expats et MRE.",
    "Pour chaque info ci-dessous, écris UNE seule phrase (18–30 mots) expliquant",
    "l'enjeu concret pour la personne : ce qu'elle doit faire ou éviter.",
    "Style : direct, utile, impersonnel. Pas de préambule (« Cela compte car… »),",
    "pas de question, pas d'appel à l'action marketing, pas de markdown, pas de guillemets.",
    `Date du jour : ${today}. N'affirme JAMAIS une année ou une entrée en vigueur`,
    "qui contredise le statut fourni (proposé ≠ en vigueur). En cas de doute sur une",
    "date, reste prudent et ne l'invente pas.",
  ].join(" ");
}

/**
 * Bloc de connaissances compact injecté dans le system prompt de J.A.R.V.I.S.
 */
export function getVeilleKnowledge(): string {
  const lines = sortedItems()
    .map(
      (it) =>
        `- [${STATUS_META[it.status].label}] ${it.title} (${it.category}, ${it.dateIso}) : ${it.summary}`,
    )
    .join("\n");
  return [
    "## RADAR DE VEILLE Maroc (socle éditorial, 28 juin 2026, /maroc/veille)",
    "Ce qui change/va changer pour expats & MRE. RESPECTE le statut : une réforme « proposée » n'est PAS en vigueur — ne la présente jamais comme un droit applicable.",
    lines,
    "Quand on te pose une question sur une règle, une réforme ou « est-ce que c'est encore d'actualité », appuie-toi sur ces statuts, précise la date, et renvoie vers /maroc/veille.",
  ].join("\n");
}
