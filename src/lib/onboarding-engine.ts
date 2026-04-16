// ==============================================================================
// ONBOARDING ENGINE — AI-Guided Setup for Odyssey
// Solves: Time-To-Value (TTV) & Extreme Personalization
// ==============================================================================

import { z } from "zod";

export type OnboardingPhase = "discovery" | "financial" | "goals" | "complete";

export interface UserBlueprint {
  currentLocation?: string;
  targetDestinations?: string[];
  monthlyIncome?: number;
  profession?: string;
  topGoals?: string[]; // ex: "Payer moins d'impôts", "Meilleure météo", "Rencontrer des founders"
}

export class OnboardingEngine {
  /**
   * Fournit le prompt système dynamique pour que JARVIS gère l'onboarding
   * au lieu d'avoir un formulaire ennuyeux.
   */
  static getOnboardingPrompt(phase: OnboardingPhase, userName: string): string {
    const basePrompt = `Tu es J.A.R.V.I.S. Tu accueilles ${userName} pour sa première session sur Odyssey. Ton but est de découvrir ses besoins sans avoir l'air d'un interrogatoire. Sois chaleureux, concis et impressionnant.`;

    switch (phase) {
      case "discovery":
        return `${basePrompt}
Demande-lui où il/elle se trouve actuellement et s'il/elle a déjà une idée de sa prochaine destination idéale.`;
      case "financial":
        return `${basePrompt}
Tu sais où il veut aller. Demande-lui maintenant avec tact son domaine d'activité et s'il se sent à l'aise de partager une estimation de ses revenus pour calculer la viabilité des visas (D7, NHR, Digital Nomad).`;
      case "goals":
        return `${basePrompt}
Pour finir, demande-lui ce qui compte le plus : optimisation fiscale, qualité de vie, ou réseau social / rencontres pro ?`;
      case "complete":
        return `${basePrompt}
Remercie-le. Génère un résumé de 3 lignes de son profil (Le 'Blueprint') et dis-lui que son simulateur personnalisé est prêt.`;
    }
  }

  /**
   * Extrait structurément les données depuis la conversation d'onboarding
   * (Sera utilisé par le Tool Calling de l'Action Engine)
   */
  static analyzeOnboardingData(conversationHistory: string): UserBlueprint {
    // Note: Dans la réalité, cette méthode utiliserait generateObject() du Vercel AI SDK
    // pour extraire le JSON strict de la conversation.
    return {
      currentLocation: "Paris", // Mock extraction
      targetDestinations: ["Lisbonne", "Dubaï"],
      monthlyIncome: 4000,
      profession: "Développeur Freelance",
      topGoals: ["Optimisation fiscale", "Qualité de vie"],
    };
  }

  /**
   * Crée le moment "Aha!" : Le premier plan d'action immédiat.
   */
  static generateAhaMoment(blueprint: UserBlueprint): string {
    if (!blueprint.targetDestinations || blueprint.targetDestinations.length === 0) {
      return "Laisse-moi te proposer 3 destinations basées sur ton profil...";
    }

    const dest = blueprint.targetDestinations[0];
    return `⚡ **Analyse Express terminée !**

Basé sur ton revenu de ${blueprint.monthlyIncome}€ en tant que ${blueprint.profession} :
- **${dest}** est un match à 85%.
- **Visa recommandé** : Digital Nomad / D7 (tu dépasses le seuil requis).
- **Gain estimé** : Tu pourrais économiser ~30% sur tes impôts par rapport à ta situation actuelle.

👉 J'ai configuré ton **Simulateur** et débloqué ton premier badge de la **Safe-Zone**. Qu'est-ce qu'on explore en premier ?`;
  }
}