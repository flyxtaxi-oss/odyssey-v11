import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safe-Zone — Communauté vérifiée d'expats | Odyssey",
  description:
    "Communauté privée d'expatriés et nomades vérifiés. Échanges, retours d'expérience, entraide. Pas de fake, pas de spam.",
  alternates: { canonical: "/safezone" },
  openGraph: {
    title: "Safe-Zone — La communauté vérifiée des expats",
    description: "Communauté privée, vérifiée. Zéro fake.",
    url: "/safezone",
  },
};

export default function SafezoneLayout({ children }: { children: React.ReactNode }) {
  return children;
}
