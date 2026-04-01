import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { optionalAuth } from "@/lib/auth-middleware";
import { getSecurityHeaders } from "@/lib/security";

// ==============================================================================
// DASHBOARD API — Aggregate Stats from Firebase (SECURED)
// ==============================================================================

export async function GET(req: NextRequest) {
    try {
        const user = await optionalAuth(req);

        let odyssey_score = 500;
        let mental_clarity = 50;
        let countries_simulated = 0;
        let network_nodes = 0;

        if (user) {
            try {
                const profileRef = doc(db, "profiles", user.uid);
                const profileSnap = await getDoc(profileRef);

                if (profileSnap.exists()) {
                    const profile = profileSnap.data();
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
                const simsQuery = query(
                    collection(db, "simulations"),
                    where("user_id", "==", user.uid)
                );
                const simsSnap = await getDocs(simsQuery);
                simulations_run = simsSnap.size;
            } catch { /* ignore */ }
        }

        let posts_this_week = 0;
        try {
            const postsQuery = query(
                collection(db, "posts"),
                orderBy("created_at", "desc"),
                limit(100)
            );
            const postsSnap = await getDocs(postsQuery);
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
