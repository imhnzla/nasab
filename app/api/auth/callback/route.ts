// Supabase Auth callback — handles OAuth code exchange (Google, email magic link)
// After sign-in, Supabase redirects here with a `code` query param.
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase/types'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/ar'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cs) =>
            cs.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            ),
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Redirect to `next` param, falling back to homepage
      const redirectUrl = next.startsWith('/') ? `${origin}${next}` : origin
      return NextResponse.redirect(redirectUrl)
    }
  }

  // On error, redirect to login with an error flag
  return NextResponse.redirect(`${origin}/ar/login?error=auth_callback_failed`)
}
