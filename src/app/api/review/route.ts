import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import { authenticateRequest } from "@/lib/auth-middleware";
import { getSecurityHeaders } from "@/lib/security";

// ==============================================================================
// REVIEW API — Weekly Review from Real Firebase Data (SECURED)
// ==============================================================================

export async function GET(req: NextRequest) {
    try {
        const auth = await authenticateRequest(req);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status, headers: getSecurityHeaders() });
        }

        const userId = auth.user.uid;
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekLabel = `S${getWeekNumber(now)} (${formatDate(weekAgo)} - ${formatDate(now)})`;

        // 1. Fetch this week's checkins
        let checkins: Array<Record<string, unknown>> = [];
        try {
            const checkinQuery = query(
                collection(db, COLLECTIONS.CHECKINS),
                where("user_id", "==", userId),
                where("created_at", ">=", weekAgo.toISOString()),
                orderBy("created_at", "desc"),
                limit(7)
            );
            const snap = await getDocs(checkinQuery);
            checkins = snap.docs.map(d => d.data());
        } catch { /* ignore */ }

        const avgMood = checkins.length > 0
            ? Math.round(checkins.reduce((s, c) => s + ((c.mood_score as number) || 0), 0) / checkins.length * 10) / 10
            : 0;
        const avgEnergy = checkins.length > 0
            ? Math.round(checkins.reduce((s, c) => s + ((c.energy_level as number) || 0), 0) / checkins.length * 10) / 10
            : 0;

        // 2. Fetch completed missions this week
        const accomplishments: string[] = [];
        let actionsCompleted = 0;
        try {
            const missionsQuery = query(
                collection(db, COLLECTIONS.SKILL_MISSIONS),
                where("user_id", "==", userId),
                where("is_completed", "==", true)
            );
            const missionsSnap = await getDocs(missionsQuery);
            const recentMissions = missionsSnap.docs
                .map(d => d.data())
                .filter(m => {
                    const updated = m.updated_at as string;
                    return updated && new Date(updated) >= weekAgo;
                });
            actionsCompleted = recentMissions.length;
            for (const m of recentMissions.slice(0, 5)) {
                accomplishments.push(`Mission accomplie : ${m.mission_title || "Sans titre"}`);
            }
        } catch { /* ignore */ }

        // 3. Fetch skills progress
        try {
            const tracksQuery = query(
                collection(db, COLLECTIONS.SKILL_TRACKS),
                where("user_id", "==", userId)
            );
            const tracksSnap = await getDocs(tracksQuery);
            const tracks = tracksSnap.docs.map(d => d.data());
            for (const t of tracks) {
                if ((t.progress_percentage || 0) > 50) {
                    accomplishments.push(`${t.skill_name} à ${Math.round(t.progress_percentage || 0)}% (${t.current_level})`);
                }
            }
        } catch { /* ignore */ }

        // 4. Identify challenges (low mood/energy days)
        const challenges: string[] = [];
        for (const c of checkins) {
            if ((c.mood_score as number) <= 2 || (c.energy_level as number) <= 2) {
                const date = (c.date as string) || "Jour inconnu";
                challenges.push(`${date} : mood ${c.mood_score}/5, énergie ${c.energy_level}/5${c.notes ? ` — ${c.notes}` : ""}`);
            }
        }

        // 5. Generate feedback based on data
        const jarvisFeedback = generateFeedback(avgMood, avgEnergy, actionsCompleted, checkins.length);

        // 6. Determine focus for next week
        const focusNextWeek = accomplishments.length > 0
            ? "Continuer sur la lancée des missions en cours"
            : "Reprendre les check-ins quotidiens et définir des priorités";

        const review = {
            week: weekLabel,
            stats: {
                avgMood,
                avgEnergy,
                checkinsDone: checkins.length,
                actionsCompleted,
            },
            accomplishments: accomplishments.length > 0 ? accomplishments : ["Aucune activité enregistrée cette semaine"],
            challenges: challenges.length > 0 ? challenges : ["Aucun point de vigilance"],
            jarvisFeedback,
            focusNextWeek,
            generatedAt: new Date().toISOString(),
        };

        return NextResponse.json({ review }, { headers: getSecurityHeaders() });
    } catch (error) {
        console.error("Review API Error:", error);
        return NextResponse.json(
            { error: "Impossible de générer la weekly review" },
            { status: 500, headers: getSecurityHeaders() }
        );
    }
}

function generateFeedback(mood: number, energy: number, actions: number, checkins: number): string {
    if (checkins === 0) return "Pas assez de données cette semaine. Fais tes check-ins quotidiens pour un suivi personnalisé.";

    const parts: string[] = [];

    if (mood >= 4) parts.push("Excellente semaine côté mood");
    else if (mood >= 3) parts.push("Mood correct cette semaine");
    else if (mood > 0) parts.push("Le mood était un peu bas cette semaine");

    if (energy >= 4) parts.push("énergie au top");
    else if (energy >= 3) parts.push("énergie stable");
    else if (energy > 0) parts.push("énergie à surveiller");

    if (actions >= 5) parts.push(`${actions} actions complétées, excellent rythme`);
    else if (actions >= 2) parts.push(`${actions} actions complétées`);
    else if (actions > 0) parts.push("seulement quelques actions complétées");

    return parts.join(". ") + ".";
}

function getWeekNumber(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
}

function formatDate(date: Date): string {
    return `${date.getDate()} ${["Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"][date.getMonth()]}`;
}
