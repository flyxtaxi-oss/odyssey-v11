// ==============================================================================
// REMITTANCE — Comparateur de transfert d'argent vers le Maroc (MRE)
// ------------------------------------------------------------------------------
// Le "hook" d'acquisition d'Odyssey MRE : comparer le coût RÉEL d'un envoi
// (frais fixes + frais % + marge de change cachée) entre les principaux
// opérateurs, pour un montant et un corridor donnés.
//
// ⚠️ Les grilles tarifaires et le taux mid-market sont INDICATIFS (données
// publiques mi-2026). À brancher plus tard sur des API de taux temps réel.
// Aucune donnée ici ne dépend d'une licence : c'est une couche d'information.
// ==============================================================================

export type PayoutMethod = "bank" | "cash" | "wallet";
export type Corridor = "EUR" | "USD" | "GBP" | "CAD";

export interface Provider {
  id: string;
  name: string;
  /** Frais fixes dans la devise d'envoi */
  fixedFee: number;
  /** Frais proportionnels (ex: 0.01 = 1%) appliqués au montant envoyé */
  percentFee: number;
  /** Marge de change cachée : écart vs taux réel (ex: 0.02 = 2% moins favorable) */
  fxMarginPct: number;
  /** Méthodes de réception disponibles au Maroc */
  payout: PayoutMethod[];
  /** Délai indicatif */
  speed: string;
  /** Corridors (devises d'envoi) supportés */
  corridors: Corridor[];
  note?: string;
}

// Taux mid-market indicatifs (1 unité de devise = X MAD). À remplacer par une API.
export const MID_MARKET_TO_MAD: Record<Corridor, number> = {
  EUR: 10.85,
  USD: 10.0,
  GBP: 12.7,
  CAD: 7.3,
};

// Grille indicative des principaux opérateurs vers le Maroc (mi-2026).
export const PROVIDERS: Provider[] = [
  {
    id: "wise",
    name: "Wise",
    fixedFee: 1.5,
    percentFee: 0.006,
    fxMarginPct: 0,
    payout: ["bank"],
    speed: "0-1 j",
    corridors: ["EUR", "USD", "GBP", "CAD"],
    note: "Taux réel, frais transparents. Dépôt bancaire uniquement.",
  },
  {
    id: "remitly",
    name: "Remitly",
    fixedFee: 1.99,
    percentFee: 0.005,
    fxMarginPct: 0.012,
    payout: ["bank", "cash", "wallet"],
    speed: "min-1 j",
    corridors: ["EUR", "USD", "GBP", "CAD"],
    note: "Retrait cash possible via Wafacash / Cash Plus.",
  },
  {
    id: "sendwave",
    name: "Sendwave",
    fixedFee: 0,
    percentFee: 0.009,
    fxMarginPct: 0.015,
    payout: ["bank", "wallet"],
    speed: "minutes",
    corridors: ["EUR", "USD", "GBP"],
    note: "Sans frais fixes, marge sur le change.",
  },
  {
    id: "wafacash",
    name: "Wafacash",
    fixedFee: 3,
    percentFee: 0.05,
    fxMarginPct: 0.02,
    payout: ["cash"],
    speed: "instantané",
    corridors: ["EUR", "USD"],
    note: "Retrait cash à 3 000+ points contre CIN. Pratique pour non-bancarisés.",
  },
  {
    id: "cashplus",
    name: "Cash Plus",
    fixedFee: 2.5,
    percentFee: 0.045,
    fxMarginPct: 0.02,
    payout: ["cash"],
    speed: "~30 min",
    corridors: ["EUR", "USD"],
    note: "Réseau cash national.",
  },
  {
    id: "westernunion",
    name: "Western Union",
    fixedFee: 2.9,
    percentFee: 0.05,
    fxMarginPct: 0.025,
    payout: ["cash", "bank"],
    speed: "minutes",
    corridors: ["EUR", "USD", "GBP", "CAD"],
    note: "Rapide, coûteux. Utile pour l'urgence.",
  },
];

export interface QuoteResult {
  provider: Provider;
  /** Montant total prélevé (frais fixes + % ) dans la devise d'envoi */
  totalFees: number;
  /** Taux de change effectivement appliqué (MAD par unité), marge incluse */
  effectiveRate: number;
  /** Montant reçu au Maroc en MAD */
  receivedMAD: number;
  /** Coût réel total (frais + perte de change) en devise d'envoi */
  realCost: number;
  /** Coût réel en % du montant envoyé */
  realCostPct: number;
  available: boolean;
}

export interface CompareOptions {
  amount: number;
  corridor: Corridor;
  payout?: PayoutMethod;
}

/**
 * Compare tous les opérateurs pour un envoi donné et renvoie les devis triés
 * du moins cher au plus cher (par coût réel).
 */
export function compareProviders({
  amount,
  corridor,
  payout,
}: CompareOptions): QuoteResult[] {
  const midRate = MID_MARKET_TO_MAD[corridor];

  const quotes: QuoteResult[] = PROVIDERS.map((provider) => {
    const supportsCorridor = provider.corridors.includes(corridor);
    const supportsPayout = payout ? provider.payout.includes(payout) : true;
    const available = supportsCorridor && supportsPayout;

    const totalFees = provider.fixedFee + amount * provider.percentFee;
    const amountAfterFees = Math.max(0, amount - totalFees);
    const effectiveRate = midRate * (1 - provider.fxMarginPct);
    const receivedMAD = amountAfterFees * effectiveRate;

    // Coût réel = ce qu'on perd vs un transfert parfait au taux mid-market.
    const idealMAD = amount * midRate;
    const realCostMAD = idealMAD - receivedMAD;
    const realCost = realCostMAD / midRate; // reconverti en devise d'envoi
    const realCostPct = amount > 0 ? realCost / amount : 0;

    return {
      provider,
      totalFees: round2(totalFees),
      effectiveRate: round4(effectiveRate),
      receivedMAD: round2(receivedMAD),
      realCost: round2(realCost),
      realCostPct: round4(realCostPct),
      available,
    };
  });

  return quotes.sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    return a.realCost - b.realCost;
  });
}

/** Économie réalisée en choisissant le meilleur opérateur disponible vs le pire. */
export function maxSavings(quotes: QuoteResult[]): number {
  const available = quotes.filter((q) => q.available);
  if (available.length < 2) return 0;
  const costs = available.map((q) => q.realCost);
  return round2(Math.max(...costs) - Math.min(...costs));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
