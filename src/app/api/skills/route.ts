import { NextRequest, NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/firebase";
import { serverDb } from "@/lib/firestore-server";
import { authenticateRequest, enforceRateLimit } from "@/lib/auth-middleware";
import { SkillActionSchema, validateInput } from "@/lib/validation";
import { getSecurityHeaders } from "@/lib/security";

export const dynamic = "force-dynamic";

// ==============================================================================
// SKILLS API — Skill Tracks & Missions (SECURED)
// ==============================================================================

export async function GET(req: NextRequest) {
    try {
        // The caller's identity comes from the verified token and nowhere else.
        // A `?userId=` query param used to be honoured when unauthenticated,
        // which let anyone read anyone else's tracks (IDOR).
        const auth = await authenticateRequest(req);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status, headers: getSecurityHeaders() });
        }
        const targetUserId = auth.user.uid;

        const db = await serverDb();
        const tracksSnap = await db
            .collection(COLLECTIONS.SKILL_TRACKS)
            .where("user_id", "==", targetUserId)
            .get();
        const tracks = tracksSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        let missionsData: Array<Record<string, unknown>> = [];
        if (tracks.length > 0) {
            const trackIds = new Set(tracks.map((t: Record<string, unknown>) => t.id));
            // Scope the read to this user server-side. Fetching the whole
            // collection and filtering in memory leaked other users' missions
            // and grew linearly with total app usage.
            const missionsSnap = await db
                .collection(COLLECTIONS.SKILL_MISSIONS)
                .where("user_id", "==", targetUserId)
                .get();
            missionsData = missionsSnap.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .filter((m: Record<string, unknown>) => trackIds.has(m.skill_track_id));
        }

        return NextResponse.json({ tracks, missions: missionsData, source: "firebase" }, { headers: getSecurityHeaders() });
    } catch (error) {
        console.error("Skills GET Error:", error);
        return NextResponse.json({ error: "Erreur lors de la récupération des skills." }, { status: 500, headers: getSecurityHeaders() });
    }
}

export async function POST(req: NextRequest) {
    const limited = await enforceRateLimit(req);
    if (limited) return limited;

    try {
        const auth = await authenticateRequest(req);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status, headers: getSecurityHeaders() });
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: getSecurityHeaders() });
        }

        const validation = validateInput(SkillActionSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.errors },
                { status: 400, headers: getSecurityHeaders() }
            );
        }

        const data = validation.data;
        const db = await serverDb();

        if (data.action === "create_track") {
            const trackRef = db.collection(COLLECTIONS.SKILL_TRACKS).doc();
            const trackData = {
                id: trackRef.id,
                user_id: auth.user.uid,
                skill_name: data.skill_name,
                current_level: "Novice",
                progress_percentage: 0,
                mastery_criteria: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            await trackRef.set(trackData);

            const initialMissions = [
                {
                    skill_track_id: trackRef.id,
                    mission_title: `Comprendre les bases de ${data.skill_name}`,
                    description: `Lisez un article introductif ou regardez une vidéo sur les concepts fondamentaux de ${data.skill_name}.`,
                    difficulty: "Beginner",
                    xp_reward: 50,
                    is_completed: false,
                    user_id: auth.user.uid,
                    created_at: new Date().toISOString(),
                },
                {
                    skill_track_id: trackRef.id,
                    mission_title: `Premier exercice pratique pour ${data.skill_name}`,
                    description: `Appliquez vos connaissances dans un scénario pratique.`,
                    difficulty: "Beginner",
                    xp_reward: 100,
                    is_completed: false,
                    user_id: auth.user.uid,
                    created_at: new Date().toISOString(),
                },
            ];

            for (const mission of initialMissions) {
                await db.collection(COLLECTIONS.SKILL_MISSIONS).doc().set(mission);
            }

            return NextResponse.json(
                { track: { ...trackData, id: trackRef.id }, message: "Track créé avec missions initiales" },
                { status: 201, headers: getSecurityHeaders() }
            );
        }

        if (data.action === "update_mission") {
            const missionRef = db.collection(COLLECTIONS.SKILL_MISSIONS).doc(data.mission_id);

            // Verify ownership BEFORE writing. Previously any authenticated
            // user could flip any mission by guessing its id (IDOR on write).
            const existingSnap = await missionRef.get();
            if (!existingSnap.exists) {
                return NextResponse.json({ error: "Mission introuvable" }, { status: 404, headers: getSecurityHeaders() });
            }
            if (existingSnap.data()?.user_id !== auth.user.uid) {
                return NextResponse.json({ error: "Accès refusé" }, { status: 403, headers: getSecurityHeaders() });
            }

            await missionRef.set({ is_completed: data.is_completed }, { merge: true });

            if (data.is_completed) {
                const mission = existingSnap.data();

                if (mission?.skill_track_id) {
                    const trackRef = db.collection(COLLECTIONS.SKILL_TRACKS).doc(mission.skill_track_id);
                    const trackSnap = await trackRef.get();
                    const track = trackSnap.data();

                    // Defence in depth: the track must belong to the caller too.
                    if (track && track.user_id === auth.user.uid) {
                        let newProgress = (track.progress_percentage || 0) + ((mission.xp_reward || 0) / 10);
                        let newLevel = track.current_level || "Novice";

                        if (newProgress >= 100) {
                            newProgress = 0;
                            const levels = ["Novice", "Apprentice", "Practitioner", "Expert", "Master"];
                            const currentIndex = levels.indexOf(newLevel);
                            if (currentIndex < levels.length - 1) {
                                newLevel = levels[currentIndex + 1];
                            }
                        }

                        await trackRef.set({
                            progress_percentage: newProgress,
                            current_level: newLevel,
                            updated_at: new Date().toISOString(),
                        }, { merge: true });

                        return NextResponse.json({ message: "Mission complétée", newProgress, newLevel }, { headers: getSecurityHeaders() });
                    }
                }
            }

            return NextResponse.json({ message: "Mission mise à jour" }, { headers: getSecurityHeaders() });
        }

        return NextResponse.json({ error: "Action invalide" }, { status: 400, headers: getSecurityHeaders() });
    } catch (error) {
        console.error("Skills POST Error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500, headers: getSecurityHeaders() });
    }
}
