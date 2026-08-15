import { describe, it, expect, beforeEach } from "vitest";
import { getCachedResponse, setCachedResponse } from "../ai-engine";
import {
  getCachedResponse as getSmart,
  setCachedResponse as setSmart,
  clearSmartCache,
  getCacheStats,
  generateCacheKey,
} from "../cache/smart-cache";

// The LLM response cache is the one place in the app where one user's data
// can be handed to another. These tests exist because the original key was a
// 32-bit rolling hash with no user scoping — two accounts asking the same
// question shared an answer built from personal context (income, family
// situation, nationality).

const conversation = [
  { role: "user", content: "Je gagne 3800€/mois, quel pays me conseilles-tu ?" },
];

describe("ai-engine response cache", () => {
  it("never serves one user's cached answer to another", () => {
    setCachedResponse(conversation, "strategist", "Réponse pour Alice", "uid-alice");

    expect(getCachedResponse(conversation, "strategist", "uid-alice")).toBe("Réponse pour Alice");
    // Same question, same persona, different account — must miss.
    expect(getCachedResponse(conversation, "strategist", "uid-bob")).toBeNull();
  });

  it("separates anonymous callers from authenticated ones", () => {
    setCachedResponse(conversation, "coach", "Réponse anonyme");
    expect(getCachedResponse(conversation, "coach")).toBe("Réponse anonyme");
    expect(getCachedResponse(conversation, "coach", "uid-alice")).toBeNull();
  });

  it("keys on the persona, so switching persona re-asks the model", () => {
    setCachedResponse(conversation, "sage", "Réponse du Sage", "uid-alice");
    expect(getCachedResponse(conversation, "sage", "uid-alice")).toBe("Réponse du Sage");
    expect(getCachedResponse(conversation, "executor", "uid-alice")).toBeNull();
  });

  it("keys on conversation content, not just the last message count", () => {
    const a = [{ role: "user", content: "Portugal ou Espagne ?" }];
    const b = [{ role: "user", content: "Maroc ou Tunisie ?" }];

    setCachedResponse(a, "strategist", "Réponse A", "uid-alice");
    expect(getCachedResponse(b, "strategist", "uid-alice")).toBeNull();
  });
});

describe("smart-cache", () => {
  beforeEach(() => clearSmartCache());

  it("returns what was stored", () => {
    setSmart("quel visa pour le Portugal ?", { answer: "D7" });
    expect(getSmart("quel visa pour le Portugal ?")).toEqual({ answer: "D7" });
  });

  it("misses on an unknown prompt", () => {
    expect(getSmart("jamais posée")).toBeNull();
  });

  it("scopes entries so personal context is not shared", () => {
    setSmart("mon dossier", { plan: "alice" }, undefined, undefined, "uid-alice");

    expect(getSmart("mon dossier", undefined, undefined, "uid-alice")).toEqual({ plan: "alice" });
    expect(getSmart("mon dossier", undefined, undefined, "uid-bob")).toBeNull();
  });

  it("distinguishes entries by system instruction", () => {
    setSmart("bonjour", "réponse système A", "system-A");
    expect(getSmart("bonjour", "system-B")).toBeNull();
  });

  it("produces stable, collision-resistant keys", () => {
    const k1 = generateCacheKey("prompt", "sys", ["tool"], "uid");
    const k2 = generateCacheKey("prompt", "sys", ["tool"], "uid");
    const k3 = generateCacheKey("prompt", "sys", ["tool"], "autre-uid");

    expect(k1).toBe(k2);
    expect(k1).not.toBe(k3);
    // SHA-256 hex — the old 32-bit hash was far too small to avoid collisions.
    expect(k1).toMatch(/^[a-f0-9]{64}$/);
  });

  it("stays bounded and reports its own health", () => {
    for (let i = 0; i < 20; i++) setSmart(`prompt-${i}`, { i });

    const stats = getCacheStats();
    expect(stats.entries).toBeLessThanOrEqual(stats.maxEntries);
    expect(stats.ttlMs).toBeGreaterThan(0);
  });

  it("clears fully", () => {
    setSmart("a", 1);
    clearSmartCache();
    expect(getSmart("a")).toBeNull();
    expect(getCacheStats().entries).toBe(0);
  });
});
