import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// ==============================================================================
// Every client call to /api/* must carry the user's identity
// ==============================================================================
//
// The API routes read the caller from a verified Firebase ID token, and several
// refuse the request without one. When a page called `fetch("/api/…")` directly
// it sent no token, and the route answered 401 — which the UI rendered as an
// empty list, indistinguishable from "you have no data yet".
//
// Five pages were in that state at once (dashboard, safezone, simulator,
// predict, command centre) because attaching the header was left to each call
// site. `apiFetch` from lib/api-client attaches it centrally; this test stops
// a new call site from bypassing it.

const ROOT = join(__dirname, "..", "..", "..");

function uiFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      // Route handlers run on the server and legitimately use plain fetch.
      if (full.includes(join("app", "api"))) continue;
      uiFiles(full, acc);
    } else if (/\.tsx$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

describe("client → /api calls", () => {
  it("never calls fetch('/api/…') directly — apiFetch attaches the token", () => {
    const offenders: string[] = [];

    for (const dir of [join(ROOT, "src", "app"), join(ROOT, "src", "components")]) {
      for (const file of uiFiles(dir)) {
        const src = readFileSync(file, "utf8");
        src.split("\n").forEach((line, i) => {
          // `apiFetch("/api/…")` is the sanctioned form; bare `fetch(` is not.
          if (/(?<!api)\bfetch\(\s*[`"']\/api\//.test(line)) {
            offenders.push(`${file.replace(ROOT + "/", "")}:${i + 1}`);
          }
        });
      }
    }

    expect(
      offenders,
      `Appels directs à fetch("/api/…") — ils partent sans jeton et renvoient 401 :\n  ${offenders.join("\n  ")}\n` +
        `Utilise apiFetch depuis @/lib/api-client.`
    ).toEqual([]);
  });

  it("finds the call sites it is meant to be checking", () => {
    // Guards the heuristic: if apiFetch usage vanished, the test above would
    // pass vacuously.
    let apiFetchCalls = 0;
    for (const dir of [join(ROOT, "src", "app"), join(ROOT, "src", "components")]) {
      for (const file of uiFiles(dir)) {
        apiFetchCalls += (readFileSync(file, "utf8").match(/apiFetch\(/g) ?? []).length;
      }
    }

    expect(apiFetchCalls).toBeGreaterThan(5);
  });
});
