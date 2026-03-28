// GET /api/v1/search?q= — Phase 5
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ data: [], meta: { version: '1' } })
}
