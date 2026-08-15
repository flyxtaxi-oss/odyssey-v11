import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { executeTool, actionRegistry } from "@/lib/action-engine";
import { ensureToolsRegistered } from "@/lib/tools/registry";
import { authenticateRequest, enforceRateLimit } from "@/lib/auth-middleware";
import { checkPromptInjection } from "@/lib/security";
import { withProviderFailover } from "@/lib/ai-providers";
import { aiUnavailableResponse } from "@/lib/ai-unavailable";

export async function POST(req: Request) {
    const limited = await enforceRateLimit(req, { durable: true });
    if (limited) return limited;

    // This route calls a paid LLM *and* can execute real-world tools
    // (calendar writes, flight searches). Anonymous access was billable abuse
    // waiting to happen — and left no identity on the audit trail.
    const auth = await authenticateRequest(req);
    if (!auth.success) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    ensureToolsRegistered();

    try {
        const { prompt } = await req.json();

        if (typeof prompt !== "string" || !prompt.trim()) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        if (prompt.length > 8000) {
            return NextResponse.json({ error: "Prompt trop long (max 8000 caractères)" }, { status: 400 });
        }

        // The prompt is interpolated into the system prompt below, so an
        // injection here can rewrite the tool-routing instructions — and this
        // route executes real tools. Block high severity, sanitise the rest.
        const injection = checkPromptInjection(prompt);
        if (injection.blocked) {
            return NextResponse.json(
                { error: "Requête rejetée par le filtre de sécurité." },
                { status: 400 }
            );
        }
        const safePrompt = injection.sanitizedInput;

        console.log(`🧠 [JARVIS Agent] Analyse de la requête (uid=${auth.user.uid})`);

        // Prompt système forçant l'IA à agir comme un routeur d'outils
        const systemPrompt = `
Tu es J.A.R.V.I.S., l'IA personnelle du Life Operating System "Odyssey".
Ton but est d'aider l'utilisateur (expatrié, digital nomad).
Règles strictes (Karpathy & Superpowers) :
1. "Think Before Acting" : Analyse si un outil est VRAIMENT nécessaire avant de l'appeler.
2. "Simplicity First" : S'il y a une alternative plus simple, choisis-la.

Tu as accès à ces outils via l'Action Engine :
${actionRegistry
    .toManifest()
    .map(
        (t) =>
            `- "${t.name}" : ${t.description}${t.simulated ? " ⚠️ SIMULÉ — cet outil ne produit AUCUN effet réel. Ne dis jamais que l'action est faite ; annonce explicitement qu'il s'agit d'une démonstration." : ""}`
    )
    .join("\n")}

3. "Ne jamais prétendre" : si un outil est marqué SIMULÉ, ta réponse doit le dire.
   Écris « je te montre à quoi ça ressemblerait », jamais « c'est réservé ».

Détermine si la demande nécessite d'utiliser l'un de ces outils.
Réponds UNIQUEMENT et STRICTEMENT avec un objet JSON valide (sans markdown autour), selon cette structure :
{
  "requiresTool": true/false,
  "toolName": "nom_de_l_outil" ou null,
  "parameters": { ... } ou null,
  "replyText": "Ta réponse conversationnelle à l'utilisateur (ex: Je lance la recherche de vols...)"
}

`;

        // Tries each configured provider in turn. Free tiers rate-limit often
        // enough that a single provider makes this feel broken; with a second
        // key set, a 429 just moves on to the next.
        const { result, provider, modelId } = await withProviderFailover(
            "reasoning",
            (model) =>
                generateObject({
                    model,
                    system: systemPrompt,
                    prompt: safePrompt,
                    schema: z.object({
                        requiresTool: z.boolean(),
                        toolName: z.string().nullable(),
                        parameters: z.record(z.string(), z.any()).nullable(),
                        replyText: z.string()
                    }),
                    temperature: 0.1,
                })
        );

        const aiResponse = result.object;
        const meta = { provider, model: modelId };

        if (aiResponse.requiresTool && aiResponse.toolName) {
            console.log(`⚡ [JARVIS Agent] Déclenchement de l'outil: ${aiResponse.toolName}`);

            // Deliberately NOT confirmed: the tool name and its parameters come
            // from the model, driven by user text. A model must be able to
            // propose a booking, never to make one. executeTool refuses any tool
            // declaring requiresConfirmation, so read-only tools (search) run
            // straight through while side-effecting ones come back as a refusal
            // the UI turns into an explicit confirmation step.
            const receipt = await executeTool(aiResponse.toolName, aiResponse.parameters || {}, {
                userId: auth.user.uid,
            });

            const needsConfirmation = receipt.status === "failed"
                && receipt.error?.includes("confirmation");

            return NextResponse.json({
                reply: aiResponse.replyText,
                // `actionExecuted` pilote l'UI : il ne doit être vrai que si un
                // effet réel a eu lieu. Un outil simulé reste à false et se
                // signale par `simulated`.
                actionExecuted: receipt.status === "completed",
                simulated: receipt.simulated,
                needsConfirmation,
                tool: aiResponse.toolName,
                parameters: aiResponse.parameters ?? {},
                receipt,
                meta,
            });
        }

        return NextResponse.json({ reply: aiResponse.replyText, actionExecuted: false, meta });
    } catch (error) {
        // Une clé manquante n'est pas une panne : 503 actionnable, pas 500.
        const unavailable = aiUnavailableResponse(error);
        if (unavailable) return unavailable;

        console.error("❌ [JARVIS Agent] Erreur Serveur:", error);
        return NextResponse.json({ error: "Internal Agent Error" }, { status: 500 });
    }
}