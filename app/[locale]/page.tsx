import React from 'react'
import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/lib/i18n/navigation'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home')
  return {
    title: t('title'),
    description: t('subtitle'),
  }
}

export default function HomePage(): React.ReactElement {
  const t = useTranslations()

  return (
    <main className="min-h-screen bg-nasab-cream text-nasab-navy overflow-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-nasab-gold/20 bg-nasab-navy/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <span className="text-nasab-gold text-2xl font-bold tracking-tight font-[family-name:var(--font-en-display)]">
            NASAB
          </span>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/tree" className="text-sm text-nasab-cream/80 transition-colors hover:text-nasab-gold">
              {t('nav.tree')}
            </Link>
            <Link href="/search" className="text-sm text-nasab-cream/80 transition-colors hover:text-nasab-gold">
              {t('nav.search')}
            </Link>
            <Link href="/submit" className="text-sm text-nasab-cream/80 transition-colors hover:text-nasab-gold">
              {t('nav.submit')}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" locale="ar" className="text-sm text-nasab-cream/60 transition-colors hover:text-nasab-cream">
              عربي
            </Link>
            <Link
              href="/login"
              className="rounded-sm border border-nasab-gold/60 px-3 py-1.5 text-sm text-nasab-gold transition-colors hover:bg-nasab-gold hover:text-nasab-navy"
            >
              {t('nav.login')}
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden bg-nasab-navy px-6 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          aria-hidden="true"
          style={{
            backgroundImage:
              'repeating-linear-gradient(60deg,#c9a84c 0px,#c9a84c 1px,transparent 1px,transparent 60px),repeating-linear-gradient(-60deg,#c9a84c 0px,#c9a84c 1px,transparent 1px,transparent 60px)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%,rgba(201,168,76,.08) 0%,transparent 70%)' }}
        />
        <p className="relative mb-6 text-5xl text-nasab-gold/30 font-[family-name:var(--font-arabic-display)] sm:text-7xl" aria-hidden="true">
          نسب
        </p>
        <h1 className="relative font-[family-name:var(--font-en-display)] text-6xl font-semibold tracking-tight text-nasab-cream sm:text-8xl">
          NASAB
        </h1>
        <div className="relative my-6 h-px w-24 bg-nasab-gold/60" />
        <p className="relative max-w-xl text-base leading-relaxed text-nasab-cream/70 sm:text-lg">
          {t('home.subtitle')}
        </p>
        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/tree"
            className="rounded-sm bg-nasab-gold px-7 py-3 text-sm font-medium text-nasab-navy transition-opacity hover:opacity-90"
          >
            {t('nav.tree')}
          </Link>
          <Link
            href="/submit"
            className="rounded-sm border border-nasab-gold/50 px-7 py-3 text-sm font-medium text-nasab-gold transition-colors hover:bg-nasab-gold/10"
          >
            {t('nav.submit')}
          </Link>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-nasab-cream/30">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-12">
        <div className="mb-16 text-center">
          <h2 className="font-[family-name:var(--font-en-display)] text-4xl font-semibold text-nasab-navy sm:text-5xl">
            A Living Archive
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-nasab-navy/60 leading-relaxed">
            Built for scholars, descendants, and seekers of authentic lineage documentation.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          <FeatureCard
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            }
            title={t('feature.verified.title')}
            desc={t('feature.verified.desc')}
          />
          <FeatureCard
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            }
            title={t('feature.inclusive.title')}
            desc={t('feature.inclusive.desc')}
          />
          <FeatureCard
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            }
            title={t('feature.connected.title')}
            desc={t('feature.connected.desc')}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-nasab-navy">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center sm:px-8">
          <h2 className="font-[family-name:var(--font-en-display)] text-3xl font-semibold text-nasab-cream sm:text-4xl">
            Find your place in the lineage
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-nasab-cream/60">
            Search millions of recorded descendants or submit your own lineage for scholarly review.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/search" className="rounded-sm bg-nasab-gold px-7 py-3 text-sm font-medium text-nasab-navy transition-opacity hover:opacity-90">
              {t('nav.search')}
            </Link>
            <Link
              href="/login"
              className="rounded-sm border border-nasab-cream/20 px-7 py-3 text-sm font-medium text-nasab-cream/70 transition-colors hover:border-nasab-cream/40 hover:text-nasab-cream"
            >
              {t('auth.register')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-nasab-navy/10 bg-nasab-cream px-6 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="font-[family-name:var(--font-en-display)] text-lg font-semibold text-nasab-navy/60">
            NASAB | نسب
          </span>
          <p className="text-xs text-nasab-navy/40">
            © {new Date().getFullYear()} NASAB. Preserving Prophetic lineage.
          </p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}): React.ReactElement {
  return (
    <div className="group rounded-lg border border-nasab-navy/10 bg-white/50 p-8 transition-shadow hover:shadow-md">
      <div className="mb-4 inline-flex rounded-sm bg-nasab-gold/10 p-3 text-nasab-gold">{icon}</div>
      <h3 className="mb-2 font-[family-name:var(--font-en-display)] text-xl font-semibold text-nasab-navy">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-nasab-navy/60">{desc}</p>
    </div>
  )
}
