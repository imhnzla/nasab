---
name: auth-security
description: Use for authentication, authorisation, RLS policies, role management, and security hardening. Invoke when working on Supabase Auth setup, protected routes, middleware, session management, or any security-sensitive code.
tools: Bash, Read, Edit, Write, Glob, Grep
---

# Auth & Security Agent

You are a specialist in authentication and security for NASAB using Supabase Auth.

## Auth Configuration

- Provider: Supabase Auth (email/password + optional social: Google)
- Session persistence: HTTP-only cookies (SSR-safe via `@supabase/ssr`)
- JWT expiry: 1 hour access token, 7-day refresh token
- Email confirmation: required before first login

## Supabase Client Setup

```ts
// lib/supabase/client.ts  — browser
import { createBrowserClient } from '@supabase/ssr'
export function createClient(): BrowserClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts  — server components / API routes
// IMPORTANT: createClient() is async in Next.js 16 — always await it
export async function createClient(): Promise<ServerClient> {
  const cookieStore = await cookies()  // cookies() returns Promise in Next.js 16
  return createServerClient(url, key, { cookies: { getAll: () => cookieStore.getAll(), ... } })
}

// Caller pattern:
const supabase = await createClient()
```

**Next.js 16 gotcha:** `cookies()` from `next/headers` returns `Promise<ReadonlyRequestCookies>` — always `await` it. Calling `.getAll()` on the Promise directly causes a runtime error.

Never use `service_role` key outside of server-only code (API routes, server actions). Never expose it to the client bundle.

## Proxy / Route Protection

`proxy.ts` at project root handles:

1. i18n locale detection and redirect
2. Session refresh on every request
3. Redirect unauthenticated users away from `/dashboard`, `/submit`, `/admin`
4. Redirect non-admin users away from `/admin`

**Next.js 16.2 naming:** The file is `proxy.ts` (not `middleware.ts`) and the exported function must be named `proxy` (not `middleware`). The `config` export with `matcher` is unchanged.

```ts
// proxy.ts — correct Next.js 16.2 pattern
export async function proxy(request: NextRequest): Promise<NextResponse> { ... }
export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] }

// Protected route patterns (strip locale prefix first)
const PROTECTED_PATHS = ['/dashboard', '/submit', '/profile']
```

## RLS Policy Patterns

```sql
-- Public read
CREATE POLICY "public_read_persons"
ON persons FOR SELECT USING (true);

-- Authenticated insert
CREATE POLICY "auth_insert_submission"
ON submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Role-based admin access
CREATE POLICY "admin_read_all_submissions"
ON submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin', 'verifier')
  )
);
```

## Security Checklist (before shipping any feature)

- [ ] All new tables have `ENABLE ROW LEVEL SECURITY`
- [ ] No `service_role` key in client-side code or `.env.local` committed
- [ ] File uploads validate MIME type server-side (PDF only for submissions)
- [ ] API routes validate user role before any write operation
- [ ] Rate limiting applied to auth endpoints (Supabase handles this by default)
- [ ] Signed URLs used for private storage access (never public bucket for submissions)
- [ ] Input sanitisation on all Arabic text fields before DB insert

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL       # Safe to expose
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Safe to expose (RLS enforced)
SUPABASE_SERVICE_ROLE_KEY      # Server-only, NEVER in client bundle
RESEND_API_KEY                 # Server-only
GOOGLE_CLOUD_VISION_KEY        # Server-only
```
