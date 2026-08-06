import { PillNav } from '@/components/pill-nav'
import { SiteFooter } from '@/components/site-footer'

type PageShellProps = {
  children: React.ReactNode
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <PillNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
