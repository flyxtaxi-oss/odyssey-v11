import { describe, it, expect, beforeAll } from "vitest";
import {
  executeTool,
  actionRegistry,
  storeReceipt,
  getReceipts,
  countReceipts,
} from "../action-engine";
import { registerRestaurantTools } from "../tools/restaurants";

// ==============================================================================
// Confirmation gate on side-effecting tools
// ==============================================================================
//
// `book_restaurant` declares `requiresConfirmation: true`. Nothing read that
// flag: the only check lived in /api/agent/execute and it tested a boolean the
// CALLER had placed in the request body. That route also imported
// authenticateRequest and never called it on POST — so an anonymous request
// with `confirmed: true` booked a table.
//
// The guard now lives in executeTool, next to the flag it enforces. These tests
// exist because a guard that lives only in a route handler is one refactor away
// from being dead again.

beforeAll(() => {
  registerRestaurantTools();
});

describe("confirmation gate", () => {
  it("refuses a side-effecting tool when the call is not confirmed", async () => {
    const receipt = await executeTool("book_restaurant", {
      restaurantId: "r1",
      date: "2026-08-01",
      time: "20:00",
      partySize: 2,
    });

    expect(receipt.status).toBe("failed");
    expect(receipt.error).toMatch(/confirmation/i);
  });

  it("refuses it just the same when confirmed is explicitly false", async () => {
    const receipt = await executeTool(
      "book_restaurant",
      { restaurantId: "r1", date: "2026-08-01", time: "20:00", partySize: 2 },
      { confirmed: false }
    );

    expect(receipt.status).toBe("failed");
    expect(receipt.error).toMatch(/confirmation/i);
  });

  it("lets read-only tools run without confirmation", async () => {
    // Searching changes nothing, so requiring a confirmation step for it would
    // be friction with no safety benefit.
    const receipt = await executeTool("search_restaurants", { location: "Lisbonne" });

    expect(receipt.error).not.toMatch(/confirmation/i);
  });

  it("keeps the flag meaningful — some registered tool actually requires it", async () => {
    // Guards the test itself: if every tool became requiresConfirmation:false,
    // the cases above would pass while protecting nothing.
    const needsConfirmation = actionRegistry
      .list()
      .filter((t) => t.requiresConfirmation);

    expect(needsConfirmation.length).toBeGreaterThan(0);
  });

  it("reports an unknown tool rather than throwing", async () => {
    const receipt = await executeTool("drop_database", {}, { confirmed: true });

    expect(receipt.status).toBe("failed");
    expect(receipt.error).toMatch(/not found/i);
  });
});

// ==============================================================================
// Receipt ownership
// ==============================================================================
//
// Les reçus vivaient dans un tableau global sans userId : GET /api/agent/execute
// renvoyait à tout utilisateur authentifié les reçus — paramètres et résultats
// inclus — de TOUS les utilisateurs. Chaque reçu porte désormais l'uid vérifié
// de son propriétaire et toute lecture est filtrée par cet uid.

// ==============================================================================
// Une simulation ne se présente jamais comme une action réelle
// ==============================================================================
//
// `google_calendar_schedule` renvoyait `status: "confirmed"` et un `eventId`
// sans qu'aucun agenda soit touché ; `book_restaurant` répondait « Réservation
// confirmée via TheFork » là où le code disait `TODO: Implement`. Le reçu
// affichait alors "completed" et l'API « ✅ Action exécutée avec succès ».
//
// Quelqu'un se serait présenté au restaurant. C'est le défaut le plus grave
// d'un moteur d'actions : pas un plantage, une CROYANCE fausse.

describe("honnêteté des outils simulés", () => {
  it("ne produit jamais « completed » pour un outil simulé", async () => {
    const receipt = await executeTool(
      "book_restaurant",
      { restaurantName: "Chez X", date: "2026-09-01", time: "20:00", partySize: 2 },
      { confirmed: true, userId: "alice" }
    );

    expect(receipt.status).not.toBe("completed");
    expect(receipt.status).toBe("simulated");
    expect(receipt.simulated).toBe(true);
  });

  it("marque simulé à l'exécution quand un outil réel bascule en mode dégradé", async () => {
    // search_restaurants PEUT être réel (Google Places). Sans la clé, il
    // renvoie des restaurants inventés — et doit le dire.
    const receipt = await executeTool(
      "search_restaurants",
      { query: "sushi", location: "Lisbonne" },
      { userId: "alice" }
    );

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      expect(receipt.simulated).toBe(true);
      expect(receipt.status).toBe("simulated");
    }
  });

  it("oblige chaque outil enregistré à déclarer s'il est simulé", () => {
    // Le champ est requis par le type, mais un `as` malencontreux le
    // contournerait : on vérifie la valeur réelle à l'exécution.
    for (const tool of actionRegistry.list()) {
      expect(typeof tool.simulated, `${tool.name} doit déclarer simulated`).toBe("boolean");
    }
  });

  it("expose la nature simulée dans le manifeste vu par le modèle", () => {
    // Sans ça, J.A.R.V.I.S. annonce « je réserve » pour un outil qui ne
    // réserve rien.
    const manifest = actionRegistry.toManifest();
    expect(manifest.length).toBeGreaterThan(0);
    for (const entry of manifest) {
      expect(entry).toHaveProperty("simulated");
    }
    expect(manifest.some((t) => t.simulated)).toBe(true);
  });

  it("échoue plutôt que de feindre une réservation quand TheFork est « configuré »", async () => {
    // L'intégration n'existe pas : poser la clé ne doit pas suffire à faire
    // croire à une réservation.
    const previous = process.env.THEFORK_API_KEY;
    process.env.THEFORK_API_KEY = "cle-de-test";
    try {
      const receipt = await executeTool(
        "book_restaurant",
        { restaurantName: "Chez X", date: "2026-09-01", time: "20:00", partySize: 2 },
        { confirmed: true, userId: "alice" }
      );
      expect(receipt.status).toBe("failed");
      expect(receipt.error).toMatch(/pas implémentée|aucune réservation/i);
    } finally {
      if (previous === undefined) delete process.env.THEFORK_API_KEY;
      else process.env.THEFORK_API_KEY = previous;
    }
  });
});

describe("receipt ownership", () => {
  it("stamps the verified caller uid on the receipt", async () => {
    const receipt = await executeTool(
      "search_restaurants",
      { location: "Lisbonne" },
      { userId: "alice" }
    );

    expect(receipt.userId).toBe("alice");
  });

  it("refuses to store a receipt with no owner", async () => {
    const receipt = await executeTool("search_restaurants", { location: "Porto" });
    expect(receipt.userId).toBe("");
    expect(() => storeReceipt(receipt)).toThrow(/userId/);
  });

  it("never returns another user's receipts (Alice vs Bob)", async () => {
    const aliceReceipt = await executeTool(
      "search_restaurants",
      { location: "Lisbonne" },
      { userId: "alice-uid" }
    );
    const bobReceipt = await executeTool(
      "search_restaurants",
      { location: "Marrakech" },
      { userId: "bob-uid" }
    );
    storeReceipt(aliceReceipt);
    storeReceipt(bobReceipt);

    const aliceView = getReceipts("alice-uid", 100);
    expect(aliceView.length).toBeGreaterThan(0);
    expect(aliceView.every((r) => r.userId === "alice-uid")).toBe(true);
    expect(aliceView.some((r) => r.id === bobReceipt.id)).toBe(false);

    expect(countReceipts("bob-uid")).toBeGreaterThan(0);
  });

  it("returns nothing for an empty uid rather than the global store", () => {
    expect(getReceipts("", 100)).toEqual([]);
    expect(countReceipts("")).toBe(0);
  });
});
