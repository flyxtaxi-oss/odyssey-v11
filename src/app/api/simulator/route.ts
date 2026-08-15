import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/firestore-server";
import { authenticateRequest, optionalAuth, enforceRateLimit } from "@/lib/auth-middleware";
import { CreateSimulationSchema, validateInput } from "@/lib/validation";
import { getSecurityHeaders } from "@/lib/security";
import { consumeQuota } from "@/lib/entitlements-server";

// ==============================================================================
// SIMULATOR API — Save/Load Simulations (SECURED)
// ==============================================================================

export async function GET(req: NextRequest) {
    try {
        const user = await optionalAuth(req);

        if (!user) {
            return NextResponse.json(
                { simulations: [], total: 0, source: "guest", message: "Connectez-vous pour voir vos simulations" },
                { headers: getSecurityHeaders() }
            );
        }

        const db = await serverDb();
        const snapshot = await db
            .collection("simulations")
            .where("user_id", "==", user.uid)
            .orderBy("created_at", "desc")
            .limit(20)
            .get();
        const simulations = snapshot.docs.map((d) => {
            const data = d.data();
            return {
                id: d.id,
                destination: data.destination,
                score: data.score,
                visa: data.visa,
                salary: data.salary,
                tax_rate: data.tax_rate,
                cost_of_living: data.cost_of_living,
                climate: data.climate,
                savings: data.savings,
                created_at: data.created_at,
            };
        });

        return NextResponse.json({ simulations, total: simulations.length, source: "firebase" }, { headers: getSecurityHeaders() });
    } catch (error) {
        console.error("Simulator GET Error:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des simulations." },
            { status: 500, headers: getSecurityHeaders() }
        );
    }
}

export async function POST(req: NextRequest) {
    const limited = await enforceRateLimit(req);
    if (limited) return limited;

    try {
        const auth = await authenticateRequest(req);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: auth.status, headers: getSecurityHeaders() });
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: getSecurityHeaders() });
        }

        const validation = validateInput(CreateSimulationSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.errors },
                { status: 400, headers: getSecurityHeaders() }
            );
        }

        // Quota d'abonnement — appliqué APRÈS la validation, AVANT l'écriture.
        //
        // L'ordre n'est pas anodin : consommer une unité sur une requête qui va
        // de toute façon échouer en validation ferait payer à l'utilisateur une
        // simulation qu'il n'a jamais obtenue. Et l'appliquer après l'écriture
        // ne protégerait plus rien.
        //
        // `consumeQuota` est transactionnel : dix requêtes simultanées ne
        // peuvent pas lire le même compteur et passer toutes les dix.
        const quota = await consumeQuota(auth.user.uid, "simulations");
        if (!quota.allowed) {
            return NextResponse.json(
                {
                    error: "quota_exceeded",
                    message: `Tu as utilisé tes ${quota.limit} simulations incluses ce mois-ci.`,
                    quota: { used: quota.used, limit: quota.limit },
                    upgradeUrl: "/#pricing",
                },
                // 402 plutôt que 403 : le client doit proposer l'abonnement,
                // pas afficher « accès refusé ».
                { status: 402, headers: getSecurityHeaders() }
            );
        }

        const data = validation.data;
        const db = await serverDb();
        const simulationRef = db.collection("simulations").doc();
        const simulation = {
            id: simulationRef.id,
            user_id: auth.user.uid,
            ...data,
            created_at: new Date().toISOString(),
        };

        await simulationRef.set(simulation);

        return NextResponse.json(
            {
                simulation,
                status: "saved",
                message: "Simulation sauvegardée avec succès!",
                quota: { used: quota.used, limit: quota.limit, remaining: quota.remaining, plan: quota.plan },
            },
            { status: 201, headers: getSecurityHeaders() }
        );
    } catch (error) {
        console.error("Simulator POST Error:", error);
        return NextResponse.json(
            { error: "Erreur lors de la sauvegarde." },
            { status: 500, headers: getSecurityHeaders() }
        );
    }
}
