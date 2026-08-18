/**
 * maroc-parcours.ts — Moteur du "Parcours A→Z : s'installer au Maroc".
 *
 * Génère une feuille de route personnalisée et testable selon le profil
 * (ex: un MRE de Belgique avec famille qui veut rentrer, ou un étranger retraité).
 *
 * ⚠️ Démarches et coûts = estimations 2026 (ordre de grandeur), non contractuels.
 */

import { CITIES, EUR_TO_MAD, type City } from "@/lib/maroc-data";

export type FromCountry =
  | "France"
  | "Belgique"
  | "Espagne"
  | "Italie"
  | "Pays-Bas"
  | "Allemagne"
  | "Canada"
  | "Autre";

export const FROM_COUNTRIES: FromCountry[] = [
  "France",
  "Belgique",
  "Espagne",
  "Italie",
  "Pays-Bas",
  "Allemagne",
  "Canada",
  "Autre",
];

/** mre = Marocain (ou binational) qui rentre ; etranger = non-marocain qui s'installe */
export type Status = "mre" | "etranger";
export type Family = "solo" | "couple" | "famille";
export type Goal = "remote" | "retraite" | "business" | "etudes";

export type Profile = {
  fromCountry: FromCountry;
  status: Status;
  family: Family;
  kids: number;
  goal: Goal;
  hasVehicle: boolean;
  citySlug: string;
};

export const GOALS: { id: Goal; label: string; emoji: string }[] = [
  { id: "remote", label: "Travailler en remote", emoji: "💻" },
  { id: "retraite", label: "Prendre ma retraite", emoji: "🌅" },
  { id: "business", label: "Lancer un business", emoji: "🚀" },
  { id: "etudes", label: "Étudier", emoji: "🎓" },
];

export type Phase = "preparation" | "demenagement" | "arrivee" | "installation";

export const PHASES: { id: Phase; label: string; emoji: string; desc: string }[] = [
  { id: "preparation", label: "Avant le départ", emoji: "📋", desc: "Tout ce qui se prépare depuis ton pays de résidence." },
  { id: "demenagement", label: "Le déménagement", emoji: "📦", desc: "Logistique, douane, véhicule, animaux." },
  { id: "arrivee", label: "À l'arrivée", emoji: "🛬", desc: "Tes premières démarches une fois au Maroc." },
  { id: "installation", label: "S'installer durablement", emoji: "🏡", desc: "Fiscalité, école, santé, communauté." },
];

export type Step = {
  id: string;
  phase: Phase;
  title: string;
  summary: string;
  docs: string[];
  /** Coût estimé en € (0 = gratuit) */
  costEur: number;
  /** Durée / délai indicatif */
  duration: string;
  difficulty: 1 | 2 | 3;
  tip?: string;
  /** Action testable dans l'app (lien interne) */
  test?: { label: string; href: string };
  /** Condition d'affichage selon le profil */
  appliesIf?: (p: Profile) => boolean;
};

const STEPS: Step[] = [
  // ─── PRÉPARATION ───
  {
    id: "budget",
    phase: "preparation",
    title: "Valider ton budget mensuel",
    summary: "Calcule combien il te faut vraiment selon ta ville, ta famille et ton style de vie.",
    docs: [],
    costEur: 0,
    duration: "10 min",
    difficulty: 1,
    tip: "Garde 6 mois de coût de vie en réserve pour la transition.",
    test: { label: "Ouvrir l'estimateur", href: "/maroc#estimateur" },
  },
  {
    id: "city",
    phase: "preparation",
    title: "Choisir ta ville d'installation",
    summary: "Compare coût, climat, communauté et opportunités selon ton objectif.",
    docs: [],
    costEur: 0,
    duration: "30 min",
    difficulty: 1,
    test: { label: "Comparer les villes", href: "/maroc" },
  },
  {
    id: "passport",
    phase: "preparation",
    title: "Vérifier passeport & CNIE",
    summary: "Passeport valide 6 mois+. Pour les MRE : CNIE biométrique à jour (sinon la galère au retour).",
    docs: ["Passeport en cours de validité", "CNIE (MRE)", "Photos d'identité biométriques"],
    costEur: 0,
    duration: "1–6 semaines (consulat)",
    difficulty: 2,
    tip: "Anticipe : les délais consulaires dépassent souvent 6 semaines.",
    appliesIf: (p) => p.status === "mre",
  },
  {
    id: "visa-famille",
    phase: "preparation",
    title: "Statut de séjour de la famille",
    summary: "90 jours sans visa pour la plupart, puis carte d'immatriculation. Vérifie chaque membre.",
    docs: ["Passeports de tous les membres", "Acte de mariage", "Actes de naissance des enfants"],
    costEur: 0,
    duration: "À l'arrivée",
    difficulty: 2,
    appliesIf: (p) => p.status === "etranger",
  },
  {
    id: "ecole-prep",
    phase: "preparation",
    title: "Présélectionner l'école des enfants",
    summary: "Réseaux français (AEFE/OSUI), espagnol, américain, ou écoles privées marocaines. Places limitées.",
    docs: ["Bulletins scolaires", "Certificat de radiation", "Carnet de vaccination"],
    costEur: 0,
    duration: "2–3 mois avant",
    difficulty: 2,
    tip: "Les écoles internationales affichent souvent complet : inscris-toi tôt.",
    appliesIf: (p) => p.kids > 0,
  },
  {
    id: "compte-convertible",
    phase: "preparation",
    title: "Ouvrir un compte en dirhams convertibles",
    summary: "Indispensable MRE : permet de rentrer des devises ET de les ressortir librement.",
    docs: ["Pièce d'identité", "Justificatif de résidence à l'étranger", "Justificatif de revenus"],
    costEur: 0,
    duration: "1–2 semaines",
    difficulty: 2,
    tip: "Évite le compte en dirhams non-convertibles : sortie de devises restreinte.",
    appliesIf: (p) => p.status === "mre",
  },
  {
    id: "transfert",
    phase: "preparation",
    title: "Préparer le transfert de tes fonds",
    summary: "Compare les frais et taux réels avant de transférer ton épargne. Les écarts coûtent cher.",
    docs: [],
    costEur: 0,
    duration: "Variable",
    difficulty: 2,
    tip: "Sur 50 000 €, 2 % de frais cachés = 1 000 € perdus. Compare toujours.",
  },

  // ─── DÉMÉNAGEMENT ───
  {
    id: "devis-demenagement",
    phase: "demenagement",
    title: "Devis déménageur international",
    summary: "Groupage maritime (économique) ou conteneur dédié. Demande 3 devis.",
    docs: ["Inventaire détaillé des biens", "Justificatif de domicile (départ + arrivée)"],
    costEur: 2500,
    duration: "3–6 semaines de transit",
    difficulty: 2,
  },
  {
    id: "franchise-douane",
    phase: "demenagement",
    title: "Franchise douanière (retour définitif)",
    summary: "Statut « retour définitif » : franchise des droits sur tes effets personnels usagés.",
    docs: ["Certificat de changement de résidence", "Inventaire estimatif", "Justificatif de résidence >1 an à l'étranger"],
    costEur: 0,
    duration: "À préparer 1 mois avant",
    difficulty: 3,
    tip: "À demander AVANT le départ via le consulat — sinon tu paies les droits.",
    appliesIf: (p) => p.status === "mre",
  },
  {
    id: "vehicule",
    phase: "demenagement",
    title: "Importer ton véhicule",
    summary: "Conditions spécifiques d'importation en franchise selon ancienneté et résidence.",
    docs: ["Carte grise", "Facture d'achat", "Assurance"],
    costEur: 800,
    duration: "Variable",
    difficulty: 3,
    tip: "Calcule si l'importation est vraiment rentable vs acheter sur place.",
    appliesIf: (p) => p.hasVehicle,
  },

  // ─── ARRIVÉE ───
  {
    id: "logement",
    phase: "arrivee",
    title: "Trouver ton logement",
    summary: "Loue d'abord (3–6 mois) avant d'acheter, le temps de connaître les quartiers.",
    docs: ["Pièce d'identité", "Caution (1–2 mois)", "Contrat de bail"],
    costEur: 600,
    duration: "1–3 semaines",
    difficulty: 2,
    test: { label: "Voir les villes & loyers", href: "/maroc" },
  },
  {
    id: "carte-sejour",
    phase: "arrivee",
    title: "Carte d'immatriculation (séjour)",
    summary: "Au-delà de 90 jours : demande à la préfecture de police de ta ville.",
    docs: ["Passeport", "Justificatif de domicile", "Justificatif de ressources", "Photos", "Contrat ou attestation"],
    costEur: 30,
    duration: "Quelques semaines",
    difficulty: 3,
    appliesIf: (p) => p.status === "etranger",
  },
  {
    id: "telecom",
    phase: "arrivee",
    title: "Téléphone & internet",
    summary: "SIM locale (Maroc Telecom, Orange, inwi) en 10 min, fibre à domicile sous quelques jours.",
    docs: ["Pièce d'identité"],
    costEur: 25,
    duration: "1–7 jours",
    difficulty: 1,
  },
  {
    id: "banque-locale",
    phase: "arrivee",
    title: "Ouvrir ton compte bancaire local",
    summary: "Pour le quotidien : carte, prélèvements, paiements. En plus du compte convertible.",
    docs: ["Pièce d'identité", "Justificatif de domicile", "Justificatif de revenus"],
    costEur: 0,
    duration: "1–2 semaines",
    difficulty: 2,
  },
  {
    id: "sante",
    phase: "arrivee",
    title: "Santé & assurance",
    summary: "Assurance internationale la 1re année, puis AMO/CNSS si tu cotises. Cliniques privées de qualité.",
    docs: ["Pièce d'identité", "Dossier médical"],
    costEur: 80,
    duration: "Immédiat",
    difficulty: 1,
  },

  // ─── INSTALLATION ───
  {
    id: "ecole-inscription",
    phase: "installation",
    title: "Inscrire les enfants à l'école",
    summary: "Finalise l'inscription, l'uniforme, le transport scolaire.",
    docs: ["Dossier scolaire", "Certificat de radiation", "Carnet de vaccination", "Acte de naissance"],
    costEur: 0,
    duration: "1 semaine",
    difficulty: 2,
    appliesIf: (p) => p.kids > 0,
  },
  {
    id: "fiscalite",
    phase: "installation",
    title: "Comprendre ta fiscalité",
    summary: "Résident = 183j+/an. Retraités : abattement 80% puis 70%. Convention anti-double imposition.",
    docs: ["Justificatifs de revenus", "Avis d'imposition pays d'origine"],
    costEur: 0,
    duration: "En continu",
    difficulty: 3,
    tip: "Fais valider ta situation par un fiscaliste la 1re année.",
    test: { label: "Demander à J.A.R.V.I.S.", href: "/jarvis" },
  },
  {
    id: "business-setup",
    phase: "installation",
    title: "Créer ta société / statut",
    summary: "Auto-entrepreneur, SARL, ou statut CFC (Casablanca Finance City) selon ton activité.",
    docs: ["Business plan", "Pièce d'identité", "Justificatif de domicile"],
    costEur: 300,
    duration: "2–4 semaines",
    difficulty: 3,
    tip: "Le statut CFC offre une fiscalité réduite pour les sociétés éligibles.",
    appliesIf: (p) => p.goal === "business",
  },
  {
    id: "remote-setup",
    phase: "installation",
    title: "Sécuriser ton activité remote",
    summary: "Coworking, contrat clair, et solution d'encaissement de tes revenus en devises.",
    docs: [],
    costEur: 100,
    duration: "1 semaine",
    difficulty: 2,
    appliesIf: (p) => p.goal === "remote",
  },
  {
    id: "communaute",
    phase: "installation",
    title: "Rejoindre la communauté",
    summary: "Expats, MRE, voisins : le réseau accélère tout (bons plans, artisans de confiance, amis).",
    docs: [],
    costEur: 0,
    duration: "En continu",
    difficulty: 1,
    test: { label: "Rejoindre la Safe-Zone", href: "/safezone" },
  },
];

export type ParcoursPhase = {
  phase: Phase;
  label: string;
  emoji: string;
  desc: string;
  steps: Step[];
};

export type Parcours = {
  phases: ParcoursPhase[];
  totalSteps: number;
  totalCostEur: number;
  totalCostMad: number;
  city: City;
};

/** Construit le parcours personnalisé à partir du profil. */
export function generateParcours(profile: Profile): Parcours {
  const applicable = STEPS.filter((s) => !s.appliesIf || s.appliesIf(profile));
  const phases: ParcoursPhase[] = PHASES.map((ph) => ({
    phase: ph.id,
    label: ph.label,
    emoji: ph.emoji,
    desc: ph.desc,
    steps: applicable.filter((s) => s.phase === ph.id),
  })).filter((p) => p.steps.length > 0);

  const totalCostEur = applicable.reduce((sum, s) => sum + s.costEur, 0);
  const city = CITIES.find((c) => c.slug === profile.citySlug) ?? CITIES[0];

  return {
    phases,
    totalSteps: applicable.length,
    totalCostEur,
    totalCostMad: Math.round(totalCostEur * EUR_TO_MAD),
    city,
  };
}

export const DEFAULT_PROFILE: Profile = {
  fromCountry: "Belgique",
  status: "mre",
  family: "famille",
  kids: 2,
  goal: "remote",
  hasVehicle: true,
  citySlug: "marrakech",
};
