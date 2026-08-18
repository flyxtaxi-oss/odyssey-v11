import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// Sans SENTRY_AUTH_TOKEN (dev local, CI d'un fork), le wrapper n'upload pas de
// source maps et se contente d'instrumenter — le build reste fonctionnel sans
// aucun secret Sentry.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Build silencieux en local, verbeux en CI où les logs servent au diagnostic.
  silent: !process.env.CI,

  // Les source maps sont uploadées puis SUPPRIMÉES du bundle servi : sans ça,
  // n'importe qui relit le code source de l'application depuis le navigateur.
  sourcemaps: { deleteSourcemapsAfterUpload: true },

  // Contourne les bloqueurs de pub, qui font disparaître une partie des
  // erreurs — donc précisément celles des utilisateurs les mieux équipés.
  tunnelRoute: "/monitoring",

  disableLogger: true,
});
