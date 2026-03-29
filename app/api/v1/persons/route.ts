// GET /api/v1/persons — public, paginated, rate-limited
// Phase 5. See docs/api.md for full spec.
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ data: [], meta: { version: '1', total: 0, page: 1 } })
}
