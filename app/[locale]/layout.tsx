import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/lib/i18n/routing'
import type { Locale } from '@/lib/i18n/routing'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'NASAB | نسب',
    template: '%s | NASAB',
  },
  description: 'Global platform for preserving and verifying the lineage of Prophet Muhammad ﷺ',
  metadataBase: new URL('https://nasab.org'),
  openGraph: {
    siteName: 'NASAB | نسب',
    type: 'website',
  },
}

// Next.js 16: params is a Promise
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}): Promise<React.ReactElement> {
  const { locale } = await params

  if (!routing.locales.includes(locale as Locale)) notFound()

  const messages = await getMessages()
  const dir = locale === 'ar' || locale === 'ur' || locale === 'fa' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body className="bg-nasab-cream text-nasab-navy min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
