import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function HomePage() {
  const t = useTranslations()

  return (
    <main>
      <h1>{t('home.title')}</h1>
      <Link href="/tree">{t('nav.tree')}</Link>
    </main>
  )
}
