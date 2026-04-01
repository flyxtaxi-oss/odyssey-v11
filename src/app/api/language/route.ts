import { NextRequest, NextResponse } from "next/server";
import { collection, doc, setDoc, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import { authenticateRequest } from "@/lib/auth-middleware";
import { getSecurityHeaders } from "@/lib/security";

// ==============================================================================
// LANGUAGE API — Language Learning System (SECURED)
// ==============================================================================

export async function GET(req: NextRequest) {
    try {
        const auth = await authenticateRequest(req);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status, headers: getSecurityHeaders() });
        }

        const profilesQuery = query(
            collection(db, COLLECTIONS.LANGUAGE_PROFILES),
            where("user_id", "==", auth.user.uid)
        );
        const profilesSnap = await getDocs(profilesQuery);
        const profiles = profilesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const progressData: Array<Record<string, unknown>> = [];
        for (const profile of profiles) {
            const progressQuery = query(
                collection(db, COLLECTIONS.LANGUAGE_PROGRESS),
                where("user_id", "==", auth.user.uid),
                where("language", "==", (profile as Record<string, unknown>).target_language),
                orderBy("next_review_at", "asc")
            );
            const progressSnap = await getDocs(progressQuery);
            progressData.push(...progressSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }

        return NextResponse.json({ profiles, progress: progressData }, { headers: getSecurityHeaders() });
    } catch (error) {
        console.error("Language GET Error:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des données linguistiques." },
            { status: 500, headers: getSecurityHeaders() }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await authenticateRequest(req);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status, headers: getSecurityHeaders() });
        }

        const { action, payload } = await req.json();

        switch (action) {
            case "placement_test":
                return NextResponse.json({
                    test: [
                        { question: "Choose the correct translation for 'Apple'", options: ["Pomme", "Poire", "Banane", "Orange"], answer: "Pomme" },
                        { question: "How do you say 'Hello'?", options: ["Bonjour", "Au revoir", "Merci", "S'il vous plaît"], answer: "Bonjour" },
                        { question: "What is 'Bread' in French?", options: ["Lait", "Pain", "Eau", "Vin"], answer: "Pain" },
                        { question: "Translate: 'Thank you'", options: ["Bonjour", "Merci", "Pardon", "Salut"], answer: "Merci" },
                        { question: "What does 'Au revoir' mean?", options: ["Hello", "Goodbye", "Please", "Sorry"], answer: "Goodbye" },
                    ],
                    language: payload?.target_language || "fr",
                    estimatedTime: "5 minutes",
                }, { headers: getSecurityHeaders() });

            case "generate_lesson":
                return NextResponse.json({
                    lesson: {
                        title: "Shopping for Groceries",
                        vocabulary: ["Apple - Pomme", "Bread - Pain", "Milk - Lait", "Checkout - Caisse", "Receipt - Reçu"],
                        scenario: "You are at a local market buying ingredients for dinner.",
                        difficulty: "Beginner",
                        xpReward: 100,
                    },
                    language: payload?.target_language || "fr",
                }, { headers: getSecurityHeaders() });

            case "srs_review": {
                const today = new Date().toISOString();
                const reviewQuery = query(
                    collection(db, COLLECTIONS.LANGUAGE_PROGRESS),
                    where("user_id", "==", auth.user.uid),
                    where("next_review_at", "<=", today),
                    orderBy("next_review_at", "asc"),
                    limit(20)
                );
                const reviewSnap = await getDocs(reviewQuery);
                const cardsDue = reviewSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

                return NextResponse.json({ success: true, xp_earned: 50, cards_due: cardsDue.length, cards: cardsDue }, { headers: getSecurityHeaders() });
            }

            case "complete_review": {
                const { card_id, quality, current_level } = payload;
                const cardRef = doc(db, COLLECTIONS.LANGUAGE_PROGRESS, card_id);
                const baseInterval = 1;
                const multiplier = quality >= 4 ? 2.5 : quality >= 3 ? 1.5 : 0.5;
                const nextReview = new Date();
                nextReview.setDate(nextReview.getDate() + Math.floor(baseInterval * multiplier));

                await setDoc(cardRef, {
                    next_review_at: nextReview.toISOString(),
                    mastery_level: Math.min(5, (current_level || 0) + (quality >= 3 ? 1 : -1)),
                    updated_at: new Date().toISOString(),
                }, { merge: true });

                return NextResponse.json(
                    { success: true, next_review: nextReview.toISOString(), xp_earned: quality >= 3 ? 25 : 10 },
                    { headers: getSecurityHeaders() }
                );
            }

            case "roleplay_message":
                return NextResponse.json({
                    reply: "Oh, that sounds interesting! What specifically about frontend development do you enjoy the most?",
                    feedback: "Great sentence structure. Try using more varied vocabulary.",
                    corrections: [],
                }, { headers: getSecurityHeaders() });

            case "create_profile": {
                const profileRef = doc(collection(db, COLLECTIONS.LANGUAGE_PROFILES));
                const profileData = {
                    id: profileRef.id,
                    user_id: auth.user.uid,
                    target_language: payload?.target_language || "en",
                    native_language: payload?.native_language || "fr",
                    current_level: "A1",
                    streak_days: 0,
                    xp_points: 0,
                    created_at: new Date().toISOString(),
                };
                await setDoc(profileRef, profileData);

                return NextResponse.json({ success: true, profile: profileData }, { status: 201, headers: getSecurityHeaders() });
            }

            default:
                return NextResponse.json({ error: "Action inconnue" }, { status: 400, headers: getSecurityHeaders() });
        }
    } catch (error) {
        console.error("Language API Error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500, headers: getSecurityHeaders() });
    }
}
