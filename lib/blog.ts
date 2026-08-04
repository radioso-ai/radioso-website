import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

import matter from 'gray-matter'

export type PostMeta = {
  slug: string
  title: string
  description: string
  date: string
  author?: string
  draft: boolean
}

export type Post = PostMeta & {
  content: string
}

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog')

function requireString(value: unknown, field: string, fileName: string) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `content/blog/${fileName}: frontmatter field "${field}" is required and must be a non-empty string.`,
    )
  }

  return value.trim()
}

function requireDate(value: unknown, rawFrontmatter: string, fileName: string) {
  // YAML turns an unquoted 2026-08-04 into a Date and a quoted one into a string, and it
  // silently rolls an out-of-range date over (2026-13-45 becomes 2027-02-14), so the parsed
  // value is compared against the literal the author wrote instead of being trusted.
  const date = value instanceof Date && !Number.isNaN(value.getTime())
    ? value.toISOString().slice(0, 10)
    : typeof value === 'string'
      ? value.trim()
      : ''
  const literal = /^date:[ \t]*(.*?)[ \t]*$/m.exec(rawFrontmatter)?.[1].replace(/^(['"])(.*)\1$/, '$2')

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || literal !== date) {
    throw new Error(
      `content/blog/${fileName}: frontmatter field "date" is required and must be a real YYYY-MM-DD date (got ${JSON.stringify(literal ?? value)}).`,
    )
  }

  return date
}

function optionalString(value: unknown, field: string, fileName: string) {
  if (value === undefined || value === null) {
    return undefined
  }

  return requireString(value, field, fileName)
}

function optionalBoolean(value: unknown, field: string, fileName: string) {
  if (value === undefined || value === null) {
    return false
  }

  if (typeof value !== 'boolean') {
    throw new Error(`content/blog/${fileName}: frontmatter field "${field}" must be true or false.`)
  }

  return value
}

function parsePost(fileName: string, source: string): Post {
  const file = matter(source)
  const data: Record<string, unknown> = file.data
  const rawFrontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1] ?? ''

  return {
    slug: fileName.replace(/\.md$/, ''),
    title: requireString(data.title, 'title', fileName),
    description: requireString(data.description, 'description', fileName),
    date: requireDate(data.date, rawFrontmatter, fileName),
    author: optionalString(data.author, 'author', fileName),
    draft: optionalBoolean(data.draft, 'draft', fileName),
    content: file.content,
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const fileNames = (await readdir(POSTS_DIR)).filter((fileName) => fileName.endsWith('.md'))

  const posts = await Promise.all(
    fileNames.map(async (fileName) => parsePost(fileName, await readFile(path.join(POSTS_DIR, fileName), 'utf8'))),
  )

  return posts
    .filter((post) => !post.draft || process.env.NODE_ENV !== 'production')
    .sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date)))
}

export async function getPost(slug: string): Promise<Post> {
  const fileName = `${slug}.md`

  try {
    return parsePost(fileName, await readFile(path.join(POSTS_DIR, fileName), 'utf8'))
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`No blog post found for slug "${slug}" (expected content/blog/${fileName}).`)
    }

    throw error
  }
}

export function formatPostDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
