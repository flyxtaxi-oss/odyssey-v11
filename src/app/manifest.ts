import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Odyssey.ai — Life Operating System',
    short_name: 'Odyssey',
    description:
      "Le Life Operating System des expats et digital nomads francophones. Simulateur 50+ pays, JARVIS IA, visa tracker, communauté vérifiée.",
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0b0e14',
    theme_color: '#070B14',
    lang: 'fr-FR',
    dir: 'ltr',
    categories: ['lifestyle', 'productivity', 'travel', 'finance'],
    scope: '/',
    icons: [
      { src: '/icon', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon?size=512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'JARVIS', short_name: 'Chat', description: 'Discute avec ton IA', url: '/jarvis' },
      { name: 'Simulateur', short_name: 'Sim', description: 'Compare les pays', url: '/simulator' },
      { name: 'Visa Tracker', short_name: 'Visa', description: 'Suis tes visas', url: '/visa' },
    ],
    prefer_related_applications: false,
  };
}
