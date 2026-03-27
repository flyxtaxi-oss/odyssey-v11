import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { actionRegistry, ActionIntent } from '@/lib/action-engine';
import { getCachedResponse, setCachedResponse } from '@/lib/cache';
import { z } from 'zod';

const SYSTEM_PROMPT = `Tu es J.A.R.V.I.S., le système d'exploitation cognitif ultra-avancé de type "Command Center".
Ton rôle est d'analyser la requête de l'utilisateur et de déterminer quelle action executer parmi les outils disponibles.
Tu dois répondre STRICTEMENT en suivant le schéma JSON demandé. Sois précis, professionnel et analytique.

Outils disponibles:
{TOOLS}

Règles pour parser:
1. Si l'utilisateur demande à réserver un restaurant (avec "réserve", "book", etc), l'intent est "book_restaurant".
2. S'il cherche juste où manger ("où manger", "japonais", "resto"), l'intent est "search_restaurants".
3. Paramètres de recherche de resto : extrait la cuisine ("japonais", "italien"), le budget ("$", "$$", "$$$") et la localisation.
4. Paramètres de réservation : "restaurantName", "date" (YYYY-MM-DD), "time" (HH:MM), "partySize" (nombre).
`;

export async function generateActionPlanFromAI(query: string, userId: string = "anonymous") {
    const toolsManifest = await actionRegistry.toManifest();
    const systemInstruction = SYSTEM_PROMPT.replace('{TOOLS}', JSON.stringify(toolsManifest, null, 2));

    // 1. Check Smart Cache to save tokens and latency
    const cachedPlan = getCachedResponse(query, systemInstruction);
    if (cachedPlan) {
        console.log("⚡ [JARVIS] Cache Hit - Skipping Neural Engine API call");
        return cachedPlan;
    }

    // 2. Call Proprietary Neural Engine via AI SDK
    console.log("🌐 [JARVIS] Cache Miss - Calling Neural Engine...");
    try {
        const { object } = await generateObject({
            model: google('gemini-1.5-pro-latest'), // Using the latest Pro model
            system: systemInstruction,
            prompt: `Requête utilisateur : "${query}"\nDate actuelle: ${new Date().toISOString()}`,
            schema: z.object({
                intent: z.enum([
                    "search_restaurants",
                    "book_restaurant",
                    "plan_trip",
                    "draft_email",
                    "plan_week",
                    "search_info"
                ]),
                description: z.string().describe("Description humaine de l'action qui va être effectuée (ex: 'Recherche de restaurants japonais à Paris')"),
                toolName: z.string().describe("Le nom de l'outil à appeler, correspondant à l'intent"),
                parameters: z.record(z.string(), z.any()).describe("Les paramètres extraits de la requête pour l'outil"),
                requiresConfirmation: z.boolean().describe("Vrai si l'action modifie le monde réel (réservation, envoi)"),
                estimatedDuration: z.string().describe("Estimation du temps (ex: '~5 secondes')"),
                risks: z.array(z.string()).optional().describe("Risques potentiels de l'action, si applicable"),
                undoable: z.boolean().describe("Vrai si on peut annuler l'action"),
            }),
            temperature: 0.1, // Low temperature for factual parsing
        });

        // Add ID and timestamp
        const finalPlan = {
            ...object,
            id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            createdAt: new Date().toISOString()
        };

        // 3. Save to Cache
        setCachedResponse(query, finalPlan, systemInstruction);

        return finalPlan;
    } catch (e: any) {
        console.error("❌ [JARVIS] AI Plan Generation Error:", e);
        throw new Error("Impossible de générer un plan avec l'IA. " + (e.message || ""));
    }
}
