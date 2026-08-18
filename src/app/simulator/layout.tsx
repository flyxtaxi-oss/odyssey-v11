import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulateur — Compare ton pouvoir d'achat | Odyssey",
  description:
    "Compare salaire net, impôts et coût de la vie entre la France et 6 destinations d'expatriation.",
  alternates: { canonical: "/simulator" },
  openGraph: {
    title: "Simulateur — Compare ton pouvoir d'achat",
    description: "Compare fiscalité, coût de la vie et visas par pays.",
    url: "/simulator",
  },
};

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
