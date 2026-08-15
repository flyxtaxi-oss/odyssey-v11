import { NextResponse } from "next/server";
import { actionRegistry } from "@/lib/action-engine";
import { ensureToolsRegistered } from "@/lib/tools/registry";
import { generateActionPlanFromAI } from "@/lib/jarvis/ai-service";
import { authenticateRequest, enforceRateLimit } from "@/lib/auth-middleware";
import { aiUnavailableResponse } from "@/lib/ai-unavailable";

// ==============================================================================
// POST /api/agent/plan — LLM Intent → Structured Action Plan
// ==============================================================================

export async function POST(request: Request) {
    const limited = await enforceRateLimit(request, { durable: true });
    if (limited) return limited;

    // Identity comes from the verified token. It used to be read from the
    // request body, which meant a caller could plan — and cache results —
    // under someone else's id.
    const auth = await authenticateRequest(request);
    if (!auth.success) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const userId = auth.user.uid;

    ensureToolsRegistered();

    try {
        const body = await request.json();
        const { query } = body as { query: string };

        if (typeof query !== "string" || !query.trim()) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        if (query.length > 8000) {
            return NextResponse.json({ error: "Query trop longue (max 8000 caractères)" }, { status: 400 });
        }

        // Generate Plan using Neural Engine (with Token Cache)
        const plan = await generateActionPlanFromAI(query, userId);

        return NextResponse.json({
            plan,
            availableTools: actionRegistry.toManifest(),
            userId,
            fromCache: !!(plan as { _cached?: boolean } | null)?._cached // Optional flag if we want to show it in UI
        });
    } catch (err) {
        const unavailable = aiUnavailableResponse(err);
        if (unavailable) return unavailable;

        return NextResponse.json(
            { error: err instanceof Error && err.message ? err.message : "Plan generation failed" },
            { status: 500 }
        );
    }
}

// GET — List available tools.
// Authentifié : le manifeste des outils décrit la surface d'attaque interne
// (noms, intentions, paramètres) et n'a aucune raison d'être public.
export async function GET(request: Request) {
    const auth = await authenticateRequest(request);
    if (!auth.success) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    ensureToolsRegistered();
    return NextResponse.json({
        tools: actionRegistry.toManifest(),
        count: actionRegistry.list().length,
    });
}
