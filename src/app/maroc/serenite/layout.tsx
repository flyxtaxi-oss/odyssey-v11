import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Indice de Sérénité : quelle ville du Maroc pour s'installer ? | Odyssey",
  description:
    "Compare les villes du Maroc sur 7 axes de qualité de vie expat (sécurité, pouvoir d'achat, santé, climat, connectivité, communauté, administratif). Score personnalisé selon ton profil : étranger, MRE ou local.",
  keywords: [
    "meilleure ville maroc expat",
    "où s'installer au maroc",
    "qualité de vie maroc",
    "sécurité maroc ville",
    "marrakech vs agadir vs tanger",
    "vivre au maroc retraité",
  ],
  alternates: { canonical: "/maroc/serenite" },
  openGraph: {
    title: "Indice de Sérénité : la meilleure ville du Maroc pour toi",
    description:
      "7 axes, un score par ville, personnalisé selon ton profil. Trouve où tu seras le plus serein au Maroc.",
    url: "/maroc/serenite",
    type: "website",
  },
};

export default function SereniteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
