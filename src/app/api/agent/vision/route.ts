import { NextResponse } from "next/server";
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { enforceRateLimit } from "@/lib/auth-middleware";

// ~6 MB of base64 (roughly 4.5 MB decoded) — enough for a photo, bounded against abuse.
const MAX_IMAGE_CHARS = 8_000_000;

export async function POST(request: Request) {
    const limited = await enforceRateLimit(request);
    if (limited) return limited;

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

        const result = await generateText({
            model: google('gemini-1.5-pro-latest'),
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
        });

        return NextResponse.json({
            analysis: result.text,
            message: "🔍 Analyse visuelle terminée"
        });
    } catch (err) {
        console.error("❌ [JARVIS Vision] Error:", err);
        return NextResponse.json(
            { error: err instanceof Error && err.message ? err.message : "Vision analysis failed" },
            { status: 500 }
        );
    }
}
