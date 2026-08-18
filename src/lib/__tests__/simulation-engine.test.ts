import { describe, it, expect } from "vitest";
import { SimulationEngine, type SimulationSeed } from "../simulation-engine";

// ==============================================================================
// Determinism of the life-projection engine
// ==============================================================================
//
// This engine produces a "score de succès /100" that the UI shows to the user
// and offers to share. It used to call Math.random() directly, so the same
// person, the same destination and the same inputs produced a different score
// on every run — a projection that changes each time you ask it is not a
// projection, and it cannot be supported or explained.
//
// The engine now draws from a PRNG seeded by a hash of its inputs. These tests
// pin that property down: same inputs → same result, different inputs →
// different result.

function makeSeed(overrides: Partial<SimulationSeed> = {}): SimulationSeed {
  return {
    query: "Partir vivre au Portugal en 2027",
    scenario: "relocation",
    destination: "portugal",
    time_horizon: 24,
    rounds: 12,
    user_profile: {
      nationality: "française",
      current_location: "Paris",
      budget: 15000,
      income: 3800,
      skills: ["react", "typescript", "design"],
      goals: ["réduire le coût de la vie", "travailler en remote"],
      family_status: "en couple",
      language_level: { portugal: 20, en: 80 },
    },
    ...overrides,
  };
}

async function run(seed: SimulationSeed) {
  const engine = new SimulationEngine(seed);
  await engine.initialize();
  while (!engine.isComplete()) {
    const round = await engine.runRound();
    if (!round) break;
  }
  return engine.generateReport();
}

describe("SimulationEngine determinism", () => {
  it("returns the same score for the same inputs", async () => {
    const [a, b] = await Promise.all([run(makeSeed()), run(makeSeed())]);

    expect(a.success_score).toBe(b.success_score);
  });

  it("reproduces the whole final state, not just the headline score", async () => {
    const [a, b] = await Promise.all([run(makeSeed()), run(makeSeed())]);

    expect(a.final_state).toEqual(b.final_state);
  });

  it("produces a different projection when a meaningful input changes", async () => {
    // Budget drives financial health, so a 10x difference must move the result.
    // If this ever passes trivially, the seeding has stopped depending on input.
    const poor = await run(makeSeed({ user_profile: { ...makeSeed().user_profile, budget: 2000 } }));
    const rich = await run(makeSeed({ user_profile: { ...makeSeed().user_profile, budget: 90000 } }));

    expect(poor.success_score).not.toBe(rich.success_score);
  });

  it("changes the projection when the destination changes", async () => {
    const pt = await run(makeSeed({ destination: "portugal" }));
    const ma = await run(makeSeed({ destination: "maroc" }));

    expect(pt.final_state).not.toEqual(ma.final_state);
  });

  it("keeps the score inside the range the UI assumes", async () => {
    // The UI colours the score with thresholds at 70 / 50 / 30 and renders it
    // as "X/100"; anything outside 0..100 would render nonsense.
    const report = await run(makeSeed());

    expect(report.success_score).toBeGreaterThanOrEqual(0);
    expect(report.success_score).toBeLessThanOrEqual(100);
    expect(Number.isInteger(report.success_score)).toBe(true);
  });

  it("produces a complete report the UI can render", async () => {
    const report = await run(makeSeed());

    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(report.timeline.length).toBeGreaterThan(0);
    expect(report.agent_summaries.length).toBeGreaterThan(0);
    expect(report.created_at).toBeTruthy();
  });
});
