# 🇲🇦 Vision produit — Odyssey pour les MRE (le mix révolutionnaire)

**Date** : 2026-07-02 · Basé sur 2 recherches marché (marché Maroc/MRE + super-apps mondiales à transplanter).

> Idée directrice : ne pas refaire une banque (Attijari « Simple » et Revolut arrivent). **Construire la couche IA + agrégation que les banques ne feront pas** : admin, retraite, fiscalité, immobilier de confiance, assistant en darija — et un **agent qui exécute**.

---

## 1. Le marché en 4 chiffres

- **~5,5 M de MRE** dans le monde (France ~1,5M, Espagne ~850k, Italie ~480k, Belgique/Pays-Bas ~750k, + Golfe/Canada/USA).
- **~13,3 Md$ de transferts/an (2025)**, 2ᵉ source de devises du Maroc, ~8 % du PIB.
- **Coût d'un transfert ~9 $** (vs ~6 $ mondial) ; 5-10 % de perte réelle en cash.
- **e-gov Maroc 90ᵉ mondial** : 300+ services mais **portails éclatés**, délais consulaires qui explosent l'été.

## 2. Le « white space » (là où personne n'est)

Les banques (Attijari « Simple » mai 2026, Revolut) attaquent le **paiement/compte**. Elles **ne couvrent pas** :
- 🏛️ **Admin/e-gov diaspora** (consulat, état civil, CNSS, DGI) — fragmenté, pas de guichet unique.
- 👵 **Retraite/CNSS transfrontalière** — droits France↔Maroc mal appliqués, blocage RGPD.
- 🧾 **Fiscalité / double imposition** — revenus locatifs, pensions.
- 🏠 **Immobilier de confiance à distance** — dépendance à un mandataire, arnaques.
- 🗣️ **Assistant IA en darija/arabe** — personne ne guide dans la complexité.

**→ C'est exactement là qu'Odyssey doit se positionner.** Pas la banque : **le copilote intelligent au-dessus de tout ça.**

## 3. Le produit : « Odyssey — le copilote IA des MRE »

Un mix des meilleurs modèles mondiaux, adapté au Maroc :

| Brique Odyssey | Inspiré de (monde) | Ce que ça fait |
|---|---|---|
| **1. Comparateur de transfert** (hook d'acquisition) | Wise, LemFi, Wave | Compare en temps réel Wise/Remitly/Wafacash/CashPlus, montre le coût réel, oriente vers le moins cher. Gratuit → aimant. |
| **2. JARVIS en darija** (le cœur, déjà codé !) | Alipay assistant, Kakao IA | Assistant qui **guide** dans l'admin, la fiscalité, la retraite, remplit les formulaires, explique les droits. |
| **3. Guichet admin MRE** | OWWA (Philippines), e-OCI (Inde) | Agrège consulat (RDV), Watiqa (état civil), CNSS, DGI. Alertes d'expiration passeport/CNIE 6 mois avant. |
| **4. Simulateur fiscal MRE** (déjà à moitié codé) | — | Double imposition pays de résidence↔Maroc, revenus locatifs, pensions, jours de résidence fiscale. |
| **5. Immobilier de confiance** | Sarouty + vérif | Agrège Mubawab/Avito + vérification juridique/foncière + mandataire vérifié + estimation IA. Anti-arnaque. |
| **6. Communauté MRE** (Safe-Zone, déjà codé) | Majority, Welcome Tech | Entraide, événements, culture, bons plans (billets d'avion été, opérateurs). |
| **7. Agent qui EXÉCUTE** (différenciateur 2026) | Visa AI payments, Ant AMP | Paie une facture au bled, prend le RDV consulaire, réserve un vol — avec garde-fous. |

## 4. Ce qu'on RÉUTILISE de l'app actuelle (bonne nouvelle : ~60 %)

| Module actuel | Devient |
|---|---|
| **JARVIS** (5 personas, i18n) | Le copilote MRE — ajouter **darija/arabe** à l'i18n, repositionner le persona « Stratège » sur fiscalité/visa/CNSS MRE |
| **Visa (50 pages)** | **Admin & consulaire MRE** — RDV, papiers, alertes |
| **Simulator** | **Simulateur fiscal MRE** (double imposition FR/BE/ES↔MA) |
| **Safe-Zone** | **Communauté MRE** |
| **Dashboard** | Tableau de bord MRE (transferts, échéances admin, retraite) |
| Skills / Language / Predict | À **geler** ou fusionner (langue = darija/arabe utile ; le reste hors sujet) |

## 5. Monétisation (à brancher plus tard, avec le domaine + Stripe)

Modèle **abonnement-communauté** façon **Majority (~6 $/mois)** :
- **Gratuit** : comparateur de transfert + JARVIS limité + alertes admin.
- **Premium ~9-15 €/mois** : JARVIS illimité, guichet admin complet, simulateur fiscal, immobilier vérifié, réductions (vols été, opérateurs, transferts partenaires).
- Plus tard : commission sur transferts partenaires, immobilier, produits d'épargne/investissement diaspora (« diaspora bond » digitalisé — cf. Israël/Inde, la confiance est la clé).

## 6. Séquence recommandée (l'ordre qui gagne)

1. **Hook** : comparateur de transfert + JARVIS en darija (acquisition virale, coût zéro pour l'utilisateur).
2. **Douve** : guichet admin + alertes consulaires + simulateur fiscal (ce que personne ne fait → rétention).
3. **Monétisation** : abonnement premium (Stripe, au moment du domaine).
4. **Marge** : immobilier vérifié + agent qui exécute + épargne/investissement diaspora.

## 7. Ce qu'il faut décider / vérifier (toi + réalité réglementaire)

- ⚖️ **Réglementaire** : dès qu'on touche à l'argent (transfert, wallet), il faut **licence établissement de paiement (Bank Al-Maghrib)** + **Office des Changes**. → On commence donc par la couche **intelligence/agrégation/comparateur** (pas régulée), les flux d'argent passent par des **partenaires** au début.
- 🌐 **Nom de domaine** : on branche SEO + Stripe quand tu l'as (comme convenu).
- 🗣️ **Darija/arabe** : à ajouter à l'i18n — décision de langue prioritaire.
- 🎯 **Focus** : accepter de recentrer Odyssey « générique » → **« Odyssey MRE »**. C'est le pivot qui rend le produit unique et défendable.

---

### Sources principales
Transferts MRE 13,3 Md$ 2025 (Morocco World News, Office des Changes) ; coût ~9$/transfert (Ken Research) ; néobanque « Simple » Attijari (Médias24, Jeune Afrique) ; e-gov 90ᵉ (UN EGDI) ; modèles Comun/Majority (TechCrunch) ; Wave/M-Pesa/LemFi (TechCabal, Semafor) ; identité diaspora e-OCI/OWWA (India Policy Hub, PhilSys) ; diaspora bonds Israël/Inde (Migration Policy, Brookings).
*Détail complet des sources dans l'historique de recherche de la session.*
