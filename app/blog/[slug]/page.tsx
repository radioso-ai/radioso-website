import type { Metadata } from 'next'
import Link from 'next/link'

import { Markdown } from '@/components/markdown'
import { PageShell } from '@/components/page-shell'
import { formatPostDate, getAllPosts, getPost } from '@/lib/blog'
import { site } from '@/lib/site'

type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()

  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${site.url}/blog/${post.slug}` },
    // Next replaces rather than merges openGraph/twitter from the root layout, so the
    // shared card image and siteName have to be restated here or posts share with no image.
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `${site.url}/blog/${post.slug}`,
      siteName: site.name,
      publishedTime: post.date,
      authors: post.author ? [post.author] : undefined,
      images: [{ url: '/og.png', width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: ['/og.png'],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  return (
    <PageShell>
      <article className="mx-auto w-full max-w-4xl px-6 py-12 md:py-16">
        <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          ← Back to blog
        </Link>
        <h1 className="display-serif mt-8 font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          {post.author ? ` · ${post.author}` : ''}
        </p>
        <Markdown>{post.content}</Markdown>
      </article>
    </PageShell>
  )
}
