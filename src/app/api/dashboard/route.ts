import { NextResponse } from "next/server";

// ==============================================================================
// DASHBOARD API — Aggregate Stats
// ==============================================================================

export async function GET() {
    // Mock aggregated stats (replace with Supabase queries when configured)
    const stats = {
        odyssey_score: 742,
        odyssey_trend: "+12",
        mental_clarity: 82,
        clarity_status: "synced",
        countries_simulated: 7,
        countries_status: "en cache",
        network_nodes: 14,
        network_status: "actifs",
        modules: [
            {
                id: "jarvis",
                name: "J.A.R.V.I.S.",
                description: "Intelligence personnelle core",
                status: "SYS ACTIVE",
                gradient: "linear-gradient(135deg, #2563EB, #7C3AED)",
                href: "/jarvis",
            },
            {
                id: "simulator",
                name: "Simulateur de Vie",
                description: "Moteur prédictif multipays",
                status: "6 PAYS",
                gradient: "linear-gradient(135deg, #059669, #10B981)",
                href: "/simulator",
            },
            {
                id: "safezone",
                name: "Safe-Zone",
                description: "Réseau crypté modéré IA",
                status: "156 NODES",
                gradient: "linear-gradient(135deg, #F43F5E, #F97316)",
                href: "/safezone",
            },
        ],
        activity: {
            conversations_today: 3,
            posts_this_week: 5,
            simulations_run: 12,
            badges_earned: 4,
        },
        source: "mock",
    };

    return NextResponse.json(stats);
}
