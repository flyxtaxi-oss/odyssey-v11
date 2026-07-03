import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transfert d'argent au Maroc — Comparateur MRE | Odyssey",
  description:
    "Comparez le coût réel (frais + marge de change) des transferts d'argent vers le Maroc : Wise, Remitly, Wafacash, Cash Plus, Western Union. Gardez plus pour votre famille.",
  alternates: { canonical: "/transfert" },
  openGraph: {
    title: "Transfert d'argent au Maroc — Comparateur MRE",
    description: "Le vrai coût de ton envoi au Maroc, comparé en un coup d'œil.",
    url: "/transfert",
  },
};

export default function TransfertLayout({ children }: { children: React.ReactNode }) {
  return children;
}
