import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parcours A→Z : s'installer au Maroc étape par étape | Odyssey",
  description:
    "Génère ta feuille de route personnalisée pour t'installer au Maroc : papiers, déménagement, douane, carte de séjour, école, banque, fiscalité. Checklist interactive pour MRE et étrangers, avec coûts et délais.",
  keywords: [
    "s'installer au maroc étapes",
    "checklist déménagement maroc",
    "MRE retour au maroc démarches",
    "papiers pour vivre au maroc",
    "carte de séjour maroc",
    "douane retour définitif maroc",
  ],
  alternates: { canonical: "/maroc/parcours" },
  openGraph: {
    title: "Parcours A→Z : s'installer au Maroc, étape par étape",
    description:
      "Feuille de route personnalisée MRE & étrangers : papiers, déménagement, arrivée, installation. Checklist interactive avec coûts et délais.",
    url: "/maroc/parcours",
    type: "website",
  },
};

export default function ParcoursLayout({ children }: { children: React.ReactNode }) {
  return children;
}
