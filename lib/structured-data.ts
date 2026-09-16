import type { Post } from '@/lib/blog'
import { FAQ_ITEMS } from '@/lib/faq'
import { site } from '@/lib/site'

const ORG_ID = `${site.url}/#organization`

export const organization = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: site.name,
  url: site.url,
  logo: `${site.url}/apple-icon.png`,
  email: site.contactEmail,
  sameAs: [site.githubUrl],
}

export function homepageGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: site.url,
        name: site.name,
        publisher: { '@id': ORG_ID },
      },
      {
        '@type': 'SoftwareApplication',
        name: site.name,
        url: site.url,
        description: site.description,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, Linux, Docker',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@id': ORG_ID },
        softwareHelp: { '@type': 'CreativeWork', url: site.docsUrl },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  }
}

export function blogPostingGraph(post: Post) {
  const url = `${site.url}/blog/${post.slug}`
  const image = post.socialImage ?? post.image ?? '/og.png'

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url,
    mainEntityOfPage: url,
    url,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    image: `${site.url}${image}`,
    author: post.author
      ? { '@type': 'Person', name: post.author }
      : { '@id': ORG_ID },
    publisher: { ...organization },
    isPartOf: { '@type': 'Blog', '@id': `${site.url}/blog` },
  }
}
