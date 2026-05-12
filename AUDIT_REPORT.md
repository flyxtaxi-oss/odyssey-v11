# 🔍 AUDIT COMPLET — Odyssey v11

**Date** : 2026-05-10 (MIS À JOUR avec accès Vercel + Firebase)
**Auditeur** : Claude Code (Opus 4.7)
**Scope** : Code local + GitHub + Vercel + Firebase + sécurité + qualité

## 🚨 ALERTE PROD — Ton site est CASSÉ en production

Dernier déploiement Vercel : **ÉTAT = ERROR**.
URL morte : `odyssey-gbgbybf7x-zianes-projects-19410ea7.vercel.app`

**CAUSE EXACTE** : `src/app/not-found.tsx` utilise `framer-motion` mais n'a pas la directive `"use client"`. Lors du prerender de `/jarvis`, Next.js essaie d'invoquer un Client Component depuis le serveur → crash.

**Erreur build** :
```
Error: Attempted to call createMotionComponent() from the server but createMotionComponent is on the client.
Export encountered an error on /jarvis/page: /jarvis, exiting the build.
```

**FIX en 1 ligne** : ajouter `"use client";` en haut de [src/app/not-found.tsx](src/app/not-found.tsx).

---

## 📊 Résumé exécutif

| Domaine | Statut | Notes |
|---|---|---|
| Build production | 🔴 **CASSÉ** | TypeScript bloque le build |
| Sécurité | 🟠 **MOYEN** | Clés Firebase hardcodées, 23 vulns npm (1 critique) |
| Code quality | 🟠 **À nettoyer** | 61 erreurs ESLint, 64 warnings, 16 erreurs TS |
| Dépendances | 🟡 **Outdated** | 14 paquets en retard, plusieurs majors |
| GitHub | 🟢 **OK** | Repo public, pas de PR, pas de CI |
| Vercel | ⚪ **Inaccessible** | Token Vercel n'a plus accès au scope (403) |
| Firebase | 🟢 **OK** | Règles Firestore correctes |
| Architecture | 🟢 **OK** | Stack Next.js 16 + Firebase + AI SDK propre |

**Verdict** : ton app **ne peut pas être déployée en l'état** à cause d'erreurs TypeScript bloquantes. Une fois corrigées (~30 min), le reste est cosmétique sauf la vuln npm critique.

---

## 🔴 1. BLOQUEURS — À fixer en priorité absolue

### 1.1 Le build de production échoue

```
./src/app/api/agent/route.ts:48:31
Type error: Expected 2-3 arguments, but got 1.
```

**Cause** : `z.record(z.any())` — Zod v4 exige maintenant 2 arguments (`z.record(keySchema, valueSchema)`).

**Fix** : remplacer par `z.record(z.string(), z.any())` dans [src/app/api/agent/route.ts:48](src/app/api/agent/route.ts#L48).

### 1.2 16 autres erreurs TypeScript

- [src/app/api/jarvis/route.ts:71](src/app/api/jarvis/route.ts#L71) `tool({ ... execute: ... })` — l'API a changé dans `ai` v6. Le type `execute` est `undefined` → la signature `tool()` actuelle attend un autre format. À refactor selon la doc AI SDK 6.
- [src/app/api/jarvis/route.ts:267,298](src/app/api/jarvis/route.ts#L267) `maxSteps` n'existe plus dans `streamText()` v6 → utiliser `stopWhen: stepCountIs(N)` à la place.
- [src/app/visa/page.tsx:32](src/app/visa/page.tsx#L32) `<VisaTracker />` appelé sans les props requises `countryCode` et `entryDate`.

### 1.3 Vulnérabilité npm critique

```
protobufjs <7.5.5 — Arbitrary code execution (CRITICAL)
GHSA-xq3m-2v4x-88gg
```

Vient de `firebase-admin`. **Fix** : `npm audit fix` (compatible).

**Total** : 23 vulns (1 critique, 6 high, 8 moderate, 8 low).

---

## 🟠 2. SÉCURITÉ — Important

### 2.1 Clés Firebase hardcodées en fallback

[src/lib/firebase.ts:38-44](src/lib/firebase.ts#L38) contient les vraies clés du projet `jarvis-53b7c` en dur :

```ts
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDXch5wQxmCzJJ8MttAly0fD_Ej09iUu8o",
projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "jarvis-53b7c",
// ...
```

**Bonne nouvelle** : ces clés sont `NEXT_PUBLIC_*` donc côté client de toute façon — c'est pas un secret.
**Mauvaise nouvelle** : le repo est **public** sur GitHub. Si quelqu'un compromet ta config Firebase Auth (domaines autorisés mal réglés), c'est exploitable.

**Action** :
1. Vérifier dans Firebase Console → Authentication → Settings → **Authorized domains** que seuls tes domaines (vercel + custom) sont listés.
2. Vérifier App Check est activé sur Firestore.
3. Retirer les fallbacks hardcodés — fais planter explicitement si la var manque.

### 2.2 `firebase-debug.log` (847 KB)

Pas commité (vérifié), mais traîne dans le repo. À ajouter au `.gitignore` si pas déjà.

### 2.3 `.env.local` propre

✅ Aucun secret en clair — uniquement `VERCEL_OIDC_TOKEN` (normal, généré par `vercel pull`).

### 2.4 Règles Firestore

✅ Solides : par-utilisateur, audit_log no-update/delete, profils en lecture publique (intentionnel ?).

### 2.6 Firestore Indexes manquants

Tu as **0 index Firestore déployé** sur le projet `jarvis-53b7c`. Toutes tes queries avec `where + orderBy` vont planter en prod avec une erreur "The query requires an index". Le fichier `firestore.indexes.json` est vide — à compléter selon les queries de ton code.

### 2.7 Projets Firebase visibles

Tu as 3 projets Firebase :
- `jarvis-53b7c` ← **utilisé par cette app** (current)
- `quantyx-flow`
- `taxi-74b49`

Aucune Cloud Function active. Hosting Firebase configuré (jarvis-53b7c.web.app) mais probablement inutilisé puisque tu déploies sur Vercel.

### 2.5 Skill `security-review` recommandé

Tu as la skill `security-review` installée. Lance-la avec `/security-review` pour un check approfondi des changements en cours.

---

## 🟡 3. CODE QUALITY

### 3.1 ESLint — 125 problèmes

| Type | Nombre |
|---|---|
| Erreurs | 61 |
| Warnings | 64 |

**Plus gros offenders** :
- `@typescript-eslint/no-explicit-any` : ~20 occurrences (cache, hooks, indexeddb, restaurants, etc.)
- `react/no-unescaped-entities` : apostrophes non échappées dans plusieurs pages (.tsx)
- `react-hooks/set-state-in-effect` : [src/lib/follow-up.ts:96](src/lib/follow-up.ts#L96) — vrai bug de performance
- `react-hooks/immutability` : [src/components/ChatInterface.tsx:43](src/components/ChatInterface.tsx#L43)
- ~20 imports/variables non utilisés (gamification, graph-rag, sidebar, firebase, etc.)

**Fix rapide** : `npx eslint . --fix` règle les apostrophes et imports auto. Le reste demande une vraie revue.

### 3.2 Code mort

- [src/components/Sidebar.tsx:8](src/components/Sidebar.tsx#L8) `useEffect` importé mais jamais utilisé
- [src/lib/firebase.ts:29-31](src/lib/firebase.ts#L29) `where`, `orderBy`, `limit` importés inutilement
- [src/lib/gamification.ts](src/lib/gamification.ts) `setUsers`, `period`, `useMemo` morts
- [src/lib/graph-rag.ts:54](src/lib/graph-rag.ts#L54) `ENTITY_PATTERNS` jamais référencé

### 3.3 Bug perf réel

[src/lib/follow-up.ts:96](src/lib/follow-up.ts#L96) — `setState` synchrone dans un `useEffect` → cascading renders.

### 3.4 Code vs API moderne

L'app utilise `ai` v6 mais code écrit pour v3/v4 (`maxSteps`, ancienne signature `tool`). Migration partielle non finie.

---

## 🟡 4. DÉPENDANCES

### Paquets très en retard

| Paquet | Current | Latest | Note |
|---|---|---|---|
| `lucide-react` | 0.575.0 | 1.14.0 | Major bump |
| `@types/node` | 20 | 25 | Optionnel |
| `@ai-sdk/anthropic` | 3.0.47 | 3.0.76 | Mineur, à faire |
| `@ai-sdk/google` | 3.0.31 | 3.0.71 | Mineur |
| `@ai-sdk/react` | 3.0.107 | 3.0.179 | Mineur |
| `ai` | 6.0.105 | 6.0.177 | Mineur |
| `firebase` | 12.11.0 | 12.13.0 | Patch |
| `firebase-admin` | 13.7.0 | 13.9.0 | **Patch + fix vuln critique** |
| `framer-motion` | 12.34.3 | 12.38.0 | Patch |

### `@mlc-ai/web-llm` ajouté inutilement

Tu viens d'ajouter `@mlc-ai/web-llm@^0.2.82` mais **aucun fichier ne l'importe**. Cette lib pèse plusieurs MB et embarque WebGPU/WASM. À retirer ou à brancher.

### `next.config.ts` quasi vide

```ts
const nextConfig: NextConfig = { /* config options here */ };
```
Tu as un warning de build : "The middleware file convention is deprecated. Please use proxy instead." — à migrer.

---

## 🟢 5. ARCHITECTURE

### Stack

- **Framework** : Next.js 16.1.6 (Turbopack), React 19.2
- **Backend** : Firebase (Auth + Firestore) + Firebase Admin
- **AI** : Vercel AI SDK 6, Anthropic + Google providers
- **UI** : Tailwind 4, Framer Motion, Lucide
- **Validation** : Zod 4
- **Charts** : Recharts 3

### Structure

- 67 fichiers TS/TSX dans `src/`
- 14 routes API (jarvis, agent, posts, simulator, dashboard, briefing, etc.)
- 10 pages (settings, safezone, language, visa, simulator, jarvis, skills, login + index)
- Lib bien découpée : `lib/cache`, `lib/jarvis`, `lib/tools`, `contexts`

### Fichiers volumineux à surveiller

- `tsconfig.tsbuildinfo` (179 KB) — généré, à `.gitignore`
- `firebase-debug.log` (847 KB) — à `.gitignore`
- `package-lock.json` (583 KB) — normal

---

## 🟢 6. GITHUB

- **Repo** : `flyxtaxi-oss/odyssey-v11` (public, 621 KB)
- **Branche par défaut** : `main`
- **PRs** : aucune ouverte
- **Actions** : aucun workflow CI configuré → **point d'amélioration**
- **Secrets** : aucun configuré dans GH (normal si tout est sur Vercel)
- **Dernière push** : 2026-04-07

**À faire** : ajouter un workflow GitHub Actions minimal (`tsc --noEmit`, `eslint`, `next build`) pour bloquer les PRs cassées avant merge.

---

## 🔴 7. VERCEL — Accès rétabli, plein de problèmes trouvés

**Project** : `odyssey` (prj_DBvlApFgsJ27qVP5v98o9eqDOK5R), Next.js, team `ziane's projects`

### Déploiements (5 derniers)
| État | Cible | URL |
|---|---|---|
| **❌ ERROR** | production | odyssey-gbgbybf7x... (le plus récent — site mort) |
| ✅ READY | production | odyssey-7fii99o5a... (avant-dernier, fonctionnel) |
| ✅ READY | production | odyssey-j5sff3ar6... |
| ✅ READY | production | odyssey-encta8eh7... |
| ✅ READY | production | odyssey-qm5xvtrm1... |

### 🚨 AUCUNE variable d'environnement configurée sur Vercel

C'est très grave. Logs de build :
```
Firebase Admin: Running in development mode without service account
[répété 9 fois]
```

Conséquence : **toutes tes routes API qui utilisent Firebase Admin renvoient des données mock/dev en prod**, et toutes celles qui appellent Anthropic/Google AI échouent.

À configurer sur Vercel (`vercel env add`) :
- `ANTHROPIC_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `NEXT_PUBLIC_FIREBASE_*` (les 7 variables NEXT_PUBLIC)
- `GOOGLE_PLACES_API_KEY` (si tu utilises l'outil restaurants)

---

## 🔥 8. PLAN D'ACTION RECOMMANDÉ

### MAINTENANT — Remettre la prod en ligne (5 min)

1. **Fix not-found** : ajouter `"use client";` en haut de [src/app/not-found.tsx](src/app/not-found.tsx) → c'est ÇA qui casse le build prod
2. **Configurer les env vars Vercel** : `vercel env add ANTHROPIC_API_KEY production`, idem pour `GOOGLE_GENERATIVE_AI_API_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, et les 7 `NEXT_PUBLIC_FIREBASE_*`
3. **Redeploy** : `git push` ou `vercel --prod`

### Aujourd'hui (30 min — propre)

4. **Fix Zod** [src/app/api/agent/route.ts:48](src/app/api/agent/route.ts#L48) — `z.record(z.string(), z.any())`
5. **Fix AI SDK v6** dans [src/app/api/jarvis/route.ts](src/app/api/jarvis/route.ts) — refactor `tool({ execute })` + remplacer `maxSteps` par `stopWhen: stepCountIs(N)`
6. **Fix VisaTracker** [src/app/visa/page.tsx:32](src/app/visa/page.tsx#L32) — passer les props requises
7. **Déployer les indexes Firestore** : `firebase deploy --only firestore:indexes` (après les avoir définis)

### Cette semaine

5. `npm audit fix` (corrige la vuln critique protobufjs sans breaking changes)
6. `npx eslint . --fix` (auto-fix des apostrophes/imports)
7. Retirer `@mlc-ai/web-llm` de `package.json` (non utilisé) ou brancher l'usage prévu
8. Nettoyer les fallbacks Firebase hardcodés
9. Fix le bug `setState in effect` dans [src/lib/follow-up.ts:96](src/lib/follow-up.ts#L96)

### Ce mois

10. Ajouter CI GitHub Actions (tsc + eslint + build)
11. Mettre à jour AI SDK + Firebase aux dernières mineures
12. Reconnecter Vercel MCP pour monitoring runtime
13. Migrer `middleware` → `proxy` (deprecation Next.js 16)
14. Ajouter App Check Firebase si pas déjà fait
15. Lancer `/security-review` sur les changements en cours

---

## 📎 Annexes

### Fichiers modifiés non commités

- [package.json](package.json) — ajout `@mlc-ai/web-llm` (inutilisé)
- [src/app/api/agent/route.ts](src/app/api/agent/route.ts) — règles Karpathy ajoutées au prompt
- [src/app/api/jarvis/route.ts](src/app/api/jarvis/route.ts) — règles Karpathy + renumérotation

### Ce que je n'ai PAS pu auditer

- ❌ **Vercel runtime logs** (403)
- ❌ **Vercel env vars** (403)
- ❌ **Firebase Console** (pas de MCP Firebase connecté — j'ai juste lu la config locale et les rules)
- ❌ **Sentry** (non configuré dans le projet)
- ❌ **Tests** (aucun framework de tests détecté — `package.json` n'a aucun script `test`)

Pour débloquer ces points, connecte le MCP Vercel sur la bonne scope, et installe Sentry si tu veux du monitoring d'erreurs prod.

---

*Fin de l'audit.*
