import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NoProviderError } from "../ai-providers";
import { aiUnavailableResponse } from "../ai-unavailable";

// ==============================================================================
// « Il manque une clé » ≠ « quelque chose est cassé »
// ==============================================================================
//
// Les routes /api/agent/* répondaient 500 « Internal Agent Error » aussi bien
// pour un plantage que pour une configuration absente. Celui qui débogue part
// alors chercher un bug qui n'existe pas, et l'utilisateur croit le produit en
// panne.
//
// Le cas est réel en production : StepFun, seul fournisseur configuré, déclare
// `vision: null` — /api/agent/vision n'a donc aucun modèle.

describe("aiUnavailableResponse", () => {
  it("traduit une absence de fournisseur en 503 actionnable", async () => {
    const res = aiUnavailableResponse(new NoProviderError("vision"));

    expect(res).not.toBeNull();
    expect(res!.status).toBe(503);

    const body = await res!.json();
    expect(body.reason).toBe("no_provider_configured");
    expect(body.capability).toBe("vision");
    // Le message doit dire que rien n'est cassé — c'est toute la différence.
    expect(body.message).toMatch(/rien n'est cassé/i);
    expect(body.remediation).toMatch(/clé/i);
  });

  it("laisse passer les vraies erreurs pour qu'elles restent des 500", () => {
    // Sinon on masquerait des pannes réelles derrière « ajoutez une clé ».
    expect(aiUnavailableResponse(new Error("connexion Firestore perdue"))).toBeNull();
    expect(aiUnavailableResponse(new TypeError("undefined is not a function"))).toBeNull();
    expect(aiUnavailableResponse("chaîne quelconque")).toBeNull();
  });

  it("ne divulgue aucune valeur de clé", async () => {
    const body = await aiUnavailableResponse(new NoProviderError("fast"))!.json();
    const serialized = JSON.stringify(body);
    // Seuls des NOMS de variables peuvent apparaître, jamais une valeur.
    expect(serialized).not.toMatch(/sk-|AIza[0-9A-Za-z_-]{10,}/);
  });
});

describe("routes IA", () => {
  const ROOT = join(__dirname, "..", "..", "..");

  it("traitent toutes l'indisponibilité avant de retomber en 500", () => {
    const routes = [
      "src/app/api/agent/route.ts",
      "src/app/api/agent/plan/route.ts",
      "src/app/api/agent/vision/route.ts",
    ];

    const missing = routes.filter(
      (rel) => !readFileSync(join(ROOT, rel), "utf8").includes("aiUnavailableResponse")
    );

    expect(
      missing,
      `Routes IA sans dégradation honnête (une clé manquante y passerait pour un bug) :\n  ${missing.join("\n  ")}`
    ).toEqual([]);
  });

  it("ne codent aucun modèle en dur hors de la chaîne de fournisseurs", () => {
    // ai-service.ts appelait `google('gemini-1.5-pro-latest')` en dur : avec une
    // clé Groq/Cerebras/Mistral/StepFun configurée, la génération de plan
    // échouait quand même. C'était le cas en production.
    const src = readFileSync(join(ROOT, "src/lib/jarvis/ai-service.ts"), "utf8");

    expect(src).toContain("withProviderFailover");

    // On vise l'IMPORT, pas l'appel : impossible d'instancier un provider sans
    // l'importer, et contrairement à une recherche sur `google(`, cela ne peut
    // pas être déclenché par un commentaire qui cite l'ancien code.
    expect(
      src,
      "importer un provider directement contourne la chaîne de failover"
    ).not.toMatch(/^\s*import[^\n]*@ai-sdk\/(google|openai|anthropic)/m);
  });

  it("laisse NoProviderError traverser ai-service sans être ré-emballée", () => {
    // Emballée dans un Error générique, elle redeviendrait un 500.
    const src = readFileSync(join(ROOT, "src/lib/jarvis/ai-service.ts"), "utf8");
    expect(src).toMatch(/NoProviderError/);
  });
});
