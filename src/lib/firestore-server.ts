// ==============================================================================
// FIRESTORE SERVEUR — accès Firestore depuis les routes API
// ==============================================================================
//
// Pourquoi ce module existe.
//
// Les routes API parlaient à Firestore via le SDK **client** (`db` de
// `@/lib/firebase`). Côté serveur ce SDK n'a aucun utilisateur connecté :
// toute opération arrive avec `request.auth == null` dans les règles.
// Or `firestore.rules` refuse par défaut et exige un propriétaire authentifié.
// Les deux ne peuvent pas être vrais en même temps :
//
//   • règles déployées   → chaque lecture/écriture serveur est refusée ;
//   • règles non déployées → la base est joignable directement avec la
//     configuration web publique, et tous les `authenticateRequest()` des
//     routes ne protègent plus rien.
//
// L'Admin SDK règle les deux : il contourne les règles (le contrôle d'accès
// devient explicitement `authenticateRequest()` + filtrage par uid dans la
// route), ce qui permet de déployer des règles strictes qui, elles, ferment
// l'accès client direct.
//
// Aucun nouveau secret requis : `verifyIdToken` échoue déjà fermé sans
// FIREBASE_PRIVATE_KEY, donc si l'authentification fonctionne en production,
// les credentials Admin sont déjà présents.
//
// L'import est paresseux pour que charger ce module (depuis un test, ou un
// graphe de dépendances client) n'exige pas les credentials Admin et ne fasse
// pas exploser l'initialisation hors d'un try/catch de route.

import type { Firestore } from "firebase-admin/firestore";

export async function serverDb(): Promise<Firestore> {
  const { adminDb } = await import("./firebase-admin");
  return adminDb;
}
