// ==============================================================================
// i18n — Internationalization Layer for Odyssey.ai
// Supports: FR (French), EN (English), NL (Dutch)
// ==============================================================================

export type Locale = "fr" | "en" | "nl" | "es" | "pt" | "de" | "ar";

export const SUPPORTED_LOCALES: Locale[] = ["fr", "en", "es", "pt", "de", "nl", "ar"];

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  nl: "Nederlands",
  es: "Español",
  pt: "Português",
  de: "Deutsch",
  ar: "العربية",
};

/**
 * Writing direction. Arabic is right-to-left: without setting `dir`, the whole
 * layout mirrors incorrectly — punctuation lands on the wrong side, and mixed
 * Arabic/Latin strings (dates, "€", visa names) render in a jumbled order.
 * Setting it on <html> lets the browser handle bidirectional text natively.
 */
export const LOCALE_DIR: Record<Locale, "ltr" | "rtl"> = {
  fr: "ltr",
  en: "ltr",
  nl: "ltr",
  es: "ltr",
  pt: "ltr",
  de: "ltr",
  ar: "rtl",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  nl: "🇳🇱",
  es: "🇪🇸",
  pt: "🇵🇹",
  de: "🇩🇪",
  ar: "🇲🇦",
};

// ─── Translation Dictionary ─────────────────────────────────────────────────

export type TranslationKeys = {
  // Layout & Navigation
  "nav.dashboard": string;
  "nav.jarvis": string;
  "nav.simulator": string;
  "nav.safezone": string;
  "nav.language": string;
  "nav.skills": string;
  "nav.settings": string;
  "nav.predict": string;
  "nav.visa": string;
  "nav.maroc": string;

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
  "dashboard.dataDemo": string;
  "dashboard.subtitleDemo": string;
  "module.predict.desc": string;
  "module.visa.desc": string;
  "module.maroc.desc": string;

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
  "settings.dangerZone": string;
  "settings.deleteWarning": string;
  "settings.deleteConfirmAction": string;
  "settings.accountPrivacy": string;
  "settings.saved": string;
  "settings.saving": string;
  "settings.saveError": string;
  "settings.aiData": string;
  "settings.alertsReports": string;
  "settings.appearance": string;
  "settings.themeDisplay": string;
  "settings.logout": string;
  "settings.identifier": string;
  "settings.memberSince": string;
  "toggle.memory": string;
  "toggle.memoryDesc": string;
  "toggle.extraction": string;
  "toggle.extractionDesc": string;
  "toggle.biometric": string;
  "toggle.biometricDesc": string;
  "toggle.opportunities": string;
  "toggle.opportunitiesDesc": string;
  "toggle.mentors": string;
  "toggle.mentorsDesc": string;
  "toggle.weekly": string;
  "toggle.weeklyDesc": string;

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
  "common.you": string;
  "sim.title": string;
  "sim.tagline": string;
  "sim.subtitle": string;
  "sim.save": string;
  "sim.saving": string;
  "sim.saved": string;
  "sim.chooseDestination": string;
  "sim.currentSituation": string;
  "sim.origin": string;
  "sim.grossSalary": string;
  "sim.tax": string;
  "sim.costOfLiving": string;
  "sim.climate": string;
  "sim.savingsCapacity": string;
  "sim.financialImpact": string;
  "sim.monthlyDelta": string;
  "sim.monthlyDeltaDesc": string;
  "sim.over36Months": string;
  "sim.over36MonthsDesc": string;
  "sim.over60Months": string;
  "sim.over60MonthsDesc": string;
  "sim.disclaimer": string;
};

/** A valid translation key. Using this type means a typo is a build error,
    not a key echoed back to the user at runtime. */
export type TranslationKey = keyof TranslationKeys;

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
    "nav.predict": "Prédire",
    "nav.visa": "Suivi visa",
    "nav.maroc": "Vivre au Maroc",

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
    "module.safezone.desc": "Retours d'expérience entre expatriés",
    "module.language.desc": "Immersion linguistique & IA",
    "module.skills.desc": "Apprentissage & Missions XP",
    "dashboard.dataDemo": "Données de démonstration",
    "dashboard.subtitleDemo": "Aucune donnée personnelle encore enregistrée — les chiffres ci-dessous sont des exemples.",
    "module.predict.desc": "Simulation multi-agents",
    "module.visa.desc": "Suivi intelligent des visas",
    "module.maroc.desc": "Coût, séjour, fiscalité, MRE & invest",

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
    "settings.dangerZone": "Zone sensible",
    "settings.deleteWarning": "La suppression efface ton compte et toutes tes données (profil, simulations, conversations, check-ins). Cette action est définitive.",
    "settings.deleteConfirmAction": "Cliquer à nouveau pour supprimer définitivement",
    "settings.accountPrivacy": "Compte et confidentialité",
    "settings.saved": "Sauvegardé",
    "settings.saving": "Sauvegarde…",
    "settings.saveError": "Erreur de sauvegarde",
    "settings.aiData": "IA et données",
    "settings.alertsReports": "Alertes et rapports",
    "settings.appearance": "Apparence",
    "settings.themeDisplay": "Thème et affichage",
    "settings.logout": "Se déconnecter",
    "settings.identifier": "Identifiant",
    "settings.memberSince": "Membre depuis",
    "toggle.memory": "Mémoire J.A.R.V.I.S.",
    "toggle.memoryDesc": "Conservation du contexte conversationnel",
    "toggle.extraction": "Enrichissement du profil",
    "toggle.extractionDesc": "Complète ton profil depuis tes conversations",
    "toggle.biometric": "Verrouillage biométrique",
    "toggle.biometricDesc": "Déverrouillage par empreinte ou visage",
    "toggle.opportunities": "Alertes opportunités",
    "toggle.opportunitiesDesc": "Emploi, logement, changements de visa",
    "toggle.mentors": "Suggestions de contacts",
    "toggle.mentorsDesc": "Des membres qui ont fait le même parcours",
    "toggle.weekly": "Résumé hebdomadaire",
    "toggle.weeklyDesc": "Un récapitulatif de ta semaine par email",

    "common.loading": "Chargement…",
    "common.save": "Sauvegarder",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.back": "Retour",
    "common.next": "Suivant",
    "common.done": "Terminé",
    "common.today": "Aujourd'hui",
    "common.realTime": "Temps réel",
    "common.you": "Toi",
    "sim.title": "Simulateur de trajectoire",
    "sim.tagline": "Comparateur fiscal et coût de la vie",
    "sim.subtitle": "Compare ton pouvoir d'achat réel entre la France et ta destination : salaire, impôts, coût de la vie.",
    "sim.save": "Sauvegarder cette comparaison",
    "sim.saving": "Calcul…",
    "sim.saved": "Comparaison enregistrée",
    "sim.chooseDestination": "Choisis ta destination",
    "sim.currentSituation": "Ta situation actuelle",
    "sim.origin": "Origine",
    "sim.grossSalary": "Salaire brut",
    "sim.tax": "Impôts",
    "sim.costOfLiving": "Coût de la vie",
    "sim.climate": "Climat",
    "sim.savingsCapacity": "Capacité d'épargne mensuelle",
    "sim.financialImpact": "Impact financier",
    "sim.monthlyDelta": "Écart mensuel",
    "sim.monthlyDeltaDesc": "Surplus de trésorerie net",
    "sim.over36Months": "Sur 36 mois",
    "sim.over36MonthsDesc": "Capital supplémentaire accumulé",
    "sim.over60Months": "Sur 60 mois",
    "sim.over60MonthsDesc": "Trajectoire long terme",
    "sim.disclaimer": "Estimations indicatives, non contractuelles. Vérifie les conditions exactes auprès des autorités compétentes.",
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
    "nav.predict": "Predict",
    "nav.visa": "Visa tracker",
    "nav.maroc": "Living in Morocco",

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
    "dashboard.dataDemo": "Demo data",
    "dashboard.subtitleDemo": "No personal data saved yet — the figures below are examples.",
    "module.predict.desc": "Multi-agent simulation",
    "module.visa.desc": "Smart visa tracking",
    "module.maroc.desc": "Cost, stay, tax, diaspora & investment",

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
    "settings.dangerZone": "Danger zone",
    "settings.deleteWarning": "Deletion erases your account and all your data (profile, simulations, conversations, check-ins). This action is permanent.",
    "settings.deleteConfirmAction": "Click again to delete permanently",
    "settings.accountPrivacy": "Account and privacy",
    "settings.saved": "Saved",
    "settings.saving": "Saving…",
    "settings.saveError": "Could not save",
    "settings.aiData": "AI and data",
    "settings.alertsReports": "Alerts and reports",
    "settings.appearance": "Appearance",
    "settings.themeDisplay": "Theme and display",
    "settings.logout": "Sign out",
    "settings.identifier": "Account",
    "settings.memberSince": "Member since",
    "toggle.memory": "J.A.R.V.I.S. memory",
    "toggle.memoryDesc": "Keeps the context of your conversations",
    "toggle.extraction": "Profile enrichment",
    "toggle.extractionDesc": "Fills in your profile from your conversations",
    "toggle.biometric": "Biometric lock",
    "toggle.biometricDesc": "Unlock with fingerprint or face",
    "toggle.opportunities": "Opportunity alerts",
    "toggle.opportunitiesDesc": "Jobs, housing, visa changes",
    "toggle.mentors": "Suggested contacts",
    "toggle.mentorsDesc": "Members who took the same path",
    "toggle.weekly": "Weekly summary",
    "toggle.weeklyDesc": "A recap of your week by email",

    "common.loading": "Loading…",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.back": "Back",
    "common.next": "Next",
    "common.done": "Done",
    "common.today": "Today",
    "common.realTime": "Real-time",
    "common.you": "You",
    "sim.title": "Trajectory simulator",
    "sim.tagline": "Tax and cost-of-living comparator",
    "sim.subtitle": "Compare your real purchasing power between France and your destination: salary, tax, cost of living.",
    "sim.save": "Save this comparison",
    "sim.saving": "Calculating…",
    "sim.saved": "Comparison saved",
    "sim.chooseDestination": "Choose your destination",
    "sim.currentSituation": "Your current situation",
    "sim.origin": "Origin",
    "sim.grossSalary": "Gross salary",
    "sim.tax": "Tax",
    "sim.costOfLiving": "Cost of living",
    "sim.climate": "Climate",
    "sim.savingsCapacity": "Monthly savings capacity",
    "sim.financialImpact": "Financial impact",
    "sim.monthlyDelta": "Monthly difference",
    "sim.monthlyDeltaDesc": "Net cash-flow surplus",
    "sim.over36Months": "Over 36 months",
    "sim.over36MonthsDesc": "Extra capital accumulated",
    "sim.over60Months": "Over 60 months",
    "sim.over60MonthsDesc": "Long-term trajectory",
    "sim.disclaimer": "Indicative estimates, not contractual. Check the exact terms with the relevant authorities.",
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
    "nav.predict": "Voorspellen",
    "nav.visa": "Visumtracker",
    "nav.maroc": "Wonen in Marokko",

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
    "dashboard.dataDemo": "Demogegevens",
    "dashboard.subtitleDemo": "Nog geen persoonlijke gegevens opgeslagen — onderstaande cijfers zijn voorbeelden.",
    "module.predict.desc": "Multi-agentsimulatie",
    "module.visa.desc": "Slim visumbeheer",
    "module.maroc.desc": "Kosten, verblijf, belasting & investering",

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
    "settings.dangerZone": "Gevarenzone",
    "settings.deleteWarning": "Verwijderen wist je account en al je gegevens (profiel, simulaties, gesprekken, check-ins). Deze actie is definitief.",
    "settings.deleteConfirmAction": "Klik nogmaals om definitief te verwijderen",
    "settings.accountPrivacy": "Account en privacy",
    "settings.saved": "Opgeslagen",
    "settings.saving": "Opslaan…",
    "settings.saveError": "Opslaan mislukt",
    "settings.aiData": "AI en gegevens",
    "settings.alertsReports": "Meldingen en rapporten",
    "settings.appearance": "Weergave",
    "settings.themeDisplay": "Thema en weergave",
    "settings.logout": "Uitloggen",
    "settings.identifier": "Account",
    "settings.memberSince": "Lid sinds",
    "toggle.memory": "J.A.R.V.I.S.-geheugen",
    "toggle.memoryDesc": "Bewaart de context van je gesprekken",
    "toggle.extraction": "Profielverrijking",
    "toggle.extractionDesc": "Vult je profiel aan op basis van je gesprekken",
    "toggle.biometric": "Biometrische vergrendeling",
    "toggle.biometricDesc": "Ontgrendelen met vingerafdruk of gezicht",
    "toggle.opportunities": "Kansmeldingen",
    "toggle.opportunitiesDesc": "Werk, wonen, visumwijzigingen",
    "toggle.mentors": "Voorgestelde contacten",
    "toggle.mentorsDesc": "Leden die dezelfde stap zetten",
    "toggle.weekly": "Weekoverzicht",
    "toggle.weeklyDesc": "Een samenvatting van je week per e-mail",

    "common.loading": "Laden…",
    "common.save": "Opslaan",
    "common.delete": "Verwijderen",
    "common.edit": "Bewerken",
    "common.back": "Terug",
    "common.next": "Volgende",
    "common.done": "Klaar",
    "common.today": "Vandaag",
    "common.realTime": "Realtime",
    "common.you": "Jij",
    "sim.title": "Trajectsimulator",
    "sim.tagline": "Belasting- en levenskostenvergelijker",
    "sim.subtitle": "Vergelijk je echte koopkracht tussen Frankrijk en je bestemming: salaris, belasting, levenskosten.",
    "sim.save": "Deze vergelijking opslaan",
    "sim.saving": "Berekenen…",
    "sim.saved": "Vergelijking opgeslagen",
    "sim.chooseDestination": "Kies je bestemming",
    "sim.currentSituation": "Je huidige situatie",
    "sim.origin": "Herkomst",
    "sim.grossSalary": "Brutosalaris",
    "sim.tax": "Belasting",
    "sim.costOfLiving": "Levenskosten",
    "sim.climate": "Klimaat",
    "sim.savingsCapacity": "Maandelijkse spaarcapaciteit",
    "sim.financialImpact": "Financiële impact",
    "sim.monthlyDelta": "Maandelijks verschil",
    "sim.monthlyDeltaDesc": "Netto cashflowoverschot",
    "sim.over36Months": "Over 36 maanden",
    "sim.over36MonthsDesc": "Extra opgebouwd kapitaal",
    "sim.over60Months": "Over 60 maanden",
    "sim.over60MonthsDesc": "Langetermijntraject",
    "sim.disclaimer": "Indicatieve schattingen, niet bindend. Controleer de exacte voorwaarden bij de bevoegde instanties.",
  },

  // ─── SPANISH ───
  es: {
    "nav.dashboard": "Panel",
    "nav.jarvis": "J.A.R.V.I.S.",
    "nav.simulator": "Simulador",
    "nav.safezone": "Safe-Zone",
    "nav.language": "Laboratorio de idiomas",
    "nav.skills": "Acelerador de competencias",
    "nav.settings": "Ajustes",
    "nav.predict": "Predecir",
    "nav.visa": "Seguimiento de visado",
    "nav.maroc": "Vivir en Marruecos",
    "dashboard.greeting": "Hola,",
    "dashboard.subtitle": "Tus módulos están sincronizados. Explora tus datos y toma mejores decisiones.",
    "dashboard.systemOnline": "Datos sincronizados",
    "dashboard.activeModules": "Módulos activos",
    "dashboard.modules": "Módulos",
    "dashboard.odysseyScore": "Puntuación",
    "dashboard.globalPerformance": "Rendimiento global",
    "dashboard.activity": "Actividad",
    "dashboard.seeAll": "VER TODO",
    "stats.score": "Puntuación Odyssey",
    "stats.mentalClarity": "Claridad mental",
    "stats.countriesSimulated": "Países simulados",
    "stats.connections": "Conexiones",
    "stats.thisWeek": "esta semana",
    "stats.pts": "PTS",
    "score.mentalClarity": "Claridad mental",
    "score.financialHealth": "Salud financiera",
    "score.globalMobility": "Movilidad global",
    "score.networkMentors": "Red y mentores",
    "score.executionAction": "Ejecución y acción",
    "activity.conversationsToday": "conversaciones hoy",
    "activity.postsThisWeek": "publicaciones esta semana",
    "activity.simulationsRun": "simulaciones lanzadas",
    "activity.badgesEarned": "insignias obtenidas",
    "command.placeholder": "¿Qué puedo hacer por ti? (ej.: busca un japonés para esta noche)",
    "command.suggestions": "Sugerencias",
    "command.confirm": "Confirmar",
    "command.cancel": "Cancelar",
    "command.newSearch": "Nueva búsqueda",
    "command.close": "Cerrar",
    "command.execute": "ejecutar",
    "command.analyzing": "JARVIS analiza tu petición…",
    "command.executing": "Ejecutando…",
    "command.confirmRequired": "⚠️ Confirmación necesaria",
    "command.error": "Error",
    "command.retry": "Reintentar",
    "command.restaurantsFound": "restaurantes encontrados",
    "command.actionComplete": "Acción completada",
    "command.actionFailed": "Error",
    "module.jarvis.desc": "Inteligencia personal",
    "module.simulator.desc": "Motor predictivo multipaís",
    "module.safezone.desc": "Experiencias entre expatriados",
    "module.language.desc": "Inmersión lingüística con IA",
    "module.skills.desc": "Aprendizaje y misiones XP",
    "dashboard.dataDemo": "Datos de demostración",
    "dashboard.subtitleDemo": "Aún no hay datos personales guardados: las cifras siguientes son ejemplos.",
    "module.predict.desc": "Simulación multiagente",
    "module.visa.desc": "Seguimiento inteligente de visados",
    "module.maroc.desc": "Coste, estancia, fiscalidad e inversión",
    "lang.title": "Laboratorio de idiomas",
    "lang.level": "Nivel",
    "lang.streak": "Racha",
    "lang.dailyLesson": "Lección del día",
    "lang.flashcards": "Tarjetas",
    "lang.roleplay": "Juego de rol",
    "lang.placementTest": "Prueba de nivel",
    "skills.title": "Acelerador de competencias",
    "skills.addSkill": "Añadir una competencia",
    "skills.activeTracks": "Mis itinerarios",
    "skills.activeMissions": "Misiones activas",
    "skills.completed": "Completado",
    "skills.xpGained": "XP ganados",
    "skills.level": "Nivel",
    "settings.title": "Ajustes",
    "settings.language": "Idioma",
    "settings.theme": "Tema",
    "settings.notifications": "Notificaciones",
    "settings.privacy": "Privacidad",
    "settings.exportData": "Exportar mis datos",
    "settings.deleteAccount": "Eliminar mi cuenta",
    "settings.dangerZone": "Zona sensible",
    "settings.deleteWarning": "La eliminación borra tu cuenta y todos tus datos (perfil, simulaciones, conversaciones, registros). Esta acción es definitiva.",
    "settings.deleteConfirmAction": "Haz clic de nuevo para eliminar definitivamente",
    "settings.accountPrivacy": "Cuenta y privacidad",
    "settings.saved": "Guardado",
    "settings.saving": "Guardando…",
    "settings.saveError": "No se pudo guardar",
    "settings.aiData": "IA y datos",
    "settings.alertsReports": "Alertas e informes",
    "settings.appearance": "Apariencia",
    "settings.themeDisplay": "Tema y visualización",
    "settings.logout": "Cerrar sesión",
    "settings.identifier": "Cuenta",
    "settings.memberSince": "Miembro desde",
    "toggle.memory": "Memoria de J.A.R.V.I.S.",
    "toggle.memoryDesc": "Conserva el contexto de tus conversaciones",
    "toggle.extraction": "Enriquecimiento del perfil",
    "toggle.extractionDesc": "Completa tu perfil a partir de tus conversaciones",
    "toggle.biometric": "Bloqueo biométrico",
    "toggle.biometricDesc": "Desbloqueo con huella o rostro",
    "toggle.opportunities": "Alertas de oportunidades",
    "toggle.opportunitiesDesc": "Empleo, vivienda, cambios de visado",
    "toggle.mentors": "Contactos sugeridos",
    "toggle.mentorsDesc": "Miembros que hicieron el mismo recorrido",
    "toggle.weekly": "Resumen semanal",
    "toggle.weeklyDesc": "Un resumen de tu semana por correo",
    "common.loading": "Cargando…",
    "common.save": "Guardar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.back": "Volver",
    "common.next": "Siguiente",
    "common.done": "Hecho",
    "common.today": "Hoy",
    "common.realTime": "Tiempo real",
    "common.you": "Tú",
    "sim.title": "Simulador de trayectoria",
    "sim.tagline": "Comparador fiscal y de coste de vida",
    "sim.subtitle": "Compara tu poder adquisitivo real entre Francia y tu destino: salario, impuestos, coste de vida.",
    "sim.save": "Guardar esta comparación",
    "sim.saving": "Calculando…",
    "sim.saved": "Comparación guardada",
    "sim.chooseDestination": "Elige tu destino",
    "sim.currentSituation": "Tu situación actual",
    "sim.origin": "Origen",
    "sim.grossSalary": "Salario bruto",
    "sim.tax": "Impuestos",
    "sim.costOfLiving": "Coste de vida",
    "sim.climate": "Clima",
    "sim.savingsCapacity": "Capacidad de ahorro mensual",
    "sim.financialImpact": "Impacto financiero",
    "sim.monthlyDelta": "Diferencia mensual",
    "sim.monthlyDeltaDesc": "Excedente neto de tesorería",
    "sim.over36Months": "En 36 meses",
    "sim.over36MonthsDesc": "Capital adicional acumulado",
    "sim.over60Months": "En 60 meses",
    "sim.over60MonthsDesc": "Trayectoria a largo plazo",
    "sim.disclaimer": "Estimaciones indicativas, no contractuales. Verifica las condiciones exactas con las autoridades competentes.",
  },

  // ─── PORTUGUESE ───
  pt: {
    "nav.dashboard": "Painel",
    "nav.jarvis": "J.A.R.V.I.S.",
    "nav.simulator": "Simulador",
    "nav.safezone": "Safe-Zone",
    "nav.language": "Laboratório de línguas",
    "nav.skills": "Acelerador de competências",
    "nav.settings": "Definições",
    "nav.predict": "Prever",
    "nav.visa": "Acompanhamento de visto",
    "nav.maroc": "Viver em Marrocos",
    "dashboard.greeting": "Olá,",
    "dashboard.subtitle": "Os teus módulos estão sincronizados. Explora os teus dados e decide melhor.",
    "dashboard.systemOnline": "Dados sincronizados",
    "dashboard.activeModules": "Módulos ativos",
    "dashboard.modules": "Módulos",
    "dashboard.odysseyScore": "Pontuação",
    "dashboard.globalPerformance": "Desempenho global",
    "dashboard.activity": "Atividade",
    "dashboard.seeAll": "VER TUDO",
    "stats.score": "Pontuação Odyssey",
    "stats.mentalClarity": "Clareza mental",
    "stats.countriesSimulated": "Países simulados",
    "stats.connections": "Ligações",
    "stats.thisWeek": "esta semana",
    "stats.pts": "PTS",
    "score.mentalClarity": "Clareza mental",
    "score.financialHealth": "Saúde financeira",
    "score.globalMobility": "Mobilidade global",
    "score.networkMentors": "Rede e mentores",
    "score.executionAction": "Execução e ação",
    "activity.conversationsToday": "conversas hoje",
    "activity.postsThisWeek": "publicações esta semana",
    "activity.simulationsRun": "simulações lançadas",
    "activity.badgesEarned": "medalhas obtidas",
    "command.placeholder": "O que posso fazer por ti? (ex.: encontra um japonês para hoje à noite)",
    "command.suggestions": "Sugestões",
    "command.confirm": "Confirmar",
    "command.cancel": "Cancelar",
    "command.newSearch": "Nova pesquisa",
    "command.close": "Fechar",
    "command.execute": "executar",
    "command.analyzing": "O JARVIS está a analisar o teu pedido…",
    "command.executing": "A executar…",
    "command.confirmRequired": "⚠️ Confirmação necessária",
    "command.error": "Erro",
    "command.retry": "Tentar de novo",
    "command.restaurantsFound": "restaurantes encontrados",
    "command.actionComplete": "Ação concluída",
    "command.actionFailed": "Falhou",
    "module.jarvis.desc": "Inteligência pessoal",
    "module.simulator.desc": "Motor preditivo multipaís",
    "module.safezone.desc": "Experiências entre expatriados",
    "module.language.desc": "Imersão linguística com IA",
    "module.skills.desc": "Aprendizagem e missões XP",
    "dashboard.dataDemo": "Dados de demonstração",
    "dashboard.subtitleDemo": "Ainda não há dados pessoais guardados — os números abaixo são exemplos.",
    "module.predict.desc": "Simulação multiagente",
    "module.visa.desc": "Acompanhamento inteligente de vistos",
    "module.maroc.desc": "Custo, estadia, fiscalidade e investimento",
    "lang.title": "Laboratório de línguas",
    "lang.level": "Nível",
    "lang.streak": "Sequência",
    "lang.dailyLesson": "Lição do dia",
    "lang.flashcards": "Cartões",
    "lang.roleplay": "Simulação",
    "lang.placementTest": "Teste de nível",
    "skills.title": "Acelerador de competências",
    "skills.addSkill": "Adicionar uma competência",
    "skills.activeTracks": "Os meus percursos",
    "skills.activeMissions": "Missões ativas",
    "skills.completed": "Concluído",
    "skills.xpGained": "XP ganhos",
    "skills.level": "Nível",
    "settings.title": "Definições",
    "settings.language": "Idioma",
    "settings.theme": "Tema",
    "settings.notifications": "Notificações",
    "settings.privacy": "Privacidade",
    "settings.exportData": "Exportar os meus dados",
    "settings.deleteAccount": "Eliminar a minha conta",
    "settings.dangerZone": "Zona sensível",
    "settings.deleteWarning": "A eliminação apaga a tua conta e todos os teus dados (perfil, simulações, conversas, registos). Esta ação é definitiva.",
    "settings.deleteConfirmAction": "Clica novamente para eliminar definitivamente",
    "settings.accountPrivacy": "Conta e privacidade",
    "settings.saved": "Guardado",
    "settings.saving": "A guardar…",
    "settings.saveError": "Não foi possível guardar",
    "settings.aiData": "IA e dados",
    "settings.alertsReports": "Alertas e relatórios",
    "settings.appearance": "Aparência",
    "settings.themeDisplay": "Tema e visualização",
    "settings.logout": "Terminar sessão",
    "settings.identifier": "Conta",
    "settings.memberSince": "Membro desde",
    "toggle.memory": "Memória do J.A.R.V.I.S.",
    "toggle.memoryDesc": "Mantém o contexto das tuas conversas",
    "toggle.extraction": "Enriquecimento do perfil",
    "toggle.extractionDesc": "Preenche o teu perfil a partir das tuas conversas",
    "toggle.biometric": "Bloqueio biométrico",
    "toggle.biometricDesc": "Desbloqueio por impressão digital ou rosto",
    "toggle.opportunities": "Alertas de oportunidades",
    "toggle.opportunitiesDesc": "Emprego, habitação, alterações de visto",
    "toggle.mentors": "Contactos sugeridos",
    "toggle.mentorsDesc": "Membros que fizeram o mesmo percurso",
    "toggle.weekly": "Resumo semanal",
    "toggle.weeklyDesc": "Um resumo da tua semana por email",
    "common.loading": "A carregar…",
    "common.save": "Guardar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.back": "Voltar",
    "common.next": "Seguinte",
    "common.done": "Concluído",
    "common.today": "Hoje",
    "common.realTime": "Tempo real",
    "common.you": "Tu",
    "sim.title": "Simulador de trajetória",
    "sim.tagline": "Comparador fiscal e de custo de vida",
    "sim.subtitle": "Compara o teu poder de compra real entre a França e o teu destino: salário, impostos, custo de vida.",
    "sim.save": "Guardar esta comparação",
    "sim.saving": "A calcular…",
    "sim.saved": "Comparação guardada",
    "sim.chooseDestination": "Escolhe o teu destino",
    "sim.currentSituation": "A tua situação atual",
    "sim.origin": "Origem",
    "sim.grossSalary": "Salário bruto",
    "sim.tax": "Impostos",
    "sim.costOfLiving": "Custo de vida",
    "sim.climate": "Clima",
    "sim.savingsCapacity": "Capacidade de poupança mensal",
    "sim.financialImpact": "Impacto financeiro",
    "sim.monthlyDelta": "Diferença mensal",
    "sim.monthlyDeltaDesc": "Excedente líquido de tesouraria",
    "sim.over36Months": "Em 36 meses",
    "sim.over36MonthsDesc": "Capital adicional acumulado",
    "sim.over60Months": "Em 60 meses",
    "sim.over60MonthsDesc": "Trajetória a longo prazo",
    "sim.disclaimer": "Estimativas indicativas, não contratuais. Verifica as condições exatas junto das autoridades competentes.",
  },

  // ─── GERMAN ───
  de: {
    "nav.dashboard": "Übersicht",
    "nav.jarvis": "J.A.R.V.I.S.",
    "nav.simulator": "Simulator",
    "nav.safezone": "Safe-Zone",
    "nav.language": "Sprachlabor",
    "nav.skills": "Kompetenz-Booster",
    "nav.settings": "Einstellungen",
    "nav.predict": "Vorhersage",
    "nav.visa": "Visum-Tracker",
    "nav.maroc": "Leben in Marokko",
    "dashboard.greeting": "Hallo,",
    "dashboard.subtitle": "Deine Module sind synchronisiert. Sieh dir deine Daten an und entscheide fundiert.",
    "dashboard.systemOnline": "Daten synchronisiert",
    "dashboard.activeModules": "Aktive Module",
    "dashboard.modules": "Module",
    "dashboard.odysseyScore": "Punktzahl",
    "dashboard.globalPerformance": "Gesamtleistung",
    "dashboard.activity": "Aktivität",
    "dashboard.seeAll": "ALLE ANZEIGEN",
    "stats.score": "Odyssey-Punktzahl",
    "stats.mentalClarity": "Mentale Klarheit",
    "stats.countriesSimulated": "Simulierte Länder",
    "stats.connections": "Kontakte",
    "stats.thisWeek": "diese Woche",
    "stats.pts": "PKT",
    "score.mentalClarity": "Mentale Klarheit",
    "score.financialHealth": "Finanzielle Gesundheit",
    "score.globalMobility": "Globale Mobilität",
    "score.networkMentors": "Netzwerk & Mentoren",
    "score.executionAction": "Umsetzung & Handeln",
    "activity.conversationsToday": "Gespräche heute",
    "activity.postsThisWeek": "Beiträge diese Woche",
    "activity.simulationsRun": "Simulationen gestartet",
    "activity.badgesEarned": "Abzeichen erhalten",
    "command.placeholder": "Was kann ich für dich tun? (z. B. finde heute Abend einen Japaner)",
    "command.suggestions": "Vorschläge",
    "command.confirm": "Bestätigen",
    "command.cancel": "Abbrechen",
    "command.newSearch": "Neue Suche",
    "command.close": "Schließen",
    "command.execute": "ausführen",
    "command.analyzing": "JARVIS analysiert deine Anfrage…",
    "command.executing": "Wird ausgeführt…",
    "command.confirmRequired": "⚠️ Bestätigung erforderlich",
    "command.error": "Fehler",
    "command.retry": "Erneut versuchen",
    "command.restaurantsFound": "Restaurants gefunden",
    "command.actionComplete": "Aktion abgeschlossen",
    "command.actionFailed": "Fehlgeschlagen",
    "module.jarvis.desc": "Persönliche Intelligenz",
    "module.simulator.desc": "Prognosemodell für mehrere Länder",
    "module.safezone.desc": "Erfahrungen unter Auswanderern",
    "module.language.desc": "Sprachimmersion mit KI",
    "module.skills.desc": "Lernen und XP-Missionen",
    "dashboard.dataDemo": "Demodaten",
    "dashboard.subtitleDemo": "Noch keine persönlichen Daten gespeichert — die Zahlen unten sind Beispiele.",
    "module.predict.desc": "Multi-Agenten-Simulation",
    "module.visa.desc": "Intelligente Visum-Verfolgung",
    "module.maroc.desc": "Kosten, Aufenthalt, Steuern & Investition",
    "lang.title": "Sprachlabor",
    "lang.level": "Niveau",
    "lang.streak": "Serie",
    "lang.dailyLesson": "Lektion des Tages",
    "lang.flashcards": "Karteikarten",
    "lang.roleplay": "Rollenspiel",
    "lang.placementTest": "Einstufungstest",
    "skills.title": "Kompetenz-Booster",
    "skills.addSkill": "Kompetenz hinzufügen",
    "skills.activeTracks": "Meine Lernpfade",
    "skills.activeMissions": "Aktive Missionen",
    "skills.completed": "Abgeschlossen",
    "skills.xpGained": "XP gesammelt",
    "skills.level": "Niveau",
    "settings.title": "Einstellungen",
    "settings.language": "Sprache",
    "settings.theme": "Design",
    "settings.notifications": "Benachrichtigungen",
    "settings.privacy": "Datenschutz",
    "settings.exportData": "Meine Daten exportieren",
    "settings.deleteAccount": "Mein Konto löschen",
    "settings.dangerZone": "Gefahrenbereich",
    "settings.deleteWarning": "Beim Löschen werden dein Konto und alle deine Daten entfernt (Profil, Simulationen, Gespräche, Check-ins). Dieser Schritt ist endgültig.",
    "settings.deleteConfirmAction": "Erneut klicken, um endgültig zu löschen",
    "settings.accountPrivacy": "Konto und Datenschutz",
    "settings.saved": "Gespeichert",
    "settings.saving": "Wird gespeichert…",
    "settings.saveError": "Speichern fehlgeschlagen",
    "settings.aiData": "KI und Daten",
    "settings.alertsReports": "Warnungen und Berichte",
    "settings.appearance": "Darstellung",
    "settings.themeDisplay": "Design und Anzeige",
    "settings.logout": "Abmelden",
    "settings.identifier": "Konto",
    "settings.memberSince": "Mitglied seit",
    "toggle.memory": "J.A.R.V.I.S.-Gedächtnis",
    "toggle.memoryDesc": "Behält den Kontext deiner Gespräche",
    "toggle.extraction": "Profil-Anreicherung",
    "toggle.extractionDesc": "Ergänzt dein Profil aus deinen Gesprächen",
    "toggle.biometric": "Biometrische Sperre",
    "toggle.biometricDesc": "Entsperren per Fingerabdruck oder Gesicht",
    "toggle.opportunities": "Chancen-Benachrichtigungen",
    "toggle.opportunitiesDesc": "Jobs, Wohnen, Visa-Änderungen",
    "toggle.mentors": "Kontaktvorschläge",
    "toggle.mentorsDesc": "Mitglieder mit dem gleichen Weg",
    "toggle.weekly": "Wochenrückblick",
    "toggle.weeklyDesc": "Eine Zusammenfassung deiner Woche per E-Mail",
    "common.loading": "Wird geladen…",
    "common.save": "Speichern",
    "common.delete": "Löschen",
    "common.edit": "Bearbeiten",
    "common.back": "Zurück",
    "common.next": "Weiter",
    "common.done": "Fertig",
    "common.today": "Heute",
    "common.realTime": "Echtzeit",
    "common.you": "Du",
    "sim.title": "Trajektorien-Simulator",
    "sim.tagline": "Steuer- und Lebenskostenvergleich",
    "sim.subtitle": "Vergleiche deine reale Kaufkraft zwischen Frankreich und deinem Ziel: Gehalt, Steuern, Lebenshaltungskosten.",
    "sim.save": "Diesen Vergleich speichern",
    "sim.saving": "Wird berechnet…",
    "sim.saved": "Vergleich gespeichert",
    "sim.chooseDestination": "Wähle dein Ziel",
    "sim.currentSituation": "Deine aktuelle Situation",
    "sim.origin": "Herkunft",
    "sim.grossSalary": "Bruttogehalt",
    "sim.tax": "Steuern",
    "sim.costOfLiving": "Lebenshaltungskosten",
    "sim.climate": "Klima",
    "sim.savingsCapacity": "Monatliche Sparfähigkeit",
    "sim.financialImpact": "Finanzielle Auswirkung",
    "sim.monthlyDelta": "Monatliche Differenz",
    "sim.monthlyDeltaDesc": "Netto-Cashflow-Überschuss",
    "sim.over36Months": "Über 36 Monate",
    "sim.over36MonthsDesc": "Zusätzlich angespartes Kapital",
    "sim.over60Months": "Über 60 Monate",
    "sim.over60MonthsDesc": "Langfristige Entwicklung",
    "sim.disclaimer": "Richtwerte, unverbindlich. Prüfe die genauen Bedingungen bei den zuständigen Behörden.",
  },

  // ─── ARABIC ───
  ar: {
    "nav.dashboard": "لوحة التحكم",
    "nav.jarvis": "جارفيس",
    "nav.simulator": "المحاكي",
    "nav.safezone": "المنطقة الآمنة",
    "nav.language": "مختبر اللغات",
    "nav.skills": "مسرّع المهارات",
    "nav.settings": "الإعدادات",
    "nav.predict": "التوقّع",
    "nav.visa": "متابعة التأشيرة",
    "nav.maroc": "العيش في المغرب",
    "dashboard.greeting": "مرحبًا،",
    "dashboard.subtitle": "وحداتك متزامنة. استكشف بياناتك واتخذ قرارات أفضل.",
    "dashboard.systemOnline": "البيانات متزامنة",
    "dashboard.activeModules": "الوحدات النشطة",
    "dashboard.modules": "وحدات",
    "dashboard.odysseyScore": "النتيجة",
    "dashboard.globalPerformance": "الأداء العام",
    "dashboard.activity": "النشاط",
    "dashboard.seeAll": "عرض الكل",
    "stats.score": "نتيجة أوديسي",
    "stats.mentalClarity": "الصفاء الذهني",
    "stats.countriesSimulated": "الدول المحاكاة",
    "stats.connections": "جهات الاتصال",
    "stats.thisWeek": "هذا الأسبوع",
    "stats.pts": "نقطة",
    "score.mentalClarity": "الصفاء الذهني",
    "score.financialHealth": "الصحة المالية",
    "score.globalMobility": "التنقّل العالمي",
    "score.networkMentors": "الشبكة والمرشدون",
    "score.executionAction": "التنفيذ والعمل",
    "activity.conversationsToday": "محادثات اليوم",
    "activity.postsThisWeek": "منشورات هذا الأسبوع",
    "activity.simulationsRun": "محاكاة تم تشغيلها",
    "activity.badgesEarned": "أوسمة محصّلة",
    "command.placeholder": "كيف يمكنني مساعدتك؟ (مثال: ابحث عن مطعم ياباني الليلة)",
    "command.suggestions": "اقتراحات",
    "command.confirm": "تأكيد",
    "command.cancel": "إلغاء",
    "command.newSearch": "بحث جديد",
    "command.close": "إغلاق",
    "command.execute": "تنفيذ",
    "command.analyzing": "جارفيس يحلّل طلبك…",
    "command.executing": "جارٍ التنفيذ…",
    "command.confirmRequired": "⚠️ التأكيد مطلوب",
    "command.error": "خطأ",
    "command.retry": "إعادة المحاولة",
    "command.restaurantsFound": "مطاعم تم العثور عليها",
    "command.actionComplete": "تم تنفيذ الإجراء",
    "command.actionFailed": "فشل",
    "module.jarvis.desc": "ذكاء شخصي",
    "module.simulator.desc": "محرّك تنبؤي متعدّد الدول",
    "module.safezone.desc": "تجارب بين المغتربين",
    "module.language.desc": "انغماس لغوي بالذكاء الاصطناعي",
    "module.skills.desc": "التعلّم ومهام الخبرة",
    "dashboard.dataDemo": "بيانات تجريبية",
    "dashboard.subtitleDemo": "لم تُحفظ أي بيانات شخصية بعد — الأرقام أدناه أمثلة.",
    "module.predict.desc": "محاكاة متعدّدة الوكلاء",
    "module.visa.desc": "متابعة ذكية للتأشيرات",
    "module.maroc.desc": "التكلفة والإقامة والضرائب والاستثمار",
    "lang.title": "مختبر اللغات",
    "lang.level": "المستوى",
    "lang.streak": "سلسلة",
    "lang.dailyLesson": "درس اليوم",
    "lang.flashcards": "بطاقات",
    "lang.roleplay": "تمثيل أدوار",
    "lang.placementTest": "اختبار المستوى",
    "skills.title": "مسرّع المهارات",
    "skills.addSkill": "إضافة مهارة",
    "skills.activeTracks": "مساراتي",
    "skills.activeMissions": "المهام النشطة",
    "skills.completed": "مكتمل",
    "skills.xpGained": "نقاط الخبرة",
    "skills.level": "المستوى",
    "settings.title": "الإعدادات",
    "settings.language": "اللغة",
    "settings.theme": "المظهر",
    "settings.notifications": "الإشعارات",
    "settings.privacy": "الخصوصية",
    "settings.exportData": "تصدير بياناتي",
    "settings.deleteAccount": "حذف حسابي",
    "settings.dangerZone": "منطقة حساسة",
    "settings.deleteWarning": "يمحو الحذف حسابك وجميع بياناتك (الملف الشخصي والمحاكاة والمحادثات والتسجيلات). هذا الإجراء نهائي.",
    "settings.deleteConfirmAction": "انقر مرة أخرى للحذف نهائيًا",
    "settings.accountPrivacy": "الحساب والخصوصية",
    "settings.saved": "تم الحفظ",
    "settings.saving": "جارٍ الحفظ…",
    "settings.saveError": "تعذّر الحفظ",
    "settings.aiData": "الذكاء الاصطناعي والبيانات",
    "settings.alertsReports": "التنبيهات والتقارير",
    "settings.appearance": "المظهر",
    "settings.themeDisplay": "المظهر والعرض",
    "settings.logout": "تسجيل الخروج",
    "settings.identifier": "الحساب",
    "settings.memberSince": "عضو منذ",
    "toggle.memory": "ذاكرة جارفيس",
    "toggle.memoryDesc": "يحتفظ بسياق محادثاتك",
    "toggle.extraction": "إثراء الملف الشخصي",
    "toggle.extractionDesc": "يكمل ملفك من محادثاتك",
    "toggle.biometric": "القفل البيومتري",
    "toggle.biometricDesc": "الفتح ببصمة الإصبع أو الوجه",
    "toggle.opportunities": "تنبيهات الفرص",
    "toggle.opportunitiesDesc": "الوظائف والسكن وتغييرات التأشيرة",
    "toggle.mentors": "جهات اتصال مقترحة",
    "toggle.mentorsDesc": "أعضاء سلكوا المسار نفسه",
    "toggle.weekly": "ملخص أسبوعي",
    "toggle.weeklyDesc": "ملخص أسبوعك عبر البريد",
    "common.loading": "جارٍ التحميل…",
    "common.save": "حفظ",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.back": "رجوع",
    "common.next": "التالي",
    "common.done": "تم",
    "common.today": "اليوم",
    "common.realTime": "الوقت الفعلي",
    "common.you": "أنت",
    "sim.title": "محاكي المسار",
    "sim.tagline": "مقارن الضرائب وتكلفة المعيشة",
    "sim.subtitle": "قارن قوتك الشرائية الحقيقية بين فرنسا ووجهتك: الراتب والضرائب وتكلفة المعيشة.",
    "sim.save": "حفظ هذه المقارنة",
    "sim.saving": "جارٍ الحساب…",
    "sim.saved": "تم حفظ المقارنة",
    "sim.chooseDestination": "اختر وجهتك",
    "sim.currentSituation": "وضعك الحالي",
    "sim.origin": "المنشأ",
    "sim.grossSalary": "الراتب الإجمالي",
    "sim.tax": "الضرائب",
    "sim.costOfLiving": "تكلفة المعيشة",
    "sim.climate": "المناخ",
    "sim.savingsCapacity": "القدرة الادخارية الشهرية",
    "sim.financialImpact": "الأثر المالي",
    "sim.monthlyDelta": "الفرق الشهري",
    "sim.monthlyDeltaDesc": "فائض التدفق النقدي الصافي",
    "sim.over36Months": "على مدى 36 شهرًا",
    "sim.over36MonthsDesc": "رأس مال إضافي متراكم",
    "sim.over60Months": "على مدى 60 شهرًا",
    "sim.over60MonthsDesc": "المسار على المدى الطويل",
    "sim.disclaimer": "تقديرات إرشادية غير تعاقدية. تحقّق من الشروط الدقيقة لدى الجهات المختصة.",
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
  es: [
    /\b(yo|tú|él|ella|nosotros|vosotros|ellos|mi|tu|su|nuestro|hola|gracias|sí|no|y|es|soy|está|para|con|esta|este|qué|quién|dónde|cuándo|por favor|quiero|necesito)\b/i,
  ],
  pt: [
    /\b(eu|tu|ele|ela|nós|vocês|eles|meu|teu|seu|nosso|olá|obrigado|obrigada|sim|não|e|é|sou|está|para|com|esta|este|que|quem|onde|quando|por favor|quero|preciso)\b/i,
  ],
  de: [
    /\b(ich|du|er|sie|wir|ihr|mein|dein|sein|unser|hallo|danke|ja|nein|und|ist|bin|hat|habe|für|mit|dieser|diese|dieses|was|wer|wo|wann|warum|bitte|möchte|brauche)\b/i,
  ],
  ar: [
    // Arabic script itself is the strongest signal; no other supported locale uses it.
    /[\u0600-\u06FF]/,
    /\b(أنا|أنت|هو|هي|نحن|هم|مرحبا|شكرا|نعم|لا|في|من|إلى|على|هذا|هذه|ماذا|من|أين|متى|لماذا|أريد|أحتاج)\b/,
  ],
};

export function detectLanguage(text: string): Locale {
  // Built from SUPPORTED_LOCALES so adding a language never requires editing
  // this line — the previous literal silently skipped any new locale.
  const scores = Object.fromEntries(
    SUPPORTED_LOCALES.map((l) => [l, 0])
  ) as Record<Locale, number>;

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
    es: "Respondes SIEMPRE en español. Tu tono es profesional pero cercano, como un consultor que además es un buen amigo.",
    pt: "Respondes SEMPRE em português. O teu tom é profissional mas próximo, como um consultor que também é um bom amigo.",
    de: "Du antwortest IMMER auf Deutsch. Dein Ton ist professionell, aber herzlich — wie ein Berater, der zugleich ein guter Freund ist.",
    ar: "تجيب دائمًا بالعربية. أسلوبك مهني ودافئ في آن واحد، كمستشار يكون أيضًا صديقًا مقرّبًا.",
  };
  return instructions[locale];
}
