'use client'
/**
 * PersonNode3D — spec-faithful node designs
 *
 * Prophet (gen 1, no father_id):  Octagon · 3× size · deep-gold radial gradient · halo glow
 * Standard male ancestor:         Squircle (border-radius 30%) · parchment · gold border
 * Daughter node:                  Squircle · parchment · emerald border
 * All nodes:                      G·{n} badge · verified seal · tradition ring
 */

import React, { useState } from 'react'
import { Html } from '@react-three/drei'
import type { PersonRow, Branch } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'
import { COLOUR, NODE_W, NODE_H, ROOT_SIZE } from '@/lib/tree/constants3d'

// Octagon clip-path polygon (same as spec: 8-vertex geometry referencing Islamic architecture)
const OCTAGON_CLIP = 'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)'

function traditionColor(t: string | null): string | null {
  if (t === 'sunni') return '#15803D'
  if (t === 'shia') return '#1E3A5F'
  if (t === 'both') return null // handled separately as gradient
  return null
}

export function PersonNode3D({
  person,
  position,
  highlighted,
  dimmed,
  onClick,
}: {
  person: PersonRow
  position: [number, number, number]
  highlighted: boolean
  dimmed: boolean
  onClick: () => void
}): React.ReactElement {
  const [hovered, setHovered] = useState(false)

  const isRoot = !person.father_id && (person.generation === 1 || person.generation === null)
  const isDaughter = person.gender === 'female' && !!person.father_id
  const isLiving = (person as { is_living?: boolean }).is_living === true

  const branchColour = person.branch ? BRANCH_COLOURS[person.branch as Branch] : COLOUR.goldDim

  // Border colour per spec
  const borderColour = isRoot ? COLOUR.goldLight : isDaughter ? COLOUR.emerald : COLOUR.goldPrimary

  const nodeW = isRoot ? NODE_W * ROOT_SIZE : NODE_W
  const nodeH = isRoot ? NODE_H * ROOT_SIZE : NODE_H

  const opacity = dimmed ? 0.22 : 1

  // Tradition ring style
  const trad = person.scholarly_tradition
  const tradColor = traditionColor(trad)
  const tradStyle: React.CSSProperties =
    trad === 'both'
      ? {
          border: '1.5px solid transparent',
          background: `linear-gradient(white, white) padding-box,
                     linear-gradient(90deg, #15803D 50%, #1E3A5F 50%) border-box`,
        }
      : tradColor
        ? { border: `1.5px solid ${tradColor}` }
        : {}

  return (
    <group position={position}>
      {/* Invisible click mesh — Three.js raycasting target */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[nodeW * 0.6, nodeH * 0.6, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* HTML label */}
      <Html
        center
        distanceFactor={isRoot ? 700 : 500}
        zIndexRange={[0, 15]}
        style={{ opacity, transition: 'opacity 0.3s', pointerEvents: 'none' }}
      >
        {isRoot ? (
          // ── Prophet's octagonal node ────────────────────────────
          <div
            style={{
              width: nodeW,
              height: nodeW, // square base for octagon
              clipPath: OCTAGON_CLIP,
              background: `radial-gradient(circle at 40% 35%, ${COLOUR.goldLight}, ${COLOUR.goldPrimary} 70%)`,
              boxShadow: hovered
                ? `0 0 24px ${COLOUR.goldPrimary}, 0 0 48px ${COLOUR.goldPrimary}80, 0 0 96px ${COLOUR.goldPrimary}30`
                : `0 0 16px ${COLOUR.goldPrimary}90, 0 0 40px ${COLOUR.goldPrimary}40, 0 0 80px ${COLOUR.goldPrimary}20`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              cursor: 'pointer',
              pointerEvents: 'all',
              transition: 'box-shadow 0.3s',
            }}
            onClick={onClick}
          >
            <p
              dir="rtl"
              style={{
                margin: 0,
                color: COLOUR.ink,
                fontSize: 18,
                fontWeight: 900,
                lineHeight: 1.2,
                fontFamily: 'serif',
              }}
            >
              محمد ﷺ
            </p>
            <p
              style={{
                margin: 0,
                color: COLOUR.inkLight,
                fontSize: 11,
                fontStyle: 'italic',
                lineHeight: 1,
              }}
            >
              Muhammad ﷺ
            </p>
            <p
              style={{
                margin: 0,
                color: COLOUR.goldDim,
                fontSize: 9,
                letterSpacing: 2,
                fontFamily: 'monospace',
                marginTop: 2,
              }}
            >
              النبي
            </p>
          </div>
        ) : (
          // ── Standard / daughter node ──────────────────────────────
          <div
            style={{
              position: 'relative',
              width: nodeW,
              height: nodeH,
              background: isLiving ? `${COLOUR.parchment}40` : COLOUR.parchment,
              border: `1.5px solid ${hovered ? COLOUR.goldLight : borderColour}`,
              borderRadius: '28%', // squircle
              boxShadow: highlighted
                ? `0 0 0 3px ${COLOUR.goldLight}, 0 0 16px ${COLOUR.goldLight}80`
                : hovered
                  ? `0 0 12px ${borderColour}60, 2px 4px 12px rgba(26,15,0,0.25)`
                  : `1px 3px 8px rgba(26,15,0,0.2)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              cursor: 'pointer',
              pointerEvents: 'all',
              overflow: 'hidden',
              transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
              transform: hovered ? 'translateZ(4px) scale(1.04)' : 'none',
            }}
            onClick={onClick}
          >
            {/* Tradition ring (inset 4px) */}
            {trad && (
              <div
                aria-label={`${trad} tradition`}
                style={{
                  position: 'absolute',
                  inset: 4,
                  borderRadius: '24%',
                  pointerEvents: 'none',
                  ...tradStyle,
                }}
              />
            )}

            {/* Photo avatar */}
            {person.photo_url && !isLiving && (
              <img
                src={person.photo_url}
                alt=""
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 6,
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `1.5px solid ${borderColour}`,
                }}
              />
            )}

            {/* Names */}
            {isLiving ? (
              <>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: COLOUR.ink,
                    filter: 'blur(5px)',
                    userSelect: 'none',
                  }}
                >
                  ████████
                </p>
                <p style={{ margin: 0, fontSize: 10, color: COLOUR.dust }}>Living member</p>
              </>
            ) : (
              <>
                <p
                  dir="rtl"
                  title={person.name_ar}
                  style={{
                    margin: 0,
                    color: COLOUR.ink,
                    fontSize: 13,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    maxWidth: nodeW - 16,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: 'serif',
                    paddingLeft: person.photo_url ? 32 : 0,
                  }}
                >
                  {person.name_ar}
                </p>
                <p
                  title={person.name_en}
                  style={{
                    margin: 0,
                    color: COLOUR.dust,
                    fontSize: 10,
                    lineHeight: 1.1,
                    maxWidth: nodeW - 16,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {person.name_en}
                </p>
              </>
            )}

            {/* Generation badge — bottom right */}
            {person.generation !== null && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 3,
                  right: 5,
                  fontSize: 8,
                  color: COLOUR.dust,
                  fontFamily: 'monospace',
                  letterSpacing: 0.5,
                }}
              >
                G·{person.generation}
              </span>
            )}

            {/* Verified seal — top right */}
            {person.is_verified && (
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  right: 5,
                  fontSize: 9,
                  color: COLOUR.emerald,
                  fontWeight: 700,
                }}
                title="Verified"
                aria-label="Verified"
              >
                ✦
              </span>
            )}
          </div>
        )}
      </Html>
    </group>
  )
}
