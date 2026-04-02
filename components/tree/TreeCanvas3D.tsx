'use client'
/**
 * TreeCanvas3D — NASAB immersive 3D genealogical space
 * Design spec: "Illuminated Manuscript meets Celestial Observatory"
 *
 * Architecture:
 *  - Shell layout: each generation is a horizontal disc at Y = -gen * SHELL_GAP
 *  - Within each disc: d3-force spreads nodes without overlap (X/Z plane)
 *  - GSAP drives cinematic camera entrance + focus-on-click fly-to
 *  - All UI chrome is HTML overlaid on the canvas (minimal, spec-faithful)
 *  - Minimap: 2D SVG projection of node X/Z positions
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as d3 from 'd3'
import { gsap } from 'gsap'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import type { PersonRow, MarriageRow, SearchHit } from '@/lib/tree/types'
import {
  COLOUR,
  SHELL_GAP,
  SHELL_BASE_RADIUS,
  NODE_COLLISION_R,
  FORCE_TICKS,
  CAM_START_Z,
  CAM_END_Z,
  CAM_Y_OFFSET,
  CAM_INTRO_DUR,
  CAM_FOCUS_DUR,
  MINIMAP_W,
  MINIMAP_H,
  MINIMAP_PAD,
} from '@/lib/tree/constants3d'

import { PersonNode3D } from './PersonNode3D'
import { SpouseNode3D } from './SpouseNode3D'
import { ParentChildLine3D } from './ParentChildLine3D'
import { MarriageArc3D } from './MarriageArc3D'
import { DetailPanel3D } from './DetailPanel3D'
import { SearchOverlay } from './SearchOverlay'

// ─── Types ───────────────────────────────────────────────────────────────────

export type TreeCanvas3DProps = {
  persons: PersonRow[]
  marriages: MarriageRow[]
  onSwitchTo2D: () => void
}

type FocusTarget = { pos: [number, number, number]; personId: string }

// ─── Shell layout ─────────────────────────────────────────────────────────────

function computeShellLayout(
  persons: PersonRow[],
  marriages: MarriageRow[]
): Map<string, [number, number, number]> {
  const posMap = new Map<string, [number, number, number]>()

  // Group by generation
  const byGen = new Map<number, PersonRow[]>()
  for (const p of persons) {
    const gen = p.generation ?? 1
    if (!byGen.has(gen)) byGen.set(gen, [])
    byGen.get(gen)!.push(p)
  }

  const sortedGens = [...byGen.keys()].sort((a, b) => a - b)

  for (const gen of sortedGens) {
    const genPersons = byGen.get(gen)!
    const y3d = -(gen - 1) * SHELL_GAP

    if (genPersons.length === 1) {
      posMap.set(genPersons[0].id, [0, y3d, 0])
      continue
    }

    // Shell radius grows with generation + node count
    const shellRadius = SHELL_BASE_RADIUS * Math.pow(gen, 0.75) + genPersons.length * 30

    // Seed nodes evenly on a circle for faster force convergence
    const simNodes = genPersons.map((p, i) => {
      const angle = (i / genPersons.length) * 2 * Math.PI
      return {
        id: p.id,
        x: Math.cos(angle) * shellRadius * 0.6,
        y: Math.sin(angle) * shellRadius * 0.6, // 'y' here = Z axis in 3D
      }
    })

    const sim = d3
      .forceSimulation(simNodes)
      .force('charge', d3.forceManyBody().strength(-NODE_COLLISION_R * 4))
      .force('center', d3.forceCenter(0, 0))
      .force('collide', d3.forceCollide(NODE_COLLISION_R))
      .stop()

    for (let i = 0; i < FORCE_TICKS; i++) sim.tick()

    for (const n of simNodes) {
      posMap.set(n.id, [n.x, y3d, n.y])
    }
  }

  // Place wives relative to their husband
  const personMap = new Map(persons.map((p) => [p.id, p]))
  for (const m of marriages) {
    if (posMap.has(m.wife_id)) continue // already placed as a person node
    const hPos = posMap.get(m.husband_id)
    if (!hPos) continue
    const wife = personMap.get(m.wife_id)
    if (!wife) continue
    posMap.set(m.wife_id, [hPos[0] + 230, hPos[1], hPos[2] + (m.order_num - 1) * 150])
  }

  return posMap
}

// ─── Cinematic camera ─────────────────────────────────────────────────────────

function CinematicCamera({
  focusTarget,
  controlsRef,
}: {
  focusTarget: FocusTarget | null
  controlsRef: React.RefObject<OrbitControlsImpl | null>
}): null {
  const { camera } = useThree()
  const enteredRef = useRef(false)

  // Cinematic entrance on mount
  useEffect(() => {
    if (enteredRef.current) return
    enteredRef.current = true

    camera.position.set(0, CAM_Y_OFFSET, CAM_START_Z)
    camera.lookAt(0, CAM_Y_OFFSET, 0)

    gsap.to(camera.position, {
      z: CAM_END_Z,
      duration: CAM_INTRO_DUR,
      ease: 'power2.out',
      onUpdate: () => {
        camera.lookAt(0, CAM_Y_OFFSET, 0)
        controlsRef.current?.update()
      },
    })
  }, [camera, controlsRef])

  // Fly to focused node
  useEffect(() => {
    if (!focusTarget) return
    const [tx, ty, tz] = focusTarget.pos

    gsap.to(camera.position, {
      x: tx,
      y: ty + 200,
      z: tz + 480,
      duration: CAM_FOCUS_DUR,
      ease: 'power3.inOut',
      onUpdate: () => {
        camera.lookAt(tx, ty, tz)
        if (controlsRef.current) {
          controlsRef.current.target.set(tx, ty, tz)
          controlsRef.current.update()
        }
      },
    })
  }, [focusTarget, camera, controlsRef])

  return null
}

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────

function useKeyboard(onReset: () => void, onSearch: () => void, onWives: () => void): void {
  useEffect(() => {
    function handler(e: KeyboardEvent): void {
      if (e.key === 'r' || e.key === 'R' || e.key === 'Home') onReset()
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onSearch()
      }
      if (e.key === 'w' || e.key === 'W') onWives()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onReset, onSearch, onWives])
}

// ─── Minimap ──────────────────────────────────────────────────────────────────

function Minimap2D({
  posMap,
  persons,
  focusedId,
}: {
  posMap: Map<string, [number, number, number]>
  persons: PersonRow[]
  focusedId: string | null
}): React.ReactElement | null {
  if (posMap.size === 0) return null

  const allX = [...posMap.values()].map(([x]) => x)
  const allZ = [...posMap.values()].map(([, , z]) => z)
  const minX = Math.min(...allX),
    maxX = Math.max(...allX)
  const minZ = Math.min(...allZ),
    maxZ = Math.max(...allZ)
  const rangeX = maxX - minX || 1
  const rangeZ = maxZ - minZ || 1

  const pad = 8
  const W = MINIMAP_W - pad * 2
  const H = MINIMAP_H - pad * 2

  function toSvg(x: number, z: number): [number, number] {
    return [pad + ((x - minX) / rangeX) * W, pad + ((z - minZ) / rangeZ) * H]
  }

  const personMap = new Map(persons.map((p) => [p.id, p]))

  return (
    <div
      style={{
        position: 'absolute',
        bottom: MINIMAP_PAD,
        right: MINIMAP_PAD,
        width: MINIMAP_W,
        height: MINIMAP_H,
        background: 'rgba(5,5,8,0.82)',
        border: `1px solid ${COLOUR.goldDim}`,
        borderRadius: 6,
        overflow: 'hidden',
        backdropFilter: 'blur(4px)',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <svg width={MINIMAP_W} height={MINIMAP_H}>
        {[...posMap.entries()].map(([id, [x, , z]]) => {
          const [sx, sy] = toSvg(x, z)
          const p = personMap.get(id)
          const isRoot = p?.generation === 1
          const isFocused = id === focusedId
          const fill = isRoot
            ? COLOUR.goldPrimary
            : isFocused
              ? COLOUR.goldLight
              : `${COLOUR.goldDim}99`
          return (
            <circle key={id} cx={sx} cy={sy} r={isRoot ? 4 : isFocused ? 3 : 1.5} fill={fill} />
          )
        })}
      </svg>
      <span
        style={{
          position: 'absolute',
          bottom: 4,
          left: pad,
          fontSize: 8,
          color: COLOUR.dust,
          fontFamily: 'monospace',
          letterSpacing: 0.5,
        }}
      >
        MINIMAP
      </span>
    </div>
  )
}

// ─── Loading state ─────────────────────────────────────────────────────────────

function LoadingState(): React.ReactElement {
  const octClip = 'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)'

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: COLOUR.void,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        gap: 24,
      }}
    >
      {/* Arabesque background at 2% opacity */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.02,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='none' stroke='%23C9943A' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='12' fill='none' stroke='%23C9943A' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
        aria-hidden="true"
      />

      {/* Pulsing octagon */}
      <div
        style={{
          width: 96,
          height: 96,
          clipPath: octClip,
          background: `radial-gradient(circle at 40% 35%, ${COLOUR.goldLight}, ${COLOUR.goldPrimary})`,
          boxShadow: `0 0 32px ${COLOUR.goldPrimary}80, 0 0 64px ${COLOUR.goldPrimary}30`,
          animation: 'nasab-pulse 2s ease-in-out infinite',
        }}
      />

      {/* Quranic verse */}
      <p
        dir="rtl"
        style={{
          color: COLOUR.goldDim,
          fontSize: 18,
          fontFamily: 'serif',
          letterSpacing: 2,
          animation: 'nasab-fade 3s ease-in-out infinite',
          textAlign: 'center',
          maxWidth: 320,
        }}
      >
        يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا
      </p>

      <style>{`
        @keyframes nasab-pulse {
          0%, 100% { opacity: 0.6; transform: scale(0.95); }
          50%       { opacity: 1.0; transform: scale(1.05); }
        }
        @keyframes nasab-fade {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}

// ─── Node count badge ──────────────────────────────────────────────────────────

function NodeCount({ total }: { total: number }): React.ReactElement {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: MINIMAP_PAD,
        left: MINIMAP_PAD,
        fontSize: 11,
        fontFamily: 'monospace',
        color: COLOUR.dust,
        letterSpacing: 0.5,
        pointerEvents: 'none',
      }}
      aria-label={`${total} persons recorded`}
    >
      {total.toLocaleString()} souls recorded
    </div>
  )
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

function TopBar({
  onSearchClick,
  showWives,
  onToggleWives,
  onSwitchTo2D,
}: {
  onSearchClick: () => void
  showWives: boolean
  onToggleWives: () => void
  onSwitchTo2D: () => void
}): React.ReactElement {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 52,
        background: `${COLOUR.parchment}18`,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${COLOUR.goldDim}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            color: COLOUR.goldPrimary,
            fontSize: 18,
            fontWeight: 800,
            fontFamily: 'serif',
            letterSpacing: 1,
          }}
        >
          نَسَب
        </span>
        <span
          style={{ color: COLOUR.dust, fontSize: 13, fontFamily: 'serif', fontStyle: 'italic' }}
        >
          · NASAB
        </span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Search */}
        <button
          onClick={onSearchClick}
          style={{
            background: `${COLOUR.parchment}15`,
            border: `1px solid ${COLOUR.goldDim}60`,
            borderRadius: 6,
            color: COLOUR.parchment,
            fontSize: 12,
            padding: '5px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backdropFilter: 'blur(4px)',
          }}
          aria-label="Search persons (⌘K)"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          Search
          <kbd style={{ fontSize: 9, color: COLOUR.dust, fontFamily: 'monospace' }}>⌘K</kbd>
        </button>

        {/* Wives toggle */}
        <button
          onClick={onToggleWives}
          title="Toggle wives visibility (W)"
          style={{
            background: showWives ? `${COLOUR.lapis}40` : 'transparent',
            border: `1px solid ${showWives ? COLOUR.lapis : COLOUR.goldDim + '60'}`,
            borderRadius: 6,
            color: showWives ? COLOUR.parchment : COLOUR.dust,
            fontSize: 11,
            padding: '5px 10px',
            cursor: 'pointer',
          }}
        >
          Wives
        </button>

        {/* Classic 2D fallback */}
        <button
          onClick={onSwitchTo2D}
          style={{
            background: 'transparent',
            border: `1px solid ${COLOUR.goldDim}40`,
            borderRadius: 6,
            color: COLOUR.dust,
            fontSize: 11,
            padding: '5px 10px',
            cursor: 'pointer',
          }}
          title="Switch to classic 2D view"
        >
          2D ↙
        </button>
      </div>
    </div>
  )
}

// ─── Generation rail ──────────────────────────────────────────────────────────

function GenerationRail({
  maxGen,
  onJump,
}: {
  maxGen: number
  onJump: (gen: number) => void
}): React.ReactElement {
  return (
    <div
      style={{
        position: 'absolute',
        top: 72,
        left: 16,
        bottom: MINIMAP_PAD + MINIMAP_H + 8,
        width: 36,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        zIndex: 20,
        pointerEvents: 'none',
      }}
      aria-label="Generation navigator"
    >
      <span
        style={{
          color: COLOUR.goldDim,
          fontSize: 8,
          fontFamily: 'monospace',
          marginBottom: 6,
          letterSpacing: 1,
        }}
      >
        G·1
      </span>
      <div
        style={{
          flex: 1,
          width: 2,
          background: `linear-gradient(to bottom, ${COLOUR.goldPrimary}80, ${COLOUR.goldDim}30)`,
          borderRadius: 1,
          position: 'relative',
          pointerEvents: 'all',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
          const ratio = (e.clientY - rect.top) / rect.height
          const gen = Math.max(1, Math.min(maxGen, Math.round(ratio * maxGen) + 1))
          onJump(gen)
        }}
        title="Click to jump to a generation"
      >
        {Array.from({ length: maxGen }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: -3,
              top: `${(i / Math.max(maxGen - 1, 1)) * 100}%`,
              width: 8,
              height: 1,
              background: COLOUR.goldDim,
            }}
          />
        ))}
      </div>
      <span
        style={{
          color: COLOUR.goldDim,
          fontSize: 8,
          fontFamily: 'monospace',
          marginTop: 6,
          letterSpacing: 1,
        }}
      >
        G·{maxGen}
      </span>
    </div>
  )
}

// ─── Reset button ─────────────────────────────────────────────────────────────

function ResetButton({ onClick }: { onClick: () => void }): React.ReactElement {
  return (
    <button
      onClick={onClick}
      title="Reset to root (R)"
      aria-label="Reset camera to root"
      style={{
        position: 'absolute',
        bottom: MINIMAP_PAD + MINIMAP_H + 12,
        right: MINIMAP_PAD + MINIMAP_W / 2 - 16,
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: `${COLOUR.parchment}10`,
        border: `1px solid ${COLOUR.goldDim}60`,
        color: COLOUR.goldDim,
        fontSize: 16,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        zIndex: 20,
      }}
    >
      ✦
    </button>
  )
}

// ─── Scene atmosphere ─────────────────────────────────────────────────────────

function SceneAtmosphere(): React.ReactElement {
  return (
    <>
      <ambientLight intensity={0.4} color="#E8C46A" />
      <pointLight position={[0, 200, 400]} intensity={1.2} color="#E8C46A" />
      <pointLight position={[0, -600, 0]} intensity={0.3} color="#2E5FA3" />
      <pointLight position={[600, -300, 0]} intensity={0.2} color="#C9943A" />
    </>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function TreeCanvas3D({
  persons,
  marriages,
  onSwitchTo2D,
}: TreeCanvas3DProps): React.ReactElement {
  const [selectedPerson, setSelectedPerson] = useState<PersonRow | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showWives, setShowWives] = useState(true)
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null)
  const [pathIds, setPathIds] = useState<Set<string>>(new Set())
  const [isLoaded, setIsLoaded] = useState(false)
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  // Compute 3D shell layout (memoised — only recomputes when data changes)
  const posMap = useMemo(() => computeShellLayout(persons, marriages), [persons, marriages])

  const personMap = useMemo(() => new Map(persons.map((p) => [p.id, p])), [persons])

  const maxGen = useMemo(() => Math.max(...persons.map((p) => p.generation ?? 1), 1), [persons])

  // Mark loaded after layout is computed
  useEffect(() => {
    if (posMap.size > 0) {
      const t = setTimeout(() => setIsLoaded(true), 200)
      return () => clearTimeout(t)
    }
  }, [posMap])

  const handleNodeClick = useCallback(
    (personId: string) => {
      const person = personMap.get(personId) ?? null
      setSelectedPerson(person)
      const pos = posMap.get(personId)
      if (pos) setFocusTarget({ pos, personId })
    },
    [personMap, posMap]
  )

  const handleFlyTo = useCallback(
    (personId: string) => {
      const pos = posMap.get(personId)
      const person = personMap.get(personId) ?? null
      setSelectedPerson(person)
      if (pos) setFocusTarget({ pos, personId })
    },
    [posMap, personMap]
  )

  const handleSearchSelect = useCallback(
    (hit: SearchHit) => {
      const person = personMap.get(hit.id) ?? null
      setSelectedPerson(person)
      setIsSearchOpen(false)
      const pos = posMap.get(hit.id)
      if (pos) setFocusTarget({ pos, personId: hit.id })
    },
    [personMap, posMap]
  )

  const handleReset = useCallback(() => {
    setFocusTarget({ pos: [0, 0, 0], personId: '' })
    setSelectedPerson(null)
    setPathIds(new Set())
  }, [])

  const jumpToGeneration = useCallback((gen: number) => {
    const y = -(gen - 1) * SHELL_GAP
    setFocusTarget({ pos: [0, y, 0], personId: '' })
  }, [])

  useKeyboard(
    handleReset,
    () => setIsSearchOpen(true),
    () => setShowWives((v) => !v)
  )

  // Persons in visible generation shells (depth cueing — always show all for now)
  const visiblePersons = useMemo(() => persons.filter((p) => posMap.has(p.id)), [persons, posMap])

  const visibleMarriages = useMemo(
    () => (showWives ? marriages.filter((m) => posMap.has(m.husband_id)) : []),
    [marriages, showWives, posMap]
  )

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: COLOUR.void,
        overflow: 'hidden',
      }}
    >
      {/* Grain texture overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '200px 200px',
          pointerEvents: 'none',
          zIndex: 1,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Radial center glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 60% 40% at 50% 40%, ${COLOUR.goldPrimary}08 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Vignette */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(5,5,8,0.6) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Loading state */}
      {!isLoaded && <LoadingState />}

      {/* Three.js canvas */}
      <Canvas
        camera={{ position: [0, CAM_Y_OFFSET, CAM_START_Z], fov: 52 }}
        gl={{ antialias: true, alpha: true }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <SceneAtmosphere />

        <CinematicCamera focusTarget={focusTarget} controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          enablePan
          enableZoom
          enableRotate
          target={[0, CAM_Y_OFFSET, 0]}
          minDistance={200}
          maxDistance={4000}
          enableDamping
          dampingFactor={0.08}
        />

        {/* Parent-child lines */}
        {visiblePersons
          .filter((p) => p.father_id && posMap.has(p.father_id))
          .map((p) => (
            <ParentChildLine3D
              key={`line-${p.id}`}
              from={posMap.get(p.father_id!)!}
              to={posMap.get(p.id)!}
              highlighted={pathIds.size > 0 && pathIds.has(p.id) && pathIds.has(p.father_id!)}
              generation={p.generation ?? 1}
            />
          ))}

        {/* Marriage arcs */}
        {visibleMarriages.map((m) => {
          const hPos = posMap.get(m.husband_id)
          const wPos = posMap.get(m.wife_id)
          if (!hPos || !wPos) return null
          const husband = personMap.get(m.husband_id)
          const wife = personMap.get(m.wife_id)
          return (
            <MarriageArc3D
              key={`arc-${m.id}`}
              from={hPos}
              to={wPos}
              crossBranch={husband?.branch !== wife?.branch}
              marriageDate={m.date_hijri}
            />
          )
        })}

        {/* Person nodes */}
        {visiblePersons.map((p) => {
          const pos = posMap.get(p.id)
          if (!pos) return null
          return (
            <PersonNode3D
              key={p.id}
              person={p}
              position={pos}
              highlighted={pathIds.has(p.id)}
              dimmed={pathIds.size > 0 && !pathIds.has(p.id)}
              onClick={() => handleNodeClick(p.id)}
            />
          )
        })}

        {/* Spouse nodes */}
        {showWives &&
          visibleMarriages.map((m) => {
            const wife = personMap.get(m.wife_id)
            const wPos = posMap.get(m.wife_id)
            // Only render wife as SpouseNode3D if she's not already a person node
            if (!wife || !wPos || persons.some((p) => p.id === m.wife_id)) return null
            return (
              <SpouseNode3D
                key={`w-${m.wife_id}`}
                person={wife}
                position={wPos}
                marriageDate={m.date_hijri}
                onClick={() => handleNodeClick(m.wife_id)}
              />
            )
          })}
      </Canvas>

      {/* HTML overlays — rendered above the canvas */}
      <TopBar
        onSearchClick={() => setIsSearchOpen(true)}
        showWives={showWives}
        onToggleWives={() => setShowWives((v) => !v)}
        onSwitchTo2D={onSwitchTo2D}
      />

      <GenerationRail maxGen={maxGen} onJump={jumpToGeneration} />

      <ResetButton onClick={handleReset} />

      <Minimap2D posMap={posMap} persons={persons} focusedId={selectedPerson?.id ?? null} />

      <NodeCount total={persons.length} />

      {/* Detail panel */}
      <DetailPanel3D
        person={selectedPerson}
        marriages={marriages}
        persons={persons}
        posMap={posMap}
        onClose={() => setSelectedPerson(null)}
        onFlyTo={handleFlyTo}
        onPathHighlight={(ids) => setPathIds(new Set(ids))}
      />

      {/* Search overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onSelect={handleSearchSelect}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  )
}
