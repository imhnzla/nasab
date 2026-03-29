// POST /api/v1/submissions — Phase 3, requires Bearer token
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: { code: 'NOT_IMPLEMENTED' } }, { status: 501 })
}
