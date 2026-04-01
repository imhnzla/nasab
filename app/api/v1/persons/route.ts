// GET /api/v1/persons — Phase 5
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ data: [], meta: { version: '1' } })
}
