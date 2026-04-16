// ==============================================================================
// Notification Engine — Système d'alertes intelligentes (JARVIS)
// ==============================================================================

export type UrgencyLevel = "safe" | "warning" | "critical";

export const NotificationEngine = {
  /**
   * Calcule le niveau d'urgence pour un visa basé sur les jours restants.
   */
  getVisaUrgency(daysRemaining: number): UrgencyLevel {
    if (daysRemaining <= 15) return "critical"; // Moins de 15 jours : Alerte rouge
    if (daysRemaining <= 30) return "warning";  // Moins de 30 jours : Préparation
    return "safe";                              // Plus de 30 jours : Tout va bien
  },

  /**
   * Demande la permission à l'utilisateur de lui envoyer des notifications Push
   * (À appeler lors de l'onboarding).
   */
  async requestPushPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("❌ [NotificationEngine] Ce navigateur ne supporte pas les notifications desktop.");
      return false;
    }

    let permission = Notification.permission;
    
    if (permission !== "granted" && permission !== "denied") {
      permission = await Notification.requestPermission();
    }

    return permission === "granted";
  },

  /**
   * Envoie une notification système locale (si le SW ou FCM n'est pas encore branché).
   */
  sendLocalNotification(title: string, body: string) {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/icon.png", // Assure-toi d'avoir une icône Odyssey dans ton dossier /public
        badge: "/badge.png",
      });
    }
  }
};