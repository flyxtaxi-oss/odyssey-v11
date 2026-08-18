// ==============================================================================
// RATE LIMIT DURABLE — compteur partagé entre instances (Firestore)
// ==============================================================================
//
// Le token bucket de `ai-engine.ts` vit en mémoire. En serverless c'est un
// compteur par instance : il diffère d'une lambda à l'autre et repart à zéro à
// chaque démarrage à froid. Suffisant pour lisser des rafales, inutile face à
// quelqu'un qui veut faire payer des appels LLM.
//
// Ce module ajoute un compteur **partagé** — mais seulement là où ça vaut le
// coup. Un write Firestore par requête sur les 15 routes coûterait plus cher
// que l'abus qu'il éviterait ; sur une route qui déclenche un appel LLM payant,
// le rapport s'inverse. D'où l'usage en opt-in, routes IA uniquement, avec le
// bucket mémoire conservé en pré-filtre local (gratuit, attrape les rafales
// d'une même instance sans toucher Firestore).
//
// POSTURE EN CAS DE PANNE : fail-open. Si Firestore est indisponible, la
// requête passe et l'incident est loggué. Un limiteur en panne ne doit pas
// faire tomber le produit — c'est un arbitrage disponibilité > protection de
// coût, à réviser si l'abus devient réel.
//
// Vie privée : la clé (uid ou IP) est hachée avant de servir d'identifiant de
// document, et chaque doc porte `expires_at` pour une politique TTL Firestore.

import { createHash } from "node:crypto";
import { serverDb } from "./firestore-server";

/** Collection serveur uniquement — accès client refusé par firestore.rules. */
const COLLECTION = "rate_limits";

/** Durée après laquelle un bucket inactif peut être purgé (TTL Firestore). */
const TTL_MS = 24 * 60 * 60 * 1000;

export type DurableLimit = {
  /** Capacité du bucket (rafale maximale). */
  max: number;
  /** Jetons regénérés par seconde. */
  refillPerSec: number;
};

export type DurableVerdict = {
  allowed: boolean;
  resetMs: number;
  /** true quand le compteur partagé était injoignable (on a laissé passer). */
  degraded: boolean;
};

function bucketId(key: string): string {
  return createHash("sha256").update(key).digest("hex").slice(0, 32);
}

/**
 * Consomme un jeton dans le bucket partagé.
 *
 * La lecture et l'écriture sont dans une transaction Firestore : deux requêtes
 * concurrentes sur des instances différentes ne peuvent pas lire le même solde
 * et le décrémenter chacune de leur côté.
 */
export async function consumeDurableToken(
  key: string,
  limit: DurableLimit
): Promise<DurableVerdict> {
  try {
    const db = await serverDb();
    const ref = db.collection(COLLECTION).doc(bucketId(key));

    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const now = Date.now();

      const previous = snap.exists ? snap.data() : undefined;
      const lastRefill = typeof previous?.last_refill === "number" ? previous.last_refill : now;
      const stored = typeof previous?.tokens === "number" ? previous.tokens : limit.max;

      const elapsedSec = Math.max(0, (now - lastRefill) / 1000);
      const tokens = Math.min(limit.max, stored + elapsedSec * limit.refillPerSec);

      if (tokens < 1) {
        // Pas d'écriture quand on refuse : inutile de payer un write pour dire
        // non, et cela évite qu'un flood réécrive le document en boucle.
        const resetMs = Math.ceil(((1 - tokens) / limit.refillPerSec) * 1000);
        return { allowed: false, resetMs, degraded: false };
      }

      tx.set(ref, {
        tokens: tokens - 1,
        last_refill: now,
        expires_at: new Date(now + TTL_MS),
      });

      return { allowed: true, resetMs: 0, degraded: false };
    });
  } catch (error) {
    // Fail-open assumé et visible : voir la note de posture en tête de fichier.
    console.error("[rate-limit] compteur partagé injoignable, requête laissée passer:", error);
    return { allowed: true, resetMs: 0, degraded: true };
  }
}
