import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// ==============================================================================
// Bidirectional-text coverage
// ==============================================================================
//
// The app supports Arabic, so <html dir> becomes "rtl". Unicode's bidi
// algorithm then applies an RTL *paragraph direction* to every character with
// no inherent direction — digits, punctuation, currency symbols, spaces.
//
// A French sentence rendered inside that paragraph is reordered: "50 guides
// visa" displays as "guides visa 50", and a sentence-final period jumps to the
// left. This was observed on the landing page before the fix.
//
// The rule the HTML spec gives is simple: content in a language other than the
// document's declares its own `lang` and `dir`. A page therefore needs one of:
//
//   - useTranslation()          → its text follows the active locale
//   - lang="fr" dir="ltr"       → its text is French and says so
//
// This test fails when a new page has neither, which is the state that silently
// breaks the layout for Arabic readers.

const ROOT = join(__dirname, "..", "..", "..");
const APP = join(ROOT, "src", "app");

function pageFiles(dir = APP, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "api") continue; // route handlers render no markup
      pageFiles(full, acc);
    } else if (entry === "page.tsx") {
      acc.push(full);
    }
  }
  return acc;
}

/** Une source déclare-t-elle sa langue, ou suit-elle la locale active ? */
function declaresDirection(src: string): boolean {
  const translated = src.includes("useTranslation");
  const declared = /lang=["']fr["']/.test(src) && /dir=["']ltr["']/.test(src);
  return translated || declared;
}

/**
 * Une page est couverte si elle déclare sa direction elle-même, OU si l'un de
 * ses layouts parents le fait.
 *
 * Le layout enveloppe réellement la page dans le DOM : `<div lang="fr"
 * dir="ltr">{children}</div>` dans `app/legal/layout.tsx` s'applique à
 * `/legal/cgu` comme à toute page ajoutée sous ce segment. Exiger malgré tout
 * l'attribut sur chaque page reviendrait à demander une répétition que le
 * navigateur ignore — et la répétition finit toujours par diverger.
 *
 * On s'arrête à `src/app` : le layout racine y déclare `lang="fr"` sur <html>,
 * mais c'est justement la valeur que le sélecteur de langue remplace par "ar".
 * Il ne compte donc pas comme une déclaration protectrice.
 */
function coveredByLayout(pageFile: string): boolean {
  let dir = join(pageFile, "..");
  while (dir.startsWith(APP) && dir !== APP) {
    const layout = join(dir, "layout.tsx");
    try {
      if (declaresDirection(readFileSync(layout, "utf8"))) return true;
    } catch {
      // Pas de layout à ce niveau : on continue de remonter.
    }
    dir = join(dir, "..");
  }
  return false;
}

describe("bidi safety", () => {
  it("every page either translates or declares its language", () => {
    const offenders = pageFiles()
      .filter((file) => {
        const src = readFileSync(file, "utf8");
        return !declaresDirection(src) && !coveredByLayout(file);
      })
      .map((f) => f.replace(ROOT + "/", ""));

    expect(
      offenders,
      `Ces pages ne sont ni traduites ni marquées comme françaises — leur texte ` +
        `sera réordonné en arabe (chiffres et ponctuation déplacés) :\n  ${offenders.join("\n  ")}\n` +
        `Ajoute lang="fr" dir="ltr" sur l'élément racine de la page ou de son layout, ` +
        `ou branche la page sur useTranslation().`
    ).toEqual([]);
  });

  it("ne considère pas le layout racine comme une protection", () => {
    // Garde-fou sur l'assouplissement ci-dessus : si `coveredByLayout` remontait
    // jusqu'à `src/app/layout.tsx`, il y trouverait `lang="fr"` sur <html> et
    // déclarerait TOUTES les pages couvertes — le test passerait alors à vide,
    // exactement le mode de défaillance qu'il est censé prévenir.
    const anyPage = pageFiles().find((f) => f.includes("/legal/"));
    expect(anyPage, "les pages légales servent de témoin ici").toBeDefined();

    const rootLayout = readFileSync(join(APP, "layout.tsx"), "utf8");
    expect(
      /lang=["']fr["']/.test(rootLayout),
      "le layout racine déclare bien lang=fr — c'est ce qui rend ce garde-fou nécessaire"
    ).toBe(true);

    // Une page sans layout intermédiaire ne doit PAS être considérée couverte.
    const topLevelPage = join(APP, "page.tsx");
    expect(coveredByLayout(topLevelPage)).toBe(false);
  });

  it("finds the pages it is meant to be checking", () => {
    // Guards the heuristic: if the walk stopped finding pages, the test above
    // would pass vacuously.
    expect(pageFiles().length).toBeGreaterThan(10);
  });

  it("uses logical properties where direction matters", () => {
    // `left-*` / `right-*` are physical and do not mirror under dir="rtl";
    // `start-*` / `end-*` do. The sidebar and its drawer are the components
    // whose position must follow the reading direction.
    const sidebar = readFileSync(join(ROOT, "src", "components", "Sidebar.tsx"), "utf8");

    expect(sidebar, "la sidebar doit être ancrée avec start-*").toMatch(/fixed start-\d/);
    expect(
      sidebar.match(/fixed left-\d/),
      "left-* ne s'inverse pas en RTL — utiliser start-*"
    ).toBeNull();
  });
});
