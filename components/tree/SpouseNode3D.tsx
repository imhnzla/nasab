'use client'
// 3D spouse node — flat oval (squashed cylinder) + HTML label

import React from 'react'
import { Html } from '@react-three/drei'
import type { PersonRow, Branch } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'
import { NODE_3D_W, NODE_3D_H } from '@/lib/tree/constants3d'

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
  const colour = person.branch ? BRANCH_COLOURS[person.branch as Branch] : '#D4537E'
  const scaleZ = NODE_3D_H / NODE_3D_W

  return (
    <group position={position}>
      {/* Squashed cylinder = oval */}
      <mesh onClick={onClick} scale={[1, 1, scaleZ]}>
        <cylinderGeometry args={[NODE_3D_W / 2, NODE_3D_W / 2, 4, 32]} />
        <meshStandardMaterial color={colour} transparent opacity={0.75} />
      </mesh>

      <Html center distanceFactor={400} style={{ pointerEvents: 'none' }} zIndexRange={[0, 10]}>
        <div
          style={{
            width: NODE_3D_W - 16,
            background: `${colour}18`,
            border: `2px solid ${colour}`,
            borderRadius: '50%',
            padding: '6px 12px',
            fontSize: 11,
            cursor: 'pointer',
            pointerEvents: 'all',
            textAlign: 'center',
            position: 'relative',
          }}
          onClick={onClick}
        >
          {marriageDate && (
            <span style={{ position: 'absolute', top: -16, left: 0, right: 0, fontSize: 9, color: colour, textAlign: 'center' }}>
              م. {marriageDate}
            </span>
          )}
          <p dir="rtl" style={{ fontWeight: 700, margin: 0, fontSize: 12, lineHeight: 1.3 }}>
            {person.name_ar}
          </p>
          <p style={{ color: '#6B7280', margin: 0, fontSize: 10, lineHeight: 1.2 }}>
            {person.name_en}
          </p>
        </div>
      </Html>
    </group>
  )
}
