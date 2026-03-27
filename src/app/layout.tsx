import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import CommandCenter from "@/components/CommandCenter";

export const metadata: Metadata = {
  metadataBase: new URL("https://odyssey.ai"),
  title: "Odyssey.ai — Life Operating System",
  description:
    "Le premier Life Operating System dopé à l'IA. Expatriation, finance, carrière, réseau — tout piloté par J.A.R.V.I.S., votre intelligence artificielle personnelle.",
  keywords: [
    "life operating system",
    "IA personnelle",
    "expatriation",
    "simulation de vie",
    "JARVIS",
    "odyssey ai",
    "optimisation de vie",
    "digital nomad",
  ],
  authors: [{ name: "Odyssey.ai" }],
  creator: "Jibril",
  openGraph: {
    title: "Odyssey.ai — Life Operating System",
    description: "L'IA qui pilote votre vie. Simulateur de trajectoire, réseau vérifié, coaching IA.",
    type: "website",
    locale: "fr_FR",
    siteName: "Odyssey.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Odyssey.ai — Life Operating System",
    description: "L'IA qui pilote votre vie.",
    creator: "@odysseyai",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Odyssey.ai",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0b0e14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="relative overflow-x-hidden antialiased">
        {/* Stitch DeepSpace Atmospheric Layers */}
        <div className="tech-grid" />

        <div className="relative z-10 flex min-h-screen">
          <Sidebar />
          {/* Spacer div to push content past the fixed sidebar - Hidden on mobile */}
          <div className="hidden md:block w-[300px] shrink-0" />
          <main className="flex-1 min-w-0 pb-24 md:pb-0">
            <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
