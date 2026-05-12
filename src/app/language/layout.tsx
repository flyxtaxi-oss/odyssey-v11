import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apprentissage de langues IA — Pour expats | Odyssey",
  description:
    "Apprends la langue de ton pays d'expatriation avec un coach IA personnalisé. Sessions courtes, contextualisées à ta vie réelle.",
  alternates: { canonical: "/language" },
};

export default function LanguageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
