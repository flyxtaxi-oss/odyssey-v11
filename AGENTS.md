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

### Invariants — ne pas les recasser

Chacun correspond à une faille réellement trouvée et corrigée. Chacun est
protégé par un test qui échoue si on l'enfreint.

1. **Firestore côté serveur = Admin SDK.** Les routes API passent par
   `serverDb()` (`lib/firestore-server.ts`), jamais par le SDK client : côté
   serveur celui-ci arrive avec `request.auth == null`, donc soit les règles le
   refusent, soit c'est qu'elles ne sont pas déployées et la base est ouverte.
   → `__tests__/server-firestore.test.ts`

2. **L'identité vient du token vérifié, jamais du body.** Aucun `user_id`,
   `author_id` ou `uid` lu depuis la requête.

3. **Le rôle `system` n'existe pas dans le contrat client.** Le prompt système
   est construit côté serveur ; l'historique client est non fiable.
   → `__tests__/validation.test.ts`

4. **Une simulation ne renvoie jamais `completed`.** `ToolDefinition.simulated`
   est obligatoire ; un outil sans effet réel produit le statut `simulated`.
   Ne jamais afficher un succès pour une action qui n'a pas eu lieu.
   → `__tests__/action-engine.test.ts`

5. **Pas de modèle IA codé en dur.** Tout passe par `withProviderFailover()` :
   un modèle en dur ignore les autres clés configurées et casse en production.
   → `__tests__/ai-unavailable.test.ts`

6. **Clé manquante ≠ panne.** Une capacité IA non configurée renvoie 503 via
   `aiUnavailableResponse()`, pas 500.

7. **`posts` est fermé en écriture côté client.** Le fil est public et modéré
   par `/api/posts` ; laisser le client écrire lui permettait de poser son
   propre `is_verified: true`.
   → `__tests__/firestore-rules.emulator.test.ts`

8. **Ne jamais fabriquer une donnée juridique, fiscale ou visa.** Sans
   fournisseur IA, répondre « non configuré » — jamais une réponse plausible.

### Règles Firestore

`user_id` et `author_id` sont immuables, l'auteur est imposé à la création,
`audit_log` est append-only auto-attribué, le champ `role` échappe à son
propriétaire, et tout le reste est refusé par défaut.

Les tests textuels ne suffisent pas : `npm run test:rules` rejoue 18 scénarios
d'autorisation réels dans l'emulator (Alice/Bob, usurpation, transfert de
propriété, escalade de privilège).

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
npm run dev            # Développement (sans emulator : les routes API renvoient 401)
npm run dev:emulator   # Développement contre Firestore + Auth Emulator ← à privilégier
npm run emulator       # Emulators seuls (UI : http://localhost:4000)

npm run verify         # typecheck + lint + tests — ce que lance pre-push
npm run verify:all     # + règles Firestore (emulator) + build
npm run test:rules     # 18 scénarios d'autorisation réels
```

**Prérequis local** : Node 24 (`.nvmrc`) et un JDK pour l'emulator
(`brew install openjdk`).

**Hooks git** (husky, versionnés) :
- `pre-commit` — bloque `.env`/clés en clair. Instantané, donc jamais contourné.
- `pre-push` — typecheck + lint + tests, les mêmes portes que la CI.
- Urgence : `--no-verify`.

---

## Notes Importantes

- Le projet utilise Firebase Admin SDK pour la verification server-side
- Rate limiting avec Token Bucket pattern
- Anti-prompt injection sur toutes les entrees utilisateur
- Conversation memory avec Knowledge Graph
- Response caching (30min TTL)
