// ==============================================================================
// i18n — Internationalization Layer for Odyssey.ai
// Supports: FR (French), EN (English), NL (Dutch)
// ==============================================================================

export type Locale = "fr" | "en" | "nl";

export const SUPPORTED_LOCALES: Locale[] = ["fr", "en", "nl"];

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  nl: "Nederlands",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  nl: "🇳🇱",
};

// ─── Translation Dictionary ─────────────────────────────────────────────────

type TranslationKeys = {
  // Layout & Navigation
  "nav.dashboard": string;
  "nav.jarvis": string;
  "nav.simulator": string;
  "nav.safezone": string;
  "nav.language": string;
  "nav.skills": string;
  "nav.settings": string;

  // Dashboard
  "dashboard.greeting": string;
  "dashboard.subtitle": string;
  "dashboard.systemOnline": string;
  "dashboard.activeModules": string;
  "dashboard.modules": string;
  "dashboard.odysseyScore": string;
  "dashboard.globalPerformance": string;
  "dashboard.activity": string;
  "dashboard.seeAll": string;

  // Stats
  "stats.score": string;
  "stats.mentalClarity": string;
  "stats.countriesSimulated": string;
  "stats.connections": string;
  "stats.thisWeek": string;
  "stats.pts": string;

  // Score Axes
  "score.mentalClarity": string;
  "score.financialHealth": string;
  "score.globalMobility": string;
  "score.networkMentors": string;
  "score.executionAction": string;

  // Activity
  "activity.conversationsToday": string;
  "activity.postsThisWeek": string;
  "activity.simulationsRun": string;
  "activity.badgesEarned": string;

  // Command Center
  "command.placeholder": string;
  "command.suggestions": string;
  "command.confirm": string;
  "command.cancel": string;
  "command.newSearch": string;
  "command.close": string;
  "command.execute": string;
  "command.analyzing": string;
  "command.executing": string;
  "command.confirmRequired": string;
  "command.error": string;
  "command.retry": string;
  "command.restaurantsFound": string;
  "command.actionComplete": string;
  "command.actionFailed": string;

  // Modules
  "module.jarvis.desc": string;
  "module.simulator.desc": string;
  "module.safezone.desc": string;
  "module.language.desc": string;
  "module.skills.desc": string;

  // Language Lab
  "lang.title": string;
  "lang.level": string;
  "lang.streak": string;
  "lang.dailyLesson": string;
  "lang.flashcards": string;
  "lang.roleplay": string;
  "lang.placementTest": string;

  // Skills
  "skills.title": string;
  "skills.addSkill": string;
  "skills.activeTracks": string;
  "skills.activeMissions": string;
  "skills.completed": string;
  "skills.xpGained": string;
  "skills.level": string;

  // Settings
  "settings.title": string;
  "settings.language": string;
  "settings.theme": string;
  "settings.notifications": string;
  "settings.privacy": string;
  "settings.exportData": string;
  "settings.deleteAccount": string;

  // Common
  "common.loading": string;
  "common.save": string;
  "common.delete": string;
  "common.edit": string;
  "common.back": string;
  "common.next": string;
  "common.done": string;
  "common.today": string;
  "common.realTime": string;
};

const translations: Record<Locale, TranslationKeys> = {
  // ─── FRENCH ──────────────────────────────────────────────────────────────
  fr: {
    "nav.dashboard": "Tableau de Bord",
    "nav.jarvis": "J.A.R.V.I.S.",
    "nav.simulator": "Simulateur",
    "nav.safezone": "Safe-Zone",
    "nav.language": "Language Lab",
    "nav.skills": "Skill Accelerator",
    "nav.settings": "Paramètres",

    "dashboard.greeting": "Bonjour,",
    "dashboard.subtitle": "Tous vos modules sont synchronisés. Explorez vos données et prenez les meilleures décisions.",
    "dashboard.systemOnline": "Système en ligne",
    "dashboard.activeModules": "Modules Actifs",
    "dashboard.modules": "Modules",
    "dashboard.odysseyScore": "Sys.Score",
    "dashboard.globalPerformance": "Performance globale",
    "dashboard.activity": "Activité",
    "dashboard.seeAll": "TOUT VOIR",

    "stats.score": "Odyssey Score",
    "stats.mentalClarity": "Clarté Mentale",
    "stats.countriesSimulated": "Pays Simulés",
    "stats.connections": "Connexions",
    "stats.thisWeek": "cette semaine",
    "stats.pts": "PTS",

    "score.mentalClarity": "Clarté Mentale",
    "score.financialHealth": "Santé Financière",
    "score.globalMobility": "Mobilité Globale",
    "score.networkMentors": "Réseau & Mentors",
    "score.executionAction": "Exécution & Action",

    "activity.conversationsToday": "conversations aujourd'hui",
    "activity.postsThisWeek": "posts cette semaine",
    "activity.simulationsRun": "simulations lancées",
    "activity.badgesEarned": "badges obtenus",

    "command.placeholder": "Que puis-je faire pour toi ? (ex: trouve un japonais ce soir)",
    "command.suggestions": "Suggestions",
    "command.confirm": "Confirmer",
    "command.cancel": "Annuler",
    "command.newSearch": "Nouvelle recherche",
    "command.close": "Fermer",
    "command.execute": "exécuter",
    "command.analyzing": "JARVIS analyse ta demande…",
    "command.executing": "Exécution en cours…",
    "command.confirmRequired": "⚠️ Confirmation requise",
    "command.error": "Erreur",
    "command.retry": "Réessayer",
    "command.restaurantsFound": "restaurants trouvés",
    "command.actionComplete": "Action terminée",
    "command.actionFailed": "Échec",

    "module.jarvis.desc": "Intelligence personnelle core",
    "module.simulator.desc": "Moteur prédictif multipays",
    "module.safezone.desc": "Réseau crypté modéré",
    "module.language.desc": "Immersion linguistique & IA",
    "module.skills.desc": "Apprentissage & Missions XP",

    "lang.title": "Language Lab",
    "lang.level": "Niveau",
    "lang.streak": "Série",
    "lang.dailyLesson": "Leçon du jour",
    "lang.flashcards": "Cartes mémoire",
    "lang.roleplay": "Jeu de rôle",
    "lang.placementTest": "Test de placement",

    "skills.title": "Skill Accelerator",
    "skills.addSkill": "Ajouter une compétence",
    "skills.activeTracks": "Pistes Actives",
    "skills.activeMissions": "Missions Actives",
    "skills.completed": "Complété",
    "skills.xpGained": "XP gagné",
    "skills.level": "Niveau",

    "settings.title": "Paramètres",
    "settings.language": "Langue",
    "settings.theme": "Thème",
    "settings.notifications": "Notifications",
    "settings.privacy": "Confidentialité",
    "settings.exportData": "Exporter mes données",
    "settings.deleteAccount": "Supprimer mon compte",

    "common.loading": "Chargement…",
    "common.save": "Sauvegarder",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.back": "Retour",
    "common.next": "Suivant",
    "common.done": "Terminé",
    "common.today": "Aujourd'hui",
    "common.realTime": "Temps réel",
  },

  // ─── ENGLISH ─────────────────────────────────────────────────────────────
  en: {
    "nav.dashboard": "Dashboard",
    "nav.jarvis": "J.A.R.V.I.S.",
    "nav.simulator": "Simulator",
    "nav.safezone": "Safe-Zone",
    "nav.language": "Language Lab",
    "nav.skills": "Skill Accelerator",
    "nav.settings": "Settings",

    "dashboard.greeting": "Hello,",
    "dashboard.subtitle": "All your modules are synchronized. Explore your data and make the best decisions.",
    "dashboard.systemOnline": "System online",
    "dashboard.activeModules": "Active Modules",
    "dashboard.modules": "Modules",
    "dashboard.odysseyScore": "Sys.Score",
    "dashboard.globalPerformance": "Global performance",
    "dashboard.activity": "Activity",
    "dashboard.seeAll": "SEE ALL",

    "stats.score": "Odyssey Score",
    "stats.mentalClarity": "Mental Clarity",
    "stats.countriesSimulated": "Countries Simulated",
    "stats.connections": "Connections",
    "stats.thisWeek": "this week",
    "stats.pts": "PTS",

    "score.mentalClarity": "Mental Clarity",
    "score.financialHealth": "Financial Health",
    "score.globalMobility": "Global Mobility",
    "score.networkMentors": "Network & Mentors",
    "score.executionAction": "Execution & Action",

    "activity.conversationsToday": "conversations today",
    "activity.postsThisWeek": "posts this week",
    "activity.simulationsRun": "simulations run",
    "activity.badgesEarned": "badges earned",

    "command.placeholder": "What can I do for you? (e.g., find a Japanese restaurant tonight)",
    "command.suggestions": "Suggestions",
    "command.confirm": "Confirm",
    "command.cancel": "Cancel",
    "command.newSearch": "New search",
    "command.close": "Close",
    "command.execute": "execute",
    "command.analyzing": "JARVIS is analyzing your request…",
    "command.executing": "Executing…",
    "command.confirmRequired": "⚠️ Confirmation required",
    "command.error": "Error",
    "command.retry": "Retry",
    "command.restaurantsFound": "restaurants found",
    "command.actionComplete": "Action complete",
    "command.actionFailed": "Failed",

    "module.jarvis.desc": "Core personal intelligence",
    "module.simulator.desc": "Predictive multi-country engine",
    "module.safezone.desc": "Encrypted moderated network",
    "module.language.desc": "Language immersion & AI",
    "module.skills.desc": "Learning & XP Missions",

    "lang.title": "Language Lab",
    "lang.level": "Level",
    "lang.streak": "Streak",
    "lang.dailyLesson": "Daily Lesson",
    "lang.flashcards": "Flashcards",
    "lang.roleplay": "Roleplay",
    "lang.placementTest": "Placement Test",

    "skills.title": "Skill Accelerator",
    "skills.addSkill": "Add a skill",
    "skills.activeTracks": "Active Tracks",
    "skills.activeMissions": "Active Missions",
    "skills.completed": "Completed",
    "skills.xpGained": "XP earned",
    "skills.level": "Level",

    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.theme": "Theme",
    "settings.notifications": "Notifications",
    "settings.privacy": "Privacy",
    "settings.exportData": "Export my data",
    "settings.deleteAccount": "Delete my account",

    "common.loading": "Loading…",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.back": "Back",
    "common.next": "Next",
    "common.done": "Done",
    "common.today": "Today",
    "common.realTime": "Real-time",
  },

  // ─── DUTCH ───────────────────────────────────────────────────────────────
  nl: {
    "nav.dashboard": "Dashboard",
    "nav.jarvis": "J.A.R.V.I.S.",
    "nav.simulator": "Simulator",
    "nav.safezone": "Safe-Zone",
    "nav.language": "Taallabo",
    "nav.skills": "Vaardigheidsversneller",
    "nav.settings": "Instellingen",

    "dashboard.greeting": "Hallo,",
    "dashboard.subtitle": "Al je modules zijn gesynchroniseerd. Verken je gegevens en neem de beste beslissingen.",
    "dashboard.systemOnline": "Systeem online",
    "dashboard.activeModules": "Actieve Modules",
    "dashboard.modules": "Modules",
    "dashboard.odysseyScore": "Sys.Score",
    "dashboard.globalPerformance": "Globale prestatie",
    "dashboard.activity": "Activiteit",
    "dashboard.seeAll": "ALLES ZIEN",

    "stats.score": "Odyssey Score",
    "stats.mentalClarity": "Mentale Helderheid",
    "stats.countriesSimulated": "Gesimuleerde Landen",
    "stats.connections": "Verbindingen",
    "stats.thisWeek": "deze week",
    "stats.pts": "PTS",

    "score.mentalClarity": "Mentale Helderheid",
    "score.financialHealth": "Financiële Gezondheid",
    "score.globalMobility": "Globale Mobiliteit",
    "score.networkMentors": "Netwerk & Mentoren",
    "score.executionAction": "Uitvoering & Actie",

    "activity.conversationsToday": "gesprekken vandaag",
    "activity.postsThisWeek": "berichten deze week",
    "activity.simulationsRun": "simulaties uitgevoerd",
    "activity.badgesEarned": "badges verdiend",

    "command.placeholder": "Wat kan ik voor je doen? (bijv. vind een Japans restaurant vanavond)",
    "command.suggestions": "Suggesties",
    "command.confirm": "Bevestigen",
    "command.cancel": "Annuleren",
    "command.newSearch": "Nieuw zoeken",
    "command.close": "Sluiten",
    "command.execute": "uitvoeren",
    "command.analyzing": "JARVIS analyseert je verzoek…",
    "command.executing": "Uitvoering bezig…",
    "command.confirmRequired": "⚠️ Bevestiging vereist",
    "command.error": "Fout",
    "command.retry": "Opnieuw proberen",
    "command.restaurantsFound": "restaurants gevonden",
    "command.actionComplete": "Actie voltooid",
    "command.actionFailed": "Mislukt",

    "module.jarvis.desc": "Kern persoonlijke intelligentie",
    "module.simulator.desc": "Voorspellende multi-land motor",
    "module.safezone.desc": "Versleuteld gemodereerd netwerk",
    "module.language.desc": "Taalimmersie & AI",
    "module.skills.desc": "Leren & XP Missies",

    "lang.title": "Taallabo",
    "lang.level": "Niveau",
    "lang.streak": "Reeks",
    "lang.dailyLesson": "Dagles",
    "lang.flashcards": "Geheugenkaarten",
    "lang.roleplay": "Rollenspel",
    "lang.placementTest": "Plaatsingstest",

    "skills.title": "Vaardigheidsversneller",
    "skills.addSkill": "Vaardigheid toevoegen",
    "skills.activeTracks": "Actieve Paden",
    "skills.activeMissions": "Actieve Missies",
    "skills.completed": "Voltooid",
    "skills.xpGained": "XP verdiend",
    "skills.level": "Niveau",

    "settings.title": "Instellingen",
    "settings.language": "Taal",
    "settings.theme": "Thema",
    "settings.notifications": "Meldingen",
    "settings.privacy": "Privacy",
    "settings.exportData": "Mijn gegevens exporteren",
    "settings.deleteAccount": "Mijn account verwijderen",

    "common.loading": "Laden…",
    "common.save": "Opslaan",
    "common.delete": "Verwijderen",
    "common.edit": "Bewerken",
    "common.back": "Terug",
    "common.next": "Volgende",
    "common.done": "Klaar",
    "common.today": "Vandaag",
    "common.realTime": "Realtime",
  },
};

// ─── Core Translation Function ──────────────────────────────────────────────

const DEFAULT_LOCALE: Locale = "fr";

export function t(key: keyof TranslationKeys, locale: Locale = DEFAULT_LOCALE): string {
  return translations[locale]?.[key] ?? translations[DEFAULT_LOCALE][key] ?? key;
}

// ─── Language Auto-Detection (from user message) ─────────────────────────────

const LANG_PATTERNS: Record<Locale, RegExp[]> = {
  fr: [
    /\b(je|tu|nous|vous|ils|elles|mon|ton|son|notre|votre|leur|bonjour|salut|merci|oui|non|et|est|suis|fait|dans|pour|avec|cette|c'est|qu'est|j'ai|je veux|s'il vous plaît)\b/i,
  ],
  en: [
    /\b(the|is|are|was|were|have|has|had|will|would|could|should|can|may|might|must|shall|this|that|these|those|my|your|his|her|its|our|their|hello|hi|thanks|yes|no|please|want|need)\b/i,
  ],
  nl: [
    /\b(ik|jij|hij|zij|wij|jullie|mijn|jouw|zijn|haar|ons|hun|hallo|hoi|dank|ja|nee|en|is|ben|heb|heeft|voor|met|deze|dit|dat|die|wat|wie|waar|wanneer|waarom|alstublieft)\b/i,
  ],
};

export function detectLanguage(text: string): Locale {
  const scores: Record<Locale, number> = { fr: 0, en: 0, nl: 0 };

  for (const locale of SUPPORTED_LOCALES) {
    for (const pattern of LANG_PATTERNS[locale]) {
      const matches = text.match(new RegExp(pattern, "gi"));
      if (matches) scores[locale] += matches.length;
    }
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return (best[1] > 0 ? best[0] : DEFAULT_LOCALE) as Locale;
}

// ─── JARVIS System Prompt per Locale ─────────────────────────────────────────

export function getJarvisLocaleInstruction(locale: Locale): string {
  const instructions: Record<Locale, string> = {
    fr: "Tu réponds TOUJOURS en français. Ton ton est professionnel mais chaleureux, comme un consultant McKinsey qui est aussi ton ami proche.",
    en: "You ALWAYS respond in English. Your tone is professional yet warm, like a McKinsey consultant who is also your close friend.",
    nl: "Je antwoordt ALTIJD in het Nederlands. Je toon is professioneel maar warm, als een McKinsey-consultant die ook je goede vriend is.",
  };
  return instructions[locale];
}
