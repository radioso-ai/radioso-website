import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal-page'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Radioso collects, uses, and protects personal data.',
  alternates: { canonical: `${site.url}/legal/privacy-policy` },
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      fileName="privacy-policy.md"
      description="How Radioso handles personal data across Radioso Cloud, the website, and self-hosted deployments."
    />
  )
}
