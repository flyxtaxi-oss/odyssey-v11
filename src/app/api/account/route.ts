import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, enforceRateLimit } from "@/lib/auth-middleware";
import { getSecurityHeaders } from "@/lib/security";
import {
  adminReady,
  exportUserData,
  purgeUserData,
} from "@/lib/account-data";
import { adminAuth } from "@/lib/firebase-admin";

// ==============================================================================
// ACCOUNT API — GDPR rights: export (art. 20) and erasure (art. 17)
// ==============================================================================
//
// Both verbs act on the caller's own account only: identity comes from the
// verified token, never from a parameter. There is deliberately no admin
// variant here — an endpoint that can delete an arbitrary uid is a much
// bigger liability than an ops runbook.
//
// Both refuse honestly when the Admin SDK has no credentials. Erasure via the
// client SDK would silently skip whatever the rules block, producing the worst
// outcome possible: a deletion the app reports as complete and is not.

export const dynamic = "force-dynamic";

/** GET /api/account — download everything we hold about the caller. */
export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req);
  if (limited) return limited;

  const auth = await authenticateRequest(req);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: getSecurityHeaders() });
  }

  if (!adminReady()) {
    return NextResponse.json(
      { error: "Export indisponible : le serveur n'a pas de clé d'administration configurée (FIREBASE_PRIVATE_KEY)." },
      { status: 503, headers: getSecurityHeaders() }
    );
  }

  try {
    const data = await exportUserData(auth.user.uid);

    return NextResponse.json(
      {
        exported_at: new Date().toISOString(),
        uid: auth.user.uid,
        email: auth.user.email ?? null,
        data,
      },
      {
        headers: {
          ...getSecurityHeaders(),
          // Browsers download instead of rendering: this response contains
          // everything personal we have, it should land in a file the user
          // keeps, not in a tab that stays in history.
          "Content-Disposition": `attachment; filename="odyssey-export-${auth.user.uid}.json"`,
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    console.error("Account export failed:", err);
    return NextResponse.json(
      { error: "L'export a échoué. Réessaie ou contacte le support." },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

/** DELETE /api/account — erase all data, then the account itself. */
export async function DELETE(req: NextRequest) {
  const limited = await enforceRateLimit(req);
  if (limited) return limited;

  const auth = await authenticateRequest(req);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: getSecurityHeaders() });
  }

  if (!adminReady()) {
    return NextResponse.json(
      { error: "Suppression indisponible : le serveur n'a pas de clé d'administration configurée (FIREBASE_PRIVATE_KEY)." },
      { status: 503, headers: getSecurityHeaders() }
    );
  }

  try {
    // Data first, auth account second. If the purge dies halfway the user can
    // still sign in and retry; the reverse order would strand orphaned personal
    // data behind a login that no longer exists.
    const deleted = await purgeUserData(auth.user.uid);
    await adminAuth.deleteUser(auth.user.uid);

    // Log counts only — never content — as the erasure receipt.
    console.log(`Account ${auth.user.uid} erased:`, deleted);

    return NextResponse.json(
      { deleted, message: "Compte et données supprimés." },
      { headers: getSecurityHeaders() }
    );
  } catch (err) {
    console.error("Account deletion failed:", err);
    return NextResponse.json(
      { error: "La suppression a échoué en cours de route. Aucune donnée n'est cachée : reconnecte-toi et réessaie." },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}
