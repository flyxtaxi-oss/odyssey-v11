import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prédiction IA — Anticipe ton avenir d'expat | Odyssey",
  description:
    "Moteur de prédiction par IA (GraphRAG) pour anticiper tes opportunités d'expatriation. Données fiscales, visa, immobilier, marché du travail.",
  alternates: { canonical: "/simulator/predict" },
};

export default function PredictLayout({ children }: { children: React.ReactNode }) {
  return children;
}
