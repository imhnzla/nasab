'use client'
// Premium 2D Tree — Client wrapper
// Manages: layout worker, branch filter, detail panel, search, export, view modes, path finder

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useReactFlow, ReactFlowProvider } from '@xyflow/react'
import dynamic from 'next/dynamic'
import '@xyflow/react/dist/style.css'

import type {
  AnyFlowNode,
  PersonRow,
  Branch,
  FamilyEdge,
  SearchHit,
  MarriageRow,
} from '@/lib/tree/types'
import type { LayoutWorkerOutput, LayoutNode } from '@/lib/workers/layout.worker'
import { TreeCanvas } from '@/components/tree/TreeCanvas'
import { BranchFilter } from '@/components/tree/BranchFilter'
import { DetailPanel } from '@/components/tree/DetailPanel'
import { SearchOverlay } from '@/components/tree/SearchOverlay'
import { ExportButton } from '@/components/tree/ExportButton'
import { PathFinder } from '@/components/tree/PathFinder'
import { AccessibleTreeView } from '@/components/tree/AccessibleTreeView'
import { BookmarkStar } from '@/components/tree/BookmarkStar'
import { COLOUR } from '@/lib/tree/constants2d'

// Dynamically import radial and 3D canvases (SSR-unsafe)
const TreeCanvasRadial = dynamic(
  () => import('@/components/tree/TreeCanvasRadial').then((m) => ({ default: m.TreeCanvasRadial })),
  {
    ssr: false,
    loading: () => <div className="h-full w-full" style={{ background: COLOUR.void }} />,
  }
)
const TreeCanvas3D = dynamic(
  () => import('@/components/tree/TreeCanvas3D').then((m) => ({ default: m.TreeCanvas3D })),
  {
    ssr: false,
    loading: () => <div className="h-full w-full" style={{ background: COLOUR.void }} />,
  }
)

type TreePageClientInnerProps = {
  persons: PersonRow[]
  marriages: MarriageRow[]
}

const ALL_BRANCHES: Branch[] = ['hasanid', 'husaynid', 'hashemite']

function layoutNodesToFlowNodes(layoutNodes: LayoutNode[]): AnyFlowNode[] {
  return layoutNodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
  })) as AnyFlowNode[]
}

// ─── Collapse helpers ──────────────────────────────────────────────────────────
function buildChildrenMap(edges: FamilyEdge[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  for (const e of edges) {
    if (!map.has(e.source)) map.set(e.source, new Set())
    map.get(e.source)!.add(e.target)
  }
  return map
}

function getHiddenIds(
  collapsedIds: Set<string>,
  childrenOf: Map<string, Set<string>>
): Set<string> {
  const hidden = new Set<string>()
  const queue = [...collapsedIds]
  while (queue.length > 0) {
    const id = queue.shift()!
    for (const childId of childrenOf.get(id) ?? []) {
      if (!hidden.has(childId)) {
        hidden.add(childId)
        queue.push(childId)
      }
    }
  }
  return hidden
}

function countDescendants(id: string, childrenOf: Map<string, Set<string>>): number {
  let count = 0
  const queue = [id]
  while (queue.length > 0) {
    const cur = queue.shift()!
    for (const child of childrenOf.get(cur) ?? []) {
      count++
      queue.push(child)
    }
  }
  return count
}

// ─── Generation Rail ──────────────────────────────────────────────────────────

function GenerationRail({
  maxGen,
  onJump,
}: {
  maxGen: number
  onJump: (gen: number) => void
}): React.ReactElement {
  const gens = Array.from({ length: maxGen }, (_, i) => i + 1)
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 36,
        background: `${COLOUR.void}CC`,
        borderRight: `1px solid ${COLOUR.dust}25`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 8,
        gap: 0,
        overflowY: 'auto',
        zIndex: 10,
        backdropFilter: 'blur(4px)',
      }}
    >
      {gens.map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => onJump(g)}
          title={`Jump to Generation ${g}`}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLOUR.dust,
            fontSize: 9,
            fontFamily: 'monospace',
            cursor: 'pointer',
            padding: '3px 0',
            width: '100%',
            textAlign: 'center',
            lineHeight: 1.4,
            letterSpacing: 0.3,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.color = COLOUR.goldLight
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.color = COLOUR.dust
          }}
        >
          {g}
        </button>
      ))}
    </div>
  )
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar({
  viewMode,
  showWives,
  showDaughters,
  onToggleWives,
  onToggleDaughters,
  onSearchClick,
  onSwitchTo3D,
  treeContainerRef,
  totalPersons,
}: {
  viewMode: string
  showWives: boolean
  showDaughters: boolean
  onToggleWives: () => void
  onToggleDaughters: () => void
  onSearchClick: () => void
  onSwitchTo3D: () => void
  treeContainerRef: React.RefObject<HTMLDivElement | null>
  totalPersons: number
}): React.ReactElement {
  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 12px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    border: `1px solid ${COLOUR.dust}40`,
    background: 'transparent',
    color: COLOUR.dust,
    letterSpacing: 0.3,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  }
  const btnActive: React.CSSProperties = {
    ...btnBase,
    border: `1px solid ${COLOUR.goldPrimary}80`,
    background: `${COLOUR.goldPrimary}18`,
    color: COLOUR.goldLight,
  }

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: 48,
        background: `${COLOUR.void}F0`,
        borderBottom: `1px solid ${COLOUR.dust}25`,
        backdropFilter: 'blur(8px)',
        zIndex: 20,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          dir="rtl"
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: COLOUR.goldPrimary,
            fontFamily: 'serif',
            letterSpacing: -0.5,
          }}
        >
          نَسَب
        </span>
        <span
          style={{
            fontSize: 11,
            color: `${COLOUR.dust}80`,
            letterSpacing: 2,
            fontFamily: 'monospace',
            marginTop: 2,
          }}
        >
          NASAB
        </span>
        <span
          style={{
            fontSize: 9,
            color: `${COLOUR.dust}50`,
            fontFamily: 'monospace',
            marginLeft: 8,
          }}
        >
          {totalPersons} souls recorded
        </span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search */}
        <button
          type="button"
          onClick={onSearchClick}
          style={btnBase}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.color = COLOUR.goldLight
            el.style.borderColor = `${COLOUR.goldPrimary}60`
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.color = COLOUR.dust
            el.style.borderColor = `${COLOUR.dust}40`
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search
          <kbd
            style={{
              fontSize: 8,
              background: `${COLOUR.dust}20`,
              padding: '1px 4px',
              borderRadius: 3,
              fontFamily: 'monospace',
              color: `${COLOUR.dust}80`,
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Wives toggle */}
        <button type="button" onClick={onToggleWives} style={showWives ? btnActive : btnBase}>
          Wives {showWives ? '●' : '○'}
        </button>

        {/* Daughters toggle */}
        <button
          type="button"
          onClick={onToggleDaughters}
          style={
            showDaughters
              ? {
                  ...btnActive,
                  border: `1px solid ${COLOUR.emerald}80`,
                  background: `${COLOUR.emerald}18`,
                  color: '#2D8A57',
                }
              : btnBase
          }
        >
          Daughters {showDaughters ? '●' : '○'}
        </button>

        {/* 3D toggle */}
        {viewMode !== '3d' && (
          <button
            type="button"
            onClick={onSwitchTo3D}
            style={{
              ...btnBase,
              border: `1px solid ${COLOUR.dust}40`,
              color: `${COLOUR.dust}90`,
            }}
          >
            ✦ 3D
          </button>
        )}

        {/* Export */}
        <ExportButton treeContainerRef={treeContainerRef} filename="nasab-tree.png" />
      </div>
    </header>
  )
}

// ─── Inner component (must be inside ReactFlowProvider) ───────────────────────

function TreePageClientInner({ persons, marriages }: TreePageClientInnerProps): React.ReactElement {
  const { setCenter } = useReactFlow()

  const [nodes, setNodes] = useState<AnyFlowNode[]>([])
  const [edges, setEdges] = useState<FamilyEdge[]>([])
  const [activeBranches, setActiveBranches] = useState<Branch[]>(ALL_BRANCHES)
  const [selectedPerson, setSelectedPerson] = useState<PersonRow | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showWives, setShowWives] = useState(true)
  const [showDaughters, setShowDaughters] = useState(true)
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'radial' | 'accessible'>('2d')
  const [pathHighlightIds, setPathHighlightIds] = useState<Set<string>>(new Set())

  // Collapse state persisted in localStorage
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set<string>()
    try {
      const saved = localStorage.getItem('nasab-collapsed')
      return saved ? new Set<string>(JSON.parse(saved) as string[]) : new Set<string>()
    } catch {
      return new Set<string>()
    }
  })

  const toggleCollapse = useCallback((personId: string): void => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      next.has(personId) ? next.delete(personId) : next.add(personId)
      try {
        localStorage.setItem('nasab-collapsed', JSON.stringify([...next]))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const treeContainerRef = useRef<HTMLDivElement>(null)
  const workerRef = useRef<Worker | null>(null)

  // Run layout worker whenever persons or branch filter changes
  useEffect(() => {
    const filtered = persons.filter(
      (p) => p.branch === null || activeBranches.includes(p.branch as Branch)
    )

    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('@/lib/workers/layout.worker.ts', import.meta.url), {
        type: 'module',
      })
    }

    const worker = workerRef.current

    const handleMessage = (e: MessageEvent<LayoutWorkerOutput>): void => {
      const { nodes: layoutNodes, edges: layoutEdges } = e.data
      setNodes(layoutNodesToFlowNodes(layoutNodes))
      setEdges(layoutEdges as FamilyEdge[])
    }

    worker.addEventListener('message', handleMessage)
    worker.postMessage({ persons: filtered, marriages })

    return () => {
      worker.removeEventListener('message', handleMessage)
    }
  }, [persons, activeBranches, marriages])

  // Terminate worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  // ⌘K opens search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleNodeClick = useCallback(
    (personId: string) => {
      // Strip "wife-" prefix for wife nodes to find the underlying person
      const bareId = personId.startsWith('wife-') ? personId.slice(5) : personId
      const person = persons.find((p) => p.id === bareId) ?? null
      setSelectedPerson(person)
    },
    [persons]
  )

  const handleFlyTo = useCallback(
    (personId: string) => {
      const node = nodes.find((n) => n.id === personId)
      if (node) setCenter(node.position.x + 80, node.position.y + 48, { zoom: 1.4, duration: 700 })
      const person = persons.find((p) => p.id === personId) ?? null
      setSelectedPerson(person)
    },
    [nodes, persons, setCenter]
  )

  const handleSearchSelect = useCallback(
    (hit: SearchHit) => {
      const person = persons.find((p) => p.id === hit.id) ?? null
      setSelectedPerson(person)
      setIsSearchOpen(false)
      const node = nodes.find((n) => n.id === hit.id)
      if (node) setCenter(node.position.x + 80, node.position.y + 48, { zoom: 1.2, duration: 600 })
    },
    [persons, nodes, setCenter]
  )

  const maxGeneration = useMemo(
    () => Math.max(...persons.map((p) => p.generation ?? 0), 0),
    [persons]
  )

  const jumpToGeneration = useCallback(
    (gen: number) => {
      const genNodes = displayNodes.filter((n) => {
        if (n.type !== 'person') return false
        return (n.data as { person: PersonRow }).person.generation === gen
      })
      if (genNodes.length === 0) return
      const avgX = genNodes.reduce((s, n) => s + n.position.x, 0) / genNodes.length
      const y = genNodes[0].position.y
      setCenter(avgX + 80, y + 48, { zoom: 0.9, duration: 600 })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, setCenter]
  )

  // Combined memo: filter + collapse + highlight
  const { displayNodes, displayEdges } = useMemo(() => {
    // 1. Filter wife nodes when showWives is off
    let filteredNodes: AnyFlowNode[] = showWives ? nodes : nodes.filter((n) => n.type === 'person')

    // 2. Filter daughters when showDaughters is off
    if (!showDaughters) {
      filteredNodes = filteredNodes.filter((n) => {
        if (n.type !== 'person') return true
        const p = (n.data as { person: PersonRow }).person
        return p.gender !== 'female' || !p.father_id
      })
    }

    let filteredEdges: FamilyEdge[] = showWives
      ? edges
      : edges.filter((e) => e.type === 'smoothstep' || e.type === 'parentChild')

    // 3. Build children map for collapse tracking
    const childrenOf = buildChildrenMap(filteredEdges)

    // 4. Inject collapse callbacks and highlight state
    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id))
    filteredNodes = filteredNodes.map((n): AnyFlowNode => {
      if (n.type !== 'person') return n
      const isCollapsed = collapsedIds.has(n.id)
      const isHighlighted = pathHighlightIds.has(n.id)
      const isDimmed = pathHighlightIds.size > 0 && !pathHighlightIds.has(n.id)
      return {
        ...n,
        data: {
          ...n.data,
          onToggleCollapse: toggleCollapse,
          collapsedCount: isCollapsed ? countDescendants(n.id, childrenOf) : undefined,
          highlighted: isHighlighted,
          dimmed: isDimmed,
        },
      }
    })

    // 5. Hide descendants of collapsed nodes
    if (collapsedIds.size > 0) {
      const hidden = getHiddenIds(collapsedIds, childrenOf)
      filteredNodes = filteredNodes.filter((n) => !hidden.has(n.id))
      filteredEdges = filteredEdges.filter((e) => !hidden.has(e.source) && !hidden.has(e.target))
    }

    // 6. Hide edges to nodes that were filtered out (daughters etc.)
    filteredEdges = filteredEdges.filter(
      (e) => filteredNodeIds.has(e.source) || filteredNodeIds.has(e.target)
    )

    return { displayNodes: filteredNodes, displayEdges: filteredEdges }
  }, [nodes, edges, showWives, showDaughters, collapsedIds, toggleCollapse, pathHighlightIds])

  // ── 3D mode: full-page ──────────────────────────────────────────────────────
  if (viewMode === '3d') {
    return (
      <div className="h-screen w-full">
        <TreeCanvas3D
          persons={persons}
          marriages={marriages}
          onSwitchTo2D={() => setViewMode('2d')}
        />
      </div>
    )
  }

  // ── Main 2D / Radial / Accessible ──────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ background: COLOUR.void }}>
      <TopBar
        viewMode={viewMode}
        showWives={showWives}
        showDaughters={showDaughters}
        onToggleWives={() => setShowWives((v) => !v)}
        onToggleDaughters={() => setShowDaughters((v) => !v)}
        onSearchClick={() => setIsSearchOpen(true)}
        onSwitchTo3D={() => setViewMode('3d')}
        treeContainerRef={treeContainerRef}
        totalPersons={persons.length}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Branch filter sidebar — dark */}
        <aside
          style={{
            width: 140,
            flexShrink: 0,
            background: `${COLOUR.void}F0`,
            borderRight: `1px solid ${COLOUR.dust}25`,
            padding: '12px 10px',
            overflowY: 'auto',
            backdropFilter: 'blur(4px)',
          }}
        >
          <p
            style={{
              marginBottom: 8,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 2,
              color: `${COLOUR.dust}60`,
              textTransform: 'uppercase',
              fontFamily: 'monospace',
            }}
          >
            Branches
          </p>
          <BranchFilter
            activeBranches={activeBranches}
            onChange={setActiveBranches}
            showWives={showWives}
            onShowWivesChange={setShowWives}
          />

          <div style={{ marginTop: 16, borderTop: `1px solid ${COLOUR.dust}20`, paddingTop: 12 }}>
            <PathFinder
              onHighlight={(ids) => setPathHighlightIds(new Set(ids))}
              onClear={() => setPathHighlightIds(new Set())}
            />
          </div>

          <div style={{ marginTop: 12, borderTop: `1px solid ${COLOUR.dust}20`, paddingTop: 12 }}>
            <p
              style={{
                marginBottom: 6,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 2,
                color: `${COLOUR.dust}60`,
                textTransform: 'uppercase',
                fontFamily: 'monospace',
              }}
            >
              View
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {(['2d', 'radial', 'accessible'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  style={{
                    background: viewMode === mode ? `${COLOUR.goldPrimary}20` : 'transparent',
                    border: `1px solid ${viewMode === mode ? COLOUR.goldPrimary : COLOUR.dust + '30'}`,
                    color: viewMode === mode ? COLOUR.goldLight : COLOUR.dust,
                    borderRadius: 5,
                    fontSize: 10,
                    padding: '4px 8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    letterSpacing: 0.3,
                    fontWeight: viewMode === mode ? 700 : 400,
                  }}
                >
                  {mode === '2d' ? '2D Tree' : mode === 'radial' ? 'Radial' : 'Accessible'}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Tree canvas */}
        <main
          className="relative flex-1 overflow-hidden"
          ref={treeContainerRef}
          style={{ background: COLOUR.void }}
        >
          {viewMode === '2d' && (
            <>
              <GenerationRail maxGen={maxGeneration} onJump={jumpToGeneration} />
              <div style={{ position: 'absolute', inset: 0, left: 36 }}>
                <TreeCanvas
                  nodes={displayNodes}
                  edges={displayEdges}
                  onNodeClick={handleNodeClick}
                />
              </div>
            </>
          )}
          {viewMode === 'radial' && (
            <TreeCanvasRadial persons={persons} onNodeClick={handleNodeClick} />
          )}
          {viewMode === 'accessible' && (
            <AccessibleTreeView persons={persons} onSelect={handleNodeClick} />
          )}
        </main>
      </div>

      {/* Detail panel */}
      <DetailPanel
        person={selectedPerson}
        marriages={marriages}
        persons={persons}
        onClose={() => setSelectedPerson(null)}
        onFlyTo={handleFlyTo}
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

export function TreePageClient({
  persons,
  marriages,
}: TreePageClientInnerProps): React.ReactElement {
  return (
    <ReactFlowProvider>
      <TreePageClientInner persons={persons} marriages={marriages} />
    </ReactFlowProvider>
  )
}
