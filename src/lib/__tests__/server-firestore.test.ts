import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// ==============================================================================
// Le serveur ne parle pas à Firestore avec le SDK client
// ==============================================================================
//
// Côté serveur, le SDK **client** Firebase n'a aucun utilisateur connecté :
// chaque opération arrive dans les règles avec `request.auth == null`.
// `firestore.rules` refuse par défaut et exige un propriétaire authentifié.
// Les deux ne peuvent donc pas coexister :
//
//   • règles déployées    → toutes les routes API sont refusées (app cassée) ;
//   • règles non déployées → la base est joignable directement avec la config
//     web publique, et les `authenticateRequest()` des routes ne protègent
//     plus rien du tout.
//
// Les routes utilisent maintenant l'Admin SDK (`serverDb()`), qui contourne les
// règles — le contrôle d'accès y est explicite : token vérifié + filtrage par
// uid. Cela permet de déployer des règles strictes qui ferment l'accès client
// direct.
//
// Ce test échoue si quelqu'un réintroduit le SDK client dans une route API.

const API_DIR = join(__dirname, "..", "..", "app", "api");

function routeFiles(dir = API_DIR, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) routeFiles(full, acc);
    else if (/\.tsx?$/.test(entry)) acc.push(full);
  }
  return acc;
}

describe("accès Firestore côté serveur", () => {
  it("trouve bien les routes qu'il est censé vérifier", () => {
    // Garde du test lui-même : si la découverte casse, les assertions
    // ci-dessous passeraient à vide.
    const files = routeFiles();
    expect(files.length).toBeGreaterThan(5);
    expect(files.some((f) => f.includes("checkin"))).toBe(true);
  });

  it("n'importe jamais le SDK client firebase/firestore dans une route API", () => {
    const offenders = routeFiles().filter((f) =>
      /from\s+["']firebase\/firestore["']/.test(readFileSync(f, "utf8"))
    );

    expect(
      offenders.map((f) => f.replace(API_DIR, "api")),
      `Routes API utilisant le SDK client Firestore (request.auth == null côté serveur) :\n  ${offenders.join("\n  ")}`
    ).toEqual([]);
  });

  it("n'importe jamais l'instance client `db` dans une route API", () => {
    // `COLLECTIONS` reste autorisé : c'est une simple table de noms, sans SDK.
    const offenders = routeFiles().filter((f) => {
      const src = readFileSync(f, "utf8");
      const imports = [...src.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']@\/lib\/firebase["']/g)];
      return imports.some((m) =>
        m[1]
          .split(",")
          .map((s) => s.trim().split(/\s+as\s+/)[0].trim())
          .includes("db")
      );
    });

    expect(
      offenders.map((f) => f.replace(API_DIR, "api")),
      `Routes API important l'instance Firestore client :\n  ${offenders.join("\n  ")}`
    ).toEqual([]);
  });

  it("expose un accès serveur unique via serverDb()", () => {
    const helper = readFileSync(join(__dirname, "..", "firestore-server.ts"), "utf8");
    expect(helper).toContain("export async function serverDb()");
    // L'import doit rester paresseux : charger ce module ne doit pas exiger
    // les credentials Admin (tests, graphe de dépendances client).
    expect(helper).toContain('await import("./firebase-admin")');
  });
});
