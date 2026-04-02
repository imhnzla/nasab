'use client'
/**
 * SpouseNode3D — wife node per design spec
 * Shape: circle (visually distinct from squircle male nodes)
 * Fill:  lapis #1B3A6B with inner glow on hover
 * Text:  parchment colour
 * Size:  85% of standard node
 */

import React, { useState } from 'react'
import { Html } from '@react-three/drei'
import type { PersonRow } from '@/lib/tree/types'
import { COLOUR, NODE_W, NODE_H, WIFE_SCALE } from '@/lib/tree/constants3d'

const W = NODE_W * WIFE_SCALE
const H = NODE_H * WIFE_SCALE

export function SpouseNode3D({
  person,
  position,
  marriageDate,
  onClick,
}: {
  person: PersonRow
  position: [number, number, number]
  marriageDate: string | null
  onClick: () => void
}): React.ReactElement {
  const [hovered, setHovered] = useState(false)

  return (
    <group position={position}>
      {/* Invisible click-target mesh */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[W * 0.38, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* HTML label */}
      <Html center distanceFactor={300} zIndexRange={[0, 12]} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Marriage date tag — floats above the circle */}
          {marriageDate && (
            <span
              style={{
                position: 'absolute',
                top: -18,
                fontSize: 8,
                color: COLOUR.dust,
                fontFamily: 'monospace',
                letterSpacing: 0.5,
                whiteSpace: 'nowrap',
              }}
            >
              م. {marriageDate}
            </span>
          )}

          <div
            onClick={onClick}
            style={{
              width: W,
              height: W, // circle: equal w/h
              borderRadius: '50%',
              background: hovered
                ? `radial-gradient(circle at 40% 35%, ${COLOUR.lapisLight}, ${COLOUR.lapis})`
                : COLOUR.lapis,
              border: `1.5px solid ${hovered ? COLOUR.lapisLight : COLOUR.lapis}`,
              boxShadow: hovered
                ? `0 0 12px ${COLOUR.lapis}90, 0 0 24px ${COLOUR.lapis}40`
                : `0 0 8px ${COLOUR.lapis}60, 1px 3px 8px rgba(0,0,0,0.3)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              cursor: 'pointer',
              pointerEvents: 'all',
              transition: 'box-shadow 0.2s, background 0.2s',
            }}
          >
            <p
              dir="rtl"
              title={person.name_ar}
              style={{
                margin: 0,
                color: COLOUR.parchment,
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 1.2,
                maxWidth: W - 12,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                fontFamily: 'serif',
              }}
            >
              {person.name_ar}
            </p>
            <p
              title={person.name_en}
              style={{
                margin: 0,
                color: `${COLOUR.parchment}90`,
                fontSize: 9,
                lineHeight: 1.1,
                maxWidth: W - 12,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}
            >
              {person.name_en}
            </p>
          </div>
        </div>
      </Html>
    </group>
  )
}
