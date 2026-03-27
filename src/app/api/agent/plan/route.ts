import { NextResponse } from "next/server";
import { actionRegistry } from "@/lib/action-engine";
import { registerRestaurantTools } from "@/lib/tools/restaurants";
import { generateActionPlanFromAI } from "@/lib/jarvis/ai-service";

// Register all tools on first request
let toolsRegistered = false;
function ensureTools() {
    if (!toolsRegistered) {
        registerRestaurantTools();
        toolsRegistered = true;
    }
}

// ==============================================================================
// POST /api/agent/plan — LLM Intent → Structured Action Plan
// ==============================================================================

export async function POST(request: Request) {
    ensureTools();

    try {
        const body = await request.json();
        const { query, userId } = body as { query: string; userId?: string };

        if (!query?.trim()) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        // Generate Plan using Neural Engine (with Token Cache)
        const plan = await generateActionPlanFromAI(query, userId);

        return NextResponse.json({
            plan,
            availableTools: actionRegistry.toManifest(),
            userId: userId || "anonymous",
            fromCache: !!(plan as any)._cached // Optional flag if we want to show it in UI
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Plan generation failed" },
            { status: 500 }
        );
    }
}

// GET — List available tools
export async function GET() {
    ensureTools();
    return NextResponse.json({
        tools: actionRegistry.toManifest(),
        count: actionRegistry.list().length,
    });
}
