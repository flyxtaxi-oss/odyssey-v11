/**
 * maroc-transfert.ts — Moteur du "Radar Transfert".
 *
 * Révèle le COÛT TOTAL réel d'un transfert vers le Maroc = frais affichés
 * + marge de change cachée (vs taux interbancaire), traduit en "MAD réellement reçus".
 *
 * ⚠️ Taux et grilles tarifaires = ESTIMATIONS représentatives 2026, à titre indicatif.
 * En production, brancher sur des taux live (n8n quotidien + référence BCE). Sourcé :
 * Banque Mondiale (Remittance Prices), idealremit (corridor France→Maroc).
 */

export type CurrencyCode = "EUR" | "CAD";

export type Corridor = {
  id: string;
  label: string;
  flag: string;
  currency: CurrencyCode;
  /** Taux interbancaire de référence (1 unité devise → MAD), ~mars 2026 */
  interbankRate: number;
};

export const CORRIDORS: Corridor[] = [
  { id: "fr", label: "France", flag: "🇫🇷", currency: "EUR", interbankRate: 10.81 },
  { id: "be", label: "Belgique", flag: "🇧🇪", currency: "EUR", interbankRate: 10.81 },
  { id: "es", label: "Espagne", flag: "🇪🇸", currency: "EUR", interbankRate: 10.81 },
  { id: "it", label: "Italie", flag: "🇮🇹", currency: "EUR", interbankRate: 10.81 },
  { id: "ca", label: "Canada", flag: "🇨🇦", currency: "CAD", interbankRate: 7.32 },
];

export type Operator = {
  id: string;
  name: string;
  kind: "fintech" | "cash" | "banque";
  /** Frais fixes affichés, en devise d'envoi */
  feeFixed: number;
  /** Frais variables affichés (% du montant) */
  feePct: number;
  /** Marge de change CACHÉE (% retranché du taux interbancaire) — le vrai coût */
  fxMarginPct: number;
  speed: string;
};

/**
 * Grille représentative (corridor euro). Les marges cachées sont la clé :
 * Wise est quasi au taux réel, Western Union / banques cachent le plus.
 */
export const OPERATORS: Operator[] = [
  { id: "wise", name: "Wise", kind: "fintech", feeFixed: 1.2, feePct: 0.5, fxMarginPct: 0.0, speed: "qq heures" },
  { id: "remitly", name: "Remitly", kind: "fintech", feeFixed: 0, feePct: 0, fxMarginPct: 1.1, speed: "minutes–1j" },
  { id: "taptap", name: "TapTapSend", kind: "fintech", feeFixed: 0, feePct: 0, fxMarginPct: 1.0, speed: "minutes" },
  { id: "ria", name: "Ria", kind: "fintech", feeFixed: 0, feePct: 0, fxMarginPct: 1.3, speed: "minutes–1j" },
  { id: "moneygram", name: "MoneyGram", kind: "cash", feeFixed: 1.5, feePct: 0, fxMarginPct: 1.6, speed: "minutes" },
  { id: "wu", name: "Western Union", kind: "cash", feeFixed: 0, feePct: 0, fxMarginPct: 2.6, speed: "minutes" },
  { id: "banque", name: "Virement bancaire", kind: "banque", feeFixed: 5, feePct: 0, fxMarginPct: 3.6, speed: "2–4 jours" },
];

export type Quote = {
  operator: Operator;
  /** Total des frais affichés, en devise */
  feeTotal: number;
  /** Taux appliqué après marge cachée */
  effectiveRate: number;
  /** MAD réellement reçus par le bénéficiaire */
  receivedMad: number;
  /** Coût total réel en devise (frais + marge), vs envoi au taux interbancaire */
  realCostCcy: number;
  /** Coût total en % du montant envoyé */
  realCostPct: number;
};

/** Calcule un devis pour un opérateur, un corridor et un montant. */
export function quote(op: Operator, corridor: Corridor, amount: number): Quote {
  const feeTotal = op.feeFixed + (amount * op.feePct) / 100;
  const effectiveRate = corridor.interbankRate * (1 - op.fxMarginPct / 100);
  const receivedMad = Math.max(0, (amount - feeTotal) * effectiveRate);
  const idealMad = amount * corridor.interbankRate; // ce que le bénéficiaire recevrait au taux réel
  const realCostCcy = (idealMad - receivedMad) / corridor.interbankRate;
  const realCostPct = amount > 0 ? (realCostCcy / amount) * 100 : 0;
  return { operator: op, feeTotal, effectiveRate, receivedMad, realCostCcy, realCostPct };
}

/** Classe tous les opérateurs du meilleur (plus de MAD reçus) au pire. */
export function rankQuotes(corridorId: string, amount: number): Quote[] {
  const corridor = CORRIDORS.find((c) => c.id === corridorId) ?? CORRIDORS[0];
  return OPERATORS.map((op) => quote(op, corridor, amount)).sort((a, b) => b.receivedMad - a.receivedMad);
}

export type Revealer = {
  best: Quote;
  worst: Quote;
  /** MAD de plus que reçoit le bénéficiaire avec le meilleur vs le pire, par envoi */
  diffPerSendMad: number;
  /** Économie annuelle si envoi mensuel */
  annualSavingMad: number;
  corridor: Corridor;
};

/** Le "révélateur" viral : combien tu perds en restant sur le pire opérateur. */
export function revealer(corridorId: string, amount: number): Revealer {
  const corridor = CORRIDORS.find((c) => c.id === corridorId) ?? CORRIDORS[0];
  const ranked = rankQuotes(corridorId, amount);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const diffPerSendMad = Math.round(best.receivedMad - worst.receivedMad);
  return {
    best,
    worst,
    diffPerSendMad,
    annualSavingMad: diffPerSendMad * 12,
    corridor,
  };
}
