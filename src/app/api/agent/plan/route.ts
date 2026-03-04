import { NextResponse } from "next/server";
import {
    actionRegistry,
    generatePlanId,
    type ActionPlan,
} from "@/lib/action-engine";
import { registerRestaurantTools } from "@/lib/tools/restaurants";

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

const INTENT_PATTERNS = [
    { pattern: /reserv|book|réserv/i, intent: "book_restaurant" as const, tool: "book_restaurant" },
    { pattern: /resto|restaurant|manger|dîner|diner|souper|déjeuner|lunch|dinner/i, intent: "search_restaurants" as const, tool: "search_restaurants" },
    { pattern: /japon|sushi|ramen|italien|pizza|thaï|thai|chinois|indien|mexicain|libanais|burger|vegan|végé/i, intent: "search_restaurants" as const, tool: "search_restaurants" },
    { pattern: /voyage|trip|itinéra|itinera|planif/i, intent: "plan_trip" as const, tool: "plan_trip" },
    { pattern: /email|mail|message|écrire|rédiger/i, intent: "draft_email" as const, tool: "draft_email" },
    { pattern: /semaine|week|planning|agenda|schedule/i, intent: "plan_week" as const, tool: "plan_week" },
];

function detectIntent(query: string) {
    for (const { pattern, intent, tool } of INTENT_PATTERNS) {
        if (pattern.test(query)) {
            return { intent, tool };
        }
    }
    return { intent: "search_info" as const, tool: "search_info" };
}

function extractRestaurantParams(query: string): Record<string, unknown> {
    const params: Record<string, unknown> = { query, maxResults: 3 };

    // Detect cuisine
    const cuisineMap: Record<string, string> = {
        japon: "japonais", sushi: "japonais", ramen: "japonais",
        italien: "italien", pizza: "italien", pasta: "italien",
        thaï: "thaïlandais", thai: "thaïlandais",
        chinois: "chinois", indien: "indien",
        mexicain: "mexicain", libanais: "libanais",
        burger: "burger", vegan: "vegan", végé: "végétarien",
    };
    for (const [keyword, cuisine] of Object.entries(cuisineMap)) {
        if (query.toLowerCase().includes(keyword)) {
            params.cuisine = cuisine;
            break;
        }
    }

    // Detect budget
    const budgetMatch = query.match(/(\d+)\s*€/);
    if (budgetMatch) {
        const amount = parseInt(budgetMatch[1], 10);
        if (amount <= 15) params.budget = "$";
        else if (amount <= 30) params.budget = "$$";
        else if (amount <= 60) params.budget = "$$$";
        else params.budget = "$$$$";
    }

    // Detect location
    const locationPatterns = [
        /(?:à|a|near|près de|pres de|in)\s+([A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+)*)/,
    ];
    for (const lp of locationPatterns) {
        const match = query.match(lp);
        if (match) {
            params.location = match[1];
            break;
        }
    }

    return params;
}

function extractBookingParams(query: string): Record<string, unknown> {
    const params: Record<string, unknown> = { restaurantName: "", partySize: 2 };

    // Time
    const timeMatch = query.match(/(\d{1,2})\s*[hH:]\s*(\d{0,2})/);
    if (timeMatch) {
        params.time = `${timeMatch[1].padStart(2, "0")}:${(timeMatch[2] || "00").padStart(2, "0")}`;
    } else {
        params.time = "20:00";
    }

    // Date
    const dateParts: string[] = [];
    if (/ce soir|tonight|aujourd/i.test(query)) {
        dateParts.push(new Date().toISOString().split("T")[0]);
    } else if (/demain|tomorrow/i.test(query)) {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        dateParts.push(d.toISOString().split("T")[0]);
    }
    params.date = dateParts[0] || new Date().toISOString().split("T")[0];

    // Party size
    const sizeMatch = query.match(/(\d+)\s*(?:personne|people|pers|pax|couvert)/i);
    if (sizeMatch) params.partySize = parseInt(sizeMatch[1], 10);

    return params;
}

export async function POST(request: Request) {
    ensureTools();

    try {
        const body = await request.json();
        const { query, userId } = body as { query: string; userId?: string };

        if (!query?.trim()) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        const { intent, tool } = detectIntent(query);
        const toolDef = actionRegistry.get(tool);

        // Extract params based on intent
        let parameters: Record<string, unknown> = {};
        if (intent === "search_restaurants") {
            parameters = extractRestaurantParams(query);
        } else if (intent === "book_restaurant") {
            parameters = extractBookingParams(query);
        }

        const plan: ActionPlan = {
            id: generatePlanId(),
            intent,
            description: buildDescription(intent, parameters),
            toolName: tool,
            parameters,
            requiresConfirmation: toolDef?.requiresConfirmation ?? true,
            estimatedDuration: toolDef ? "~5 secondes" : undefined,
            risks: intent === "book_restaurant" ? ["Réservation non modifiable sur certaines plateformes"] : undefined,
            undoable: intent === "book_restaurant",
            createdAt: new Date().toISOString(),
        };

        return NextResponse.json({
            plan,
            availableTools: actionRegistry.toManifest(),
            userId: userId || "anonymous",
        });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Plan generation failed" },
            { status: 500 }
        );
    }
}

function buildDescription(intent: string, params: Record<string, unknown>): string {
    switch (intent) {
        case "search_restaurants":
            return `Rechercher des restaurants ${params.cuisine ? `(${params.cuisine})` : ""} ${params.location ? `à ${params.location}` : ""}`.trim();
        case "book_restaurant":
            return `Réserver ${params.restaurantName || "un restaurant"} le ${params.date} à ${params.time} pour ${params.partySize} personne(s)`;
        default:
            return `Traiter la demande`;
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
