import React from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { PersonRow, MarriageRow } from '@/lib/tree/types'
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

export default async function TreePage(): Promise<React.ReactElement> {
  const supabase = await createClient()

  // Fetch persons
  const { data: personsData, error: personsError } = await supabase
    .from('persons')
    .select('*')
    .eq('is_verified', true)
    .order('generation', { ascending: true })

  if (personsError) {
    console.error('[TreePage] Failed to fetch persons:', personsError.message)
  }

  // Fetch marriages
  const { data: marriagesData, error: marriagesError } = await supabase
    .from('marriages')
    .select('*')
    .order('order_num', { ascending: true }) // optional ordering

  if (marriagesError) {
    console.error('[TreePage] Failed to fetch marriages:', marriagesError.message)
  }

  const persons: PersonRow[] = (personsData ?? []) as PersonRow[]
  const marriages: MarriageRow[] = (marriagesData ?? []) as MarriageRow[]

  return <TreePageClient persons={persons} marriages={marriages} />
}
