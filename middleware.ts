// Next.js middleware — i18n locale routing + Supabase session refresh
// next-intl v4: createMiddleware is imported from 'next-intl/middleware'
import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from '@/lib/i18n/routing'

const intlMiddleware = createMiddleware(routing)

const PROTECTED_PATHS = ['/dashboard', '/submit', '/profile']
const ADMIN_PATHS = ['/admin']

export async function middleware(request: NextRequest) {
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
          cs.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  )
  await supabase.auth.getSession()

  // 3. Route protection (Phase 3+)
  // Strip locale prefix to check the path
  const pathname = request.nextUrl.pathname.replace(/^\/(ar|en)/, '')

  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      const loginUrl = new URL(`/${request.nextUrl.pathname.split('/')[1]}/login`, request.url)
      loginUrl.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
