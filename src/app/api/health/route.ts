import { NextResponse } from "next/server";
import { providerStatus, hasAnyProvider } from "@/lib/ai-providers";
import { getCacheStats } from "@/lib/cache/smart-cache";
import { getSecurityHeaders } from "@/lib/security";
import { authenticateRequest } from "@/lib/auth-middleware";
import { isUserAdmin } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

// ==============================================================================
// HEALTH — sonde publique minimale + diagnostic authentifié
// ==============================================================================
//
// La version précédente exposait publiquement l'environnement, les fournisseurs
// IA actifs ET manquants, le projet Firebase, l'état du SDK Admin et la
// configuration du cache — une cartographie de l'infrastructure offerte à
// n'importe quel visiteur. La sonde publique se limite désormais au statut ;
// le détail exige un token valide.

export async function GET(request: Request) {
  const llmReady = hasAnyProvider();
  const firebaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
  );
  const status = llmReady && firebaseConfigured ? "ok" : "degraded";

  // Diagnostic détaillé : réservé aux administrateurs. Un simple compte
  // authentifié n'a pas à connaître la cartographie de l'infrastructure
  // (fournisseurs configurés, variables manquantes, état du SDK Admin).
  const auth = await authenticateRequest(request);
  if (auth.success && (await isUserAdmin(auth.user.uid))) {
    const providers = providerStatus();
    return NextResponse.json(
      {
        status,
        environnement: process.env.NODE_ENV,
        ia: {
          pret: llmReady,
          // En production sans provider, l'app doit refuser plutôt que servir
          // les réponses mock sur les visas et la fiscalité.
          risqueReponsesFictives: process.env.NODE_ENV === "production" && !llmReady,
          fournisseursActifs: providers.configured,
          fournisseursManquants: providers.missing,
          utilisePour: providers.activeFor,
        },
        firebase: {
          configure: firebaseConfigured,
          adminSdk: Boolean(
            process.env.FIREBASE_PRIVATE_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS
          ),
        },
        cache: getCacheStats(),
      },
      { headers: getSecurityHeaders() }
    );
  }

  // Sonde publique : statut seul, aucun détail d'infrastructure.
  return NextResponse.json({ status }, { headers: getSecurityHeaders() });
}
