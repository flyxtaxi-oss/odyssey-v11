import { NextResponse } from "next/server";
import { NoProviderError } from "./ai-providers";

// ==============================================================================
// RÉPONSE HONNÊTE QUAND AUCUN MODÈLE N'EST DISPONIBLE
// ==============================================================================
//
// Les routes /api/agent/* renvoyaient « Internal Agent Error » (500) aussi bien
// pour un plantage que pour une clé manquante. Deux situations opposées :
//
//   • 500 → « quelque chose est cassé, cherchez le bug » ;
//   • config absente → « ajoutez une clé », rien n'est cassé.
//
// Les confondre fait perdre du temps à celui qui débogue, et fait croire à
// l'utilisateur que le produit est en panne. Le cas n'a rien de théorique :
// StepFun (seul fournisseur configuré en production) déclare `vision: null`,
// donc /api/agent/vision n'a aujourd'hui aucun modèle.
//
// J.A.R.V.I.S. répond déjà 503 avec un message explicite ; ce module applique
// la même règle aux routes agent.

/**
 * Traduit une erreur en réponse 503 explicite si — et seulement si — la cause
 * est l'absence de fournisseur. Retourne `null` sinon, pour que l'appelant
 * garde son traitement d'erreur habituel.
 */
export function aiUnavailableResponse(error: unknown): NextResponse | null {
  if (!(error instanceof NoProviderError)) return null;

  return NextResponse.json(
    {
      error: "Aucun modèle IA disponible",
      reason: "no_provider_configured",
      capability: error.capability,
      // Message destiné à être affiché tel quel : il dit ce qui manque et
      // comment le réparer, sans prétendre que le produit fonctionne.
      message:
        `Cette fonctionnalité a besoin d'un modèle IA capable de « ${error.capability} », ` +
        `et aucun n'est configuré. Rien n'est cassé — il manque une clé.`,
      remediation:
        "Ajoute une clé gratuite (par ex. GOOGLE_GENERATIVE_AI_API_KEY via aistudio.google.com/apikey) " +
        "dans .env.local en local, ou dans les variables d'environnement du déploiement.",
    },
    {
      status: 503,
      headers: { "X-AI-Configured": "false" },
    }
  );
}
