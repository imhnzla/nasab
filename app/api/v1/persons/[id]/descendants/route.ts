// GET /api/v1/persons/:id/descendants — Phase 5
// Next.js 16: params is a Promise
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  void id
  return NextResponse.json({ data: [], meta: { version: '1' } })
}
