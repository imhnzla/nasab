'use client'
// 3D family tree view using React Three Fiber
// Each generation is a translucent plane; nodes float on planes; marriage arcs float above

import React, { useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { PersonRow, MarriageRow, Branch } from '@/lib/tree/types'
import type { LayoutNode } from '@/lib/workers/layout.worker'
import { PLANE_GAP } from '@/lib/tree/constants3d'
import { GenerationPlane }   from './GenerationPlane'
import { PersonNode3D }      from './PersonNode3D'
import { SpouseNode3D }      from './SpouseNode3D'
import { ParentChildLine3D } from './ParentChildLine3D'
import { MarriageArc3D }     from './MarriageArc3D'

export type TreeCanvas3DProps = {
  persons:     PersonRow[]
  marriages:   MarriageRow[]
  nodes:       LayoutNode[]
  onNodeClick: (personId: string) => void
}

// Derives visible generation range from camera position
function FrustumCuller({
  generations,
  onVisibleChange,
}: {
  generations: number[]
  onVisibleChange: (gens: number[]) => void
}): null {
  useFrame(({ camera }) => {
    const focusGen = Math.round(-camera.position.y / PLANE_GAP)
    onVisibleChange(generations.filter((g) => Math.abs(g - focusGen) <= 5))
  })
  return null
}

export function TreeCanvas3D({
  persons,
  marriages,
  nodes,
  onNodeClick,
}: TreeCanvas3DProps): React.ReactElement {
  const [visibleGens, setVisibleGens] = useState<number[]>([])

  const uniqueGens = [...new Set(persons.map((p) => p.generation ?? 1))].sort((a, b) => a - b)

  // Centre the tree on the X axis
  const personNodes = nodes.filter((n) => n.type === 'person')
  const avgX =
    personNodes.length > 0
      ? personNodes.reduce((s, n) => s + n.position.x, 0) / personNodes.length
      : 0

  // Build position map: personId → 3D [x, y, z]
  const posMap = new Map<string, [number, number, number]>()
  for (const n of personNodes) {
    const person = (n.data as { person: PersonRow }).person
    posMap.set(n.id, [
      n.position.x - avgX,
      -(person.generation ?? 1) * PLANE_GAP,
      0,
    ])
  }

  const personMap = new Map<string, PersonRow>()
  for (const p of persons) personMap.set(p.id, p)

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, -PLANE_GAP * 1.5, 900], fov: 50 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[0, 500, 500]} intensity={0.5} />
        <OrbitControls enablePan enableZoom enableRotate />

        <FrustumCuller generations={uniqueGens} onVisibleChange={setVisibleGens} />

        {/* Generation planes */}
        {uniqueGens.map((gen) => (
          <GenerationPlane key={gen} generation={gen} y={-gen * PLANE_GAP} />
        ))}

        {/* Person nodes */}
        {persons
          .filter((p) => visibleGens.includes(p.generation ?? 1) && posMap.has(p.id))
          .map((p) => (
            <PersonNode3D
              key={p.id}
              person={p}
              position={posMap.get(p.id)!}
              onClick={() => onNodeClick(p.id)}
            />
          ))}

        {/* Spouse nodes */}
        {marriages
          .filter((m) => {
            const hGen = personMap.get(m.husband_id)?.generation ?? 99
            return visibleGens.includes(hGen) && posMap.has(m.husband_id)
          })
          .map((m) => {
            const wife = personMap.get(m.wife_id)
            if (!wife) return null
            const hPos = posMap.get(m.husband_id)!
            // Stack wives to the right of husband
            const wifePos: [number, number, number] = [
              hPos[0] + 260,
              hPos[1] + (m.order_num - 1) * 90,
              0,
            ]
            return (
              <SpouseNode3D
                key={`spouse3d-${m.wife_id}`}
                person={wife}
                position={wifePos}
                marriageDate={m.date_hijri}
                onClick={() => onNodeClick(m.wife_id)}
              />
            )
          })}

        {/* Marriage arcs */}
        {marriages
          .filter((m) => {
            const hGen = personMap.get(m.husband_id)?.generation ?? 99
            return visibleGens.includes(hGen) && posMap.has(m.husband_id)
          })
          .map((m) => {
            const husband = personMap.get(m.husband_id)
            const wife    = personMap.get(m.wife_id)
            if (!husband || !wife) return null
            const hPos = posMap.get(m.husband_id)!
            const wifePos: [number, number, number] = [
              hPos[0] + 260,
              hPos[1] + (m.order_num - 1) * 90,
              0,
            ]
            const crossBranch = husband.branch !== wife.branch
            return (
              <MarriageArc3D
                key={`arc3d-${m.id}`}
                from={hPos}
                to={wifePos}
                marriageDate={m.date_hijri}
                crossBranch={crossBranch}
              />
            )
          })}

        {/* Parent-child drop lines */}
        {persons
          .filter((p) => p.father_id && posMap.has(p.id) && posMap.has(p.father_id))
          .map((p) => (
            <ParentChildLine3D
              key={`drop-${p.id}`}
              from={posMap.get(p.father_id!)!}
              to={posMap.get(p.id)!}
            />
          ))}
      </Canvas>
    </div>
  )
}
