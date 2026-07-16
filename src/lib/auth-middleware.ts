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

/** Best-effort client IP, honouring the proxy headers Vercel sets. */
function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Rate-limit a request by authenticated uid when a valid token is present,
 * otherwise by client IP. Returns a 429 response when the caller is over the
 * limit, or null to let the request proceed. Used to protect paid LLM routes
 * from abuse without forcing authentication (which would break existing UX).
 */
export async function enforceRateLimit(req: Request): Promise<NextResponse | null> {
  let key = `ip:${clientIp(req)}`;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const decoded = await verifyIdToken(authHeader.slice(7));
    const uid = decoded?.uid || decoded?.sub;
    if (uid) key = `uid:${uid}`;
  }

  const { allowed, resetMs } = checkRateLimit(key);
  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes, réessayez dans un instant.", retryAfterMs: resetMs },
      { status: 429, headers: { "Retry-After": String(Math.ceil(resetMs / 1000)) } }
    );
  }

  return null;
}
