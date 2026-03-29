// next-intl v4 — centralised routing definition
// Used by middleware.ts, request.ts, and navigation.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  // Always include locale prefix in URL (/ar/..., /en/...)
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]
