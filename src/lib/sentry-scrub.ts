// ==============================================================================
// SENTRY — filtrage des données personnelles avant envoi
// ==============================================================================
//
// Odyssey n'est pas une app anodine : les utilisateurs y confient leur
// situation fiscale, familiale, leurs revenus, leur statut de séjour, et le
// contenu de leurs conversations avec J.A.R.V.I.S. Envoyer une erreur à un
// service tiers avec ce contexte attaché, c'est exporter des données
// personnelles sans base légale — et un rapport d'erreur est conservé, indexé,
// et lisible par toute l'équipe.
//
// La règle retenue : on envoie de quoi DIAGNOSTIQUER (route, type d'erreur,
// stack, identifiant pseudonymisé), jamais de quoi RECONSTITUER l'utilisateur.
//
// Ce module est testé (voir __tests__/sentry-scrub.test.ts) parce qu'une fuite
// ici est silencieuse : rien ne casse, les données partent simplement.

/** En-têtes qui portent une identité ou un secret — jamais transmis. */
const HEADER_DENYLIST = [
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "cf-connecting-ip",
  "x-forwarded-for",
  "x-real-ip",
  "x-vercel-forwarded-for",
];

/** Clés dont la valeur est remplacée partout où elle apparaît. */
const SENSITIVE_KEY = new RegExp(
  [
    "token", "password", "secret", "api_?key", "authorization", "credential",
    "private_?key", "email", "phone", "telephone", "iban", "ssn",
    // Métier : le coeur de ce qu'Odyssey manipule.
    "prompt", "message", "content", "notes", "salary", "salaire", "income",
    "revenu", "budget", "passport", "passeport", "nationality", "nationalite",
    "family_status", "situation_familiale", "address", "adresse",
  ].join("|"),
  "i"
);

export const REDACTED = "[filtré]";

/**
 * Remplace récursivement toute valeur dont la CLÉ est sensible.
 *
 * On filtre par nom de clé plutôt que par heuristique sur la valeur : une
 * heuristique laisse toujours passer le cas qu'on n'a pas imaginé, alors qu'un
 * nom de champ est déclaratif. Le coût est de sur-filtrer, ce qui est le bon
 * sens de l'erreur.
 */
export function scrubObject(value: unknown, depth = 0): unknown {
  if (depth > 8 || value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((v) => scrubObject(v, depth + 1));
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = SENSITIVE_KEY.test(key) ? REDACTED : scrubObject(val, depth + 1);
    }
    return out;
  }

  return value;
}

type SentryRequest = {
  headers?: Record<string, string>;
  cookies?: unknown;
  data?: unknown;
  query_string?: unknown;
  url?: string;
};

type SentryEvent = {
  request?: SentryRequest;
  user?: Record<string, unknown>;
  extra?: Record<string, unknown>;
  contexts?: Record<string, unknown>;
  breadcrumbs?: Array<{ data?: unknown; message?: string }>;
};

/**
 * `beforeSend` : dernier filet avant l'envoi réseau.
 * Retourner `null` annulerait l'événement ; on préfère le nettoyer, parce
 * qu'une erreur non remontée est un incident qu'on ne verra jamais.
 */
export function scrubEvent<T extends SentryEvent>(event: T): T {
  if (event.request) {
    if (event.request.headers) {
      const headers: Record<string, string> = {};
      for (const [name, val] of Object.entries(event.request.headers)) {
        headers[name] = HEADER_DENYLIST.includes(name.toLowerCase()) ? REDACTED : val;
      }
      event.request.headers = headers;
    }

    // Corps de requête et query string : c'est là que voyagent les prompts
    // J.A.R.V.I.S. et les profils de simulation.
    delete event.request.cookies;
    if (event.request.data !== undefined) event.request.data = REDACTED;
    if (event.request.query_string !== undefined) event.request.query_string = REDACTED;

    // Une URL peut porter des paramètres personnels : on garde le chemin seul.
    if (typeof event.request.url === "string") {
      const q = event.request.url.indexOf("?");
      if (q !== -1) event.request.url = event.request.url.slice(0, q);
    }
  }

  // L'utilisateur est identifié par son uid seul — ni email, ni IP.
  if (event.user) {
    event.user = { id: typeof event.user.id === "string" ? event.user.id : undefined };
  }

  if (event.extra) event.extra = scrubObject(event.extra) as Record<string, unknown>;
  if (event.contexts) event.contexts = scrubObject(event.contexts) as Record<string, unknown>;

  // Les breadcrumbs rejouent le fil d'exécution — y compris des payloads.
  if (Array.isArray(event.breadcrumbs)) {
    event.breadcrumbs = event.breadcrumbs.map((b) => ({
      ...b,
      data: b.data ? (scrubObject(b.data) as Record<string, unknown>) : b.data,
    }));
  }

  return event;
}
