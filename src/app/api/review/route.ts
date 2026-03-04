import { NextResponse } from "next/server";

export async function GET() {
    try {
        // TODO: Analyse des données Supabase
        // - Checkins de la semaine (moyenne mood/energy)
        // - Tâches accomplies vs Priorités (depuis Action Engine)
        // - Génération LLM du feedback

        const review = {
            week: "S12 (18 Mars - 24 Mars)",
            stats: {
                avgMood: 4.2,
                avgEnergy: 3.8,
                checkinsDone: 5,
                actionsCompleted: 14
            },
            accomplishments: [
                "Lancement de l'Action Engine (Itération 1)",
                "3 sessions de sport validées",
                "Réservation restaurant pour vendredi soir"
            ],
            challenges: [
                "Niveau d'énergie bas le mardi (2/5) suite au manque de sommeil"
            ],
            jarvisFeedback: "Excellente semaine Jibril. Tu as maintenu un bon mood malgré une grosse charge de travail. Pour la semaine prochaine, je te conseille de bloquer 8h de sommeil le lundi soir.",
            focusNextWeek: "Itération 4 : Language Lab",
            generatedAt: new Date().toISOString()
        };

        return NextResponse.json({ review });
    } catch (error) {
        return NextResponse.json(
            { error: "Impossible de générer la weekly review" },
            { status: 500 }
        );
    }
}
