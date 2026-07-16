import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maroc vs Portugal, Dubaï, Espagne… : où s'expatrier en 2026 ? | Odyssey",
  description:
    "Compare le Maroc aux meilleures destinations d'expatriation (Portugal, Dubaï, Espagne, Géorgie, Thaïlande) sur 7 axes : sécurité, budget, fiscalité, santé, climat, connectivité, communauté. Classement personnalisé selon ton profil.",
  keywords: [
    "maroc vs portugal expatriation",
    "meilleure destination expatriation 2026",
    "où s'expatrier",
    "maroc ou dubai",
    "comparatif pays expatriation",
    "expatriation fiscalité comparatif",
  ],
  alternates: { canonical: "/maroc/comparateur" },
  openGraph: {
    title: "Maroc vs le reste du monde : où s'expatrier en 2026 ?",
    description:
      "7 axes, un score par pays, personnalisé selon ton profil. Le comparatif honnête des destinations expat.",
    url: "/maroc/comparateur",
    type: "website",
  },
};

export default function ComparateurLayout({ children }: { children: React.ReactNode }) {
  return children;
}
