import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// BFS from `from` toward root, and from `to` toward root — find intersection
export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const fromId = searchParams.get('from')
  const toId   = searchParams.get('to')
  if (!fromId || !toId) {
    return NextResponse.json({ error: 'Missing from or to' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: persons } = await supabase
    .from('persons')
    .select('id, father_id, name_ar, name_en, generation')

  if (!persons) return NextResponse.json({ error: 'No data' }, { status: 500 })

  const parentOf = new Map(persons.map((p) => [p.id, p.father_id]))
  const personOf = new Map(persons.map((p) => [p.id, p]))

  // Collect ancestors of `from`
  function ancestors(id: string): Map<string, string[]> {
    const chain: string[] = []
    let cur: string | null | undefined = id
    const seen = new Map<string, string[]>()
    while (cur) {
      chain.push(cur)
      seen.set(cur, [...chain])
      cur = parentOf.get(cur) ?? null
    }
    return seen
  }

  const fromAncestors = ancestors(fromId)
  const toAncestors   = ancestors(toId)

  // Find lowest common ancestor
  let lca: string | null = null
  for (const [id] of fromAncestors) {
    if (toAncestors.has(id)) { lca = id; break }
  }

  if (!lca) {
    return NextResponse.json({ path: [], message: 'No common ancestor found' })
  }

  const fromChain = fromAncestors.get(lca) ?? []
  const toChain   = (toAncestors.get(lca) ?? []).reverse()
  const fullPath  = [...fromChain, ...toChain.filter((id) => id !== lca)]
  const pathPersons = fullPath.map((id) => personOf.get(id)).filter(Boolean)

  return NextResponse.json({ path: pathPersons, lca })
}
