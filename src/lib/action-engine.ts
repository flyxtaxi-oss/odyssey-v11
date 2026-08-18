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
    "completed",    // Done successfully — un effet réel a eu lieu
    // Le code a tourné, mais AUCUN effet réel ne s'est produit : l'outil est
    // une maquette. Statut distinct de "completed" parce que la différence
    // compte pour l'utilisateur — croire qu'une table est réservée alors
    // qu'elle ne l'est pas, c'est se présenter au restaurant pour rien.
    "simulated",
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
    // Chaque reçu appartient à un utilisateur. Sans ce champ, le store était
    // global : n'importe quel utilisateur authentifié lisait les reçus
    // (paramètres et résultats inclus) de tous les autres.
    userId: z.string(),
    intent: ActionIntent,
    status: ActionStatus,
    toolName: z.string(),
    input: z.record(z.string(), z.unknown()),
    output: z.unknown().optional(),
    error: z.string().optional(),
    executedAt: z.string(),
    durationMs: z.number(),
    undoInstructions: z.string().optional(),
    /** true quand aucun effet réel n'a eu lieu — l'outil est une maquette. */
    simulated: z.boolean().default(false),
});
export type ActionReceipt = z.infer<typeof ActionReceiptSchema>;

// ─── Tool Definition ─────────────────────────────────────────────────────────

export type ToolHandler = (params: Record<string, unknown>) => Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
    undoInstructions?: string;
    /**
     * Permet à un outil de signaler, à l'exécution, qu'il n'a produit aucun
     * effet réel — utile quand le même outil a un mode réel et un mode
     * dégradé (clé API absente, par exemple).
     */
    simulated?: boolean;
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
    /**
     * L'outil produit-il un effet réel dans le monde ?
     *
     * Champ OBLIGATOIRE, et volontairement : le déclarer force à répondre à la
     * question pour chaque outil ajouté. Un oubli deviendrait un outil qui
     * annonce un succès sans rien faire — exactement le défaut qu'on corrige.
     */
    simulated: boolean;
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

    // Le manifeste sert à décrire les outils au modèle ET à l'UI. Omettre
    // `simulated` laisserait J.A.R.V.I.S. proposer « je réserve » pour un outil
    // qui ne réserve rien.
    toManifest(): Array<{
        name: string;
        description: string;
        intent: string;
        simulated: boolean;
        requiresConfirmation: boolean;
    }> {
        return this.list().map((t) => ({
            name: t.name,
            description: t.description,
            intent: t.intent,
            simulated: t.simulated,
            requiresConfirmation: t.requiresConfirmation,
        }));
    }
}

export const actionRegistry = new ActionRegistry();

// ─── Execute with timeout + retry ────────────────────────────────────────────

type ToolResult = Awaited<ReturnType<ToolHandler>>;

async function executeWithTimeout(
    fn: () => Promise<ToolResult>,
    timeoutMs: number
): Promise<ToolResult> {
    return Promise.race([
        fn(),
        new Promise<{ success: boolean; error: string }>((_, reject) =>
            setTimeout(() => reject({ success: false, error: `Timeout after ${timeoutMs}ms` }), timeoutMs)
        ),
    ]);
}

/**
 * Run a registered tool.
 *
 * `options.confirmed` must be true for any tool declaring
 * `requiresConfirmation`. That flag existed on every tool — `book_restaurant`
 * sets it to true — but nothing ever read it: the check lived only in the route
 * handler, and there it compared a boolean the CALLER had put in the request
 * body. So the guard on a real-world booking was "the client says it is fine".
 *
 * Enforcing it here means the rule travels with the tool. A new call site
 * cannot forget it, because forgetting it means the call is refused.
 */
export async function executeTool(
    toolName: string,
    params: Record<string, unknown>,
    options: { confirmed?: boolean; userId?: string } = {}
): Promise<ActionReceipt> {
    const tool = actionRegistry.get(toolName);
    const startTime = Date.now();
    const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    // L'identité vient toujours du token vérifié par la route, jamais du body.
    const userId = options.userId ?? "";

    if (!tool) {
        return {
            id: receiptId,
            planId: "",
            userId,
            intent: "search_info",
            status: "failed",
            toolName,
            input: params,
            error: `Tool "${toolName}" not found in registry`,
            executedAt: new Date().toISOString(),
            durationMs: Date.now() - startTime,
            simulated: false,
        };
    }

    // A tool that changes something in the real world (a booking, a payment,
    // a message) must not run on an unconfirmed call, whatever the route did.
    if (tool.requiresConfirmation && !options.confirmed) {
        return {
            id: receiptId,
            planId: "",
            userId,
            intent: tool.intent,
            status: "failed",
            toolName,
            input: params,
            error: `L'outil « ${toolName} » exige une confirmation explicite avant exécution.`,
            executedAt: new Date().toISOString(),
            durationMs: Date.now() - startTime,
            simulated: false,
        };
    }

    // Validate params
    const validation = tool.paramSchema.safeParse(params);
    if (!validation.success) {
        return {
            id: receiptId,
            planId: "",
            userId,
            intent: tool.intent,
            status: "failed",
            toolName,
            input: params,
            error: `Invalid parameters: ${validation.error.message}`,
            executedAt: new Date().toISOString(),
            durationMs: Date.now() - startTime,
            simulated: false,
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

            // Un outil déclaré simulé — ou qui signale l'être à l'exécution —
            // ne peut PAS produire "completed". Sinon le reçu, l'API et l'UI
            // affirment tous qu'une action réelle a eu lieu.
            const simulated = tool.simulated || result.simulated === true;

            return {
                id: receiptId,
                planId: "",
                userId,
                intent: tool.intent,
                status: result.success ? (simulated ? "simulated" : "completed") : "failed",
                toolName,
                input: params,
                output: result.data,
                error: result.error,
                executedAt: new Date().toISOString(),
                durationMs: Date.now() - startTime,
                undoInstructions: result.undoInstructions,
                simulated,
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
        userId,
        intent: tool.intent,
        status: "failed",
        toolName,
        input: params,
        simulated: tool.simulated,
        error: `Failed after ${tool.retries + 1} attempts: ${lastError}`,
        executedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
    };
}

// ─── In-Memory Receipt Store ─────────────────────────────────────────────────
// Scopé par utilisateur : la lecture exige l'uid vérifié de l'appelant.
// (La persistance durable — Firestore — reste à faire ; ce store disparaît au
// redémarrage et diffère entre instances serverless.)

const receiptStore: ActionReceipt[] = [];

export function storeReceipt(receipt: ActionReceipt) {
    if (!receipt.userId) {
        // Un reçu sans propriétaire ne doit jamais entrer dans le store : il
        // serait soit invisible, soit attribuable à n'importe qui.
        throw new Error("storeReceipt: receipt.userId est requis");
    }
    receiptStore.unshift(receipt); // newest first
    if (receiptStore.length > 500) receiptStore.pop(); // cap global
}

export function getReceipts(userId: string, limit = 20): ActionReceipt[] {
    if (!userId) return [];
    return receiptStore.filter((r) => r.userId === userId).slice(0, limit);
}

export function countReceipts(userId: string): number {
    if (!userId) return 0;
    return receiptStore.filter((r) => r.userId === userId).length;
}

// ─── Generate Plan ID ────────────────────────────────────────────────────────

export function generatePlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ==============================================================================
// ENREGISTREMENT DES OUTILS (TOOL REGISTRY)
// ==============================================================================

actionRegistry.register({
    name: "google_calendar_schedule",
    description: "Planifie un événement ou un rappel dans le Google Calendar de l'utilisateur.",
    intent: "plan_week",
    paramSchema: z.object({
        title: z.string(),
        startTimeISO: z.string(),
        endTimeISO: z.string(),
        description: z.string().optional()
    }),
    requiresConfirmation: true, // Action destructrice/modificatrice = Confirmation Requise
    // Aucun appel Google n'existe encore : rien n'est écrit dans un agenda.
    simulated: true,
    timeout: 8000,
    retries: 1,
    handler: async (params) => {
        console.log("📅 [Action Engine] Google Calendar — maquette, aucun événement créé", params);
        // TODO: brancher googleapis (OAuth + scopes minimaux) — voir Phase 9.
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            simulated: true,
            data: {
                simulation: true,
                message:
                    "Aucun événement n'a été créé : le connecteur Google Calendar n'est pas encore branché.",
                aurait_cree: params,
            },
        };
    }
});

actionRegistry.register({
    name: "skyscanner_flight_search",
    description: "Recherche des vols pas chers pour les digital nomads.",
    intent: "plan_trip",
    paramSchema: z.object({
        origin: z.string(),
        destination: z.string(),
        date: z.string(), // YYYY-MM-DD
    }),
    requiresConfirmation: false, // Simple recherche = Pas besoin de confirmation
    // Prix et horaires sont inventés : aucun appel Skyscanner n'existe. Les
    // présenter comme réels, sur une app de conseil au départ, serait faire
    // décider quelqu'un sur des chiffres fabriqués.
    simulated: true,
    timeout: 10000,
    retries: 2,
    handler: async (params) => {
        console.log("✈️ [Action Engine] Skyscanner — maquette, données d'exemple", params);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            success: true,
            simulated: true,
            data: {
                simulation: true,
                message:
                    "Données d'exemple : le connecteur Skyscanner n'est pas branché, ces vols et ces prix ne sont pas réels.",
                recherche: params,
                exemples: [
                    { airline: "TAP Portugal", price: 85, duration: "2h30", direct: true },
                    { airline: "Air France", price: 120, duration: "2h45", direct: true }
                ]
            }
        };
    }
});
