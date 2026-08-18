# Audit complet — Odyssey v11 (07 juillet 2026)

> Radiographie factuelle de l'application, croisée sur 3 axes (produit · sécurité · architecture).
> Rapport visuel : artifact `rapport-complet`.

## Le « double » app — résolu
Il n'y a **qu'une seule app**. `~/Desktop/odyssey-v11` est un **symlink** vers `~/Projects/odyssey-v11`.
Éditer l'un ou l'autre = même code. Aucune copie dupliquée. Travailler toujours dans `~/Projects/odyssey-v11`.

## Synthèse
| Indicateur | Valeur |
|---|---|
| Build / déploiement | ✅ PASS (Vercel-ready, 46 Mo) |
| TypeScript | ✅ 0 erreur de type |
| Complétude réelle | ⚠️ ~52 % (Maroc + suivi quasi finis ; reste = vitrine/mock) |
| Maintenabilité | ⚠️ 6.5 / 10 |
| Sécurité | 🔴 3 failles critiques |
| Tests auto | 🔴 0 |
| Vulns npm | ⚠️ 27 (dont 7 hautes) |
| Erreurs ESLint | 20 (10 bugs React + 10 cosmétiques) — ne bloquent pas le build |

**Verdict :** coquille très bien architecturée, fondations réelles (auth, Firestore, sécurité, cache, UI animée), mais >50 % des features sont des maquettes. 3–4 semaines de travail ciblé pour un vrai lancement.

## 1. Sécurité (à traiter en premier)
- **C1 — Bypass vérification JWT.** `src/lib/firebase-admin.ts:66-90` : sans `FIREBASE_PRIVATE_KEY`, le token n'est pas vérifié cryptographiquement → usurpation d'identité sur toutes les routes protégées. Aggravé par `auth-middleware.ts:39` (`token.length < 100`). **Fix :** échec au démarrage en prod si clés admin absentes ; supprimer la branche « décodage sans vérification ».
- **C2 — 4 endpoints IA ouverts.** `src/app/api/agent/{route,vision/route,plan/route,execute/route}.ts` : modèle payant sans auth ni rate-limit → abus de coût/DoS financier ; GET `execute` expose l'audit trail. **Fix :** `withAuth` + `checkRateLimit(uid)`.
- **C3 — Anonymes fusionnés.** `api/jarvis/route.ts:171-181` + `ai-engine.ts:58-78` : `userId="anonymous"` partage mémoire + rate-limit entre tous les anonymes → fuite de contexte, quota trivial à épuiser. **Fix :** auth obligatoire, store Redis partagé.
- **M1 (RGPD) — Emails publics.** `firestore.rules:10` `allow read: if true;` sur `/profiles` → email de tous les users lisible. **Fix :** `request.auth != null` ou sous-doc public sans email.
- Secondaires : CSP `unsafe-inline/eval` (M2), payloads LLM non bornés agent/vision/plan (H2), logs de prompts verbeux (F1).
- Positifs : aucun secret en `NEXT_PUBLIC_`, `firebase-admin` server-only, `.env*`/`*.pem` bien gitignorés.

## 2. Complétude fonctionnelle (% réel — audit ligne par ligne des 20 modules)
Check-in 100 · Review hebdo 95 · **Maroc Hub (7 modules) 92** · Briefing 90 · Auth 85 · Sécurité API 85 · Persistance 80 · Agents (exécution) 62 · JARVIS 60 · Simulateur 55 · Safe-Zone 55 · Dashboard 52 · Skills 50 · Language 40 · Predict 30 · Settings 20 · Visa Tracker 5 · Temps réel 5.

**Détail Maroc (le bloc le plus abouti) :** Parcours 98 (localStorage), Sérénité 95, Succession 95 (Farâ'id/taâssib), Comparateur 92 (20+ destinations), Transfert 92 (marge FX + frais), Veille 90, Fiches villes 88 (SSG + JSON-LD). Toutes interactives, branchées sur `maroc-*.ts`.

**Suivi quotidien (branché Firestore, découvert au 2ᵉ passage) :** `/api/checkin` 100 %, `/api/review` 95 %, `/api/briefing` 90 % — authentifiés, validés zod, calculs réels. `/api/dashboard` 70 % (hybride réel/statique selon auth).

**Réel :** Maroc Hub (7 modules), suivi quotidien, auth Firebase, persistance Firestore, JARVIS conversationnel, Command Center (Cmd+J, offline IndexedDB), Sidebar.
**Vitrine/mock :** outils JARVIS & agents (infra ok, handlers stubs/TODO : Google Calendar, Skyscanner, restaurants), modération `Math.random()`, Visa Tracker (UI ok, données en dur), données simulateur fictives, Predict sans UI, OnboardingWizard (jamais branché).

## 3. Architecture & dette
- 🔴 **Aucun test** (0 `.test`/`.spec`).
- ⚠️ **i18n coquille vide** — `i18n.ts` (461 l.) jamais utilisé, app en FR codé en dur.
- ⚠️ **Code mort confirmé** (0 import dans `src/`) : `follow-up.ts`, `onboarding-engine.ts`, `collaborative.ts`, `prediction-cards.ts` + composant `OnboardingWizard.tsx`. À supprimer.
- ⚠️ **Fichiers >400 lignes** (8) : `simulator/predict/page.tsx` (612), `simulation-engine.ts` (567), etc.
- ⚠️ **Pas de design system** réutilisable.
- ⚠️ **10 bugs React** (hooks conditionnels, setState sync dans effets) — n'empêchent pas le build.
- ✅ TS strict, 2 `any`, 0 `catch` vide. Maroc bien greffé.

## 4. Dépendances & build
- ✅ Build OK (Next 16 ne lint plus pendant `next build`).
- 🔴 `firebase-tools` (CLI dev) dans `dependencies` de prod → bundle + majorité des 27 vulns. **Déplacer en devDependencies.**
- ⚠️ 27 vulns npm (7 hautes, ex. `ws` DoS via firebase-tools) → `npm audit fix`.
- ⚠️ Deps en retard : AI SDK, framer-motion, firebase, recharts.

## Plan d'action
**Phase 1 — Sécuriser & assainir (~2-3 j)** : fermer C1/C2/C3 + M1 ; sortir `firebase-tools` de prod + `npm audit fix` ; corriger 10 bugs React + 10 ESLint ; supprimer moteurs orphelins.
**Phase 2 — Rendre réel (~1-2 sem)** : brancher les outils JARVIS ; modération réelle ; Visa Tracker fonctionnel ; compléter sous-pages Maroc ; premiers tests Vitest.
**Phase 3 — Mûrir (continu)** : activer i18n ; design system v1 ; Server Components + cache pages statiques ; UI Predict multi-agents ; données live.
