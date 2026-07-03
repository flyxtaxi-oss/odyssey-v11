// ==============================================================================
// MODERATION — Modération de contenu déterministe pour la Safe-Zone
// ------------------------------------------------------------------------------
// Remplace l'ancien `Math.random()` par une vraie heuristique lexicale
// (multilingue FR/EN/AR translittéré), qui calcule un score de toxicité
// reproductible. Peut être complétée plus tard par une modération IA.
// ==============================================================================

export interface ModerationResult {
  /** Score de toxicité 0 (sain) → 1 (toxique) */
  toxicityScore: number;
  /** Le contenu passe-t-il la modération ? */
  isVerified: boolean;
  /** Catégories détectées */
  categories: string[];
  /** Termes déclencheurs (pour audit, non exposés à l'utilisateur) */
  matched: string[];
}

// Lexiques par catégorie. Volontairement conservateur pour éviter les faux positifs.
const LEXICONS: Record<string, string[]> = {
  hate: [
    "raciste", "racist", "sale arabe", "bougnoule", "negro", "nègre",
    "kike", "faggot", "pédé", "tapette", "youpin",
  ],
  harassment: [
    "va te tuer", "tue toi", "kill yourself", "kys", "ferme ta gueule",
    "connard", "connasse", "salope", "enculé", "fils de pute", "fdp",
  ],
  violence: [
    "je vais te tuer", "i will kill you", "égorger", "attentat", "bombe artisanale",
  ],
  scam: [
    "western union gratuit", "double ton argent", "investissement garanti",
    "envoie tes identifiants", "code de ta carte", "clé privée", "seed phrase",
    "gagne 5000", "argent facile", "cliquez ici pour gagner",
  ],
  spam: [
    "http://bit.ly", "t.me/", "whatsapp +", "telegram @", "abonne toi à ma chaine",
  ],
};

const CATEGORY_WEIGHT: Record<string, number> = {
  hate: 0.9,
  harassment: 0.7,
  violence: 1.0,
  scam: 0.8,
  spam: 0.4,
};

/**
 * Analyse un texte et renvoie un score de toxicité déterministe.
 * `isVerified` = true si le contenu peut être publié.
 */
export function moderateContent(content: string): ModerationResult {
  const text = normalize(content);
  const categories = new Set<string>();
  const matched: string[] = [];
  let maxWeight = 0;

  for (const [category, terms] of Object.entries(LEXICONS)) {
    for (const term of terms) {
      if (text.includes(normalize(term))) {
        categories.add(category);
        matched.push(term);
        maxWeight = Math.max(maxWeight, CATEGORY_WEIGHT[category] ?? 0.5);
      }
    }
  }

  // Signaux additionnels faibles : CRIER EN MAJUSCULES, répétition de caractères.
  let extra = 0;
  if (isMostlyUppercase(content)) extra += 0.1;
  if (hasExcessiveRepetition(content)) extra += 0.1;

  const toxicityScore = clamp(maxWeight + (maxWeight > 0 ? extra : extra * 0.5), 0, 1);
  const isVerified = toxicityScore < 0.5;

  return {
    toxicityScore: round2(toxicityScore),
    isVerified,
    categories: Array.from(categories),
    matched,
  };
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accents
    .replace(/\s+/g, " ")
    .trim();
}

function isMostlyUppercase(s: string): boolean {
  const letters = s.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 8) return false;
  const upper = s.replace(/[^A-Z]/g, "").length;
  return upper / letters.length > 0.7;
}

function hasExcessiveRepetition(s: string): boolean {
  return /(.)\1{5,}/.test(s);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
