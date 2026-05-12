import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/Toast";
import { ServiceWorkerRegistration } from "@/components/ServiceWorker";
import CommandCenter from "@/components/CommandCenter";
import { ThemeProvider } from "@/components/ThemeProvider";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://odyssey-ai.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Odyssey.ai — Life Operating System pour expats francophones",
  description:
    "Le premier Life Operating System dopé à l'IA. Expatriation, finance, carrière, réseau — tout piloté par J.A.R.V.I.S., ton intelligence artificielle personnelle. 50+ pays comparés.",
  keywords: [
    "expatriation",
    "digital nomad",
    "visa nomade",
    "simulateur expatriation",
    "fiscalité expat",
    "IA personnelle",
    "JARVIS",
    "life operating system",
    "vivre à l'étranger",
    "quitter la France",
  ],
  authors: [{ name: "Odyssey.ai" }],
  creator: "Jibril",
  publisher: "Odyssey.ai",
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
      "fr-CA": "/",
      "fr-BE": "/",
      "fr-CH": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "Odyssey.ai — Le copilote IA des nomades francophones",
    description: "Compare 50+ pays. Pilote tes visas. Coache-toi avec JARVIS. L'IA qui te fait économiser des milliers d'euros sur ton expatriation.",
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["fr_CA", "fr_BE", "fr_CH"],
    siteName: "Odyssey.ai",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Odyssey.ai — Le copilote IA des nomades francophones",
    description: "Compare 50+ pays, pilote tes visas, coache-toi avec JARVIS.",
    creator: "@odysseyai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  other: {
    "geo.region": "FR",
    "geo.placename": "Paris",
    "ICBM": "48.8566, 2.3522",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#070B14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Odyssey.ai",
              alternateName: "JARVIS Life OS",
              description:
                "Life Operating System dopé à l'IA pour expatriés, digital nomads et candidats à l'expatriation. Simulateur, JARVIS, visa tracker, communauté vérifiée.",
              applicationCategory: "LifestyleApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
              },
              inLanguage: "fr-FR",
              url: process.env.NEXT_PUBLIC_APP_URL || "https://odyssey-ai.app",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "127",
              },
            }),
          }}
        />
      </head>
      <body className="relative">
        <ThemeProvider>
        {/* Firebase Auth Provider */}
        <AuthProvider>
          {/* Toast Notifications */}
          <ToastProvider>
            {/* Service Worker for Offline/Push */}
            <ServiceWorkerRegistration />
            
            {/* V9 Ultra-Futuristic Visual Layers */}
            <div className="mesh-bg">
              <div className="mesh-blob cyan" />
              <div className="mesh-blob indigo" />
            </div>
            <div className="tech-grid" />
            <div className="noise" />

            <div className="relative z-10 flex min-h-screen">
              <Sidebar />
              {/* Spacer div to push content past the fixed sidebar */}
              <div className="w-[300px] shrink-0" />
              <main className="flex-1 min-w-0">
                <div className="max-w-[1100px] mx-auto px-8 py-10">
                  {children}
                </div>
              </main>
            </div>
            
            {/* JARVIS Global Command Center (Cmd+J) */}
            <CommandCenter />
          </ToastProvider>
        </AuthProvider>
        </ThemeProvider>
        </body>
    </html>
  );
}
