// GET /api/v1/persons/:id/descendants — Phase 5
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ data: [], meta: { version: '1' } })
}
