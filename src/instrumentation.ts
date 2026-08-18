import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "@/lib/sentry-scrub";

// ==============================================================================
// INSTRUMENTATION SERVEUR — Sentry (Node + Edge)
// ==============================================================================
//
// Sans DSN, `Sentry.init` n'envoie rien : l'app tourne exactement comme avant.
// C'est voulu — le développement local et la CI ne doivent ni exiger un compte
// Sentry ni polluer le projet avec des erreurs de test.

export function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,

    // Échantillonnage des traces : 100 % en préproduction pour voir ce qui se
    // passe, 10 % en production pour que le volume reste lisible et gratuit.
    tracesSampleRate: process.env.VERCEL_ENV === "production" ? 0.1 : 1.0,

    // JAMAIS : cette option attacherait IP, cookies et en-têtes d'auth.
    sendDefaultPii: false,

    beforeSend: (event) => scrubEvent(event),
    beforeSendTransaction: (event) => scrubEvent(event),
  });
}

// Remonte les erreurs des Server Components / route handlers.
export const onRequestError = Sentry.captureRequestError;
