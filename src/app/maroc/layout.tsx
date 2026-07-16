import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vivre au Maroc 🇲🇦 — Coût de la vie, visa, fiscalité, MRE | Odyssey",
  description:
    "Le guide complet pour vivre, rentrer ou investir au Maroc. Coût de la vie réel par ville, carte de séjour, fiscalité, douane MRE, immobilier. Estimateur de budget + coach IA en français.",
  keywords: [
    "vivre au maroc",
    "coût de la vie maroc",
    "s'installer au maroc",
    "MRE retour au maroc",
    "carte de séjour maroc",
    "fiscalité maroc retraité",
    "investir au maroc",
    "digital nomad maroc",
    "déménagement maroc douane",
  ],
  alternates: { canonical: "/maroc" },
  openGraph: {
    title: "Vivre au Maroc — Coût de la vie, visa, fiscalité, MRE",
    description:
      "Estimateur de budget par ville, démarches séjour, fiscalité, conseils MRE et investissement. Coach IA en français.",
    url: "/maroc",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vivre au Maroc 🇲🇦 — le hub Odyssey",
    description: "Coût de la vie réel, visa, fiscalité, MRE, investissement. Estimateur + IA.",
  },
};

export default function MarocLayout({ children }: { children: React.ReactNode }) {
  return children;
}
