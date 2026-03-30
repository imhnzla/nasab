// Next.js proxy (formerly middleware) — i18n locale routing + Supabase session refresh
// next-intl v4: createMiddleware is imported from 'next-intl/middleware'
import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from '@/lib/i18n/routing'

const intlMiddleware = createMiddleware(routing)

const PROTECTED_PATHS = ['/dashboard', '/submit', '/profile']

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // 1. Handle i18n routing
  const response = intlMiddleware(request)

  // 2. Refresh Supabase session on every request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cs) =>
          cs.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    }
  )
  await supabase.auth.getSession()

  // 3. Route protection (Phase 3+)
  // With localePrefix: 'as-needed', default locale (ar) paths have no prefix.
  // Strip the locale prefix only if present so the check works for both:
  //   /en/dashboard  →  strip /en  →  /dashboard  (explicit prefix)
  //   /dashboard     →  no strip   →  /dashboard  (default locale, no prefix)
  const rawPath = request.nextUrl.pathname
  const localeSegment = routing.locales.find((l) => rawPath.startsWith(`/${l}/`) || rawPath === `/${l}`)
  const pathname = localeSegment ? rawPath.replace(`/${localeSegment}`, '') || '/' : rawPath

  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      // Derive locale for the login redirect URL.
      // If an explicit prefix is present use it; otherwise use the default locale.
      const locale = localeSegment ?? routing.defaultLocale
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('next', rawPath)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
