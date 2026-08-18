// ==============================================================================
// DROITS D'ACCÈS — ce que chaque plan débloque réellement
// ==============================================================================
//
// La landing vend trois plans depuis des mois. Aucun n'existait dans le code :
// ni compteur de simulations, ni restriction de personas, ni notion de plan sur
// le profil. Un abonné payant recevait exactement le produit gratuit.
//
// Ce module est la source unique de vérité. Il énonce les droits ; il ne les
// applique pas tout seul — l'application se fait dans les routes serveur, via
// `assertWithinQuota` et `hasFeature`.
//
// ── Deux règles non négociables ───────────────────────────────────────────────
//
// 1. LE PLAN VIENT DU SERVEUR, JAMAIS DU CLIENT.
//    Il est lu sur le document `profiles/{uid}` avec l'Admin SDK. Le client
//    peut l'AFFICHER, jamais le décider. Une vérification faite uniquement dans
//    le composant React est cosmétique : l'appel `fetch` direct la contourne.
//
// 2. LE CHAMP EST EN ÉCRITURE INTERDITE POUR SON PROPRIÉTAIRE.
//    Les règles Firestore refusent à l'utilisateur de modifier `plan` et
//    `planStatus` sur son propre profil — même pattern que `role`. Sans ce
//    verrou, n'importe qui se met `plan: "pro_max"` depuis la console du
//    navigateur : le SDK client écrit dans Firestore avec l'identité de
//    l'utilisateur, et l'abonnement devient déclaratif.
//
// Voir docs/audits/2026-08-05-audit-complet-multi-agents.md

/** Identifiants de plan. Stockés tels quels dans `profiles/{uid}.plan`. */
export type PlanId = "free" | "pro" | "pro_max";

/** Fonctionnalités activables. Une clé par verrou réel dans le produit. */
export type FeatureKey =
  | "all_personas"
  | "predictions"
  | "multi_country_dashboard"
  | "priority_model";

/** Compteurs mensuels. Une clé par usage mesuré. */
export type QuotaKey = "simulations" | "jarvis_messages" | "predictions";

export type Plan = {
  id: PlanId;
  label: string;
  /** Prix mensuel en centimes d'euro. 0 = gratuit. */
  priceMonthlyCents: number;
  /** Prix annuel en centimes. null si le plan n'est pas proposé à l'année. */
  priceYearlyCents: number | null;
  /**
   * Quotas par mois calendaire. `null` = illimité.
   * Un quota absent de cette table vaut illimité : n'ajoute une clé que si
   * elle est réellement comptée quelque part.
   */
  quotas: Partial<Record<QuotaKey, number | null>>;
  features: Record<FeatureKey, boolean>;
};

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    label: "Free",
    priceMonthlyCents: 0,
    priceYearlyCents: null,
    quotas: { simulations: 3, jarvis_messages: 30, predictions: 0 },
    features: {
      all_personas: false,
      predictions: false,
      multi_country_dashboard: false,
      priority_model: false,
    },
  },
  pro: {
    id: "pro",
    label: "Pro",
    priceMonthlyCents: 1900,
    priceYearlyCents: 15900,
    quotas: { simulations: null, jarvis_messages: 500, predictions: 20 },
    features: {
      all_personas: true,
      predictions: true,
      multi_country_dashboard: true,
      priority_model: false,
    },
  },
  pro_max: {
    id: "pro_max",
    label: "Pro Max",
    priceMonthlyCents: 4900,
    priceYearlyCents: 39900,
    quotas: { simulations: null, jarvis_messages: null, predictions: null },
    features: {
      all_personas: true,
      predictions: true,
      multi_country_dashboard: true,
      priority_model: true,
    },
  },
};

/**
 * Persona accessible sans abonnement.
 *
 * La landing annonce « JARVIS limité (1 persona) » en Free. C'est celle-ci.
 * Le choix de `strategist` suit le défaut déjà présent dans /api/jarvis.
 */
export const FREE_PERSONA = "strategist";

/** Plan par défaut quand le profil n'en porte aucun (comptes créés avant). */
export const DEFAULT_PLAN: PlanId = "free";

/**
 * Normalise une valeur venue de la base.
 *
 * Un document peut contenir n'importe quoi : plan absent (compte antérieur à
 * la facturation), valeur d'un plan supprimé, ou chaîne arbitraire si le
 * verrou Firestore venait à sauter. Toute valeur non reconnue retombe sur
 * `free` — on n'accorde jamais de droits sur une donnée qu'on ne comprend pas.
 */
export function normalizePlan(raw: unknown): PlanId {
  return raw === "pro" || raw === "pro_max" ? raw : DEFAULT_PLAN;
}

/**
 * Un abonnement n'est actif que si Stripe le dit.
 *
 * `plan: "pro"` avec un paiement en échec depuis trois semaines ne doit plus
 * ouvrir de droits. Le webhook écrit `planStatus` ; tout ce qui n'est pas
 * `active` ou `trialing` retombe sur les droits du plan gratuit.
 */
export type PlanStatus = "active" | "trialing" | "past_due" | "canceled" | "none";

export function effectivePlan(raw: unknown, status: unknown): PlanId {
  const plan = normalizePlan(raw);
  if (plan === "free") return "free";
  return status === "active" || status === "trialing" ? plan : "free";
}

/** La fonctionnalité est-elle ouverte pour ce plan ? */
export function hasFeature(plan: PlanId, feature: FeatureKey): boolean {
  return PLANS[plan].features[feature];
}

/**
 * Limite mensuelle pour ce plan. `null` = illimité.
 *
 * Une clé absente de `quotas` vaut illimité — pas zéro. L'inverse
 * transformerait tout oubli de déclaration en blocage silencieux du produit.
 */
export function quotaFor(plan: PlanId, key: QuotaKey): number | null {
  const q = PLANS[plan].quotas;
  return key in q ? (q[key] ?? null) : null;
}

/**
 * Clé de période pour les compteurs : "2026-08".
 *
 * Le mois calendaire UTC est volontaire. Un quota glissant sur 30 jours exige
 * de conserver l'horodatage de chaque usage ; un seau mensuel tient dans un
 * seul entier par utilisateur et par compteur, et se réinitialise sans tâche
 * planifiée — le simple changement de clé suffit.
 */
export function currentPeriod(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Ce que voit l'interface pour afficher « 2 simulations restantes ». */
export type QuotaState = {
  key: QuotaKey;
  used: number;
  limit: number | null;
  remaining: number | null;
  exceeded: boolean;
};

export function quotaState(plan: PlanId, key: QuotaKey, used: number): QuotaState {
  const limit = quotaFor(plan, key);
  if (limit === null) {
    return { key, used, limit: null, remaining: null, exceeded: false };
  }
  return {
    key,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    exceeded: used >= limit,
  };
}
