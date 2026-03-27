import { NextResponse } from "next/server";
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query, imageBase64 } = body as { query: string; imageBase64: string };

        if (!imageBase64) {
            return NextResponse.json({ error: "Image is required" }, { status: 400 });
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
    } catch (err: any) {
        console.error("❌ [JARVIS Vision] Error:", err);
        return NextResponse.json(
            { error: err.message || "Vision analysis failed" },
            { status: 500 }
        );
    }
}
