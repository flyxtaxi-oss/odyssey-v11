import { NextRequest, NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/firebase";
import { serverDb } from "@/lib/firestore-server";
import { authenticateRequest, enforceRateLimit } from "@/lib/auth-middleware";
import { DailyCheckinSchema, validateInput } from "@/lib/validation";
import { getSecurityHeaders } from "@/lib/security";

// ==============================================================================
// CHECKIN API — Daily Check-ins (SECURED)
// ==============================================================================

export async function GET(req: NextRequest) {
    try {
        const auth = await authenticateRequest(req);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status, headers: getSecurityHeaders() });
        }

        const db = await serverDb();
        const snapshot = await db
            .collection(COLLECTIONS.CHECKINS)
            .where("user_id", "==", auth.user.uid)
            .orderBy("created_at", "desc")
            .limit(7)
            .get();
        const checkins = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        return NextResponse.json({ checkins, total: snapshot.size }, { headers: getSecurityHeaders() });
    } catch (error) {
        console.error("Checkin GET Error:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des check-ins." },
            { status: 500, headers: getSecurityHeaders() }
        );
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

        const validation = validateInput(DailyCheckinSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Données invalides", details: validation.errors },
                { status: 400, headers: getSecurityHeaders() }
            );
        }

        const data = validation.data;
        const db = await serverDb();
        const checkinRef = db.collection(COLLECTIONS.CHECKINS).doc();
        const checkin = {
            id: checkinRef.id,
            user_id: auth.user.uid,
            mood_score: data.mood,
            energy_level: data.energy,
            focus_level: data.focus,
            notes: data.notes || null,
            created_at: new Date().toISOString(),
            date: new Date().toISOString().split("T")[0],
        };

        await checkinRef.set(checkin);

        return NextResponse.json(
            { success: true, checkin, message: "Check-in enregistré. JARVIS prépare votre briefing." },
            { status: 201, headers: getSecurityHeaders() }
        );
    } catch (error) {
        console.error("Checkin POST Error:", error);
        return NextResponse.json(
            { error: "Erreur lors de l'enregistrement du check-in." },
            { status: 500, headers: getSecurityHeaders() }
        );
    }
}
