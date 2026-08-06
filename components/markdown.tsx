import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MarkdownProps = {
  children: string
  transformHref?: (href: string | undefined) => string | undefined
}

const linkClassName = 'font-medium text-foreground underline underline-offset-4'

function isExternalHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://')
}

export function Markdown({ children, transformHref }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="display-serif mb-4 font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="display-serif mt-12 border-t border-border/70 pt-8 font-serif text-2xl font-bold tracking-tight text-foreground">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="display-serif mt-8 font-serif text-lg font-semibold text-foreground">{children}</h3>
        ),
        p: ({ children }) => <p className="mt-4 text-sm leading-7 text-muted-foreground">{children}</p>,
        a: ({ children, href }) => {
          const normalizedHref = transformHref ? transformHref(href) : href

          if (normalizedHref && isExternalHref(normalizedHref)) {
            return (
              <a href={normalizedHref} target="_blank" rel="noreferrer" className={linkClassName}>
                {children}
              </a>
            )
          }

          return (
            <Link href={normalizedHref ?? '#'} className={linkClassName}>
              {children}
            </Link>
          )
        },
        ul: ({ children }) => (
          <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-7 text-muted-foreground">{children}</ul>
        ),
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        blockquote: ({ children }) => (
          <blockquote className="mt-6 border-l-2 border-primary pl-4 text-sm leading-7 text-muted-foreground">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{children}</code>
        ),
        hr: () => <div className="my-10 h-px bg-border/70" />,
        table: ({ children }) => (
          <div className="mt-6 overflow-x-auto rounded-md border border-border/70">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-b border-border/70 bg-muted/50 px-4 py-3 font-semibold text-foreground">{children}</th>
        ),
        td: ({ children }) => <td className="border-b border-border/50 px-4 py-3 text-muted-foreground">{children}</td>,
      }}
    >
      {children}
    </ReactMarkdown>
  )
}
