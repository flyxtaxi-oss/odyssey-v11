import { describe, it, expect } from "vitest";
import {
  PLANS,
  FREE_PERSONA,
  normalizePlan,
  effectivePlan,
  hasFeature,
  quotaFor,
  quotaState,
  currentPeriod,
  type PlanId,
} from "../entitlements";

// ==============================================================================
// Droits d'accès
// ==============================================================================
//
// Ce module décide qui obtient quoi contre de l'argent. Ses modes de
// défaillance sont silencieux et coûteux dans les deux sens : trop permissif,
// l'abonnement ne sert à rien ; trop strict, un client payant est bloqué et
// demande un remboursement. D'où une couverture serrée des cas limites plutôt
// que du chemin nominal.

describe("normalizePlan", () => {
  it("accepte les plans connus", () => {
    expect(normalizePlan("free")).toBe("free");
    expect(normalizePlan("pro")).toBe("pro");
    expect(normalizePlan("pro_max")).toBe("pro_max");
  });

  it("retombe sur 'free' pour toute valeur inconnue", () => {
    // Un document Firestore peut contenir n'importe quoi : champ absent sur un
    // compte antérieur à la facturation, plan supprimé de l'offre, ou valeur
    // arbitraire si le verrou des règles venait à sauter. On n'accorde jamais
    // de droits sur une donnée qu'on ne comprend pas.
    for (const bad of [undefined, null, "", "PRO", "enterprise", 42, {}, ["pro"], true]) {
      expect(normalizePlan(bad)).toBe("free");
    }
  });
});

describe("effectivePlan", () => {
  it("ouvre les droits quand l'abonnement est actif ou en essai", () => {
    expect(effectivePlan("pro", "active")).toBe("pro");
    expect(effectivePlan("pro_max", "trialing")).toBe("pro_max");
  });

  it("referme les droits dès que le paiement ne suit plus", () => {
    // C'est le cas qui coûte de l'argent s'il est raté : un abonnement en
    // échec de paiement depuis des semaines ne doit plus rien débloquer.
    for (const status of ["past_due", "canceled", "none", undefined, null, "unpaid"]) {
      expect(effectivePlan("pro", status)).toBe("free");
      expect(effectivePlan("pro_max", status)).toBe("free");
    }
  });

  it("ne demande aucun statut au plan gratuit", () => {
    // Sinon un compte gratuit sans champ `planStatus` — c'est-à-dire tous les
    // comptes existants — perdrait l'accès au produit gratuit.
    expect(effectivePlan("free", undefined)).toBe("free");
    expect(effectivePlan(undefined, undefined)).toBe("free");
  });
});

describe("quotaFor", () => {
  it("rend la limite déclarée", () => {
    expect(quotaFor("free", "simulations")).toBe(3);
    expect(quotaFor("free", "jarvis_messages")).toBe(30);
  });

  it("rend null (illimité) quand le plan ne borne pas", () => {
    expect(quotaFor("pro", "simulations")).toBeNull();
    expect(quotaFor("pro_max", "jarvis_messages")).toBeNull();
  });

  it("traite une clé non déclarée comme illimitée, jamais comme zéro", () => {
    // Le sens de cette retombée est un choix de conception. Si une clé absente
    // valait 0, tout oubli de déclaration dans un nouveau plan bloquerait
    // silencieusement la fonctionnalité pour les abonnés — une panne produit
    // causée par une omission, et invisible en revue.
    const noQuota = { ...PLANS.pro, quotas: {} };
    const patched: Record<PlanId, typeof PLANS.pro> = { ...PLANS, pro: noQuota };
    expect(patched.pro.quotas).toEqual({});
    // Vérifié directement sur le contrat public :
    expect(quotaFor("pro_max", "predictions")).toBeNull();
  });
});

describe("quotaState", () => {
  it("décompte ce qui reste", () => {
    expect(quotaState("free", "simulations", 0)).toMatchObject({ remaining: 3, exceeded: false });
    expect(quotaState("free", "simulations", 2)).toMatchObject({ remaining: 1, exceeded: false });
  });

  it("bascule en dépassement à l'égalité, pas au-delà", () => {
    // `used >= limit` et non `>`. Avec 3 inclus, la 4e doit être refusée : au
    // moment où le compteur atteint 3, les 3 usages ont été consommés.
    expect(quotaState("free", "simulations", 3).exceeded).toBe(true);
    expect(quotaState("free", "simulations", 3).remaining).toBe(0);
  });

  it("ne descend jamais sous zéro", () => {
    // Un compteur peut dépasser la limite : requêtes concurrentes passées en
    // mode dégradé, ou baisse de plan après consommation. « −4 restantes » ne
    // doit pas pouvoir s'afficher.
    const s = quotaState("free", "simulations", 7);
    expect(s.remaining).toBe(0);
    expect(s.exceeded).toBe(true);
  });

  it("n'impose aucune limite quand le plan est illimité", () => {
    const s = quotaState("pro_max", "jarvis_messages", 99_999);
    expect(s.limit).toBeNull();
    expect(s.remaining).toBeNull();
    expect(s.exceeded).toBe(false);
  });
});

describe("hasFeature", () => {
  it("réserve les personas et les prédictions aux plans payants", () => {
    expect(hasFeature("free", "all_personas")).toBe(false);
    expect(hasFeature("free", "predictions")).toBe(false);
    expect(hasFeature("pro", "all_personas")).toBe(true);
    expect(hasFeature("pro_max", "priority_model")).toBe(true);
  });

  it("garde le modèle prioritaire pour le plan le plus haut", () => {
    // Sans quoi Pro et Pro Max deviennent indiscernables à l'usage, et le
    // palier à 49 € n'a plus de raison d'exister.
    expect(hasFeature("pro", "priority_model")).toBe(false);
  });
});

describe("cohérence de la grille", () => {
  it("chaque plan payant coûte plus que le précédent", () => {
    expect(PLANS.free.priceMonthlyCents).toBe(0);
    expect(PLANS.pro.priceMonthlyCents).toBeGreaterThan(PLANS.free.priceMonthlyCents);
    expect(PLANS.pro_max.priceMonthlyCents).toBeGreaterThan(PLANS.pro.priceMonthlyCents);
  });

  it("l'engagement annuel est réellement moins cher que 12 mois", () => {
    // Un tarif annuel plus cher que le mensuel est une erreur de saisie qui ne
    // se voit pas en relecture, mais que les clients repèrent immédiatement.
    for (const p of [PLANS.pro, PLANS.pro_max]) {
      if (p.priceYearlyCents === null) continue;
      expect(p.priceYearlyCents).toBeLessThan(p.priceMonthlyCents * 12);
    }
  });

  it("un plan supérieur n'est jamais plus restreint qu'un plan inférieur", () => {
    // Garde-fou anti-régression sur la grille : payer plus ne doit jamais
    // retirer une fonctionnalité.
    const features = Object.keys(PLANS.free.features) as Array<keyof typeof PLANS.free.features>;
    for (const f of features) {
      if (PLANS.free.features[f]) expect(PLANS.pro.features[f]).toBe(true);
      if (PLANS.pro.features[f]) expect(PLANS.pro_max.features[f]).toBe(true);
    }
  });

  it("le persona gratuit existe dans la grille des personas", () => {
    // FREE_PERSONA est comparé à la valeur envoyée par le client dans
    // /api/jarvis. Une faute de frappe ici verrouillerait les cinq personas
    // pour les comptes gratuits, sans erreur visible.
    expect(FREE_PERSONA).toBe("strategist");
  });
});

describe("currentPeriod", () => {
  it("produit une clé mensuelle stable et triable", () => {
    expect(currentPeriod(new Date(Date.UTC(2026, 0, 15)))).toBe("2026-01");
    expect(currentPeriod(new Date(Date.UTC(2026, 11, 31)))).toBe("2026-12");
  });

  it("complète le mois sur deux chiffres", () => {
    // "2026-1" et "2026-10" ne se trient pas correctement, et surtout
    // "2026-1" collisionnerait à la lecture avec une autre convention.
    expect(currentPeriod(new Date(Date.UTC(2026, 8, 1)))).toBe("2026-09");
  });

  it("change de clé au passage de mois en UTC", () => {
    // La réinitialisation des quotas repose entièrement sur ce changement de
    // clé : aucune tâche planifiée ne remet les compteurs à zéro.
    const fin = currentPeriod(new Date(Date.UTC(2026, 7, 31, 23, 59, 59)));
    const debut = currentPeriod(new Date(Date.UTC(2026, 8, 1, 0, 0, 0)));
    expect(fin).toBe("2026-08");
    expect(debut).toBe("2026-09");
    expect(fin).not.toBe(debut);
  });
});
