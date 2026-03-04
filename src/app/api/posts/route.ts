import { NextResponse } from "next/server";

// ==============================================================================
// POSTS API — CRUD + AI Moderation (Safe-Zone)
// ==============================================================================

// Mock posts data (replaced with Supabase when configured)
const MOCK_POSTS = [
    {
        id: "1",
        author: { name: "Sarah K.", badge: "Expert Fiscalité", avatar: "SK" },
        content:
            "Après 2 ans à Dubaï, voici mon retour honnête : les économies d'impôts sont réelles mais le coût de vie est sous-estimé. Comptez 3500€/mois minimum pour un train de vie correct. AMA.",
        likes: 47,
        comments: 12,
        verified: true,
        toxicity_score: 0.02,
        time: "Il y a 2h",
    },
    {
        id: "2",
        author: { name: "Marc D.", badge: "Nomade Digital", avatar: "MD" },
        content:
            "Portugal NHR terminé mais le nouveau régime IFICI reste intéressant pour les profils tech. Taux effectif ~20% vs 45% en France. Thread détaillé à venir.",
        likes: 83,
        comments: 24,
        verified: true,
        toxicity_score: 0.01,
        time: "Il y a 5h",
    },
    {
        id: "3",
        author: { name: "Leila B.", badge: "Coach Certifiée", avatar: "LB" },
        content:
            "Arrêtez de chercher le pays parfait. Le meilleur pays c'est celui qui correspond à VOS priorités. Fiscalité, climat, réseau — classez-les et décidez. Simple.",
        likes: 156,
        comments: 31,
        verified: true,
        toxicity_score: 0.03,
        time: "Il y a 1j",
    },
    {
        id: "4",
        author: { name: "Thomas R.", badge: "Entrepreneur", avatar: "TR" },
        content:
            "Retour d'expérience Estonie e-Residency : parfait pour la structure juridique, mais ouvrir un compte bancaire reste un parcours du combattant. Wise + Revolut Business = solution.",
        likes: 62,
        comments: 18,
        verified: true,
        toxicity_score: 0.01,
        time: "Il y a 2j",
    },
];

export async function GET() {
    // Return mock posts (replace with Supabase query when configured)
    return NextResponse.json({
        posts: MOCK_POSTS,
        total: MOCK_POSTS.length,
        source: "mock", // Will be "supabase" when live
    });
}

export async function POST(req: Request) {
    try {
        const { content } = await req.json();

        if (!content || content.trim().length < 10) {
            return NextResponse.json(
                { error: "Le contenu doit faire au moins 10 caractères." },
                { status: 400 }
            );
        }

        // AI Moderation (mock — replace with real AI when API key is set)
        const toxicity_score = Math.random() * 0.1; // Low score = safe
        const is_verified = toxicity_score < 0.5;

        const newPost = {
            id: Date.now().toString(),
            author: { name: "Vous", badge: "Membre", avatar: "V" },
            content: content.trim(),
            likes: 0,
            comments: 0,
            verified: is_verified,
            toxicity_score,
            time: "À l'instant",
        };

        return NextResponse.json({
            post: newPost,
            moderation: {
                toxicity_score,
                is_verified,
                reason: is_verified
                    ? "Contenu vérifié par l'IA"
                    : "Contenu flaggé pour review",
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Erreur lors de la création du post." },
            { status: 500 }
        );
    }
}
