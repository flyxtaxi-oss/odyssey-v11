import { NextRequest, NextResponse } from "next/server";
import { collection, doc, setDoc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import { authenticateRequest, optionalAuth } from "@/lib/auth-middleware";
import { SkillActionSchema, validateInput } from "@/lib/validation";
import { getSecurityHeaders } from "@/lib/security";

export const dynamic = "force-dynamic";

// ==============================================================================
// SKILLS API — Skill Tracks & Missions (SECURED)
// ==============================================================================

export async function GET(req: NextRequest) {
    try {
        const user = await optionalAuth(req);
        const { searchParams } = new URL(req.url);
        const paramUserId = searchParams.get("userId");
        const targetUserId = user?.uid || paramUserId;

        if (!targetUserId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400, headers: getSecurityHeaders() });
        }

        const tracksQuery = query(
            collection(db, COLLECTIONS.SKILL_TRACKS),
            where("user_id", "==", targetUserId)
        );
        const tracksSnap = await getDocs(tracksQuery);
        const tracks = tracksSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        let missionsData: Array<Record<string, unknown>> = [];
        if (tracks.length > 0) {
            const trackIds = tracks.map((t: Record<string, unknown>) => t.id);
            const missionsSnap = await getDocs(collection(db, COLLECTIONS.SKILL_MISSIONS));
            missionsData = missionsSnap.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .filter((m: Record<string, unknown>) => trackIds.includes(m.skill_track_id));
        }

        return NextResponse.json({ tracks, missions: missionsData, source: "firebase" }, { headers: getSecurityHeaders() });
    } catch (error) {
        console.error("Skills GET Error:", error);
        return NextResponse.json({ error: "Erreur lors de la récupération des skills." }, { status: 500, headers: getSecurityHeaders() });
    }
}

export async function POST(req: NextRequest) {
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

        if (data.action === "create_track") {
            const trackRef = doc(collection(db, COLLECTIONS.SKILL_TRACKS));
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

            await setDoc(trackRef, trackData);

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
                const missionRef = doc(collection(db, COLLECTIONS.SKILL_MISSIONS));
                await setDoc(missionRef, mission);
            }

            return NextResponse.json(
                { track: { ...trackData, id: trackRef.id }, message: "Track créé avec missions initiales" },
                { status: 201, headers: getSecurityHeaders() }
            );
        }

        if (data.action === "update_mission") {
            const missionRef = doc(db, COLLECTIONS.SKILL_MISSIONS, data.mission_id);
            await setDoc(missionRef, { is_completed: data.is_completed }, { merge: true });

            if (data.is_completed) {
                const missionSnap = await getDoc(missionRef);
                const mission = missionSnap.data();

                if (mission?.skill_track_id) {
                    const trackRef = doc(db, COLLECTIONS.SKILL_TRACKS, mission.skill_track_id);
                    const trackSnap = await getDoc(trackRef);
                    const track = trackSnap.data();

                    if (track) {
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

                        await setDoc(trackRef, {
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
