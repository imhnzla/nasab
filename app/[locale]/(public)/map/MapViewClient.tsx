'use client'
import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { PersonRow } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'

const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import('react-leaflet').then((m) => m.CircleMarker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
)

export function MapViewClient({ persons }: { persons: PersonRow[] }): React.ReactElement {
  useEffect(() => {
    import('leaflet/dist/leaflet.css')
  }, [])

  // Now this works cleanly because we extended PersonRow
  const withCoords = persons.filter((p): p is PersonRow & { lat: number; lng: number } =>
    p.lat !== null && p.lng !== null
  )

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={[24.0, 45.0]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />
        {withCoords.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={8}
            color={p.branch ? BRANCH_COLOURS[p.branch as keyof typeof BRANCH_COLOURS] : '#6B7280'}
            fillOpacity={0.8}
          >
            <Popup>
              <strong>{p.name_en}</strong><br />
              <span dir="rtl">{p.name_ar}</span><br />
              {p.birth_city && (
                <span>
                  {p.birth_city}, {p.birth_country}
                </span>
              )}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
