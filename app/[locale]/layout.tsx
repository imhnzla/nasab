import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Amiri, Noto_Naskh_Arabic, Cormorant_Garamond, Inter } from 'next/font/google'
import { routing } from '@/lib/i18n/routing'
import type { Locale } from '@/lib/i18n/routing'
import '@/app/globals.css'

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-arabic-display',
  display: 'swap',
})

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic-body',
  display: 'swap',
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-en-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-en-body',
  display: 'swap',
})

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
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as Locale)) notFound()

  const messages = await getMessages()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const fontVars = [
    amiri.variable,
    notoNaskhArabic.variable,
    cormorantGaramond.variable,
    inter.variable,
  ].join(' ')

  return (
    <html lang={locale} dir={dir} className={fontVars}>
      <body className="min-h-screen bg-nasab-cream text-nasab-navy antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
