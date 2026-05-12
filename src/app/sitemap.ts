import { MetadataRoute } from 'next'
import { getVisaCountrySlugs } from '@/lib/visa-countries'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://odyssey-ai.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] }> = [
    { path: '', priority: 1, changeFrequency: 'daily' },
    { path: '/jarvis', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/simulator', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/simulator/predict', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/visa', priority: 0.85, changeFrequency: 'weekly' },
    { path: '/safezone', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/skills', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/language', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/login', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/settings', priority: 0.3, changeFrequency: 'monthly' },
  ]

  const staticEntries = staticRoutes.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  // Programmatic SEO: one page per visa country
  const visaEntries = getVisaCountrySlugs().map((slug) => ({
    url: `${BASE_URL}/visa/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  return [...staticEntries, ...visaEntries]
}
