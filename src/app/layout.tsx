import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Manrope, Inter } from "next/font/google";
import "./globals.css";

// Polices auto-hébergées (plus d'@import Google Fonts bloquant le rendu).
const fontDisplay = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const fontBody = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const fontLabel = Inter({ subsets: ["latin"], variable: "--font-label", display: "swap" });
import Sidebar from "@/components/Sidebar";
import { MotionProvider } from "@/components/MotionProvider";
import { LocaleProvider } from "@/contexts/LocaleContext";
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
    "Life Operating System pour expatriés francophones : 50 guides visa, comparateur fiscal, et un assistant IA en français.",
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
    description: "50 guides visa, un comparateur fiscal et coût de la vie, et J.A.R.V.I.S. pour répondre à tes questions de départ.",
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["fr_CA", "fr_BE", "fr_CH"],
    siteName: "Odyssey.ai",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Odyssey.ai — Le copilote IA des nomades francophones",
    description: "50 guides visa, comparateur fiscal, assistant IA en français.",
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
  // src/app/manifest.ts is a Next route handler, which Next serves at
  // /manifest.webmanifest. Pointing at /manifest.json returned a 404, so the
  // PWA was not installable — no "Add to Home Screen" on iOS or Android.
  manifest: "/manifest.webmanifest",
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
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth" className={`${fontDisplay.variable} ${fontBody.variable} ${fontLabel.variable}`}>
      <head>
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
              // No aggregateRating until real reviews exist. It previously
              // declared 4.8/5 from 127 ratings — invented. Google reads this
              // markup to render star ratings in search results, and fabricated
              // review data violates its structured-data policy: it risks a
              // manual action on the whole domain, not just a lost rich result.
            }),
          }}
        />
      </head>
      <body className="relative">
        <ThemeProvider>
        {/* Honours the OS "reduce motion" setting for every framer-motion
            animation — the CSS media query alone cannot stop JS-driven ones. */}
        <MotionProvider>
        {/* Locale — holds the UI language and hands `t` to components. */}
        <LocaleProvider>
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
              {/* Spacer that reserves room for the fixed sidebar. Only from
                  `md` up: below that the sidebar is an off-canvas drawer, and
                  an unconditional 300px here left 75px of content on a phone. */}
              <div className="hidden md:block w-[300px] shrink-0" />
              <main className="flex-1 min-w-0">
                {/* Top padding on mobile clears the fixed hamburger button. */}
                <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-20 md:pt-10 pb-10">
                  {children}
                </div>
              </main>
            </div>
            
            {/* JARVIS Global Command Center (Cmd+J) */}
            <CommandCenter />
          </ToastProvider>
        </AuthProvider>
        </LocaleProvider>
        </MotionProvider>
        </ThemeProvider>
        </body>
    </html>
  );
}
