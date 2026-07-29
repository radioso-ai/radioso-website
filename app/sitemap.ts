import type { MetadataRoute } from 'next'

import { site } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: `${site.url}/`,
      lastModified,
      priority: 1,
    },
    {
      url: `${site.url}/slack`,
      lastModified,
    },
    {
      url: `${site.url}/legal/privacy-policy`,
      lastModified,
    },
    {
      url: `${site.url}/legal/terms-of-service`,
      lastModified,
    },
  ]
}
