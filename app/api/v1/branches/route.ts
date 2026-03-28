// GET /api/v1/branches — Phase 5
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    data: {
      hasanid: { total: 0, verified: 0 },
      husaynid: { total: 0, verified: 0 },
      hashemite: { total: 0, verified: 0 },
    },
    meta: { version: '1' },
  })
}
