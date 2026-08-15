import { NextResponse } from "next/server";
import { generateText } from 'ai';
import { authenticateRequest, enforceRateLimit } from "@/lib/auth-middleware";
import { aiUnavailableResponse } from "@/lib/ai-unavailable";
import { withProviderFailover } from "@/lib/ai-providers";

// ~6 MB of base64 (roughly 4.5 MB decoded) — enough for a photo, bounded against abuse.
const MAX_IMAGE_CHARS = 8_000_000;

export async function POST(request: Request) {
    const limited = await enforceRateLimit(request, { durable: true });
    if (limited) return limited;

    // Vision calls are the most expensive per request in the app. Rate limiting
    // by IP alone is not enough — an anonymous caller can rotate IPs.
    const auth = await authenticateRequest(request);
    if (!auth.success) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        const body = await request.json();
        const { query, imageBase64 } = body as { query: string; imageBase64: string };

        if (typeof imageBase64 !== "string" || !imageBase64) {
            return NextResponse.json({ error: "Image is required" }, { status: 400 });
        }

        if (imageBase64.length > MAX_IMAGE_CHARS) {
            return NextResponse.json({ error: "Image trop volumineuse" }, { status: 400 });
        }

        if (query && (typeof query !== "string" || query.length > 4000)) {
            return NextResponse.json({ error: "Requête invalide ou trop longue" }, { status: 400 });
        }

        console.log("👁️ [JARVIS Vision] Analyzing image...");

        const { result, provider, modelId } = await withProviderFailover(
            "vision",
            (model) =>
                generateText({
                    model,
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: query || "Décris cette image en détail et donne moi des idées d'actions ou d'applications que je peux faire avec." },
                                { type: "image", image: imageBase64 }
                            ]
                        }
                    ],
                    temperature: 0.4,
                })
        );

        return NextResponse.json({
            analysis: result.text,
            message: "🔍 Analyse visuelle terminée",
            meta: { provider, model: modelId },
        });
    } catch (err) {
        // Cas RÉEL en production : StepFun, seul fournisseur configuré, déclare
        // `vision: null`. Sans ce traitement, la route répond 500 alors qu'il
        // manque seulement un modèle capable d'analyser une image.
        const unavailable = aiUnavailableResponse(err);
        if (unavailable) return unavailable;

        console.error("❌ [JARVIS Vision] Error:", err);
        return NextResponse.json(
            { error: err instanceof Error && err.message ? err.message : "Vision analysis failed" },
            { status: 500 }
        );
    }
}
