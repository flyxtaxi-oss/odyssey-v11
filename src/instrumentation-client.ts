import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "@/lib/sentry-scrub";

// ==============================================================================
// INSTRUMENTATION CLIENT — Sentry (navigateur)
// ==============================================================================
//
// Côté navigateur le risque de fuite est plus élevé qu'au serveur : les
// breadcrumbs capturent saisies de formulaire, URLs et corps de requêtes —
// c'est-à-dire exactement ce que l'utilisateur tape dans le simulateur ou dans
// J.A.R.V.I.S. Le même filtre s'applique donc ici.

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
    tracesSampleRate: process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? 0.1 : 1.0,

    sendDefaultPii: false,

    // Pas de Session Replay : rejouer l'écran d'un utilisateur en train de
    // saisir sa situation fiscale et familiale, c'est un enregistrement de
    // données personnelles. À n'activer qu'avec consentement explicite.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    beforeSend: (event) => scrubEvent(event),
    beforeSendTransaction: (event) => scrubEvent(event),
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
