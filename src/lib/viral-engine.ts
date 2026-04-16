// ==============================================================================
// VIRAL ENGINE — Referral Loops, Invite Links & Milestone Unlocks
// Strategy: Double-sided incentives (PLG) & Social Proof
// ==============================================================================

import { z } from "zod";

export interface ReferralData {
  userId: string;
  referralCode: string;
  invitesSent: number;
  successfulInvites: number;
  unlockedFeatures: string[];
}

export const ViralMilestones = [
  { requiredInvites: 1, reward: "Badge 'Connecteur', 500 XP", featureId: "safe_zone_access" },
  { requiredInvites: 3, reward: "Simulateur Fiscal Avancé", featureId: "tax_optimizer_pro" },
  { requiredInvites: 10, reward: "Statut 'Légende' & J.A.R.V.I.S illimité", featureId: "jarvis_god_mode" },
];

// Schema pour la validation de l'invitation
export const InviteSchema = z.object({
  inviterCode: z.string().min(6).max(10),
  newUserId: z.string(),
});

export class ViralEngine {
  /**
   * Génère un code de parrainage unique, mémorisable et esthétique
   */
  static generateReferralCode(userName: string): string {
    const prefix = userName.substring(0, 3).toUpperCase();
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${suffix}`;
  }

  /**
   * Construit le lien dynamique de partage (Deep Link / URL)
   */
  static createInviteLink(referralCode: string, language: string = "fr"): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://odyssey-ai.app";
    return `${baseUrl}/invite/${referralCode}?lang=${language}`;
  }

  /**
   * Génère le message viral hautement optimisé pour la conversion
   */
  static getViralShareMessage(userName: string, referralCode: string): string {
    return `Salut ! J'utilise Odyssey.ai pour planifier mon expatriation et ma liberté financière. L'IA personnelle est bluffante. 

Rejoins-moi dans la Safe-Zone et débloquons ensemble le Simulateur Fiscal Avancé avec mon lien VIP :
${this.createInviteLink(referralCode)}

#DigitalNomad #OdysseyAI`;
  }

  /**
   * Logique à exécuter quand un nouvel utilisateur s'inscrit via un lien
   */
  static async processSuccessfulInvite(inviterId: string, newUserId: string) {
    // 1. Logique métier: Mettre à jour Firestore pour incrémenter successfulInvites de l'inviter
    // 2. Logique métier: Donner un boost d'XP au nouvel utilisateur (newUserId)
    // 3. Vérifier si un nouveau Milestone (ViralMilestones) est débloqué pour l'inviter
    
    console.log(`[VIRAL] Utilisateur ${newUserId} invité par ${inviterId}`);
    
    return {
      success: true,
      message: "Boucle virale déclenchée. XP attribuée aux deux utilisateurs.",
      unlockedFeature: this.checkMilestones(1) // Simulation: passage de 0 à 1
    };
  }

  private static checkMilestones(currentInvites: number) {
    const milestone = ViralMilestones.slice().reverse().find(m => currentInvites >= m.requiredInvites);
    return milestone ? milestone.featureId : null;
  }
}