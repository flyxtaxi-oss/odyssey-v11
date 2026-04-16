# AGENTS.md — Odyssey.v11

## Projet
**Odyssey.v11** — Life Operating System pour expatriés et nomades digitaux

Stack: Next.js 16 + TypeScript + Firebase + AI SDK (Claude/Gemini)

---

## Règles de Développement

### Avant de coder
- [ ] Comprendre le problème avant d'agir
- [ ] Si plusieurs interpretations, les presenter
- [ ] Demander si quelque chose est flou

### Simplicite
- [ ] Minimum de code qui resout le probleme
- [ ] Pas d'abstractions speculation
- [ ] Si 200 lignes alors que 50 suffisent → reecrire

### Changements chirurgicaux
- [ ] Toucher uniquement ce qui est necessaire
- [ ] Ne pas "ameliorer" le code adjacent
- [ ] Respecter le style existant

### Qualite
- [ ] Types TypeScript corrects (pas de `any`)
- [ ] Pas de `ts-ignore` speciaux
- [ ] Error handling present
- [ ] Security: pas de secrets hardcodes

---

## Composants Connus

| Composant | Description | Fichier |
|-----------|-------------|---------|
| CommandCenter | Dashboard principal | src/components/CommandCenter.tsx |
| Sidebar | Navigation | src/components/Sidebar.tsx |
| AuthContext | Firebase auth state | src/contexts/AuthContext.tsx |

---

## API Routes

| Route | Description |
|-------|-------------|
| /api/jarvis | Chat IA avec streaming |
| /api/posts | Safe-Zone CRUD + moderation |
| /api/simulator | Simulations fiscalite |
| /api/skills | Skill tree & missions |
| /api/language | Language Lab |
| /api/agent | Action Engine |

---

## Security

- **TOUJOURS** utiliser `authenticateRequest()` dans les routes API
- **TOUJOURS** utiliser Zod schemas pour validation
- **TOUJOURS** verifier `user_id` pour la securite Firestore
- **TOUJOURS** utiliser `routeModel()` pour le smart routing AI

---

## Design System

Voir `~/.config/kilo/skills/odyssey-design/SKILL.md`

Couleurs principales:
- Primary: `#3B82F6`
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Background: `#0A0A0F`
- Surface: `#111118`

---

## Features

- **J.A.R.V.I.S.** — IA multi-persona (Sage, Stratege, Coach, Executant, Ami)
- **Simulateur** — Comparateur fiscal multipays
- **Safe-Zone** — Communaute verifiee avec moderation IA
- **Skill Tree** — Apprentissage gamifie
- **Action Engine** — Execution d'actions reales
- **Language Lab** — Apprentissage langues

---

## Commandes Utiles

```bash
npm run dev      # Development
npm run build    # Production build
npx tsc --noEmit # Type check
```

---

## Notes Importantes

- Le projet utilise Firebase Admin SDK pour la verification server-side
- Rate limiting avec Token Bucket pattern
- Anti-prompt injection sur toutes les entrees utilisateur
- Conversation memory avec Knowledge Graph
- Response caching (30min TTL)
