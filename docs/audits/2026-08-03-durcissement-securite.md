# Durcissement sécurité — 3 août 2026

Suite de l'audit du 2 août. Ce document décrit ce qui a été corrigé, **dans quel
ordre déployer**, et ce qui reste ouvert.

> Tous les changements sont dans le worktree, non commités, aux côtés des
> modifications préexistantes de jibril. Aucun `reset`, `stash` ni `add .`.

## Vérifications exécutées

| Porte | Résultat |
|---|---|
| `npm run typecheck` | ✅ 0 erreur |
| `npm run lint` | ✅ 0 erreur (2 warnings préexistants dans `scripts/generate-stitch-ui.js`) |
| `npm test` | ✅ 110 tests / 13 fichiers |
| `npm run build` | ✅ succès |

CI : `continue-on-error` retiré du job ESLint — le lint est désormais bloquant,
comme typecheck, tests et build.

## 1. Faille dominante — le serveur parlait à Firestore en SDK client

**C'était le vrai trou.** Neuf routes API (`posts`, `checkin`, `simulator`,
`dashboard`, `briefing`, `review`, `skills`, `language`, `simulation/predict`)
utilisaient le SDK **client** (`db` de `@/lib/firebase`). Côté serveur ce SDK
n'a aucun utilisateur connecté : chaque opération arrive dans les règles avec
`request.auth == null`. Or `firestore.rules` exige un propriétaire authentifié.

Les deux ne pouvaient pas être vrais en même temps :

- **règles déployées** → toutes les écritures/lectures serveur refusées, app cassée ;
- **règles non déployées** → la base est joignable directement avec la config web
  publique (présente dans le bundle JS), et tous les `authenticateRequest()`
  des routes ne protégeaient plus rien.

**Correction** : les routes passent par l'Admin SDK via un accès serveur unique,
[`serverDb()`](../../src/lib/firestore-server.ts). L'Admin SDK contourne les
règles — le contrôle d'accès y est explicite : token vérifié + filtrage par uid
dans la route. Cela permet enfin de déployer des règles strictes qui, elles,
ferment l'accès client direct.

**Aucun nouveau secret requis** : `verifyIdToken` échoue déjà fermé sans
`FIREBASE_PRIVATE_KEY`. Si l'authentification fonctionne en production, les
credentials Admin sont donc déjà en place.

Garde-fou : [`server-firestore.test.ts`](../../src/lib/__tests__/server-firestore.test.ts)
fait échouer le build si le SDK client réapparaît dans une route API.

## 2. Ordre de déploiement — important

L'ordre compte, parce que code et règles doivent être cohérents :

1. **Vérifier** que `FIREBASE_PRIVATE_KEY` et `FIREBASE_CLIENT_EMAIL` sont bien
   présents dans l'environnement de production. Sans eux, `verifyIdToken`
   refuse tout (fail-closed) *et* `serverDb()` ne peut pas fonctionner.
2. **Déployer le code** (routes migrées vers l'Admin SDK).
3. **Vérifier** qu'une route lisante répond (ex. `/api/dashboard` connecté).
4. **Puis seulement** déployer les règles : `firebase deploy --only firestore:rules`.

Rollback : redéployer les règles précédentes (`git show HEAD:firestore.rules`)
puis la version de code antérieure. Les deux doivent revenir ensemble.

## 3. Failles corrigées

| # | Faille | Correction |
|---|---|---|
| A | Injection de rôle `system` dans J.A.R.V.I.S. | `ChatMessageSchema` n'accepte plus que `user`/`assistant` ; le prompt système est construit côté serveur uniquement. Tests d'injection multi-message. |
| B | Reçus d'actions globaux inter-utilisateurs | `userId` obligatoire sur chaque reçu ; `storeReceipt` refuse un reçu sans propriétaire ; toute lecture filtrée par uid vérifié. Tests Alice/Bob. |
| C | Règles Firestore permissives | Helpers `isSignedIn`/`ownsExisting`/`createsAsSelf`/`userIdImmutable` ; `user_id` et `author_id` immuables ; `author_id` imposé à la création ; `audit_log` append-only auto-attribué ; champ `role` non modifiable par son propriétaire ; refus par défaut `match /{document=**}`. |
| D | Fallback JWT de dev non vérifié | Fail-closed partout, sauf opt-in explicite `ALLOW_DEV_UNVERIFIED_TOKENS=true` **et** hors production. |
| E | `/api/health` bavard | Sonde publique réduite à `{status}` ; diagnostic détaillé réservé aux **administrateurs** (`isUserAdmin`). |
| F | `GET /api/jarvis` exposait la config | Stats de cache et clés API configurées retirées de la réponse publique. |
| G | Manifeste d'outils public | `GET /api/agent/plan` exige désormais un token. |
| H | CSP / Permissions-Policy | `unsafe-eval` limité au dev (le bundle de prod n'en a pas besoin) ; `microphone=(self)` — il était bloqué alors que J.A.R.V.I.S. propose la voix. |
| I | IDOR en écriture sur `/api/language` | `complete_review` vérifie la propriété de la carte avant d'écrire (même correctif que `skills`/`update_mission`, qui l'avait déjà). |
| J | Serveur en SDK client | Voir §1. |
| K | Rate limit non durable | Compteur partagé Firestore (transactionnel) branché sur les routes IA payantes, le bucket mémoire restant en pré-filtre local. Voir §4. |
| L | **Modération contournable** | Le client pouvait écrire dans `posts` en posant lui-même `is_verified: true` — la modération de `/api/posts` était décorative sur un fil **public**. `posts` est désormais fermé en écriture côté client (Admin SDK uniquement) ; `hooks.ts:createPost` passe par l'API. |
| M | Auth Emulator inutilisable | Le garde fail-closed refusait aussi le chemin Firebase Auth Emulator, rendant l'app intestable en local. `verifyIdToken` accepte maintenant l'emulator (hors production), qui valide réellement les tokens. |
| N | **Simulations présentées comme réelles** | `google_calendar_schedule` renvoyait `status: "confirmed"` + un `eventId` sans toucher d'agenda ; `book_restaurant` répondait « Réservation confirmée via TheFork » là où le code disait `TODO: Implement`. Voir §7. |
| P | **Modèle codé en dur dans `ai-service.ts`** | `google('gemini-1.5-pro-latest')` court-circuitait la chaîne de failover : avec une clé Groq/Cerebras/Mistral/StepFun, la génération de plan échouait quand même. **C'était le cas en production**, où seul StepFun est configuré — `/api/agent/plan` y échouait systématiquement. Branché sur `withProviderFailover`. |
| Q | Clé manquante signalée comme panne | Les routes `/api/agent/*` renvoyaient 500 « Internal Agent Error » aussi bien pour un plantage que pour une configuration absente. Nouvelle `NoProviderError` → **503 actionnable** (« rien n'est cassé, il manque une clé »). Cas réel : StepFun déclare `vision: null`, donc `/api/agent/vision` n'a aucun modèle en prod. |
| O | Registre d'outils incohérent | `/api/agent`, qui **exécute** les outils, n'enregistrait pas les outils restaurant : le modèle pouvait choisir `book_restaurant` et recevoir « tool not found », alors que `/api/agent/plan` le listait comme disponible. Registre centralisé dans `lib/tools/registry.ts`. |

## 7. Une simulation ne se présente jamais comme une action réelle

C'est le défaut le plus grave d'un moteur d'actions : pas un plantage, une
**croyance fausse**. Quelqu'un se serait présenté au restaurant.

Ce qui a changé :

- nouveau statut **`simulated`**, distinct de `completed` — la différence est
  visible dans le reçu, dans la réponse API et dans le message affiché ;
- `ToolDefinition.simulated` est **obligatoire** : ajouter un outil force à
  répondre à la question. Un oubli ne compile pas ;
- un outil à double mode (`search_restaurants` : réel avec
  `GOOGLE_PLACES_API_KEY`, inventé sinon) signale la simulation **à
  l'exécution**, pas seulement dans sa déclaration ;
- `book_restaurant` **échoue** désormais si `THEFORK_API_KEY` est posée, au lieu
  de feindre une réservation que l'intégration inexistante n'a jamais faite ;
- le manifeste expose `simulated` au modèle, et le prompt système lui interdit
  d'annoncer une action faite pour un outil simulé ;
- les données d'exemple (vols, restaurants) portent `simulation: true` et un
  message explicite — sur une app de conseil au départ, faire décider quelqu'un
  sur des prix fabriqués n'est pas acceptable.

Vérifié par exécution : `status: simulated`, `simulated: true`,
`⚠️ Simulation — aucune action réelle n'a été effectuée`.

## 4. Rate limiting — ce qui a été fait et l'arbitrage retenu

Le token bucket mémoire est un compteur **par instance** : en serverless il
diffère d'une lambda à l'autre et repart à zéro à chaque démarrage à froid.

Deux étages désormais :

1. **Bucket mémoire** (inchangé, toutes les routes) — gratuit, absorbe les
   rafales d'une même instance sans toucher Firestore ;
2. **Compteur partagé Firestore** ([`rate-limit-durable.ts`](../../src/lib/rate-limit-durable.ts)),
   transactionnel, **uniquement sur les routes qui déclenchent un appel LLM
   payant** : `/api/agent`, `/api/agent/plan`, `/api/agent/execute`,
   `/api/agent/vision`, `/api/jarvis`.

**Pourquoi pas partout** : un write Firestore par requête sur les 15 routes
coûterait plus cher que l'abus qu'il éviterait. Sur une route qui déclenche un
appel LLM, le rapport s'inverse.

**Posture en cas de panne : fail-open.** Si Firestore est injoignable, la
requête passe et l'incident est loggué (`degraded: true`). Un limiteur en panne
ne doit pas faire tomber le produit. **C'est un arbitrage disponibilité >
protection de coût — à rebasculer en fail-closed si l'abus devient réel.**

Détails : un refus n'écrit pas (inutile de payer un write pour dire non), les
clés sont hachées en SHA-256 avant de servir d'id de document, et chaque bucket
porte `expires_at` — pense à activer la **politique TTL Firestore** sur ce champ
pour la collection `rate_limits`, sinon les documents s'accumulent.

## 5. Vérification par exécution réelle (4 août)

Tout ce qui précède avait été vérifié **statiquement** (typecheck, lint, tests,
build). L'application n'avait jamais tourné. Elle a depuis été exécutée contre
Firestore + Auth Emulator, avec deux vrais comptes.

| Scénario | Résultat |
|---|---|
| Alice écrit un check-in, le relit | ✅ |
| **Bob lit les check-ins → 0 résultat** | ✅ isolation réelle |
| Sans token | ✅ 401 |
| Token forgé (signature bidon) | ✅ 401 |
| `user_id` usurpé dans le body | ✅ l'uid enregistré est celui du token |
| Rôle `system` injecté dans J.A.R.V.I.S. | ✅ 400 validation |
| Bob écrase la carte de révision d'Alice | ✅ 403 `Accès refusé` |
| Reçus d'actions : Alice 1, **Bob 0** | ✅ |
| Action à effet de bord non confirmée | ✅ 403 |
| 25 requêtes sur route IA (limite 20) | ✅ 20 × 200 puis 5 × 429 |
| Bucket `rate_limits` écrit | ✅ clé hachée + `expires_at` |
| En-têtes de sécurité | ✅ CSP, HSTS, `microphone=(self)` |
| Interface | ✅ rendu correct, zéro erreur console |

Cette campagne a révélé la faille **L** (modération contournable), invisible à
tout contrôle statique : le code était correct, les types justes, les tests
verts — seule l'exécution d'une écriture client réelle l'a montrée.

## 6. Ce qui reste ouvert

À traiter avant une bêta publique payante :

- **Sync offline non implémentée.** `addToSyncQueue` empile dans IndexedDB, mais
  aucun processeur ne rejoue la file vers Firestore. Un post écrit hors-ligne
  n'est jamais publié. Depuis la fermeture de `posts` en écriture client, la
  reprise devra obligatoirement passer par `/api/posts`.
- **Code mort dans `hooks.ts`** : `useFirestore` n'a aucun appelant ;
  `saveSimulation` non plus. Non supprimés volontairement — `saveSimulation`
  est exposé par un hook utilisé, le retirer change une API publique.
- **`saveSimulation` contourne la validation Zod** : il écrit dans Firestore
  sans passer par `CreateSimulationSchema` de `/api/simulator`. Pas un problème
  de sécurité (données de l'utilisateur lui-même), mais d'intégrité.
- **`/api/agent/vision` n'a aucun provider en production** : StepFun déclare
  `vision: null`. C'est ce que la clé Gemini débloquerait.
- **11 vulnérabilités npm transitives** (`@google-cloud`, `grpc-js`) non
  corrigeables sans `--force`, qui casserait `firebase-admin`. Next.js, lui, est
  corrigé (16.2.12).
- ~~Tests Firebase Emulator~~ → **fait** : 15 scénarios d'autorisation réels. Les tests de règles actuels sont des gardes
  textuels : ils empêchent une régression d'écriture des règles, mais ne
  rejouent pas de vrais scénarios d'autorisation (non authentifié / propriétaire
  / autre utilisateur / spoofing / transfert de propriété).
- **Persistance des reçus d'actions.** Le store reste en mémoire : les reçus
  disparaissent au redémarrage et diffèrent entre instances. Il manque aussi
  `idempotencyKey` et la propriété du plan.
- **Outils simulés.** `google_calendar_schedule` et `skyscanner_flight_search`
  retournent un succès simulé. Un outil simulé ne doit jamais présenter un
  statut laissant croire qu'une action externe a réussi — à clarifier dans
  l'UI avant toute exposition publique.
- **`npm audit`** n'a pas été exécuté (envoi de métadonnées vers un service
  tiers non autorisé dans cette session). Aucune conclusion sur les CVE.
