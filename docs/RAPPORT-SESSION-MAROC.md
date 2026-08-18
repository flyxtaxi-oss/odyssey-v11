# Rapport de session — Expansion « Odyssey Maroc »

> Période : 2026-06-20 → 2026-06-29 · Projet : `odyssey-v11` (Next.js 16 / React 19 / Firebase)
> État global : **✅ build vert — 91 pages statiques générées (31,6 s), typecheck + lint OK.**

---

## 1. Vue d'ensemble

Point de départ : Odyssey = « Life OS » IA pour expatriés francophones (J.A.R.V.I.S., simulateur multipays, Visa Tracker, Safe-Zone, Language Lab, Skills).

Objectif de la session : **élargir la cible et créer un angle viral** en construisant un écosystème **Maroc** qui sert 3 audiences — **étrangers** qui s'installent, **MRE** (Marocains Résidents à l'Étranger) qui rentrent/investissent, **Marocains locaux** qui veulent évoluer — avec une vision « super-app tiers de confiance de la diaspora ».

Résultat : un **hub `/maroc` complet + 6 modules**, une **couche IA branchée sur la data Maroc**, une **passe design**, et une **stratégie produit sourcée** (recherche multi-agents).

---

## 2. Ce qui a été construit

### 2.1 Hub & contenu
- **`/maroc`** — hub : hero, sélecteur 3 profils, **estimateur de budget en direct** (€/MAD + économie vs France), comparateur de 6 villes, cartes expertes par audience, FAQ, grille « Tes outils Maroc ».
- **`/maroc/[ville]`** — **6 pages SEO programmatiques** (Marrakech, Tanger, Casablanca, Rabat, Agadir, Essaouira) avec JSON-LD.

### 2.2 Modules interactifs (6)
| Module | Route | Rôle |
|---|---|---|
| **Parcours A→Z** (flagship) | `/maroc/parcours` | Feuille de route personnalisée selon profil (6 questions) → 4 phases (préparation, déménagement, arrivée, installation), checklist interactive, coûts/délais, progression sauvegardée |
| **Indice de Sérénité** | `/maroc/serenite` | Score bien-être expat par ville sur 7 axes, pondéré par audience |
| **Radar de Veille** | `/maroc/veille` | Ce qui change pour expats & MRE, avec statut honnête (en vigueur / proposé / à venir) — garde anti-hallucination |
| **Radar Transfert** | `/maroc/transfert` | Vrai coût d'un transfert (marge de change cachée) + révélateur « tu perds X MAD/an » |
| **Succession (Mufid)** | `/maroc/succession` | Calculateur éducatif d'héritage (Fara'id) + enjeu taâssib/réforme Moudawana, sourcé |
| **J.A.R.V.I.S.** | `/jarvis` | Coach IA branché sur la data Maroc |

### 2.3 Couche données (`src/lib/`)
`maroc-data.ts`, `maroc-parcours.ts`, `maroc-serenite.ts`, `maroc-succession.ts`, `maroc-transfert.ts`, `maroc-veille.ts` — chacun = données typées + moteur pur + une fonction `get*Knowledge()` réutilisée par J.A.R.V.I.S. (**~3 600 lignes** de code Maroc au total).

### 2.4 J.A.R.V.I.S. branché Maroc (`src/app/api/jarvis/route.ts`)
- Outil **`analyzeMaroc`** (budget + économie réels par ville).
- Bloc de connaissances injecté : `getMarocKnowledge()` + `getSereniteKnowledge()` + `getVeilleKnowledge()`.
- Module « Vivre au Maroc » ajouté au system prompt.

### 2.5 Design « app du futur » (`globals.css`)
- **Bug corrigé** : `module-card-*`, `tag-cyber`, `text-gradient-shimmer` étaient utilisés dans le dashboard mais **n'existaient pas** → cartes sans gradient, titre sans shimmer. Classes ajoutées.
- Polish global : aurora ambiante, `:focus-visible` accessible, `prefers-reduced-motion`, sélection de texte brandée.

### 2.6 Câblage transverse
Sidebar (entrée « Vivre au Maroc »), carte module sur le dashboard, bande « Spotlight Maroc » sur `MarketingLanding`, **sitemap** (toutes les routes Maroc), métadonnées SEO par page.

---

## 3. Stratégie produit (recherche multi-agents sourcée)

Un workflow de recherche a produit une analyse sourcée → voir **`docs/STRATEGIE-MAROC.md`**. Chiffres clés vérifiés :
- Transferts MRE : **117,7 MMDH (2024) = 7,7% du PIB**, >122 MMDH en 2025.
- Coût moyen d'envoi vers le Maroc ~5,5% ; **marge cachée jusqu'à 146 MAD sur 500€** ; **~1 007 MAD/an perdus** en restant sur le pire opérateur.
- Immobilier = ~70% de l'investissement MRE ; spoliation foncière **+45%** ; procuration → acte authentique obligatoire **1er juin 2026** (loi 31-18).
- Réforme Moudawana : **139 amendements** (déc. 2024, non votés) ; RDV consulaires **4-6 semaines** l'été.

**7 features identifiées** : Jumeau Numérique du Retour · Copilote Administratif IA · Mufid (RAG juridique) · Radar Transfert · Chantier Protégé · Devise Pro · Diwan (cockpit famille).

> ⚠️ Limite : la phase de **vérification adversariale** du workflow a échoué (agents en timeout). Les chiffres viennent de la phase recherche (sourcés) mais n'ont pas reçu le second tour de contre-vérification — à re-confirmer avant usage contractuel.

---

## 4. État de qualité

| Contrôle | Résultat |
|---|---|
| `tsc --noEmit` | ✅ |
| ESLint (modules Maroc) | ✅ |
| `next build` | ✅ 91 pages, prérendu statique |
| Toutes les routes `/maroc/*` | ✅ générées |

**Git** : tout est en **local non commité** (`git status` : 6 fichiers modifiés + `src/app/maroc/`, `MarketingLanding.tsx`, 6 libs `maroc-*`, `docs/`). Rien n'a été poussé.

---

## 5. Garde-fous & conformité
- Tous les montants/calculs labellisés **estimations indicatives, non contractuelles**.
- Calculateur de succession = **éducatif**, renvoie vers adoul/notaire pour les cas complexes ; la réforme Moudawana est affichée comme **proposition non votée**, jamais comme droit en vigueur.
- Aucune clé secrète exposée ; pas de `service_role` côté client.

---

## 6. Prochaines étapes recommandées
1. **Vérif visuelle** : lancer le dev server et tester chaque module à l'écran (responsive, dark/light).
2. **Données réelles** : taux FX live (Radar Transfert), flux RSS→IA daté (Radar de Veille).
3. **Mufid RAG** : pipeline d'ingestion Bulletin Officiel / Moudawana (markitdown → embeddings → Supabase pgvector) + tool `mufid_legal_search`.
4. **Copilote Administratif** (`/maroc/papiers`) : checklist démarche×pays×profil + pré-vérification OCR.
5. **Commit** quand tu valides (rien n'est poussé pour l'instant).
