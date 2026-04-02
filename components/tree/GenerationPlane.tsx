'use client'
// A translucent horizontal slab representing one generation in the 3D view

import React from 'react'
const PLANE_WIDTH = 4000
const PLANE_DEPTH = 4000

const GEN_COLORS: Record<number, string> = {
  0: '#E1F5EE',
  1: '#E1F5EE',
  2: '#EAF3DE',
  3: '#FAEEDA',
  4: '#E6F1FB',
  5: '#EEEDFE',
  6: '#F1EFE8',
  7: '#FAECE7',
  8: '#FBEAF0',
}

export function GenerationPlane({
  generation,
  y,
}: {
  generation: number
  y: number
}): React.ReactElement {
  const color = GEN_COLORS[generation % 9] ?? '#F5F5F5'

  return (
    <group position={[0, y, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[PLANE_WIDTH, 6, PLANE_DEPTH]} />
        <meshStandardMaterial color={color} transparent opacity={0.25} />
      </mesh>
      {/* Generation label — rendered as a sprite-like plane at left edge */}
      <mesh position={[-PLANE_WIDTH / 2 + 60, 8, 0]}>
        <planeGeometry args={[80, 18]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}
