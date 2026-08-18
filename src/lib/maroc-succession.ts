/**
 * maroc-succession.ts — Moteur ÉDUCATIF du calculateur de succession (Fara'id).
 *
 * ⚠️ OUTIL PÉDAGOGIQUE, PAS UN CONSEIL JURIDIQUE.
 * Couvre les configurations COURANTES (conjoint, enfants, parents). Les cas
 * complexes (frères/sœurs, petits-enfants, kalala, testament, kafala, donations)
 * renvoient vers un adoul / notaire. Basé sur le Code de la famille (Moudawana,
 * BO n°5184 du 5 fév. 2004). La réforme 2024-2026 (139 amendements) n'est PAS
 * encore votée à juin 2026 — affichée comme proposition, jamais comme droit en vigueur.
 */

export type DeceasedGender = "homme" | "femme";

export type SuccessionInput = {
  deceasedGender: DeceasedGender;
  hasSpouse: boolean;
  sons: number;
  daughters: number;
  fatherAlive: boolean;
  motherAlive: boolean;
};

export type Share = {
  who: string;
  /** Part en fraction de la succession (0–1) */
  fraction: number;
  /** Base de calcul lisible (fraction + motif) */
  basis: string;
  /** true si la part vient du taâssib (reliquat agnatique) — le point sensible */
  isTaassib?: boolean;
};

export type SuccessionResult = {
  /** null si le cas dépasse le périmètre de l'outil */
  shares: Share[] | null;
  /** Cas nécessitant un professionnel (hors périmètre) */
  requiresExpert: boolean;
  notes: string[];
  /** Met en évidence l'enjeu de la réforme si applicable */
  reformImpact?: string;
};

function pct(f: number): string {
  return `${(f * 100).toFixed(1).replace(".0", "")}%`;
}

export function computeSuccession(input: SuccessionInput): SuccessionResult {
  const { deceasedGender, hasSpouse, sons, daughters, fatherAlive, motherAlive } = input;
  const hasChildren = sons + daughters > 0;
  const notes: string[] = [];

  // Hors périmètre : sans enfant, plusieurs cas spéciaux (Umariyyatayn, kalala…)
  if (!hasChildren) {
    return {
      shares: null,
      requiresExpert: true,
      notes: [
        "Sans descendant direct, la dévolution fait intervenir des règles spécifiques (parents, frères et sœurs, cas « Umariyyatayn ») qui dépassent ce simulateur.",
        "Consulte un adoul ou un notaire pour ce cas.",
      ],
    };
  }

  const shares: Share[] = [];
  let allocated = 0;

  // ─── Conjoint survivant ───
  if (hasSpouse) {
    const f = deceasedGender === "homme" ? 1 / 8 : 1 / 4;
    shares.push({
      who: deceasedGender === "homme" ? "Épouse" : "Époux",
      fraction: f,
      basis: `${deceasedGender === "homme" ? "1/8" : "1/4"} (conjoint, en présence d'enfants)`,
    });
    allocated += f;
    if (deceasedGender === "homme") notes.push("En cas de plusieurs épouses, le 1/8 est partagé entre elles.");
  }

  // ─── Mère ───
  if (motherAlive) {
    const f = 1 / 6;
    shares.push({ who: "Mère", fraction: f, basis: "1/6 (en présence d'enfants)" });
    allocated += f;
  }

  // ─── Père : 1/6 fixe (+ reliquat si pas de fils) ───
  let fatherIdx = -1;
  if (fatherAlive) {
    const f = 1 / 6;
    shares.push({ who: "Père", fraction: f, basis: "1/6 (en présence d'enfants)" });
    fatherIdx = shares.length - 1;
    allocated += f;
  }

  // ─── Enfants ───
  if (sons > 0) {
    // Fils présents : les enfants se partagent le reliquat, fils = 2 × fille (taâssib)
    const residue = Math.max(0, 1 - allocated);
    const parts = sons * 2 + daughters;
    const perPart = parts > 0 ? residue / parts : 0;
    shares.push({
      who: `Fils (${sons})`,
      fraction: perPart * 2 * sons,
      basis: "reliquat — 2 parts par fils",
    });
    if (daughters > 0) {
      shares.push({
        who: `Filles (${daughters})`,
        fraction: perPart * daughters,
        basis: "reliquat — 1 part par fille",
      });
    }
    notes.push("Avec un fils, le partage fils/filles suit la règle « part du garçon = 2 × celle de la fille ».");
  } else {
    // Uniquement des filles : part fixe, puis reliquat (taâssib) au père/agnats
    const dFixed = daughters === 1 ? 1 / 2 : 2 / 3;
    shares.push({
      who: `Fille${daughters > 1 ? `s (${daughters})` : ""}`,
      fraction: dFixed,
      basis: daughters === 1 ? "1/2 (fille unique)" : "2/3 (collectif, 2 filles ou +)",
    });
    allocated += dFixed;
    const residue = Math.max(0, 1 - allocated);

    if (residue > 0.0001) {
      if (fatherIdx >= 0) {
        shares[fatherIdx].fraction += residue;
        shares[fatherIdx].basis = "1/6 + reliquat (taâssib)";
        shares[fatherIdx].isTaassib = true;
      } else {
        shares.push({
          who: "Héritiers agnatiques (taâssib)",
          fraction: residue,
          basis: "reliquat aux agnats (oncles, cousins…) ou Bayt al-mâl",
          isTaassib: true,
        });
      }
    }

    return {
      shares,
      requiresExpert: false,
      notes: [
        ...notes,
        "Sans fils, les filles reçoivent une part fixe (1/2 ou 2/3) ; le reliquat revient aux héritiers agnatiques mâles (taâssib).",
      ],
      reformImpact:
        "C'est précisément ce que la réforme de la Moudawana (proposition déc. 2024, NON votée à juin 2026) veut corriger : éviter qu'un reliquat échappe aux filles au profit d'agnats éloignés, exclure le domicile familial de la succession, et permettre la donation aux filles. À confirmer une fois le texte adopté.",
    };
  }

  return { shares, requiresExpert: false, notes };
}

/** Pour l'affichage : pourcentage lisible d'une part. */
export function sharePct(f: number): string {
  return pct(f);
}

export const SUCCESSION_SOURCES = [
  "Code de la famille (Moudawana), BO n°5184 du 5 février 2004 — Livre VI (successions).",
  "Propositions de réforme de la Moudawana (139 amendements présentés en décembre 2024, non votés à juin 2026).",
];
