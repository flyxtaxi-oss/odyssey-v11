# 📚 Inventaire complet — Odyssey v11 (tout ce que l'app fait, tout ce qui est codé)

**Date** : 2026-07-02 · **But** : référence factuelle de A à Z. Chaque fichier, chaque route, ce que ça fait, et si c'est réel ou mock.

Légende : ✅ réel/fonctionnel · 🟠 partiel ou mock · 🔴 mort/cassé

---

## 1. Vue d'ensemble

- **Type** : application web **Next.js 16** (App Router) + **React 19** + **TypeScript** + **Tailwind 4**.
- **Rôle** : « Life OS » IA pour expatriés/nomades — assistant JARVIS, simulateur fiscal, tracker visa, communauté, langues, skills.
- **Base de données réelle** : **Firebase** (Auth + Firestore). *(Le fichier `supabase/schema.sql` existe mais n'est branché nulle part.)*
- **IA** : Vercel **AI SDK v6** → **StepFun** (Step-3 / Step-3.5 Flash) en primaire, **Google Gemini** en fallback.
- **Hébergement** : Vercel.
- **Taille** : ~80 fichiers TS/TSX, ~13 500 lignes. 11 pages, 14 routes API, 30 fichiers `lib`, 8 composants.

---

## 2. Les pages (ce que voit l'utilisateur) — 11 écrans

| URL | Fichier | Rôle | État |
|---|---|---|---|
| `/` | `app/page.tsx` (404 l.) | **Dashboard** : Odyssey Score, 5 axes de perf, timeline d'activité, bento-grid | 🟠 chiffres hardcodés (Score 742), fetch sans token |
| `/login` | `app/login/page.tsx` (248 l.) | Connexion/inscription email+mot de passe, Google, reset | ✅ réel (Firebase) |
| `/jarvis` | `app/jarvis/page.tsx` (349 l.) | **Chat IA** streaming, choix de persona | ✅ réel (envoie le token) |
| `/simulator` | `app/simulator/page.tsx` (326 l.) | **Comparateur fiscal** multi-pays | 🟠 6 pays en dur, sauvegarde cassée (sans token) |
| `/simulator/predict` | `app/simulator/predict/page.tsx` (612 l.) | **Simulation multi-agents** d'une trajectoire de vie | 🟠 moteur = `Math.random()`, pas d'IA |
| `/safezone` | `app/safezone/page.tsx` (338 l.) | **Réseau social** vérifié (posts, likes) | 🟠 stats & posts fallback en dur, post sans token → 401 |
| `/language` | `app/language/page.tsx` (425 l.) | **Language Lab** : flashcards SRS, leçons, roleplay | 🟠 SRS réel ; leçons/test/roleplay statiques |
| `/skills` | `app/skills/page.tsx` (325 l.) | **Skill Tree** : tracks, missions, XP, niveaux | 🔴 bug d'action → progression cassée |
| `/settings` | `app/settings/page.tsx` (279 l.) | Réglages (toggles, langue, thème) | 🟠 toggles réels ; profil en dur ; déconnexion sans onClick |
| `/visa` | `app/visa/page.tsx` (35 l.) | Index visa | ✅ statique |
| `/visa/[pays]` | `app/visa/[country]/page.tsx` (176 l.) | **50 pages pays** SEO (Portugal, Espagne…) | ✅ statique (SSG), données en dur |

**Layout global** : `app/layout.tsx` (thème, SEO, Schema.org, sidebar). Navigation : `components/Sidebar.tsx`. Pages système : `not-found.tsx`, `manifest.ts`, `robots.ts`, `sitemap.ts`, `icon.tsx`, `apple-icon.tsx`.

---

## 3. Les routes API (le back-end) — 14 endpoints

| Route | Fichier | Ce qu'elle fait | Auth | État |
|---|---|---|---|---|
| `/api/jarvis` | `jarvis/route.ts` (386 l.) | Chat IA streaming, 5 personas, cache, mémoire, anti-injection | 🟠 manuelle (fallback anonyme) | ✅ le plus abouti |
| `/api/agent` | `agent/route.ts` | Plan d'action IA (Gemini) | ❌ aucune | 🟠 ouvert |
| `/api/agent/plan` | `agent/plan/route.ts` | Génère un plan structuré | ❌ aucune | 🟠 |
| `/api/agent/execute` | `agent/execute/route.ts` | Exécute un outil (avec confirmation) | ❌ aucune | 🟠 handlers simulés |
| `/api/agent/vision` | `agent/vision/route.ts` | Analyse d'image (Gemini vision) | ❌ aucune | 🟠 |
| `/api/dashboard` | `dashboard/route.ts` | Agrège profil + simulations + posts | 🟡 optionnelle | ✅ backend réel |
| `/api/simulator` | `simulator/route.ts` | Sauvegarde/liste simulations | GET non / POST oui | ✅ backend réel |
| `/api/simulation/predict` | `simulation/predict/route.ts` (213 l.) | Lance le moteur multi-agents | 🟡 optionnelle | 🟠 aléatoire |
| `/api/posts` | `posts/route.ts` (188 l.) | Safe-Zone : lire/créer posts + modération | GET public / POST oui | 🟠 modération `Math.random` |
| `/api/language` | `language/route.ts` (148 l.) | SRS, profil, leçons, roleplay | ✅ oui | 🟠 contenu statique |
| `/api/skills` | `skills/route.ts` (166 l.) | Tracks & missions, XP | GET via `?userId` / POST oui | 🔴 IDOR + bug d'action |
| `/api/checkin` | `checkin/route.ts` | Check-ins quotidiens | ✅ oui | ✅ réel |
| `/api/briefing` | `briefing/route.ts` (133 l.) | Briefing du jour (agrège Firestore) | ✅ oui | ✅ réel mais **aucune page ne l'appelle** |
| `/api/review` | `review/route.ts` (151 l.) | Revue hebdo | ✅ oui | ✅ réel mais **aucune page ne l'appelle** |

---

## 4. Les moteurs (`src/lib`) — le cerveau

### ✅ Réellement utilisés
| Fichier | Rôle |
|---|---|
| `ai-engine.ts` (290 l.) | Routing de modèle, **cache LRU**, **rate-limiting** token-bucket, mémoire conversationnelle, suivi de coût |
| `graph-rag.ts` (333 l.) | Extraction d'entités par **regex** + mini graphe de connaissances (pas de vrais embeddings) |
| `simulation-engine.ts` (567 l.) | Moteur multi-agents (événements de vie) — **algorithmique/aléatoire**, sans LLM |
| `action-engine.ts` (286 l.) | Registre d'outils + exécution + receipts — **handlers simulés** (calendar, vols) |
| `tools/restaurants.ts` (308 l.) | Recherche resto : **vrai** Google Places + fallback mock |
| `firebase.ts` (207 l.) | Client Firebase + constantes `COLLECTIONS` |
| `firebase-admin.ts` (117 l.) | Admin SDK + `verifyIdToken` (⚠️ faille si pas de clé) |
| `auth-middleware.ts` (121 l.) | `authenticateRequest` / `optionalAuth` |
| `security.ts` (172 l.) | Anti-prompt-injection (25+ patterns), sanitisation, audit log, headers |
| `validation.ts` (172 l.) | Schémas **Zod** de toutes les routes |
| `i18n.ts` (461 l.) | Traductions **FR / EN / NL** + détection de langue |
| `notification-engine.ts` (47 l.) | Notifications **navigateur locales** (pas de push serveur) |
| `offline-db.ts` (296 l.) | Stockage **IndexedDB** + file d'attente offline |
| `jarvis/ai-service.ts`, `cache/smart-cache.ts`, `visa-countries.ts` (50 pays), `visa-data.ts` (5 pays), `utils.ts` | Support |

### 🔴 Code mort (jamais importé — ~1 700 lignes)
`vertex-ai.ts` (doublon d'ai-engine), `gamification.ts`, `prediction-cards.ts`, `follow-up.ts`, `collaborative.ts`, `viral-engine.ts`, `onboarding-engine.ts`, `hooks.ts`, `indexeddb.ts` (doublon d'offline-db), `offline.ts`.

---

## 5. Les composants (`src/components`) — 8

| Composant | Rôle | État |
|---|---|---|
| `Sidebar.tsx` (268 l.) | Navigation latérale | ✅ |
| `CommandCenter.tsx` (144 l.) | Barre de commande ⌘K → `/api/agent` | ✅ |
| `Toast.tsx` (92 l.) | Notifications UI | ✅ |
| `VisaTracker.tsx` (83 l.) | Compte à rebours visa | 🟠 dates en dur (TH / 2024-03-01) |
| `ThemeProvider` / `ThemeToggle` | Thème clair/sombre | ✅ |
| `ServiceWorker.tsx` | Enregistre le SW (PWA) | ✅ |
| `OnboardingWizard.tsx` (187 l.) | Assistant d'accueil | 🔴 **jamais monté**, scripté, résultat en dur |
| `components/generated/` | Maquettes Stitch (HTML/JSON/PNG) | 🔴 non intégré |

---

## 6. JARVIS en détail (le cœur du produit)

- **5 personas** avec prompts complets : **Sage** (mentor philosophe), **Stratège** (fiscalité/visas, data-driven), **Coach** (peak performance), **Exécuteur** (GTD/Deep Work), **Ami** (confident).
- **Streaming** temps réel, **cache** de réponses (30 min), **rate-limit** (20 req/min), **mémoire** + GraphRAG, **i18n** auto (FR/EN/NL), **anti-injection**.
- **Outils déclarés** (mais **stubs** renvoyant du texte simulé, désactivés sur StepFun) : `bookRestaurant`, `checkVisaRules`, `createCalendarEvent`, `generateInvite`.

---

## 7. Données (Firestore) — 14 collections

`profiles`, `simulations`, `posts`, `conversations`, `skill_tracks`, `skill_missions`, `language_profiles`, `language_progress`, `language_lessons`, `checkins`, `matches`, `badges`, `audit_log`.
Règles : `firestore.rules` · Index : `firestore.indexes.json` (7 index composites déployés).

*(`supabase/schema.sql` définit 20 tables Postgres — **non utilisé**, vestige d'une ancienne architecture.)*

---

## 8. Sécurité & infra

- **Middleware** (`middleware.ts`) : headers CSP, HSTS, XSS.
- **CI** : `.github/workflows/ci.yml` (tsc + eslint + build, sur `main`).
- **PWA** : `public/sw.js`, `manifest.ts`.
- **SEO** : sitemap (60+ URLs), robots (bloque GPTBot/CCBot), Schema.org, hreflang FR.

---

## 9. Ce qui N'EXISTE PAS (pour être exhaustif)

- ❌ **Paiement / abonnement** (aucun Stripe, aucun paywall).
- ❌ **Emails transactionnels** (seuls les emails Firebase Auth existent).
- ❌ **Push serveur / FCM** (uniquement notifications navigateur locales).
- ❌ **Tests** (aucun fichier, aucun framework).
- ❌ **Onboarding branché** (le wizard existe mais n'est monté nulle part).
- ❌ **Exécution d'actions réelle** (calendar, vols, resto = simulés).

---

## 10. Récapitulatif en une phrase

Odyssey = un **front Next.js soigné à 11 écrans** posé sur un **back Firebase à 14 endpoints**, dont **JARVIS marche vraiment**, la **moitié des modules sont des maquettes fonctionnelles à données mock**, **un tiers de la logique `lib` est du code mort**, et **il manque paiement, tests, emails, onboarding et l'exécution réelle**.

*Pour l'analyse critique, la sécurité détaillée et la stratégie, voir `docs/ETAT_DES_LIEUX_2026-07.md`.*
