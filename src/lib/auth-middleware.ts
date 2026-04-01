// ==============================================================================
// AUTH MIDDLEWARE — Secure API Authentication
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "./firebase-admin";

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
  req: NextRequest
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
  req: NextRequest
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
