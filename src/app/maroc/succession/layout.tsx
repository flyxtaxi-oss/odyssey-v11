import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculateur de succession au Maroc (Moudawana) — héritage & taâssib | Odyssey",
  description:
    "Comprends la répartition de l'héritage selon le Code de la famille marocain : parts du conjoint, des enfants, des parents, et l'enjeu du taâssib au cœur de la réforme de la Moudawana. Outil éducatif sourcé.",
  keywords: [
    "succession maroc",
    "héritage moudawana",
    "taâssib",
    "part héritage fille maroc",
    "réforme code de la famille maroc",
    "succession MRE",
  ],
  alternates: { canonical: "/maroc/succession" },
  openGraph: {
    title: "Calculateur de succession au Maroc — héritage & taâssib",
    description: "Visualise la répartition successorale (Fara'id) et l'enjeu de la réforme de la Moudawana. Éducatif, sourcé.",
    url: "/maroc/succession",
    type: "website",
  },
};

export default function SuccessionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
