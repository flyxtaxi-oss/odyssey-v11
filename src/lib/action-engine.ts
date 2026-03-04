import { z } from "zod";

// ==============================================================================
// ACTION ENGINE — JARVIS Tool Execution Framework
// Decision → Plan → Confirm → Execute → Receipt
// ==============================================================================

// ─── Tool Schema Types ───────────────────────────────────────────────────────

export const ActionIntent = z.enum([
    "search_restaurants",
    "book_restaurant",
    "plan_trip",
    "draft_email",
    "plan_week",
    "search_info",
    "language_practice",
    "skill_mission",
]);
export type ActionIntent = z.infer<typeof ActionIntent>;

export const ActionStatus = z.enum([
    "planning",     // LLM is building the plan
    "pending",      // Waiting for user confirmation
    "confirmed",    // User confirmed, ready to execute
    "executing",    // Tool is running
    "completed",    // Done successfully
    "failed",       // Error occurred
    "cancelled",    // User cancelled
]);
export type ActionStatus = z.infer<typeof ActionStatus>;

// ─── Action Plan (what JARVIS proposes) ──────────────────────────────────────

export const ActionPlanSchema = z.object({
    id: z.string(),
    intent: ActionIntent,
    description: z.string(),        // Human-readable description
    toolName: z.string(),           // Which tool to call
    parameters: z.record(z.string(), z.unknown()), // Tool-specific params
    requiresConfirmation: z.boolean().default(true),
    estimatedDuration: z.string().optional(), // "~5 seconds"
    risks: z.array(z.string()).optional(),    // What could go wrong
    undoable: z.boolean().default(false),
    createdAt: z.string(),
});
export type ActionPlan = z.infer<typeof ActionPlanSchema>;

// ─── Action Receipt (proof of what happened) ─────────────────────────────────

export const ActionReceiptSchema = z.object({
    id: z.string(),
    planId: z.string(),
    intent: ActionIntent,
    status: ActionStatus,
    toolName: z.string(),
    input: z.record(z.string(), z.unknown()),
    output: z.unknown().optional(),
    error: z.string().optional(),
    executedAt: z.string(),
    durationMs: z.number(),
    undoInstructions: z.string().optional(),
});
export type ActionReceipt = z.infer<typeof ActionReceiptSchema>;

// ─── Tool Definition ─────────────────────────────────────────────────────────

export type ToolHandler = (params: Record<string, unknown>) => Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
    undoInstructions?: string;
}>;

export type ToolDefinition = {
    name: string;
    description: string;
    intent: ActionIntent;
    paramSchema: z.ZodSchema;
    requiresConfirmation: boolean;
    handler: ToolHandler;
    timeout: number; // ms
    retries: number;
};

// ─── Tool Registry ───────────────────────────────────────────────────────────

class ActionRegistry {
    private tools = new Map<string, ToolDefinition>();

    register(tool: ToolDefinition) {
        this.tools.set(tool.name, tool);
    }

    get(name: string): ToolDefinition | undefined {
        return this.tools.get(name);
    }

    findByIntent(intent: ActionIntent): ToolDefinition[] {
        return [...this.tools.values()].filter((t) => t.intent === intent);
    }

    list(): ToolDefinition[] {
        return [...this.tools.values()];
    }

    toManifest(): Array<{ name: string; description: string; intent: string }> {
        return this.list().map((t) => ({
            name: t.name,
            description: t.description,
            intent: t.intent,
        }));
    }
}

export const actionRegistry = new ActionRegistry();

// ─── Execute with timeout + retry ────────────────────────────────────────────

async function executeWithTimeout(
    fn: () => Promise<{ success: boolean; data?: unknown; error?: string; undoInstructions?: string }>,
    timeoutMs: number
): Promise<{ success: boolean; data?: unknown; error?: string; undoInstructions?: string }> {
    return Promise.race([
        fn(),
        new Promise<{ success: boolean; error: string }>((_, reject) =>
            setTimeout(() => reject({ success: false, error: `Timeout after ${timeoutMs}ms` }), timeoutMs)
        ),
    ]);
}

export async function executeTool(
    toolName: string,
    params: Record<string, unknown>
): Promise<ActionReceipt> {
    const tool = actionRegistry.get(toolName);
    const startTime = Date.now();
    const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (!tool) {
        return {
            id: receiptId,
            planId: "",
            intent: "search_info",
            status: "failed",
            toolName,
            input: params,
            error: `Tool "${toolName}" not found in registry`,
            executedAt: new Date().toISOString(),
            durationMs: Date.now() - startTime,
        };
    }

    // Validate params
    const validation = tool.paramSchema.safeParse(params);
    if (!validation.success) {
        return {
            id: receiptId,
            planId: "",
            intent: tool.intent,
            status: "failed",
            toolName,
            input: params,
            error: `Invalid parameters: ${validation.error.message}`,
            executedAt: new Date().toISOString(),
            durationMs: Date.now() - startTime,
        };
    }

    // Execute with retries
    let lastError = "";
    for (let attempt = 0; attempt <= tool.retries; attempt++) {
        try {
            const result = await executeWithTimeout(
                () => tool.handler(validation.data as Record<string, unknown>),
                tool.timeout
            );

            return {
                id: receiptId,
                planId: "",
                intent: tool.intent,
                status: result.success ? "completed" : "failed",
                toolName,
                input: params,
                output: result.data,
                error: result.error,
                executedAt: new Date().toISOString(),
                durationMs: Date.now() - startTime,
                undoInstructions: result.undoInstructions,
            };
        } catch (err) {
            lastError = err instanceof Error ? err.message : String(err);
            if (attempt < tool.retries) {
                await new Promise((r) => setTimeout(r, 500 * (attempt + 1))); // backoff
            }
        }
    }

    return {
        id: receiptId,
        planId: "",
        intent: tool.intent,
        status: "failed",
        toolName,
        input: params,
        error: `Failed after ${tool.retries + 1} attempts: ${lastError}`,
        executedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
    };
}

// ─── In-Memory Receipt Store ─────────────────────────────────────────────────

const receiptStore: ActionReceipt[] = [];

export function storeReceipt(receipt: ActionReceipt) {
    receiptStore.unshift(receipt); // newest first
    if (receiptStore.length > 100) receiptStore.pop(); // cap at 100
}

export function getReceipts(limit = 20): ActionReceipt[] {
    return receiptStore.slice(0, limit);
}

// ─── Generate Plan ID ────────────────────────────────────────────────────────

export function generatePlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
