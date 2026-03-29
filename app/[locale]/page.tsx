import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import Navbar from '@/components/layout/Navbar'
import { cn } from '@/lib/utils'

export default function HomePage(): React.ReactElement {
  const t = useTranslations()
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-nasab-navy px-4 py-24 sm:py-36">
          {/* Geometric background motif */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #C9A84C 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative mx-auto max-w-4xl text-center">
            {/* Arabic calligraphic mark */}
            <p
              className="mb-4 text-5xl text-nasab-gold sm:text-7xl"
              style={{ fontFamily: 'var(--font-arabic-display)' }}
              aria-hidden={!isRtl}
            >
              نسب
            </p>

            <h1
              className={cn(
                'mb-6 text-3xl font-bold leading-tight text-nasab-cream sm:text-5xl',
                isRtl
                  ? 'font-[family-name:var(--font-arabic-display)]'
                  : 'font-[family-name:var(--font-en-display)]'
              )}
            >
              {t('home.title')}
            </h1>

            <p
              className={cn(
                'mb-10 text-lg text-nasab-cream/70 sm:text-xl',
                isRtl
                  ? 'font-[family-name:var(--font-arabic-body)]'
                  : 'font-[family-name:var(--font-en-body)]'
              )}
            >
              {t('home.subtitle')}
            </p>

            <div className={cn('flex flex-wrap justify-center gap-4', isRtl && 'flex-row-reverse')}>
              <Link
                href="/tree"
                className="rounded-sm bg-nasab-gold px-8 py-3 font-semibold text-nasab-navy transition-opacity hover:opacity-90"
              >
                {t('nav.tree')}
              </Link>
              <Link
                href="/submit"
                className="rounded-sm border border-nasab-gold/50 px-8 py-3 text-nasab-gold transition-colors hover:bg-nasab-gold/10"
              >
                {t('nav.submit')}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <FeatureCard
              icon="📜"
              titleKey="feature.verified.title"
              descKey="feature.verified.desc"
              isRtl={isRtl}
              t={t}
            />
            <FeatureCard
              icon="🌿"
              titleKey="feature.inclusive.title"
              descKey="feature.inclusive.desc"
              isRtl={isRtl}
              t={t}
            />
            <FeatureCard
              icon="🔗"
              titleKey="feature.connected.title"
              descKey="feature.connected.desc"
              isRtl={isRtl}
              t={t}
            />
          </div>
        </section>
      </main>
    </>
  )
}

function FeatureCard({
  icon,
  titleKey,
  descKey,
  isRtl,
  t,
}: {
  icon: string
  titleKey: string
  descKey: string
  isRtl: boolean
  t: ReturnType<typeof useTranslations>
}): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-lg border border-nasab-gold/20 bg-white/60 p-6 shadow-sm',
        isRtl ? 'text-right' : 'text-left'
      )}
    >
      <div className="mb-3 text-3xl">{icon}</div>
      <h3
        className={cn(
          'mb-2 text-lg font-semibold text-nasab-navy',
          isRtl
            ? 'font-[family-name:var(--font-arabic-display)]'
            : 'font-[family-name:var(--font-en-display)]'
        )}
      >
        {t(titleKey)}
      </h3>
      <p className="text-sm leading-relaxed text-nasab-navy/70">{t(descKey)}</p>
    </div>
  )
}
