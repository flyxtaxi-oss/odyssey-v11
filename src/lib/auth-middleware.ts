// ==============================================================================
// AUTH MIDDLEWARE — Secure API Authentication
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "./firebase-admin";
import { checkRateLimit } from "./ai-engine";

export type AuthenticatedRequest = NextRequest & {
  user?: {
    uid: string;
    email?: string;
    role?: string;
  };
};

export type AuthResult =
  | { success: true; user: { uid: string; email?: string; role?: string } }
  | { success: false; error: string; status: number };

/**
 * Authenticate request using Bearer token
 */
export async function authenticateRequest(
  req: Request
): Promise<AuthResult> {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return {
        success: false,
        error: "Missing or invalid authorization header",
        status: 401,
      };
    }

    const token = authHeader.slice(7);

    if (!token || token.length < 100) {
      return {
        success: false,
        error: "Invalid token format",
        status: 401,
      };
    }

    const decodedToken = await verifyIdToken(token);

    if (!decodedToken) {
      return {
        success: false,
        error: "Invalid or expired token",
        status: 401,
      };
    }

    return {
      success: true,
      user: {
        uid: decodedToken.uid || decodedToken.sub || "",
        email: decodedToken.email,
        role: decodedToken.role || "user",
      },
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: "Authentication failed",
      status: 500,
    };
  }
}

/**
 * Higher-order function to protect API routes
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, user: { uid: string; email?: string }) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const auth = await authenticateRequest(req);

    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = auth.user;

    return handler(req as AuthenticatedRequest, auth.user);
  };
}

/**
 * Optional auth - returns user if authenticated, null otherwise
 */
export async function optionalAuth(
  req: Request
): Promise<{ uid: string; email?: string } | null> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  const decodedToken = await verifyIdToken(token);

  if (!decodedToken) {
    return null;
  }

  return {
    uid: decodedToken.uid || decodedToken.sub || "",
    email: decodedToken.email,
  };
}

// ─── Rate limiting for routes reachable by unauthenticated clients ────────────

/**
 * Best-effort client IP, en traversant les proxys dans l'ordre où ils se
 * présentent : Cloudflare d'abord (il est en amont), puis Vercel.
 *
 * ATTENTION — ces en-têtes sont falsifiables par n'importe qui atteignant
 * l'origine directement. `CF-Connecting-IP` n'est digne de confiance que si
 * l'origine Vercel n'accepte QUE le trafic venant de Cloudflare. Sans ce
 * verrou, un attaquant fait tourner l'en-tête et obtient un bucket de
 * rate-limit neuf à chaque requête.
 *
 * Voir docs/audits/2026-08-03-durcissement-securite.md § Cloudflare.
 */
export function clientIp(req: Request): string {
  // Cloudflare : IP réelle du client, un seul champ (pas de liste).
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  // Vercel place ici l'IP qu'il a lui-même constatée.
  const vercel = req.headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0].trim();

  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  return req.headers.get("x-real-ip") || "unknown";
}

/** Limite partagée appliquée aux routes qui déclenchent un appel LLM payant. */
const AI_DURABLE_LIMIT = { max: 20, refillPerSec: 20 / 60 }; // 20 en rafale, ~20/min

export type RateLimitOptions = {
  /**
   * Ajoute un compteur partagé entre instances (Firestore) en plus du bucket
   * mémoire. À réserver aux routes coûteuses : le bucket mémoire seul est un
   * compteur par instance, qui repart à zéro à chaque démarrage à froid.
   */
  durable?: boolean;
};

function tooManyRequests(resetMs: number): NextResponse {
  return NextResponse.json(
    { error: "Trop de requêtes, réessayez dans un instant.", retryAfterMs: resetMs },
    { status: 429, headers: { "Retry-After": String(Math.ceil(resetMs / 1000)) } }
  );
}

/**
 * Rate-limit a request by authenticated uid when a valid token is present,
 * otherwise by client IP. Returns a 429 response when the caller is over the
 * limit, or null to let the request proceed. Used to protect paid LLM routes
 * from abuse without forcing authentication (which would break existing UX).
 */
export async function enforceRateLimit(
  req: Request,
  options: RateLimitOptions = {}
): Promise<NextResponse | null> {
  let key = `ip:${clientIp(req)}`;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const decoded = await verifyIdToken(authHeader.slice(7));
    const uid = decoded?.uid || decoded?.sub;
    if (uid) key = `uid:${uid}`;
  }

  // Pré-filtre local : gratuit, et il absorbe les rafales d'une même instance
  // sans jamais toucher Firestore.
  const { allowed, resetMs } = checkRateLimit(key);
  if (!allowed) return tooManyRequests(resetMs);

  if (options.durable) {
    const { consumeDurableToken } = await import("./rate-limit-durable");
    const verdict = await consumeDurableToken(key, AI_DURABLE_LIMIT);
    if (!verdict.allowed) return tooManyRequests(verdict.resetMs);
  }

  return null;
}
