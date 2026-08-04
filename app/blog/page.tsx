import type { Metadata } from 'next'
import Link from 'next/link'

import { PageShell } from '@/components/page-shell'
import { formatPostDate, getAllPosts } from '@/lib/blog'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Notes from the Radioso team on conversational agents, grounded answers, and building in the open.',
  alternates: { canonical: `${site.url}/blog` },
}

export default async function BlogIndexPage() {
  const posts = await getAllPosts()

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-4xl px-6 py-12 md:py-16">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl">Blog</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          Notes from the Radioso team on conversational agents, grounded answers, and building in the open.
        </p>
        {posts.length === 0 ? (
          <p className="mt-12 text-sm leading-7 text-muted-foreground">No posts yet — check back soon.</p>
        ) : (
          <ul className="mt-12 space-y-12">
            {posts.map((post) => (
              <li key={post.slug} className="border-t border-border/70 pt-8">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  {post.author ? ` · ${post.author}` : ''}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  <Link href={`/blog/${post.slug}`} className="underline-offset-4 hover:underline">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{post.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}
