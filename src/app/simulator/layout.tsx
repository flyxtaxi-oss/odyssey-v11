import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulateur de Trajectoire — Compare 50+ pays | Odyssey",
  description:
    "Compare fiscalité, coût de la vie, visas et projections financières dans 50+ pays. Simule ta trajectoire d'expatriation avec l'IA en 2 minutes.",
  alternates: { canonical: "/simulator" },
  openGraph: {
    title: "Simulateur de Trajectoire — Compare 50+ pays",
    description: "Compare fiscalité, coût de la vie et visas par pays.",
    url: "/simulator",
  },
};

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
