import { registerRestaurantTools } from "./restaurants";

// ==============================================================================
// INITIALISATION DU REGISTRE D'OUTILS — un seul endroit
// ==============================================================================
//
// Chaque route qui touchait à l'Action Engine portait sa propre copie d'un
// `ensureTools()` avec son propre booléen. Résultat : /api/agent, qui EXÉCUTE
// des outils, n'appelait aucune de ces copies — le modèle pouvait donc choisir
// `book_restaurant` et recevoir « tool not found », alors que /api/agent/plan
// le présentait comme disponible dans son manifeste.
//
// Un registre partiel est pire qu'un registre vide : il varie selon la route
// par laquelle on entre.

let registered = false;

export function ensureToolsRegistered() {
  if (registered) return;
  registerRestaurantTools();
  registered = true;
}
