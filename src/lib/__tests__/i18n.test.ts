import { describe, it, expect } from "vitest";
import {
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  LOCALE_FLAGS,
  LOCALE_DIR,
  t,
  detectLanguage,
  getJarvisLocaleInstruction,
  type Locale,
} from "../i18n";

// ==============================================================================
// i18n
// ==============================================================================
//
// TypeScript already guarantees that every locale defines every key — the
// dictionary is typed `Record<Locale, TranslationKeys>`, so a missing entry is
// a build error rather than a key echoed back to a user in production.
//
// What types cannot catch is an entry that *exists* but is empty, or copied
// verbatim from French into another language. These tests cover that gap, plus
// the runtime behaviour of the fallback and the language detector.

const NON_DEFAULT = SUPPORTED_LOCALES.filter((l) => l !== "fr");

describe("locale metadata", () => {
  it("gives every locale a label, a flag and a writing direction", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(LOCALE_LABELS[locale], `label manquant pour ${locale}`).toBeTruthy();
      expect(LOCALE_FLAGS[locale], `drapeau manquant pour ${locale}`).toBeTruthy();
      expect(["ltr", "rtl"]).toContain(LOCALE_DIR[locale]);
    }
  });

  it("names each language in that language, not in French", () => {
    // A speaker who cannot read the current interface language recognises
    // "Deutsch" but not "Allemand" — the label is the one affordance they have.
    expect(LOCALE_LABELS.de).toBe("Deutsch");
    expect(LOCALE_LABELS.es).toBe("Español");
    expect(LOCALE_LABELS.nl).toBe("Nederlands");
    expect(LOCALE_LABELS.ar).toBe("العربية");
  });

  it("marks Arabic as right-to-left and everything else as left-to-right", () => {
    expect(LOCALE_DIR.ar).toBe("rtl");
    for (const locale of SUPPORTED_LOCALES.filter((l) => l !== "ar")) {
      expect(LOCALE_DIR[locale]).toBe("ltr");
    }
  });
});

describe("translations", () => {
  it("returns a non-empty string for every locale", () => {
    const sample = ["nav.dashboard", "settings.title", "common.save"] as const;

    for (const locale of SUPPORTED_LOCALES) {
      for (const key of sample) {
        const value = t(key, locale);
        expect(value.trim(), `${key} vide en ${locale}`).not.toBe("");
        // A key echoed back means the entry is missing at runtime.
        expect(value, `${key} non traduit en ${locale}`).not.toBe(key);
      }
    }
  });

  it("actually translates — no locale is a copy of French", () => {
    // Catches a dictionary added by copy-pasting the French block.
    for (const locale of NON_DEFAULT) {
      const differs = (["nav.dashboard", "settings.title", "common.save"] as const).some(
        (key) => t(key, locale) !== t(key, "fr")
      );
      expect(differs, `${locale} semble être une copie du français`).toBe(true);
    }
  });

  it("falls back to French rather than showing nothing", () => {
    // The fallback chain is locale → fr → the key itself.
    expect(t("nav.dashboard", "de")).toBe("Übersicht");
    expect(t("nav.dashboard", "fr")).toBe("Tableau de Bord");
  });

  it("keeps product names untranslated", () => {
    // "J.A.R.V.I.S." is a brand, not a word to localise.
    for (const locale of SUPPORTED_LOCALES.filter((l) => l !== "ar")) {
      expect(t("nav.jarvis", locale)).toBe("J.A.R.V.I.S.");
    }
  });
});

describe("detectLanguage", () => {
  it("recognises each supported language from a sample sentence", () => {
    const samples: Record<Locale, string> = {
      fr: "Bonjour, je voudrais partir vivre au Portugal avec ma famille",
      en: "Hello, I would like to move to Portugal with my family",
      nl: "Hallo, ik wil graag naar Portugal verhuizen met mijn gezin",
      es: "Hola, quiero mudarme a Portugal con mi familia por favor",
      pt: "Olá, eu quero mudar para Portugal com a minha família",
      de: "Hallo, ich möchte mit meiner Familie nach Portugal ziehen bitte",
      ar: "مرحبا، أريد الانتقال إلى البرتغال مع عائلتي",
    };

    for (const [locale, text] of Object.entries(samples)) {
      expect(detectLanguage(text), `mal détecté : ${locale}`).toBe(locale);
    }
  });

  it("falls back to French on text with no signal", () => {
    expect(detectLanguage("12345 ... !!!")).toBe("fr");
    expect(detectLanguage("")).toBe("fr");
  });

  it("scores every supported locale, not just the original three", () => {
    // The scores map used to be a hardcoded { fr, en, nl } literal: any locale
    // added afterwards could never win, silently.
    expect(detectLanguage("Hallo, ich möchte bitte nach Berlin ziehen")).toBe("de");
    expect(detectLanguage("Olá, obrigado, eu preciso de ajuda")).toBe("pt");
  });
});

describe("JARVIS locale instructions", () => {
  it("instructs the model in every supported language", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const instruction = getJarvisLocaleInstruction(locale);
      expect(instruction, `instruction manquante pour ${locale}`).toBeTruthy();
      expect(instruction.length).toBeGreaterThan(20);
    }
  });
});
