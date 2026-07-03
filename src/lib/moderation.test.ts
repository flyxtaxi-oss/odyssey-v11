import { describe, it, expect } from "vitest";
import { moderateContent } from "./moderation";

describe("moderateContent", () => {
  it("laisse passer un contenu sain", () => {
    const r = moderateContent("Salut la communauté, quelqu'un connaît un bon notaire à Casablanca ?");
    expect(r.isVerified).toBe(true);
    expect(r.toxicityScore).toBeLessThan(0.5);
  });

  it("bloque le harcèlement", () => {
    const r = moderateContent("ferme ta gueule espèce de connard");
    expect(r.isVerified).toBe(false);
    expect(r.categories).toContain("harassment");
  });

  it("bloque les arnaques financières", () => {
    const r = moderateContent("Double ton argent ! investissement garanti, envoie tes identifiants");
    expect(r.isVerified).toBe(false);
    expect(r.categories).toContain("scam");
  });

  it("est déterministe (même entrée → même score)", () => {
    const a = moderateContent("Bonjour tout le monde");
    const b = moderateContent("Bonjour tout le monde");
    expect(a.toxicityScore).toBe(b.toxicityScore);
  });

  it("insensible aux accents et à la casse", () => {
    const r = moderateContent("CONNARD");
    expect(r.isVerified).toBe(false);
  });

  it("score borné entre 0 et 1", () => {
    const r = moderateContent("je vais te tuer connard salope raciste attentat");
    expect(r.toxicityScore).toBeLessThanOrEqual(1);
    expect(r.toxicityScore).toBeGreaterThanOrEqual(0);
  });
});
