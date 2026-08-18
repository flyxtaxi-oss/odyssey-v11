import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// ==============================================================================
// CSS custom-property coverage
// ==============================================================================
//
// A `var(--foo)` that resolves to nothing, with no fallback, makes the ENTIRE
// declaration invalid. The element then renders with no background and no
// colour — silently. No build error, no console warning, no failing test.
//
// This shipped: 8 tokens (--gradient-blue-purple, --accent-emerald,
// --accent-indigo, --accent-amber, --accent-rose, --accent-cyan,
// --gradient-card-border, --text-secondary) were referenced across 28 call
// sites while being defined nowhere. The sidebar's own logo was a transparent
// hole ringed by a blue glow, and the dashboard's status dot was colourless.
// The app looked broken because it *was* broken, in a way nothing detected.
//
// This test is the detector.

const ROOT = join(__dirname, "..", "..", "..");
const CSS = readFileSync(join(ROOT, "src", "app", "globals.css"), "utf8");

function sourceFiles(dir = join(ROOT, "src"), acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, acc);
    else if (/\.tsx?$/.test(entry) && !full.includes("__tests__")) acc.push(full);
  }
  return acc;
}

/** Custom properties declared anywhere in globals.css. */
function declaredTokens(): Set<string> {
  const names = new Set<string>();
  for (const m of CSS.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) names.add(m[1]);
  return names;
}

/**
 * Every `var(--x)` referenced from components, mapped to the files using it.
 * A reference carrying its own fallback — var(--x, #fff) — is safe and skipped.
 */
function referencedTokens(): Map<string, string[]> {
  const refs = new Map<string, string[]>();

  for (const file of sourceFiles()) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*([,)])/g)) {
      if (m[2] === ",") continue; // has a fallback
      const rel = file.replace(ROOT + "/", "");
      const list = refs.get(m[1]) ?? [];
      if (!list.includes(rel)) list.push(rel);
      refs.set(m[1], list);
    }
  }

  return refs;
}

describe("CSS design tokens", () => {
  it("defines every token the components reference", () => {
    const declared = declaredTokens();
    const referenced = referencedTokens();

    const missing = [...referenced.entries()]
      .filter(([token]) => !declared.has(token))
      .map(([token, files]) => `${token} — utilisé dans ${files.join(", ")}`);

    expect(
      missing,
      `Tokens référencés sans définition. Une var() non résolue invalide la déclaration : ` +
        `l'élément s'affiche SANS fond ni couleur, sans aucune erreur.\n  ${missing.join("\n  ")}`
    ).toEqual([]);
  });

  it("declares the same token names in the light and dark themes", () => {
    // A token defined only in .dark disappears when the user flips the theme,
    // which is the same invisible-element failure with extra steps.
    const lightBlock = CSS.match(/:root\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? "";
    const darkBlock = CSS.match(/\.dark\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? "";

    const namesIn = (block: string) =>
      new Set([...block.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1]));

    const light = namesIn(lightBlock);
    const dark = namesIn(darkBlock);

    expect(light.size, "bloc :root introuvable ou vide").toBeGreaterThan(10);
    expect(dark.size, "bloc .dark introuvable ou vide").toBeGreaterThan(10);

    // Only one direction is a bug. `.dark` is a class on <html>, and :root
    // matches <html> too — so a token declared only in :root resolves in BOTH
    // themes, and .dark simply overrides the ones it redeclares. That is the
    // correct way to express "this value does not change with the theme"
    // (radius, spacing), and flagging it would force pointless duplication.
    //
    // The reverse genuinely breaks: a token declared only inside .dark is
    // undefined in light mode, so the declaration using it is invalid and the
    // element renders with no background or colour at all.
    const missingInLight = [...dark].filter((t) => !light.has(t));

    expect(
      missingInLight,
      `Ces tokens n'existent qu'en thème sombre — en clair ils ne résolvent pas, ` +
        `et l'élément s'affiche sans fond ni couleur : ${missingInLight.join(", ")}`
    ).toEqual([]);
  });

  it("finds the references it is meant to be checking", () => {
    // Guards the heuristic: if the regex stops matching, the tests above would
    // pass vacuously and protect nothing.
    const referenced = referencedTokens();
    expect(referenced.size).toBeGreaterThan(10);
    expect([...referenced.keys()]).toContain("--text-0");
  });
});
