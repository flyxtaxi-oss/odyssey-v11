/**
 * maroc-data.ts — Couche de données experte pour le hub "Vivre au Maroc".
 *
 * Sert 3 audiences :
 *   1. Étrangers (digital nomads, retraités, investisseurs) qui veulent s'installer
 *   2. MRE — Marocains Résidents à l'Étranger qui veulent rentrer / investir
 *   3. Marocains locaux qui cherchent opportunités / mobilité
 *
 * ⚠️ Les montants sont des ESTIMATIONS 2026 (ordre de grandeur réaliste, non contractuel).
 * Taux de référence utilisé : 1 € ≈ 10,8 MAD.
 */

export const EUR_TO_MAD = 10.8;

export type Audience = "etranger" | "mre" | "local";

export const AUDIENCES: {
  id: Audience;
  label: string;
  emoji: string;
  tagline: string;
  description: string;
}[] = [
  {
    id: "etranger",
    label: "Je viens vivre au Maroc",
    emoji: "🌍",
    tagline: "Étrangers · Nomades · Retraités",
    description:
      "Coût de la vie 2× moins cher qu'en Europe, 3h de Paris, fuseau quasi-européen, et un climat qui change la vie. Voici comment t'installer proprement.",
  },
  {
    id: "mre",
    label: "Je suis MRE, je rentre / j'investis",
    emoji: "🇲🇦",
    tagline: "Marocains Résidents à l'Étranger",
    description:
      "Retour définitif, transfert de devises, franchise douanière, immobilier, retraite, CNIE. Tes droits et les démarches, sans te faire avoir.",
  },
  {
    id: "local",
    label: "Je suis au Maroc, je veux évoluer",
    emoji: "🚀",
    tagline: "Talents & entrepreneurs locaux",
    description:
      "Travailler en remote pour l'étranger, lancer ton activité, ou préparer une mobilité. Maximise ton pouvoir d'achat depuis le Maroc.",
  },
];

export type City = {
  slug: string;
  name: string;
  emoji: string;
  /** Coût de vie mensuel confortable, 1 personne, hors loyer exceptionnel — en MAD */
  monthlyMad: number;
  /** Loyer médian appart 1 chambre, quartier correct, en MAD */
  rent1brMad: number;
  /** Indice coût de la vie, base Paris = 100 */
  costIndexVsParis: number;
  /** Débit internet typique fibre, Mbps */
  internetMbps: number;
  vibe: string;
  bestFor: string[];
  why: string;
};

export const CITIES: City[] = [
  {
    slug: "marrakech",
    name: "Marrakech",
    emoji: "🌴",
    monthlyMad: 9500,
    rent1brMad: 4800,
    costIndexVsParis: 43,
    internetMbps: 200,
    vibe: "Capitale des nomades digitaux",
    bestFor: ["Nomades", "Créatifs", "Soleil 300j/an"],
    why: "L'écosystème expat le plus dense du pays : coworkings, communauté internationale, riads, vols directs partout en Europe.",
  },
  {
    slug: "tanger",
    name: "Tanger",
    emoji: "⛴️",
    monthlyMad: 8500,
    rent1brMad: 4200,
    costIndexVsParis: 40,
    internetMbps: 200,
    vibe: "La porte de l'Europe",
    bestFor: ["Business", "Zone franche", "1h de l'Espagne"],
    why: "Tanger Med + zones franches (statut fiscal avantageux), ferry vers Tarifa en 1h, ville en plein boom économique.",
  },
  {
    slug: "casablanca",
    name: "Casablanca",
    emoji: "🏙️",
    monthlyMad: 11500,
    rent1brMad: 5800,
    costIndexVsParis: 50,
    internetMbps: 300,
    vibe: "Le moteur économique",
    bestFor: ["Carrière", "Casablanca Finance City", "Networking"],
    why: "Le hub business du continent. Statut CFC pour entreprises/talents (fiscalité réduite), sièges sociaux, aéroport international.",
  },
  {
    slug: "rabat",
    name: "Rabat",
    emoji: "🏛️",
    monthlyMad: 10000,
    rent1brMad: 5200,
    costIndexVsParis: 46,
    internetMbps: 250,
    vibe: "Capitale calme & verte",
    bestFor: ["Familles", "Admin", "Qualité de vie"],
    why: "Propre, sûre, bord de mer, ambassades et administrations. Idéale pour familles et profils qui veulent la tranquillité.",
  },
  {
    slug: "agadir",
    name: "Agadir",
    emoji: "🏖️",
    monthlyMad: 8000,
    rent1brMad: 3800,
    costIndexVsParis: 38,
    internetMbps: 200,
    vibe: "Soleil & retraite douce",
    bestFor: ["Retraités", "Surf", "Climat doux"],
    why: "Le climat le plus stable du pays, plages immenses, coût de vie bas. Destination n°1 des retraités européens.",
  },
  {
    slug: "essaouira",
    name: "Essaouira",
    emoji: "🪁",
    monthlyMad: 7500,
    rent1brMad: 3500,
    costIndexVsParis: 36,
    internetMbps: 150,
    vibe: "Bohème & océan",
    bestFor: ["Nomades", "Artistes", "Slow life"],
    why: "Petite, ventée, authentique. La favorite des nomades qui fuient l'agitation, à 2h de Marrakech.",
  },
];

export type InfoCard = {
  audience: Audience[];
  icon: string; // lucide icon name
  title: string;
  summary: string;
  points: string[];
  /** Niveau de difficulté administrative 1-3 */
  difficulty: 1 | 2 | 3;
};

export const INFO_CARDS: InfoCard[] = [
  {
    audience: ["etranger"],
    icon: "Plane",
    title: "Entrer & rester légalement",
    summary: "90 jours sans visa pour la plupart des nationalités, puis carte de séjour.",
    points: [
      "France, UE, USA, Canada : 90 jours sans visa à l'entrée.",
      "Au-delà : demande de carte d'immatriculation (séjour) à la préfecture de police.",
      "Justificatifs : passeport, justificatif de domicile, ressources, contrat ou attestation.",
      "Renouvellement possible ; après 4 ans, carte de 10 ans envisageable.",
    ],
    difficulty: 2,
  },
  {
    audience: ["etranger", "local"],
    icon: "Laptop",
    title: "Digital nomad & remote",
    summary: "Travailler en ligne depuis le Maroc : setup, coworkings, connexion.",
    points: [
      "Fibre fiable dans les grandes villes (100–300 Mbps), 4G/5G excellente.",
      "Coworkings établis : Marrakech, Casablanca, Tanger, Rabat.",
      "Pas de « visa nomade » officiel encore — la plupart restent sur le séjour 90j renouvelé.",
      "eSIM locale (Maroc Telecom, Orange, inwi) en 10 min.",
    ],
    difficulty: 1,
  },
  {
    audience: ["etranger", "mre"],
    icon: "Landmark",
    title: "Fiscalité & impôts",
    summary: "IR progressif, abattement retraités, convention anti-double imposition.",
    points: [
      "Résident fiscal = 183+ jours/an au Maroc. IR progressif jusqu'à 38 %.",
      "Pensions étrangères : abattement de 80 % puis 70 % sur l'IR pour retraités résidents.",
      "Convention fiscale France–Maroc : pas de double imposition.",
      "Statut CFC (Casablanca Finance City) : IS réduit pour sociétés éligibles.",
    ],
    difficulty: 3,
  },
  {
    audience: ["etranger", "mre"],
    icon: "HeartPulse",
    title: "Santé & assurance",
    summary: "Cliniques privées de qualité, AMO, coûts très bas vs Europe.",
    points: [
      "Cliniques privées modernes à Casa, Rabat, Marrakech, Tanger.",
      "Consultation généraliste ≈ 300–400 MAD (28–37 €).",
      "AMO (assurance maladie) accessible aux résidents cotisants / CNSS.",
      "Assurance santé internationale recommandée la 1re année.",
    ],
    difficulty: 1,
  },
  {
    audience: ["mre"],
    icon: "Truck",
    title: "Retour définitif & douane",
    summary: "Franchise douanière sur ton déménagement et conditions véhicule.",
    points: [
      "Statut « retour définitif » : franchise des droits sur les effets personnels usagés.",
      "Inventaire détaillé + justificatif de résidence à l'étranger > 1 an exigés.",
      "Véhicule : conditions spécifiques d'importation en franchise (selon ancienneté/résidence).",
      "À préparer AVANT le départ avec le consulat — délais à anticiper.",
    ],
    difficulty: 3,
  },
  {
    audience: ["mre"],
    icon: "Banknote",
    title: "Devises & transfert d'argent",
    summary: "Compte en dirhams convertibles : garde la main sur tes devises.",
    points: [
      "Ouvre un compte en dirhams convertibles dès l'étranger.",
      "Permet de rapatrier des devises ET de les ressortir librement plus tard.",
      "Avantages de change et produits d'épargne dédiés MRE.",
      "Évite de tout convertir en dirham non-convertible (sortie restreinte).",
    ],
    difficulty: 2,
  },
  {
    audience: ["mre", "etranger"],
    icon: "Home",
    title: "Immobilier & investissement",
    summary: "Acheter au Maroc : peu de restrictions, sauf terres agricoles.",
    points: [
      "Étrangers et MRE peuvent acheter (hors terrains agricoles).",
      "Frais d'acquisition ≈ 6–8 % (notaire, enregistrement, conservation foncière).",
      "Vérifier le titre foncier (« melkia » vs titré) — toujours via notaire.",
      "Rendement locatif courte durée intéressant à Marrakech/Tanger.",
    ],
    difficulty: 2,
  },
  {
    audience: ["mre", "local"],
    icon: "IdCard",
    title: "Démarches & papiers",
    summary: "CNIE, passeport, état civil : ce qui se fait au consulat / en ligne.",
    points: [
      "CNIE et passeport biométrique renouvelables via consulat (MRE) ou préfecture.",
      "Acte de naissance / livret de famille : portail consulaire en ligne.",
      "Légalisation & apostille pour documents étrangers (mariage, diplômes).",
      "Anticipe : certains délais consulaires dépassent 6 semaines.",
    ],
    difficulty: 2,
  },
];

export type Faq = { q: string; a: string; audience: Audience[] };

export const FAQ: Faq[] = [
  {
    q: "Combien faut-il par mois pour bien vivre au Maroc ?",
    a: "Pour une personne seule en mode confortable : 8 000–11 500 MAD (≈ 750–1 100 €) selon la ville, loyer inclus. Un couple ajoute environ +40 %. C'est globalement 2× moins cher qu'une grande ville française.",
    audience: ["etranger", "mre", "local"],
  },
  {
    q: "Puis-je rester plus de 90 jours sans visa ?",
    a: "Non : au-delà de 90 jours, il faut demander une carte d'immatriculation (séjour) auprès de la préfecture de police de ta ville, avec justificatif de domicile et de ressources. Beaucoup font une sortie/entrée pour reset, mais la voie légale durable reste la carte de séjour.",
    audience: ["etranger"],
  },
  {
    q: "MRE : comment rapatrier mon argent sans le bloquer ?",
    a: "Ouvre un compte en dirhams convertibles (idéalement depuis l'étranger). Il te permet de rentrer des devises et de les ressortir librement plus tard. Évite de tout basculer en dirham non-convertible, dont la sortie est réglementée.",
    audience: ["mre"],
  },
  {
    q: "Le Maroc est-il fiscalement intéressant pour un retraité ?",
    a: "Oui. En tant que résident fiscal, les pensions de source étrangère bénéficient d'un abattement important (80 % puis 70 %) sur l'IR, et la convention France–Maroc évite la double imposition. Un calcul personnalisé reste indispensable selon ta situation.",
    audience: ["etranger", "mre"],
  },
  {
    q: "Quelle ville choisir pour commencer ?",
    a: "Marrakech pour la communauté nomade et les vols, Tanger pour la proximité Europe et le business, Agadir pour le climat et la retraite, Rabat pour la tranquillité familiale, Casablanca pour la carrière. Essaouira pour la slow life.",
    audience: ["etranger", "mre"],
  },
];

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function getCitySlugs(): string[] {
  return CITIES.map((c) => c.slug);
}

/**
 * Bloc de connaissances compact injecté dans le system prompt de J.A.R.V.I.S.
 * pour qu'il raisonne sur des faits Maroc réels (et non hallucinés).
 */
export function getMarocKnowledge(): string {
  const cityLines = CITIES.map(
    (c) =>
      `- ${c.name}: ~${Math.round(c.monthlyMad / EUR_TO_MAD)}€/mois (1 pers.), loyer 1ch ~${Math.round(c.rent1brMad / EUR_TO_MAD)}€, indice ${c.costIndexVsParis}/100 vs Paris, ${c.internetMbps}Mbps. ${c.vibe}.`,
  ).join("\n");
  return [
    "## Base de connaissances MAROC (data Odyssey, estimations 2026, 1€≈10,8 MAD)",
    "Audiences servies: étrangers qui s'installent, MRE (Marocains Résidents à l'Étranger) qui rentrent/investissent, Marocains locaux.",
    "Villes:",
    cityLines,
    "Séjour: 90j sans visa (FR/UE/USA/CA), puis carte d'immatriculation en préfecture (justif. domicile+ressources).",
    "Fiscalité: résident=183j+/an, IR progressif max 38%. Pensions étrangères = abattement 80% puis 70%. Convention France-Maroc anti-double imposition. Statut CFC pour sociétés.",
    "MRE: compte en dirhams convertibles (garde la main sur les devises), franchise douanière au retour définitif, immobilier libre sauf terres agricoles, CNIE/passeport via consulat.",
    "Santé: cliniques privées de qualité, consult ~30-37€, AMO/CNSS pour cotisants.",
    "Quand on te pose une question Maroc, raisonne avec CES chiffres, propose un plan d'action concret par étapes, et oriente vers le hub /maroc et son estimateur.",
  ].join("\n");
}

/** Coût de vie de référence d'une grande ville française (€/mois, 1 pers., loyer inclus). */
export const FRANCE_BASELINE_EUR = 2200;

/**
 * Estimation du coût de vie mensuel et de l'économie réalisée vs France.
 * @param citySlug ville cible
 * @param people nombre de personnes (1 = +0%, chaque pers. supplémentaire ≈ +40%)
 * @param lifestyle "eco" | "confort" | "premium"
 */
export function estimateMonthlyCost(
  citySlug: string,
  people: number,
  lifestyle: "eco" | "confort" | "premium",
): { mad: number; eur: number; savingsEurPerYear: number; vsParisPct: number } {
  const city = CITIES.find((c) => c.slug === citySlug) ?? CITIES[0];
  const lifestyleMult = lifestyle === "eco" ? 0.78 : lifestyle === "premium" ? 1.6 : 1;
  const peopleMult = 1 + Math.max(0, people - 1) * 0.4;
  const mad = Math.round(city.monthlyMad * lifestyleMult * peopleMult);
  const eur = Math.round(mad / EUR_TO_MAD);
  const franceCost = Math.round(FRANCE_BASELINE_EUR * peopleMult * (lifestyle === "premium" ? 1.5 : lifestyle === "eco" ? 0.85 : 1));
  const savingsEurPerYear = Math.max(0, (franceCost - eur) * 12);
  return { mad, eur, savingsEurPerYear, vsParisPct: city.costIndexVsParis };
}
