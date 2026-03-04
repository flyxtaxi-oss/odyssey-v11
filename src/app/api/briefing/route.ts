import { NextResponse } from "next/server";

export async function GET() {
    try {
        // TODO: Récupérer depuis Supabase
        // - Le checkin d'aujourd'hui
        // - Les priorités du knowledge graph
        // - L'emploi du temps via l'API Connector Google Calendar

        // Mock data
        const briefing = {
            greeting: "Bonjour Jibril,",
            intro: "Ton niveau d'énergie est au top aujourd'hui (5/5). C'est le moment idéal pour avancer sur ton projet structurant.",
            priority: "Ta priorité numéro 1 : 'Finir le module Action Engine'.",
            weather: "Ciel dégagé, 18°C à Lisbonne.",
            schedule: [
                { time: "10:00", title: "Daily standup", type: "meeting" },
                { time: "11:30", title: "Deep work: API Routes", type: "focus" },
                { time: "15:00", title: "Review PR", type: "task" }
            ],
            advice: "N'oublie pas de prendre une pause à 13h vu ton emploi du temps chargé ce matin.",
            generatedAt: new Date().toISOString()
        };

        return NextResponse.json({ briefing });
    } catch (error) {
        return NextResponse.json(
            { error: "Impossible de générer le briefing" },
            { status: 500 }
        );
    }
}
