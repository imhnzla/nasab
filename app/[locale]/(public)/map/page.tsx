import React from 'react'
import { createClient } from '@/lib/supabase/server'
import type { PersonRow } from '@/lib/tree/types'
import { MapViewClient } from './MapViewClient'

export default async function MapPage(): Promise<React.ReactElement> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('persons')
    .select('id, name_ar, name_en, branch, lat, lng, birth_city, birth_country')
    .eq('is_verified', true)
    .not('lat', 'is', null)

  if (error) {
    console.error('Error fetching persons for map:', error)
    // You can return an empty array or throw as per your error handling
    return <MapViewClient persons={[]} />
  }

  return <MapViewClient persons={data as PersonRow[]} />
}
