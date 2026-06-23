import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal-page'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern access to and use of Radioso.',
  alternates: { canonical: `${site.url}/legal/terms-of-service` },
}

export default function TermsOfServicePage() {
  return (
    <LegalPage
      fileName="terms-of-service.md"
      description="The terms that govern access to and use of Radioso Cloud and the Radioso self-hosted software."
    />
  )
}
