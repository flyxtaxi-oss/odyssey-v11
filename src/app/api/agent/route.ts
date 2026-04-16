import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { executeTool } from "@/lib/action-engine";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        console.log(`🧠 [JARVIS Agent] Analyse de la requête: "${prompt}"`);

        // Prompt système forçant l'IA à agir comme un routeur d'outils
        const systemPrompt = `
Tu es J.A.R.V.I.S., l'IA personnelle du Life Operating System "Odyssey".
Ton but est d'aider l'utilisateur (expatrié, digital nomad).
Tu as accès à ces outils via l'Action Engine :
1. "google_calendar_schedule" (Paramètres attendus: title, startTimeISO, endTimeISO, description)
2. "skyscanner_flight_search" (Paramètres attendus: origin, destination, date)

Détermine si la demande nécessite d'utiliser l'un de ces outils.
Réponds UNIQUEMENT et STRICTEMENT avec un objet JSON valide (sans markdown autour), selon cette structure :
{
  "requiresTool": true/false,
  "toolName": "nom_de_l_outil" ou null,
  "parameters": { ... } ou null,
  "replyText": "Ta réponse conversationnelle à l'utilisateur (ex: Je lance la recherche de vols...)"
}

Demande : "${prompt}"
`;

        const result = await generateObject({
            model: google('gemini-1.5-pro-latest'),
            system: systemPrompt,
            prompt: prompt,
            schema: z.object({
                requiresTool: z.boolean(),
                toolName: z.string().nullable(),
                parameters: z.record(z.any()).nullable(),
                replyText: z.string()
            }),
            temperature: 0.1,
        });

        const aiResponse = result.object;

        if (aiResponse.requiresTool && aiResponse.toolName) {
            console.log(`⚡ [JARVIS Agent] Déclenchement de l'outil: ${aiResponse.toolName}`);
            const receipt = await executeTool(aiResponse.toolName, aiResponse.parameters || {});
            return NextResponse.json({ reply: aiResponse.replyText, actionExecuted: true, tool: aiResponse.toolName, receipt });
        }

        return NextResponse.json({ reply: aiResponse.replyText, actionExecuted: false });
    } catch (error: any) {
        console.error("❌ [JARVIS Agent] Erreur Serveur:", error);
        return NextResponse.json({ error: "Internal Agent Error" }, { status: 500 });
    }
}