import { NextRequest, NextResponse } from "next/server";
import { collection, doc, setDoc, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { authenticateRequest, optionalAuth } from "@/lib/auth-middleware";
import { CreateSimulationSchema, validateInput } from "@/lib/validation";
import { getSecurityHeaders } from "@/lib/security";

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

        const q = query(
            collection(db, "simulations"),
            where("user_id", "==", user.uid),
            orderBy("created_at", "desc"),
            limit(20)
        );

        const snapshot = await getDocs(q);
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

        const data = validation.data;
        const simulationRef = doc(collection(db, "simulations"));
        const simulation = {
            id: simulationRef.id,
            user_id: auth.user.uid,
            ...data,
            created_at: new Date().toISOString(),
        };

        await setDoc(simulationRef, simulation);

        return NextResponse.json(
            { simulation, status: "saved", message: "Simulation sauvegardée avec succès!" },
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
