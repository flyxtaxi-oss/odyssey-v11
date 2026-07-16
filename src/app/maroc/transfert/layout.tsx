import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Radar Transfert — le vrai coût pour envoyer de l'argent au Maroc | Odyssey",
  description:
    "Compare combien arrive vraiment au Maroc selon l'opérateur (Wise, Remitly, Western Union, MoneyGram, banque). On calcule la marge de change cachée et combien tu perds par an. Corridors France, Belgique, Espagne, Italie, Canada.",
  keywords: [
    "envoyer argent au maroc",
    "meilleur taux transfert maroc",
    "frais transfert MRE",
    "western union maroc frais",
    "wise remitly maroc",
    "marge de change cachée",
  ],
  alternates: { canonical: "/maroc/transfert" },
  openGraph: {
    title: "Radar Transfert — combien arrive vraiment au bled ?",
    description: "Comparateur du coût réel des transferts vers le Maroc + révélateur de l'argent perdu chaque année.",
    url: "/maroc/transfert",
    type: "website",
  },
};

export default function TransfertLayout({ children }: { children: React.ReactNode }) {
  return children;
}
