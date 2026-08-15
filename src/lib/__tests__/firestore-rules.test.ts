import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// ==============================================================================
// Firestore rules coverage
// ==============================================================================
//
// Firestore fails closed: a collection with no `match` block is denied in
// production. Nothing in the type system or the build catches that — the app
// compiles, deploys, and then silently cannot read or write.
//
// This is not hypothetical: `predictions` was written by
// /api/simulation/predict with no matching rule, so the whole prediction
// feature was dead in production while working locally against the emulator.
//
// These tests fail the build when code and rules drift apart again.

const ROOT = join(__dirname, "..", "..", "..");
const RULES = readFileSync(join(ROOT, "firestore.rules"), "utf8");

/** Collection names that appear in a `match /<name>/{...}` block. */
function declaredCollections(): Set<string> {
  const names = new Set<string>();
  for (const m of RULES.matchAll(/match\s+\/([a-zA-Z_][a-zA-Z0-9_]*)\s*\/\s*\{/g)) {
    if (m[1] !== "databases") names.add(m[1]);
  }
  return names;
}

/** Every .ts/.tsx file under src/. */
function sourceFiles(dir = join(ROOT, "src"), acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      sourceFiles(full, acc);
    } else if (/\.tsx?$/.test(entry) && !full.includes("__tests__")) {
      acc.push(full);
    }
  }
  return acc;
}

/**
 * Collection names referenced from application code, in either SDK style:
 *
 *   • SDK client (pages/composants) : collection(db, "posts"),
 *     doc(db, COLLECTIONS.CHECKINS, id) ;
 *   • Admin SDK (routes API)        : db.collection("posts"),
 *     db.collection(COLLECTIONS.CHECKINS).doc(id).
 *
 * Le second style est apparu en migrant les routes serveur vers l'Admin SDK.
 * Sans lui, ce test devenait aveugle aux collections utilisées côté serveur —
 * et une collection sans règle serait passée inaperçue.
 */
function usedCollections(): Map<string, string[]> {
  const used = new Map<string, string[]>();

  // COLLECTIONS.SKILL_TRACKS -> "skill_tracks"
  const firebaseSrc = readFileSync(join(ROOT, "src", "lib", "firebase.ts"), "utf8");
  const constToName = new Map<string, string>();
  const block = firebaseSrc.match(/COLLECTIONS\s*=\s*\{([\s\S]*?)\}/);
  if (block) {
    for (const m of block[1].matchAll(/(\w+)\s*:\s*["'`]([\w-]+)["'`]/g)) {
      constToName.set(m[1], m[2]);
    }
  }

  const record = (name: string, file: string) => {
    const rel = file.replace(ROOT + "/", "");
    const list = used.get(name) ?? [];
    if (!list.includes(rel)) list.push(rel);
    used.set(name, list);
  };

  for (const file of sourceFiles()) {
    const src = readFileSync(file, "utf8");

    // collection(db, "name") / doc(db, "name", id)
    for (const m of src.matchAll(/\b(?:collection|doc)\(\s*\w+\s*,\s*["'`]([\w-]+)["'`]/g)) {
      record(m[1], file);
    }

    // collection(db, COLLECTIONS.NAME) / doc(db, COLLECTIONS.NAME, id)
    for (const m of src.matchAll(/\b(?:collection|doc)\(\s*\w+\s*,\s*COLLECTIONS\.(\w+)/g)) {
      const name = constToName.get(m[1]);
      if (name) record(name, file);
    }

    // Admin SDK : db.collection("name")
    for (const m of src.matchAll(/\.collection\(\s*["'`]([\w-]+)["'`]\s*\)/g)) {
      record(m[1], file);
    }

    // Admin SDK : db.collection(COLLECTIONS.NAME)
    for (const m of src.matchAll(/\.collection\(\s*COLLECTIONS\.(\w+)\s*\)/g)) {
      const name = constToName.get(m[1]);
      if (name) record(name, file);
    }
  }

  return used;
}

describe("firestore.rules coverage", () => {
  it("declares a rule for every collection the app reads or writes", () => {
    const declared = declaredCollections();
    const used = usedCollections();

    const missing = [...used.entries()]
      .filter(([name]) => !declared.has(name))
      .map(([name, files]) => `${name} (used in ${files.join(", ")})`);

    expect(
      missing,
      `Collections used in code but absent from firestore.rules — these fail closed in production:\n  ${missing.join("\n  ")}`
    ).toEqual([]);
  });

  it("finds the collections it is supposed to be checking", () => {
    // Guards the heuristic itself: if the regexes stop matching, the test
    // above would pass vacuously and stop protecting anything.
    const used = usedCollections();
    expect(used.size).toBeGreaterThan(3);
    expect([...used.keys()]).toContain("predictions");
  });

  it("grants no unrestricted write access", () => {
    // `allow write: if true` (or read+write) would expose the database to
    // anyone on the internet.
    const dangerous = [...RULES.matchAll(/allow\s+([\w,\s]*write[\w,\s]*):\s*if\s+true\s*;/g)]
      .map((m) => m[0]);

    expect(dangerous, `Unrestricted write rules found:\n  ${dangerous.join("\n  ")}`).toEqual([]);
  });

  it("scopes every user-owned collection to request.auth.uid", () => {
    // Each match block that touches user_id — directly or through the
    // ownsExisting()/createsAsSelf() helpers — must bind it to the caller.
    const callerBound = ["request.auth.uid", "ownsExisting()", "createsAsSelf()"];
    const blocks = RULES.split(/match\s+\//).slice(1);
    const offenders: string[] = [];

    for (const block of blocks) {
      const name = block.match(/^([a-zA-Z_][a-zA-Z0-9_]*)/)?.[1];
      if (!name || name === "databases") continue;
      const userScoped =
        block.includes("user_id") || callerBound.some((m) => block.includes(m));
      if (!userScoped) continue;
      if (!callerBound.some((m) => block.includes(m))) offenders.push(name);
    }

    expect(offenders, `Collections keyed by user_id but not bound to the caller: ${offenders.join(", ")}`).toEqual([]);
  });

  // ── Durcissement : identité immuable et attribution imposée ────────────────
  //
  // Ces gardes textuels ne remplacent pas des tests Firebase Emulator (à
  // ajouter), mais ils font échouer le build si quelqu'un retire les
  // protections en réécrivant les règles.

  it("keeps user_id immutable on every update of an owned collection", () => {
    // The helper must exist…
    expect(RULES).toContain("function userIdImmutable()");
    expect(RULES).toContain(
      "request.resource.data.user_id == resource.data.user_id"
    );

    // …and every update rule built on ownsExisting() must also apply it.
    // Sans cela, un update peut réécrire user_id et transférer le document.
    const updates = RULES.match(/allow update:[^;]+;/g) ?? [];
    const unprotected = updates.filter(
      (r) => r.includes("ownsExisting()") && !r.includes("userIdImmutable()")
    );
    expect(unprotected, `Updates sans immuabilité de user_id:\n  ${unprotected.join("\n  ")}`).toEqual([]);
  });

  it("garde le fil public en lecture mais fermé en écriture côté client", () => {
    // Le fil est modéré par /api/posts (checkPromptInjection + moderateContent)
    // avant écriture via l'Admin SDK. Autoriser l'écriture client, même
    // restreinte à son propre author_id, laissait n'importe qui poser son
    // propre `is_verified: true` — la modération d'un fil PUBLIC devenait
    // décorative. Les écritures légitimes contournent ces règles (Admin SDK),
    // donc fermer le client ne coûte rien au produit.
    const postsBlock = RULES.split(/match\s+\//).find((b) => b.startsWith("posts/"));
    expect(postsBlock).toBeDefined();

    expect(postsBlock).toContain("allow read: if true");
    expect(postsBlock).toContain("allow write: if false");

    // Aucune permission d'écriture accordée à un client, sous quelque forme.
    expect(postsBlock).not.toMatch(/allow\s+(create|update|delete)\s*:/);
  });

  it("makes audit_log append-only and self-attributed", () => {
    const auditBlock = RULES.split(/match\s+\//).find((b) =>
      b.startsWith("audit_log/")
    );
    expect(auditBlock).toBeDefined();
    expect(auditBlock).toContain("createsAsSelf()");
    expect(auditBlock).not.toContain("allow update");
    expect(auditBlock).not.toContain("allow delete");
  });

  it("prevents privilege escalation through the profiles privileged fields", () => {
    const profilesBlock = RULES.split(/match\s+\//).find((b) =>
      b.startsWith("profiles/")
    );
    expect(profilesBlock).toBeDefined();

    // Ce test lit le TEXTE des règles ; le comportement, lui, est prouvé par
    // firestore-rules.emulator.test.ts qui exécute réellement les requêtes.
    //
    // Il vérifiait auparavant deux expressions littérales, ce qui l'a fait
    // échouer dès que la logique — inchangée — a été factorisée en helpers.
    // Un test textuel qui casse sur un renommage sans qu'aucun comportement ne
    // bouge finit par être neutralisé plutôt que lu. On vérifie donc
    // l'INTENTION : chaque champ de privilège est nommé dans les deux gardes.
    //
    // Sa valeur propre est d'être exécutable sans émulateur (donc sans JDK) :
    // il attrape en CI la suppression pure et simple d'une protection, y
    // compris là où la suite émulateur est sautée.
    const PRIVILEGED = [
      "role", // administration
      "plan", // ── facturation : sans ces quatre verrous, le SDK client
      "planStatus", //    permet à l'utilisateur de s'attribuer un abonnement
      "stripeCustomerId", //    depuis la console de son navigateur, et le
      "stripeSubscriptionId", //    paiement devient facultatif.
    ];

    for (const field of PRIVILEGED) {
      expect(
        profilesBlock,
        `le champ « ${field} » doit être refusé à la création par le propriétaire`
      ).toContain(`privilegedFieldUnset('${field}')`);
      expect(
        profilesBlock,
        `le champ « ${field} » doit être protégé en modification`
      ).toContain(`privilegedFieldUnchanged('${field}')`);
    }

    // Les helpers doivent exister — sinon les appels ci-dessus sont du texte
    // mort et les règles ne compilent pas.
    expect(RULES).toContain("function privilegedFieldUnset(field)");
    expect(RULES).toContain("function privilegedFieldUnchanged(field)");

    // Plus de `allow write` global qui couvrirait create+update sans contrainte.
    expect(profilesBlock).not.toContain("allow write");
  });

  it("keeps usage counters unreachable from any client", () => {
    // Les compteurs de quota pilotent la facturation à l'usage. Un client qui
    // pourrait écrire ici remettrait son compteur à zéro et resterait gratuit
    // à vie ; un client qui pourrait lire saurait exactement quand le faire.
    const block = RULES.split(/match\s+\//).find((b) => b.startsWith("usage_counters/"));
    expect(block, "la collection usage_counters doit être déclarée").toBeDefined();
    expect(block).toContain("allow read, write: if false");
  });
});
