// ==============================================================================
// PREDICTION SIMULATION API — Multi-Agent Life Prediction (MiroFish-style)
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { optionalAuth } from "@/lib/auth-middleware";
import { CreatePredictionSchema, validateInput } from "@/lib/validation";
import { getSecurityHeaders } from "@/lib/security";
import { SimulationEngine } from "@/lib/simulation-engine";

interface SimulationReport {
  id: string;
  seed: {
    query: string;
    user_profile: {
      nationality: string;
      current_location: string;
      budget: number;
      income: number;
      skills: string[];
      goals: string[];
      family_status: string;
      language_level: Record<string, number>;
    };
    scenario: string;
    destination: string;
    time_horizon: number;
    rounds: number;
  };
  phases: Array<{
    round: number;
    events: Array<{
      id: string;
      type: string;
      description: string;
      impact: number;
      affected_agents: string[];
      timestamp: string;
    }>;
    agent_interactions: Array<{
      agent_a: string;
      agent_b: string;
      type: string;
      outcome: string;
      sentiment: string;
    }>;
    state: {
      happiness: number;
      financial_health: number;
      social_integration: number;
      career_progress: number;
      language_progress: number;
      visa_status: string;
      network_size: number;
    };
  }>;
  final_state: {
    happiness: number;
    financial_health: number;
    social_integration: number;
    career_progress: number;
    language_progress: number;
    visa_status: string;
    network_size: number;
  };
  key_events: Array<{
    id: string;
    type: string;
    description: string;
    impact: number;
    affected_agents: string[];
    timestamp: string;
  }>;
  recommendations: Array<{
    category: string;
    priority: string;
    title: string;
    description: string;
    action: string;
  }>;
  success_score: number;
  timeline: Array<{
    month: number;
    event: string;
    impact: number;
    category: string;
  }>;
  agent_summaries: Array<{
    agent: {
      id: string;
      type: string;
      name: string;
      personality: string;
      goals: string[];
      memory: Array<{
        event: string;
        sentiment: string;
        round: number;
        impact: number;
      }>;
      influence: number;
    };
    total_interactions: number;
    key_insights: string[];
    relationship_to_user: string;
  }>;
  created_at: string;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await optionalAuth(req);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    const validation = validateInput(CreatePredictionSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    const { query, user_profile, scenario, destination, time_horizon, rounds } = validation.data;

    const seed = {
      query,
      user_profile,
      scenario,
      destination,
      time_horizon,
      rounds,
    };

    const engine = new SimulationEngine(seed);
    await engine.initialize();

    for (let i = 0; i < rounds; i++) {
      const result = await engine.runRound();
      if (!result) break;
    }

    const report = engine.generateReport();

    const reportForStorage: SimulationReport = {
      ...report,
      seed: {
        ...report.seed,
        user_profile: {
          ...report.seed.user_profile,
          language_level: report.seed.user_profile.language_level || {},
        },
      },
    };

    if (auth) {
      const predictionRef = doc(collection(db, "predictions"));
      await setDoc(predictionRef, {
        user_id: auth.uid,
        ...reportForStorage,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        prediction: reportForStorage,
        status: "success",
        message: "Simulation completed successfully",
      },
      { status: 201, headers: getSecurityHeaders() }
    );
  } catch (error) {
    console.error("Prediction Simulation Error:", error);
    return NextResponse.json(
      { error: "Simulation failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await optionalAuth(req);

    if (!auth) {
      return NextResponse.json(
        { predictions: [], total: 0, message: "Connectez-vous pour voir vos prédictions" },
        { headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      { predictions: [], total: 0, message: "Prediction history endpoint - coming soon" },
      { headers: getSecurityHeaders() }
    );
  } catch (error) {
    console.error("Prediction GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}