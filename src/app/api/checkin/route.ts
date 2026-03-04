import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for checkin
const checkinSchema = z.object({
    moodScore: z.number().min(1).max(5),
    energyLevel: z.number().min(1).max(5),
    topPriority: z.string().min(2),
    notes: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validation
        const data = checkinSchema.parse(body);

        // TODO: Enregistrer dans Supabase la table `checkins`
        /*
        const supabase = createClient();
        await supabase.from("checkins").insert({
            user_id: user.id,
            mood_score: data.moodScore,
            energy_level: data.energyLevel,
            top_priority: data.topPriority,
            notes: data.notes
        });
        */

        // Réponse simulée pour le moment
        return NextResponse.json({
            success: true,
            checkin: {
                ...data,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString()
            },
            message: "Ton point quotidien est enregistré. JARVIS va te préparer un briefing."
        });

    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Invalid check-in data" },
            { status: 400 }
        );
    }
}
