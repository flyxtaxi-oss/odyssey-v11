# Audit complet — Odyssey.v11

> Produit par 6 experts en parallèle (sécurité, bugs, véracité des données, UX, performance, design),
> avec vérification adversariale des findings critiques et élevés.
> Chaque finding a été établi en lisant le code réel et cite `fichier:ligne`.

**66 défauts distincts** — 9 critique · 26 élevé · 22 moyen · 9 faible

---

## Sommaire par gravité


### 🔴 CRITIQUE — 9

1. **L'outil JARVIS `checkVisaRules` fabrique une réponse positive pour n'importe quel pays et l'injecte au LLM comme fait vérifié** — `src/app/api/jarvis/route.ts:85`
2. **La home prérendue contient le faux dashboard, pas la landing — swap complet du DOM après résolution de Firebase Auth** — `src/app/page.tsx:233`
3. **Le Simulateur — page phare — affiche des taux d'imposition inventés, sans source, sans date et sans aucun disclaimer** — `src/app/simulator/page.tsx:53`
4. **Le simulateur ne demande aucune donnée à l'utilisateur : tout le monde voit les mêmes chiffres** — `src/app/simulator/page.tsx:77`
5. **Le bouton « Sauvegarder » du simulateur échoue à 100 % — et l'échec est invisible** — `src/app/simulator/page.tsx:90`
6. **Aucune mention légale, CGU/CGV ni politique de confidentialité alors que l'app vend des abonnements à des consommateurs européens** — `src/components/MarketingLanding.tsx:236`
7. **Aucun système de paiement : les 3 CTA de pricing mènent à un cul-de-sac** — `src/components/MarketingLanding.tsx:268`
8. **Le SDK client Firebase Auth + Firestore (444 Ko bruts / 135 Ko gzip) est chargé sur les 56 pages SEO statiques qui ne l'utilisent jamais** — `src/lib/firebase.ts:75`
9. **Succession Fara'id : aucune réduction proportionnelle ('awl) — les parts affichées totalisent 112,5 % / 125 %** — `src/lib/maroc-succession.ts:123`

### 🟠 ÉLEVÉ — 26

1. **Le service worker échoue son installation à chaque visite : /manifest.json et /offline n'existent pas, cache.addAll rejette** — `public/sw.js:4`
2. **/api/dashboard : 3 allers-retours Firestore sérialisés, lecture non bornée de `simulations` pour un simple compte, et 100 lectures de `posts` globales par appel** — `src/app/api/dashboard/route.ts:44`
3. **Le prompt système interdit à JARVIS de se présenter comme une IA, lui ordonne de donner « des chiffres précis » et ne lui donne aucune consigne de refus ni disclaimer fiscal** — `src/app/api/jarvis/route.ts:57`
4. **/api/jarvis : identité anonyme dérivée de l'IP → mémoire personnelle (revenus, métier, localisation) partagée entre utilisateurs distincts** — `src/app/api/jarvis/route.ts:183`
5. **Fuite de mémoire conversationnelle entre utilisateurs anonymes partageant une IP (NAT / CGNAT)** — `src/app/api/jarvis/route.ts:183`
6. **/api/language : N+1 Firestore séquentiel — une requête par profil dans une boucle for, sans limit()** — `src/app/api/language/route.ts:26`
7. **Six calques fixes plein écran superposés en permanence, dont un `mix-blend-mode: overlay` à z-index 9999 qui casse la composition du scroll** — `src/app/globals.css:278`
8. **/language : le « Test de niveau » et le mode Dialogue sont des maquettes non fonctionnelles** — `src/app/language/page.tsx:464`
9. **/language : un utilisateur connecté voit son profil de langue vide après un rechargement** — `src/app/language/page.tsx:50`
10. **/language ne charge jamais les données après un rechargement de page (session Firebase non encore résolue)** — `src/app/language/page.tsx:75`
11. **« Alertes auto » de visa : la permission de notification est demandée, aucune notification n'est jamais envoyée** — `src/app/page.tsx:229`
12. **Safe-Zone : toute erreur API est annoncée à l'utilisateur comme « contenu toxique détecté »** — `src/app/safezone/page.tsx:120`
13. **/simulator : l'échec de « Sauvegarder cette comparaison » n'affiche rien du tout** — `src/app/simulator/page.tsx:96`
14. **/simulator/predict : blocage définitif sur l'écran « Simulation en cours… » en cas d'erreur API** — `src/app/simulator/predict/page.tsx:124`
15. **La page de prédiction reste bloquée en « Simulation en cours… » pour toujours dès que l'API ne répond pas 201** — `src/app/simulator/predict/page.tsx:125`
16. **La date de « dernière mise à jour » des guides visa et villes est `new Date()` : elle affiche toujours aujourd'hui, quelle que soit l'ancienneté réelle des données** — `src/app/visa/[country]/page.tsx:162`
17. **Les 52 pages SEO renvoient vers un simulateur qui ne gère pas leur pays** — `src/app/visa/[country]/page.tsx:123`
18. **La landing affirme « Données sourcées et datées » alors qu'aucun jeu de données du produit ne porte de source ni de date, sauf un** — `src/components/MarketingLanding.tsx:113`
19. **La landing annonce des volumes de fonctionnalités contredits par le code : « 50 visas » pour un tracker qui en propose 5, « 50 pays » pour un simulateur qui en a 6** — `src/components/MarketingLanding.tsx:156`
20. **clientIp() fait confiance en premier à CF-Connecting-IP, en-tête que Vercel ne pose ni ne supprime → rate limiting anonyme contournable par simple en-tête** — `src/lib/auth-middleware.ts:140`
21. **Des marges de change « cachées » inventées sont attribuées nominativement à des entreprises réelles et publiées sous forme de classement** — `src/lib/maroc-transfert.ts:47`
22. **La file d'attente hors-ligne n'est jamais rejouée : « sera exécutée dès votre reconnexion » est faux** — `src/lib/offline-db.ts:221`
23. **Le produit affiche un badge « vérifié » par publication et promet « identité vérifiée » alors que la vérification n'est qu'un score de toxicité par mots-clés** — `src/lib/security.ts:133`
24. **Le curseur « Niveau anglais » du simulateur de prédiction n'a aucun effet, mais fait bouger le score par pur bruit aléatoire** — `src/lib/simulation-engine.ts:223`
25. **`taxFlatRate` mélange taux d'imposition et taux d'exonération : la Grèce est affichée « Taux fiscal 50 % » alors que le champ encode 50 % d'exonération** — `src/lib/visa-countries.ts:25`
26. **Le Visa Tracker ne connaît que 5 pays alors que l'app en annonce 50 et publie 52 guides** — `src/lib/visa-data.ts:12`

### 🟡 MOYEN — 22

1. **/api/briefing enchaîne 4 requêtes Firestore indépendantes en série ; /api/review en enchaîne 3** — `src/app/api/briefing/route.ts:29`
2. **/api/language : create_profile crée un document neuf à chaque appel, et le GET fait une requête Firestore par profil (amplification N+1 auto-infligeable)** — `src/app/api/language/route.ts:145`
3. **/api/language complete_review : mastery_level calculé à partir d'une valeur envoyée par le client, sans validation de type** — `src/app/api/language/route.ts:128`
4. **/api/posts GET : lecture publique non authentifiée et non limitée, 50 lectures Firestore facturées par requête** — `src/app/api/posts/route.ts:15`
5. **JARVIS : une limite de débit ou une panne s'affiche en « Vérifiez votre configuration API »** — `src/app/jarvis/page.tsx:96`
6. **Mobile : le sélecteur de personas JARVIS est écrasé et les 5 personas restent anonymes** — `src/app/jarvis/page.tsx:161`
7. **framer-motion (117 Ko bruts) et CommandCenter (43 Ko bruts) sont importés statiquement dans le layout racine alors qu'ils ne servent qu'après interaction** — `src/app/layout.tsx:166`
8. **Le tableau de bord affiche deux scores contradictoires et 5 axes de progression codés en dur** — `src/app/page.tsx:396`
9. **Le tableau de bord flashe des statistiques de démo avant d'afficher la landing aux visiteurs** — `src/app/page.tsx:233`
10. **Boutons morts sur le tableau de bord et la Safe-Zone (dont l'avatar « JL » codé en dur)** — `src/app/page.tsx:458`
11. **Les 6 réglages de la page Paramètres ne pilotent rien, et sont perdus sans compte** — `src/app/settings/page.tsx:117`
12. **Le sitemap déclare toutes les pages modifiées maintenant et le hub veille « daily », alors que leur contenu est figé dans le code** — `src/app/sitemap.ts:32`
13. **/skills : le bouton « Ajouter » ne fait rien si l'utilisateur n'est pas connecté** — `src/app/skills/page.tsx:81`
14. **Les 52 guides visa se re-datent tout seuls à chaque build (schema.org inclus)** — `src/app/visa/[country]/page.tsx:162`
15. **Claim marketing sans aucune implémentation : « Bail mobilité FR ✅ via SeLoger »** — `src/components/MarketingLanding.tsx:188`
16. **Compteur de visa : `Math.abs` sur l'écart de dates fait décompter les jours d'un séjour à venir et surcompte le jour d'entrée** — `src/components/VisaTracker.tsx:35`
17. **Le dictionnaire i18n complet — 7 langues, 41,6 Ko bruts — part dans le bundle client de chaque page** — `src/contexts/LocaleContext.tsx:15`
18. **L'outil de recherche de vols renvoie des prix inventés attribués à de vraies compagnies, s'exécute sans confirmation, et l'UI annonce « Action exécutée avec succès »** — `src/lib/action-engine.ts:333`
19. **Le cache des plans d'action ignore la date et l'identité : plan périmé et identifiant de plan dupliqué entre utilisateurs** — `src/lib/jarvis/ai-service.ts:26`
20. **Le coût de vie de référence en France, qui produit le chiffre d'« économie » le plus visible du hub Maroc, est une constante sans source** — `src/lib/maroc-data.ts:320`
21. **Les événements de scénario ne sont jamais rattachés aux agents : `affected_agents` référence des identifiants qui n'existent pas** — `src/lib/simulation-engine.ts:251`
22. **Le middleware pose un Set-Cookie sur chaque réponse HTML, ce qui empêche le CDN Vercel de mettre en cache les 56 pages statiques** — `src/middleware.ts:15`

### ⚪ FAIBLE — 9

1. **recharts est déclaré en dépendance de production sans être importé nulle part** — `package.json:22`
2. **Trois routes renvoient au client le message d'erreur interne brut du fournisseur IA** — `src/app/api/agent/vision/route.ts:64`
3. **`will-change: transform` sur deux blobs floutés de 900×900 px qui ne sont plus animés du tout** — `src/app/globals.css:394`
4. **`.text-gradient-shimmer` anime `background-position` à l'infini dans la Sidebar du layout racine — repaint non composité à chaque frame, sur toutes les pages** — `src/app/globals.css:817`
5. **Lecture Firestore non bornée de tous les visas de l'utilisateur au chargement du dashboard, pour n'en afficher qu'un** — `src/app/page.tsx:216`
6. **Simulateur : l'économie de coût de la vie est affichée comme une perte (rouge) alors que l'inversion a été faite pour l'impôt** — `src/app/simulator/page.tsx:247`
7. **Timeout d'outil : le reçu d'audit affiche « [object Object] » au lieu du motif d'échec** — `src/lib/action-engine.ts:131`
8. **Chaque requête API authentifiée vérifie le token Firebase deux fois** — `src/lib/auth-middleware.ts:186`
9. **/api/agent/plan : le cache LLM n'est pas scopé par utilisateur, contrairement à ce que le commentaire de la route affirme** — `src/lib/jarvis/ai-service.ts:26`

---

## Détail


## 🔴 CRITIQUE

### L'outil JARVIS `checkVisaRules` fabrique une réponse positive pour n'importe quel pays et l'injecte au LLM comme fait vérifié

**Où** : `src/app/api/jarvis/route.ts:85` · **Catégorie** : fabrication-ia

**Le problème**

L'outil est déclaré au modèle avec la description « Vérifier les conditions d'expatriation et de visas nomades pour un pays cible » (ligne 86). Son `execute` (lignes 91-94) ignore totalement le paramètre `country` et renvoie systématiquement, pour tout pays : `{ success: true, info: "Le ${country} propose d'excellentes options fiscales en 2026. Je lance l'analyse approfondie." }`. Il n'existe aucune base de données derrière (le commentaire ligne 92 dit « Logique future »). Ce résultat n'est pas affiché tel quel à l'utilisateur : il est renvoyé au LLM comme *résultat d'outil*, c'est-à-dire comme une donnée récupérée faisant autorité, que le modèle intègre ensuite dans sa réponse en langage naturel. Les outils sont bien actifs en production dès que le provider est Google (ligne 323-325 : `...(selected.provider === "google" ? { tools: jarvisTools, stopWhen: stepCountIs(3) } : {})`). Cela viole directement la contrainte produit « ne jamais inventer » — ici l'invention est en plus toujours positive, donc systématiquement biaisée vers l'incitation au départ.

**Comment ça casse**

L'utilisateur demande à JARVIS « Quelles sont les conditions du visa nomade en Érythrée ? ». Le modèle appelle checkVisaRules({country:"Érythrée"}). L'outil retourne « L'Érythrée propose d'excellentes options fiscales en 2026 ». Le modèle, qui traite les tool results comme du contexte fiable, rédige une réponse affirmative sur un régime fiscal érythréen avantageux qui n'existe pas. Même mécanique pour un pays où le visa a été supprimé : l'outil affirme toujours « excellentes options ».

**Correction**

Supprimer l'outil tant qu'aucune source réelle n'est branchée, ou le faire retourner explicitement l'absence de données : `{ success: false, reason: "no_data", info: "Aucune donnée vérifiée pour ce pays dans la base Odyssey. Ne formule aucune affirmation sur ses conditions de visa ou sa fiscalité ; renvoie l'utilisateur vers /visa/<slug> si le guide existe, sinon vers le consulat." }`. À défaut, l'adosser à VISA_COUNTRIES (src/lib/visa-countries.ts) et ne répondre que pour les slugs présents.

---

### La home prérendue contient le faux dashboard, pas la landing — swap complet du DOM après résolution de Firebase Auth

**Où** : `src/app/page.tsx:233` · **Catégorie** : core-web-vitals

**Le problème**

`export default function DashboardPage()` rend l'arbre dashboard tant que `loading === true` (AuthContext.tsx:25 initialise `loading` à `true`). Le garde `if (!loading && !user) return <MarketingLanding />` ne peut donc jamais s'exécuter au premier rendu, ni côté serveur ni à l'hydratation. Vérifié dans le HTML prérendu `.next/server/app/index.html` (44 Ko après build) : il contient « Bonjour, Explorateur », « 742 PTS Odyssey Score », « 82 % Clarté Mentale », « 7 Pays Simulés », « 14 Connexions » — c'est-à-dire le FALLBACK de page.tsx:86-97. Les chaînes de MarketingLanding (« Changer de pays », « Nomadlist », « Pricing simple ») apparaissent 0 fois dans ce HTML. Le contenu réel de la page d'accueil n'existe donc dans le document qu'après : téléchargement des 468 Ko gzip / 1,53 Mo bruts de JS, hydratation, puis résolution de `onAuthStateChanged`.

**Comment ça casse**

Visiteur anonyme (100 % du trafic SEO et de tout premier visiteur) sur mobile milieu de gamme : (1) le navigateur peint le dashboard de démo — le LCP candidat est le h1 « Bonjour, Explorateur » ; (2) 1,53 Mo de JS brut sont parsés/exécutés (~1,5-3 s de main thread sur un Android type Moto G) ; (3) `onAuthStateChanged` renvoie `null`, `loading` passe à `false` ; (4) tout l'arbre est remplacé par MarketingLanding, dont le h1 `text-5xl md:text-6xl` (MarketingLanding.tsx:51-68) devient le nouveau LCP. Résultat : un layout shift plein écran (CLS proche de la valeur max de 1,0 pour un seul shift, seuil « poor » = 0,25) et un LCP repoussé à la fin de l'hydratation, soit 5-9 s en 4G au lieu des 2,5 s du seuil « good ». Accessoirement, le visiteur voit pendant 2-4 s des chiffres inventés (742 pts, 82 %) présentés comme les siens.

**Correction**

Faire de `/` un Server Component qui rend `<MarketingLanding />` (statique, prérendu, zéro JS de dashboard) et déplacer le dashboard authentifié sur une route dédiée (`/app` ou `/dashboard`), avec redirection depuis `/` seulement après confirmation de session — idéalement via un cookie de session lu côté serveur, pas via `onAuthStateChanged` côté client. À défaut, rendre `MarketingLanding` tant que `loading === true` (`if (loading || !user) return <MarketingLanding />`) : le HTML prérendu contiendra alors le bon contenu et il n'y aura plus de swap pour les anonymes.

---

### Le Simulateur — page phare — affiche des taux d'imposition inventés, sans source, sans date et sans aucun disclaimer

**Où** : `src/app/simulator/page.tsx:53` · **Catégorie** : donnee-fiscale-non-sourcee

**Le problème**

Le tableau `countries` (lignes 53-60) code en dur des taux d'imposition présentés comme des faits : France 30 %, Portugal 20 %, Maroc 15 %, Thaïlande 10 %, Dubaï 0 %. Aucun champ `source`, aucun champ de date, aucune mention « estimation ». J'ai relu la page entière (328 lignes) : contrairement à /maroc/*, /visa/[country] et /simulator/predict, il n'y a AUCUN disclaimer nulle part sur cette page. Pire, la valeur Maroc contredit frontalement la propre base de connaissances du produit : src/lib/maroc-data.ts:185 et :312 indiquent « IR progressif jusqu'à 38 % », et src/lib/maroc-data.ts:186 précise que l'abattement de 80 % ne vaut que pour les pensions étrangères des retraités résidents. Le champ `visa: "Libre"` (ligne 57) est également faux : maroc-data.ts:157 et :269 disent 90 jours sans visa PUIS carte d'immatriculation obligatoire. Les résultats sont ensuite affichés en gros comme « Projection d'Épargne MENSUELLE » (ligne 273) et « sur 60 mois » (ligne 305), c'est-à-dire comme des projections financières fermes.

**Comment ça casse**

Un salarié français à 3800 €/mois ouvre /simulator, clique « Maroc ». calcNet (ligne 62) applique tax=15 % : 2500 − 375 − 700 = 1425 €/mois d'épargne, contre 860 € en France, soit « +565 €/mois » et « +33 900 € sur 60 mois » affichés en vert. Avec le taux réel (IR progressif jusqu'à 38 %, sans abattement s'il n'est pas retraité), l'épargne est fortement surestimée. L'utilisateur démissionne et s'installe sur la base d'un chiffre que l'app elle-même contredit deux fichiers plus loin.

**Correction**

1) Ajouter à chaque entrée un champ `source: string` (URL du texte fiscal officiel) et `lastVerified: string` (date ISO figée), rendus sous le tableau. 2) Remplacer le scalaire `tax` par soit un barème progressif, soit un champ explicitement libellé « taux effectif moyen estimé pour un revenu de X € » avec l'hypothèse affichée. 3) Aligner Maroc sur maroc-data.ts (IR progressif jusqu'à 38 %) et remplacer `visa: "Libre"` par « 90 j sans visa puis carte de séjour ». 4) Ajouter en pied de page le même bandeau que /simulator/predict:201 : « Comparaison indicative, ni une prévision, ni un conseil juridique ou fiscal — vérifiez auprès d'un professionnel. »

---

### Le simulateur ne demande aucune donnée à l'utilisateur : tout le monde voit les mêmes chiffres

**Où** : `src/app/simulator/page.tsx:77` · **Catégorie** : broken-promise

**Le problème**

La promesse commerciale est « Compare Lisbonne vs Tallinn vs Dubaï pour ton profil. Avec ton vrai revenu, ta vraie situation familiale » (MarketingLanding.tsx:150) et « En 2 minutes, tu sauras où tu paies le moins d'impôts pour ton profil » (MarketingLanding.tsx:295). Or /simulator ne contient aucun champ de saisie : `const current = countries[0]` (page.tsx:77) fige la situation de départ sur la France à 3800€ brut / 30% d'impôt / 1800€ de coût de la vie, valeurs codées en dur (page.tsx:53-60). Le seul contrôle est le choix de la destination parmi 5 pays. Le calcul `calcNet` (page.tsx:62) n'utilise que ces constantes. Aucun disclaimer n'est affiché alors que la clé `sim.disclaimer` (« Estimations indicatives, non contractuelles… ») est traduite dans les 7 langues (src/lib/i18n.ts:364) et n'est appelée nulle part (grep = 0 usage).

**Comment ça casse**

Un cadre à 6500€/mois avec deux enfants clique « Lancer ma simulation maintenant » sur la landing, arrive sur /simulator et lit « Ta situation actuelle : 3800€/m, impôts 30% » — des chiffres qui ne sont pas les siens et qu'il ne peut pas modifier. Il en déduit « +1240€/mois au Portugal » et « +44 640€ sur 36 mois » sur une base fausse, présentée sans aucune mention d'estimation.

**Correction**

Ajouter un bloc de saisie (revenu brut, situation familiale, pays de départ) alimentant `current`, et rendre `t("sim.disclaimer")` sous les cartes de projection. Tant que la saisie n'existe pas, remplacer « Ta situation actuelle » par « Profil type : célibataire, 3800€ brut » pour ne pas faire croire à une personnalisation.

---

### Le bouton « Sauvegarder » du simulateur échoue à 100 % — et l'échec est invisible

**Où** : `src/app/simulator/page.tsx:90` · **Catégorie** : correctness

**Le problème**

handleSave envoie `destination: compare.name`, c'est-à-dire le libellé affiché (« Portugal », « Dubaï », « Maroc », « Canada », « Thaïlande »). La route POST /api/simulator valide avec `CreateSimulationSchema` dont `SimulationDestinationSchema` est `z.enum(["portugal","dubai","thailand","singapore","malaysia","cyprus","malta"])` (src/lib/validation.ts:37-45) : minuscules, sans accents, et sans « maroc » ni « canada ». Aucun des 5 pays sélectionnables ne passe la validation. Vérifié en exécutant le schéma sur le payload réel : `{ portugal: false, maroc: false }` → HTTP 400 systématique. Pire, l'état d'erreur n'est jamais rendu : le JSX (l.131-133) ne teste que `isSaving` et `saveStatus === "saved"`, donc `"error"` réaffiche simplement « Sauvegarder ».

**Comment ça casse**

Un utilisateur connecté ouvre /simulator, choisit Portugal, clique « Sauvegarder ». Le spinner tourne, puis le bouton revient à son état initial. Aucun message. La simulation n'est jamais écrite dans Firestore, elle n'apparaît ni dans /api/simulator GET ni dans le compteur `simulations_run` du dashboard. L'utilisateur croit avoir sauvegardé.

**Correction**

1) Envoyer un identifiant stable, pas un libellé : ajouter un champ `id` au type `Country` (`portugal`, `dubai`, `maroc`…) et poster `compare.id`. 2) Compléter `SimulationDestinationSchema` avec `maroc`, `canada`, `france` (ou remplacer l'enum par une liste dérivée d'une source unique partagée client/serveur). 3) Rendre l'échec visible : afficher le message de `details` renvoyé par la route quand `saveStatus === "error"`. Ajouter un test qui parse le payload exact du client avec le schéma serveur pour chaque pays du sélecteur.

---

### Aucune mention légale, CGU/CGV ni politique de confidentialité alors que l'app vend des abonnements à des consommateurs européens

**Où** : `src/components/MarketingLanding.tsx:236` · **Catégorie** : conformite-rgpd-legal

**Le problème**

La landing affiche une grille tarifaire réelle : Pro 19 €/mois / 159 €/an, Pro Max 49 €/mois / 399 €/an (lignes 240-284), avec des CTA vers /login?plan=pro et /login?plan=promax. Or `ls src/app` ne contient aucune route legal / cgu / cgv / privacy / mentions ; `src/app/sitemap.ts` (lignes 10-27) n'en référence aucune ; il n'existe aucun composant Footer dans src/components ; et une recherche « mentions légales | politique de confidentialité | CGU | CGV | RGPD | cookie » sur src/app et src/components ne remonte que des libellés d'UI internes dans settings/page.tsx. La page /login ne contient aucune acceptation de CGU ni lien vers une politique de confidentialité. L'app collecte pourtant email, nationalité, revenus, situation familiale et conversations IA (src/lib/simulation-engine.ts:38-47, /api/jarvis mémoire conversationnelle). À noter au crédit du projet : /api/account expose bien un GET (export, ligne 27) et un DELETE (effacement, ligne 74) — les droits techniques existent, mais l'information légale obligatoire qui doit les accompagner est absente.

**Comment ça casse**

Un utilisateur en France souscrit Pro à 19 €/mois. Il n'a jamais vu d'identité de l'éditeur (LCEN art. 6-III), pas de CGV ni d'information sur le droit de rétractation (C. conso. L.221-5), pas d'information art. 13 RGPD sur les finalités et destinataires du traitement (dont les fournisseurs LLM tiers auxquels ses données de revenus sont envoyées). Une seule plainte CNIL ou DGCCRF, ou une demande de remboursement contestée, expose le fondateur personnellement ; en pratique aucun PSP sérieux ne validera l'onboarding sans ces pages.

**Correction**

Créer src/app/legal/mentions/page.tsx, /legal/cgv/page.tsx, /legal/confidentialite/page.tsx (éditeur, hébergeur, base légale, durée de conservation, sous-traitants IA nommés, droits + lien vers /api/account), ajouter un composant Footer monté dans src/app/layout.tsx avec les liens, les ajouter à sitemap.ts, et ajouter sur /login une case ou une mention d'acceptation horodatée avant toute création de compte.

---

### Aucun système de paiement : les 3 CTA de pricing mènent à un cul-de-sac

**Où** : `src/components/MarketingLanding.tsx:268` · **Catégorie** : monetization

**Le problème**

La landing vend 3 offres (Free, Pro 19€/mois, Pro Max 49€/mois) avec les boutons « Passer Pro » → /login?plan=pro et « Passer Pro Max » → /login?plan=promax (MarketingLanding.tsx:268 et :283). La page /login n'utilise jamais useSearchParams : le paramètre `plan` est purement ignoré (src/app/login/page.tsx:10-43, aucune lecture de l'URL). Aucune dépendance de paiement n'existe (grep stripe/paddle/lemonsqueezy/revenuecat dans package.json = 0), aucun champ plan/tier/quota en base, et aucune limite du plan Free n'est appliquée : les 5 personas JARVIS sont librement sélectionnables (src/app/jarvis/page.tsx:15-21) alors que Free annonce « JARVIS limité (1 persona) », et rien ne compte les « 3 simulations / mois ».

**Comment ça casse**

Un visiteur convaincu clique « Passer Pro » → il arrive sur /login → il crée son compte → il est redirigé vers / (login/page.tsx:36) → il obtient le plan gratuit, sans jamais voir d'écran de paiement, sans facture, sans mention de son abonnement. Le fondateur ne peut encaisser aucun euro, et l'utilisateur croit avoir souscrit.

**Correction**

Court terme (encaisser dès maintenant) : remplacer ctaLink par un lien Stripe Payment Link / Checkout hébergé et stocker le plan dans le profil Firestore via webhook. Minimum viable si le paiement n'est pas prêt : transformer les cartes Pro/Pro Max en formulaire de liste d'attente (capture d'email) au lieu d'un lien vers /login, et retirer les limites Free annoncées tant qu'elles ne sont pas implémentées.

---

### Le SDK client Firebase Auth + Firestore (444 Ko bruts / 135 Ko gzip) est chargé sur les 56 pages SEO statiques qui ne l'utilisent jamais

**Où** : `src/lib/firebase.ts:75` · **Catégorie** : bundle-size

**Le problème**

`src/lib/firebase.ts` importe statiquement `firebase/auth` (l.7-20) ET `firebase/firestore` (l.21-32), puis appelle `initializeApp` / `getAuth` / `getFirestore` au niveau module (l.75-83). Ce module est importé par `AuthContext.tsx:11`, monté dans le layout racine (`layout.tsx:137`). Conséquence mesurée sur le build : le HTML de `/visa/portugal` (Server Component pur, sans aucune interactivité) charge 15 chunks `<script async>`, dont `1b-x2j_ylzeo3.js` = 336 Ko bruts / 103 Ko gzip (contient `firestore.googleapis.com`, `Firestore` ×25, `IndexedDbPersistence`, `signInWithPopup`) et `23eotsjsuj73i.js` = 108 Ko bruts / 32 Ko gzip (contient `identitytoolkit`, `onAuthStateChanged`). Total pour la page : 1 525 Ko bruts / 468 Ko gzip. Firestore n'est utilisé nulle part sur ces pages : les seules requêtes client sont dans page.tsx:216 et visa/page.tsx:36, deux routes authentifiées.

**Comment ça casse**

Un visiteur arrive depuis Google sur `/visa/portugal` ou `/maroc/marrakech` (56 pages générées par `generateStaticParams`, cœur de la stratégie SEO programmatique). La page est du HTML statique pur — LCP potentiel < 1 s. Elle télécharge malgré tout 135 Ko gzip / 444 Ko bruts de SDK Firebase, qu'elle parse et exécute (Firestore instancie son moteur de persistance IndexedDB au chargement du module). Sur un mobile 4G milieu de gamme cela représente ~0,4-1,2 s de téléchargement + ~400-800 ms de parse/exécution main-thread purement gaspillés, qui bloquent le thread principal pendant la fenêtre de mesure de l'INP et retardent le LCP.

**Correction**

Scinder `firebase.ts` en `firebase-auth.ts` et `firebase-firestore.ts`, et charger Firestore paresseusement (`const { getFirestore } = await import('firebase/firestore')`) uniquement dans les composants qui lisent des documents. Mieux : sortir `<AuthProvider>` du layout racine et ne l'appliquer qu'à un `(app)` route group contenant les pages authentifiées, en laissant `/`, `/visa/*` et `/maroc/*` hors de ce groupe. Cela retire ~135 Ko gzip du chemin critique des 56 pages SEO.

---

### Succession Fara'id : aucune réduction proportionnelle ('awl) — les parts affichées totalisent 112,5 % / 125 %

**Où** : `src/lib/maroc-succession.ts:123` · **Catégorie** : correctness

**Le problème**

Les parts fixes (conjoint 1/8 ou 1/4, mère 1/6, père 1/6, filles 1/2 ou 2/3) sont empilées dans `shares` sans jamais vérifier que leur somme <= 1. Le seul garde-fou est `const residue = Math.max(0, 1 - allocated)` (l.123) qui borne le RELIQUAT à 0, mais ne corrige jamais les fractions déjà poussées. Le cas classique de « 'awl » (عول, réduction proportionnelle quand la somme des parts coraniques dépasse l'unité) n'est pas implémenté, et ces configurations ne sont pas non plus renvoyées vers `requiresExpert`. Vérifié en rejouant la fonction : les parts affichées à l'utilisateur ne totalisent pas 100 %.

**Comment ça casse**

Sur /maroc/succession, état par défaut (défunt homme, épouse, mère vivante, 2 filles) puis un seul clic sur « Père vivant ? → Oui ». computeSuccession renvoie Épouse 12.5 %, Mère 16.7 %, Père 16.7 %, Filles 66.7 % → total 112,5 %. En passant le défunt sur « femme » : Époux 25 %, Mère 16.7 %, Père 16.7 %, Filles 66.7 % → total 125 %. Le droit successoral applique ici l'awl (base 24 → 27, resp. base 12 → 15) : l'épouse doit recevoir 3/27 ≈ 11,1 % et non 12,5 %, les filles 16/27 ≈ 59,3 % et non 66,7 %. Chaque nombre affiché est faux, et la page les présente avec barres de progression et sources légales.

**Correction**

Après avoir construit les parts fixes, calculer `const total = shares.reduce((s, x) => s + x.fraction, 0)`. Si `total > 1 + 1e-9`, appliquer l'awl : `shares.forEach(s => s.fraction /= total)`, ajouter une note explicite (« somme des parts coraniques > 1 → réduction proportionnelle (awl), base X → Y ») et ne pas afficher de reliquat. À défaut d'implémenter l'awl, renvoyer `{ shares: null, requiresExpert: true }` pour ces configurations plutôt que d'afficher des pourcentages faux. Ajouter un test qui vérifie `somme(fractions) === 1` sur les 2^4 × 6 × 6 combinaisons d'entrées possibles.

---


## 🟠 ÉLEVÉ

### Le service worker échoue son installation à chaque visite : /manifest.json et /offline n'existent pas, cache.addAll rejette

**Où** : `public/sw.js:4` · **Catégorie** : network-waste

**Le problème**

`PRECACHE_URLS = ["/", "/manifest.json", "/offline"]` (l.4-10) est passé à `cache.addAll()` dans le handler `install` (l.15-17), lui-même enveloppé dans `event.waitUntil`. Or `/manifest.json` n'est pas une route de l'app : `src/app/manifest.ts` est un route handler servi sur `/manifest.webmanifest` (le commentaire de layout.tsx:75-78 documente précisément ce 404). Et `/offline` n'existe pas non plus : aucun dossier `offline` dans `src/app/`, et aucune entrée `/offline` dans la sortie de `next build` (92 pages générées, `/offline` absent). `cache.addAll()` rejette dès qu'UNE seule requête renvoie un statut non-ok ; deux des trois URLs renvoient 404. L'installation échoue donc systématiquement et le SW n'atteint jamais l'état `activated`.

**Comment ça casse**

À chaque chargement de page, `ServiceWorker.tsx:9-11` appelle `navigator.serviceWorker.register('/sw.js')`. Le navigateur télécharge et évalue sw.js (5,2 Ko), exécute `install`, émet 3 requêtes réseau supplémentaires dont 2 se soldent par un 404, puis jette le worker. Comme l'installation a échoué, l'enregistrement est retenté au chargement suivant — indéfiniment. Coût net par page vue : 1 requête sw.js + 3 requêtes de precache (2 en 404) en concurrence avec les ressources critiques, plus une erreur console. Bénéfice net : zéro — aucune mise en cache, aucun mode hors-ligne, aucun background sync, aucune push notification (les handlers `sync`/`push` de sw.js:78 et suivants ne sont jamais enregistrés). La PWA annoncée est entièrement non fonctionnelle.

**Correction**

Remplacer `PRECACHE_URLS` par `["/", "/manifest.webmanifest"]` et créer réellement `src/app/offline/page.tsx` avant de le référencer. Rendre le precache tolérant aux échecs : `Promise.allSettled(PRECACHE_URLS.map(u => cache.add(u)))` au lieu de `cache.addAll`. ATTENTION avant de corriger : la règle catch-all `cache-first` de sw.js:65-75 sert le HTML depuis le cache sans revalidation, et `CACHE_NAME` est une constante figée (`"odyssey-v11-cache-v1.0.1"`, l.1) qui ne change pas au déploiement — une fois le SW réparé, tout visiteur récurrent recevrait indéfiniment le HTML d'un ancien build, dont les `<script src="/_next/static/chunks/<hash>.js">` finiraient en 404 après un redeploy Vercel. Passer cette règle en network-first (ou stale-while-revalidate) pour les navigations, et n'appliquer cache-first qu'à `/_next/static/*` (immuable par hash).

---

### /api/dashboard : 3 allers-retours Firestore sérialisés, lecture non bornée de `simulations` pour un simple compte, et 100 lectures de `posts` globales par appel

**Où** : `src/app/api/dashboard/route.ts:44` · **Catégorie** : waterfall

**Le problème**

Les trois blocs de la route sont indépendants mais `await`és l'un après l'autre : profil (l.26), simulations (l.44-47), posts (l.59-63) — chacun rappelant `await serverDb()` séparément (l.25, 43, 58). Deux problèmes supplémentaires : (a) l.44-48 fait `.collection('simulations').where('user_id','==',uid).get()` SANS `limit()` et n'utilise ensuite que `simsSnap.size` — tous les documents sont lus et transférés pour obtenir un entier, alors que l'Admin SDK expose `.count()` (agrégation, 1 unité de lecture) ; (b) l.59-63 lit les 100 derniers posts de TOUTE l'application (aucun `where('user_id', ...)`) puis filtre en JS sur 7 jours (l.66-68) — 100 lectures Firestore facturées à chaque affichage du dashboard pour produire un seul nombre.

**Comment ça casse**

Un utilisateur ayant lancé 300 simulations ouvre le dashboard. La route effectue : 1 lecture de profil, puis 300 lectures de documents `simulations` (sérialisées après la première), puis 100 lectures de `posts`. Soit 401 lectures Firestore et 3 allers-retours réseau en série depuis la fonction Vercel (~40-80 ms chacun, donc ~150-250 ms de TTFB au lieu des ~80 ms d'un `Promise.all`), plus le transfert de 300 documents de simulation complets côté serveur. Le coût croît linéairement avec l'usage : à 2 000 simulations, la route lit 2 100 documents par affichage de page d'accueil et risque le timeout de la fonction.

**Correction**

Paralléliser : `const [profileSnap, simsAgg, postsAgg] = await Promise.all([...])` avec un `serverDb()` unique. Remplacer l.44-48 par une agrégation : `.where('user_id','==',uid).count().get()`. Remplacer l.59-68 par une requête bornée côté serveur : `.where('created_at','>=', weekAgo.toISOString()).count().get()` (nécessite un index simple sur `created_at`, ou composite si l'on ajoute `user_id`, à déclarer dans firestore.indexes.json).

---

### Le prompt système interdit à JARVIS de se présenter comme une IA, lui ordonne de donner « des chiffres précis » et ne lui donne aucune consigne de refus ni disclaimer fiscal

**Où** : `src/app/api/jarvis/route.ts:57` · **Catégorie** : transparence-ia

**Le problème**

Trois instructions se combinent mal sur un produit de conseil visa/fiscalité. (1) Ligne 57 : « 10. Ne mentionne JAMAIS que tu es une IA ou un modèle de langage. » (2) Ligne 30, persona `strategist` — celle par défaut quand `persona` est absent, cf. ligne 288 `PERSONAS[persona] || PERSONAS.strategist` : « Tu maîtrises la fiscalité internationale, l'optimisation patrimoniale, les visas […] Tu donnes des chiffres précis ». (3) Ligne 51 : « 7. Utilise des metrics/chiffres quand pertinent. » J'ai relu l'intégralité de SYSTEM_PROMPT (lignes 44-72) : il ne contient aucune consigne de refus en cas d'incertitude, aucune obligation de citer une source, et aucun disclaimer imposé dans la sortie — alors même que le contexte injecté (getMarocKnowledge, ligne 283) est composé d'estimations. Côté UI, le seul garde-fou est src/app/jarvis/page.tsx:344, « J.A.R.V.I.S. peut faire des erreurs. Vérifiez les informations critiques. » — un avertissement générique de chatbot, qui ne dit pas que la réponse n'est ni un conseil juridique ni un conseil fiscal. À noter au crédit du projet : la branche sans provider configuré (lignes 348-367) est exemplaire, elle refuse de répondre plutôt que d'inventer.

**Comment ça casse**

Un utilisateur demande « Combien vais-je payer d'impôts au Maroc avec 4000 € de revenus freelance ? ». La persona par défaut est le Stratège, à qui l'on demande des « chiffres précis » sans jamais l'autoriser à dire qu'il ne sait pas. Le modèle produit un montant chiffré, sur un ton d'expert, sans se présenter comme une IA ni signaler qu'il ne s'agit pas d'un conseil fiscal. L'utilisateur provisionne ce montant et se retrouve en écart au moment de la déclaration.

**Correction**

Supprimer la règle 10 (elle est en outre incompatible avec l'obligation de transparence de l'AI Act art. 50 pour un système conversationnel destiné au public). Ajouter au SYSTEM_PROMPT une règle explicite : « Sur les visas, la fiscalité et la succession, ne donne un chiffre que s'il figure dans la base de connaissances injectée ; sinon dis que tu ne l'as pas et renvoie vers la source officielle. Termine toute réponse chiffrée par : information indicative, ni un conseil juridique ni un conseil fiscal. » Remplacer le disclaimer de jarvis/page.tsx:344 par cette formulation.

---

### /api/jarvis : identité anonyme dérivée de l'IP → mémoire personnelle (revenus, métier, localisation) partagée entre utilisateurs distincts

**Où** : `src/app/api/jarvis/route.ts:183` · **Catégorie** : broken-access-control

**Le problème**

C'est la seule route IA sans `authenticateRequest`. Quand aucun token n'est présent, l'identité de l'appelant devient `anon:<ip>` (route.ts:180-184). Cette chaîne sert ensuite de clé à trois stores en mémoire : `getMemoryContext(userId)` (route.ts:288), `getContextForQuery(userId, ...)` (route.ts:289), `getCachedResponse(messages, persona, userId)` (route.ts:264) et `updateMemory(userId, ...)` (route.ts:333). Or `updateMemory` (src/lib/ai-engine.ts:158-217) extrait et stocke explicitement la localisation, le revenu (`je gagne … €`), la profession, les objectifs, les allergies et un résumé de 120 caractères du dernier message ; `getMemoryContext` (src/lib/ai-engine.ts:120-156) réinjecte tout cela dans le prompt système (route.ts:299). Deux visiteurs déconnectés qui sortent par la même IP publique — CGNAT opérateur mobile, réseau d'entreprise, université, VPN — sont donc le même « utilisateur » pour le serveur. Le commentaire route.ts:177-179 affirme l'inverse (« ne partagent jamais … ni, pire, leur mémoire conversationnelle (fuite de données inter-utilisateurs) ») : le scoping par IP ne supprime pas la fuite, il la restreint à l'IP. Même chose pour le quota : tous les anonymes d'une IP partagent UN bucket de 20/min (route.ts:191-197), donc un seul visiteur bloque tous les autres du même réseau. Enfin, les faits mémorisés étant réinjectés dans le prompt système d'un autre utilisateur, un message d'A survit comme instruction persistante pour B (injection stockée) : `checkPromptInjection` (route.ts:222) ne filtre que le message entrant, pas la mémoire restituée.

**Comment ça casse**

Alice, déconnectée, sur l'IP 196.64.x.x d'un opérateur mobile marocain : POST /api/jarvis « je gagne 4500€, j'habite à Casablanca, je travaille comme médecin ». `updateMemory` écrit knowledgeStore["anon:196.64.x.x"] = {profession: 'médecin', location: 'Casablanca', incomeLevel: '4500€'}. Bob, déconnecté, même IP de sortie, même instance lambda : POST /api/jarvis « que sais-tu de moi ? ». `getMemoryContext("anon:196.64.x.x")` renvoie « [Profil] Profession: médecin | Localisation: Casablanca | Revenus: 4500€ », ce bloc est concaténé dans `fullSystemPrompt` (route.ts:291-303) et le modèle récite à Bob les données d'Alice.

**Correction**

Ne jamais dériver une identité de stockage d'une valeur réseau. Soit exiger `authenticateRequest` sur /api/jarvis comme sur /api/agent/* (les autres routes IA le font déjà, et apiFetch attache le token quand l'utilisateur est connecté — src/lib/api-client.ts:44), soit émettre côté serveur un identifiant de session opaque (cookie httpOnly + Secure + SameSite=Lax, valeur aléatoire 128 bits) et utiliser CE identifiant comme clé de knowledgeStore / graph-rag / cache. Garder l'IP uniquement comme clé de rate limiting, jamais comme clé de données. En complément : ne pas alimenter la mémoire du tout pour les appelants non authentifiés.

---

### Fuite de mémoire conversationnelle entre utilisateurs anonymes partageant une IP (NAT / CGNAT)

**Où** : `src/app/api/jarvis/route.ts:183` · **Catégorie** : data-leak

**Le problème**

Quand aucun token Firebase valide n'est fourni, la route dérive une identité de l'IP : `userId = \`anon:${ip}\`` (l.180-184). Cet identifiant sert ensuite de clé à trois stockages persistants côté serveur : le cache de réponses `getCachedResponse(messages, persona, userId)` (l.264), la mémoire heuristique `updateMemory/getMemoryContext` (src/lib/ai-engine.ts:123, 158) qui extrait et conserve localisation, salaire, métier, contraintes alimentaires, et le graphe `updateGraphFromConversation` (src/lib/graph-rag.ts:305-318). Or une IP publique n'identifie pas une personne : NAT d'entreprise, WiFi de café, CGNAT mobile regroupent des milliers d'utilisateurs distincts derrière la même adresse. Le contenu de ces stockages est réinjecté dans `fullSystemPrompt` (l.299-300) pour l'appelant suivant.

**Comment ça casse**

Deux collègues non connectés utilisent J.A.R.V.I.S. depuis le même bureau. A écrit « j'habite à Casablanca, je gagne 4500 € et je suis allergique aux arachides » : `updateMemory` enregistre `profile.location`, `profile.incomeLevel` et une contrainte alimentaire sous `anon:203.0.113.7`. B, depuis le même réseau, pose une question sans rien avoir dit : le prompt système contient « [Profil] Localisation: Casablanca | Revenus: 4500 € » et le modèle répond en s'appuyant dessus, voire le restitue. Sur une question strictement identique, B reçoit même directement la réponse mise en cache pour A (X-Cache: HIT).

**Correction**

Ne pas utiliser l'IP comme identité de données : garder `anon:<ip>` uniquement pour le compteur de rate-limit, et n'activer mémoire, graphe et cache personnalisé que pour un `uid` authentifié (`if (!authenticatedUid) { pas de getMemoryContext, pas de getContextForQuery, pas de setCachedResponse }`). À défaut, émettre un identifiant anonyme opaque en cookie httpOnly par navigateur.

---

### /api/language : N+1 Firestore séquentiel — une requête par profil dans une boucle for, sans limit()

**Où** : `src/app/api/language/route.ts:26` · **Catégorie** : n-plus-one

**Le problème**

Le GET lit d'abord tous les `language_profiles` de l'utilisateur (l.19-22), puis boucle dessus avec `for (const profile of profiles)` et exécute à l'intérieur un `await db.collection(LANGUAGE_PROGRESS).where('user_id','==',uid).where('language','==',profile.target_language).orderBy('next_review_at','asc').get()` (l.27-32). Les N requêtes sont sérialisées par l'`await` dans la boucle, et aucune ne porte de `limit()` — contrairement au POST du même fichier qui, lui, borne à 20 (l.92). Toutes les cartes SRS de toutes les langues sont ensuite concaténées dans une seule réponse JSON (l.33).

**Comment ça casse**

Un utilisateur qui apprend 3 langues et a accumulé 800 cartes de révision par langue ouvre /language. La route émet 1 + 3 = 4 requêtes Firestore strictement séquentielles (~40-80 ms chacune, soit ~200-320 ms de TTFB au lieu de ~80 ms si les 3 étaient parallélisées), lit 2 400 documents et sérialise un JSON de plusieurs mégaoctets que le navigateur doit télécharger et parser sur le thread principal avant d'afficher quoi que ce soit. Avec 5 langues et 2 000 cartes, la route dépasse le budget mémoire de la fonction Vercel.

**Correction**

Supprimer la boucle : `language` est déjà filtré par `user_id`, donc une seule requête `where('user_id','==',uid).orderBy('next_review_at','asc').limit(N)` suffit et couvre toutes les langues (l'index `(user_id, next_review_at)` existe déjà dans firestore.indexes.json). Si un découpage par langue est réellement nécessaire, remplacer la boucle par `await Promise.all(profiles.map(p => ...))` et ajouter un `.limit(50)` à chaque branche.

---

### Six calques fixes plein écran superposés en permanence, dont un `mix-blend-mode: overlay` à z-index 9999 qui casse la composition du scroll

**Où** : `src/app/globals.css:278` · **Catégorie** : rendering-cost

**Le problème**

Le layout racine rend inconditionnellement `.mesh-bg` + 2 `.mesh-blob` + `.tech-grid` + `.noise` (layout.tsx:144-149), auxquels s'ajoutent `body::before` (l.256-268, 3 dégradés radiaux en `color-mix`) et `body::after` (l.270-279). Cela fait six calques `position: fixed; inset: 0` sur chaque page. Le pire est `body::after` : `z-index: 9999` + `mix-blend-mode: overlay` + un `background-image` `feTurbulence` SVG inline. Un `mix-blend-mode` sur un élément couvrant tout le viewport force le navigateur à rastériser tout le contenu situé en dessous dans une texture puis à recalculer le mélange — ce qui annule l'isolation des couches GPU. Comme l'élément est `fixed` alors que le contenu défile en dessous, le mélange doit être recalculé à chaque frame de scroll. À noter également : `.noise` (l.411-418) affiche exactement le même bruit `feTurbulence` que `body::after` — le calque est dupliqué, donc payé deux fois pour un effet quasi invisible (opacités 0.025 et 0.03).

**Comment ça casse**

Sur un Android milieu de gamme, un visiteur fait défiler /maroc ou /visa/portugal. Chaque frame de scroll exige : re-rastérisation du viewport complet pour le mélange `overlay` de body::after, plus le rendu des deux filtres SVG feTurbulence, plus les deux blobs floutés (blur 120px sur jusqu'à 900×900 px). Le scroll ne peut plus être délégué au compositeur et retombe sur le thread principal — jank visible et frames longues pendant la fenêtre de mesure de l'INP (seuil « good » = 200 ms). Aucun de ces calques ne porte d'information : ils sont purement décoratifs, à des opacités entre 0,015 et 0,14.

**Correction**

Supprimer `body::after` entièrement (il fait doublon avec `.noise`, qui suffit et ne mélange pas). Ne jamais utiliser `mix-blend-mode` sur un élément fixe plein écran. Fusionner `body::before` et `.mesh-bg` en un seul calque, et remplacer `filter: blur(120px)` par un dégradé radial pré-flouté (même rendu visuel, coût de rastérisation nul). Passer les calques restants derrière une media query `(min-width: 768px)` ou `@media (prefers-reduced-transparency: no-preference)` pour les retirer sur mobile.

---

### /language : le « Test de niveau » et le mode Dialogue sont des maquettes non fonctionnelles

**Où** : `src/app/language/page.tsx:464` · **Catégorie** : dead-feature

**Le problème**

Trois fonctionnalités annoncées dans l'UI ne font rien. (1) Le bouton « Test de niveau » (page.tsx:300) ouvre un écran promettant « un test adaptatif de 10 minutes » dont le bouton « Start Assessment » a pour seul handler `onClick={() => setLearningMode('idle')}` (page.tsx:464-466) : il referme l'écran. (2) Le mode Dialogue affiche une conversation entièrement codée en dur en anglais (page.tsx:226-251) ; le champ de réponse n'a ni `value` ni `onChange` et le bouton d'envoi n'a aucun `onClick` (page.tsx:255-263). Cliquer n'importe lequel des 3 scénarios (« Commander au restaurant », « Aéroport ») ouvre toujours le même faux entretien d'embauche (page.tsx:425). (3) L'onglet « Progrès » affiche un placeholder en anglais « Detailed Analytics … will appear here » (page.tsx:447-451). Note : l'API /api/language expose bien les actions `placement_test` et `roleplay_message`, jamais appelées par la page.

**Comment ça casse**

Un utilisateur clique « Test de niveau », lit « Passe un test adaptatif de 10 minutes », clique « Start Assessment » → il est renvoyé au tableau de bord sans qu'aucune question ne lui soit posée. Il ouvre alors « Dialogue » → « Commander au restaurant » → il tombe sur un entretien d'embauche en anglais déjà écrit, tape sa réponse, appuie sur envoyer : rien ne se passe, le texte reste dans le champ.

**Correction**

Brancher les deux boutons sur les actions déjà présentes dans /api/language (`placement_test`, `roleplay_message`) avec état local des messages ; en attendant, retirer les entrées « Test de niveau » et « Dialogue » de l'UI plutôt que d'exposer des écrans morts.

---

### /language : un utilisateur connecté voit son profil de langue vide après un rechargement

**Où** : `src/app/language/page.tsx:50` · **Catégorie** : auth-race

**Le problème**

L'effet de chargement s'exécute une seule fois au montage (`useEffect(..., [])`, page.tsx:50-75) et sort immédiatement si `isSignedIn()` est faux (page.tsx:53). Or `isSignedIn()` lit `getAuth().currentUser` de façon synchrone (src/lib/api-client.ts:62-68), et Firebase restaure la session de manière asynchrone : au premier rendu `currentUser` est toujours `null` (cf. AuthContext qui démarre à `loading: true`, src/contexts/AuthContext.tsx:24). Aucune dépendance `user` ne relance le fetch — exactement le bug corrigé dans /skills, où l'effet dépend de `user` avec le commentaire explicite (src/app/skills/page.tsx:69-73).

**Comment ça casse**

Un utilisateur connecté avec 40 cartes et 12 jours de série ouvre /language directement (favori, lien de la sidebar après un F5) : la page affiche « English / A1 / 0 jours d'affilée / 0 XP » et « Tu as 0 cartes à réviser aujourd'hui », puis reste ainsi indéfiniment. Il croit avoir perdu sa progression.

**Correction**

Utiliser `const { user } = useAuth()` et mettre `[user]` en dépendance de l'effet (comme dans skills/page.tsx:71-73), en gardant l'état `isLoading` tant que `loading` du contexte est vrai.

---

### /language ne charge jamais les données après un rechargement de page (session Firebase non encore résolue)

**Où** : `src/app/language/page.tsx:75` · **Catégorie** : race-condition

**Le problème**

L'effet de chargement a `[]` comme tableau de dépendances et appelle `isSignedIn()` (l.53), qui lit `getAuth().currentUser` de façon synchrone. Firebase Auth restaure la session depuis IndexedDB de manière asynchrone : au premier rendu après un rechargement, `currentUser` est null. L'effet part donc dans la branche `setIsLoading(false); return;`, et comme il ne dépend d'aucune valeur qui change à la résolution de la session, il n'est jamais rejoué. Le même piège avait été identifié et corrigé sur /skills (src/app/skills/page.tsx:70-72 : « this ran once on mount, before Firebase had resolved the session, and never re-ran — so a signed-in user saw an empty page »), mais pas ici.

**Comment ça casse**

Un utilisateur connecté fait F5 sur /language (ou arrive par un lien externe / une notification). La page affiche le profil par défaut codé en dur (l.37-40 : niveau A1, 0 XP, 0 jour de série) et « Aucune carte à réviser. Crée d'abord un profil de langue. » alors que ses cartes SRS existent en base. Ses XP et son streak réels ne s'affichent pas, et la progression du jour est calculée sur 0 XP. Naviguer depuis le dashboard en client-side donne au contraire le bon résultat, ce qui rend le bug intermittent et difficile à signaler.

**Correction**

Récupérer l'utilisateur via `useAuth()` et faire dépendre l'effet de lui : `const { user } = useAuth(); useEffect(() => { ... }, [user]);` — exactement le correctif appliqué dans src/app/skills/page.tsx:71. Idem pour `fetchReviewCards` (l.99) qui a aussi `[]`. Vérifier au passage src/lib/hooks.ts:379 (`useSimulations`) qui lit `getAuth().currentUser` dans un effet `[]` et souffrira du même défaut dès qu'il sera branché à une page.

---

### « Alertes auto » de visa : la permission de notification est demandée, aucune notification n'est jamais envoyée

**Où** : `src/app/page.tsx:229` · **Catégorie** : broken-promise

**Le problème**

Le tableau de bord appelle `NotificationEngine.requestPushPermission()` dès le montage, sans geste utilisateur ni explication (page.tsx:228-230). Or `sendLocalNotification` (src/lib/notification-engine.ts:39) n'est appelée nulle part dans le code (grep sur tout src/ : seule sa définition apparaît), aucun abonnement push n'est créé (aucun `pushManager.subscribe` dans src/ ni dans public/sw.js) et aucun job serveur n'envoie de push — le listener `push` de public/sw.js:130 ne peut donc jamais se déclencher. La landing promet pourtant « Ne rate plus une date limite. Alertes auto » (MarketingLanding.tsx:157).

**Comment ça casse**

L'utilisateur se connecte, une popup navigateur « odyssey-ai.app souhaite vous envoyer des notifications » s'ouvre avant même qu'il ait compris la page. Il accepte parce qu'on lui a vendu les alertes d'expiration de visa, enregistre un séjour Schengen de 90 jours… et ne reçoit jamais la moindre alerte, y compris le jour de l'expiration.

**Correction**

Ne demander la permission qu'au moment où l'utilisateur ajoute un visa (geste explicite + contexte), et implémenter réellement l'échéancier (Cloud Function quotidienne comparant `entry_date + max_stay_days` et envoyant le push). Sinon, retirer « Alertes auto » de la landing et l'appel à requestPushPermission.

---

### Safe-Zone : toute erreur API est annoncée à l'utilisateur comme « contenu toxique détecté »

**Où** : `src/app/safezone/page.tsx:120` · **Catégorie** : error-handling

**Le problème**

`handlePost` met `modResult = "error"` dès que `!res.ok` (page.tsx:120-123) et dans le `catch` réseau (page.tsx:136-137). Or le rendu ne distingue que `success` du reste : toute autre valeur affiche « ALERTE: FRÉQUENCE TOXIQUE DÉTECTÉE. ANNULATION. » (page.tsx:270-271). La route POST /api/posts renvoie 401 si l'utilisateur n'est pas authentifié (src/app/api/posts/route.ts:73-79), 429 en cas de limite de débit (route.ts:68) et 500 en cas d'erreur Firestore — et la page /safezone est accessible sans être connecté (aucun garde d'auth, aucun lien de connexion dans le composer, qui affiche même un avatar).

**Comment ça casse**

Un visiteur non connecté découvre la Safe-Zone, écrit son retour d'expérience sur Lisbonne, clique « Publier » : le serveur répond 401, l'écran lui répond en majuscules qu'il vient d'écrire un contenu toxique et que sa publication est annulée. Il est accusé à tort et n'apprend jamais qu'il fallait se connecter.

**Correction**

Distinguer les états : 401 → « Connecte-toi pour publier » + lien vers /login ; 429 → « Trop de publications, réessaie dans X s » ; `data.moderation.is_verified === false` → seul cas qui affiche le message de modération ; autre → « Échec de l'envoi, réessaie ».

---

### /simulator : l'échec de « Sauvegarder cette comparaison » n'affiche rien du tout

**Où** : `src/app/simulator/page.tsx:96` · **Catégorie** : silent-failure

**Le problème**

`handleSave` positionne `setSaveStatus("error")` en cas de réponse non-OK (page.tsx:96) ou d'exception (page.tsx:97), mais le rendu du bouton ne traite que trois cas : `isSaving`, `saveStatus === "saved"`, et sinon l'état par défaut (page.tsx:130-134). La valeur `"error"` n'est lue nulle part dans le JSX. La route POST /api/simulator exige une authentification (`authenticateRequest`, src/app/api/simulator/route.ts:60) alors que /simulator est entièrement accessible sans compte.

**Comment ça casse**

Un visiteur non connecté compare France/Portugal, clique « Sauvegarder cette comparaison » : le bouton passe en « Calcul… » puis revient à son libellé initial. Le serveur a répondu 401, l'utilisateur ne voit ni erreur, ni invitation à se connecter, et croit que sa comparaison est enregistrée. Il ne la retrouvera jamais.

**Correction**

Rendre l'état d'erreur (message sous le bouton) et traiter le 401 par un appel à l'action « Connecte-toi pour sauvegarder » pointant vers /login — c'est le meilleur moment de conversion de toute l'app.

---

### /simulator/predict : blocage définitif sur l'écran « Simulation en cours… » en cas d'erreur API

**Où** : `src/app/simulator/predict/page.tsx:124` · **Catégorie** : dead-end

**Le problème**

`runSimulation` passe l'écran en `step = "simulating"` (page.tsx:109) puis fait `const data = await res.json(); if (data.prediction) { setResult(...); setStep("results"); }` (page.tsx:124-128). Le statut HTTP n'est jamais vérifié et il n'existe aucune branche `else`. Le bloc `catch` (page.tsx:129-131) se contente d'un `console.error`. L'écran « simulating » (page.tsx:461-489) n'a ni bouton retour, ni message d'erreur, ni timeout. La route /api/simulation/predict renvoie un JSON sans champ `prediction` sur 429 (enforceRateLimit, route.ts:114) comme sur 500 (route.ts:214).

**Comment ça casse**

L'utilisateur remplit sa question, son profil, ses compétences, clique « Lancer la simulation », et tombe sur la limite de débit (ou une erreur serveur) : le spinner « Simulation en cours… » tourne pour toujours, le sous-titre bascule en « Génération du rapport… » (car `isSimulating` repasse à false) et rien n'arrive jamais. Seul un rechargement complet permet d'en sortir — et toute la saisie est perdue.

**Correction**

Tester `res.ok` et l'absence de `data.prediction` : afficher un état d'erreur avec le message serveur et un bouton « Réessayer » qui revient à `step = "profile"` (les données saisies sont déjà en state).

---

### La page de prédiction reste bloquée en « Simulation en cours… » pour toujours dès que l'API ne répond pas 201

**Où** : `src/app/simulator/predict/page.tsx:125` · **Catégorie** : error-handling

**Le problème**

runSimulation fait `setStep("simulating")` puis, après la réponse, ne quitte cet état que dans la branche `if (data.prediction)`. Toute réponse non nominale (400 validation, 429 rate-limit, 500, 503) produit un JSON sans champ `prediction` : aucun `else`, aucun `setStep`, aucun message. Le `catch` (l.129-131) se contente d'un console.error. Le `finally` remet `isSimulating` à false, ce qui change juste le sous-titre du spinner de « Les agents interagissent… » à « Génération du rapport… » — l'écran de chargement reste affiché indéfiniment, sans bouton de retour (les boutons « Retour » n'existent que dans les étapes query/profile).

**Comment ça casse**

L'utilisateur saisit une question de 9 caractères (« Portugal? »). Le garde-fou client ne teste que `query.trim()` non vide (l.106) alors que CreatePredictionSchema exige `query: z.string().min(10)` (src/lib/validation.ts:82) → la route renvoie 400 « Validation failed ». La page affiche le cercle animé « Simulation en cours… » pour l'éternité ; seul un rechargement complet permet d'en sortir, et l'utilisateur ne sait pas pourquoi. Même effet avec un budget négatif tapé au clavier (`z.number().min(0)`) ou après 20 requêtes/minute (429 via enforceRateLimit).

**Correction**

Tester `res.ok` avant tout : `if (!res.ok) { const body = await res.json().catch(() => null); setError(body?.error ?? "Simulation impossible"); setStep("profile"); return; }`, ajouter un `else { setStep("profile"); setError(...) }` pour le cas `data.prediction` absent, et faire de même dans le `catch`. Aligner la validation client sur le schéma (min 10 caractères sur la question, `min={0}` sur les inputs budget/revenu).

---

### La date de « dernière mise à jour » des guides visa et villes est `new Date()` : elle affiche toujours aujourd'hui, quelle que soit l'ancienneté réelle des données

**Où** : `src/app/visa/[country]/page.tsx:162` · **Catégorie** : fraicheur-fabriquee

**Le problème**

Le pied de page affiche « Informations indicatives mises à jour {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} ». La date est calculée au rendu, pas stockée avec la donnée : elle vaudra toujours le mois courant même si src/lib/visa-countries.ts n'a pas été touché depuis des mois (mtime du fichier : 12 mai). Même défaut sur src/app/maroc/[ville]/page.tsx:109 (« estimations {new Date()...} »). Le problème s'étend au balisage machine : ligne 52, le JSON-LD Article déclare `datePublished: new Date().toISOString()`, et ligne 17 le <title> injecte `${new Date().getFullYear()}`. Aucun des 50 pays de VISA_COUNTRIES ne porte de champ `lastVerified` ni `source`. C'est exactement l'inverse de ce que fait le bon module du repo, src/lib/maroc-veille.ts, qui porte `dateIso`, `source` et `confidence` par item (lignes 100-103) et affiche une date figée « 28 juin 2026 » (src/app/maroc/veille/page.tsx:165).

**Comment ça casse**

Le seuil de revenu Portugal (3480 €, visa-countries.ts:20) devient obsolète après une revalorisation. Personne ne touche au fichier. Un utilisateur ouvre /visa/portugal en janvier 2027 : la page annonce « Informations indicatives mises à jour janvier 2027 », le titre dit « Visa digital nomad Portugal 2027 » et Google reçoit datePublished=2027-01-xx. L'utilisateur constitue son dossier sur un montant périmé qu'on lui a certifié daté du mois même, et le rejet du consulat lui coûte plusieurs mois.

**Correction**

Ajouter `lastVerified: string` (date ISO figée, saisie à la main) et `source: string` sur le type VisaCountry et sur City, puis rendre `data.lastVerified` au lieu de `new Date()` — ici et sur maroc/[ville]/page.tsx:109 — et alimenter `datePublished`/`dateModified` du JSON-LD avec ce même champ. Ajouter un test qui échoue si une entrée a un `lastVerified` de plus de 12 mois.

---

### Les 52 pages SEO renvoient vers un simulateur qui ne gère pas leur pays

**Où** : `src/app/visa/[country]/page.tsx:123` · **Catégorie** : conversion-dead-end

**Le problème**

Chaque guide pays (52 pages générées, generateStaticParams ligne 8) se termine par le CTA « Lance une simulation pour {pays} — Compare fiscalité, coût de la vie et opportunités avec ton profil personnel » pointant vers /simulator (page.tsx:123-137). Or /simulator ne propose que 5 destinations codées en dur (Portugal, Dubaï, Maroc, Canada, Thaïlande — src/app/simulator/page.tsx:53-60) et n'accepte aucun profil. C'est également le seul CTA de la page : aucun lien d'inscription, aucun ajout au tracker.

**Comment ça casse**

Un visiteur arrive par Google sur /visa/estonie, lit le guide, clique « Simuler ma trajectoire → » : il atterrit sur un comparateur France↔Portugal/Dubaï/Maroc/Canada/Thaïlande où l'Estonie n'existe pas et où il ne peut rien saisir. Il repart. Sur 52 pages d'acquisition, 47 mènent à cette impasse, et aucune ne propose de créer un compte.

**Correction**

Passer le pays en paramètre (`/simulator?dest=estonie`) et étendre la liste des destinations du simulateur à visa-countries.ts ; ajouter sur ces pages un CTA d'inscription (« Suivre mon séjour en Estonie ») qui est le vrai objectif de conversion.

---

### La landing affirme « Données sourcées et datées » alors qu'aucun jeu de données du produit ne porte de source ni de date, sauf un

**Où** : `src/components/MarketingLanding.tsx:113` · **Catégorie** : allegation-fausse

**Le problème**

La promesse de confiance affichée sous le CTA principal est « ✓ Gratuit • ✓ Sans carte bancaire • ✓ Données sourcées et datées ». J'ai inspecté tous les jeux de données du produit : src/lib/visa-countries.ts (50 pays), src/lib/visa-data.ts (5 pays), src/lib/maroc-data.ts (6 villes + fiscalité), src/lib/maroc-transfert.ts (7 opérateurs), src/lib/expat-destinations.ts (destinations), src/app/simulator/page.tsx:53 (6 pays) — aucun ne possède de champ `source` ni de champ de date. Le seul module conforme est src/lib/maroc-veille.ts, qui porte bien `source`, `dateIso` et `confidence` par item (lignes 75-103). Partout ailleurs, les seules « dates » affichées sont calculées par `new Date()` au rendu (visa/[country]/page.tsx:162, maroc/[ville]/page.tsx:109), donc ni relevées ni vérifiables. L'allégation est donc fausse sur l'écrasante majorité du contenu, et elle est placée exactement là où elle sert à lever la méfiance de l'utilisateur avant qu'il ne consulte des informations fiscales.

**Comment ça casse**

Un visiteur hésite à faire confiance à un guide fiscal gratuit. Il lit « Données sourcées et datées », consulte /visa/espagne, y trouve « Revenu min 2762 €/mois » et « Taux fiscal 24 % » sans la moindre référence, et agit dessus en supposant qu'une source existe en coulisse. En droit de la consommation français, une allégation objective non étayée sur la qualité essentielle du service constitue une pratique commerciale trompeuse (L.121-2).

**Correction**

Retirer « ✓ Données sourcées et datées » tant que les datasets ne portent pas `source` + `lastVerified`, ou la remplacer par une formulation exacte (« ✓ Estimations transparentes, méthodologie publiée »). L'objectif cible : généraliser le modèle de maroc-veille.ts (source + dateIso + confidence) à visa-countries.ts, maroc-data.ts et au tableau du simulateur, puis restaurer l'allégation.

---

### La landing annonce des volumes de fonctionnalités contredits par le code : « 50 visas » pour un tracker qui en propose 5, « 50 pays » pour un simulateur qui en a 6

**Où** : `src/components/MarketingLanding.tsx:156` · **Catégorie** : allegation-fausse

**Le problème**

Trois affirmations chiffrées sont démenties par le code. (1) Ligne 156, le pilier Visa Tracker annonce « Schengen, D7, DTV, et 47 autres visas » et ligne 187 le tableau comparatif affiche « Visa Tracker | ✅ 50 visas ». Or la page /visa importe VISA_COUNTRIES depuis src/lib/visa-data.ts (src/app/visa/page.tsx:17), et VISA_DATABASE (visa-data.ts:12-18) ne contient que 5 pays : PT, TH, ID, JP, MX. Le sélecteur du formulaire (page.tsx:115-119) n'offre donc que 5 entrées. Les 50 entrées de src/lib/visa-countries.ts sont un tout autre fichier, qui n'alimente que les pages SEO statiques et n'est jamais importé par le tracker. (2) Ligne 149, le pilier Simulateur annonce « 50 pays, fiscalité réelle » alors que src/app/simulator/page.tsx:53-60 code en dur 6 pays. (3) Ligne 188, le tableau annonce « Bail mobilité FR | ✅ via SeLoger » : un grep de « seloger » sur tout src/ ne remonte que cette seule ligne — il n'existe aucune intégration, aucun appel, aucun composant.

**Comment ça casse**

Un visiteur s'inscrit spécifiquement parce que le tableau comparatif promet un Visa Tracker couvrant 50 visas et une intégration bail mobilité SeLoger. Il se connecte, ouvre /visa, découvre une liste déroulante de 5 pays (Portugal, Thaïlande, Indonésie, Japon, Mexique) et aucune fonctionnalité logement. La promesse ayant déterminé la conversion (et, sur le plan payant, l'achat), c'est un motif de remboursement et une pratique trompeuse.

**Correction**

Dériver les compteurs du code au lieu de les écrire en dur, comme c'est déjà bien fait lignes 19-20 et 126-127 (`VISA_COUNTRY_COUNT = VISA_COUNTRIES.length`) : utiliser `Object.keys(VISA_DATABASE).length` pour le pilier Visa Tracker et `countries.length` pour le simulateur. Supprimer la ligne 188 (SeLoger) tant que l'intégration n'existe pas. Idéalement, ajouter un test de garde qui échoue si un compteur littéral de la landing diverge de la longueur du dataset correspondant.

---

### clientIp() fait confiance en premier à CF-Connecting-IP, en-tête que Vercel ne pose ni ne supprime → rate limiting anonyme contournable par simple en-tête

**Où** : `src/lib/auth-middleware.ts:140` · **Catégorie** : rate-limiting-bypass

**Le problème**

`clientIp()` (auth-middleware.ts:138-151) lit `cf-connecting-ip` AVANT `x-vercel-forwarded-for` et `x-forwarded-for`. `CF-Connecting-IP` n'est pas un en-tête géré par la plateforme Vercel : il est simplement relayé tel quel depuis la requête entrante. La clé de quota devient donc `ip:<valeur choisie par l'appelant>` (auth-middleware.ts:182) dès qu'aucun Bearer valide n'est présent — ce qui est précisément le cas des routes ouvertes aux anonymes. Le commentaire du fichier (lignes 130-136) et le runbook (docs/runbooks/infrastructure.md:39-53) documentent le verrou nécessaire (Vercel Firewall limité aux plages Cloudflare, ou en-tête secret `X-Origin-Auth`), mais aucun code ne le vérifie : `grep -rn 'X-Origin-Auth' src` ne remonte que la doc, et src/middleware.ts n'a aucun contrôle d'origine. Tant que le verrou n'est pas en place côté infra, la protection est inopérante — et elle le reste de toute façon pour quiconque cible directement l'URL *.vercel.app, qui court-circuite Cloudflare. Le pré-filtre mémoire (`checkRateLimit`) comme le compteur durable Firestore (`consumeDurableToken`) utilisent tous deux cette même clé, donc les deux étages tombent ensemble.

**Comment ça casse**

`for i in $(seq 1 100000); do curl -s -X POST https://<app>/api/simulation/predict -H 'Content-Type: application/json' -H "CF-Connecting-IP: 10.$((RANDOM%255)).$((RANDOM%255)).1" -d '{"query":"aaaaaaaaaaaa","user_profile":{...},"scenario":"relocation","destination":"portugal","rounds":100}' & done` : chaque requête présente une IP différente, donc `checkRateLimit` crée un bucket neuf à 20 jetons à chaque fois et ne refuse jamais. La route (src/app/api/simulation/predict/route.ts:114-118, `optionalAuth`) instancie à chaque appel un SimulationEngine de 70 agents sur 100 rounds et renvoie un rapport JSON complet (toutes les phases, tous les événements, tous les résumés d'agents) — CPU de fonction et egress illimités, sans authentification.

**Correction**

Inverser la priorité : ne lire `cf-connecting-ip` que si l'origine a prouvé venir de Cloudflare. Concrètement, dans `clientIp()`, ne considérer `cf-connecting-ip` que lorsque `req.headers.get('x-origin-auth') === process.env.ORIGIN_SHARED_SECRET` (secret posé par une Transform Rule Cloudflare) ; sinon retomber sur `x-vercel-forwarded-for` puis `x-forwarded-for`, qui sont réécrits par la plateforme. Poser en parallèle la règle Vercel Firewall du runbook et refuser en middleware toute requête sans `X-Origin-Auth` en production. Ajouter `durable: true` sur /api/simulation/predict et borner `rounds` (100 rounds pour un appelant anonyme n'a pas de justification produit).

---

### Des marges de change « cachées » inventées sont attribuées nominativement à des entreprises réelles et publiées sous forme de classement

**Où** : `src/lib/maroc-transfert.ts:47` · **Catégorie** : donnee-inventee-tiers-nommes

**Le problème**

OPERATORS (lignes 47-55) attribue à des sociétés réelles et identifiables des marges de change cachées chiffrées : Wise 0,0 %, Remitly 1,1 %, TapTapSend 1,0 %, Ria 1,3 %, MoneyGram 1,6 %, Western Union 2,6 %, virement bancaire 3,6 %. L'en-tête du fichier (lignes 7-10) reconnaît qu'il s'agit d'« ESTIMATIONS représentatives 2026 » et que la version live reste « à brancher ». Aucun opérateur ne porte de champ `source` ni de date de relevé. Ces chiffres ne restent pas internes : src/app/maroc/transfert/page.tsx:115 les affiche nommément (« marge cachée 2.6 % »), la ligne 110 colle un badge rouge « Le + cher » avec une icône d'alerte sur le dernier du classement, et le bloc lignes 76-83 affiche en grand « −X MAD/an si tu restes sur le pire choix (Western Union) ». La note de bas de page (ligne 137) cite « Banque Mondiale (Remittance Prices), idealremit » globalement, sans lien, sans date de relevé et sans rattachement à un opérateur donné.

**Comment ça casse**

Un MRE ouvre /maroc/transfert pour 500 €/mois. La page lui affiche que Western Union lui prend 2,6 % de marge cachée et lui fait perdre plusieurs milliers de MAD par an, avec le badge « Le + cher ». Le chiffre n'a jamais été relevé : c'est un ordre de grandeur écrit à la main. Double conséquence : (a) l'utilisateur change d'opérateur sur un comparatif faux ; (b) l'entreprise nommée dispose d'un comparatif public, chiffré, non objectif et non vérifiable — la publicité comparative en France (C. conso. L.122-1) exige des caractéristiques vérifiables, et un simple courrier d'avocat suffit à faire tomber la page.

**Correction**

Soit brancher un relevé réel (API de taux + grille tarifaire) avec `sourceUrl` et `quotedAt` par opérateur affichés dans chaque ligne du classement, soit anonymiser immédiatement les opérateurs (« fintech A », « opérateur cash », « banque ») en conservant les ordres de grandeur pédagogiques. Dans les deux cas, supprimer le badge « Le + cher » tant que le chiffre n'est pas sourcé et daté par opérateur.

---

### La file d'attente hors-ligne n'est jamais rejouée : « sera exécutée dès votre reconnexion » est faux

**Où** : `src/lib/offline-db.ts:221` · **Catégorie** : correctness

**Le problème**

`offlineDB.sync()` (l.221-253) est la seule fonction qui vide la file `sync-queue`. Elle n'est appelée nulle part dans l'application : le seul consommateur de `useOfflineDB()` est CommandCenter.tsx:18, qui ne destructure que `isOnline` et ignore le `sync` exposé (grep sur tout src/ : aucune occurrence de `.sync()`). Les trois producteurs (CommandCenter.tsx:58 pour une action agent, hooks.ts:253 pour un post, hooks.ts:394 pour une simulation) écrivent donc dans un tampon que rien ne draine. Et même si `sync()` était appelée, elle échouerait : elle utilise `fetch` brut sans le header Authorization Firebase (contrairement à `apiFetch`, que le projet impose précisément pour ça — src/lib/api-client.ts:8-12), donc /api/posts et /api/simulator répondraient 401 ; et elle poste vers `/api/${item.store}`, soit `/api/simulations` pour le store « simulations » alors que la route s'appelle `/api/simulator` → 404 en boucle avec `incrementRetryCount`.

**Comment ça casse**

Un utilisateur dans le métro (hors-ligne) ouvre le Command Center et tape une demande. L'interface affiche « Vous êtes hors-ligne. L'action a été mise en file d'attente et sera exécutée dès votre reconnexion. » (CommandCenter.tsx:57). Il retrouve le réseau : rien ne part, rien n'est exécuté, aucune notification. L'entrée reste indéfiniment dans IndexedDB. Idem pour un post rédigé hors-ligne : `createPost` renvoie `{ queued: true }` et le post n'est jamais publié.

**Correction**

Brancher le drain : dans `useOfflineDB`, appeler `offlineDB.sync()` dans le handler `online` (l.271) et une fois à l'init si `navigator.onLine`. Corriger `sync()` pour passer par `apiFetch` (token Firebase) et pour mapper explicitement store → route (`simulations` → `/api/simulator`, `posts` → `/api/posts`, `agent` → `/api/agent`) plutôt que d'interpoler le nom du store. Abandonner et notifier après N tentatives (`retryCount` est déjà incrémenté mais jamais lu). En attendant, ne pas promettre une exécution différée dans le texte affiché.

---

### Le produit affiche un badge « vérifié » par publication et promet « identité vérifiée » alors que la vérification n'est qu'un score de toxicité par mots-clés

**Où** : `src/lib/security.ts:133` · **Catégorie** : signal-confiance-fabrique

**Le problème**

`moderateContent` retourne `is_verified: score < 0.5` (ligne 133), où `score` provient uniquement d'une liste de termes toxiques et d'heuristiques de forme — majuscules, répétitions, nombre de liens (lignes 100-127). Le commentaire ligne 75 confirme qu'il s'agit d'un remplaçant de `Math.random()` en attendant un vrai classifieur. Ce booléen est stocké tel quel comme `is_verified` du post (src/app/api/posts/route.ts:115-116, :127), renvoyé au client comme `verified` (route.ts:38) et rendu par un badge BadgeCheck sur chaque publication (src/app/safezone/page.tsx:296-298). Il ne vérifie strictement rien de l'identité : `author_name` est simplement `auth.user.email?.split("@")[0]` (route.ts:124), aucun contrôle d'identité n'existe dans le code. Or la landing vend explicitement l'inverse : ligne 163, « Communauté vérifiée — pas Reddit, pas Facebook / Identité vérifiée, zéro spam, zéro fake » ; ligne 190, « Communauté vérifiée | ✅ Safe-Zone » ; et la description SoftwareApplication en JSON-LD (src/app/layout.tsx:110) annonce « communauté vérifiée » aux moteurs de recherche. À porter au crédit du projet : les posts de démonstration portent bien un avertissement explicite quand l'API ne renvoie rien (safezone/page.tsx:179-189) et l'aggregateRating inventé a été retiré (layout.tsx:120).

**Comment ça casse**

Un utilisateur poste « Le visa D7 Portugal se traite en 3 semaines, passez par tel cabinet ». Le texte ne contient aucun terme toxique, score = 0, `is_verified = true` : la publication s'affiche avec une coche de vérification. Un lecteur, à qui la landing a promis « identité vérifiée, zéro fake », interprète la coche comme une validation de l'auteur et de l'information, et engage une procédure sur un délai inventé par un inconnu — ou pire, suit une recommandation commerciale d'un compte non identifié.

**Correction**

Renommer le champ et le badge pour dire ce qu'ils font : `moderation_passed` / infobulle « contenu passé au filtre de modération automatique — l'auteur n'est pas vérifié ». Retirer l'icône BadgeCheck (safezone/page.tsx:298) tant qu'aucune vérification d'identité n'existe. Corriger MarketingLanding.tsx:163 et :190 ainsi que la description JSON-LD de layout.tsx:110 pour supprimer « identité vérifiée » et « zéro fake ».

---

### Le curseur « Niveau anglais » du simulateur de prédiction n'a aucun effet, mais fait bouger le score par pur bruit aléatoire

**Où** : `src/lib/simulation-engine.ts:223` · **Catégorie** : correctness

**Le problème**

`initializeState` initialise `language_progress` avec `user_profile.language_level[destination] || 10` (l.223), c'est-à-dire une recherche par nom de DESTINATION (« portugal », « dubai »…). Or l'UI n'écrit qu'une clé de LANGUE : src/app/simulator/predict/page.tsx:433 fait `setProfile(p => ({ ...p, language_level: { en: Number(e.target.value) } }))`. La clé « portugal » n'existe jamais → la valeur retombe systématiquement sur 10. Le canal d'influence documenté (language_progress pèse 15 % du success_score, l.491) est donc mort. Pire : `language_level` entre dans `hashSeed` (l.190), donc bouger le curseur re-sème le PRNG et fait varier le score de façon arbitraire. Vérifié en exécutant le moteur : en:0 → language_progress 35 / score 72 ; en:100 → language_progress 35 / score 71 ; portugal:100 → language_progress 100.

**Comment ça casse**

Deux utilisateurs identiques lancent la même simulation vers le Portugal, l'un en déclarant un anglais à 0 %, l'autre à 100 %. Les deux terminent avec la même « Langue : 35/100 » dans le rapport exporté, et celui qui parle couramment anglais obtient un score de succès INFÉRIEUR (71 vs 72) — variation qui ne vient que du re-hachage de la graine. Le rapport téléchargeable affiche « - Langue: 35/100 » comme un résultat de modèle.

**Correction**

Faire correspondre l'entrée et la lecture : soit indexer par langue en dérivant la langue attendue de la destination (`DESTINATION_LANGUAGE[destination]` → `language_level[lang]`), soit demander à l'UI d'écrire `language_level[destination]`. Ajouter un test de sensibilité : à destination et graine égales, augmenter le niveau de langue doit augmenter (ou au minimum ne pas dégrader) `language_progress` et le score.

---

### `taxFlatRate` mélange taux d'imposition et taux d'exonération : la Grèce est affichée « Taux fiscal 50 % » alors que le champ encode 50 % d'exonération

**Où** : `src/lib/visa-countries.ts:25` · **Catégorie** : semantique-donnee-fiscale

**Le problème**

Le type déclare `taxFlatRate?: number; // simplified flat rate if applicable` (ligne 13) et la page le rend uniformément comme un taux d'imposition : src/app/visa/[country]/page.tsx:80 affiche `<Stat label="Taux fiscal" value={`${data.taxFlatRate}%`} />` et la ligne 116 affiche « X % (taux forfaitaire indicatif) ». Or le champ a été rempli avec des concepts incompatibles selon les pays. Grèce (ligne 25) : `taxFlatRate: 50` alors que le highlight de la même ligne dit « 50 % d'exonération fiscale pendant 7 ans » — le champ encode une exonération, la page l'affiche comme une imposition, soit exactement l'inverse. Chypre (ligne 26) : `taxFlatRate: 0` alors que le highlight précise « non-dom 0 % sur dividendes étrangers » — le 0 % ne vaut que pour les dividendes, il est affiché comme taux global. Géorgie (ligne 28) : `taxFlatRate: 1` alors que le highlight dit « 1 % pour micro-entreprises (jusqu'à 156k€/an) » — régime conditionnel affiché comme taux général. Portugal (ligne 20) : `taxFlatRate: 20` renvoie au NHR, dont le highlight lui-même se contredit avec src/lib/expat-destinations.ts:70 qui note « avantage fiscal réduit depuis la réforme / fin de l'ancien RNH ».

**Comment ça casse**

Un freelance compare /visa/grece et /visa/chypre. La carte Grèce affiche « Taux fiscal : 50 % », la carte Chypre « Taux fiscal : 0 % ». Il élimine la Grèce, qui offrait en réalité une exonération de moitié de son revenu, et retient Chypre en croyant à une imposition nulle sur son revenu d'activité alors que le 0 % ne concerne que les dividendes étrangers. Les deux conclusions sont fausses, et le tableau comparatif du bas de page les renforce.

**Correction**

Remplacer `taxFlatRate?: number` par un objet discriminé : `tax: { kind: 'flat' | 'exemption' | 'regime'; rate: number; scope: string; conditions?: string; source: string; lastVerified: string }`. Adapter le rendu (page.tsx:80 et :116) pour libeller explicitement « taux forfaitaire », « exonération de X % de l'assiette » ou « régime spécifique — conditions », et afficher `scope`. Ajouter un test qui échoue si `kind === 'flat'` et que le highlight du même pays contient « exonération ».

---

### Le Visa Tracker ne connaît que 5 pays alors que l'app en annonce 50 et publie 52 guides

**Où** : `src/lib/visa-data.ts:12` · **Catégorie** : broken-promise

**Le problème**

Le sélecteur de /visa est construit à partir de `VISA_COUNTRIES` exporté par src/lib/visa-data.ts (src/app/visa/page.tsx:17 et :115), et `VISA_DATABASE` ne contient que 5 entrées : PT, TH, ID, JP, MX (visa-data.ts:12-18). En parallèle, src/lib/visa-countries.ts contient 52 pays et génère 52 pages SEO /visa/[country]. La landing affiche « Visa Tracker — Schengen, D7, DTV, et 47 autres visas » (MarketingLanding.tsx:157) et « Visa Tracker : ✅ 50 visas » dans le tableau comparatif (MarketingLanding.tsx:187).

**Comment ça casse**

Un MRE installé au Maroc — la cible mise en avant sur toute la home — ouvre /visa, clique « Ajouter un visa », déroule la liste : Portugal, Thaïlande, Indonésie, Japon, Mexique. Le Maroc n'y est pas, Dubaï non plus, l'Espagne non plus. Il ne peut tout simplement pas utiliser la fonctionnalité pour laquelle il s'est inscrit.

**Correction**

Alimenter le sélecteur depuis `VISA_COUNTRIES` de src/lib/visa-countries.ts (52 pays, avec maxStayDays déjà présent) et supprimer la base doublon visa-data.ts, ou aligner le discours marketing sur les 5 pays réellement suivis.

---


## 🟡 MOYEN

### /api/briefing enchaîne 4 requêtes Firestore indépendantes en série ; /api/review en enchaîne 3

**Où** : `src/app/api/briefing/route.ts:29` · **Catégorie** : waterfall

**Le problème**

Dans `briefing/route.ts`, les quatre lectures sont strictement séquentielles et mutuellement indépendantes : dernier checkin (l.29-34), profil (l.43), skill_tracks (l.53-56), checkins du jour (l.71-75). Aucune n'utilise le résultat de la précédente — `latestCheckin` n'est consommé qu'à l.85, après les quatre. Même schéma dans `review/route.ts` : checkins (l.31-37), skill_missions (l.52-56), skill_tracks (l.71-74), toutes trois indépendantes et sérialisées. Dans review, la requête l.52-56 récupère de plus TOUTES les missions complétées de l'utilisateur sans `limit()`, pour n'en filtrer ensuite que celles de la semaine côté JS (l.57-62) et n'en garder que 5 (l.64).

**Comment ça casse**

L'utilisateur ouvre son briefing du matin. La fonction Vercel effectue 4 allers-retours Firestore l'un après l'autre depuis la région de déploiement — à ~50 ms l'aller-retour c'est ~200 ms de TTFB, contre ~50 ms si les quatre étaient lancées en parallèle. Pour /api/review, un utilisateur avec 400 missions complétées depuis son inscription lit 400 documents à chaque appel pour en afficher 5 : le temps de réponse et la facture Firestore croissent linéairement avec l'ancienneté du compte, alors que la fenêtre de données utile est fixe (7 jours).

**Correction**

Regrouper en `const [checkinSnap, profileSnap, tracksSnap, todaySnap] = await Promise.all([...])` dans les deux routes — le gain est immédiat, ~150 ms de TTFB sur briefing. Dans review/route.ts:52-56, filtrer côté serveur : ajouter `.where('updated_at','>=', weekAgo.toISOString()).limit(20)` et déclarer l'index composite correspondant `(user_id ASC, is_completed ASC, updated_at DESC)` dans firestore.indexes.json — l'index actuel `(user_id, is_completed)` ne couvre pas cette contrainte de plage.

---

### /api/language : create_profile crée un document neuf à chaque appel, et le GET fait une requête Firestore par profil (amplification N+1 auto-infligeable)

**Où** : `src/app/api/language/route.ts:145` · **Catégorie** : resource-exhaustion

**Le problème**

`case "create_profile"` (lignes 145-160) appelle systématiquement `db.collection(LANGUAGE_PROFILES).doc()` — un identifiant neuf — sans jamais vérifier s'il existe déjà un profil pour ce couple (user_id, target_language), et sans plafonner le nombre de profils par utilisateur. Les champs viennent bruts du corps de requête (`payload?.target_language`, `payload?.native_language`) : ce POST n'est couvert par AUCUN schéma Zod (ligne 56 : `const { action, payload } = await req.json();`), alors que /api/checkin, /api/posts, /api/simulator et /api/skills valident tous leur corps. `target_language` peut donc être une chaîne arbitraire de plusieurs centaines de Ko (limite Firestore : 1 MiB/doc), alors même que LanguageLessonSchema (src/lib/validation.ts:139) définit déjà l'énumération attendue mais n'est utilisé nulle part. Le GET de la même route (lignes 19-34) charge tous les profils de l'utilisateur puis émet une requête Firestore **par profil**, séquentiellement, sans limite : le coût de lecture et la latence croissent linéairement avec le nombre de documents que l'utilisateur a lui-même créés.

**Comment ça casse**

Un utilisateur authentifié (compte gratuit) envoie 3 000 fois POST /api/language {"action":"create_profile","payload":{"target_language":"<200 Ko de texte>"}} — soit ~2h30 au rythme autorisé de 20/min, sans même contourner le quota. Résultat : 3 000 documents language_profiles de 200 Ko (600 Mo facturés en stockage), puis chaque GET /api/language de ce compte déclenche 3 000 requêtes Firestore séquentielles → la fonction dépasse le timeout Vercel, la page /language ne charge plus jamais, et chaque tentative de rechargement refacture 3 000 lectures.

**Correction**

Valider le corps avec un schéma Zod discriminé sur `action` (comme SkillActionSchema, src/lib/validation.ts:109), en réutilisant l'énumération de langues existante. Dans create_profile, faire un `.where('user_id','==',uid).where('target_language','==',lang).limit(1).get()` et retourner le profil existant au lieu d'en créer un second (ou utiliser un id déterministe `${uid}_${lang}` comme docId). Dans le GET, remplacer la boucle par une seule requête `.where('user_id','==',uid)` sur language_progress, filtrée en mémoire par langue, avec un `.limit()`.

---

### /api/language complete_review : mastery_level calculé à partir d'une valeur envoyée par le client, sans validation de type

**Où** : `src/app/api/language/route.ts:128` · **Catégorie** : input-validation

**Le problème**

Ligne 100, `const { card_id, quality, current_level } = payload;` — seul `card_id` est contrôlé (ligne 102). `quality` et `current_level` ne sont ni typés ni bornés. Ligne 128, la nouvelle maîtrise s'écrit `mastery_level: Math.min(5, (current_level || 0) + (quality >= 3 ? 1 : -1))`, c'est-à-dire à partir de la valeur que le client déclare avoir, jamais de la valeur réellement stockée dans le document (`existingSnap.data()`, pourtant déjà lu ligne 113 pour le contrôle de propriété). Deux conséquences : (1) le niveau de maîtrise est entièrement pilotable par le client, ce qui vide de son sens l'algorithme SRS et le XP associé ; (2) une valeur non numérique produit NaN et corrompt durablement le document, puisque tout calcul ultérieur repart de ce NaN.

**Comment ça casse**

POST /api/language {"action":"complete_review","payload":{"card_id":"<une carte m'appartenant>","quality":"5","current_level":"3"}} (valeurs en chaînes, ce que produit un <input> HTML non converti). Le contrôle de propriété passe, puis `("3" || 0) + 1` vaut la chaîne "31", `Math.min(5, "31")` vaut 5 — ou, avec current_level:"trois", `Math.min(5, "trois1")` vaut NaN, écrit tel quel dans Firestore. La carte affiche ensuite un niveau NaN et chaque révision suivante recalcule NaN : la fiche est définitivement cassée, sans erreur ni log.

**Correction**

Ajouter un schéma Zod pour ce payload (`card_id: z.string().min(1)`, `quality: z.number().int().min(0).max(5)`) et supprimer `current_level` de l'entrée : dériver le nouveau niveau de `existingSnap.data()?.mastery_level ?? 0`, la valeur autoritative déjà chargée ligne 113.

---

### /api/posts GET : lecture publique non authentifiée et non limitée, 50 lectures Firestore facturées par requête

**Où** : `src/app/api/posts/route.ts:15` · **Catégorie** : resource-exhaustion

**Le problème**

Le GET n'appelle ni `enforceRateLimit` ni `authenticateRequest` (`optionalAuth` ligne 17 ne refuse jamais), et exécute inconditionnellement une requête ordonnée de 50 documents (lignes 21-26). C'est exactement le défaut que l'équipe a corrigé sur /api/dashboard — le commentaire src/app/api/dashboard/route.ts:52-55 dit mot pour mot « chaque hit anonyme sur /api/dashboard lisait 100 documents Firestore — facturés à la lecture, sur une route sans rate limit. Une boucle dessus était une facture non bornée » — mais la correction n'a pas été portée ici. Le POST de la même route, lui, est bien limité (ligne 68). À noter aussi : firestore.rules:83 autorise `read: if true` sur posts, donc la même collection est de toute façon aspirable directement via la configuration web publique, sans passer par cette route ni sa limite de 50.

**Comment ça casse**

`while true; do curl -s https://<app>/api/posts > /dev/null; done` depuis une machine quelconque, sans compte : chaque itération consomme 50 lectures Firestore facturées. À ~20 req/s cela représente 1 000 lectures/seconde, soit environ 86 millions de lectures par jour, sans aucun mécanisme d'arrêt côté application.

**Correction**

Appeler `enforceRateLimit(req)` en tête du GET, comme sur /api/dashboard (ligne 12) et /api/briefing (ligne 13). Ajouter un `Cache-Control: public, s-maxage=60, stale-while-revalidate` sur la réponse pour que le fil public soit servi depuis le CDN plutôt que depuis Firestore à chaque hit.

---

### JARVIS : une limite de débit ou une panne s'affiche en « Vérifiez votre configuration API »

**Où** : `src/app/jarvis/page.tsx:96` · **Catégorie** : error-handling

**Le problème**

Le seul cas particulier traité est le 503 « X-AI-Configured: false » (jarvis/page.tsx:67-70) ; toute autre réponse non-OK est convertie en exception et le bloc catch affiche « ⚠️ Erreur de connexion. Vérifiez votre configuration API. » (page.tsx:93-97). Or /api/jarvis renvoie un 429 documenté avec un message français exploitable et un `resetMs` (src/app/api/jarvis/route.ts:200-217), plafond fixé à 20 requêtes/minute par utilisateur ou par IP pour les visiteurs anonymes (route.ts:180-185, 194-196).

**Comment ça casse**

Un visiteur enthousiaste enchaîne les questions à JARVIS, dépasse le quota au 21e message : au lieu de « Rate limit atteint, réessaie dans quelques secondes », il lit qu'il doit vérifier sa configuration API — une phrase destinée à un développeur, qui n'a aucun sens pour lui. Il conclut que l'IA est cassée et s'en va.

**Correction**

Lire le corps JSON des réponses d'erreur : afficher le champ `error` du serveur (429 avec le délai issu de `resetMs`, 401 avec une invitation à se connecter) et réserver le message générique aux vraies erreurs réseau.

---

### Mobile : le sélecteur de personas JARVIS est écrasé et les 5 personas restent anonymes

**Où** : `src/app/jarvis/page.tsx:161` · **Catégorie** : mobile-a11y

**Le problème**

L'en-tête de /jarvis est un `flex items-center justify-between` sans `flex-wrap` (page.tsx:138) contenant à gauche l'icône 44px + le titre + « Module: Stratège » (~180px) et à droite les 5 onglets persona en `w-9 h-9` (36px) dans un conteneur `p-1 gap-1` (~204px), soit ~384px minimum pour une largeur disponible de 343px sur un écran de 375px (main en `px-4`, layout.tsx:159). Les éléments flex se compriment donc sous 36px — déjà en dessous de la cible tactile de 44px. De plus le seul libellé de chaque persona est l'attribut `title` (page.tsx:169), inopérant au toucher, et le contenu visible est un emoji en `grayscale-[50%]` (page.tsx:179).

**Comment ça casse**

Sur un iPhone SE/13 mini, l'utilisateur voit cinq petits emojis gris tassés dans le coin de l'en-tête. La landing lui a vendu « 5 personas IA (Sage, Stratège, Coach, Exécuteur, Ami) » : il ne peut ni lire leurs noms, ni viser un bouton de moins de 36px de façon fiable, et il touche le mauvais persona.

**Correction**

Passer les personas sur une ligne dédiée sous l'en-tête en `overflow-x-auto` avec des puces libellées (emoji + nom) d'au moins 44px de haut sur mobile, et remplacer `title` par un `aria-label` plus un texte visible.

---

### framer-motion (117 Ko bruts) et CommandCenter (43 Ko bruts) sont importés statiquement dans le layout racine alors qu'ils ne servent qu'après interaction

**Où** : `src/app/layout.tsx:166` · **Catégorie** : code-splitting

**Le problème**

`<CommandCenter />` est monté inconditionnellement dans le layout (l.15 pour l'import, l.166 pour le rendu). Or son rendu est `<AnimatePresence>{isOpen && ...}</AnimatePresence>` (CommandCenter.tsx:93-95) avec `isOpen` initialisé à `false` : il ne produit aucun DOM tant que l'utilisateur n'a pas fait Cmd+J. Il tire pourtant `framer-motion`, `lucide-react` et `@/lib/offline-db` (296 lignes, ouverture IndexedDB) dans le bundle initial. De même, `MotionProvider` (l.10/133) et `Sidebar` (l.9/152) importent `framer-motion` statiquement. Vérifié dans le build : le chunk `3l3_ihy5abpfx.js` (117 Ko bruts / 39 Ko gzip, contient `MotionConfig` ×8, `spring` ×7) et le chunk `0d9-lz16tb3xw.js` (43 Ko bruts / 14,5 Ko gzip, contient `odyssey-offline` et « Command Center ») sont tous deux des `<script async>` du HTML de `/visa/portugal`.

**Comment ça casse**

Un visiteur SEO ouvre `/visa/portugal`, une page composée exclusivement de texte et de liens (Server Component, aucun `motion.*`). Il télécharge et exécute 160 Ko bruts / 53 Ko gzip de moteur d'animation et de palette de commandes qu'il n'ouvrira jamais — sur les 468 Ko gzip de la page, c'est ~11 % consommé pour une fonctionnalité déclenchée par un raccourci clavier inconnu de lui, et qui n'existe pas sur mobile où il n'y a pas de Cmd+J. Ce sont ~150-300 ms de parse/exécution main-thread supplémentaires sur un appareil bas de gamme, dans la fenêtre où le LCP est mesuré.

**Correction**

Charger CommandCenter paresseusement : `const CommandCenter = dynamic(() => import('@/components/CommandCenter'), { ssr: false })`, et déclencher l'import réel sur le premier `keydown` Cmd/Ctrl+J via un petit écouteur inline (~200 octets) plutôt qu'en montant le composant. Même traitement pour le tiroir mobile de la Sidebar. Ajouter `experimental: { optimizePackageImports: ['framer-motion'] }` dans next.config.ts (lucide-react et recharts y sont déjà par défaut, pas framer-motion).

---

### Le tableau de bord affiche deux scores contradictoires et 5 axes de progression codés en dur

**Où** : `src/app/page.tsx:396` · **Catégorie** : fabricated-data

**Le problème**

La carte statistique du haut affiche `data.odyssey_score` renvoyé par l'API (page.tsx:238), qui vaut 500 pour un compte neuf (src/app/api/dashboard/route.ts:18 et :30). Mais le panneau « Sys.Score » juste en dessous affiche `<AnimatedCounter value={742} />` en dur (page.tsx:396), et les 5 axes (Clarté mentale 82%, Santé financière 64%, Mobilité 91%, Réseau 73%, Exécution 95%) sont des constantes identiques pour tous les utilisateurs (page.tsx:166-172). Les deltas « +5 / +2 / +3 » sont eux aussi codés en dur (page.tsx:239-241), et l'API renvoie un `odyssey_trend: "+12"` constant (route.ts:73).

**Comment ça casse**

Un utilisateur qui vient de créer son compte voit sur le même écran « 500 pts » dans la carte Score et « 742/1000 » dans le panneau Sys.Score, avec « Exécution & Action : 95% » alors qu'il n'a strictement rien fait, et « +2 pays simulés cette semaine » alors qu'il en a simulé zéro. Rien n'est vrai et deux chiffres se contredisent.

**Correction**

Alimenter le panneau Sys.Score avec `data.odyssey_score` et calculer les 5 axes côté API à partir des données réelles (simulations, visas, posts) ; à défaut, masquer le panneau tant qu'aucune donnée n'existe et afficher un état vide d'onboarding (« Lance ta première simulation pour construire ton score »).

---

### Le tableau de bord flashe des statistiques de démo avant d'afficher la landing aux visiteurs

**Où** : `src/app/page.tsx:233` · **Catégorie** : first-impression

**Le problème**

La bascule vers la landing marketing est conditionnée à `if (!loading && !user)` (page.tsx:233). Or `loading` vaut `true` au premier rendu (src/contexts/AuthContext.tsx:24) le temps que Firebase restaure la session : pendant cet intervalle le composant tombe dans le rendu du tableau de bord et affiche le jeu FALLBACK — score 742, 7 pays simulés, 14 connexions, « 3 conversations aujourd'hui », « 5 posts cette semaine » (page.tsx:86-97) — plus le titre « Bonjour Explorateur ».

**Comment ça casse**

Un visiteur qui découvre le produit charge la home : il voit d'abord un tableau de bord personnel avec des chiffres qui ne sont pas les siens (« Bonjour Explorateur », 742 pts, 12 simulations), puis l'écran est remplacé par la page de vente. Première impression : produit cassé, ou données de quelqu'un d'autre.

**Correction**

Rendre un squelette neutre tant que `loading` est vrai (`if (loading) return <DashboardSkeleton />`) avant de choisir entre landing et tableau de bord.

---

### Boutons morts sur le tableau de bord et la Safe-Zone (dont l'avatar « JL » codé en dur)

**Où** : `src/app/page.tsx:458` · **Catégorie** : dead-control

**Le problème**

Trois contrôles ressemblent à des boutons et n'ont aucun handler : (1) « TOUT VOIR » dans le panneau Activité du tableau de bord (src/app/page.tsx:458-460, aucun onClick) ; (2) le bouton commentaires de chaque post, qui affiche pourtant un compteur cliquable (src/app/safezone/page.tsx:351-354, aucun onClick) ; (3) le menu « … » de chaque post (safezone/page.tsx:320-322, aucun onClick). Par ailleurs l'avatar du composer Safe-Zone est la chaîne littérale « JL » (safezone/page.tsx:229), les initiales du fondateur, affichées à tous les utilisateurs. Les likes et les favoris ne sont que des `Set` locaux (safezone/page.tsx:143-157) : ils disparaissent au rechargement et ne sont jamais envoyés au serveur.

**Comment ça casse**

Un utilisateur voit « 12 » commentaires sous le post de Karim, clique dessus pour les lire : rien ne se passe. Il aime le post (le cœur se remplit, le compteur passe à 48), recharge la page : le like a disparu. Et il publie son message sous un avatar « JL » qui n'est pas le sien.

**Correction**

Supprimer les contrôles non implémentés plutôt que les laisser inertes ; dériver l'avatar du composer de `useAuth()` comme le fait la Sidebar (getUserInitials, src/components/Sidebar.tsx:80-88) ; persister likes/favoris via /api/posts ou masquer les boutons.

---

### Les 6 réglages de la page Paramètres ne pilotent rien, et sont perdus sans compte

**Où** : `src/app/settings/page.tsx:117` · **Catégorie** : dead-feature

**Le problème**

Les clés `memory`, `extraction`, `opportunities`, `mentors`, `weekly`, `biometric` (settings/page.tsx:86-93) sont écrites dans le profil Firestore (page.tsx:117-129) mais ne sont relues nulle part dans l'application : un grep sur `src/` ne trouve ces identifiants que dans ce fichier et dans les libellés i18n. « Rapport hebdomadaire », « Alertes opportunités » et « Déverrouillage biométrique » n'ont aucun mécanisme d'envoi ni d'authentification derrière. De plus la page ne garde aucun accès : sans compte, `saveSettings` sort immédiatement sur `if (!user) return;` (page.tsx:118) sans définir `saveMsg`, donc la zone `aria-live` reste vide.

**Comment ça casse**

Un utilisateur non connecté ouvre /paramètres (lien permanent de la sidebar), active « Rapport hebdomadaire » : l'interrupteur bascule, rien n'est affiché, rien n'est sauvegardé. Un utilisateur connecté fait la même chose, voit « Enregistré », et n'a jamais aucun rapport hebdomadaire ni aucune alerte d'opportunité.

**Correction**

Ne garder que les réglages effectivement câblés (thème, langue, mémoire IA si /api/jarvis la lit) et retirer les autres ; afficher un état « Connecte-toi pour enregistrer tes préférences » quand `user` est absent.

---

### Le sitemap déclare toutes les pages modifiées maintenant et le hub veille « daily », alors que leur contenu est figé dans le code

**Où** : `src/app/sitemap.ts:32` · **Catégorie** : fraicheur-fabriquee

**Le problème**

`const now = new Date()` (ligne 8) est appliqué comme `lastModified` à toutes les entrées : routes statiques (ligne 32), pages visa programmatiques (ligne 40) et pages villes (ligne 48). Chaque build annonce donc à Google que les 50 guides visa et les 6 pages villes viennent d'être modifiés, alors que src/lib/visa-countries.ts et src/lib/maroc-data.ts n'ont pas bougé. S'y ajoute `changeFrequency: 'daily'` déclaré pour '/maroc/veille' (ligne 20), dont le contenu est un socle éditorial explicitement figé au 28 juin 2026 (src/lib/maroc-veille.ts:83, affiché en clair sur src/app/maroc/veille/page.tsx:165). Le signal de fraîcheur envoyé aux moteurs est donc systématiquement faux, et il est cohérent avec le `datePublished: new Date().toISOString()` du JSON-LD de visa/[country]/page.tsx:52 — le même problème de fond, décliné côté machine.

**Comment ça casse**

Le site est redéployé pour un changement de CSS. Le sitemap annonce à Google que /visa/portugal et /maroc/agadir ont été modifiés ce jour ; Google les recrawle et les réaffiche comme fraîches. Un utilisateur arrive sur un guide dont les seuils de revenus datent en réalité de plusieurs mois, avec un signal de fraîcheur du jour, sur des pages qui l'orientent vers des démarches administratives.

**Correction**

Utiliser le champ `lastVerified` par entrée (à ajouter, cf. finding sur visa/[country]/page.tsx:162) comme `lastModified` des URLs de données, et ne conserver `new Date()` que pour les pages réellement dynamiques. Aligner `changeFrequency` de '/maroc/veille' sur la cadence réelle de mise à jour du socle éditorial.

---

### /skills : le bouton « Ajouter » ne fait rien si l'utilisateur n'est pas connecté

**Où** : `src/app/skills/page.tsx:81` · **Catégorie** : silent-failure

**Le problème**

La page est accessible sans compte et affiche l'état vide « Aucun parcours pour le moment. Ajoute une compétence ci-dessus. » (page.tsx:217-220), c'est-à-dire une invitation explicite à agir. Mais `handleCreateTrack` fait `if (!isSignedIn()) return;` sans aucun retour visuel (page.tsx:81), et `handleCompleteMission` fait de même (page.tsx:103). Le formulaire reste rempli, aucune erreur, aucun spinner, aucune redirection.

**Comment ça casse**

Un visiteur tape « arabe dialectal » dans le champ « Quelle compétence veux-tu développer ? », clique « Ajouter » : rien. Il réessaie deux fois, puis quitte en pensant que l'app est cassée. Il n'apprend jamais qu'il fallait un compte.

**Correction**

Remplacer le `return` muet par un état d'erreur affiché (« Connecte-toi pour créer un parcours ») avec un lien vers /login, ou afficher directement l'EmptyState de connexion (comme le fait /visa/page.tsx:140-145) quand `user` est absent.

---

### Les 52 guides visa se re-datent tout seuls à chaque build (schema.org inclus)

**Où** : `src/app/visa/[country]/page.tsx:162` · **Catégorie** : fabricated-data

**Le problème**

Les pages pays sont générées statiquement (generateStaticParams, page.tsx:8) et affichent en pied de page « Informations indicatives mises à jour {mois année} » calculé par `new Date().toLocaleDateString()` au moment du build (page.tsx:162). Le même procédé alimente `datePublished: new Date().toISOString()` du JSON-LD Article envoyé à Google (page.tsx:52) et l'année du `<title>` (page.tsx:17). La date affichée n'a donc aucun rapport avec la dernière mise à jour réelle des données de src/lib/visa-countries.ts.

**Comment ça casse**

Le fondateur redéploie en mars pour un correctif CSS : les 52 guides affichent aussitôt « mises à jour mars 2027 » et déclarent à Google un datePublished de mars 2027, alors que les seuils de revenu et durées de séjour n'ont pas bougé depuis leur écriture. Un utilisateur fait sa demande de visa sur un seuil périmé qu'on lui a présenté comme frais du mois.

**Correction**

Ajouter un champ `lastReviewed` par pays dans src/lib/visa-countries.ts et l'afficher (ainsi que dans le JSON-LD) au lieu de `new Date()`.

---

### Claim marketing sans aucune implémentation : « Bail mobilité FR ✅ via SeLoger »

**Où** : `src/components/MarketingLanding.tsx:188` · **Catégorie** : fabricated-data

**Le problème**

Le tableau comparatif « Odyssey vs Nomadlist » annonce la ligne « Bail mobilité FR — Nomadlist ❌ / Odyssey ✅ via SeLoger » (MarketingLanding.tsx:188). Une recherche sur tout le dépôt (`grep -rni "seloger|bail mobilit" src/`) ne retourne que cette ligne : aucune intégration, aucune route API, aucune page, aucune mention ailleurs. Le fichier porte pourtant en commentaire l'engagement de n'annoncer que des chiffres vérifiables dans le produit (MarketingLanding.tsx:117-124), et les métriques inventées ont déjà été nettoyées ailleurs.

**Comment ça casse**

Un candidat au départ choisit Odyssey plutôt qu'un concurrent parce qu'on lui promet la recherche de bail mobilité via SeLoger, crée son compte, parcourt les 8 modules de la sidebar : la fonctionnalité n'existe nulle part. Sur un produit qui parle de visa et de fiscalité, une fausse promesse détruit la confiance sur tout le reste.

**Correction**

Supprimer la ligne du tableau comparatif tant que l'intégration n'existe pas, comme cela a déjà été fait pour les fausses notes 4.8/5 et les « 50+ pays comparés ».

---

### Compteur de visa : `Math.abs` sur l'écart de dates fait décompter les jours d'un séjour à venir et surcompte le jour d'entrée

**Où** : `src/components/VisaTracker.tsx:35` · **Catégorie** : correctness

**Le problème**

Le nombre de jours consommés est calculé avec `Math.ceil(Math.abs(now - entry) / 86400000)` (VisaTracker.tsx:35, formule dupliquée dans src/app/page.tsx:220 pour choisir le visa « le plus urgent »). La valeur absolue supprime le signe : une date d'entrée future est comptée comme du temps déjà écoulé au lieu de 0. `Math.ceil` sur un écart en millisecondes ajoute par ailleurs systématiquement un jour dès la première heure. Il n'y a aucune validation de `entry_date` à l'écriture (src/app/visa/page.tsx:51-68 ne fait que poser l'attribut HTML `max`, qui n'empêche pas la saisie clavier et n'est jamais revérifié en JS ni côté Firestore).

**Comment ça casse**

Un utilisateur enregistre un séjour Schengen prévu dans 30 jours (max 90 j) : la carte affiche « 60 jours restants » avec une barre de progression à 33 %, alors qu'il n'est pas encore parti — et le dashboard peut désigner ce visa comme le plus urgent à la place d'un séjour réellement en cours. Cas plus courant : le jour même de l'entrée, `new Date("2026-08-05")` étant interprété à minuit UTC, un utilisateur à Paris à 14 h obtient déjà « 89 jours restants » au lieu de 90 ; pour un utilisateur en UTC-5 en soirée, l'écart passe à 2 jours. Sur une règle d'overstay, ce décalage se paie.

**Correction**

Calculer en jours calendaires signés et bornés : `const days = Math.max(0, Math.floor((startOfDay(now) - startOfDay(parseLocalDate(entry))) / 86400000))`, en parsant `YYYY-MM-DD` en date locale (`new Date(y, m-1, d)`) et non via le constructeur ISO. Factoriser cette fonction dans un module partagé pour que VisaTracker et src/app/page.tsx:220 utilisent le même calcul, et refuser une `entry_date` future dans `addVisa` avant l'écriture Firestore.

---

### Le dictionnaire i18n complet — 7 langues, 41,6 Ko bruts — part dans le bundle client de chaque page

**Où** : `src/contexts/LocaleContext.tsx:15` · **Catégorie** : bundle-size

**Le problème**

`LocaleContext.tsx` est un `"use client"` monté dans le layout racine (layout.tsx:135) et importe `t as translate` depuis `@/lib/i18n` (l.11-17). `t()` (i18n.ts:1191-1193) indexe l'objet `translations` qui contient les sept dictionnaires complets (fr l.216, en l.368, nl l.520, es l.672, pt l.814, de l.956, ar l.1098). Rien ne permet au bundler d'éliminer les six locales inutilisées : l'accès est dynamique (`translations[locale]?.[key]`). Vérifié dans le build : le chunk `3sz6qprw6y4hl.js` fait 41,6 Ko bruts / 13,1 Ko gzip, contient `"nav.dashboard"` 7 fois, `"dashboard.greeting"` 7 fois, et les chaînes arabes (« الأثر المالي ») comme allemandes (« Vorhersage »). Il est chargé en `<script async>` sur les 56 pages SEO statiques, qui sont pourtant écrites en dur en français (`lang="fr" dir="ltr"` en dur dans maroc/[ville]/page.tsx:52 et MarketingLanding.tsx:37).

**Comment ça casse**

Un visiteur francophone charge /maroc/marrakech. Il télécharge 41,6 Ko bruts / 13,1 Ko gzip de traductions dont il n'utilisera jamais 6/7 (~35,7 Ko bruts / ~11,2 Ko gzip de pur gaspillage, soit ~86 % du chunk), qu'il doit malgré tout parser et instancier en mémoire — un objet littéral de cette taille coûte ~10-20 ms de parse/allocation JS sur un mobile bas de gamme, et ce sur chaque page vue non mise en cache. Le ratio empire à chaque langue ajoutée : à 10 langues ce sera ~90 % de déchet.

**Correction**

Éclater `translations` en un module par locale (`src/lib/i18n/fr.ts`, `en.ts`, …) et les charger dynamiquement dans `LocaleProvider` : `const dict = await import(`./i18n/${locale}`)`, en gardant `fr` en import statique comme fallback synchrone. Seule la locale active traverse alors le réseau. Le type `TranslationKeys` reste partagé et continue de garantir la complétude au build.

---

### L'outil de recherche de vols renvoie des prix inventés attribués à de vraies compagnies, s'exécute sans confirmation, et l'UI annonce « Action exécutée avec succès »

**Où** : `src/lib/action-engine.ts:333` · **Catégorie** : fabrication-action

**Le problème**

Le handler `skyscanner_flight_search` (lignes 327-338) ignore `origin`, `destination` et `date` et retourne toujours `success: true` avec deux vols codés en dur, attribués à des compagnies réelles : `{ airline: "TAP Portugal", price: 85, duration: "2h30", direct: true }` et `{ airline: "Air France", price: 120, duration: "2h45", direct: true }`. Le seul indice de simulation est un `console.log` (ligne 328) que l'utilisateur ne voit jamais ; le payload retourné ne porte aucun marqueur `simulated`. L'outil est déclaré `requiresConfirmation: false` (ligne 324), il s'exécute donc directement dans src/app/api/agent/route.ts:101-103, et la réponse expose `actionExecuted: true` et le `receipt` complet (lignes 108-116). Côté UI, src/components/CommandCenter.tsx:73-79 réagit à `actionExecuted` en affichant une coche verte et « Action exécutée avec succès ». Le même schéma existe pour `google_calendar_schedule` (lignes 303-312, « Appel API Google Calendar simulé »), mais celui-là est protégé par `requiresConfirmation: true`.

**Comment ça casse**

L'utilisateur ouvre le Command Center (Cmd+J) et tape « trouve-moi un vol Paris → Bangkok le 15 mars ». Le routeur déclenche skyscanner_flight_search, qui renvoie « TAP Portugal, 85 €, 2h30, direct » — une liaison qui n'existe pas, à un prix inventé, au nom d'une compagnie réelle. L'interface affiche une coche verte et « Action exécutée avec succès », donc l'utilisateur croit qu'une vraie recherche a eu lieu ; tout consommateur de l'API (`receipt.data.flights`) recevra ces prix comme des résultats valides.

**Correction**

Tant qu'aucune API vol n'est branchée, retourner `{ success: false, reason: "not_implemented" }` afin que la couche appelante affiche une indisponibilité honnête, ou à défaut `{ success: true, simulated: true, data: {...} }` et faire afficher par CommandCenter une bannière « résultat de démonstration » dès que `receipt.simulated` est vrai — au lieu de la coche verte « Action exécutée avec succès ».

---

### Le cache des plans d'action ignore la date et l'identité : plan périmé et identifiant de plan dupliqué entre utilisateurs

**Où** : `src/lib/jarvis/ai-service.ts:26` · **Catégorie** : cache

**Le problème**

`generateActionPlanFromAI` prend un `_unusedUserId` explicitement ignoré et appelle `getCachedResponse(query, systemInstruction)` (l.26) puis `setCachedResponse(query, finalPlan, systemInstruction)` (l.67) SANS le paramètre `scope`, alors que src/lib/cache/smart-cache.ts:99-101 documente l'inverse : « pass a user id whenever the prompt carries personal context ». La clé de cache ne couvre ni l'utilisateur ni la date, alors que le prompt injecte `Date actuelle: ${new Date().toISOString()}` (l.38) et que le TTL est de 6 h (smart-cache.ts:22). Le plan mis en cache embarque en plus son `id` et son `createdAt` (l.60-63), qui sont donc resservis tels quels.

**Comment ça casse**

À 22 h 30 un utilisateur demande « réserve une table japonaise demain à 20h » : le LLM produit `parameters.date = 2026-08-06`. À 1 h du matin (moins de 6 h plus tard, donc cache chaud) un autre utilisateur — ou le même — envoie la même phrase : /api/agent/plan renvoie le plan mis en cache, daté du 2026-08-06, c'est-à-dire aujourd'hui et non demain. La confirmation affichée porte sur la mauvaise date, et le reçu d'exécution porte un `planId` déjà utilisé par un autre compte, ce qui rend l'audit trail ambigu.

**Correction**

Passer le scope : `getCachedResponse(query, systemInstruction, undefined, userId)` et `setCachedResponse(query, finalPlan, systemInstruction, undefined, userId)` (renommer `_unusedUserId` en `userId`). Inclure la date du jour dans la clé (ex. `scope = \`${userId}:${new Date().toISOString().slice(0,10)}\``), et ne mettre en cache que l'objet du LLM — générer `id` et `createdAt` APRÈS le hit de cache, jamais depuis l'entrée mise en cache.

---

### Le coût de vie de référence en France, qui produit le chiffre d'« économie » le plus visible du hub Maroc, est une constante sans source

**Où** : `src/lib/maroc-data.ts:320` · **Catégorie** : donnee-non-sourcee

**Le problème**

`export const FRANCE_BASELINE_EUR = 2200;` est commenté « Coût de vie de référence d'une grande ville française (€/mois, 1 pers., loyer inclus) » — sans source, sans ville de référence, sans date, sans méthode. Cette constante pilote `estimateMonthlyCost` (lignes 328-341) et donc `savingsEurPerYear`, qui est affiché comme le chiffre vert dominant de la page : « +X € / an » (src/app/maroc/page.tsx:255-257). Les multiplicateurs sont eux aussi arbitraires et non documentés : `lifestyleMult` 0,78 / 1 / 1,6 (ligne 334), `peopleMult` +40 % par personne (ligne 335), et un facteur France différent 0,85 / 1 / 1,5 (ligne 338) — l'asymétrie entre le multiplicateur premium Maroc (1,6) et France (1,5) n'est justifiée nulle part et gonfle mécaniquement l'économie affichée en mode premium. Cette même fonction alimente aussi l'outil IA `analyzeMaroc` (src/app/api/jarvis/route.ts:104-108). À porter au crédit du projet : la mention « Estimation indicative, non contractuelle » est bien présente sous le résultat (maroc/page.tsx:260), ce qui limite la gravité.

**Comment ça casse**

Une famille de 4 personnes en mode premium sélectionne Casablanca. Coût Maroc = 11500 × 1,6 × 2,2 = 40480 MAD ≈ 3748 €. Coût France = 2200 × 2,2 × 1,5 = 7260 €. La page annonce « +42 144 € / an d'économie ». Le chiffre repose entièrement sur une base France de 2200 € et sur deux multiplicateurs premium différents choisis à la main. Si la base réelle du foyer est de 4500 €, l'économie annoncée est presque doublée — sur l'argument commercial central du hub.

**Correction**

Soit sourcer la base (INSEE budget des ménages ou équivalent, avec URL et année stockées à côté de la constante et affichées sous le résultat), soit — meilleure option produit — remplacer la constante par un champ de saisie « ton budget mensuel actuel en France », ce qui rend le calcul vrai par construction. Documenter et unifier les multiplicateurs lifestyle entre Maroc et France, ou expliciter pourquoi ils diffèrent.

---

### Les événements de scénario ne sont jamais rattachés aux agents : `affected_agents` référence des identifiants qui n'existent pas

**Où** : `src/lib/simulation-engine.ts:251` · **Catégorie** : correctness

**Le problème**

`generateAgents` construit les identifiants avec un horodatage : `id: \`${type}_${i}_${Date.now()}\`` (l.251). Mais les événements de scénario référencent des identifiants littéraux sans suffixe : `affected_agents: ['admin_0']` (l.312), `['landlord_0','landlord_1']` (l.322), `['employer_0','employer_1','mentor_0']` (l.345), `['employer_0','mentor_0']` (l.355). `updateAgentMemories` fait `this.agents.find(a => a.id === agentId)` (l.450) et ne trouve donc jamais rien. Vérifié en exécutant une simulation complète : zéro agent possède l'événement visa dans sa mémoire. Corollaire : le `Date.now()` dans l'id casse aussi le contrat de déterminisme affiché en tête de fichier (l.160-172) — `report.id`, les ids d'agents et donc `agent_summaries` changent à chaque exécution pour des entrées identiques ; les tests de src/lib/__tests__/simulation-engine.test.ts ne comparent que `success_score` et `final_state` et ne le voient pas.

**Comment ça casse**

Une simulation « relocation » de 50 rounds génère les événements « Démarrage de la demande de visa », « Recherche de logement », « Arrivée ». Le bloc « Agents clés simulés » de /simulator/predict n'en montre aucune trace : les `key_insights` ne contiennent que des interactions génériques (« conversation avec X »), et l'administration (SEF/AIMA) ou les propriétaires n'apparaissent jamais comme agents impliqués alors que le rapport prétend qu'ils l'ont été. Deux exécutions identiques renvoient par ailleurs des rapports JSON différents (ids), ce qui empêche toute déduplication ou comparaison.

**Correction**

Générer les agents d'abord, puis référencer les vrais ids : conserver un index `this.agentsByKey.get('admin_0')` construit à partir de `${type}_${i}`, et utiliser `this.agentsByKey.get('admin_0')?.id` dans les événements. Supprimer `Date.now()` de l'id d'agent (`${type}_${i}` suffit, il est déjà unique) et remplacer `id: \`sim_${Date.now()}\`` (l.495) par un identifiant dérivé de `hashSeed`. Ajouter un test : `report` complet identique pour deux exécutions à entrées identiques.

---

### Le middleware pose un Set-Cookie sur chaque réponse HTML, ce qui empêche le CDN Vercel de mettre en cache les 56 pages statiques

**Où** : `src/middleware.ts:15` · **Catégorie** : caching

**Le problème**

`middleware()` appelle `response.cookies.set('user-country', country, ...)` (l.15-19) sans condition : à chaque requête, y compris quand le cookie existe déjà avec exactement la même valeur, et quelle que soit la route. Le `matcher` (l.68-72) n'exclut que `_next/static`, `_next/image`, `favicon.ico` et les extensions d'images — toutes les navigations HTML, y compris les 56 pages prérendues par `generateStaticParams` (`/visa/[country]`, `/maroc/[ville]`), passent donc par ce middleware et repartent avec un en-tête `Set-Cookie`. L'Edge Network de Vercel ne met pas en cache une réponse porteuse de `Set-Cookie`.

**Comment ça casse**

Deux visiteurs consécutifs depuis Paris demandent `/visa/portugal`. La page est du HTML statique identique pour tout le monde, prérendu au build — elle devrait être servie depuis le POP le plus proche en ~20-40 ms de TTFB. Parce que le middleware y ajoute `Set-Cookie: user-country=FR`, chaque requête est marquée non cachable et repasse par la fonction edge ; le TTFB devient celui de l'origine à chaque visite (~100-300 ms selon la région), sur toutes les pages SEO. C'est précisément la métrique que Google mesure en premier sur le trafic organique, et elle est directement additive au LCP.

**Correction**

Ne poser le cookie que lorsqu'il change réellement : `if (request.cookies.get('user-country')?.value !== country) response.cookies.set(...)`. Encore mieux : restreindre le `matcher` aux routes qui ont besoin de la géolocalisation (`/api/:path*`, `/jarvis`, `/simulator/:path*`) et déplacer les en-têtes de sécurité statiques (X-Frame-Options, CSP, HSTS — l.22-56, identiques pour toutes les réponses) dans `headers()` de next.config.ts, où ils sont appliqués par le CDN sans invalider le cache.

---


## ⚪ FAIBLE

### recharts est déclaré en dépendance de production sans être importé nulle part

**Où** : `package.json:22` · **Catégorie** : dead-dependency

**Le problème**

`"recharts": "^3.7.0"` figure dans `dependencies`. Un `grep -rn recharts src/` ne renvoie aucune occurrence (code de sortie 1) : le paquet n'est importé dans aucun fichier `.ts`/`.tsx`. Il n'apparaît donc pas dans les bundles client — vérifié sur les 15 chunks de `/visa/portugal` — mais il est bien installé à chaque build. Aucun graphique n'existe d'ailleurs dans l'application : les barres de progression (globals.css:675-690, `.energy-bar-fill`) sont en CSS pur.

**Comment ça casse**

Chaque build Vercel installe recharts et son arbre de dépendances (d3-scale, d3-shape, victory-vendor, ~8-10 Mo sur disque), ce qui allonge l'étape `npm install` de plusieurs secondes sans aucune contrepartie. Le risque réel est différé : la dépendance étant présente, un développeur peut l'importer directement dans une page cliente et ajouter ~90 Ko gzip au chunk partagé sans que rien ne le signale.

**Correction**

`npm uninstall recharts`. Si un besoin de graphiques apparaît, le réintroduire avec `next/dynamic({ ssr: false })` sur le composant graphique uniquement — recharts figure déjà dans la liste `optimizePackageImports` par défaut de Next 16, mais son runtime reste lourd.

---

### Trois routes renvoient au client le message d'erreur interne brut du fournisseur IA

**Où** : `src/app/api/agent/vision/route.ts:64` · **Catégorie** : information-disclosure

**Le problème**

`/api/agent/vision` retourne `err.message` (ligne 64), `/api/agent/plan` retourne `err.message` (src/app/api/agent/plan/route.ts:58) qui encapsule lui-même le message du fournisseur (src/lib/jarvis/ai-service.ts:72 : `"Impossible de générer un plan avec l'IA. " + e.message`), et `/api/simulation/predict` retourne `details: error.message` (src/app/api/simulation/predict/route.ts:190). Ces messages proviennent des erreurs du SDK AI et exposent au client des éléments d'infrastructure — fournisseur, identifiant de modèle, état de quota, texte d'erreur upstream — que le projet a par ailleurs délibérément retiré de la surface publique : /api/health (lignes 20-59) et le GET de /api/jarvis (lignes 404-408) ont justement été réduits pour ne plus « offrir une cartographie de l'infrastructure à n'importe quel visiteur ». Les routes Firestore, elles, renvoient toutes un message générique et loggent le détail côté serveur.

**Comment ça casse**

Un compte gratuit sature le quota du fournisseur puis appelle POST /api/agent/vision : la réponse 500 contient le message d'erreur upstream (nom du modèle appelé, motif du refus, état du quota du projet). Répété sur les trois routes, cela permet d'énumérer quels fournisseurs sont configurés et lequel est actif — l'information que /api/health réserve désormais aux administrateurs.

**Correction**

Aligner ces trois routes sur le reste du code : `console.error(err)` côté serveur et retourner un message fixe au client (« L'analyse a échoué, réessaie »), comme le font /api/checkin (ligne 33), /api/posts (ligne 58) et /api/briefing (ligne 130).

---

### `will-change: transform` sur deux blobs floutés de 900×900 px qui ne sont plus animés du tout

**Où** : `src/app/globals.css:394` · **Catégorie** : rendering-cost

**Le problème**

`.mesh-blob` déclare `filter: blur(120px)` et `will-change: transform` (l.392-394) sur un élément `60vw × 60vw` plafonné à 900×900 px, instancié deux fois dans le layout racine (layout.tsx:145-146). Or aucune règle `animation` ni `transition` ne cible `.mesh-blob` nulle part dans la feuille — la seule mention est `@media (prefers-reduced-motion: reduce) { .mesh-blob { animation: none; } }` (l.425-427), vestige d'une animation supprimée. `will-change: transform` sans animation force le navigateur à promouvoir chaque blob sur sa propre couche compositée et à l'y maintenir en permanence, pour un gain nul.

**Comment ça casse**

Sur un mobile avec 2-3 Go de RAM, chaque page maintient deux textures GPU de jusqu'à 900×900 px en RGBA (~3,2 Mo de mémoire vidéo chacune, ~6,5 Mo au total), rastérisées avec un flou gaussien de 120 px — l'opération de rastérisation la plus coûteuse du moteur de rendu. Sous pression mémoire, le navigateur évince ces couches puis doit les re-rastériser (flou compris) au scroll suivant, ce qui produit une frame longue visible. Le tout pour un halo à opacité 0,14 (0,07 en mode clair, l.422).

**Correction**

Supprimer `will-change: transform` (l.394) et la règle morte l.425-427. Remplacer `filter: blur(120px)` par un `radial-gradient` avec des arrêts de couleur adoucis, qui donne le même rendu visuel à coût de rastérisation nul.

---

### `.text-gradient-shimmer` anime `background-position` à l'infini dans la Sidebar du layout racine — repaint non composité à chaque frame, sur toutes les pages

**Où** : `src/app/globals.css:817` · **Catégorie** : rendering-cost

**Le problème**

`.text-gradient-shimmer` combine `background-clip: text`, `background-size: 200% auto` et `animation: shimmer-pan 6s linear infinite` (l.809-820), l'animation portant sur `background-position` (l.819-820). `background-position` n'est pas une propriété compositable : chaque frame déclenche un repaint, et avec `background-clip: text` le navigateur doit re-rastériser le masque de glyphes à chaque fois. Elle est appliquée dans `Sidebar.tsx:177` (`<span className="text-gradient-shimmer">.AI</span>`), donc dans le layout racine — l'animation tourne sur toutes les pages, indéfiniment, y compris quand elle est hors écran sur mobile (sidebar en drawer fermé).

**Comment ça casse**

Un visiteur laisse un onglet /maroc ouvert sur son téléphone. L'animation `shimmer-pan` empêche le navigateur de passer en état idle : elle réclame un repaint toutes les ~16 ms indéfiniment, même quand la sidebar est masquée par le drawer off-canvas. Impact mesurable sur la consommation batterie et sur la disponibilité du thread principal pendant la mesure de l'INP. Le garde `prefers-reduced-motion` (l.902-908) ne protège que la minorité d'utilisateurs qui l'ont activé.

**Correction**

Passer l'animation en `background-position` uniquement au survol, ou la limiter par `animation-iteration-count: 3` pour qu'elle s'arrête après l'effet d'accroche. À défaut, ajouter `@media (max-width: 767px) { .text-gradient-shimmer { animation: none; } }` afin qu'elle ne tourne pas sur les appareils où elle est invisible et où le coût relatif est le plus élevé.

---

### Lecture Firestore non bornée de tous les visas de l'utilisateur au chargement du dashboard, pour n'en afficher qu'un

**Où** : `src/app/page.tsx:216` · **Catégorie** : unbounded-query

**Le problème**

L'effet l.211-226 exécute `query(collection(db, COLLECTIONS.VISAS), where('user_id','==',user.uid))` puis `getDocs(q)` sans `limit()` ni `orderBy()`, mappe l'intégralité du résultat en mémoire (l.218) et effectue un `reduce` côté client (l.221) pour ne conserver que le visa le plus urgent — un seul document, affiché par `<VisaTracker>`. Le calcul de `daysLeft` (l.219-220) instancie deux objets `Date` par document à chaque comparaison.

**Comment ça casse**

Un utilisateur de longue date ayant enregistré 200 séjours (le suivi visa Schengen 90/180 encourage la saisie de chaque entrée) charge le dashboard : 200 documents sont lus, transférés et désérialisés côté client, puis 400 objets `Date` sont alloués pour un reduce, afin d'afficher une seule carte. Cette requête part en parallèle du fetch `/api/dashboard` et occupe le thread principal pendant l'hydratation, au moment exact où le LCP se joue.

**Correction**

Stocker un champ `expires_at` calculé à l'écriture et interroger `query(collection(db, VISAS), where('user_id','==',uid), orderBy('expires_at','asc'), limit(1))`, avec l'index composite `(user_id ASC, expires_at ASC)` ajouté à firestore.indexes.json. La lecture passe de N documents à 1.

---

### Simulateur : l'économie de coût de la vie est affichée comme une perte (rouge) alors que l'inversion a été faite pour l'impôt

**Où** : `src/app/simulator/page.tsx:247` · **Catégorie** : correctness

**Le problème**

Le calcul de couleur du delta inverse explicitement le signe pour l'impôt — `let diff = comp - curr; if (r.key === "tax") diff = curr - comp;` (l.246-247) — parce qu'un impôt plus bas est un gain. La même logique n'a pas été appliquée à `cost` (coût de la vie), pour lequel une valeur plus basse est également un gain. La classe de couleur utilise `diff` (l.262) alors que la valeur affichée utilise `(comp - curr)` (l.263), ce qui produit une incohérence de lecture sur cette seule ligne.

**Comment ça casse**

Comparaison France → Thaïlande : la ligne « Impôt » affiche « -20 % » en VERT (bon), tandis que la ligne « Coût de la vie » affiche « -1 200 € » en ROUGE, comme s'il s'agissait d'une dégradation, alors que c'est le principal argument financier de la destination et que le bloc « Projection d'épargne » juste en dessous le compte comme un gain. Le lecteur reçoit deux signaux contradictoires sur la même page.

**Correction**

Traiter `cost` comme `tax` : `if (r.key === "tax" || r.key === "cost") diff = curr - comp;` — ou mieux, déclarer sur chaque ligne de `rows` un champ `lowerIsBetter: boolean` et dériver la couleur de `lowerIsBetter ? curr - comp : comp - curr`, pour que l'ajout d'une future ligne ne réintroduise pas l'oubli.

---

### Timeout d'outil : le reçu d'audit affiche « [object Object] » au lieu du motif d'échec

**Où** : `src/lib/action-engine.ts:131` · **Catégorie** : error-handling

**Le problème**

`executeWithTimeout` rejette avec un littéral d'objet, pas une Error : `reject({ success: false, error: \`Timeout after ${timeoutMs}ms\` })` (l.131). Le `catch` de `executeTool` fait `err instanceof Error ? err.message : String(err)` (l.232) — `String({...})` vaut « [object Object] », et cette chaîne finit dans le champ `error` du reçu (l.247), lui-même renvoyé à l'utilisateur par /api/agent/execute (« ❌ Échec: ... », route.ts:88). Le `setTimeout` n'est par ailleurs jamais annulé après un succès de `fn()`, donc chaque appel d'outil laisse un timer en vol jusqu'à `tool.timeout` ms.

**Comment ça casse**

L'outil `google_calendar_schedule` (timeout 8 000 ms, 1 retry) dépasse son délai. L'utilisateur voit « ❌ Échec: Failed after 2 attempts: [object Object] » et le reçu stocké dans l'audit trail contient la même chaîne : impossible de distinguer un timeout d'une panne réseau ou d'une erreur d'API dans les journaux.

**Correction**

`reject(new Error(\`Timeout after ${timeoutMs}ms\`))`, et conserver l'identifiant du timer pour l'annuler dans un `finally` autour du `Promise.race` (`clearTimeout(t)`), afin de ne pas laisser de minuteur en vol après chaque appel réussi.

---

### Chaque requête API authentifiée vérifie le token Firebase deux fois

**Où** : `src/lib/auth-middleware.ts:186` · **Catégorie** : latency

**Le problème**

`enforceRateLimit()` appelle `await verifyIdToken(authHeader.slice(7))` (l.186) pour dériver la clé de limitation. Les routes appellent ensuite `authenticateRequest()` (ou `optionalAuth`), qui refait `await verifyIdToken(token)` (l.48) sur exactement le même jeton. Toutes les routes protégées appliquent ce couple : dashboard/route.ts:12+16, skills/route.ts:19 (après enforceRateLimit), language/route.ts:13, review, briefing, checkin, posts. `verifyIdToken` (firebase-admin.ts:112) délègue à `adminAuth.verifyIdToken`, qui effectue une vérification de signature RSA complète.

**Comment ça casse**

Sur un cold start de fonction Vercel, le premier appel à `adminAuth.verifyIdToken` doit récupérer les certificats publics Google avant de pouvoir vérifier ; les deux vérifications sont sérialisées avant la moindre lecture Firestore, ce qui ajoute directement au TTFB. À chaud, le surcoût est plus modeste (~2-6 ms de RSA par requête) mais il est payé sur 100 % des appels API authentifiés, alors qu'aucun code intermédiaire ne modifie le jeton entre les deux appels.

**Correction**

Faire retourner à `enforceRateLimit` le token décodé (`Promise<{ response: NextResponse | null; decoded: DecodedIdToken | null }>`) et le passer à `authenticateRequest`, ou mémoïser `verifyIdToken` par chaîne de token dans une `Map` à durée de vie de la requête. Une seule vérification par requête suffit.

---

### /api/agent/plan : le cache LLM n'est pas scopé par utilisateur, contrairement à ce que le commentaire de la route affirme

**Où** : `src/lib/jarvis/ai-service.ts:26` · **Catégorie** : cache-scoping

**Le problème**

La route passe bien l'uid vérifié (`generateActionPlanFromAI(query, userId)`, src/app/api/agent/plan/route.ts:48) et son commentaire lignes 24-26 affirme : « Identity comes from the verified token. It used to be read from the request body, which meant a caller could plan — and cache results — under someone else's id. » Mais la fonction appelée déclare ce paramètre `_unusedUserId` (src/lib/jarvis/ai-service.ts:21) et ne l'utilise nulle part : `getCachedResponse(query, systemInstruction)` (ligne 26) et `setCachedResponse(query, finalPlan, systemInstruction)` (ligne 67) omettent le 4e argument `scope`. Or `generateCacheKey` (src/lib/cache/smart-cache.ts:96-110) expose ce paramètre précisément pour ça, avec la consigne « pass a user id whenever the prompt carries personal context, otherwise one user's answer can be served to another ». La clé est donc `sha256(query, systemInstruction)`, identique pour tous les comptes, et le contenu (la requête en clair) est en plus persisté sur disque dans `os.tmpdir()/jarvis-cache.json` (smart-cache.ts:26 et 63-78).

**Comment ça casse**

Utilisateur A (authentifié) POST /api/agent/plan {"query":"réserve une table chez Le Doyenné le 12/03 à 20h pour 4, au nom de Sophie Martin"}. Le plan généré — qui contient les paramètres extraits : nom, date, heure, nombre de couverts — est stocké sous une clé qui ne dépend que du texte. Utilisateur B, autre compte, envoyant la même chaîne, reçoit le plan de A sans appel LLM (et `fromCache: true`, exposé ligne 54 de la route). La même requête entre comptes retourne le même objet, et le prompt en clair de A reste écrit sur le disque de l'instance.

**Correction**

Utiliser le paramètre : renommer `_unusedUserId` en `userId` et passer `getCachedResponse(query, systemInstruction, undefined, userId)` / `setCachedResponse(query, finalPlan, systemInstruction, undefined, userId)`. Corriger ou supprimer le commentaire de la route, qui décrit une protection inexistante.

---

