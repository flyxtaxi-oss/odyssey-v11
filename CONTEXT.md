# 🧠 CONTEXT — ODYSSEY.V11 MEMORY FILE

> **Fichier de contexte persistant pour l'assistant AI**
> Dernière mise à jour : 2026-04-01 (Session Boost)
> Projet : Odyssey.v11 — Life Operating System with AI
> URL Production : https://odyssey-pan8fp511-zianes-projects-19410ea7.vercel.app

---

## 🎯 RÉSUMÉ PROJET

**Odyssey.v11** est un Life Operating System pour expatriés et nomades digitaux, combinant :
- **J.A.R.V.I.S.** : IA multi-persona (Sage, Stratège, Coach, Exécuteur, Ami)
- **Simulateur de Trajectoire** : Comparateur fiscal multipays
- **Safe-Zone** : Communauté vérifiée avec modération IA
- **Skill Tree** : Apprentissage gamifié
- **Action Engine** : Exécution d'actions réelles

**Stack** : Next.js 16 + TypeScript + Firebase + AI SDK (Claude/Gemini)

---

## 🏗️ ARCHITECTURE

```
/src
├── /app                    # Next.js App Router
│   ├── /api               # Routes API
│   │   ├── /jarvis       # Chat IA avec streaming
│   │   ├── /posts        # Safe-Zone (CRUD + modération)
│   │   ├── /simulator    # Simulations fiscalité
│   │   ├── /skills       # Skill tree & missions
│   │   ├── /language     # Language Lab
│   │   └── /agent        # Action Engine
│   ├── /jarvis           # Interface chat
│   ├── /simulator        # Interface simulation
│   ├── /safezone         # Communauté
│   ├── /skills           # Progression
│   ├── /language         # Apprentissage langues
│   └── /login            # Auth Firebase
├── /components           # React components
│   ├── CommandCenter.tsx # Dashboard principal
│   └── Sidebar.tsx       # Navigation
├── /contexts            # React contexts
│   └── AuthContext.tsx  # Firebase auth state
└── /lib                 # Core libraries
    ├── firebase.ts      # Firebase client (Auth + Firestore)
    ├── firebase-admin.ts # Firebase Admin SDK (server)
    ├── auth-middleware.ts # Auth middleware sécurisé
    ├── validation.ts    # Zod schemas
    ├── vertex-ai.ts     # Smart AI routing (Gemini/Claude)
    ├── ai-engine.ts     # Cache, rate limiting, memory
    ├── security.ts      # Anti-prompt injection
    └── action-engine.ts # Tool registry
```

---

## ⚙️ CONFIGURATION

### Variables d'Environnement (Vercel)
```bash
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Production)
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# AI APIs
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

### Firebase
- **Project ID** : `jarvis-53b7c`
- **Auth** : Email/Password
- **Database** : Firestore
- **Rules** : Déployées ([`firestore.rules`](firestore.rules))

### Déploiement
- **Production** : https://odyssey-1v9ua2832-zianes-projects-19410ea7.vercel.app
- **Platform** : Vercel (lié à zianes-projects-19410ea7/odyssey)

---

## 🔐 SÉCURITÉ

### ✅ Implémenté
- Firebase Admin SDK pour vérif tokens server-side
- Validation Zod sur toutes les routes API
- Middleware d'authentification réutilisable
- Rate limiting (Token Bucket)
- Anti-prompt injection
- CSP Headers
- Firestore Security Rules (user-based)

### ⚠️ À Configurer (Production)
- [ ] Service Account Firebase (FIREBASE_PRIVATE_KEY)
- [ ] Domaines autorisés dans Firebase Auth
- [ ] Clés API Anthropic/Google

---

## 🤖 AI / VERTEX AI

### Smart Routing
| Modèle | Use Case | Coût/1K tokens |
|--------|----------|----------------|
| `gemini-fast` | Réponses rapides | $0.0001 |
| `gemini-pro` | Raisonnement complexe | $0.0035 |
| `claude-haiku` | Cost-effective | $0.00025 |
| `claude-sonnet` | Qualité maximale | $0.003 |

### Features AI
- Multi-persona JARVIS
- Streaming responses
- Conversation memory (Knowledge Graph)
- Response caching (30min TTL)
- Cost tracking

---

## 📋 ROADMAP

### 🔴 P0 — Critique
- [ ] **Offline Mode** : Service Workers + IndexedDB
- [ ] **Mobile App** : React Native / Expo

### 🟡 P1 — Important
- [ ] **Visa Tracker** : Alertes, compte à rebours
- [ ] **Action Engine V2** : Booking réel (Calendar, restaurants)
- [ ] **Push Notifications** : Firebase Cloud Messaging

### 🟢 P2 — Amélioration
- [ ] **Voice Interface** : STT/TTS
- [ ] **Dashboard Widgets** : Drag & drop
- [ ] **Onboarding IA** : Wizard personnalisé

### 🔵 P3 — Wow
- [ ] **AR City Explorer**
- [ ] **AI Podcast Personnel**
- [ ] **Digital Twin**

---

## 🎯 CONCURRENTS

| Concurrent | Force | Faiblesse vs Odyssey |
|------------|-------|----------------------|
| Notion + AI | Flexible | Pas d'IA proactive |
| Motion | Auto-scheduling | Pas social |
| Nomad List | Data villes | Pas d'IA |
| Tana | Knowledge graph | Pas d'agent |

**Avantage unique** : Seul avec IA multi-persona + Expatriation + Communauté vérifiée + Action execution

---

## 📝 FICHIERS CLÉS

| Fichier | Description |
|---------|-------------|
| [`src/lib/firebase.ts`](src/lib/firebase.ts) | Firebase client config |
| [`src/lib/firebase-admin.ts`](src/lib/firebase-admin.ts) | Firebase Admin SDK |
| [`src/lib/auth-middleware.ts`](src/lib/auth-middleware.ts) | Auth middleware |
| [`src/lib/validation.ts`](src/lib/validation.ts) | Zod schemas |
| [`src/lib/vertex-ai.ts`](src/lib/vertex-ai.ts) | Smart AI routing |
| [`src/lib/security.ts`](src/lib/security.ts) | Anti-injection |
| [`firestore.rules`](firestore.rules) | Security rules |
| [`CONTEXT.md`](CONTEXT.md) | Ce fichier |

---

## 🚀 COMMANDES UTILES

```bash
# Développement
npm run dev

# Build
npm run build

# Déploiement
vercel --prod

# Firebase
npx firebase deploy --only firestore:rules
npx firebase projects:list
```

---

## 🎓 CONNAISSANCE PROJET

### Business Model Suggéré
| Plan | Prix | Features |
|------|------|----------|
| Free | €0 | JARVIS limité, 3 sims/mois |
| Pro | €29/mois | Illimité + Safe-Zone |
| Elite | €99/mois | + Conciergerie IA |

### Métriques Clés
- **Cible** : 35M+ nomades digitaux
- **Growth** : 15%/an
- **Retention D7** : Target 40%
- **NPS** : Target 50+

---

## 💡 POUR L'ASSISTANT AI

### Quand Tu Reprends le Projet
1. Lire ce fichier CONTEXT.md
2. Vérifier [`docs/ROADMAP_EXCEPTIONAL.md`](docs/ROADMAP_EXCEPTIONAL.md) pour les features en cours
3. Vérifier [`docs/market/COMPETITIVE_ANALYSIS.md`](docs/market/COMPETITIVE_ANALYSIS.md) pour le positionnement
4. Checker `git status` pour voir les modifications récentes

### Patterns de Code
- **Auth** : Toujours utiliser `authenticateRequest()` dans les routes API
- **Validation** : Toujours utiliser Zod schemas
- **Firestore** : Toujours vérifier `user_id` pour la sécurité
- **AI** : Utiliser `routeModel()` pour choisir le meilleur modèle

---

## 📞 CONTACTS & RESSOURCES

- **Firebase Console** : https://console.firebase.google.com/project/jarvis-53b7c
- **Vercel Dashboard** : https://vercel.com/zianes-projects-19410ea7/odyssey
- **Production URL** : https://odyssey-1v9ua2832-zianes-projects-19410ea7.vercel.app

---

> **Note** : Ce fichier est la mémoire persistante du projet. Il doit être mis à jour à chaque session importante.
