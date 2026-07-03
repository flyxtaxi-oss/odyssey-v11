import { describe, it, expect } from "vitest";
import {
  compareProviders,
  maxSavings,
  MID_MARKET_TO_MAD,
  PROVIDERS,
} from "./remittance";

describe("compareProviders", () => {
  it("renvoie un devis par opérateur", () => {
    const quotes = compareProviders({ amount: 500, corridor: "EUR" });
    expect(quotes).toHaveLength(PROVIDERS.length);
  });

  it("trie du moins cher au plus cher (coût réel)", () => {
    const quotes = compareProviders({ amount: 1000, corridor: "EUR" }).filter((q) => q.available);
    for (let i = 1; i < quotes.length; i++) {
      expect(quotes[i].realCost).toBeGreaterThanOrEqual(quotes[i - 1].realCost);
    }
  });

  it("Wise (frais transparents) est moins cher que Western Union pour un dépôt bancaire", () => {
    const quotes = compareProviders({ amount: 1000, corridor: "EUR", payout: "bank" });
    const wise = quotes.find((q) => q.provider.id === "wise")!;
    const wu = quotes.find((q) => q.provider.id === "westernunion")!;
    expect(wise.realCost).toBeLessThan(wu.realCost);
  });

  it("marque comme indisponible un opérateur qui ne gère pas la méthode de réception", () => {
    // Wise ne fait que le dépôt bancaire → indisponible en cash
    const quotes = compareProviders({ amount: 500, corridor: "EUR", payout: "cash" });
    const wise = quotes.find((q) => q.provider.id === "wise")!;
    expect(wise.available).toBe(false);
  });

  it("le montant reçu ne dépasse jamais la conversion au taux réel", () => {
    const amount = 800;
    const quotes = compareProviders({ amount, corridor: "EUR" });
    const ideal = amount * MID_MARKET_TO_MAD.EUR;
    for (const q of quotes) {
      expect(q.receivedMAD).toBeLessThanOrEqual(ideal + 0.01);
    }
  });

  it("un coût réel est toujours positif ou nul", () => {
    const quotes = compareProviders({ amount: 250, corridor: "USD" });
    for (const q of quotes) {
      expect(q.realCost).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("maxSavings", () => {
  it("est positif quand plusieurs opérateurs sont disponibles", () => {
    const quotes = compareProviders({ amount: 1000, corridor: "EUR" });
    expect(maxSavings(quotes)).toBeGreaterThan(0);
  });

  it("est nul quand un seul (ou aucun) opérateur est disponible", () => {
    // GBP en cash : peu/pas d'opérateurs cash supportent GBP → au plus un
    const quotes = compareProviders({ amount: 300, corridor: "GBP", payout: "cash" });
    const available = quotes.filter((q) => q.available);
    if (available.length < 2) {
      expect(maxSavings(quotes)).toBe(0);
    }
  });
});
