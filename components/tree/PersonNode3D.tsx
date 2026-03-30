'use client'
// 3D person node — physical card mesh + HTML label billboard

import React from 'react'
import { Html } from '@react-three/drei'
import type { PersonRow, Branch } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'
import { NODE_3D_W, NODE_3D_H } from '@/lib/tree/constants3d'

export function PersonNode3D({
  person,
  position,
  onClick,
}: {
  person: PersonRow
  position: [number, number, number]
  onClick: () => void
}): React.ReactElement {
  const colour = person.branch ? BRANCH_COLOURS[person.branch as Branch] : '#6B7280'
  const isFemalePerson = person.gender === 'female'

  return (
    <group position={position}>
      {/* Physical backing mesh — clickable */}
      <mesh onClick={onClick}>
        {isFemalePerson
          ? <cylinderGeometry args={[NODE_3D_W / 2.8, NODE_3D_W / 2.8, 4, 32]} />
          : <boxGeometry args={[NODE_3D_W, NODE_3D_H, 4]} />
        }
        <meshStandardMaterial color={colour} opacity={0.85} transparent />
      </mesh>

      {/* HTML label */}
      <Html
        center
        distanceFactor={400}
        style={{ pointerEvents: 'none' }}
        zIndexRange={[0, 10]}
      >
        <div
          style={{
            width: NODE_3D_W - 16,
            background: '#fff',
            border: `2px solid ${colour}`,
            borderRadius: isFemalePerson ? '50%' : 6,
            padding: isFemalePerson ? '8px 12px' : '4px 8px',
            fontSize: 12,
            cursor: 'pointer',
            pointerEvents: 'all',
            textAlign: 'center',
          }}
          onClick={onClick}
        >
          <p dir="rtl" style={{ fontWeight: 700, margin: 0, fontSize: 13, lineHeight: 1.3 }}>
            {person.name_ar}
          </p>
          <p style={{ color: '#6B7280', margin: 0, fontSize: 11, lineHeight: 1.2 }}>
            {person.name_en}
          </p>
        </div>
      </Html>
    </group>
  )
}
