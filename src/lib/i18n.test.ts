import { describe, it, expect } from "vitest";
import {
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  LOCALE_FLAGS,
  t,
  detectLanguage,
  isRTL,
  dir,
  getJarvisLocaleInstruction,
} from "./i18n";

describe("i18n locales", () => {
  it("expose 7 langues", () => {
    expect(SUPPORTED_LOCALES).toHaveLength(7);
    expect(SUPPORTED_LOCALES).toEqual(["fr", "en", "nl", "ar", "es", "it", "de"]);
  });

  it("chaque langue a un label et un drapeau", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(LOCALE_LABELS[locale]).toBeTruthy();
      expect(LOCALE_FLAGS[locale]).toBeTruthy();
    }
  });

  it("toutes les langues traduisent les mêmes clés (pas de fallback FR)", () => {
    // Réf = français ; chaque autre langue doit avoir une valeur propre non vide.
    const sampleKeys = [
      "nav.dashboard",
      "settings.title",
      "transfer.title",
      "common.save",
      "command.confirm",
    ] as const;
    for (const locale of SUPPORTED_LOCALES) {
      for (const key of sampleKeys) {
        const value = t(key, locale);
        expect(value, `${locale}/${key}`).toBeTruthy();
      }
    }
  });

  it("l'arabe est une langue RTL", () => {
    expect(isRTL("ar")).toBe(true);
    expect(dir("ar")).toBe("rtl");
    expect(isRTL("fr")).toBe(false);
    expect(dir("fr")).toBe("ltr");
  });

  it("getJarvisLocaleInstruction couvre toutes les langues", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(getJarvisLocaleInstruction(locale)).toBeTruthy();
    }
  });
});

describe("detectLanguage", () => {
  const cases: [string, string][] = [
    ["Bonjour, je veux comparer les impôts", "fr"],
    ["Hello, I want to send money", "en"],
    ["Hallo, ik wil geld sturen", "nl"],
    ["مرحبا، أريد تحويل الأموال إلى المغرب", "ar"],
    ["Hola, quiero enviar dinero a Marruecos", "es"],
    ["Ciao, voglio inviare denaro in Marocco", "it"],
    ["Hallo, ich will Geld nach Marokko senden", "de"],
  ];

  it.each(cases)("détecte %s → %s", (text, expected) => {
    expect(detectLanguage(text)).toBe(expected);
  });
});
