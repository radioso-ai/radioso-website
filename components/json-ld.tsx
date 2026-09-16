// Renders a schema.org graph as a <script type="application/ld+json">. The
// payload is our own static data, never user input, so the raw injection is safe;
// escaping "<" keeps a stray "</script>" in copy from ending the block early.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
