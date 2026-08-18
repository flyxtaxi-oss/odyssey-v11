import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { USER_DATA_COLLECTIONS } from "../account-data";

// ==============================================================================
// GDPR erasure coverage
// ==============================================================================
//
// Account deletion iterates USER_DATA_COLLECTIONS. The failure mode is silent:
// forget one collection there and deletion "succeeds" while the user's data
// lives on — mood check-ins, income, family situation. Nobody notices until a
// complaint or an audit does.
//
// firestore.rules is the one place every user-scoped collection must already
// be declared (Firestore fails closed without a match block — see
// firestore-rules.test.ts). So the rules file doubles as the census of
// personal-data collections, and this test keeps the purge manifest in sync
// with it: add a collection to the rules without deciding its erasure story,
// and the build fails.

const RULES = readFileSync(
  join(__dirname, "..", "..", "..", "firestore.rules"),
  "utf8"
);

/** Collection names declared as match blocks in firestore.rules. */
function ruleCollections(): string[] {
  return [...RULES.matchAll(/match\s+\/([a-zA-Z_][a-zA-Z0-9_]*)\s*\/\s*\{/g)]
    .map((m) => m[1])
    .filter((name) => name !== "databases");
}

describe("GDPR purge manifest", () => {
  it("covers every user-scoped collection declared in firestore.rules", () => {
    const manifest = new Set(USER_DATA_COLLECTIONS.map((c) => c.name));

    const missing = ruleCollections().filter((name) => {
      if (manifest.has(name)) return false;
      // A rules block with no user binding holds no per-user data (none exist
      // today; this keeps the test honest if a truly public collection appears).
      const block = RULES.split(`match /${name}/`)[1]?.split("match /")[0] ?? "";
      return /user_id|author_id|request\.auth\.uid == \w+Id/.test(block);
    });

    expect(
      missing,
      `Collections présentes dans firestore.rules mais absentes du manifeste de purge ` +
        `RGPD (USER_DATA_COLLECTIONS) — leurs données survivraient à une suppression de ` +
        `compte :\n  ${missing.join("\n  ")}`
    ).toEqual([]);
  });

  it("does not purge collections that no longer exist in the rules", () => {
    // The reverse drift: deleting from a renamed/removed collection is a no-op
    // that hides the fact the real one is being missed.
    const declared = new Set(ruleCollections());
    const stale = USER_DATA_COLLECTIONS.map((c) => c.name).filter(
      (name) => !declared.has(name)
    );

    expect(
      stale,
      `Collections du manifeste de purge absentes de firestore.rules : ${stale.join(", ")}`
    ).toEqual([]);
  });

  it("keys the profile by document id, everything else by an owner field", () => {
    // profiles/{uid} is the only collection whose doc id IS the uid; a where()
    // on it would return nothing and quietly skip the richest document.
    const profile = USER_DATA_COLLECTIONS.find((c) => c.name === "profiles");
    expect(profile?.field).toBe("docId");

    for (const col of USER_DATA_COLLECTIONS.filter((c) => c.name !== "profiles")) {
      expect(col.field, `${col.name} doit être scopé par un champ propriétaire`).not.toBe("docId");
    }
  });

  it("scopes posts by author_id, matching the rules", () => {
    // posts is the one collection keyed differently; a copy-paste of user_id
    // here would purge nothing while reporting success.
    expect(USER_DATA_COLLECTIONS.find((c) => c.name === "posts")?.field).toBe("author_id");
  });
});
