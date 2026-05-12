import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "J.A.R.V.I.S. — Coach IA personnel pour expats | Odyssey",
  description:
    "Discutez avec J.A.R.V.I.S., votre coach IA spécialisé expatriation et digital nomadisme. 5 personas (Sage, Stratège, Coach, Exécuteur, Ami) pour t'accompagner 24/7.",
  alternates: { canonical: "/jarvis" },
  openGraph: {
    title: "J.A.R.V.I.S. — Coach IA personnel pour expats",
    description: "Ton IA personnelle pour piloter ta vie d'expat.",
    url: "/jarvis",
  },
};

export default function JarvisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
