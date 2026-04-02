import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import { authenticateRequest } from "@/lib/auth-middleware";
import { getSecurityHeaders } from "@/lib/security";

// ==============================================================================
// BRIEFING API — Daily Briefing from Real Firebase Data (SECURED)
// ==============================================================================

export async function GET(req: NextRequest) {
    try {
        const auth = await authenticateRequest(req);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status, headers: getSecurityHeaders() });
        }

        const userId = auth.user.uid;
        const today = new Date().toISOString().split("T")[0];

        // 1. Fetch latest checkin
        let latestCheckin = null;
        try {
            const checkinQuery = query(
                collection(db, COLLECTIONS.CHECKINS),
                where("user_id", "==", userId),
                orderBy("created_at", "desc"),
                limit(1)
            );
            const checkinSnap = await getDocs(checkinQuery);
            if (!checkinSnap.empty) {
                latestCheckin = checkinSnap.docs[0].data();
            }
        } catch { /* ignore */ }

        // 2. Fetch user profile for name
        let userName = "Explorer";
        try {
            const profileRef = doc(db, COLLECTIONS.PROFILES, userId);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
                const profile = profileSnap.data();
                userName = profile.full_name || profile.email?.split("@")[0] || "Explorer";
            }
        } catch { /* ignore */ }

        // 3. Fetch active skills for priorities
        const priorities: string[] = [];
        try {
            const tracksQuery = query(
                collection(db, COLLECTIONS.SKILL_TRACKS),
                where("user_id", "==", userId)
            );
            const tracksSnap = await getDocs(tracksQuery);
            const activeTracks = tracksSnap.docs
                .map(d => d.data())
                .filter(t => (t.progress_percentage || 0) < 100)
                .sort((a, b) => (b.progress_percentage || 0) - (a.progress_percentage || 0))
                .slice(0, 3);

            for (const track of activeTracks) {
                priorities.push(`${track.skill_name} (${track.current_level} - ${Math.round(track.progress_percentage || 0)}%)`);
            }
        } catch { /* ignore */ }

        // 4. Fetch today's schedule from checkins (as events)
        const schedule: Array<{ time: string; title: string; type: string }> = [];
        try {
            const todayCheckinsQuery = query(
                collection(db, COLLECTIONS.CHECKINS),
                where("user_id", "==", userId),
                where("date", "==", today)
            );
            const todaySnap = await getDocs(todayCheckinsQuery);
            for (const d of todaySnap.docs) {
                const data = d.data();
                if (data.top_priority) {
                    schedule.push({ time: "09:00", title: data.top_priority, type: "focus" });
                }
            }
        } catch { /* ignore */ }

        // 5. Build briefing from real data
        const mood = latestCheckin?.mood_score || 3;
        const energy = latestCheckin?.energy_level || 3;
        const moodLabels = ["", "bas", "moyen", "correct", "bon", "excellent"];
        const energyLabels = ["", "faible", "modéré", "correct", "bon", "au top"];

        const greeting = `Bonjour ${userName},`;
        const intro = latestCheckin
            ? `Ton niveau d'énergie est ${energyLabels[energy] || "correct"} (${energy}/5) et ton mood est ${moodLabels[mood] || "correct"} (${mood}/5).`
            : "Pas de check-in récent. Fais un point pour que je puisse mieux t'accompagner.";

        const priority = priorities.length > 0
            ? `Tes priorités actives : ${priorities.join(", ")}.`
            : "Aucune priorité active. Crée un skill track pour commencer.";

        const advice = energy <= 2
            ? "Ton énergie est basse aujourd'hui. Privilégie les tâches simples et prends des pauses."
            : energy >= 4
                ? "Énergie au top ! C'est le moment d'attaquer les tâches les plus exigeantes."
                : "Énergie correcte. Alterne entre travail focalisé et tâches administratives.";

        const briefing = {
            greeting,
            intro,
            priority,
            weather: null,
            schedule,
            advice,
            checkin: latestCheckin ? {
                mood: latestCheckin.mood_score,
                energy: latestCheckin.energy_level,
                focus: latestCheckin.focus_level,
                notes: latestCheckin.notes,
                date: latestCheckin.date,
            } : null,
            stats: {
                activePriorities: priorities.length,
                lastCheckin: latestCheckin?.date || null,
            },
            generatedAt: new Date().toISOString(),
        };

        return NextResponse.json({ briefing }, { headers: getSecurityHeaders() });
    } catch (error) {
        console.error("Briefing API Error:", error);
        return NextResponse.json(
            { error: "Impossible de générer le briefing" },
            { status: 500, headers: getSecurityHeaders() }
        );
    }
}
