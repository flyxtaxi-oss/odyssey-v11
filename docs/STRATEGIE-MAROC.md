# Stratégie — Odyssey Maroc : la super-app « tiers de confiance » de la diaspora

> Issu d'une recherche multi-agents sourcée (juin 2026). Chiffres = ordres de grandeur datés et cités ; à re-vérifier avant usage contractuel.

## Positionnement

Odyssey Maroc transforme les **4 enfers du Marocain moderne** — transférer son argent, faire ses papiers, acheter/construire au bled, gagner en devises — en **parcours guidés par IA, sourcés sur le droit marocain réel, exécutés de A à Z**. Là où Western Union, les consulats, Avito et les banques s'arrêtent à un service isolé et opaque, Odyssey orchestre tout le voyage du MRE : **simuler avant de partir, agir sans se déplacer, prouver sans se faire avoir.**

## Chiffres clés (sourcés)

| Donnée | Valeur | Source |
|---|---|---|
| Transferts MRE 2024 | **117,7 MMDH** (~7,7% du PIB), >122 MMDH en 2025 | Office des Changes / Médias24 |
| Coût moyen d'envoi vers le Maroc | ~5,5% (cible ODD < 3% non atteinte) | Banque Mondiale |
| Marge de change cachée | jusqu'à **146 MAD captés sur 500€** | idealremit |
| Perte d'un MRE fidèle à un seul opérateur | **~1 007 MAD/an** (500€/mois) | idealremit / World Bank |
| Part de l'immobilier dans l'investissement MRE | **~70%** | Messidor / FNH |
| Plaintes spoliation foncière MRE | 290 en 2021 (**+45%**), ~8 000 biens à risque | Bladi / Ministère Intérieur |
| Procuration immobilière | acte authentique + registre national obligatoires **au 1er juin 2026** (loi 31-18) | lesMRE / Bladi |
| Réforme Moudawana | **139 amendements** (présentés déc. 2024), succession/MRE impactés, calendrier flottant | Le Desk / TelQuel |
| RDV consulaires l'été | **4 à 6 semaines** de délai | marocains-du-monde |
| Freelances marocains | ~300 000 (60% missions à l'étranger), dotation e-commerce plafonnée 15 000 DH/an | recherche |

## Les 7 features révolutionnaires

1. **Jumeau Numérique du Retour (Relocation A→Z)** — *quick-win, en cours.* Simule budget, ville, école, papiers, douane véhicule, délais consulaires sur 12 mois → « rapport de retour » chiffré + carte-vidéo virale. **Assets** : `maroc-parcours.ts`, `simulation-engine.ts`, `maroc-data.ts`, Remotion, Firebase.
2. **Copilote Administratif IA (papiers sans 2e RDV)** — checklist exacte par démarche×pays×profil, pré-vérification OCR des pièces, alertes timing saisonnier, suivi multi-portails. **Assets** : `markitdown`, `jarvis/route.ts`, `action-engine.ts`, `visa-data.ts`, n8n.
3. **Mufid — IA juridique RAG (Moudawana & Bulletin Officiel)** — réponses datées et citées (succession, procuration, mariage MRE), calculateur de succession. **Assets** : `RAG-Anything`, `markitdown`, `graph-rag.ts`, `claude-context`, Supabase pgvector.
4. **Radar Transfert** — comparateur devises temps réel multi-corridors affichant les **MAD réellement reçus** + révélateur « tu perds X MAD/an » + alertes meilleur moment/opérateur. **Assets** : n8n, `notification-engine.ts`, `prediction-cards.ts`, Supabase, Remotion.
5. **Chantier Protégé** — tiers de confiance immobilier : due diligence titre ANCFCC, suivi de chantier par **preuve photo/vidéo géolocalisée et horodatée** avant libération de fonds, conformité procuration loi 31-18. **Assets** : Firebase Storage, `simulation-engine.ts`, `markitdown`, `collaborative.ts`, n8n.
6. **Devise Pro** — copilote conformité change pour freelances locaux : simulateur dotations Office des Changes, optimiseur d'encaissement (Payoneer/Wise/Cash Plus-PayPal), facturation auto-entrepreneur. **Assets** : `simulation-engine.ts`, `jarvis`, RAG IGOC, `gamification.ts`.
7. **Diwan — Cockpit famille & succession** — coffre-fort de documents partagé, échéancier unifié, planificateur succession (branché Mufid), prépa « retour d'été ». Boucle virale intra-familiale. **Assets** : `collaborative.ts`, `viral-engine.ts`, Firebase Storage + RLS, Supabase RLS.

## Stratégie virale

- **Saisonnalité Marhaba** (10 juin–15 sept, 4,06M MRE) : campagne « Prépare ton retour » + parrainage.
- **Révélateurs choc personnalisés** : « tu as perdu 1 007 MAD avec Western Union », « Belgique vs Maroc : pouvoir d'achat ×2,3 », « avec le taâssib tes filles héritent de X ».
- **Vidéos TikTok programmatiques (Remotion)** pour les 8,2M d'utilisateurs TikTok au Maroc.
- **Widget WhatsApp « taux du jour »** + coffre-fort familial → boucle native dans les groupes MRE.
- **Parrainage double-face** via `viral-engine.ts`.
- **SEO programmatique** démarche×pays×profil (extension des 50 pages visa).

## Plan RAG juridique (Mufid)

Faute d'API officielle : ingestion des PDF SGG/Bulletin Officiel via **markitdown** (OCR) → chunking sémantique par article avec métadonnées (n° article, n° BO, **date**, état de la réforme) → embeddings (**Supabase pgvector + RLS**) → `RAG-Anything` (multimodal) + `claude-context` → tool `mufid_legal_search` dans `jarvis/route.ts`. **Règle impérative** : chaque réponse cite l'article + le BO + la date, signale si le texte est une PROPOSITION non votée vs EN VIGUEUR, et inclut un disclaimer.

Sources : Bulletin Officiel (sgg.gov.ma, Code de la famille BO n°5184 du 5 fév. 2004), base Adala, lois 31-18 & 69-16, propositions Moudawana, IGOC 2024.

## Roadmap

- **Phase 0 (S1-2)** — fondations : stack data (Supabase pgvector + RLS pour le RAG/docs ; Firebase pour auth/temps réel), pipeline d'ingestion juridique, tool `mufid_legal_search`, schéma Jumeau Numérique.
- **Phase 1 (S3-5)** — Quick-win Jumeau Numérique du Retour (brancher parcours ↔ simulateur ↔ JARVIS, rapport chiffré, carte-vidéo).
- **Phase 2 (S6-9)** — Mufid (RAG 3 domaines) + calculateur succession + Copilote Administratif.
- **Phase 3 (S10-12)** — Radar Transfert + campagne virale Marhaba.
- **Phase 4 (S13-20)** — Chantier Protégé + Devise Pro + Diwan.
- **Phase 5 (continu)** — partenariats (notaires, rail bancaire, opérateurs), conformité RGPD/RLS, SEO programmatique, versionnage du corpus RAG.

## Conformité (rappel)

Données sensibles → Supabase RLS, minimisation RGPD, **jamais de `service_role` côté client**, disclaimers juridiques systématiques. Le calculateur de succession et les estimations de coûts sont **éducatifs/indicatifs**, pas un conseil juridique ou financier.
