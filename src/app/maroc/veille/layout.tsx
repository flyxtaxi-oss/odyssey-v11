import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Radar de Veille : ce qui change pour les expats & MRE au Maroc | Odyssey",
  description:
    "Suis en temps quasi-réel ce qui change ou va changer au Maroc : séjour, visa, fiscalité, devises, immobilier, succession (Moudawana), douane. Chaque info avec son statut (en vigueur / proposé / à venir) et son enjeu concret.",
  keywords: [
    "réforme maroc 2026",
    "nouvelle loi maroc expat",
    "moudawana réforme 2026",
    "fiscalité maroc changement",
    "visa maroc actualité",
    "MRE actualité réglementaire",
  ],
  alternates: { canonical: "/maroc/veille" },
  openGraph: {
    title: "Radar de Veille Maroc : ce qui change pour les expats & MRE",
    description:
      "Séjour, fiscalité, devises, succession, douane : chaque changement avec son statut honnête et son enjeu pour toi.",
    url: "/maroc/veille",
    type: "website",
  },
};

export default function VeilleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
