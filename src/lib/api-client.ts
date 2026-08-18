// ==============================================================================
// API CLIENT — one place that knows how to talk to /api/*
// ==============================================================================
//
// Every route under /api reads the caller's identity from a verified Firebase
// ID token, and several of them refuse the request without one. Attaching that
// token was left to each call site, which meant it was attached in some and
// silently forgotten in others — the page then rendered an empty state that
// looked exactly like "you have no data yet" instead of "you were not
// authenticated".
//
// Routing every call through `apiFetch` makes the token automatic, so a new
// call site cannot forget it.

import { getAuth } from "firebase/auth";

/** Current user's ID token, or null when signed out. Never throws. */
async function idToken(): Promise<string | null> {
  try {
    const user = getAuth().currentUser;
    return user ? await user.getIdToken() : null;
  } catch {
    // Firebase not initialised (SSR, tests) — treat as signed out.
    return null;
  }
}

/**
 * fetch() against the app's own API, with the Firebase token attached when the
 * user is signed in.
 *
 * Endpoints using `optionalAuth` still work signed-out — they just return the
 * public/demo view. Endpoints using `authenticateRequest` return 401, which is
 * the honest answer and is what the UI should surface.
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = await idToken();

  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(path, { ...init, headers });
}

/** POST a JSON body. Returns the parsed response, or null on a non-OK status. */
export async function apiPost<T = unknown>(
  path: string,
  body: unknown
): Promise<T | null> {
  const res = await apiFetch(path, { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

/** True when a request can be expected to carry an identity. */
export function isSignedIn(): boolean {
  try {
    return Boolean(getAuth().currentUser);
  } catch {
    return false;
  }
}
