import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import {
    getCachedResponse,
    setCachedResponse,
    checkRateLimit,
    getMemoryContext,
    updateMemory,
    selectModel,
    getCacheStats,
} from "@/lib/ai-engine";

// ==============================================================================
// J.A.R.V.I.S. — AI Chat Endpoint (Streaming)
// With: Cache ⚡ | Rate Limiting 🛡️ | Memory 🧠 | Smart Model Routing 🎯
// ==============================================================================

const PERSONAS: Record<string, string> = {
    sage: `Tu es le SAGE, un mentor philosophique au niveau de Marcus Aurelius et Naval Ravikant. Tu analyses chaque situation en profondeur avec des frameworks mentaux puissants (First Principles, Inversion, Second-Order Thinking). Tu poses des questions socratiques qui forcent la réflexion. Style: profond, transformatif, wisdom-driven.`,

    strategist: `Tu es le STRATÈGE, un expert de calibre McKinsey en planification de vie. Tu maîtrises la fiscalité internationale, l'optimisation patrimoniale, les visas (NHR Portugal, Golden Visa UAE, DTV Thaïlande), et les stratégies d'expatriation. Tu donnes des chiffres précis et des plans d'action structurés avec timeline. Style: data-driven, précis, ROI-focused.`,

    coach: `Tu es le COACH, combinant la méthode de Tony Robbins et l'approche scientifique d'Andrew Huberman. Tu utilises des techniques de PNL, de visualisation et de peak performance. Tu crées des protocoles d'action mesurables avec des KPIs personnels. Style: high-energy, science-backed, transformation-oriented.`,

    executor: `Tu es l'EXÉCUTEUR, un COO personnel inspiré par les méthodes de Cal Newport (Deep Work) et David Allen (GTD). Tu transformes chaque idée en système d'exécution avec deadlines, milestones, et accountability. Tu refuses la procrastination avec bienveillance mais fermeté. Style: système-oriented, zero-bullshit, action-first.`,

    friend: `Tu es l'AMI, un confident intelligent avec l'humour de Ryan Reynolds et l'empathie d'un meilleur ami. Tu écoutes activement, tu valides les émotions, et tu apportes une perspective fraîche. Tu sais quand être drôle et quand être sérieux. Style: authentique, chaleureux, sharp.`,
};

const SYSTEM_PROMPT = `Tu es J.A.R.V.I.S., l'Intelligence Artificielle core d'Odyssey.ai — le Life Operating System le plus avancé au monde.

## Identité
- IA premium de niveau Flagship (pas un simple chatbot)
- Expert polyvalent : expatriation, finance, développement personnel, tech, stratégie
- Capacité d'adaptation contextuelle en temps réel
- Toujours en français sauf si l'utilisateur switche de langue

## Règles d'excellence
1. TUTOIE l'utilisateur — c'est un échange entre pairs
2. Commence chaque réponse par la substance, jamais par "Bien sûr" ou "Excellente question"
3. Structure avec des paragraphes courts + bold sur les concepts clés
4. Utilise des metrics/chiffres quand pertinent
5. Termine TOUJOURS par une action concrète ou une question qui fait avancer
6. Maximum 1-2 emojis par réponse, jamais en début de phrase
7. Ne mentionne JAMAIS que tu es une IA ou un modèle de langage
8. Adapte la longueur : question simple → réponse courte, question complexe → analyse structurée

## Modules disponibles
- **Simulateur de Trajectoire** — comparaison multipays (fiscalité, coût de vie, visas, projections financières)
- **Safe-Zone** — réseau vérifié avec modération IA anti-toxicité
- **Système de Matching** — connexion avec des mentors et experts
- **Analytics** — Odyssey Score, métriques de progression`;

export async function POST(req: Request) {
    try {
        const { messages, persona = "strategist", userId = "anonymous" } = await req.json();

        // ─── Rate Limiting ─────────────────────────────────────────
        const rateCheck = checkRateLimit(userId);
        if (!rateCheck.allowed) {
            return new Response(
                JSON.stringify({
                    error: "Rate limit atteint. Réessaie dans quelques secondes.",
                    remaining: 0,
                    resetMs: rateCheck.resetMs,
                }),
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        "Retry-After": String(Math.ceil(rateCheck.resetMs / 1000)),
                        "X-RateLimit-Remaining": "0",
                    },
                }
            );
        }

        // ─── Cache Check ───────────────────────────────────────────
        const cached = getCachedResponse(messages, persona);
        if (cached) {
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
                async start(controller) {
                    // Stream cached response word by word (fast)
                    const words = cached.split(" ");
                    for (const word of words) {
                        controller.enqueue(encoder.encode(word + " "));
                        await new Promise((r) => setTimeout(r, 15)); // Faster than live
                    }
                    controller.close();
                },
            });
            return new Response(stream, {
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "X-Cache": "HIT",
                    "X-RateLimit-Remaining": String(rateCheck.remaining),
                },
            });
        }

        // ─── Memory Context ────────────────────────────────────────
        const memoryContext = getMemoryContext(userId);
        const personaPrompt = PERSONAS[persona] || PERSONAS.strategist;
        const fullSystemPrompt = [
            SYSTEM_PROMPT,
            `\nPersona active: ${personaPrompt}`,
            memoryContext ? `\nMémoire contextuelle:\n${memoryContext}` : "",
        ]
            .filter(Boolean)
            .join("\n");

        // ─── Smart Model Selection ─────────────────────────────────
        const modelConfig = selectModel(persona);

        // ─── AI Provider Execution ─────────────────────────────────
        if (modelConfig.provider === "anthropic") {
            const result = streamText({
                model: anthropic(modelConfig.modelId),
                system: fullSystemPrompt,
                messages,
                maxOutputTokens: modelConfig.maxTokens,
                temperature: modelConfig.temperature,
            });

            // Collect for cache + memory
            const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop();
            if (lastUserMsg) {
                result.text.then((text: string) => {
                    setCachedResponse(messages, persona, text);
                    updateMemory(userId, lastUserMsg.content, text);
                });
            }

            return result.toTextStreamResponse({
                headers: {
                    "X-Cache": "MISS",
                    "X-Model": modelConfig.displayName,
                    "X-RateLimit-Remaining": String(rateCheck.remaining),
                },
            });
        }

        if (modelConfig.provider === "google") {
            const result = streamText({
                model: google(modelConfig.modelId),
                system: fullSystemPrompt,
                messages,
                maxOutputTokens: modelConfig.maxTokens,
                temperature: modelConfig.temperature,
            });

            const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop();
            if (lastUserMsg) {
                result.text.then((text: string) => {
                    setCachedResponse(messages, persona, text);
                    updateMemory(userId, lastUserMsg.content, text);
                });
            }

            return result.toTextStreamResponse({
                headers: {
                    "X-Cache": "MISS",
                    "X-Model": modelConfig.displayName,
                    "X-RateLimit-Remaining": String(rateCheck.remaining),
                },
            });
        }

        // ─── Mock Mode (Enhanced) ──────────────────────────────────
        const mockResponses: Record<string, string> = {
            sage: "La question que tu poses révèle un **schéma de pensée** intéressant. Avant de chercher la réponse, explorons le cadre : quel serait le scénario si tu faisais exactement l'inverse de ce que tu envisages ? Cette inversion te donnera une clarté que l'approche directe ne peut pas offrir.\n\nQuelle est la chose que tu évites consciemment dans cette réflexion ?",
            strategist:
                "Voici l'analyse structurée :\n\n**1. Situation actuelle** — Tu es en phase d'exploration, ce qui est normal mais coûteux en temps\n**2. Données clés** — Le marché montre une fenêtre d'opportunité de 6-12 mois sur les programmes de visa numérique\n**3. Action immédiate** — Lance une simulation comparative dans le Simulateur de Trajectoire avec tes 3 pays cibles\n\nQuel est ton horizon temporel pour cette transition ?",
            coach:
                "Tu sais ce qui sépare les 1% qui réussissent des 99% qui planifient ? **L'exécution immédiate**. Pas demain, pas lundi — maintenant.\n\nVoici ton protocole pour les prochaines 24h :\n- **Matin** : 90 minutes de Deep Work sur ton objectif #1\n- **Midi** : 1 action inconfortable (un appel, un email, une décision)\n- **Soir** : Journal de 5 minutes — qu'as-tu appris ?\n\nQuelle est cette action inconfortable que tu repousses ?",
            executor:
                "**SYSTÈME D'EXÉCUTION INITIALISÉ**\n\n```\nPriorité #1 : [À définir]\nDeadline  : [À fixer]\nMilestone : [Prochain jalon]\n```\n\nEnvoie-moi ton objectif principal en une phrase. Je le décompose en tâches actionnables avec des deadlines non-négociables.",
            friend:
                "Hey ! 😄 Ça fait plaisir de discuter. J'ai l'impression que tu as quelque chose en tête — je me trompe ? Raconte, je suis là pour écouter (et probablement pour te dire ce que tu sais déjà mais que t'as besoin d'entendre 😉).",
        };

        const mockText = mockResponses[persona] || mockResponses.strategist;
        const lastUserMsg = messages?.filter((m: { role: string }) => m.role === "user").pop();
        if (lastUserMsg) {
            updateMemory(userId, lastUserMsg.content, mockText);
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const words = mockText.split(" ");
                for (const word of words) {
                    controller.enqueue(encoder.encode(word + " "));
                    await new Promise((r) => setTimeout(r, 25));
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-Cache": "MISS",
                "X-Model": "Odyssey Mock AI",
                "X-RateLimit-Remaining": String(rateCheck.remaining),
            },
        });
    } catch (error) {
        console.error("JARVIS API Error:", error);
        return new Response(
            JSON.stringify({ error: "Erreur interne J.A.R.V.I.S." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

// ─── Cache Stats Endpoint (GET) ──────────────────────────────────────────────
export async function GET() {
    const stats = getCacheStats();
    return new Response(JSON.stringify({
        cache: stats,
        status: "operational",
        models_available: {
            anthropic: !!process.env.ANTHROPIC_API_KEY,
            google: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        },
    }), {
        headers: { "Content-Type": "application/json" },
    });
}
