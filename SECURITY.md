# 🔐 SECURITY GUIDE — Odyssey.v11

## ✅ VULNÉRABILITÉS CORRIGÉES

### 1. Authentication JWT Sécurisée
- **Fichier** : [`src/lib/firebase-admin.ts`](src/lib/firebase-admin.ts)
- **Fichier** : [`src/lib/auth-middleware.ts`](src/lib/auth-middleware.ts)
- **Correction** : Les tokens Firebase sont maintenant vérifiés server-side avec Firebase Admin SDK

### 2. Validation des Inputs (Zod)
- **Fichier** : [`src/lib/validation.ts`](src/lib/validation.ts)
- **Correction** : Toutes les routes API valident les inputs avec Zod

### 3. Sécurisation des Variables d'Environnement
- **Fichier** : [`.gitignore`](.gitignore)
- **Correction** : `.env.local` et `.env*.local` sont maintenant ignorés par Git

---

## 🔧 CONFIGURATION PRODUCTION

### 1. Service Account Firebase

Pour activer la vérification complète des tokens en production :

1. Va sur https://console.firebase.google.com/project/jarvis-53b7c/settings/serviceaccounts
2. Clique sur **"Générer une nouvelle clé privée"**
3. Télécharge le fichier JSON
4. Ajoute ces variables dans `.env.local` :

```bash
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@jarvis-53b7c.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

**IMPORTANT** : Remplace les sauts de ligne par `\n` dans la clé privée.

---

## 🛡️ SÉCURITÉ IMPLÉMENTÉE

### Authentification
- ✅ JWT Token verification avec Firebase Admin SDK
- ✅ Middleware d'authentification réutilisable
- ✅ Auth optionnel pour routes publiques

### Validation
- ✅ Zod schemas pour tous les inputs API
- ✅ Validation des emails et passwords
- ✅ Sanitization des strings

### Protection
- ✅ Rate limiting (Token Bucket)
- ✅ Anti-prompt injection
- ✅ CSP Headers
- ✅ Security headers (OWASP)
- ✅ Firestore Security Rules

---

## 🔍 AUDIT LOGS

Les actions sensibles sont loggées dans [`src/lib/security.ts`](src/lib/security.ts):
- Tentatives de prompt injection
- Actions utilisateurs
- Rate limit hits

---

## ⚠️ CHECKLIST PRÉ-PRODUCTION

- [ ] Service Account Firebase configuré
- [ ] Domaines autorisés dans Firebase Auth settings
- [ ] Firestore Rules déployées
- [ ] `.env.local` dans `.gitignore`
- [ ] Clés API Anthropic/Google configurées
- [ ] Rate limiting testé
- [ ] Tests de sécurité effectués

---

## 🚨 EN CAS DE PROBLÈME

### Token invalide
```bash
# Vérifier la connexion Firebase
npx firebase login
```

### Rate limit dépassé
Attends 60 secondes ou redémarre le serveur de développement.

### Permission Firestore refusée
```bash
# Redéployer les règles
npx firebase deploy --only firestore:rules
```
