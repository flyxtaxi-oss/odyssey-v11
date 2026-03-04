import { NextResponse } from "next/server";
import {
    executeTool,
    storeReceipt,
    getReceipts,
} from "@/lib/action-engine";
import { registerRestaurantTools } from "@/lib/tools/restaurants";

let toolsRegistered = false;
function ensureTools() {
    if (!toolsRegistered) {
        registerRestaurantTools();
        toolsRegistered = true;
    }
}

// ==============================================================================
// POST /api/agent/execute — Execute a confirmed action plan
// ==============================================================================

export async function POST(request: Request) {
    ensureTools();

    try {
        const body = await request.json();
        const { planId, toolName, parameters, confirmed } = body as {
            planId: string;
            toolName: string;
            parameters: Record<string, unknown>;
            confirmed: boolean;
        };

        if (!toolName || !parameters) {
            return NextResponse.json(
                { error: "toolName and parameters are required" },
                { status: 400 }
            );
        }

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

        const receipt = await executeTool(toolName, parameters);
        receipt.planId = planId || "";

        // Store the receipt for audit trail
        storeReceipt(receipt);

        return NextResponse.json({
            receipt,
            message:
                receipt.status === "completed"
                    ? "✅ Action exécutée avec succès"
                    : `❌ Échec: ${receipt.error}`,
        });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Execution failed" },
            { status: 500 }
        );
    }
}

// GET — Retrieve action receipts (audit log)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    return NextResponse.json({
        receipts: getReceipts(limit),
        total: getReceipts(100).length,
    });
}
