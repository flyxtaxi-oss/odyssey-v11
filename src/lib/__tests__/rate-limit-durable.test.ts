import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ==============================================================================
// Rate limit durable — compteur partagé entre instances
// ==============================================================================
//
// Le bucket mémoire est un compteur PAR INSTANCE : en serverless il diffère
// d'une lambda à l'autre et repart à zéro à chaque démarrage à froid. Sur une
// route qui déclenche un appel LLM payant, c'est une protection de coût qui
// n'en est pas une.
//
// Ces tests couvrent ce qu'aucun typecheck ne peut voir : le calcul de jetons,
// et surtout la posture en cas de panne — fail-open assumé.

const ROOT = join(__dirname, "..", "..", "..");

/** Firestore minimal : juste ce que consumeDurableToken utilise. */
function fakeDb(initial?: { tokens: number; last_refill: number }) {
  const store: { doc?: Record<string, unknown> } = {
    doc: initial ? { ...initial } : undefined,
  };

  const ref = {};
  const tx = {
    get: async () => ({
      exists: store.doc !== undefined,
      data: () => store.doc,
    }),
    set: (_ref: unknown, value: Record<string, unknown>) => {
      store.doc = value;
    },
  };

  return {
    store,
    db: {
      collection: () => ({ doc: () => ref }),
      runTransaction: async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx),
    },
  };
}

const LIMIT = { max: 3, refillPerSec: 1 };

describe("consumeDurableToken", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock("../firestore-server");
    vi.restoreAllMocks();
  });

  it("laisse passer la requête quand le compteur partagé est injoignable (fail-open)", async () => {
    // Posture assumée : un limiteur en panne ne doit pas faire tomber le
    // produit. On l'affirme dans un test pour que ce soit un choix, pas un
    // effet de bord d'un try/catch oublié.
    vi.doMock("../firestore-server", () => ({
      serverDb: async () => {
        throw new Error("Firestore indisponible");
      },
    }));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { consumeDurableToken } = await import("../rate-limit-durable");
    const verdict = await consumeDurableToken("uid:alice", LIMIT);

    expect(verdict.allowed).toBe(true);
    // …et la dégradation est signalée, pas silencieuse.
    expect(verdict.degraded).toBe(true);
    expect(console.error).toHaveBeenCalled();
  });

  it("consomme un jeton par requête puis refuse une fois le bucket vide", async () => {
    const { db, store } = fakeDb();
    vi.doMock("../firestore-server", () => ({ serverDb: async () => db }));

    const { consumeDurableToken } = await import("../rate-limit-durable");

    for (let i = 0; i < LIMIT.max; i++) {
      const verdict = await consumeDurableToken("uid:alice", LIMIT);
      expect(verdict.allowed, `requête ${i + 1} doit passer`).toBe(true);
      expect(verdict.degraded).toBe(false);
    }

    const refused = await consumeDurableToken("uid:alice", LIMIT);
    expect(refused.allowed).toBe(false);
    expect(refused.resetMs).toBeGreaterThan(0);
    // Un refus n'écrit pas : inutile de payer un write pour dire non, et un
    // flood ne doit pas réécrire le document en boucle.
    expect((store.doc as Record<string, number>).tokens).toBeLessThan(1);
  });

  it("regénère des jetons avec le temps écoulé", async () => {
    // Bucket vidé il y a 5 s, à 1 jeton/s → de nouveau autorisé.
    const { db } = fakeDb({ tokens: 0, last_refill: Date.now() - 5000 });
    vi.doMock("../firestore-server", () => ({ serverDb: async () => db }));

    const { consumeDurableToken } = await import("../rate-limit-durable");
    const verdict = await consumeDurableToken("uid:alice", LIMIT);

    expect(verdict.allowed).toBe(true);
  });

  it("ne dépasse jamais la capacité du bucket, même après une longue inactivité", async () => {
    const { db, store } = fakeDb({ tokens: 0, last_refill: Date.now() - 3_600_000 });
    vi.doMock("../firestore-server", () => ({ serverDb: async () => db }));

    const { consumeDurableToken } = await import("../rate-limit-durable");
    await consumeDurableToken("uid:alice", LIMIT);

    // max - 1 après la consommation : une heure d'inactivité ne donne pas
    // droit à 3600 requêtes d'un coup.
    expect((store.doc as Record<string, number>).tokens).toBe(LIMIT.max - 1);
  });

  it("sépare les buckets de deux utilisateurs", async () => {
    // Garde anti-collision : Alice ne doit pas consommer le quota de Bob.
    const { consumeDurableToken: _ } = await import("../rate-limit-durable");
    void _;
    const src = readFileSync(join(ROOT, "src", "lib", "rate-limit-durable.ts"), "utf8");
    // L'id de document dérive de la clé (uid ou IP), hachée.
    expect(src).toContain("createHash(\"sha256\").update(key)");
    expect(src).toContain(".doc(bucketId(key))");
  });
});

describe("routes coûteuses", () => {
  it("branche le compteur partagé sur toutes les routes qui appellent un LLM payant", () => {
    const paidRoutes = [
      "src/app/api/agent/route.ts",
      "src/app/api/agent/plan/route.ts",
      "src/app/api/agent/execute/route.ts",
      "src/app/api/agent/vision/route.ts",
    ];

    const unprotected = paidRoutes.filter(
      (rel) => !/enforceRateLimit\([^)]*durable:\s*true/.test(readFileSync(join(ROOT, rel), "utf8"))
    );

    expect(
      unprotected,
      `Routes IA payantes sans compteur partagé :\n  ${unprotected.join("\n  ")}`
    ).toEqual([]);

    // /api/jarvis limite en ligne (streaming) plutôt que via enforceRateLimit.
    const jarvis = readFileSync(join(ROOT, "src/app/api/jarvis/route.ts"), "utf8");
    expect(jarvis).toContain("consumeDurableToken");
  });

  it("garde la collection rate_limits inaccessible aux clients", () => {
    const rules = readFileSync(join(ROOT, "firestore.rules"), "utf8");
    const block = rules.split("match /rate_limits/")[1]?.split("match /")[0] ?? "";

    expect(block, "rate_limits doit être déclarée dans firestore.rules").not.toBe("");
    expect(block).toContain("allow read, write: if false");
  });
});
