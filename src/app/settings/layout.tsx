import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paramètres | Odyssey",
  description: "Gère ton profil et tes préférences.",
  robots: { index: false, follow: false },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
