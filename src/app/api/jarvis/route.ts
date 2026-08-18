import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";
import {
    selectModel as selectProviderModel,
    type Capability,
} from "@/lib/ai-providers";
import {
    getCachedResponse,
    setCachedResponse,
    checkRateLimit,
    getMemoryContext,
    updateMemory,
} from "@/lib/ai-engine";
import { checkPromptInjection, logAuditEntry, getSecurityHeaders } from "@/lib/security";
import { detectLanguage, getJarvisLocaleInstruction } from "@/lib/i18n";
import { getContextForQuery, updateGraphFromConversation } from "@/lib/graph-rag";
import { getMarocKnowledge, estimateMonthlyCost, getCitySlugs } from "@/lib/maroc-data";
import { getSereniteKnowledge } from "@/lib/maroc-serenite";
import { getVeilleKnowledge } from "@/lib/maroc-veille";
import { getDestinationsKnowledge } from "@/lib/expat-destinations";
import { VISA_COUNTRIES } from "@/lib/visa-countries";
import { FREE_PERSONA } from "@/lib/entitlements";
import { consumeQuota, userHasFeature } from "@/lib/entitlements-server";

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

## Règles d'excellence & Principes (Inspirés par Karpathy & Superpowers)
1. **Pense avant d'agir (Think Before Acting)** : Planifie silencieusement tes étapes avant de proposer une solution complexe ou d'utiliser un outil.
2. **Simplicité d'abord (Simplicity First)** : Propose la solution la plus simple et la plus directe. Évite la sur-ingénierie.
3. TUTOIE l'utilisateur — c'est un échange entre pairs.
4. Commence chaque réponse par la substance, jamais par "Bien sûr" ou "Excellente question".
5. Si l'utilisateur exprime une grande satisfaction, suggère subtilement d'utiliser l'outil generateInvite pour inviter ses amis (boucle virale).
6. Structure avec des paragraphes courts + bold sur les concepts clés.
7. Utilise des metrics/chiffres quand pertinent.
8. Termine TOUJOURS par une action concrète ou une question qui fait avancer.
9. Maximum 1-2 emojis par réponse, jamais en début de phrase.
10. Si on te demande ce que tu es, réponds franchement que tu es une IA. Ne le prétends
    jamais autrement. (Règlement européen sur l'IA, art. 50 : un système conversationnel
    doit être identifiable comme tel. Ce n'est pas une préférence de ton, c'est une
    obligation — et un utilisateur qui croit parler à un conseiller humain accorde à tes
    réponses un poids qu'elles ne méritent pas sur des décisions d'expatriation.)
11. Adapte la longueur : question simple → réponse courte, question complexe → analyse structurée.

## Véracité — la règle qui prime sur toutes les autres
Cette application conseille sur des visas et de la fiscalité. Un chiffre inventé peut coûter
à quelqu'un un refus de séjour ou un redressement fiscal.
- N'invente JAMAIS un taux d'imposition, un montant de revenu minimum, un délai administratif
  ou un prix. Si un outil ne te renvoie pas la donnée, dis que tu ne l'as pas.
- Quand un outil te renvoie une donnée, cite-la telle quelle, avec sa source et sa date si
  elles sont fournies. N'arrondis pas, n'extrapole pas à un pays voisin.
- « Je ne sais pas, voici où vérifier » est une bonne réponse. Une réponse assurée et fausse
  est la pire.
- Rappelle que tes réponses sont indicatives et ne remplacent pas un professionnel qualifié
  dès qu'on te demande une décision engageante (départ, démission, déclaration fiscale).

## Modules disponibles
- **Simulateur de Trajectoire** — comparaison multipays (fiscalité, coût de vie, visas, projections financières)
- **Vivre au Maroc** (/maroc) — hub pour étrangers, MRE et locaux : coût de la vie, séjour, fiscalité, douane, immobilier, estimateur de budget (outil analyzeMaroc)
- **Safe-Zone** — réseau vérifié avec modération IA anti-toxicité
- **Système de Matching** — connexion avec des mentors et experts
- **Analytics** — Odyssey Score, métriques de progression`;

// ─── Action Engine V2 : Outils (Tools) ──────────────────────────────────
// Jarvis n'est plus seulement réactif, il devient proactif.
const jarvisTools = {
    bookRestaurant: tool({
        description: "Rechercher et simuler la réservation d'un restaurant ou d'une adresse locale.",
        inputSchema: z.object({
            city: z.string().describe("La ville de la recherche"),
            cuisine: z.string().describe("Le type de cuisine (ex: japonais, local, healthy)"),
        }),
        execute: async ({ city, cuisine }) => {
            // Cet outil annonçait « J'ai trouvé 3 excellentes options […] Je viens
            // d'ajouter les liens à ton espace de travail » — trois affirmations
            // fausses : aucune recherche n'était faite, aucun lien n'existait, et
            // aucun espace de travail ne recevait quoi que ce soit. L'utilisateur
            // repartait en croyant avoir une liste qui l'attendait quelque part.
            //
            // Tant qu'aucun fournisseur (Google Places / TheFork) n'est branché, le
            // seul retour honnête est l'absence de capacité. Le modèle le reformule
            // à l'utilisateur au lieu d'inventer un résultat.
            return {
                success: false,
                unavailable: true,
                reason: "no_provider_connected",
                message: `Odyssey n'est pas encore connecté à un service de réservation. Je ne peux pas chercher de ${cuisine} à ${city} ni réserver quoi que ce soit — dis-le clairement à l'utilisateur et propose-lui de chercher lui-même.`,
            };
        },
    }),
    checkVisaRules: tool({
        description:
            "Consulter la fiche visa Odyssey d'un pays (nom du visa, durée, revenu minimum exigé, capitale, indice de coût de la vie). Ne couvre que les pays présents dans la base Odyssey.",
        inputSchema: z.object({
            country: z.string().describe("Le pays cible (ex: Portugal, Émirats, Thaïlande)"),
        }),
        execute: async ({ country }) => {
            // Cet outil retournait « Le {pays} propose d'excellentes options fiscales
            // en 2026 » pour N'IMPORTE QUELLE chaîne — y compris un pays qui n'existe
            // pas, ou un pays sans aucun visa nomade. Le modèle relayait ensuite cette
            // affirmation avec l'autorité d'un résultat d'outil, ce qui est exactement
            // le mode d'erreur le plus dangereux : une invention qui a l'air sourcée.
            //
            // On interroge maintenant la vraie base (VISA_COUNTRIES) et on répond
            // « pas de données » quand il n'y en a pas. Le silence est une réponse.
            const needle = country
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
            const match = VISA_COUNTRIES.find((c) => {
                const name = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return c.slug === needle || name === needle || name.includes(needle) || needle.includes(name);
            });

            if (!match) {
                return {
                    success: false,
                    found: false,
                    message: `Aucune fiche Odyssey pour « ${country} ». Dis-le à l'utilisateur : n'invente ni visa, ni taux, ni seuil de revenu pour ce pays. Oriente-le vers le consulat concerné.`,
                };
            }

            return {
                success: true,
                found: true,
                country: match.name,
                visaName: match.visaName,
                maxStayDays: match.maxStayDays,
                minIncomeEurPerMonth: match.minIncome,
                capitalCity: match.capitalCity,
                costOfLivingIndexParis100: match.costOfLivingIndex,
                highlights: match.highlights,
                guideUrl: `/visa/${match.slug}`,
                disclaimer:
                    "Fiche indicative Odyssey, non contractuelle. Les conditions de visa changent sans préavis : renvoie systématiquement l'utilisateur vers le consulat du pays pour confirmation.",
            };
        },
    }),
    analyzeMaroc: tool({
        description: "Analyser un projet de vie au Maroc (étranger qui s'installe, MRE qui rentre, ou local) : calcule un budget mensuel réel et l'économie vs France pour une ville donnée.",
        inputSchema: z.object({
            city: z.enum(getCitySlugs() as [string, ...string[]]).describe("Ville cible au Maroc"),
            people: z.number().min(1).max(8).describe("Nombre de personnes dans le foyer"),
            lifestyle: z.enum(["eco", "confort", "premium"]).describe("Niveau de vie souhaité"),
        }),
        execute: async ({ city, people, lifestyle }) => {
            const e = estimateMonthlyCost(city, people, lifestyle);
            return {
                success: true,
                city,
                budgetEurPerMonth: e.eur,
                budgetMadPerMonth: e.mad,
                savingsEurPerYearVsFrance: e.savingsEurPerYear,
                costIndexVsParis: e.vsParisPct,
                note: "Estimation indicative Odyssey (1€≈10,8 MAD). Oriente l'utilisateur vers le hub /maroc et son estimateur interactif.",
            };
        },
    }),
    generateInvite: tool({
        description: "Générer un lien viral d'invitation pour l'utilisateur s'il demande à inviter quelqu'un ou s'il est très satisfait.",
        inputSchema: z.object({
            context: z.string().describe("Le contexte pour lequel l'utilisateur veut inviter un ami (ex: 'Pour débloquer le simulateur pro')"),
        }),
        execute: async ({ context }) => {
            // Logique liée au ViralEngine
            return { success: true, link: "https://odyssey-ai.app/invite/JIB-X9A2", message: `Voici ton lien VIP spécial. Partage-le pour accomplir : ${context}. Chaque ami invité te rapporte 500 XP et débloque de nouvelles fonctionnalités.` };
        },
    }),
    createCalendarEvent: tool({
        description: "Créer un événement ou un rappel dans l'agenda de l'utilisateur (pour un vol, une session de deep work, une date de visa ou un resto).",
        inputSchema: z.object({
            title: z.string().describe("Titre de l'événement (ex: 'Vol Paris-Lisbonne', 'Deep Work')"),
            startTime: z.string().describe("Heure de début (Format ISO 8601, ex: 2026-04-15T14:00:00Z)"),
            endTime: z.string().describe("Heure de fin (Format ISO 8601)"),
            location: z.string().optional().describe("Lieu éventuel"),
        }),
        execute: async ({ title, startTime, endTime, location }) => {
            // Action Engine V2 : Génération dynamique d'un Deep Link Google Calendar
            const link = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime.replace(/[-:]/g, '').split('.')[0]}Z/${endTime.replace(/[-:]/g, '').split('.')[0]}Z${location ? `&location=${encodeURIComponent(location)}` : ''}`;
            return { success: true, action: "calendar_event_created", details: `J'ai préparé l'événement "${title}". Clique sur le lien généré pour bloquer ton agenda instantanément.`, link };
        },
    }),
};

export async function POST(req: Request) {
    try {
        // Validate and parse body
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return new Response(
                JSON.stringify({ error: "Invalid JSON body" }),
                { status: 400, headers: { "Content-Type": "application/json", ...getSecurityHeaders() } }
            );
        }

        // Import validation
        const { JarvisChatSchema, validateInput } = await import("@/lib/validation");
        const validation = validateInput(JarvisChatSchema, body);
        
        if (!validation.success) {
            return new Response(
                JSON.stringify({ error: "Validation failed", details: validation.errors }),
                { status: 400, headers: { "Content-Type": "application/json", ...getSecurityHeaders() } }
            );
        }

        const { messages, persona } = validation.data;
        
        // Get userId from Authorization header (Firebase token) - SECURED
        const authHeader = req.headers.get("authorization");
        let userId = "";

        if (authHeader?.startsWith("Bearer ")) {
            const { verifyIdToken } = await import("@/lib/firebase-admin");
            const idToken = authHeader.slice(7);
            const decodedToken = await verifyIdToken(idToken);

            if (decodedToken) {
                userId = decodedToken.uid || decodedToken.sub || "";
            }
        }

        // Une identité de compte et une clé de quota ne sont pas la même chose, et
        // les confondre a produit une fuite de données réelle.
        //
        // Le code précédent posait `userId = "anon:" + ip` puis se servait de cette
        // chaîne à la fois comme clé de rate limiting ET comme clé de la mémoire
        // conversationnelle (updateMemory / graph-rag). Or `updateMemory` extrait et
        // conserve la localisation, le revenu, la profession et les objectifs déclarés
        // (voir src/lib/ai-engine.ts), puis `getMemoryContext` les réinjecte dans le
        // prompt système. Deux visiteurs déconnectés sortant par la même IP publique
        // — CGNAT d'un opérateur mobile, réseau d'entreprise, université, VPN — sont
        // donc la MÊME personne pour le serveur : le second se voit réciter les
        // revenus et le métier du premier. Le CGNAT mobile est exactement la
        // situation de la cible marocaine du produit.
        //
        // Pire : `x-forwarded-for[0]` est fourni par l'appelant. Cloudflare *ajoute*
        // l'IP réelle à un XFF existant au lieu de le remplacer, donc l'élément [0]
        // est contrôlable — l'identité n'était pas seulement sujette aux collisions,
        // elle était forgeable, ce qui permettait de lire délibérément la mémoire
        // associée à une IP donnée.
        //
        // La règle appliquée maintenant :
        //   - la clé de QUOTA peut dériver du réseau (c'est le seul signal disponible
        //     pour un anonyme, et le pire cas est un quota partagé) ;
        //   - la clé de MÉMOIRE ne peut dériver QUE d'une identité vérifiée. Pas de
        //     compte, pas de mémoire — ni lecture, ni écriture.
        const isAuthenticated = Boolean(userId);

        /** Clé de persistance. `null` pour un appelant anonyme : rien n'est stocké. */
        const memoryKey: string | null = isAuthenticated ? userId : null;

        if (!userId) {
            // `clientIp()` est le helper du dépôt : il privilégie les en-têtes posés
            // par l'infrastructure plutôt que le premier segment de x-forwarded-for.
            const { clientIp } = await import("@/lib/auth-middleware");
            userId = `anon:${clientIp(req)}`;
        }

        // ─── Rate Limiting ─────────────────────────────────────────
        // Deux étages : le bucket mémoire est un pré-filtre local gratuit, mais
        // en serverless c'est un compteur par instance qui repart à zéro à
        // chaque démarrage à froid. Cette route déclenche un appel LLM payant,
        // donc elle passe aussi par le compteur partagé (fail-open).
        const rateCheck = checkRateLimit(userId);
        const durable = rateCheck.allowed
            ? await (await import("@/lib/rate-limit-durable")).consumeDurableToken(userId, {
                  max: 20,
                  refillPerSec: 20 / 60,
              })
            : { allowed: false, resetMs: rateCheck.resetMs };

        if (!rateCheck.allowed || !durable.allowed) {
            const resetMs = rateCheck.allowed ? durable.resetMs : rateCheck.resetMs;
            return new Response(
                JSON.stringify({
                    error: "Rate limit atteint. Réessaie dans quelques secondes.",
                    remaining: 0,
                    resetMs,
                }),
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        "Retry-After": String(Math.ceil(resetMs / 1000)),
                        "X-RateLimit-Remaining": "0",
                        ...getSecurityHeaders(),
                    },
                }
            );
        }

        // ─── Droits d'abonnement ───────────────────────────────────
        // Appliqués uniquement aux comptes identifiés. Un visiteur anonyme est
        // déjà borné par le rate limiting ci-dessus ; lui ouvrir un compteur
        // mensuel créerait un document Firestore par IP, pour un plan qu'il
        // n'a pas — et une IP n'est pas une personne (voir la note sur
        // `memoryKey` plus haut dans ce fichier).
        if (memoryKey) {
            // Persona : la landing vend « 1 persona » en Free et « 5 » en Pro.
            // On refuse explicitement plutôt que de retomber en silence sur le
            // persona gratuit — recevoir le Stratège après avoir cliqué sur le
            // Sage passe pour un bug, pas pour une limite d'offre.
            if (persona && persona !== FREE_PERSONA) {
                const unlocked = await userHasFeature(memoryKey, "all_personas");
                if (!unlocked) {
                    return new Response(
                        JSON.stringify({
                            error: "plan_required",
                            message: `Le persona « ${persona} » fait partie du plan Pro. Le Stratège reste disponible sans abonnement.`,
                            feature: "all_personas",
                            upgradeUrl: "/#pricing",
                        }),
                        { status: 402, headers: { "Content-Type": "application/json", ...getSecurityHeaders() } }
                    );
                }
            }

            // Volume mensuel de messages. Consommé avant l'appel au modèle :
            // c'est cet appel qui coûte de l'argent, donc c'est lui qu'il faut
            // borner — pas la réponse une fois qu'elle est payée.
            const msgQuota = await consumeQuota(memoryKey, "jarvis_messages");
            if (!msgQuota.allowed) {
                return new Response(
                    JSON.stringify({
                        error: "quota_exceeded",
                        message: `Tu as utilisé tes ${msgQuota.limit} messages inclus ce mois-ci.`,
                        quota: { used: msgQuota.used, limit: msgQuota.limit },
                        upgradeUrl: "/#pricing",
                    }),
                    { status: 402, headers: { "Content-Type": "application/json", ...getSecurityHeaders() } }
                );
            }
        }

        // ─── Security: Prompt Injection Check ─────────────────────
        const lastUserMessage = messages?.filter((m: { role: string }) => m.role === "user").pop();
        if (lastUserMessage) {
            const secCheck = checkPromptInjection(lastUserMessage.content);
            if (secCheck.blocked) {
                logAuditEntry({
                    userId,
                    action: "chat",
                    toolName: "jarvis",
                    input: lastUserMessage.content.slice(0, 200),
                    result: "blocked",
                    injectionDetected: true,
                    severity: secCheck.severity,
                    details: secCheck.detectedPatterns.join(", "),
                });
                return new Response(
                    JSON.stringify({
                        error: "Ta demande contient un schéma non autorisé. Reformule ta question.",
                        blocked: true,
                    }),
                    { status: 400, headers: { "Content-Type": "application/json", ...getSecurityHeaders() } }
                );
            }
            // Log warning for medium severity but allow
            if (secCheck.severity === "medium") {
                logAuditEntry({
                    userId,
                    action: "chat_warning",
                    toolName: "jarvis",
                    input: lastUserMessage.content.slice(0, 200),
                    result: "success",
                    injectionDetected: true,
                    severity: secCheck.severity,
                    details: secCheck.detectedPatterns.join(", "),
                });
            }
        }

        // ─── i18n: Auto-detect language ───────────────────────────
        const detectedLocale = lastUserMessage
            ? detectLanguage(lastUserMessage.content)
            : "fr";
        const localeInstruction = getJarvisLocaleInstruction(detectedLocale);

        // ─── Cache Check ───────────────────────────────────────────
        const cached = getCachedResponse(messages, persona, userId);
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
        // Lue uniquement pour une identité vérifiée. Pour un anonyme, `memoryKey`
        // vaut null et la conversation démarre sans historique — c'est le
        // comportement voulu : mieux vaut un assistant sans mémoire qu'un assistant
        // qui restitue la situation financière de quelqu'un d'autre.
        const memoryContext = memoryKey ? getMemoryContext(memoryKey) : "";
        const graphRagContext = memoryKey
            ? getContextForQuery(memoryKey, lastUserMessage?.content || "")
            : "";
        const personaPrompt = PERSONAS[persona] || PERSONAS.strategist;
        const fullSystemPrompt = [
            SYSTEM_PROMPT,
            `\n${getMarocKnowledge()}`,
            `\n${getSereniteKnowledge()}`,
            `\n${getVeilleKnowledge()}`,
            `\n${getDestinationsKnowledge()}`,
            `\nPersona active: ${personaPrompt}`,
            `\n${localeInstruction}`,
            memoryContext ? `\nMémoire contextuelle:\n${memoryContext}` : "",
            graphRagContext ? `\n${graphRagContext}` : "",
        ]
            .filter(Boolean)
            .join("\n");

        // ─── Model selection ───────────────────────────────────────
        // Goes through the shared provider chain rather than the old
        // StepFun-or-Google branch, which ignored every other free tier: with a
        // Groq / Cerebras / Mistral / OpenRouter key configured, JARVIS used to
        // fall through to the mock anyway. Reflective personas get the
        // reasoning tier, the rest get the fast one.
        const capability: Capability =
            persona === "sage" || persona === "strategist" ? "reasoning" : "fast";
        const selected = selectProviderModel(capability) ?? selectProviderModel("fast");

        if (selected) {
            const result = streamText({
                model: selected.model,
                system: fullSystemPrompt,
                messages,
                maxOutputTokens: 2048,
                temperature: 0.7,
                // Tool calling is only reliable on Google's first-party provider;
                // the OpenAI-compatible free tiers vary too much to depend on it.
                ...(selected.provider === "google"
                    ? { tools: jarvisTools, stopWhen: stepCountIs(3) }
                    : {}),
            });

            const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop();
            if (lastUserMsg) {
                result.text.then((text: string) => {
                    // Le cache reste scopé sur `userId` : sa clé inclut le hash des
                    // trois derniers messages, donc une collision suppose une
                    // conversation identique octet pour octet — pas une fuite.
                    setCachedResponse(messages, persona, text, userId);

                    // La mémoire, elle, n'est écrite que pour un compte vérifié.
                    // `updateMemory` extrait revenus, profession et localisation du
                    // message : les indexer sous une clé dérivée du réseau revient à
                    // les rendre lisibles par le visiteur suivant sur la même IP.
                    if (memoryKey) {
                        updateMemory(memoryKey, lastUserMsg.content, text);
                        updateGraphFromConversation(memoryKey, lastUserMsg.content, text);
                    }
                });
            }

            return result.toTextStreamResponse({
                headers: {
                    "X-Cache": "MISS",
                    "X-Model": `${selected.provider}/${selected.modelId}`,
                    "X-RateLimit-Remaining": String(rateCheck.remaining),
                    "X-GraphRAG": "enabled",
                },
            });
        }

        // ─── No provider configured ────────────────────────────────
        //
        // This branch used to stream canned "persona" answers that read exactly
        // like a real reply. One of them asserted a 6-12 month window on digital
        // visa programmes — a specific, invented, checkable claim. On a product
        // that advises people about visas, taxes and inheritance, a confident
        // fabrication is the worst possible failure: the user cannot tell it
        // apart from an answer, and may act on it.
        //
        // Saying "not configured" is the only honest response when there is no
        // model behind the endpoint.
        const setupMessage =
            "⚠️ **Aucun modèle IA n'est configuré**, je ne peux donc pas répondre à ta question.\n\n" +
            "Je préfère te le dire clairement plutôt que d'inventer une réponse — sur des sujets de visa, " +
            "de fiscalité ou de succession, une information fausse peut coûter cher.\n\n" +
            "Pour activer J.A.R.V.I.S., ajoute une clé gratuite dans `.env.local` :\n\n" +
            "```\nGOOGLE_GENERATIVE_AI_API_KEY=...\n```\n\n" +
            "Elle se crée en une minute sur **aistudio.google.com/apikey**, sans carte bancaire. " +
            "Groq, Cerebras, Mistral et OpenRouter fonctionnent aussi — la première clé trouvée est utilisée.\n\n" +
            "En attendant, le **Simulateur** et les **guides visa** fonctionnent sans IA : leurs données sont statiques.";

        // Deliberately not written to memory or the knowledge graph: this is a
        // system notice, not a conversation turn, and storing it would pollute
        // the user's context for every later exchange.

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(setupMessage));
                controller.close();
            },
        });

        return new Response(stream, {
            status: 503,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-Cache": "MISS",
                "X-Model": "none",
                "X-AI-Configured": "false",
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

// ─── Status Endpoint (GET) ───────────────────────────────────────────────────
// Public → minimal. Les stats de cache et la liste des clés API configurées
// décrivaient l'infrastructure à quiconque ; le diagnostic détaillé vit
// derrière l'authentification dans /api/health.
export async function GET() {
    return new Response(JSON.stringify({ status: "operational" }), {
        headers: { "Content-Type": "application/json" },
    });
}
