import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/firestore-server";
import { optionalAuth, enforceRateLimit } from "@/lib/auth-middleware";
import { getSecurityHeaders } from "@/lib/security";

// ==============================================================================
// DASHBOARD API — Aggregate Stats from Firebase (SECURED)
// ==============================================================================

export async function GET(req: NextRequest) {
    // Each call fans out to several Firestore reads, which are billed.
    const limited = await enforceRateLimit(req);
    if (limited) return limited;

    try {
        const user = await optionalAuth(req);

        let odyssey_score = 500;
        let mental_clarity = 50;
        let countries_simulated = 0;
        let network_nodes = 0;

        if (user) {
            try {
                const db = await serverDb();
                const profileSnap = await db.collection("profiles").doc(user.uid).get();

                if (profileSnap.exists) {
                    const profile = profileSnap.data() ?? {};
                    odyssey_score = profile.odyssey_score || 500;
                    mental_clarity = profile.mental_clarity || 50;
                    countries_simulated = profile.countries_simulated || 0;
                    network_nodes = profile.network_nodes || 0;
                }
            } catch (profileError) {
                console.error("Profile fetch error:", profileError);
            }
        }

        let simulations_run = 0;
        if (user) {
            try {
                const db = await serverDb();
                const simsSnap = await db
                    .collection("simulations")
                    .where("user_id", "==", user.uid)
                    .get();
                simulations_run = simsSnap.size;
            } catch { /* ignore */ }
        }

        // Only for signed-in users. This sat outside the `if (user)` block, so
        // every anonymous hit on /api/dashboard read 100 Firestore documents —
        // billed per read, on a route with no rate limit. A loop on it was an
        // unbounded bill, not even an attack.
        let posts_this_week = 0;
        if (user) try {
            const db = await serverDb();
            const postsSnap = await db
                .collection("posts")
                .orderBy("created_at", "desc")
                .limit(100)
                .get();
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            posts_this_week = postsSnap.docs.filter(
                d => d.data().created_at && new Date(d.data().created_at) > weekAgo
            ).length;
        } catch { /* ignore */ }

        const stats = {
            odyssey_score,
            odyssey_trend: "+12",
            mental_clarity,
            clarity_status: user ? "synced" : "guest",
            countries_simulated,
            countries_status: user ? "enregistré" : "visiteur",
            network_nodes,
            network_status: "actifs",
            activity: {
                conversations_today: 0,
                posts_this_week,
                simulations_run,
                badges_earned: 0,
            },
            source: user ? "firebase" : "static",
            user: user ? { uid: user.uid, email: user.email } : null,
        };

        return NextResponse.json(stats, { headers: getSecurityHeaders() });
    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json(
            {
                odyssey_score: 500, odyssey_trend: "+0", mental_clarity: 50,
                clarity_status: "error", countries_simulated: 0, countries_status: "error",
                network_nodes: 0, network_status: "offline",
                activity: { conversations_today: 0, posts_this_week: 0, simulations_run: 0, badges_earned: 0 },
                source: "error",
            },
            { status: 500, headers: getSecurityHeaders() }
        );
    }
}
