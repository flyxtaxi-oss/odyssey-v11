// ==============================================================================
// i18n — Internationalization Layer for Odyssey.ai
// Supports: FR · EN · NL · AR (RTL) · ES · IT · DE
// Langues des principaux pays de la diaspora marocaine (MRE) + arabe.
// ==============================================================================

export type Locale = "fr" | "en" | "nl" | "ar" | "es" | "it" | "de";

export const SUPPORTED_LOCALES: Locale[] = ["fr", "en", "nl", "ar", "es", "it", "de"];

/** Langues écrites de droite à gauche. */
export const RTL_LOCALES: Locale[] = ["ar"];

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function dir(locale: Locale): "rtl" | "ltr" {
  return isRTL(locale) ? "rtl" : "ltr";
}

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  nl: "Nederlands",
  ar: "العربية",
  es: "Español",
  it: "Italiano",
  de: "Deutsch",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  nl: "🇳🇱",
  ar: "🇲🇦",
  es: "🇪🇸",
  it: "🇮🇹",
  de: "🇩🇪",
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

  // Transfer (MRE)
  "transfer.title": string;
  "transfer.amount": string;
  "transfer.received": string;
  "transfer.bestPrice": string;
  "transfer.realCost": string;

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
    "transfer.title": "Transfert d'argent",
    "transfer.amount": "Montant à envoyer",
    "transfer.received": "reçus",
    "transfer.bestPrice": "Meilleur prix",
    "transfer.realCost": "coût réel",
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
    "transfer.title": "Money transfer",
    "transfer.amount": "Amount to send",
    "transfer.received": "received",
    "transfer.bestPrice": "Best price",
    "transfer.realCost": "real cost",
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
    "transfer.title": "Geldoverdracht",
    "transfer.amount": "Te verzenden bedrag",
    "transfer.received": "ontvangen",
    "transfer.bestPrice": "Beste prijs",
    "transfer.realCost": "werkelijke kosten",
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

  // ─── ARABIC (RTL) ────────────────────────────────────────────────────────
  ar: {
    "nav.dashboard": "لوحة التحكم",
    "nav.jarvis": "جارفيس",
    "nav.simulator": "المحاكي",
    "nav.safezone": "المنطقة الآمنة",
    "nav.language": "مختبر اللغات",
    "nav.skills": "مسرّع المهارات",
    "nav.settings": "الإعدادات",
    "dashboard.greeting": "مرحباً،",
    "dashboard.subtitle": "جميع وحداتك متزامنة. استكشف بياناتك واتخذ أفضل القرارات.",
    "dashboard.systemOnline": "النظام متصل",
    "dashboard.activeModules": "الوحدات النشطة",
    "dashboard.modules": "الوحدات",
    "dashboard.odysseyScore": "النقاط",
    "dashboard.globalPerformance": "الأداء العام",
    "dashboard.activity": "النشاط",
    "dashboard.seeAll": "عرض الكل",
    "stats.score": "نقاط أوديسي",
    "stats.mentalClarity": "الصفاء الذهني",
    "stats.countriesSimulated": "الدول المحاكاة",
    "stats.connections": "الاتصالات",
    "stats.thisWeek": "هذا الأسبوع",
    "stats.pts": "نقطة",
    "score.mentalClarity": "الصفاء الذهني",
    "score.financialHealth": "الصحة المالية",
    "score.globalMobility": "التنقل العالمي",
    "score.networkMentors": "الشبكة والموجهون",
    "score.executionAction": "التنفيذ والعمل",
    "activity.conversationsToday": "محادثات اليوم",
    "activity.postsThisWeek": "منشورات هذا الأسبوع",
    "activity.simulationsRun": "محاكاة مُنفذة",
    "activity.badgesEarned": "أوسمة مكتسبة",
    "command.placeholder": "ماذا يمكنني أن أفعل لك؟ (مثال: ابحث عن مطعم ياباني الليلة)",
    "command.suggestions": "اقتراحات",
    "command.confirm": "تأكيد",
    "command.cancel": "إلغاء",
    "command.newSearch": "بحث جديد",
    "command.close": "إغلاق",
    "command.execute": "تنفيذ",
    "command.analyzing": "جارفيس يحلل طلبك…",
    "command.executing": "جارٍ التنفيذ…",
    "command.confirmRequired": "⚠️ التأكيد مطلوب",
    "command.error": "خطأ",
    "command.retry": "إعادة المحاولة",
    "command.restaurantsFound": "مطاعم تم العثور عليها",
    "command.actionComplete": "اكتمل الإجراء",
    "command.actionFailed": "فشل",
    "module.jarvis.desc": "الذكاء الشخصي الأساسي",
    "module.simulator.desc": "محرك تنبؤي متعدد الدول",
    "module.safezone.desc": "شبكة مشفرة ومُشرف عليها",
    "module.language.desc": "الانغماس اللغوي والذكاء الاصطناعي",
    "module.skills.desc": "التعلم ومهام الخبرة",
    "lang.title": "مختبر اللغات",
    "lang.level": "المستوى",
    "lang.streak": "التتابع",
    "lang.dailyLesson": "درس اليوم",
    "lang.flashcards": "بطاقات الحفظ",
    "lang.roleplay": "لعب الأدوار",
    "lang.placementTest": "اختبار تحديد المستوى",
    "skills.title": "مسرّع المهارات",
    "skills.addSkill": "إضافة مهارة",
    "skills.activeTracks": "المسارات النشطة",
    "skills.activeMissions": "المهام النشطة",
    "skills.completed": "مكتمل",
    "skills.xpGained": "الخبرة المكتسبة",
    "skills.level": "المستوى",
    "settings.title": "الإعدادات",
    "settings.language": "اللغة",
    "settings.theme": "المظهر",
    "settings.notifications": "الإشعارات",
    "settings.privacy": "الخصوصية",
    "settings.exportData": "تصدير بياناتي",
    "settings.deleteAccount": "حذف حسابي",
    "transfer.title": "تحويل الأموال",
    "transfer.amount": "المبلغ المراد إرساله",
    "transfer.received": "المستلَم",
    "transfer.bestPrice": "أفضل سعر",
    "transfer.realCost": "التكلفة الحقيقية",
    "common.loading": "جارٍ التحميل…",
    "common.save": "حفظ",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.back": "رجوع",
    "common.next": "التالي",
    "common.done": "تم",
    "common.today": "اليوم",
    "common.realTime": "الوقت الفعلي",
  },

  // ─── SPANISH ─────────────────────────────────────────────────────────────
  es: {
    "nav.dashboard": "Panel",
    "nav.jarvis": "J.A.R.V.I.S.",
    "nav.simulator": "Simulador",
    "nav.safezone": "Zona Segura",
    "nav.language": "Laboratorio de Idiomas",
    "nav.skills": "Acelerador de Habilidades",
    "nav.settings": "Ajustes",
    "dashboard.greeting": "Hola,",
    "dashboard.subtitle": "Todos tus módulos están sincronizados. Explora tus datos y toma las mejores decisiones.",
    "dashboard.systemOnline": "Sistema en línea",
    "dashboard.activeModules": "Módulos Activos",
    "dashboard.modules": "Módulos",
    "dashboard.odysseyScore": "Sys.Score",
    "dashboard.globalPerformance": "Rendimiento global",
    "dashboard.activity": "Actividad",
    "dashboard.seeAll": "VER TODO",
    "stats.score": "Odyssey Score",
    "stats.mentalClarity": "Claridad Mental",
    "stats.countriesSimulated": "Países Simulados",
    "stats.connections": "Conexiones",
    "stats.thisWeek": "esta semana",
    "stats.pts": "PTS",
    "score.mentalClarity": "Claridad Mental",
    "score.financialHealth": "Salud Financiera",
    "score.globalMobility": "Movilidad Global",
    "score.networkMentors": "Red y Mentores",
    "score.executionAction": "Ejecución y Acción",
    "activity.conversationsToday": "conversaciones hoy",
    "activity.postsThisWeek": "publicaciones esta semana",
    "activity.simulationsRun": "simulaciones ejecutadas",
    "activity.badgesEarned": "insignias ganadas",
    "command.placeholder": "¿Qué puedo hacer por ti? (ej: encuentra un restaurante japonés esta noche)",
    "command.suggestions": "Sugerencias",
    "command.confirm": "Confirmar",
    "command.cancel": "Cancelar",
    "command.newSearch": "Nueva búsqueda",
    "command.close": "Cerrar",
    "command.execute": "ejecutar",
    "command.analyzing": "JARVIS está analizando tu solicitud…",
    "command.executing": "Ejecutando…",
    "command.confirmRequired": "⚠️ Confirmación requerida",
    "command.error": "Error",
    "command.retry": "Reintentar",
    "command.restaurantsFound": "restaurantes encontrados",
    "command.actionComplete": "Acción completada",
    "command.actionFailed": "Fallido",
    "module.jarvis.desc": "Inteligencia personal central",
    "module.simulator.desc": "Motor predictivo multipaís",
    "module.safezone.desc": "Red cifrada y moderada",
    "module.language.desc": "Inmersión lingüística e IA",
    "module.skills.desc": "Aprendizaje y Misiones XP",
    "lang.title": "Laboratorio de Idiomas",
    "lang.level": "Nivel",
    "lang.streak": "Racha",
    "lang.dailyLesson": "Lección del día",
    "lang.flashcards": "Tarjetas de memoria",
    "lang.roleplay": "Juego de roles",
    "lang.placementTest": "Prueba de nivel",
    "skills.title": "Acelerador de Habilidades",
    "skills.addSkill": "Añadir habilidad",
    "skills.activeTracks": "Rutas Activas",
    "skills.activeMissions": "Misiones Activas",
    "skills.completed": "Completado",
    "skills.xpGained": "XP ganada",
    "skills.level": "Nivel",
    "settings.title": "Ajustes",
    "settings.language": "Idioma",
    "settings.theme": "Tema",
    "settings.notifications": "Notificaciones",
    "settings.privacy": "Privacidad",
    "settings.exportData": "Exportar mis datos",
    "settings.deleteAccount": "Eliminar mi cuenta",
    "transfer.title": "Transferencia de dinero",
    "transfer.amount": "Importe a enviar",
    "transfer.received": "recibidos",
    "transfer.bestPrice": "Mejor precio",
    "transfer.realCost": "coste real",
    "common.loading": "Cargando…",
    "common.save": "Guardar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.back": "Atrás",
    "common.next": "Siguiente",
    "common.done": "Hecho",
    "common.today": "Hoy",
    "common.realTime": "Tiempo real",
  },

  // ─── ITALIAN ─────────────────────────────────────────────────────────────
  it: {
    "nav.dashboard": "Cruscotto",
    "nav.jarvis": "J.A.R.V.I.S.",
    "nav.simulator": "Simulatore",
    "nav.safezone": "Zona Sicura",
    "nav.language": "Laboratorio Linguistico",
    "nav.skills": "Acceleratore di Competenze",
    "nav.settings": "Impostazioni",
    "dashboard.greeting": "Ciao,",
    "dashboard.subtitle": "Tutti i tuoi moduli sono sincronizzati. Esplora i tuoi dati e prendi le migliori decisioni.",
    "dashboard.systemOnline": "Sistema online",
    "dashboard.activeModules": "Moduli Attivi",
    "dashboard.modules": "Moduli",
    "dashboard.odysseyScore": "Sys.Score",
    "dashboard.globalPerformance": "Prestazione globale",
    "dashboard.activity": "Attività",
    "dashboard.seeAll": "VEDI TUTTO",
    "stats.score": "Odyssey Score",
    "stats.mentalClarity": "Chiarezza Mentale",
    "stats.countriesSimulated": "Paesi Simulati",
    "stats.connections": "Connessioni",
    "stats.thisWeek": "questa settimana",
    "stats.pts": "PTS",
    "score.mentalClarity": "Chiarezza Mentale",
    "score.financialHealth": "Salute Finanziaria",
    "score.globalMobility": "Mobilità Globale",
    "score.networkMentors": "Rete e Mentori",
    "score.executionAction": "Esecuzione e Azione",
    "activity.conversationsToday": "conversazioni oggi",
    "activity.postsThisWeek": "post questa settimana",
    "activity.simulationsRun": "simulazioni eseguite",
    "activity.badgesEarned": "badge ottenuti",
    "command.placeholder": "Cosa posso fare per te? (es: trova un ristorante giapponese stasera)",
    "command.suggestions": "Suggerimenti",
    "command.confirm": "Conferma",
    "command.cancel": "Annulla",
    "command.newSearch": "Nuova ricerca",
    "command.close": "Chiudi",
    "command.execute": "esegui",
    "command.analyzing": "JARVIS sta analizzando la tua richiesta…",
    "command.executing": "Esecuzione in corso…",
    "command.confirmRequired": "⚠️ Conferma richiesta",
    "command.error": "Errore",
    "command.retry": "Riprova",
    "command.restaurantsFound": "ristoranti trovati",
    "command.actionComplete": "Azione completata",
    "command.actionFailed": "Fallito",
    "module.jarvis.desc": "Intelligenza personale centrale",
    "module.simulator.desc": "Motore predittivo multi-paese",
    "module.safezone.desc": "Rete crittografata e moderata",
    "module.language.desc": "Immersione linguistica e IA",
    "module.skills.desc": "Apprendimento e Missioni XP",
    "lang.title": "Laboratorio Linguistico",
    "lang.level": "Livello",
    "lang.streak": "Serie",
    "lang.dailyLesson": "Lezione del giorno",
    "lang.flashcards": "Flashcard",
    "lang.roleplay": "Gioco di ruolo",
    "lang.placementTest": "Test di livello",
    "skills.title": "Acceleratore di Competenze",
    "skills.addSkill": "Aggiungi competenza",
    "skills.activeTracks": "Percorsi Attivi",
    "skills.activeMissions": "Missioni Attive",
    "skills.completed": "Completato",
    "skills.xpGained": "XP guadagnata",
    "skills.level": "Livello",
    "settings.title": "Impostazioni",
    "settings.language": "Lingua",
    "settings.theme": "Tema",
    "settings.notifications": "Notifiche",
    "settings.privacy": "Privacy",
    "settings.exportData": "Esporta i miei dati",
    "settings.deleteAccount": "Elimina il mio account",
    "transfer.title": "Trasferimento di denaro",
    "transfer.amount": "Importo da inviare",
    "transfer.received": "ricevuti",
    "transfer.bestPrice": "Miglior prezzo",
    "transfer.realCost": "costo reale",
    "common.loading": "Caricamento…",
    "common.save": "Salva",
    "common.delete": "Elimina",
    "common.edit": "Modifica",
    "common.back": "Indietro",
    "common.next": "Avanti",
    "common.done": "Fatto",
    "common.today": "Oggi",
    "common.realTime": "Tempo reale",
  },

  // ─── GERMAN ──────────────────────────────────────────────────────────────
  de: {
    "nav.dashboard": "Übersicht",
    "nav.jarvis": "J.A.R.V.I.S.",
    "nav.simulator": "Simulator",
    "nav.safezone": "Sichere Zone",
    "nav.language": "Sprachlabor",
    "nav.skills": "Kompetenz-Beschleuniger",
    "nav.settings": "Einstellungen",
    "dashboard.greeting": "Hallo,",
    "dashboard.subtitle": "Alle deine Module sind synchronisiert. Erkunde deine Daten und triff die besten Entscheidungen.",
    "dashboard.systemOnline": "System online",
    "dashboard.activeModules": "Aktive Module",
    "dashboard.modules": "Module",
    "dashboard.odysseyScore": "Sys.Score",
    "dashboard.globalPerformance": "Gesamtleistung",
    "dashboard.activity": "Aktivität",
    "dashboard.seeAll": "ALLE ANZEIGEN",
    "stats.score": "Odyssey Score",
    "stats.mentalClarity": "Mentale Klarheit",
    "stats.countriesSimulated": "Simulierte Länder",
    "stats.connections": "Verbindungen",
    "stats.thisWeek": "diese Woche",
    "stats.pts": "PKT",
    "score.mentalClarity": "Mentale Klarheit",
    "score.financialHealth": "Finanzielle Gesundheit",
    "score.globalMobility": "Globale Mobilität",
    "score.networkMentors": "Netzwerk & Mentoren",
    "score.executionAction": "Umsetzung & Handeln",
    "activity.conversationsToday": "Gespräche heute",
    "activity.postsThisWeek": "Beiträge diese Woche",
    "activity.simulationsRun": "Simulationen ausgeführt",
    "activity.badgesEarned": "Abzeichen erhalten",
    "command.placeholder": "Was kann ich für dich tun? (z. B. finde heute Abend ein japanisches Restaurant)",
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
    "module.jarvis.desc": "Zentrale persönliche Intelligenz",
    "module.simulator.desc": "Prädiktive Mehrländer-Engine",
    "module.safezone.desc": "Verschlüsseltes moderiertes Netzwerk",
    "module.language.desc": "Sprachimmersion & KI",
    "module.skills.desc": "Lernen & XP-Missionen",
    "lang.title": "Sprachlabor",
    "lang.level": "Niveau",
    "lang.streak": "Serie",
    "lang.dailyLesson": "Tageslektion",
    "lang.flashcards": "Lernkarten",
    "lang.roleplay": "Rollenspiel",
    "lang.placementTest": "Einstufungstest",
    "skills.title": "Kompetenz-Beschleuniger",
    "skills.addSkill": "Kompetenz hinzufügen",
    "skills.activeTracks": "Aktive Pfade",
    "skills.activeMissions": "Aktive Missionen",
    "skills.completed": "Abgeschlossen",
    "skills.xpGained": "XP erhalten",
    "skills.level": "Niveau",
    "settings.title": "Einstellungen",
    "settings.language": "Sprache",
    "settings.theme": "Design",
    "settings.notifications": "Benachrichtigungen",
    "settings.privacy": "Datenschutz",
    "settings.exportData": "Meine Daten exportieren",
    "settings.deleteAccount": "Mein Konto löschen",
    "transfer.title": "Geldüberweisung",
    "transfer.amount": "Zu sendender Betrag",
    "transfer.received": "erhalten",
    "transfer.bestPrice": "Bester Preis",
    "transfer.realCost": "tatsächliche Kosten",
    "common.loading": "Laden…",
    "common.save": "Speichern",
    "common.delete": "Löschen",
    "common.edit": "Bearbeiten",
    "common.back": "Zurück",
    "common.next": "Weiter",
    "common.done": "Fertig",
    "common.today": "Heute",
    "common.realTime": "Echtzeit",
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
  ar: [
    /[؀-ۿ]/,
    /\b(انا|أنا|انت|أنت|نحن|هو|هي|مرحبا|سلام|شكرا|نعم|لا|من|في|على|هذا|هذه|أريد|من فضلك)\b/,
  ],
  es: [
    /\b(el|la|los|las|un|una|es|son|está|están|tengo|tienes|hola|gracias|sí|no|y|para|con|esto|esta|quiero|por favor|qué|cómo|dónde)\b/i,
  ],
  it: [
    /\b(il|lo|la|gli|le|un|una|è|sono|ho|hai|ciao|grazie|sì|no|e|per|con|questo|questa|voglio|per favore|che|come|dove|perché)\b/i,
  ],
  de: [
    /\b(der|die|das|ein|eine|ist|sind|habe|hast|hallo|danke|ja|nein|und|für|mit|dieser|diese|ich will|bitte|was|wie|wo|warum|nicht)\b/i,
  ],
};

export function detectLanguage(text: string): Locale {
  const scores: Record<Locale, number> = { fr: 0, en: 0, nl: 0, ar: 0, es: 0, it: 0, de: 0 };

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
    ar: "أنت تجيب دائماً باللغة العربية الفصحى المبسّطة (مع فهم الدارجة المغربية). أسلوبك مهني ودافئ، كمستشار خبير وصديق مقرّب في آنٍ واحد.",
    es: "SIEMPRE respondes en español. Tu tono es profesional pero cálido, como un consultor de McKinsey que también es tu amigo cercano.",
    it: "Rispondi SEMPRE in italiano. Il tuo tono è professionale ma caloroso, come un consulente McKinsey che è anche un tuo caro amico.",
    de: "Du antwortest IMMER auf Deutsch. Dein Ton ist professionell, aber herzlich, wie ein McKinsey-Berater, der auch ein enger Freund ist.",
  };
  return instructions[locale];
}
