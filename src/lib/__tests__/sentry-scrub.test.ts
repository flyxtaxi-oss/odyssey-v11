import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { scrubEvent, scrubObject, REDACTED } from "../sentry-scrub";

// ==============================================================================
// Filtrage Sentry — les données personnelles ne sortent pas
// ==============================================================================
//
// Une fuite ici ne casse rien : l'app fonctionne, les erreurs remontent, et
// les données personnelles partent chez un tiers sans que personne ne le voie.
// C'est exactement le type de défaut qu'aucun test manuel ne rattrape, d'où
// ces cas.
//
// Le contexte : Odyssey manipule situation fiscale, revenus, statut de séjour,
// composition familiale et conversations J.A.R.V.I.S.

describe("scrubObject", () => {
  it("filtre les secrets quelle que soit la profondeur", () => {
    const scrubbed = scrubObject({
      niveau1: { niveau2: { niveau3: { api_key: "sk-live-123", ok: "visible" } } },
    }) as { niveau1: { niveau2: { niveau3: Record<string, string> } } };

    const n3 = scrubbed.niveau1.niveau2.niveau3;
    expect(n3.api_key).toBe(REDACTED);
    expect(n3.ok).toBe("visible");
  });

  it("filtre les données métier sensibles d'Odyssey, pas seulement les secrets techniques", () => {
    const scrubbed = scrubObject({
      salary: 68000,
      revenu: 5000,
      nationality: "marocaine",
      family_status: "marié, 2 enfants",
      passeport: "AB123456",
      notes: "je quitte la France pour raisons fiscales",
      destination: "portugal",
    }) as Record<string, unknown>;

    for (const cle of ["salary", "revenu", "nationality", "family_status", "passeport", "notes"]) {
      expect(scrubbed[cle], `${cle} doit être filtré`).toBe(REDACTED);
    }
    // La destination n'identifie personne et sert au diagnostic.
    expect(scrubbed.destination).toBe("portugal");
  });

  it("traverse les tableaux", () => {
    const scrubbed = scrubObject([{ token: "abc" }, { safe: "ok" }]) as Array<Record<string, string>>;
    expect(scrubbed[0].token).toBe(REDACTED);
    expect(scrubbed[1].safe).toBe("ok");
  });

  it("ne boucle pas indéfiniment sur une structure profonde", () => {
    let profond: Record<string, unknown> = { token: "fuite" };
    for (let i = 0; i < 50; i++) profond = { nested: profond };
    expect(() => scrubObject(profond)).not.toThrow();
  });
});

describe("scrubEvent", () => {
  it("supprime les en-têtes d'authentification et d'identification", () => {
    const event = scrubEvent({
      request: {
        headers: {
          authorization: "Bearer eyJhbGciOi...",
          cookie: "session=abc",
          "cf-connecting-ip": "82.65.11.4",
          "x-forwarded-for": "82.65.11.4",
          "user-agent": "Mozilla/5.0",
        },
      },
    });

    expect(event.request?.headers?.authorization).toBe(REDACTED);
    expect(event.request?.headers?.cookie).toBe(REDACTED);
    expect(event.request?.headers?.["cf-connecting-ip"]).toBe(REDACTED);
    expect(event.request?.headers?.["x-forwarded-for"]).toBe(REDACTED);
    // Le user-agent aide à reproduire un bug et n'identifie pas seul.
    expect(event.request?.headers?.["user-agent"]).toBe("Mozilla/5.0");
  });

  it("n'envoie jamais le corps de requête — c'est là que vivent les prompts", () => {
    const event = scrubEvent({
      request: {
        data: { messages: [{ role: "user", content: "Mon revenu est de 5000€/mois" }] },
        query_string: "email=jibril@exemple.fr",
      },
    });

    expect(event.request?.data).toBe(REDACTED);
    expect(event.request?.query_string).toBe(REDACTED);
  });

  it("coupe la query string de l'URL mais garde le chemin", () => {
    const event = scrubEvent({
      request: { url: "https://odyssey.ai/api/jarvis?email=jibril@exemple.fr&uid=123" },
    });

    expect(event.request?.url).toBe("https://odyssey.ai/api/jarvis");
    expect(event.request?.url).not.toContain("@");
  });

  it("réduit l'utilisateur à son identifiant — ni email ni IP", () => {
    const event = scrubEvent({
      user: { id: "uid-abc", email: "jibril@exemple.fr", ip_address: "82.65.11.4", username: "jibril" },
    });

    expect(event.user).toEqual({ id: "uid-abc" });
    expect(JSON.stringify(event.user)).not.toContain("exemple.fr");
    expect(JSON.stringify(event.user)).not.toContain("82.65");
  });

  it("filtre les breadcrumbs, qui rejouent le fil d'exécution", () => {
    const event = scrubEvent({
      breadcrumbs: [{ message: "fetch /api/jarvis", data: { prompt: "ma situation fiscale" } }],
    });

    expect((event.breadcrumbs?.[0].data as Record<string, string>).prompt).toBe(REDACTED);
  });

  it("ne jette pas un événement vide de contexte", () => {
    // Nettoyer plutôt qu'annuler : une erreur non remontée est un incident
    // qu'on ne verra jamais.
    expect(() => scrubEvent({})).not.toThrow();
    expect(scrubEvent({})).toEqual({});
  });
});

describe("configuration Sentry", () => {
  const ROOT = join(__dirname, "..", "..", "..");

  it("n'active jamais sendDefaultPii", () => {
    // Cette option attacherait IP, cookies et en-têtes d'auth, court-circuitant
    // tout le filtrage ci-dessus.
    for (const f of ["src/instrumentation.ts", "src/instrumentation-client.ts"]) {
      const src = readFileSync(join(ROOT, f), "utf8");
      expect(src, `${f} doit désactiver sendDefaultPii`).toContain("sendDefaultPii: false");
      expect(src).toContain("beforeSend");
    }
  });

  it("n'active pas le Session Replay sans consentement", () => {
    // Rejouer l'écran d'un utilisateur saisissant sa situation familiale et
    // fiscale est un enregistrement de données personnelles.
    const src = readFileSync(join(ROOT, "src/instrumentation-client.ts"), "utf8");
    expect(src).toContain("replaysSessionSampleRate: 0");
    expect(src).toContain("replaysOnErrorSampleRate: 0");
  });

  it("supprime les source maps du bundle servi après upload", () => {
    const src = readFileSync(join(ROOT, "next.config.ts"), "utf8");
    expect(src).toContain("deleteSourcemapsAfterUpload: true");
  });
});
