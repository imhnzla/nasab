// GET /api/v1/persons/:id — Phase 5
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ data: null, meta: { version: '1' } })
}
