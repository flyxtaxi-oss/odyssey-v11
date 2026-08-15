import { NextResponse } from "next/server";
import {
    executeTool,
    storeReceipt,
    getReceipts,
    countReceipts,
} from "@/lib/action-engine";
import { ensureToolsRegistered } from "@/lib/tools/registry";
import { authenticateRequest, enforceRateLimit } from "@/lib/auth-middleware";

// ==============================================================================
// POST /api/agent/execute — Execute a confirmed action plan
// ==============================================================================

export async function POST(request: Request) {
    const limited = await enforceRateLimit(request, { durable: true });
    if (limited) return limited;

    // This endpoint performs real-world side effects — it books restaurants.
    // `authenticateRequest` was imported here but only ever called on GET, so
    // POST accepted anonymous callers. The single gate was `confirmed: true`,
    // a value the caller supplies about itself, which is not a gate at all.
    const auth = await authenticateRequest(request);
    if (!auth.success) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    ensureToolsRegistered();

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
    }

    try {
        const { planId, toolName, parameters, confirmed } = (body ?? {}) as {
            planId?: string;
            toolName?: string;
            parameters?: Record<string, unknown>;
            confirmed?: boolean;
        };

        if (typeof toolName !== "string" || !toolName || typeof parameters !== "object" || parameters === null) {
            return NextResponse.json(
                { error: "toolName (string) et parameters (objet) sont requis" },
                { status: 400 }
            );
        }

        // Kept as an early, explicit 403 so the client gets a clear message.
        // The real enforcement now lives inside executeTool, which knows which
        // tools actually need it — this check alone could never be trusted.
        if (!confirmed) {
            return NextResponse.json(
                {
                    error: "Action requires explicit confirmation",
                    message: "Set confirmed: true to execute this action",
                    planId,
                },
                { status: 403 }
            );
        }

        const receipt = await executeTool(toolName, parameters, {
            confirmed: true,
            userId: auth.user.uid,
        });
        receipt.planId = planId || "";

        // Store the receipt for audit trail
        storeReceipt(receipt);

        // Le message doit refléter ce qui s'est RÉELLEMENT passé. Annoncer un
        // succès pour un outil simulé, c'est laisser croire qu'une table est
        // réservée ou qu'un événement est à l'agenda alors que rien n'existe.
        const message =
            receipt.status === "completed"
                ? "✅ Action exécutée avec succès"
                : receipt.status === "simulated"
                    ? "⚠️ Simulation — aucune action réelle n'a été effectuée (connecteur non branché)"
                    : `❌ Échec: ${receipt.error}`;

        return NextResponse.json({ receipt, simulated: receipt.simulated, message });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Execution failed" },
            { status: 500 }
        );
    }
}

// GET — Retrieve action receipts (audit log) — authenticated only
export async function GET(request: Request) {
    const auth = await authenticateRequest(request);
    if (!auth.success) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
        Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1),
        100
    );

    // Chaque utilisateur ne voit que SES reçus — jamais le store global.
    return NextResponse.json({
        receipts: getReceipts(auth.user.uid, limit),
        total: countReceipts(auth.user.uid),
    });
}
