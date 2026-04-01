'use client'

import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

export default function Navbar(): React.ReactElement {
  const t = useTranslations()
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return (
    <header className="sticky top-0 z-50 border-b border-nasab-gold/20 bg-nasab-navy/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-nasab-gold transition-opacity hover:opacity-80"
        >
          <span
            className={cn(
              'text-2xl font-bold tracking-tight',
              isRtl ? 'font-[family-name:var(--font-arabic-display)]' : 'font-[family-name:var(--font-en-display)]'
            )}
          >
            {isRtl ? 'نسب' : 'NASAB'}
          </span>
        </Link>

        {/* Nav links */}
        <div className={cn('hidden items-center gap-6 md:flex', isRtl ? 'flex-row-reverse' : 'flex-row')}>
          <NavLink href="/tree" label={t('nav.tree')} />
          <NavLink href="/search" label={t('nav.search')} />
          <NavLink href="/submit" label={t('nav.submit')} />
          <NavLink href="/map" label={t('nav.map')} />
        </div>

        {/* Locale switcher + auth */}
        <div className={cn('flex items-center gap-3', isRtl ? 'flex-row-reverse' : 'flex-row')}>
          <LocaleSwitcher />
          <Link
            href="/login"
            className="rounded-sm border border-nasab-gold/60 px-3 py-1.5 text-sm text-nasab-gold transition-colors hover:bg-nasab-gold hover:text-nasab-navy"
          >
            {t('nav.login')}
          </Link>
        </div>
      </nav>
    </header>
  )
}

function NavLink({ href, label }: { href: string; label: string }): React.ReactElement {
  return (
    <Link
      href={href}
      className="text-sm text-nasab-cream/80 transition-colors hover:text-nasab-gold"
    >
      {label}
    </Link>
  )
}

function LocaleSwitcher(): React.ReactElement {
  const locale = useLocale()

  return (
    <Link
      href="/"
      locale={locale === 'ar' ? 'en' : 'ar'}
      className="text-sm text-nasab-cream/60 transition-colors hover:text-nasab-cream"
    >
      {locale === 'ar' ? 'EN' : 'عربي'}
    </Link>
  )
}
