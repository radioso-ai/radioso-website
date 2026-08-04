import type { MetadataRoute } from 'next'

import { getAllPosts } from '@/lib/blog'
import { site } from '@/lib/site'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()
  const posts = await getAllPosts()

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
    {
      url: `${site.url}/blog`,
      lastModified,
    },
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(`${post.date}T00:00:00Z`),
    })),
  ]
}
