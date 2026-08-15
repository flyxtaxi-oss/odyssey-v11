// ==============================================================================
// IDENTITÉ DE L'ÉDITEUR — source unique pour toutes les pages légales
// ==============================================================================
//
// Pourquoi un fichier de config plutôt que du texte en dur dans trois pages :
// ces informations sont légalement opposables et doivent être IDENTIQUES
// partout (mentions légales, CGU, politique de confidentialité, formulaires
// de contact, fiches App Store et Play Store). Dupliquées, elles divergent au
// premier changement d'adresse ou de statut, et une incohérence entre la fiche
// store et le site est un motif de rejet.
//
// ⚠️  LES CHAMPS MARQUÉS `À_REMPLIR` BLOQUENT LA MISE EN LIGNE.
//     Ils ne sont pas des valeurs par défaut acceptables : publier des
//     mentions légales incomplètes est une infraction (art. 6 LCEN), et
//     l'App Store comme le Play Store rejettent une fiche dont l'éditeur
//     n'est pas identifiable.
//
// Ces valeurs ne sont volontairement PAS inventées. Personne d'autre que
// l'éditeur ne connaît son numéro d'immatriculation ou son hébergeur légal.

/** Marqueur explicite : rend visible à l'écran ce qui reste à compléter. */
export const TODO = "À_REMPLIR" as const;

export const LEGAL = {
  /** Nom commercial du service. */
  serviceName: "Odyssey.ai",

  /** Raison sociale de l'éditeur (personne morale ou nom de l'entrepreneur). */
  companyName: "Quantyx Flow",

  /** Forme juridique : SAS, SASU, SARL, entreprise individuelle… */
  legalForm: TODO,

  /** Siège social complet (numéro, rue, code postal, ville, pays). */
  address: TODO,

  /** Numéro d'immatriculation : SIREN/SIRET (FR), BCE (BE), IDE (CH)… */
  registrationNumber: TODO,

  /** Numéro de TVA intracommunautaire, si assujetti. */
  vatNumber: TODO,

  /** Capital social, si société. Laisser TODO pour une entreprise individuelle. */
  shareCapital: TODO,

  /** Directeur de la publication (personne physique responsable du contenu). */
  publicationDirector: "Jibril",

  /** Adresse de contact générale. */
  contactEmail: "zji063591@gmail.com",

  /**
   * Adresse dédiée aux demandes RGPD (accès, rectification, effacement…).
   * Peut être identique à contactEmail au démarrage, mais une adresse
   * distincte évite que les demandes se noient dans le support.
   */
  privacyEmail: "zji063591@gmail.com",

  /** Hébergeur du site — mention obligatoire (LCEN art. 6-III). */
  host: {
    name: "Vercel Inc.",
    address: "340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis",
    website: "https://vercel.com",
  },

  /**
   * Date de dernière révision, affichée en haut de chaque document.
   * À mettre à jour à CHAQUE modification de fond : c'est ce qui permet à un
   * utilisateur de savoir si les conditions ont changé depuis son acceptation.
   */
  lastUpdated: "2026-08-05",
} as const;

/** true si au moins un champ obligatoire n'est pas renseigné. */
export function hasIncompleteLegalInfo(): boolean {
  return Object.values(LEGAL).some((v) => v === TODO);
}

/**
 * Sous-traitants qui reçoivent des données personnelles.
 *
 * Le RGPD (art. 13-1-e) impose de nommer les destinataires, pas de dire
 * « des prestataires techniques ». Cette liste est dérivée du code réel :
 * chaque entrée correspond à une dépendance effectivement appelée, pas à une
 * intention. Ajouter un service ici est une étape obligatoire de toute PR qui
 * introduit un nouveau tiers.
 */
export const SUBPROCESSORS = [
  {
    name: "Google Firebase (Authentication, Firestore)",
    purpose: "Authentification des comptes et stockage des données du service",
    location: "Union européenne / États-Unis",
    safeguard: "Clauses contractuelles types + Data Privacy Framework",
  },
  {
    name: "Google Gemini / Vertex AI",
    purpose: "Génération des réponses de l'assistant J.A.R.V.I.S.",
    location: "Union européenne / États-Unis",
    safeguard: "Clauses contractuelles types + Data Privacy Framework",
  },
  {
    name: "Vercel Inc.",
    purpose: "Hébergement de l'application et journaux techniques",
    location: "États-Unis",
    safeguard: "Clauses contractuelles types + Data Privacy Framework",
  },
  {
    name: "Sentry (Functional Software, Inc.)",
    purpose: "Détection des erreurs techniques",
    location: "États-Unis",
    safeguard:
      "Clauses contractuelles types. Les données personnelles sont retirées avant envoi (voir src/lib/sentry-scrub.ts).",
  },
] as const;

/**
 * Catégories de données traitées, dérivées des collections Firestore
 * réellement écrites par l'application.
 *
 * Tenir cette liste à jour n'est pas cosmétique : un traitement non déclaré
 * est un traitement sans base légale.
 */
export const DATA_CATEGORIES = [
  {
    category: "Identité et compte",
    detail: "Adresse e-mail, identifiant de compte, date de création",
    collection: "profiles",
    basis: "Exécution du contrat",
    retention: "Durée de vie du compte, puis 30 jours",
  },
  {
    category: "Situation personnelle déclarée",
    detail:
      "Revenus, situation familiale, nationalité, statut de séjour — uniquement ce que tu saisis toi-même dans le simulateur",
    collection: "simulations, predictions",
    basis: "Exécution du contrat",
    retention: "Durée de vie du compte, suppression à la demande",
  },
  {
    category: "Conversations avec l'assistant",
    detail: "Messages échangés avec J.A.R.V.I.S. et contexte de conversation",
    collection: "conversations",
    basis: "Exécution du contrat",
    retention: "Durée de vie du compte, suppression à la demande",
  },
  {
    category: "Contenus communautaires",
    detail: "Publications et interactions dans la Safe-Zone",
    collection: "posts",
    basis: "Exécution du contrat",
    retention: "Jusqu'à suppression par l'auteur",
  },
  {
    category: "Progression et usage",
    detail: "Avancement des parcours, check-ins, progression linguistique",
    collection: "checkins, skill_missions, skill_tracks, language_progress",
    basis: "Exécution du contrat",
    retention: "Durée de vie du compte",
  },
  {
    category: "Sécurité et abus",
    detail: "Journaux d'accès, compteurs de limitation de débit",
    collection: "audit_log, rate_limits",
    basis: "Intérêt légitime (sécurité du service)",
    retention: "12 mois maximum",
  },
] as const;
