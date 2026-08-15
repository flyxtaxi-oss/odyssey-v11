import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal-config";

// Aucun "use client" ici, volontairement : ces pages sont du texte immobile.
// En Server Component elles n'envoient aucun JavaScript, ce qui compte
// doublement pour des documents que les robots de validation d'Apple et de
// Google lisent SANS exécuter de JS avant d'accepter une soumission de store.

export const metadata: Metadata = {
  title: {
    template: "%s — " + LEGAL.serviceName,
    default: "Informations légales — " + LEGAL.serviceName,
  },
  // Ces pages doivent être indexables : un lien de politique de
  // confidentialité qui renvoie une page noindex est refusé par les stores.
  robots: { index: true, follow: true },
};

const SECTIONS = [
  { href: "/legal/mentions", label: "Mentions légales" },
  { href: "/legal/cgu", label: "Conditions d'utilisation" },
  { href: "/legal/confidentialite", label: "Confidentialité" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="fr" dir="ltr" className="max-w-3xl mx-auto py-8">
      <nav aria-label="Documents légaux" className="mb-10">
        <ul className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="inline-block px-3 py-1.5 rounded-[var(--r-sm)] text-sm border transition-colors hover:bg-[var(--bg-2)]"
                style={{ borderColor: "var(--border-1)", color: "var(--text-2)" }}
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* `prose`-like styling is done with explicit utility classes rather than
          a typography plugin, which this project does not install. */}
      <article
        className="space-y-6 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[var(--text-0)] [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[var(--text-1)] [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-[var(--text-2)] [&_li]:text-[var(--text-2)] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5 [&_a]:text-[var(--primary)] [&_a]:underline [&_strong]:text-[var(--text-1)]"
      >
        {children}
      </article>

      <footer className="mt-16 pt-6 border-t text-sm" style={{ borderColor: "var(--border-1)" }}>
        <p className="text-[var(--text-3)]">
          Dernière mise à jour : {LEGAL.lastUpdated} —{" "}
          <Link href="/" className="text-[var(--primary)] underline">
            Retour à l&apos;accueil
          </Link>
        </p>
      </footer>
    </div>
  );
}
