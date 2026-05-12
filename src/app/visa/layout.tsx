import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visa Tracker — Suivi visas et dates limites | Odyssey",
  description:
    "Track tes visas, dates d'expiration, jours restants Schengen, visas digital nomad. Alertes intelligentes avant chaque deadline.",
  alternates: { canonical: "/visa" },
  openGraph: {
    title: "Visa Tracker — Ne rate plus jamais une date limite",
    description: "Suivi visas, Schengen, digital nomad. Alertes auto.",
    url: "/visa",
  },
};

export default function VisaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
