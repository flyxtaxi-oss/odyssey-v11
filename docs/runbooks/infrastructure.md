# Runbook infrastructure — Odyssey

Setup opérationnel : credentials, Cloudflare, Sentry, emulator, déploiement.
Écrit le 3 août 2026.

---

## 1. Firebase Admin — BLOQUANT

**Symptôme si absent : toutes les routes authentifiées renvoient 401.**
`verifyIdToken` échoue fermé sans credentials (choix volontaire — le contraire
laisserait passer des JWT non vérifiés), et `serverDb()` ne peut pas s'ouvrir.

1. Console → Paramètres du projet → Comptes de service → **Générer une nouvelle
   clé privée** : https://console.firebase.google.com/project/jarvis-53b7c/settings/serviceaccounts/adminsdk
2. Du JSON obtenu, récupérer `client_email` et `private_key`.
3. Production :
   ```
   vercel env add FIREBASE_CLIENT_EMAIL production
   vercel env add FIREBASE_PRIVATE_KEY production
   ```
   `private_key` se colle **avec ses `\n` littéraux** — le code fait déjà
   `.replace(/\\n/g, "\n")`.
4. Local : mêmes variables dans `.env.local` (jamais committé).
5. Vérifier : `curl -s https://<domaine>/api/health` doit répondre `{"status":"ok"}`
   et non `"degraded"`.

**Rotation** : générer la nouvelle clé, mettre à jour Vercel, redéployer, puis
seulement révoquer l'ancienne dans la console. Jamais l'inverse.

---

## 2. Cloudflare en full proxy — le piège du rate limiting

Décision retenue : Cloudflare devient la porte d'entrée complète (WAF, cache,
règles), Vercel reste l'origine.

### ⚠️ Ce qu'il faut absolument verrouiller

Le code lit `CF-Connecting-IP` pour identifier le client (rate limiting,
détection de pays). **Cet en-tête est falsifiable par quiconque atteint
l'origine Vercel directement.** Sans verrou, un attaquant fait tourner la valeur
et obtient un bucket de rate-limit neuf à chaque requête — la protection
disparaît en silence.

**Le full proxy n'est donc sûr QUE si l'origine n'accepte que Cloudflare.**

Deux options, à faire *avant* de basculer le DNS :

- **Vercel Firewall** : règle qui n'autorise que les plages IP Cloudflare
  (https://www.cloudflare.com/ips/) ;
- **ou** en-tête secret partagé : Cloudflare Transform Rule qui ajoute
  `X-Origin-Auth: <secret>`, et une règle Vercel qui rejette sans lui.

### Configuration

1. **DNS** : les enregistrements du domaine pointent vers Vercel, statut
   « Proxied » (nuage orange).
2. **SSL/TLS** : mode **Full (strict)**. En « Flexible », le trafic
   Cloudflare→Vercel repasse en HTTP : ton `Strict-Transport-Security` devient
   un mensonge.
3. **Cache Rules** : ne jamais mettre en cache `/api/*` ni `/monitoring`
   (tunnel Sentry). Le cache de Cloudflare devant celui de Vercel se débugge
   mal — commencer restrictif.
4. **WAF** : ruleset managé en mode « Managed Challenge », puis affiner. Vérifier
   que le streaming de `/api/jarvis` n'est pas coupé (SSE).
5. **Ne pas activer** : Rocket Loader, Auto Minify, Email Obfuscation — ils
   réécrivent le HTML/JS et cassent l'hydratation React ainsi que la CSP.

### Après bascule, vérifier

- `curl -sI https://<domaine> | grep -i "cf-ray\|content-security-policy"` —
  les deux doivent être présents (Cloudflare passe *et* le middleware s'exécute) ;
- se connecter, puis marteler `/api/jarvis` : le 429 doit arriver, et
  **seulement pour ce compte** (sinon la détection d'IP est cassée) ;
- vérifier que `/monitoring` répond (sinon Sentry est muet côté navigateur).

---

## 3. Sentry

Le DSN n'est pas un secret (il est public côté navigateur). `SENTRY_AUTH_TOKEN`
en est un.

1. Créer le projet sur sentry.io (plateforme **Next.js**).
2. `vercel env add NEXT_PUBLIC_SENTRY_DSN production` (+ preview).
3. `vercel env add SENTRY_ORG production`, `vercel env add SENTRY_PROJECT production`.
4. `SENTRY_AUTH_TOKEN` en **secret GitHub Actions** (scope `project:releases`)
   pour l'upload des source maps.

### Ce qui est déjà verrouillé côté code

- `sendDefaultPii: false` — pas d'IP, pas de cookies, pas d'en-tête d'auth ;
- `beforeSend` filtre en-têtes, corps de requête, query string, breadcrumbs et
  toute clé métier sensible (revenus, nationalité, situation familiale,
  passeport, prompts) — voir `src/lib/sentry-scrub.ts`, couvert par 13 tests ;
- **Session Replay désactivé** : rejouer l'écran de quelqu'un saisissant sa
  situation fiscale est un enregistrement de données personnelles. À n'activer
  qu'avec consentement explicite ;
- source maps supprimées du bundle servi après upload.

**RGPD** : Sentry devient un sous-traitant. Il faut le mentionner dans la
politique de confidentialité et choisir la région **EU** à la création du projet.

---

## 4. Emulator Firestore (tests de règles)

Nécessite un JDK.

```
brew install openjdk
echo 'export PATH="/usr/local/opt/openjdk/bin:$PATH"' >> ~/.zshrc
```

- `npm run emulator` — emulator seul (UI sur http://localhost:4000)
- `npm run test:rules` — 13 scénarios d'autorisation réels (Alice/Bob,
  usurpation, transfert de propriété, escalade `role`, refus par défaut)
- `npm run verify:all` — typecheck + lint + tests + règles + build

Sans emulator, `npm test` **saute** ces tests au lieu d'échouer, pour ne pas
rendre la suite dépendante d'un service externe. La CI, elle, démarre
l'emulator : c'est là que la garantie Alice≠Bob est réellement appliquée.

---

## 5. Ordre de déploiement

L'ordre compte : code et règles doivent rester cohérents.

1. Credentials Admin présents en production (§1) ;
2. `vercel deploy --prod` ;
3. vérifier `/api/health` et une route authentifiée ;
4. `firebase deploy --only firestore:indexes` — **avant** les règles, la
   construction d'index prend plusieurs minutes ;
5. `firebase deploy --only firestore:rules` ;
6. activer la **politique TTL Firestore** sur `rate_limits.expires_at`, sinon
   les documents de quota s'accumulent indéfiniment.

**Rollback** : redéployer les règles précédentes
(`git show HEAD:firestore.rules`) puis la version de code antérieure. Les deux
reviennent ensemble — une version de code qui parle en Admin SDK avec des règles
anciennes fonctionne, l'inverse non.
