// next-intl v4 — centralised routing definition
// Used by middleware.ts, request.ts, and navigation.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  // 'as-needed': default locale (ar) is served without a prefix.
  // /tree        → serves ar content directly (no redirect)
  // /en/tree     → serves en content (explicit prefix still works)
  // 'always' was forcing every /tree → redirect to /ar/tree or /en/tree,
  // making nasab-opal.vercel.app/tree unreachable without the prefix.
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]
