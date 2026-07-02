# 🧭 État des lieux complet — Odyssey v11

**Date** : 2026-07-02
**Branche** : `claude/app-project-analysis-p6mtcq`
**Méthode** : audit code module par module + revue de sécurité + build/lint/audit réels + veille marché mi-2026

---

## 0. TL;DR — Où en es-tu vraiment ?

Tu as une **vitrine impressionnante mais un produit creux**. Le build passe (✅), le CI est vert, l'UI est soignée, JARVIS (le chat IA) marche réellement. **Mais dès qu'on gratte** : la plupart des pages n'envoient pas le token d'auth donc **toutes les écritures échouent**, les dashboards affichent des chiffres **hardcodés**, un tiers de `src/lib` est du **code mort**, il y a une **faille d'auth critique**, **zéro monétisation**, **zéro test**, **zéro onboarding branché**.

**Palier réel : prototype / démo avancée.** Pas encore un MVP utilisable par un vrai utilisateur payant.

**Verdict stratégique** : le marché 2026 récompense la **profondeur d'intégration et l'exécution réelle**, pas la largeur de features. Odyssey a 9 modules à moitié faits ; il en faut **1 ou 2 qui marchent vraiment de bout en bout**. La bonne stratégie n'est PAS d'ajouter des modules — c'est de **couper, réparer, et approfondir un vertical**.

---

## 1. Santé technique (mesuré aujourd'hui)

| Indicateur | Résultat | Note |
|---|---|---|
| `next build` | ✅ Passe | Prod déployable |
| `tsc --noEmit` | ✅ 0 erreur | Bon |
| ESLint | 🟠 34 erreurs / 36 warnings | À nettoyer (surtout `no-explicit-any`) |
| `npm audit` | 🟠 27 vulns (7 high, 0 critique) | `npm audit fix` à lancer |
| Tests | 🔴 0 | Aucun framework installé |
| CI GitHub Actions | ✅ Vert (tsc+lint+build) | Mais lint en `continue-on-error` |
| Dernière activité | ⚠️ 12 mai 2026 (~7 semaines) | Projet en pause |

**Note** : le README/CONTEXT parlent encore de « Claude Sonnet 4 » alors que le code a migré vers **StepFun** (Step-3 / Step-3.5 Flash via `@ai-sdk/openai-compatible`) avec **Gemini** en fallback. La doc ment sur la stack.

---

## 2. État réel par module

| Module | État | Ce qui marche | Ce qui est faux/cassé |
|---|---|---|---|
| **JARVIS (chat)** | ✅ Le plus abouti | Streaming réel, 5 personas, cache, rate-limit, mémoire+GraphRAG, i18n, anti-injection, token envoyé | Outils (resto, visa, calendar, invite) = **stubs texte**, désactivés sur StepFun |
| **Login / Auth** | ✅ Fonctionnel | Email/pass + Google + reset (Firebase réel) | Clés Firebase **hardcodées** en fallback ; vérif token non sécurisée (voir §3) |
| **Visa (SEO)** | ✅ Statique | 50 pages pays générées (SSG) + sitemap | Données 100 % en dur (`visa-countries.ts`), non éditables |
| **Briefing/Review/Checkin** | ✅ Backend seul | 3 routes Firestore réelles | **Aucune page UI ne les appelle** — endpoints orphelins |
| **Dashboard** | 🟠 Mock | API dashboard = vrai Firestore | Fetch client **sans token** → mode guest ; Score 742, axes, timeline **hardcodés** |
| **Simulator** | 🟠 Mock | Calcul fiscal client OK | 6 pays en dur ; save **sans token** → échoue toujours |
| **Predict (multi-agents)** | 🟠 Faux | Moteur tourne | Événements = **`Math.random()`**, aucun LLM ; historique « coming soon » |
| **Safe-Zone** | 🟠 Mock | GET posts = vrai Firestore | POST **sans token** → 401 ; stats & posts hardcodés ; modération = **`Math.random()`** |
| **Language Lab** | 🟠 Mock | SRS + profil = vrai Firestore ; token envoyé | Placement test, leçons, roleplay = **contenu statique**, pas d'IA |
| **Settings** | 🟠 Mock | Toggles = vrai Firestore | Profil « Jibril / EXECUTIVE » **hardcodé** ; bouton déconnexion **sans onClick** |
| **Skills** | 🔴 Cassé | GET = vrai Firestore | POST sans token + **mismatch d'action** (`complete_mission` ≠ `update_mission`) → progression cassée même connecté ; `USER_ID="test-user-id"` |
| **Onboarding** | 🔴 Mort | — | `OnboardingWizard` existe mais **jamais monté**, scripté, résultat « Lisbonne 85% » en dur |
| **Monétisation** | 🔴 Absente | — | Aucun Stripe/abonnement/paywall/email |

### Le bug transversal n°1
**Seules 2 pages sur ~10 envoient le token Firebase** (`jarvis`, `language`). Toutes les autres (`dashboard`, `simulator`, `safezone`, `skills`, `predict`) font des `fetch` nus → les GET tombent en mode invité et **tous les POST protégés renvoient 401**. C'est LA raison pour laquelle « rien ne se sauvegarde ».

---

## 3. Sécurité — findings classés

### 🔴 CRITIQUE
1. **Bypass d'auth total sans service account** (`src/lib/firebase-admin.ts:66-90`). Si `FIREBASE_PRIVATE_KEY` est absent, `verifyIdToken` **ne vérifie pas la signature** — il décode juste le JWT en base64 et regarde `exp`. Un attaquant forge `{"uid":"<victime>"}` et se fait passer pour n'importe qui. Le passage en « mode dev » est **silencieux**. → Refuser de démarrer en prod sans service account.
2. **IDOR non authentifié `/api/skills` GET** (`route.ts:17-30`) : `?userId=<victime>` **sans token** renvoie les données de progression de n'importe qui.
3. **Lecture publique de tous les profils** (`firestore.rules:8-14` : `allow read: if true`). Le profil contient l'**email** → fuite RGPD par énumération d'UID.

### 🟠 ÉLEVÉ
4. **Routes Agent 100 % ouvertes** (`/api/agent`, `/plan`, `/execute`, `/vision`) : aucune auth, aucun rate-limit, aucun filtre d'injection. N'importe qui brûle ton quota LLM (DoS financier). Deviendra critique dès qu'un vrai handler d'action est branché.
5. **IDOR en écriture** sur missions (`skills/route.ts:121`) et cartes langue (`language/route.ts:97`) : on modifie les données d'autrui via un id du body.
6. **Rate-limit en mémoire** (`ai-engine.ts:61`) : inefficace en serverless (instances froides), contournable, et appliqué au seul `/api/jarvis`.

### 🟡 MOYEN
7. Token invalide sur `/api/jarvis` → dégradé en « anonymous » au lieu d'être rejeté.
8. Routes serveur utilisent le **SDK client** Firebase, pas l'Admin SDK → sécurité déléguée aux seules règles Firestore + `try/catch` qui masquent les erreurs.
9. Anti-prompt-injection **non câblé** sur les routes agent.
10. Validation Zod **manquante** sur `/api/language` POST et les routes agent.
11. CSP permissive (`unsafe-inline`, `unsafe-eval`).

### 🟢 Points positifs sécurité
- Aucun `.env` commis, aucune clé serveur secrète (`sk-`, private key) en dur.
- `firestore.rules` corrects sur l'essentiel (audit_log immuable, écriture par propriétaire).
- Anti-injection + Zod bien faits là où ils sont câblés (jarvis, posts, simulator).

---

## 4. Dette technique

- **~1 700 lignes de code mort** dans `src/lib`, jamais importées :
  `vertex-ai.ts` (doublon de `ai-engine`), `gamification.ts`, `prediction-cards.ts`, `follow-up.ts`, `collaborative.ts`, `viral-engine.ts`, `onboarding-engine.ts`, `hooks.ts`, `indexeddb.ts` (doublon de `offline-db`), `offline.ts`.
- **Composants orphelins** : `OnboardingWizard.tsx`, tout `components/generated/` (maquettes Stitch).
- **Schéma Supabase orphelin** : `supabase/schema.sql` (Postgres complet) n'est **utilisé nulle part** — la vraie base est Firestore. Vestige à supprimer ou à assumer (voir §6).
- **Deux sources visa** non synchronisées : `visa-countries.ts` (50) vs `visa-data.ts` (5).
- Modèles Gemini `gemini-1.5-pro-latest` possiblement dépréciés.

---

## 5. Veille marché mi-2026 (pour situer le projet)

- **Les agents verticaux mangent le SaaS horizontal.** Marché agents IA ~**10,9 Md$ en 2026** (+45 % YoY). Le gagnant type : **profondeur d'intégration > profondeur de modèle** — « le modèle est un input commodité, l'intégration du workflow est le produit » (Harvey : 300 M$ ARR en légal).
- **L'exécution réelle passe par MCP.** Sabre+PayPal+MindTrip ont bâti un pipeline de réservation agentique en langage naturel (fév. 2026) ; Expedia, Booking, Trivago, Kiwi exposent des **serveurs MCP** ; ChatGPT Apps intègre Booking/Expedia. → Ton « Action Engine » à stubs est en retard sur ce standard.
- **Deel Mobility** (2026) a ouvert aux **individus** l'éligibilité visa **assistée par IA** + suivi temps réel — c'est un concurrent direct sérieux sur ton axe visa/mobilité.
- **Nomad List** : modèle **one-time ~99–299 $ à vie**, pas d'abonnement. Référence de pricing/communauté sur ce créneau.
- **Implication n°1** : un « Life OS » horizontal (9 modules) est le **mauvais pari** en 2026. Il faut un **vertical agentique** qui exécute réellement UNE chose de bout en bout, avec confiance et distribution.

---

## 6. Que faire — plan par vagues

### 🔴 VAGUE 0 — Réparer les fondations (1 semaine, non négociable)
1. **Boucher la faille d'auth C1** : en prod, rejeter tout token si pas de service account. Utiliser l'Admin SDK côté serveur.
2. **Câbler le token Firebase sur tous les `fetch`** (dashboard, simulator, safezone, skills, predict) — débloque toutes les écritures.
3. **Fixer les IDOR** (C2, E2, E3) : toujours `auth.user.uid`, jamais un id du body/query.
4. **Fermer `firestore.rules`** : profils lisibles seulement authentifié, ne jamais exposer l'email.
5. **Protéger les routes agent** : auth + rate-limit + anti-injection.
6. **Fixer le bug Skills** (`complete_mission`/`update_mission`).
7. `npm audit fix`, nettoyer les 34 erreurs ESLint.

### 🟠 VAGUE 1 — Faire un vrai MVP d'UN vertical (2-4 semaines)
**Choix recommandé : le vertical « Visa & Résidence fiscale agentique »** (c'est ton angle le plus différenciant et le plus monétisable, cf. Deel/Heavnn).
- Brancher **onboarding réel** (`OnboardingWizard` → route `/onboarding` → profil Firestore).
- Dashboard **alimenté par de vraies données** Firestore (supprimer les 742/axes/timeline hardcodés).
- **VisaTracker dynamique** (dates réelles de l'utilisateur, alertes 30/60/90 j) au lieu de `TH / 2024-03-01` en dur.
- Rendre **JARVIS utile** sur ce vertical : brancher pour de vrai `checkVisaRules` sur `visa-countries.ts` + calcul de jours de résidence fiscale.
- **Supprimer / geler** les modules non prioritaires (Predict aléatoire, Safe-Zone mock, Language mock) plutôt que de les laisser mentir.

### 🟢 VAGUE 2 — Monétisation + confiance (2-3 semaines)
- **Stripe** (abonnement + paywall) — aujourd'hui totalement absent. Envisager aussi un one-time façon Nomad List.
- **Emails transactionnels** (Resend/SendGrid) : bienvenue, alertes visa.
- **Tests** : au moins Vitest sur les moteurs (`simulation-engine`, `security`, auth) + un smoke Playwright sur login→dashboard.
- Push **FCM** pour les alertes visa (le vrai usage « proactif »).

### 🔵 VAGUE 3 — Innovation défendable (après un MVP qui marche)
- **Exécution réelle via MCP** (réservations, calendrier) — rattraper le standard 2026, remplacer les stubs.
- Distribution : exposer Odyssey comme **app ChatGPT / skill Claude** sur le vertical visa.

### Décision structurante à trancher (toi)
- **Base de données** : assumer **Firestore** et supprimer `supabase/schema.sql`, OU migrer vers Supabase (Postgres, RLS) — mais **pas les deux à moitié**. Recommandation : rester sur Firestore, c'est ce qui marche.
- **Scope** : accepter de **couper 5-6 modules** pour en faire 1 excellent. C'est le cœur de la stratégie 2026.

---

## 7. Ce qui te manque, en une liste

1. Token d'auth sur les pages → **écritures cassées**
2. Sécurité de vérification des tokens (faille critique)
3. Correction des IDOR + règles Firestore
4. Onboarding réellement branché
5. Dashboard sur données réelles
6. Monétisation (Stripe) — **inexistante**
7. Emails transactionnels + push FCM
8. Tests (aucun)
9. Modération réelle (pas `Math.random`)
10. Exécution d'actions réelle (MCP) au lieu de stubs
11. Suppression de ~1 700 lignes de code mort + doublons
12. Doc à jour (README ment sur la stack IA)
13. Un **focus vertical** au lieu de 9 demi-modules

---

*Rapport généré le 2026-07-02. Les constats code/sécurité sont vérifiés dans les fichiers cités ; les chiffres marché proviennent de recherches web datées (Deel, Nomad List, rapports agents verticaux 2026, MCP travel).*
