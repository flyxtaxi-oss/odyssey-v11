import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skill Tracks — Compétences pour nomades | Odyssey",
  description:
    "Tracks de compétences gamifiés : business à distance, finance, négociation, langues. Missions IA quotidiennes pour progresser sans douleur.",
  alternates: { canonical: "/skills" },
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
