// Next.js middleware — i18n locale routing + Supabase session refresh
// Runs on every request before page rendering
import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { locales, defaultLocale } from '@/lib/i18n/config'

const intlMiddleware = createMiddleware({ locales, defaultLocale })

const PROTECTED = ['/dashboard', '/submit', '/profile']
const ADMIN_ONLY = ['/admin']
const VERIFIER_PLUS = ['/review']

export async function middleware(request: NextRequest) {
  // 1. Handle i18n routing
  const response = intlMiddleware(request)

  // 2. Refresh Supabase session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    }
  )
  await supabase.auth.getSession()

  // 3. Route protection (Phase 3+)
  // TODO: implement redirect logic for protected routes

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
