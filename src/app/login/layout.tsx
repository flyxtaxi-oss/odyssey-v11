import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | Odyssey",
  description: "Connecte-toi à ton Life OS Odyssey.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
