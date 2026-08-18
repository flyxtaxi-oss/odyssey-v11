// ==============================================================================
// DROITS D'ACCÈS — application côté serveur
// ==============================================================================
//
// `entitlements.ts` énonce les droits. Ce module les fait respecter, et il est
// le SEUL endroit autorisé à le faire : une vérification écrite dans un
// composant React est cosmétique, puisqu'un `fetch` direct sur la route la
// contourne entièrement. La leçon est déjà inscrite dans ce dépôt — la
// protection doit vivre dans la fonction appelée, pas dans la page qui l'appelle.
//
// ── Posture en cas de panne : FAIL-OPEN, assumée ─────────────────────────────
//
// Si Firestore est injoignable, on laisse passer. C'est délibéré et c'est
// l'inverse de la posture retenue pour les règles de sécurité (fail-closed).
// La raison : la conséquence d'une erreur n'est pas symétrique.
//   - Bloquer à tort → un client PAYANT ne peut plus utiliser ce qu'il a payé,
//     pendant une panne dont il n'est pas responsable. Remboursement, avis
//     négatif, résiliation.
//   - Laisser passer à tort → un compte gratuit dépasse de quelques unités.
//     Le coût marginal est celui d'un appel LLM.
// Un quota protège un revenu, pas une donnée. On ne traite pas les deux pareil.

import { serverDb } from "@/lib/firestore-server";
import {
  effectivePlan,
  quotaFor,
  quotaState,
  currentPeriod,
  hasFeature,
  type PlanId,
  type QuotaKey,
  type FeatureKey,
  type QuotaState,
} from "@/lib/entitlements";

/** Un document par utilisateur et par mois. Voir `counterId`. */
const USAGE_COLLECTION = "usage_counters";

/**
 * Les compteurs d'un mois révolu ne servent plus qu'à l'historique.
 * Ce champ alimente une politique TTL Firestore côté console : sans elle,
 * la collection grossit indéfiniment d'un document par utilisateur et par mois.
 */
const USAGE_TTL_DAYS = 400;

/**
 * Un seul document par (utilisateur, période) plutôt qu'un par compteur.
 *
 * Tous les compteurs d'un mois tiennent ainsi dans une seule lecture et une
 * seule transaction, et la réinitialisation mensuelle ne demande aucune tâche
 * planifiée : le mois suivant, la clé change et le document repart vide.
 */
function counterId(uid: string, period: string): string {
  return `${uid}__${period}`;
}

/**
 * Lit le plan effectif d'un utilisateur depuis son profil.
 *
 * Lecture avec l'Admin SDK, donc hors des règles Firestore — ce qui est le but :
 * c'est la seule lecture de `plan` en laquelle le serveur peut avoir confiance.
 * Ne jamais accepter un plan transmis dans le corps d'une requête.
 */
export async function getUserPlan(uid: string): Promise<PlanId> {
  try {
    const db = await serverDb();
    const snap = await db.collection("profiles").doc(uid).get();
    const data = snap.exists ? snap.data() : undefined;
    return effectivePlan(data?.plan, data?.planStatus);
  } catch (error) {
    // Fail-open : voir la note de posture en tête de fichier. On rend `free`,
    // ce qui laisse l'utilisateur travailler dans les limites gratuites plutôt
    // que de renvoyer une erreur.
    console.error("[entitlements] profil illisible, retombée sur 'free':", error);
    return "free";
  }
}

export type QuotaVerdict = QuotaState & {
  allowed: boolean;
  plan: PlanId;
  /** true quand le compteur était injoignable et qu'on a laissé passer. */
  degraded: boolean;
};

/**
 * Consomme une unité de quota, de façon atomique.
 *
 * Lecture et écriture dans une transaction Firestore : sans elle, dix requêtes
 * lancées en parallèle lisent toutes « 2 utilisées sur 3 » et passent toutes.
 * Un quota non transactionnel n'est pas un quota, c'est une suggestion.
 *
 * Rien n'est écrit quand on refuse : inutile de payer une écriture pour dire
 * non, et cela évite qu'un client en boucle réécrive le document sans fin.
 */
export async function consumeQuota(uid: string, key: QuotaKey): Promise<QuotaVerdict> {
  const plan = await getUserPlan(uid);
  const limit = quotaFor(plan, key);

  // Illimité : aucune écriture, aucune transaction. Le chemin des abonnés
  // payants ne doit pas payer le coût d'un compteur qui ne sert à rien.
  if (limit === null) {
    return { ...quotaState(plan, key, 0), allowed: true, plan, degraded: false };
  }

  const period = currentPeriod();

  try {
    const db = await serverDb();
    const ref = db.collection(USAGE_COLLECTION).doc(counterId(uid, period));

    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const previous = snap.exists ? snap.data() : undefined;
      const used = typeof previous?.[key] === "number" ? (previous[key] as number) : 0;

      if (used >= limit) {
        return {
          ...quotaState(plan, key, used),
          allowed: false,
          plan,
          degraded: false,
        };
      }

      tx.set(
        ref,
        {
          user_id: uid,
          period,
          [key]: used + 1,
          expires_at: new Date(Date.now() + USAGE_TTL_DAYS * 86_400_000),
        },
        { merge: true }
      );

      return {
        ...quotaState(plan, key, used + 1),
        allowed: true,
        plan,
        degraded: false,
      };
    });
  } catch (error) {
    console.error("[entitlements] compteur injoignable, usage laissé passer:", error);
    return { ...quotaState(plan, key, 0), allowed: true, plan, degraded: true };
  }
}

/**
 * Consultation seule : ne consomme rien.
 *
 * Sert à afficher « il te reste 2 simulations » sans que le simple affichage
 * de la page décrémente le quota — erreur classique quand une seule fonction
 * sert aux deux usages.
 */
export async function peekQuota(uid: string, key: QuotaKey): Promise<QuotaVerdict> {
  const plan = await getUserPlan(uid);
  const limit = quotaFor(plan, key);
  if (limit === null) {
    return { ...quotaState(plan, key, 0), allowed: true, plan, degraded: false };
  }
  try {
    const db = await serverDb();
    const snap = await db
      .collection(USAGE_COLLECTION)
      .doc(counterId(uid, currentPeriod()))
      .get();
    const used = typeof snap.data()?.[key] === "number" ? (snap.data()![key] as number) : 0;
    const state = quotaState(plan, key, used);
    return { ...state, allowed: !state.exceeded, plan, degraded: false };
  } catch (error) {
    console.error("[entitlements] lecture du compteur impossible:", error);
    return { ...quotaState(plan, key, 0), allowed: true, plan, degraded: true };
  }
}

/** La fonctionnalité est-elle ouverte pour cet utilisateur ? */
export async function userHasFeature(uid: string, feature: FeatureKey): Promise<boolean> {
  return hasFeature(await getUserPlan(uid), feature);
}

/**
 * Réponse 402 normalisée pour un quota atteint.
 *
 * 402 « Payment Required » plutôt que 403 : la distinction compte pour le
 * client, qui doit proposer l'abonnement plutôt qu'afficher « accès refusé ».
 */
export function quotaExceededResponse(verdict: QuotaVerdict): Response {
  return Response.json(
    {
      error: "quota_exceeded",
      message: `Tu as utilisé tes ${verdict.limit} usages inclus ce mois-ci dans le plan ${verdict.plan}.`,
      quota: { key: verdict.key, used: verdict.used, limit: verdict.limit },
      upgradeUrl: "/#pricing",
    },
    { status: 402 }
  );
}
