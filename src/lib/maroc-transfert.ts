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

/**
 * Provenance d'un tarif. Obligatoire — voir la note sur OPERATORS.
 *
 * `verified: false` signifie « ordre de grandeur non relevé » : la donnée est
 * affichée avec un avertissement et ne doit jamais être présentée comme un
 * tarif constaté.
 */
export type PricingSource = {
  /** true seulement si le tarif a été relevé sur le site de l'opérateur. */
  verified: boolean;
  /** URL de la grille tarifaire publique. */
  url?: string;
  /** Date du relevé, ISO (YYYY-MM-DD). */
  observedAt?: string;
};

export type Operator = {
  id: string;
  /** Nom commercial réel de l'opérateur. */
  name: string;
  kind: "fintech" | "cash" | "banque";
  /** Frais fixes affichés, en devise d'envoi */
  feeFixed: number;
  /** Frais variables affichés (% du montant) */
  feePct: number;
  /** Marge de change (% retranché du taux interbancaire) */
  fxMarginPct: number;
  speed: string;
  /**
   * Provenance du tarif. Champ OBLIGATOIRE : c'est ce qui empêche d'ajouter un
   * opérateur nommé sans savoir d'où sortent ses chiffres. Le compilateur
   * refuse une entrée qui l'omet.
   */
  source: PricingSource;
};

/**
 * ⚠️  DONNÉES NON VÉRIFIÉES — À RELEVER AVANT TOUTE MISE EN AVANT COMMERCIALE
 *
 * Ces valeurs étaient présentées comme des marges « cachées » constatées, avec
 * une précision au dixième de point (Western Union 2,6 %, virement bancaire
 * 3,6 %), attribuées NOMINATIVEMENT à des entreprises réelles — sans source et
 * sans date de relevé.
 *
 * Deux problèmes distincts :
 *
 * 1. Juridique. Diffuser publiquement qu'une société identifiée prélève une
 *    marge occulte chiffrée, sans pouvoir l'établir, relève du dénigrement
 *    commercial (art. 1240 du Code civil). Wise, Western Union et MoneyGram ont
 *    des services juridiques ; une mise en demeure ne coûte rien à envoyer.
 *
 * 2. Produit. Ces tarifs bougent en permanence — par corridor, par montant, par
 *    moyen de paiement et par jour. Un chiffre figé dans le code est faux la
 *    semaine suivante, même s'il était juste à l'écriture.
 *
 * La comparaison reste un bon outil : l'écart entre frais affichés et coût réel
 * est un vrai angle, et il est pédagogiquement juste. Mais il doit s'appuyer
 * sur des relevés datés. Pour publier :
 *   a) relever chaque grille sur le site de l'opérateur, renseigner `url` et
 *      `observedAt`, et passer `verified: true` ; ou
 *   b) brancher une API de comparaison temps réel ; ou
 *   c) retirer les noms et ne raisonner que par catégorie
 *      (« fintech », « cash », « banque »), ce qui n'engage personne.
 *
 * Tant que `verified` est false, l'interface doit l'annoncer (voir
 * `hasUnverifiedPricing`).
 */
const UNVERIFIED: PricingSource = { verified: false };

export const OPERATORS: Operator[] = [
  { id: "wise", name: "Wise", kind: "fintech", feeFixed: 1.2, feePct: 0.5, fxMarginPct: 0.0, speed: "qq heures", source: UNVERIFIED },
  { id: "remitly", name: "Remitly", kind: "fintech", feeFixed: 0, feePct: 0, fxMarginPct: 1.1, speed: "minutes–1j", source: UNVERIFIED },
  { id: "taptap", name: "TapTapSend", kind: "fintech", feeFixed: 0, feePct: 0, fxMarginPct: 1.0, speed: "minutes", source: UNVERIFIED },
  { id: "ria", name: "Ria", kind: "fintech", feeFixed: 0, feePct: 0, fxMarginPct: 1.3, speed: "minutes–1j", source: UNVERIFIED },
  { id: "moneygram", name: "MoneyGram", kind: "cash", feeFixed: 1.5, feePct: 0, fxMarginPct: 1.6, speed: "minutes", source: UNVERIFIED },
  { id: "wu", name: "Western Union", kind: "cash", feeFixed: 0, feePct: 0, fxMarginPct: 2.6, speed: "minutes", source: UNVERIFIED },
  { id: "banque", name: "Virement bancaire", kind: "banque", feeFixed: 5, feePct: 0, fxMarginPct: 3.6, speed: "2–4 jours", source: UNVERIFIED },
];

/**
 * true tant qu'au moins un tarif affiché n'a pas été relevé.
 *
 * L'interface s'en sert pour afficher l'avertissement. Exposer un booléen
 * calculé plutôt qu'une constante écrite à la main garantit que
 * l'avertissement disparaît exactement quand les relevés sont faits — ni
 * avant, ni après.
 */
export function hasUnverifiedPricing(): boolean {
  return OPERATORS.some((o) => !o.source.verified);
}

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
