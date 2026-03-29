// Phase 1 — Interactive Family Tree
// Public route: /[locale]/tree
// Server component: fetches verified persons, passes to client wrapper

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { PersonRow } from '@/lib/tree/types'
import { TreePageClient } from './TreePageClient'

export const metadata: Metadata = {
  title: 'Family Tree',
  description: 'Explore the verified lineage of Prophet Muhammad ﷺ across 8+ generations.',
  openGraph: {
    title: 'NASAB Family Tree | شجرة النسب الشريف',
    description: 'Explore the verified lineage of Prophet Muhammad ﷺ across 8+ generations.',
    type: 'website',
  },
}

export default async function TreePage(): Promise<JSX.Element> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('is_verified', true)
    .order('generation', { ascending: true })

  if (error) {
    // Surface error in UI gracefully — tree will render empty
    console.error('[TreePage] Failed to fetch persons:', error.message)
  }

  const persons: PersonRow[] = (data ?? []) as PersonRow[]

  return <TreePageClient persons={persons} />
}
