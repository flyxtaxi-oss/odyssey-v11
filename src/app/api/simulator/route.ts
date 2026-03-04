import { NextResponse } from "next/server";

// ==============================================================================
// SIMULATOR API — Save/Load Simulations
// ==============================================================================

// Mock saved simulations
const MOCK_SIMULATIONS = [
    {
        id: "sim-1",
        destination: "Portugal",
        score: 84,
        visa: "NHR / D7",
        salary: 3200,
        tax_rate: 20,
        cost_of_living: 1100,
        climate: "☀️ Sommeil",
        savings: 1460,
        created_at: "2026-02-28",
    },
    {
        id: "sim-2",
        destination: "Dubaï",
        score: 78,
        visa: "Freelance",
        salary: 5000,
        tax_rate: 0,
        cost_of_living: 2800,
        climate: "🔥 Chaud",
        savings: 2200,
        created_at: "2026-02-25",
    },
];

export async function GET() {
    return NextResponse.json({
        simulations: MOCK_SIMULATIONS,
        total: MOCK_SIMULATIONS.length,
        source: "mock",
    });
}

export async function POST(req: Request) {
    try {
        const data = await req.json();

        const simulation = {
            id: `sim-${Date.now()}`,
            ...data,
            created_at: new Date().toISOString().split("T")[0],
        };

        return NextResponse.json({
            simulation,
            status: "saved",
        });
    } catch {
        return NextResponse.json(
            { error: "Erreur lors de la sauvegarde." },
            { status: 500 }
        );
    }
}
